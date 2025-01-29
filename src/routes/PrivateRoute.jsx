import { Navigate } from "react-router-dom";
import { useContext } from 'react';
import AuthContext from '..//context/AuthContext.jsx';
import PropTypes from "prop-types"; 

function PrivateRoute({ element: Component }) {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    // Pode retornar um spinner ou algo do tipo
    return <div>Carregando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Component />;
}

PrivateRoute.propTypes = {
    element: PropTypes.elementType
  };


export default PrivateRoute;
