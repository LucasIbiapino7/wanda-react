import { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import PropTypes from "prop-types";
import AuthService from "../services/AuthService";
import api from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [roles, setRoles] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async (authToken) => {
    try {
      const res = await api.get("/auth/me", {
        skipAuth: true,
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setUser(res.data);
    } catch (err) {
      console.error("Erro ao buscar usuário logado:", err);
      setUser(null); 
    }
  };

  useEffect(() => {
    const storedToken = sessionStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      try {
        const decoded = jwtDecode(storedToken);
        setRoles(Array.isArray(decoded.roles) ? decoded.roles : []);
        fetchUser(storedToken);
      } catch {

        sessionStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { token: receivedToken } = await AuthService.Login(email, password);
    sessionStorage.setItem("token", receivedToken);
    setToken(receivedToken);

    const decoded = jwtDecode(receivedToken);
    setRoles(Array.isArray(decoded.roles) ? decoded.roles : []);

    fetchUser(receivedToken);
  };

  const logout = () => {
    setToken(null);
    setRoles([]);
    setUser(null);
    sessionStorage.removeItem("token");
  };

  const isAuthenticated = !!token;
  const isAdmin = roles.includes("ROLE_ADMIN");
  const isInstructor = user?.profileType === "INSTRUCTOR"; 

  return (
    <AuthContext.Provider
      value={{
        token,
        roles,
        user,         
        loading,
        isAuthenticated,
        isAdmin,
        isInstructor,    
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthContext;
