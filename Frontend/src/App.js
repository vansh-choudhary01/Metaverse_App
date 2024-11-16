import Metaverse from "./pages/metaverse";
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import "./App.css"
import LandingPage from "./pages/landing";
import Authentication from "./pages/authentication";
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  return (
    <div className="App">
      <Router>

        <AuthProvider>

          <Routes>
            <Route path='/' element={<LandingPage />} />
            <Route path='/auth' element={<Authentication />} />
            <Route path='/game' element={<Metaverse/>} />
          </Routes>

        </AuthProvider>

      </Router>
    </div>
  );
}

export default App;
