import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import Layout from './components/Layout'
import Home from './pages/Home'
import Learn from './pages/Learn'
import Chapter from './pages/Chapter'
import Prompts from './pages/Prompts'
import Glossary from './pages/Glossary'
import Resources from './pages/Resources'
import Projects from './pages/Projects'
import Project from './pages/Project'
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
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:projectId" element={<Project />} />
          <Route path="prompts" element={<Prompts />} />
          <Route path="glossary" element={<Glossary />} />
          <Route path="resources" element={<Resources />} />
          {/* 옛 주소 — /me 는 프로젝트 목록으로 합쳐졌다 */}
          <Route path="me" element={<Me />} />
          <Route path="admin" element={<Admin />} />
          <Route path="chapters" element={<Navigate to="/learn" replace />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
