const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./diagnosis.db');

// 起動時にテーブルとカラムの存在を確認
db.serialize(() => {

    // テーブル作成
// 診断セットテーブル（説明と画像URLを追加した新しい設定）
    db.run(`CREATE TABLE IF NOT EXISTS diagnosis_sets (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        name TEXT,
        description TEXT,
        image_url TEXT
    )`, () => {
        // すでにテーブルがある場合、新しいカラム（列）を追加する命令
        db.run("ALTER TABLE diagnosis_sets ADD COLUMN description TEXT", (err) => {
            if (!err) console.log("Added description column to diagnosis_sets.");
        });
        db.run("ALTER TABLE diagnosis_sets ADD COLUMN image_url TEXT", (err) => {
            if (!err) console.log("Added image_url column to diagnosis_sets.");
        });
    });
    db.run(`CREATE TABLE IF NOT EXISTS questions (id INTEGER PRIMARY KEY AUTOINCREMENT, diagnosis_set_id INTEGER, question_text TEXT)`);
    db.run(`CREATE TABLE IF NOT EXISTS choices (id INTEGER PRIMARY KEY AUTOINCREMENT, question_id INTEGER, choice_text TEXT, next_question_id INTEGER, label TEXT)`);
    db.run(`CREATE TABLE IF NOT EXISTS diagnosis_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        diagnosis_set_id INTEGER, 
        type_label TEXT, 
        result_title TEXT, 
        result_description TEXT, 
        recommend_url TEXT, 
        image_url TEXT,
        detail_url TEXT
    )`, () => {
        // もし古いDBで detail_url がない場合は追加する
        db.run("ALTER TABLE diagnosis_results ADD COLUMN detail_url TEXT", (err) => {
            if (!err) console.log("Added detail_url column.");
        });
    });
});

// --- API ROUTES ---

// 診断一覧
app.get('/api/diagnoses', (req, res) => {
    db.all("SELECT * FROM diagnosis_sets", [], (err, rows) => res.json(rows));
});
// 特定の診断セットの詳細（名前・説明・画像）を取得
app.get('/api/diagnoses/:id', (req, res) => {
    const { id } = req.params;
    db.get("SELECT * FROM diagnosis_sets WHERE id = ?", [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row);
    });
});

// --- 選択肢(Choices)テーブルがなければ作成 ---
db.run(`CREATE TABLE IF NOT EXISTS choices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question_id INTEGER,
  choice_text TEXT,
  next_question_id INTEGER,
  label TEXT
)`);

// --- 選択肢(Choices)の取得と保存の窓口 ---

// 全ての選択肢を取得
app.get('/api/choices', (req, res) => {
  db.all('SELECT * FROM choices', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows || []);
  });
});

// 新しい選択肢を保存
app.post('/api/choices', (req, res) => {
  const { question_id, choice_text, next_question_id, label } = req.body;
  db.run(
    `INSERT INTO choices (question_id, choice_text, next_question_id, label) VALUES (?, ?, ?, ?)`,
    [question_id, choice_text, next_question_id, label],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

// --- 削除用APIの追加 ---

// 選択肢（ロジック）を削除
app.delete('/api/choices/:id', (req, res) => {
  db.run("DELETE FROM choices WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Deleted" });
  });
});

// 質問を削除
app.delete('/api/questions/:id', (req, res) => {
  db.run("DELETE FROM questions WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Deleted" });
  });
});

// 結果ラベルを削除
app.delete('/api/results/:id', (req, res) => {
  db.run("DELETE FROM results WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Deleted" });
  });
});
// 診断セットの作成・更新（上書き対応）
app.post('/api/diagnoses', (req, res) => {
    const { id, name, description, image_url } = req.body;

    if (id) {
        // IDがある場合は「更新」
        const sql = `UPDATE diagnosis_sets SET name = ?, description = ?, image_url = ? WHERE id = ?`;
        db.run(sql, [name, description, image_url, id], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: '診断設定を更新しました' });
        });
    } else {
        // IDがない場合は「新規作成」
        const sql = `INSERT INTO diagnosis_sets (name, description, image_url) VALUES (?, ?, ?)`;
        db.run(sql, [name, description, image_url], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID });
        });
    }
});
// 質問操作
app.get('/api/diagnoses/:id/questions', (req, res) => {
    db.all("SELECT * FROM questions WHERE diagnosis_set_id = ?", [req.params.id], (err, rows) => res.json(rows));
});

