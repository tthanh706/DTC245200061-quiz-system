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
  fs.mkdirSync(logDirectory, { recursive: true });
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

// ===============================
// ĐĂNG NHẬP
// ===============================

app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        error: "Vui lòng nhập đầy đủ tài khoản và mật khẩu.",
      });
    }

    const [rows] = await pool.query(
      `SELECT id, full_name, username, password, role
       FROM users
       WHERE username = ?`,
      [username],
    );

    if (rows.length === 0) {
      writeLog("LOGIN FAILED username=" + username);
      return res.status(401).json({
        error: "Tài khoản hoặc mật khẩu không đúng.",
      });
    }

    const user = rows[0];

    if (user.password !== password) {
      writeLog("LOGIN FAILED username=" + username);
      return res.status(401).json({
        error: "Tài khoản hoặc mật khẩu không đúng.",
      });
    }

    writeLog("LOGIN SUCCESS username=" + username + " role=" + user.role);

    res.json({
      message: "Đăng nhập thành công.",
      user: {
        id: user.id,
        full_name: user.full_name,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    writeLog("LOGIN ERROR " + error.message);

    res.status(500).json({
      error: "Lỗi hệ thống khi đăng nhập.",
    });
  }
});

// ===============================
// HEALTH CHECK
// ===============================

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

// ===============================
// DANH SÁCH QUIZ
// ===============================

app.get("/api/quizzes", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM quizzes ORDER BY id DESC");

    writeLog("GET /api/quizzes");
    res.json(rows);
  } catch (error) {
    writeLog("ERROR QUIZZES " + error.message);

    res.status(500).json({
      error: "Không tải được bài thi.",
    });
  }
});

// ===============================
// LOAD CÂU HỎI CỦA QUIZ
// ===============================

app.get("/api/admin/questions", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        questions.id,
        questions.quiz_id,
        questions.question_text,
        quizzes.title AS quiz_title
      FROM questions
      JOIN quizzes
        ON questions.quiz_id = quizzes.id
      ORDER BY questions.id DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Không tải được danh sách câu hỏi.",
    });
  }
});

// ===============================
// NỘP BÀI + CHẤM ĐIỂM
// ===============================

app.post("/api/submit", async (req, res) => {
  try {
    const { studentName, quizId, answers, userId } = req.body;

    if (!studentName) {
      return res.status(400).json({
        error: "Chưa nhập họ tên.",
      });
    }

    if (!quizId) {
      return res.status(400).json({
        error: "Không xác định được bài thi.",
      });
    }

    if (!answers || typeof answers !== "object") {
      return res.status(400).json({
        error: "Dữ liệu đáp án không hợp lệ.",
      });
    }

    const [questionRows] = await pool.query(
      `SELECT id
       FROM questions
       WHERE quiz_id = ?
       ORDER BY id ASC`,
      [quizId],
    );

    const total = questionRows.length;

    if (total === 0) {
      return res.status(400).json({
        error: "Bài thi chưa có câu hỏi.",
      });
    }

    let correct = 0;

    for (const question of questionRows) {
      const questionId = String(question.id);

      let selectedAnswers = answers[questionId] || [];

      if (!Array.isArray(selectedAnswers)) {
        selectedAnswers = [selectedAnswers];
      }

      const selectedIds = selectedAnswers
        .map((id) => Number(id))
        .filter((id) => !Number.isNaN(id))
        .sort((a, b) => a - b);

      const [correctRows] = await pool.query(
        `SELECT id
         FROM answers
         WHERE question_id = ?
         AND is_correct = 1
         ORDER BY id ASC`,
        [question.id],
      );

      const correctIds = correctRows
        .map((item) => Number(item.id))
        .sort((a, b) => a - b);

      const isCorrect =
        selectedIds.length === correctIds.length &&
        selectedIds.every((id, index) => id === correctIds[index]);

      if (isCorrect) {
        correct++;
      }
    }

    const score = Number(((correct / total) * 10).toFixed(2));

    await pool.query(
      `INSERT INTO results (
        user_id,
        student_name,
        quiz_id,
        score,
        correct_answers,
        total_questions
      )
      VALUES (?, ?, ?, ?, ?, ?)`,
      [userId || null, studentName, quizId, score, correct, total],
    );

    writeLog(
      `SUBMIT userId=${userId || "null"} student="${studentName}" quizId=${quizId} correct=${correct}/${total} score=${score}`,
    );

    res.json({
      studentName,
      correct,
      total,
      score: score.toFixed(2),
    });
  } catch (error) {
    console.error("SUBMIT ERROR:", error);

    writeLog("ERROR SUBMIT " + error.message);

    res.status(500).json({
      error: "Không thể chấm điểm.",
    });
  }
});

// ===============================
// TẤT CẢ KẾT QUẢ - ADMIN
// ===============================

