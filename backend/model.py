import pandas as pd
import numpy as np
import pickle
import re                                  # library for regular expression operations
import string                              # for string operations
from nltk.corpus import stopwords          # module for stop words that come with NLTK
from nltk.stem import PorterStemmer        # module for stemming
from nltk.tokenize import TweetTokenizer   # module for tokenizing strings
import os
import time 
t0 = time.time()
# Load frequency dictionary
data_pkl = r'data.pkl'
if not os.path.exists(data_pkl):
    raise FileNotFoundError(f"{data_pkl} not found!")
with open(data_pkl, 'rb') as f:
    freqs = pickle.load(f)

# Re-load the IMDB dataset
# Extract X and y from freqs dictionary
X = []
y = []

for (word, label), count in freqs.items():
    X.append(word)
    y.append(label)

# Convert to numpy arrays if needed
import numpy as np
X = np.array(X)
y = np.array(y)
t1 = time.time()
print(f"Preprocessing time: {t1 - t0:.2f} sec")
def process_tweet(tweet):
    # remove old style retweet text "RT"
    tweet2 = re.sub(r'^RT[\s]+', '', tweet)

    # remove hyperlinks
    tweet2 = re.sub(r'https?:\/\/.*[\r\n]*', '', tweet2)
    # remove hashtags
    # only removing the hash # sign from the word
    tweet2 = re.sub(r'#', '', tweet2)
    tokenizer = TweetTokenizer(preserve_case=False, strip_handles=True,
                               reduce_len=True)

    # tokenize tweets
    tweet_tokens = tokenizer.tokenize(tweet2)
    stopwords_english = stopwords.words('english')

    tweets_clean = []

    for word in tweet_tokens: # Go through every word in your tokens list
        if (word not in stopwords_english and  # remove stopwords
            word not in string.punctuation):  # remove punctuation
            tweets_clean.append(word)

    stemmer = PorterStemmer() 
    # Create an empty list to store the stems
    tweets_stem = [] 

    for word in tweets_clean:
        stem_word = stemmer.stem(word)  # stemming word
        tweets_stem.append(stem_word)  # append to the list
    return tweets_stem

def extract_features(tweet, freqs):
    # process_tweet tokenizes, stems, and removes stopwords
    word_l = process_tweet(tweet)
    # 3 elements in the form of a 1 x 3 vector
    x = np.zeros((1, 3)) 
    #bias term is set to 1
    x[0,0] = 1 
    # loop through each word in the list of words
    for word in word_l:
        # increment the word count for the positive label 1
        x[0,1] += freqs.get((word, 1.0),0)
        # increment the word count for the negative label 0
        x[0,2] += freqs.get((word, 0.0),0)
    assert(x.shape == (1, 3))
    return x

def parameter_X(X,freqs): 
    update = np.zeros((len(X), 3))
    for i in range(len(X)):
        update[i, :]= extract_features(X[i], freqs)
    return update

update=parameter_X(X,freqs)
t2 = time.time()
print(f"Classic models training time: {t2 - t1:.2f} sec")
# Save the frequency dictionary
with open('update.pkl', 'wb') as f:
    pickle.dump(update, f)

from sklearn.model_selection import train_test_split
# Assuming X and y are your features and labels
X_train, X_test, y_train, y_test = train_test_split(update, y, test_size=0.1, random_state=42)

from sklearn.preprocessing import LabelEncoder

# Assuming y_train is your categorical labels in object dtype
label_encoder = LabelEncoder()
y_train = label_encoder.fit_transform(y_train)
y_test=label_encoder.fit_transform(y_test)

import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.naive_bayes import GaussianNB
from sklearn.metrics import accuracy_score
from tqdm import tqdm

# Add TensorFlow imports
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

results = {}
best_model_name = None
best_model = None
best_accuracy = 0

# Classic models
models = {
    "Logistic Regression": LogisticRegression(max_iter=200),
    "Random Forest": RandomForestClassifier(),
    "Naive Bayes": GaussianNB()
}

for name, model in tqdm(models.items(), desc="Training classic models"):
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    results[name] = acc
    if acc > best_accuracy:
        best_accuracy = acc
        best_model_name = name
        best_model = model

t3 = time.time()
print(f"Classic models training time: {t3 - t2:.2f} sec")

# Neural network with TensorFlow/Keras
tf_model = keras.Sequential([
    layers.Input(shape=(3,)),   # Three features per sample
    layers.Dense(128, activation='relu'),
    layers.Dense(16, activation='relu'),
    layers.Dense(8, activation='relu'),
    layers.Dense(1, activation='sigmoid')
])
tf_model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
tf_model.fit(X_train, y_train, epochs=10, batch_size=32, verbose=0)
loss, acc = tf_model.evaluate(X_test, y_test, verbose=0)
results["TensorFlow NN"] = acc
if acc > best_accuracy:
    best_accuracy = acc
    best_model_name = "TensorFlow NN"
    best_model = tf_model

t4 = time.time()
print(f"TensorFlow model training time: {t4 - t3:.2f} sec")

# Add RNN and LSTM models (Sequential, text-based)
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Embedding, SimpleRNN, LSTM, Dense,Bidirectional

