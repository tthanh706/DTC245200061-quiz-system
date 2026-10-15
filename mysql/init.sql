SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

CREATE DATABASE IF NOT EXISTS quiz_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE quiz_db;

CREATE TABLE IF NOT EXISTS quizzes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quiz_id INT NOT NULL,
    question_text TEXT NOT NULL,

    CONSTRAINT fk_questions_quiz
        FOREIGN KEY (quiz_id)
        REFERENCES quizzes(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS answers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT NOT NULL,
    answer_text VARCHAR(500) NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT fk_answers_question
        FOREIGN KEY (question_id)
        REFERENCES questions(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'student') NOT NULL DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    student_name VARCHAR(100) NOT NULL,
    quiz_id INT NOT NULL,
    score DECIMAL(5,2) NOT NULL DEFAULT 0,
    total_questions INT NOT NULL DEFAULT 0,
    correct_answers INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_results_quiz
        FOREIGN KEY (quiz_id)
        REFERENCES quizzes(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_results_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE SET NULL
);

INSERT IGNORE INTO users (
    full_name,
    username,
    password,
    role
)
VALUES
(
    'Quản trị viên',
    'admin',
    'Admin@123',
    'admin'
),
(
    'Sinh viên 01',
    'student01',
    'Student@123',
    'student'
);

INSERT INTO quizzes (
    title,
    description
)
SELECT
    'Kiểm tra kiến thức CNTT',
    'Bài thi trắc nghiệm kiến thức công nghệ thông tin'
WHERE NOT EXISTS (
    SELECT 1
    FROM quizzes
    WHERE title = 'Kiểm tra kiến thức CNTT'
);

SET @quiz_id = (
    SELECT id
    FROM quizzes
    WHERE title = 'Kiểm tra kiến thức CNTT'
    ORDER BY id
    LIMIT 1
);

INSERT INTO questions (
    quiz_id,
    question_text
)
SELECT
    @quiz_id,
    'HTML là viết tắt của cụm từ nào?'
WHERE NOT EXISTS (
    SELECT 1
    FROM questions
    WHERE quiz_id = @quiz_id
      AND question_text = 'HTML là viết tắt của cụm từ nào?'
);

INSERT INTO questions (
    quiz_id,
    question_text
)
SELECT
    @quiz_id,
    'CSS được sử dụng chủ yếu để làm gì?'
WHERE NOT EXISTS (
    SELECT 1
    FROM questions
    WHERE quiz_id = @quiz_id
      AND question_text = 'CSS được sử dụng chủ yếu để làm gì?'
);

INSERT INTO questions (
    quiz_id,
    question_text
)
SELECT
    @quiz_id,
    'MySQL thuộc loại hệ quản trị cơ sở dữ liệu nào?'
WHERE NOT EXISTS (
    SELECT 1
    FROM questions
    WHERE quiz_id = @quiz_id
      AND question_text = 'MySQL thuộc loại hệ quản trị cơ sở dữ liệu nào?'
);

SET @q1 = (
    SELECT id
    FROM questions
    WHERE quiz_id = @quiz_id
      AND question_text = 'HTML là viết tắt của cụm từ nào?'
    LIMIT 1
);

SET @q2 = (
    SELECT id
    FROM questions
    WHERE quiz_id = @quiz_id
      AND question_text = 'CSS được sử dụng chủ yếu để làm gì?'
    LIMIT 1
);

SET @q3 = (
    SELECT id
    FROM questions
    WHERE quiz_id = @quiz_id
      AND question_text = 'MySQL thuộc loại hệ quản trị cơ sở dữ liệu nào?'
    LIMIT 1
);

INSERT INTO answers (
    question_id,
    answer_text,
    is_correct
)
SELECT
    @q1,
    'Hyper Text Markup Language',
    TRUE
WHERE NOT EXISTS (
    SELECT 1
    FROM answers
    WHERE question_id = @q1
      AND answer_text = 'Hyper Text Markup Language'
);

INSERT INTO answers (
    question_id,
    answer_text,
    is_correct
)
SELECT
    @q1,
    'High Text Machine Language',
    FALSE
WHERE NOT EXISTS (
    SELECT 1
    FROM answers
    WHERE question_id = @q1
      AND answer_text = 'High Text Machine Language'
);

INSERT INTO answers (
    question_id,
    answer_text,
    is_correct
)
SELECT
    @q1,
    'Hyper Tool Multi Language',
    FALSE
WHERE NOT EXISTS (
    SELECT 1
    FROM answers
    WHERE question_id = @q1
      AND answer_text = 'Hyper Tool Multi Language'
);

INSERT INTO answers (
    question_id,
    answer_text,
    is_correct
)
SELECT
    @q1,
    'Home Text Markup Language',
    FALSE
WHERE NOT EXISTS (
    SELECT 1
    FROM answers
    WHERE question_id = @q1
      AND answer_text = 'Home Text Markup Language'
);

INSERT INTO answers (
    question_id,
    answer_text,
    is_correct
)
SELECT
    @q2,
    'Thiết kế giao diện và định dạng trang web',
    TRUE
WHERE NOT EXISTS (
    SELECT 1
    FROM answers
    WHERE question_id = @q2
      AND answer_text = 'Thiết kế giao diện và định dạng trang web'
);

INSERT INTO answers (
    question_id,
    answer_text,
    is_correct
)
SELECT
    @q2,
    'Quản lý database',
    FALSE
WHERE NOT EXISTS (
    SELECT 1
    FROM answers
    WHERE question_id = @q2
      AND answer_text = 'Quản lý database'
);

INSERT INTO answers (
    question_id,
    answer_text,
    is_correct
)
SELECT
    @q2,
    'Chạy Docker',
    FALSE
WHERE NOT EXISTS (
    SELECT 1
    FROM answers
    WHERE question_id = @q2
      AND answer_text = 'Chạy Docker'
);

INSERT INTO answers (
    question_id,
    answer_text,
    is_correct
)
SELECT
    @q2,
    'Quản lý GitHub',
    FALSE
WHERE NOT EXISTS (
    SELECT 1
    FROM answers
    WHERE question_id = @q2
      AND answer_text = 'Quản lý GitHub'
);

INSERT INTO answers (
    question_id,
    answer_text,
    is_correct
)
SELECT
    @q3,
    'Hệ quản trị cơ sở dữ liệu quan hệ',
    TRUE
WHERE NOT EXISTS (
    SELECT 1
    FROM answers
    WHERE question_id = @q3
      AND answer_text = 'Hệ quản trị cơ sở dữ liệu quan hệ'
);

INSERT INTO answers (
    question_id,
    answer_text,
    is_correct
)
SELECT
    @q3,
    'Hệ điều hành',
    FALSE
WHERE NOT EXISTS (
    SELECT 1
    FROM answers
    WHERE question_id = @q3
      AND answer_text = 'Hệ điều hành'
);

INSERT INTO answers (
    question_id,
    answer_text,
    is_correct
)
SELECT
    @q3,
    'Ngôn ngữ lập trình',
    FALSE
WHERE NOT EXISTS (
    SELECT 1
    FROM answers
    WHERE question_id = @q3
      AND answer_text = 'Ngôn ngữ lập trình'
);

INSERT INTO answers (
    question_id,
    answer_text,
    is_correct
)
SELECT
    @q3,
    'Web server',
    FALSE
WHERE NOT EXISTS (
    SELECT 1
    FROM answers
    WHERE question_id = @q3
      AND answer_text = 'Web server'
);

CREATE USER IF NOT EXISTS
'exporter'@'%'
IDENTIFIED BY 'Exporter@2026';

GRANT PROCESS, REPLICATION CLIENT, SELECT
ON *.*
TO 'exporter'@'%';

FLUSH PRIVILEGES;