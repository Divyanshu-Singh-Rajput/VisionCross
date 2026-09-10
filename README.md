# VisionCross — AI-Powered Biometric Clearance Network

![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white) ![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white) ![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white) ![Flask](https://img.shields.io/badge/Flask-000000?style=flat-square&logo=flask&logoColor=white) ![PyTorch](https://img.shields.io/badge/PyTorch-EE4C2C?style=flat-square&logo=pytorch&logoColor=white) ![OpenCV](https://img.shields.io/badge/OpenCV-5C3EE8?style=flat-square&logo=opencv&logoColor=white) ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white) ![JWT](https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white) ![Pydantic](https://img.shields.io/badge/Pydantic-E92063?style=flat-square&logo=pydantic&logoColor=white)

## About the Project

**VisionCross** is an AI-driven biometric clearance and access control gateway. It secures virtual meetings, sensitive sessions, and classified links from unauthorized entry (such as zoombombing or credential leaks) without requiring manual waiting room approval by hosts.

### Key Highlights
- **Biometric Authentication**: Powered by a custom PyTorch Siamese Neural Network trained with Triplet Loss to generate 512-dimensional facial embeddings for passwordless face-scan login.
- **Biometric Enrollment**: Captures 100 face frames via webcam or photo upload to enroll an operative's biometric identity.
- **Clearance Tiers**: Enforces multi-level access control (Admin, Top Secret, Secret, Confidential, Restricted). Users only see and access content permitted by their clearance tier.
- **Intermediary Proxy Gateway**: Protects destination URLs (Zoom, Google Meet, internal documents) behind a step-up biometric or credential verification challenge before issuing an authorized redirect.

---

## Prerequisites

- **Python** (3.10 or higher)
- **Node.js** (18 or higher) & **pnpm** (or npm)
- **MongoDB** (Local or MongoDB Atlas)
- **Webcam** (for biometric enrollment and face-scan login)

---

## Setup & Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Divyanshu-Singh-Rajput/VisionCross.git
cd VisionCross
```

### 2. Backend Setup (Flask & PyTorch)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Configure environment variables:
   ```bash
   # Windows
   copy .env.example .env

   # Linux / macOS
   cp .env.example .env
   ```
   Open `backend/.env` and update:
   ```env
   JWT_SECRET=your_jwt_secret_key
   MONGO_URI=mongodb://localhost:27017/VisionCross
   ```

4. Verify that the pre-trained model weights file exists at:
   `backend/siameseModel/siamese_modelv-3.pth`

### 3. Frontend Setup (Next.js & Tailwind CSS)

1. In a new terminal, navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   pnpm install
   # or: npm install
   ```

3. Configure environment variables:
   ```bash
   # Windows
   copy .env.example .env.local

   # Linux / macOS
   cp .env.example .env.local
   ```
   Open `frontend/.env.local` and set:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
   ```

---

## Running the Project

### 1. Start the Backend Server (Flask)

```bash
cd backend
python app.py
```
*The Flask server runs on `http://localhost:5000`.*

### 2. Start the Frontend Application (Next.js)

```bash
cd frontend
pnpm dev
# or: npm run dev
```
*The Next.js application opens on `http://localhost:3000`.*
