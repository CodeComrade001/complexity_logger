import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import TrendCardFullOverlay from "./trendCardFullOverlay";
import { ComplexityDetails, ComplexityUnit, RiskLevel } from "@/types/apiDataInterface";
import { MOCK_COMPLEXITY_DATA } from "@/mock_data/mock_data";

interface TrendCardPreviewProps {
  apiComplexitydetails: ComplexityDetails | null;
}

export default function TrendCardPreview({ apiComplexitydetails }: TrendCardPreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Prepare data to display
  const data: ComplexityUnit[] = useMemo(() => {
    if (apiComplexitydetails?.functions?.length) {
      return apiComplexitydetails.functions;
    }
    // fallback demo / placeholder data
    if (!apiComplexitydetails) {
      return [];
    }
    return []; // empty functions
  }, [apiComplexitydetails]);

  return (
    <>
      <div className="border-border/50 bg-card/50 rounded-xl shadow-sm overflow-hidden p-4">
        <h3 className="text-sm font-semibold mb-3">Top Functions</h3>

        {data.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">No results yet</p>
        ) : (
          <ul className="divide-y divide-border/20 max-h-60 overflow-y-auto">
            {data.map((fn) => (
              <li key={fn.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 gap-2 border-b border-border/20">
                {/* LEFT SECTION: Function Name + Risk */}
                <div className="flex-1 min-w-[120px]">
                  <p className="text-xs font-mono font-bold truncate">{fn.name}()</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Risk: <span className="font-semibold">{fn.riskLevel}</span> • Score: <span className="font-mono">{fn.totalScore ?? "—"}</span>
                  </p>
                </div>

                {/* MIDDLE SECTION: Complexity */}
                <div className="flex flex-wrap gap-2 sm:gap-4 flex-1 min-w-[120px]">
                  <div className="flex flex-col text-xs">
                    <span className="text-muted-foreground">Time:</span>
                    <span className="font-mono font-semibold">{fn.timeComplexity.notation}</span>
                  </div>
                  <div className="flex flex-col text-xs">
                    <span className="text-muted-foreground">Space:</span>
                    <span className="font-mono font-semibold">{fn.spaceComplexity.notation}</span>
                  </div>
                </div>

                {/* RIGHT SECTION: Lines + Keywords */}
                <div className="flex flex-wrap gap-2 sm:gap-4 flex-1 min-w-[120px] text-xs font-mono">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground">Start:</span>
                    <span className="font-semibold">{fn.startLine}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground">End:</span>
                    <span className="font-semibold">{fn.endLine}</span>
                  </div>
                  <div className="flex flex-col truncate max-w-[100px]">
                    <span className="text-muted-foreground">Keywords:</span>
                    <span className="font-semibold truncate">{fn.matchedKeywords.join(", ") || "—"}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-3 flex gap-2">
          <Button onClick={() => setIsExpanded(true)} className="flex-1">
            Optimized view
          </Button>
          <Button
            onClick={() => window.location.href = "/dashboard/complexity-full-result"}
            variant="outline"
            className="flex-1"
          >
            Full Code View
          </Button>
        </div>
      </div>

      {isExpanded && <TrendCardFullOverlay onClose={() => setIsExpanded(false)} data={data} />}
    </>
  );
}