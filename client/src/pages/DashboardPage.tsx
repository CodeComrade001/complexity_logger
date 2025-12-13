/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import {
  Folder, FileCode, Plus, Play, Settings, ChevronRight, Github,
  Activity, Zap, Server, AppWindow
} from "lucide-react";
import { Layout } from "../components/layout/Layout";
import { Button } from "../components/ui/button";
import { ScrollArea } from "../components/ui/scroll-area";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Slider } from "../components/ui/slider";
import { CodeEditor } from "../components/dashboard/CodeEditor";
import { cn } from "../lib/utils";
import { ComplexityChart } from "../components/dashboard/ComplexityChart";

// Mock Data Structure
const MOCK_ANALYSIS = {
  summary: {
    totalFiles: 142,
    totalLines: 12500,
    averageComplexity: 4.2,
    criticalHotspots: 3,
    riskScore: "B+"
  },
  methods: [
    { name: "processUserData", line: 45, complexity: 18, risk: "Medium", type: "O(n²)" },
    { name: "recursiveTreeWalk", line: 12, complexity: 42, risk: "High", type: "O(2^n)" },
    { name: "validateInput", line: 88, complexity: 2, risk: "Low", type: "O(1)" },
  ]
};

const MOCK_FILES = [
  {
    id: "1", name: "src", type: "folder", children: [
      {
        id: "2", name: "components", type: "folder", children: [
          { id: "3", name: "Header.tsx", type: "file", risk: "Low" },
          { id: "4", name: "Sidebar.tsx", type: "file", risk: "Low" },
        ]
      },
      {
        id: "5", name: "utils", type: "folder", children: [
          { id: "6", name: "parser.ts", type: "file", risk: "High" },
          { id: "7", name: "helpers.ts", type: "file", risk: "Medium" },
        ]
      },
      { id: "8", name: "App.tsx", type: "file", risk: "Low" },
    ]
  },
  { id: "9", name: "package.json", type: "file", risk: "Low" },
];

const MOCK_CODE = `// Heavy recursive operation detected
function recursiveTreeWalk(node: Node): number {
  if (!node) return 0;
  
  // Complexity spike here
  let sum = 0;
  for (let i = 0; i < node.children.length; i++) {
    for (let j = 0; j < node.children.length; j++) {
       sum += recursiveTreeWalk(node.children[i]);
    }
  }
  
  return sum + node.value;
}

// Low complexity helper
function validateInput(input: string): boolean {
  return input.length > 0;
}`;

