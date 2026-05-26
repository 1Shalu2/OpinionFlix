import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import numpy as np
import pickle
import re
import string
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer
from nltk.tokenize import TweetTokenizer
from dotenv import load_dotenv
import bcrypt
from datetime import datetime

import nltk
nltk.download('stopwords')

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get("DATABASE_URI")
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
CORS(app)
db = SQLAlchemy(app)

# Load the frequency dictionary and model
with open('data.pkl', 'rb') as pickle_file:
    freqs = pickle.load(pickle_file)

from tensorflow import keras
model = keras.models.load_model("best_model_bidirectional_lstm.keras")

# ─── Database Models ──────────────────────────────────────────

class User(db.Model):
    username = db.Column(db.String(50), nullable=False, primary_key=True)
    email = db.Column(db.String(100), nullable=False)
    password = db.Column(db.String(255), nullable=False)
    avatar_color = db.Column(db.String(20), default='#6366f1')

class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    movie_id = db.Column(db.Integer, nullable=False)
    content = db.Column(db.Text, nullable=False)
    prediction = db.Column(db.Integer, nullable=False)
    username = db.Column(db.String(100), db.ForeignKey('user.username'), nullable=False)
    emotion = db.Column(db.String(20), default='Neutral')
    is_fake = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user = db.relationship('User', backref=db.backref('comments', lazy=True))

class Watchlist(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), db.ForeignKey('user.username'), nullable=False)
    movie_id = db.Column(db.Integer, nullable=False)
    added_at = db.Column(db.DateTime, default=datetime.utcnow)
    user = db.relationship('User', backref=db.backref('watchlist', lazy=True))

# ─── NLP Functions ──────────────────────────────────────────

def process_tweet(tweet):
    tweet = re.sub(r'^RT[\s]+', '', tweet)
    tweet = re.sub(r'https?:\/\/.*[\r\n]*', '', tweet)
    tweet = re.sub(r'#', '', tweet)
    tokenizer = TweetTokenizer(preserve_case=False, strip_handles=True, reduce_len=True)
    tweet_tokens = tokenizer.tokenize(tweet)
    stopwords_english = stopwords.words('english')
    tweets_clean = [word for word in tweet_tokens if word not in stopwords_english and word not in string.punctuation]
    stemmer = PorterStemmer()
    tweets_stem = [stemmer.stem(word) for word in tweets_clean]
    return tweets_stem

def extract_features(tweet, freqs):
    word_l = process_tweet(tweet)
    x = np.zeros((1, 3))
    x[0, 0] = 1
    for word in word_l:
        if word == 'movi':
            continue
        x[0, 1] += freqs.get((word, 1.0), 0)
        x[0, 2] += freqs.get((word, 0.0), 0)
    return x

# ─── Emotion Detection ──────────────────────────────────────

EMOTION_KEYWORDS = {
    'Happy': ['love', 'enjoy', 'fun', 'great', 'happy', 'wonderful', 'delightful', 'pleased', 'glad', 'cheerful', 'joyful', 'laugh', 'smile', 'fantastic', 'lovely'],
    'Excited': ['amazing', 'awesome', 'incredible', 'spectacular', 'thrilling', 'exciting', 'mind-blowing', 'epic', 'brilliant', 'outstanding', 'wow', 'phenomenal', 'superb', 'stunning'],
    'Sad': ['sad', 'cry', 'tragic', 'heartbreaking', 'emotional', 'depressing', 'melancholy', 'tear', 'sorrow', 'painful', 'moving', 'devastating', 'grief', 'touching'],
    'Angry': ['terrible', 'awful', 'worst', 'hate', 'angry', 'furious', 'disgusting', 'horrible', 'pathetic', 'outrageous', 'infuriating', 'annoying', 'frustrating', 'waste'],
    'Bored': ['boring', 'dull', 'slow', 'tedious', 'bland', 'predictable', 'repetitive', 'uninteresting', 'flat', 'lifeless', 'mediocre', 'forgettable', 'yawn', 'dragged'],
}

def detect_emotion(text):
    text_lower = text.lower()
    scores = {}
    for emotion, keywords in EMOTION_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in text_lower)
        scores[emotion] = score
    best = max(scores, key=scores.get)
    if scores[best] == 0:
        return 'Neutral'
    return best

# ─── Fake Review Detection ──────────────────────────────────

