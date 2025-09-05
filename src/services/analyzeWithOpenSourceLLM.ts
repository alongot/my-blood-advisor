import { 
  AIAnalysisService, 
  BloodAnalysisResult, 
  OpenAIBloodProvider, 
  OpenSourceLLMBloodProvider 
} from "./AIAnalysisService";

// --- OpenAI USAGE (for backend or secure environment only) ---
export async function analyzeBloodFileWithOpenAI(file: File): Promise<BloodAnalysisResult> {
  const provider = new OpenAIBloodProvider();
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY; // load from .env

  if (!apiKey) {
    throw new Error("Missing OpenAI API key. Please set VITE_OPENAI_API_KEY in your .env.local file.");
  }

  return AIAnalysisService.analyzeBloodReport(file, provider, { apiKey });
}

// --- OPEN SOURCE LLM USAGE ---
const LLM_API_ENDPOINT = "http://localhost:11434/api/analyze"; // Change to your LLM endpoint

export async function analyzeBloodFileWithOpenSourceLLM(file: File): Promise<BloodAnalysisResult> {
  const provider = new OpenSourceLLMBloodProvider(LLM_API_ENDPOINT);
  return AIAnalysisService.analyzeBloodReport(file, provider);
}

