import Bid from '../models/Bid.js';
import Car from '../models/Car.js';

// Fallback seed data in case DB is empty
const INITIAL_CARS = [
  {
    id: '1',
    make: 'McLaren',
    model: 'P1',
    description: 'The spiritual successor to the F1, combining hybrid electric power with a twin-turbo V8.',
    engine: '3.8L Twin-Turbo V8 Hybrid',
    topSpeed: '217 mph',
    horsepower: '903 hp',
    startingBid: 25000000,
    endsIn: 3600 * 24, // 1 day
    images: [
      '/cars/mclaren_p1_main.jpg',
      '/cars/mclaren_p1_interior.jpg',
      '/cars/mclaren_p1_side.jpg'
    ]
  },
  {
    id: '2',
    make: 'Ferrari',
    model: 'LaFerrari',
    description: 'Maranello\'s definitive hybrid hypercar. A rolling showcase of Formula 1 technology.',
    engine: '6.3L V12 Hybrid',
    topSpeed: '218 mph',
    horsepower: '950 hp',
    startingBid: 50000000,
    endsIn: 3600 * 48,
    images: [
      '/cars/ferrari_laferrari_main.jpg',
      '/cars/ferrari_laferrari_interior.jpg',
      '/cars/ferrari_laferrari_side.jpg'
    ]
  },
  {
    id: '3',
    make: 'Porsche',
    model: '911 GT3 RS',
    description: 'The ultimate track-focused 911, featuring aggressive aerodynamics and a naturally aspirated flat-six.',
    engine: '4.0L Flat-6',
    topSpeed: '184 mph',
    horsepower: '518 hp',
    startingBid: 15000000,
    endsIn: 3600 * 12,
    images: [
      '/cars/porsche_gt3_main.jpg',
      '/cars/porsche_gt3_interior.jpg',
      '/cars/porsche_gt3_side.jpg'
    ]
  },
  {
    id: '4',
    make: 'Land Rover',
    model: 'Defender V8',
    description: 'Combining rugged off-road capability with luxury and a supercharged V8 engine.',
    engine: '5.0L Supercharged V8',
    topSpeed: '149 mph',
    horsepower: '518 hp',
    startingBid: 10000000,
    endsIn: 3600 * 72,
    images: [
      '/cars/defender_main_new.png',
      '/cars/defender_interior_new.png',
      '/cars/defender_side_new.png'
    ]
  },
  {
    id: '5',
    make: 'Lamborghini',
    model: 'Aventador SVJ',
    description: 'One of the most aggressive and aerodynamically advanced Lamborghinis ever made.',
    engine: '6.5L V12',
    topSpeed: '217 mph',
    horsepower: '759 hp',
    startingBid: 35000000,
    endsIn: 3600 * 2,
    images: [
      '/cars/svj_main_new.png',
      '/cars/svj_interior_new.png',
      '/cars/svj_side_new.png'
    ]
  }
];

