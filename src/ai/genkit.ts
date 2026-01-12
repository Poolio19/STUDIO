import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {firebase} from '@genkit-ai/firebase';
import {firebaseConfig} from '@/firebase/config';

export const ai = genkit({
  plugins: [
    googleAI(),
    firebase({
      projectId: firebaseConfig.projectId,
      credentials: {
        // Since we are running in a Google Cloud environment,
        // we can use the default credentials of the service account.
      },
    }),
  ],
  model: 'googleai/gemini-pro',
});
