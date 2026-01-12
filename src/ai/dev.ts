
'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/calculate-prediction-scores.ts';
import '@/ai/flows/update-all-data-flow.ts';
import '@/ai/flows/reimport-fixtures-flow.ts';
import '@/ai/flows/update-match-results-flow.ts';
import '@/ai/flows/import-past-fixtures-flow.ts';
