
from pathlib import Path

import joblib
from flask import Flask, jsonify, request, send_from_directory

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "model" / "spam_classifier.pkl"
FRONTEND_DIR = BASE_DIR / "frontend"

app = Flask(__name__)

# Load the lightweight ML pipeline once at startup
model = joblib.load(MODEL_PATH)

# Identify the spam class index
classes = [str(label).lower() for label in model.classes_]

if "spam" not in classes:
    raise ValueError("Spam class not found in the trained model.")

SPAM_CLASS_INDEX = classes.index("spam")


@app.route("/", methods=["GET"])
def home():
    return send_from_directory(FRONTEND_DIR, "index.html")


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "model_loaded": model is not None,
        "model_name": "TF-IDF + Multinomial Naive Bayes",
        "device": "cpu",
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

    email_text = f"Subject: {subject}\n\nMessage: {message}"

    try:
        prediction = str(model.predict([email_text])[0]).lower()

        probabilities = model.predict_proba([email_text])[0]
        spam_probability = float(probabilities[SPAM_CLASS_INDEX])

        is_spam = prediction == "spam"

        return jsonify({
            "prediction": prediction,
            "label": "SPAM" if is_spam else "NOT SPAM",
            "is_spam": is_spam,
            "spam_probability": round(spam_probability * 100, 2),
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
