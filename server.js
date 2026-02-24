const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
require('dotenv').config();

const app = express();

// --- 🌟 1. CORS設定（どんな環境からも接続を許可する） ---
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// データベース接続
const db = new sqlite3.Database('./database.sqlite');

// --- データベース初期化 ---
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS diagnosis_sets (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, description TEXT, image_url TEXT, detail_url TEXT)`);
    db.run(`CREATE TABLE IF NOT EXISTS questions (id INTEGER PRIMARY KEY AUTOINCREMENT, diagnosis_id INTEGER, question_text TEXT)`);
    db.run(`CREATE TABLE IF NOT EXISTS choices (id INTEGER PRIMARY KEY AUTOINCREMENT, question_id INTEGER, choice_text TEXT, next_question_id INTEGER, label TEXT)`);
    db.run(`CREATE TABLE IF NOT EXISTS results (id INTEGER PRIMARY KEY AUTOINCREMENT, diagnosis_id INTEGER, label TEXT, title TEXT, description TEXT, image_url TEXT, external_url TEXT, info_url TEXT)`);
});

// --- 🌟 2. パスワード確認窓口（強化版） ---
// app.post ではなく app.all にすることで、あらゆる接続方法に対応します
app.all('/api/verify-password', (req, res) => {
    const password = req.body.password || req.query.password;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin1234"; 
    
    // ブラウザで直接開いた場合（GET）のメッセージ
    if (req.method === 'GET' && !req.query.password) {
        return res.send("✅ パスワード確認窓口は正常に動作しています。VercelからPOST送信してください。");
    }

    if (password === ADMIN_PASSWORD) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: "パスワードが一致しません" });
    }
});

// --- 3. 診断データ関連のAPI ---
app.get('/api/diagnoses', (req, res) => {
    db.all("SELECT * FROM diagnosis_sets", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows || []);
    });
});

app.post('/api/diagnoses', (req, res) => {
    const { name, description, image_url, detail_url } = req.body;
    db.run("INSERT INTO diagnosis_sets (name, description, image_url, detail_url) VALUES (?, ?, ?, ?)", 
    [name, description, image_url, detail_url], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID });
    });
});

app.delete('/api/diagnoses/:id', (req, res) => {
    db.run("DELETE FROM diagnosis_sets WHERE id = ?", [req.params.id], () => res.json({ message: "OK" }));
});

// --- 4. 質問・選択肢・結果のAPI ---
app.get('/api/questions', (req, res) => {
    const { diagnosis_id } = req.query;
    db.all("SELECT * FROM questions WHERE diagnosis_id = ?", [diagnosis_id], (err, rows) => res.json(rows || []));
});

app.post('/api/questions', (req, res) => {
    const { diagnosis_id, question_text } = req.body;
    db.run("INSERT INTO questions (diagnosis_id, question_text) VALUES (?, ?)", [diagnosis_id, question_text], function() { res.json({ id: this.lastID }); });
});

app.get('/api/choices', (req, res) => {
    db.all("SELECT * FROM choices", [], (err, rows) => res.json(rows || []));
});

app.post('/api/choices', (req, res) => {
    const { question_id, choice_text, next_question_id, label } = req.body;
    db.run("INSERT INTO choices (question_id, choice_text, next_question_id, label) VALUES (?, ?, ?, ?)", [question_id, choice_text, next_question_id, label], function() { res.json({ id: this.lastID }); });
});

app.get('/api/results', (req, res) => {
    const { diagnosis_id } = req.query;
    db.all("SELECT * FROM results WHERE diagnosis_id = ?", [diagnosis_id], (err, rows) => res.json(rows || []));
});

app.post('/api/results', (req, res) => {
    const { id, diagnosis_id, label, title, description, image_url, external_url, info_url } = req.body;
    if (id) {
        db.run("UPDATE results SET label=?, title=?, description=?, image_url=?, external_url=?, info_url=? WHERE id=?", [label, title, description, image_url, external_url, info_url, id], () => res.json({ message: "Updated" }));
    } else {
        db.run("INSERT INTO results (diagnosis_id, label, title, description, image_url, external_url, info_url) VALUES (?, ?, ?, ?, ?, ?, ?)", [diagnosis_id, label, title, description, image_url, external_url, info_url], function() { res.json({ id: this.lastID }); });
    }
});

// 削除API
app.delete('/api/questions/:id', (req, res) => { db.run("DELETE FROM questions WHERE id = ?", [req.params.id], () => res.json({ message: "OK" })); });
app.delete('/api/choices/:id', (req, res) => { db.run("DELETE FROM choices WHERE id = ?", [req.params.id], () => res.json({ message: "OK" })); });
app.delete('/api/results/:id', (req, res) => { db.run("DELETE FROM results WHERE id = ?", [req.params.id], () => res.json({ message: "OK" })); });

// --- 🌟 5. ポート設定（Render対応） ---
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});