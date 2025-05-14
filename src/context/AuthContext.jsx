import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import PropTypes from "prop-types";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = sessionStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      const decoded = jwtDecode(storedToken);
      if (decoded.roles) {
        setRoles(decoded.roles);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, {
        email,
        password,
      });
      const { token: receivedToken } = response.data;
      setToken(receivedToken);
      sessionStorage.setItem("token", receivedToken);
      const decoded = jwtDecode(receivedToken);
      if (decoded.roles) {
        setRoles(decoded.roles);
      }
    } catch (error) {
      console.error("Ocorreu um erro:", error);
      throw error;
    }
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
