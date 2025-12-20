# VisaVerse - Smart Global Relocation Companion

🌍 **AI-powered, voice-enabled relocation assistant** that helps users move to another country by handling visa guidance, culture, language translation, voice interaction, currency help, document understanding, and packing essentials in one place.

## 🎯 Features

### 7 Integrated Modules

1. **AI Relocation Planner** - Visa type suggestions, document checklists, timeline estimation
2. **Cultural Intelligence Guide** - Social norms, workplace etiquette, cultural sensitivities
3. **Language Survival + Translator** - Essential phrases + real-time voice translation
4. **Voice Conversational AI** - Hands-free interaction with AI assistant
5. **Currency & Money Assistant** - Real-time conversion + financial advice
6. **PDF Document Analysis** - AI-powered document understanding
7. **Smart Packing List** - Country-specific packing recommendations

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, Tailwind CSS, Web Speech API
- **Backend**: FastAPI (Python)
- **AI**: Google Gemini API
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **Translation**: Gemini API
- **Voice**: Web Speech API (browser-native)

## 📦 Installation

### Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- Gemini API key
- Firebase project

### Backend Setup

```bash
cd backend

# Create virtual environment (recommended)
python -m venv venv
venv\Scripts\activate  # On Windows
# source venv/bin/activate  # On Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Create .env file
copy .env.example .env

# Add your Gemini API key to .env
# GEMINI_API_KEY=your_key_here

# Run the server
uvicorn main:app --reload
```

Backend will run on `http://localhost:8000`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Environment is already configured in .env.local

# Run development server
npm run dev
```

Frontend will run on `http://localhost:3000`

## 🚀 Usage

1. **Start Backend**: Run `uvicorn main:app --reload` in backend directory
2. **Start Frontend**: Run `npm run dev` in frontend directory
3. **Open Browser**: Navigate to `http://localhost:3000`
4. **Select Countries**: Choose your home and destination countries
5. **Explore Modules**: Use the dashboard tabs to access all features

## 🎨 UI Highlights

- **Glassmorphism Design** - Modern, premium aesthetic
- **Smooth Animations** - Fade-in, slide-up, floating elements
- **Gradient Accents** - Dynamic color schemes
- **Responsive Layout** - Works on all devices
- **Voice Integration** - Hands-free interaction
- **Real-time Updates** - Live data from APIs

## 📱 Browser Compatibility

- **Best Experience**: Google Chrome (full Web Speech API support)
- **Supported**: Edge, Safari, Firefox (limited voice features)
- **Mobile**: iOS Safari, Chrome Mobile

## 🔑 API Endpoints

### Relocation
- `POST /api/relocation/plan` - Get relocation plan

### Culture
- `POST /api/culture/guide` - Get cultural guide

### Language
- `POST /api/language/translate` - Translate text
- `POST /api/language/phrases` - Get essential phrases

### Voice
- `POST /api/voice/query` - Process voice query

### Currency
- `POST /api/currency/convert` - Convert currency
- `POST /api/currency/advice` - Get money advice

### Documents
- `POST /api/documents/analyze` - Analyze PDF

### Packing
- `POST /api/packing/list` - Get packing list

## 🔧 Configuration

### Backend (.env)
```env
GEMINI_API_KEY=your_gemini_api_key
FIREBASE_PROJECT_ID=visaverse-fc9f3
FIREBASE_STORAGE_BUCKET=visaverse-fc9f3.firebasestorage.app
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
# ... other Firebase config
```

## 📝 Project Structure

```
Smart Global Relocation Companion/
├── backend/
│   ├── main.py                 # FastAPI app
│   ├── config.py               # Configuration
│   ├── models/                 # Pydantic models
│   ├── services/               # Business logic
│   │   ├── gemini_service.py
│   │   ├── firebase_service.py
│   │   ├── relocation_planner.py
│   │   ├── cultural_guide.py
│   │   ├── language_service.py
│   │   ├── voice_service.py
│   │   ├── currency_service.py
│   │   ├── document_service.py
│   │   └── packing_service.py
│   └── routers/                # API endpoints
├── frontend/
│   ├── app/
│   │   ├── page.js             # Landing page
│   │   ├── dashboard/page.js   # Dashboard
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── VoiceChat.jsx
│   │   ├── Translator.jsx
│   │   ├── PDFUploader.jsx
│   │   ├── CurrencyConverter.jsx
│   │   ├── RelocationChecklist.jsx
│   │   ├── CultureGuide.jsx
│   │   ├── LanguageLearning.jsx
│   │   └── PackingList.jsx
│   └── lib/
│       ├── firebase.js         # Firebase config
│       ├── api.js              # API client
│       └── speech.js           # Web Speech API
└── README.md
```

## 🌟 Key Features Explained

### Voice AI
- Speech-to-text input
- Text-to-speech responses
- Context-aware conversations
- Follow-up suggestions

### Translation
- Real-time translation
- Voice pronunciation
- Multiple languages
- Context preservation

### Document Analysis
- PDF text extraction
- AI-powered analysis
- Simplified explanations
- Action item detection

### Smart Packing
- Country-specific items
- Priority categorization
- Climate considerations
- Cultural necessities

## 🐛 Troubleshooting

### Backend Issues
- **Import errors**: Ensure virtual environment is activated
- **API errors**: Check Gemini API key in .env
- **Firebase errors**: Verify Firebase credentials

### Frontend Issues
- **Build errors**: Delete `.next` folder and rebuild
- **API connection**: Ensure backend is running on port 8000
- **Voice not working**: Use Chrome browser for best support

## 📄 License

This project is for educational and personal use.

## 🤝 Contributing

This is a demonstration project. Feel free to fork and customize!

## 📧 Support

For issues or questions, please check the troubleshooting section or review the code comments.

---

**Built with ❤️ using Next.js, FastAPI, and Gemini AI**