app.get("/api/results", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
        results.id,
        results.user_id,
        results.student_name,
        results.score,
        results.correct_answers,
        results.total_questions,
        results.created_at,
        quizzes.title
      FROM results
      INNER JOIN quizzes
        ON results.quiz_id = quizzes.id
      ORDER BY results.id DESC`,
    );

    res.json(rows);
  } catch (error) {
    writeLog("ERROR RESULTS " + error.message);

    res.status(500).json({
      error: "Không tải được kết quả.",
    });
  }
});

// ===============================
// KẾT QUẢ CÁ NHÂN SINH VIÊN
// ===============================

app.get("/api/my-results/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const [rows] = await pool.query(
      `SELECT
        results.id,
        results.user_id,
        results.student_name,
        results.score,
        results.correct_answers,
        results.total_questions,
        results.created_at,
        quizzes.title
      FROM results
      INNER JOIN quizzes
        ON results.quiz_id = quizzes.id
      WHERE results.user_id = ?
      ORDER BY results.id DESC`,
      [userId],
    );

    res.json(rows);
  } catch (error) {
    writeLog("ERROR MY RESULTS " + error.message);

    res.status(500).json({
      error: "Không tải được kết quả cá nhân.",
    });
  }
});

// ===============================
// ADMIN - THỐNG KÊ
// ===============================

app.get("/api/admin/stats", async (req, res) => {
  try {
    const [questionRows] = await pool.query(
      "SELECT COUNT(*) AS total FROM questions",
    );

    const [studentRows] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM users
       WHERE role = 'student'`,
    );

    res.json({
      totalQuestions: questionRows[0].total,
      totalStudents: studentRows[0].total,
    });
  } catch (error) {
    writeLog("ADMIN STATS ERROR " + error.message);

    res.status(500).json({
      error: "Không tải được thống kê.",
    });
  }
});

// ===============================
// ADMIN - DANH SÁCH ĐỀ THI
// ===============================

app.get("/api/admin/quizzes", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM quizzes ORDER BY id DESC");

    res.json(rows);
  } catch (error) {
    writeLog("ADMIN QUIZZES ERROR " + error.message);

    res.status(500).json({
      error: "Không tải được danh sách đề thi.",
    });
  }
});

// ===============================
// ADMIN - THÊM ĐỀ THI
// ===============================

app.post("/api/admin/quizzes", async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({
        error: "Tên đề thi không được để trống.",
      });
    }

    const [result] = await pool.query(
      `INSERT INTO quizzes (title, description)
       VALUES (?, ?)`,
      [title, description || ""],
    );

    writeLog("ADMIN ADD QUIZ id=" + result.insertId);

    res.json({
      message: "Thêm đề thi thành công.",
      id: result.insertId,
    });
  } catch (error) {
    writeLog("ADMIN ADD QUIZ ERROR " + error.message);

    res.status(500).json({
      error: "Không thể thêm đề thi.",
    });
  }
});

// ===============================
// ADMIN - SỬA ĐỀ THI
// ===============================

app.put("/api/admin/quizzes/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({
        error: "Tên đề thi không được để trống.",
      });
    }

    const [result] = await pool.query(
      `UPDATE quizzes
       SET title = ?, description = ?
       WHERE id = ?`,
      [title, description || "", id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "Không tìm thấy đề thi.",
      });
    }

    writeLog("ADMIN UPDATE QUIZ id=" + id);

    res.json({
      message: "Cập nhật đề thi thành công.",
    });
  } catch (error) {
    writeLog("ADMIN UPDATE QUIZ ERROR " + error.message);

    res.status(500).json({
      error: "Không thể cập nhật đề thi.",
    });
  }
});

// ===============================
// ADMIN - XÓA ĐỀ THI
// ===============================

app.delete("/api/admin/quizzes/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const [result] = await pool.query("DELETE FROM quizzes WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "Không tìm thấy đề thi.",
      });
    }

    writeLog("ADMIN DELETE QUIZ id=" + id);

    res.json({
      message: "Xóa đề thi thành công.",
    });
  } catch (error) {
    writeLog("ADMIN DELETE QUIZ ERROR " + error.message);

    res.status(500).json({
      error: "Không thể xóa đề thi.",
    });
  }
});

// ===============================
// ADMIN - DANH SÁCH CÂU HỎI
// ===============================

