// app/test/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { checkConnection, connection } from '@/lib/carv';
import { chatWithAIKO, getWelcomeMessage } from '@/lib/ai';
import Link from 'next/link';

export default function TestPage() {
  const [carvStatus, setCarvStatus] = useState<string>('Testing...');
  const [aiStatus, setAiStatus] = useState<string>('Testing...');
  const [chatResponse, setChatResponse] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    testCarv();
    testAI();
  }, []);
  
  async function testCarv() {
    try {
      const connected = await checkConnection();
      if (connected) {
        const version = await connection.getVersion();
        setCarvStatus(`✅ SUCCESS! Version: ${JSON.stringify(version)}`);
      } else {
        setCarvStatus('❌ Connection failed');
      }
    } catch (error: any) {
      setCarvStatus(`❌ ERROR: ${error.message}`);
    }
  }
  
  async function testAI() {
    try {
      const welcome = getWelcomeMessage();
      setAiStatus(`✅ AI Ready! Preview:\n\n${welcome}`);
    } catch (error: unknown) {
      setAiStatus(`❌ ERROR: ${error.message}`);
    }
  }
  
  async function testChat() {
    setLoading(true);
    try {
      const response = await chatWithAIKO([
        { role: 'user', content: 'Hello AIKO! This is a test message.' }
      ]);
      setChatResponse(`✅ Response:\n\n${response}`);
    } catch (error: unknown) {
      setChatResponse(`❌ ERROR: ${error.message}`);
    }
    setLoading(false);
  }
  
  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-white mb-8">
          🧪 System Tests
        </h1>
        
        {/* CARV Test */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">
            1. CARV SVM Connection
          </h2>
          <pre className="bg-gray-900 p-4 rounded text-sm text-gray-300 overflow-auto">
            {carvStatus}
          </pre>
        </div>
        
        {/* AI Test */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">
            2. DeepSeek AI Integration
          </h2>
          <pre className="bg-gray-900 p-4 rounded text-sm text-gray-300 overflow-auto whitespace-pre-wrap">
            {aiStatus}
          </pre>
        </div>
        
        {/* Live Chat Test */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">
            3. Live Chat Test
          </h2>
          <button
            onClick={testChat}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg mb-4 disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Test Chat with AIKO'}
          </button>
          {chatResponse && (
            <pre className="bg-gray-900 p-4 rounded text-sm text-gray-300 overflow-auto whitespace-pre-wrap">
              {chatResponse}
            </pre>
          )}
        </div>
        
        {/* Back Link */}
        <div className="text-center">
          <Link 
            href="/"
            className="text-purple-400 hover:text-purple-300 underline"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
