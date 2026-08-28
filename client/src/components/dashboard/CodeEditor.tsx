import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CodeEditorProps {
  code: string;
  resolveLanguage: string;
}

export function CodeEditor({ code, resolveLanguage }: CodeEditorProps) {
  return (
    <div className="relative group h-full w-full bg-[#0d1117]  font-mono text-sm">
      {/* Line Numbers Decoration */}
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-[#0d1117] border-r border-border/20 flex flex-col items-center pt-4 text-muted-foreground/40 select-none">
        {code.split('\n').map((_, i) => (
          <span key={i} className="leading-6 text-[10px]">{i + 1}</span>
        ))}
      </div>

      <ScrollArea className="h-[600px] w-full pl-14 pt-4">
        <pre className="leading-6 text-slate-300 overflow-auto">
          <code>{code || "// Select a file to view code"}</code>
        </pre>
      </ScrollArea>

      {/* Floating Language Badge */}
      <div className="absolute bottom-4 right-4 opacity-0  group-hover:opacity-100 transition-opacity">
        <div className="bg-black/50 backdrop-blur-md border  border-white/10 px-2 py-1 rounded text-[10px] uppercase text-white/50">
          {resolveLanguage}
        </div>
      </div>
    </div>
  );
}