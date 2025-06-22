import React, { useState } from 'react';
import { extractMessage } from '../api'; 



function Extract() {
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      setError('Please select an image');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await extractMessage(image);
      setMessage(data.message);
      
    } catch (err) {
      setError('Failed to extract message. ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setError('');
    setMessage(''); // Clear previous message when new image is selected
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Extract Hidden Message
          </h1>
          <p className="text-slate-300 text-lg">
            Reveal secret messages hidden within steganographic images
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl p-8">
          <div className="space-y-6">
            {/* File Upload Section */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-white mb-3">
                Select Steganographic Image
              </label>
              <div className="relative">
                <input
                  id="extract-file-upload"
                  type="file"
                  onChange={handleImageChange}
                  accept="image/*"
                  required
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="bg-slate-800/50 border-2 border-dashed border-purple-400/50 rounded-xl p-8 text-center hover:border-purple-400 transition-all duration-300 hover:bg-slate-800/70">
                  <div className="flex flex-col items-center space-y-3">
                    <svg className="w-12 h-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <div className="text-white">
                      <p className="text-lg font-medium">
                        {image ? image.name : 'Click to upload steganographic image'}
                      </p>
                      <p className="text-sm text-slate-400 mt-1">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Extract Button */}
            <button
              onClick={handleSubmit}
              disabled={loading || !image}
              className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Extracting...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>Extract Message</span>
                </div>
              )}
            </button>

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

          {/* Hidden Message Result */}
          {message && (
            <div className="mt-8 p-6 bg-green-500/20 border border-green-500/50 rounded-xl">
              <div className="flex items-center space-x-2 mb-4">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-xl font-bold text-green-200">Hidden Message Found!</h3>
              </div>
              
              <div className="bg-slate-800/30 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-slate-300 mb-2">Extracted Message:</h4>
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-600">
                  <p className="text-white text-lg font-mono break-words">{message}</p>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                  <span>{message.length} characters extracted</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(message)}
                    className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors duration-200"
                  >
                    Copy to Clipboard
                  </button>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-slate-800/30 rounded-lg">
                <p className="text-xs text-slate-400">
                  🔍 Successfully extracted hidden message using LSB steganography analysis.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-8 text-center">
          <p className="text-slate-400 text-sm">
            Upload a steganographic image to reveal any hidden messages embedded within its pixels.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Extract;