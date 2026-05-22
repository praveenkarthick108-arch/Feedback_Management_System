import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import SubmitFeedback from "./pages/SubmitFeedback";
import FeedbackList from "./pages/FeedbackList";
import FeedbackDetail from "./pages/FeedbackDetail";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main style={{ minHeight: "calc(100vh - 64px)" }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/submit" element={<SubmitFeedback />} />
          <Route path="/feedback" element={<FeedbackList />} />
          <Route path="/feedback/:id" element={<FeedbackDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
