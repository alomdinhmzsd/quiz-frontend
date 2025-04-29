/**
 * App.js - Main Application Component
 *
 * This is the root component of the application that sets up:
 * - Material-UI theme provider (dark theme)
 * - CSS baseline normalization
 * - React Router configuration
 * - Main layout structure with Header
 * - Offline status banner
 */

import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import Header from './Header';
import QuestionList from './components/QuestionList/QuestionList';
import QuestionDetail from './components/QuestionDetail/QuestionDetail';
import { darkTheme } from './theme';

function App() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />

      <BrowserRouter>
        {/* Top-level offline banner */}
        {isOffline && (
          <div
            style={{
              background: '#ff9800',
              color: '#000',
              padding: '0.5em',
              textAlign: 'center',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              zIndex: 999,
              position: 'sticky',
              top: 0,
            }}>
            ⚠️ You’re offline. Some features may be limited.
          </div>
        )}

        <Header />

        <Routes>
          <Route path='/' element={<QuestionList />} />
          <Route path='/questions/:id' element={<QuestionDetail />} />
          <Route path='/domain/:domainName' element={<QuestionList />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
