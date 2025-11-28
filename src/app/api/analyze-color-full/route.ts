import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const PDF_BY_SEASON = {
  spring: 'https://drive.google.com/file/d/1pWvcD-rMgWPSwFZVel3CUJCZx5rF3AZ_/view?usp=sharing',
  summer: 'https://drive.google.com/file/d/1QVXHuP4cWhBqWPv_LthyksIT0Ql-n9XB/view?usp=sharing',
  autumn: 'https://drive.google.com/file/d/1MFJ34KIvvSQJneooc_Goyjqe_yYtyj-7/view?usp=sharing',
  winter: 'https://drive.google.com/file/d/1sO2MifVy1hkUfJT-vt4DrSsd-LcH32rS/view?usp=sharing',
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { answers } = await request.json();
    
    console.log('🔍 Received quiz answers for full analysis:', answers);

    if (!process.env.OPENAI_API_KEY) {
      console.log('⚠️ No OpenAI API key found, using improved fallback analysis');
      return getImprovedFallbackAnalysis(answers);
    }

    try {
      // Preparar prompt detalhado para OpenAI
      const prompt = `
You are a professional color analyst specializing in seasonal color analysis. Analyze these quiz responses and determine the person's color season.

Quiz Responses:
1. Skin tone: ${answers[1] || 'not answered'}
2. Hair color: ${answers[2] || 'not answered'}
3. Eye color: ${answers[3] || 'not answered'}
4. Sun reaction: ${answers[4] || 'not answered'}
5. Vein color: ${answers[5] || 'not answered'}
6. Clothing colors that suit you: ${answers[6] || 'not answered'}
7. Jewelry preference: ${answers[7] || 'not answered'}
8. Lipstick preference: ${answers[8] || 'not answered'}
9. Hair color preference: ${answers[9] || 'not answered'}
10. Favorite season: ${answers[10] || 'not answered'}

Based on these responses, determine:
- SPRING: Warm undertones, light-medium contrast, clear bright colors
- SUMMER: Cool undertones, low-medium contrast, soft muted colors  
- AUTUMN: Warm undertones, medium-high contrast, rich earthy colors
- WINTER: Cool undertones, high contrast, deep vivid colors

Respond with ONLY a valid JSON object:
{
  "season": "spring|summer|autumn|winter",
  "confidence": 85,
  "reasoning": "Detailed explanation based on undertones, contrast, and color harmony"
}
`;

      console.log('🤖 Calling OpenAI with detailed prompt...');
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a professional color analyst. Analyze the quiz responses and respond with valid JSON only. Focus on undertones (warm/cool) and contrast levels (low/high)."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 400,
      });

      const responseText = completion.choices[0]?.message?.content;
      console.log('🤖 OpenAI raw response:', responseText);

      if (!responseText) {
        throw new Error('No response from OpenAI');
      }

      // Parse JSON response
      let analysisResult;
      try {
        analysisResult = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Failed to parse OpenAI JSON response:', parseError);
        throw new Error('Invalid JSON from OpenAI');
      }
      
      // Validate response
      if (!analysisResult.season || !['spring', 'summer', 'autumn', 'winter'].includes(analysisResult.season.toLowerCase())) {
        console.error('❌ Invalid season in OpenAI response:', analysisResult.season);
        throw new Error('Invalid season in OpenAI response');
      }

      // Add PDF URL and metadata
      const season = analysisResult.season.toLowerCase();
      const finalResult = {
        season,
        confidence: analysisResult.confidence || 85,
        reasoning: analysisResult.reasoning || `Based on your quiz responses, you belong to the ${season} color palette.`,
        pdfUrl: PDF_BY_SEASON[season as keyof typeof PDF_BY_SEASON],
        fullAnalysis: true,
        timestamp: new Date().toISOString()
      };

      console.log('✅ OpenAI analysis completed successfully:', finalResult);
      return NextResponse.json(finalResult);

    } catch (openaiError) {
      console.error('❌ OpenAI analysis failed:', openaiError);
      console.log('🔄 Falling back to improved local analysis...');
      return getImprovedFallbackAnalysis(answers);
    }

  } catch (error) {
    console.error('❌ Error in full analysis:', error);
    return getImprovedFallbackAnalysis({});
  }
}

