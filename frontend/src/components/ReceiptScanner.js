import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  LoaderCircle,
  X,
  Calendar,
  DollarSign,
  Store
} from 'lucide-react';

const ReceiptScanner = ({ onScanComplete, onClose }) => {
  const [dragActive, setDragActive] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/bmp', 'image/tiff', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Please upload an image (JPG, PNG, BMP, TIFF) or PDF file.');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File too large. Maximum size is 10MB.');
      return;
    }

    setSelectedFile(file);
    setError('');
    setScanResult(null);
  };

  const scanReceipt = async () => {
    if (!selectedFile) return;

    setScanning(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch(`http://localhost:8000/receipts/scan`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to scan receipt');
      }

      const result = await response.json();
      setScanResult(result);
      
      // If successful and we have extracted data, call the callback
      if (result.confidence > 0 && !result.error) {
        onScanComplete && onScanComplete(result);
      }
    } catch (err) {
      setError(err.message || 'Failed to scan receipt. Please try again.');
    } finally {
      setScanning(false);
    }
  };

  const resetScanner = () => {
    setSelectedFile(null);
    setScanResult(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
              <Camera className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Receipt Scanner</h2>
              <p className="text-sm text-gray-500">Upload a receipt to automatically extract expense details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* File Upload Area */}
          {!selectedFile && (
            <div
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                dragActive
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              <div className="flex flex-col items-center">
                <Upload className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Drop your receipt here or click to browse
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Supports JPG, PNG, BMP, TIFF, and PDF files (max 10MB)
                </p>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                  Select File
                </button>
              </div>
            </div>
          )}

          {/* Selected File */}
          {selectedFile && !scanResult && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <FileText className="w-8 h-8 text-indigo-600" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                </div>
                <button
                  onClick={resetScanner}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={scanReceipt}
                  disabled={scanning}
                  className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {scanning ? (
                    <>
                      <LoaderCircle className="w-5 h-5 animate-spin" />
                      Scanning Receipt...
                    </>
                  ) : (
                    <>
                      <Camera className="w-5 h-5" />
                      Scan Receipt
                    </>
                  )}
                </button>
                <button
                  onClick={resetScanner}
                  disabled={scanning}
                  className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-red-900">Scanning Error</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </motion.div>
          )}

          {/* Scan Results */}
          <AnimatePresence>
            {scanResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {scanResult.error ? (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-red-900">OCR Processing Failed</p>
                        <p className="text-sm text-red-700">{scanResult.error}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-green-900">
                          Receipt Scanned Successfully
                        </p>
                        <p className="text-sm text-green-700">
                          Confidence: {scanResult.confidence}% | File: {scanResult.filename}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Extracted Data */}
                {(scanResult.amount || scanResult.merchant || scanResult.date) && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Extracted Information</h4>
                    <div className="space-y-3">
                      {scanResult.amount && (
                        <div className="flex items-center gap-3">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <div>
                            <p className="text-sm text-gray-500">Amount</p>
                            <p className="font-medium text-gray-900">${scanResult.amount}</p>
                          </div>
                        </div>
                      )}
                      
                      {scanResult.merchant && (
                        <div className="flex items-center gap-3">
                          <Store className="w-4 h-4 text-blue-600" />
                          <div>
                            <p className="text-sm text-gray-500">Merchant</p>
                            <p className="font-medium text-gray-900">{scanResult.merchant}</p>
                          </div>
                        </div>
                      )}
                      
                      {scanResult.date && (
                        <div className="flex items-center gap-3">
                          <Calendar className="w-4 h-4 text-purple-600" />
                          <div>
                            <p className="text-sm text-gray-500">Date</p>
                            <p className="font-medium text-gray-900">{scanResult.date}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Raw Text Preview */}
                {scanResult.raw_text && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">OCR Text Preview</h4>
                    <div className="bg-white p-3 rounded border border-gray-200 max-h-40 overflow-y-auto">
                      <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                        {scanResult.raw_text}
                      </pre>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      if (onScanComplete) {
                        onScanComplete(scanResult);
                        onClose();
                      }
                    }}
                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Use This Data
                  </button>
                  <button
                    onClick={resetScanner}
                    className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Scan Another
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ReceiptScanner;
