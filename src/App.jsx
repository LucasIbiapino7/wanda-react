import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Header from "./components/Header/Header";
import Home from "./pages/Home";
import About from "./pages/About";
import Function from "./pages/Function";
import LoginPage from "./pages/LoginPage"
import MatchesPage from "./pages/MatchesPage"
import PrivateRoute from "./routes/PrivateRoute";
import AdminRoute from "./routes/AdminRoute";

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        {/* Rota pública */}
        <Route path="/sobre" element={<About />} />
        <Route path="/login" element={<LoginPage />} />

       {/* Rota privada */}
       <Route
          path="/"
          element={<PrivateRoute element={Home} />}
        />
        <Route
          path="/enviar"
          element={<PrivateRoute element={Function} />}
        />

        {/* Rota só para Admin*/}
        <Route
          path="/partida"
          element={<AdminRoute element={MatchesPage} />}
        />

        {/* Rota default (caso queira redirecionar para /login ou /home) */}
        {/* <Route path="*" element={<Navigate to="/login" />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
