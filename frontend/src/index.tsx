import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import WebPage from './pages/WebPage';
// Import other web pages as you create them
// import AboutPage from './pages/AboutPage';
// import ContactPage from './pages/ContactPage';
import './index.css'; // You might want to create this file for global styles

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WebPage />} />
        {/* Add other web pages as you create them */}
        {/* <Route path="/about" element={<AboutPage />} /> */}
        {/* <Route path="/contact" element={<ContactPage />} /> */}
      </Routes>
    </BrowserRouter>
  );
};

// Create root and render
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
