# AI Smart Traffic Police Assistant

A modern, full-stack Intelligent Traffic Management System (ITMS) college demonstration project combining computer vision, OCR, a backend database, and a mobile application for traffic enforcement.

---

## 🌟 Project Architecture

```
                       [ Traffic Police Camera ]
                                   │
                                   ▼
                       [ AI Service: Python FastAPI ]
                         - YOLOv8 (Vehicle Detection)
                         - PaddleOCR/EasyOCR (Plate Recognition)
                                   │
                                   ▼  (REST API)
                       [ Backend Service: Spring Boot ]
                                   │
                                   ▼  (JDBC / JPA)
                         [ Database: MySQL Server ]
                                   │
                                   ▼  (REST API)
                       [ Traffic Police Mobile App: Flutter ]
```

---

## 📁 Repository Directory Structure

- `frontend/`: The interactive demo dashboard and simulator running in React + Vite + Vanilla CSS. (Launch this to view the completed demo immediately in Chrome).
- `backend/`: Java Spring Boot Rest API service code configured for MySQL database connectivity.
- `ai/`: Python script demonstrating YOLOv8 bounding box detection and EasyOCR reading.
- `mobile/`: Flutter mobile app code template for the traffic officer's handheld device.
- `database/`: MySQL database structure and sample seeded data entries.

---

## 🚀 How to Run the Project Components

### 1. Interactive Demo Simulator (React + Vite)
This simulator runs in Chrome and mocks the entire stack's inputs/outputs in real time. It requires no heavy dependencies (CUDA, MySQL servers, etc.) to run.
```bash
cd frontend
npm install
npm run dev
```
It will start on [http://localhost:3000](http://localhost:3000) and automatically open in Chrome.

### 2. Spring Boot REST Backend
To compile and start the production Java backend, ensure you have Java 21+ and Maven installed.
1. Make sure a MySQL database named `traffic_police_db` is running on port 3306 (or update credentials in `backend/src/main/resources/application.properties`).
2. Run the database setup script located at `database/schema.sql` to initialize tables and insert seed data.
3. Start the Spring Boot server:
   ```bash
   cd backend
   mvn spring-boot:run
   ```
The backend will listen on [http://localhost:8080](http://localhost:8080).

### 3. Python AI Bounding Box & OCR Service
To execute the YOLOv8 and EasyOCR plate recognition pipeline:
1. Ensure Python 3.10+ is installed.
2. Install dependencies:
   ```bash
   cd ai
   pip install -r requirements.txt
   ```
3. Start the FastAPI server:
   ```bash
   python app.py
   ```
The AI service runs on [http://localhost:8000](http://localhost:8000) and communicates with the Spring Boot server.

### 4. Flutter Mobile App
To run the traffic police lookup and ticketing app on an Android/iOS emulator:
1. Ensure Flutter SDK is installed.
2. Launch emulator and run:
   ```bash
   cd mobile
   flutter run
   ```
By default, the app is configured to talk to the Spring Boot REST server on `localhost`.

---

## 📊 Presentation Features Included in the Demo
- **Active Cameras Grid**: Real-time camera feeds simulating No Helmet, Speeding, Mobile Phone, Triple Riding, and Normal riding. Bounding boxes are dynamically drawn on a canvas overlay.
- **Combined Terminal Console Logs**: Watch AI FastAPI logs and Spring Boot controller requests run side-by-side as you toggle cameras.
- **MySQL Database Manager**: View the database table, add new vehicles, and toggle document validity (Insurance, PUC, License) on-the-fly to show how the system updates immediately.
- **Traffic Police Mobile Emulator**: Search vehicle plates, view documentation details with visual status badges, and pay challans or create manual violations.
- **Thermal Receipt printing**: View and print a beautifully formatted traffic violation ticket using the browser's printer system.
- **Image Upload & Analysis**: Upload custom motorcycle photos to run the scanning sequence with HUD overlays.
