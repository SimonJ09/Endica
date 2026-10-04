import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const soumettre = async (e) => {
    e.preventDefault();
    setErreur('');
    setChargement(true);
    try {
      await login(email, motDePasse);
      navigate('/admin');
    } catch (err) {
      setErreur(err.response?.data?.erreur || 'Erreur de connexion.');
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '420px', marginTop: '3rem' }}>
      <h2 style={{ color: 'var(--vert-fonce)', textAlign: 'center' }}>
        🔐 Espace administrateur
      </h2>

      <form onSubmit={soumettre} style={{ marginTop: '2rem' }}>
        <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem' }}>
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            width: '100%', padding: '0.7rem',
            border: '1px solid var(--bordure)', borderRadius: '6px',
            marginBottom: '1rem'
          }}
        />

        <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem' }}>
          Mot de passe
        </label>
        <input
          type="password"
          value={motDePasse}
          onChange={(e) => setMotDePasse(e.target.value)}
          required
          style={{
            width: '100%', padding: '0.7rem',
            border: '1px solid var(--bordure)', borderRadius: '6px',
            marginBottom: '1rem'
          }}
        />

        {erreur && <div className="erreur">{erreur}</div>}

        <button className="btn" type="submit" disabled={chargement}
                style={{ width: '100%', padding: '0.8rem' }}>
          {chargement ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '1.5rem' }}>
        <Link to="/">← Retour au site</Link>
      </p>
    </div>
  );
}