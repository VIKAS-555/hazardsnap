import { CATEGORY_METADATA, HazardCategory, HazardSeverity } from './types';

export interface AIAnalysisResult {
  category: HazardCategory;
  severity: HazardSeverity;
  severity_score: number;
  title: string;
  advisory: string;
  confidence: number;
}

/**
 * Calculates a composite severity score (0 - 100) based on category, description signals,
 * and commuter density factors.
 */
export function calculateHybridSeverity(
  category: HazardCategory,
  description?: string,
  extraFactors?: { nearSchoolOrHospital?: boolean; nightTime?: boolean; upvotes?: number }
): { severity: HazardSeverity; score: number } {
  const meta = CATEGORY_METADATA[category] || CATEGORY_METADATA.other;
  let score = meta.baseScore;

  if (description) {
    const lower = description.toLowerCase();
    // Keywords indicating elevated danger
    if (lower.includes('spark') || lower.includes('smoke') || lower.includes('deep') || lower.includes('fallen') || lower.includes('child') || lower.includes('accident')) {
      score += 6;
    }
    if (lower.includes('submerged') || lower.includes('collapse') || lower.includes('trap')) {
      score += 5;
    }
  }

  if (extraFactors?.nearSchoolOrHospital) score += 5;
  if (extraFactors?.nightTime) score += 4;
  if (extraFactors?.upvotes) score += Math.min(10, Math.floor(extraFactors.upvotes / 2));

  // Clamp 0 - 100
  score = Math.max(10, Math.min(100, score));

  let severity: HazardSeverity = 'low';
  if (score >= 90) severity = 'critical';
  else if (score >= 75) severity = 'high';
  else if (score >= 50) severity = 'medium';

  return { severity, score };
}

/**
 * Optional Gemini AI Vision classifier for hazard photos.
 * If API key is not present, falls back gracefully to smart heuristic detection.
 */
export async function analyzeHazardWithAI(
  imageBase64: string,
  userNotes?: string
): Promise<AIAnalysisResult> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (apiKey) {
    try {
      const prompt = `Analyze this civic road/urban hazard photo for a municipal emergency response system. 
Identify which category it best fits: 'live_wire', 'open_manhole', 'waterlogging', 'broken_footpath', 'sinkhole', 'fallen_tree', or 'other'.
Rate severity ('critical', 'high', 'medium', 'low') and danger score (1-100).
Provide a concise title and 1-sentence commuter advisory.
Respond strictly in JSON format:
{
  "category": "category_name",
  "severity": "critical|high|medium|low",
  "severity_score": 90,
  "title": "Concise Hazard Title",
  "advisory": "Commuter advisory message",
  "confidence": 0.95
}`;

      // Call Google Gemini API
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt + (userNotes ? ` Additional citizen note: "${userNotes}"` : '') },
                  {
                    inline_data: {
                      mime_type: 'image/jpeg',
                      data: cleanBase64,
                    },
                  },
                ],
              },
            ],
          }),
        }
      );

      const json = await response.json();
      const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        return {
          category: parsed.category || 'other',
          severity: parsed.severity || 'high',
          severity_score: Number(parsed.severity_score) || 75,
          title: parsed.title || 'Civic Hazard Detected',
          advisory: parsed.advisory || 'Exercise extreme caution when passing this point.',
          confidence: Number(parsed.confidence) || 0.9,
        };
      }
    } catch (err) {
      console.warn('Gemini AI API call failed or timed out, using fallback heuristics:', err);
    }
  }

  // Graceful rule-based smart fallback when no API key is set
  let detectedCategory: HazardCategory = 'open_manhole';
  if (userNotes) {
    const l = userNotes.toLowerCase();
    if (l.includes('wire') || l.includes('electric') || l.includes('shock') || l.includes('spark')) {
      detectedCategory = 'live_wire';
    } else if (l.includes('water') || l.includes('flood') || l.includes('drain') || l.includes('rain')) {
      detectedCategory = 'waterlogging';
    } else if (l.includes('footpath') || l.includes('pavement') || l.includes('walk') || l.includes('curb')) {
      detectedCategory = 'broken_footpath';
    } else if (l.includes('tree') || l.includes('branch')) {
      detectedCategory = 'fallen_tree';
    } else if (l.includes('sink') || l.includes('hole') || l.includes('cave')) {
      detectedCategory = 'sinkhole';
    }
  }

  const meta = CATEGORY_METADATA[detectedCategory];
  const { severity, score } = calculateHybridSeverity(detectedCategory, userNotes);

  return {
    category: detectedCategory,
    severity,
    severity_score: score,
    title: `${meta.label} Detected`,
    advisory: `Caution: ${meta.description}. Avoid proximity.`,
    confidence: 0.88,
  };
}
