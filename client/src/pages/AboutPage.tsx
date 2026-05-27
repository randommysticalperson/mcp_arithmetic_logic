/**
 * AboutPage.tsx
 * Design: Scientific Instrument / Swiss Rationalism
 * Theory and background on McCulloch-Pitts neurons.
 */

export default function AboutPage() {
  return (
    <div className="max-w-3xl space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 text-white">
        <p className="text-xs font-mono text-sky-400 uppercase tracking-widest mb-2">1943 · Neuroscience & Logic</p>
        <h2 className="text-3xl font-bold mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          The McCulloch-Pitts Neuron
        </h2>
        <p className="text-slate-300 leading-relaxed text-sm">
          In 1943, Warren McCulloch and Walter Pitts published{" "}
          <em>"A Logical Calculus of the Ideas Immanent in Nervous Activity"</em>, introducing the
          first mathematical model of a neuron. Their model showed that networks of binary threshold
          units could compute any logical function — laying the foundation for both artificial neural
          networks and digital computing.
        </p>
      </div>

      {/* Model definition */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-800 mb-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          The Formal Model
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed mb-4">
          A McCulloch-Pitts neuron receives binary inputs x₁, x₂, …, xₙ. Each input is either{" "}
          <strong>excitatory</strong> (contributes +1 to the activation sum) or{" "}
          <strong>inhibitory</strong> (if active, immediately suppresses the output to 0). The neuron
          fires (outputs 1) if and only if the total excitatory activation meets or exceeds a fixed
          threshold θ, and no inhibitory input is active.
        </p>
        <div className="bg-slate-800 rounded-xl p-5 font-mono text-sm text-slate-100 space-y-2">
          <p className="text-sky-400">// McCulloch-Pitts activation rule</p>
          <p>
            <span className="text-amber-300">if</span>{" "}
            <span className="text-white">(any inhibitory input = 1)</span>{" "}
            <span className="text-amber-300">→</span>{" "}
            <span className="text-rose-400">output = 0</span>
          </p>
          <p>
            <span className="text-amber-300">else</span>{" "}
            <span className="text-white">activation = Σ excitatory inputs</span>
          </p>
          <p>
            <span className="text-amber-300">output</span>{" "}
            <span className="text-white">= 1 if activation ≥ θ, else 0</span>
          </p>
        </div>
      </div>

      {/* Key properties */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            title: "Binary Inputs & Outputs",
            body: "All signals are strictly 0 or 1. This maps directly to the LOW/HIGH voltage levels of digital logic circuits.",
            color: "border-sky-200 bg-sky-50",
            head: "text-sky-700",
          },
          {
            title: "Fixed Threshold",
            body: "The threshold θ is a non-negative integer set at design time. Changing θ changes the logical function the neuron computes.",
            color: "border-emerald-200 bg-emerald-50",
            head: "text-emerald-700",
          },
          {
            title: "Inhibitory Connections",
            body: "An inhibitory input acts as an absolute veto. If any inhibitory input fires, the neuron cannot fire regardless of excitatory inputs.",
            color: "border-rose-200 bg-rose-50",
            head: "text-rose-700",
          },
        ].map((card) => (
          <div key={card.title} className={`rounded-xl border p-4 ${card.color}`}>
            <h4 className={`text-sm font-bold mb-2 ${card.head}`}>{card.title}</h4>
            <p className="text-xs text-slate-600 leading-relaxed">{card.body}</p>
          </div>
        ))}
      </div>

      {/* Gate implementations */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-800 mb-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          Logic Gates as MCP Neurons
        </h3>
        <div className="overflow-auto rounded-lg border border-slate-200">
          <table className="w-full text-sm" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {["Gate", "Neurons", "θ", "Excitatory", "Inhibitory", "Rule"].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { gate: "AND", neurons: 1, theta: "n", exc: "x₁, x₂, …, xₙ", inh: "—", rule: "All inputs must be 1" },
                { gate: "OR", neurons: 1, theta: "1", exc: "x₁, x₂, …, xₙ", inh: "—", rule: "At least one input is 1" },
                { gate: "NOT", neurons: 1, theta: "1", exc: "bias=1", inh: "x₁", rule: "Fires only when x₁=0" },
                { gate: "NAND", neurons: 2, theta: "—", exc: "—", inh: "—", rule: "AND → NOT" },
                { gate: "NOR", neurons: 2, theta: "—", exc: "—", inh: "—", rule: "OR → NOT" },
                { gate: "XOR", neurons: 3, theta: "—", exc: "—", inh: "—", rule: "NAND ∧ OR → AND" },
                { gate: "XNOR", neurons: 4, theta: "—", exc: "—", inh: "—", rule: "XOR → NOT" },
              ].map((row) => (
                <tr key={row.gate} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-2.5 font-bold text-slate-800">{row.gate}</td>
                  <td className="px-4 py-2.5 text-slate-600">{row.neurons}</td>
                  <td className="px-4 py-2.5 text-sky-600 font-semibold">{row.theta}</td>
                  <td className="px-4 py-2.5 text-emerald-600">{row.exc}</td>
                  <td className="px-4 py-2.5 text-rose-500">{row.inh}</td>
                  <td className="px-4 py-2.5 text-slate-500 text-xs">{row.rule}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Arithmetic circuits */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-800 mb-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          From Neurons to Arithmetic
        </h3>
        <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
          <p>
            The power of MCP neurons lies in their composability. By connecting neurons in layers,
            we can build increasingly complex computations from simple threshold logic.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
            {[
              { name: "Half Adder", neurons: 4, desc: "Adds 2 bits → Sum + Carry. Uses 1 XOR (3 neurons) + 1 AND (1 neuron)." },
              { name: "Full Adder", neurons: 9, desc: "Adds 3 bits (A, B, Cᵢₙ) → Sum + Cₒᵤₜ. Two half-adders + 1 OR gate." },
              { name: "4-bit Adder", neurons: 36, desc: "Four cascaded full adders. Carry ripples from LSB to MSB." },
            ].map((item) => (
              <div key={item.name} className="bg-slate-50 rounded-lg border border-slate-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-800 text-sm">{item.name}</span>
                  <span className="text-xs bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full font-mono font-semibold">
                    {item.neurons} neurons
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Historical note */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 text-sm text-slate-500 leading-relaxed">
        <p className="font-semibold text-slate-700 mb-1">Historical Significance</p>
        <p>
          The McCulloch-Pitts model predates the transistor (1947) and the stored-program computer (1948).
          It demonstrated that biological neurons could be abstracted as logical computing elements,
          directly inspiring John von Neumann's architecture, Claude Shannon's information theory,
          and ultimately the entire field of artificial neural networks.
        </p>
      </div>
    </div>
  );
}
