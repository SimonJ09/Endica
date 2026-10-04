import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout({ children }) {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();


  const deconnexion = () => {
    logout();
    navigate('/admin/login');
  };

  const liens = [
    { to: '/admin', label: '📊 Tableau de bord' },
    { to: '/admin/remedes', label: '🌿 Remèdes' },
    { to: '/admin/medias', label: '📷 Médias' },
    { to: '/admin/ingredients', label: '🧪 Ingrédients' },
    { to: '/admin/indications', label: '📋 Indications' },
    { to: '/admin/commentaires', label: '💬 Commentaires' },
    { to: '/admin/signalements', label: '🚨 Signalements' },
  ];



  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h2>🌿 Admin</h2>
        <p style={{ fontSize: '0.85rem', opacity: 0.85, marginBottom: '1.5rem' }}>
          {admin?.nom || admin?.email}
          <br />
          <span style={{ fontSize: '0.75rem' }}>Rôle : {admin?.role}</span>
        </p>

        <nav>
          {liens.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={location.pathname === l.to ? 'actif' : ''}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '1.5rem' }}>
          <Link to="/" style={{ display: 'block', marginBottom: '0.5rem' }}>
            ← Site public
          </Link>
          <button
            onClick={deconnexion}
            style={{
              background: 'transparent',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              padding: '0.5rem 0.8rem',
              borderRadius: '6px',
              cursor: 'pointer',
              width: '100%',
              fontSize: '0.85rem'
            }}
          >
            🚪 Déconnexion
          </button>
        </div>
      </aside>

      <main className="admin-main">
        {children}
      </main>
    </div>
  );
}

