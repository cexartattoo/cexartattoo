import math

file_path = r"d:\oct 2025\PycharmProjects\CV hoja de vida\Portafolio ing CESAR RAMIREZ\cexartattoo\kuka SVG\kuka_robot.svg"

with open(file_path, "r", encoding="utf-8") as f:
    text = f.read()

# Coordinates
cx1, cy1, r1 = 308, 247, 45  # Shoulder
cx2, cy2, r2 = 119, 93, 38   # Elbow

dx = cx2 - cx1
dy = cy2 - cy1
d = math.hypot(dx, dy)
angle = math.atan2(dy, dx)
angle_deg = math.degrees(angle)

alpha = math.asin((r1 - r2) / d) if d != 0 else 0

t1_a = angle - math.pi/2 + alpha
p1x = cx1 + r1 * math.cos(t1_a)
p1y = cy1 + r1 * math.sin(t1_a)
p2x = cx2 + r2 * math.cos(t1_a)
p2y = cy2 + r2 * math.sin(t1_a)

b1_a = angle + math.pi/2 - alpha
p3x = cx2 + r2 * math.cos(b1_a)
p3y = cy2 + r2 * math.sin(b1_a)
p4x = cx1 + r1 * math.cos(b1_a)
p4y = cy1 + r1 * math.sin(b1_a)

mid_x = (cx1 + cx2) / 2
mid_y = (cy1 + cy2) / 2

# Recess centers and dimensions
recess1_cx = cx1 + 8 * math.cos(angle)
recess1_cy = cy1 + 8 * math.sin(angle)
recess2_cx = cx2 - 8 * math.cos(angle)
recess2_cy = cy2 - 8 * math.sin(angle)

