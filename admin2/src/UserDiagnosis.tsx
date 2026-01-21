import { useState, useEffect } from 'react';

export default function UserDiagnosis({ diagnosisId }: { diagnosisId: number }) {
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [choices, setChoices] = useState<any[]>([]);
  const [resultData, setResultData] = useState<any>(null);
  const [historyStack, setHistoryStack] = useState<any[]>([]);

  // 🌟 APIのベースURLを定義
  const API_BASE = "https://diagnosis-app-final.onrender.com/api";

  useEffect(() => { loadQuestion(null); }, [diagnosisId]);

  const loadQuestion = (questionId: number | null) => {
    // 🌟 URLを本番環境用に修正
    const url = questionId 
      ? `${API_BASE}/questions/detail/${questionId}`
      : `${API_BASE}/diagnoses/${diagnosisId}/questions/first`;

    fetch(url).then(res => res.json()).then(data => {
      if (data && data.id) {
        setCurrentQuestion(data);
        // 🌟 選択肢の取得URLも修正
        fetch(`${API_BASE}/questions/${data.id}/choices`)
          .then(res => res.json()).then(setChoices);
      }
    }).catch(err => console.error("質問取得エラー:", err));
  };

  const handleChoice = (choice: any) => {
    setHistoryStack([...historyStack, currentQuestion]);
    if (choice.next_question_id && choice.next_question_id > 0) {
      loadQuestion(choice.next_question_id);
    } else {
      // 🌟 結果取得のURLも修正
      fetch(`${API_BASE}/diagnoses/${diagnosisId}/results`)
        .then(res => res.json()).then(results => {
          const matched = results.find((r: any) => r.type_label === choice.label);
          setResultData(matched || { result_title: "診断完了", result_description: `あなたのタイプ: ${choice.label}` });
          setCurrentQuestion(null);
        }).catch(err => console.error("結果取得エラー:", err));
    }
  };

  const goBack = () => {
    if (historyStack.length === 0) return;
    const newStack = [...historyStack];
    const previousQuestion = newStack.pop();
    setHistoryStack(newStack);
    setCurrentQuestion(previousQuestion);
    // 🌟 戻る時のURLも修正
    fetch(`${API_BASE}/questions/${previousQuestion.id}/choices`).then(res => res.json()).then(setChoices);
  };

  // --- 高級感を出すコンテナ ---
  const Container = ({ children }: { children: React.ReactNode }) => (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
      <div style={{ 
        width: '100%', maxWidth: '460px', backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '40px', boxShadow: '0 40px 80px rgba(0,0,0,0.08)',
        overflow: 'hidden', border: '1px solid rgba(255,255,255,0.8)',
        backdropFilter: 'blur(20px)', padding: '40px 30px'
      }}>
        {children}
      </div>
    </div>
  );

  if (resultData) {
    return (
      <Container>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '10px', letterSpacing: '5px', color: '#d4a373', marginBottom: '15px', fontWeight: 'bold' }}>PERSONAL ANALYSIS</div>
          <h2 style={{ fontSize: '24px', marginBottom: '20px', color: '#2c2c2c', fontWeight: '600', letterSpacing: '1px' }}>{resultData.result_title}</h2>
          
          {resultData.image_url && (
            <div style={{ margin: '0 -30px 30px -30px' }}>
              <img src={resultData.image_url} alt="Result" style={{ width: '100%', height: '300px', objectFit: 'cover' }} />
            </div>
          )}
          
          <p style={{ textAlign: 'left', lineHeight: '1.9', fontSize: '15px', color: '#4a4a4a', backgroundColor: '#fcfaf7', padding: '25px', borderRadius: '24px', whiteSpace: 'pre-wrap', marginBottom: '30px' }}>
            {resultData.result_description}
          </p>

          <div style={{ display: 'grid', gap: '15px' }}>
            {resultData.recommend_url && (
              <a href={resultData.recommend_url} target="_blank" rel="noreferrer" style={{ 
                padding: '20px', backgroundColor: '#06C755', color: '#fff', textDecoration: 'none', borderRadius: '100px', fontWeight: '600', fontSize: '16px', boxShadow: '0 10px 20px rgba(6,199,85,0.2)', textAlign: 'center'
              }}>💬 LINEで予約・相談する</a>
            )}
            {resultData.detail_url && (
              <a href={resultData.detail_url} target="_blank" rel="noreferrer" style={{ 
                padding: '18px', backgroundColor: '#fff', color: '#d4a373', border: '1.5px solid #d4a373', textDecoration: 'none', borderRadius: '100px', fontWeight: '600', fontSize: '16px', textAlign: 'center'
              }}>🔍 詳しく見る</a>
            )}
            <button onClick={() => window.location.reload()} style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', marginTop: '10px' }}>もう一度診断する</button>
          </div>
        </div>
      </Container>
    );
  }

  if (!currentQuestion) return <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>Loading Diagnosis...</div>;

  return (
    <Container>
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px', alignItems: 'center' }}>
           <span style={{ fontSize: '14px', color: '#d1d1d1', fontWeight: '600', letterSpacing: '2px' }}>QUESTION {historyStack.length + 1}</span>
           {historyStack.length > 0 && (
            <button onClick={goBack} style={{ background: 'none', border: 'none', color: '#d4a373', cursor: 'pointer', fontSize: '14px', borderBottom: '1px solid #d4a373' }}>BACK</button>
          )}
        </div>
        
        <h3 style={{ fontSize: '22px', color: '#2c2c2c', marginBottom: '45px', lineHeight: '1.6', fontWeight: '600', letterSpacing: '0.5px' }}>
          {currentQuestion.question_text}
        </h3>

        <div style={{ display: 'grid', gap: '16px' }}>
          {choices.map(c => (
            <button key={c.id} onClick={() => handleChoice(c)} style={{ 
                padding: '22px 25px', borderRadius: '20px', border: '1px solid #eee', 
                backgroundColor: '#fff', cursor: 'pointer', fontSize: '16px', color: '#333',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
                outline: 'none', textAlign: 'center', fontWeight: '500'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 10px 20px rgba(212, 163, 115, 0.15)';
                e.currentTarget.style.borderColor = '#d4a373';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.02)';
                e.currentTarget.style.borderColor = '#eee';
              }}
            >
              {c.choice_text}
            </button>
          ))}
        </div>
      </div>
    </Container>
  );
}