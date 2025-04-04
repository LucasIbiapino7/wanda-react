import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Header from "./components/Header/Header";
import Home from "./pages/Home";
import About from "./pages/About";
import Function from "./pages/Function";
import MatchesPage from "./pages/MatchesPage";
import PrivateRoute from "./routes/PrivateRoute.jsx";
import AdminRoute from "./routes/AdminRoute.jsx";
import Login from "./pages/Login";
import ProfilePage from "./pages/ProfilePage.jsx";
import Challenge from "./pages/Challenge.jsx";
import { AuthProvider } from "./context/AuthContext";
import Matches from "./pages/Matches.jsx";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <Routes>
          {/* Rota pública */}
          <Route path="/sobre" element={<About />} />
          <Route path="/login" element={<Login />} />

          {/* Rota privada */}
          <Route path="/" element={<PrivateRoute element={Home} />} />
          <Route path="/enviar" element={<PrivateRoute element={Function} />} />
          <Route
            path="/profile"
            element={<PrivateRoute element={ProfilePage} />}
          />
          <Route
            path="/challenges"
            element={<PrivateRoute element={Challenge} />}
          />

          <Route
            path="/matches/:id"
            element={<PrivateRoute element={Matches} />}
          />

          {/* Rota só para Admin*/}
          <Route
            path="/partida"
            element={<AdminRoute element={MatchesPage} />}
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
