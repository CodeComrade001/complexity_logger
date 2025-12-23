/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useState } from "react";
import {
  Folder, FileCode, Plus, Play, Settings, ChevronRight, Github,
  Activity, Zap, Server, AppWindow,
  EyeOff,
  Eye
} from "lucide-react";
import { Layout } from "../components/layout/Layout";
import { Button } from "../components/ui/button";
import { ScrollArea } from "../components/ui/scroll-area";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { CodeEditor } from "../components/dashboard/CodeEditor";
import { cn } from "../lib/utils";
import { ComplexityChart } from "../components/dashboard/ComplexityChart";
import { useNotification } from "../context/useNotification";
import { BACKEND_LANGUAGES, DATASETS, IGNORED_FILES, IGNORED_PATHS, type BackendLanguageKey, type MethodPreview, type SingleFile } from "../types/fileUploadInterface";
import { MOCK_METHOD_COMPLEXITY } from "../services/fakeDataset";
import { FileUploadProgress } from "../hooks/fileUploading";
import { uploadAndAnalyzeFiles } from "../utils/axios";

// Type definitions for file tree
interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  language?: string;
  size?: number;
  dir?: string;
  file?: File;
  risk?: string;
}




const fakeChartData = [
  { name: "auth.ts", complexity: 12, risk: "Low" },
  { name: "utils.ts", complexity: 5, risk: "Low" },
  { name: "parser.ts", complexity: 45, risk: "High" },
  { name: "graph.ts", complexity: 28, risk: "Medium" },
  { name: "api.ts", complexity: 8, risk: "Low" },
  { name: "legacy.js", complexity: 85, risk: "Critical" },
  { name: "user.ts", complexity: 15, risk: "Low" },
];


