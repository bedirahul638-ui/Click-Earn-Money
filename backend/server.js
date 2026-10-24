const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Database Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB Connected Successfully!"))
.catch(err => console.log("DB Connection Error:", err));

// User Schema & Model
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  phone: String,
  password: String,
  coins: { type: Number, default: 0 },
  totalCoinsEarned: { type: Number, default: 0 },
  totalTaps: { type: Number, default: 0 },
  tapPower: { type: Number, default: 1 },
  energy: { type: Number, default: 100 },
  maxEnergy: { type: Number, default: 100 },
  upi: { type: String, default: "" },
  createdTimestamp: { type: Number, default: Date.now },
  referredBy: { type: String, default: "" }
});

const User = mongoose.model('User', userSchema);

// Test Route
app.get('/', (req, res) => {
  res.send("Bronze Miner Backend is Running Live!");
});

// 1. Register API (with Referral Support)
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, phone, password, refCode } = req.body;
    
    let finalReferredBy = "";
    if (refCode) {
      const inviter = await User.findById(refCode);
      if (inviter) {
        finalReferredBy = refCode;
        inviter.coins += 1000; // Referral Bonus
        inviter.totalCoinsEarned += 1000;
        await inviter.save();
      }
    }

    const newUser = new User({ name, email, phone, password, referredBy: finalReferredBy });
    await newUser.save();
    res.json({ success: true, userId: newUser._id });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 2. Login API
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (user) {
      res.json({ success: true, user });
    } else {
      res.status(401).json({ success: false, error: "Invalid email or password" });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Get User Data API (for session restore)
app.get('/api/user/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (user) {
      res.json({ success: true, user });
    } else {
      res.status(404).json({ success: false, error: "User not found" });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Tap API (Anti-Cheat & Cloud Sync)
app.post('/api/tap', async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    
    if (!user || user.energy <= 0) {
      return res.status(400).json({ success: false, error: "Not enough energy" });
    }

    user.coins += user.tapPower;
    user.totalCoinsEarned += user.tapPower;
    user.totalTaps += 1;
    user.energy -= 1;
    await user.save();

    res.json({ 
      success: true, 
      coins: user.coins, 
      energy: user.energy, 
      totalCoinsEarned: user.totalCoinsEarned, 
      totalTaps: user.totalTaps 
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Refill Energy API
app.post('/api/refill-energy', async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, error: "User not found" });

    user.energy = user.maxEnergy;
    await user.save();
    res.json({ success: true, energy: user.energy });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
