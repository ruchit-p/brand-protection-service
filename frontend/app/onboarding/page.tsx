'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import axios from 'axios';

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [input, setInput] = useState('');
  const [completed, setCompleted] = useState(false);
  const [brandData, setBrandData] = useState<any>(null);
  
  // Start a new onboarding session
  useEffect(() => {
    const startSession = async () => {
      setLoading(true);
      try {
        const response = await axios.post('/api/onboarding/start');
        setSessionId(response.data.session_id);
        setMessages([{
          role: 'assistant',
          content: 'Welcome! I\'ll help you set up brand protection. Let\'s start with your brand name.'
        }]);
      } catch (error) {
        console.error('Error starting session:', error);
        setMessages([{
          role: 'assistant',
          content: 'Sorry, there was an error starting the onboarding process. Please try again later.'
        }]);
      }
      setLoading(false);
    };
    
    startSession();
  }, []);
  
  // Send a message to the onboarding agent
  const sendMessage = async () => {
    if (!input.trim() || !sessionId) return;
    
    const userMessage = input;
    setInput('');
    setLoading(true);
    
    try {
      const response = await axios.post(`/api/onboarding/message/${sessionId}`, {
        message: userMessage
      });
      
      setMessages([...messages, 
        { role: 'user', content: userMessage },
        { role: 'assistant', content: response.data.message }
      ]);
      
      // Check if onboarding is complete
      if (response.data.completed) {
        setCompleted(true);
        setBrandData(response.data.brand_data);
        
        // Redirect to logo upload page
        setTimeout(() => {
          router.push(`/onboarding/logo-upload?session=${sessionId}&brand=${response.data.brand_data.brand_id || ''}`);
        }, 3000);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages([...messages, 
        { role: 'user', content: userMessage },
        { role: 'assistant', content: 'Sorry, there was an error processing your message. Please try again.' }
      ]);
    }
    
    setLoading(false);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header activeSection="onboarding" />
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6">Brand Protection Setup</h1>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6 h-[500px] overflow-y-auto">
            {messages.map((msg, index) => (
              <div key={index} className={`mb-4 ${msg.role === 'user' ? 'text-right' : ''}`}>
                <div className={`inline-block p-3 rounded-lg max-w-[80%] ${
                  msg.role === 'user' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-200 text-gray-800'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-center items-center p-3">
                <div className="animate-pulse text-gray-500">Thinking...</div>
              </div>
            )}
          </div>
          
          <div className="flex space-x-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              disabled={loading || completed}
              placeholder="Type your message..."
              className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <button
              onClick={sendMessage}
              disabled={loading || completed}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 hover:bg-primary-700 transition-colors"
            >
              Send
            </button>
          </div>
          
          {completed && (
            <div className="mt-4 p-4 bg-green-100 text-green-800 rounded-lg">
              <p className="font-medium">Onboarding completed successfully!</p>
              <p>You'll be redirected to the logo upload page in a moment...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
