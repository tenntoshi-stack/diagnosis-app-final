import React, { useState, useEffect } from 'react';
import { Loader2, ChevronRight, MessageCircle, ExternalLink, RefreshCcw } from 'lucide-react';

const App = () => {
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [currentId, setCurrentId] = useState('Q1'); // 最初の質問はQ1から
  const [diagnosisData, setDiagnosisData] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const API_URL = import.meta.env.VITE_API_BASE;

  // 1. データの読み込み
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}/all-data`);
        const data = await res.json();
        setDiagnosisData(data);
      } catch (err) {
        console.error("データ取得エラー:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
    </div>
  );

  const { config, questions, results } = diagnosisData || {};

  // 2. 回答時のロジック（分岐と5秒ぐるぐる）
  const handleAnswer = (targetId) => {
    if (targetId.startsWith('R')) {
      // 結果ID（R1など）に飛ぶ場合：5秒間の解析演出
      setAnalyzing(true);
      setTimeout(() => {
        setAnalyzing(false);
        setCurrentId(targetId);
        setShowResult(true);
      }, (config?.loadingSeconds || 5) * 1000);
    } else {
      // 次の質問（Q2など）に飛ぶ場合
      setCurrentId(targetId);
    }
  };

  // 現在表示すべきデータを見つける
  const currentQuestion = questions?.find((_, idx) => `Q${idx + 1}` === currentId);
  const currentResult = results?.find((_, idx) => `R${idx + 1}` === currentId);

  // --- 解析中（ぐるぐる）の画面 ---
  if (analyzing) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6">
      <div className="relative w-24 h-24 mb-6">
        <Loader2 className="w-24 h-24 animate-spin text-blue-600" />
        <div className="absolute inset-0 flex items-center justify-center font-bold text-blue-600">
          Analysis
        </div>
      </div>
      <h2 className="text-2xl font-bold text-gray-800 animate-pulse">回答を解析中...</h2>
      <p className="text-gray-500 mt-2">あなたに最適な結果を導き出しています</p>
    </div>
  );

  // --- 結果画面 ---
  if (showResult && currentResult) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
        {currentResult.imageUrl && (
          <img src={currentResult.imageUrl} alt="結果画像" className="w-full h-64 object-cover" />
        )}
        <div className="p-8 text-center">
          <span className="text-blue-600 font-bold text-sm tracking-widest uppercase">診断結果</span>
          <h1 className="text-3xl font-black text-gray-900 mt-2 mb-4">{currentResult.title}</h1>
          <p className="text-gray-600 leading-relaxed mb-8 text-left whitespace-pre-wrap">
            {currentResult.description}
          </p>
          
          <div className="space-y-4">
            {currentResult.lineUrl && (
              <a href={currentResult.lineUrl} target="_blank" className="flex items-center justify-center gap-2 bg-[#06C755] text-white font-bold py-4 rounded-2xl hover:opacity-90 transition-all shadow-lg">
                <MessageCircle className="w-5 h-5" /> LINEで詳しく相談する
              </a>
            )}
            {currentResult.detailUrl && (
              <a href={currentResult.detailUrl} target="_blank" className="flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 transition-all shadow-lg">
                詳しく見る <ExternalLink className="w-5 h-5" />
              </a>
            )}
            <button onClick={() => window.location.reload()} className="flex items-center justify-center gap-2 text-gray-400 text-sm mt-4 mx-auto hover:text-gray-600">
              <RefreshCcw className="w-4 h-4" /> もう一度診断する
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // --- 質問画面 ---
  return (
    <div className="min-h-screen bg-blue-600 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <div className="text-center mb-10 text-white">
          <h2 className="text-4xl font-black mb-2 tracking-tighter italic">{config?.title}</h2>
          <div className="h-1 w-20 bg-yellow-400 mx-auto rounded-full"></div>
        </div>
        
        <div className="bg-white rounded-[2rem] shadow-2xl p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 text-blue-100 font-black text-6xl select-none">
            {currentId}
          </div>
          
          <p className="text-2xl font-bold text-gray-800 mb-10 relative z-10 leading-snug">
            {currentQuestion?.text || "質問が設定されていません"}
          </p>
          
          <div className="grid grid-cols-1 gap-4">
            <button 
              onClick={() => handleAnswer(currentQuestion?.yesTarget)}
              className="group flex justify-between items-center bg-blue-50 hover:bg-blue-600 hover:text-white p-6 rounded-2xl border-2 border-blue-100 transition-all duration-300"
            >
              <span className="text-xl font-black italic">はい</span>
              <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => handleAnswer(currentQuestion?.noTarget)}
              className="group flex justify-between items-center bg-pink-50 hover:bg-pink-600 hover:text-white p-6 rounded-2xl border-2 border-pink-100 transition-all duration-300"
            >
              <span className="text-xl font-black italic">いいえ</span>
              <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;