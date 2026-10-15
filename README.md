# Quiz System - DTC245200061

## 1. Giới thiệu

Đề tài: Hệ thống Quiz / Thi trắc nghiệm

Họ và Tên: Trương Thị Hạnh

Mã sinh viên: DTC245200061

Hệ thống được triển khai hoàn toàn bằng Docker Compose và tích hợp các thành phần:

- Ứng dụng Quiz
- MySQL
- phpMyAdmin
- Nginx Reverse Proxy
- Prometheus
- Grafana
- cAdvisor
- Node Exporter
- MySQL Exporter
- Loki
- Promtail

Hệ thống hỗ trợ hai vai trò chính:

- Admin
- Sinh viên

---

## 2. Chức năng chính

### Admin

- Đăng nhập hệ thống
- Quản lý đề thi
- Thêm, sửa, xóa đề thi
- Quản lý câu hỏi
- Thêm, sửa, xóa câu hỏi
- Hỗ trợ câu hỏi một hoặc nhiều đáp án đúng
- Quản lý tài khoản sinh viên
- Thêm, sửa, xóa sinh viên
- Xem danh sách kết quả thi
- Theo dõi số lượt thi
- Theo dõi điểm trung bình
- Theo dõi điểm cao nhất
- Lọc kết quả theo đề thi
- Tìm kiếm sinh viên

### Sinh viên

- Đăng nhập tài khoản
- Xem danh sách đề thi
- Làm bài trắc nghiệm
- Hỗ trợ câu hỏi một đáp án
- Hỗ trợ câu hỏi nhiều đáp án
- Nộp bài
- Chấm điểm tự động
- Lưu kết quả vào MySQL
- Xem lịch sử kết quả thi

---

## 3. Kiến trúc hệ thống

Hệ thống được triển khai hoàn toàn bằng Docker Compose.

Kiến trúc tổng thể:

```text
Người dùng
    |
    v
Nginx Reverse Proxy
    |
    v
Quiz Application
(Node.js + Express)
    |
    v
MySQL Database
    |
    +----> phpMyAdmin
```

Hệ thống Monitoring:

```text
cAdvisor --------\
Node Exporter ----> Prometheus ----> Grafana
MySQL Exporter --/
```

Hệ thống Logging:

```text
Quiz App Logs ----\
                   > Promtail ----> Loki ----> Grafana
Nginx Logs -------/
```

Luồng hoạt động chính:

```text
Người dùng
    |
    v
http://localhost:8088
    |
    v
Nginx
    |
    v
Node.js / Express
    |
    v
MySQL
```

---

## 4. Các service trong Docker Compose

Hệ thống gồm các service chính:

| Service             | Chức năng                                  |
| ------------------- | ------------------------------------------ |
| quiz-app            | Ứng dụng Quiz viết bằng Node.js và Express |
| quiz-mysql          | Cơ sở dữ liệu MySQL                        |
| quiz-phpmyadmin     | Công cụ quản lý MySQL                      |
| quiz-nginx          | Reverse Proxy                              |
| quiz-prometheus     | Thu thập metrics                           |
| quiz-grafana        | Dashboard giám sát                         |
| quiz-cadvisor       | Thu thập metrics container                 |
| quiz-node-exporter  | Thu thập metrics hệ thống                  |
| quiz-mysql-exporter | Thu thập metrics MySQL                     |
| quiz-loki           | Lưu trữ log tập trung                      |
| quiz-promtail       | Thu thập log ứng dụng và Nginx             |

---

## 5. Cấu trúc thư mục

```text
Quiz-System/
│
├── app/
│   ├── public/
│   │   ├── admin-dashboard.html
│   │   ├── admin-quizzes.html
│   │   ├── admin-questions.html
│   │   ├── admin-students.html
│   │   ├── admin-results.html
│   │   ├── student-dashboard.html
│   │   ├── login.html
│   │   ├── quiz.html
│   │   ├── results.html
│   │   ├── index.html
│   │   └── style.css
│   │
│   ├── Dockerfile
│   ├── package.json
│   └── server.js
│
├── mysql/
│   ├── init.sql
│   └── exporter.cnf
│
├── nginx/
│   └── nginx.conf
│
├── prometheus/
│   └── prometheus.yml
│
├── loki/
│   └── loki-config.yml
│
├── promtail/
│   └── promtail-config.yml
│
├── docker-compose.yml
├── .gitignore
├── .env
└── README.md
```