function getImprovedFallbackAnalysis(answers: Record<string, string>) {
  console.log('🔄 Using improved fallback analysis for answers:', answers);
  
  let springScore = 0;
  let summerScore = 0;
  let autumnScore = 0;
  let winterScore = 0;

  // Análise detalhada baseada nas respostas
  const skinTone = answers[1];
  const hairColor = answers[2];
  const eyeColor = answers[3];
  const sunReaction = answers[4];
  const veinColor = answers[5];
  const clothingColors = answers[6];
  const jewelry = answers[7];
  const seasonPref = answers[10];

  // Skin tone analysis
  if (skinTone === 'fair-pink') springScore += 3;
  if (skinTone === 'light-neutral') summerScore += 3;
  if (skinTone === 'warm-tan' || skinTone === 'medium-olive') autumnScore += 3;
  if (skinTone === 'deep-brown') winterScore += 3;

  // Hair color analysis
  if (hairColor === 'blonde') springScore += 3;
  if (hairColor === 'light-brown') summerScore += 2;
  if (hairColor === 'dark-brown' || hairColor === 'red') autumnScore += 3;
  if (hairColor === 'black') winterScore += 3;

  // Eye color analysis
  if (eyeColor === 'blue' || eyeColor === 'green') springScore += 2;
  if (eyeColor === 'light-brown') summerScore += 2;
  if (eyeColor === 'dark-brown') autumnScore += 2;
  if (eyeColor === 'black') winterScore += 3;

  // Clothing colors analysis
  if (clothingColors === 'soft-pastels') {
    springScore += 2;
    summerScore += 2;
  }
  if (clothingColors === 'warm-tones') autumnScore += 3;
  if (clothingColors === 'deep-rich') {
    autumnScore += 1;
    winterScore += 2;
  }
  if (clothingColors === 'bright-vivid') {
    springScore += 1;
    winterScore += 2;
  }
  if (clothingColors === 'cool-tones') {
    summerScore += 2;
    winterScore += 3;
  }

  // Jewelry preference
  if (jewelry === 'gold') {
    springScore += 2;
    autumnScore += 2;
  }
  if (jewelry === 'silver') {
    summerScore += 2;
    winterScore += 2;
  }

  // Season preference
  if (seasonPref === 'spring') springScore += 2;
  if (seasonPref === 'summer') summerScore += 2;
  if (seasonPref === 'autumn') autumnScore += 2;
  if (seasonPref === 'winter') winterScore += 2;

  // Determine winner
  const scores = {
    spring: springScore,
    summer: summerScore,
    autumn: autumnScore,
    winter: winterScore
  };

  console.log('📊 Fallback analysis scores:', scores);

  const maxScore = Math.max(...Object.values(scores));
  const winner = Object.entries(scores).find(([_, score]) => score === maxScore)?.[0] as keyof typeof PDF_BY_SEASON;

  const determinedSeason = winner || 'spring';
  const confidence = Math.min(95, Math.max(70, maxScore * 8)); // Convert score to confidence percentage

  const fallbackResult = {
    season: determinedSeason,
    confidence,
    reasoning: `Based on your responses (skin: ${skinTone}, hair: ${hairColor}, eyes: ${eyeColor}, clothing: ${clothingColors}), you belong to the ${determinedSeason} palette. This analysis considers your undertones, contrast levels, and color preferences.`,
    pdfUrl: PDF_BY_SEASON[determinedSeason],
    fullAnalysis: false,
    fallback: true,
    timestamp: new Date().toISOString()
  };

  console.log('🎯 Improved fallback analysis result:', fallbackResult);
  return NextResponse.json(fallbackResult);
}