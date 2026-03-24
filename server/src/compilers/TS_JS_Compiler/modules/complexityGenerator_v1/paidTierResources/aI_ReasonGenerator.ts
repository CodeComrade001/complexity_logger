import { getLlama, LlamaChatSession, Llama3ChatWrapper } from "node-llama-cpp";
import path from "path";
import { ComplexityNotation } from "../../../interfaces/complexityGeneratorInterface.js";
import { fileURLToPath } from "url";

export class AIComplexityExplainer {
  private session!: LlamaChatSession;
  private initPromise: Promise<void>;

  constructor() {
    this.initPromise = this.init();
  }

  private async init() {
    const __filename = fileURLToPath(import.meta.url);
    console.log("Turbo Log  ~ AIComplexityExplainer ~ init ~ __filename:", __filename);
    const __dirname = path.dirname(__filename);
    console.log("Turbo Log  ~ AIComplexityExplainer ~ init ~ __dirname:", __dirname);

    const llama = await getLlama();

    const model = await llama.loadModel({
      modelPath: path.resolve(
        __dirname,
        "../../../../../models/Qwen2.5-Coder-3B-Instruct-abliterated-Q6_K_L.gguf"
      ),
      // gpuLayers: 0  // Force CPU only if needed
    });

    const context = await model.createContext({
      contextSize: 128,
      threads: 2,
    });

    // Force plain chat wrapper to skip Jinja template
    this.session = new LlamaChatSession({
      contextSequence: context.getSequence(),
      chatWrapper: new Llama3ChatWrapper()
    });
  }

  private async ready() {
    await this.initPromise;
  }

  // ---------- helpers ----------

  private async prompt(
    prompt: string,
    maxTokens: number
  ): Promise<string> {
    const result = await this.session.prompt(prompt, {
      maxTokens
      // temperature: 0.7,
      // topP: 0.9,
    });

    return result.trim();
  }

  // ---------- explanations ----------

  async explainComplexity(
    notation: { time: ComplexityNotation; space: ComplexityNotation },
    signals: string[]
  ): Promise<string> {
    await this.ready();

    // const response = await this.prompt(
    //   `You are a strict algorithm analysis engine.
    //     Input:
    //     - Time Complexity: ${notation.time}
    //     - Space Complexity: ${notation.space}
    //     - Signals: ${signals.join(", ")}

    //     Task:
    //     Return EXACTLY one sentence explaining WHY the complexity classification is correct.

    //     Rules:
    //     - Max 25 words
    //     - No filler words
    //     - No generic phrases
    //     - No introduction or conclusion
    //     - Must reference signals
    //     - Must be technical
    //     - no explanation of what the signals mean, only how they relate to the complexity
    //     - only explanation of the complexity only
    //   Output ONLY the sentence.`,
    //   100
    // );

    const response = "reason generator not Implementation "

    console.log("Turbo Log  ~ AIComplexityExplainer ~ explainComplexity ~ response:", response);

    return response;
  }

  // ---------- classification ----------

  async detectTimeComplexity(code: string): Promise<ComplexityNotation> {
    await this.ready();

    return this.prompt(
      `Return ONLY one label:
O(1), O(log n), O(n), O(n log n), O(n²), O(n³),
O(n^k), O(2^n), O(n!), O(sqrt n), UNKNOWN
Code:
${code}`,
      12
    ) as Promise<ComplexityNotation>;
  }

  async detectSpaceComplexity(code: string): Promise<ComplexityNotation> {
    await this.ready();

    return this.prompt(
      `Return ONLY one label:
O(1), O(log n), O(n), O(n log n), O(n²), O(n³),
O(n^k), O(2^n), O(n!), O(sqrt n), UNKNOWN
Code:
${code}`,
      12
    ) as Promise<ComplexityNotation>;
  }
}