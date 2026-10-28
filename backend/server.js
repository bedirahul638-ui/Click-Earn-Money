const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// --- MONGODB CONNECTION ---
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://bedirahul638_db_user:200301Pr@cluster0.znnevpo.mongodb.net/bronze-miner?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB Connected Successfully!"))
.catch(err => console.error("DB Connection Error:", err));

// --- USER SCHEMA & MODEL ---
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  coins: { type: Number, default: 0 },
  totalCoinsEarned: { type: Number, default: 0 },
  totalTaps: { type: Number, default: 0 },
  tapPower: { type: Number, default: 1 },
  energy: { type: Number, default: 100 },
  maxEnergy: { type: Number, default: 100 },
  upi: { type: String, default: "" },
  refBy: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// --- REGISTER ROUTE ---
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, phone, password, refCode } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, error: "Email is already registered!" });
    }

    const newUser = new User({
      name,
      email,
      phone,
      password,
      refBy: refCode || ""
    });

    await newUser.save();

    // Agar referral code se join kiya hai toh referrer ko bonus dena
    if (refCode) {
      const referrer = await User.findById(refCode);
      if (referrer) {
        referrer.coins += 1000;
        await referrer.save();
      }
    }

    res.json({ success: true, message: "Account registered successfully!" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- LOGIN ROUTE ---
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(400).json({ success: false, error: "Invalid email or password!" });
    }

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- FETCH USER DATA ROUTE ---
app.get('/api/user/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- TAP / MINING ROUTE (Anti-Cheat & Server-Synced) ---
app.post('/api/tap', async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    if (user.energy <= 0) {
      return.status(400).json({ success: false, error: "Energy empty!" });
    }

    // Energy reduce aur coins increase karna
    user.energy -= 1;
    user.coins += user.tapPower;
    user.totalCoinsEarned += user.tapPower;
    user.totalTaps += 1;

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

// --- REFILL ENERGY ROUTE ---
app.post('/api/refill-energy', async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    user.energy = user.maxEnergy;
    await user.save();

    res.json({ success: true, energy: user.energy });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- ADMIN DASHBOARD API ROUTE (Secure) ---
app.get('/api/admin/dashboard', async (req, res) => {
  try {
    const { secret } = req.query;
    
    // Yahan apna secret password set hai jo sirf aapko pata hoga
    const ADMIN_SECRET_KEY = "rahul_admin_12345"; 

    if (secret !== ADMIN_SECRET_KEY) {
      return res.status(403).json({ success: false, error: "Access Denied! Incorrect Admin Password." });
    }

    // Saare registered users ki list database se fetch karna
    const users = await User.find({}).sort({ createdAt: -1 });

    res.json({
      success: true,
      totalUsers: users.length,
      users: users
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- SERVER START ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
