import 'dotenv/config';
import process from 'process';
import express, { Request, Response } from 'express';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/openai', async (req: Request, res: Response) => {
  const { prompt } = req.body;
  const response = await openai.responses.create({ model: 'gpt-4.1', input: prompt });
  res.json(response);
});

app.post('/api/gemini', async (req: Request, res: Response) => {
  const { prompt } = req.body;
  const model = gemini.getGenerativeModel({ model: 'gemini-1.5-pro' });
  const { response } = await model.generateContent(prompt);
  res.json(response);
});