import express from 'express';
import { placeBid, getAllBids, getWinners, clearBids, getCars, createCar, getUserGarage } from '../controllers/auctionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/bids', protect, placeBid);
router.get('/bids', getAllBids);
router.get('/winners', getWinners);
router.delete('/bids', clearBids);

router.get('/cars', getCars);
router.post('/cars', protect, createCar);

router.get('/garage', protect, getUserGarage);

export default router;
