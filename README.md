# 🎟️ QR Event Check-In System

> A robust, full-stack solution for modern event management featuring secure QR-based attendee verification, real-time analytics, and automated administration tools.

![deepseek_mermaid_20250430_e4f7d4](https://github.com/user-attachments/assets/b6b4aa34-0d86-4b2a-9771-bd7a6ea3d1c0)


A complete solution for digital event management with QR code check-in functionality. Perfect for college events, conferences, and meetups.

## ✨ Features

- **Secure Check-ins**: Unique QR codes prevent duplicate entries
- **Real-time Scanning**: Instant verification with webcam/mobile camera
- **Admin Dashboard**: Manage events and view attendance analytics
- **Automated Emails**: QR codes delivered straight to attendees' inboxes
- **Export Data**: Download attendee lists in CSV/JSON formats

 ### Advanced Capabilities
- **Bulk Import**: CSV upload for mass registrations
- **Geo-Verification**: Optional location validation (+/- 50m accuracy)
- **Duplication Prevention**: SHA-256 hashed check-in tokens
- **Offline Mode**: Cached verification for poor connectivity

### Data Flow
- **Registration Phase**:
 Attendee submits details → API generates encrypted QR → Stores in DB → Emails ticket

- **Check-In Phase**:
Staff scans QR → API decrypts → Validates against Redis → Updates attendance records

- **Reporting Phase**:
Nightly cron jobs aggregate data → Generate insights → Email organizers



## 🛠 Tech Stack

### Frontend
![React](https://img.shields.io/badge/-React-61DAFB?logo=react&logoColor=white)
![MaterialUI](https://img.shields.io/badge/-MaterialUI-0081CB?logo=mui&logoColor=white)
![JavaScript](https://img.shields.io/badge/-JavaScript-F7DF1E?logo=javascript&logoColor=black)

### Backend
![Node.js](https://img.shields.io/badge/-Node.js-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/-Express-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/-MongoDB-47A248?logo=mongodb&logoColor=white)

### DevOps
![Docker](https://img.shields.io/badge/-Docker-2496ED?logo=docker&logoColor=white)
![Swagger](https://img.shields.io/badge/-Swagger-85EA2D?logo=swagger&logoColor=black)
