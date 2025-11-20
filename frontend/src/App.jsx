import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import ConnectRepo from "./pages/ConnectRepo.jsx";
import AuthSuccess from "./pages/AuthSuccess.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Logs from "./pages/Logs.jsx";

const App = () => {
  const token = localStorage.getItem("token");

  const LoginPage = () => (
    <div className="flex items-center justify-center min-h-screen">
      <a
        href="http://localhost:4000/auth/github"
        className="px-4 py-2 bg-black text-white rounded"
      >
        Sign in with GitHub
      </a>
    </div>
  );

  return (
    <BrowserRouter>
      <Routes>

        {/* OAuth redirect page */}
        <Route path="/auth/success" element={<AuthSuccess />} />

        {/* Dashboard (Homepage) */}
        <Route
          path="/"
          element={
            token ? <Dashboard /> : <LoginPage />
          }
        />

        {/* Connect repo page */}
        <Route
          path="/connect"
          element={
            token ? <ConnectRepo /> : <Navigate to="/" />
          }
        />

        {/* Logs page */}
        <Route
          path="/logs/:id"
          element={
            token ? <Logs /> : <Navigate to="/" />
          }
        />

      </Routes>
    </BrowserRouter>
  );
};

export default App;
