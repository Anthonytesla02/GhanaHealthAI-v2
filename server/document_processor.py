#!/usr/bin/env python3
"""
Document processor for Ghana Standard Treatment Guidelines.
Processes the DOCX file, chunks the content, and stores embeddings in Pinecone.
"""

import os
import sys
import json
from pathlib import Path
from typing import List, Dict, Any
import docx
from langchain.text_splitter import RecursiveCharacterTextSplitter
import hashlib
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class DocumentProcessor:
    def __init__(self):
        # Use simple TF-IDF-like approach for embeddings
        self.processed_chunks_file = os.path.join(os.path.dirname(__file__), 'processed_chunks.json')
        
        # Text splitter for chunking
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=512,
            chunk_overlap=100,
            length_function=len,
            separators=["\n\n", "\n", ". ", " ", ""]
        )

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
                
                # Detect chapter/section headers
                if any(keyword in text.lower() for keyword in ['chapter', 'section', 'introduction', 'preface']):
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
        """Split sections into smaller chunks for better retrieval."""
        chunks = []
        
        for section in sections:
            section_chunks = self.text_splitter.split_text(section['content'])
            
            for i, chunk in enumerate(section_chunks):
                chunks.append({
                    'content': chunk,
                    'title': section['title'],
                    'section': section['title'],
                    'chunk_id': f"{len(chunks)}_{i}",
                    'type': section['type']
                })
        
        return chunks

    def generate_simple_hash(self, text: str) -> str:
        """Generate a simple hash for text similarity matching."""
        return hashlib.md5(text.encode()).hexdigest()

    def store_chunks_locally(self, chunks: List[Dict[str, Any]]) -> bool:
        """Store chunks locally in JSON format for retrieval."""
        try:
            processed_chunks = []
            for chunk in chunks:
                processed_chunk = {
                    'id': self.generate_simple_hash(chunk['content']),
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

    def extract_keywords(self, text: str) -> List[str]:
        """Extract important keywords from text for basic matching."""
        import re
        # Simple keyword extraction - remove common words and extract medical terms
        words = re.findall(r'\b[a-zA-Z]{3,}\b', text.lower())
        
        # Common medical stopwords to remove
        stopwords = {
            'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 
            'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 
            'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 
            'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use', 'with', 'this',
            'that', 'from', 'they', 'know', 'want', 'been', 'good', 'much', 'some',
            'time', 'very', 'when', 'come', 'here', 'just', 'like', 'long', 'make',
            'many', 'over', 'such', 'take', 'than', 'them', 'well', 'were'
        }
        
        keywords = [word for word in words if word not in stopwords and len(word) > 3]
        return list(set(keywords))  # Remove duplicates

    def process_document(self, file_path: str) -> bool:
        """Main processing pipeline."""
        print(f"Processing document: {file_path}")
        
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
        print("Usage: python document_processor.py <docx_file_path>")
        sys.exit(1)
    
    file_path = sys.argv[1]
    
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        sys.exit(1)
    
    processor = DocumentProcessor()
    success = processor.process_document(file_path)
    
    if success:
        print("Document processing completed successfully")
        sys.exit(0)
    else:
        print("Document processing failed")
        sys.exit(1)

if __name__ == "__main__":
    main()
