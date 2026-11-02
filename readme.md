# 🛡️ MailGuard AI — Intelligent Email Spam Detection

MailGuard AI is an AI-powered email spam detection web application that uses a fine-tuned **DistilBERT Transformer model** to classify email messages as **SPAM** or **NOT SPAM**. Built with Python, PyTorch, Hugging Face Transformers, and Flask, it provides a simple, responsive interface for analyzing email content.

## ✨ Features

- 🤖 Fine-tuned DistilBERT transformer model
- 📧 Email classification using subject and message text
- 📊 Spam probability score
- ⚡ Flask-based prediction API
- 🎨 Responsive, modern web interface
- 🔍 API health-check endpoint
- 🧠 Context-aware text classification

## 🧰 Tech Stack

| Technology | Purpose |
|---|---|
| Python | Core programming language |
| PyTorch | Deep learning framework |
| Hugging Face Transformers | Transformer model and tokenizer |
| DistilBERT | Email classification model |
| Flask | Backend and REST API |
| HTML, CSS, JavaScript | Frontend |
| Git & GitHub | Version control |

## 🏗️ Project Structure

```text
MailGuard-AI/
├── frontend/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── favicon.svg
├── model/
│   └── distilbert_spam_model/
├── app.py
├── requirements.txt
└── README.md
```

*The exact folder structure may vary slightly depending on your setup.*

## 📈 Model Performance

The fine-tuned DistilBERT model was evaluated on a held-out test dataset.

| Metric | Result |
|---|---:|
| Accuracy | 98.48% |
| Spam Precision | 94.86% |
| Spam Recall | 99.02% |
| Spam F1-score | 96.90% |

**Confusion Matrix**

| Actual / Predicted | NOT SPAM | SPAM |
|---|---:|---:|
| NOT SPAM | 639 | 11 |
| SPAM | 2 | 203 |

These metrics describe the model's performance on the evaluation dataset. Results on new emails may vary.

## ⚙️ Installation and Setup

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd MailGuard-AI
```

Replace the placeholder with your actual GitHub repository URL.

### 2. Create a virtual environment

```bash
python -m venv venv
```

Activate it on Windows:

```bash
venv\Scripts\activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

Make sure the installed PyTorch and Transformers versions are compatible with your saved model and Python environment.

### 4. Verify the model files

Ensure that the fine-tuned model and tokenizer files are present in:

```text
model/distilbert_spam_model/
```

The application needs these files to load the trained model.

### 5. Start the Flask application

```bash
python app.py
```

Open the local URL printed by Flask in your terminal, commonly:

```text
http://127.0.0.1:5000
```

## 🔌 API Endpoints

### Health Check

**Endpoint:** `GET /health`

Checks whether the application and model are loaded.

Example:

```bash
curl http://127.0.0.1:5000/health
```

### Predict Email

**Endpoint:** `POST /predict`

**Content-Type:** `application/json`

Example request:

```json
{
  "subject": "Congratulations! You won a prize",
  "message": "You have won a prize. Pay a processing fee to claim it."
}
```

Example response structure:

```json
{
  "prediction": 1,
  "label": "SPAM",
  "is_spam": true,
  "spam_probability": 98.5
}
```

The probability above is illustrative; actual values depend on the input email and model output. Confirm the exact response fields against your running application.

## 🧠 How It Works

1. The user enters an email subject and message.
2. The Flask backend receives the input.
3. The DistilBERT tokenizer converts the text into model inputs.
4. The fine-tuned model predicts the email category.
5. The application returns the predicted label and spam probability.
6. The frontend displays the result.

## 🧪 Testing

The application was manually tested using examples of:

- Lottery and prize scams
- Phishing-style messages
- Fake job offers
- Normal academic emails
- Personal emails

All five initial sample tests matched their expected labels. This is a functional smoke test, not a guarantee of performance on every email.

## 🔐 Limitations and Responsible Use

- Predictions are estimates and can be incorrect.
- Do not use model output as the sole basis for security decisions.
- Avoid submitting sensitive personal or confidential email content.
- Never share passwords, banking credentials, or verification codes.
- Model performance may change across different email styles and datasets.

## 👨‍💻 Developer

**Sagar Vishwakarma**  
B.Tech — Computer Science Engineering (AI & ML)  
KIET Deemed to be University

- GitHub: [Aj1900sagar](https://github.com/Aj1900sagar)
- LinkedIn: [Connect with me](https://www.linkedin.com/in/sagar-vishwarkarma1900/)

---

⭐ If you find this project interesting, consider starring the repository!

*MailGuard AI — Smarter email screening with Transformer-based NLP.*
## 🤖 Available Models

MailGuard AI contains two email classification models:

| Model | Purpose | Status |
|---|---|---|
| Fine-tuned DistilBERT | Context-aware email spam classification | Active model used by the Flask API |
| TF-IDF + Multinomial Naive Bayes (`spam_classifier.pkl`) | Traditional machine-learning spam classifier | Backup / legacy model |

### Active Model

The application currently loads the fine-tuned DistilBERT model and its tokenizer from `model/distilbert_spam_model/`.

### Legacy Model

The `model/spam_classifier.pkl` file contains the earlier TF-IDF and Multinomial Naive Bayes pipeline. It is retained for backup or future model comparison and is not used by the current prediction API unless explicitly loaded in the application code.