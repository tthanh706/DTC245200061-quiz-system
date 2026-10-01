const express = require("express");
const mysql = require("mysql2/promise");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const logDirectory = "/app/logs";

if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, {
    recursive: true,
  });
}

function writeLog(message) {
  const line = new Date().toISOString() + " " + message + "\n";

  console.log(line.trim());

  fs.appendFileSync(path.join(logDirectory, "app.log"), line);
}

const pool = mysql.createPool({
  host: process.env.DB_HOST || "mysql",
  user: process.env.DB_USER || "quiz_user",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "quiz_db",
  waitForConnections: true,
  connectionLimit: 10,
});

app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");

    res.json({
      status: "OK",
      application: "Quiz System",
      database: "Connected",
    });
  } catch (error) {
    writeLog("ERROR DATABASE " + error.message);

    res.status(500).json({
      status: "ERROR",
      database: "Disconnected",
    });
  }
});

app.get("/api/quizzes", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM quizzes");

    writeLog("GET /api/quizzes");

    res.json(rows);
  } catch (error) {
    writeLog("ERROR QUIZZES " + error.message);

    res.status(500).json({
      error: "Không tải được bài thi",
    });
  }
});

app.get("/api/quizzes/:id/questions", async (req, res) => {
  try {
    const quizId = req.params.id;

    const [questions] = await pool.query(
      `SELECT
                        id,
                        question_text
                    FROM questions
                    WHERE quiz_id = ?`,
      [quizId],
    );

    for (const question of questions) {
      const [answers] = await pool.query(
        `SELECT
                            id,
                            answer_text
                        FROM answers
                        WHERE question_id = ?`,
        [question.id],
      );

      question.answers = answers;
    }

    writeLog("LOAD QUIZ ID=" + quizId);

    res.json(questions);
  } catch (error) {
    writeLog("ERROR LOAD QUIZ " + error.message);

    res.status(500).json({
      error: "Không tải được câu hỏi",
    });
  }
});

app.post("/api/submit", async (req, res) => {
  try {
    const { studentName, quizId, answers } = req.body;

    if (!studentName) {
      return res.status(400).json({
        error: "Chưa nhập họ tên",
      });
    }

    let correct = 0;

    const selectedAnswers = Object.values(answers || {});

    for (const answerId of selectedAnswers) {
      const [rows] = await pool.query(
        `SELECT
                            is_correct
                        FROM answers
                        WHERE id = ?`,
        [answerId],
      );

      if (rows.length > 0 && rows[0].is_correct) {
        correct++;
      }
    }

    const [countResult] = await pool.query(
      `SELECT
                        COUNT(*) AS total
                    FROM questions
                    WHERE quiz_id = ?`,
      [quizId],
    );

    const total = countResult[0].total;

    let score = 0;

    if (total > 0) {
      score = (correct / total) * 10;
    }

    await pool.query(
      `INSERT INTO results
                (
                    student_name,
                    quiz_id,
                    score,
                    correct_answers,
                    total_questions
                )
                VALUES
                (?, ?, ?, ?, ?)`,
      [studentName, quizId, score, correct, total],
    );

    writeLog(
      "SUBMIT QUIZ " + "student=" + studentName + " score=" + score.toFixed(2),
    );

    res.json({
      studentName,
      correct,
      total,
      score: score.toFixed(2),
    });
  } catch (error) {
    writeLog("ERROR SUBMIT " + error.message);

    res.status(500).json({
      error: "Không thể chấm điểm",
    });
  }
});

app.get("/api/results", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
                        results.id,
                        results.student_name,
                        results.score,
                        results.correct_answers,
                        results.total_questions,
                        results.created_at,
                        quizzes.title
                    FROM results

                    INNER JOIN quizzes
                    ON results.quiz_id
                    =
                    quizzes.id

                    ORDER BY
                    results.id DESC`,
    );

    res.json(rows);
  } catch (error) {
    writeLog("ERROR RESULTS " + error.message);

    res.status(500).json({
      error: "Không tải được kết quả",
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  writeLog("Quiz Server started " + "port=" + PORT);
});
