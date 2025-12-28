import { FilePayload, normalizedPayloadData } from "./complexityOrchestratorInterface";

export class PayloadNormalizer {
  normalize(payload: FilePayload): normalizedPayloadData | null {

    if (!payload || typeof payload !== "object") {
      return null;
    }

    for (const [fileName, fileData] of Object.entries(payload)) {
      if (!fileData) continue;

      const functions = Array.isArray(fileData.functions) ? fileData.functions : [];
      const arrows = Array.isArray(fileData.arrows) ? fileData.arrows : [];
      const methods = Array.isArray(fileData.methods) ? fileData.methods : [];
      const constructors = Array.isArray(fileData.constructors) ? fileData.constructors : [];
      const getters = Array.isArray(fileData.getters) ? fileData.getters : [];
      const setters = Array.isArray(fileData.setters) ? fileData.setters : [];
      const callbacks = Array.isArray(fileData.callbacks) ? fileData.callbacks : [];
      const handlers = Array.isArray(fileData.handlers) ? fileData.handlers : [];
      const staticBlocks = Array.isArray(fileData.staticBlocks) ? fileData.staticBlocks : [];
      const topLevelStatements = Array.isArray(fileData.topLevelStatements) ? fileData.topLevelStatements : [];
      if (!functions.length && !arrows.length && !methods.length) {
        continue;

      }

      return {
        nameOfFile: fileName,
        functions,
        arrows,
        methods,
        constructors,
        getters,
        setters,
        callbacks,
        handlers,
        staticBlocks,
        topLevelStatements
      };
    }

    return null;
  }
}
