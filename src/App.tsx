import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ResumeProvider } from './context/ResumeContext';
import HomePage from './pages/HomePage';
import EditorPage from './pages/EditorPage';
import PreviewPage from './pages/PreviewPage';

const App: React.FC = () => {
  return (
    <BrowserRouter basename="/main">
      <ResumeProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/editor" element={<EditorPage />} />
          <Route path="/preview" element={<PreviewPage />} />
        </Routes>
      </ResumeProvider>
    </BrowserRouter>
  );
};

export default App;
