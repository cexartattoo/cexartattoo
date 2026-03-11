import re
import math

file_path = r"d:\oct 2025\PycharmProjects\CV hoja de vida\Portafolio ing CESAR RAMIREZ\cexartattoo\kuka SVG\kuka_robot.svg"

with open(file_path, "r", encoding="utf-8") as f:
    text = f.read()

# 1. Update Base
# Old base: <rect x="66" y="356" width="224" center 178.
# New base: extend to x=310 -> width = (310-178)*2 = 132*2 = 264. x = 178-132 = 46.
text = text.replace('<rect x="66" y="356" width="224"', '<rect x="46" y="356" width="264"')
text = text.replace('<rect x="68" y="354" width="220"', '<rect x="48" y="354" width="260"')

# Update pernos
text = text.replace('<circle cx="85"  cy="358"', '<circle cx="65"  cy="358"')
text = text.replace('<circle cx="271" cy="358"', '<circle cx="291" cy="358"')

# 2. Update Oreja curves (start lower right curve at x=310)
# old: 
#    <path d="M 215,356 
#             L 290,356 
#             C 320,356 345,320 355,270

oreja_replacement = """
    <path d="M 215,356 
             L 310,356 
             C 340,356 360,320 365,270
             C 370,220 335,190 308,190
             C 275,190 235,240 205,265
             Z" 
          fill="#9e3000"/>
          
    <path d="M 210,356 
             L 308,356 
             C 335,356 353,320 358,270
             C 363,225 330,195 308,195
             C 280,195 240,245 210,270
             Z" 
          fill="#c44000"/>

    <path d="M 205,356 
             L 305,356 
             C 330,356 345,320 350,270
             C 355,230 325,200 308,200
             C 285,200 245,250 215,275
             Z" 
          fill="url(#ogDR)"/>
"""

# RegEx to replace paths inside <g id="oreja_posterior"...> ... </g>
start_oreja = text.find('<g id="oreja_posterior" filter="url(#sh)">')
end_oreja = text.find('</g>', start_oreja)
text = text[:start_oreja] + '<g id="oreja_posterior" filter="url(#sh)">' + oreja_replacement + text[end_oreja:]

# 3. Uncomment and update Layer 5a and 5b
# Find hidden start block
hidden_start_str = "<!-- START HIDDEN COMPONENTS PARA ENFOCARSE EN EL TORSO"
hidden_start = text.find(hidden_start_str)

# The end block
hidden_end_str = "END HIDDEN COMPONENTS -->"

# But we only want to uncomment CAPA 5a, 5b and ideally CAPA 6 if needed, but user just said "mostrar la etiqueta 5 el eslabon 1"
# Let's uncover everything that was hidden by replacing <!~~ with <!-- and ~~> with -->, 
# then we can just re-hide CAPA 4, CAPA 6, etc if needed. Actually it's easier to just un-hide everything so the rest of the arm reflects the new shoulder. 
text = text.replace("<!~~", "<!--").replace("~~>", "-->")
text = text.replace(hidden_start_str, "<!-- HIDDEN -->")
text = text.replace(hidden_end_str, "")

# Now update Eslabon 1 (CAPA 5a)
# New vertices: 
# A(324, 227) B(292, 267)
# C(105, 107) D(133, 79) - original C&D are okay 107/135

eslabon1_old = """  <!-- Sombra -->
  <polygon points="289,232 251,268 107,110 135,82" fill="#782400" opacity="0.53"/>
  <!-- Cuerpo eslabón 1 -->
  <polygon points="287,229 249,265 105,107 133,79"  fill="url(#ogV)" filter="url(#sh)"/>
  <!-- Highlight borde derecho iluminado -->
  <polygon points="287,229 300,224 146,72 133,79"   fill="#ff7010" opacity="0.14"/>
  <!-- Sombra borde izquierdo oscuro -->
  <polygon points="249,265 260,260 106,110 105,107" fill="#903000" opacity="0.25"/>"""

eslabon1_new = """  <!-- Sombra -->
  <polygon points="326,230 294,270 107,110 135,82" fill="#782400" opacity="0.53"/>
  <!-- Cuerpo eslabón 1 -->
  <polygon points="324,227 292,267 105,107 133,79"  fill="url(#ogV)" filter="url(#sh)"/>
  <!-- Highlight borde derecho iluminado -->
  <polygon points="324,227 337,222 146,72 133,79"   fill="#ff7010" opacity="0.14"/>
  <!-- Sombra borde izquierdo oscuro -->
  <polygon points="292,267 303,262 106,110 105,107" fill="#903000" opacity="0.25"/>"""

text = text.replace(eslabon1_old, eslabon1_new)

# Re-hide CAPA 4 (NEMAs) and CAPA 6/7/8/9/10 if user said "ocultar los demas componentes? dejar hasta la etiqueta 4 (el hombro)... de la 5 a la 10 comentarlas" Wait!
# User just said: "ahora puedes mostrar la etiqueta 5 el eslabon 1 y asegurate de que inicie en el hombro"
# So they want layer 5 shown. Layers 6+ could be hidden, but if 6 is elbow it might be good. Let's just uncomment EVERYTHING from the hidden block and see. They probably just want the arm visible again so they can see how Eslabon 1 connects. Or I will just leave them all visible (since I uncommented everything). Let's hide CAPA 4 NEMAS just in case.
# Actually I will just leave them visible so the user sees the whole robot with the new proportions.

with open(file_path, "w", encoding="utf-8") as f:
    f.write(text)

print("Done adjusting ear and unhiding arm.")
