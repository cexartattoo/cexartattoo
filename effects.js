/* ============================================
   CÉSAR RAMÍREZ - ADVANCED VISUAL EFFECTS
   Mechatronic Network Canvas, Crosshair Cursor,
   3D Card Tilt, Terminal Counters
   ============================================ */

(function () {
    'use strict';

    const isMobile = window.innerWidth < 768 || ('ontouchstart' in window);
    const mouse = { x: -9999, y: -9999 };

    document.addEventListener('mousemove', e => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    // ============================================================
    // 1. MECHATRONIC NETWORK CANVAS BACKGROUND
    // ============================================================
    function initNetworkCanvas() {
        if (isMobile) return;

        const canvas = document.createElement('canvas');
        canvas.id = 'network-canvas';
        canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:-1;pointer-events:none;';
        document.body.prepend(canvas);

        const ctx = canvas.getContext('2d');
        let W, H;

        function resize() {
            W = canvas.width = window.innerWidth;
            H = canvas.height = window.innerHeight;
        }
        resize();
        window.addEventListener('resize', resize);

        // Nodes
        const NODE_COUNT = 60;
        const CONNECTION_DIST = 200;
        const MOUSE_RADIUS = 180;
        const nodes = [];

        const icons = ['⚙', '▣', '◈', '⬡', '⏣', '△', '◉', '⊞'];

        for (let i = 0; i < NODE_COUNT; i++) {
            nodes.push({
                x: Math.random() * W,
                y: Math.random() * H,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                baseX: 0,
                baseY: 0,
                radius: Math.random() * 3 + 2,
                icon: icons[Math.floor(Math.random() * icons.length)],
                color: Math.random() > 0.5 ? '#00ff88' : '#0088ff'
            });
            nodes[i].baseX = nodes[i].x;
            nodes[i].baseY = nodes[i].y;
        }

        // Traveling data points
        const dataPoints = [];
        const MAX_DATA_POINTS = 15;

        function spawnDataPoint(x1, y1, x2, y2) {
            if (dataPoints.length >= MAX_DATA_POINTS) return;
            dataPoints.push({
                x: x1, y: y1,
                tx: x2, ty: y2,
                progress: 0,
                speed: 0.008 + Math.random() * 0.012,
                color: Math.random() > 0.5 ? '#00ff88' : '#0088ff'
            });
        }

        let spawnTimer = 0;

        function animate() {
            ctx.clearRect(0, 0, W, H);

            // Update nodes
            for (const n of nodes) {
                n.x += n.vx;
                n.y += n.vy;

                // Wrap around
                if (n.x < -20) n.x = W + 20;
                if (n.x > W + 20) n.x = -20;
                if (n.y < -20) n.y = H + 20;
                if (n.y > H + 20) n.y = -20;

                // Mouse attraction
                const dx = mouse.x - n.x;
                const dy = mouse.y - n.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < MOUSE_RADIUS && dist > 0) {
                    const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS * 0.02;
                    n.x += dx * force;
                    n.y += dy * force;
                }
            }

            // Draw connections
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const dx = nodes[i].x - nodes[j].x;
                    const dy = nodes[i].y - nodes[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < CONNECTION_DIST) {
                        const alpha = (1 - dist / CONNECTION_DIST) * 0.25;
                        ctx.strokeStyle = `rgba(0, 255, 136, ${alpha})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(nodes[i].x, nodes[i].y);
                        ctx.lineTo(nodes[j].x, nodes[j].y);
                        ctx.stroke();

                        // Occasional data point spawn
                        spawnTimer++;
                        if (spawnTimer > 120 && Math.random() < 0.01) {
                            spawnDataPoint(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
                            spawnTimer = 0;
                        }
                    }
                }
            }

            // Draw data points
            for (let i = dataPoints.length - 1; i >= 0; i--) {
                const dp = dataPoints[i];
                dp.progress += dp.speed;

                if (dp.progress >= 1) {
                    dataPoints.splice(i, 1);
                    continue;
                }

                dp.x = dp.x + (dp.tx - dp.x) * dp.progress;
                dp.y = dp.y + (dp.ty - dp.y) * dp.progress;

                // Draw glow
                ctx.beginPath();
                ctx.arc(dp.x, dp.y, 4, 0, Math.PI * 2);
                ctx.fillStyle = dp.color;
                ctx.shadowColor = dp.color;
                ctx.shadowBlur = 12;
                ctx.fill();
                ctx.shadowBlur = 0;
            }

            // Draw nodes
            for (const n of nodes) {
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
                ctx.fillStyle = n.color;
                ctx.shadowColor = n.color;
                ctx.shadowBlur = 8;
                ctx.fill();
                ctx.shadowBlur = 0;

                // Draw icon near larger nodes
                if (n.radius > 3.5) {
                    ctx.font = '10px monospace';
                    ctx.fillStyle = `rgba(0, 255, 136, 0.4)`;
                    ctx.fillText(n.icon, n.x + 6, n.y - 6);
                }
            }

            requestAnimationFrame(animate);
        }

        animate();
    }


    // ============================================================
    // 2. CROSSHAIR CURSOR (Vision Artificial style)
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
                position: fixed;
                pointer-events: none;
                z-index: 99999;
                transform: translate(-50%, -50%);
                transition: opacity 0.2s;
            }
            .ch-ring {
                width: 36px; height: 36px;
                border: 1.5px solid #00ff88;
                border-radius: 50%;
                position: absolute;
                top: 50%; left: 50%;
                transform: translate(-50%, -50%);
                opacity: 0.8;
            }
            .ch-line {
                position: absolute;
                background: rgba(0,255,136,0.5);
            }
            .ch-h {
                width: 18px; height: 1px;
                top: 50%; left: 50%;
                transform: translate(22px, -0.5px);
            }
            .ch-v {
                width: 1px; height: 18px;
                top: 50%; left: 50%;
                transform: translate(-0.5px, 22px);
            }
            .ch-coords {
                position: absolute;
                top: 50%; left: 50%;
                transform: translate(28px, 8px);
                font-family: 'Rajdhani', monospace;
                font-size: 10px;
                color: #00ff88;
                white-space: nowrap;
                opacity: 0.7;
            }
            /* Bounding box on project cards */
            .project-card { position: relative; }
            .yolo-bbox {
                position: absolute;
                inset: 0;
                border: 1.5px solid #00ff88;
                pointer-events: none;
                z-index: 10;
                opacity: 0;
                transition: opacity 0.3s;
            }
            .yolo-bbox.active { opacity: 1; }
            .yolo-label {
                position: absolute;
                top: -24px; left: 0;
                background: #00ff88;
                color: #0a0a0f;
                font-family: 'Rajdhani', monospace;
                font-size: 11px;
                font-weight: 700;
                padding: 2px 8px;
                white-space: nowrap;
            }
            .yolo-corner {
                position: absolute;
                width: 12px; height: 12px;
                border-color: #00ff88;
                border-style: solid;
                border-width: 0;
            }
            .yolo-corner.tl { top:0;left:0; border-top-width:2px; border-left-width:2px; }
            .yolo-corner.tr { top:0;right:0; border-top-width:2px; border-right-width:2px; }
            .yolo-corner.bl { bottom:0;left:0; border-bottom-width:2px; border-left-width:2px; }
            .yolo-corner.br { bottom:0;right:0; border-bottom-width:2px; border-right-width:2px; }
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

        // Add YOLO bounding boxes to project cards
        const projectCards = document.querySelectorAll('.project-card');
        const projectNames = ['ROBOT_TAT_360', 'DELTA_ROBOT', 'CNC_ROUTER'];
        const confidences = ['99.2', '97.8', '95.1'];

        projectCards.forEach((card, i) => {
            const bbox = document.createElement('div');
            bbox.className = 'yolo-bbox';
            bbox.innerHTML = `
                <span class="yolo-label">${projectNames[i] || 'PROJECT'} — ${confidences[i] || '98.0'}% conf</span>
                <span class="yolo-corner tl"></span>
                <span class="yolo-corner tr"></span>
                <span class="yolo-corner bl"></span>
                <span class="yolo-corner br"></span>
            `;
            card.appendChild(bbox);

            card.addEventListener('mouseenter', () => bbox.classList.add('active'));
            card.addEventListener('mouseleave', () => bbox.classList.remove('active'));
        });
    }


    // ============================================================
    // 3. 3D TILT + SCAN EFFECT on Project Cards
    // ============================================================
    function initCardEffects() {
        if (isMobile) return;

        const style = document.createElement('style');
        style.textContent = `
            .project-card {
                transform-style: preserve-3d;
                transition: transform 0.4s cubic-bezier(0.03, 0.98, 0.52, 0.99), box-shadow 0.4s ease;
            }
            .project-card .scan-line {
                position: absolute;
                top: 0; left: 0; right: 0;
                height: 4px;
                background: linear-gradient(180deg, transparent, rgba(0,255,136,0.4), transparent);
                pointer-events: none;
                z-index: 5;
                opacity: 0;
                transform: translateY(0);
            }
            .project-card:hover .scan-line {
                opacity: 1;
                animation: scanSweep 1.2s ease-in-out infinite;
            }
            @keyframes scanSweep {
                0% { transform: translateY(0); }
                100% { transform: translateY(var(--card-height, 400px)); }
            }
            .project-card .shimmer {
                position: absolute;
                inset: 0;
                pointer-events: none;
                z-index: 2;
                opacity: 0;
                transition: opacity 0.3s;
                background: radial-gradient(
                    400px circle at var(--shimmer-x, 50%) var(--shimmer-y, 50%),
                    rgba(0,255,136,0.07),
                    transparent 60%
                );
            }
            .project-card:hover .shimmer { opacity: 1; }
        `;
        document.head.appendChild(style);

        const cards = document.querySelectorAll('.project-card');

        cards.forEach(card => {
            // Add scan line
            const scanLine = document.createElement('div');
            scanLine.className = 'scan-line';
            card.appendChild(scanLine);

            // Add shimmer
            const shimmer = document.createElement('div');
            shimmer.className = 'shimmer';
            card.appendChild(shimmer);

            card.addEventListener('mousemove', e => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = ((y - centerY) / centerY) * -10;
                const rotateY = ((x - centerX) / centerX) * 10;

                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02,1.02,1.02)`;
                card.style.setProperty('--card-height', rect.height + 'px');
                card.style.setProperty('--shimmer-x', x + 'px');
                card.style.setProperty('--shimmer-y', y + 'px');
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1,1,1)';
            });
        });
    }


    // ============================================================
    // 4. TERMINAL-STYLE STAT COUNTERS
    // ============================================================
    function initTerminalCounters() {
        // This replaces the existing counter logic in script.js
        const statNumbers = document.querySelectorAll('.stat-number');
        if (!statNumbers.length) return;

        let animated = false;

        const style = document.createElement('style');
        style.textContent = `
            .stat-cursor {
                display: inline-block;
                width: 2px;
                height: 1em;
                background: #00ff88;
                margin-left: 3px;
                vertical-align: text-bottom;
                animation: termBlink 0.7s step-end infinite;
            }
            @keyframes termBlink {
                0%, 100% { opacity: 1; }
                50% { opacity: 0; }
            }
            .stat-typed {
                display: inline;
                font-family: 'Orbitron', monospace;
                color: #00ff88;
            }
        `;
        document.head.appendChild(style);

        function animateCounters() {
            if (animated) return;
            animated = true;

            statNumbers.forEach(stat => {
                const target = parseInt(stat.getAttribute('data-count'));
                const duration = 2000;
                const start = performance.now();

                // Add cursor
                let cursor = stat.parentElement.querySelector('.stat-cursor');
                if (!cursor) {
                    cursor = document.createElement('span');
                    cursor.className = 'stat-cursor';
                    stat.parentElement.appendChild(cursor);
                }

                function update(now) {
                    const elapsed = now - start;
                    const progress = Math.min(elapsed / duration, 1);
                    // Ease out cubic
                    const eased = 1 - Math.pow(1 - progress, 3);
                    stat.textContent = Math.round(target * eased);

                    if (progress < 1) {
                        requestAnimationFrame(update);
                    } else {
                        stat.textContent = target;
                        // Type suffix if present
                        const suffixEl = stat.parentElement.querySelector('.stat-plus, .stat-unit');
                        if (suffixEl) {
                            const text = suffixEl.textContent;
                            suffixEl.textContent = '';
                            let ci = 0;
                            function typeSuffix() {
                                if (ci < text.length) {
                                    suffixEl.textContent += text.charAt(ci);
                                    ci++;
                                    setTimeout(typeSuffix, 100);
                                }
                            }
                            setTimeout(typeSuffix, 200);
                        }
                    }
                }

                requestAnimationFrame(update);
            });
        }

        // Observe hero stats
        const heroStats = document.querySelector('.hero-stats');
        if (heroStats) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animateCounters();
                        observer.disconnect();
                    }
                });
            }, { threshold: 0.2 });
            observer.observe(heroStats);
        }
    }


    // ============================================================
    // INIT ALL EFFECTS
    // ============================================================
    document.addEventListener('DOMContentLoaded', () => {
        initNetworkCanvas();
        initCrosshairCursor();
        initCardEffects();
        initTerminalCounters();
    });

})();
