// src/data/diagnosisTypes.ts の完全コード

// --- 診断結果の構造 (R1, R2, R3, R4) ---
export type DiagnosisResult = {
  /** 結果を特定するためのID (R1〜R4) */
  resultId: string;
  /** 結果のタイトル (例: オーガニックヘナ) */
  title: string;
  /** 結果の詳細メッセージ */
  message: string;
  /** 結果画面に表示する画像のパス（アップロード後に設定） */
  imageUrl: string;
  /** 結果ページに配置する任意のリンクURL */
  linkUrl: string;
};

// --- 質問の選択肢の構造（二択） ---
export type Option = {
  /** 選択肢の表示テキスト */
  text: string;
  /** 選択時に次に遷移する質問のID（Q1〜Q5） or 最終結果のID（R1〜R4） */
  nextId: string; // ロジックの遷移先
};

// --- 質問の構造 (Q1, Q2, Q3, Q4, Q5) ---
export type Question = {
  /** 質問を特定するためのID (Q1〜Q5) */
  questionId: string;
  /** 質問文 */
  questionText: string;
  /** 質問画面に表示する画像のパス */
  imageUrl: string;
  /** 2つの選択肢 */
  options: [Option, Option]; // 必ず2つ（二択）であることを保証
};

// --- 一つの診断セット全体の構造 ---
export type DiagnosisSet = {
  /** 診断全体を特定するID (例: hair_color_diagnosis) */
  setId: string;
  /** 顧客向けに表示する診断タイトル (例: 白髪染め診断) */
  setTitle: string;
  /** 質問の配列（Q1〜Q5） */
  questions: Question[];
  /** 結果の配列（R1〜R4） */
  results: DiagnosisResult[];
};