📌 Project Overview
This is a complete smart lock system combining embedded hardware and a full web interface. It uses ESP32-CAM to capture real-time video and transmit it over Wi-Fi, while a React frontend manages the user interface and authentication flow. A Python Flask backend handles face recognition using the face_recognition library.

💡 Features
🔴 Face recognition login for users and admins

📷 Live video streaming from ESP32-CAM to React app

🧠 Flask backend that processes image blobs and detects faces

🔓 Lock control via ESP32 with RGB LED, buzzer, and LCD

⚙️ Admin panel (React) for adding users with face data and UserPanel for user recognition

🌐 Wi-Fi communication between frontend, backend, and ESP device

📁 Faces database stored locally or in browser storage (IndexedDB)

🧩 Main Technologies
ESP32-CAM for video streaming and peripheral control

React.js frontend 

Python + Flask backend with face recognition

LCD via I2C, RGB LED & buzzer on ESP32

HTTP communication between parts (/detect-face, /access)
