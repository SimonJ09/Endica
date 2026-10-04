import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RouteProtegee({ children, roles }) {
  const { admin, chargement } = useAuth();

  if (chargement) {
    return <div className="container chargement">Vérification…</div>;
  }

  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }

  if (roles && !roles.includes(admin.role)) {
    return (
      <div className="container erreur">
        Accès refusé — rôle insuffisant.
      </div>
    );
  }

  return children;
}