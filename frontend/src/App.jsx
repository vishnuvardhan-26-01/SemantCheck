import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import LandingPage from './pages/LandingPage.jsx'
import AnalysisPage from './pages/AnalysisPage.jsx'
import ResultsPage from './pages/ResultsPage.jsx'

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/analyze" element={<AnalysisPage />} />
          <Route path="/results" element={<ResultsPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
