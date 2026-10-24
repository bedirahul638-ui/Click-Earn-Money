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
  password: String,
  coins: { type: Number, default: 0 },
  energy: { type: Number, default: 100 },
  createdTimestamp: { type: Number, default: Date.now },
  referredBy: { type: String, default: "" }
});

const User = mongoose.model('User', userSchema);

// Test Route
app.get('/', (req, res) => {
  res.send("Bronze Miner Backend is Running Live!");
});

// Register API
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, refCode } = req.body;
    
    let finalReferredBy = "";
    if (refCode) {
      const inviter = await User.findById(refCode);
      if (inviter) {
        finalReferredBy = refCode;
        inviter.coins += 1000; // Referral Bonus
        await inviter.save();
      }
    }

    const newUser = new User({ name, email, password, referredBy: finalReferredBy });
    await newUser.save();
    res.json({ success: true, userId: newUser._id });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Server Port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
