import mongoose from 'mongoose';

const auctionSchema = new mongoose.Schema({
  carName: { type: String, required: true },
  imagePath: { type: String, required: true },
  startingBid: { type: Number, required: true },
  currentBid: { type: Number, required: true },
  highestBidder: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  endsAt: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  bids: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    amount: { type: Number, required: true },
    time: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default mongoose.model('Auction', auctionSchema);
