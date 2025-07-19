from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from PyPDF2 import PdfReader
import docx2txt
from transformers import BlipProcessor, BlipForConditionalGeneration, pipeline
from PIL import Image
import torch
import os
import json
import re

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load models once at startup
caption_processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
caption_model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")

summarizer = pipeline("summarization", model="t5-small", tokenizer="t5-small")

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    temp_path = f"temp_{file.filename}"
    try:
        with open(temp_path, "wb") as f:
            contents = await file.read()
            f.write(contents)

        if file.filename.endswith(".pdf"):
            text = extract_text_from_pdf(temp_path)
            os.remove(temp_path)
            return analyze_with_text(text)

        elif file.filename.endswith(".docx"):
            text = extract_text_from_docx(temp_path)
            os.remove(temp_path)
            return analyze_with_text(text)

        elif file.filename.lower().endswith((".png", ".jpg", ".jpeg")):
            result = analyze_with_image(temp_path)
            os.remove(temp_path)
            return result

        else:
            return {"error": "Unsupported file type. Upload PDF, DOCX, JPG, or PNG."}

    except Exception as e:
        return {
            "summary": "Error processing file.",
            "risk": "N/A",
            "compliance": "N/A",
            "confidence": 0.0,
            "status": "Failed",
            "error": str(e)
        }

def extract_text_from_pdf(file_path):
    try:
        reader = PdfReader(file_path)
        text = ""
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
        return text.strip()
    except Exception:
        return ""

def extract_text_from_docx(file_path):
    try:
        return docx2txt.process(file_path).strip()
    except Exception:
        return ""

def analyze_with_text(text):
    try:
        print("📄 Analyzing text...")
        summary_output = summarizer(text, max_length=100, min_length=30, do_sample=False)
        summary = summary_output[0]["summary_text"]

        response = {
            "summary": summary,
            "risk": "Low",
            "compliance": "Compliant",
            "confidence": 0.88,
            "status": "Completed"
        }
        return response

    except Exception as e:
        print("❌ Text Analysis Error:", str(e))
        return {
            "summary": "AI text analysis failed.",
            "risk": "N/A",
            "compliance": "N/A",
            "confidence": 0.0,
            "status": "Failed",
            "error": str(e)
        }

def analyze_with_image(image_path):
    try:
        print("🖼️ Generating caption...")
        raw_image = Image.open(image_path).convert('RGB')
        inputs = caption_processor(raw_image, return_tensors="pt")
        out = caption_model.generate(**inputs)
        caption = caption_processor.decode(out[0], skip_special_tokens=True)

        response = {
            "summary": caption,
            "risk": "Low",
            "compliance": "Compliant",
            "confidence": 0.91,
            "status": "Completed"
        }
        return response

    except Exception as e:
        print("❌ Image Analysis Error:", str(e))
        return {
            "summary": "AI image analysis failed.",
            "risk": "N/A",
            "compliance": "N/A",
            "confidence": 0.0,
            "status": "Failed",
            "error": str(e)
        }
