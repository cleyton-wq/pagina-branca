import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { answers } = await request.json();

    if (!answers || typeof answers !== 'object') {
      return NextResponse.json(
        { error: 'Invalid answers provided' },
        { status: 400 }
      );
    }

    // Converter as respostas em texto organizado
    const answersText = formatAnswersForAnalysis(answers);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert in personal color analysis. Based on the quiz responses provided, determine which color season (spring, summer, autumn, or winter) best suits the person. Respond ONLY in JSON format with the exact structure: { \"season\": \"spring\" } (or summer/autumn/winter)."
        },
        {
          role: "user",
          content: `Analyze these personal color quiz responses and determine the best color season:

${answersText}

Choose ONLY one season: spring, summer, autumn, or winter. Respond ONLY in JSON format: { "season": "your_choice" }`
        }
      ],
      temperature: 0.3,
      max_tokens: 50,
    });

    const response = completion.choices[0]?.message?.content?.trim();
    
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    const result = JSON.parse(response);
    
    if (!result.season || !['spring', 'summer', 'autumn', 'winter'].includes(result.season)) {
      throw new Error('Invalid season returned');
    }

    return NextResponse.json({ season: result.season });

  } catch (error) {
    console.error('Error analyzing season:', error);
    
    // Fallback to winter if OpenAI fails
    return NextResponse.json({ season: 'winter' });
  }
}

function formatAnswersForAnalysis(answers: Record<number, string>): string {
  const questionLabels: Record<number, string> = {
    1: "Skin tone",
    2: "Natural hair color", 
    3: "Eye color",
    4: "Sun reaction",
    5: "Vein color",
    6: "Best clothing colors",
    7: "Best jewelry tone",
    8: "Desired color change",
    9: "Curious color family",
    10: "Season preference",
    11: "Additional considerations"
  };

  let formatted = "";
  
  for (const [questionId, answer] of Object.entries(answers)) {
    const id = parseInt(questionId);
    const label = questionLabels[id];
    
    if (label && answer && answer.trim()) {
      formatted += `${label}: ${answer}\n`;
    }
  }
  
  return formatted;
}