import { config } from 'dotenv';
config();

import '@/ai/flows/calculate-prediction-scores.ts';
import '@/ai/flows/import-data-flow.ts';
import '@/ai/flows/update-match-results-flow.ts';
