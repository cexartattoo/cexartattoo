<svg width="600" height="400" viewBox="-100 -200 600 400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Gradients -->
    <linearGradient id="ogV" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ff6000"/>
      <stop offset="50%" stop-color="#dd4000"/>
      <stop offset="100%" stop-color="#992000"/>
    </linearGradient>
    <filter id="sh" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="2" dy="5" stdDeviation="4" flood-color="#000" flood-opacity="0.4"/>
    </filter>
  </defs>

  <rect x="-100" y="-200" width="100%" height="100%" fill="#fff"/>

  <!-- GUIDELINES -->
  <g stroke="#2db84c" stroke-width="1" fill="none" opacity="0.5" stroke-dasharray="5,5">
    <!-- Centro X axis -->
    <line x1="-100" y1="0" x2="400" y2="0"/>
    <!-- Shoulder Center -->
    <line x1="0" y1="-100" x2="0" y2="100"/>
    <!-- Elbow Center -->
    <line x1="244" y1="-100" x2="244" y2="100"/>
    <circle cx="0" cy="0" r="45"/>
    <circle cx="244" cy="0" r="38"/>
  </g>

  <!-- ESLABON 1 HORIZONTAL (Construido desde X=0 hasta X=244) -->
  <g filter="url(#sh)">
    
    <!-- Base Sombra -->
    <!-- Controles de la curva tiran hacia Y=0 para hacer la 'cintura' (lipo) -->
    <path d="M 0,-50 
             C 80,-25 160,-20 244,-40
             A 38 38 0 0 1 244,42
             C 160,25 80,30 0,52
             A 45 45 0 0 1 0,-50 Z" fill="#782400" opacity="0.53" transform="translate(2, 6)"/>
             
    <!-- Cuerpo Principal Naranja -->
    <path d="M 0,-45 
             C 80,-20 160,-15 244,-38
             A 38 38 0 0 1 244,38
             C 160,15 80,20 0,45
             A 45 45 0 0 1 0,-45 Z" fill="url(#ogV)"/>
             
    <!-- Luz superior (Brillo para volumen) -->
    <path d="M 0,-45 
             C 80,-20 160,-15 244,-38
             L 244,-33
             C 160,-10 80,-15 0,-40 Z" fill="#ff7010" opacity="0.4"/>

    <!-- Sombra inferior interna -->
    <path d="M 244,38 
             C 160,15 80,20 0,45
             L 0,35
             C 80,10 160,5 244,30 Z" fill="#782400" opacity="0.6"/>

    <!-- HUB DEL HOMBRO (Izquierda, r=45) -->
    <g>
      <circle cx="0" cy="0" r="45" fill="#3c3c3c" stroke="#555" stroke-width="2"/>
      <circle cx="0" cy="0" r="34" fill="#2a2a2a"/>
      <circle cx="0" cy="0" r="18" fill="#1a1a1a" stroke="#444" stroke-width="1.5"/>
      <!-- Tornillos -->
      <circle cx="0" cy="-35" r="3" fill="#a0a0a0" stroke="#707070" stroke-width="0.8"/>
      <circle cx="25" cy="-25" r="3" fill="#a0a0a0" stroke="#707070" stroke-width="0.8"/>
      <circle cx="35" cy="0" r="3" fill="#a0a0a0" stroke="#707070" stroke-width="0.8"/>
      <circle cx="25" cy="25" r="3" fill="#a0a0a0" stroke="#707070" stroke-width="0.8"/>
      <circle cx="0" cy="35" r="3" fill="#a0a0a0" stroke="#707070" stroke-width="0.8"/>
      <circle cx="-25" cy="25" r="3" fill="#a0a0a0" stroke="#707070" stroke-width="0.8"/>
      <circle cx="-35" cy="0" r="3" fill="#a0a0a0" stroke="#707070" stroke-width="0.8"/>
      <circle cx="-25" cy="-25" r="3" fill="#a0a0a0" stroke="#707070" stroke-width="0.8"/>
    </g>

    <!-- HUB DEL CODO (Derecha, r=38) -->
    <g transform="translate(244, 0)">
      <circle cx="0" cy="0" r="38" fill="#3c3c3c" stroke="#555" stroke-width="2"/>
      <circle cx="0" cy="0" r="30" fill="#2a2a2a"/>
      <circle cx="0" cy="0" r="14" fill="#1a1a1a" stroke="#444" stroke-width="1.5"/>
      <!-- Tornillos -->
      <circle cx="0" cy="-30" r="2.5" fill="#a0a0a0" stroke="#707070" stroke-width="0.8"/>
      <circle cx="21" cy="-21" r="2.5" fill="#a0a0a0" stroke="#707070" stroke-width="0.8"/>
      <circle cx="30" cy="0" r="2.5" fill="#a0a0a0" stroke="#707070" stroke-width="0.8"/>
      <circle cx="21" cy="21" r="2.5" fill="#a0a0a0" stroke="#707070" stroke-width="0.8"/>
      <circle cx="0" cy="30" r="2.5" fill="#a0a0a0" stroke="#707070" stroke-width="0.8"/>
      <circle cx="-21" cy="21" r="2.5" fill="#a0a0a0" stroke="#707070" stroke-width="0.8"/>
      <circle cx="-30" cy="0" r="2.5" fill="#a0a0a0" stroke="#707070" stroke-width="0.8"/>
      <circle cx="-21" cy="-21" r="2.5" fill="#a0a0a0" stroke="#707070" stroke-width="0.8"/>
    </g>

    <!-- HUECOS (RECESOS) PARA CABLES -->
    <!-- Hueco inferior (Cerca al hombro) -->
    <g transform="translate(60, 20) rotate(-10)">
      <ellipse cx="0" cy="0" rx="40" ry="12" fill="#581902"/>
      <ellipse cx="0" cy="0" rx="36" ry="9" fill="#3d1001"/>
      <ellipse cx="0" cy="0" rx="30" ry="6" fill="#240901"/>
      <path d="M -30,0 A 30 6 0 0 1 30,0 A 25 3 0 0 0 -30,0 Z" fill="#000" opacity="0.6"/>
    </g>

    <!-- Hueco superior (Cerca al codo) -->
    <g transform="translate(180, -15) rotate(10)">
      <ellipse cx="0" cy="0" rx="35" ry="10" fill="#581902"/>
      <ellipse cx="0" cy="0" rx="31" ry="7" fill="#3d1001"/>
      <ellipse cx="0" cy="0" rx="25" ry="4" fill="#240901"/>
      <path d="M -25,0 A 25 4 0 0 1 25,0 A 20 2 0 0 0 -25,0 Z" fill="#000" opacity="0.6"/>
    </g>

    <!-- CABLES QUE SALEN DE LOS HUECOS (Simulación local) -->
    <path d="M 60,20 C 120,-30 140,50 180,-15" stroke="#121212" stroke-width="8" fill="none" stroke-linecap="round"/>
    <path d="M 60,20 C 120,-30 140,50 180,-15" stroke="#222" stroke-width="4" fill="none" stroke-linecap="round"/>
    <!-- Abrazaderas de cables -->
    <rect x="110" y="5" width="20" height="12" rx="2" fill="#444" transform="rotate(-30, 120, 11)"/>
    <rect x="112" y="8" width="16" height="6" rx="1" fill="#777" transform="rotate(-30, 120, 11)"/>

    <!-- ETIQUETA KUKA CENTRAL -->
    <g transform="translate(122, 0)">
      <rect x="-35" y="-12" width="70" height="24" rx="3" fill="#111" stroke="#222" stroke-width="1"/>
      <text x="0" y="5" font-family="Arial Black, Impact, sans-serif" font-size="16" font-weight="900" fill="#ff7010" text-anchor="middle" letter-spacing="2">KUKA</text>
    </g>
    
  </g>
</svg>