---

## 6. Yêu cầu cài đặt

Máy tính cần cài đặt:

- Docker Desktop
- Docker Compose
- Git

Kiểm tra Docker:

```bash
docker --version
```

Kiểm tra Docker Compose:

```bash
docker compose version
```

Kiểm tra Git:

```bash
git --version
```

Nếu các lệnh trên trả về thông tin phiên bản thì môi trường đã sẵn sàng.

---

## 7. Clone repository

Mở PowerShell, Terminal hoặc Command Prompt và chạy:

```bash
git clone https://github.com/tthanh706/DTC245200061-quiz-system.git
```

Sau khi clone xong:

```bash
cd DTC245200061-quiz-system
```

Kiểm tra các file:

```bash
dir
```

Cần thấy các thư mục và file chính:

```text
app
mysql
nginx
prometheus
loki
promtail
docker-compose.yml
README.md
```

---

## 8. Cấu hình file .env

Tại thư mục gốc của project, tạo file:

```text
.env
```

Nội dung:

```env
MYSQL_ROOT_PASSWORD=RootQuiz2026Secure
MYSQL_DATABASE=quiz_db
MYSQL_USER=quiz_user
MYSQL_PASSWORD=QuizUser2026Secure
```

File `.env` chứa các biến môi trường sử dụng cho MySQL.

Lưu ý:

- Không commit `.env` lên GitHub
- `.gitignore` cần có dòng:

```text
.env
```

---

## 9. Khởi động toàn bộ hệ thống

Mở PowerShell tại thư mục project.

Ví dụ:

```powershell
cd D:\Quiz-System
```

Sau đó chạy:

```powershell
docker compose up -d --build
```

Ý nghĩa:

```text
docker compose = sử dụng Docker Compose
up             = khởi động các service
-d              = chạy container ở chế độ nền
--build         = build lại image trước khi chạy
```

Lần đầu tiên chạy có thể mất vài phút vì Docker cần tải các image cần thiết.

---

## 10. Kiểm tra trạng thái container

Sau khi chạy hệ thống:

```powershell
docker compose ps
```

Các container cần ở trạng thái:

```text
Up
```

hoặc:

```text
healthy
```

Các container chính gồm:

```text
quiz-app
quiz-mysql
quiz-phpmyadmin
quiz-nginx
quiz-prometheus
quiz-grafana
quiz-cadvisor
quiz-node-exporter
quiz-mysql-exporter
quiz-loki
quiz-promtail
```

Nếu container nào không chạy, xem log:

```powershell
docker compose logs <ten-service>
```

Ví dụ:

```powershell
docker compose logs app
```

hoặc:

```powershell
docker compose logs mysql
```

---

## 11. Địa chỉ truy cập hệ thống

### Website Quiz

Truy cập qua Nginx Reverse Proxy:

```text
http://localhost:8088
```

### Health Check

```text
http://localhost:8088/health
```

### phpMyAdmin

```text
http://localhost:8081
```

### Prometheus

```text
http://localhost:9090
```

### Prometheus Targets

```text
http://localhost:9090/targets
```

### Grafana

```text
http://localhost:3001
```

### Loki

```text
http://localhost:3100/ready
```

Nếu Loki hoạt động sẽ hiển thị:

```text
ready
```

---

## 12. Tài khoản demo

### Admin

```text
Username: admin
Password: Admin@123
```

### Sinh viên

```text
Username: student01
Password: Student@123
```

Admin có thể tạo thêm tài khoản sinh viên trong chức năng:

```text
Quản lý sinh viên
```

---

## 13. Quy trình sử dụng dành cho Admin

### Bước 1: Truy cập hệ thống

Mở:

```text
http://localhost:8088
```

### Bước 2: Đăng nhập

Sử dụng:

```text
Username: admin
Password: Admin@123
```

### Bước 3: Quản lý đề thi

Vào:

```text
Quản lý đề thi
```

Admin có thể:

- thêm đề thi
- sửa đề thi
- xóa đề thi

### Bước 4: Quản lý câu hỏi

Vào:

```text
Quản lý câu hỏi
```

Chọn đề thi cần quản lý.

Hệ thống chỉ hiển thị danh sách câu hỏi thuộc đề thi đang chọn.

Admin nhập:

