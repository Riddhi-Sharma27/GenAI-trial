// app/lib/verificationService.ts

export interface VerificationInput {
  type: "text" | "link" | "video";
  content: string;
}

export interface ProcessedInput {
  originalContent: string;
  extractedText: string;
  title?: string;
  url?: string;
  source?: string;
}

export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  urlToImage?: string;
  publishedAt?: string;
  source: {
    name: string;
  };
  content?: string;
}

export interface SourceInfo {
  name: string;
  url: string;
  reliability: number;
  stance: "supports" | "contradicts" | "neutral";
}

export interface VerificationResult {
  truthScore: number;
  isLikelyMisinformation: boolean;
  reasons: string[];
  claims: any[];
  supportingArticles: number;
  contradictingArticles: number;
  verificationSummary: string;
  sources: SourceInfo[];
}

export interface CompleteVerificationResult extends VerificationResult {
  input: ProcessedInput;
  relatedArticles: NewsArticle[];
  processingTime: number;
  timestamp: string;
}

// Point this to your FastAPI deployment
const BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

class NewsVerificationService {
  async verifyContent(input: VerificationInput): Promise<CompleteVerificationResult> {
    const startTime = Date.now();

    const res = await fetch(`${BACKEND_BASE_URL}/api/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // This should match the FastAPI request model
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Verification failed: ${res.status} ${text}`);
    }

    const data = await res.json();

    // Map backend JSON -> CompleteVerificationResult
    const result: CompleteVerificationResult = {
      truthScore: data.truthScore,
      isLikelyMisinformation: data.isLikelyMisinformation,
      reasons: data.reasons || [],
      claims: data.claims || [],
      supportingArticles: data.supportingArticles || 0,
      contradictingArticles: data.contradictingArticles || 0,
      verificationSummary: data.verificationSummary || "",
      sources: (data.sources || []).map((s: any) => ({
        name: s.name,
        url: s.url,
        reliability: s.reliability,
        stance: s.stance || "neutral",
      })),
      input: {
        originalContent: data.input?.originalContent ?? input.content,
        extractedText: data.input?.extractedText ?? input.content,
        title: data.input?.title,
        url: data.input?.url,
        source: data.input?.source,
      },
      relatedArticles: (data.relatedArticles || []).map((a: any) => ({
        title: a.title,
        description: a.description,
        url: a.url,
        urlToImage: a.urlToImage,
        publishedAt: a.publishedAt,
        source: { name: a.source?.name || "Unknown" },
        content: a.content,
      })),
      processingTime: data.processingTime ?? (Date.now() - startTime),
      timestamp: data.timestamp ?? new Date().toISOString(),
    };

    return result;
  }

  static getVerificationStatusText(truthScore: number): string {
    if (truthScore >= 90) return "Highly Verified";
    if (truthScore >= 80) return "Mostly Verified";
    if (truthScore >= 70) return "Partially Verified";
    if (truthScore >= 60) return "Questionable";
    if (truthScore >= 50) return "Likely Misinformation";
    return "High Risk of Misinformation";
  }

  static getVerificationColorClass(truthScore: number): string {
    if (truthScore >= 80) return "text-green-600";
    if (truthScore >= 70) return "text-blue-600";
    if (truthScore >= 60) return "text-yellow-600";
    if (truthScore >= 50) return "text-orange-600";
    return "text-red-600";
  }
}

let _instance: NewsVerificationService | null = null;

export const newsVerificationService = {
  get instance(): NewsVerificationService {
    if (!_instance) _instance = new NewsVerificationService();
    return _instance;
  },
  verifyContent: (input: VerificationInput) =>
    newsVerificationService.instance.verifyContent(input),
};
