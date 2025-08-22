import { config } from 'dotenv';
config();

import '@/ai/flows/detect-scam-messages.ts';
import '@/ai/flows/cross-verify-fake-news.ts';
import '@/ai/flows/translate-text.ts';