export default function DashboardPage() {
  const [selectedFileRoute, setSelectedFileRoute] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [selectedFileText, setSelectedFileText] = useState<string>("");
  const [threshold, setThreshold] = useState([15]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [files, setFiles] = useState<FileNode[]>([]);
  const [datasetKey, setDatasetKey] = useState<BackendLanguageKey>("typescript");
  const [fileComplexityResult, setFileComplexityResult] = useState<MethodPreview[]>([]);
  const [hideComplexityChart, setHideComplexityChart] = useState<boolean>(false)
  const { notify } = useNotification();
  const [showUploadProcess, setShowUploadProcess] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isEditing, _setIsEditing] = useState(false);
  const [uploadFilesForComplexity, setUploadFilesForComplexity] = useState<SingleFile[]>([]);


  const handleAnalyze = useCallback(async () => {
    try {
      setIsAnalyzing(true);

      // 1. Create FormData
      const formData = new FormData();

      // 2. Append files. 
      // Assuming uploadFilesForComplexity is an array of { file: File, name: string, ... }
      uploadFilesForComplexity.forEach((item) => {
        // Append the actual File object. The key 'files' must match what your backend expects (e.g. @UploadedFiles() files)
        formData.append('files', item.file);
        formData.append('language', item.language);
        formData.append('size', item.size.toString());
        // If you need to send metadata (like language/size) alongside each file, 
        // it's often better to send a parallel JSON array string if your backend supports it,
        // OR rely on the backend to detect size/extension from the file itself.
        // For now, let's assume we just send the files.
      });

      // 3. Send the FormData
      const result = await uploadAndAnalyzeFiles(formData);

      console.log("Turbo Log ~ DashboardPage ~ result:", result);

      // Axios response is usually result.data, not result.data()
      const { success, data } = result.data;

      if (!success) {
        return notify("Analysis failed. Please try again.", "error");
      }

      setFileComplexityResult(data);
      notify("Analysis completed successfully!", "success");

    } catch (error) {
      console.error("Error during analysis:", error);
      notify("Analysis failed. Please try again.", "error");
    } finally {
      // setIsAnalyzing(true); // <-- BUG: You likely meant false here
      setIsAnalyzing(false);
      setShowUploadProcess(!showUploadProcess);
    }
  }, [uploadFilesForComplexity, notify, showUploadProcess]);


  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low": return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
      case "Medium": return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
      case "High": return "text-orange-500 bg-orange-500/10 border-orange-500/20";
      case "Critical": return "text-destructive bg-destructive/10 border-destructive/20";
      default: return "text-muted-foreground bg-muted/10";
    }
  };

  const importUserFileFolder = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.webkitdirectory = true;
    input.accept = "*/*";

    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement | null;
      if (!target || !target.files) return;

      const tree = await processFiles(target.files);
      setFiles(tree);
    };

    input.click();
  };

  const processFiles = async (fileList: FileList): Promise<FileNode[]> => {
    try {
      // Validate dataset exists
      if (!DATASETS[datasetKey as keyof typeof DATASETS]) {
        notify("Invalid dataset selected", "error");
        return [];
      }

      const allowedPatterns = DATASETS[datasetKey as keyof typeof DATASETS];
      const root: FileNode[] = [];
      console.log("Turbo Log  ~ processFiles ~ root:", root);
      const fileArrayForUpload: SingleFile[] = []
      console.log("Turbo Log  ~ processFiles ~ fileArrayForUpload:", fileArrayForUpload);

      const getOrCreateFolder = (children: FileNode[], name: string): FileNode => {
        let folder = children.find((c) => c.type === "folder" && c.name === name);
        if (!folder) {
          folder = {
            id: crypto.randomUUID(),
            name,
            type: "folder",
            children: [],
          };
          children.push(folder);
        }
        return folder;
      };

      Array.from(fileList).forEach((file) => {
        const relativePath = file.webkitRelativePath;

        // 1️⃣ Ignore specific paths (node_modules, etc)
        if (Array.isArray(IGNORED_PATHS) && IGNORED_PATHS.some((p) => relativePath.includes(p))) {
          return;
        }

        // 2️⃣ Ignore specific files (package.json, etc)
        if (Array.isArray(IGNORED_FILES) && IGNORED_FILES.includes(file.name)) {
          return;
        }

        // 3️⃣ Enforce dataset rules (only process allowed file types)
        if (Array.isArray(allowedPatterns) && !allowedPatterns.some((rx: RegExp) => rx.test(file.name))) {
          return;
        }

        const parts = relativePath.split("/");
        let currentLevel = root;

        // Build folder tree
        for (let i = 0; i < parts.length - 1; i++) {
          const folder = getOrCreateFolder(currentLevel, parts[i]);
          currentLevel = folder.children || [];
        }

        // Add file node
        currentLevel.push({
          id: crypto.randomUUID(),
          name: file.name,
          type: "file",
          language: datasetKey,
          size: file.size,
          dir: file.webkitRelativePath,
          file, // raw File object for later parsing
        });
        fileArrayForUpload.push({
          id: crypto.randomUUID(),
          name: file.name,
          type: "file",
          language: datasetKey,
          size: file.size,
          dir: file.webkitRelativePath,
          file,
        })
      });

      if (root.length > 0) {
        notify("Files imported successfully!", "success");
      } else {
        notify("No valid files found in selected folder", "warning");
      }

      setUploadFilesForComplexity(fileArrayForUpload)

      return root;
    } catch (error) {
      console.error("Error processing files:", error);
      notify("Failed to import files. Please try again.", "error");
      return [];
    }
  };


  const handleFileSelect = async (node: FileNode) => {
    // Only process file nodes, not folders
    if (node.type !== "file") {
      return;
    }

    try {
      if (!node.dir) {
        return notify("File has no directory information", "error");
      }

      const directoryParts = node.dir.split("/");

      // Set route (folders only)
      setSelectedFileRoute(directoryParts.slice(0, -1));

      // Set selected file name
      setSelectedFile(node.name);

      // TODO: Load file content here if needed
      const content = await node.file?.text();
      setSelectedFileText(content || "// Unable to load file content.");

    } catch (error) {
      console.error("Error handling file selection:", error);
      notify("Failed to load file. Please try again.", "error");
    }
  };

  const userSelectedProgrammingLang = useCallback(() => (
    BACKEND_LANGUAGES.find((lang) => lang.key === datasetKey)?.label || "unknown"
  ), [datasetKey])

  const handleComplexityChartView = useCallback(() => {
    setHideComplexityChart(!hideComplexityChart)
  }, [hideComplexityChart])

  useEffect(() => {

    async function fetchComplexityResult() {
      try {
        setFileComplexityResult(MOCK_METHOD_COMPLEXITY);
      } catch (error) {
        console.log("Turbo Log  ~ fetchComplexityResult ~ error:", error);
        notify("Failed to fetch complexity results", "error");
      }
    }
    fetchComplexityResult()
  }, []);

  return (
    <Layout>
      <div className="flex-1 relative flex overflow-hidden h-full">
        <FileUploadProgress projectName={selectedFile} hide={!showUploadProcess} />
        {/* LEFT SIDEBAR - File Explorer & Config */}
        <aside className="w-64 border-r border-border bg-sidebar overflow-none flex flex-col">

          {/* Section: Explorer */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-muted-foreground uppercase tracking-wider">Explorer</span>
            <div className="flex gap-1">
              <Button onClick={importUserFileFolder} variant="ghost" size="icon" className="btn-interactive h-6 w-6">
                <Plus className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="icon" className="btn-interactive h-6 w-6">
                <Settings className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1 p-2">
            <div className="space-y-1">
              {files.length === 0 ? (
                <div className="text-xs text-muted-foreground p-4 text-center">
                  No files loaded. Click + to import.
                </div>
              ) : (
                files.map((file: FileNode) => (
                  <FileTreeItem
                    key={file.id}
                    node={file}
                    selected={selectedFile}
                    onSelect={handleFileSelect}
                  />
                ))
              )}
            </div>
          </ScrollArea>

          {/* Section: Frameworks */}
          <div className="p-4 border-t border-border">
            <span className="font-mono text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 block">Frameworks</span>
            <div className="space-y-2">
              {/* Backend - Active */}
              <div className="p-2 rounded bg-primary/10 border border-primary/20 space-y-2">
                <div className="flex items-center gap-2">
                  <Server className="h-3 w-3 text-primary" />
                  <span className="text-xs font-medium">Backend Language</span>
                </div>

                <select
                  title="Select Programming Language"
                  value={datasetKey}
                  onChange={(e) => setDatasetKey(e.target.value as BackendLanguageKey)}
                  className="
        w-full h-8 rounded-md
         border border-border
        text-xs px-2
        focus:outline-none focus:ring-1 focus:ring-primary
      "
                >
                  {BACKEND_LANGUAGES.map((lang) => (
                    <option key={lang.key} value={lang.key}>
                      {lang.label}
                    </option>
                  ))}
                </select>

                <div className="flex justify-end">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                </div>
              </div>

              {/* Frontend - Coming Soon */}
              <div className="relative overflow-hidden p-2 rounded border border-border bg-muted/5 opacity-60 grayscale cursor-not-allowed">
                <div className="flex items-center gap-2">
                  <AppWindow className="h-3 w-3" />
                  <span className="text-xs font-medium">Frontend (React / Vue)</span>
                </div>
                <div className="absolute inset-0 backdrop-blur-[1px] flex items-center justify-center bg-background/20">
                  <Badge variant="outline" className="bg-background/80 text-[10px] h-5 px-1.5">
                    Coming Soon
                  </Badge>
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
            <button
              type="button"
              className="w-full flex items-center gap-2 px-3 py-2 rounded border border-border bg-background hover:border-primary/50 transition-colors group"
            >
              <Github className="h-4 w-4 group-hover:text-primary transition-colors" />
              <span className="text-xs font-medium">main branch</span>
              <span className="ml-auto text-[10px] text-muted-foreground font-mono">7h ago</span>
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <div className="flex-1 flex flex-col min-w-0 bg-background">
          {/* Toolbar */}
          <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-background/50 backdrop-blur-sm shrink-0">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {selectedFileRoute.length === 0 ? (
                <>
                  <Folder className="h-4 w-4" />
                  <span className="text-foreground font-medium">Overview</span>
                </>
              ) : (
                <>
                  {selectedFileRoute.map((part: string, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <Folder className="h-4 w-4" />
                      <span>{part}</span>
                      <ChevronRight className="h-3 w-3" />
                    </div>
                  ))}
                  <FileCode className="h-4 w-4 text-foreground" />
                  <span className="text-foreground font-medium">{selectedFile}</span>
                </>
              )}
            </div>


            <div className="flex items-center gap-4">
              <Button
                onClick={handleAnalyze}
                className={cn("gap-2 btn-interactive font-mono text-xs h-8", isAnalyzing && "opacity-80")}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? <Zap className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
                {isAnalyzing ? "Analyzing..." : "Generate Complexity"}
              </Button>
              <Button
                onClick={() => handleComplexityChartView()}
                className={cn("gap-2 btn-interactive font-mono text-xs h-8", isAnalyzing && "opacity-80")}
                disabled={isAnalyzing}
              >
                {hideComplexityChart ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                {hideComplexityChart ? "Show Chart" : "Hide Chart"}
              </Button>
            </div>
          </header>

          <ScrollArea className="flex-1 p-6 h-full overflow-auto">
            <div className="max-w-6xl mx-auto space-y-6 pb-20">

              {/* Main Content Area: Split View */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Code View */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium flex items-center gap-2">
                      <FileCode className="h-4 w-4 text-muted-foreground" />
                      Source Code
                    </h3>
                    <Badge variant="outline" className="font-mono  text-xs">{BACKEND_LANGUAGES.find((lang) => lang.key === datasetKey)?.label || "Unknown"}</Badge>
                  </div>
                  <CodeEditor code={selectedFileText} resolveLanguage={userSelectedProgrammingLang} />
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

                      {/* Header */}
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-muted-foreground">Function Complexity Threshold</span>
                        <span className="text-primary font-bold">{threshold[0]}</span>
                      </div>

                      {/* Editable display for complexity threshold */}
                      <input
                        title="Function Complexity Threshold"
                        type="number"
                        value={threshold[0]}
                        onChange={(e) => setThreshold([Number(e.target.value)])}
                        className={`w-auto my-auto text-right ${isEditing ? 'font-bold' : 'font-normal'} border border-border rounded px-1 m-1 py-0.5 text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:ring-offset-1`}
                        min={0}
                        max={100}
                      />


                      {/* Preset buttons */}
                      <div className="flex gap-2 text-[10px]">
                        <button
                          className="px-2 py-1 rounded border border-border text-muted-foreground hover:bg-muted transition"
                          onClick={() => setThreshold([15])}
                        >
                          Low
                        </button>
                        <button
                          className="px-2 py-1 rounded border border-border text-muted-foreground hover:bg-muted transition"
                          onClick={() => setThreshold([30])}
                        >
                          Medium
                        </button>
                        <button
                          className="px-2 py-1 rounded border border-border text-muted-foreground hover:bg-muted transition"
                          onClick={() => setThreshold([45])}
                        >
                          High
                        </button>
                        <button
                          className="px-2 py-1 rounded border border-border text-muted-foreground hover:bg-muted transition"
                          onClick={() => setThreshold([0])}
                        >
                          Ignore
                        </button>
                        <button
                          className="px-2 py-1 rounded border border-border text-primary hover:bg-muted transition font-bold"
                          onClick={() => setThreshold([25])} // default value
                        >
                          Reset
                        </button>
                      </div>

                      {/* Scale explanation */}
                      <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                        <span>Strict (Safer functions)</span>
                        <span>Loose (More complex functions)</span>
                      </div>

                      {/* Explanation */}
                      <div className="text-xs text-muted-foreground bg-muted/20 p-2 rounded border border-border space-y-1">
                        <p>
                          <span className="font-semibold text-foreground">What this checks:</span>{" "}
                          Each <span className="font-semibold text-primary">function</span> is analyzed independently.
                        </p>
                        <p>
                          If a function’s complexity score is greater than{" "}
                          <span className="font-bold text-primary">{threshold[0]}</span>, it will be flagged and may block pull requests.
                        </p>
                      </div>

                      {/* Learn more */}
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => window.open("/complexity-guide", "_blank")}
                          className="text-[10px] font-medium text-primary hover:underline transition-colors"
                        >
                          How function complexity works →
                        </button>
                      </div>
                    </CardContent>
                  </Card>


                  {/* Method Breakdown */}
                  <Card className="border-border shadow-sm flex-1">
                    <CardHeader className="pb-3 flex flex-row items-center justify-between">
                      <CardTitle className="text-sm font-medium">Method Analysis</CardTitle>

                      <button
                        type="button"
                        onClick={() => notify("Detailed suggestions coming soon", "info")}
                        className="text-[10px] text-muted-foreground hover:text-primary transition-colors"
                      >
                        Suggestions
                      </button>
                    </CardHeader>

                    <CardContent className="p-0">
                      <div className="divide-y divide-border">
                        {fileComplexityResult.slice(0, 5).map((method) => (
                          <button
                            key={method.id}
                            type="button"
                            className="w-full p-3 hover:bg-muted/30 transition-colors flex items-center justify-between text-left"
                          >
                            {/* Left */}
                            <div className="space-y-0.5">
                              <div className="font-mono text-xs font-bold">
                                {method.name}()
                              </div>
                              <div className="text-[10px] text-muted-foreground">
                                Line {method.startLine}
                              </div>
                            </div>

                            {/* Right */}
                            <div className="text-right space-y-0.5">
                              <Badge
                                variant="outline"
                                className={cn(
                                  "font-mono text-[10px]",
                                  getRiskColor(method.riskLevel)
                                )}
                              >
                                time: {method.timeComplexity} / space: {method.spaceComplexity}
                              </Badge>
                              <div className="text-xs font-bold">
                                {method.totalScore}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>

                      {/* Footer actions */}
                      <div className="flex items-center justify-between p-3 border-t border-border bg-muted/10">
                        <button
                          type="button"
                          onClick={() => notify("Fuzz testing is coming soon", "info")}
                          className="text-[10px] font-medium text-muted-foreground hover:text-primary transition-colors"
                        >
                          Run fuzz test
                        </button>

                        <button
                          type="button"
                          onClick={() => window.open("/analysis/full-report", "_blank")}
                          className="text-[10px] font-medium text-primary hover:underline"
                        >
                          Show full results →
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Chart Section */}
              <div className={`relative mt-8 ${hideComplexityChart ? "hidden display-none" : ""}`}>
                <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Project Complexity Trend
                </h3>


                <div className="border border-border rounded-md p-4 bg-card">
                  <ComplexityChart chartData={fakeChartData} />
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
interface FileTreeItemProps {
  node: FileNode;
  level?: number;
  selected: string;
  onSelect: (node: FileNode) => void;
}

function FileTreeItem({ node, level = 0, selected, onSelect }: FileTreeItemProps) {
  const [isOpen, setIsOpen] = useState(true);
  const isSelected = selected === node.name && node.type === "file";

  const handleClick = () => {
    if (node.type === "folder") {
      // Just toggle folder open/close
      setIsOpen(!isOpen);
    } else {
      // Only call onSelect for files
      onSelect(node);
    }
  };

  return (
    <div>
      <button
        type="button"
        className={cn(
          "w-full flex items-center gap-2 px-2 py-1.5 rounded-sm text-sm font-mono hover:bg-muted/50 transition-colors select-none",
          isSelected && "bg-primary/10 text-primary hover:bg-primary/15"
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={handleClick}
      >
        {node.type === "folder" ? (
          <Folder className={cn("h-3 w-3 text-muted-foreground", isOpen && "text-foreground")} />
        ) : (
          <FileCode className="h-3 w-3 text-muted-foreground" />
        )}
        <span className="truncate flex-1 text-left">{node.name}</span>
        {node.risk === "High" && <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />}
        {node.risk === "Critical" && <div className="h-1.5 w-1.5 rounded-full bg-red-500" />}
      </button>
      {isOpen && node.children && node.children.length > 0 && (
        <div>
          {node.children.map((child: FileNode) => (
            <FileTreeItem key={child.id} node={child} level={level + 1} selected={selected} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}