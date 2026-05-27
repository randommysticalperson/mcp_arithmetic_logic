# Design Brainstorm: McCulloch-Pitts Arithmetic Logic Lab

## Context
An interactive educational web app demonstrating how McCulloch-Pitts neurons function as logic gates and build up to arithmetic circuits (half-adder, full-adder, binary addition).

---

<response>
<probability>0.07</probability>
<idea>

**Design Movement:** Brutalist Scientific Notebook

**Core Principles:**
- Raw, unpolished grid-paper aesthetic with ink-on-paper feel
- Monospace type dominates, evoking circuit diagrams and academic papers
- High-contrast black/cream with electric-yellow signal highlights
- Deliberate asymmetry — panels feel hand-drawn and annotated

**Color Philosophy:**
- Background: warm cream (#F5F0E8), like aged graph paper
- Ink: near-black (#1A1A1A) for structure
- Signal HIGH: electric amber (#F5A623) — neurons firing
- Signal LOW: cool slate (#6B7280)
- Accent: deep indigo (#2D1B69) for headings

**Layout Paradigm:**
- Asymmetric two-column: left is a narrow "lab notebook" sidebar with gate index; right is a large canvas area for circuit visualization
- Sections separated by thick hand-drawn-style borders
- No rounded corners — everything is sharp-edged

**Signature Elements:**
- Dotted grid background on the canvas area (graph paper)
- Neuron nodes drawn as circles with crosshatch shading
- Handwritten-style annotation labels using a display font

**Interaction Philosophy:**
- Toggle inputs feel like flipping physical switches
- Signal propagation animates along wire paths with a "current flowing" effect
- Truth table fills in row by row as inputs change

**Animation:**
- Wire signal: a moving dot travels from input to output (150ms per segment)
- Neuron activation: circle fills with amber color (200ms ease-out)
- Panel entrance: slides in from left with slight overshoot (spring)

**Typography System:**
- Display: "Space Grotesk" bold for headings
- Mono: "JetBrains Mono" for all values, labels, binary numbers
- Body: "Space Grotesk" regular for explanations

</idea>
</response>

<response>
<probability>0.06</probability>
<idea>

**Design Movement:** Cyberpunk Circuit Board / Dark Lab

**Core Principles:**
- Deep dark background with neon-green and cyan signal traces
- Glowing neuron nodes that pulse when active
- Dense, information-rich layout like an oscilloscope or PCB view
- Scanline and noise texture for depth

**Color Philosophy:**
- Background: near-black (#0A0E14)
- Primary surface: dark navy (#0D1117)
- Signal HIGH: neon green (#39FF14) — classic logic HIGH
- Signal LOW: dim gray (#2D3748)
- Accent: electric cyan (#00D4FF) for interactive elements
- Warning/carry: hot magenta (#FF006E)

**Layout Paradigm:**
- Full-width dark canvas with floating panel cards
- Left sidebar: gate selector with glowing icons
- Center: large SVG circuit canvas with animated signal paths
- Right panel: truth table and binary arithmetic display

**Signature Elements:**
- Glowing neon border on active neurons
- Animated dashed signal traces (CSS stroke-dashoffset animation)
- Hexagonal grid background pattern

**Interaction Philosophy:**
- Inputs are toggle switches with satisfying click animation
- Active signals glow and pulse
- Carry bits animate separately in magenta

**Animation:**
- Signal propagation: neon trace animates along SVG path (stroke-dashoffset, 300ms)
- Neuron fire: radial glow pulse (scale 1→1.15→1, 250ms)
- Card entrance: fade + translateY from bottom (200ms staggered)

**Typography System:**
- Display: "Orbitron" for headings (futuristic)
- Mono: "Fira Code" for all binary values
- Body: "Inter" for explanations (readable on dark)

</idea>
</response>

<response>
<probability>0.08</probability>
<idea>

**Design Movement:** Scientific Instrument / Swiss Rationalism

**Core Principles:**
- Clean white-and-slate palette inspired by lab instruments and textbooks
- Precise geometry — neurons as clean SVG circles, wires as straight orthogonal paths
- Information hierarchy through weight and scale, not decoration
- Generous whitespace with purposeful density in the circuit canvas

**Color Philosophy:**
- Background: off-white (#FAFAFA)
- Surface: pure white with subtle shadow
- Signal HIGH: vivid teal (#0EA5E9) — active, energized
- Signal LOW: light gray (#CBD5E1)
- Accent: deep slate (#1E293B) for headings
- Carry/Sum highlight: amber (#F59E0B)

**Layout Paradigm:**
- Three-panel horizontal layout: Gate Library | Circuit Canvas | Results Panel
- Top navigation bar with section tabs (Logic Gates → Half Adder → Full Adder → Binary Addition)
- Sticky header with current gate/circuit name and description

**Signature Elements:**
- Clean SVG neuron diagrams with animated signal flow
- Tabular truth tables with row highlighting
- Step-by-step computation trace panel

**Interaction Philosophy:**
- Binary toggle buttons (0/1) with instant visual feedback
- Circuit redraws smoothly when inputs change
- Explanatory tooltips on hover over neuron components

**Animation:**
- Signal flow: SVG path stroke-dashoffset animation (200ms per wire segment)
- Neuron activation: background fill transition (180ms ease-out)
- Tab switch: content slides horizontally (250ms ease-in-out)
- Truth table row highlight: background fade (150ms)

**Typography System:**
- Display: "DM Sans" bold for headings
- Mono: "IBM Plex Mono" for binary values and weights
- Body: "DM Sans" regular for explanations

</idea>
</response>

---

## Selected Design
**Choice: Scientific Instrument / Swiss Rationalism** (Response 3)

This approach best serves the educational goal — clarity and precision over decoration. The clean SVG circuit diagrams, teal signal highlights, and IBM Plex Mono monospace values will make the neuron logic immediately readable and professional.
