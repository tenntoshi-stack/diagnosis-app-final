const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./database.sqlite');

// --- 1. データベースの初期化 (テーブル作成) ---
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS diagnosis_sets (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, description TEXT, image_url TEXT)`);
    db.run(`CREATE TABLE IF NOT EXISTS questions (id INTEGER PRIMARY KEY AUTOINCREMENT, diagnosis_id INTEGER, question_text TEXT)`);
    db.run(`CREATE TABLE IF NOT EXISTS choices (id INTEGER PRIMARY KEY AUTOINCREMENT, question_id INTEGER, choice_text TEXT, next_question_id INTEGER, label TEXT)`);
    db.run(`CREATE TABLE IF NOT EXISTS results (id INTEGER PRIMARY KEY AUTOINCREMENT, diagnosis_id INTEGER, label TEXT, title TEXT, description TEXT, image_url TEXT, external_url TEXT)`);
});

// --- 2. API窓口 (ここがエラーの原因だった場所) ---

// 診断一覧
app.get('/api/diagnoses', (req, res) => {
    db.all("SELECT * FROM diagnosis_sets", [], (err, rows) => res.json(rows || []));
});

// 特定の診断詳細 (404対策)
app.get('/api/diagnoses/:id', (req, res) => {
    const { id } = req.params;
    db.get("SELECT * FROM diagnosis_sets WHERE id = ?", [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: "Not Found" });
        res.json(row);
    });
});

// 診断の作成・更新
app.post('/api/diagnoses', (req, res) => {
    const { id, name, description, image_url } = req.body;
    if (id) {
        db.run("UPDATE diagnosis_sets SET name=?, description=?, image_url=? WHERE id=?", [name, description, image_url, id], () => res.json({ message: "Updated" }));
    } else {
        db.run("INSERT INTO diagnosis_sets (name, description, image_url) VALUES (?, ?, ?)", [name, description, image_url], function() { res.json({ id: this.lastID }); });
    }
});

// 質問一覧 (500対策)
app.get('/api/questions', (req, res) => {
    const { diagnosis_id } = req.query;
    db.all("SELECT * FROM questions WHERE diagnosis_id = ?", [diagnosis_id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows || []);
    });
});

// 質問の追加
app.post('/api/questions', (req, res) => {
    const { diagnosis_id, question_text } = req.body;
    db.run("INSERT INTO questions (diagnosis_id, question_text) VALUES (?, ?)", [diagnosis_id, question_text], function() { res.json({ id: this.lastID }); });
});

// 選択肢一覧 (404対策)
app.get('/api/choices', (req, res) => {
    db.all("SELECT * FROM choices", [], (err, rows) => res.json(rows || []));
});

// 選択肢の追加
app.post('/api/choices', (req, res) => {
    const { question_id, choice_text, next_question_id, label } = req.body;
    db.run("INSERT INTO choices (question_id, choice_text, next_question_id, label) VALUES (?, ?, ?, ?)", [question_id, choice_text, next_question_id, label], function() { res.json({ id: this.lastID }); });
});

// 結果一覧 (500対策)
app.get('/api/results', (req, res) => {
    const { diagnosis_id } = req.query;
    db.all("SELECT * FROM results WHERE diagnosis_id = ?", [diagnosis_id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows || []);
    });
});

// 結果の追加
app.post('/api/results', (req, res) => {
    const { diagnosis_id, label, title, description, image_url, external_url } = req.body;
    db.run("INSERT INTO results (diagnosis_id, label, title, description, image_url, external_url) VALUES (?, ?, ?, ?, ?, ?, ?)", [diagnosis_id, label, title, description, image_url, external_url], function() { res.json({ id: this.lastID }); });
});

// 削除API各種
app.delete('/api/questions/:id', (req, res) => { db.run("DELETE FROM questions WHERE id = ?", [req.params.id], () => res.json({ message: "OK" })); });
app.delete('/api/choices/:id', (req, res) => { db.run("DELETE FROM choices WHERE id = ?", [req.params.id], () => res.json({ message: "OK" })); });
app.delete('/api/results/:id', (req, res) => { db.run("DELETE FROM results WHERE id = ?", [req.params.id], () => res.json({ message: "OK" })); });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));