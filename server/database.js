// server/database.js に貼り付けるコード

const sqlite3 = require('sqlite3').verbose();
const dotenv = require('dotenv');

// .envファイルを読み込む
dotenv.config();

const DB_FILE = process.env.DB_FILE;
const db = new sqlite3.Database(DB_FILE, (err) => {
    if (err) {
        console.error('Database connection error:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initializeDb();
    }
});

/**
 * データベースの初期化とテーブル作成
 */
function initializeDb() {
    db.serialize(() => {
        // 1. DiagnosisSet (診断セット) テーブル
        db.run(`
            CREATE TABLE IF NOT EXISTS DiagnosisSet (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                is_public BOOLEAN DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 2. Question (質問) テーブル
        db.run(`
            CREATE TABLE IF NOT EXISTS Question (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                set_id INTEGER,
                order_index INTEGER NOT NULL,
                question_text TEXT NOT NULL,
                image_url VARCHAR(255),
                option1_text VARCHAR(255) NOT NULL,
                option1_next_id VARCHAR(50) NOT NULL,
                option2_text VARCHAR(255) NOT NULL,
                option2_next_id VARCHAR(50) NOT NULL,
                FOREIGN KEY (set_id) REFERENCES DiagnosisSet(id) ON DELETE CASCADE
            )
        `);

        // 3. Result (結果) テーブル
        db.run(`
            CREATE TABLE IF NOT EXISTS Result (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                set_id INTEGER,
                result_id_name VARCHAR(50) UNIQUE NOT NULL,
                title VARCHAR(255) NOT NULL,
                message TEXT,
                link_url VARCHAR(255),
                image_url VARCHAR(255),
                FOREIGN KEY (set_id) REFERENCES DiagnosisSet(id) ON DELETE CASCADE
            )
        `);

        // --- 初期データの挿入 ---
        // テーブルが空の場合のみ、白髪染め診断のデータを挿入
        db.get('SELECT COUNT(*) AS count FROM DiagnosisSet', (err, row) => {
            if (row && row.count === 0) {
                insertInitialData();
            }
        });
    });
}

/**
 * 白髪染め診断の初期データを挿入する
 */
function insertInitialData() {
    console.log("Inserting initial 'Hair Color Diagnosis' data...");

    // 1. DiagnosisSet の挿入
    const setStmt = db.prepare(`
        INSERT INTO DiagnosisSet (title, description, is_public) 
        VALUES (?, ?, ?)
    `);
    setStmt.run("白髪染め診断", "あなたの髪質とライフスタイルに合った最適な白髪染めをご提案します。", 1, function(err) {
        if (err) return console.error("Set insert error:", err.message);
        
        const set_id = this.lastID;

        // 2. Question の挿入 (簡略化のためQ1, Q2のみ例示)
        const qStmt = db.prepare(`
            INSERT INTO Question (set_id, order_index, question_text, image_url, 
            option1_text, option1_next_id, option2_text, option2_next_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        qStmt.run(set_id, 1, "Q1. ジアミンアレルギーの有無について、把握していますか？", "/images/q1_allergy.jpg", 
                  "はい、アレルギーがあります", "Q2", "いいえ、アレルギーはありません", "Q3");
        qStmt.run(set_id, 2, "Q2. 施術の時間や価格に対する考え方は？", "/images/q2_henna_vs_manicure.jpg", 
                  "価格、時間はこだわらないが、最高のツヤ髪が欲しい", "R1", "価格、時間にも配慮しながら、ツヤ髪が欲しい", "R4");
        // ※ Q3, Q4, Q5 のデータも必要ですが、まずは動作確認のためQ1, Q2のみで進めます。
        qStmt.finalize();

        // 3. Result の挿入 (簡略化のためR1, R4のみ例示)
        const rStmt = db.prepare(`
            INSERT INTO Result (set_id, result_id_name, title, message, link_url, image_url) 
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        rStmt.run(set_id, "R1", "オーガニックヘナ", "時間や価格よりも、すぐにわかる最高のツヤ感とハリ・コシにこだわりたいあなたに最適です。", 
                  "https://example.com/henna-menu", "/images/r1_henna.jpg");
        rStmt.run(set_id, "R4", "ヘアマニキュア", "ジアミン不使用でダメージを抑えつつ、ツヤ感を手軽に得たい、バランスを重視するあなたにおすすめです。", 
                  "https://example.com/manicure-menu", "/images/r4_manicure.jpg");
        // ※ R2, R3 のデータも必要ですが、まずは動作確認のためR1, R4のみで進めます。
        rStmt.finalize();

        console.log("Initial data insertion complete.");
    });
}

module.exports = db; // サーバーがDB接続を使用できるようにエクスポート