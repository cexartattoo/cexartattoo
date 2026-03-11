<svg width="650" height="600" viewBox="0 0 650 600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Gradients -->
    <linearGradient id="ogV" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ff6000"/>
      <stop offset="50%" stop-color="#dd4000"/>
      <stop offset="100%" stop-color="#992000"/>
    </linearGradient>
    <linearGradient id="ogH" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ff7010"/>
      <stop offset="50%" stop-color="#dd4000"/>
      <stop offset="100%" stop-color="#992000"/>
    </linearGradient>
    <linearGradient id="motorG" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#2a2a2a"/>
      <stop offset="20%" stop-color="#111"/>
      <stop offset="100%" stop-color="#000"/>
    </linearGradient>
    <linearGradient id="silverG" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#f0f0f0"/>
      <stop offset="40%" stop-color="#c0c0c0"/>
      <stop offset="100%" stop-color="#707070"/>
    </linearGradient>
    <filter id="sh" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="2" dy="5" stdDeviation="4" flood-color="#000" flood-opacity="0.4"/>
    </filter>
  </defs>

  <rect width="100%" height="100%" fill="#fff"/>

  <!-- GUIDELINES (USER'S GREEN GRID, EXACTLY 86px APART) -->
  <g stroke="#2db84c" stroke-width="4" fill="none" opacity="0.8">
    <line x1="86" y1="180" x2="516" y2="180"/>
    <line x1="86" y1="420" x2="516" y2="420"/>
    <line x1="86" y1="180" x2="86" y2="420"/>
    <line x1="172" y1="180" x2="172" y2="420"/>
    <line x1="258" y1="180" x2="258" y2="420"/>
    <line x1="344" y1="180" x2="344" y2="420"/>
    <line x1="430" y1="180" x2="430" y2="420"/>
    <line x1="516" y1="180" x2="516" y2="420"/>
  </g>

  <!-- MOTORES NEMA TRASEROS (Ahora desplazados hacia ABAJO respecto al centro Y=300) -->
  <g filter="url(#sh)">
    <!-- Backplate union a motores -->
    <!-- El centro de la articulacion es Y=300, pero los motores inician en 280 y bajan hasta 365 -->
    <path d="M 215,265 
             L 165,265 C 150,265 145,268 145,278
             L 145,350 C 145,360 150,365 165,365
             L 215,365
             Z" fill="url(#ogV)"/>
             
    <path d="M 165,265 L 145,278 L 145,350 L 165,365 L 215,365 L 215,355 L 153,355 L 153,275 L 215,275 Z" fill="#782400" opacity="0.6"/>

    <!-- M1 (Top) -->
    <!-- Bajamos el banco entero de Y=260 a Y=272 -->
    <g transform="translate(86, 272)">
      <rect x="0" y="0" width="60" height="24" rx="2" fill="url(#motorG)" stroke="#333" stroke-width="1"/>
      <rect x="60" y="2" width="6" height="20" fill="#181818"/>
      <line x1="12" y1="0" x2="12" y2="24" stroke="#000" stroke-width="2"/>
      <line x1="24" y1="0" x2="24" y2="24" stroke="#000" stroke-width="2"/>
      <line x1="36" y1="0" x2="36" y2="24" stroke="#000" stroke-width="2"/>
      <line x1="48" y1="0" x2="48" y2="24" stroke="#000" stroke-width="2"/>
      <rect x="5" y="8" width="50" height="8" rx="1" fill="#000"/>
      <rect x="10" y="10" width="4" height="4" fill="#fff"/>
    </g>
    <!-- M2 (Middle) -->
    <g transform="translate(86, 302)">
      <rect x="0" y="0" width="60" height="24" rx="2" fill="url(#motorG)" stroke="#333" stroke-width="1"/>
      <rect x="60" y="2" width="6" height="20" fill="#181818"/>
      <line x1="12" y1="0" x2="12" y2="24" stroke="#000" stroke-width="2"/>
      <line x1="24" y1="0" x2="24" y2="24" stroke="#000" stroke-width="2"/>
      <line x1="36" y1="0" x2="36" y2="24" stroke="#000" stroke-width="2"/>
      <line x1="48" y1="0" x2="48" y2="24" stroke="#000" stroke-width="2"/>
      <rect x="5" y="8" width="50" height="8" rx="1" fill="#000"/>
      <rect x="10" y="10" width="4" height="4" fill="#fff"/>
    </g>
    <!-- M3 (Bottom) -->
    <!-- Desplazado ligeramente a la derecha (x=102) como se ve en el robot -->
    <g transform="translate(102, 332)">
      <rect x="0" y="0" width="50" height="24" rx="2" fill="url(#motorG)" stroke="#333" stroke-width="1"/>
      <rect x="50" y="2" width="10" height="20" fill="#181818"/>
      <line x1="12" y1="0" x2="12" y2="24" stroke="#000" stroke-width="2"/>
      <line x1="24" y1="0" x2="24" y2="24" stroke="#000" stroke-width="2"/>
      <line x1="36" y1="0" x2="36" y2="24" stroke="#000" stroke-width="2"/>
      <line x1="48" y1="0" x2="48" y2="24" stroke="#000" stroke-width="2"/>
      <rect x="5" y="8" width="40" height="8" rx="1" fill="#000"/>
      <rect x="10" y="10" width="4" height="4" fill="#fff"/>
    </g>
  </g>

  <!-- CUERPO ESLABÓN 2 (BRAZO) Y ARTICULACIÓN CODO -->
  <g filter="url(#sh)">
    <!-- Perfil Orgánico Completo: Panzón atrás, estrecho en medio -->
    <!-- El centro disminuye (afina) en vez de ser recio -->
    <path d="M 215,257
             C 250,257 265,280 344,280
             L 344,320
             C 265,320 250,343 215,343
             A 43 43 0 0 1 215,257
             Z" fill="url(#ogV)"/>
             
    <!-- Luz superior cóncava - afinando el medio -->
    <path d="M 215,257 C 250,257 265,280 344,280 L 344,285 C 265,285 250,266 215,266 Z" fill="#ff7010" opacity="0.4"/>
    
    <!-- Sombra inferior -->
    <path d="M 344,312 L 344,320 C 265,320 250,343 215,343 C 250,343 265,312 344,312 Z" fill="#782400" opacity="0.6"/>

    <!-- Nervadura central también sigue el afinamiento -->
    <path d="M 270,300 L 335,300" stroke="#a83000" stroke-width="4.5" fill="none" opacity="0.5"/>
    <path d="M 270,306 L 335,306" stroke="#a83000" stroke-width="2" fill="none" opacity="0.5"/>

    <!-- ARTICULACIÓN BASE JOINT (CODO - Radio exterior = 43) -->
    <circle cx="215" cy="300" r="43" fill="#c44000"/>
    <circle cx="215" cy="300" r="41" fill="url(#ogH)" opacity="0.8"/>

    <!-- Tornillos periféricos del Codo -->
    <g transform="translate(215, 300)">
      <circle cx="36" cy="0" r="2.5" fill="#e0e0e0" stroke="#777"/>
      <circle cx="31.2" cy="18" r="2.5" fill="#e0e0e0" stroke="#777"/>
      <circle cx="18" cy="31.2" r="2.5" fill="#e0e0e0" stroke="#777"/>
      <circle cx="0" cy="36" r="2.5" fill="#e0e0e0" stroke="#777"/>
      <circle cx="-18" cy="31.2" r="2.5" fill="#e0e0e0" stroke="#777"/>
      <circle cx="-31.2" cy="18" r="2.5" fill="#e0e0e0" stroke="#777"/>
      <circle cx="-36" cy="0" r="2.5" fill="#e0e0e0" stroke="#777"/>
      <circle cx="-31.2" cy="-18" r="2.5" fill="#e0e0e0" stroke="#777"/>
      <circle cx="-18" cy="-31.2" r="2.5" fill="#e0e0e0" stroke="#777"/>
      <circle cx="0" cy="-36" r="2.5" fill="#e0e0e0" stroke="#777"/>
      <circle cx="18" cy="-31.2" r="2.5" fill="#e0e0e0" stroke="#777"/>
      <circle cx="31.2" cy="-18" r="2.5" fill="#e0e0e0" stroke="#777"/>
    </g>

    <circle cx="215" cy="300" r="28" fill="#a03000" stroke="#802000" stroke-width="1"/>
    <circle cx="215" cy="300" r="28" fill="#000" opacity="0.15"/>
    <circle cx="215" cy="300" r="14" fill="#a03000"/>
    <circle cx="215" cy="300" r="14" fill="#fff" opacity="0.1"/>

    <!-- HUECO DE CABLES GROMMET (Col 3, movido mas al cuello) -->
    <g transform="translate(265, 275) rotate(-10)">
      <ellipse cx="0" cy="0" rx="14" ry="7" fill="none" stroke="#050505" stroke-width="4.5"/>
      <ellipse cx="0" cy="0" rx="12" ry="5" fill="#180400"/>
      <path d="M -12,0 A 12 5 0 0 1 12,0 A 10 3 0 0 0 -12,0 Z" fill="#000" opacity="0.8"/>
    </g>
  </g>

  <!-- ══════════════════════════════════════════════
       MUÑECA (COL 4) y EFECTOR BLANCO (COL 5) Shrinked!
       ══════════════════════════════════════════════ -->
  <g filter="url(#sh)">
    <!-- COL 4 [344 - 430] MUÑECA PLATEADA/GRIS -->
    <!-- Como el brazo principal se achicó a 320, ajustamos estos conectores -->
    <path d="M 344,280 L 365,280 L 365,320 L 344,320 Z" fill="url(#silverG)"/>
    <rect x="344" y="280" width="6" height="40" fill="#ddd"/>
    <rect x="360" y="280" width="5" height="40" fill="#777"/>
    <line x1="352" y1="280" x2="352" y2="320" stroke="#999" stroke-width="1.5"/>

    <!-- Transición trapezoidal -->
    <polygon points="365,280 380,285 380,315 365,320" fill="#a0a0a0"/>
    <polygon points="365,280 380,285 380,295 365,290" fill="#f0f0f0"/>
    <polygon points="365,320 380,315 380,305 365,310" fill="#555"/>

    <rect x="380" y="285" width="6" height="30" fill="#222"/>

    <!-- Silver Cylindrical Final Swivel -->
    <path d="M 386,285 L 430,288 L 430,312 L 386,315 Z" fill="url(#silverG)"/>
    <polygon points="386,285 430,288 430,292 386,289" fill="#eee"/>
    <polygon points="386,315 430,312 430,306 386,309" fill="#666"/>
    <line x1="406" y1="287" x2="406" y2="313" stroke="#999" stroke-width="1.5"/>

    <!-- COL 5 [430 - 516] BULBO BLANCO (END EFFECTOR) -->
    <!-- Anillo negro de acople base -->
    <polygon points="430,288 433,288 433,312 430,312" fill="#111"/>

    <!-- BULBO TEARDROP BLANCO SHRUNK -->
    <!-- Lo encogemos achicando los controles del bezier -->
    <path d="M 433,288 
             C 445,268 460,268 495,294
             L 495,306
             C 460,332 445,332 433,312 Z" fill="url(#silverG)"/>
             
    <!-- Brillo superior central -->
    <path d="M 433,288 
             C 445,268 460,268 495,294
             L 495,298
             C 460,275 445,280 433,295 Z" fill="#fff" opacity="0.8"/>
             
    <!-- Sombra inferior curva -->
    <path d="M 434,312 
             C 445,332 460,332 495,306
             L 495,302 
             C 460,324 445,316 434,304 Z" fill="#444" opacity="0.25"/>
             
    <!-- Logo KUKA lateral de la herramienta final -->
    <!-- Movido más a la izquierda para que quepa en el bulbo chico -->
    <g transform="translate(460, 303)">
      <text x="0" y="0" font-family="Arial Black, Impact, sans-serif" font-size="10" font-weight="900" fill="#111" text-anchor="middle" letter-spacing="1">KUKA</text>
    </g>

    <!-- TRIMMING FINAL (TOOL FLANGE NEGRO) -->
    <rect x="495" y="294" width="4" height="12" fill="#000"/>
    <rect x="499" y="297" width="2" height="6" fill="#444"/>
  </g>
</svg>
