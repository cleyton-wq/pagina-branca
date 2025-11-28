'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronRight, ChevronLeft, Download } from 'lucide-react';
import { quizQuestions, type QuizQuestion, seasonPDFs, type ColorSeason } from '@/lib/quiz-data';
import { analyzeColorSeason, type QuizAnswers } from '@/lib/quiz-logic';

type Season = 'spring' | 'summer' | 'autumn' | 'winter';

// PDF mapping for results page
const PDF_BY_SEASON = {
  spring: "https://drive.google.com/file/d/1pWvcD-rMgWPSwFZVel3CUJCZx5rF3AZ_/view?usp=sharing",
  summer: "https://drive.google.com/file/d/1QVXHuP4cWhBqWPv_LthyksIT0Ql-n9XB/view?usp=sharing",
  autumn: "https://drive.google.com/file/d/1MFJ34KIvvSQJneooc_Goyjqe_yYtyj-7/view?usp=sharing",
  winter: "https://drive.google.com/file/d/1sO2MifVy1hkUfJT-vt4DrSsd-LcH32rS/view?usp=sharing",
};

// Utilidade segura para nova guia com fallbacks (Safari / iframe / bloqueio popup)
function openInNewTab(url: string) {
  // 1) Tenta popup direto (permitido pois é user-gesture: clique no botão)
  const w = window.open(url, '_blank', 'noopener');
  if (w && !w.closed) { try { w.opener = null; } catch(_) {} return; }

  // 2) Fallback: ancora invisível com target _blank
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  a.remove();

  // 3) Último recurso: mesma aba
  setTimeout(() => { window.location.href = url; }, 50);
}

/** Deve usar a lógica já existente do quiz.
 *  No final, retornar sempre uma destas strings minúsculas.
 *  Se der indeterminado, usar 'spring' como fallback. */
function resolveSeasonFromAnswers(answers: QuizAnswers): Season {
  // USE a lógica existente do app para calcular a season.
  // Apenas garanta o retorno como 'spring' | 'summer' | 'autumn' | 'winter'.
  const season = analyzeColorSeason(answers);
  return (season ?? 'spring') as Season;
}

// Função para destacar palavras das estações em lilás
function highlightSeasonWords(text: string): React.ReactElement {
  const seasons = ['spring', 'summer', 'autumn', 'winter', 'Spring', 'Summer', 'Autumn', 'Winter'];
  
  let highlightedText = text;
  seasons.forEach(season => {
    const regex = new RegExp(`\\b${season}\\b`, 'gi');
    highlightedText = highlightedText.replace(regex, `<span class="season-highlight">${season}</span>`);
  });
  
  return <span dangerouslySetInnerHTML={{ __html: highlightedText }} />;
}