app.get('/api/diagnoses/:id/questions/first', (req, res) => {
    db.get("SELECT * FROM questions WHERE diagnosis_set_id = ? ORDER BY id ASC LIMIT 1", [req.params.id], (err, row) => res.json(row));
});

app.get('/api/questions/detail/:id', (req, res) => {
    db.get("SELECT * FROM questions WHERE id = ?", [req.params.id], (err, row) => res.json(row));
});

app.post('/api/questions', (req, res) => {
    const { diagnosis_set_id, question_text } = req.body;
    db.run("INSERT INTO questions (diagnosis_set_id, question_text) VALUES (?, ?)", [diagnosis_set_id, question_text], function(err) {
        res.json({ id: this.lastID });
    });
});

// 選択肢
app.get('/api/questions/:id/choices', (req, res) => {
    db.all("SELECT * FROM choices WHERE question_id = ?", [req.params.id], (err, rows) => res.json(rows));
});

app.post('/api/choices', (req, res) => {
    const { question_id, choice_text, next_question_id, label } = req.body;
    db.run("INSERT INTO choices (question_id, choice_text, next_question_id, label) VALUES (?, ?, ?, ?)", 
        [question_id, choice_text, next_question_id, label], function(err) {
        res.json({ id: this.lastID });
    });
});

// 結果設定（detail_urlを追加）
app.get('/api/diagnoses/:id/results', (req, res) => {
    db.all("SELECT * FROM diagnosis_results WHERE diagnosis_set_id = ?", [req.params.id], (err, rows) => res.json(rows));
});
// 選択肢の保存（上書き対応版）
app.post('/api/choices', (req, res) => {
  const { question_id, choice_text, next_question_id, label } = req.body;

  // 同じ質問内に、同じ選択肢テキストがあるか確認
  db.get('SELECT id FROM choices WHERE question_id = ? AND choice_text = ?', [question_id, choice_text], (err, row) => {
    if (row) {
      // 存在すれば更新（UPDATE）
      const sql = `UPDATE choices SET next_question_id = ?, label = ? WHERE id = ?`;
      db.run(sql, [next_question_id, label, row.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: '選択肢を更新しました', id: row.id });
      });
    } else {
      // なければ新規作成（INSERT）
      const sql = `INSERT INTO choices (question_id, choice_text, next_question_id, label) VALUES (?, ?, ?, ?)`;
      db.run(sql, [question_id, choice_text, next_question_id, label], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID });
      });
    }
  });
});
// 診断セットの削除
app.delete('/api/diagnoses/:id', (req, res) => {
  const { id } = req.params;
  // 診断セット本体を削除（関連する質問や結果は別途消すか、そのまま残りますが画面からは消えます）
  db.run('DELETE FROM diagnosis_sets WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: '削除しました' });
  });
});
// 質問の削除
app.delete('/api/questions/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM questions WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: '質問を削除しました' });
  });
});

// 選択肢の削除
app.delete('/api/choices/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM choices WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: '選択肢を削除しました' });
  });
});
// 診断結果の削除
app.post('/api/results/delete', (req, res) => {
  const { id } = req.body;
  db.run('DELETE FROM diagnosis_results WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: '結果を削除しました' });
  });
});
// --- 診断結果の保存・更新（ここが抜けていました） ---
app.post('/api/results', (req, res) => {
  const { diagnosis_set_id, type_label, result_title, result_description, image_url, recommend_url, detail_url } = req.body;
  
  // 同じ診断セット内に、同じラベルのデータがあるか確認
  db.get('SELECT id FROM diagnosis_results WHERE diagnosis_set_id = ? AND type_label = ?', [diagnosis_set_id, type_label], (err, row) => {
    if (row) {
      // 既に存在する場合は「更新 (UPDATE)」
      const sql = `UPDATE diagnosis_results SET result_title = ?, result_description = ?, image_url = ?, recommend_url = ?, detail_url = ? WHERE id = ?`;
      db.run(sql, [result_title, result_description, image_url, recommend_url, detail_url, row.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: '更新しました', id: row.id });
      });
    } else {
      // 存在しない場合は「新規作成 (INSERT)」
      const sql = `INSERT INTO diagnosis_results (diagnosis_set_id, type_label, result_title, result_description, image_url, recommend_url, detail_url) VALUES (?, ?, ?, ?, ?, ?, ?)`;
      db.run(sql, [diagnosis_set_id, type_label, result_title, result_description, image_url, recommend_url, detail_url], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID });
      });
    }
  });
});
app.listen(5000, () => console.log('Server running on http://localhost:5000'));