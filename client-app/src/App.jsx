import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import { auth, provider } from './firebase'; // Import auth from your new firebase.js
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

function App() {
  // State to hold the logged-in user object
  const [user, setUser] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Effect to listen for changes in user's login state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchHistory(currentUser); // Fetch history right after login
      } else {
        setHistory([]); // Clear history on logout
      }
    });
    // Cleanup the listener when the component unmounts
    return () => unsubscribe();
  }, []);

  // --- AUTHENTICATION HANDLERS ---
  const handleLogin = () => {
    signInWithPopup(auth, provider).catch((err) => console.error(err));
  };

  const handleLogout = () => {
    signOut(auth);
    setAnalysisResult(null); // Clear any visible results
  };

  // --- DATA HANDLING ---
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setAnalysisResult(null);
    setError('');
  };

  const fetchHistory = async (currentUser) => {
    if (!currentUser) return;
    try {
      const token = await currentUser.getIdToken();
      const response = await axios.get('http://localhost:3001/api/history', {
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
      const token = await user.getIdToken(); // Get auth token
      const response = await axios.post('http://localhost:3001/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}` // <-- Send token for authentication
        },
      });
      setAnalysisResult(response.data);
      fetchHistory(user); // Refresh history list after a new upload
    } catch (err) {
      setError('An error occurred during analysis. Please check the file or try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const getScoreColor = (score) => {
    if (score >= 70) return 'green';
    if (score >= 40) return 'orange';
    return 'red';
  };

  return (
    <div className="container">
      <header>
        <h1>Green Procurement Advisor</h1>
        <div className="auth-section">
          {user ? (
            <>
              <p>Welcome, {user.displayName}!</p>
              <button onClick={handleLogout} className="auth-btn">Logout</button>
            </>
          ) : (
            <button onClick={handleLogin} className="auth-btn">Sign in with Google</button>
          )}
        </div>
      </header>
      
      {user ? (
        <div className="main-content">
          <div className="upload-section card">
            <h2>Analyze a New Purchase Order</h2>
            <p>Upload a CSV file with 'product', 'qty', and 'supplier' columns.</p>
            <input type="file" accept=".csv" onChange={handleFileChange} />
            <button onClick={handleUpload} disabled={loading}>
              {loading ? 'Analyzing...' : 'Analyze Purchase Order'}
            </button>
          </div>

          {error && <p className="error-message">{error}</p>}
          
          {analysisResult && (
            <div className="dashboard card">
              <h2>Analysis Complete</h2>
              {analysisResult.summary && (
                <div className="summary-card ai-summary">
                  <h3>AI-Powered Summary</h3>
                  <p>{analysisResult.summary}</p>
                </div>
              )}
              <div className="summary-card">
                <h3>Overall Green Score</h3>
                <span className={`score ${getScoreColor(analysisResult.averageScore)}`}>
                  {analysisResult.averageScore} / 100
                </span>
                <p>File Analyzed: <strong>{analysisResult.fileName}</strong></p>
              </div>
              <h3>Item Breakdown</h3>
              <table className="results-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Green Score</th>
                    <th>AI Suggestion</th>
                  </tr>
                </thead>
                <tbody>
                  {analysisResult.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.product}</td>
                      <td style={{textAlign: 'center'}}>
                        <span className={`score-badge ${getScoreColor(item.greenScore)}`}>{item.greenScore}</span>
                      </td>
                      <td>{item.suggestion || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {history.length > 0 && (
            <div className="history-section card">
              <h3>Your Past Analyses</h3>
              <ul className="history-list">
                {history.map(item => (
                  <li key={item.id}>
                    <span className="history-file">{item.fileName}</span>
                    <span className={`history-score ${getScoreColor(item.averageScore)}`}>
                      Score: {item.averageScore}
                    </span>
                    <span className="history-date">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="login-prompt card">
          <h2>Welcome!</h2>
          <p>Please sign in with your Google account to begin analyzing your procurement data.</p>
        </div>
      )}
    </div>
  );
}

export default App;