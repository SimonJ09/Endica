import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Accueil from './pages/Accueil';
import FicheRemede from './pages/FicheRemede';
import FicheIngredient from './pages/FicheIngredient';
import FicheIndication from './pages/FicheIndication';
import Recherche from './pages/Recherche';
import APropos from './pages/APropos';
import Equipe from './pages/Equipe';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import Remedes from './pages/admin/Remedes';
import RemedeForm from './pages/admin/RemedeForm';
import Ingredients from './pages/admin/Ingredients';
import Indications from './pages/admin/Indications';
import Medias from './pages/admin/Medias';
import Commentaires from './pages/admin/Commentaires';
import Signalements from './pages/admin/Signalements';
import AdminLayout from './components/admin/AdminLayout';
import RouteProtegee from './components/RouteProtegee';
import Avertissement from './components/Avertissement';
import Logo from './components/Logo';

function LayoutPublic({ children }) {
  const location = useLocation();
  const lienActif = (chemin) => location.pathname === chemin ? 'actif' : '';

  return (
    <>
      <header className="header">
        <div className="container">
          <h1>
            <Link to="/" aria-label="Accueil">
              <Logo taille={38} couleur="#ffffff" />
            </Link>
          </h1>
          <nav>
            <Link to="/" className={lienActif('/')}>Accueil</Link>
            <Link to="/a-propos" className={lienActif('/a-propos')}>À propos</Link>
            <Link to="/equipe" className={lienActif('/equipe')}>Équipe</Link>
            <Link to="/admin/login">🔐 Admin</Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <Logo taille={32} couleur="#ffffff" />
              <p style={{ marginTop: '0.7rem', fontSize: '0.85rem', opacity: 0.85 }}>
                Base documentaire publique sur les remèdes endogènes et les
                plantes médicinales.
              </p>
            </div>
            <div>
              <strong>Explorer</strong>
              <p><Link to="/">Accueil</Link></p>
              <p><Link to="/a-propos">À propos</Link></p>
              <p><Link to="/equipe">Équipe</Link></p>
            </div>
            <div>
              <strong>Contact</strong>
              <p style={{ opacity: 0.85, fontSize: '0.85rem' }}>
                📧 contact@remedes-du-terroir.org
              </p>
            </div>
          </div>
          <Avertissement compact />
          <p style={{ marginTop: '1rem', opacity: 0.7, fontSize: '0.8rem' }}>
            © {new Date().getFullYear()} Remèdes du terroir — Projet porté par
            Agohoundjè Jude.
          </p>
        </div>
      </footer>
    </>
  );
}

function Admin({ children }) {
  return (
    <RouteProtegee>
      <AdminLayout>{children}</AdminLayout>
    </RouteProtegee>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LayoutPublic><Accueil /></LayoutPublic>} />
      <Route path="/remedes/:id" element={<LayoutPublic><FicheRemede /></LayoutPublic>} />
      <Route path="/ingredients/:id" element={<LayoutPublic><FicheIngredient /></LayoutPublic>} />
      <Route path="/indications/:id" element={<LayoutPublic><FicheIndication /></LayoutPublic>} />
      <Route path="/recherche" element={<LayoutPublic><Recherche /></LayoutPublic>} />
      <Route path="/a-propos" element={<LayoutPublic><APropos /></LayoutPublic>} />
      <Route path="/equipe" element={<LayoutPublic><Equipe /></LayoutPublic>} />

      {/* Auth */}
      <Route path="/admin/login" element={<Login />} />

      {/* Admin protégé */}
      <Route path="/admin" element={<Admin><Dashboard /></Admin>} />
      <Route path="/admin/remedes" element={<Admin><Remedes /></Admin>} />
      <Route path="/admin/remedes/nouveau" element={<Admin><RemedeForm /></Admin>} />
      <Route path="/admin/remedes/:id/edit" element={<Admin><RemedeForm /></Admin>} />
      <Route path="/admin/ingredients" element={<Admin><Ingredients /></Admin>} />
      <Route path="/admin/indications" element={<Admin><Indications /></Admin>} />
      <Route path="/admin/medias" element={<Admin><Medias /></Admin>} />
      <Route path="/admin/commentaires" element={<Admin><Commentaires /></Admin>} />
      <Route path="/admin/signalements" element={<Admin><Signalements /></Admin>} />
    </Routes>
  );
}