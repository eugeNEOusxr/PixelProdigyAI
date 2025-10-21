import 'dotenv/config';
import process from 'process';
import express, { Request, Response } from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();
app.use(cors());
app.use(express.json());

const openaiApiKey = process.env.OPENAI_API_KEY;
const geminiApiKey = process.env.GEMINI_API_KEY;

if (!openaiApiKey) {
  console.warn('Warning: OPENAI_API_KEY is not set in environment variables');
}

if (!geminiApiKey) {
  console.warn('Warning: GEMINI_API_KEY is not set in environment variables');
}

const openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;
const gemini = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null;

app.post('/api/openai', async (req: Request, res: Response) => {
  try {
    if (!openai) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }
    
    const { prompt } = req.body;
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500
    });
    res.json(response);
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/gemini', async (req: Request, res: Response) => {
  try {
    if (!gemini) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }
    
    const { prompt } = req.body;
    const model = gemini.getGenerativeModel({ model: 'gemini-1.5-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    res.json({
      candidates: [{
        content: {
          parts: [{ text: response.text() }]
        }
      }]
    });
  } catch (error: any) {
    console.error('Gemini API error:', error);
    res.status(500).json({ error: error.message });
  }
});

const port = Number(process.env.PORT) || 3000;

app.listen(port, () => {
  console.log(`✅ Server listening on http://localhost:${port}`);
  console.log(`OpenAI configured: ${!!openai}`);
  console.log(`Gemini configured: ${!!gemini}`);
});