def detect_fake(text):
    flags = 0
    # Very short review
    if len(text.split()) < 3:
        flags += 2
    # Excessive caps
    upper_ratio = sum(1 for c in text if c.isupper()) / max(len(text), 1)
    if upper_ratio > 0.6:
        flags += 2
    # Excessive repeated chars
    if re.search(r'(.)\1{4,}', text):
        flags += 2
    # Excessive punctuation
    punct_ratio = sum(1 for c in text if c in '!?') / max(len(text), 1)
    if punct_ratio > 0.2:
        flags += 1
    # Spam patterns
    spam_patterns = ['buy now', 'click here', 'free money', 'subscribe', 'check out my']
    if any(p in text.lower() for p in spam_patterns):
        flags += 3
    # Repetitive words
    words = text.lower().split()
    if len(words) > 3 and len(set(words)) / len(words) < 0.3:
        flags += 2
    return flags >= 3

# ─── AI Review Summary ──────────────────────────────────────

def generate_summary(comments):
    if not comments:
        return "No reviews available yet."
    
    positive_words = {}
    negative_words = {}
    
    positive_aspects = ['acting', 'visuals', 'story', 'music', 'direction', 'cinematography', 'performance', 'script', 'effects', 'cast', 'plot', 'soundtrack', 'editing', 'humor', 'action', 'emotion', 'dialogue', 'character']
    negative_aspects = ['pacing', 'length', 'plot holes', 'ending', 'dialogue', 'cgi', 'predictable', 'overrated', 'slow', 'confusing', 'boring', 'weak', 'disappointing']
    
    pos_found = []
    neg_found = []
    
    for c in comments:
        text_lower = c.content.lower()
        if c.prediction == 1:
            for aspect in positive_aspects:
                if aspect in text_lower and aspect not in pos_found:
                    pos_found.append(aspect)
        else:
            for aspect in negative_aspects:
                if aspect in text_lower and aspect not in neg_found:
                    neg_found.append(aspect)
    
    pos_count = sum(1 for c in comments if c.prediction == 1)
    neg_count = len(comments) - pos_count
    
    if pos_count > neg_count:
        sentiment = "Most viewers enjoyed this movie"
    elif neg_count > pos_count:
        sentiment = "Most viewers had mixed feelings about this movie"
    else:
        sentiment = "Viewers are equally divided on this movie"
    
    parts = [sentiment]
    if pos_found:
        parts.append(f"praising the {', '.join(pos_found[:3])}")
    if neg_found:
        parts.append(f"but found the {', '.join(neg_found[:3])} lacking")
    
    return ' '.join(parts) + '.'

# ─── CLI Commands ──────────────────────────────────────────

@app.cli.command("init-db")
def init_db():
    db.create_all()
    print("Database initialized.")

# ─── API Routes ──────────────────────────────────────────

@app.route("/")
def index():
    return "Welcome to the OpinionFlix API!"

@app.route("/delete_all", methods=["POST"])
def delete_all_tables():
    db.drop_all()
    return jsonify({"message": "All tables deleted"})

@app.route("/create_all", methods=["POST"])
def create_all_tables():
    db.create_all()
    return jsonify({"message": "All tables created"})

@app.route("/register", methods=["POST"])
def add_user():
    data = request.get_json()
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if User.query.filter_by(username=username).first() is not None:
        return jsonify(message='Username already exists', same="username"), 400

    if User.query.filter_by(email=email).first() is not None:
        return jsonify(message='Email already exists', same="email"), 400
    
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    new_user = User(username=username, email=email, password=hashed_password.decode('utf-8'))
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "Added User"})

@app.route("/submit", methods=["POST"])
def make_answer():
    data = request.get_json()
    tweet = data.get("comment", "")
    username = data.get("username")
    movie_id = data.get("movie_id")

    if not tweet or not username or not movie_id:
        return jsonify({"error": "Comment, username, and movie_id are required"}), 400

    # Sentiment analysis
    update = extract_features(tweet, freqs)
    prediction = model.predict(update)

    # Emotion detection
    emotion = detect_emotion(tweet)

    # Fake review detection
    is_fake = detect_fake(tweet)

    # Store the comment
    new_comment = Comment(
        movie_id=movie_id,
        content=tweet,
        prediction=int(prediction[0]),
        username=username,
        emotion=emotion,
        is_fake=is_fake,
    )
    db.session.add(new_comment)
    db.session.commit()

    return jsonify({
        "prediction": int(prediction[0]),
        "comment_id": new_comment.id,
        "movie_id": movie_id,
        "username": new_comment.username,
        "content": new_comment.content,
        "emotion": emotion,
        "is_fake": is_fake,
    })

@app.route("/comments", methods=["GET"])
def get_comments():
    movie_id = request.args.get("movie_id")
    if not movie_id:
        return jsonify({"error": "movie_id is required"}), 400

    comments = Comment.query.filter_by(movie_id=movie_id).order_by(Comment.id.desc()).all()
    comments_list = [{
        "id": c.id,
        "movie_id": c.movie_id,
        "username": c.username,
        "content": c.content,
        "prediction": c.prediction,
        "emotion": c.emotion if hasattr(c, 'emotion') and c.emotion else None,
        "is_fake": c.is_fake if hasattr(c, 'is_fake') and c.is_fake else False,
    } for c in comments]
    return jsonify({"comments": comments_list})

