# Hệ thống Quiz / Thi trắc nghiệm

## Giới thiệu

Hệ thống Quiz trực tuyến cho phép người dùng làm bài trắc nghiệm, chấm điểm tự động và lưu kết quả vào MySQL.

## Công nghệ sử dụng

- Node.js
- MySQL 8.0.45
- phpMyAdmin
- Nginx
- Docker Compose
- Prometheus
- Grafana
- cAdvisor
- Node Exporter
- MySQL Exporter
- Loki
- Promtail

## Kiến trúc hệ thống

Browser -> Nginx -> Node.js -> MySQL

Prometheus -> Grafana

Promtail -> Loki -> Grafana

## Khởi động hệ thống

Tạo file .env với các biến môi trường cần thiết.

Sau đó chạy:

docker compose up -d --build

## Địa chỉ truy cập

Website:
http://localhost:8088

phpMyAdmin:
http://localhost:8081

Prometheus:
http://localhost:9090

Grafana:
http://localhost:3001

Loki:
http://localhost:3100/ready

## Kiểm tra container

docker compose ps

## Dừng hệ thống

docker compose down

## Logging

Một số truy vấn LogQL:

{job="quiz-app"}

{job="nginx"}

{job="quiz-app"} |= "SUBMIT"

## Hardening

- Node.js chạy bằng user không phải root.
- MySQL không publish cổng 3306 ra ngoài.
- Ứng dụng không publish trực tiếp cổng 3000.
- Phân tách Docker network.
- Nginx sử dụng security headers.
- Ứng dụng kết nối MySQL bằng tài khoản riêng thay vì root.
- Mật khẩu được lưu bằng biến môi trường và file .env không được đưa lên GitHub.
