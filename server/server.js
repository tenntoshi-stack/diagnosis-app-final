const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());
const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
    // 最小限のテーブル作成
    db.run(`CREATE TABLE IF NOT EXISTS questions (id INTEGER PRIMARY KEY AUTOINCREMENT, diagnosis_id INTEGER, question_text TEXT)`);
    db.run(`CREATE TABLE IF NOT EXISTS choices (id INTEGER PRIMARY KEY AUTOINCREMENT, question_id INTEGER, choice_text TEXT, next_question_id INTEGER, label TEXT)`);
});

app.get('/api/questions', (req, res) => {
    const { diagnosis_id } = req.query;
    db.all("SELECT * FROM questions WHERE diagnosis_id = ?", [diagnosis_id], (err, rows) => res.json(rows || []));
});

app.get('/api/choices', (req, res) => {
    db.all("SELECT * FROM choices", [], (err, rows) => res.json(rows || []));
});

// POST（追加）だけ残しておきます
app.post('/api/questions', (req, res) => {
    const { diagnosis_id, question_text } = req.body;
    db.run("INSERT INTO questions (diagnosis_id, question_text) VALUES (?, ?)", [diagnosis_id, question_text], function() { res.json({ id: this.lastID }); });
});

const PORT = process.env.PORT || 5000;
// 質問を削除する窓口
app.delete('/api/questions/:id', (req, res) => {
    db.run("DELETE FROM questions WHERE id = ?", [req.params.id], () => res.json({ message: "OK" }));
    // 【追加】選択肢（回答ロジック）を削除
app.delete('/api/choices/:id', (req, res) => {
    db.run("DELETE FROM choices WHERE id = ?", [req.params.id], () => res.json({ message: "OK" }));
});
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));