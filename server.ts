import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Share Gemini client lazily
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required but is missing.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// System Instruction for structured fact review
const systemInstruction = 
  "You are an expert, neutral, high-precision AI Fact Verification Assistant. " +
  "Your task is to analyze claims based on either provided claim reviews or reliable web search results, " +
  "and generate an accurate, structured JSON assessment. Avoid biased language, adhere strictly to evidence, " +
  "and rate source credibility objectively based on standards (reputation, transparency, IFCN compliance).";

// Schema for structured Fact Check JSON response
const factCheckSchema = {
  type: Type.OBJECT,
  properties: {
    confidenceScore: {
      type: Type.INTEGER,
      description: "A confidence score from 0 (completely false/extremely uncertain) to 100 (absolutely proven true/false with high-quality evidence)."
    },
    verdict: {
      type: Type.STRING,
      description: "Must be exactly one of: 'True', 'False', 'Misleading', 'Partially True', 'Unverified'"
    },
    explanation: {
      type: Type.STRING,
      description: "A comprehensive, 2-3 paragraph explanation of why the claim is true, false, or misleading, summarizing key evidence in simple human language easily digestible by the general public."
    },
    consensus: {
      type: Type.STRING,
      description: "A concise, single-sentence summary of the consensus among major news organizations and fact-checking institutions."
    },
    sources: {
      type: Type.ARRAY,
      description: "A list of the 2-4 most contextually relevant or authoritative sources related to this claim (e.g. news outlets, Snopes, PolitiFact, government agencies).",
      items: {
        type: Type.OBJECT,
        properties: {
          publisher: {
            type: Type.STRING,
            description: "The name of the publisher (e.g. PolitiFact, Snopes, Reuters, BBC)."
          },
          url: {
            type: Type.STRING,
            description: "The direct URL of the fact check, news article, or context page."
          },
          title: {
            type: Type.STRING,
            description: "The title of the review page or article."
          },
          rating: {
            type: Type.STRING,
            description: "The rating assigned by this publisher (e.g. 'False', 'Mostly False', 'True', 'Needs Context')."
          },
          credibilityScore: {
            type: Type.INTEGER,
            description: "Authoritativeness evaluation of this source on this topic from 0 to 100."
          },
          analysis: {
            type: Type.STRING,
            description: "1-2 sentences summarizing who this publisher is and why they are credible or biased regarding this claim."
          }
        },
        required: ["publisher", "url", "title", "rating", "credibilityScore", "analysis"]
      }
    }
  },
  required: ["confidenceScore", "verdict", "explanation", "consensus", "sources"]
};

// Test if Gemini API is configured
app.get("/api/config-status", (req, res) => {
  const isConfigured = !!process.env.GEMINI_API_KEY;
  res.json({ isConfigured });
});

// API endpoint to verify a claim
app.post("/api/verify", async (req, res) => {
  try {
    const { claim } = req.body;
    if (!claim || typeof claim !== 'string' || claim.trim().length === 0) {
      return res.status(400).json({ error: "A valid 'claim' query string is required in the request body." });
    }

    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      return res.status(500).json({ error: "GEMINI_API_KEY environment variable is not defined on the server." });
    }

    const ai = getGeminiClient();

    // 1. Attempt to search Google Fact Check Database first
    let factCheckData: any = null;
    let fallbackToSearch = false;

    try {
      const factCheckUrl = `https://factchecktools.googleapis.com/v1alpha1/claims:search?query=${encodeURIComponent(claim)}&key=${key}`;
      const fcResponse = await fetch(factCheckUrl, {
        headers: { Accept: "application/json" }
      });
      if (fcResponse.ok) {
        factCheckData = await fcResponse.json();
      } else {
        console.warn(`Google Fact Check Tools API returned status: ${fcResponse.status}`);
        fallbackToSearch = true;
      }
    } catch (err) {
      console.error("Failed to fetch Google Fact Check Tools API, falling back to Search Grounding:", err);
      fallbackToSearch = true;
    }

    if (!factCheckData || !factCheckData.claims || factCheckData.claims.length === 0) {
      fallbackToSearch = true;
    }

    let resultJson: any = null;

    if (fallbackToSearch) {
      console.log(`Using Google Search Grounding for claim: "${claim}"`);
      const userPrompt = `Please verify the claim: "${claim}"\n` +
        `Search for recent high-quality news sources, statements by established organizations, or published fact-checks.\n` +
        `Synthesize the findings and return a structured JSON response matching the schema. Use Web search grounding outputs to populate URLs and publishers where applicable.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: userPrompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: factCheckSchema,
          tools: [{ googleSearch: {} }] // Activate Search Grounding fallback
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Empty response received from Search Grounded Gemini Model.");
      }
      resultJson = JSON.parse(responseText.trim());
      resultJson.searchGrounded = true;
    } else {
      console.log(`Processing direct Database claims for: "${claim}"`);
      // We found direct publisher reviews! Synthesize them with Gemini Flash.
      const dbMetadata = JSON.stringify(factCheckData.claims, null, 2);
      const userPrompt = `Verify this claim: "${claim}"\n\n` +
        `We queried the Google Fact Check Tools database and found the following reviews:\n` +
        `${dbMetadata}\n\n` +
        `Synthesize a clean and coherent verdict, explanation, and rating score based on this database. Format your response into a single valid JSON matching the schema.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: userPrompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: factCheckSchema
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Empty response from Synthesis Gemini Model.");
      }
      resultJson = JSON.parse(responseText.trim());
      resultJson.searchGrounded = false;
    }

    // Ensure metadata defaults are populated correctly
    resultJson.claim = claim;
    resultJson.analyzedAt = new Date().toISOString();
    if (typeof resultJson.confidenceScore !== 'number') resultJson.confidenceScore = 50;
    if (!resultJson.verdict) resultJson.verdict = 'Unverified';
    if (!resultJson.sources) resultJson.sources = [];

    // Map source fields accurately and sanitize
    resultJson.sources = resultJson.sources.map((src: any) => ({
      publisher: src.publisher || "Unknown Source",
      url: src.url || "https://www.google.com",
      title: src.title || "Context Link",
      rating: src.rating || "Unrated",
      credibilityScore: typeof src.credibilityScore === 'number' ? src.credibilityScore : 80,
      analysis: src.analysis || "Authoritative reference source providing factual context."
    }));

    return res.json(resultJson);

  } catch (err: any) {
    console.error("Claim verification failure:", err);
    return res.status(500).json({ error: err.message || "An error occurred during verification processing." });
  }
});

// Configure Vite integration or static file serving
async function configureApp() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Setting up Vite development middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Setting up production static file serving...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Fact Check Server actively running on http://localhost:${PORT}`);
  });
}

configureApp();
