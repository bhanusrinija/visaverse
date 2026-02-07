from services.gemini_service import gemini_service
from services.firebase_service import firebase_service
from models.document import DocumentAnalysisResponse
import PyPDF2
from io import BytesIO
from typing import List
import re

class DocumentService:
    
    async def analyze_document(
        self, 
        file_content: bytes, 
        filename: str,
        user_id: str = "anonymous",
        document_type: str = "visa"
    ) -> DocumentAnalysisResponse:
        """Upload PDF, extract text, and analyze using AI"""
        
        try:
            # Extract text from PDF (for fallback/logging purposes, but don't fail here)
            text = self._extract_pdf_text(file_content)
            
            # Note: We used to fail here if text was empty, but now we let AI try multimodal analysis
            # which works even for image-only PDFs/images.
            
            # Upload to Firebase Storage
            document_url = await firebase_service.upload_pdf(user_id, file_content, filename)
            
            # Analyze with AI (Multimodal)
            analysis = await self._analyze_with_ai(file_content, filename, document_type)
            
            return DocumentAnalysisResponse(
                document_url=document_url,
                **analysis
            )
            
        except Exception as e:
            print(f"Error analyzing document: {e}")
            return DocumentAnalysisResponse(
                document_url=None,
                summary="Error processing document",
                key_points=[str(e)],
                important_dates=[],
                missing_info=[],
                simplified_explanation="An error occurred while processing your document.",
                document_type=document_type
            )
    
    def _extract_pdf_text(self, file_content: bytes) -> str:
        """Extract text from PDF using PyPDF2"""
        try:
            pdf_file = BytesIO(file_content)
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            
            return text
        except Exception as e:
            print(f"Error extracting PDF text: {e}")
            return ""
    
    async def _analyze_with_ai(self, file_content: bytes, filename: str, document_type: str) -> dict:
        """Analyze document using Gemini AI's multimodal capabilities"""
        
        mime_type = "application/pdf"
        if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
            ext = filename.split('.')[-1].lower().replace('jpg', 'jpeg')
            mime_type = f"image/{ext}"

        prompt = f"""Analyze this {document_type} document image/PDF and provide:

1. A brief summary (2-3 sentences)
2. Key points (3-5 bullet points)
3. Important dates or deadlines (list any dates found, e.g., expiry, issue date)
4. Missing information, stamps, or signatures needed
5. Simplified explanation for someone unfamiliar with official documents

Look specifically for stamps, signatures, and official seals to verify authenticity.
Document type: {document_type}

Respond in this format:
SUMMARY: [your summary]
KEY POINTS:
- [point 1]
- [point 2]
DATES:
- [date 1]
- [date 2]
MISSING INFO:
- [item 1]
EXPLANATION: [simplified explanation]"""

        try:
            response = await gemini_service.generate_multimodal_response(prompt, file_content, mime_type, use_pro=True)
            return self._parse_analysis(response, document_type)
        except Exception as e:
            error_msg = str(e)
            print(f"Error in multimodal AI analysis: {error_msg}")
            
            # Fallback to text extraction if multimodal fails
            text = self._extract_pdf_text(file_content)
            return self._create_fallback_analysis(text, document_type)
    
    def _parse_analysis(self, response: str, doc_type: str) -> dict:
        """Parse AI response into structured format using robust regex"""
        
        try:
            # Using regex for more robust section extraction (case-insensitive, handles bolding)
            summary = self._extract_section_regex(response, r"(?i)SUMMARY[:\s]*", [r"(?i)KEY\s*POINTS", r"(?i)DATES", r"(?i)IMPORTANT\s*DATES"])
            key_points = self._extract_list_regex(response, r"(?i)KEY\s*POINTS[:\s]*", [r"(?i)DATES", r"(?i)IMPORTANT\s*DATES", r"(?i)MISSING"])
            dates = self._extract_list_regex(response, r"(?i)(?:IMPORTANT\s*)?DATES[:\s]*", [r"(?i)MISSING", r"(?i)EXPLANATION"])
            missing = self._extract_list_regex(response, r"(?i)MISSING\s*(?:INFO|INFORMATION)[:\s]*", [r"(?i)EXPLANATION", r"(?i)SUMMARY"])
            explanation = self._extract_section_regex(response, r"(?i)EXPLANATION[:\s]*", [])
            
            # Final fallback check: if everything is empty, the AI might have used a different format
            if not any([summary, key_points, dates, missing, explanation]):
                print(f"Warning: Regex parsing failed to extract sections from response: {response[:100]}...")
                # Try a super-basic split as last resort
                return {
                    "summary": response[:300] + "..." if len(response) > 300 else response,
                    "key_points": ["Review document for detailed insights"],
                    "important_dates": [],
                    "missing_info": ["Manual verification required"],
                    "simplified_explanation": "Could not parse structured analysis. Please read the summary above.",
                    "document_type": doc_type
                }

            return {
                "summary": summary or "Document analysis completed",
                "key_points": key_points or ["See document for details"],
                "important_dates": dates or [],
                "missing_info": missing or [],
                "simplified_explanation": explanation or "Please review the document carefully.",
                "document_type": doc_type
            }
        except Exception as e:
            print(f"Error parsing analysis: {e}")
            return {
                "summary": "Analysis completed (Parsing error)",
                "key_points": ["Refer to original document"],
                "important_dates": [],
                "missing_info": [],
                "simplified_explanation": response[:500] if response else "Error parsing AI response.",
                "document_type": doc_type
            }
    
    def _extract_section_regex(self, text: str, start_pattern: str, end_patterns: List[str]) -> str:
        """Extract text section using regex patterns"""
        start_match = re.search(start_pattern, text)
        if not start_match:
            return ""
        
        start_idx = start_match.end()
        end_idx = len(text)
        
        for end_pattern in end_patterns:
            end_match = re.search(end_pattern, text[start_idx:])
            if end_match:
                possible_end = start_idx + end_match.start()
                if possible_end < end_idx:
                    end_idx = possible_end
                    break
        
        return text[start_idx:end_idx].strip().strip('*#-_ \n')
    
    def _extract_list_regex(self, text: str, start_pattern: str, end_patterns: List[str]) -> List[str]:
        """Extract bullet list from section using regex"""
        section = self._extract_section_regex(text, start_pattern, end_patterns)
        if not section:
            return []

        # Extract lines starting with bullet points or numbers
        lines = section.split('\n')
        items = []
        for line in lines:
            line = line.strip().strip('*#-_ ')
            if not line:
                continue
            
            # Check if it looks like a new item (starts with - or number.)
            # or if it's the first line of the section (might not have bullet)
            match = re.match(r'^[\d\.\-\•\*\s]+(.*)', line)
            if match:
                content = match.group(1).strip()
                if content:
                    items.append(content)
            elif not items and line: # First line without bullet
                items.append(line)
            elif items: # Continuation
                items[-1] += " " + line

        return items[:10]

    def _create_fallback_analysis(self, text: str, document_type: str) -> dict:
        """Create basic analysis when AI is unavailable (quota exceeded)"""

        # Extract dates using regex patterns
        date_patterns = [
            r'\d{1,2}[/-]\d{1,2}[/-]\d{2,4}',  # MM/DD/YYYY, DD-MM-YYYY
            r'\d{4}[/-]\d{1,2}[/-]\d{1,2}',    # YYYY-MM-DD
            r'(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4}',  # Month DD, YYYY
            r'\d{1,2} (?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{4}'     # DD Month YYYY
        ]

        dates_found = []
        for pattern in date_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            dates_found.extend(matches)

        # Remove duplicates and limit to 5 dates
        dates_found = list(dict.fromkeys(dates_found))[:5]

        # Extract key sections/headings (lines in all caps or with colons)
        key_points = []
        lines = text.split('\n')
        for line in lines[:50]:  # Check first 50 lines
            line = line.strip()
            if len(line) > 10 and len(line) < 100:
                if line.isupper() or (': ' in line and len(line.split(': ')[0]) < 30):
                    key_points.append(line)
                    if len(key_points) >= 5:
                        break

        # If no headings found, use first few sentences
        if not key_points:
            sentences = text.replace('\n', ' ')[:500].split('. ')
            key_points = [s.strip() + '.' for s in sentences[:3] if len(s.strip()) > 20]

        # Document type specific tips
        missing_info = []
        explanation = ""

        if document_type.lower() == "visa":
            missing_info = [
                "Verify all required signatures are present",
                "Check visa validity dates",
                "Confirm visa type matches your travel purpose",
                "Review any restrictions or conditions"
            ]
            explanation = "This appears to be a visa document. Please verify all personal information is correct, check the validity period, and understand any travel restrictions. Keep this document safe during your trip."

        elif document_type.lower() == "passport":
            missing_info = [
                "Check passport expiration date (should be valid 6+ months)",
                "Verify personal information matches other documents",
                "Look for any amendments or endorsements"
            ]
            explanation = "This appears to be a passport document. Ensure it's valid for at least 6 months beyond your travel dates. Verify all personal details are accurate."

        else:
            missing_info = [
                "Review document carefully for completeness",
                "Verify all dates and personal information",
                "Check for required signatures or stamps"
            ]
            explanation = f"This is a {document_type} document. Please review it carefully to ensure all information is accurate and complete."

        # Create summary
        word_count = len(text.split())
        summary = f"Document successfully uploaded and processed. Text extracted: approximately {word_count} words. "

        if dates_found:
            summary += f"Found {len(dates_found)} important date(s). "

        summary += "AI-powered analysis is temporarily unavailable due to high demand, but basic information has been extracted below."

        return {
            "summary": summary,
            "key_points": key_points if key_points else ["Document text extracted successfully", "Manual review recommended"],
            "important_dates": dates_found if dates_found else [],
            "missing_info": missing_info,
            "simplified_explanation": explanation,
            "document_type": document_type
        }

document_service = DocumentService()
