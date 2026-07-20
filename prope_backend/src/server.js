import http from 'http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';

import { typeDefs } from './schema.js';
import { resolvers } from './resolvers.js';
import webhookRouter from './webhook.js';
import sandboxRouter from './sandbox.js';
import { synchronizePendingEscrowsAutomatically } from './sync.js';

dotenv.config();

const app = express();
const httpServer = http.createServer(app);

// Collect raw body for Monnify webhook signature verification
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf.toString();
  }
}));

app.use(express.urlencoded({
  extended: true,
  verify: (req, res, buf) => {
    req.rawBody = buf.toString();
  }
}));

// Enable CORS for frontend clients
app.use(cors());

// Health Check Endpoints
app.get('/health', (req, res) => {
  res.json({ status: 'UP' });
});

app.get('/', (req, res) => {
  res.json({
    status: 'UP',
    name: 'Prope Monnify Backend',
    framework: 'Node.js Express + GraphQL'
  });
});

// Register webhook and sandbox routers
app.use('/api/webhooks', webhookRouter);
app.use('/api/nomba-sandbox', sandboxRouter);
app.use('/api/monnify-sandbox', sandboxRouter);

// Initialize Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

await server.start();

app.use(
  '/graphql',
  cors(),
  expressMiddleware(server)
);

// Start Server
const PORT = process.env.PORT || 8080;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server successfully listening at http://localhost:${PORT}`);
  console.log(`📊 GraphQL Playground available at http://localhost:${PORT}/graphql`);
  
  // Launch periodic synchronizations of pending escrows / payouts (equivalent to Java @Scheduled)
  const syncDelay = parseInt(process.env.ESCROW_SYNC_DELAY_MS || '30000');
  setTimeout(() => {
    synchronizePendingEscrowsAutomatically();
    setInterval(synchronizePendingEscrowsAutomatically, syncDelay);
  }, 15000);
});
