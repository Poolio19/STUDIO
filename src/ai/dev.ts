'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/import-past-fixtures-flow.ts';
import '@/ai/flows/update-match-results-flow.ts';
import '@/ai/flows/test-db-write-flow.ts';
import '@/ai/flows/create-results-file-flow.ts';
import '@/ai/flows/import-results-file-flow.ts';
