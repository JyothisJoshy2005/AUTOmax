import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

import auctionRoutes from './routes/auctionRoutes.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Main Routes
app.use('/api', auctionRoutes);
app.use('/api/auth', authRoutes); // newly added

// Real-Time Socket.io Connection
io.on('connection', (socket) => {
  console.log('A user connected (Socket ID:', socket.id, ')');

  // Multi-player concurrency spaces (rooms per auction)
  socket.on('join_auction', (auctionId) => {
    socket.join(auctionId);
    console.log(`User joined auction showroom: ${auctionId}`);
  });

  // Real-time Bidding Broadcast
  socket.on('place_bid', (data) => {
    console.log('Socket Bid Update:', data);
    
    // Broadcast instantly to all users looking at the same car
    io.to(data.auctionId).emit('auction_update', {
       auctionId: data.auctionId,
       currentBid: data.bidAmount,
       username: data.username,
       timestamp: new Date()
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected (Socket ID:', socket.id, ')');
  });
});

// Configure MongoDB & Start Server
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/automax';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB AutoMax Database successfully');
  })
  .catch((err) => {
    console.error('CRITICAL: MongoDB Connection Error. Starting server anyway without DB features...', err.message);
  })
  .finally(() => {
    httpServer.listen(PORT, () => {
      console.log(`AUTOmax Backend with WebSockets running securely on port ${PORT}`);
    });
  });
