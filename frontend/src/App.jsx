import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ConnectRepo from './pages/ConnectRepo.jsx'
import AuthSuccess from './pages/AuthSuccess.jsx'

const App = () => {
  const token = localStorage.getItem("token");

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth/success" element={<AuthSuccess />} />
        <Route path="/" element={
          token ? (
            <ConnectRepo />
          ) : (
            <div className="flex items-center justify-center min-h-screen">
              <a
                href="http://localhost:4000/auth/github"
                className="px-4 py-2 bg-black text-white rounded"
              >
                Sign in with GitHub
              </a>
            </div>
          )
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App