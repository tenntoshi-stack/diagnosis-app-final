import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const QuestionChoices = ({ questionId, onSelect }: { questionId: number, onSelect: any }) => {
  const [choices, setChoices] = useState([]);
  useEffect(() => {
    fetch(`https://diagnosis-app-final.onrender.com/api/questions/${questionId}/choices`)
      .then(res => res.json())
      .then(setChoices);
  }, [questionId]);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {choices.map((c: any) => (
        <button key={c.id} onClick={() => onSelect(c.next_question_id, c.label)} style={{ padding: '15px', border: '2px solid #ff8e8e', borderRadius: '10px', backgroundColor: '#fff', cursor: 'pointer' }}>
          {c.choice_text}
        </button>
      ))}
    </div>
  );
};

export default function DiagnosisApp() {
  const { id } = useParams();
  const [diagnosisInfo, setDiagnosisInfo] = useState<any>(null);
  const [currentQuestionId, setCurrentQuestionId] = useState<number | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [result, setResult] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);
useEffect(() => {
  // すべての診断リストを取得しに行く
  fetch(`https://diagnosis-app-final.onrender.com/api/diagnoses`)
    .then(res => {
      if (!res.ok) throw new Error('Network response was not ok');
      return res.json();
    })
    .then(data => {
      if (Array.isArray(data) && data.length > 0) {
        // IDが一致するもの、なければ最初の1つを選択
        const selected = id ? data.find((d: any) => d.id === parseInt(id)) || data[0] : data[0];
        setDiagnosisInfo(selected);
        // 🌟 ここでセットされた時点で diagnosisInfo が null ではなくなるため、
        // 下の方にある if (!diagnosisInfo) return ... の「読み込み中」が解除されます。
      } else {
        // データが空の場合も解除しないと「読み込み中」のままになるため、仮データをセット
        setDiagnosisInfo({ name: "診断データがありません", description: "管理画面で作成してください" });
      }
    })
    .catch(err => {
      console.error("Fetch error:", err);
      // 🌟 エラーが起きた時も「読み込み中」のままにならないよう、エラー表示用データをセット
      setDiagnosisInfo({ name: "読み込みエラー", description: "サーバーからデータを取得できませんでした" });
    });
}, [id]);
const startDiagnosis = () => {
  if (!diagnosisInfo) return;
  fetch(`https://diagnosis-app-final.onrender.com/api/diagnoses/${diagnosisInfo.id}/questions`)
    .then(res => {
      if (!res.ok) throw new Error('Network response was not ok');
      return res.text().then(text => text ? JSON.parse(text) : []);
    })
    .then(data => {
      if (data && data.length > 0) {
        setCurrentQuestionId(data[0].id);
      }
    })
    .catch(err => console.error("Start diagnosis error:", err));
};
  const onSelectChoice = (nextId: number, label: string) => {
    const newHistory = [...history, label];
    setHistory(newHistory);
    if (nextId) {
      setCurrentQuestionId(nextId);
    } else {
      setIsCalculating(true);
      setCurrentQuestionId(null);
      const counts: any = {};
      newHistory.forEach(l => { counts[l] = (counts[l] || 0) + 1; });
      const finalLabel = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
      
      // 結果取得
      fetch(`https://diagnosis-app-final.onrender.com/api/diagnoses/${diagnosisInfo.id}/results/${finalLabel}`)
        .then(res => {
          if(!res.ok) throw new Error("結果が見つかりません");
          return res.json();
        })
        .then(data => {
          setTimeout(() => { setResult(data); setIsCalculating(false); }, 2000);
        })
        .catch(() => {
          alert("診断結果(ラベル: " + finalLabel + ")が登録されていないようです。管理画面を確認してください。");
          setIsCalculating(false);
          window.location.reload();
        });
    }
  };

  if (!diagnosisInfo) return <div style={{ textAlign: 'center', marginTop: '50px' }}>読み込み中...</div>;

  if (isCalculating) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="loader" style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #ff8e8e', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
          <h2 style={{ color: '#ff8e8e' }}>解析中...</h2>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>{result.result_title}</h1>
        <p style={{ whiteSpace: 'pre-wrap', textAlign: 'left' }}>{result.result_description}</p>
        <button onClick={() => window.location.reload()} style={{ padding: '10px 20px', background: '#ff8e8e', color: '#fff', border: 'none', borderRadius: '5px' }}>最初に戻る</button>
      </div>
    );
  }

  if (currentQuestionId) {
    return (
      <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
        <QuestionChoices questionId={currentQuestionId} onSelect={onSelectChoice} />
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>{diagnosisInfo.name}</h1>
      <p>{diagnosisInfo.description}</p>
      <button onClick={startDiagnosis} style={{ padding: '20px 40px', background: '#ff8e8e', color: '#fff', border: 'none', borderRadius: '50px' }}>診断をはじめる</button>
    </div>
  );
}