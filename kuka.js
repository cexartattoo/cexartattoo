
    'use strict';

    // ── Canvas setup ──────────────────────────────
    const cv = document.getElementById('cv');
    const cvO = document.getElementById('cv-overlay');
    const ctx = cv.getContext('2d');
    const ctxO = cvO.getContext('2d');
    let W, H;

    function resize() {
      W = cv.width = cvO.width = innerWidth;
      H = cv.height = cvO.height = innerHeight;
      if (arm) arm.waypoints = []; // rebuild on resize
    }
    window.addEventListener('resize', resize);

    const mouse = { x: -2000, y: -2000 };
    const pointer = { down: false };

    document.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
    document.addEventListener('mousedown', e => { pointer.down = true; });
    document.addEventListener('mouseup', e => { pointer.down = false; });

    document.addEventListener('touchmove', e => {
      const t = e.touches[0];
      mouse.x = t.clientX; mouse.y = t.clientY;
      e.preventDefault();
    }, { passive: false });
    document.addEventListener('touchstart', e => {
      const t = e.touches[0];
      mouse.x = t.clientX; mouse.y = t.clientY;
      pointer.down = true;
      e.preventDefault();
    }, { passive: false });
    document.addEventListener('touchend', e => { pointer.down = false; });

    // ── Utilities ─────────────────────────────────
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const lerp = (a, b, t) => a + (b - a) * t;
    function rrect(c, x, y, w, h, r) {
      c.beginPath();
      c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
      c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
    }
    const ORANGE = '#f56300';

    // ── Letter path definitions removed — now using canvas pixel extraction ──

    const isMobile = () => W < 620 || (W < 900 && H > W);

    // ── Font-pixel path builder ─────────────────────
    // Renders real Orbitron glyphs to an offscreen canvas, extracts the
    // edge pixels of the ink, then orders them with a grid-accelerated
    // greedy nearest-neighbour walk — giving the robot a continuous
    // outline to trace regardless of screen size.
    function buildWaypoints() {
      const mob = isMobile();

      // ── Use exact DOM position of the hero-name element ──────
      // This guarantees the robot traces exactly over the visible text,
      // regardless of flex layout, viewport size or robot position.
      const nameEl = document.querySelector('.hero-name');
      const spanEl = nameEl && nameEl.querySelector('.accent');
      const domRect = nameEl ? nameEl.getBoundingClientRect() : null;

      let zX, zY, zW, zH;
      if (domRect && domRect.width > 40 && domRect.height > 20) {
        // Use actual DOM bounding box with small padding
        zX = domRect.left - 4;
        zY = domRect.top - 4;
        zW = domRect.width + 8;
        zH = domRect.height + 8;
      } else {
        // Fallback for first frame before layout is ready
        zW = mob ? W * 0.82 : W * 0.42;
        zH = mob ? H * 0.22 : H * 0.20;
        zX = mob ? W * 0.09 : W * 0.03;
        zY = mob ? H * 0.50 : H * 0.30;
      }

      // Offscreen at 3× for crisp edge detection
      const SC = 3;
      const ocW = Math.max(4, Math.round(zW * SC));
      const ocH = Math.max(4, Math.round(zH * SC));
      const oc = document.createElement('canvas');
      oc.width = ocW; oc.height = ocH;
      const ox = oc.getContext('2d');

      // ── Use exact font styles from DOM to guarantee a 1:1 pixel match ──
      const style1 = window.getComputedStyle(nameEl);
      const style2 = spanEl ? window.getComputedStyle(spanEl) : style1;

      // Ensure the font scales with the offscreen canvas (SC multiplier)
      const fs1 = parseFloat(style1.fontSize) * SC;
      const fs2 = parseFloat(style2.fontSize) * SC;
      const font1 = `${style1.fontWeight} ${fs1}px ${style1.fontFamily}`;
      const font2 = `${style2.fontWeight} ${fs2}px ${style2.fontFamily}`;

      // To get a perfect 1:1 text match without invisible CSS line-height padding shifting it:
      // We read the actual unpadded height of the text element.
      // And we use alphabetic baseline to anchor the font to its natural bottom rim.
      const cssLh = parseFloat(style1.lineHeight) || (domRect ? domRect.height : H * 0.15);

      ox.fillStyle = '#fff';
      ox.textBaseline = 'alphabetic';
      ox.textAlign = 'left';

      // 'Orbitron' hanging baseline offset estimation (approx 85% of font size is above baseline)
      const base1 = fs1 * 0.85;
      const base2 = cssLh * SC + fs2 * 0.85;

      // Draw "CÉSAR"
      ox.font = font1;
      ox.fillText('CÉSAR', 0, base1);

      // (User request: omit RAMÍREZ)
      // ox.font = font2;
      // ox.fillText('RAMÍREZ', 0, base2);

      // ── Edge-pixel extraction ──
      const img = ox.getImageData(0, 0, ocW, ocH).data;
      const ink = (x, y) => {
        if (x < 0 || x >= ocW || y < 0 || y >= ocH) return false;
        return img[(y * ocW + x) * 4 + 3] > 60;
      };

      const SAMP = 4;
      const pts1 = [], pts2 = [];
      const splitPx = Math.round(cssLh * SC); // Points below this go to second line

      for (let y = SAMP; y < ocH - SAMP; y += SAMP) {
        for (let x = SAMP; x < ocW - SAMP; x += SAMP) {
          if (!ink(x, y)) continue;
          if (!ink(x - SAMP, y) || !ink(x + SAMP, y) || !ink(x, y - SAMP) || !ink(x, y + SAMP)) {
            (y < splitPx ? pts1 : pts2).push([x, y]);
          }
        }
      }

      if (!pts1.length && !pts2.length) {
        return [{ x: zX + zW / 2, y: zY + zH / 2, penDown: false }];
      }

      // ── Greedy nearest-neighbour per line ──
      // PEN_SQ: max squared distance still considered same stroke (no jump line)
      const PEN_SQ = (SAMP * 3.5) ** 2;

      function greedyOrder(pts) {
        if (!pts.length) return [];
        const CELL = 16, cols = Math.ceil(ocW / CELL);
        const grid = new Map();
        pts.forEach((p, i) => {
          const k = Math.floor(p[0] / CELL) + Math.floor(p[1] / CELL) * cols;
          if (!grid.has(k)) grid.set(k, []);
          grid.get(k).push(i);
        });
        const vis = new Uint8Array(pts.length);
        const out = [];
        let ci = 0, minS = Infinity;
        pts.forEach((p, i) => { const s = p[0] + p[1] * 0.3; if (s < minS) { minS = s; ci = i; } });
        vis[ci] = 1; out.push({ p: pts[ci], penDown: false });

        for (let iter = 1; iter < pts.length; iter++) {
          const cp = pts[ci];
          const cx = Math.floor(cp[0] / CELL), cy2 = Math.floor(cp[1] / CELL);
          let bestD = Infinity, bestI = -1;
          for (let R = 1; R <= 6 && bestI === -1; R++) {
            for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) {
              const cell = grid.get((cx + dx) + (cy2 + dy) * cols);
              if (!cell) continue;
              for (const i of cell) {
                if (vis[i]) continue;
                const d = (pts[i][0] - cp[0]) ** 2 + (pts[i][1] - cp[1]) ** 2;
                if (d < bestD) { bestD = d; bestI = i; }
              }
            }
          }
          if (bestI === -1) {
            for (let i = 0; i < pts.length; i++) {
              if (vis[i]) continue;
              const d = (pts[i][0] - cp[0]) ** 2 + (pts[i][1] - cp[1]) ** 2;
              if (d < bestD) { bestD = d; bestI = i; }
            }
          }
          if (bestI === -1) break;
          vis[bestI] = 1;
          out.push({ p: pts[bestI], penDown: bestD < PEN_SQ });
          ci = bestI;
        }
        return out;
      }

      const ord1 = greedyOrder(pts1);
      const ord2 = greedyOrder(pts2);
      // Always lift pen at start of each line
      if (ord1.length) ord1[0].penDown = false;
      if (ord2.length) ord2[0].penDown = false;
      const ordered = [...ord1, ...ord2];

      // ── Map offscreen px → screen coords aligned to DOM rect ──
      const raw = ordered.map(o => ({
        x: zX + o.p[0] / SC,
        y: zY + o.p[1] / SC,
        penDown: o.penDown
      }));

      // SEG=1: sin interpolacion extra, trazos angulares y precisos (como un robot real)
      const SEG = 1;
      const smooth = [];
      for (let i = 0; i < raw.length; i++) {
        const p0 = raw[Math.max(0, i - 1)];
        const p1 = raw[i];
        const p2 = raw[Math.min(raw.length - 1, i + 1)];
        const p3 = raw[Math.min(raw.length - 1, i + 2)];
        smooth.push(p1);
        // Only interpolate when BOTH consecutive points are pen-down
        // This prevents smoothing across letter-jump gaps
        if (!p1.penDown || !p2.penDown) continue;
        for (let t = 1; t < SEG; t++) {
          const s = t / SEG, s2 = s * s, s3 = s2 * s;
          smooth.push({
            x: 0.5 * ((2 * p1.x) + (-p0.x + p2.x) * s + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * s2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * s3),
            y: 0.5 * ((2 * p1.y) + (-p0.y + p2.y) * s + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * s2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * s3),
            penDown: true
          });
        }
      }
      return smooth;
    }

    // ── Spark particles ────────────────────────────
    class Spark {
      constructor(x, y) {
        this.x = x; this.y = y;
        const a = Math.random() * Math.PI * 2;
        const s = 1 + Math.random() * 4.5;
        this.vx = Math.cos(a) * s;
        this.vy = Math.sin(a) * s - 1.5;
        this.life = 1;
        this.dec = 0.025 + Math.random() * 0.045;
        this.sz = 1.2 + Math.random() * 2;
        this.hue = 28 + Math.random() * 38;
      }
      update() {
        this.x += this.vx; this.y += this.vy;
        this.vy += 0.18; this.vx *= 0.96;
        this.life -= this.dec;
      }
      draw(c) {
        c.save();
        c.globalAlpha = Math.max(0, this.life);
        c.fillStyle = `hsl(${this.hue},100%,${55 + this.life * 30}%)`;
        c.shadowColor = `hsl(${this.hue},100%,70%)`;
        c.shadowBlur = 5;
        c.beginPath();
        c.arc(this.x, this.y, this.sz * this.life, 0, Math.PI * 2);
        c.fill();
        c.restore();
      }
    }
    const sparks = [];
    function emit(x, y, n = 3) {
      for (let i = 0; i < n; i++) sparks.push(new Spark(x, y));
    }

    // ── Trails ─────────────────────────────────────
    const trail = [];      // {x,y} — permanent, written by robot, used as weld reference
    const userTrail = [];      // {x,y,alpha} — drawn by user in FOLLOWING mode, fades out
    const MAX_TRAIL = 2000;
    const FADE_RATE = 0.008;  // alpha decay per frame

    function tickUserTrail() {
      for (let i = userTrail.length - 1; i >= 0; i--) {
        userTrail[i].alpha -= FADE_RATE;
        if (userTrail[i].alpha <= 0) userTrail.splice(i, 1);
      }
    }

    function drawTrail(c) {
      if (trail.length < 2) return;
      c.save();
      c.lineJoin = 'round'; c.lineCap = 'round';

      // Helper para trazar respetando los "saltos" (pen-up / break lines)
      const unrolledTrace = () => {
        for (let i = 0; i < trail.length; i++) {
          const p = trail[i];
          if (i === 0 || p.break) c.moveTo(p.x, p.y);
          else c.lineTo(p.x, p.y);
        }
      };

      // ── Layer 1: wide outer bloom ──
      c.lineWidth = 26;
      c.strokeStyle = 'rgba(255,120,30,0.04)';
      c.shadowBlur = 0;
      c.beginPath(); unrolledTrace(); c.stroke();

      // ── Layer 2: mid glow ──
      c.lineWidth = 14;
      c.strokeStyle = 'rgba(255,150,50,0.09)';
      c.shadowColor = 'rgba(255,110,20,0.3)';
      c.shadowBlur = 12;
      c.beginPath(); unrolledTrace(); c.stroke();

      // ── Layer 3: inner glow (más grueso) ──
      c.lineWidth = 6;
      c.strokeStyle = 'rgba(255,170,60,0.35)';
      c.shadowColor = 'rgba(255,130,20,0.6)';
      c.shadowBlur = 8;
      c.beginPath(); unrolledTrace(); c.stroke();

      // ── Layer 4: crisp hot core (más grueso) ──
      c.lineWidth = 2.5;
      c.strokeStyle = 'rgba(255,200,100,0.85)';
      c.shadowColor = 'rgba(255,160,40,0.95)';
      c.shadowBlur = 4;
      c.beginPath(); unrolledTrace(); c.stroke();

      c.restore();

      // ── Fading user trail ──
      if (userTrail.length >= 2) {
        c.save();
        c.lineJoin = 'round'; c.lineCap = 'round';
        for (let i = 1; i < userTrail.length; i++) {
          const p0 = userTrail[i - 1], p1 = userTrail[i];
          const a = Math.min(p0.alpha, p1.alpha);
          if (a <= 0) continue;
          c.lineWidth = 6; c.strokeStyle = `rgba(180,220,255,${a * 0.08})`;
          c.beginPath(); c.moveTo(p0.x, p0.y); c.lineTo(p1.x, p1.y); c.stroke();
          c.lineWidth = 1.6;
          c.strokeStyle = `rgba(140,200,255,${a * 0.75})`;
          c.shadowColor = `rgba(80,160,255,${a * 0.5})`; c.shadowBlur = 5;
          c.beginPath(); c.moveTo(p0.x, p0.y); c.lineTo(p1.x, p1.y); c.stroke();
        }
        c.restore();
      }
    }

    // ── KUKA constants ─────────────────────────────
    const SVG_SH = { x: 308, y: 247 };   // shoulder SVG coords
    const SVG_BASE_Y = 562;
    const SVG_L1 = Math.hypot(308 - 119, 247 - 93);   // ≈244.4
    const SVG_L2 = 284;

    const svgCont = document.getElementById('robot-svg-container');
    const kukaSvg = document.getElementById('kuka-svg');
    const esl1 = document.getElementById('eslabon1');
    const esl2 = document.getElementById('eslabon2');

    // ── State enum ────────────────────────────────
    const ST = { WRITING: 0, WELDING: 1, FOLLOWING: 2, GCODE: 3 };
    const badge = document.getElementById('badge');
    const hint = document.getElementById('hint');
    const BADGE_LABELS = {
      [ST.WRITING]: '✏  ESCRIBIENDO…',
      [ST.WELDING]: '⚡  SOLDANDO',
      [ST.FOLLOWING]: '◎  TRACKING',
      [ST.GCODE]: '⚙  G-CODE EXEC'
    };

    // ── KukaKinematic class ────────────────────────
    class KukaKinematic {
      constructor() {
        this.by = 0; this.bx = 0;
        this.th1 = -Math.PI / 2; this.th2 = 0;
        this.svgScale = 1;
        this.linkLen = 36; this.chainN = 20;

        this.state = ST.WRITING;
        this.waypoints = [];
        this.wpIdx = 0;

        this.weldT = 0;
        this.idleTmr = 0;
        this.eeX = 0;
        this.eeY = 0;
        this.weldFlicker = 0;
        this.maskAlpha = 0;
        this.gcodeFlicker = 0;
        this.writeFlicker = 0;   // flicker during WRITING state
        this.userArcActive = false; // true when user is drawing in FOLLOWING mode

        // Welding behavior state machine
        this.weldMode = 'BEAD';   // BEAD | SPOT | STITCH | WEAVE | CIRCULAR
        this.weldModeTimer = 0;
        this.weldModeDur = 180;      // frames before picking next mode
        this.spotPhase = 0;        // for SPOT: 0=moving, 1=firing, 2=cooling
        this.spotTimer = 0;
        this.spotTarget = { x: 0, y: 0 };
        this.stitchOn = true;
        this.stitchTimer = 0;

        // G-code state
        this.gcWaypoints = [];
        this.gcIdx = 0;
        this.gcPos = { x: 0, y: 0 };   // current machine pos (mm)
        this._stuckFrames = 0;
      }

      // Rebuild layout
      layout() {
        // Mobile: robot base lower, stays in bottom portion
        // Desktop: base at 82% height
        this.by = isMobile() ? H * 0.88 : H * 0.82;
        this.svgScale = this.by / (SVG_BASE_Y - (-400));
        // Chain length
        const railW = W * 0.9;
        const maxCarX = W * 0.05 + railW + 80;
        const anchorX = W * 0.05 + 210;
        const radius = 50;
        this.chainN = Math.ceil((Math.abs(maxCarX - anchorX) + Math.PI * radius) / this.linkLen);
        // Init waypoints first time or after resize
        if (!this.waypoints.length) {
          // Start robot centered on mobile, right-side on desktop
          this.bx = isMobile() ? W * 0.40 : W * 0.55;
          this.waypoints = buildWaypoints();
          this.wpIdx = 0;
          trail.length = 0;
          this.state = ST.WRITING;
          badge.textContent = BADGE_LABELS[ST.WRITING];
          hint.style.opacity = '0';
        }
      }

      shoulder() {
        const offX = (SVG_SH.x - 178) * this.svgScale;
        return {
          x: this.bx - offX,   // mirrored: shoulder is LEFT of base cart
          y: this.by - (SVG_BASE_Y - SVG_SH.y) * this.svgScale
        };
      }

      endEffector() {
        const sh = this.shoulder();
        const L1 = SVG_L1 * this.svgScale;
        const L2 = SVG_L2 * this.svgScale;
        // Robot is mirrored: negate X components so arm extends LEFT
        const ex = sh.x - Math.cos(this.th1) * L1;
        const ey = sh.y + Math.sin(this.th1) * L1;
        return {
          x: ex - Math.cos(this.th1 + this.th2) * L2,
          y: ey + Math.sin(this.th1 + this.th2) * L2
        };
      }

      mouseNear() {
        if (isMobile()) return mouse.x > -1000;
        const sh = this.shoulder();
        return Math.hypot(mouse.x - sh.x, mouse.y - sh.y) < 320
          && mouse.x < W * 0.62;   // left half reachable (robot points left)
      }

      ikTo(tx, ty, bxOverride = null, speed = 0.07) {
        this.layout();
        const offX = (SVG_SH.x - 178) * this.svgScale;
        const bxMin = isMobile() ? W * 0.15 : W * 0.25;
        const bxMax = isMobile() ? W * 0.95 : W * 0.95;
        // bx tracks target but shoulder is LEFT of bx, so bx = tx + offX
        const iBx = bxOverride !== null ? bxOverride
          : clamp(tx + offX, bxMin, bxMax);
        this.bx += (iBx - this.bx) * 0.15;

        const sh = this.shoulder();
        const dx = sh.x - tx;  // MIRRORED: positive dx when target is to the left
        const dy = ty - sh.y;
        const d = Math.hypot(dx, dy);
        const L1 = SVG_L1 * this.svgScale;
        const L2 = SVG_L2 * this.svgScale;
        const r = clamp(d, Math.abs(L1 - L2) + 2, L1 + L2 - 2);
        const c2 = (r * r - L1 * L1 - L2 * L2) / (2 * L1 * L2);
        const th2t = Math.acos(clamp(c2, -1, 1));
        const k1 = L1 + L2 * Math.cos(th2t), k2 = L2 * Math.sin(th2t);
        const sx = d > 0 ? dx / d * r : 0, sy = d > 0 ? dy / d * r : -r;
        let th1t = Math.atan2(sy, sx) - Math.atan2(k2, k1);
        th1t = clamp(th1t, -160 * Math.PI / 180, 10 * Math.PI / 180);
        const th2c = clamp(th2t, 0, Math.PI);
        this.th1 += (th1t - this.th1) * speed;
        this.th2 += (th2c - this.th2) * speed;
      }

      // ── State machine ──
      stateMachine() {
        if (this.state === ST.GCODE) return;  // G-code overrides everything
        const near = this.mouseNear();
        if (this.state === ST.WRITING) {
          // handled in updateWriting
        } else if (this.state === ST.WELDING) {
          if (near) {
            this.state = ST.FOLLOWING;
            badge.textContent = BADGE_LABELS[ST.FOLLOWING];
            hint.style.opacity = '0';
          }
        } else { // FOLLOWING
          if (!near) {
            this.idleTmr++;
            if (this.idleTmr > 100) {
              this.state = ST.WELDING;
              this.weldT = 0; this.idleTmr = 0;
              badge.textContent = BADGE_LABELS[ST.WELDING];
            }
          } else {
            this.idleTmr = 0;
          }
        }
      }

      // ── G-code execution ──
      startGcode(waypoints) {
        this.gcWaypoints = waypoints;
        this.gcIdx = 0;
        this.state = ST.GCODE;
        this._stuckFrames = 0;
        badge.textContent = BADGE_LABELS[ST.GCODE];
      }

      stopGcode() {
        this.state = ST.WELDING; this.weldT = 0;
        badge.textContent = BADGE_LABELS[ST.WELDING];
        document.getElementById('gcode-status').textContent = '// detenido';
      }

      updateGcode() {
        const t = Date.now();
        this.gcodeFlicker = clamp(
          Math.abs(Math.sin(t * 0.028)) * 0.35 +
          Math.abs(Math.sin(t * 0.077)) * 0.30 +
          (Math.random() < 0.05 ? Math.random() * 0.5 : 0),
          0, 1
        );
        this.weldFlicker = this.gcodeFlicker;
        if (this.gcIdx >= this.gcWaypoints.length) {
          this.state = ST.WELDING; this.weldT = 0;
          badge.textContent = BADGE_LABELS[ST.WELDING];
          document.getElementById('gcode-status').textContent = '// programa terminado ✓';
          return;
        }
        const wp = this.gcWaypoints[this.gcIdx];
        const offX = (SVG_SH.x - 178) * this.svgScale;
        const iBx = clamp(wp.x - offX, W * 0.12, W * 0.88);
        this.ikTo(wp.x, wp.y, iBx, wp.rapid ? 0.15 : 0.10);
        const ee = this.endEffector();
        const dist = Math.hypot(ee.x - wp.x, ee.y - wp.y);

        if (wp.penDown && dist < 50) {
          const last = trail[trail.length - 1];
          if (!last || Math.hypot(ee.x - last.x, ee.y - last.y) > 1.5) {
            trail.push({ x: ee.x, y: ee.y });
            if (trail.length > MAX_TRAIL) trail.shift();
          }
          if (wp.arc) emit(ee.x, ee.y, 1);
        }

        if (!this._stuckFrames) this._stuckFrames = 0;
        if (dist < 28) {
          this.gcIdx++; this._stuckFrames = 0;
          const pct = Math.round(this.gcIdx / this.gcWaypoints.length * 100);
          document.getElementById('gcode-status').textContent =
            `// bloque ${this.gcIdx}/${this.gcWaypoints.length} · ${pct}%`;
        } else {
          this._stuckFrames++;
          if (this._stuckFrames > 90) { this.gcIdx++; this._stuckFrames = 0; }
        }
      }

      // ── Writing ──
      updateWriting() {
        // Arc flicker during writing — only when pen is down
        const wp = this.waypoints[this.wpIdx];
        const penIsDown = wp && wp.penDown;

        if (penIsDown) {
          const t = Date.now();
          this.writeFlicker = clamp(
            Math.abs(Math.sin(t * 0.028)) * 0.30 +
            Math.abs(Math.sin(t * 0.079)) * 0.22 +
            Math.abs(Math.sin(t * 0.17)) * 0.12 +
            (Math.random() < 0.05 ? Math.random() * 0.40 : 0),
            0, 1
          );
        } else {
          this.writeFlicker = 0; // no arc during pen-up jumps
        }
        this.weldFlicker = this.writeFlicker;

        if (this.wpIdx >= this.waypoints.length) {
          this.state = ST.WELDING; this.weldT = 0;
          badge.textContent = BADGE_LABELS[ST.WELDING];
          setTimeout(() => { hint.style.opacity = '1'; }, 800);
          return;
        }
        // wp already declared above — reuse it (points to current waypoint)
        const offX = (SVG_SH.x - 178) * this.svgScale;
        const bxMin = isMobile() ? W * 0.15 : W * 0.25;
        const bxMax = isMobile() ? W * 0.95 : W * 0.95;
        const iBx = clamp(wp.x + offX, bxMin, bxMax);  // mirrored: + offX
        // X10 Faster bx: track targets aggressively and immediately
        this.bx += (iBx - this.bx) * 0.95;
        // Instant IK tracking
        this.ikTo(wp.x, wp.y, this.bx, 0.95);

        const ee = this.endEffector();
        const dist = Math.hypot(ee.x - wp.x, ee.y - wp.y);

        // Draw trail ONLY when pen is down AND arc is firing (writeFlicker > 0)
        if (wp.penDown && this.writeFlicker > 0.05 && dist < 120) {
          const last = trail[trail.length - 1];
          // Looser distance check for drawing smooth fast lines
          const distToLast = last ? Math.hypot(ee.x - last.x, ee.y - last.y) : Infinity;
          if (distToLast > 3.0) {
            // Si el salto es mayor a 25px, lo marcamos como break para que la línea no se cruce
            trail.push({ x: ee.x, y: ee.y, break: distToLast > 25 });
            if (trail.length > MAX_TRAIL) trail.shift();
          }
          if (Math.random() < 0.25) emit(ee.x, ee.y, 2); // More sparks since flying 10x faster
        }

        // Advance waypoint VERY loosely to fly through curves at x10 speed
        if (!this._stuckFrames) this._stuckFrames = 0;
        if (dist < 80) { // Enormous radius for x10 speed
          this.wpIdx += 5; // Avanza 5 puntos de golpe
          this._stuckFrames = 0;
        } else {
          this._stuckFrames++;
          if (this._stuckFrames > 2) {   // Atascado casi inmediatamente (por ir x10 vel)
            this.wpIdx += 12; // Jump ahead brutally
            this._stuckFrames = 0;
          }
        }
      }

      // ── Welding choreography — works ON the written trail ──
      pickWeldMode() {
        if (!trail.length) return;

        const modes = ['BEAD', 'BEAD', 'SPOT', 'STITCH', 'WEAVE', 'CIRCULAR'];
        this.weldMode = modes[Math.floor(Math.random() * modes.length)];
        this.weldModeDur = 120 + Math.floor(Math.random() * 200);
        this.weldModeTimer = 0;
        this.spotPhase = 0; this.spotTimer = 0;
        this.stitchOn = true; this.stitchTimer = 0;

        // Pick a random contiguous segment of the trail to work on
        const minSeg = Math.max(8, Math.floor(trail.length * 0.04));
        const maxSeg = Math.max(20, Math.floor(trail.length * 0.35));
        const segLen = minSeg + Math.floor(Math.random() * (maxSeg - minSeg));
        const maxStart = Math.max(0, trail.length - segLen);
        this.segStart = Math.floor(Math.random() * maxStart);
        this.segEnd = Math.min(trail.length - 1, this.segStart + segLen);
        this.segIdx = this.segStart;   // current position along segment
        this.segDir = Math.random() < 0.5 ? 1 : -1;  // forward or backward
        if (this.segDir === -1) this.segIdx = this.segEnd;

        badge.textContent = `⚡  ${this.weldMode}`;
      }

      // Get current target point on trail (clamped to segment)
      trailPoint(idx) {
        const i = clamp(idx, this.segStart, this.segEnd);
        return trail[i];
      }

      updateWelding() {
        this.weldT += 0.016;

        // First call — init
        if (this.weldModeTimer === 0 && trail.length) this.pickWeldMode();
        this.weldModeTimer++;
        if (this.weldModeTimer >= this.weldModeDur) this.pickWeldMode();

        // If trail is empty, fallback idle
        if (!trail.length || this.segStart === undefined) {
          this.weldFlicker = 0;
          return;
        }

        // Multi-frequency arc flicker
        const t = Date.now();
        const baseFlicker =
          Math.abs(Math.sin(t * 0.031)) * 0.32 +
          Math.abs(Math.sin(t * 0.083)) * 0.24 +
          Math.abs(Math.sin(t * 0.19)) * 0.14 +
          (Math.random() < 0.06 ? Math.random() * 0.45 : 0);

        let wx, wy;
        let sparkRate = 0.28;
        let arcActive = true;
        const tp = this.trailPoint(this.segIdx);

        // ─── BEAD: follow segment smoothly fwd/bwd ───
        if (this.weldMode === 'BEAD') {
          wx = tp.x; wy = tp.y;
          const ee = this.endEffector();
          if (Math.hypot(ee.x - wx, ee.y - wy) < 28) {
            this.segIdx += this.segDir;
            // Bounce at ends
            if (this.segIdx > this.segEnd) { this.segIdx = this.segEnd; this.segDir = -1; }
            if (this.segIdx < this.segStart) { this.segIdx = this.segStart; this.segDir = 1; }
          }
          sparkRate = 0.22;

          // ─── SPOT: jump to random trail points, fire burst ───
        } else if (this.weldMode === 'SPOT') {
          if (this.spotPhase === 0) {
            if (this.spotTimer === 0) {
              // pick a random point within the segment
              const ri = this.segStart + Math.floor(Math.random() * (this.segEnd - this.segStart + 1));
              this.spotTarget = { ...trail[ri] };
            }
            wx = this.spotTarget.x; wy = this.spotTarget.y;
            this.spotTimer++;
            const ee = this.endEffector();
            if (Math.hypot(ee.x - wx, ee.y - wy) < 30) { this.spotPhase = 1; this.spotTimer = 0; }
            arcActive = false; sparkRate = 0;
          } else if (this.spotPhase === 1) {
            wx = this.spotTarget.x; wy = this.spotTarget.y;
            this.spotTimer++;
            sparkRate = 0.72;
            if (this.spotTimer > 32 + Math.floor(Math.random() * 28)) { this.spotPhase = 2; this.spotTimer = 0; }
          } else {
            wx = this.spotTarget.x; wy = this.spotTarget.y;
            this.spotTimer++;
            arcActive = false; sparkRate = 0;
            if (this.spotTimer > 18) { this.spotPhase = 0; this.spotTimer = 0; }
          }

          // ─── STITCH: run segment in bursts with pauses ───
        } else if (this.weldMode === 'STITCH') {
          this.stitchTimer++;
          const period = 55;
          if (this.stitchTimer % period < period * 0.55) {
            wx = tp.x; wy = tp.y;
            const ee = this.endEffector();
            if (Math.hypot(ee.x - wx, ee.y - wy) < 28) {
              this.segIdx += this.segDir;
              if (this.segIdx > this.segEnd) { this.segIdx = this.segEnd; this.segDir = -1; }
              if (this.segIdx < this.segStart) { this.segIdx = this.segStart; this.segDir = 1; }
            }
            sparkRate = 0.38;
          } else {
            wx = this.eeX || tp.x; wy = this.eeY || tp.y; // hold
            arcActive = false; sparkRate = 0;
          }

          // ─── WEAVE: follow trail but oscillate perpendicular ───
        } else if (this.weldMode === 'WEAVE') {
          // Get tangent direction from adjacent trail points
          const prev = this.trailPoint(Math.max(this.segStart, this.segIdx - 1));
          const next = this.trailPoint(Math.min(this.segEnd, this.segIdx + 1));
          const tdx = next.x - prev.x, tdy = next.y - prev.y;
          const tLen = Math.hypot(tdx, tdy) || 1;
          // Perpendicular = (-tdy, tdx)
          const amp = 14 + Math.sin(this.weldT * 0.4) * 6;
          const wave = Math.sin(this.weldT * 3.5) * amp;
          wx = tp.x + (-tdy / tLen) * wave;
          wy = tp.y + (tdx / tLen) * wave;
          const ee = this.endEffector();
          if (Math.hypot(ee.x - tp.x, ee.y - tp.y) < 32) {
            this.segIdx += this.segDir;
            if (this.segIdx > this.segEnd) { this.segIdx = this.segEnd; this.segDir = -1; }
            if (this.segIdx < this.segStart) { this.segIdx = this.segStart; this.segDir = 1; }
          }
          sparkRate = 0.32;

          // ─── CIRCULAR: small circles centered on trail points ───
        } else if (this.weldMode === 'CIRCULAR') {
          const r = 10 + Math.sin(this.weldT * 0.3) * 6;
          wx = tp.x + Math.cos(this.weldT * 2.8) * r;
          wy = tp.y + Math.sin(this.weldT * 2.8) * r;
          // Advance along trail slowly
          if (Math.floor(this.weldT * 5) % 8 === 0) {
            this.segIdx += this.segDir;
            if (this.segIdx > this.segEnd) { this.segIdx = this.segEnd; this.segDir = -1; }
            if (this.segIdx < this.segStart) { this.segIdx = this.segStart; this.segDir = 1; }
          }
          sparkRate = 0.48;
        }

        this.weldFlicker = arcActive ? clamp(baseFlicker, 0, 1) : 0;

        const offX = (SVG_SH.x - 178) * this.svgScale;
        this.ikTo(wx, wy, clamp(wx - offX, W * 0.12, W * 0.88), 0.08);

        const ee = this.endEffector();
        if (arcActive && Math.random() < sparkRate) {
          emit(ee.x, ee.y, 1 + Math.floor(Math.random() * (this.weldMode === 'SPOT' ? 5 : 3)));
        }
      }

      update() {
        this.layout();
        this.stateMachine();
        if (this.state === ST.WRITING) this.updateWriting();
        else if (this.state === ST.WELDING) this.updateWelding();
        else if (this.state === ST.GCODE) this.updateGcode();
        else {
          // FOLLOWING — track mouse, draw + weld on pointer down
          this.ikTo(mouse.x, mouse.y, null, 0.10);

          if (pointer.down) {
            // Compute arc flicker while drawing
            const t = Date.now();
            this.weldFlicker = clamp(
              Math.abs(Math.sin(t * 0.030)) * 0.34 +
              Math.abs(Math.sin(t * 0.081)) * 0.26 +
              Math.abs(Math.sin(t * 0.18)) * 0.14 +
              (Math.random() < 0.07 ? Math.random() * 0.50 : 0),
              0, 1
            );
            this.userArcActive = true;

            const ee = this.endEffector();
            const last = userTrail[userTrail.length - 1];
            if (!last || Math.hypot(ee.x - last.x, ee.y - last.y) > 2.5) {
              userTrail.push({ x: ee.x, y: ee.y, alpha: 1.0 });
            }
            // Sparks while drawing
            if (Math.random() < 0.30) emit(ee.x, ee.y, 1 + Math.floor(Math.random() * 3));
          } else {
            // Arc off when not pressing
            this.weldFlicker = 0;
            this.userArcActive = false;
          }
        }
        const ee = this.endEffector();
        this.eeX = ee.x; this.eeY = ee.y;
      }

      // ── SVG transforms ──
      applySVG() {
        const th1d = this.th1 * 180 / Math.PI;
        esl1.setAttribute('transform',
          `translate(${SVG_SH.x},${SVG_SH.y}) rotate(${th1d})`);
        const ex = SVG_SH.x + Math.cos(this.th1) * SVG_L1;
        const ey = SVG_SH.y + Math.sin(this.th1) * SVG_L1;
        const wd = (this.th1 + this.th2) * 180 / Math.PI;
        esl2.setAttribute('transform',
          `translate(${ex.toFixed(1)},${ey.toFixed(1)}) rotate(${wd.toFixed(2)}) translate(-215,-300)`);
      }

      positionSVG() {
        const VBW = 1160, VBH = 1410, VBX = -300, VBY = -400;
        const rW = this.by * VBW / (SVG_BASE_Y - VBY);
        const rH = rW * VBH / VBW;
        const ppU = rW / VBW;
        // Mirrored: container left = bx - (VBW - (178-VBX))*ppU
        // = bx - (1160 - 478)*ppU = bx - 682*ppU
        svgCont.style.left = (this.bx - (VBW - (178 - VBX)) * ppU) + 'px';
        svgCont.style.top = (this.by - (SVG_BASE_Y - VBY) * ppU) + 'px';
        kukaSvg.style.width = rW + 'px';
        kukaSvg.style.height = rH + 'px';
        kukaSvg.style.transform = 'scaleX(-1)';  // mirror the arm, rail/chain stay in canvas
        this.svgScale = ppU;
      }

      // ── Draw helpers ──
      drawGrid(c) {
        c.save();
        const g = isMobile() ? 35 : 45;
        c.strokeStyle = 'rgba(90,145,255,0.07)';
        c.lineWidth = 1;
        for (let x = 0; x < W; x += g) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); }
        for (let y = 0; y < H; y += g) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
        const G = g * 4;
        c.strokeStyle = 'rgba(90,145,255,0.16)'; c.lineWidth = 1;
        for (let x = 0; x < W; x += G) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); }
        for (let y = 0; y < H; y += G) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
        c.strokeStyle = 'rgba(90,145,255,0.28)'; c.lineWidth = 1;
        for (let x = 0; x < W; x += G) for (let y = 0; y < H; y += G) {
          c.beginPath(); c.moveTo(x - 4, y); c.lineTo(x + 4, y); c.stroke();
          c.beginPath(); c.moveTo(x, y - 4); c.lineTo(x, y + 4); c.stroke();
        }
        c.restore();
      }

      drawRail(c) {
        const rx = isMobile() ? W * 0.01 : W * 0.05;
        const rw = isMobile() ? W * 0.98 : W * 0.9;
        const ry = this.by;
        c.fillStyle = '#040f1c'; c.fillRect(rx, ry, rw, 70);
        c.fillStyle = '#0d2342'; c.fillRect(rx, ry + 15, rw, 8);
        c.fillStyle = '#091929'; c.fillRect(rx, ry + 38, rw, 22);
        c.fillStyle = 'rgba(74,158,255,0.12)'; c.fillRect(rx, ry + 15, rw, 2);
        c.fillStyle = '#060d17';
        for (let i = rx + 20; i < rx + rw - 20; i += 40) {
          c.beginPath(); c.arc(i, ry + 50, 4, 0, Math.PI * 2); c.fill();
        }
      }

      drawChain(c) {
        c.save();
        const anchorX = W * 0.05 + 210;
        const carX = this.bx + 80;
        const topY = this.by - 35, botY = this.by + 65;
        const radius = (botY - topY) / 2, cy = topY + radius;
        const L_geo = this.chainN * this.linkLen;
        let loopX = (carX + anchorX - Math.PI * radius + L_geo) / 2;
        if (loopX < carX + radius * 1.5) loopX = carX + radius * 1.5;
        const L1 = loopX - carX, L2 = Math.PI * radius;
        for (let i = 0; i < this.chainN; i++) {
          const d = i * this.linkLen; let x, y, ang;
          if (d <= L1) { x = carX + d; y = topY; ang = 0; }
          else if (d <= L1 + L2) {
            const u = (d - L1) / L2, a = -Math.PI / 2 + u * Math.PI;
            x = loopX + Math.cos(a) * radius; y = cy + Math.sin(a) * radius; ang = a + Math.PI / 2;
          } else { x = loopX - (d - L1 - L2); y = botY; ang = Math.PI; }
          c.save(); c.translate(x, y); c.rotate(ang);
          c.fillStyle = '#050e1a';
          rrect(c, -this.linkLen / 2, -12, this.linkLen, 24, 3); c.fill();
          c.fillStyle = '#0c1e33'; c.fillRect(-this.linkLen / 2 + 1, -10, this.linkLen - 2, 3);
          c.fillStyle = '#020810'; c.fillRect(-5, -6, 4, 12); c.fillRect(3, -6, 4, 12);
          c.restore();
        }
        c.restore();
      }

      drawCabinet(c) {
        if (isMobile()) return;  // cabinet hidden on mobile — no room
        const bW = 210, bH = 150;
        // Move cabinet to the right corner, away from text/buttons
        const cX = W * 0.95 - bW, cY = this.by + 65 - bH;
        c.save();
        c.fillStyle = '#030c17'; rrect(c, cX, cY, bW, bH, 4); c.fill();
        c.strokeStyle = 'rgba(74,158,255,0.18)'; c.lineWidth = 1;
        rrect(c, cX, cY, bW, bH, 4); c.stroke();
        const pX = cX + 35, pY = cY + 5, pW = bW - 40, pH = bH - 20;
        c.fillStyle = ORANGE; c.fillRect(pX, pY, pW, pH);
        c.fillStyle = '#080614'; c.fillRect(pX + 20, pY + 15, 60, 25);
        c.fillStyle = '#ff3333'; c.beginPath(); c.arc(pX + 30, pY + 27, 3, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#ffcc00'; c.beginPath(); c.arc(pX + 45, pY + 27, 3, 0, Math.PI * 2); c.fill();
        const pl = (Math.sin(Date.now() * .005) + 1) * .5;
        c.save(); c.fillStyle = `rgba(51,255,51,${.4 + pl * .6})`;
        c.shadowColor = '#33ff33'; c.shadowBlur = 4 + pl * 8;
        c.beginPath(); c.arc(pX + 60, pY + 27, 3, 0, Math.PI * 2); c.fill(); c.restore();
        c.fillStyle = '#060512'; rrect(c, pX + 7, pY + 70, 12, 45, 2); c.fill();
        c.fillStyle = '#040310'; c.font = '900 30px Orbitron,sans-serif';
        c.textAlign = 'left'; c.textBaseline = 'alphabetic';
        c.fillText('KUKA', pX + 30, pY + pH - 15);
        c.fillStyle = '#d8d8d8'; c.strokeStyle = '#111'; c.lineWidth = 1;
        c.fillRect(pX + 115, pY + 68, 45, 25); c.strokeRect(pX + 115, pY + 68, 45, 25);
        c.fillStyle = '#111'; c.font = 'bold 9px sans-serif';
        c.textAlign = 'center'; c.textBaseline = 'alphabetic';
        c.fillText('KUKA', pX + 137, pY + 79); c.font = '7px sans-serif';
        c.fillText('KR C4', pX + 137, pY + 89);
        const tX = pX + 138, tY = pY + 38;
        c.fillStyle = '#FFD700'; c.strokeStyle = '#111'; c.lineWidth = 2; c.lineJoin = 'miter';
        c.beginPath(); c.moveTo(tX, tY - 18); c.lineTo(tX + 20, tY + 14); c.lineTo(tX - 20, tY + 14); c.closePath(); c.fill(); c.stroke();
        c.fillStyle = '#111'; c.font = 'bold 22px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('!', tX, tY + 4);
        // SmartPAD — shows live robot data
        c.fillStyle = '#040310';
        c.beginPath(); c.moveTo(pX + pW - 5, pY + pH - 60); c.lineTo(pX + pW + 15, pY + pH - 60);
        c.lineTo(pX + pW + 15, pY + pH - 10); c.lineTo(pX + pW - 5, pY + pH - 10); c.fill();
        c.translate(cX + bW - 5, cY + bH - 60); c.rotate(Math.PI / 16);
        c.fillStyle = '#111'; rrect(c, -20, 0, 50, 65, 8); c.fill();
        c.fillStyle = '#0a0a0a'; rrect(c, -18, 2, 46, 61, 6); c.fill();
        c.fillStyle = ORANGE; c.fillRect(-16, 4, 42, 57);

        // Screen area
        c.save(); c.beginPath(); c.rect(-12, 10, 34, 44); c.clip();
        c.fillStyle = '#010a18'; c.fillRect(-12, 10, 34, 44);

        // Header bar
        c.fillStyle = 'rgba(255,102,0,0.85)'; c.fillRect(-12, 10, 34, 7);
        c.fillStyle = '#fff'; c.font = 'bold 4px monospace';
        c.textAlign = 'left'; c.textBaseline = 'top';
        c.fillText('KRC4', -10, 11);

        // Live data lines
        const ee2 = this.endEffector();
        const modeLabels = {
          [ST.WRITING]: 'WRITE', [ST.WELDING]: this.weldMode || 'WELD',
          [ST.FOLLOWING]: 'TRACK', [ST.GCODE]: 'GCODE'
        };
        const modeCol = {
          [ST.WRITING]: '#ff8833', [ST.WELDING]: '#ffdd00',
          [ST.FOLLOWING]: '#00ff88', [ST.GCODE]: '#00ccff'
        };

        c.font = '4px "Share Tech Mono", monospace';
        const lines2 = [
          { label: 'A1', val: (this.th1 * 180 / Math.PI).toFixed(0) + '°' },
          { label: 'A2', val: (this.th2 * 180 / Math.PI).toFixed(0) + '°' },
          { label: ' X', val: (ee2.x - W / 2).toFixed(0) },
          { label: ' Y', val: (-(ee2.y - H * .5)).toFixed(0) },
          { label: 'ST', val: modeLabels[this.state] || '—', col: modeCol[this.state] },
        ];
        lines2.forEach((ln, i) => {
          const ly = 21 + i * 7;
          c.fillStyle = 'rgba(100,180,255,0.55)'; c.textAlign = 'left';
          c.fillText(ln.label + ':', -11, ly);
          c.fillStyle = ln.col || '#b0e0ff'; c.textAlign = 'right';
          c.fillText(ln.val, 20, ly);
        });

        // Blinking cursor
        if (Math.floor(Date.now() / 400) % 2 === 0) {
          c.fillStyle = 'rgba(0,255,180,0.7)';
          c.fillRect(12, 50, 6, 2);
        }

        c.restore();
        // E-stop button
        c.fillStyle = '#111'; c.beginPath(); c.arc(15, 8, 5, 0, Math.PI * 2); c.fill();
        c.fillStyle = 'red'; c.beginPath(); c.arc(15, 8, 3.5, 0, Math.PI * 2); c.fill();
        c.restore();
      }

      drawHUD(c) {
        const ee = this.endEffector();

        if (isMobile()) {
          // ── MOBILE: compact status bar at bottom of screen ──
          const barH = 36, barY = H - barH;
          c.save();
          c.fillStyle = 'rgba(4,12,24,0.88)';
          c.fillRect(0, barY, W, barH);
          c.strokeStyle = 'rgba(74,158,255,0.25)';
          c.lineWidth = 1;
          c.beginPath(); c.moveTo(0, barY); c.lineTo(W, barY); c.stroke();

          c.font = '9px "Share Tech Mono", monospace';
          c.textBaseline = 'middle';
          const midY = barY + barH / 2;

          // State badge
          const cols = {
            [ST.WRITING]: '#FF6600', [ST.WELDING]: '#ffdd00',
            [ST.FOLLOWING]: '#00ff88', [ST.GCODE]: '#00ccff'
          };
          const labs = {
            [ST.WRITING]: 'ESCRIBIENDO', [ST.WELDING]: this.weldMode || 'SOLDANDO',
            [ST.FOLLOWING]: 'TRACKING', [ST.GCODE]: 'GCODE'
          };
          c.fillStyle = cols[this.state]; c.textAlign = 'left';
          c.fillText('⚡ ' + labs[this.state], 14, midY);

          // Joint angles
          c.fillStyle = 'rgba(100,160,255,0.6)'; c.textAlign = 'center';
          c.fillText(`A1 ${(this.th1 * 180 / Math.PI).toFixed(0)}°  A2 ${(this.th2 * 180 / Math.PI).toFixed(0)}°`, W / 2, midY);

          // EE position
          c.fillStyle = 'rgba(74,158,255,0.55)'; c.textAlign = 'right';
          c.fillText(`${(ee.x - W / 2).toFixed(0)}, ${(-(ee.y - H * 0.5)).toFixed(0)} mm`, W - 14, midY);

          // Writing progress bar
          if (this.state === ST.WRITING && this.waypoints.length) {
            const pct = this.wpIdx / this.waypoints.length;
            c.fillStyle = 'rgba(255,102,0,0.18)';
            c.fillRect(0, barY, W, 3);
            c.fillStyle = ORANGE;
            c.fillRect(0, barY, W * pct, 3);
          }

          // Crosshair at EE
          const col = this.state === ST.WELDING ? 'rgba(255,210,0,.7)'
            : this.state === ST.FOLLOWING ? 'rgba(0,255,136,.7)'
              : 'rgba(255,102,0,.7)';
          c.strokeStyle = col; c.lineWidth = 1;
          c.beginPath();
          c.moveTo(ee.x - 14, ee.y); c.lineTo(ee.x + 14, ee.y);
          c.moveTo(ee.x, ee.y - 14); c.lineTo(ee.x, ee.y + 14);
          c.stroke();
          c.beginPath(); c.arc(ee.x, ee.y, 7, 0, Math.PI * 2); c.stroke();
          c.restore();
          return;
        }

        // ── DESKTOP: full side panel ──
        const hx = W - 22, hy = H * 0.14;
        const hw = 148;
        const sh = this.shoulder();

        c.save();
        c.font = '9.5px "Share Tech Mono", monospace';

        c.fillStyle = 'rgba(4,12,24,0.82)';
        c.strokeStyle = 'rgba(74,158,255,0.28)';
        c.lineWidth = 1;
        rrect(c, hx - hw - 14, hy, hw + 22, 198, 3);
        c.fill(); c.stroke();

        const lx = hx - hw, lx2 = hx + 8;
        const line = (lbl, val, yy, col = '#fff') => {
          c.textAlign = 'left'; c.fillStyle = 'rgba(100,160,255,0.6)'; c.fillText(lbl, lx, yy);
          c.textAlign = 'right'; c.fillStyle = col; c.fillText(val, lx2, yy);
        };

        c.textAlign = 'left'; c.fillStyle = ORANGE;
        c.font = 'bold 9.5px "Share Tech Mono", monospace';
        c.fillText('KUKA KR 6 R900', lx, hy + 16);
        c.fillStyle = 'rgba(74,158,255,0.3)'; c.fillRect(lx - 2, hy + 20, hw + 14, 1);

        c.font = '9.5px "Share Tech Mono", monospace';
        c.textAlign = 'left'; c.fillStyle = 'rgba(74,158,255,.45)';
        c.fillText('── JOINTS', lx, hy + 36);
        line('A1:', (this.th1 * 180 / Math.PI).toFixed(1) + '°', hy + 52);
        line('A2:', (this.th2 * 180 / Math.PI).toFixed(1) + '°', hy + 68);

        c.fillStyle = 'rgba(74,158,255,.45)'; c.textAlign = 'left';
        c.fillText('── POSITION', lx, hy + 88);
        line('X:', (ee.x - W / 2).toFixed(0) + ' mm', hy + 104);
        line('Y:', (-(ee.y - H * 0.5)).toFixed(0) + ' mm', hy + 120);

        c.fillStyle = 'rgba(74,158,255,.45)'; c.textAlign = 'left';
        c.fillText('── STATUS', lx, hy + 140);
        const cols = {
          [ST.WRITING]: '#FF6600', [ST.WELDING]: '#ffdd00',
          [ST.FOLLOWING]: '#00ff88', [ST.GCODE]: '#00ccff'
        };
        const labs = {
          [ST.WRITING]: 'WRITING', [ST.WELDING]: this.weldMode || 'WELDING',
          [ST.FOLLOWING]: 'TRACKING', [ST.GCODE]: 'GCODE'
        };
        c.textAlign = 'left'; c.fillStyle = cols[this.state];
        c.fillText('● ' + labs[this.state], lx, hy + 156);

        if (this.state === ST.WRITING) {
          const pct = this.waypoints.length ? this.wpIdx / this.waypoints.length : 0;
          c.fillStyle = 'rgba(74,158,255,.15)'; c.fillRect(lx - 2, hy + 168, hw + 14, 7);
          c.fillStyle = ORANGE; c.fillRect(lx - 2, hy + 168, (hw + 14) * pct, 7);
          c.fillStyle = 'rgba(74,158,255,.4)'; c.textAlign = 'right';
          c.fillText(Math.round(pct * 100) + '%', lx2, hy + 192);
        }

        c.restore();

        if (this.state !== ST.WRITING) {
          const col = this.state === ST.WELDING ? 'rgba(255,210,0,.55)' : 'rgba(0,255,136,.55)';
          c.save();
          c.strokeStyle = col; c.lineWidth = 1;
          c.beginPath();
          c.moveTo(ee.x - 14, ee.y); c.lineTo(ee.x + 14, ee.y);
          c.moveTo(ee.x, ee.y - 14); c.lineTo(ee.x, ee.y + 14);
          c.stroke();
          c.beginPath(); c.arc(ee.x, ee.y, 7, 0, Math.PI * 2); c.stroke();
          c.restore();
        }
      }

      // ── WELDING MASK EFFECT ──────────────────────
      drawWeldingMask(c) {
        const isActive = (this.state === ST.WELDING || this.state === ST.GCODE ||
          this.state === ST.WRITING ||
          (this.state === ST.FOLLOWING && this.userArcActive));
        const arcTarget = isActive ? this.weldFlicker : 0;

        // Fully instant — no lerp, tracks flicker frame-by-frame
        this.maskAlpha = arcTarget;

        if (this.maskAlpha < 0.01) return;

        const a = this.maskAlpha;
        const f = this.weldFlicker;
        const ee = { x: this.eeX, y: this.eeY };
        const sh = this.shoulder();

        c.save();

        // ── 1. VISOR DARKNESS — more pronounced ──
        const darkness = 0.62 + f * 0.10;
        c.globalAlpha = a * darkness;
        c.fillStyle = '#000510';
        c.fillRect(0, 0, W, H);
        c.globalAlpha = 1;

        // ── 2. AMBIENT GLOW on robot body ──
        c.globalCompositeOperation = 'lighter';

        const ambient = c.createRadialGradient(sh.x, sh.y - 40, 10, sh.x, sh.y + 60, 480);
        ambient.addColorStop(0, `rgba(255,160,50,${a * (0.18 + f * 0.12)})`);
        ambient.addColorStop(0.30, `rgba(220,100,20,${a * (0.08 + f * 0.05)})`);
        ambient.addColorStop(0.70, `rgba(180,70,10,${a * 0.03})`);
        ambient.addColorStop(1, 'rgba(0,0,0,0)');
        c.fillStyle = ambient;
        c.fillRect(0, 0, W, H);

        // Rail hot line
        const railGlow = c.createLinearGradient(0, this.by - 10, 0, this.by + 80);
        railGlow.addColorStop(0, `rgba(255,130,25,${a * (0.12 + f * 0.09)})`);
        railGlow.addColorStop(0.5, `rgba(200,80,10,${a * 0.04})`);
        railGlow.addColorStop(1, 'rgba(0,0,0,0)');
        c.fillStyle = railGlow;
        c.fillRect(0, this.by - 10, W, 110);

        // ── 3. ARC LIGHT CONE ──
        if (f > 0.01) {
          const arcR = 240 + f * 110;
          const arcA = a * (0.42 + f * 0.30);
          const arcLight = c.createRadialGradient(ee.x, ee.y, 0, ee.x, ee.y, arcR);
          arcLight.addColorStop(0, `rgba(200,225,255,${arcA})`);
          arcLight.addColorStop(0.08, `rgba(170,205,255,${arcA * 0.75})`);
          arcLight.addColorStop(0.25, `rgba(120,170,255,${arcA * 0.30})`);
          arcLight.addColorStop(0.55, `rgba(70,120,220,${arcA * 0.09})`);
          arcLight.addColorStop(1, 'rgba(0,0,0,0)');
          c.fillStyle = arcLight;
          c.fillRect(0, 0, W, H);

          // ── 4. ARC CORE ──
          const coreR = 22 + f * 18;
          const core = c.createRadialGradient(ee.x, ee.y, 0, ee.x, ee.y, coreR);
          core.addColorStop(0, `rgba(255,255,255,${a * (0.92 + f * 0.08)})`);
          core.addColorStop(0.15, `rgba(220,240,255,${a * (0.75 + f * 0.18)})`);
          core.addColorStop(0.40, `rgba(140,200,255,${a * (0.38 + f * 0.18)})`);
          core.addColorStop(0.75, `rgba(70,150,255,${a * 0.10})`);
          core.addColorStop(1, 'rgba(0,0,0,0)');
          c.fillStyle = core;
          c.beginPath(); c.arc(ee.x, ee.y, coreR, 0, Math.PI * 2); c.fill();

          if (f > 0.45) {
            const pin = c.createRadialGradient(ee.x, ee.y, 0, ee.x, ee.y, 5 + f * 4);
            pin.addColorStop(0, `rgba(255,255,255,${a * (0.95 + f * 0.05)})`);
            pin.addColorStop(1, 'rgba(255,255,255,0)');
            c.fillStyle = pin;
            c.beginPath(); c.arc(ee.x, ee.y, 5 + f * 4, 0, Math.PI * 2); c.fill();
          }
        }

        // ── 5. EDGE VIGNETTE ──
        c.globalCompositeOperation = 'source-over';
        const vig = c.createRadialGradient(W / 2, H / 2, H * 0.28, W / 2, H / 2, H * 0.88);
        vig.addColorStop(0, 'rgba(0,0,0,0)');
        vig.addColorStop(1, `rgba(0,2,10,${a * 0.52})`);
        c.fillStyle = vig;
        c.fillRect(0, 0, W, H);

        c.globalCompositeOperation = 'source-over';
        c.globalAlpha = 1;
        c.restore();
      }

      draw(c, cO) {
        this.drawGrid(c);
        this.drawRail(c);
        this.drawChain(c);
        drawTrail(c);
        // writing cursor dot
        if (this.state === ST.WRITING) {
          c.save();
          c.fillStyle = 'rgba(255,120,30,.9)'; c.shadowColor = 'rgba(255,90,0,.7)'; c.shadowBlur = 10;
          c.beginPath(); c.arc(this.eeX, this.eeY, 3.5, 0, Math.PI * 2); c.fill();
          c.restore();
        }
        this.positionSVG();
        this.applySVG();
        // Mask covers robot + rail + background
        this.drawWeldingMask(cO);
        // Cabinet and HUD drawn AFTER mask — always fully readable
        this.drawCabinet(cO);
        this.drawHUD(cO);
      }
    }

    // ── G-CODE PARSER ─────────────────────────────
    // Coordinate space: mm → screen pixels mapped to center of robot workspace
    // Origin (0,0) = center of right half of screen
    const MM_TO_PX = () => Math.min(W, H) / 420;  // 1mm ≈ scale based on viewport

    function parseGcode(src) {
      const lines = src.split('\n');
      const wps = [];
      let cx = W * 0.64, cy = H * 0.36;  // machine origin in screen coords
      let px = cx, py = cy;           // current position
      const scale = MM_TO_PX();

      for (let raw of lines) {
        const line = raw.split(';')[0].trim().toUpperCase();
        if (!line) continue;

        const tok = {};
        line.split(/\s+/).forEach(t => {
          const letter = t[0];
          const val = parseFloat(t.slice(1));
          if (!isNaN(val)) tok[letter] = val;
        });

        const code = line.match(/^(G\d+|M\d+)/)?.[1] || '';
        if (!code) continue;

        // G0 – Rapid move (pen up)
        if (code === 'G0') {
          const nx = cx + (tok['X'] !== undefined ? tok['X'] * scale : (px - cx));
          const ny = cy - (tok['Y'] !== undefined ? tok['Y'] * scale : (cy - py));
          wps.push({ x: nx, y: ny, penDown: false, rapid: true });
          px = nx; py = ny;
        }
        // G1 – Linear feed (pen down)
        else if (code === 'G1') {
          const nx = cx + (tok['X'] !== undefined ? tok['X'] * scale : (px - cx));
          const ny = cy - (tok['Y'] !== undefined ? tok['Y'] * scale : (cy - py));
          // Interpolate
          const dist = Math.hypot(nx - px, ny - py);
          const steps = Math.max(1, Math.floor(dist / 22));
          for (let s = 1; s <= steps; s++) {
            wps.push({ x: px + (nx - px) * s / steps, y: py + (ny - py) * s / steps, penDown: true, rapid: false });
          }
          px = nx; py = ny;
        }
        // G2 – CW arc  G3 – CCW arc
        else if (code === 'G2' || code === 'G3') {
          const ex = cx + (tok['X'] !== undefined ? tok['X'] * scale : (px - cx));
          const ey = cy - (tok['Y'] !== undefined ? tok['Y'] * scale : (cy - py));
          const icx = px + (tok['I'] !== undefined ? tok['I'] * scale : 0);
          const icy = py - (tok['J'] !== undefined ? tok['J'] * scale : 0);
          const r = Math.hypot(icx - px, icy - py);
          const a0 = Math.atan2(py - icy, px - icx);
          let a1 = Math.atan2(ey - icy, ex - icx);
          const cw = (code === 'G2');
          if (cw && a1 > a0) a1 -= Math.PI * 2;
          if (!cw && a1 < a0) a1 += Math.PI * 2;
          const arcSteps = Math.max(8, Math.floor(Math.abs(a1 - a0) * r / 18));
          for (let s = 1; s <= arcSteps; s++) {
            const a = a0 + (a1 - a0) * s / arcSteps;
            wps.push({ x: icx + Math.cos(a) * r, y: icy + Math.sin(a) * r, penDown: true, rapid: false, arc: true });
          }
          px = ex; py = ey;
        }
        // M2/M30 – End
        else if (code === 'M2' || code === 'M30') break;
      }
      return wps;
    }

    // ── G-code UI wiring ──────────────────────────
    const gcPanel = document.getElementById('gcode-panel');
    const gcToggle = document.getElementById('gcode-toggle');
    const gcClose = document.getElementById('gcode-close');
    const gcRun = document.getElementById('gcode-run');
    const gcStop = document.getElementById('gcode-stop');
    const gcTA = document.getElementById('gcode-textarea');

    gcToggle.addEventListener('click', () => {
      gcToggle.classList.add('hidden');
      gcPanel.classList.add('open');
    });
    gcClose.addEventListener('click', () => {
      gcPanel.classList.remove('open');
      gcToggle.classList.remove('hidden');
    });
    gcRun.addEventListener('click', () => {
      const wps = parseGcode(gcTA.value);
      if (!wps.length) {
        document.getElementById('gcode-status').textContent = '// sin waypoints válidos';
        return;
      }
      trail.length = 0;
      document.getElementById('gcode-status').textContent = `// ${wps.length} puntos cargados…`;
      arm.startGcode(wps);
    });
    gcStop.addEventListener('click', () => arm.stopGcode());

    // ── Bootstrap ─────────────────────────────────
    const arm = new KukaKinematic();
    resize(); // initial size

    function loop() {
      ctx.clearRect(0, 0, W, H);
      ctxO.clearRect(0, 0, W, H);
      tickUserTrail();
      arm.update();
      arm.draw(ctx, ctxO);
      for (let i = sparks.length - 1; i >= 0; i--) {
        sparks[i].update();
        if (sparks[i].life <= 0) { sparks.splice(i, 1); continue; }
        sparks[i].draw(ctxO);
      }
      requestAnimationFrame(loop);
    }

    // Wait for Orbitron to be available so buildWaypoints gets real glyph pixels
    document.fonts.ready.then(() => {
      arm.waypoints = []; // trigger rebuild now that font is loaded
      loop();
    });
  