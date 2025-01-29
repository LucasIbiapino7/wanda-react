import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";
import AuthContext from "../context/AuthContext.jsx";
import { useContext } from "react";

function AdminRoute({ element: Component }) {
  const { isAuthenticated, isAdmin, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Se não tiver ROLE_ADMIN, redireciona para /home (ou exibe 403)
  if (!isAdmin) {
    console.log("CAIU AQUI por que não é admin");
    return <Navigate to="/" replace />;
  }

  return <Component />;
}

AdminRoute.propTypes = {
  element: PropTypes.elementType.isRequired,
};

export default AdminRoute;
