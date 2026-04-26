import mongoose from 'mongoose';

const bidSchema = new mongoose.Schema({
  carId: { type: String, required: true }, // Links to Car.id
  bidderName: { type: String, required: true },
  bidAmount: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Bid', bidSchema);
