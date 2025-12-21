import firebase_admin
from firebase_admin import credentials, firestore, storage
from config import settings
from typing import Dict, Any, Optional
import json
from datetime import datetime

class FirebaseService:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(FirebaseService, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
            
        try:
            # Initialize Firebase Admin SDK
            if not firebase_admin._apps:
                cred = credentials.ApplicationDefault()
                firebase_admin.initialize_app(cred, {
                    'projectId': settings.firebase_project_id,
                    'storageBucket': settings.firebase_storage_bucket
                })
            
            self.db = firestore.client()
            self.bucket = storage.bucket()
            self._initialized = True
            print("[OK] Firebase initialized successfully")
        except Exception as e:
            print(f"[WARNING] Firebase initialization warning: {e}")
            print("Note: Firebase will work when proper credentials are configured")
            self.db = None
            self.bucket = None
    
    async def save_user_session(self, user_id: str, session_data: Dict[str, Any]) -> bool:
        """Save user session data to Firestore"""
        try:
            if not self.db:
                return False
                
            session_data['updated_at'] = datetime.utcnow()
            self.db.collection('user_sessions').document(user_id).set(session_data, merge=True)
            return True
        except Exception as e:
            print(f"Error saving user session: {e}")
            return False
    
    async def get_user_session(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve user session data from Firestore"""
        try:
            if not self.db:
                return None
                
            doc = self.db.collection('user_sessions').document(user_id).get()
            return doc.to_dict() if doc.exists else None
        except Exception as e:
            print(f"Error getting user session: {e}")
            return None
    
    async def save_chat_history(self, user_id: str, message: Dict[str, Any]) -> bool:
        """Save chat message to user's history"""
        try:
            if not self.db:
                return False
                
            message['timestamp'] = datetime.utcnow()
            self.db.collection('chat_history').document(user_id).collection('messages').add(message)
            return True
        except Exception as e:
            print(f"Error saving chat history: {e}")
            return False
    
    async def get_chat_history(self, user_id: str, limit: int = 50) -> list:
        """Retrieve user's chat history"""
        try:
            if not self.db:
                return []
                
            messages = (
                self.db.collection('chat_history')
                .document(user_id)
                .collection('messages')
                .order_by('timestamp', direction=firestore.Query.DESCENDING)
                .limit(limit)
                .stream()
            )
            return [msg.to_dict() for msg in messages]
        except Exception as e:
            print(f"Error getting chat history: {e}")
            return []
    
    async def upload_pdf(self, user_id: str, file_content: bytes, filename: str) -> Optional[str]:
        """Upload PDF to Firebase Storage and return download URL"""
        try:
            if not self.bucket:
                return None
                
            blob_path = f"documents/{user_id}/{filename}"
            blob = self.bucket.blob(blob_path)
            blob.upload_from_string(file_content, content_type='application/pdf')
            blob.make_public()
            return blob.public_url
        except Exception as e:
            print(f"Error uploading PDF: {e}")
            return None

# Singleton instance
firebase_service = FirebaseService()