# Prepare text data (X contains your words)
data = pd.read_csv(r'IMDB_Dataset.csv')
texts = data["review"].astype(str).tolist()  # ensure all reviews are strings
labels = data["sentiment"].map(lambda x: 1 if x == 'positive' else 0).values  # convert to 0/1

from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences

vocab_size = 5000
max_len = 200

tokenizer = Tokenizer(num_words=vocab_size, oov_token="<OOV>")
tokenizer.fit_on_texts(texts)
sequences = tokenizer.texts_to_sequences(texts)

padded = pad_sequences(sequences, maxlen=max_len, padding='post', truncating='post')

from sklearn.model_selection import train_test_split

X_train_seq, X_test_seq, y_train_seq, y_test_seq = train_test_split(
    padded, labels, test_size=0.1, random_state=42
)
embedding_dim = 64  # dimension of embedding vector

# --- Simple RNN ---
rnn_model = Sequential([
    Embedding(vocab_size, embedding_dim, input_length=max_len),
    SimpleRNN(64, return_sequences=False),
    Dense(32, activation='relu'),
    Dense(1, activation='sigmoid')
])
rnn_model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
t_rnn0 = time.time()
rnn_model.fit(X_train_seq, y_train_seq, epochs=5, batch_size=32, verbose=0)
t_rnn1 = time.time()
rnn_loss, rnn_acc = rnn_model.evaluate(X_test_seq, y_test_seq, verbose=0)
results["RNN"] = rnn_acc
print(f"RNN model accuracy: {rnn_acc:.4f} | Training time: {t_rnn1 - t_rnn0:.2f} sec")

if rnn_acc > best_accuracy:
    best_accuracy = rnn_acc
    best_model_name = "RNN"
    best_model = rnn_model

# --- LSTM ---
lstm_model = Sequential([
    Embedding(vocab_size, embedding_dim, input_length=max_len),
    LSTM(64, return_sequences=False),
    Dense(32, activation='relu'),
    Dense(1, activation='sigmoid')
])
lstm_model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
t_lstm0 = time.time()
lstm_model.fit(X_train_seq, y_train_seq, epochs=5, batch_size=32, verbose=0)
t_lstm1 = time.time()
lstm_loss, lstm_acc = lstm_model.evaluate(X_test_seq, y_test_seq, verbose=0)
results["LSTM"] = lstm_acc
print(f"LSTM model accuracy: {lstm_acc:.4f} | Training time: {t_lstm1 - t_lstm0:.2f} sec")

if lstm_acc > best_accuracy:
    best_accuracy = lstm_acc
    best_model_name = "LSTM"
    best_model = lstm_model

# --- Bidirectional LSTM ---
bilstm_model = Sequential([
    Embedding(vocab_size, embedding_dim, input_length=max_len),
    Bidirectional(LSTM(64, return_sequences=False)),
    Dense(32, activation='relu'),
    Dense(1, activation='sigmoid')
])
bilstm_model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
t_bilstm0 = time.time()
bilstm_model.fit(X_train_seq, y_train_seq, epochs=5, batch_size=32, verbose=0)
t_bilstm1 = time.time()
bilstm_loss, bilstm_acc = bilstm_model.evaluate(X_test_seq, y_test_seq, verbose=0)
results["Bidirectional LSTM"] = bilstm_acc
print(f"Bidirectional LSTM accuracy: {bilstm_acc:.4f} | Training time: {t_bilstm1 - t_bilstm0:.2f} sec")

if bilstm_acc > best_accuracy:
    best_accuracy = bilstm_acc
    best_model_name = "Bidirectional LSTM"
    best_model = bilstm_model

import pandas as pd

# Save all model results (including LSTM & RNN)
results_df = pd.DataFrame([
    {"Model": name, "Accuracy": acc}
    for name, acc in results.items()
])
results_df.sort_values(by="Accuracy", ascending=False, inplace=True)

print("\n📊 Model Accuracy Comparison:")
print(results_df.to_string(index=False))

# Identify best model
best_model_name = results_df.iloc[0]['Model']
best_accuracy = results_df.iloc[0]['Accuracy']
print(f"\n🏆 Best Model: {best_model_name} with Accuracy: {best_accuracy:.4f}")

# Save best model
import pickle
if best_model_name not in ["TensorFlow NN", "RNN", "LSTM", "Bidirectional LSTM"]:
    filename = f"best_model_{best_model_name.replace(' ', '_').lower()}.pkl"
    with open(filename, "wb") as f:
        pickle.dump(best_model, f)
else:
    filename = f"best_model_{best_model_name.lower().replace(' ', '_')}.keras"
    best_model.save(filename)

print(f"📁 Saved the best model as '{filename}' with accuracy {best_accuracy:.4f}")

# Save CSV and summary files
results_filename = "model_results.csv"
results_df.to_csv(results_filename, index=False)

summary_filename = "best_model_summary.txt"
with open(summary_filename, "w", encoding="utf-8") as f:
    f.write("📊 Model Accuracy Comparison:\n")
    f.write(results_df.to_string(index=False))
    f.write("\n\n")
    f.write(f"🏆 Best Model: {best_model_name}\n")
    f.write(f"✅ Accuracy: {best_accuracy:.4f}\n")
    f.write(f"📁 Saved as: {filename}\n")

print(f"\n✅ All results saved to:")
print(f"   - {results_filename}")
print(f"   - {summary_filename}")
