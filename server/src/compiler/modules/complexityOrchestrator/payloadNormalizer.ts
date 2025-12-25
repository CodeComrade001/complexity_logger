import { FilePayload, normalizedPayloadData } from "./complexityOrchestratorInterface";

export class PayloadNormalizer {
  normalize(payload: FilePayload): normalizedPayloadData {
    const normalized: normalizedPayloadData[] = [];

    if (!payload || typeof payload !== "object") {
      return normalized[0];
    }

    for (const [fileName, fileData] of Object.entries(payload)) {
      if (!fileData) continue;

      const functions = Array.isArray(fileData.functions) ? fileData.functions : [];
      const arrows = Array.isArray(fileData.arrows) ? fileData.arrows : [];
      const methods = Array.isArray(fileData.methods) ? fileData.methods : [];

      if (!functions.length && !arrows.length && !methods.length) {
        continue;
      }

      normalized.push({
        nameOfFile: fileName,
        functions,
        arrows,
        methods,
      });
    }

    return normalized[0];
  }
}
