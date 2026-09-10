const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3001;
const DB_PATH = path.join(__dirname, 'app.db');
const JWT_SECRET = process.env.JWT_SECRET || 'alya-local-dev-secret';

app.use(cors());
app.use(express.json({ limit: '1mb' }));

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Erreur de connexion SQLite :', err.message);
    return;
  }
  console.log('Connexion SQLite ouverte dans:', DB_PATH);
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS form_submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT NOT NULL,
      department TEXT,
      experience TEXT,
      role TEXT,
      interests TEXT,
      newsletter INTEGER DEFAULT 0,
      comments TEXT,
      submitted_at TEXT NOT NULL
    )
  `);
});

const validCredentials = {
  username: 'admin',
  password: 'admin123'
};

const allowedDepartments = ['RH', 'Finance', 'IT', 'Marketing'];
const allowedExperiences = ['Débutant', 'Intermédiaire', 'Confirmé', 'Expert'];
const allowedRoles = ['Chef de projet', 'Support', 'Développeur', 'Analyste'];
const allowedInterests = ['Technologie', 'Design', 'Formation', 'Business'];

const createToken = (username) => jwt.sign({ username }, JWT_SECRET, { expiresIn: '2h' });

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token manquant. Veuillez vous reconnecter.'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        success: false,
        message: 'Session invalide ou expirée.'
      });
    }

    req.user = decoded;
    return next();
  });
};

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());

const validateLoginPayload = (username, password) => {
  if (!username || username.trim().length < 3) {
    return 'Le nom d’utilisateur doit contenir au moins 3 caractères.';
  }

  if (!password || password.trim().length < 6) {
    return 'Le mot de passe doit contenir au moins 6 caractères.';
  }

  return null;
};

const validateFormPayload = (payload) => {
  const {
    firstName,
    lastName,
    email,
    department,
    experience,
    role,
    interests,
    comments
  } = payload || {};

  if (!firstName || firstName.trim().length < 2) {
    return 'Le prénom doit contenir au moins 2 caractères.';
  }

  if (!lastName || lastName.trim().length < 2) {
    return 'Le nom doit contenir au moins 2 caractères.';
  }

  if (!isValidEmail(email)) {
    return 'L’adresse email est invalide.';
  }

  if (department && !allowedDepartments.includes(department)) {
    return 'Le département sélectionné est invalide.';
  }

  if (experience && !allowedExperiences.includes(experience)) {
    return 'Le niveau d’expérience sélectionné est invalide.';
  }

  if (role && !allowedRoles.includes(role)) {
    return 'Le rôle sélectionné est invalide.';
  }

  const normalizedInterests = Array.isArray(interests) ? interests : [];
  if (normalizedInterests.length > 0) {
    const invalidInterests = normalizedInterests.filter((item) => !allowedInterests.includes(item));
    if (invalidInterests.length > 0) {
      return 'Un ou plusieurs centres d’intérêt sont invalides.';
    }
  }

  if (comments && comments.trim().length > 500) {
    return 'Les commentaires ne doivent pas dépasser 500 caractères.';
  }

  return null;
};

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API backend opérationnelle' });
});

app.get('/api/me', authenticateToken, (req, res) => {
  res.json({
    success: true,
    user: { username: req.user.username }
  });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};
  const validationError = validateLoginPayload(username, password);

  if (validationError) {
    return res.status(400).json({
      success: false,
      message: validationError
    });
  }

  if (username.trim() === validCredentials.username && password === validCredentials.password) {
    const token = createToken(username.trim());

    return res.json({
      success: true,
      message: 'Connexion réussie',
      user: username.trim(),
      token
    });
  }

  return res.status(401).json({
    success: false,
    message: 'Identifiants invalides'
  });
});

app.post('/api/forms', authenticateToken, (req, res) => {
  const {
    firstName,
    lastName,
    email,
    department,
    experience,
    role,
    interests,
    newsletter,
    comments
  } = req.body || {};

  const validationError = validateFormPayload({
    firstName,
    lastName,
    email,
    department,
    experience,
    role,
    interests,
    comments
  });

  if (validationError) {
    return res.status(400).json({
      success: false,
      message: validationError
    });
  }

  const submittedAt = new Date().toISOString();

  db.run(
    `
      INSERT INTO form_submissions (
        first_name,
        last_name,
        email,
        department,
        experience,
        role,
        interests,
        newsletter,
        comments,
        submitted_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      firstName.trim(),
      lastName.trim(),
      email.trim(),
      department || '',
      experience || '',
      role || '',
      JSON.stringify(Array.isArray(interests) ? interests : []),
      newsletter ? 1 : 0,
      comments ? comments.trim() : '',
      submittedAt
    ],
    function (err) {
      if (err) {
        console.error('Erreur insertion SQLite :', err.message);
        return res.status(500).json({
          success: false,
          message: 'Échec de la soumission du formulaire.'
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Formulaire enregistré avec succès.',
        id: this.lastID,
        submittedAt
      });
    }
  );
});

app.get('/api/forms/latest', authenticateToken, (req, res) => {
  db.get(
    'SELECT * FROM form_submissions ORDER BY id DESC LIMIT 1',
    (err, row) => {
      if (err) {
        console.error('Erreur lecture SQLite :', err.message);
        return res.status(500).json({
          success: false,
          message: 'Impossible de récupérer le formulaire.'
        });
      }

      if (!row) {
        return res.status(404).json({
          success: false,
          message: 'Aucune soumission trouvée.'
        });
      }

      const submission = {
        ...row,
        interests: JSON.parse(row.interests || '[]'),
        newsletter: Boolean(row.newsletter)
      };

      return res.json({
        success: true,
        submission
      });
    }
  );
});

app.listen(PORT, () => {
  console.log(`Backend démarré sur http://localhost:${PORT}`);
});
