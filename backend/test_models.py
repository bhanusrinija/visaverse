"""
Test which Gemini models are available with your API key
"""
import google.generativeai as genai
from dotenv import load_dotenv
import os

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("❌ No API key found")
    exit(1)

print("=" * 60)
print("TESTING GEMINI API - AVAILABLE MODELS")
print("=" * 60)
print()

genai.configure(api_key=api_key)

print("Fetching available models...")
print()

try:
    models = genai.list_models()
    
    print("✅ Models available for generateContent:")
    print("-" * 60)
    
    for model in models:
        if 'generateContent' in model.supported_generation_methods:
            print(f"✓ {model.name}")
            print(f"  Display name: {model.display_name}")
            print(f"  Description: {model.description[:80]}...")
            print()
    
    print("-" * 60)
    print()
    print("Testing with gemini-1.5-flash-latest...")
    
    try:
        test_model = genai.GenerativeModel('gemini-1.5-flash-latest')
        response = test_model.generate_content("Say hello in one word")
        print(f"✅ SUCCESS! Response: {response.text}")
    except Exception as e:
        print(f"❌ Failed with gemini-1.5-flash-latest: {e}")
        print()
        print("Trying gemini-pro...")
        try:
            test_model = genai.GenerativeModel('gemini-pro')
            response = test_model.generate_content("Say hello in one word")
            print(f"✅ SUCCESS! Response: {response.text}")
        except Exception as e2:
            print(f"❌ Failed with gemini-pro: {e2}")
    
except Exception as e:
    print(f"❌ Error: {e}")

print()
print("=" * 60)
