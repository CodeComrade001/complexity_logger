// TrendCardFullOverlay.tsx
import { useState } from "react";
import { X } from "lucide-react";
import type { ComplexityUnit } from "@/types/apiDataInterface";

interface TrendCardFullOverlayProps {
  onClose: () => void;
  data: (ComplexityUnit & { id: string })[]; // functions
}

export default function TrendCardFullOverlay({ onClose, data }: TrendCardFullOverlayProps) {
  const [activeFunctionId, setActiveFunctionId] = useState<string | null>(null);

  if (!data || data.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-start pt-20 overflow-auto">
      <div className="bg-background w-full max-w-5xl rounded-xl shadow-xl p-6 relative">
        <button
          title="close overview"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-bold mb-6">Complexity Analysis (Full)</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.map((fn) => (
            <div key={fn.id} className="glass-panel p-4 rounded-xl border-t-4 border-primary flex flex-col">
              {/* Function header */}
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold truncate">{fn.name}()</h3>
                <span className="text-xs font-semibold uppercase">{fn.riskLevel}</span>
              </div>

              {/* Function core metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono mb-2">
                <div className="flex flex-col">
                  <span className="text-muted-foreground">Time Complexity</span>
                  <span className="font-semibold">{fn.timeComplexity.notation || "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground">Space Complexity</span>
                  <span className="font-semibold">{fn.spaceComplexity.notation || "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground">Start Line</span>
                  <span className="font-semibold">{fn.startLine ?? "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground">End Line</span>
                  <span className="font-semibold">{fn.endLine ?? "—"}</span>
                </div>
                <div className="flex flex-col col-span-full">
                  <span className="text-muted-foreground">Matched Keywords</span>
                  <span className="font-semibold truncate">{fn.matchedKeywords?.join(", ") || "—"}</span>
                </div>
              </div>

              {/* Function snippet */}
              <pre className="text-[10px] font-mono text-muted-foreground overflow-x-auto p-2 bg-muted/10 rounded mb-2">
                {fn.text.slice(0, 150)}{fn.text.length > 150 ? "..." : ""}
              </pre>

              {/* Toggle detailed reasons */}
              <button
                onClick={() => setActiveFunctionId(activeFunctionId === fn.id ? null : fn.id)}
                className="mt-2 w-full py-1 bg-accent hover:bg-accent/80 text-accent-foreground rounded-lg text-xs font-semibold"
              >
                {activeFunctionId === fn.id ? "Hide Details" : "View Details"}
              </button>

              {/* Detailed reasons */}
              {activeFunctionId === fn.id && fn.reasons?.length > 0 && (
                <div className="mt-2 space-y-2 max-h-60 overflow-y-auto text-[11px] text-muted-foreground">
                  {fn.reasons.map((r, idx) => (
                    <div key={idx} className="p-2 bg-muted/30 rounded border border-border">
                      <div className="font-bold">{r.pattern} (Line {r.lineNumber})</div>
                      <p>Type: {r.type.toUpperCase()} • Impact: {r.impact.toUpperCase()} • Confidence: {r.confidence}</p>
                      <p>{r.detail}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}