- nội dung câu hỏi
- đáp án 1
- đáp án 2
- đáp án 3
- đáp án 4

Sau đó chọn một hoặc nhiều đáp án đúng.

Ví dụ:

```text
☑ Đáp án 1
☐ Đáp án 2
☑ Đáp án 3
☐ Đáp án 4
```

### Bước 5: Quản lý sinh viên

Vào:

```text
Quản lý sinh viên
```

Admin có thể:

- tạo tài khoản sinh viên
- sửa thông tin
- đổi mật khẩu
- xóa tài khoản sinh viên

### Bước 6: Xem kết quả thi

Vào:

```text
Kết quả thi
```

Trang kết quả hiển thị:

- tên sinh viên
- tài khoản
- đề thi
- số câu đúng
- tổng số câu
- điểm
- thời gian thi

Ngoài ra còn có:

- tổng lượt thi
- điểm trung bình
- điểm cao nhất
- số lượt đạt từ 5 điểm
- tìm kiếm sinh viên
- lọc theo đề thi

---

## 14. Quy trình sử dụng dành cho Sinh viên

### Bước 1: Đăng nhập

Sử dụng tài khoản sinh viên.

Ví dụ:

```text
Username: student01
Password: Student@123
```

### Bước 2: Chọn bài thi

Sau khi đăng nhập, sinh viên sẽ được chuyển đến Dashboard.

Dashboard hiển thị danh sách các bài thi hiện có.

### Bước 3: Làm bài

Nhấn:

```text
Làm bài
```

Câu hỏi có một đáp án đúng sẽ hiển thị dạng radio.

Ví dụ:

```text
○ Đáp án A
○ Đáp án B
○ Đáp án C
○ Đáp án D
```

Câu hỏi có nhiều đáp án đúng sẽ hiển thị dạng checkbox.

Ví dụ:

```text
☐ Đáp án A
☐ Đáp án B
☐ Đáp án C
☐ Đáp án D
```

### Bước 4: Nộp bài

Nhấn:

```text
Nộp bài
```

Hệ thống sẽ:

```text
Kiểm tra đáp án
→ Chấm điểm
→ Lưu kết quả vào MySQL
→ Hiển thị điểm cho sinh viên
```

### Bước 5: Xem lịch sử kết quả

Sinh viên có thể mở trang kết quả để xem các lượt thi của tài khoản đang đăng nhập.

---

## 15. Database

Hệ thống sử dụng MySQL.

Database:

```text
quiz_db
```

Các bảng chính:

```text
users
quizzes
questions
answers
results
```

### Bảng users

Lưu:

- họ tên
- username
- password
- role
- thời gian tạo

### Bảng quizzes

Lưu:

- tên đề thi
- mô tả

### Bảng questions

Lưu:

- đề thi
- nội dung câu hỏi

### Bảng answers

Lưu:

- câu hỏi
- nội dung đáp án
- trạng thái đáp án đúng/sai

Một câu hỏi có thể có nhiều đáp án đúng.

### Bảng results

Lưu:

- sinh viên
- đề thi
- số câu đúng
- tổng số câu
- điểm
- thời gian nộp bài

---

## 16. Khởi tạo Database

Database được khởi tạo tự động từ:

```text
mysql/init.sql
```

Khi MySQL được tạo lần đầu, file này sẽ:

- tạo database `quiz_db`
- tạo các bảng
- tạo tài khoản admin
- tạo tài khoản sinh viên mẫu
- tạo đề thi mẫu
- tạo câu hỏi mẫu
- tạo đáp án mẫu
- tạo tài khoản cho MySQL Exporter

---

## 17. Quản lý Database bằng phpMyAdmin

Truy cập:

```text
http://localhost:8081
```

phpMyAdmin được sử dụng để:

- xem database
- xem bảng
- xem dữ liệu
- kiểm tra kết quả thi
- kiểm tra tài khoản
- kiểm tra đề thi và câu hỏi

Database chính:

```text
quiz_db
```

---

## 18. Nginx Reverse Proxy

Nginx được sử dụng làm Reverse Proxy.

Người dùng không truy cập trực tiếp vào container Node.js.

Luồng truy cập:

```text
Browser
   |
   v
localhost:8088
   |
   v
Nginx
   |
   v
quiz-app:3000
```

Nginx có nhiệm vụ:

