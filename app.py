from pathlib import Path

import torch
from flask import Flask, jsonify, request, send_from_directory
from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
)

BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "model" / "distilbert_spam_model"
FRONTEND_DIR = BASE_DIR / "frontend"

app = Flask(__name__)

# DistilBERT runs on GPU if available, otherwise CPU
DEVICE = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)

# Load the fine-tuned model and tokenizer
tokenizer = AutoTokenizer.from_pretrained(str(MODEL_DIR))

model = AutoModelForSequenceClassification.from_pretrained(
    str(MODEL_DIR)
)

model.to(DEVICE)
model.eval()


def get_spam_class_index():
    """Find the spam class from the saved model configuration."""
    label2id = {
        str(label).lower(): int(index)
        for label, index in model.config.label2id.items()
    }

    if "spam" in label2id:
        return label2id["spam"]

    id2label = model.config.id2label

    for index, label in id2label.items():
        if str(label).lower() == "spam":
            return int(index)

    # This model was trained with 0 = ham and 1 = spam.
    return 1


SPAM_CLASS_INDEX = get_spam_class_index()


@app.route("/", methods=["GET"])
def home():
    return send_from_directory(FRONTEND_DIR, "index.html")


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "model_loaded": model is not None,
        "model_name": "DistilBERT Spam Classifier",
        "device": str(DEVICE),
    })


@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "error": "Send a valid JSON object."
        }), 400

    subject = data.get("subject", "")
    message = data.get("message", "")

    if not isinstance(subject, str) or not isinstance(message, str):
        return jsonify({
            "error": "Subject and message must be text."
        }), 400

    subject = subject.strip()
    message = message.strip()

    if not subject and not message:
        return jsonify({
            "error": "Please enter an email subject or body."
        }), 400

    if len(subject) + len(message) > 20000:
        return jsonify({
            "error": "Email text must be 20,000 characters or fewer."
        }), 413

    # Keep the subject and message format consistent with the app.
    email_text = f"Subject: {subject}\n\nMessage: {message}"

    try:
        inputs = tokenizer(
            email_text,
            return_tensors="pt",
            truncation=True,
            max_length=256,
        )

        inputs = {
            key: value.to(DEVICE)
            for key, value in inputs.items()
        }

        with torch.inference_mode():
            outputs = model(**inputs)
            probabilities = torch.softmax(
                outputs.logits, dim=-1
            )[0]

        spam_probability = float(
            probabilities[SPAM_CLASS_INDEX].item()
        )

        is_spam = spam_probability >= 0.5
        prediction = "spam" if is_spam else "ham"

        return jsonify({
            "prediction": prediction,
            "label": "SPAM" if is_spam else "NOT SPAM",
            "is_spam": is_spam,
            "spam_probability": round(
                spam_probability * 100, 2
            ),
        })

    except Exception:
        app.logger.exception("Email prediction failed")
        return jsonify({
            "error": "Prediction failed. Please try again."
        }), 500


@app.route("/<path:filename>", methods=["GET"])
def frontend_files(filename):
    return send_from_directory(FRONTEND_DIR, filename)


if __name__ == "__main__":
    app.run(debug=True)