import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Theory from './pages/Theory';
import NeedlemanWunsch from './pages/NeedlemanWunsch';
import SmithWaterman from './pages/SmithWaterman';
import Blast from './pages/Blast';
import SubstitutionMatrices from './pages/SubstitutionMatrices';
import TestCases from './pages/TestCases';
import Analysis from './pages/Analysis';
import Source from './pages/Source';
import Conclusion from './pages/Conclusion';
import References from './pages/References';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-white">
        <Sidebar />
        {/* Desktop spacer for fixed sidebar */}
        <div className="hidden md:block w-64 flex-shrink-0 bg-[#1e3a5f]" />
        <div className="flex flex-col flex-1 pt-16 md:pt-0">
          <main className="flex-1">
            <Routes>
              <Route path="/"                      element={<Home />} />
              <Route path="/theory"                element={<Theory />} />
              <Route path="/needleman-wunsch"      element={<NeedlemanWunsch />} />
              <Route path="/smith-waterman"        element={<SmithWaterman />} />
              <Route path="/blast"                 element={<Blast />} />
              <Route path="/substitution-matrices" element={<SubstitutionMatrices />} />
              <Route path="/test-cases"            element={<TestCases />} />
              <Route path="/analysis"              element={<Analysis />} />
              <Route path="/source"                element={<Source />} />
              <Route path="/conclusion"            element={<Conclusion />} />
              <Route path="/references"            element={<References />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </div>
    </BrowserRouter>
  );
}
