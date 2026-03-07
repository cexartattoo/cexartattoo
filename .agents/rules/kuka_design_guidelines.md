# KUKA Industrial Design & Geometric Architecture Rules

When iterating, editing, or maintaining the KUKA robot arm in `kuka-prototype.html` or similar modules across the project, you must enforce the following strict mechanical and visual standards modeled after the KUKA KR Quantec / KR C4 controller:

## 1. Z-Order & Render Layering (Absolute Priorities)
1. **Base Rail & Support Elements**: Drawn first.
2. **Carriage / Turntable**: The orange and black block sliding on the rail.
3. **Elbow Motors & Linkages**: Draw the three black extended cylinders connecting to L1 BEFORE drawing L1.
4. **Shoulder Joint (J1)**: Rendered dynamically *behind* the Upper Arm `L1`.
5. **Upper Arm (L1)**: Thick, tapered orange block (`segW * 1.0` to `segW * 0.8`), with a dark recessed central panel. Drawn over J1 and elbow motors.
6. **Elbow Joint (J2)**: Drawn *on top* of the Upper Arm `L1`, but *behind* the Forearm `L2`.
7. **Forearm (L2)**: Long, thinner tapered orange tube (`segW * 0.75` to `segW * 0.45`). Features the **"ING.CESAR"** logo perfectly centered on its axis. Drawn over J2.
8. **Wrist Joint (J3)**: Drawn *on top* of the Forearm `L2`.
9. **Tool Extruder**: Drawn at the very top of the robot layer stack.
10. **Drag Chain (Cable system)**: Drawn overlaid on the floor rails.
11. **KR C4 Control Cabinet**: Absolute foreground priority. Drawn last to occlude anything sliding behind or inside it.

## 2. Dynamic Drag Chain Physics
- **DO NOT USE BEZIER CURVES.** True industrial energy chains must be simulated as sequential rigid rectangular links `18px` in width along a mathematically locked track (`P1(anchor) -> P2(arc) -> P3(carriage)`).
- The fixed wall anchor is ALWAYS on the **RIGHT** side of the canvas geometry (`x: window.innerWidth - 20`).
- The chain loops and extends rightwards, stretching linearly when the carriage travels left, and bunching perfectly when traveling right.
- `chainN` must be recalculated dynamically on screen `resize` via `N = Math.ceil((width * 0.72) / 18)` to guarantee it spans the rail smoothly without stretching individual links visually.

## 3. Joint & Kinematic Details
Every joint function MUST accept and utilize its corresponding kinematic angle (`th1`, `th1+th2`, etc.) to spin its inner components.
Each joint contains:
- Outer dark rim (`#1a1a1a`).
- **KUKA Orange** inner ring (`#FF6600`).
- Dark central motor plate (`#1a1a1a` w/ `#222` stroke).
- A 6-bolt ring pattern rotating actively with the joint tracking.
- A stark **White Rotation Line** (indicator shaft) aligned to the joint's current computed angle acting as live kinematic telemetry.

## 4. Trapezoidal Arm Geometry
Arm parts `L1` and `L2` MUST be drawn as pure geometric polygon paths (`beginPath` -> 4 corners -> `closePath()`) so they taper correctly. 
They must exhibit a 3D bevel look:
- Top highlight edge polygon (`#ff8833`).
- Base fill polygon (`#FF6600`).
- Bottom shadow edge polygon (`#cc4400`).

## 5. The KUKA KR C4 Detailed Cabinet
If rendering the control box, it must match the KR C5 / KR C4 photo specifically:
- Dimensions: Wide format (~`1.4:1` width:height ratio).
- Base Shell: Graphite / Dark Grey (`#2a2a2a`).
- Door: `#FF6600` Orange, occupying 85% of the frame.
- Embedded Details: Tri-color `100% lit` status LEDs (Red, Yellow, Green), horizontal toggle switch, and vertical black push handle.
- Warning Labels: Geometric warning triangle (Yellow `#FFD700`, black border, black `!`), and precise distinct label plates reading `KUKA` and `KR C4` simulating the CE rating placard.
- Add-on Hook: Feature a black structural hook area holding the angled KUKA SmartPAD teach pendant on its right side.
