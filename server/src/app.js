const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { errorHandler } = require('./middleware/error.middleware');

const authRoutes = require('./routes/auth.routes');
const complaintRoutes = require('./routes/complaint.routes');
const authorityRoutes = require('./routes/authority.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const clientUrlEnv = process.env.CLIENT_URL || 'http://localhost:5173';
const parsedClientUrls = clientUrlEnv
  .split(',')
  .map(u => u.trim().replace(/\/$/, ''))
  .filter(Boolean);

const allowedOrigins = [
  ...parsedClientUrls,
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.includes(origin) ||
      allowedOrigins.some(allowed => allowed && (origin === allowed || origin.endsWith('.vercel.app')));

    if (isAllowed) {
      return callback(null, true);
    }
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true
}));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'smart-civic-backend', timestamp: new Date().toISOString() });
});

app.use('/api/v1/complaints', complaintRoutes);
app.use('/api/v1/authority', authorityRoutes);
app.use('/api/v1/admin', adminRoutes);

app.use('/api/v1/auth', authRoutes);

app.use(errorHandler);

module.exports = app;