export default function DashboardPage() {
  const [selectedFile, setSelectedFile] = useState<string | null>("parser.ts");
  const [threshold, setThreshold] = useState([15]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => setIsAnalyzing(false), 1200);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low": return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
      case "Medium": return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
      case "High": return "text-orange-500 bg-orange-500/10 border-orange-500/20";
      case "Critical": return "text-destructive bg-destructive/10 border-destructive/20";
      default: return "text-muted-foreground bg-muted/10";
    }
  };

  return (
    <Layout>
      <div className="flex-1 flex overflow-hidden h-[calc(100vh-4rem)]">
        {/* LEFT SIDEBAR - File Explorer & Config */}
        <aside className="w-64 border-r border-border bg-sidebar flex flex-col">

          {/* Section: Explorer */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-muted-foreground uppercase tracking-wider">Explorer</span>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-6 w-6"><Plus className="h-3 w-3" /></Button>
              <Button variant="ghost" size="icon" className="h-6 w-6"><Settings className="h-3 w-3" /></Button>
            </div>
          </div>

          <ScrollArea className="flex-1 p-2">
            <div className="space-y-1">
              {MOCK_FILES.map((file) => (
                <FileTreeItem key={file.id} node={file} selected={selectedFile} onSelect={setSelectedFile} />
              ))}
            </div>
          </ScrollArea>

          {/* Section: Frameworks */}
          <div className="p-4 border-t border-border">
            <span className="font-mono text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 block">Frameworks</span>

            <div className="space-y-2">
              {/* Backend - Active */}
              <div className="flex items-center justify-between p-2 rounded bg-primary/10 border border-primary/20">
                <div className="flex items-center gap-2">
                  <Server className="h-3 w-3 text-primary" />
                  <span className="text-xs font-medium">Express / Node</span>
                </div>
                <div className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
              </div>

              {/* Frontend - Coming Soon */}
              <div className="relative overflow-hidden p-2 rounded border border-border bg-muted/5 opacity-60 grayscale group cursor-not-allowed">
                <div className="flex items-center gap-2">
                  <AppWindow className="h-3 w-3" />
                  <span className="text-xs font-medium">React / Vue</span>
                </div>
                <div className="absolute inset-0 backdrop-blur-[1px] flex items-center justify-center bg-background/20">
                  <Badge variant="outline" className="bg-background/80 text-[10px] h-5 px-1.5">Coming Soon</Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Status */}
          <div className="p-4 border-t border-border bg-sidebar-accent/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-mono text-muted-foreground">VS Code Connected</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded border border-border bg-background hover:border-primary/50 transition-colors cursor-pointer group">
              <Github className="h-4 w-4 group-hover:text-primary transition-colors" />
              <span className="text-xs font-medium">main branch</span>
              <span className="ml-auto text-[10px] text-muted-foreground font-mono">7h ago</span>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <div className="flex-1 flex flex-col min-w-0 bg-background overflow-hidden">
          {/* Toolbar */}
          <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-background/50 backdrop-blur-sm shrink-0">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Folder className="h-4 w-4" />
              <span>src</span>
              <ChevronRight className="h-3 w-3" />
              <span>utils</span>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground font-medium">{selectedFile || "Overview"}</span>
            </div>

            <div className="flex items-center gap-4">
              <Button
                onClick={handleAnalyze}
                className={cn("gap-2 font-mono text-xs h-8", isAnalyzing && "opacity-80")}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? <Zap className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
                {isAnalyzing ? "Analyzing..." : "Generate Complexity"}
              </Button>
            </div>
          </header>

          <ScrollArea className="flex-1 p-6 h-full">
            <div className="max-w-6xl mx-auto space-y-6 pb-20">

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-muted/5 border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Risk Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold font-mono">{MOCK_ANALYSIS.summary.riskScore}</div>
                  </CardContent>
                </Card>
                <Card className="bg-muted/5 border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Avg Complexity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold font-mono">{MOCK_ANALYSIS.summary.averageComplexity}</div>
                  </CardContent>
                </Card>
                <Card className="bg-muted/5 border-border border-l-4 border-l-destructive">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Critical Hotspots</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold font-mono text-destructive">{MOCK_ANALYSIS.summary.criticalHotspots}</div>
                  </CardContent>
                </Card>
                <Card className="bg-muted/5 border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Lines</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold font-mono">{MOCK_ANALYSIS.summary.totalLines}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content Area: Split View */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Code View */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium flex items-center gap-2">
                      <FileCode className="h-4 w-4 text-muted-foreground" />
                      Source Code
                    </h3>
                    <Badge variant="outline" className="font-mono text-xs">TypeScript</Badge>
                  </div>
                  <CodeEditor code={MOCK_CODE} language="typescript" />
                </div>

                {/* Analysis Panel */}
                <div className="space-y-6">

                  {/* Threshold Control */}
                  <Card className="border-border shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Complexity Threshold</CardTitle>
                      <CardDescription className="text-xs">
                        Adjust tolerance for complexity alerts.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between text-xs font-mono">
                        <span>Strict (10)</span>
                        <span className="text-primary font-bold">{threshold[0]}</span>
                        <span>Loose (50)</span>
                      </div>
                      <Slider
                        value={threshold}
                        onValueChange={setThreshold}
                        max={50}
                        min={10}
                        step={1}
                        className="py-2"
                      />
                      <div className="text-xs text-muted-foreground bg-muted/20 p-2 rounded border border-border">
                        <span className="font-bold text-foreground">Tip:</span> Functions with complexity &gt; {threshold[0]} will block PRs.
                      </div>
                    </CardContent>
                  </Card>

                  {/* Method Breakdown */}
                  <Card className="border-border shadow-sm flex-1">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Method Analysis</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y divide-border">
                        {MOCK_ANALYSIS.methods.map((method, i) => (
                          <div key={i} className="p-3 hover:bg-muted/30 transition-colors flex items-center justify-between group cursor-pointer">
                            <div>
                              <div className="font-mono text-xs font-bold">{method.name}()</div>
                              <div className="text-xs text-muted-foreground mt-1">Line {method.line}</div>
                            </div>
                            <div className="text-right">
                              <Badge variant="outline" className={cn("mb-1 font-mono text-[10px]", getRiskColor(method.risk))}>
                                {method.type}
                              </Badge>
                              <div className="text-xs font-bold">{method.complexity}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                </div>
              </div>

              {/* Chart Section */}
              <div className="mt-8">
                <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Project Complexity Trend
                </h3>
                <div className="border border-border rounded-md p-4 bg-card">
                  <ComplexityChart />
                </div>
              </div>

            </div>
          </ScrollArea>
        </div>
      </div>
    </Layout>
  );
}

// Simple recursive file tree component
function FileTreeItem({ node, level = 0, selected, onSelect }: any) {
  const [isOpen, setIsOpen] = useState(true);
  const isSelected = selected === node.name && node.type === "file";

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-2 px-2 py-1.5 rounded-sm cursor-pointer text-sm font-mono hover:bg-muted/50 transition-colors select-none",
          isSelected && "bg-primary/10 text-primary hover:bg-primary/15"
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={() => {
          if (node.type === "folder") setIsOpen(!isOpen);
          else onSelect(node.name);
        }}
      >
        {node.type === "folder" ? (
          <Folder className={cn("h-3 w-3 text-muted-foreground", isOpen && "text-foreground")} />
        ) : (
          <FileCode className="h-3 w-3 text-muted-foreground" />
        )}
        <span className="truncate flex-1">{node.name}</span>
        {node.risk === "High" && <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />}
        {node.risk === "Critical" && <div className="h-1.5 w-1.5 rounded-full bg-red-500" />}
      </div>
      {isOpen && node.children && (
        <div>
          {node.children.map((child: any) => (
            <FileTreeItem key={child.id} node={child} level={level + 1} selected={selected} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}