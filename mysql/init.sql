SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

CREATE DATABASE IF NOT EXISTS quiz_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE quiz_db;

CREATE TABLE quizzes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT
);

CREATE TABLE questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quiz_id INT NOT NULL,
    question_text TEXT NOT NULL,

    FOREIGN KEY (quiz_id)
        REFERENCES quizzes(id)
        ON DELETE CASCADE
);

CREATE TABLE answers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT NOT NULL,
    answer_text VARCHAR(500) NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,

    FOREIGN KEY (question_id)
        REFERENCES questions(id)
        ON DELETE CASCADE
);

CREATE TABLE results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_name VARCHAR(255),
    quiz_id INT,
    score DECIMAL(5,2),
    total_questions INT,
    correct_answers INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (quiz_id)
        REFERENCES quizzes(id)
);

INSERT INTO quizzes(title, description)
VALUES
(
    'Kiểm tra kiến thức CNTT',
    'Bài thi trắc nghiệm kiến thức công nghệ thông tin'
);

INSERT INTO questions(quiz_id, question_text)
VALUES
(1, 'HTML là viết tắt của cụm từ nào?'),
(1, 'CSS được sử dụng chủ yếu để làm gì?'),
(1, 'MySQL thuộc loại hệ quản trị cơ sở dữ liệu nào?');

INSERT INTO answers(question_id, answer_text, is_correct)
VALUES
(1, 'Hyper Text Markup Language', TRUE),
(1, 'High Text Machine Language', FALSE),
(1, 'Hyper Tool Multi Language', FALSE),
(1, 'Home Text Markup Language', FALSE),

(2, 'Thiết kế giao diện và định dạng trang web', TRUE),
(2, 'Quản lý database', FALSE),
(2, 'Chạy Docker', FALSE),
(2, 'Quản lý GitHub', FALSE),

(3, 'Hệ quản trị cơ sở dữ liệu quan hệ', TRUE),
(3, 'Hệ điều hành', FALSE),
(3, 'Ngôn ngữ lập trình', FALSE),
(3, 'Web server', FALSE);
CREATE USER IF NOT EXISTS
'exporter'@'%'
IDENTIFIED BY 'Exporter@2026';

GRANT PROCESS, REPLICATION CLIENT, SELECT
ON *.*
TO 'exporter'@'%';

FLUSH PRIVILEGES;