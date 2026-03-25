import { useState } from "react";
import { Button } from "@/components/ui/button";
import TrendCardFullOverlay from "./trendCardFullOverlay";
import { ComplexityUnit, RiskLevel } from "@/types/apiDataInterface";
import { MOCK_COMPLEXITY_DATA } from "@/mock_data/mock_data";


// temp data for preview

export default function TrendCardPreview({ data = MOCK_COMPLEXITY_DATA }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <div className="border-border/50 bg-card/50 rounded-xl shadow-sm overflow-hidden p-4">
        <h3 className="text-sm font-semibold mb-3">Top 10 Functions</h3>

        <ul className="divide-y divide-border/20 max-h-50 overflow-y-auto">
          {data.map((fn) => (
            <li key={fn.id} className="flex justify-between items-center py-2">
              <div>
                <p className="text-xs font-mono font-bold truncate">{fn.name}()</p>
                <p className="text-[10px] text-muted-foreground">{fn.riskLevel} • Score: {fn.totalScore}</p>
              </div>
            </li>
          ))}
        </ul>

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












// mockComplexityData.ts
