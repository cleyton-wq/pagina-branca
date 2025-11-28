import { Suspense } from 'react';
import ResultClient from './ResultClient';

export default function ResultPage() {
  console.log('🔥 [ResultPage] Page component loaded!');
  
  return (
    <>
      <Suspense fallback={
        <div className="min-h-screen bg-gradient-to-br from-[#F8ECF6] to-[#ECE6FF] flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading results...</p>
          </div>
        </div>
      }>
        <ResultClient />
      </Suspense>
    </>
  );
}