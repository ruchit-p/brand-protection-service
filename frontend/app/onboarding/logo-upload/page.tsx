'use client'

import { useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '../../components/Header';
import axios from 'axios';

export default function LogoUploadPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session');
  const brandId = searchParams.get('brand');
  
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'];
      if (!validTypes.includes(selected.type)) {
        setError('Please select a valid image file (JPEG, PNG, GIF, SVG)');
        setFile(null);
        setPreview(null);
        return;
      }
      
      // Validate file size (max 5MB)
      if (selected.size > 5 * 1024 * 1024) {
        setError('File size should be less than 5MB');
        setFile(null);
        setPreview(null);
        return;
      }
      
      setFile(selected);
      setError(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && e.target.result) {
          setPreview(e.target.result as string);
        }
      };
      reader.readAsDataURL(selected);
    }
  };
  
  const handleUpload = async () => {
    if (!file || !sessionId || !brandId) return;
    
    setLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('brand_id', brandId);
    
    try {
      const response = await axios.post(`/api/onboarding/upload/logo/${sessionId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setSuccess(true);
      
      // Redirect to dashboard after success
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
      
    } catch (err: any) {
      console.error('Error uploading logo:', err);
      setError(err.response?.data?.detail || 'Error uploading logo. Please try again.');
    }
    
    setLoading(false);
  };
  
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header activeSection="onboarding" />
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6">Upload Your Brand Logo</h1>
          
          <p className="text-gray-600 mb-8">
            Your logo will be used to detect unauthorized use across the web.
            For best results, upload a clear, high-quality image of your logo.
          </p>
          
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-6 text-center cursor-pointer hover:border-primary-500 transition-colors"
            onClick={triggerFileInput}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/gif,image/svg+xml"
              className="hidden"
            />
            
            {preview ? (
              <div className="mb-4">
                <img 
                  src={preview} 
                  alt="Logo Preview" 
                  className="max-h-64 mx-auto"
                />
              </div>
            ) : (
              <div className="text-gray-500 mb-4">
                <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <p className="text-lg font-medium">Click to upload your logo</p>
                <p className="text-sm">Or drag and drop</p>
                <p className="text-xs mt-2">JPEG, PNG, GIF, SVG (Max 5MB)</p>
              </div>
            )}
            
            {file && (
              <div className="text-sm text-gray-600">
                {file.name} ({Math.round(file.size / 1024)} KB)
              </div>
            )}
          </div>
          
          {error && (
            <div className="bg-red-100 text-red-800 p-3 rounded-lg mb-4">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 text-green-800 p-3 rounded-lg mb-4">
              <p className="font-medium">Logo uploaded successfully!</p>
              <p>Redirecting to the dashboard...</p>
            </div>
          )}
          
          <div className="flex justify-end">
            <button
              onClick={handleUpload}
              disabled={!file || loading || success}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg disabled:opacity-50 hover:bg-primary-700 transition-colors"
            >
              {loading ? 'Uploading...' : 'Complete Setup'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
