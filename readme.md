# 🛡️ MailGuard AI — Intelligent Email Spam Detection

MailGuard AI is a lightweight email spam detection web application that classifies emails as **SPAM** or **NOT SPAM** using a TF-IDF text representation and a Multinomial Naive Bayes classifier.

Built with Python and Flask, it provides a responsive interface, spam probability estimates, and a REST API for email classification.

## ✨ Features

- 📧 Email classification using subject and message text
- 🤖 Lightweight TF-IDF + Multinomial Naive Bayes model
- 📊 Spam probability score
- ⚡ Flask-based prediction API
- 🎨 Responsive web interface
- 🔍 Health-check endpoint
- 🚀 Designed for lightweight CPU inference

## 🧰 Tech Stack

| Technology | Purpose |
|---|---|
| Python | Core programming language |
| scikit-learn | Text processing and classification |
| TF-IDF | Converts email text into numerical features |
| Multinomial Naive Bayes | Spam classification |
| Flask | Backend and REST API |
| Joblib | Loading the trained model pipeline |
| HTML, CSS, JavaScript | Frontend |
| Git & GitHub | Version control |
| Render | Web deployment |

## 🏗️ Project Structure

```text
MailGuard-AI/
├── frontend/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── favicon.svg
├── model/
│   └── spam_classifier.pkl
├── app.py
├── requirements.txt
└── README.md
```

## 🧠 Model Information

The active application uses a scikit-learn pipeline containing:

- **TF-IDF Vectorizer:** extracts numerical text features using word unigrams and bigrams.
- **Multinomial Naive Bayes:** predicts whether an email is spam or ham.
- **Probability output:** provides the model's estimated spam probability.

The model is loaded once when the Flask application starts, rather than loading a large Transformer model for each request.

### Model evaluation

The notebook's previous stratified train-test evaluation reported 99.07% accuracy for Naive Bayes. These are preliminary results from that split, not a verified estimate of performance on independently collected emails.

Further evaluation on representative, independent labelled data is needed before making strong real-world accuracy claims.

## ⚙️ Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/Aj1900sagar/MailGuard-AI.git
cd MailGuard-AI
```

### 2. Create and activate a virtual environment

```bash
python -m venv .venv
```

Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

### 3. Install dependencies

```bash
python -m pip install -r requirements.txt
```

### 4. Start the application

```bash
python app.py
```

Open `http://127.0.0.1:5000/` in your browser.

## 🔌 API Endpoints

### Health Check

**Endpoint:** `GET /health`

Checks whether the application has loaded the model.

Example response:

```json
{
  "device": "cpu",
  "model_loaded": true,
  "model_name": "TF-IDF + Multinomial Naive Bayes",
  "status": "ok"
}
```

### Predict Email

**Endpoint:** `POST /predict`

**Content-Type:** `application/json`

Example request:

```json
{
  "subject": "Congratulations! You won a prize",
  "message": "Claim your free reward now!"
}
```

Example response:

```json
{
  "prediction": "spam",
  "label": "SPAM",
  "is_spam": true,
  "spam_probability": 99.92
}
```

The probability above is illustrative. Actual predictions and probabilities depend on the submitted email.

## 🧠 How It Works

1. The user enters an email subject and message.
2. Flask validates the input.
3. The subject and message are combined into a single text input.
4. TF-IDF converts the text into numerical features.
5. Multinomial Naive Bayes predicts the email category.
6. The API returns the label and estimated spam probability.
7. The frontend displays the result.

## 🧪 Testing

Initial functional tests included spam-like promotional messages and normal professional or personal emails. The sample cases tested so far produced their expected labels.

These tests are smoke tests, not a comprehensive independent benchmark. Real-world performance can vary across email sources, writing styles, languages, and changing spam tactics.

## 🔐 Limitations and Responsible Use

- Predictions may be incorrect.
- Spam probability is a model estimate, not a guarantee.
- Do not use the prediction as the sole basis for security decisions.
- Avoid submitting confidential email content or sensitive personal information.
- Never share passwords, banking credentials, or verification codes.

## 👨‍💻 Developer

**Sagar Vishwakarma**  
B.Tech — Computer Science Engineering (AI & ML)  
KIET Deemed to be University

- GitHub: https://github.com/Aj1900sagar
- LinkedIn: https://www.linkedin.com/in/sagar-vishwarkarma1900/

⭐ If you find this project interesting, consider starring the repository!

*MailGuard AI — Lightweight machine learning for smarter email screening.*
