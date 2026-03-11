import re

file_path = r"d:\oct 2025\PycharmProjects\CV hoja de vida\Portafolio ing CESAR RAMIREZ\cexartattoo\kuka SVG\kuka_robot.svg"

with open(file_path, "r", encoding="utf-8") as f:
    text = f.read()

# 1. We replace CAPA 3 entirely
capa3_start = text.find("<!-- ══════════════════════════════════════════════\n       CAPA 3")
assert capa3_start != -1

# Find the end of CAPA 3 (which is right before CAPA 4)
capa4_start = text.find("<!-- ══════════════════════════════════════════════\n       CAPA 4 — 3 MOTORES NEMA")
assert capa4_start != -1

new_capa3 = """<!-- ══════════════════════════════════════════════
       CAPA 3 — TORSO DIAGONAL (MOTOR CENTRAL Y OREJA)
       ══════════════════════════════════════════════ -->

  <!-- BASE recta / trapezoidal que encaja sobre el cilindro negro -->
  <!-- Ensanchada para sobresalir hasta la esquina de la oreja (aprox x=280) -->
  <rect x="66" y="356" width="224" height="6" rx="2" fill="#9e3000" filter="url(#sh)"/>
  <rect x="68" y="354" width="220" height="4" fill="#fc7422"/>
  
  <!-- Pernos de la base -->
  <circle cx="85"  cy="358" r="2.5" fill="#444" stroke="#888" stroke-width="0.5"/>
  <circle cx="178" cy="358" r="2.5" fill="#444" stroke="#888" stroke-width="0.5"/>
  <circle cx="271" cy="358" r="2.5" fill="#444" stroke="#888" stroke-width="0.5"/>

  <!-- "OREJA" - Conecta con el cuerpo tangente y soporta el gran eje del hombro -->
  <g id="oreja_posterior" filter="url(#sh)">
    <!-- Envuelve el hombro (268,247, r=45). 
         La base derecha de la oreja termina EXACTAMENTE en x=290, y=356 para clavarse en la base. -->
    <path d="M 215,356 
             L 290,356 
             C 310,356 325,300 325,247
             C 325,205 300,195 268,195
             C 240,195 210,215 205,265
             Z" 
          fill="#9e3000"/>
          
    <path d="M 210,356 
             L 282,356 
             C 300,356 318,300 318,247
             C 318,210 295,200 268,200
             C 245,200 215,220 210,270
             Z" 
          fill="#c44000"/>

    <path d="M 205,356 
             L 274,356 
             C 290,356 310,300 310,247
             C 310,215 292,205 268,205
             C 250,205 220,225 215,275
             Z" 
          fill="url(#ogDR)"/>
  </g>

  <!-- MOTOR INTERNO CENTRAL -->
  <g id="motor_interno" filter="url(#sh)">
    <rect x="147" y="240" width="62" height="116" rx="3" fill="#141414"/>
    <rect x="149" y="242" width="58" height="112" rx="2" fill="#0e0e0e"/>
    <!-- Highlight especular sobre cilindro del motor -->
    <rect x="149" y="242" width="10" height="112" fill="#2c2c2c" opacity="0.7"/>
    <line x1="154" y1="242" x2="154" y2="354" stroke="#4a4a4a" stroke-width="1"/>
    <!-- Ranuras horizontales del bloque central (más compactas) -->
    <rect x="149" y="260" width="58" height="3.5" fill="#080808"/>
    <rect x="149" y="280" width="58" height="3.5" fill="#080808"/>
    <rect x="149" y="300" width="58" height="3.5" fill="#080808"/>
    <rect x="149" y="320" width="58" height="3.5" fill="#080808"/>
  </g>

  <!-- CONECTORES QUE SOBRESALEN DEL MOTOR POR LA IZQUIERDA -->
  <g id="conectores_motor" filter="url(#shS)">
    <rect x="126" y="255" width="22" height="20" rx="2" fill="#181818"/>
    <rect x="118" y="258" width="8" height="5" fill="#0b0b0b" rx="1"/>
    <rect x="118" y="267" width="8" height="5" fill="#0b0b0b" rx="1"/>
    <rect x="132" y="292" width="16" height="16" rx="2" fill="#181818"/>
    <rect x="124" y="297" width="8" height="5" fill="#0b0b0b" rx="1"/>
  </g>

  <!-- CUERPO PRINCIPAL — Perfil frontal redondeado (continuidad oreja-base) -->
  <!-- Ancho reducido para no tapar el motor, borde tangencial a la oreja -->
  <!-- D=102 a 210, curva suave cóncava superior -->
  <path d="M 102,356 L 210,356 C 210,310 215,290 220,270 C 190,295 140,320 102,320 Z" fill="#b03600" filter="url(#sh)"/>
  <path d="M 102,356 L 205,356 C 205,310 210,295 215,275 C 190,295 140,320 102,320 Z" fill="url(#ogH)" opacity="0.8"/>
  
  <!-- Highlight vertical izquierdo -->
  <path d="M 102,356 L 112,356 C 112,340 110,325 102,320 Z" fill="#ff7e28" opacity="0.25"/>
  
  <!-- Borde superior curvo, tangente a la curva de la oreja en Y=270 -->
  <path d="M 102,320 C 140,320 190,295 220,270" stroke="#ff7010" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M 102,322 C 140,322 190,297 218,272" stroke="#7a2800" stroke-width="1.5" fill="none" stroke-linecap="round"/>

  <!-- CABLES / MANGUERAS NATURALES Y CURVAS -->
  <!-- Bucle colgante, subiendo por la oreja tangencial -->
  <g>
    <path d="M 118,260 C 50,260 50,360 140,350 C 200,340 230,310 260,245"
          stroke="#0e0e0e" stroke-width="10" fill="none" stroke-linecap="round" filter="url(#shS)"/>
    <path d="M 118,260 C 50,260 50,360 140,350 C 200,340 230,310 260,245"
          stroke="#1a1a1a" stroke-width="4" fill="none" stroke-linecap="round"/>
          
    <path d="M 124,300 C 70,300 85,340 145,335 C 190,330 220,300 250,240"
          stroke="#121212" stroke-width="6.5" fill="none" stroke-linecap="round"/>
    <path d="M 124,300 C 70,300 85,340 145,335 C 190,330 220,300 250,240"
          stroke="#1c1c1c" stroke-width="2" fill="none" stroke-linecap="round"/>
          
    <path d="M 118,270 C 65,270 65,350 148,342 C 210,335 240,300 270,235"
          stroke="#2a2a2a" stroke-width="3.5" fill="none" stroke-linecap="round"/>
  </g>

  <!-- Abrazaderas de cables -->
  <rect x="145" y="338" width="22" height="7" rx="2" fill="#666" transform="rotate(-15, 156, 341)"/>
  <rect x="220" y="302" width="26" height="9" rx="2" fill="#666" transform="rotate(-40, 233, 306)"/>
  <rect x="222" y="304" width="22" height="5" rx="1" fill="#888" transform="rotate(-40, 233, 306)"/>

  <!-- OREJA / HUB DEL HOMBRO (GIGANTE r=45) -->
  <g filter="url(#sh)">
    <!-- Disco gris envolvente (círculo principal del hombro, mitad cubierta por oreja) -->
    <circle cx="268" cy="247" r="45" fill="#3c3c3c" stroke="#555" stroke-width="2"/>
    <circle cx="268" cy="247" r="34" fill="#2a2a2a"/>
    <circle cx="268" cy="247" r="18" fill="#1a1a1a" stroke="#444" stroke-width="1.5"/>
    
    <!-- Tornillos perimetrales del disco -->
    <circle cx="232" cy="211" r="4" fill="#b0b0b0" stroke="#777" stroke-width="1"/>
    <circle cx="304" cy="211" r="4" fill="#b0b0b0" stroke="#777" stroke-width="1"/>
    <circle cx="232" cy="283" r="4" fill="#b0b0b0" stroke="#777" stroke-width="1"/>
    <circle cx="304" cy="283" r="4" fill="#b0b0b0" stroke="#777" stroke-width="1"/>
    <circle cx="221" cy="247" r="4" fill="#b0b0b0" stroke="#777" stroke-width="1"/>
    <circle cx="315" cy="247" r="4" fill="#b0b0b0" stroke="#777" stroke-width="1"/>
  </g>

  """

# 2. We comment out the rest until labels
etiq_start = text.find("<!-- ══════════════════════════════════════════════\n       ETIQUETAS")
assert etiq_start != -1

portion_to_comment = text[capa4_start:etiq_start]

# We must replace nested comments `<!--` and `-->` with empty or safe strings inside this portion
safe_portion = portion_to_comment.replace("<!--", "<!~~").replace("-->", "~~>")

commented_out = f"\\n<!-- START HIDDEN COMPONENTS PARA ENFOCARSE EN EL TORSO\\n\\n{safe_portion}\\n\\nEND HIDDEN COMPONENTS -->\\n"

new_text = text[:capa3_start] + new_capa3 + commented_out + text[etiq_start:]

with open(file_path, "w", encoding="utf-8") as f:
    f.write(new_text)
    
print("Successfully replaced and commented!")
