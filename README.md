# OpinionFlix 🎬🤖

<div align="center">

# ✨ OpinionFlix

### *"Where Audience Emotion Shapes Cinema"*

An AI-powered movie analytics platform that transforms viewer sentiments into meaningful insights using advanced NLP and beautiful data visualization.

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3-38B2AC?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)
[![Flask](https://img.shields.io/badge/Flask-3-000000?style=for-the-badge&logo=flask)](https://flask.palletsprojects.com)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python)](https://python.org)

</div>

---

## 🚀 Features

### 🎨 Premium UI/UX
- **Netflix + IMDb inspired** dark cinematic interface
- **Glassmorphism** cards with backdrop blur effects
- **Framer Motion** animations throughout
- **Dark/Light mode** toggle with smooth transitions
- **Mobile responsive** design
- **Animated hero section** with trending movie backdrops
- **Movie trailer popup** modal (YouTube embed)

### 🤖 AI-Powered Analytics
- **Sentiment Analysis** — Classifies reviews as positive/negative using Bidirectional LSTM
- **Emotion Detection** — Detects Happy, Excited, Sad, Angry, Bored emotions in reviews
- **AI Review Summary** — Auto-generates intelligent review summaries
- **Fake Review Detection** — NLP-based spam/suspicious review detection
- **Mood-Based Recommendations** — Pick a mood, get personalized movie suggestions

### 📊 Visual Analytics
- **Sentiment Pie Charts** — Positive vs negative breakdown
- **Emotion Bar Charts** — Emotion distribution visualization
- **Sentiment Progress Bars** — Animated gradient progress indicators
- **Rating Trend Charts** — Sentiment trends over time
- **Trending Dashboard** — Most loved, most hated, trending movies

### 👤 User Features
- **Authentication** — Login/Register with encrypted passwords
- **Profile Avatars** — Auto-generated color avatars
- **Watchlist** — Save movies for later
- **Favorites** — Heart your favorite movies
- **Recently Viewed** — Browse your viewing history
- **Top Reviewers Leaderboard** — Community rankings

### 🔍 Discovery
- **Search Suggestions** — Debounced live search with poster previews
- **Genre Filtering** — Browse by genre chips
- **Mood Picker** — Discover movies by emotional state

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Vite 5, TailwindCSS 3, Framer Motion |
| **Charts** | Recharts |
| **Backend** | Python Flask, SQLAlchemy |
| **Database** | PostgreSQL |
| **AI/NLP** | TensorFlow/Keras (Bidirectional LSTM), NLTK, Custom NLP |
| **APIs** | TMDB (The Movie Database) |
| **Auth** | bcrypt password hashing |

---

## 📸 Screenshots

> Screenshots will be added after deployment

---

## ⚡ Installation

### Prerequisites
- Node.js 18+
- Python 3.10+
- PostgreSQL database

### Frontend Setup

```bash
git clone https://github.com/Acepatil/Movie_Opinion.git
cd Movie_Opinion/frontend
npm install
```

Create a `.env` file in the `frontend` directory:

```env
VITE_BASE_SITE=https://api.themoviedb.org/3/discover/movie
VITE_MOVIE_INFO=https://api.themoviedb.org/3/movie
VITE_MOVIE_SEARCH=https://api.themoviedb.org/3/search/movie
VITE_API_KEY=your_tmdb_api_key
VITE_BACKEND_SITE=http://localhost:8080
```

Start the dev server:

```bash
npm run dev
```

### Backend Setup

```bash
cd Movie_Opinion/backend
pip install -r requirements.txt
```

Create a `.env` file in the `backend` directory:

```env
DATABASE_URI=your_postgresql_connection_string
```

Initialize the database and start the server:

```bash
flask init-db
python app.py
```

---

## 🤖 AI Capabilities

### Sentiment Analysis
Uses a **Bidirectional LSTM** neural network trained on the IMDB dataset (50K reviews) to classify movie reviews as positive or negative.

### Emotion Detection
Analyzes review text using keyword-lexicon mapping to classify emotions into 5 categories: Happy, Excited, Sad, Angry, Bored.

### Fake Review Detection
Uses NLP pattern matching to detect suspicious reviews based on:
- Excessive capitalization
- Repeated characters
- Spam keywords
- Extremely short content
- Repetitive word usage

### AI Review Summary
Aggregates all reviews for a movie and generates an intelligent summary highlighting what viewers praised and criticized most.

---

## 🔮 Future Scope

- [ ] Transformer-based emotion detection (HuggingFace)
- [ ] Multi-language review support
- [ ] Social features (follow users, share reviews)
- [ ] Advanced recommendation engine using collaborative filtering
- [ ] Real-time review notifications
- [ ] Review upvoting/downvoting
- [ ] Admin dashboard
- [ ] PWA support

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🤝 Contributing

Contributions are welcome! Feel free to submit a Pull Request.

---

<div align="center">
  <p>Made with ❤️ by the OpinionFlix Team</p>
  <p><strong>OpinionFlix</strong> — Where Audience Emotion Shapes Cinema</p>
</div>
