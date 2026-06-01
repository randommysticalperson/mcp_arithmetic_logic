/**
 * App.tsx
 * Design: Scientific Instrument / Swiss Rationalism
 * - Off-white background, slate/teal palette
 * - DM Sans headings, IBM Plex Mono for values
 * - Three-panel layout: sidebar nav + main content
 */

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import LogicGates from "./pages/LogicGates";
import HalfAdderPage from "./pages/HalfAdderPage";
import FullAdderPage from "./pages/FullAdderPage";
import BinaryAdditionPage from "./pages/BinaryAdditionPage";
import AboutPage from "./pages/AboutPage";
import LogicShifterPage from "./pages/LogicShifterPage";
import BitwisePage from "./pages/BitwisePage";
import ALUPage from "./pages/ALUPage";
import MultiplierPage from "./pages/MultiplierPage";
import QuizPage from "./pages/QuizPage";
import { useState } from "react";

const NAV_ITEMS = [
  {
    group: "Theory",
    items: [{ path: "/", label: "About MCP Neurons", icon: "⬡" }],
  },
  {
    group: "Logic Gates",
    items: [
      { path: "/gates", label: "Logic Gate Explorer", icon: "◈" },
    ],
  },
  {
    group: "Arithmetic Circuits",
    items: [
      { path: "/half-adder", label: "Half Adder", icon: "½" },
      { path: "/full-adder", label: "Full Adder", icon: "∑" },
      { path: "/binary-addition", label: "4-Bit Addition", icon: "⊕" },
    ],
  },
  {
    group: "Bit Operations",
    items: [
      { path: "/bitwise", label: "Bitwise Operations", icon: "∧" },
      { path: "/logic-shifter", label: "Logic Shifter", icon: "⇄" },
    ],
  },
  {
    group: "Advanced Circuits",
    items: [
      { path: "/alu", label: "8-Bit ALU", icon: "Ω" },
      { path: "/multiplier", label: "4-Bit Multiplier", icon: "×" },
    ],
  },
  {
    group: "Challenge",
    items: [
      { path: "/quiz", label: "Quiz Mode", icon: "❓" },
    ],
  },
];

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  "/": { title: "McCulloch-Pitts Neurons", subtitle: "Theory & Background" },
  "/gates": { title: "Logic Gate Explorer", subtitle: "AND · OR · NOT · NAND · NOR · XOR · XNOR" },
  "/half-adder": { title: "Half Adder", subtitle: "Sum + Carry using 4 MCP neurons" },
  "/full-adder": { title: "Full Adder", subtitle: "3-bit addition using 9 MCP neurons" },
  "/binary-addition": { title: "4-Bit Binary Addition", subtitle: "Ripple-carry adder using 36 MCP neurons" },
  "/logic-shifter": { title: "Logic Shifter", subtitle: "LSL · LSR · ASR · ROL · ROR using 8 MCP neurons" },
  "/bitwise": { title: "Bitwise Operations", subtitle: "AND · OR · XOR · NOT on 8-bit operands" },
  "/alu": { title: "8-Bit ALU", subtitle: "ADD · SUB · AND · OR · XOR · NOT · SHL · SHR with 3-bit opcode" },
  "/multiplier": { title: "4-Bit Multiplier", subtitle: "Partial products + ripple-carry adder tree" },
  "/quiz": { title: "Quiz Mode", subtitle: "Test your McCulloch-Pitts neuron knowledge" },
};

function Layout({ children }: { children: React.ReactNode }) {
  const [location, navigate] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pageInfo = PAGE_TITLES[location] ?? { title: "MCP Lab", subtitle: "" };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#FAFAFA" }}>
      {/* Top header */}
      <header
        className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-sm"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <div className="flex items-center gap-4 px-4 md:px-6 h-14">
          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <rect y="3" width="20" height="2" rx="1" />
              <rect y="9" width="20" height="2" rx="1" />
              <rect y="15" width="20" height="2" rx="1" />
            </svg>
          </button>

          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center">
              <span className="text-sky-400 text-xs font-bold font-mono">MP</span>
            </div>
            <span className="font-bold text-slate-800 text-sm hidden sm:block">MCP Arithmetic Lab</span>
          </div>

          <div className="h-5 w-px bg-slate-200 hidden md:block" />

          {/* Page title */}
          <div className="hidden md:block">
            <h1 className="text-sm font-bold text-slate-800 leading-none">{pageInfo.title}</h1>
            <p className="text-xs text-slate-400 mt-0.5">{pageInfo.subtitle}</p>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <span className="text-xs text-slate-400 font-mono hidden sm:block">
              McCulloch & Pitts, 1943
            </span>
            <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`
            fixed md:static inset-y-0 left-0 z-20 w-56 bg-white border-r border-slate-200
            transform transition-transform duration-300 ease-out
            ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
            pt-14 md:pt-0 flex flex-col
          `}
        >
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            {NAV_ITEMS.map((group) => (
              <div key={group.group} className="mb-5">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest px-2 mb-2">
                  {group.group}
                </p>
                {group.items.map((item) => {
                  const active = location === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        setMobileOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150 mb-0.5 text-left ${
                        active
                          ? "bg-sky-50 text-sky-700 font-semibold border border-sky-100"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                      }`}
                    >
                      <span className={`text-base leading-none ${active ? "text-sky-500" : "text-slate-400"}`}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Sidebar footer */}
          <div className="p-3 border-t border-slate-100">
            <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-400 font-mono leading-relaxed">
              <p className="font-semibold text-slate-600 mb-1">Signal Legend</p>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-3 h-3 rounded-full bg-sky-400 inline-block shrink-0" />
                <span>HIGH (1)</span>
              </div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-3 h-3 rounded-full bg-slate-300 inline-block shrink-0" />
                <span>LOW (0)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-400 inline-block shrink-0" />
                <span>Carry</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-10 bg-black/30 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={AboutPage} />
        <Route path="/gates" component={LogicGates} />
        <Route path="/half-adder" component={HalfAdderPage} />
        <Route path="/full-adder" component={FullAdderPage} />
        <Route path="/binary-addition" component={BinaryAdditionPage} />
        <Route path="/logic-shifter" component={LogicShifterPage} />
        <Route path="/bitwise" component={BitwisePage} />
        <Route path="/alu" component={ALUPage} />
        <Route path="/multiplier" component={MultiplierPage} />
        <Route path="/quiz" component={QuizPage} />
        <Route>
          <div className="text-center py-20 text-slate-400">Page not found.</div>
        </Route>
      </Switch>
    </Layout>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
