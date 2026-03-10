import React, { useState, useEffect } from 'react';
import { Settings, Save, Trash2, Plus, ChevronLeft, LayoutGrid, FileText, Fingerprint, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';

const AdminView = () => {
  const [view, setView] = useState('list'); // 'list' か 'edit'
  const [diagnoses, setDiagnoses] = useState([]);
  const [currentId, setCurrentId] = useState(null);
  
  // 編集中のデータ
  const [config, setConfig] = useState({ title: "", description: "", loadingSeconds: 5 });
  const [questions, setQuestions] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const API_URL = import.meta.env.VITE_API_BASE;

  // 1. 診断一覧を取得
  const fetchList = async () => {
    try {
      const res = await fetch(`${API_URL}/all-diagnoses`);
      const data = await res.json();
      setDiagnoses(data || []);
    } catch (err) { console.error("一覧取得エラー:", err); }
  };

  useEffect(() => { fetchList(); }, []);

  // 2. 編集モードへ
  const handleEdit = async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/diagnosis/${id}`);
      const data = await res.json();
      setCurrentId(id);
      setConfig(data.config || { title: "無題の診断", description: "", loadingSeconds: 5 });
      setQuestions(data.questions || []);
      setResults(data.results || []);
      setView('edit');
    } catch (err) {
      alert("データの読み込みに失敗しました。");
    } finally { setLoading(false); }
  };

  // 3. 新規作成
  const handleCreate = () => {
    const newId = `diag_${Date.now()}`;
    setCurrentId(newId);
    setConfig({ title: "新しい診断", description: "", loadingSeconds: 5 });
    setQuestions([{ text: "", yesTarget: "", noTarget: "" }]);
    setResults([{ title: "", description: "", imageUrl: "", lineUrl: "", detailUrl: "" }]);
    setView('edit');
  };

  // 4. 保存
  const handleSave = async () => {
    setLoading(true);
    try {
      await fetch(`${API_URL}/save-diagnosis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: currentId, config, questions, results })
      });
      alert("保存しました！");
      fetchList();
      setView('list');
    } catch (err) {
      alert("保存に失敗しました。");
    } finally { setLoading(false); }
  };

  // --- 一覧画面 ---
  if (view === 'list') {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <LayoutGrid className="w-8 h-8 text-blue-600" /> 診断管理ダッシュボード
            </h1>
            <button onClick={handleCreate} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 shadow-lg">
              <Plus className="w-5 h-5" /> 新規診断を作成
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {diagnoses.map((d) => (
              <div key={d.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all">
                <h3 className="text-xl font-bold mb-2">{d.title || "名称未設定"}</h3>
                <p className="text-gray-500 text-sm mb-4 text-left">
                  ID: {d.id}<br />
                  質問数: {d.qCount} / 結果数: {d.rCount}
                </p>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(d.id)} className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg font-bold hover:bg-blue-100">編集する</button>
                  <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-5 h-5" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- 編集画面（ここが重要！） ---
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-blue-600 p-6 text-white shadow-lg mb-8 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <button onClick={() => setView('list')} className="flex items-center gap-1 hover:text-blue-200">
            <ChevronLeft /> 戻る
          </button>
          <h1 className="text-xl font-bold truncate max-w-[200px] md:max-w-none">{config.title}</h1>
          <button onClick={handleSave} disabled={loading} className="bg-green-500 hover:bg-green-600 px-6 py-2 rounded-full font-bold flex items-center gap-2 shadow-md disabled:bg-gray-400">
            <Save className="w-5 h-5" /> {loading ? "保存中..." : "保存して公開"}
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 space-y-8">
        {/* 基本設定 */}
        <section className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
          <h2 className="text-lg font-bold mb-4">📝 基本設定</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-600">診断タイトル</label>
              <input type="text" value={config.title} onChange={(e) => setConfig({...config, title: e.target.value})} className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-600">解析演出（秒）</label>
              <input type="number" value={config.loadingSeconds} onChange={(e) => setConfig({...config, loadingSeconds: parseInt(e.target.value)})} className="w-full p-2 border rounded" />
            </div>
          </div>
        </section>

        {/* 質問と分岐ロジック */}
        <section className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
          <h2 className="text-lg font-bold mb-4">❓ 質問と「はい・いいえ」の移動先</h2>
          <div className="space-y-4">
            {questions.map((q, idx) => (
              <div key={idx} className="p-4 bg-gray-50 border rounded-lg relative">
                <div className="absolute -top-3 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">Q{idx + 1}</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="md:col-span-1">
                    <label className="text-xs font-bold">質問文</label>
                    <textarea value={q.text} onChange={(e) => {
                      const newQs = [...questions]; newQs[idx].text = e.target.value; setQuestions(newQs);
                    }} className="w-full p-2 border rounded h-20" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-blue-600">「はい」の移動先 (Q2, R1など)</label>
                    <input type="text" value={q.yesTarget} onChange={(e) => {
                      const newQs = [...questions]; newQs[idx].yesTarget = e.target.value; setQuestions(newQs);
                    }} className="w-full p-2 border rounded" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-red-600">「いいえ」の移動先 (Q3, R2など)</label>
                    <input type="text" value={q.noTarget} onChange={(e) => {
                      const newQs = [...questions]; newQs[idx].noTarget = e.target.value; setQuestions(newQs);
                    }} className="w-full p-2 border rounded" />
                  </div>
                </div>
              </div>
            ))}
            <button onClick={() => setQuestions([...questions, { text: "", yesTarget: "", noTarget: "" }])} className="w-full py-3 border-2 border-dashed border-green-300 text-green-600 font-bold rounded-lg">+ 質問を追加</button>
          </div>
        </section>

        {/* 結果詳細設定 */}
        <section className="bg-white p-6 rounded-xl shadow-md border-l-4 border-purple-500">
          <h2 className="text-lg font-bold mb-4">🏆 結果ページの設定</h2>
          <div className="space-y-6">
            {results.map((r, idx) => (
              <div key={idx} className="p-5 border rounded-lg bg-purple-50 space-y-4">
                <div className="text-purple-700 font-bold flex items-center gap-2"><Fingerprint /> 結果 ID: R{idx + 1}</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="block text-xs font-bold">結果タイトル</label>
                    <input type="text" value={r.title} onChange={(e) => {
                      const newRs = [...results]; newRs[idx].title = e.target.value; setResults(newRs);
                    }} className="w-full p-2 border rounded" />
                    <label className="block text-xs font-bold">説明文</label>
                    <textarea value={r.description} onChange={(e) => {
                      const newRs = [...results]; newRs[idx].description = e.target.value; setResults(newRs);
                    }} className="w-full p-2 border rounded h-24" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold flex items-center gap-1"><ImageIcon className="w-3 h-3" /> 画像URL</label>
                    <input type="text" value={r.imageUrl} onChange={(e) => {
                      const newRs = [...results]; newRs[idx].imageUrl = e.target.value; setResults(newRs);
                    }} className="w-full p-2 border rounded text-sm" />
                    <label className="text-xs font-bold flex items-center gap-1"><LinkIcon className="w-3 h-3" /> LINE URL</label>
                    <input type="text" value={r.lineUrl} onChange={(e) => {
                      const newRs = [...results]; newRs[idx].lineUrl = e.target.value; setResults(newRs);
                    }} className="w-full p-2 border rounded text-sm" />
                    <label className="text-xs font-bold flex items-center gap-1"><LinkIcon className="w-3 h-3" /> 詳細URL</label>
                    <input type="text" value={r.detailUrl} onChange={(e) => {
                      const newRs = [...results]; newRs[idx].detailUrl = e.target.value; setResults(newRs);
                    }} className="w-full p-2 border rounded text-sm" />
                  </div>
                </div>
              </div>
            ))}
            <button onClick={() => setResults([...results, { title: "", description: "", imageUrl: "", lineUrl: "", detailUrl: "" }])} className="w-full py-3 border-2 border-dashed border-purple-300 text-purple-600 font-bold rounded-lg">+ 結果パターンを追加</button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminView;