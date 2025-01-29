import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Header from "./components/Header/Header";
import Home from "./pages/Home";
import About from "./pages/About";
import Function from "./pages/Function";
import LoginPage from "./pages/LoginPage"
import MatchesPage from "./pages/MatchesPage"

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        {/* Rota pública */}
        <Route path="/sobre" element={<About />} />
        <Route path="/login" element={<LoginPage />} />

       {/* Rota privada (ainda sem proteção) */}
        <Route path="/" element={<Home />} />
        <Route path="/enviar" element={<Function />} />

        {/* Rota só para Admin (também ainda sem proteção) */}
        <Route path="/partida" element={<MatchesPage />} />

        {/* Rota default (caso queira redirecionar para /login ou /home) */}
        {/* <Route path="*" element={<Navigate to="/login" />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