- reverse proxy
- chuyển request tới Quiz Application
- ghi access log
- ghi error log
- bổ sung security headers

---

## 19. Security Headers trên Nginx

Nginx được cấu hình các Security Headers cơ bản.

Mục đích:

- tăng mức độ bảo mật HTTP
- giảm một số rủi ro từ trình duyệt
- không để ứng dụng Node.js public trực tiếp

Các cấu hình được đặt trong:

```text
nginx/nginx.conf
```

---

## 20. Monitoring bằng Prometheus

Prometheus được sử dụng để thu thập metrics.

Truy cập:

```text
http://localhost:9090
```

Prometheus thu thập metrics từ:

```text
Prometheus
cAdvisor
Node Exporter
MySQL Exporter
```

---

## 21. Kiểm tra Prometheus Targets

Mở:

```text
http://localhost:9090/targets
```

Các target cần hiển thị trạng thái:

```text
UP
```

Các target chính gồm:

```text
prometheus
cadvisor
node-exporter
mysql-exporter
```

---

## 22. cAdvisor

cAdvisor được dùng để giám sát Docker Container.

Các metrics bao gồm:

- CPU container
- RAM container
- tài nguyên container

Prometheus thu thập metrics từ cAdvisor và Grafana sử dụng các metrics này để hiển thị Dashboard.

---

## 23. Node Exporter

Node Exporter thu thập metrics của hệ thống.

Ví dụ:

- tổng RAM
- RAM còn trống
- mức sử dụng RAM
- tài nguyên máy host

---

## 24. MySQL Exporter

MySQL Exporter được sử dụng để giám sát Database.

Exporter sử dụng một tài khoản MySQL riêng:

```text
exporter
```

Tài khoản này chỉ được cấp các quyền cần thiết cho việc thu thập metrics.

---

## 25. Grafana

Truy cập Grafana:

```text
http://localhost:3001
```

Grafana sử dụng Prometheus làm Data Source.

Dashboard giám sát gồm:

```text
Container CPU Usage
Container Memory Usage
Service Status
RAM Usage
MySQL Monitoring
```

---

## 26. Một số PromQL sử dụng

### CPU Container

```promql
rate(container_cpu_usage_seconds_total[5m])
```

### Memory Container

```promql
container_memory_usage_bytes
```

### Trạng thái service

```promql
up
```

### Phần trăm RAM sử dụng

```promql
100 * (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes))
```

---

## 27. Centralized Logging

Hệ thống sử dụng:

```text
Promtail
Loki
Grafana
```

Luồng log:

```text
Quiz Application Logs
       |
       v
    Promtail
       |
       v
      Loki
       |
       v
    Grafana
```

Nginx cũng được thu thập log:

```text
Nginx Logs
   |
   v
Promtail
   |
   v
Loki
```

---

## 28. Loki

Loki là nơi lưu trữ log tập trung.

Kiểm tra Loki:

```text
http://localhost:3100/ready
```

Nếu hoạt động:

```text
ready
```

---

## 29. Promtail

Promtail đọc log từ:

```text
Quiz Application
Nginx
```

Sau đó gửi log tới Loki.

File cấu hình:

```text
promtail/promtail-config.yml
```

---

## 30. LogQL

Một số truy vấn LogQL đã sử dụng:

### Xem toàn bộ log của Quiz Application

```logql
{job="quiz-app"}
```

### Xem log Nginx

```logql
{job="nginx"}
```

### Xem log nộp bài

```logql
{job="quiz-app"} |= "SUBMIT"
```

Các truy vấn được thực hiện trong Grafana bằng Loki Data Source.

---

## 31. Hardening hệ thống

Hệ thống áp dụng nhiều biện pháp Hardening cơ bản.

### 1. Non-root container

Quiz Application chạy bằng user:

```text
node
```

thay vì chạy bằng root.

### 2. Network Isolation

Các service được chia thành các Docker Network:

```text
frontend
backend
monitoring
```

Mục đích:

- tách các nhóm service
- hạn chế truy cập không cần thiết
- giảm phạm vi ảnh hưởng khi một service gặp sự cố

### 3. MySQL không public trực tiếp

MySQL không cần expose port 3306 ra bên ngoài host.

Ứng dụng truy cập MySQL thông qua Docker Network.

### 4. Hạn chế quyền Database

MySQL Exporter sử dụng tài khoản riêng và chỉ được cấp các quyền cần thiết.