svg_eslabon1 = f"""  <!-- ══════════════════════════════════════════════
       CAPA 5a — ESLABÓN 1 (DISEÑO ROBUSTO CON HUECOS)
       hombro({cx1},{cy1}) → codo({cx2},{cy2})
       ══════════════════════════════════════════════ -->
  <g id="eslabon1" filter="url(#sh)">
    <!-- Base Sombra -->
    <path d="M {p1x+2},{p1y+2} L {p2x+2},{p2y+2} A {r2} {r2} 0 0 0 {p3x+2},{p3y+2} L {p4x+2},{p4y+2} A {r1} {r1} 0 0 0 {p1x+2},{p1y+2} Z" fill="#782400" opacity="0.53"/>
    
    <!-- Cuerpo Principal Naranja -->
    <path d="M {p1x},{p1y} L {p2x},{p2y} A {r2} {r2} 0 0 0 {p3x},{p3y} L {p4x},{p4y} A {r1} {r1} 0 0 0 {p1x},{p1y} Z" fill="url(#ogV)"/>
    
    <!-- Brillo superior -->
    <path d="M {p1x},{p1y} L {p2x},{p2y} A {r2} {r2} 0 0 0 {cx2-r2},{cy2} L {cx1-r1},{cy1} A {r1} {r1} 0 0 0 {p1x},{p1y} Z" fill="#ff7010" opacity="0.14"/>

    <!-- Hueco Inferior (Base hombro) -->
    <g transform="translate({recess1_cx}, {recess1_cy}) rotate({angle_deg})">
      <ellipse cx="0" cy="0" rx="22" ry="16" fill="#300d00"/>
      <ellipse cx="-2" cy="0" rx="19" ry="13" fill="#180600"/>
      <ellipse cx="-4" cy="0" rx="16" ry="10" fill="#080200"/>
      <!-- Sombra interior para profundidad -->
      <path d="M 0,-16 A 22 16 0 0 1 0,16 A 14 10 0 0 0 0,-16 Z" fill="#000000" opacity="0.6"/>
    </g>

    <!-- Hueco Superior (Base codo) -->
    <g transform="translate({recess2_cx}, {recess2_cy}) rotate({angle_deg})">
      <ellipse cx="0" cy="0" rx="18" ry="13" fill="#300d00"/>
      <ellipse cx="2" cy="0" rx="15" ry="10" fill="#180600"/>
      <ellipse cx="4" cy="0" rx="12" ry="7" fill="#080200"/>
      <path d="M 0,-13 A 18 13 0 0 0 0,13 A 14 10 0 0 1 0,-13 Z" fill="#000000" opacity="0.6"/>
    </g>

    <!-- Tornillos Estructurales Perimetrales Hombro -->
    <g transform="translate({cx1}, {cy1}) rotate({angle_deg})">
      <circle cx="0" cy="-35" r="3" fill="#a0a0a0" stroke="#707070" stroke-width="0.8"/>
      <circle cx="25" cy="-25" r="3" fill="#a0a0a0" stroke="#707070" stroke-width="0.8"/>
      <circle cx="35" cy="0" r="3" fill="#a0a0a0" stroke="#707070" stroke-width="0.8"/>
      <circle cx="25" cy="25" r="3" fill="#a0a0a0" stroke="#707070" stroke-width="0.8"/>
      <circle cx="0" cy="35" r="3" fill="#a0a0a0" stroke="#707070" stroke-width="0.8"/>
    </g>

    <!-- Tornillos Estructurales Perimetrales Codo -->
    <g transform="translate({cx2}, {cy2}) rotate({angle_deg})">
      <circle cx="0" cy="-30" r="2.5" fill="#a0a0a0" stroke="#707070" stroke-width="0.8"/>
      <circle cx="-21" cy="-21" r="2.5" fill="#a0a0a0" stroke="#707070" stroke-width="0.8"/>
      <circle cx="-30" cy="0" r="2.5" fill="#a0a0a0" stroke="#707070" stroke-width="0.8"/>
      <circle cx="-21" cy="21" r="2.5" fill="#a0a0a0" stroke="#707070" stroke-width="0.8"/>
      <circle cx="0" cy="30" r="2.5" fill="#a0a0a0" stroke="#707070" stroke-width="0.8"/>
    </g>

    <!-- Texto KUKA Central -->
    <g transform="translate({mid_x}, {mid_y}) rotate({angle_deg})">
      <!-- Rectangulo de fondo negro/gris oscuro -->
      <rect x="-35" y="-12" width="70" height="24" rx="3" fill="#111111" stroke="#222" stroke-width="1"/>
      <!-- Letras -->
      <text x="0" y="5" font-family="Arial Black, Impact, sans-serif" font-size="16" font-weight="900" fill="#ff7010" text-anchor="middle" letter-spacing="2">KUKA</text>
    </g>
  </g>

  <!-- ══════════════════════════════════════════════
       CAPA 5b — CABLES entrando y saliendo de huecos
       ══════════════════════════════════════════════ -->
  <g>
    <!-- Cables entrando al hueco inferior desde la izquierda (torso) -->
    <!-- Torso cables termianban por x=290 y=245. Los metemos al hueco (cx1+8cos = 302, 242) -->
    <path d="M 270,235 C 285,225 295,230 300,240" stroke="#0e0e0e" stroke-width="10" fill="none" stroke-linecap="round"/>
    <path d="M 270,235 C 285,225 295,230 300,240" stroke="#1a1a1a" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M 250,240 C 270,235 285,245 295,247" stroke="#121212" stroke-width="6.5" fill="none" stroke-linecap="round"/>

    <!-- Cables saliendo del hueco superior (119-n, 93-n) hacia arriba (codo/10) -->
    <!-- Salen de {recess2_cx}, {recess2_cy} y hacen un loop hacia x=120, y=40 -->
    <path d="M {recess2_cx+8},{recess2_cy} C 140,70 140,20 120,40" stroke="#0e0e0e" stroke-width="11" fill="none" stroke-linecap="round" filter="url(#shS)"/>
    <path d="M {recess2_cx+8},{recess2_cy} C 140,70 140,20 120,40" stroke="#1a1a1a" stroke-width="4" fill="none" stroke-linecap="round"/>
    <!-- Segundo cable -->
    <path d="M {recess2_cx},{recess2_cy+5} C 120,80 120,10 100,30" stroke="#121212" stroke-width="7" fill="none" stroke-linecap="round"/>
  </g>
"""

start_eslabon1 = text.find("<!-- ══════════════════════════════════════════════\n       CAPA 5a")
assert start_eslabon1 != -1

# Buscamos el final de la CAPA 5b (que precede a CAPA 6)
end_eslabon1 = text.find("<!-- ══════════════════════════════════════════════\n       CAPA 6")
assert end_eslabon1 != -1

text = text[:start_eslabon1] + svg_eslabon1 + "\n" + text[end_eslabon1:]

with open(file_path, "w", encoding="utf-8") as f:
    f.write(text)

print("Eslabón 1 redraw completed!")
