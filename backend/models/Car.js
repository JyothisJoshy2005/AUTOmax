import mongoose from 'mongoose';

const carSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // Using string ID for compatibility with frontend seed data
  make: { type: String, required: true },
  model: { type: String, required: true },
  engine: { type: String },
  horsepower: { type: String },
  topSpeed: { type: String },
  description: { type: String },
  images: [{ type: String }], // Array of Base64 strings or URLs
  startingBid: { type: Number, required: true },
  currentBid: { type: Number, default: 0 },
  endsIn: { type: Number, required: true }, // duration in seconds, or we could use Date
  endTime: { type: Date }, // Actual calculated end time
  sellerName: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Car', carSchema);
