import { Highlight, themes } from "prism-react-renderer";

interface CodeEditorProps {
  code: string;
  resolveLanguage?: () => string;
}

export function CodeEditor({ code, resolveLanguage }: CodeEditorProps) {
  const language = resolveLanguage ? resolveLanguage() : "typescript";

  return (
    <div className="rounded-md overflow-hidden border border-border bg-[#0d1117] font-mono text-sm relative group">
      <div className="absolute top-3 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-xs text-muted-foreground bg-background/50 px-2 py-1 rounded border border-border">
          {language}
        </span>
      </div>

      <div className="h-fit-content max-h-[700px] overflow-auto custom-scrollbar">
        <Highlight
          theme={themes.vsDark}
          code={code}
          language={language}
        >
          {({ style, tokens, getLineProps, getTokenProps }) => (
            <pre style={{ ...style, background: "transparent" }} className="p-4 float-left min-w-full">
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line })} className="table-row">
                  <span className="table-cell text-right pr-4 select-none opacity-30 text-xs w-8 border-r border-border/20 mr-4">
                    {i + 1}
                  </span>
                  <span className="table-cell pl-4">
                    {line.map((token, key) => (
                      <span key={key} {...getTokenProps({ token })} />
                    ))}
                  </span>
                </div>
              ))}
            </pre>
          )}
        </Highlight>
      </div>
    </div>
  );
}