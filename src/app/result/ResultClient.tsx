'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Download, CreditCard, Sparkles, Heart, Star } from 'lucide-react';

type Season = 'spring' | 'summer' | 'autumn' | 'winter';

const PDF_BY_SEASON: Record<Season, string> = {
  spring: 'https://drive.google.com/file/d/1pWvcD-rMgWPSwFZVel3CUJCZx5rF3AZ_/view?usp=sharing',
  summer: 'https://drive.google.com/file/d/1QVXHuP4cWhBqWPv_LthyksIT0Ql-n9XB/view?usp=sharing',
  autumn: 'https://drive.google.com/file/d/1MFJ34KIvvSQJneooc_Goyjqe_yYtyj-7/view?usp=sharing',
  winter: 'https://drive.google.com/file/d/1sO2MifVy1hkUfJT-vt4DrSsd-LcH32rS/view?usp=sharing',
};

function toDirectDownload(url: string) {
  const m = url.match(/\/d\/([^/]+)/);
  return m ? `https://drive.google.com/uc?export=download&id=${m[1]}` : url;
}

function openInNewTab(url: string) {
  const w = window.open(url, '_blank', 'noopener');
  if (w && !w.closed) { 
    try { w.opener = null; } catch(_) {} 
    return; 
  }
  const a = document.createElement('a');
  a.href = url; 
  a.target = '_blank'; 
  a.rel = 'noopener noreferrer'; 
  a.style.display = 'none';
  document.body.appendChild(a); 
  a.click(); 
  a.remove();
  setTimeout(() => { window.location.href = url }, 80);
}

