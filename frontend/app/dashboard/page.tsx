'use client'

import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { format } from 'date-fns';
import axios from 'axios';

type Detection = {
  id: string;
  brand_id: string;
  website_id: string;
  detection_type: string;
  confidence: number;
  status: string;
  created_at: string;
  url: string;
  domain: string;
};

type Evidence = {
  type: string;
  description: string;
  file_path: string;
  metadata: any;
};

type EvidenceByType = {
  [key: string]: Evidence;
};

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [selectedDetection, setSelectedDetection] = useState<Detection | null>(null);
  const [evidence, setEvidence] = useState<EvidenceByType | null>(null);
  const [evidenceLoading, setEvidenceLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('text');
  
  // Fetch flagged sites on load
  useEffect(() => {
    const fetchFlaggedSites = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (statusFilter) {
          params.append('status', statusFilter);
        }
        
        const response = await axios.get(`/api/detections/flagged?${params.toString()}`);
        setDetections(response.data.detections || []);
      } catch (error) {
        console.error('Error fetching flagged sites:', error);
      }
      setLoading(false);
    };
    
    fetchFlaggedSites();
  }, [statusFilter]);
  
  // Fetch evidence when a detection is selected
  const fetchEvidence = async (detection: Detection) => {
    setSelectedDetection(detection);
    setEvidence(null);
    setEvidenceLoading(true);
    
    try {
      const response = await axios.get(`/api/detections/${detection.id}/evidence`);
      setEvidence(response.data.evidence || {});
      
      // Set active tab based on available evidence
      if (response.data.evidence) {
        const evidenceTypes = Object.keys(response.data.evidence);
        if (evidenceTypes.length > 0) {
          setActiveTab(evidenceTypes[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching evidence:', error);
    }
    
    setEvidenceLoading(false);
  };
  
  // Update detection status
  const updateStatus = async (detectionId: string, status: string) => {
    try {
      await axios.put(`/api/detections/${detectionId}`, { status });
      
      // Update local state
      setDetections(detections.map(detection => 
        detection.id === detectionId ? { ...detection, status } : detection
      ));
      
      if (selectedDetection?.id === detectionId) {
        setSelectedDetection({ ...selectedDetection, status });
      }
    } catch (error) {
      console.error('Error updating detection status:', error);
    }
  };
  
  // Render confidence badge
  const ConfidenceBadge = ({ score }: { score: number }) => {
    let color = 'bg-green-100 text-green-800';
    if (score > 0.7) color = 'bg-red-100 text-red-800';
    else if (score > 0.4) color = 'bg-yellow-100 text-yellow-800';
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${color}`}>
        {Math.round(score * 100)}%
      </span>
    );
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header activeSection="dashboard" />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Brand Protection Dashboard</h1>
        
        <div className="mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setStatusFilter(null)}
              className={`px-3 py-1.5 rounded text-sm ${
                statusFilter === null 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('new')}
              className={`px-3 py-1.5 rounded text-sm ${
                statusFilter === 'new' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              New
            </button>
            <button
              onClick={() => setStatusFilter('confirmed')}
              className={`px-3 py-1.5 rounded text-sm ${
                statusFilter === 'confirmed' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Confirmed
            </button>
            <button
              onClick={() => setStatusFilter('dismissed')}
              className={`px-3 py-1.5 rounded text-sm ${
                statusFilter === 'dismissed' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Dismissed
            </button>
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Flagged Sites Table */}
          <div className="lg:w-1/2">
            <h2 className="text-xl font-semibold mb-4">Flagged Sites</h2>
            
            {loading ? (
              <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
              </div>
            ) : detections.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                No flagged sites detected
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Website
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Confidence
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {detections.map((detection) => (
                      <tr 
                        key={detection.id}
                        className={`cursor-pointer hover:bg-gray-50 ${selectedDetection?.id === detection.id ? 'bg-blue-50' : ''}`}
                        onClick={() => fetchEvidence(detection)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                            {detection.url}
                          </div>
                          <div className="text-sm text-gray-500">{detection.domain}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {detection.detection_type.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <ConfidenceBadge score={detection.confidence} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            detection.status === 'new' 
                              ? 'bg-blue-100 text-blue-800' 
                              : detection.status === 'confirmed' 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-gray-100 text-gray-800'
                          }`}>
                            {detection.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          {/* Evidence Panel */}
          <div className="lg:w-1/2">
            <h2 className="text-xl font-semibold mb-4">Evidence</h2>
            
            {!selectedDetection ? (
              <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                Select a site to view evidence
              </div>
            ) : evidenceLoading ? (
              <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
              </div>
            ) : !evidence || Object.keys(evidence).length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                No evidence available for this detection
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium">
                    <span className="text-gray-500">Detection in:</span> {selectedDetection.url}
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => updateStatus(selectedDetection.id, 'dismissed')}
                      className={`px-3 py-1.5 rounded text-sm ${
                        selectedDetection.status === 'dismissed' 
                          ? 'bg-gray-200 text-gray-700'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Dismiss
                    </button>
                    <button
                      onClick={() => updateStatus(selectedDetection.id, 'confirmed')}
                      className={`px-3 py-1.5 rounded text-sm ${
                        selectedDetection.status === 'confirmed'
                          ? 'bg-red-500 text-white'
                          : 'bg-red-100 text-red-600 hover:bg-red-200'
                      }`}
                    >
                      Confirm
                    </button>
                  </div>
                </div>
                
                {/* Evidence Tabs */}
                <div className="mt-4">
                  <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-6">
                      {Object.keys(evidence).map((type) => (
                        <button
                          key={type}
                          onClick={() => setActiveTab(type)}
                          className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === type
                              ? 'border-primary-600 text-primary-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          {type.replace('_', ' ')}
                        </button>
                      ))}
                    </nav>
                  </div>
                  
                  {/* Text Similarity Evidence */}
                  {activeTab === 'text' && evidence.text && (
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-900 mb-2">Text Analysis</h4>
                      
                      {evidence.text.metadata?.findings && (
                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Findings</h5>
                          <ul className="list-disc pl-5 space-y-1">
                            {evidence.text.metadata.findings.map((finding: string, idx: number) => (
                              <li key={idx} className="text-sm text-gray-600">{finding}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {evidence.text.metadata?.highlighted_text && (
                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Matched Content</h5>
                          <div 
                            className="bg-white p-3 rounded border border-gray-200 text-sm text-gray-700 overflow-auto max-h-96"
                            dangerouslySetInnerHTML={{ 
                              __html: evidence.text.metadata.highlighted_text 
                            }} 
                          />
                        </div>
                      )}
                      
                      {evidence.text.metadata?.analysis && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Analysis</h5>
                          <p className="text-sm text-gray-600">{evidence.text.metadata.analysis}</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Image Match Evidence */}
                  {activeTab === 'image' && evidence.image && (
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-900 mb-2">Image Analysis</h4>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Original Image</h5>
                          <img 
                            src={evidence.image.metadata?.original_image_url} 
                            alt="Original"
                            className="w-full h-auto border border-gray-200 rounded"
                          />
                        </div>
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Detected Image</h5>
                          <img 
                            src={evidence.image.metadata?.detected_image_url} 
                            alt="Detected"
                            className="w-full h-auto border border-gray-200 rounded"
                          />
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Similarity Score</h5>
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-4">
                            <div 
                              className="bg-primary-600 h-4 rounded-full" 
                              style={{ width: `${(evidence.image.metadata?.score || 0) * 100}%` }}
                            ></div>
                          </div>
                          <span className="ml-2 text-sm text-gray-700">
                            {Math.round((evidence.image.metadata?.score || 0) * 100)}%
                          </span>
                        </div>
                      </div>
                      
                      {evidence.image.metadata?.analysis && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Analysis</h5>
                          <p className="text-sm text-gray-600">{evidence.image.metadata.analysis}</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* HTML Similarity Evidence */}
                  {activeTab === 'html' && evidence.html && (
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-900 mb-2">HTML Structure Similarity</h4>
                      
                      <div className="mb-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Similarity Score</h5>
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-4">
                            <div 
                              className="bg-primary-600 h-4 rounded-full" 
                              style={{ width: `${(evidence.html.metadata?.score || 0) * 100}%` }}
                            ></div>
                          </div>
                          <span className="ml-2 text-sm text-gray-700">
                            {Math.round((evidence.html.metadata?.score || 0) * 100)}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Original Site</h5>
                          <img 
                            src={evidence.html.metadata?.original_screenshot_url} 
                            alt="Original Site"
                            className="w-full h-auto border border-gray-200 rounded"
                          />
                        </div>
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Suspected Site</h5>
                          <img 
                            src={evidence.html.metadata?.suspected_screenshot_url} 
                            alt="Suspected Site"
                            className="w-full h-auto border border-gray-200 rounded"
                          />
                        </div>
                      </div>
                      
                      {evidence.html.metadata?.analysis && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Analysis</h5>
                          <p className="text-sm text-gray-600">{evidence.html.metadata.analysis}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
