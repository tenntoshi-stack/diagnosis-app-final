// src/data/initialData.ts の完全コード

import { DiagnosisSet } from './diagnosisTypes';

/**
 * 顧客向けに公開する診断データを定義します。
 */
export const INITIAL_DIAGNOSIS_DATA: DiagnosisSet = {
  setId: "hair_color_diagnosis",
  setTitle: "あなたのぴったりの白髪染めがわかる 白髪染め診断",
  
  // ----------------------------------------------------
  // 診断結果 (R1〜R4)
  // ----------------------------------------------------
  results: [
    {
      resultId: "R1",
      title: "オーガニックヘナ",
      message: "時間や価格よりも、すぐにわかる最高のツヤ感とハリ・コシ、そして天然成分にこだわりたいあなたに最適です。白髪への染毛力も高いです。",
      imageUrl: "/images/hair_color/r1_henna.jpg",
      linkUrl: "https://example.com/henna-menu" 
    },
    {
      resultId: "R2",
      title: "香草カラー",
      message: "オーガニック志向でありながら、価格と時間も考慮し、継続的なダメージ改善を目指したいあなたにおすすめです。回数を重ねることで髪の質感を高めます。",
      imageUrl: "/images/hair_color/r2_kousou.jpg",
      linkUrl: "https://example.com/kousou-menu"
    },
    {
      resultId: "R3",
      title: "トリートメントカラー",
      message: "ツヤだけでなく、おしゃれで鮮やかな色味も楽しみたい、ファッション志向のあなたにぴったりです。ダメージは抑えられますが、白髪の染まりは優しい仕上がりです。",
      imageUrl: "/images/hair_color/r3_treatment.jpg",
      linkUrl: "https://example.com/treatment-color-menu"
    },
    {
      resultId: "R4",
      title: "ヘアマニキュア",
      message: "ジアミン不使用でダメージを抑えつつ、髪表面をコーティングしてツヤ感を手軽に得たい、バランスを重視するあなたにおすすめです。施術時間も比較的短いです。",
      imageUrl: "/images/hair_color/r4_manicure.jpg",
      linkUrl: "https://example.com/manicure-menu"
    },
  ],

  // ----------------------------------------------------
  // 質問 (Q1〜Q5) - 確定したロジックを実装
  // ----------------------------------------------------
  questions: [
    // Q1: ジアミンアレルギーがあるかどうか
    {
      questionId: "Q1",
      questionText: "Q1. ジアミンアレルギーの有無について、把握していますか？",
      imageUrl: "/images/hair_color/q1_allergy.jpg",
      options: [
        { text: "はい、アレルギーがあります（または不安がある）", nextId: "Q2" }, // R1/R4ルートへ
        { text: "いいえ、アレルギーはありません", nextId: "Q3" }     // R3/Q4ルートへ
      ]
    },
    // Q2: ジアミンアレルギーありの場合 -> 時間/価格 vs ツヤ感 (R1 or R4)
    {
      questionId: "Q2",
      questionText: "Q2. 施術の時間や価格に対する考え方は？",
      imageUrl: "/images/hair_color/q2_henna_vs_manicure.jpg",
      options: [
        { text: "価格、時間はそれほどこだわらないが、今すぐ最高のツヤ髪が欲しい", nextId: "R1" }, // -> ヘナ
        { text: "価格、時間にも配慮しながら、ツヤ髪が欲しい", nextId: "R4" }           // -> マニキュア
      ]
    },
    // Q3: ジアミンアレルギーなしの場合 -> ツヤ髪重視 vs おしゃれカラー重視 (R3 or Q4)
    {
      questionId: "Q3",
      questionText: "Q3. あなたがカラーに最も求めることは？",
      imageUrl: "/images/hair_color/q3_shine_vs_fashion.jpg",
      options: [
        { text: "とにかく髪のツヤと手触りを重視したい", nextId: "Q4" }, // R1/R2/R4ルートへ
        { text: "おしゃれなカラーや、鮮やかな色味も楽しみたい", nextId: "R3" }   // -> トリートメントカラー
      ]
    },
    // Q4: ツヤ髪重視の場合 -> オーガニック志向 (R4 or Q5)
    {
      questionId: "Q4",
      questionText: "Q4. カラー剤の成分に対するこだわりはありますか？",
      imageUrl: "/images/hair_color/q4_organic_vs_other.jpg",
      options: [
        { text: "極力オーガニックで、髪に優しい成分で染めたい", nextId: "Q5" }, // R1/R2ルートへ
        { text: "オーガニックにはそれほどこだわらない", nextId: "R4" }          // -> マニキュア
      ]
    },
    // Q5: オーガニック志向の場合 -> 即効性 vs 継続性 (R1 or R2)
    {
      questionId: "Q5",
      questionText: "Q5. 求めるツヤ感と、ダメージ改善への考え方は？",
      imageUrl: "/images/hair_color/q5_henna_vs_kousou.jpg",
      options: [
        { text: "時間、価格よりも、すぐ結果がわかるツヤ感、自然な色にこだわりたい", nextId: "R1" }, // -> ヘナ
        { text: "価格、時間も考慮しながら、少しずつでもいいのでダメージをなくしていきたい", nextId: "R2" } // -> 香草カラー
      ]
    },
  ],
};