// Game Variables
let coins = parseInt(localStorage.getItem('coins')) || 0;
let tapPower = parseInt(localStorage.getItem('tapPower')) || 1;
let coinsPerSec = parseInt(localStorage.getItem('coinsPerSec')) || 0;

let maxEnergy = 100; // Fixed Max Energy = 100
let currentEnergy = parseInt(localStorage.getItem('currentEnergy'));
if (isNaN(currentEnergy)) {
  currentEnergy = 100;
}

let tapUpgradeCost = parseInt(localStorage.getItem('tapUpgradeCost')) || 10;
let botUpgradeCost = parseInt(localStorage.getItem('botUpgradeCost')) || 50;

let countdownTimer = null;
let timeLeft = 60;

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

const videoModal = document.getElementById('video-modal');
const timerCountEl = document.getElementById('timer-count');
const claimEnergyBtn = document.getElementById('claim-energy-btn');

// Ranks Array
const ranks = [
  { name: 'Bronze Miner', minCoins: 0 },
  { name: 'Silver Clicker', minCoins: 500 },
  { name: 'Gold Tycoon', minCoins: 2500 },
  { name: 'Diamond Master', minCoins: 10000 },
  { name: 'Crypto Legend', minCoins: 50000 }
];

// Tap Event Listener
coinBtn.addEventListener('click', (e) => {
  if (currentEnergy >= tapPower) {
    coins += tapPower;
    currentEnergy -= tapPower;
    
    createFloatingText(e, `+${tapPower}`);
    updateUI();
    saveGame();

    // Trigger Video Modal when Energy runs out
    if (currentEnergy < tapPower) {
      openVideoModal();
    }
  } else {
    openVideoModal();
  }
});

// Floating Text Animation
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

  setTimeout(() => {
    floatText.remove();
  }, 800);
}

// Modal Popup & 60 Seconds Timer
function openVideoModal() {
  videoModal.classList.add('active');
  timeLeft = 60;
  timerCountEl.innerText = timeLeft;
  claimEnergyBtn.disabled = true;

  clearInterval(countdownTimer);
  countdownTimer = setInterval(() => {
    timeLeft--;
    timerCountEl.innerText = timeLeft;

    if (timeLeft <= 0) {
      clearInterval(countdownTimer);
      claimEnergyBtn.disabled = false;
      timerCountEl.innerText = "Completed!";
    }
  }, 1000);
}

// Claim Energy Button Click
claimEnergyBtn.addEventListener('click', () => {
  currentEnergy = maxEnergy;
  videoModal.classList.remove('active');
  updateUI();
  saveGame();
});

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

// Daily Reward Claim
dailyBtn.addEventListener('click', () => {
  const lastClaim = localStorage.getItem('lastDailyClaim');
  const now = new Date().getTime();

  if (!lastClaim || now - lastClaim > 86400000) {
    const reward = 250;
    coins += reward;
    localStorage.setItem('lastDailyClaim', now);
    alert(`🎉 Daily Bonus Claimed! You got ${reward} coins!`);
    updateUI();
    saveGame();
  } else {
    alert("⌛ You have already claimed your bonus today! Check back tomorrow.");
  }
});

// UI Update Function
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

  // Rank Update
  let currentRank = ranks[0].name;
  for (let r of ranks) {
    if (coins >= r.minCoins) {
      currentRank = r.name;
    }
  }
  rankNameEl.innerText = currentRank;
}

// Passive Income Loop (Auto Bot Coins)
setInterval(() => {
  if (coinsPerSec > 0) {
    coins += coinsPerSec;
    updateUI();
    saveGame();
  }
}, 1000);

// Local Storage Save Function
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
