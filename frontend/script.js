// Game Variables
let coins = parseInt(localStorage.getItem('coins')) || 0;
let tapPower = parseInt(localStorage.getItem('tapPower')) || 1;
let coinsPerSec = parseInt(localStorage.getItem('coinsPerSec')) || 0;

let maxEnergy = 100;
let currentEnergy = localStorage.getItem('currentEnergy') !== null ? parseInt(localStorage.getItem('currentEnergy')) : 100;
if (currentEnergy > maxEnergy) currentEnergy = maxEnergy;

let tapUpgradeCost = parseInt(localStorage.getItem('tapUpgradeCost')) || 10;
let botUpgradeCost = parseInt(localStorage.getItem('botUpgradeCost')) || 50;

let lastEnergyZeroTime = parseInt(localStorage.getItem('lastEnergyZeroTime')) || 0;
let hourlyTimerInterval = null;

// YouTube API Variables
let player;
let isVideoPlaying = false;
let watchTimeLeft = 60;
let videoTimerInterval = null;

// DOM Elements
const coinCountEl = document.getElementById('coin-count');
const tpcCountEl = document.getElementById('tpc-count');
const ppsCountEl = document.getElementById('pps-count');
const currentEnergyEl = document.getElementById('current-energy');
const maxEnergyEl = document.getElementById('max-energy');
const energyFillEl = document.getElementById('energy-fill');
const rankNameEl = document.getElementById('rank-name');

const tapCostEl = document.getElementById('tap-cost');
const botCostEl = document.getElementById('bot-cost');

const coinBtn = document.getElementById('coin-btn');
const dailyBtn = document.getElementById('daily-reward-btn');

const rechargeBox = document.getElementById('recharge-box');
const hourlyTimerEl = document.getElementById('hourly-timer');

const videoModal = document.getElementById('video-modal');
const timerCountEl = document.getElementById('timer-count');
const claimEnergyBtn = document.getElementById('claim-energy-btn');
const likeBtn = document.getElementById('like-btn');

// Ranks
const ranks = [
  { name: 'Bronze Miner', minCoins: 0 },
  { name: 'Silver Clicker', minCoins: 500 },
  { name: 'Gold Tycoon', minCoins: 2500 },
  { name: 'Diamond Master', minCoins: 10000 },
  { name: 'Crypto Legend', minCoins: 50000 }
];

// Load YouTube API Player
function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    videoId: 'YOUR_VIDEO_ID', // Replace with your YouTube Video ID
    events: {
      'onStateChange': onPlayerStateChange
    }
  });
}

function onPlayerStateChange(event) {
  if (event.data == YT.PlayerState.PLAYING) {
    isVideoPlaying = true;
    startVideoTimer();
  } else {
    isVideoPlaying = false;
    stopVideoTimer();
  }
}

// Click Event
coinBtn.addEventListener('click', (e) => {
  if (currentEnergy >= tapPower) {
    coins += tapPower;
    currentEnergy -= tapPower;
    
    createFloatingText(e, `+${tapPower}`);
    
    if (currentEnergy <= 0) {
      currentEnergy = 0;
      triggerZeroEnergy();
    }

    updateUI();
    saveGame();
  } else {
    if (currentEnergy <= 0) {
      triggerZeroEnergy();
    }
  }
});

function triggerZeroEnergy() {
  if (!lastEnergyZeroTime) {
    lastEnergyZeroTime = new Date().getTime();
    localStorage.setItem('lastEnergyZeroTime', lastEnergyZeroTime);
  }
  openVideoModal();
}

// Floating Text
function createFloatingText(event, text) {
  const floatText = document.createElement('div');
  floatText.classList.add('floating-text');
  floatText.innerText = text;

  const rect = coinBtn.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  floatText.style.left = `${x}px`;
  floatText.style.top = `${y}px`;

  coinBtn.appendChild(floatText);

  setTimeout(() => floatText.remove(), 800);
}

// Modal Functions
function openVideoModal() {
  videoModal.classList.add('active');
  watchTimeLeft = 60;
  timerCountEl.innerText = watchTimeLeft;
  claimEnergyBtn.disabled = true;
}

function startVideoTimer() {
  if (videoTimerInterval) clearInterval(videoTimerInterval);

  videoTimerInterval = setInterval(() => {
    if (isVideoPlaying) {
      watchTimeLeft--;
      timerCountEl.innerText = watchTimeLeft;

      if (watchTimeLeft <= 0) {
        clearInterval(videoTimerInterval);
        claimEnergyBtn.disabled = false;
        timerCountEl.innerText = "Completed! Claim Energy Below";
      }
    }
  }, 1000);
}

