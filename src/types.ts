export type VerdictType = 'True' | 'False' | 'Misleading' | 'Partially True' | 'Unverified';

export interface FactCheckSource {
  publisher: string;
  url: string;
  title: string;
  rating: string;
  credibilityScore: number; // 0 to 100 based on Snopes, PolitiFact, etc.
  analysis: string; // Explaining why this source is/isn't credible
}

export interface FactCheckResult {
  claim: string;
  confidenceScore: number; // 0-100 indicating confidence in the explanation/verdict
  verdict: VerdictType;
  explanation: string; // Plain English explanation
  consensus: string; // Dynamic high-level short synthesis summary
  sources: FactCheckSource[];
  searchGrounded: boolean; // True if we fell back to search grounding, False if directly found in Fact Check DB
  analyzedAt: string; // ISO date
}

export interface HistoryItem {
  id: string;
  timestamp: string;
  claim: string;
  verdict: VerdictType;
  confidenceScore: number;
  result: FactCheckResult;
}
