const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('diagnosis_system.db');

db.serialize(() => {
    // 1. 診断セットテーブル
    db.run(`CREATE TABLE IF NOT EXISTS diagnosis_sets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        is_public INTEGER DEFAULT 0,
        answer_type TEXT DEFAULT 'score',
        created_at TEXT
    )`);

    // 2. 質問テーブル
    db.run(`CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        diagnosis_set_id INTEGER NOT NULL,
        question_text TEXT NOT NULL,
        FOREIGN KEY (diagnosis_set_id) REFERENCES diagnosis_sets(id)
    )`);

    // 3. 回答の選択肢テーブル
    db.run(`CREATE TABLE IF NOT EXISTS choices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question_id INTEGER NOT NULL,
        choice_text TEXT NOT NULL,
        score INTEGER DEFAULT 0,
        label TEXT DEFAULT '',
        next_question_id INTEGER DEFAULT NULL,
        FOREIGN KEY (question_id) REFERENCES questions(id)
    )`);

    // 4. 診断結果詳細テーブル（ここに image_url を追加！）
    db.run(`CREATE TABLE IF NOT EXISTS diagnosis_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        diagnosis_set_id INTEGER NOT NULL,
        type_label TEXT NOT NULL,
        result_title TEXT NOT NULL,
        result_description TEXT,
        recommend_url TEXT,
        image_url TEXT, -- ★ここを追加しました
        FOREIGN KEY (diagnosis_set_id) REFERENCES diagnosis_sets(id)
    )`, (err) => {
        if (err) console.error("4. 結果詳細テーブル作成失敗:", err.message);
        else console.log("4. diagnosis_results テーブル準備完了（画像対応）");
    });

    console.log("--- 全テーブルのセットアップが完了しました ---");
});

db.close();