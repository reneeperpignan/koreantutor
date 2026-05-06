import os
import re
import json
import google.generativeai as genai

def call_gemini(prompt: str) -> dict:
    genai.configure(api_key=os.environ["GEMINI_API_KEY"])
    model = genai.GenerativeModel("gemini-2.5-flash")
    response = model.generate_content(prompt)
    text = re.sub(r"```json\s*", "", response.text)
    text = re.sub(r"```\s*", "", text)
    return json.loads(text.strip())
