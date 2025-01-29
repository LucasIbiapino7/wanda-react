import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";

function AdminRoute({ element: Component }) {
  const isAuthenticated = false; // Provisório
  const userRole = null; // Provisório

  // Se não está autenticado, redireciona para login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Se está autenticado mas não é Admin, pode redirecionar para outra página,
  // ou exibir mensagem de "acesso negado". Vou redirecionar pro /home como exemplo.
  if (userRole !== "Admin") {
    return <Navigate to="/home" replace />;
  }

  // Se chegou até aqui, significa que está autenticado e é admin
  return <Component />;
}

AdminRoute.propTypes = {
  element: PropTypes.elementType.isRequired,
};

export default AdminRoute;
