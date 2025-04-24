import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import Header from './Header';
import QuestionList from './QuestionList';
import QuestionDetail from './components/QuestionDetail/QuestionDetail';
import { darkTheme } from './theme';

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <BrowserRouter>
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