export default function HomePage() {
  const [currentStep, setCurrentStep] = useState<'landing' | 'quiz' | 'result-success' | 'result-cancel'>('landing');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [isLoading, setIsLoading] = useState(false);
  const [detectedSeason, setDetectedSeason] = useState<Season>('spring');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);
  const quizRef = useRef<HTMLDivElement>(null);

  // Function to analyze answers with OpenAI FULL API
  const analyzeWithOpenAI = async (quizAnswers: QuizAnswers) => {
    console.log('🤖 Starting OpenAI analysis with answers:', quizAnswers);
    
    try {
      console.log('📡 Making request to /api/analyze-color-full...');
      
      const response = await fetch('/api/analyze-color-full', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers: quizAnswers }),
      });

      console.log('📡 OpenAI API Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ OpenAI API Error response:', errorText);
        throw new Error(`OpenAI analysis failed with status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ OpenAI Analysis result:', result);
      
      // Validate the result
      if (!result.season || !['spring', 'summer', 'autumn', 'winter'].includes(result.season)) {
        console.error('❌ Invalid season returned from OpenAI:', result.season);
        throw new Error('Invalid season returned from OpenAI');
      }

      const finalResult = {
        season: result.season,
        confidence: result.confidence || 85,
        reasoning: result.reasoning || "Complete AI analysis performed successfully",
        pdfUrl: PDF_BY_SEASON[result.season as keyof typeof PDF_BY_SEASON],
        fullAnalysis: true,
        timestamp: new Date().toISOString()
      };

      console.log('💾 Saving OpenAI result to cache:', finalResult);
      
      // SAVE TO CACHE
      localStorage.setItem('openai_analysis_result', JSON.stringify(finalResult));
      localStorage.setItem('hh_result', finalResult.season);
      
      return finalResult;
      
    } catch (error) {
      console.error('❌ OpenAI Analysis failed:', error);
      
      // Fallback to local analysis
      console.log('🔄 Using fallback local analysis...');
      const season = resolveSeasonFromAnswers(quizAnswers);
      console.log('🎯 Fallback season result:', season);
      
      const fallbackResult = {
        season,
        confidence: 75,
        reasoning: "Based on your undertones and contrast, you belong to the ***** palette. Click the link below to get your personalized plan.",
        pdfUrl: PDF_BY_SEASON[season],
        fullAnalysis: false,
        fallback: true,
        timestamp: new Date().toISOString()
      };
      
      // SAVE FALLBACK TO CACHE
      localStorage.setItem('openai_analysis_result', JSON.stringify(fallbackResult));
      localStorage.setItem('hh_result', fallbackResult.season);
      
      return fallbackResult;
    }
  };

  // Check URL params on component mount and redirect if needed
  useEffect(() => {
    setIsClient(true);
    
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success') === 'true';
    const cancel = urlParams.get('cancel') === 'true';

    // REDIRECIONAMENTO AUTOMÁTICO PARA /result - CORRIGIDO
    if (success) {
      console.log('🔄 Stripe success detected, redirecting to /result?success=true');
      // Usar replace para não criar entrada no histórico
      window.location.replace('/result?success=true');
      return;
    } 
    
    if (cancel) {
      console.log('🔄 Stripe cancel detected, redirecting to /result?cancel=true');
      // Usar replace para não criar entrada no histórico
      window.location.replace('/result?cancel=true');
      return;
    }
  }, []);

  const handleStartQuiz = () => {
    setCurrentStep('quiz');
    setTimeout(() => {
      quizRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleAnswer = (questionId: number, value: string) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);
    
    // Save answers to localStorage for persistence
    localStorage.setItem('quizAnswers', JSON.stringify(newAnswers));
    console.log('💾 Saved answer for question', questionId, ':', value);
  };

  const handleNext = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  // Handler for "Get My Results" button - NOW ANALYZES WITH OPENAI AND CACHES
  const handleGetResults = async () => {
    console.log('🛒 Starting OpenAI analysis with current answers:', answers);
    
    setIsLoading(true);
    
    try {
      // Analyze with OpenAI immediately and cache result
      console.log('🤖 Calling OpenAI analysis and caching...');
      const result = await analyzeWithOpenAI(answers);
      console.log('🎉 OpenAI Analysis completed and cached:', result);
      
      setAnalysisResult(result);
      setDetectedSeason(result.season);
      setCurrentStep('result-success');
      
      // Trigger confetti if available
      if (typeof window !== 'undefined' && (window as any).confetti) {
        setTimeout(() => {
          (window as any).confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        }, 500);
      }
    } catch (error) {
      console.error('💥 OpenAI Analysis failed completely:', error);
      setCurrentStep('result-cancel');
    } finally {
      setIsLoading(false);
    }
  };

  const currentQuestionData = quizQuestions[currentQuestion];
  
  // Check if current question is answered (considering optional questions)
  // Question 11 (index 10) is always optional
  const isAnswered = () => {
    if (!currentQuestionData) return false;
    
    // Question 11 (id: 11) is optional
    if (currentQuestionData.id === 11) {
      return true; // Always allow proceeding from Q11
    }
    
    // For all other questions, check if answered
    return answers[currentQuestionData.id] !== undefined && answers[currentQuestionData.id] !== '';
  };
  
  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;

  // Result Success Page
  if (currentStep === 'result-success') {
    if (isLoading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-[#F8ECF6] to-[#ECE6FF] flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Analyzing your color season with AI...</p>
          </div>
        </div>
      );
    }

    return (
      <>
        <style jsx global>{`
          /* PROMPT A - Visual styling for results page */
          body {
            background: linear-gradient(135deg, #F8ECF6 0%, #ECE6FF 100%);
            min-height: 100vh;
          }
          
          .hh-results-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem 1rem;
            flex-direction: column;
          }
          
          .hh-results-card {
            background: #FFFFFF;
            border-radius: 22px;
            padding: 28px;
            box-shadow: 0 10px 28px rgba(0,0,0,0.08);
            max-width: 680px;
            width: 100%;
            text-align: center;
          }
          
          .hh-results-title {
            font-family: 'Gilda Display', serif;
            font-weight: 800;
            font-size: clamp(2.4rem, 5vw, 3.2rem);
            line-height: 1.1;
            margin: 0 0 0.75rem 0;
            background: linear-gradient(90deg, #A855F7, #EC4899);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          
          .hh-results-subtitle {
            color: #1F2937;
            font-weight: 700;
            font-size: 1.2rem;
            margin: 0 0 1.5rem 0;
          }
          
          .hh-results-banner {
            color: #7c3aed;
            font-weight: 800;
            font-size: 1.25rem;
            margin: 0.5rem 0 1rem 0;
          }
          
          .hh-results-description {
            color: #374151;
            margin: 0.25rem 0 1rem 0;
          }
          
          .hh-results-list {
            list-style: none;
            margin: 0 auto 1.25rem auto;
            padding: 0;
            color: #374151;
          }
          
          .hh-results-list li {
            margin: 0.35rem 0;
          }
          
          .hh-results-callout {
            background: linear-gradient(180deg, rgba(147,51,234,0.06), rgba(236,72,153,0.06));
            border: 1px solid rgba(147,51,234,0.12);
            border-radius: 12px;
            padding: 16px 20px;
            margin: 1rem 0 1.5rem 0;
            color: #374151;
            text-align: left;
            font-size: 1.1em; /* +10% font size */
            font-weight: 600; /* increased global weight */
          }
          
          .hh-results-callout strong {
            color: #374151;
          }
          
          /* Highlight season terms in callout - LILAC COLOR */
          .season-highlight {
            font-weight: 700 !important;
            color: #A855F7 !important; /* Lilás */
          }
          
          .hh-censored-purple {
            color: #B9A7FF !important;
            font-family: 'Courier New', monospace !important;
            font-weight: bold !important;
            font-size: 1.2em !important;
            letter-spacing: 2px !important;
            text-shadow: 0 0 8px rgba(185, 167, 255, 0.3) !important;
          }
          
          .hh-download-btn {
            background: linear-gradient(90deg, #EC4899, #A855F7);
            color: #fff !important;
            font-weight: 800;
            border-radius: 12px;
            padding: 14px 18px;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            box-shadow: 0 10px 22px rgba(168,85,247,0.25);
            text-decoration: none !important;
            border: none;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          
          .hh-download-btn:hover {
            filter: brightness(1.05);
            transform: translateY(-1px);
          }
          
          .hh-payment-btn {
            background: linear-gradient(90deg, #E91E63, #9C27B0) !important; /* Cores mais vivas */
            color: #fff !important;
            font-weight: 800;
            border-radius: 16px;
            padding: 16px 24px;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            box-shadow: 0 12px 32px rgba(233,30,99,0.4) !important; /* Sombra mais intensa */
            text-decoration: none !important;
            border: none;
            cursor: pointer;
            transition: all 0.15s ease;
            margin-top: 1rem;
            font-size: 16px;
            animation: hhPulse 2.5s ease-in-out infinite; /* Animação de pulsar */
          }
          
          .hh-payment-btn:hover {
            filter: brightness(1.12) !important;
            transform: translateY(-2px) scale(1.02) !important;
            box-shadow: 0 16px 40px rgba(233,30,99,0.5) !important;
            animation-play-state: paused; /* Para a animação no hover */
          }
          
          /* Animação de pulsar suave */
          @keyframes hhPulse {
            0%, 100% { 
              box-shadow: 0 12px 32px rgba(233,30,99,0.4);
              transform: scale(1);
            }
            50% { 
              box-shadow: 0 16px 40px rgba(233,30,99,0.5);
              transform: scale(1.02);
            }
          }
          
          /* Respeitar preferências de movimento reduzido */
          @media (prefers-reduced-motion: reduce) {
            .hh-payment-btn {
              animation: none !important;
            }
          }
          
          /* Footer styling */
          .hh-results-footer {
            margin-top: 2rem;
            text-align: center;
            font-size: 12px;
            color: #6B7280;
            letter-spacing: 0.025em;
          }
          
          .hh-results-footer a {
            color: #6B7280;
            text-decoration: none;
          }
          
          .hh-results-footer a:hover {
            text-decoration: underline;
          }
          
          /* Decorative carousel */
          .hh-results-carousel {
            margin-top: 2.5rem;
            margin-bottom: 3rem;
            display: flex;
            justify-content: center;
            overflow: hidden;
            position: relative;
          }
          
          .hh-results-carousel-track {
            display: flex;
            gap: 0.75rem;
            align-items: center;
            animation: hhResultsScroll 30s linear infinite;
            will-change: transform;
          }
          
          .hh-results-carousel img {
            width: 88px;
            height: 88px;
            border-radius: 14px;
            object-fit: cover;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transition: transform 0.25s ease;
          }
          
          .hh-results-carousel img:hover {
            transform: scale(1.05) translateY(-2px);
          }
          
          @keyframes hhResultsScroll {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }
          
          @media (max-width: 640px) {
            .hh-results-carousel-track {
              animation-duration: 36s;
            }
            .hh-results-carousel img {
              width: 72px;
              height: 72px;
            }
          }
          
          @media (prefers-reduced-motion: reduce) {
            .hh-results-carousel-track {
              animation: none !important;
            }
            .hh-results-carousel img {
              transition: none;
            }
          }
        `}</style>
        
        <div className="hh-results-container">
          <div className="hh-results-card">
            <h1 className="hh-results-title">
              Congratulations!
            </h1>
            <div className="hh-results-subtitle">
              Your Personalized Hair Harmony Report
            </div>
            <div className="hh-results-banner">
              We've Discovered Your Perfect Color Season!
            </div>
            <p className="hh-results-description">
              Get instant access to your detailed analysis, hair color guide, and beauty insights.
            </p>
            <ul className="hh-results-list">
              <li>✨ Personalized hair color season analysis</li>
              <li>🎨 Complete hair color recommendations</li>
              <li>⚡ Instant digital delivery</li>
            </ul>
            <div className="hh-results-callout">
              <strong>Why this fits you:</strong><br/>
              <span dangerouslySetInnerHTML={{ __html: 'Based on your undertones and contrast, you belong to the <span class="hh-censored-purple">*****</span> palette. Click the link below to get your personalized plan.' }} />
            </div>
            
            {/* Payment Button */}
            <a
              href="https://buy.stripe.com/fZudR85QV3iU7mgeTJeAg02"
              target="_blank"
              rel="noopener noreferrer"
              className="hh-payment-btn"
            >
              <Download className="w-5 h-5" />
              Download My Color Guide (PDF)
            </a>
            
            <p className="text-sm text-gray-500 mt-4">
              Complete your purchase to download your personalized PDF guide
            </p>
          </div>
          
          {/* Footer */}
          <div className="hh-results-footer">
            Hair Harmony™ | Personalized Color Analysis by Fabio Lima — <a href="https://www.fabiolimahair.com" target="_blank" rel="noopener noreferrer">www.fabiolimahair.com</a>
          </div>
          
          {/* Decorative Carousel */}
          <div className="hh-results-carousel" aria-hidden="true">
            <div className="hh-results-carousel-track">
              <img src="https://storage.tally.so/aeb556ff-b634-455f-bf96-03c536791c1c/Lucid_Origin_Hyperrealistic_beauty_portrait_of_a_woman_with_li_3.jpg" alt="" loading="lazy" />
              <img src="https://storage.tally.so/9688cee2-5bcd-4f48-bc15-4e8f101f3273/Lucid_Origin_Hyperrealistic_portrait_of_a_woman_with_medium_ol_2.jpg" alt="" loading="lazy" />
              <img src="https://storage.tally.so/22d701b3-5fe1-4602-b3e2-c89d19740477/Lucid_Origin_Hyperrealistic_portrait_of_a_woman_with_warm_tan__1.jpg" alt="" loading="lazy" />
              <img src="https://storage.tally.so/bc126d72-2d09-47b9-9d8a-fd51cdd81d0d/Lucid_Origin_Hyperrealistic_portrait_of_a_woman_with_deep_brow_0.jpg" alt="" loading="lazy" />
              {/* Duplicated for seamless loop */}
              <img src="https://storage.tally.so/aeb556ff-b634-455f-bf96-03c536791c1c/Lucid_Origin_Hyperrealistic_beauty_portrait_of_a_woman_with_li_3.jpg" alt="" loading="lazy" />
              <img src="https://storage.tally.so/9688cee2-5bcd-4f48-bc15-4e8f101f3273/Lucid_Origin_Hyperrealistic_portrait_of_a_woman_with_medium_ol_2.jpg" alt="" loading="lazy" />
              <img src="https://storage.tally.so/22d701b3-5fe1-4602-b3e2-c89d19740477/Lucid_Origin_Hyperrealistic_portrait_of_a_woman_with_warm_tan__1.jpg" alt="" loading="lazy" />
              <img src="https://storage.tally.so/bc126d72-2d09-47b9-9d8a-fd51cdd81d0d/Lucid_Origin_Hyperrealistic_portrait_of_a_woman_with_deep_brow_0.jpg" alt="" loading="lazy" />
            </div>
          </div>
        </div>
      </>
    );
  }

  // Result Cancel Page
  if (currentStep === 'result-cancel') {
    return (
      <>
        <style jsx global>{`
          /* Brand tokens (same palette used no quiz) */
          :root {
            --bg1: #F8ECF6;  /* soft pink */
            --bg2: #ECE6FF;  /* lilac */
            --ink: #2A2A2A;
            --body: #4A4A4A;
            --ring: #E6E0FF;
            --g1: #F6A6D6;   /* button gradient start */
            --g2: #B9A7FF;   /* button gradient end */
            --card: #FFFFFF;
            --radius: 18px;
            --shadow: 0 16px 48px rgba(42,42,42,.10);
          }

          /* Background equal to quiz */
          .hh-results-wrap {
            min-height: 100vh;
            background:
              radial-gradient(900px 480px at 12% 10%, #FFF7FC 0%, transparent 60%),
              radial-gradient(900px 480px at 88% 18%, #F2EEFF 0%, transparent 60%),
              linear-gradient(160deg, var(--bg1), var(--bg2));
            display:flex; align-items:center; justify-content:center;
            padding: clamp(40px, 6vw, 80px);
            font-family: 'Montserrat', system-ui, sans-serif;
            color: var(--body);
          }

          .hh-results-card {
            width: min(880px, 94vw);
            background: var(--card);
            border: 1px solid var(--ring);
            border-radius: var(--radius);
            box-shadow: var(--shadow);
            padding: clamp(28px, 5vw, 52px);
            text-align: center;
          }

          .hh-results-title {
            font-family: 'Gilda Display', serif;
            color: var(--ink);
            font-size: clamp(28px, 4.2vw, 42px);
            margin: 10px 0 6px;
          }

          .hh-results-sub {
            font-size: clamp(15px, 2vw, 18px);
            line-height: 1.65;
            margin: 0 0 22px;
          }

          /* Feminine gradient buttons (consistent everywhere) */
          button.hh-btn, a.hh-btn {
            background: linear-gradient(90deg, var(--g1), var(--g2));
            color: #fff;
            font-weight: 800;
            border: none;
            border-radius: 12px;
            padding: 14px 26px;
            box-shadow: 0 10px 28px rgba(185,167,255,.35);
            text-decoration: none;
            display: inline-flex; align-items:center; justify-content:center; gap:10px;
            transition: transform .05s ease, filter .2s ease;
          }
          button.hh-btn:hover, a.hh-btn:hover { filter: brightness(1.06); transform: translateY(-1px); }
        `}</style>
        
        <div className="hh-results-wrap">
          <div className="hh-results-card">
            <h1 className="hh-results-title">
              Analysis Error
            </h1>
            <p className="hh-results-sub">
              There was an issue analyzing your results. Please try again.
            </p>
            <button
              onClick={() => {
                setCurrentStep('landing');
                // Clear URL params
                window.history.replaceState({}, document.title, window.location.pathname);
              }}
              className="hh-btn"
            >
              Return to Home
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </>
    );
  }

  // Landing Page
  if (currentStep === 'landing')  {
    
    return (
      <>
        <style jsx global>{`
          .hh-inline-gallery{
            display:flex; justify-content:center; gap:.75rem; flex-wrap:wrap;
            margin-top:1.25rem; padding-top:.25rem;
            opacity:0; transform: translateY(6px);
            animation: hhFadeIn .6s ease-out .05s forwards;
            overflow:hidden; position:relative;
          }
          .hh-inline-gallery .hh-track{
            display:inline-flex; gap:.75rem; align-items:center; will-change:transform;
            animation: hhScroll 28s linear infinite;
          }
          .hh-inline-gallery:hover .hh-track{ animation-play-state: paused; }
          .hh-inline-gallery img{
            width:90px; height:90px; border-radius:50%;
            object-fit:cover; box-shadow:0 6px 18px rgba(0,0,0,.15);
            transition: transform .25s ease;
          }
          .hh-inline-gallery img:hover{ transform: scale(1.06) translateY(-2px); }
          @keyframes hhFadeIn{ to{ opacity:1; transform:translateY(0); } }
          @keyframes hhScroll{ from{transform:translateX(0)} to{transform:translateX(-50%)} }
          @media (max-width:640px){
            .hh-inline-gallery .hh-track{ animation-duration:36s; }
            .hh-inline-gallery img{ width:68px; height:68px; }
          }
          @media (prefers-reduced-motion: reduce){
            .hh-inline-gallery, .hh-inline-gallery .hh-track{ animation:none !important; opacity:1; transform:none; }
            .hh-inline-gallery img{ transition:none; }
          }
        `}</style>

        <div className="min-h-screen bg-gradient-to-br from-[#F8ECF6] to-[#ECE6FF]">
          <div className="container mx-auto px-4 py-16 text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="font-serif text-5xl md:text-7xl font-bold text-gray-800 mb-6">
                Hair Harmony
              </h1>
              <p className="font-sans text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
                Discover your perfect color palette with AI-powered personal color analysis
              </p>
              <p className="font-sans text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
                Take our comprehensive quiz to unlock your unique color season and receive a personalized guide to the hair colors that will make you shine.
              </p>
              
              <button
                onClick={handleStartQuiz}
                className="btn-primary inline-flex items-center gap-3"
              >
                Start Your Color Journey
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Client-side only carousel */}
              {isClient && (
                <div className="hh-inline-gallery">
                  <div className="hh-track">
                    <img src="https://storage.tally.so/aeb556ff-b634-455f-bf96-03c536791c1c/Lucid_Origin_Hyperrealistic_beauty_portrait_of_a_woman_with_li_3.jpg" alt="" loading="lazy" />
                    <img src="https://storage.tally.so/9688cee2-5bcd-4f48-bc15-4e8f101f3273/Lucid_Origin_Hyperrealistic_portrait_of_a_woman_with_medium_ol_2.jpg" alt="" loading="lazy" />
                    <img src="https://storage.tally.so/22d701b3-5fe1-4602-b3e2-c89d19740477/Lucid_Origin_Hyperrealistic_portrait_of_a_woman_with_warm_tan__1.jpg"  alt="" loading="lazy"  />
                    <img src="https://storage.tally.so/bc126d72-2d09-47b9-9d8a-fd51cdd81d0d/Lucid_Origin_Hyperrealistic_portrait_of_a_woman_with_deep_brow_0.jpg" alt="" loading="lazy" />
                    {/* Duplicated for seamless loop */}
                    <img src="https://storage.tally.so/aeb556ff-b634-455f-bf96-03c536791c1c/Lucid_Origin_Hyperrealistic_beauty_portrait_of_a_woman_with_li_3.jpg" alt="" loading="lazy" />
                    <img src="https://storage.tally.so/9688cee2-5bcd-4f48-bc15-4e8f101f3273/Lucid_Origin_Hyperrealistic_portrait_of_a_woman_with_medium_ol_2.jpg" alt="" loading="lazy" />
                    <img src="https://storage.tally.so/22d701b3-5fe1-4602-b3e2-c89d19740477/Lucid_Origin_Hyperrealistic_portrait_of_a_woman_with_warm_tan__1.jpg" alt="" loading="lazy" />
                    <img src="https://storage.tally.so/bc126d72-2d09-47b9-9d8a-fd51cdd81d0d/Lucid_Origin_Hyperrealistic_portrait_of_a_woman_with_deep_brow_0.jpg" alt="" loading="lazy" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

  // Quiz Page
  return (
    <>
      <style jsx global>{`
        /* Quiz option images - CORRECTED SIZE TO 220px */
        .quiz-option-image {
          width: 220px !important;
          height: auto !important;
          border-radius: 14px !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08) !important;
          margin: 0 auto 20px auto !important;
          object-fit: cover !important;
          display: block !important;
        }
        
        /* Ensure proper spacing and alignment for quiz options with images */
        .quiz-option-label {
          flex-direction: column !important;
          align-items: center !important;
          text-align: center !important;
          gap: 1rem !important;
        }
      `}</style>
      
      <div ref={quizRef} className="min-h-screen bg-gradient-to-br from-[#F8ECF6] to-[#ECE6FF]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Hair Harmony
          </h1>
          <div className="max-w-md mx-auto">
            <div className="flex justify-between items-center mb-2">
              <span className="font-sans text-sm text-gray-600">
                Question {currentQuestion + 1} of {quizQuestions.length}
              </span>
              <span className="font-sans text-sm text-gray-600">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full bg-white/50 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-[#F6A6D6] to-[#B9A7FF] h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-gray-800 mb-2 text-center">
              {currentQuestionData.title}
            </h2>
            
            {/* Optional indicator for Q11 */}
            {currentQuestionData.id === 11 && (
              <p className="text-center text-sm text-gray-500 mb-6 italic">
                (Optional - you can skip this question)
              </p>
            )}

            {currentQuestionData.type === 'single-choice' && currentQuestionData.options && (
              <div className="space-y-4 mt-8">
                {currentQuestionData.options.map((option) => (
                  <label
                    key={option.value}
                    className={`flex flex-col items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                      answers[currentQuestionData.id] === option.value
                        ? 'border-[#F6A6D6] bg-gradient-to-r from-[#F6A6D6]/10 to-[#B9A7FF]/10'
                        : 'border-gray-200 hover:border-[#F6A6D6]/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestionData.id}`}
                      value={option.value}
                      checked={answers[currentQuestionData.id] === option.value}
                      onChange={(e) => handleAnswer(currentQuestionData.id, e.target.value)}
                      className="w-5 h-5 text-[#F6A6D6] focus:ring-[#F6A6D6]"
                    />
                    {option.image && (
                      <img
                        src={option.image}
                        alt={option.label}
                        className="quiz-option-image"
                        style={{
                          width: '220px',
                          height: 'auto',
                          borderRadius: '14px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                          marginBottom: '20px',
                          objectFit: 'cover',
                          display: 'block',
                          margin: '0 auto 20px auto'
                        }}
                      />
                    )}
                    <span className="font-sans text-gray-700 font-medium text-center">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            )}

            {currentQuestionData.type === 'text' && (
              <div className="mt-8">
                <textarea
                  value={answers[currentQuestionData.id] || ''}
                  onChange={(e) => handleAnswer(currentQuestionData.id, e.target.value)}
                  placeholder="Share any additional details that might help us provide better recommendations..."
                  className="w-full p-4 border-2 border-gray-200 rounded-xl font-sans text-gray-700 focus:border-[#F6A6D6] focus:ring-0 focus:outline-none resize-none"
                  rows={4}
                />
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-sans font-semibold transition-all duration-200 ${
                currentQuestion === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:shadow-lg hover:scale-105'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            {currentQuestion === quizQuestions.length - 1 ? (
              <button
                type="button"
                onClick={handleGetResults}
                disabled={isLoading}
                className={`btn-primary inline-flex items-center gap-2 ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Analyzing...' : 'Get My Results'}
                {!isLoading && <ChevronRight className="w-4 h-4" />}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!isAnswered() || isLoading}
                className={`btn-primary inline-flex items-center gap-2 ${
                  !isAnswered() || isLoading
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}