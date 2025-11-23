// app/lib/newsAPI.ts
import { runVerification } from "./geminiService";

export async function searchNewsThroughBackend(query: string) {
  return await runVerification({
    type: "text",
    content: query,
  });
}