app.get("/api/admin/questions", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        questions.id,
        questions.quiz_id,
        questions.question_text,
        quizzes.title AS quiz_title
      FROM questions
      INNER JOIN quizzes
        ON questions.quiz_id = quizzes.id
      ORDER BY questions.id DESC
    `);

    res.json(rows);
  } catch (error) {
    writeLog("ADMIN QUESTIONS ERROR " + error.message);
    res.status(500).json({
      error: "Không tải được danh sách câu hỏi.",
    });
  }
});

// ===============================
// ADMIN - THÊM CÂU HỎI
// ===============================

app.post("/api/admin/questions", async (req, res) => {
  try {
    const { quizId, questionText, answers } = req.body;

    if (!quizId || !questionText) {
      return res.status(400).json({
        error: "Vui lòng nhập đầy đủ đề thi và nội dung câu hỏi.",
      });
    }

    if (!Array.isArray(answers) || answers.length < 2) {
      return res.status(400).json({
        error: "Câu hỏi phải có ít nhất 2 đáp án.",
      });
    }

    const correctCount = answers.filter((item) => item.isCorrect).length;

    if (correctCount < 1) {
      return res.status(400).json({
        error: "Phải có ít nhất 1 đáp án đúng.",
      });
    }

    const [questionResult] = await pool.query(
      "INSERT INTO questions (quiz_id, question_text) VALUES (?, ?)",
      [quizId, questionText],
    );

    const questionId = questionResult.insertId;

    for (const answer of answers) {
      await pool.query(
        `INSERT INTO answers
        (question_id, answer_text, is_correct)
        VALUES (?, ?, ?)`,
        [questionId, answer.text, answer.isCorrect ? 1 : 0],
      );
    }

    writeLog("ADMIN ADD QUESTION id=" + questionId);

    res.json({
      message: "Thêm câu hỏi thành công.",
      id: questionId,
    });
  } catch (error) {
    writeLog("ADMIN ADD QUESTION ERROR " + error.message);

    res.status(500).json({
      error: "Không thể thêm câu hỏi.",
    });
  }
});

// ===============================
// ADMIN - CHI TIẾT CÂU HỎI
// ===============================

app.get("/api/admin/questions/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const [questions] = await pool.query(
      `SELECT id, quiz_id, question_text
       FROM questions
       WHERE id = ?`,
      [id],
    );

    if (questions.length === 0) {
      return res.status(404).json({
        error: "Không tìm thấy câu hỏi.",
      });
    }

    const [answers] = await pool.query(
      `SELECT id, answer_text, is_correct
       FROM answers
       WHERE question_id = ?`,
      [id],
    );

    res.json({
      ...questions[0],
      answers,
    });
  } catch (error) {
    res.status(500).json({
      error: "Không tải được câu hỏi.",
    });
  }
});

// ===============================
// ADMIN - SỬA CÂU HỎI
// ===============================

app.put("/api/admin/questions/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { quizId, questionText, answers } = req.body;

    if (!quizId || !questionText) {
      return res.status(400).json({
        error: "Thiếu thông tin câu hỏi.",
      });
    }

    const correctCount = answers.filter((item) => item.isCorrect).length;

    if (correctCount !== 1) {
      return res.status(400).json({
        error: "Phải có đúng 1 đáp án đúng.",
      });
    }

    await pool.query(
      `UPDATE questions
       SET quiz_id = ?, question_text = ?
       WHERE id = ?`,
      [quizId, questionText, id],
    );

    await pool.query("DELETE FROM answers WHERE question_id = ?", [id]);

    for (const answer of answers) {
      await pool.query(
        `INSERT INTO answers
        (question_id, answer_text, is_correct)
        VALUES (?, ?, ?)`,
        [id, answer.text, answer.isCorrect ? 1 : 0],
      );
    }

    writeLog("ADMIN UPDATE QUESTION id=" + id);

    res.json({
      message: "Cập nhật câu hỏi thành công.",
    });
  } catch (error) {
    writeLog("ADMIN UPDATE QUESTION ERROR " + error.message);

    res.status(500).json({
      error: "Không thể cập nhật câu hỏi.",
    });
  }
});

// ===============================
// ADMIN - XÓA CÂU HỎI
// ===============================

app.delete("/api/admin/questions/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const [result] = await pool.query("DELETE FROM questions WHERE id = ?", [
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "Không tìm thấy câu hỏi.",
      });
    }

    writeLog("ADMIN DELETE QUESTION id=" + id);

    res.json({
      message: "Xóa câu hỏi thành công.",
    });
  } catch (error) {
    writeLog("ADMIN DELETE QUESTION ERROR " + error.message);

    res.status(500).json({
      error: "Không thể xóa câu hỏi.",
    });
  }
});

app.get("/api/admin/students", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, full_name, username, created_at
       FROM users
       WHERE role = 'student'
       ORDER BY id DESC`,
    );

    res.json(rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Không tải được danh sách sinh viên.",
    });
  }
});

