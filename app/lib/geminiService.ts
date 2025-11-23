// app/lib/geminiService.ts

export interface VerifyRequest {
  type: "text" | "link" | "video";
  content: string;
}

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

export async function runVerification(req: VerifyRequest) {
  try {
    const res = await fetch(`${BACKEND_URL}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Verification request failed: ${text}`);
    }

    return await res.json();
  } catch (err) {
    console.error("Verification Error:", err);
    throw err;
  }
}
