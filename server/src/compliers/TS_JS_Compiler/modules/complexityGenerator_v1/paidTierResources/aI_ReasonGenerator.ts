import { getLlama, LlamaChatSession } from "node-llama-cpp";
import path from "path";
import { ComplexityNotation } from "../../../interfaces/complexityGeneratorInterface";


export class AIComplexityExplainer {
  private session!: LlamaChatSession;
  private initPromise: Promise<void>;

  constructor() {
    this.initPromise = this.init();
  }

  private async init() {
    const llama = await getLlama();

    const model = await llama.loadModel({
      modelPath: path.join(
        __dirname,
        "models",
        "qwen2.5-0.5b-instruct.gguf"
      )
    });

    const context = await model.createContext({
      contextSize: 256
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

    return this.prompt(
      `Time Complexity: ${notation.time}
       Space Complexity: ${notation.space}
        Signals: ${signals.join(", ")}
        Explain in ONE detailed senior dev concise sentence.`,
      50
    );
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
