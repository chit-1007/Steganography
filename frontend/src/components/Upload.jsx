import React, { useState } from 'react';
import { hideMessage } from '../api';


const Upload = () => {
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image || !message) {
      setError('Please select an image and enter a message');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await hideMessage(image, message);
      setResult(data);
    } catch (err) {
      setError('Failed to hide message. ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            LSB Image Steganography
          </h1>
          <p className="text-slate-300 text-lg">
            Hide secret messages within images using Least Significant Bit encoding
          </p>
        </div>


        {/* Main Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl p-8">
          <div className="space-y-6">
            {/* File Upload Section */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-white mb-3">
                Select Cover Image
              </label>
              <div className="relative">
                <input
                  id="file-upload"
                  type="file"
                  onChange={handleImageChange}
                  accept="image/*"
                  required
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="bg-slate-800/50 border-2 border-dashed border-purple-400/50 rounded-xl p-8 text-center hover:border-purple-400 transition-all duration-300 hover:bg-slate-800/70">
                  <div className="flex flex-col items-center space-y-3">
                    <svg className="w-12 h-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div className="text-white">
                      <p className="text-lg font-medium">
                        {image ? image.name : 'Click to upload an image'}
                      </p>
                      <p className="text-sm text-slate-400 mt-1">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>


            {/* Message Input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-white mb-3">
                Secret Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your secret message here..."
                required
                rows={4}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 resize-none"
              />
              <p className="text-xs text-slate-400 mt-1">
                {message.length} characters
              </p>
            </div>


            {/* Action Buttons */}
            <div className="flex flex-col space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
                onClick={handleSubmit}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 0h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>Hide Message</span>
                  </div>
                )}
              </button>


              {/* Image Converter Button */}
              <button
                type="button"
                onClick={() => window.location.href = '/image-converter'}
                className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg border border-blue-500/30"
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Convert Image Format</span>
                </div>
              </button>
            </div>


            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              </div>
            )}
          </div>


          {/* Results Section */}
          {result && (
            <div className="mt-8 p-6 bg-green-500/20 border border-green-500/50 rounded-xl">
              <div className="flex items-center space-x-2 mb-4">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-xl font-bold text-green-200">Success!</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                  <span className="text-slate-300">Original Image:</span>
                  <a
                    href={`http://localhost:5000${result.original}`}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors duration-200"
                  >
                    View Original
                  </a>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                  <span className="text-slate-300">Steganographic Image:</span>
                  <a
                    href={`http://localhost:5000${result.stego}`}
                    download
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors duration-200"
                  >
                    Download Stego
                  </a>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-slate-800/30 rounded-lg">
                <p className="text-xs text-slate-400">
                  💡 Your secret message has been successfully embedded using LSB steganography. 
                  The steganographic image appears identical to the original but contains your hidden message.
                </p>
              </div>
            </div>
          )}
        </div>


        {/* Info Section */}
        <div className="mt-8 text-center">
          <p className="text-slate-400 text-sm">
            LSB Steganography hides data in the least significant bits of image pixels, 
            making changes imperceptible to the human eye.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Upload;