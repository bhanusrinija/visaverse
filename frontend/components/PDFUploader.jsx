'use client';

import { useState } from 'react';
import { Upload, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { documentAPI } from '@/lib/api';

export default function PDFUploader() {
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type === 'application/pdf') {
            setFile(selectedFile);
            setError(null);
            setAnalysis(null);
        } else {
            setError('Please select a valid PDF file');
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsUploading(true);
        setError(null);

        try {
            console.log('Starting document upload...', file.name);
            const result = await documentAPI.analyze(file, 'user123', 'visa');
            console.log('Document analysis result:', result);

            if (!result) {
                throw new Error('No response from server');
            }

            setAnalysis(result);
        } catch (err) {
            console.error('Upload error:', err);
            setError(`Failed to analyze document: ${err.message || 'Unknown error'}. Please check backend connection.`);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-6">
                <FileText className="w-8 h-8 text-primary-600" />
                <h2 className="text-2xl font-bold text-gray-800">Document Analysis</h2>
            </div>

            {/* Upload Area */}
            <div className="mb-6">
                <label className="block w-full">
                    <div className="border-2 border-dashed border-primary-300 bg-primary-50 rounded-lg p-8 text-center hover:border-primary-500 transition-all cursor-pointer">
                        <Upload className="w-12 h-12 mx-auto mb-4 text-primary-600" />
                        <p className="text-gray-800 mb-2 font-medium">
                            {file ? file.name : 'Click to upload PDF or drag and drop'}
                        </p>
                        <p className="text-sm text-gray-600">Visa letters, offer letters, legal documents</p>
                    </div>
                    <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                </label>

                {file && !analysis && (
                    <button
                        onClick={handleUpload}
                        className="glass-button w-full mt-4"
                        disabled={isUploading}
                    >
                        {isUploading ? (
                            <span className="flex items-center justify-center gap-2">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Analyzing Document...
                            </span>
                        ) : (
                            'Analyze Document'
                        )}
                    </button>
                )}
            </div>

            {/* Error */}
            {error && (
                <div className="bg-danger-100 border border-danger-300 rounded-lg p-4 mb-6 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-danger-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-danger-700">{error}</p>
                </div>
            )}

            {/* Analysis Results */}
            {analysis && (
                <div className="space-y-4 animate-fade-in">
                    <div className="bg-success-100 border border-success-300 rounded-lg p-4 flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-success-700 font-medium">Document analyzed successfully!</p>
                    </div>

                    <div className="bg-gray-100 rounded-lg p-4 border border-gray-300">
                        <h3 className="font-semibold text-primary-600 mb-2">Summary</h3>
                        <p className="text-sm text-gray-700 leading-relaxed">{analysis.summary}</p>
                    </div>

                    {analysis.key_points && analysis.key_points.length > 0 && (
                        <div className="bg-gray-100 rounded-lg p-4 border border-gray-300">
                            <h3 className="font-semibold text-primary-600 mb-2">Key Points</h3>
                            <ul className="space-y-2">
                                {analysis.key_points.map((point, idx) => (
                                    <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                        <span className="text-accent-600">•</span>
                                        <span>{point}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {analysis.important_dates && analysis.important_dates.length > 0 && (
                        <div className="bg-gray-100 rounded-lg p-4 border border-gray-300">
                            <h3 className="font-semibold text-accent-600 mb-2">Important Dates</h3>
                            <ul className="space-y-2">
                                {analysis.important_dates.map((date, idx) => (
                                    <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                        <span className="text-primary-600">📅</span>
                                        <span>{date}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {analysis.missing_info && analysis.missing_info.length > 0 && (
                        <div className="bg-warning-100 rounded-lg p-4 border border-warning-300">
                            <h3 className="font-semibold text-warning-700 mb-2">Action Items / Missing Info</h3>
                            <ul className="space-y-2">
                                {analysis.missing_info.map((item, idx) => (
                                    <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                        <span className="text-warning-600">⚠️</span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="bg-gray-100 rounded-lg p-4 border border-gray-300">
                        <h3 className="font-semibold text-primary-600 mb-2">Simplified Explanation</h3>
                        <p className="text-sm text-gray-700 leading-relaxed">{analysis.simplified_explanation}</p>
                    </div>

                    <button
                        onClick={() => {
                            setFile(null);
                            setAnalysis(null);
                        }}
                        className="glass-button w-full"
                    >
                        Analyze Another Document
                    </button>
                </div>
            )}
        </div>
    );
}
