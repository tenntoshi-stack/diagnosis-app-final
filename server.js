const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const DATA_FILE = './diagnoses.json'; // 複数保存用のファイル名

app.use(express.json());
app.use(cors());

// 1. すべての診断の「一覧」を取得（ダッシュボード用）
app.get('/all-diagnoses', (req, res) => {
  if (!fs.existsSync(DATA_FILE)) return res.json([]);
  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  
  // フロントエンドの一覧画面に必要な情報だけを抜粋して返す
  const list = Object.keys(data).map(id => ({
    id: id,
    title: data[id].config.title,
    qCount: data[id].questions.length,
    rCount: data[id].results.length
  }));
  res.json(list);
});

// 2. 特定の診断IDの「詳細データ」を取得（編集・診断実行用）
app.get('/diagnosis/:id', (req, res) => {
  const id = req.params.id;
  if (!fs.existsSync(DATA_FILE)) return res.status(404).json({ error: "No data" });
  
  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  if (data[id]) {
    res.json(data[id]);
  } else {
    res.status(404).json({ error: "Diagnosis not found" });
  }
});

// 3. 診断データを保存（新規・上書き共通）
app.post('/save-diagnosis', (req, res) => {
  const { id, config, questions, results } = req.body;
  if (!id) return res.status(400).json({ error: "ID is required" });

  let allData = {};
  if (fs.existsSync(DATA_FILE)) {
    allData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  }

  // IDをキーにして保存（既存のIDなら上書きされる）
  allData[id] = { config, questions, results };

  fs.writeFileSync(DATA_FILE, JSON.stringify(allData, null, 2));
  res.json({ message: "Saved successfully", id: id });
});

// 4. 診断を削除
app.delete('/diagnosis/:id', (req, res) => {
  const id = req.params.id;
  if (!fs.existsSync(DATA_FILE)) return res.status(404).json({ error: "No data" });

  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  delete data[id];
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  res.json({ message: "Deleted successfully" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});