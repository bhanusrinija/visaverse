# 🌍 VisaVerse: Your Smart Global Relocation Companion

[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-black?style=flat&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Gemini](https://img.shields.io/badge/AI-Google%20Gemini%203-blue?style=flat&logo=google-gemini)](https://ai.google.dev/)
[![Firebase](https://img.shields.io/badge/Storage-Firebase-FFCA28?style=flat&logo=firebase)](https://firebase.google.com/)

VisaVerse is an **AI-powered, voice-enabled relocation assistant** designed to simplify the complex journey of moving to a new country. By centralizing visa guidance, cultural intelligence, language tools, and logistical planning, VisaVerse empowers users to transition smoothly into their new lives.

---

## 🚀 Key Modules

### 1. 📋 Smart Relocation Planner
- AI-generated personalized relocation roadmaps.
- Hyper-specific itineraries with real place names, ratings, and expert tips.
- Interactive mapping with auto-scroll and direct Google Maps directions.

### 2. 🗣️ Live Translator & Language Survival
- **Indian Language Support**: Now supporting 11 major Indian languages (Hindi, Telugu, Bengali, etc.).
- Real-time voice-to-voice and text translation.
- Essential phrase categories (Emergency, Food, Transport) with voice pronunciation.

### 3. 🧠 Cultural Buddy (AI Roleplay)
- Interactive cultural simulation engine for practicing high-stakes social scenarios.
- Instant feedback on cultural appropriateness and social norms.
- Optimized with **Gemini 3 Flash** for near-instant interaction.

### 4. 📄 Document AI Analysis
- Intelligent extraction and analysis of visas, passports, and official documents.
- Detects missing information, important dates, and provides simplified legal explanations.
- Support for image-based PDFs and official stamps/seals.

### 5. 🎙️ Voice Assistant
- Truly hands-free interaction using the Web Speech API.
- Context-aware conversational loop for managing your entire relocation on the go.

### 6. 💰 Money & Currency Assistant
- Real-time currency conversion for all global markets.
- AI-driven financial advice for cost-of-living management in your destination country.

### 7. 🎒 Smart Packing List
- Climate and culture-aware packing recommendations.
- Essential supply tracking for items unique to the home country.

---

## 🛠️ Technical Rationale

VisaVerse is built on a high-performance stack chosen for speed and scalability:

- **Next.js 14**: Enables a "Glassmorphism" premium UI with high-speed page transitions.
- **FastAPI**: Provides an asynchronous backend capable of handling multiple AI model calls concurrently.
- **Gemini 3 Hybrid Strategy**: Uses **Flash** for speed-critical tasks (Translation, Buddy) and **Pro** for high-reasoning tasks (Document Analysis).
- **Web Speech API**: Browser-native voice intelligence for zero-latency interactions.

*For a detailed deep dive into our tool choices, see [TECH_STACK.md](./TECH_STACK.md).*

---

## 📦 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.9+
- Google Gemini API Key
- Firebase Service Account

### Quick Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-repo/visaverse.git
   cd visaverse
   ```

2. **Backend Setup**
   ```bash
   cd backend
   pip install -r requirements.txt
   # Configure .env with Gemini & Firebase keys
   uvicorn main:app --reload
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   # Configure .env.local
   npm run dev
   ```

---

## 🌟 Modern UI/UX
- **Glassmorphism Design Language** for a premium, futuristic look.
- **Micro-animations** using Framer Motion and GSAP.
- **Dynamic Map Integrations** for real-time travel planning.
- **Responsive Web Design** ensuring a consistent experience across Desktop, Tablet, and Mobile.

---

**Built with ❤️ for the future of global mobility.**