@app.route("/users", methods=["GET"])
def get_users():
    users = User.query.all()
    users_list = [{"username": u.username, "email": u.email} for u in users]
    return jsonify(users_list)

@app.route("/comment", methods=["GET"])
def get_all_comments():
    comments = Comment.query.all()
    comments_list = [{
        "id": c.id,
        "movie_id": c.movie_id,
        "username": c.username,
        "content": c.content,
        "prediction": c.prediction,
        "emotion": c.emotion if hasattr(c, 'emotion') and c.emotion else None,
        "is_fake": c.is_fake if hasattr(c, 'is_fake') and c.is_fake else False,
    } for c in comments]
    return jsonify(comments_list)

@app.route("/comments/counts", methods=["GET"])
def get_comment_counts():
    movie_id = request.args.get("movie_id")
    if not movie_id:
        return jsonify({"error": "movie_id is required"}), 400
    positive_count = Comment.query.filter_by(movie_id=movie_id, prediction=1).count()
    negative_count = Comment.query.filter_by(movie_id=movie_id, prediction=0).count()
    return jsonify({"positive_count": positive_count, "negative_count": negative_count})

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify(message='Username or password is missing'), 400
    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify(message='Not a user', invalid="username"), 401
    if bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
        return jsonify(message='Login successful!'), 200
    else:
        return jsonify(message='Invalid username or password', invalid="password"), 401

# ─── New AI Endpoints ──────────────────────────────────────

@app.route("/emotions", methods=["GET"])
def get_emotions():
    movie_id = request.args.get("movie_id")
    if not movie_id:
        return jsonify({"error": "movie_id is required"}), 400

    comments = Comment.query.filter_by(movie_id=movie_id).all()
    emotion_counts = {"Happy": 0, "Excited": 0, "Sad": 0, "Angry": 0, "Bored": 0}
    for c in comments:
        em = c.emotion if hasattr(c, 'emotion') and c.emotion else detect_emotion(c.content)
        if em in emotion_counts:
            emotion_counts[em] += 1
    return jsonify(emotion_counts)

@app.route("/reviews/summary", methods=["GET"])
def get_review_summary():
    movie_id = request.args.get("movie_id")
    if not movie_id:
        return jsonify({"error": "movie_id is required"}), 400
    comments = Comment.query.filter_by(movie_id=movie_id).all()
    summary = generate_summary(comments)
    return jsonify({"summary": summary, "total_reviews": len(comments)})

@app.route("/dashboard/trending", methods=["GET"])
def get_trending_dashboard():
    comments = Comment.query.all()
    if not comments:
        return jsonify({"total": 0, "movies": []})

    movie_map = {}
    for c in comments:
        if c.movie_id not in movie_map:
            movie_map[c.movie_id] = {"positive": 0, "negative": 0, "total": 0}
        movie_map[c.movie_id]["total"] += 1
        if c.prediction == 1:
            movie_map[c.movie_id]["positive"] += 1
        else:
            movie_map[c.movie_id]["negative"] += 1

    return jsonify({
        "total_reviews": len(comments),
        "total_movies": len(movie_map),
        "movies": movie_map,
    })

# ─── Watchlist Endpoints ──────────────────────────────────

@app.route("/watchlist", methods=["POST"])
def add_to_watchlist():
    data = request.get_json()
    username = data.get("username")
    movie_id = data.get("movie_id")
    if not username or not movie_id:
        return jsonify({"error": "username and movie_id required"}), 400
    existing = Watchlist.query.filter_by(username=username, movie_id=movie_id).first()
    if existing:
        return jsonify({"message": "Already in watchlist"})
    w = Watchlist(username=username, movie_id=movie_id)
    db.session.add(w)
    db.session.commit()
    return jsonify({"message": "Added to watchlist"})

@app.route("/watchlist", methods=["GET"])
def get_watchlist():
    username = request.args.get("username")
    if not username:
        return jsonify({"error": "username required"}), 400
    items = Watchlist.query.filter_by(username=username).order_by(Watchlist.added_at.desc()).all()
    return jsonify([{"movie_id": w.movie_id} for w in items])

@app.route("/watchlist", methods=["DELETE"])
def remove_from_watchlist():
    data = request.get_json()
    username = data.get("username")
    movie_id = data.get("movie_id")
    Watchlist.query.filter_by(username=username, movie_id=movie_id).delete()
    db.session.commit()
    return jsonify({"message": "Removed from watchlist"})


if __name__ == "__main__":
    app.run(debug=True, port=8080)
