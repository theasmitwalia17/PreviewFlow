import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import ConnectRepo from "./pages/ConnectRepo.jsx";
import AuthSuccess from "./pages/AuthSuccess.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Logs from "./pages/Logs.jsx";
import LandingPage from "./pages/LandingPage.jsx"; // New Import

const App = () => {
  const token = localStorage.getItem("token");

  return (
    <BrowserRouter>
      <Routes>

        {/* OAuth redirect page */}
        <Route path="/auth/success" element={<AuthSuccess />} />

        {/* Dashboard (Homepage) or Landing Page */}
        <Route
          path="/"
          element={
            token ? <Dashboard /> : <LandingPage />
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