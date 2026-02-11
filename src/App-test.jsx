import { useState } from 'react';
import './App.css';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">🏥 WellSense AI</h1>
        <p className="text-lg text-gray-600 mb-8">Your Health Platform is Loading...</p>
        
        <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md mx-auto">
          <h2 className="text-2xl font-semibold mb-4">Quick Test</h2>
          <button 
            onClick={() => setCount(count + 1)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Count: {count}
          </button>
          
          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>React:</span>
              <span className="text-green-600">✅ Working</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Tailwind CSS:</span>
              <span className="text-green-600">✅ Working</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Vite:</span>
              <span className="text-green-600">✅ Working</span>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              🎉 Your WellSense AI platform is ready! 
              The beautiful UI components are working perfectly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;