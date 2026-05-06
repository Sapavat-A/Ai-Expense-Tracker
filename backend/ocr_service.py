import re
import logging
from datetime import datetime
from typing import Dict, Optional, Union
from pathlib import Path
import tempfile
import os

try:
    import pytesseract
    from PIL import Image
    from pdf2image import convert_from_path
    PYTESSERACT_AVAILABLE = True
except ImportError as e:
    PYTESSERACT_AVAILABLE = False
    logging.warning(f"OCR dependencies not available: {e}")

logger = logging.getLogger(__name__)

class ReceiptOCR:
    """OCR service for extracting data from receipts."""
    
    def __init__(self):
        self.supported_formats = {'.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.pdf'}
        
    def is_available(self) -> bool:
        """Check if OCR dependencies are available."""
        return PYTESSERACT_AVAILABLE
    
    def process_receipt(self, file_path: Union[str, Path]) -> Dict[str, Optional[str]]:
        """
        Process a receipt file and extract key information.
        
        Args:
            file_path: Path to the receipt file (image or PDF)
            
        Returns:
            Dictionary containing extracted data:
            - amount: Extracted amount as string
            - merchant: Extracted merchant name as string
            - date: Extracted date as string (YYYY-MM-DD)
            - raw_text: Full OCR text
            - confidence: Processing confidence
        """
        if not self.is_available():
            return {
                'error': 'OCR service not available. Please install required dependencies.',
                'confidence': 0
            }
        
        try:
            # Convert file to image if it's a PDF
            images = self._prepare_images(file_path)
            if not images:
                return {
                    'error': 'Could not process receipt file',
                    'confidence': 0
                }
            
            # Extract text from all images
            all_text = ""
            for image in images:
                text = pytesseract.image_to_string(image, config='--psm 6')
                all_text += text + "\n"
            
            # Extract structured data
            extracted_data = self._extract_receipt_data(all_text)
            extracted_data['raw_text'] = all_text.strip()
            extracted_data['confidence'] = self._calculate_confidence(extracted_data)
            
            logger.info(f"Successfully processed receipt: {file_path}")
            return extracted_data
            
        except Exception as e:
            logger.error(f"Error processing receipt {file_path}: {str(e)}")
            return {
                'error': f'Failed to process receipt: {str(e)}',
                'confidence': 0
            }
    
    def _prepare_images(self, file_path: Union[str, Path]) -> list:
        """Convert file to PIL Images."""
        file_path = Path(file_path)
        
        if file_path.suffix.lower() == '.pdf':
            # Convert PDF to images
            try:
                images = convert_from_path(str(file_path), dpi=200)
                return images
            except Exception as e:
                logger.error(f"Error converting PDF to images: {e}")
                return []
        else:
            # Open image file
            try:
                image = Image.open(file_path)
                # Convert to RGB if necessary
                if image.mode != 'RGB':
                    image = image.convert('RGB')
                return [image]
            except Exception as e:
                logger.error(f"Error opening image: {e}")
                return []
    
    def _extract_receipt_data(self, text: str) -> Dict[str, Optional[str]]:
        """Extract structured data from OCR text."""
        text = text.strip()
        
        # Initialize result
        data = {
            'amount': None,
            'merchant': None,
            'date': None
        }
        
        # Extract amount (look for currency symbols and decimal numbers)
        amount_patterns = [
            r'[$€£¥]\s*(\d+(?:,\d{3})*(?:\.\d{2})?)',  # $1,234.56
            r'(\d+(?:,\d{3})*(?:\.\d{2})?)\s*[$€£¥]',  # 1,234.56$
            r'Total[:\s]*[$€£¥]?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)',  # Total: $123.45
            r'Amount[:\s]*[$€£¥]?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)',  # Amount: 123.45
            r'Sum[:\s]*[$€£¥]?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)',  # Sum: 123.45
        ]
        
        for pattern in amount_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                amount_str = match.group(1).replace(',', '')
                try:
                    # Validate amount is reasonable
                    amount = float(amount_str)
                    if 0 < amount < 10000:  # Reasonable receipt amount range
                        data['amount'] = f"{amount:.2f}"
                        break
                except ValueError:
                    continue
        
        # Extract merchant name (usually at the top or in bold)
        lines = text.split('\n')
        # First few lines often contain merchant name
        for i, line in enumerate(lines[:5]):
            line = line.strip()
            if len(line) > 3 and len(line) < 50:
                # Skip lines that look like dates or amounts
                if not re.search(r'\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\$\d+|\d+\.\d{2}', line):
                    data['merchant'] = line
                    break
        
        # Extract date (various formats)
        date_patterns = [
            r'(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',  # MM/DD/YYYY or DD/MM/YYYY
            r'(\d{4}[/-]\d{1,2}[/-]\d{1,2})',  # YYYY-MM-DD
            r'(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})',  # DD Mon YYYY
        ]
        
        for pattern in date_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                date_str = match.group(1)
                # Try to normalize date format
                try:
                    # Try different date formats
                    for fmt in ['%m/%d/%Y', '%d/%m/%Y', '%Y-%m-%d', '%d %b %Y']:
                        try:
                            date_obj = datetime.strptime(date_str, fmt)
                            data['date'] = date_obj.strftime('%Y-%m-%d')
                            break
                        except ValueError:
                            continue
                    if data['date']:
                        break
                except:
                    continue
        
        return data
    
    def _calculate_confidence(self, data: Dict[str, Optional[str]]) -> float:
        """Calculate confidence score for extracted data."""
        confidence = 0.0
        
        # Amount is most important
        if data.get('amount'):
            confidence += 40
        
        # Merchant name
        if data.get('merchant'):
            confidence += 30
        
        # Date
        if data.get('date'):
            confidence += 30
        
        return min(confidence, 100.0)

# Global OCR instance
ocr_service = ReceiptOCR()

def process_receipt_file(file_path: Union[str, Path]) -> Dict[str, Optional[str]]:
    """Convenience function to process a receipt file."""
    return ocr_service.process_receipt(file_path)