app.post("/api/admin/students", async (req, res) => {
  try {
    const { fullName, username, password } = req.body;

    if (!fullName || !username || !password) {
      return res.status(400).json({
        error: "Vui lòng nhập đầy đủ thông tin.",
      });
    }

    const [exists] = await pool.query(
      `SELECT id FROM users WHERE username = ?`,
      [username],
    );

    if (exists.length > 0) {
      return res.status(409).json({
        error: "Tên đăng nhập đã tồn tại.",
      });
    }

    const [result] = await pool.query(
      `INSERT INTO users (full_name, username, password, role)
       VALUES (?, ?, ?, 'student')`,
      [fullName, username, password],
    );

    res.status(201).json({
      message: "Thêm sinh viên thành công.",
      id: result.insertId,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Không thể thêm sinh viên.",
    });
  }
});

app.put("/api/admin/students/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { fullName, username, password } = req.body;

    if (!fullName || !username) {
      return res.status(400).json({
        error: "Họ tên và tên đăng nhập không được để trống.",
      });
    }

    const [duplicate] = await pool.query(
      `SELECT id
       FROM users
       WHERE username = ?
       AND id <> ?`,
      [username, id],
    );

    if (duplicate.length > 0) {
      return res.status(409).json({
        error: "Tên đăng nhập đã tồn tại.",
      });
    }

    if (password && password.trim() !== "") {
      await pool.query(
        `UPDATE users
         SET full_name = ?, username = ?, password = ?
         WHERE id = ? AND role = 'student'`,
        [fullName, username, password, id],
      );
    } else {
      await pool.query(
        `UPDATE users
         SET full_name = ?, username = ?
         WHERE id = ? AND role = 'student'`,
        [fullName, username, id],
      );
    }

    res.json({
      message: "Cập nhật sinh viên thành công.",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Không thể cập nhật sinh viên.",
    });
  }
});

app.delete("/api/admin/students/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const [result] = await pool.query(
      `DELETE FROM users
       WHERE id = ? AND role = 'student'`,
      [id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "Không tìm thấy sinh viên.",
      });
    }

    res.json({
      message: "Xóa sinh viên thành công.",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Không thể xóa sinh viên.",
    });
  }
});

app.get("/api/admin/results", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        r.id,
        r.user_id,
        r.student_name,
        u.username,
        r.quiz_id,
        q.title AS quiz_title,
        r.score,
        r.correct_answers,
        r.total_questions,
        r.created_at
      FROM results r
      LEFT JOIN users u
        ON r.user_id = u.id
      JOIN quizzes q
        ON r.quiz_id = q.id
      ORDER BY r.created_at DESC, r.id DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Không tải được danh sách kết quả thi.",
    });
  }
});

app.get("/api/admin/results-stats", async (req, res) => {
  try {
    const [[totalResult]] = await pool.query(`
      SELECT COUNT(*) AS total
      FROM results
    `);

    const [[averageResult]] = await pool.query(`
      SELECT ROUND(AVG(score), 2) AS average_score
      FROM results
    `);

    const [[highestResult]] = await pool.query(`
      SELECT MAX(score) AS highest_score
      FROM results
    `);

    const [[passedResult]] = await pool.query(`
      SELECT COUNT(*) AS passed
      FROM results
      WHERE score >= 5
    `);

    res.json({
      total_attempts: totalResult.total || 0,
      average_score: averageResult.average_score || 0,
      highest_score: highestResult.highest_score || 0,
      passed: passedResult.passed || 0,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Không tải được thống kê kết quả thi.",
    });
  }
});

app.delete("/api/admin/results/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const [result] = await pool.query(`DELETE FROM results WHERE id = ?`, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "Không tìm thấy lượt thi.",
      });
    }

    res.json({
      message: "Xóa kết quả thi thành công.",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Không thể xóa kết quả thi.",
    });
  }
});

app.get("/api/quizzes/:id/questions", async (req, res) => {
  try {
    const quizId = req.params.id;

    const [questions] = await pool.query(
      `SELECT id, question_text
       FROM questions
       WHERE quiz_id = ?
       ORDER BY id ASC`,
      [quizId],
    );

    for (const question of questions) {
      const [answers] = await pool.query(
        `SELECT id, answer_text
         FROM answers
         WHERE question_id = ?
         ORDER BY id ASC`,
        [question.id],
      );

      const [correctRows] = await pool.query(
        `SELECT COUNT(*) AS total
         FROM answers
         WHERE question_id = ?
         AND is_correct = 1`,
        [question.id],
      );

      question.answers = answers;
      question.multiple = Number(correctRows[0].total) > 1;
    }

    writeLog("LOAD QUIZ ID=" + quizId);

    res.json(questions);
  } catch (error) {
    writeLog("ERROR LOAD QUIZ " + error.message);

    res.status(500).json({
      error: "Không tải được câu hỏi.",
    });
  }
});
// ===============================
// START SERVER
// ===============================

app.listen(PORT, "0.0.0.0", () => {
  writeLog("Quiz Server started port=" + PORT);
});
