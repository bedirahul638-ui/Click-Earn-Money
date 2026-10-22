// Game Variables (Loaded from LocalStorage if exists)
let coins = parseInt(localStorage.getItem('coins')) || 0;
let tapPower = parseInt(localStorage.getItem('tapPower')) || 1;
let coinsPerSec = parseInt(localStorage.getItem('coinsPerSec')) || 0;

let currentEnergy = parseInt(localStorage.getItem('currentEnergy')) || 1000;
let maxEnergy = parseInt(localStorage.getItem('maxEnergy')) || 1000;

let tapUpgradeCost = parseInt(localStorage.getItem('tapUpgradeCost')) || 10;
let botUpgradeCost = parseInt(localStorage.getItem('botUpgradeCost')) || 50;
let energyUpgradeCost = parseInt(localStorage.getItem('energyUpgradeCost')) || 100;

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
const energyCostEl = document.getElementById('energy-cost');

const coinBtn = document.getElementById('coin-btn');
const dailyBtn = document.getElementById('daily-reward-btn');

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
  }
});

// Create Floating Text Effect (+1, +2)
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

// Upgrade Functions
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

function buyEnergyUpgrade() {
  if (coins >= energyUpgradeCost) {
    coins -= energyUpgradeCost;
    maxEnergy += 500;
    currentEnergy = maxEnergy;
    energyUpgradeCost = Math.floor(energyUpgradeCost * 1.8);
    updateUI();
    saveGame();
  }
}

// Daily Reward Claim
dailyBtn.addEventListener('click', () => {
  const lastClaim = localStorage.getItem('lastDailyClaim');
  const now = new Date().getTime();

  // 24 Hours = 86400000 ms
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

// Update UI
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
  energyCostEl.innerText = energyUpgradeCost;

  // Rank Update Logic
  let currentRank = ranks[0].name;
  for (let r of ranks) {
    if (coins >= r.minCoins) {
      currentRank = r.name;
    }
  }
  rankNameEl.innerText = currentRank;
}

// Passive Income & Energy Regeneration Loop (Runs every second)
setInterval(() => {
  // Auto Bot Earnings
  if (coinsPerSec > 0) {
    coins += coinsPerSec;
  }

  // Energy Regeneration (+3 per sec)
  if (currentEnergy < maxEnergy) {
    currentEnergy = Math.min(maxEnergy, currentEnergy + 3);
  }

  updateUI();
  saveGame();
}, 1000);

// Local Storage Save
function saveGame() {
  localStorage.setItem('coins', coins);
  localStorage.setItem('tapPower', tapPower);
  localStorage.setItem('coinsPerSec', coinsPerSec);
  localStorage.setItem('currentEnergy', currentEnergy);
  localStorage.setItem('maxEnergy', maxEnergy);
  localStorage.setItem('tapUpgradeCost', tapUpgradeCost);
  localStorage.setItem('botUpgradeCost', botUpgradeCost);
  localStorage.setItem('energyUpgradeCost', energyUpgradeCost);
}

// Initial Load
updateUI();
