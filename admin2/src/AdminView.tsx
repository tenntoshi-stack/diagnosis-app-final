import React, { useState, useEffect } from 'react';

// @ts-ignore
const BASE = (import.meta.env.VITE_API_BASE || "").replace(/\/$/, "");

export default function AdminView() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [errorLog, setErrorLog] = useState<string[]>([]);

  const log = (msg: string) => {
    setErrorLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);
  };

  useEffect(() => {
    const checkPassword = async () => {
      const targetUrl = `${BASE}/verify-password`;
      log(`1. 接続開始: ${targetUrl}`);
      
      const pass = prompt("管理者パスワードを入力してください");
      if (!pass) return;

      try {
        log("2. 送信中...");
        const res = await fetch(targetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: pass })
        });

        log(`3. 応答: ${res.status}`);
        
        if (res.status === 404) {
          log("❌ 404エラー: 窓口がありません");
          return;
        }

        const data: any = await res.json();
        if (res.ok && data.success) {
          log("4. 認証成功！");
          setIsAdmin(true);
        } else {
          alert("パスワードが違います");
          window.location.reload();
        }
      } catch (e: any) {
        log(`❌ エラー: ${e.message}`);
      }
    };
    checkPassword();
  }, []);

  if (!isAdmin) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>認証デバッグ画面</h2>
        <div style={{ textAlign: 'left', background: '#333', color: '#fff', padding: '15px', borderRadius: '5px', fontFamily: 'monospace' }}>
          {errorLog.map((l, i) => <div key={i}>{l}</div>)}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>🎉 ログイン成功！</h1>
      <p>管理画面の本体を表示する準備ができました。</p>
      <p>この画面が見えたら教えてください。元の管理機能コードを合体させます！</p>
    </div>
  );
}