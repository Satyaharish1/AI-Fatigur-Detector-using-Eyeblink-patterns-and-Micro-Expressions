import { createApp } from './app.js';
import { connectDatabase } from './config/db.js';
import { env } from './config/env.js';

async function startServer() {
  await connectDatabase(env.mongoUri);
  const app = createApp(env.clientOrigin);

  app.listen(env.port, () => {
    console.log(`Server running at http://localhost:${env.port}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
