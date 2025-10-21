// app/test-api/page.tsx
'use client';

import { useState } from 'react';
import axios from 'axios';

export default function TestAPI() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  
  const testAPI = async () => {
    setLoading(true);
    const apiKey = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY;
    
    if (!apiKey) {
      setResult('❌ API Key not found in environment!');
      setLoading(false);
      return;
    }
    
    setResult(`Testing with key: ${apiKey.substring(0, 10)}...`);
    
    try {
      const response = await axios.post(
        'https://api.deepseek.com/v1/chat/completions',
        {
          model: 'deepseek-chat',
          messages: [
            { role: 'user', content: 'Say hello!' }
          ],
          max_tokens: 50
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          }
        }
      );
      
      setResult(`✅ SUCCESS!\n\nResponse: ${response.data.choices[0].message.content}`);
    } catch (error: any) {
      setResult(`❌ ERROR:\n\n${JSON.stringify(error.response?.data || error.message, null, 2)}`);
    }
    
    setLoading(false);
  };
  
  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-4">DeepSeek API Test</h1>
        
        <button
          onClick={testAPI}
          disabled={loading}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg mb-4 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test API Key'}
        </button>
        
        {result && (
          <pre className="bg-gray-800 p-4 rounded text-sm text-gray-300 whitespace-pre-wrap">
            {result}
          </pre>
        )}
        
        <a href="/test" className="text-purple-400 underline mt-4 block">← Back to main test</a>
      </div>
    </div>
  );
}