### 5. Security Headers

Nginx được cấu hình các Security Headers cơ bản.

### 6. Mật khẩu riêng

Các service sử dụng mật khẩu riêng thay vì mật khẩu mặc định.

### 7. Bảo vệ file môi trường

File:

```text
.env
```

được thêm vào:

```text
.gitignore
```

để tránh đưa thông tin cấu hình nhạy cảm lên GitHub.

---

## 32. Build lại ứng dụng sau khi sửa source code

Nếu chỉ sửa source code của Quiz App:

```powershell
docker compose up -d --build app
```

Sau đó restart Nginx:

```powershell
docker compose restart nginx
```

Kiểm tra:

```powershell
docker compose ps
```

Sau đó trên trình duyệt nhấn:

```text
Ctrl + F5
```

---

## 33. Build lại toàn bộ hệ thống

Nếu sửa:

- docker-compose.yml
- cấu hình Nginx
- cấu hình Prometheus
- Loki
- Promtail
- Dockerfile

có thể chạy:

```powershell
docker compose up -d --build
```

---

## 34. Xem log Docker

Xem tất cả log:

```powershell
docker compose logs
```

Theo dõi log realtime:

```powershell
docker compose logs -f
```

Xem log ứng dụng:

```powershell
docker compose logs app
```

Xem log Nginx:

```powershell
docker compose logs nginx
```

Xem log MySQL:

```powershell
docker compose logs mysql
```

Xem log Grafana:

```powershell
docker compose logs grafana
```

Xem log Prometheus:

```powershell
docker compose logs prometheus
```

---

## 35. Dừng hệ thống

Dừng toàn bộ hệ thống:

```powershell
docker compose down
```

Lệnh này:

- dừng container
- xóa container
- giữ nguyên Docker Volume

Không nên chạy:

```powershell
docker compose down -v
```

nếu muốn giữ dữ liệu MySQL.

`-v` sẽ xóa volume và có thể làm mất toàn bộ dữ liệu Database.

---

## 36. Khởi động lại hệ thống

Nếu các image đã được build trước đó:

```powershell
docker compose up -d
```

Kiểm tra:

```powershell
docker compose ps
```

---

## 37. Một số lỗi thường gặp

### Website không truy cập được

Kiểm tra:

```powershell
docker compose ps
```

Xem log:

```powershell
docker compose logs nginx
```

và:

```powershell
docker compose logs app
```

---

### Ứng dụng không kết nối được MySQL

Kiểm tra:

```powershell
docker compose logs app
```

và:

```powershell
docker compose logs mysql
```

Có thể restart:

```powershell
docker compose restart app
```

---

### Docker Network gặp lỗi

Không dùng `-v`.

Chạy:

```powershell
docker compose down
docker compose up -d
```

---

### Source code đã sửa nhưng giao diện chưa thay đổi

Build lại ứng dụng:

```powershell
docker compose up -d --build app
```

Restart Nginx:

```powershell
docker compose restart nginx
```

Sau đó nhấn:

```text
Ctrl + F5
```

---

### Không tải được câu hỏi

Kiểm tra API:

```text
http://localhost:8088/api/quizzes/1/questions
```

Nếu API trả về JSON thì backend đang hoạt động.

Sau đó kiểm tra URL trang làm bài có dạng:

```text
http://localhost:8088/quiz.html?id=1
```

---

## 38. Kiểm tra Health Check

Mở:

```text
http://localhost:8088/health
```

Nếu ứng dụng hoạt động sẽ trả về trạng thái Health Check của Quiz Application.

---

## 39. Kiểm tra Database

Truy cập:

```text
http://localhost:8081
```

Mở:

```text
quiz_db
```

Kiểm tra các bảng:

```text
users
quizzes
questions
answers
results
```

Sau khi sinh viên nộp bài, bảng:

```text
results
```

sẽ có dữ liệu lượt thi.

---

## 40. Quy trình demo đề tài

Thứ tự demo đề xuất:

1. Mở GitHub Repository
2. Giới thiệu source code và các file cấu hình
3. Giới thiệu `docker-compose.yml`
4. Chạy:

```powershell
docker compose ps
```

