import { useState, useEffect } from 'react';
import axios from 'axios';
import { auth, provider } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { motion } from 'framer-motion';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

function App() {
  const [user, setUser] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const features = [
    {
      title: "AI-Powered Analytics",
      description: "Advanced machine learning algorithms analyze your procurement data to identify sustainability opportunities and cost optimizations.",
      highlight: "95% accuracy"
    },
    {
      title: "Environmental Impact Scoring",
      description: "Real-time environmental impact assessment for every procurement decision with comprehensive carbon footprint tracking.",
      highlight: "50+ metrics"
    },
    {
      title: "Predictive Recommendations",
      description: "Get proactive suggestions for sustainable alternatives and optimized procurement strategies based on market trends.",
      highlight: "30% savings"
    },
    {
      title: "Supply Chain Transparency",
      description: "Complete visibility into your supply chain with detailed sustainability reports and supplier compliance tracking.",
      highlight: "100% traceable"
    }
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchHistory(currentUser);
      } else {
        setHistory([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = () => {
    signInWithPopup(auth, provider).catch((err) => console.error(err));
  };

  const handleLogout = () => {
    signOut(auth);
    setAnalysisResult(null);
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setAnalysisResult(null);
    setError('');
  };

  const fetchHistory = async (currentUser) => {
    if (!currentUser) return;
    try {
      const token = await currentUser.getIdToken();
  const response = await axios.get(`${API_BASE_URL}/api/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(response.data);
    } catch (err) {
      console.error("Could not fetch history", err);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) {
      setError('Please select a file first.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    setLoading(true);
    setError('');

    try {
      const token = await user.getIdToken();
  const response = await axios.post(`${API_BASE_URL}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
      });
      setAnalysisResult(response.data);
      fetchHistory(user);
    } catch (err) {
      setError('An error occurred during analysis. Please check the file or try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const getScoreColor = (score) => {
    if (score >= 70) return 'text-green-600 bg-green-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreBadgeColor = (score) => {
    if (score >= 70) return 'bg-green-500 text-white';
    if (score >= 40) return 'bg-yellow-500 text-white';
    return 'bg-red-500 text-white';
  };

  return (
    <div className="min-h-screen bg-[#020408] relative overflow-hidden">
      {/* Central greenish glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.08) 30%, transparent 70%)',
            filter: 'blur(60px)'
          }}
        />
      </div>
      
      {/* Curved horizon line background - Planet-like horizon */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
        {/* Simulating a large planet/sphere horizon curve - wider and lower */}
        <div className="absolute left-1/2 -translate-x-1/2" style={{ bottom: '-100px', width: '4000px', height: '2000px' }}>
          <svg width="100%" height="100%" viewBox="0 0 4000 2000" preserveAspectRatio="xMidYMid slice" style={{ shapeRendering: 'geometricPrecision' }}>
            <defs>
              <linearGradient id="horizonGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: 'rgba(16, 185, 129, 0)', stopOpacity: 1 }} />
                <stop offset="20%" style={{ stopColor: 'rgba(16, 185, 129, 0)', stopOpacity: 1 }} />
                <stop offset="45%" style={{ stopColor: 'rgba(16, 200, 129, 1)', stopOpacity: 1 }} />
                <stop offset="50%" style={{ stopColor: 'rgba(16, 200, 129, 1)', stopOpacity: 1 }} />
                <stop offset="55%" style={{ stopColor: 'rgba(16, 200, 129, 1)', stopOpacity: 1 }} />
                <stop offset="80%" style={{ stopColor: 'rgba(16, 185, 129, 0)', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: 'rgba(16, 185, 129, 0)', stopOpacity: 1 }} />
              </linearGradient>
              <linearGradient id="glowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: 'rgba(16, 185, 129, 1)', stopOpacity: 1 }} />
                <stop offset="25%" style={{ stopColor: 'rgba(16, 185, 129, 1)', stopOpacity: 1 }} />
                <stop offset="50%" style={{ stopColor: 'rgba(16, 185, 129, 1)', stopOpacity: 1 }} />
                <stop offset="75%" style={{ stopColor: 'rgba(16, 185, 129, 1)', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: 'rgba(16, 185, 129, 1)', stopOpacity: 1 }} />
              </linearGradient>
              
              <filter id="glow">
                <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            {/* Perfect circular arc for planet horizon - main line */}
            <circle
              cx="2000"
              cy="1000"
              r="1050"
              fill="none"
              stroke="url(#horizonGradient)"
              strokeWidth="2"
              filter="url(#glow)"
              className="horizon-curve"
            />
          </svg>
        </div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-gray-800/50 bg-[#020408]/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center border border-emerald-500/30">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-white">Green Procurement Advisor</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="px-3 py-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                    v2.0 Beta
                  </span>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={user.photoURL} 
                        alt={user.displayName}
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="text-sm font-medium text-gray-300">
                        {user.displayName}
                      </span>
                    </div>
                    <button 
                      onClick={handleLogout} 
                      className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white border border-gray-700 rounded-lg hover:border-gray-600 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <span className="px-3 py-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                    v2.0 Beta
                  </span>
                  <button 
                    onClick={handleLogin} 
                    className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                  >
                    Sign In
                  </button>
                  <button 
                    onClick={handleLogin} 
                    className="px-6 py-2 text-sm font-medium text-gray-900 bg-emerald-400 hover:bg-emerald-500 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <span>Get Started</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {user ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="space-y-8">
            {/* Upload Section */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center border border-emerald-500/30">
                  <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Analyze Purchase Order</h2>
                  <p className="text-gray-400">Upload a CSV file to get environmental impact analysis</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-emerald-500/50 transition-colors duration-200 bg-gray-900/30">
                  <svg className="mx-auto h-12 w-12 text-gray-600" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="mt-4">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-300">
                        {selectedFile ? selectedFile.name : 'Choose CSV file or drag and drop'}
                      </span>
                      <input
                        id="file-upload"
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="sr-only"
                      />
                    </label>
                    <p className="mt-1 text-xs text-gray-500">CSV files with product, quantity, and supplier columns</p>
                  </div>
                </div>

                <button 
                  onClick={handleUpload} 
                  disabled={loading || !selectedFile}
                  className="w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-gray-900 font-medium rounded-lg transition-colors"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <span>Analyze Purchase Order</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                <div className="flex">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div className="ml-3">
                    <p className="text-sm text-red-300">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Analysis Results */}
            {analysisResult && (
              <div className="space-y-6">
                {/* Overall Score Card */}
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-white">Analysis Results</h2>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(analysisResult.averageScore)}`}>
                      {analysisResult.averageScore}/100 Green Score
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white mb-1">
                        {analysisResult.items.length}
                      </div>
                      <div className="text-sm text-gray-400">Items Analyzed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-emerald-400 mb-1">
                        {analysisResult.averageScore}
                      </div>
                      <div className="text-sm text-gray-400">Average Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white mb-1">
                        {analysisResult.items.filter(item => item.greenScore >= 70).length}
                      </div>
                      <div className="text-sm text-gray-400">High Green Score</div>
                    </div>
                  </div>

                  {analysisResult.summary && (
                    <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-6">
                      <h3 className="text-lg font-medium text-blue-300 mb-2">AI Analysis Summary</h3>
                      <p className="text-blue-200">{analysisResult.summary}</p>
                    </div>
                  )}
                </div>

                {/* Items Table */}
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800">
                  <h3 className="text-lg font-semibold text-white mb-4">Item Breakdown</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-800">
                      <thead className="bg-gray-800/50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Product
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Green Score
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            AI Suggestion
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-gray-900/30 divide-y divide-gray-800">
                        {analysisResult.items.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-800/30">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">
                              {item.product}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getScoreBadgeColor(item.greenScore)}`}>
                                {item.greenScore}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-300">
                              {item.suggestion || 'No specific recommendations'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* History Section */}
            {history.length > 0 && (
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800">
                <h3 className="text-lg font-semibold text-white mb-4">Analysis History</h3>
                <div className="space-y-3">
                  {history.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center border border-emerald-500/30">
                          <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-200">{item.fileName}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getScoreColor(item.averageScore)}`}>
                        {item.averageScore}/100
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            </div>
          </div>
        ) : (
          <>
          {/* Hero Landing Page */}
          <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 sm:px-6 lg:px-8 relative z-0">
            <motion.div 
              className="max-w-5xl mx-auto text-center"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              {/* Main Heading */}
              <motion.h1 
                className="text-5xl md:text-7xl font-bold mb-6 leading-tight relative z-0"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
              >
                <motion.span 
                  className="bg-gradient-to-b from-green-950 to-green-300 bg-clip-text text-transparent inline-block"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                >
                  Transform Your
                </motion.span>
                <br />
                <motion.span 
                  className="bg-gradient-to-b from-green-700 to-green-200 bg-clip-text text-transparent inline-block"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                >
                  Business with
                </motion.span>
                <br />
                <motion.span 
                  className="text-green-200 inline-block" 
                  style={{ fontFamily: "'Old Standard TT', serif", fontWeight: 500 ,fontStyle: 'normal' }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
                >
                  Intelli<i>g</i>ent Sustai<i>n</i>ability
                </motion.span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p 
                className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.9 }}
                style={{ fontFamily: "'DM Mono', mono", fontWeight: 300, fontStyle: 'normal'}}
              >
                AI-powered procurement analyzes your supply chain to deliver actionable insights for sustainable, cost-effective purchasing.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div 
                className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.1 }}
              >
                <button
                  onClick={handleLogin}
                  className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-gray-900 font-semibold rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-lg shadow-emerald-500/30"
                >
                  <span>Start Analysis</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                
                <button className="px-8 py-4 bg-transparent hover:bg-gray-800/50 text-gray-300 font-semibold rounded-lg border border-gray-700 hover:border-gray-600 transition-all duration-200">
                  Watch Demo
                </button>
              </motion.div>

              {/* AI Badge - Moved to bottom */}
              <motion.div 
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 1.3, type: "spring", stiffness: 200 }}
              >
                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-sm font-medium text-emerald-400">AI-Powered Sustainability</span>
              </motion.div>

              {/* Decorative circle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-emerald-500/10 -z-10"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-emerald-500/5 -z-10"></div>
            </motion.div>
          </div>

          {/* Features Section */}
          <section className="py-24 px-4 sm:px-6 lg:px-8 relative z-0">
            <div className="max-w-7xl mx-auto">
              <motion.div
                className="text-center mb-16"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                viewport={{ once: true, margin: "-100px" }}
              >
                <motion.h2 
                  className="text-3xl md:text-4xl font-bold text-white mb-4"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  Intelligent Procurement Platform
                </motion.h2>
                <motion.p 
                  className="text-gray-400 max-w-2xl mx-auto"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  viewport={{ once: true }}
                >
                  Advanced AI capabilities designed to revolutionize how organizations 
                  approach sustainable procurement and supply chain management.
                </motion.p>
              </motion.div>

                <div className="grid md:grid-cols-2 gap-8">
                  {features.map((feature, index) => (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, y: 60, scale: 0.95 }}
                      whileInView={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ 
                        duration: 0.7, 
                        delay: index * 0.15,
                        ease: [0.25, 0.46, 0.45, 0.94]
                      }}
                      viewport={{ once: true, margin: "-50px" }}
                      whileHover={{ 
                        y: -12, 
                        scale: 1.02,
                        transition: { duration: 0.3, ease: "easeOut" }
                      }}
                      className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800 hover:border-emerald-500/30 transition-all duration-500 cursor-pointer group"
                    >
                      <div className="flex items-start gap-4 mb-6">
                        <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors duration-300">
                          <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white text-xl font-semibold mb-2">{feature.title}</h3>
                          <span className="inline-block px-3 py-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                            {feature.highlight}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-400 leading-relaxed">
                        {feature.description}
                      </p>
                      <div className="mt-6 flex items-center text-emerald-400 group-hover:translate-x-2 transition-transform duration-300">
                        <span className="text-sm">Learn more</span>
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 relative z-0">
              <div className="max-w-4xl mx-auto text-center">
                <motion.div
                  className="bg-gray-900/50 backdrop-blur-sm rounded-3xl p-12 border border-gray-800"
                  initial={{ opacity: 0, y: 60, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    duration: 1, 
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }}
                  viewport={{ once: true, margin: "-100px" }}
                  whileHover={{ 
                    scale: 1.02,
                    transition: { duration: 0.3 }
                  }}
                >
                  <motion.div 
                    className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
                    initial={{ rotate: 0, scale: 0 }}
                    whileInView={{ rotate: 360, scale: 1 }}
                    transition={{ 
                      duration: 1, 
                      delay: 0.3,
                      type: "spring",
                      stiffness: 200
                    }}
                    viewport={{ once: true }}
                  >
                    <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </motion.div>
                  <motion.h2 
                    className="text-3xl md:text-4xl font-bold text-white mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    viewport={{ once: true }}
                  >
                    Ready to Transform Your Procurement?
                  </motion.h2>
                  <motion.p 
                    className="text-gray-400 mb-8 max-w-2xl mx-auto"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    viewport={{ once: true }}
                  >
                    Join leading organizations already using our AI-powered platform to make 
                    more sustainable, cost-effective procurement decisions.
                  </motion.p>
                  <motion.div 
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    viewport={{ once: true }}
                  >
                    <button 
                      onClick={handleLogin}
                      className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-gray-900 font-semibold rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/30"
                    >
                      <span>Start Free Trial</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <button className="px-8 py-4 bg-transparent hover:bg-gray-800/50 text-gray-300 font-semibold rounded-lg border border-gray-700 hover:border-gray-600 transition-all duration-200">
                      Schedule Demo
                    </button>
                  </motion.div>
                </motion.div>
              </div>
            </section>

            {/* Footer */}
            <motion.footer 
              className="py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-800 relative z-0"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 1 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <div className="max-w-7xl mx-auto">
                <motion.div 
                  className="flex flex-col md:flex-row justify-between items-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <div className="flex items-center gap-3 mb-4 md:mb-0">
                    <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-white font-medium">Green Procurement Advisor</span>
                  </div>
                  <div className="text-gray-400 text-sm">
                    © 2025 • Powered by AI • Built for Sustainability
                  </div>
                </motion.div>
              </div>
            </motion.footer>
          </>
        )}
      </main>
    </div>
  );
}

export default App;