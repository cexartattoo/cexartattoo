/* ============================================
   CÉSAR RAMÍREZ - ADVANCED VISUAL EFFECTS v3
   1. Network Canvas con nodos que nacen en el mouse
   2. Hero particles — nombre se ensambla desde piezas robóticas
   3. Crosshair YOLO + bbox en todo el portafolio
   4. 3D Tilt en tarjetas
   5. Contadores tipo terminal
   ============================================ */

(function () {
    'use strict';

    const isMobile = window.innerWidth < 768 || ('ontouchstart' in window);
    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let mouseActive = false;

    document.addEventListener('mousemove', e => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouseActive = true;
    });

    // ============================================================
    // 1. MECHATRONIC NETWORK — nodos que nacen donde va el mouse
    // ============================================================
    function initNetworkCanvas() {
        const canvas = document.createElement('canvas');
        canvas.id = 'network-canvas';
        canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:-1;pointer-events:none;opacity:0;transition:opacity 1.5s ease;';
        document.body.prepend(canvas);

        setTimeout(() => { canvas.style.opacity = '1'; }, 100);

        const ctx = canvas.getContext('2d');
        let W, H;

        function resize() {
            W = canvas.width = window.innerWidth;
            H = canvas.height = window.innerHeight;
        }
        resize();
        window.addEventListener('resize', resize);

        const CONNECTION_DIST = isMobile ? 140 : 190;
        const MOUSE_RADIUS = 160;
        const MAX_NODES = isMobile ? 45 : 85;
        const nodes = [];
        const SYMBOLS = ['⚙', '◈', '⬡', '△', '◉', '⊞', '▣', '⏣'];

        function createNode(x, y, fromMouse) {
            const speed = fromMouse ? 0.3 + Math.random() * 0.4 : 0.7 + Math.random() * 0.9;
            const angle = Math.random() * Math.PI * 2;
            return {
                x: x !== undefined ? x : Math.random() * W,
                y: y !== undefined ? y : Math.random() * H,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: fromMouse ? 2 + Math.random() * 2 : 2 + Math.random() * 3,
                symbol: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
                color: Math.random() > 0.5 ? '#00ff88' : '#0088ff',
                alpha: 0,
                life: fromMouse ? 0.6 + Math.random() * 0.4 : 1,
                fromMouse: !!fromMouse,
                turbTimer: Math.floor(Math.random() * 120)
            };
        }

        for (let i = 0; i < (isMobile ? 25 : 50); i++) {
            const n = createNode();
            n.alpha = Math.random();
            nodes.push(n);
        }

        const pulses = [];
        const MAX_PULSES = isMobile ? 10 : 25;

        function spawnPulse(n1, n2) {
            if (pulses.length >= MAX_PULSES) return;
            pulses.push({
                sx: n1.x, sy: n1.y, tx: n2.x, ty: n2.y,
                progress: 0,
                speed: 0.012 + Math.random() * 0.018,
                color: Math.random() > 0.5 ? '#00ff88' : '#0088ff'
            });
        }

        let mouseSpawnTimer = 0;
        let frameCount = 0;

        // Spawn nodos en click
        document.addEventListener('click', () => {
            if (nodes.length < MAX_NODES) {
                for (let i = 0; i < 3; i++) {
                    nodes.push(createNode(
                        mouse.x + (Math.random() - 0.5) * 40,
                        mouse.y + (Math.random() - 0.5) * 40,
                        true
                    ));
                }
            }
        });

        function drawGear(x, y, r, color, alpha) {
            ctx.save();
            ctx.globalAlpha = alpha * 0.55;
            ctx.strokeStyle = color;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.stroke();
            for (let i = 0; i < 4; i++) {
                const a = (i / 4) * Math.PI * 2;
                ctx.beginPath();
                ctx.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
                ctx.lineTo(x + Math.cos(a) * (r + 3), y + Math.sin(a) * (r + 3));
                ctx.stroke();
            }
            ctx.restore();
        }

        function animate() {
            ctx.clearRect(0, 0, W, H);
            frameCount++;

            // Spawn nodo periódico cerca del mouse
            mouseSpawnTimer++;
            if (mouseActive && mouseSpawnTimer > (isMobile ? 100 : 70) && nodes.length < MAX_NODES) {
                mouseSpawnTimer = 0;
                nodes.push(createNode(
                    mouse.x + (Math.random() - 0.5) * 70,
                    mouse.y + (Math.random() - 0.5) * 70,
                    true
                ));
            }

            for (let i = nodes.length - 1; i >= 0; i--) {
                const n = nodes[i];

                if (n.alpha < 1) n.alpha = Math.min(1, n.alpha + 0.02);
                if (n.fromMouse) {
                    n.life -= 0.0007;
                    if (n.life <= 0) { nodes.splice(i, 1); continue; }
                }

                n.turbTimer++;
                if (n.turbTimer > 110) {
                    n.turbTimer = 0;
                    n.vx += (Math.random() - 0.5) * 0.5;
                    n.vy += (Math.random() - 0.5) * 0.5;
                    const spd = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
                    const maxS = n.fromMouse ? 0.8 : 1.7;
                    const minS = n.fromMouse ? 0.2 : 0.5;
                    if (spd > maxS) { n.vx *= maxS / spd; n.vy *= maxS / spd; }
                    if (spd < minS) { n.vx *= minS / spd; n.vy *= minS / spd; }
                }

                n.x += n.vx;
                n.y += n.vy;
                if (n.x < -20) n.x = W + 20;
                if (n.x > W + 20) n.x = -20;
                if (n.y < -20) n.y = H + 20;
                if (n.y > H + 20) n.y = -20;

                // Atracción del mouse
                const dx = mouse.x - n.x;
                const dy = mouse.y - n.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < MOUSE_RADIUS && dist > 0) {
                    const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS * 0.032;
                    n.x += dx * force;
                    n.y += dy * force;
                }

                const ea = n.fromMouse ? n.alpha * n.life : n.alpha;

                if (n.radius > 3.5) {
                    drawGear(n.x, n.y, n.radius, n.color, ea);
                } else {
                    ctx.beginPath();
                    ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
                    ctx.fillStyle = n.color;
                    ctx.globalAlpha = ea * 0.85;
                    ctx.shadowColor = n.color;
                    ctx.shadowBlur = 8;
                    ctx.fill();
                    ctx.shadowBlur = 0;
                    ctx.globalAlpha = 1;
                }
            }

            // Conexiones
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const dx = nodes[i].x - nodes[j].x;
                    const dy = nodes[i].y - nodes[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < CONNECTION_DIST) {
                        const alpha = (1 - dist / CONNECTION_DIST) * 0.3;
                        ctx.strokeStyle = `rgba(0,255,136,${alpha})`;
                        ctx.lineWidth = 0.8;
                        ctx.beginPath();
                        ctx.moveTo(nodes[i].x, nodes[i].y);
                        ctx.lineTo(nodes[j].x, nodes[j].y);
                        ctx.stroke();
                        if (frameCount % 50 === 0 && Math.random() < 0.09) {
                            spawnPulse(nodes[i], nodes[j]);
                        }
                    }
                }
            }

            // Pulsos
            for (let i = pulses.length - 1; i >= 0; i--) {
                const p = pulses[i];
                p.progress += p.speed;
                if (p.progress >= 1) { pulses.splice(i, 1); continue; }
                const t = p.progress;
                const cx = p.sx + (p.tx - p.sx) * t;
                const cy = p.sy + (p.ty - p.sy) * t;

                for (let k = 1; k <= 5; k++) {
                    const tt = Math.max(0, t - k * 0.025);
                    const tx2 = p.sx + (p.tx - p.sx) * tt;
                    const ty2 = p.sy + (p.ty - p.sy) * tt;
                    ctx.beginPath();
                    ctx.arc(tx2, ty2, 1.5, 0, Math.PI * 2);
                    ctx.fillStyle = p.color === '#00ff88'
                        ? `rgba(0,255,136,${0.12 * (6 - k)})`
                        : `rgba(0,136,255,${0.12 * (6 - k)})`;
                    ctx.fill();
                }

                ctx.beginPath();
                ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.shadowColor = p.color;
                ctx.shadowBlur = 12;
                ctx.fill();
                ctx.shadowBlur = 0;
            }

            requestAnimationFrame(animate);
        }

        animate();
    }


    // ============================================================
    // 2. HERO PARTICLES — nombre ensamblado desde piezas robóticas
    // ============================================================
    function initHeroParticles() {
        const hero = document.querySelector('#hero, .hero, section:first-of-type');
        if (!hero) return;

        const canvas = document.createElement('canvas');
        canvas.id = 'hero-particles';
        canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;z-index:5;pointer-events:none;';
        hero.style.position = hero.style.position || 'relative';
        hero.prepend(canvas);

        const ctx = canvas.getContext('2d');
        let W, H;

        function resize() {
            W = canvas.width = hero.offsetWidth;
            H = canvas.height = hero.offsetHeight;
        }
        resize();
        window.addEventListener('resize', resize);

        // Samplear píxeles del texto renderizado en offscreen canvas
        function getTextPixels(lines, baseFontSize) {
            const off = document.createElement('canvas');
            off.width = W; off.height = H;
            const octx = off.getContext('2d');

            octx.fillStyle = '#ffffff';
            octx.textAlign = 'center';
            octx.textBaseline = 'middle';

            const fs = W < 600 ? baseFontSize * 0.55 : baseFontSize;
            const lineGap = fs * 1.5;
            const totalH = lines.length * lineGap;
            const startY = H / 2 - totalH / 2 + lineGap * 0.5;

            lines.forEach((line, i) => {
                const size = i === 0 ? fs : fs * 0.42;
                octx.font = `700 ${size}px 'Orbitron','Rajdhani',monospace`;
                octx.fillText(line, W / 2, startY + i * lineGap);
            });

            const pixels = [];
            const data = octx.getImageData(0, 0, W, H).data;
            const gap = isMobile ? 9 : 5;

            for (let y = 0; y < H; y += gap) {
                for (let x = 0; x < W; x += gap) {
                    if (data[(y * W + x) * 4 + 3] > 128) {
                        pixels.push({ x, y });
                    }
                }
            }
            return pixels;
        }

        const PSYMBOLS = ['⚙', '◈', '▸', '⬡', '◉', '⊕', '△', '╋', '◆', '⏣', '⊗', '⊘'];
        const PCOLORS = ['#00ff88', '#0088ff', '#00ccff', '#00ff44', '#44ffaa'];

        let particles = [];
        let fadeOutDone = false;
        let assemblyStart = null;
        const DURATION = 3000;

        function buildParticles(pixels) {
            const maxP = isMobile ? 280 : 650;
            const selected = pixels.sort(() => Math.random() - 0.5).slice(0, Math.min(pixels.length, maxP));

            particles = selected.map(dest => {
                const angle = Math.random() * Math.PI * 2;
                const dist = 250 + Math.random() * Math.max(W, H) * 0.55;
                return {
                    x: W / 2 + Math.cos(angle) * dist,
                    y: H / 2 + Math.sin(angle) * dist,
                    destX: dest.x, destY: dest.y,
                    symbol: PSYMBOLS[Math.floor(Math.random() * PSYMBOLS.length)],
                    color: PCOLORS[Math.floor(Math.random() * PCOLORS.length)],
                    size: 7 + Math.random() * 6,
                    delay: Math.random() * 0.45,
                    rotation: Math.random() * Math.PI * 2,
                    rotSpeed: (Math.random() - 0.5) * 0.18,
                    alpha: 0
                };
            });
        }

        function easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }

        // Ocultar h1 temporalmente
        const h1 = hero.querySelector('h1');
        const sub = hero.querySelector('.hero-tagline, .hero-subtitle');
        if (h1) h1.style.opacity = '0';
        if (sub) sub.style.opacity = '0';

        function animate(ts) {
            if (!assemblyStart) assemblyStart = ts;
            const elapsed = ts - assemblyStart;
            const globalP = Math.min(elapsed / DURATION, 1);

            ctx.clearRect(0, 0, W, H);

            for (const p of particles) {
                const localP = Math.max(0, (globalP - p.delay) / (1 - p.delay));
                const eased = easeOutQuart(Math.min(localP, 1));

                // Volar hacia destino
                p.x += (p.destX - p.x) * 0.035 * (1 + eased * 4);
                p.y += (p.destY - p.y) * 0.035 * (1 + eased * 4);

                // Rotar mientras vuela, detenerse al llegar
                p.rotation += p.rotSpeed * (1 - eased);
                p.alpha = Math.min(1, localP * 2.5);

                // Repulsión del mouse mientras vuela
                if (eased < 0.92) {
                    const mdx = mouse.x - p.x;
                    const mdy = mouse.y - p.y;
                    const md = Math.sqrt(mdx * mdx + mdy * mdy);
                    if (md < 95 && md > 0) {
                        const f = (95 - md) / 95 * 5;
                        p.x -= (mdx / md) * f;
                        p.y -= (mdy / md) * f;
                    }
                } else {
                    // Ensamblado: repulsión suave desde destino
                    const mdx = mouse.x - p.destX;
                    const mdy = mouse.y - p.destY;
                    const md = Math.sqrt(mdx * mdx + mdy * mdy);
                    if (md < 80 && md > 0) {
                        const f = (80 - md) / 80 * 3;
                        p.x = p.destX - (mdx / md) * f;
                        p.y = p.destY - (mdy / md) * f;
                    } else {
                        p.x += (p.destX - p.x) * 0.12;
                        p.y += (p.destY - p.y) * 0.12;
                    }
                }

                ctx.save();
                ctx.globalAlpha = p.alpha;
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation);
                ctx.font = `${p.size}px monospace`;
                ctx.fillStyle = p.color;
                ctx.shadowColor = p.color;
                ctx.shadowBlur = eased > 0.65 ? 7 : 2;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(p.symbol, 0, 0);
                ctx.shadowBlur = 0;
                ctx.restore();
            }

            if (globalP >= 1 && !fadeOutDone) {
                fadeOutDone = true;
                setTimeout(() => {
                    canvas.style.transition = 'opacity 1.2s ease';
                    canvas.style.opacity = '0';
                    if (h1) { h1.style.transition = 'opacity 0.9s ease'; h1.style.opacity = '1'; }
                    if (sub) { sub.style.transition = 'opacity 0.9s ease 0.4s'; sub.style.opacity = '1'; }
                }, 900);
                return;
            }

            if (!fadeOutDone) requestAnimationFrame(animate);
        }

        // Esperar fuentes
        setTimeout(() => {
            const pixels = getTextPixels(
                ['César Javier Ramírez', 'INGENIERO MECATRÓNICO'],
                isMobile ? 38 : 74
            );

            if (pixels.length < 10) {
                // Fallback: mostrar texto directamente
                if (h1) h1.style.opacity = '1';
                if (sub) sub.style.opacity = '1';
                return;
            }

            buildParticles(pixels);
            requestAnimationFrame(animate);
        }, 400);
    }


    // ============================================================
    // 3. CROSSHAIR CURSOR
    // ============================================================
    function initCrosshairCursor() {
        if (isMobile) return;

        const overlay = document.createElement('div');
        overlay.id = 'crosshair-cursor';
        overlay.innerHTML = `
            <div class="ch-ring"></div>
            <div class="ch-line ch-h"></div>
            <div class="ch-line ch-v"></div>
            <div class="ch-coords"></div>
        `;
        document.body.appendChild(overlay);

        const style = document.createElement('style');
        style.textContent = `
            * { cursor: none !important; }
            #crosshair-cursor {
                position: fixed; pointer-events: none; z-index: 99999;
                transform: translate(-50%, -50%);
            }
            .ch-ring {
                width: 36px; height: 36px;
                border: 1.5px solid #00ff88; border-radius: 50%;
                position: absolute; top: 50%; left: 50%;
                transform: translate(-50%, -50%); opacity: 0.85;
                transition: transform 0.15s ease, border-color 0.2s;
            }
            #crosshair-cursor.on-interactive .ch-ring {
                transform: translate(-50%, -50%) scale(1.5);
                border-color: #0088ff;
            }
            .ch-line { position: absolute; background: rgba(0,255,136,0.6); }
            .ch-h { width: 18px; height: 1px; top:50%; left:50%; transform: translate(22px,-0.5px); }
            .ch-v { width: 1px; height: 18px; top:50%; left:50%; transform: translate(-0.5px,22px); }
            .ch-coords {
                position: absolute; top:50%; left:50%;
                transform: translate(28px,8px);
                font-family: 'Rajdhani',monospace; font-size: 10px;
                color: #00ff88; white-space: nowrap; opacity: 0.7;
            }
        `;
        document.head.appendChild(style);

        const coords = overlay.querySelector('.ch-coords');
        function updateCursor() {
            overlay.style.left = mouse.x + 'px';
            overlay.style.top = mouse.y + 'px';
            coords.textContent = `X:${mouse.x} Y:${mouse.y}`;
            requestAnimationFrame(updateCursor);
        }
        updateCursor();

        document.addEventListener('mouseover', e => {
            const interactive = e.target.closest('a,button,.project-card,.skill-category,.contact-card,.timeline-item,.education-card');
            overlay.classList.toggle('on-interactive', !!interactive);
        });
    }


    // ============================================================
    // 4. YOLO BOUNDING BOX
    // ============================================================
    function initYoloBbox() {
        if (isMobile) return;

        const style = document.createElement('style');
        style.textContent = `
            #yolo-bbox-overlay {
                position: fixed; pointer-events: none; z-index: 9998;
                border: 1.5px solid #00ff88; opacity: 0;
                transition: opacity 0.25s;
                box-shadow: 0 0 14px rgba(0,255,136,0.25);
            }
            #yolo-bbox-overlay.active { opacity: 1; }
            #yolo-label {
                position: absolute; top: -26px; left: -1px;
                background: #00ff88; color: #0a0a0f;
                font-family: 'Rajdhani',monospace; font-size: 11px;
                font-weight: 700; padding: 2px 10px;
                white-space: nowrap; letter-spacing: 0.05em;
            }
            .yolo-c { position:absolute; width:14px; height:14px; border-color:#00ff88; border-style:solid; border-width:0; }
            .yolo-c.tl{top:-1px;left:-1px;border-top-width:3px;border-left-width:3px}
            .yolo-c.tr{top:-1px;right:-1px;border-top-width:3px;border-right-width:3px}
            .yolo-c.bl{bottom:-1px;left:-1px;border-bottom-width:3px;border-left-width:3px}
            .yolo-c.br{bottom:-1px;right:-1px;border-bottom-width:3px;border-right-width:3px}
        `;
        document.head.appendChild(style);

        const bboxEl = document.createElement('div');
        bboxEl.id = 'yolo-bbox-overlay';
        bboxEl.innerHTML = `
            <div id="yolo-label"></div>
            <span class="yolo-c tl"></span><span class="yolo-c tr"></span>
            <span class="yolo-c bl"></span><span class="yolo-c br"></span>
        `;
        document.body.appendChild(bboxEl);
        const labelEl = document.getElementById('yolo-label');

        const targets = [
            { sel: '.project-card', getLabel: el => {
                const t = el.querySelector('h3');
                return `PROYECTO — ${(t ? t.textContent.trim().slice(0,20) : 'ROBOT').toUpperCase()} • 99.2% conf`;
            }},
            { sel: '.skill-category', getLabel: el => {
                const t = el.querySelector('h3');
                return `SKILL_CLUSTER — ${(t ? t.textContent.trim() : 'SKILLS').toUpperCase()} • 97.8% conf`;
            }},
            { sel: '.timeline-item',   getLabel: () => 'EXP_PROFESIONAL — VERIFIED • 98.5% conf' },
            { sel: '.education-card',  getLabel: () => 'FORMACION — COPNIA_LICENSED • 99.9% conf' },
            { sel: '.contact-card',    getLabel: () => 'CONTACTO — DISPONIBLE • 100% conf' },
            { sel: '.about-content',   getLabel: () => 'PERFIL — Ing. Mecatrónico • 99.1% conf' },
        ];

        let currentEl = null;

        function positionBbox(el) {
            const r = el.getBoundingClientRect();
            bboxEl.style.cssText += `left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;`;
        }

        document.addEventListener('mouseover', e => {
            for (const t of targets) {
                const el = e.target.closest(t.sel);
                if (el && el !== currentEl) {
                    currentEl = el;
                    positionBbox(el);
                    labelEl.textContent = t.getLabel(el);
                    bboxEl.classList.add('active');
                    return;
                }
            }
        });

        window.addEventListener('scroll', () => {
            if (currentEl && bboxEl.classList.contains('active')) positionBbox(currentEl);
        });

        document.addEventListener('mouseout', e => {
            for (const t of targets) {
                const el = e.target.closest(t.sel);
                if (el && !el.contains(e.relatedTarget)) {
                    bboxEl.classList.remove('active');
                    currentEl = null;
                    return;
                }
            }
        });
    }


    // ============================================================
    // 5. 3D TILT + SCAN
    // ============================================================
    function initCardEffects() {
        if (isMobile) return;

        const style = document.createElement('style');
        style.textContent = `
            .project-card { transform-style: preserve-3d; will-change: transform; }
            .scan-line {
                position:absolute; top:0; left:0; right:0; height:3px;
                background: linear-gradient(180deg,transparent,rgba(0,255,136,0.55),transparent);
                pointer-events:none; z-index:5; opacity:0;
            }
            .project-card:hover .scan-line {
                opacity:1;
                animation: scanSweep 1.3s ease-in-out forwards;
            }
            @keyframes scanSweep { 0%{transform:translateY(0)} 100%{transform:translateY(var(--ch,400px))} }
            .shimmer-fx {
                position:absolute; inset:0; pointer-events:none; z-index:2;
                opacity:0; transition:opacity 0.3s; border-radius:inherit;
                background: radial-gradient(350px circle at var(--sx,50%) var(--sy,50%),rgba(0,255,136,0.09),transparent 60%);
            }
            .project-card:hover .shimmer-fx { opacity:1; }
        `;
        document.head.appendChild(style);

        document.querySelectorAll('.project-card').forEach(card => {
            const sl = document.createElement('div'); sl.className = 'scan-line'; card.appendChild(sl);
            const sh = document.createElement('div'); sh.className = 'shimmer-fx'; card.appendChild(sh);

            card.addEventListener('mousemove', e => {
                if (parseFloat(getComputedStyle(card).opacity) < 0.5) return;
                const r = card.getBoundingClientRect();
                const x = e.clientX - r.left, y = e.clientY - r.top;
                const rx = ((y - r.height / 2) / (r.height / 2)) * -12;
                const ry = ((x - r.width / 2) / (r.width / 2)) * 12;
                card.style.transition = 'transform 0.08s ease';
                card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.02,1.02,1.02)`;
                card.style.setProperty('--ch', r.height + 'px');
                card.style.setProperty('--sx', x + 'px');
                card.style.setProperty('--sy', y + 'px');
            });

            card.addEventListener('mouseleave', () => {
                card.style.transition = 'transform 0.5s cubic-bezier(0.03,0.98,0.52,0.99)';
                card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
            });
        });
    }


    // ============================================================
    // 6. TERMINAL COUNTERS
    // ============================================================
    function initTerminalCounters() {
        const stats = document.querySelectorAll('.stat-number');
        if (!stats.length) return;

        const style = document.createElement('style');
        style.textContent = `
            .stat-cursor {
                display:inline-block; width:2px; height:0.85em;
                background:#00ff88; margin-left:2px; vertical-align:middle;
                animation: termBlink 0.7s step-end infinite;
            }
            @keyframes termBlink { 0%,100%{opacity:1} 50%{opacity:0} }
        `;
        document.head.appendChild(style);

        let animated = false;
        function animateCounters() {
            if (animated) return;
            animated = true;
            stats.forEach(stat => {
                let target = parseInt(stat.getAttribute('data-count'));
                if (isNaN(target)) target = parseInt(stat.textContent.replace(/\D/g, '')) || 0;
                const prefix = stat.getAttribute('data-prefix') || '';
                const suffix = stat.getAttribute('data-suffix') || '';
                const duration = 2000;
                const start = performance.now();
                const cursor = document.createElement('span');
                cursor.className = 'stat-cursor';

                function update(now) {
                    const p = Math.min((now - start) / duration, 1);
                    const eased = 1 - Math.pow(1 - p, 3);
                    stat.textContent = prefix + Math.round(target * eased) + suffix;
                    stat.appendChild(cursor);
                    if (p < 1) requestAnimationFrame(update);
                }
                requestAnimationFrame(update);
            });
        }

        const heroStats = document.querySelector('.hero-stats, .hero, #hero');
        if (heroStats) {
            new IntersectionObserver((entries, obs) => {
                if (entries[0].isIntersecting) { setTimeout(animateCounters, 600); obs.disconnect(); }
            }, { threshold: 0.1 }).observe(heroStats);
        }
    }


    // ============================================================
    // INIT
    // ============================================================
    function init() {
        initNetworkCanvas();
        initHeroParticles();
        initCrosshairCursor();
        initYoloBbox();
        initCardEffects();
        initTerminalCounters();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
