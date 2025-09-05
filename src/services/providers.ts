// src/services/providers.ts

import { AIAnalysisService } from './AIAnalysisService';

// Shared interface
export interface BloodAIProvider {
  analyze(text: string, options?: Record<string, any>): Promise<BloodAnalysisResult>;
}

// Result shape
export interface BloodAnalysisResult {
  bloodType?: string;
  keyFindings: string[];
  supplements: Array<{
    name: string;
    reason: string;
    dosage?: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  healthStatus: 'good' | 'attention' | 'concern';
  summary: string;
}

// Open-source LLM provider
export class OpenSourceLLMBloodProvider implements BloodAIProvider {
  endpoint: string;
  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  async analyze(text: string, options?: Record<string, any>): Promise<BloodAnalysisResult> {
    const prompt = AIAnalysisService.buildAnalysisPrompt(text);
    const body = { prompt, ...options };

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {})
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`Open source LLM API error: ${response.statusText}`);
    }

    return await response.json() as BloodAnalysisResult;
  }
}

// OpenAI provider
export class OpenAIBloodProvider implements BloodAIProvider {
  async analyze(text: string, options?: { apiKey?: string }): Promise<BloodAnalysisResult> {
    if (!options?.apiKey) throw new Error('OpenAI API key is required.');

    const prompt = AIAnalysisService.buildAnalysisPrompt(text);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${options.apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // or gpt-4
        messages: [
          {
            role: "system",
            content: "You are a helpful medical assistant that analyzes blood test results and returns JSON matching BloodAnalysisResult."
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.2
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    try {
      return JSON.parse(content);
    } catch {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) return JSON.parse(match[0]);
    }

    throw new Error("Failed to parse OpenAI response as BloodAnalysisResult");
  }
}
