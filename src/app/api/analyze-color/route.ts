import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { answers } = await request.json();
    
    console.log('🔍 Received quiz answers for preview analysis:', answers);

    // Fazer uma análise básica apenas para determinar qual estação (sem revelar)
    let previewSeason = 'spring'; // fallback
    
    // Lógica simples para dar uma "dica" da estação sem revelar
    const answersText = Object.values(answers).join(' ').toLowerCase();
    
    if (answersText.includes('warm') || answersText.includes('golden') || answersText.includes('bright')) {
      previewSeason = 'spring';
    } else if (answersText.includes('cool') || answersText.includes('soft') || answersText.includes('muted')) {
      previewSeason = 'summer';
    } else if (answersText.includes('deep') || answersText.includes('rich') || answersText.includes('earth')) {
      previewSeason = 'autumn';
    } else if (answersText.includes('contrast') || answersText.includes('bold') || answersText.includes('dramatic')) {
      previewSeason = 'winter';
    }

    console.log('🎭 Preview season determined:', previewSeason);

    // Retornar resultado "criptografado" com asteriscos em lilás
    const censoredResult = {
      season: '<span class="hh-censored-purple">*****</span>',
      confidence: '<span class="hh-censored-purple">**</span>%',
      reasoning: 'Based on your undertones and contrast, you belong to the <span class="hh-censored-purple">*****</span> palette. Click the link below to get your personalized plan.',
      isPreview: true,
      previewSeason,
      checkoutUrl: 'https://buy.stripe.com/test_28o5lq9Ry6Hn4Ug000',
      message: '🎉 Your Hair Harmony analysis is ready! Click below to unlock your complete color guide.',
      features: [
        'Complete seasonal color analysis',
        'Personalized hair color recommendations', 
        'Professional styling tips',
        'Instant PDF download'
      ]
    };

    console.log('✅ Returning censored preview result');
    return NextResponse.json(censoredResult);

  } catch (error) {
    console.error('❌ Error in preview analysis:', error);
    
    // Fallback response mesmo para erro
    return NextResponse.json({
      season: '<span class="hh-censored-purple">*****</span>',
      confidence: '<span class="hh-censored-purple">**</span>%',
      reasoning: 'Based on your undertones and contrast, you belong to the <span class="hh-censored-purple">*****</span> palette. Click the link below to get your personalized plan.',
      isPreview: true,
      previewSeason: 'spring',
      checkoutUrl: 'https://buy.stripe.com/test_28o5lq9Ry6Hn4Ug000',
      message: '🎉 Your Hair Harmony analysis is ready!',
      features: [
        'Complete seasonal color analysis',
        'Personalized hair color recommendations',
        'Professional styling tips', 
        'Instant PDF download'
      ]
    });
  }
}