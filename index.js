import dotenv from 'dotenv';
dotenv.config();
import app from './src/app.js';
import { sequelize} from './src/models/index.js';
import { ensureUploadsDir } from './src/utils/createUploadsDir.js';

const PORT = process.env.PORT || 5001;

(async () => {
  try {
    // Ensure uploads directory exists
    ensureUploadsDir();
    
    await sequelize.authenticate();
    console.log(' Database connected successfully');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(` Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (err) {
    console.error(' Server start failed:', err);
    process.exit(1);
  }
})();
