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
            # Extract text from PDF
            text = self._extract_pdf_text(file_content)
            
            if not text.strip():
                return DocumentAnalysisResponse(
                    document_url=None,
                    summary="Unable to extract text from PDF",
                    key_points=["PDF may be image-based or encrypted"],
                    important_dates=[],
                    missing_info=["Text extraction failed"],
                    simplified_explanation="This PDF could not be read. It may be scanned or protected.",
                    document_type=document_type
                )
            
            # Upload to Firebase Storage
            document_url = await firebase_service.upload_pdf(user_id, file_content, filename)
            
            # Analyze with AI
            analysis = await self._analyze_with_ai(text, document_type)
            
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
    
    async def _analyze_with_ai(self, text: str, document_type: str) -> dict:
        """Analyze document text using Gemini AI"""

        # Limit text length to avoid token limits
        text_preview = text[:4000] if len(text) > 4000 else text

        prompt = f"""Analyze this {document_type} document and provide:

1. A brief summary (2-3 sentences)
2. Key points (3-5 bullet points)
3. Important dates or deadlines (list any dates found)
4. Missing information or action items needed
5. Simplified explanation for someone unfamiliar with legal/official documents

Document text:
{text_preview}

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
            response = await gemini_service.generate_response(prompt)
            return self._parse_analysis(response, document_type)
        except Exception as e:
            error_msg = str(e)
            print(f"Error in AI analysis: {error_msg}")

            # Check if it's a quota/rate limit error
            if "quota" in error_msg.lower() or "rate" in error_msg.lower() or "429" in error_msg:
                print("Gemini API quota exceeded, using fallback analysis")
                return self._create_fallback_analysis(text_preview, document_type)

            return {
                "summary": "Document uploaded successfully",
                "key_points": ["AI analysis temporarily unavailable"],
                "important_dates": [],
                "missing_info": [],
                "simplified_explanation": "Please review the document manually.",
                "document_type": document_type
            }
    
    def _parse_analysis(self, response: str, doc_type: str) -> dict:
        """Parse AI response into structured format"""
        
        try:
            summary = self._extract_section(response, "SUMMARY:", ["KEY POINTS:", "DATES:"])
            key_points = self._extract_list(response, "KEY POINTS:", ["DATES:", "MISSING"])
            dates = self._extract_list(response, "DATES:", ["MISSING", "EXPLANATION"])
            missing = self._extract_list(response, "MISSING INFO:", ["EXPLANATION", "SUMMARY"])
            explanation = self._extract_section(response, "EXPLANATION:", [])
            
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
                "summary": response[:200],
                "key_points": ["See full response"],
                "important_dates": [],
                "missing_info": [],
                "simplified_explanation": response,
                "document_type": doc_type
            }
    
    def _extract_section(self, text: str, start_marker: str, end_markers: List[str]) -> str:
        """Extract text section between markers"""
        if start_marker not in text:
            return ""
        
        start_idx = text.index(start_marker) + len(start_marker)
        end_idx = len(text)
        
        for end_marker in end_markers:
            if end_marker in text[start_idx:]:
                end_idx = text.index(end_marker, start_idx)
                break
        
        return text[start_idx:end_idx].strip()
    
    def _extract_list(self, text: str, start_marker: str, end_markers: List[str]) -> List[str]:
        """Extract bullet list from section"""
        section = self._extract_section(text, start_marker, end_markers)
        if not section:
            return []

        # Extract lines starting with - or •
        lines = section.split('\n')
        items = []
        for line in lines:
            line = line.strip()
            if line.startswith('-') or line.startswith('•'):
                items.append(line[1:].strip())
            elif line and items:  # Continuation of previous item
                items[-1] += " " + line

        return items[:10]  # Limit to 10 items

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
