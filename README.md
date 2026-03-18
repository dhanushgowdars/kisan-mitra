 KisanMitra – AI-Powered Farming Assistant

 Overview
KisanMitra is an AI-powered web application that helps farmers understand large agricultural documents and answer farming-related questions. It uses PDF-based context along with Google Gemini API to provide intelligent, context-aware responses.

---

 Problem Statement
- Farmers face difficulty understanding long agricultural manuals  
- Extracting useful information is time-consuming  
- Limited access to expert guidance  
- Risk of incorrect decisions due to lack of knowledge  

---

Objectives
- Build an AI chatbot focused on agriculture  
- Enable PDF-based knowledge extraction  
- Provide accurate and context-aware answers  
- Support multiple languages for better accessibility  

---

 Tech Stack

 Backend
- Python
- Flask

AI Integration
- Google Gemini API

 Data Processing
- PyPDF2 (PDF text extraction)

 Frontend
- HTML
- CSS
- JavaScript

  Tools
- Git
- GitHub

---

  Features
-  Upload agricultural PDF manuals  
-  AI-based question answering using document context  
-  Domain-specific responses (farming only)  
-  Rejects non-agriculture questions (guardrails)  
-  Supports multiple languages  

---

 How to Run

1. Clone the Repository
```bash
git clone https://github.com/dhanushgowdars/kisan-mitra.git
cd kisan-mitra
2. Install Dependencies
pip install -r requirements.txt
3. Setup API Key

Create a .env file in the root directory and add:

GEMINI_API_KEY=your_api_key_here
4. Run the Application
python app.py

 Note on API Key

This project requires a Google Gemini API key.
The key is not included in the repository for security reasons.

 Expected Outcome

Helps farmers quickly understand complex documents

Provides fast and relevant agricultural advice

Improves decision-making and productivity

 Key Highlights

Context-aware AI using uploaded PDF

Smart guardrails to restrict non-relevant queries

Real-world problem-solving application

 Author

Dhanush R S
GitHub: https://github.com/dhanushgowdars
