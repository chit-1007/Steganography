import React from 'react';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import './App.css';
import ImageConverter from './components/ImageConverter';
import Steganography from './components/Steganography';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Steganography />} />
        <Route path="/image-converter" element={<ImageConverter />} />
      </Routes>
    </Router>
  );
}

export default App;