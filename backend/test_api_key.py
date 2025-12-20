"""
Quick test script to verify Gemini API key is loaded correctly
Run this from the backend directory: python test_api_key.py
"""

from dotenv import load_dotenv
import os

# Load .env file
load_dotenv()

print("=" * 50)
print("ENVIRONMENT VARIABLE TEST")
print("=" * 50)

# Check if .env file exists
env_file_path = ".env"
if os.path.exists(env_file_path):
    print(f"✅ .env file found at: {os.path.abspath(env_file_path)}")
else:
    print(f"❌ .env file NOT found at: {os.path.abspath(env_file_path)}")
    print("   Please create a .env file in the backend directory")

print()

# Check API key
api_key = os.getenv("GEMINI_API_KEY", "")
if api_key:
    # Show first and last 4 characters for security
    masked_key = f"{api_key[:8]}...{api_key[-4:]}" if len(api_key) > 12 else "***"
    print(f"✅ GEMINI_API_KEY found: {masked_key}")
    print(f"   Length: {len(api_key)} characters")
    
    # Check for common issues
    if api_key.startswith('"') or api_key.startswith("'"):
        print("   ⚠️  WARNING: API key starts with a quote - remove quotes from .env file")
    if api_key.endswith('"') or api_key.endswith("'"):
        print("   ⚠️  WARNING: API key ends with a quote - remove quotes from .env file")
    if ' ' in api_key:
        print("   ⚠️  WARNING: API key contains spaces - remove spaces from .env file")
else:
    print("❌ GEMINI_API_KEY not found or empty")
    print("   Add this line to your .env file:")
    print("   GEMINI_API_KEY=your_api_key_here")

print()

# Test Gemini API
print("=" * 50)
print("TESTING GEMINI API CONNECTION")
print("=" * 50)

if api_key:
    try:
        import google.generativeai as genai
        
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-pro')
        
        print("Sending test request to Gemini API...")
        response = model.generate_content("Say 'Hello' in one word")
        
        print(f"✅ SUCCESS! Gemini API is working!")
        print(f"   Response: {response.text}")
        
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        print()
        print("Common solutions:")
        print("1. Verify your API key is correct")
        print("2. Check if the API key is enabled in Google AI Studio")
        print("3. Make sure you have billing enabled (if required)")
        print("4. Visit: https://makersuite.google.com/app/apikey")
else:
    print("⏭️  Skipping API test - no API key found")

print()
print("=" * 50)
