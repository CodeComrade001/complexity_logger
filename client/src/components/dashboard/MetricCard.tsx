import { useState } from "react";
import { ComplexitySummary } from "@/types/apiDataInterface";
import { Card, CardContent } from "../ui/card";
import { AlertTriangle, Code2, GitMerge, ShieldCheck } from "lucide-react";
import { Button } from "../ui/button";

// ✅ DEFAULT FALLBACK VALUES
const DEFAULT_SUMMARY: ComplexitySummary = {
  avgScore: 0,
  avgSpaceComplexity: "_",
  avgTimeComplexity: "_",
  criticalRiskCount: 0,
  highRiskCount: 0,
  itemsAnalyzed: 0,
  lowRiskCount: 0,
  mediumRiskCount: 0,
  totalScore: 0,
};

export function MetricsGrid({ metricValues }: { metricValues: ComplexitySummary | null }) {
  const [open, setOpen] = useState(false);

  // ✅ ALWAYS HAVE DATA STRUCTURE
  const data = metricValues ?? DEFAULT_SUMMARY;

  const formatValue = (val: any) => {
    if (val === null || val === undefined) return "—";
    return val;
  };

  const metrics = [
    { title: "Avg Score", val: data.avgScore, icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { title: "Avg Space Complexity", val: data.avgSpaceComplexity, icon: GitMerge, color: "text-purple-500", bg: "bg-purple-500/10" },
    { title: "Avg Time Complexity", val: data.avgTimeComplexity, icon: GitMerge, color: "text-purple-500", bg: "bg-purple-500/10" },
    { title: "Critical Risk Count", val: data.criticalRiskCount, icon: GitMerge, color: "text-purple-500", bg: "bg-purple-500/10" },

    { title: "High Risk Count", val: data.highRiskCount, icon: GitMerge, color: "text-purple-500", bg: "bg-purple-500/10" },
    { title: "Items Analyzed", val: data.itemsAnalyzed, icon: Code2, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Low Risk Count", val: data.lowRiskCount, icon: GitMerge, color: "text-purple-500", bg: "bg-purple-500/10" },
    { title: "Medium Risk Count", val: data.mediumRiskCount, icon: GitMerge, color: "text-purple-500", bg: "bg-purple-500/10" },
    { title: "Total Score", val: data.totalScore, icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10" },
  ];

  const visible = metrics.slice(0, 4);
  const hidden = metrics.slice(4);

  const renderCard = (m: any, i: number) => (
    <Card key={i} className="border-border/50 bg-card/50">
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase text-muted-foreground">
            {m.title}
          </p>
          <h3 className="text-xl font-bold font-mono">
            {formatValue(m.val)}
          </h3>
        </div>
        <div className={`w-10 h-10 rounded-lg ${m.bg} flex items-center justify-center`}>
          <m.icon className={`w-5 h-5 ${m.color}`} />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="relative">
      {/* MAIN GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {visible.map(renderCard)}
      </div>

      {/* TOGGLE */}
      {hidden.length > 0 && (
        <Button onClick={() => setOpen(!open)} className="gap-2 mt-5 shadow-lg shadow-primary/20">
          {open ? "Hide details" : "Show more"}
        </Button>
      )}

      {/* DROPDOWN OVERLAY */}
      {open && (
        <div className="absolute left-0 mt-2 w-full z-50 bg-background border rounded-xl shadow-xl p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {hidden.map(renderCard)}
          </div>
        </div>
      )}
    </div>
  );
}