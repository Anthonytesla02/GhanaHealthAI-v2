#!/usr/bin/env python3
"""
Simple document processor for Ghana Standard Treatment Guidelines.
Processes the DOCX file and creates a basic knowledge base.
"""

import os
import sys
import json
import hashlib
import re
from pathlib import Path
from typing import List, Dict, Any

try:
    import docx
except ImportError:
    print("Installing python-docx...")
    os.system("pip install python-docx")
    import docx

class SimpleDocumentProcessor:
    def __init__(self):
        self.processed_chunks_file = os.path.join(os.path.dirname(__file__), 'processed_chunks.json')

    def extract_text_from_docx(self, file_path: str) -> List[Dict[str, Any]]:
        """Extract text content from DOCX file with metadata."""
        try:
            doc = docx.Document(file_path)
            sections = []
            current_section = ""
            current_title = "Introduction"
            
            for para in doc.paragraphs:
                text = para.text.strip()
                if not text:
                    continue
                
                # Detect chapter/section headers (simple heuristic)
                if (text.startswith('Chapter') or 
                    text.startswith('CHAPTER') or
                    len(text) < 100 and 
                    any(keyword in text.upper() for keyword in ['DISORDERS', 'DISEASE', 'TREATMENT', 'CARE'])):
                    
                    if current_section:
                        sections.append({
                            'title': current_title,
                            'content': current_section.strip(),
                            'type': 'section'
                        })
                    current_title = text
                    current_section = ""
                else:
                    current_section += f"\n{text}"
            
            # Add the last section
            if current_section:
                sections.append({
                    'title': current_title,
                    'content': current_section.strip(),
                    'type': 'section'
                })
            
            return sections
            
        except Exception as e:
            print(f"Error extracting text from DOCX: {e}")
            return []

    def create_chunks(self, sections: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Split sections into smaller chunks."""
        chunks = []
        
        for section in sections:
            content = section['content']
            
            # Simple chunking by sentences (max 3-4 sentences per chunk)
            sentences = re.split(r'[.!?]+', content)
            
            chunk_size = 3  # sentences per chunk
            for i in range(0, len(sentences), chunk_size):
                chunk_sentences = sentences[i:i + chunk_size]
                chunk_text = '. '.join([s.strip() for s in chunk_sentences if s.strip()])
                
                if len(chunk_text) > 50:  # Only keep meaningful chunks
                    chunks.append({
                        'content': chunk_text + '.',
                        'title': section['title'],
                        'section': section['title'],
                        'chunk_id': f"{len(chunks)}",
                        'type': section['type']
                    })
        
        return chunks

    def extract_keywords(self, text: str) -> List[str]:
        """Extract important keywords from text."""
        words = re.findall(r'\b[a-zA-Z]{3,}\b', text.lower())
        
        # Medical stopwords to remove
        stopwords = {
            'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 
            'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 
            'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 
            'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use', 'with', 'this',
            'that', 'from', 'they', 'know', 'want', 'been', 'good', 'much', 'some',
            'time', 'very', 'when', 'come', 'here', 'just', 'like', 'long', 'make',
            'many', 'over', 'such', 'take', 'than', 'them', 'well', 'were', 'will'
        }
        
        keywords = [word for word in words if word not in stopwords and len(word) > 3]
        return list(set(keywords))[:20]  # Limit to top 20 unique keywords

    def store_chunks_locally(self, chunks: List[Dict[str, Any]]) -> bool:
        """Store chunks locally in JSON format."""
        try:
            processed_chunks = []
            for chunk in chunks:
                chunk_id = hashlib.md5(chunk['content'].encode()).hexdigest()
                processed_chunk = {
                    'id': chunk_id,
                    'content': chunk['content'],
                    'title': chunk['title'],
                    'section': chunk['section'],
                    'chunk_id': chunk['chunk_id'],
                    'type': chunk['type'],
                    'keywords': self.extract_keywords(chunk['content'])
                }
                processed_chunks.append(processed_chunk)
            
            # Save to local JSON file
            with open(self.processed_chunks_file, 'w', encoding='utf-8') as f:
                json.dump(processed_chunks, f, ensure_ascii=False, indent=2)
            
            print(f"Successfully stored {len(processed_chunks)} chunks locally")
            return True
            
        except Exception as e:
            print(f"Error storing chunks locally: {e}")
            return False

    def process_document(self, file_path: str) -> bool:
        """Main processing pipeline."""
        print(f"Processing document: {file_path}")
        
        if not os.path.exists(file_path):
            print(f"File not found: {file_path}")
            return False
        
        # Extract text from DOCX
        sections = self.extract_text_from_docx(file_path)
        if not sections:
            print("No content extracted from document")
            return False
        
        print(f"Extracted {len(sections)} sections")
        
        # Create chunks
        chunks = self.create_chunks(sections)
        print(f"Created {len(chunks)} chunks")
        
        # Store chunks locally
        success = self.store_chunks_locally(chunks)
        
        return success

def main():
    if len(sys.argv) != 2:
        print("Usage: python simple_document_processor.py <docx_file_path>")
        sys.exit(1)
    
    file_path = sys.argv[1]
    processor = SimpleDocumentProcessor()
    success = processor.process_document(file_path)
    
    if success:
        print("Document processing completed successfully")
        sys.exit(0)
    else:
        print("Document processing failed")
        sys.exit(1)

if __name__ == "__main__":
    main()