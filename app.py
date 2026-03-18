from flask import Flask, render_template, request, jsonify
import requests
import json
from PyPDF2 import PdfReader
import io
import os

# Optional (only if you install python-dotenv)
try:
    from dotenv import load_dotenv
    load_dotenv()
except:
    pass

app = Flask(__name__)

# --- CONFIGURATION ---
API_KEY = os.getenv("GEMINI_API_KEY")  # Secure way
pdf_context = ""

# --- 1. SMART MODEL FINDER ---
def get_best_model():
    if not API_KEY:
        return None

    url = f"https://generativelanguage.googleapis.com/v1beta/models?key={API_KEY}"
    try:
        response = requests.get(url)
        if response.status_code == 200:
            models = response.json().get('models', [])
            for model in models:
                if 'flash' in model['name'] and 'exp' not in model['name']:
                    return model['name']
            for model in models:
                if 'gemini' in model['name'] and 'exp' not in model['name']:
                    return model['name']
    except:
        pass

    return "models/gemini-1.5-flash"

# --- 2. CHAT FUNCTION WITH GUARDRAILS ---
def ask_google(question):
    global pdf_context

    # 🔐 API key check
    if not API_KEY:
        return "⚠️ Gemini API key not configured. Please add GEMINI_API_KEY."

    if not pdf_context:
        return "⚠️ Please upload a manual first."

    model_name = get_best_model()
    if not model_name:
        return "⚠️ Unable to load AI model."

    url = f"https://generativelanguage.googleapis.com/v1beta/{model_name}:generateContent?key={API_KEY}"

    prompt = f"""
    You are KisanMitra, an agricultural expert.
    
    MANUAL CONTEXT:
    {pdf_context[:30000]} 

    USER QUESTION: {question}

    INSTRUCTIONS:
    1. SCOPE: Answer ONLY agriculture, farming, crop, and soil related questions.
    2. REFUSAL: If the question is NOT about farming, reply EXACTLY:
       "[OUT_OF_CONTEXT] Namaste! I am KisanMitra. I can only help you with farming-related questions."
    3. ANSWERING: Use the manual first, then general knowledge if needed.
    4. LANGUAGE: Answer in the SAME LANGUAGE as the user.
    """

    payload = {"contents": [{"parts": [{"text": prompt}]}]}
    headers = {'Content-Type': 'application/json'}

    try:
        response = requests.post(url, headers=headers, data=json.dumps(payload))

        if response.status_code == 200:
            return response.json()['candidates'][0]['content']['parts'][0]['text']
        else:
            return "⚠️ AI Error. Please try again."

    except Exception as e:
        return f"⚠️ Server Error: {e}"

# --- ROUTES ---
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    global pdf_context

    if 'file' not in request.files:
        return jsonify({"status": "error", "message": "No file uploaded"})

    file = request.files['file']

    if file.filename == '':
        return jsonify({"status": "error", "message": "No file selected"})

    try:
        reader = PdfReader(file)
        text = ""

        for i, page in enumerate(reader.pages):
            if i > 60:
                break
            text += page.extract_text()

        pdf_context = text

        return jsonify({"status": "success", "message": "Manual Loaded Successfully!"})

    except:
        return jsonify({"status": "error", "message": "Corrupt PDF file"})

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get('message')

    bot_response = ask_google(user_message)

    # --- SMARTER DETECTION LOGIC ---
    is_out_of_context = False

    if "[OUT_OF_CONTEXT]" in bot_response:
        is_out_of_context = True
        bot_response = bot_response.replace("[OUT_OF_CONTEXT]", "").strip()

    elif "I can only help you with farming-related questions" in bot_response:
        is_out_of_context = True

    return jsonify({
        "response": bot_response,
        "is_out_of_context": is_out_of_context
    })

if __name__ == '__main__':
    app.run(debug=True)