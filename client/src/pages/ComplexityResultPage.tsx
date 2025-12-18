import { useState } from "react";
import { Layout } from "../components/layout/Layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  RefreshCcw,
  List,
  LayoutGrid,
  Table as TableIcon,
  Info,
} from "lucide-react";
import { cn } from "../lib/utils";
import type { MethodPreview } from "../types/fileUploadInterface";
import { MOCK_METHOD_COMPLEXITY } from "../services/fakeDataset";
import type { ViewMode } from "../types/complexityResultInterface";
import { CodeEditor } from "../components/dashboard/CodeEditor";

export default function ComplexityResultPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("card");
  const [results, setResults] = useState<MethodPreview[]>(MOCK_METHOD_COMPLEXITY);
  const [activeReasonId, setActiveReasonId] = useState<string | null>(null);

  const refreshResults = () => {
    // placeholder for re-fetch
    setResults([...MOCK_METHOD_COMPLEXITY]);
    setActiveReasonId(null);
  };

  const riskGlow = (risk: MethodPreview["riskLevel"]) => {
    switch (risk) {
      case "CRITICAL":
        return "animate-pulse border-2 border-red-600";
      case "HIGH":
        return "animate-pulse border-2 border-orange-500";
      case "MEDIUM":
        return "border-2 border-yellow-500";
      default:
        return "border-2 border-emerald-500";
    }
  };

  return (
    <Layout>
      <div className="w-full mx-auto p-[50px] max-h-[200px] overflow-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">Complexity Analysis Results</h1>
          <input type="text" name="search" id="" placeholder="Search For Function" />
          <input type="text" name="filter" id="" placeholder="Filter Results" />

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode("list")}
              className={`btn-interactive ${cn(viewMode === "list" && "bg-muted")}`}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode("card")}
              className={`btn-interactive ${cn(viewMode === "card" && "bg-muted")}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode("table")}
              className={`btn-interactive ${cn(viewMode === "table" && "bg-muted")}`}
            >
              <TableIcon className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={refreshResults}
              className="gap-2 btn-interactive"
            >
              <RefreshCcw className="h-3 w-3" /> Refresh
            </Button>
          </div>
        </div>

        {/* CARD VIEW */}
        {viewMode === "card" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((m) => (
              <Card
                key={m.id}
                className={`flex flex-col justify-between items-center ${cn("transition-all", riskGlow(m.riskLevel))}`}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-mono">{m.name}()</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-xs text-muted-foreground">
                    Lines {m.startLine}–{m.endLine}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-mono">
                    <Badge variant="outline" className="px-2 py-0.5">
                      Time: {m.timeComplexity}
                    </Badge>
                    <Badge variant="outline" className="px-2 py-0.5">
                      Space: {m.spaceComplexity}
                    </Badge>
                  </div>
                  <div className="text-sm font-bold">Score: {m.totalScore}</div>

                  {/* Code preview */}
                  <div className="text-xs font-mono text-muted-foreground hover:text-foreground hover:bg-muted p-1 rounded cursor-pointer">
                    {/* {m.text} */}
                    <CodeEditor code={m.text} />
                  </div>

                  {/* Reasons modal toggle */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 text-xs hover:text-primary"
                    onClick={() =>
                      setActiveReasonId(activeReasonId === m.id ? null : m.id)
                    }
                  >
                    <Info className="h-3 w-3" /> Reasons
                  </Button>

                  {/* Inline reasons */}
                  {activeReasonId === m.id && (
                    <div className="mt-1 p-2 bg-muted rounded text-[10px] text-foreground font-mono">
                      {m.reasons.length > 0
                        ? m.reasons.map((r, i) => <div key={i}>• {typeof r === 'string' ? r : r.detail}</div>)
                        : "No reasons provided"}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* LIST VIEW */}
        {viewMode === "list" && (
          <div className="divide-y divide-border flex flex-col gap-5 rounded-md border shadow-sm dark:shadow-[0_4px_12px_rgba(0,0,0,0.4)]">
            {results.map((m) => (
              <div
                key={m.id}
                className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-2 hover:bg-muted/30"
              >
                <div className="flex flex-col md:flex-row md:gap-6 min-w-0">
                  <div className="font-mono text-sm font-bold truncate">{m.name}()</div>
                  <div className="text-sm text-muted-foreground">Lines {m.startLine}–{m.endLine}</div>
                </div>
                <div className="flex items-center gap-4 mt-2 md:mt-0 shrink-0">
                  <Badge variant="outline" className="font-mono text-sm min-w-20 text-center">
                    {m.timeComplexity} / {m.spaceComplexity}
                  </Badge>
                  <span className="text-sm font-bold w-8 text-center">{m.totalScore}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setActiveReasonId(activeReasonId === m.id ? null : m.id)
                    }
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                </div>
                {activeReasonId === m.id && (
                  <div className="mt-2 p-2 bg-muted rounded text-sm text-foreground font-mono break-words">
                    {m.reasons.length > 0
                      ? m.reasons.map((r, i) => (
                        <div key={i}>• {typeof r === "string" ? r : r.detail}</div>
                      ))
                      : "No reasons provided"}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* TABLE VIEW */}
        {viewMode === "table" && (
          <div className="overflow-auto border rounded-md shadow-sm dark:shadow-[0_6px_16px_rgba(0,0,0,0.45)]">
            <table className="w-full text-sm table-auto">
              <thead className="bg-muted/30">
                <tr className="text-left">
                  <th className="p-3 min-w-[120px]">Method</th>
                  <th className="p-3 min-w-[80px]">Lines</th>
                  <th className="p-3 min-w-[80px]">Time</th>
                  <th className="p-3 min-w-[80px]">Space</th>
                  <th className="p-3 min-w-[60px]">Score</th>
                  <th className="p-3 min-w-[200px]">Reasons</th>
                </tr>
              </thead>
              <tbody>
                {results.map((m) => (
                  <tr
                    key={m.id}
                    className={cn(
                      "border-t hover:bg-muted/20",
                      riskGlow(m.riskLevel)
                    )}
                  >
                    <td className="p-3 font-mono break-words">{m.name}()</td>
                    <td className="p-3">{m.startLine}–{m.endLine}</td>
                    <td className="p-3">{m.timeComplexity}</td>
                    <td className="p-3">{m.spaceComplexity}</td>
                    <td className="p-3 font-bold text-center">{m.totalScore}</td>
                    <td className="p-3 break-words">
                      {m.reasons.length > 0 ? m.reasons.map((r, i) => (
                        <div key={i}>• {typeof r === "string" ? r : r.detail}</div>
                      )) : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </Layout>
  );
}
