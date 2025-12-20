"""
Simple script to show .env file contents (with masked API key)
"""
import os

print("=" * 60)
print("CHECKING .env FILE")
print("=" * 60)

env_path = ".env"

if os.path.exists(env_path):
    print(f"✅ File exists: {os.path.abspath(env_path)}")
    print(f"   File size: {os.path.getsize(env_path)} bytes")
    print()
    print("File contents (API key masked):")
    print("-" * 60)
    
    with open(env_path, 'r') as f:
        for line_num, line in enumerate(f, 1):
            line = line.rstrip()
            if 'GEMINI_API_KEY' in line and '=' in line:
                key, value = line.split('=', 1)
                if value:
                    masked = f"{value[:8]}...{value[-4:]}" if len(value) > 12 else "***"
                    print(f"{line_num}: {key}={masked}")
                else:
                    print(f"{line_num}: {key}= (EMPTY!)")
            else:
                print(f"{line_num}: {line}")
    
    print("-" * 60)
else:
    print(f"❌ File NOT found: {os.path.abspath(env_path)}")

print()
print("=" * 60)
print("CHECKING ENVIRONMENT VARIABLES")
print("=" * 60)

from dotenv import load_dotenv
load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    print(f"✅ GEMINI_API_KEY loaded successfully")
    print(f"   Length: {len(api_key)} characters")
    print(f"   First 8 chars: {api_key[:8]}")
    print(f"   Last 4 chars: {api_key[-4:]}")
    
    # Check for issues
    issues = []
    if api_key.startswith('"') or api_key.startswith("'"):
        issues.append("⚠️  Starts with quote")
    if api_key.endswith('"') or api_key.endswith("'"):
        issues.append("⚠️  Ends with quote")
    if ' ' in api_key:
        issues.append("⚠️  Contains spaces")
    if '\n' in api_key or '\r' in api_key:
        issues.append("⚠️  Contains newline characters")
    
    if issues:
        print()
        print("ISSUES FOUND:")
        for issue in issues:
            print(f"   {issue}")
        print()
        print("FIX: Edit .env file and make sure the line looks like:")
        print("GEMINI_API_KEY=AIzaSyBMjo9JdYjcXC3_nlOkiotehn6O8TiQrx8")
        print("(no quotes, no spaces, no extra characters)")
    else:
        print("   ✅ No formatting issues detected")
else:
    print("❌ GEMINI_API_KEY not found in environment")

print("=" * 60)
