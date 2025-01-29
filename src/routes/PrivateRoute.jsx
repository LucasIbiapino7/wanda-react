import { Navigate } from "react-router-dom";
import PropTypes from "prop-types"; 

function PrivateRoute({ element: Component }) {
  const isAuthenticated = false; // Temporariamente falso

  // Aqui, você verificaria se existe token no localStorage ou em algum contexto
  // e validaria se ainda está válido. Por enquanto, vamos deixar fixo como 'false'
  // para mostrar como funciona o redirecionamento.

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Component />;
}

PrivateRoute.propTypes = {
    element: PropTypes.elementType.isRequired
  };


export default PrivateRoute;
