const dotenv = require('dotenv');
const { sequelize } = require('./models');
const app = require('./app');

dotenv.config();

async function syncDatabase() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log('Database connected');
    return true;
  } catch (error) {
    console.error('Unable to sync database:', error.message);
    if (error.message.includes('database') || error.message.includes('connection')) {
      console.error('Make sure your database credentials are set in .env file:');
    }
    throw error;
  }
}

const PORT = process.env.PORT || 5001;

async function startServer() {
  try {
    await syncDatabase();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();

