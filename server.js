const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors({ origin: '*', methods: ['GET', 'POST'], allowedHeaders: ['Content-Type'] }));
app.use(express.json());

// --- 🌟 データベースの保存場所を確実に確保する ---
// Renderのような環境でもエラーにならないよう、絶対パスを指定します
const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error("Database opening error: ", err);
});

// --- データベース初期化 ---
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS diagnosis_sets (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, description TEXT, image_url TEXT, detail_url TEXT)`);
    db.run(`CREATE TABLE IF NOT EXISTS questions (id INTEGER PRIMARY KEY AUTOINCREMENT, diagnosis_id INTEGER, question_text TEXT)`);
    db.run(`CREATE TABLE IF NOT EXISTS choices (id INTEGER PRIMARY KEY AUTOINCREMENT, question_id INTEGER, choice_text TEXT, next_question_id INTEGER, label TEXT)`);
    db.run(`CREATE TABLE IF NOT EXISTS results (id INTEGER PRIMARY KEY AUTOINCREMENT, diagnosis_id INTEGER, label TEXT, title TEXT, description TEXT, image_url TEXT, external_url TEXT, info_url TEXT)`);
});

// --- 🌟 パスワード確認窓口 ---
app.all('/api/verify-password', (req, res) => {
    try {
        const password = req.body.password || req.query.password;
        const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin1234"; 
        
        if (req.method === 'GET' && !req.query.password) {
            return res.send("✅ パスワード確認窓口は正常に動作しています。VercelからPOST送信してください。");
        }

        if (password === ADMIN_PASSWORD) {
            res.json({ success: true });
        } else {
            res.status(401).json({ success: false, message: "パスワード不一致" });
        }
    } catch (error) {
        // エラーの内容をブラウザに返す（デバッグ用）
        res.status(500).json({ error: error.message });
    }
});

// その他のAPI（省略していますが、元のコードのままでOKです）
app.get('/api/diagnoses', (req, res) => {
    db.all("SELECT * FROM diagnosis_sets", [], (err, rows) => res.json(rows || []));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));