import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import { useTheme } from "./hooks/useTheme";
import Home from "./pages/Home";
import PracticeSetup from "./pages/PracticeSetup";
import Quiz from "./pages/Quiz";
import Result from "./pages/Result";
import History from "./pages/History";
import Bookmarks from "./pages/Bookmarks";
import Guide from "./pages/Guide";

export default function App() {
  const { theme, toggle } = useTheme();

  return (
    <HashRouter>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Navbar theme={theme} toggleTheme={toggle} />
        <main className="pt-0 md:pt-14 pb-16 md:pb-0">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/practice" element={<PracticeSetup />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/result" element={<Result />} />
            <Route path="/history" element={<History />} />
            <Route path="/bookmarks" element={<Bookmarks />} />
            <Route path="/guide" element={<Guide />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}
