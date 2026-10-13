# 🌿 AyurVeda Platform

> **Comprehensive Full-Stack Ayurvedic Healthcare, AI Diagnostics, Telemedicine & Herbal Supply Chain Traceability Ecosystem**

An enterprise-grade, holistic digital healthcare platform that bridges traditional Ayurvedic wisdom with modern technologies. It connects **Patients**, **Certified Ayurvedic Doctors**, **Organic Herb Farmers**, and **Platform Administrators** in a single seamless, transparent ecosystem.

---

## 🌟 Key Features

### 1. 🤖 AI-Powered Prakriti & Dosha Diagnostics
- **Prakriti Assessment:** Deep diagnostic questionnaire to determine an individual's constitution (**Vata, Pitta, Kapha**).
- **Intelligent Symptom Checker:** Powered by **Groq LLaMA-3 LLM** for real-time natural language health symptom evaluation and dosha imbalance detection.
- **Personalized Recommendations:** Automated lifestyle, daily routine (*Dinacharya*), dietary (*Ahara*), and herbal suggestions tailored to bodily constitution.

### 2. 🏥 Telemedicine & Doctor Consultations
- **Doctor Directory & Booking:** Browse qualified Ayurvedic specialists by expertise, experience, and ratings with interactive slot booking.
- **Real-Time Video Consultations:** Instant, secure video and chat sessions powered by **Socket.IO**.
- **Digital Prescriptions & Records:** Doctors can generate structured digital Ayurvedic prescriptions and track patient medical histories securely.

### 3. 🚜 Farm-to-Shelf Herbal Traceability
- **Botanical Supply Chain Provenance:** Transparent tracking of medicinal herbs from the harvest field to final packaged formulations.
- **Farmer Batch Logging:** Farmers log crop harvests, geo-locations, botanical varieties, and harvest dates.
- **Quality & Lab Testing:** Verification of heavy metal tests, purity certificates, and batch authenticity to eliminate adulteration.
- **Fair Trade & MSP Support:** Direct farmer-to-market linkage with fair pricing and MSP transparency.

### 4. 🛒 Wellness E-Commerce & Yoga Integration
- **Curated Herbal Store:** Browse and order certified single herbs, classical rasayanas, decoctions, and wellness teas.
- **Interactive Cart & Checkout:** Seamless shopping workflow with transparent ingredient lists and usage instructions.
- **Comprehensive Yoga Asanas Library:** In-depth yoga database with benefits, precautions, and targeted health conditions.

### 5. 👥 Role-Based Portals & Dashboards (RBAC)
- **Patient Dashboard:** Health metrics, upcoming consultations, active prescriptions, and personalized regimen.
- **Doctor Dashboard:** Daily appointment schedule, patient queue, consultation desk, and clinical records.
- **Farmer Dashboard:** Harvest batch registration, lab status tracking, sales revenue, and crop pricing alerts.
- **Admin Dashboard:** Platform oversight, doctor and farmer verification/KYC approval, user management, and supply chain audit logs.

---

## 🏗️ Architecture & Tech Stack

```
Ayurvedic-app/
├── ayurvedic-app-website/     # Frontend (React 19, Vite 8, React Router v7)
├── server/                    # Backend (Node.js, Express, Prisma, Socket.IO)
├── deploy.bat                 # 1-Click Deployment Automation
├── deploy.ps1                 # PowerShell Deployment Script
└── README.md                  # Project Documentation
```

### 💻 Frontend
- **Framework:** [React 19](https://react.dev/) + [Vite 8](https://vitejs.dev/)
- **Routing:** [React Router v7](https://reactrouter.com/)
- **Icons & UI:** [Lucide React](https://lucide.dev/)
- **Styling:** Modern Glassmorphic Design System, Custom HSL Color Tokens, Responsive CSS
- **Real-Time:** [Socket.IO Client](https://socket.io/)

### ⚙️ Backend
- **Runtime & Server:** [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/)
- **ORM & Database:** [Prisma ORM](https://www.prisma.io/) with SQLite (`dev.db`)
- **Authentication:** JWT (JSON Web Tokens) + Bcrypt Password Hashing
- **Real-Time Engine:** [Socket.IO](https://socket.io/) for live consultations and chat
- **File Uploads:** Multer (medical records, certificates, and prescription uploads)
- **AI Integration:** [Groq SDK](https://groq.com/) running high-speed LLaMA-3 models

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

---

### 1. Clone the Repository
```bash
git clone https://github.com/Prakharrtiwari/Ayurvedic-app.git
cd Ayurvedic-app
```

---

### 2. Backend Setup
```bash
cd server

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env and configure your GROQ_API_KEY and JWT_SECRET

# Initialize the database
npm run prisma:generate
npm run prisma:push

# (Optional) Seed initial demo data
npm run prisma:seed

# Start backend server
npm run dev
```
Backend will start on: `http://localhost:5000`

---

### 3. Frontend Setup
```bash
cd ../ayurvedic-app-website

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
Frontend will be available on: `http://localhost:5173`

---

## 🔒 Environment Variables (`server/.env`)

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | Backend port number | `5000` |
| `DATABASE_URL` | SQLite / PostgreSQL connection URI | `"file:./dev.db"` |
| `JWT_SECRET` | Secret key for JWT token signing | `your_secret_key` |
| `GROQ_API_KEY` | API Key from Groq Cloud for AI Diagnosis | `your_groq_api_key` |

---

## 👥 User Roles & Access

| Role | Access Level | Primary Features |
| :--- | :--- | :--- |
| **PATIENT** | General User | AI Symptom Checker, Doctor Booking, Video Calls, Orders, Health Records |
| **DOCTOR** | Verified Practitioner | Patient Appointments, Digital Prescriptions, Video Consultations |
| **FARMER** | Verified Supplier | Harvest Batch Registry, Soil/Lab Certifications, Fair Trade Tracking |
| **ADMIN** | System Administrator | User Approval/Rejections, System Analytics, Batch Audit & Compliance |

---

## 📜 License
This project is open-source and available under the [MIT License](LICENSE).
