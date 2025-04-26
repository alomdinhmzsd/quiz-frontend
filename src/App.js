/**
 * App.js - Main Application Component
 *
 * This is the root component of the application that sets up:
 * - Material-UI theme provider (dark theme)
 * - CSS baseline normalization
 * - React Router configuration
 * - Main layout structure with Header
 *
 * Routes:
 * - '/' - Shows the QuestionList component (all questions)
 * - '/questions/:id' - Shows QuestionDetail for a specific question
 * - '/domain/:domainName' - Shows filtered QuestionList by domain
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import Header from './Header'; // App-wide header component
import QuestionList from './components/QuestionList/QuestionList';
import QuestionDetail from './components/QuestionDetail/QuestionDetail';
import { darkTheme } from './theme'; // Custom theme configuration

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      {/* Normalizes CSS across browsers */}
      <CssBaseline />

      {/* Sets up client-side routing */}
      <BrowserRouter>
        {/* Header appears on all routes */}
        <Header />

        {/* Main content area with route definitions */}
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
