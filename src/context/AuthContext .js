// src/context/AuthContext.js
import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import jwtDecode from 'jwt-decode';
import PropTypes from "prop-types"; 

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [roles, setRoles] = useState([]); // Agora armazenamos as roles como array

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      // Decodifica novamente para obter roles
      const decoded = jwtDecode(storedToken);
      if (decoded.roles) {
        setRoles(decoded.roles);
      }
    }
  }, []);

  // Função de login
  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:8080/auth/login', {
        email,
        password,
      });
      // BACK-END RETORNA { token: '...' }
      const { token: receivedToken } = response.data;

      // Salva o token no estado e no localStorage
      setToken(receivedToken);
      localStorage.setItem('token', receivedToken);

      // Decodifica o token para pegar as roles
      const decoded = jwtDecode(receivedToken);
      if (decoded.roles) {
        setRoles(decoded.roles);
      }
    } catch (error) {
      console.error('Ocorreu um erro:', error);
      throw error; // propaga o erro para quem chamou login()
    }
  };

  // Função de logout
  const logout = () => {
    setToken(null);
    setRoles([]);
    localStorage.removeItem('token');
  };

  const isAuthenticated = !!token;

  // Verifica se o array de roles inclui 'ROLE_ADMIN'
  const isAdmin = roles.includes('ROLE_ADMIN');

  return (
    <AuthContext.Provider
      value={{
        token,
        roles,
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
  children: PropTypes.node.isRequired
};

export default AuthContext;
