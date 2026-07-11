import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import Idea from './pages/Idea.jsx'
import BrandReview from './pages/BrandReview.jsx'
import BrandCompetitors from './pages/BrandCompetitors.jsx'
import Results from './pages/Results.jsx'
import Research from './pages/Research.jsx'
import Chat from './pages/Chat.jsx'
import NotFound from './pages/NotFound.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/idea" element={<Idea />} />
        <Route path="/brand/review" element={<BrandReview />} />
        <Route path="/brand/competitors" element={<BrandCompetitors />} />
        <Route path="/results" element={<Results />} />
        <Route path="/research" element={<Research />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
