const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { errorHandler } = require('./middleware/error.middleware');

const authRoutes = require('./routes/auth.routes');

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

const complaintRoutes = require('./routes/complaint.routes');
app.use('/api/v1/complaints', complaintRoutes);
// app.use('/api/v1/authority', authorityRoutes);
// app.use('/api/v1/admin', adminRoutes);

app.use('/api/v1/auth', authRoutes);

app.use(errorHandler);

module.exports = app;
