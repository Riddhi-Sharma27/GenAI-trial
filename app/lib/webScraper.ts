// app/lib/webScraper.ts
import { runVerification } from "./geminiService";

export async function scrapePage(url: string) {
  return await runVerification({
    type: "link",
    content: url,
  });
}
