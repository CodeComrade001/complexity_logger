export class ErrorBoundary {
  static handle(context: string, error: unknown) {
    console.error(`[ComplexityError] ${context}`, error);
    return { success: false, message: "Internal server error" };
  }
}
