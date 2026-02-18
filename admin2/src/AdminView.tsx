import React, { useState, useEffect } from 'react';

// @ts-ignore
const API_BASE = import.meta.env.VITE_API_BASE || "";

export default function AdminView() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [errorLog, setErrorLog] = useState<string[]>([]); // エラーを記録

  const log = (msg: string) => {
    console.log(msg);
    setErrorLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);
  };

  useEffect(() => {
    const checkPassword = async () => {
      log(`1. 認証開始 (API_BASE: "${API_BASE}")`);
      
      const pass = prompt("管理者パスワードを入力してください");
      if (!pass) {
        log("2. パスワード入力がキャンセルされました");
        window.location.href = "/";
        return;
      }

      const targetUrl = `${API_BASE}/verify-password`;
      log(`3. 送信先URL: ${targetUrl}`);

      try {
        log("4. fetch実行中...");
        const res = await fetch(targetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: pass })
        });

        log(`5. サーバー応答コード: ${res.status} (${res.statusText})`);
        
        const data = await res.json();
        log(`6. 受信データ: ${JSON.stringify(data)}`);

        if (res.ok && data.success) {
          log("7. 認証成功！");
          setIsAdmin(true);
        } else {
          alert(`認証失敗: ${JSON.stringify(data)}`);
          window.location.href = "/";
        }
      } catch (e: any) {
        log(`❌ 接続エラー発生: ${e.message}`);
        alert(`【接続エラーの詳細】\nURL: ${targetUrl}\n内容: ${e.message}\n\n※このメッセージを教えてください。`);
      }
    };
    checkPassword();
  }, []);

  if (!isAdmin) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'monospace' }}>
        <h2>認証チェック中...</h2>
        <div style={{ textAlign: 'left', background: '#eee', padding: '10px', display: 'inline-block', minWidth: '300px' }}>
          {errorLog.map((line, i) => <div key={i}>{line}</div>)}
        </div>
      </div>
    );
  }

  return <div>ログイン成功！管理画面を表示します...（ここに元のHTMLが続きますが、まずはログインの確認を）</div>;
}