5. Chứng minh các container đang hoạt động
6. Truy cập Website qua Nginx
7. Đăng nhập Admin
8. Demo Quản lý đề thi
9. Demo Quản lý câu hỏi
10. Demo câu hỏi nhiều đáp án
11. Demo Quản lý sinh viên
12. Đăng xuất Admin
13. Đăng nhập Sinh viên
14. Chọn bài thi
15. Làm bài
16. Nộp bài
17. Xem điểm
18. Đăng nhập lại Admin
19. Xem Kết quả thi
20. Mở phpMyAdmin
21. Kiểm tra bảng Database
22. Mở Prometheus
23. Kiểm tra Targets ở trạng thái UP
24. Mở Grafana Dashboard
25. Demo CPU Container
26. Demo Memory Container
27. Demo trạng thái Service
28. Mở Loki trong Grafana
29. Chạy LogQL:

```logql
{job="quiz-app"}
```

30. Chạy:

```logql
{job="nginx"}
```

31. Chạy:

```logql
{job="quiz-app"} |= "SUBMIT"
```

32. Trình bày các biện pháp Hardening
33. Kết luận hệ thống

---

## 41. GitHub

Toàn bộ mã nguồn và file cấu hình được quản lý bằng Git.

Repository:

```text
https://github.com/tthanh706/DTC245200061-quiz-system
```

Các thành phần được lưu trên GitHub gồm:

```text
Source code
Dockerfile
docker-compose.yml
Nginx configuration
Prometheus configuration
Loki configuration
Promtail configuration
MySQL init.sql
README.md
```

---

## 42. Kiểm tra Git

Kiểm tra thay đổi:

```powershell
git status
```

Thêm file:

```powershell
git add .
```

Commit:

```powershell
git commit -m "Hoan thien Quiz System"
```

Push:

```powershell
git push origin main
```

Kiểm tra lại:

```powershell
git status
```

Kết quả mong muốn:

```text
On branch main
Your branch is up to date with 'origin/main'.

nothing to commit, working tree clean
```

---

## 43. Các commit chính

Các commit chính của dự án được chia theo từng giai đoạn:

### Commit 1

Triển khai:

```text
Quiz Application
MySQL
phpMyAdmin
Nginx Reverse Proxy
Security Headers
```

### Commit 2

Tích hợp:

```text
Prometheus
Grafana
cAdvisor
Node Exporter
MySQL Exporter
```

### Commit 3

Tích hợp:

```text
Loki
Promtail
LogQL
Hardening
```

Ngoài ra có các commit bổ sung để hoàn thiện chức năng hệ thống Quiz.

---

## 44. Tiêu chí đã triển khai

### Quản lý mã nguồn

- Có GitHub Repository
- Có README
- Có các commit có ý nghĩa

### Ứng dụng + Database

- Website hoạt động
- MySQL hoạt động
- phpMyAdmin hoạt động

### Reverse Proxy

- Nginx hoạt động
- Website truy cập qua Nginx
- Có Security Headers

### Monitoring

- Prometheus hoạt động
- Grafana hoạt động
- cAdvisor hoạt động
- Node Exporter hoạt động
- MySQL Exporter hoạt động

### Logging

- Loki hoạt động
- Promtail hoạt động
- Có LogQL

### Hardening

- Non-root container
- Network isolation
- Hạn chế quyền database
- Security Headers
- Bảo vệ `.env`

---

## 45. Kết luận

Hệ thống Quiz được triển khai hoàn chỉnh bằng Docker Compose.

Hệ thống tích hợp đầy đủ:

- Quiz Web Application
- Node.js
- Express
- MySQL
- phpMyAdmin
- Nginx Reverse Proxy
- Prometheus
- Grafana
- cAdvisor
- Node Exporter
- MySQL Exporter
- Loki
- Promtail
- Centralized Logging
- Monitoring
- Hardening

Hệ thống hỗ trợ đầy đủ quy trình:

```text
Admin tạo đề thi
        |
        v
Admin tạo câu hỏi
        |
        v
Admin tạo tài khoản sinh viên
        |
        v
Sinh viên đăng nhập
        |
        v
Sinh viên làm bài
        |
        v
Hệ thống tự động chấm điểm
        |
        v
Lưu kết quả vào MySQL
        |
        v
Admin xem kết quả
```

Toàn bộ hệ thống có thể triển khai bằng lệnh:

```powershell
docker compose up -d --build
```

Kiểm tra bằng:

```powershell
docker compose ps
```

Dừng hệ thống bằng:

```powershell
docker compose down
```
