import { getLlama, LlamaChatSession } from "node-llama-cpp";
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
        "../../../../../models/TinyLlama-1.1B-Tarot-Chat-v1.0.Q2_K.gguf"
      ),
      // gpuLayers: 0  // Force CPU only
    });

    const context = await model.createContext({
      contextSize: 128,
      threads: 2
    });


    this.session = new LlamaChatSession({
      contextSequence: context.getSequence()
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
    });
    return result.trim();
  }

  // ---------- explanations ----------

  async explainComplexity(
    notation: { time: ComplexityNotation, space: ComplexityNotation },
    signals: string[]
  ): Promise<string> {
    await this.ready();

    const response = await this.prompt(
      `Time Complexity: ${notation.time}
       Space Complexity: ${notation.space}
        Signals: ${signals.join(", ")}
        Explain in ONE detailed senior dev concise sentence.`,
      35
    );
    console.log("Turbo Log  ~ AIComplexityExplainer ~ explainComplexity ~ response:", response);

    return response;
  }

  // // ---------- classification ----------

  // async detectTimeComplexity(code: string): Promise<ComplexityNotation> {
  //   await this.ready();

  //   return this.prompt(
  //     `Return ONLY one label:
  //       O(1), O(log n), O(n), O(n log n), O(n²), O(n³),
  //       O(n^k), O(2^n), O(n!), O(sqrt n), UNKNOWN
  //       Code:
  //       ${code}`,
  //     12
  //   ) as Promise<ComplexityNotation>;
  // }

  // async detectSpaceComplexity(code: string): Promise<ComplexityNotation> {
  //   await this.ready();

  //   return this.prompt(
  //     `Return ONLY one label:
  //       O(1), O(log n), O(n), O(n log n), O(n²), O(n³),
  //       O(n^k), O(2^n), O(n!), O(sqrt n), UNKNOWN
  //       Code:
  //       ${code}`,
  //     12
  //   ) as Promise<ComplexityNotation>;
  // }
}