// Helper to seed DB if empty or missing images, and refresh expired auctions
const seedDatabase = async () => {
  try {
    const count = await Car.countDocuments();
    if (count === 0) {
      console.log('Seeding initial cars into MongoDB...');
      for (const c of INITIAL_CARS) {
        await Car.create({ ...c, endTime: new Date(Date.now() + c.endsIn * 1000) });
      }
    } else {
      for (const c of INITIAL_CARS) {
        const existingCar = await Car.findOne({ id: c.id });
        if (existingCar) {
          let updated = false;

          // Restore missing images
          if (existingCar.images && existingCar.images.length === 1) {
            existingCar.images = c.images;
            updated = true;
            console.log(`Restored missing images for ${existingCar.make} ${existingCar.model}`);
          }

          // Reset endTime if auction has expired so it always shows as live
          if (new Date(existingCar.endTime).getTime() <= Date.now()) {
            existingCar.endTime = new Date(Date.now() + c.endsIn * 1000);
            updated = true;
            console.log(`Refreshed expired auction for ${existingCar.make} ${existingCar.model}`);
          }

          if (updated) await existingCar.save();
        }
      }
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};
// Trigger seed immediately (safe to do async here)
seedDatabase();


export const getCars = async (req, res) => {
  try {
    const cars = await Car.find({ isActive: true });
    // Dynamically calculate endsIn based on endTime
    const formattedCars = cars.map(car => {
      const c = car.toObject();
      c.endsIn = Math.max(0, Math.floor((new Date(c.endTime).getTime() - Date.now()) / 1000));
      return c;
    });
    res.status(200).json(formattedCars);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createCar = async (req, res) => {
  try {
    const { make, model, engine, horsepower, topSpeed, description, startingBid, durationMinutes, images } = req.body;
    const sellerName = req.user.username;
    
    if (!make || !model || !startingBid || !durationMinutes || !images || images.length === 0) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newCar = new Car({
      id: Date.now().toString(), // Generate a unique ID
      make,
      model,
      engine,
      horsepower,
      topSpeed,
      description,
      startingBid: parseFloat(startingBid),
      currentBid: 0,
      images,
      sellerName: sellerName || 'Guest',
      endsIn: durationMinutes * 60,
      endTime: new Date(Date.now() + durationMinutes * 60 * 1000)
    });

    await newCar.save();
    res.status(201).json({ message: 'Car listed successfully', car: newCar });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const placeBid = async (req, res) => {
  try {
    const { bidAmount, items } = req.body;
    const bidderName = req.user?.username;

    if (!bidderName || !bidAmount || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Invalid bid data.' });
    }

    const parsedAmount = parseFloat(bidAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ message: 'Bid amount must be a positive number.' });
    }

    const carId = items[0];
    const car = await Car.findOne({ id: carId });
    if (!car) {
      return res.status(404).json({ message: 'Car not found.' });
    }

    if (new Date() > new Date(car.endTime)) {
      return res.status(400).json({ message: 'This auction has already ended.' });
    }

    // ─── GREEDY MAX-PROFIT ALGORITHM ─────────────────────────────────────
    // Find the current global highest bid for this car across ALL users
    const highestBidDoc = await Bid.findOne({ carId }).sort({ bidAmount: -1 });
    const currentHighest = highestBidDoc ? highestBidDoc.bidAmount : (car.startingBid || 0);

    // A bid is only valid if it is STRICTLY greater than the current highest
    if (parsedAmount <= currentHighest) {
      return res.status(400).json({
        message: `Your bid of ₹${parsedAmount.toLocaleString('en-IN')} is too low! The current highest bid is ₹${currentHighest.toLocaleString('en-IN')}. You must bid higher to win.`,
        currentHighest
      });
    }
    // ─────────────────────────────────────────────────────────────────────

    // Upsert: update this user's bid for this car (or create new entry)
    let existingBid = await Bid.findOne({ bidderName, carId });
    if (existingBid) {
      existingBid.bidAmount = parsedAmount;
      existingBid.timestamp = new Date();
      await existingBid.save();
    } else {
      existingBid = new Bid({ carId, bidderName, bidAmount: parsedAmount });
      await existingBid.save();
    }

    // Keep car.currentBid in sync with the live highest bid
    car.currentBid = parsedAmount;
    await car.save();

    return res.status(200).json({
      message: 'Bid placed successfully!',
      bid: existingBid,
      currentHighest: parsedAmount
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};


export const getAllBids = async (req, res) => {
  try {
    const bids = await Bid.find();
    // Format to match frontend expectations: items array
    const formatted = bids.map(b => ({
      bidderName: b.bidderName,
      bidAmount: b.bidAmount,
      items: [b.carId],
      timestamp: b.timestamp
    }));
    res.status(200).json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getWinners = async (req, res) => {
  try {
    const bids = await Bid.find().sort({ bidAmount: -1 });
    
    const winningBids = [];
    const usedCars = new Set();
    let totalValue = 0;

    for (const bid of bids) {
      if (!usedCars.has(bid.carId)) {
        winningBids.push({
          bidderName: bid.bidderName,
          bidAmount: bid.bidAmount,
          items: [bid.carId]
        });
        totalValue += bid.bidAmount;
        usedCars.add(bid.carId);
      }
    }

    res.status(200).json({ winners: winningBids, totalValue });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const clearBids = async (req, res) => {
  try {
    await Bid.deleteMany({});
    res.status(200).json({ message: 'All bids cleared.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getUserGarage = async (req, res) => {
  try {
    const username = req.user.username;
    const allCars = await Car.find();
    
    // 1. Cars Listed by User
    const listedCars = allCars.filter(c => c.sellerName === username);

    // 2. Active Bids — only on valid, still-running cars, deduplicated per car
    const allBids = await Bid.find();
    const userBids = allBids.filter(b => b.bidderName === username);
    
    // Track one entry per car (user's highest bid on that car)
    const seenCars = new Map();
    for (const bid of userBids) {
      const car = allCars.find(c => c.id === bid.carId);
      if (!car || new Date(car.endTime).getTime() <= Date.now()) continue; // skip expired or missing cars

      const existing = seenCars.get(bid.carId);
      if (!existing || bid.bidAmount > existing.bidAmount) {
        seenCars.set(bid.carId, bid);
      }
    }

    const activeBidsWithCars = [];
    for (const [carId, bid] of seenCars) {
      const car = allCars.find(c => c.id === carId);
      // Find the current highest bid globally for this car
      const carBids = allBids.filter(b => b.carId === carId);
      const currentHighestBid = carBids.length > 0
        ? Math.max(...carBids.map(b => b.bidAmount))
        : car.startingBid;
      const highestBidder = carBids.sort((a, b) => b.bidAmount - a.bidAmount)[0]?.bidderName;
      const isLeading = highestBidder === username;

      activeBidsWithCars.push({
        ...bid.toObject(),
        car,
        currentHighestBid,
        isLeading,
        highestBidder,
      });
    }

    // 3. Won Cars (Purchased)
    const winningBids = [];
    const usedCars = new Set();
    const sortedBids = [...allBids].sort((a, b) => b.bidAmount - a.bidAmount);

    for (const bid of sortedBids) {
      if (!usedCars.has(bid.carId)) {
        const car = allCars.find(c => c.id === bid.carId);
        // Only count as won if the auction has ended
        if (car && new Date(car.endTime).getTime() <= Date.now()) {
          if (bid.bidderName === username) {
            winningBids.push({
              ...bid.toObject(),
              car
            });
          }
        }
        usedCars.add(bid.carId);
      }
    }

    res.status(200).json({
      listedCars,
      activeBids: activeBidsWithCars,
      wonCars: winningBids
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

