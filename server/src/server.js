require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

const { startMonitoringScheduler } = require('./services/agent/monitorComplaints.service');

connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);

    // Start background agent monitoring scheduler if not in test environment
    if (process.env.NODE_ENV !== 'test' && process.env.ENABLE_AGENT_MONITOR !== 'false') {
      startMonitoringScheduler();
    }
  });
});
