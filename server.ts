import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { classifyIssueLocally, DEPARTMENT_MAPPING } from './src/lib/classifier.ts';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Body parsing with support for image base64
app.use(express.json({ limit: '15mb' }));

// Dynamic Gemini SDK getter
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI | null {
  if (aiClient) return aiClient;
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
      return aiClient;
    } catch (err) {
      console.warn('Failed to initialize GoogleGenAI client on server:', err);
    }
  }
  return null;
}

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    appName: 'Campus Guard',
    timestamp: new Date().toISOString(),
    aiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});

// AI issue classification endpoint
app.post('/api/classify', async (req, res) => {
  const {
    issueTitle = '',
    description = '',
    selectedCategory = '',
    imageBase64 = null,
    mimeType = 'image/jpeg',
  } = req.body;

  if (!issueTitle && !description) {
    return res.status(400).json({
      error: 'Please provide an issue title or description for classification.',
    });
  }

  // Fallback function generator
  const getFallback = () => {
    const fallback = classifyIssueLocally(issueTitle, description, selectedCategory);
    return {
      ...fallback,
      isFallback: true,
      note: 'Processed via local classification engine',
    };
  };

  const client = getAiClient();
  // If no Gemini API key or client not initialized, fallback immediately
  if (!client || !process.env.GEMINI_API_KEY) {
    return res.json(getFallback());
  }

  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('AI classification timed out')), 7000)
    );

    const classifyTask = (async () => {
      const allowedCategories = [
        'Electrical',
        'Plumbing',
        'Furniture',
        'Cleanliness',
        'Infrastructure',
        'Ventilation',
        'Classroom',
        'Laboratory',
        'Washroom',
        'Security',
        'Network / Internet',
        'Other',
      ];

      const parts: any[] = [];

      // If multimodal image data is provided
      if (imageBase64) {
        const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
        parts.push({
          inlineData: {
            mimeType: mimeType || 'image/jpeg',
            data: cleanBase64,
          },
        });
      }

      const promptText = `
You are the AI triage assistant for "Campus Guard", a university facility management system.
Analyze the following campus issue report and classify it accurately:

Title: "${issueTitle}"
Description: "${description}"
User Selected Category Hint: "${selectedCategory || 'None'}"

Categorize the issue into one of these exact categories:
${allowedCategories.join(', ')}

Assign urgency: "Low", "Medium", "High", or "Critical".
Route to the appropriate college department:
- Electrical -> Electrical Department
- Plumbing -> Plumbing & Water Maintenance
- Furniture -> Maintenance Department
- Cleanliness -> Housekeeping Department
- Infrastructure -> Civil Infrastructure & Estate
- Ventilation -> HVAC & Maintenance
- Classroom -> Academic Administration
- Laboratory -> Lab Administration
- Washroom -> Housekeeping & Sanitation
- Security -> Campus Security Department
- Network / Internet -> IT & Network Services
- Other -> General Campus Administration

Provide a concise 1-2 sentence reason for the classification, and an estimated confidence score between 0 and 100.
If uncertain or ambiguous, use "Other" and state "Needs Staff Review".
      `;

      parts.push({ text: promptText });

      const response = await client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: { parts },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: {
                type: Type.STRING,
                description: 'The classified issue category',
              },
              urgency: {
                type: Type.STRING,
                description: 'Urgency level (Low, Medium, High, Critical)',
              },
              department: {
                type: Type.STRING,
                description: 'Handling department name',
              },
              reason: {
                type: Type.STRING,
                description: 'Brief explanation for this classification',
              },
              confidence: {
                type: Type.NUMBER,
                description: 'Confidence percentage from 0 to 100',
              },
            },
            required: ['category', 'urgency', 'department', 'reason', 'confidence'],
          },
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error('Empty response received from Gemini.');
      }

      const parsed = JSON.parse(responseText);

      // Validate parsed values
      const validCategory = allowedCategories.includes(parsed.category)
        ? parsed.category
        : 'Other';

      const validUrgency = ['Low', 'Medium', 'High', 'Critical'].includes(parsed.urgency)
        ? parsed.urgency
        : 'Medium';

      const validDepartment =
        parsed.department || DEPARTMENT_MAPPING[validCategory] || 'General Campus Administration';

      return {
        category: validCategory,
        urgency: validUrgency,
        department: validDepartment,
        reason: parsed.reason || 'Classified by Campus Guard AI.',
        confidence: Math.min(100, Math.max(10, Math.round(parsed.confidence || 85))),
        isFallback: false,
      };
    })();

    const result = await Promise.race([classifyTask, timeoutPromise]);
    return res.json(result);
  } catch (error) {
    console.warn('AI classification failed or timed out. Falling back to local classifier:', error);
    return res.json(getFallback());
  }
});

// Setup Vite middleware in dev or static files in prod
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Campus Guard server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
