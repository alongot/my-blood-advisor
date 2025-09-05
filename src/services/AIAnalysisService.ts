import { z } from 'zod';
import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';

// ✅ Tell pdfjs where to find its worker (for v5.x, use the .mjs file)
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString();

// ------------------- Schema + Types -------------------
export const BloodAnalysisSchema = z.object({
  bloodType: z.string().optional(),
  keyFindings: z.array(z.string()),
  supplements: z.array(
    z.object({
      name: z.string(),
      reason: z.string(),
      dosage: z.string().optional(),
      priority: z.enum(['high', 'medium', 'low']),
    })
  ),
  healthStatus: z.enum(['good', 'attention', 'concern']),
  summary: z.string(),
});

export type BloodAnalysisResult = z.infer<typeof BloodAnalysisSchema>;

export interface BloodAIProvider {
  analyze(text: string, options?: Record<string, any>): Promise<BloodAnalysisResult>;
}

// ------------------- Open Source LLM Provider -------------------
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
        ...(options?.headers || {}),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Open source LLM API error: ${response.statusText}`);
    }

    const data = await response.json();
    return BloodAnalysisSchema.parse(data);
  }
}

// ------------------- OpenAI Provider -------------------
export class OpenAIBloodProvider implements BloodAIProvider {
  async analyze(text: string, options?: { apiKey?: string }): Promise<BloodAnalysisResult> {
    if (!options?.apiKey) throw new Error('OpenAI API key is required.');

    const prompt = AIAnalysisService.buildAnalysisPrompt(text);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${options.apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'You are a medical assistant. ONLY output valid JSON that matches the BloodAnalysisResult schema. Do not include explanations, markdown, or text outside the JSON object.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
      }),
    });

    if (!response.ok) throw new Error(`OpenAI API error: ${response.statusText}`);

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) throw new Error('No content returned from OpenAI');

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        throw new Error('Failed to parse OpenAI response as JSON');
      }
    }

    return BloodAnalysisSchema.parse(parsed);
  }
}

// ------------------- Analysis Service -------------------
export class AIAnalysisService {
  static async analyzeBloodReport(
    file: File,
    provider: BloodAIProvider,
    options?: Record<string, any>
  ): Promise<BloodAnalysisResult> {
    let extractedText = '';

    if (file.type === 'application/pdf') {
      extractedText = await this.extractTextFromPdf(file);
    } else {
      // For images, run OCR
      extractedText = await this.extractTextFromImage(file);
    }

    console.log('[AIAnalysisService] Extracted text:', extractedText);

    try {
      return await provider.analyze(extractedText, options);
    } catch (err) {
      console.error('[AIAnalysisService] Analysis error:', err);
      throw err;
    }
  }

  // ✅ PDF text extraction with pdfjs-dist v5.x
  private static async extractTextFromPdf(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let textContent = '';
    for (let i = 0; i < pdf.numPages; i++) {
      const page = await pdf.getPage(i + 1);
      const text = await page.getTextContent();
      textContent += text.items.map((item: any) => item.str).join(' ') + '\n';
    }

    return textContent;
  }

  // ✅ OCR fallback for images
  private static async extractTextFromImage(file: File): Promise<string> {
    const imageUrl = URL.createObjectURL(file);
    const { data } = await Tesseract.recognize(imageUrl, 'eng');
    return data.text;
  }

  static generateMockBloodType(): string {
    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    return bloodTypes[Math.floor(Math.random() * bloodTypes.length)];
  }

  static buildAnalysisPrompt(extractedText: string): string {
    return `
      Analyze the following blood test results and return ONLY valid JSON.

      JSON schema:
      {
        "bloodType": "string | optional",
        "keyFindings": "string[]",
        "supplements": [
          {
            "name": "string",
            "reason": "string",
            "dosage": "string | optional",
            "priority": "high | medium | low"
          }
        ],
        "healthStatus": "good | attention | concern",
        "summary": "string"
      }

      Blood test data: ${extractedText}
    `;
  }
}
