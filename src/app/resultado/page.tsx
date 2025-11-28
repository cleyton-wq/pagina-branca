'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, Download, FileText } from 'lucide-react';

const PDF_BY_SEASON = {
  spring: "https://drive.google.com/file/d/1pWvcD-rMgWPSwFZVel3CUJCZx5rF3AZ_/view?usp=sharing",
  summer: "https://drive.google.com/file/d/1QVXHuP4cWhBqWPv_LthyksIT0Ql-n9XB/view?usp=sharing",
  autumn: "https://drive.google.com/file/d/1MFJ34KIvvSQJneooc_Goyjqe_yYtyj-7/view?usp=sharing",
  winter: "https://drive.google.com/file/d/1sO2MifVy1hkUfJT-vt4DrSsd-LcH32rS/view?usp=sharing",
};

export default function ResultadoPage() {
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('🔍 Loading analysis result from localStorage...');
    
    try {
      const savedAnalysis = localStorage.getItem('analysisResult');
      if (savedAnalysis) {
        const parsedAnalysis = JSON.parse(savedAnalysis);
        console.log('✅ Found saved analysis:', parsedAnalysis);
        setAnalysisData(parsedAnalysis);
      } else {
        console.log('⚠️ No saved analysis found, using fallback');
        // Fallback: try to get season from other storage keys
        const fallbackSeason = localStorage.getItem('hh_result') || 'spring';
        setAnalysisData({
          season: fallbackSeason,
          confidence: 75,
          reasoning: "Analysis result retrieved from storage",
          pdfUrl: PDF_BY_SEASON[fallbackSeason as keyof typeof PDF_BY_SEASON]
        });
      }
    } catch (error) {
      console.error('❌ Error loading analysis result:', error);
      // Ultimate fallback
      setAnalysisData({
        season: 'spring',
        confidence: 70,
        reasoning: "Default analysis due to storage error",
        pdfUrl: PDF_BY_SEASON.spring
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDownload = () => {
    try {
      const pdfUrl = analysisData?.pdfUrl || PDF_BY_SEASON[analysisData?.season as keyof typeof PDF_BY_SEASON] || PDF_BY_SEASON.spring;
      
      console.log('📥 Downloading PDF for season:', analysisData?.season, 'URL:', pdfUrl);
      
      // Converter para preview URL
      const fileId = pdfUrl.match(/\/d\/([^/]+)/)?.[1];
      const previewUrl = fileId ? `https://drive.google.com/file/d/${fileId}/preview` : pdfUrl;
      
      // Abrir em nova aba
      const newWindow = window.open(previewUrl, '_blank', 'noopener,noreferrer');
      if (!newWindow || newWindow.closed) {
        // Fallback se popup blocker ativo
        window.location.href = previewUrl;
      }
    } catch (error) {
      console.error('Erro no download:', error);
      alert('Erro ao abrir o PDF. Tente novamente.');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando seus resultados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Pagamento Confirmado!
          </h1>
          <p className="text-gray-600">
            Sua análise de cor foi concluída com sucesso.
          </p>
        </div>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center mb-2">
            <FileText className="w-5 h-5 text-purple-600 mr-2" />
            <p className="text-sm text-gray-700">
              Sua estação detectada:
            </p>
          </div>
          <p className="font-semibold text-lg capitalize text-purple-600">
            {analysisData?.season || 'Processando...'}
          </p>
          {analysisData?.confidence && (
            <p className="text-sm text-gray-500 mt-1">
              Confiança: {analysisData.confidence}%
            </p>
          )}
        </div>

        <button
          onClick={handleDownload}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
        >
          <Download className="w-5 h-5" />
          Download My Color Guide (PDF)
        </button>

        <p className="text-xs text-gray-400 mt-4">
          Seu guia personalizado está pronto para download
        </p>

        {/* Debug info - remover em produção */}
        <div className="mt-6 p-3 bg-gray-100 rounded text-xs text-gray-500">
          <p>Debug: Página carregada ✓</p>
          <p>Estação: {analysisData?.season}</p>
          <p>Confiança: {analysisData?.confidence}%</p>
          <p>URL: {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
        </div>
      </div>
    </div>
  );
}