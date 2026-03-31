import { ComplexityProfile, SignalProfile } from "../../../interfaces/complexityGeneratorInterface.js";
import { COMPLEXITY_REASONS } from "./paidTierReason.js";

/**
 * Generates human-readable reasons that justify why a particular
 * time/space complexity is detected given a signal profile.
 * 
 * Uses a modular, rule-based system for easy maintenance and updates.
 */
export class ComplexityReasonGenerator {
  /**
   * Returns a single heuristic reason based on notation and signals.
   * Prioritizes more specific/relevant reasons when multiple match.
   */
  public getReason(notation: ComplexityProfile, signals: SignalProfile): string {
    const reasons = this.getAllReasons(notation, signals);

    if (reasons.length === 0) {
      return "Complexity determined by signal analysis";
    }

    // Pick one randomly to keep users engaged (weighted by priority)
    return this._weightedRandomSelect(reasons);
  }

  /**
   * Returns all matching heuristic reasons based on notation and signals.
   * Filters rules by their condition functions and sorts by priority.
   */
  public getAllReasons(notation: ComplexityProfile, signals: SignalProfile): string[] {
    const timeReasons = this._getMatchingReasons(
      notation.timeNotation,
      signals,
      "time"
    );

    const spaceReasons = this._getMatchingReasons(
      notation.spaceNotation,
      signals,
      "space"
    );

    // Combine and deduplicate
    const allReasons = [...timeReasons, ...spaceReasons];
    return [...new Set(allReasons)];
  }

  /**
   * Gets all time complexity reasons that match the current signals
   */
  private getTimeReasons(notation: string, signals: SignalProfile): string[] {
    return this._getMatchingReasons(notation, signals, "time");
  }

  /**
   * Gets all space complexity reasons that match the current signals
   */
  private getSpaceReasons(notation: string, signals: SignalProfile): string[] {
    return this._getMatchingReasons(notation, signals, "space");
  }

  /**
   * Internal: Filters and returns reasons that match the signal profile
   */
  private _getMatchingReasons(
    notation: string,
    signals: SignalProfile,
    type: "time" | "space"
  ): string[] {
    const rulesForNotation = COMPLEXITY_REASONS[type][notation];

    if (!rulesForNotation || rulesForNotation.length === 0) {
      return [];
    }

    // Filter rules where condition passes
    const matchingRules = rulesForNotation.filter((rule) =>
      rule.condition(signals)
    );

    // Sort by priority (descending) then extract reasons
    const sortedRules = matchingRules.sort(
      (a, b) => (b.priority || 1) - (a.priority || 1)
    );

    return sortedRules.map((rule) => rule.reason);
  }

  /**
   * Internal: Selects a random reason weighted by priority
   */
  private _weightedRandomSelect(reasons: string[]): string {
    if (reasons.length === 0) return "Complexity determined by signal analysis";
    if (reasons.length === 1) return reasons[0];

    // For simplicity, just pick randomly from top 3 highest priority
    const topReasons = reasons.slice(0, Math.min(3, reasons.length));
    return topReasons[Math.floor(Math.random() * topReasons.length)];
  }

  /**
   * Gets a detailed breakdown of why each complexity was assigned
   */
  public getDetailedBreakdown(notation: ComplexityProfile, signals: SignalProfile): {
    time: { notation: string; reasons: string[] };
    space: { notation: string; reasons: string[] };
  } {
    return {
      time: {
        notation: notation.timeNotation,
        reasons: this.getTimeReasons(notation.timeNotation, signals)
      },
      space: {
        notation: notation.spaceNotation,
        reasons: this.getSpaceReasons(notation.spaceNotation, signals)
      }
    };
  }

};