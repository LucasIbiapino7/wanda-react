import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Header from "./components/Header/Header";
import Home from "./pages/Home";
import FunctionJokenpo1 from "./pages/FunctionJokenpo1.jsx";
import FunctionJokenpo2 from "./pages/FunctionJokenpo2.jsx";
import PrivateRoute from "./routes/PrivateRoute.jsx";
import AdminRoute from "./routes/AdminRoute.jsx";
import Login from "./pages/Login";
import ProfilePage from "./pages/ProfilePage.jsx";
import Challenge from "./pages/Challenge.jsx";
import Tournament from "./pages/Tournament.jsx";
import { AuthProvider } from "./context/AuthContext";
import Matches from "./pages/Matches.jsx";
import TournamentBracket from "./pages/TournamentBracket.jsx";
import Ranking from "./pages/Ranking.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import AdminUsersPage from "./pages/AdminUserPage.jsx";
import BitsReplayPage from "./pages/BitsReplayPage.jsx";
import GamesPage from "./pages/GamesPage.jsx";
import FunctionBitsPage from "./pages/FunctionBitsPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import AuditPage from "./pages/AuditPage.jsx";
import ResearchPage from "./pages/ResourchPage.jsx";
import ClassroomPage from "./pages/ClassroomPage.jsx";
import ClassroomDetailsPage from "./pages/ClassroomDetailsPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import MaterialsPage from "./pages/MaterialsPage.jsx";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <Routes>
          {/* Rota pública */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<Home />} />

          {/* Rota privada */}
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
            path="/classrooms"
            element={<PrivateRoute element={ClassroomPage}/>}
          />

          <Route
            path="/classrooms/:id"
            element={<PrivateRoute element={ClassroomDetailsPage} />}
          />

          <Route
            path="/classrooms/:id/dashboard"
            element={<PrivateRoute element={DashboardPage} />}
          />

          <Route
            path="/matches/:id"
            element={<PrivateRoute element={Matches} />}
          />

          <Route
            path="/tournament/:id"
            element={<PrivateRoute element={TournamentBracket} />}
          />

          <Route
            path="/bits-replay"
            element={<PrivateRoute element={BitsReplayPage} />}
          />

          <Route
            path="/bits"
            element={<PrivateRoute element={FunctionBitsPage} />}
          />

          <Route path="/games" element={<PrivateRoute element={GamesPage} />} />

          <Route 
            path="/materials"
            element={<PrivateRoute element={MaterialsPage}/>}
          />

          <Route
            path="/admin/users"
            element={<AdminRoute element={AdminUsersPage} />}
          />

          <Route
            path="/admin/auditoria"
            element={<AdminRoute element={AuditPage} />}
          />

          <Route
            path="/admin/research"
            element={<AdminRoute element={ResearchPage} />}
          />

          <Route path="/admin" element={<AdminRoute element={AdminPage} />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