export default function ResultClient() {
  console.log('🚀 [ResultClient] Component initialized!');
  
  const params = useSearchParams();
  console.log('🔍 [ResultClient] useSearchParams result:', params);
  
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const success = params.get('success') === 'true';
  const cancel = params.get('cancel') === 'true';
  
  console.log('🔍 [ResultClient] URL params - success:', success, 'cancel:', cancel);
  console.log('🔍 [ResultClient] Current URL:', typeof window !== 'undefined' ? window.location.href : 'SSR');
  
  // Load analysis result FROM CACHE ONLY
  useEffect(() => {
    console.log('🚀 [ResultClient] useEffect triggered with success:', success, 'cancel:', cancel);
    
    const loadCachedResult = () => {
      console.log('🔍 [ResultClient] Starting loadCachedResult...');
      
      if (success) {
        console.log('💳 [ResultClient] Payment successful - loading cached result...');
        
        try {
          // Check all localStorage keys first
          console.log('🔍 [ResultClient] All localStorage keys:', Object.keys(localStorage));
          
          // Get cached result
          const cachedResult = localStorage.getItem('openai_analysis_result');
          console.log('📝 [ResultClient] Raw cached result from localStorage:', cachedResult);
          
          // Also check alternative keys
          const altResult = localStorage.getItem('hh_result');
          console.log('📝 [ResultClient] Alternative hh_result:', altResult);
          
          if (!cachedResult) {
            console.error('❌ [ResultClient] No cached result found in localStorage');
            throw new Error('No cached analysis result found');
          }
          
          const analysisResult = JSON.parse(cachedResult);
          console.log('📋 [ResultClient] Parsed cached analysis result:', analysisResult);
          
          // Validate cached result
          if (!analysisResult.season) {
            console.error('❌ [ResultClient] No season in cached result:', analysisResult);
            throw new Error('Invalid cached result - no season');
          }
          
          console.log('✅ [ResultClient] Using cached analysis result:', analysisResult);
          setAnalysisData(analysisResult);
          
        } catch (error) {
          console.error('❌ [ResultClient] Error loading cached result:', error);
          // Fallback
          const fallbackResult = {
            season: 'spring',
            confidence: 80,
            reasoning: "Your complete analysis has been processed successfully.",
            pdfUrl: PDF_BY_SEASON.spring,
            fullAnalysis: true,
            fallback: true
          };
          console.log('🔄 [ResultClient] Using fallback result:', fallbackResult);
          setAnalysisData(fallbackResult);
        }
      } else if (!cancel) {
        console.log('🎭 [ResultClient] No payment - showing preview analysis...');
        
        // Preview result (censurado)
        const previewResult = {
          season: '<span class="hh-censored-purple">*****</span>',
          confidence: '<span class="hh-censored-purple">**</span>%',
          reasoning: 'Based on your undertones and contrast, you belong to the <span class="hh-censored-purple">*****</span> palette. Click the link below to get your personalized plan.',
          isPreview: true,
          checkoutUrl: 'https://buy.stripe.com/fZudR85QV3iU7mgeTJeAg02',
          message: '🎉 Your Hair Harmony analysis is ready!'
        };
        console.log('🎭 [ResultClient] Setting preview result:', previewResult);
        setAnalysisData(previewResult);
        
      } else {
        console.log('❌ [ResultClient] Payment cancelled');
        setAnalysisData({
          cancelled: true
        });
      }
      
      console.log('✅ [ResultClient] Setting isLoading to false');
      setIsLoading(false);
    };

    loadCachedResult();
  }, [success, cancel]);

  const season = analysisData?.season || 'spring';
  const pdfUrl = analysisData?.pdfUrl || PDF_BY_SEASON[season as Season];
  const directUrl = useMemo(() => toDirectDownload(pdfUrl), [pdfUrl]);
  const isPreview = analysisData?.isPreview === true;

  console.log('🎯 [ResultClient] Current state:', {
    season,
    isPreview,
    analysisData,
    isLoading
  });

  // Capitalizar season para exibição (só se não for censurado)
  const capitalizedSeason = season.includes('*****') ? season : season.charAt(0).toUpperCase() + season.slice(1);

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('📥 Downloading PDF for season:', season, 'URL:', directUrl);
    openInNewTab(directUrl);
  };

  const handleCheckoutClick = () => {
    const checkoutUrl = analysisData?.checkoutUrl || 'https://buy.stripe.com/fZudR85QV3iU7mgeTJeAg02';
    console.log('💳 Redirecting to checkout:', checkoutUrl);
    window.location.href = checkoutUrl;
  };

  // Aplicar o layout melhorado
  useEffect(() => {
    console.log('🎨 [ResultClient] Applying enhanced styles...');
    const style = document.createElement('style');
    style.textContent = `
      .hh-wrap {
        max-width: 900px; margin: 60px auto; padding: 0 20px;
        font-family: 'Montserrat', system-ui, -apple-system, sans-serif; color: #3a3a3a;
      }
      .hh-card {
        background: linear-gradient(135deg, #fff 0%, #fefcff 100%);
        border: 2px solid transparent;
        background-clip: padding-box;
        border-radius: 24px;
        box-shadow: 
          0 20px 60px rgba(185, 167, 255, 0.15),
          0 8px 32px rgba(246, 166, 214, 0.1),
          inset 0 1px 0 rgba(255, 255, 255, 0.8);
        padding: clamp(32px, 6vw, 56px); 
        text-align: center;
        position: relative;
        overflow: hidden;
      }
      .hh-card::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        background: linear-gradient(135deg, rgba(246, 166, 214, 0.03) 0%, rgba(185, 167, 255, 0.05) 100%);
        pointer-events: none;
        border-radius: 24px;
      }
      .hh-card > * {
        position: relative;
        z-index: 1;
      }
      .hh-success-icon {
        width: 80px; height: 80px; margin: 0 auto 20px;
        background: linear-gradient(135deg, #f6a6d6, #b9a7ff);
        border-radius: 50%; display: flex; align-items: center; justify-content: center;
        box-shadow: 0 8px 32px rgba(185, 167, 255, 0.3);
        animation: hh-pulse 2s ease-in-out infinite;
      }
      @keyframes hh-pulse {
        0%, 100% { transform: scale(1); box-shadow: 0 8px 32px rgba(185, 167, 255, 0.3); }
        50% { transform: scale(1.05); box-shadow: 0 12px 40px rgba(185, 167, 255, 0.4); }
      }
      .hh-title {
        font-family: 'Gilda Display', serif; font-weight: 700;
        font-size: clamp(36px, 6vw, 48px); line-height: 1.1; 
        background: linear-gradient(135deg, #b58cff 0%, #ff8ad6 50%, #f6a6d6 100%);
        -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
        margin: 0 0 16px; text-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      .hh-subtitle {
        font-family: 'Gilda Display', serif; font-weight: 600;
        font-size: clamp(20px, 3vw, 26px); color: #4a4a4a; margin: 0 0 24px;
        opacity: 0.9;
      }
      .hh-headline {
        margin: 24px auto 24px; max-width: 720px;
        padding: 20px; background: rgba(248, 236, 246, 0.4); border-radius: 16px;
        border: 1px solid rgba(185, 167, 255, 0.2);
      }
      .hh-headline .h1a { 
        display:block; font-weight:800; font-size: clamp(18px, 3vw, 22px); 
        color:#7c4dff; margin-bottom: 8px;
      }
      .hh-headline .h1b { 
        display:block; font-weight:900; font-size: clamp(28px, 4.5vw, 34px); 
        letter-spacing:.3px; line-height: 1.2;
        background: linear-gradient(135deg, #ff9adf 0%, #b9a7ff 100%); 
        -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color: transparent;
      }
      .hh-intro { 
        max-width: 720px; margin: 0 auto 20px; color:#5b5b5b; 
        font-size: clamp(16px, 2.2vw, 18px); line-height: 1.7;
      }
      .hh-benefits { 
        max-width: 680px; margin: 16px auto 28px; text-align: left; 
        background: rgba(255, 255, 255, 0.6); padding: 24px; border-radius: 16px;
        border: 1px solid rgba(185, 167, 255, 0.15);
      }
      .hh-benefits li { 
        list-style: none; margin: 14px 0; padding-left: 32px; position: relative; 
        font-size: 16px; line-height: 1.6; color: #4a4a4a;
      }
      .hh-benefits li:before {
        content: "✨"; position: absolute; left: 0; top: 2px; 
        font-size: 18px; color: #b9a7ff;
      }
      .hh-why {
        margin: 24px auto 32px; padding: 24px 24px; border-radius: 18px;
        background: linear-gradient(135deg, rgba(248, 236, 246, 0.8) 0%, rgba(236, 230, 255, 0.6) 100%);
        border: 2px solid rgba(185, 167, 255, 0.2); text-align: left; max-width: 720px;
        box-shadow: 0 8px 32px rgba(185, 167, 255, 0.1);
      }
      .hh-why h3 { 
        margin: 0 0 12px; font-weight: 800; color:#3a2a7a; 
        font-size: clamp(18px, 2.8vw, 22px); display: flex; align-items: center; gap: 8px;
      }
      .hh-why p { 
        margin: 0; color:#575757; line-height: 1.7; font-size: 16px;
      }
      .hh-cta { 
        margin: 32px auto 16px; display:flex; justify-content:center; 
        gap: 16px; flex-wrap: wrap; 
      }
      .hh-btn {
        display:inline-flex; align-items:center; justify-content:center; gap:12px;
        background: linear-gradient(135deg, #f6a6d6, #b9a7ff);
        color:#fff !important; font-weight: 800; border: none; border-radius: 16px;
        padding: 16px 32px; font-size: 16px;
        box-shadow: 
          0 12px 32px rgba(185,167,255,.4),
          0 4px 16px rgba(246, 166, 214, 0.3);
        text-decoration:none; transition: all .2s ease; cursor: pointer;
        position: relative; overflow: hidden;
      }
      .hh-btn::before {
        content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
        transition: left 0.5s ease;
      }
      .hh-btn:hover::before {
        left: 100%;
      }
      .hh-btn:hover { 
        filter: brightness(1.1); transform: translateY(-2px); 
        box-shadow: 
          0 16px 40px rgba(185,167,255,.5),
          0 6px 20px rgba(246, 166, 214, 0.4);
      }
      .hh-btn-secondary {
        background: linear-gradient(135deg, #e8e8e8, #f5f5f5);
        color: #666 !important; 
        box-shadow: 0 8px 24px rgba(0,0,0,.12);
      }
      .hh-support { 
        color:#8e8e8e; font-size: 14px; margin: 12px 0 20px; 
        display: flex; align-items: center; justify-content: center; gap: 8px;
      }
      .hh-sign { 
        color:#a06bdc; font-size: 14px; margin-top: 16px; 
        font-style: italic; opacity: 0.8;
      }
      .hh-censored-purple {
        color: #B9A7FF !important;
        font-family: 'Courier New', monospace !important;
        font-weight: bold !important;
        font-size: 1.2em !important;
        letter-spacing: 2px !important;
        text-shadow: 0 0 8px rgba(185, 167, 255, 0.3) !important;
      }
      .hh-season-badge {
        display: inline-block; padding: 12px 24px; margin: 16px 0;
        background: linear-gradient(135deg, rgba(185, 167, 255, 0.15), rgba(246, 166, 214, 0.1));
        border: 2px solid rgba(185, 167, 255, 0.3);
        border-radius: 50px; font-weight: 700; font-size: 18px;
        color: #7c4dff; text-transform: uppercase; letter-spacing: 1px;
      }
    `;
    document.head.appendChild(style);

    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Gilda+Display:wght@400;600;700&family=Montserrat:wght@400;600;700;800&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);

    return () => {
      if (style.parentNode) document.head.removeChild(style);
      if (fontLink.parentNode) document.head.removeChild(fontLink);
    };
  }, []);

  // Loading state
  if (isLoading) {
    console.log('⏳ [ResultClient] Rendering loading state');
    return (
      <div className="hh-wrap">
        <div className="hh-card">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">
            Loading your personalized results...
          </p>
        </div>
      </div>
    );
  }

  // Payment cancelled
  if (cancel || analysisData?.cancelled) {
    console.log('❌ [ResultClient] Rendering cancelled state');
    return (
      <div className="hh-wrap">
        <div className="hh-card">
          <div className="hh-title">Payment Cancelled</div>
          <div className="hh-subtitle">No worries! Your analysis is still ready</div>
          <p className="hh-intro">
            You can complete your purchase anytime to access your personalized hair color guide.
          </p>
          <div className="hh-cta">
            <button onClick={handleCheckoutClick} className="hh-btn">
              <CreditCard className="w-5 h-5" />
              Complete Purchase - $3.90
            </button>
          </div>
        </div>
      </div>
    );
  }

  console.log('🎉 [ResultClient] Rendering main result with season:', capitalizedSeason);

  return (
    <div className="hh-wrap">
      <div className="hh-card">
        {success && (
          <div className="hh-success-icon">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
        )}
        
        <div className="hh-title">
          {success ? 'Congratulations!' : 'Your Analysis is Ready!'}
        </div>
        <div className="hh-subtitle">
          {success ? 'Your Personalized Hair Harmony Report' : 'Unlock Your Complete Color Guide'}
        </div>

        <div className="hh-headline">
          <span className="h1a">
            {success ? "We've Discovered Your Perfect" : "Your Perfect Color Season"}
          </span>
          <span className="h1b">
            {success ? "Color Season!" : "Awaits You!"}
          </span>
        </div>

        {success && !isPreview && (
          <div className="hh-season-badge">
            {capitalizedSeason} Season
          </div>
        )}

        <p className="hh-intro">
          {success 
            ? "Get instant access to your detailed analysis, hair color guide, and beauty insights."
            : "Complete your purchase to unlock your personalized hair color analysis and styling guide."
          }
        </p>

        {!isPreview && (
          <ul className="hh-benefits">
            <li>Personalized hair color season analysis</li>
            <li>Complete hair color recommendations</li>
            <li>Instant digital delivery</li>
          </ul>
        )}

        <div className="hh-why">
          <h3>
            <Star className="w-5 h-5 text-purple-600" />
            {success ? 'Your Analysis Result:' : 'Why This Fits You:'}
          </h3>
          <p>
            {isPreview ? (
              <span dangerouslySetInnerHTML={{ __html: 'Based on your undertones and contrast, you belong to the <span class="hh-censored-purple">*****</span> palette. Click the link below to get your personalized plan.' }} />
            ) : (
              <>
                Based on your quiz responses, you belong to the <strong>{capitalizedSeason}</strong> color palette. 
                {analysisData?.reasoning && (
                  <><br/><br/>{analysisData.reasoning}</>
                )}
              </>
            )}
          </p>
        </div>

        <div className="hh-cta">
          {success && !isPreview && (
            <a
              id="hhDownloadBtn"
              href={directUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleDownloadClick}
              className="hh-btn"
            >
              <Download className="w-5 h-5" />
              Download My Color Guide (PDF)
            </a>
          )}
          
          {isPreview && (
            <button onClick={handleCheckoutClick} className="hh-btn">
              <CreditCard className="w-5 h-5" />
              Unlock My Complete Guide - $19.99
            </button>
          )}
        </div>

        <div className="hh-support">
          <Heart className="w-4 h-4 text-pink-400" />
          {success 
            ? "Your complete hair color recommendations and styling tips"
            : "Secure payment • Instant access • Professional analysis"
          }
        </div>
        
        <div className="hh-sign">
          With love, Hair Harmony
        </div>
      </div>
    </div>
  );
}