function stopVideoTimer() {
  if (videoTimerInterval) clearInterval(videoTimerInterval);
}

// Claim Energy Button
claimEnergyBtn.addEventListener('click', () => {
  currentEnergy = maxEnergy;
  lastEnergyZeroTime = 0;
  localStorage.removeItem('lastEnergyZeroTime');
  videoModal.classList.remove('active');
  if (player && player.pauseVideo) player.pauseVideo();
  updateUI();
  saveGame();
});

// Like Button (+500 Clicks Bonus)
likeBtn.addEventListener('click', () => {
  const hasLiked = localStorage.getItem('hasLikedVideo');
  if (!hasLiked) {
    coins += 500;
    localStorage.setItem('hasLikedVideo', 'true');
    alert("🎉 Thank you! +500 Coins added to your balance!");
    updateUI();
    saveGame();
  } else {
    alert("You have already claimed your 500 Coins bonus!");
  }
});

// 1 Hour Countdown Loop
setInterval(() => {
  if (lastEnergyZeroTime > 0 && currentEnergy <= 0) {
    const now = new Date().getTime();
    const diff = now - lastEnergyZeroTime;
    const totalHourMs = 3600000; // 1 Hour

    if (diff >= totalHourMs) {
      currentEnergy = maxEnergy;
      lastEnergyZeroTime = 0;
      localStorage.removeItem('lastEnergyZeroTime');
      rechargeBox.style.display = 'none';
      updateUI();
      saveGame();
    } else {
      const remainingMs = totalHourMs - diff;
      const minutes = Math.floor(remainingMs / 60000);
      const seconds = Math.floor((remainingMs % 60000) / 1000);
      hourlyTimerEl.innerText = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
      rechargeBox.style.display = 'block';
    }
  } else {
    rechargeBox.style.display = 'none';
  }
}, 1000);

// Upgrades
function buyTapUpgrade() {
  if (coins >= tapUpgradeCost) {
    coins -= tapUpgradeCost;
    tapPower += 1;
    tapUpgradeCost = Math.floor(tapUpgradeCost * 1.5);
    updateUI();
    saveGame();
  }
}

function buyBotUpgrade() {
  if (coins >= botUpgradeCost) {
    coins -= botUpgradeCost;
    coinsPerSec += 2;
    botUpgradeCost = Math.floor(botUpgradeCost * 1.6);
    updateUI();
    saveGame();
  }
}

// Daily Reward
dailyBtn.addEventListener('click', () => {
  const lastClaim = localStorage.getItem('lastDailyClaim');
  const now = new Date().getTime();

  if (!lastClaim || now - lastClaim > 86400000) {
    coins += 250;
    localStorage.setItem('lastDailyClaim', now);
    alert(`🎉 Daily Bonus Claimed! +250 coins!`);
    updateUI();
    saveGame();
  } else {
    alert("⌛ Already claimed today! Check back tomorrow.");
  }
});

// UI Update
function updateUI() {
  coinCountEl.innerText = coins.toLocaleString();
  tpcCountEl.innerText = tapPower;
  ppsCountEl.innerText = coinsPerSec;
  
  currentEnergyEl.innerText = currentEnergy;
  maxEnergyEl.innerText = maxEnergy;
  
  const energyPercent = (currentEnergy / maxEnergy) * 100;
  energyFillEl.style.width = `${energyPercent}%`;

  tapCostEl.innerText = tapUpgradeCost;
  botCostEl.innerText = botUpgradeCost;

  let currentRank = ranks[0].name;
  for (let r of ranks) {
    if (coins >= r.minCoins) currentRank = r.name;
  }
  rankNameEl.innerText = currentRank;
}

// Auto Passive Income
setInterval(() => {
  if (coinsPerSec > 0) {
    coins += coinsPerSec;
    updateUI();
    saveGame();
  }
}, 1000);

// Save Game
function saveGame() {
  localStorage.setItem('coins', coins);
  localStorage.setItem('tapPower', tapPower);
  localStorage.setItem('coinsPerSec', coinsPerSec);
  localStorage.setItem('currentEnergy', currentEnergy);
  localStorage.setItem('tapUpgradeCost', tapUpgradeCost);
  localStorage.setItem('botUpgradeCost', botUpgradeCost);
}

// Initial Load
updateUI();
