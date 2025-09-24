import { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import PropTypes from "prop-types";
import AuthService from "../services/AuthService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = sessionStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      try{
        const decoded = jwtDecode(storedToken);
        setRoles(Array.isArray(decoded.roles) ? decoded.roles : []);
      }catch{
        // Erro ao decodificar o token
        sessionStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const {token: receivedToken} = await AuthService.Login(email, password);
    sessionStorage.setItem("token", receivedToken);
    setToken(receivedToken);
    const decoded = jwtDecode(receivedToken);
    setRoles(Array.isArray(decoded.roles) ? decoded.roles : []);
  };

  const logout = () => {
    setToken(null);
    setRoles([]);
    sessionStorage.removeItem("token");
  };

  const isAuthenticated = !!token;
  const isAdmin = roles.includes("ROLE_ADMIN");

  return (
    <AuthContext.Provider
      value={{
        token,
        roles,
        loading,
        isAuthenticated,
        isAdmin,
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
