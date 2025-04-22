import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Header from "./components/Header/Header";
import Home from "./pages/Home";
import FunctionJokenpo1 from "./pages/FunctionJokenpo1.jsx";
import FunctionJokenpo2 from "./pages/FunctionJokenpo2.jsx";
import PrivateRoute from "./routes/PrivateRoute.jsx";
// import AdminRoute from "./routes/AdminRoute.jsx";
import Login from "./pages/Login";
import ProfilePage from "./pages/ProfilePage.jsx";
import Challenge from "./pages/Challenge.jsx";
import Tournament from "./pages/Tournament.jsx";
import { AuthProvider } from "./context/AuthContext";
import Matches from "./pages/Matches.jsx";
import TournamentBracket from "./pages/TournamentBracket.jsx";
import Ranking from "./pages/Ranking.jsx";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <Routes>
          {/* Rota pública */}
          <Route path="/login" element={<Login />} />

          {/* Rota privada */}
          <Route path="/" element={<PrivateRoute element={Home} />} />
          <Route
            path="/jokenpo1"
            element={<PrivateRoute element={FunctionJokenpo1} />}
          />
          <Route
            path="/jokenpo2"
            element={<PrivateRoute element={FunctionJokenpo2} />}
          />
          <Route
            path="/profile"
            element={<PrivateRoute element={ProfilePage} />}
          />
          <Route
            path="/challenges"
            element={<PrivateRoute element={Challenge} />}
          />
          <Route
            path="/tournament"
            element={<PrivateRoute element={Tournament} />}
          />

          <Route path="/ranking" element={<PrivateRoute element={Ranking} />} />

          <Route
            path="/matches/:id"
            element={<PrivateRoute element={Matches} />}
          />

          <Route
            path="/tournament/:id"
            element={<PrivateRoute element={TournamentBracket} />}
          />

          {/* Rota só para Admin - remover*/}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
