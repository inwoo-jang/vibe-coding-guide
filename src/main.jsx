import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import Layout from './components/Layout'
import Home from './pages/Home'
import Learn from './pages/Learn'
import Chapter from './pages/Chapter'
import Prompts from './pages/Prompts'
import Glossary from './pages/Glossary'
import Me from './pages/Me'
import Admin from './pages/Admin'
import NotFound from './pages/NotFound'

import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="learn" element={<Learn />} />
          <Route path="learn/:chapterId" element={<Chapter />} />
          <Route path="prompts" element={<Prompts />} />
          <Route path="glossary" element={<Glossary />} />
          <Route path="me" element={<Me />} />
          <Route path="admin" element={<Admin />} />
          <Route path="chapters" element={<Navigate to="/learn" replace />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
