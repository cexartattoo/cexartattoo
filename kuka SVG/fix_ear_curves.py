import re

file_path = r"d:\oct 2025\PycharmProjects\CV hoja de vida\Portafolio ing CESAR RAMIREZ\cexartattoo\kuka SVG\kuka_robot.svg"

with open(file_path, "r", encoding="utf-8") as f:
    text = f.read()

oreja_start = text.find('<g id="oreja_posterior"')
assert oreja_start != -1
oreja_end = text.find('</g>', oreja_start) + 4

new_oreja = """<g id="oreja_posterior" filter="url(#sh)">
    <!-- OREJA PARALELA: La curva superior fluye desde (205,265) hacia el hombro. 
         La curva inferior baja desde el hombro como una curva paralela y aterriza exactamente en (290, 356) -->
    
    <!-- Base Layer (Sombra) -->
    <path d="M 215,356 
             L 290,356 
             C 320,356 345,320 355,270
             C 365,220 335,190 308,190
             C 275,190 235,240 205,265
             Z" 
          fill="#9e3000"/>
          
    <path d="M 210,356 
             L 288,356 
             C 315,356 338,320 348,270
             C 358,225 330,195 308,195
             C 280,195 240,245 210,270
             Z" 
          fill="#c44000"/>

    <path d="M 205,356 
             L 285,356 
             C 310,356 330,320 340,270
             C 350,230 325,200 308,200
             C 285,200 245,250 215,275
             Z" 
          fill="url(#ogDR)"/>
  </g>"""

text = text[:oreja_start] + new_oreja + text[oreja_end:]

with open(file_path, "w", encoding="utf-8") as f:
    f.write(text)
    
print("Oreja curves fixed!")
