import dotenv from 'dotenv';
dotenv.config();
import app from './src/app.js';
import { sequelize} from './src/models/index.js';

const PORT = process.env.PORT || 8000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log('DB connected');


    app.listen(PORT, () => console.log(`Server running on ${PORT}`));
  } catch (err) {
    console.error('Start failed', err);
    process.exit(1);
  }
})();
