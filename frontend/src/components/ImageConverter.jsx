import React, { useState, useRef } from 'react';
import { Upload, Download, Image, Loader2, CheckCircle, AlertCircle, X } from 'lucide-react';

const ImageConverter = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [operation, setOperation] = useState('cpng');
    const [isProcessing, setIsProcessing] = useState(false);
    const [processedImage, setProcessedImage] = useState(null);
    const [error, setError] = useState('');
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    const operations = [
        { value: 'cpng', label: 'Convert to PNG', description: 'Best for images with transparency' },
        { value: 'cjpg', label: 'Convert to JPG', description: 'Best for photos, smaller file size' },
        { value: 'cwebp', label: 'Convert to WebP', description: 'Modern format, excellent compression' },
        { value: 'cgray', label: 'Convert to Grayscale', description: 'Black and white image' }
    ];

    const allowedExtensions = ['png', 'webp', 'jpg', 'jpeg', 'gif'];

    const isAllowedFile = (file) => {
        const extension = file.name.split('.').pop().toLowerCase();
        return allowedExtensions.includes(extension);
    };

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

        const files = e.dataTransfer.files;
        if (files && files[0]) {
            handleFile(files[0]);
        }
    };

    const handleFile = (file) => {
        setError('');
        setProcessedImage(null);

        if (!isAllowedFile(file)) {
            setError('Please select a valid image file (PNG, JPG, JPEG, WebP, or GIF)');
            return;
        }

        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            setError('File size must be less than 10MB');
            return;
        }

        setSelectedFile(file);
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFile(file);
        }
    };

    const processImage = async () => {
        if (!selectedFile) return;

        setIsProcessing(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('operation', operation);

            const response = await fetch('https://stegsecrets.onrender.com/api/convert', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (result.success) {
                setProcessedImage({
                    dataUrl: result.image_data,
                    filename: result.filename,
                    operation: operations.find(op => op.value === operation).label
                });
            } else {
                setError(result.error || 'Failed to process image');
            }

        } catch (err) {
            setError('Failed to connect to server. Make sure your Flask app is running on port 5001.');
        } finally {
            setIsProcessing(false);
        }
    };

    const downloadImage = () => {
        if (!processedImage) return;

        const link = document.createElement('a');
        link.download = processedImage.filename;
        link.href = processedImage.dataUrl;
        link.click();
    };

    const resetAll = () => {
        setSelectedFile(null);
        setProcessedImage(null);
        setError('');
        setIsProcessing(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">
                        Image Format Converter
                    </h1>
                    <p className="text-gray-600">
                        Convert your images to PNG, JPG, WebP, or Grayscale with ease
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {/* File Upload Area */}
                    <div className="mb-8">
                        <label className="block text-sm font-medium text-gray-700 mb-4">
                            Select Image File
                        </label>

                        <div
                            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${dragActive
                                ? 'border-blue-400 bg-blue-50'
                                : selectedFile
                                    ? 'border-green-400 bg-green-50'
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
                                accept=".png,.jpg,.jpeg,.webp,.gif"
                                onChange={handleFileSelect}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />

                            {selectedFile ? (
                                <div className="space-y-3">
                                    <CheckCircle className="w-12 h-12 mx-auto text-green-500" />
                                    <div>
                                        <p className="text-lg font-medium text-gray-700">
                                            {selectedFile.name}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </div>
                                    <button
                                        onClick={resetAll}
                                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                                    >
                                        Remove file
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <Upload className="w-12 h-12 mx-auto text-gray-400" />
                                    <div>
                                        <p className="text-lg font-medium text-gray-700">
                                            Drop your image here or click to browse
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Supports PNG, JPG, JPEG, WebP, and GIF files (max 10MB)
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Operation Selection */}
                    {selectedFile && (
                        <div className="mb-8">
                            <label className="block text-sm font-medium text-gray-700 mb-4">
                                Choose Conversion Type
                            </label>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {operations.map((op) => (
                                    <div
                                        key={op.value}
                                        className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${operation === op.value
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        onClick={() => setOperation(op.value)}
                                    >
                                        <input
                                            type="radio"
                                            name="operation"
                                            value={op.value}
                                            checked={operation === op.value}
                                            onChange={() => setOperation(op.value)}
                                            className="absolute top-4 right-4"
                                        />
                                        <div>
                                            <h3 className="font-medium text-gray-800">{op.label}</h3>
                                            <p className="text-sm text-gray-600 mt-1">{op.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                            <p className="text-red-700">{error}</p>
                            <button
                                onClick={() => setError('')}
                                className="ml-auto text-red-500 hover:text-red-700"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* Process Button */}
                    {selectedFile && !processedImage && (
                        <div className="mb-8">
                            <button
                                onClick={processImage}
                                disabled={isProcessing}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        <Image className="w-5 h-5" />
                                        <span>Convert Image</span>
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {/* Result */}
                    {processedImage && (
                        <div className="bg-gray-50 rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-800">
                                    Conversion Complete!
                                </h3>
                                <CheckCircle className="w-6 h-6 text-green-500" />
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-medium text-gray-700 mb-2">Original</h4>
                                    <div className="aspect-video bg-white rounded-lg flex items-center justify-center">
                                        <img
                                            src={URL.createObjectURL(selectedFile)}
                                            alt="Original"
                                            className="max-w-full max-h-full object-contain rounded-lg"
                                        />
                                    </div>
                                    <p className="text-sm text-gray-600 mt-2">{selectedFile.name}</p>
                                </div>

                                <div>
                                    <h4 className="font-medium text-gray-700 mb-2">Converted</h4>
                                    <div className="aspect-video bg-white rounded-lg flex items-center justify-center">
                                        <img
                                            src={processedImage.dataUrl}
                                            alt="Converted"
                                            className="max-w-full max-h-full object-contain rounded-lg"
                                        />
                                    </div>
                                    <p className="text-sm text-gray-600 mt-2">{processedImage.filename}</p>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 mt-6">
                                <button
                                    onClick={downloadImage}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                                >
                                    <Download className="w-5 h-5" />
                                    <span>Download Converted Image</span>
                                </button>

                                <button
                                    onClick={resetAll}
                                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
                                >
                                    Convert Another Image
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="text-center mt-8 text-gray-600">
                    <p className="text-sm">
                        Supports PNG, JPG, JPEG, WebP, and GIF formats • Maximum file size: 10MB
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ImageConverter;