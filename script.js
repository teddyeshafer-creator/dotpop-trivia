/* ===========================================
   Audio helper: MP3-first with TTS fallback
   =========================================== */
function speak(text) {
  if (!("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1;
    u.pitch = 1;
    u.lang = "en-US";
    window.speechSynthesis.speak(u);
  } catch (_) {}
}

function playAudioOrSpeak(src, fallbackText) {
  return new Promise((resolve) => {
    const audio = new Audio(src);
    let done = false;

    const finish = () => {
      if (done) return;
      done = true;
      resolve();
    };

    audio.onended = finish;
    audio.onerror = () => {
      speak(fallbackText);
      setTimeout(
        finish,
        Math.min(4000, Math.max(1200, fallbackText.length * 50))
      );
    };

    audio.play().catch(() => audio.onerror());
  });
}

/* ===========================================
   Question / Answer Bank
   =========================================== */
const BANK = {
  Space: {
    questions: [
      { id: "Q1", text: "The Sun is a star.", answerId: "A1" },
      { id: "Q2", text: "Saturn has visible rings.", answerId: "A2" },
      { id: "Q3", text: "A black hole pulls in light.", answerId: "A3" },
      { id: "Q4", text: "The Moon affects Earth's tides.", answerId: "A4" },
    ],
    answers: [
      { id: "A1", text: "The Sun is a massive ball of plasma generating energy." },
      { id: "A2", text: "Saturn's rings are made of ice and rock particles." },
      { id: "A3", text: "Black holes have gravity so strong even light can't escape." },
      { id: "A4", text: "The Moon's gravity pulls on Earth's oceans, creating tides." },
    ],
  },

  Animals: {
    questions: [
      { id: "Q1", text: "A cheetah is the fastest land animal.", answerId: "A1" },
      { id: "Q2", text: "Octopuses have three hearts.", answerId: "A2" },
      { id: "Q3", text: "Dolphins are highly intelligent.", answerId: "A3" },
      { id: "Q4", text: "Owls can rotate their heads far around.", answerId: "A4" },
    ],
    answers: [
      { id: "A1", text: "Cheetahs can reach speeds over 60 mph in short bursts." },
      { id: "A2", text: "Octopuses use three hearts to pump blood efficiently." },
      { id: "A3", text: "Dolphins show problem-solving and social intelligence." },
      { id: "A4", text: "Owls can rotate their heads about 270 degrees." },
    ],
  },

  Food: {
    questions: [
      { id: "Q1", text: "Pizza originated in Italy.", answerId: "A1" },
      { id: "Q2", text: "Chocolate comes from cacao beans.", answerId: "A2" },
      { id: "Q3", text: "Sushi often includes raw fish.", answerId: "A3" },
      { id: "Q4", text: "Honey never spoils.", answerId: "A4" },
    ],
    answers: [
      { id: "A1", text: "Modern pizza traces back to Naples, Italy." },
      { id: "A2", text: "Chocolate is made from fermented cacao beans." },
      { id: "A3", text: "Sushi commonly features raw seafood and rice." },
      { id: "A4", text: "Honey's chemistry prevents bacteria growth indefinitely." },
    ],
  },

  Tech: {
    questions: [
      { id: "Q1", text: "AI can learn from data.", answerId: "A1" },
      { id: "Q2", text: "The internet connects computers globally.", answerId: "A2" },
      { id: "Q3", text: "Smartphones combine multiple devices in one.", answerId: "A3" },
      { id: "Q4", text: "Cloud storage saves data online.", answerId: "A4" },
    ],
    answers: [
      { id: "A1", text: "AI models improve by analyzing patterns in data." },
      { id: "A2", text: "The internet is a global network linking devices." },
      { id: "A3", text: "Phones act as cameras, computers, and communication tools." },
      { id: "A4", text: "Cloud storage keeps files accessible via the internet." },
    ],
  },

  FunFacts: {
    questions: [
      { id: "Q1", text: "Bananas are slightly radioactive.", answerId: "A1" },
      { id: "Q2", text: "Sharks existed before trees.", answerId: "A2" },
      { id: "Q3", text: "There are more stars than grains of sand.", answerId: "A3" },
      { id: "Q4", text: "A day on Venus is longer than a year.", answerId: "A4" },
    ],
    answers: [
      { id: "A1", text: "Bananas contain potassium, which emits small radiation." },
      { id: "A2", text: "Sharks date back over 400 million years." },
      { id: "A3", text: "The universe contains vastly more stars than sand grains." },
      { id: "A4", text: "Venus rotates so slowly its day exceeds its orbit." },
    ],
  },
};

/* ================================
   Helpers / Globals
   ================================ */
const categories = Object.keys(BANK);
const categoryColumns = document.getElementById("categoryColumns");

let correctCount = 0;
let incorrectCount = 0;
const answered = new Set();
const categoryProgress = {}; // Track completion per category

// Streak
let streakCount = 0;
let maxStreak = 0;

// Processing state
let isProcessing = false; // Prevent double-clicks

// Timer
let timerInterval = null;
let timerSeconds = 0;
let timerStarted = false;

function startTimer() {
  if (timerStarted) return;
  timerStarted = true;
  timerInterval = setInterval(() => {
    timerSeconds++;
    const m = Math.floor(timerSeconds / 60);
    const s = String(timerSeconds % 60).padStart(2, "0");
    const el = document.getElementById("hudTimer");
    if (el) el.textContent = `${m}:${s}`;
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

/* ================================
   Difficulty + Storage
   ================================ */
function loadBestScores() {
  const best = localStorage.getItem("dotpopBest");
  return best ? JSON.parse(best) : { time: null, accuracy: null };
}

function saveBestScores(time, accuracy) {
  const best = loadBestScores();
  let updated = false;
  if (!best.time || time < best.time) { best.time = time; updated = true; }
  if (!best.accuracy || accuracy > best.accuracy) { best.accuracy = accuracy; updated = true; }
  if (updated) localStorage.setItem("dotpopBest", JSON.stringify(best));
  return best;
}

function displayBestScores() {
  const best = loadBestScores();
  const el = document.getElementById("bestScores");
  if (el) {
    const timeStr = best.time ? `${Math.floor(best.time / 60)}:${String(best.time % 60).padStart(2, "0")}` : "—";
    const accStr = best.accuracy ? `${best.accuracy}%` : "—";
    document.getElementById("bestTime").textContent = timeStr;
    document.getElementById("bestAccuracy").textContent = accStr;
    el.style.display = best.time || best.accuracy ? "block" : "none";
  }
}

/* ================================
   Hint system
   ================================ */
window.useHint = function() {
  // Hint disabled - removed per user request
};

/* ================================
   Web Audio feedback (no external files)
   ================================ */
function _getAudioCtx() {
  if (!window._dotpopAudioCtx) {
    try {
      window._dotpopAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (_) {}
  }
  return window._dotpopAudioCtx || null;
}

function playCorrectSound() {
  const ctx = _getAudioCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = "sine";
  osc.frequency.setValueAtTime(520, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
  gain.gain.setValueAtTime(0.18, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.35);
}

function playIncorrectSound() {
  const ctx = _getAudioCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(200, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 0.25);
  gain.gain.setValueAtTime(0.1, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.28);
}

/* ================================
   Dot animation helpers
   ================================ */
function animateDot(dot, cls) {
  dot.classList.remove(cls);
  void dot.offsetWidth; // force reflow
  dot.classList.add(cls);
  dot.addEventListener("animationend", () => dot.classList.remove(cls), { once: true });
}

function drawMatchLine(dotA, dotB) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.classList.add("match-line-svg");
  const rA = dotA.getBoundingClientRect();
  const rB = dotB.getBoundingClientRect();
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", String(rA.left + rA.width / 2));
  line.setAttribute("y1", String(rA.top + rA.height / 2));
  line.setAttribute("x2", String(rB.left + rB.width / 2));
  line.setAttribute("y2", String(rB.top + rB.height / 2));
  svg.appendChild(line);
  document.body.appendChild(svg);
  requestAnimationFrame(() => requestAnimationFrame(() => {
    line.style.opacity = "0";
    setTimeout(() => svg.remove(), 800);
  }));
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Modal
const modal = document.createElement("div");
modal.className = "card-modal";
modal.style.display = "none";
document.body.appendChild(modal);

let pendingChoice = null;

// Build question text, shuffled answers, and correctness map
const QUESTIONS_TEXT = {};
const ANSWERS_BANK = {};
const CORRECT_POS = {};

// Set HUD total (script runs at end of body, DOM is ready)
(function () {
  const total = Object.values(BANK).reduce((s, c) => s + c.questions.length, 0);
  const el = document.getElementById("hudTotal");
  if (el) el.textContent = String(total);
})();

for (const cat of categories) {
  const { questions, answers } = BANK[cat];

  QUESTIONS_TEXT[cat] = {};
  questions.forEach((q) => (QUESTIONS_TEXT[cat][q.id] = q.text));

  let shuffled = shuffle([...answers]);
  
  ANSWERS_BANK[cat] = shuffled;
  categoryProgress[cat] = 0;

  const idxById = new Map(shuffled.map((a, i) => [a.id, i]));
  CORRECT_POS[cat] = {};
  questions.forEach(
    (q) => (CORRECT_POS[cat][q.id] = idxById.get(q.answerId) ?? -1)
  );
}

/* ================================
   Build UI (with stagger delay)
   ================================ */
categories.forEach((cat, idx) => {
  const column = document.createElement("div");
  column.className = "category-column";
  column.dataset.category = cat;
  column.dataset.selectedQ = "";
  column.style.animationDelay = `${idx * 40}ms`;

  const header = document.createElement("h3");
  header.textContent = cat;
  header.style.color = "#00ff99";
  header.style.marginBottom = "6px";
  column.appendChild(header);

  // QUESTIONS
  const questionDots = document.createElement("div");
  questionDots.className = "answer-dots";

  BANK[cat].questions.forEach(({ id: qKey }) => {
    const qDot = document.createElement("div");
    qDot.className = "dot";
    qDot.innerText = qKey;
    qDot.dataset.q = qKey;

    qDot.addEventListener("click", () => {
      if (isProcessing) return;
      startTimer();
      questionDots
        .querySelectorAll(".dot")
        .forEach((d) => d.classList.remove("active"));
      qDot.classList.add("active");
      column.dataset.selectedQ = qKey;

      const questionText = QUESTIONS_TEXT[cat][qKey];
      modal.innerHTML = `
<button class="close-btn" onclick="hideModal()">×</button>
<h3>${qKey}</h3>
<p><strong>Question:</strong><br>${questionText}</p>
`;
      modal.style.display = "block";
      playAudioOrSpeak(`audio/${cat}-${qKey}.mp3`, questionText);
    });

    questionDots.appendChild(qDot);
  });
  column.appendChild(questionDots);

  // ANSWERS
  const answersWrap = document.createElement("div");
  answersWrap.className = "answer-dots";

  ANSWERS_BANK[cat].forEach((aObj, j) => {
    const aDot = document.createElement("div");
    aDot.className = "dot";
    aDot.innerText = `A${j + 1}`;
    aDot.dataset.aIndex = String(j);

    aDot.addEventListener("click", () => {
      if (isProcessing) return;
      const activeQ = column.dataset.selectedQ;
      if (!activeQ)
        return alert("Select a question in this category first.");
      if (aDot.classList.contains("glowing")) return;

      const aText = aObj.text;
      pendingChoice = { column, aDot, category: cat, activeQ, aIndex: j };

      modal.innerHTML = `
<button class="close-btn" onclick="hideModal()">×</button>
<h3>Answer ${j + 1}</h3>
<p>${aText}</p>
<button class="play-again-btn" onclick="chooseAnswerFromModal()">Choose This Answer</button>
`;
      modal.style.display = "block";
      playAudioOrSpeak(`audio/${cat}-${aObj.id}.mp3`, aText);
    });

    answersWrap.appendChild(aDot);
  });

  column.appendChild(answersWrap);
  categoryColumns.appendChild(column);
});

/* ================================
   Modal + Game Logic
   ================================ */
function hideModal() {
  modal.style.display = "none";
}
window.hideModal = hideModal;

function chooseAnswerFromModal() {
  if (!pendingChoice || isProcessing) return hideModal();
  isProcessing = true;

  const { column, aDot, category, activeQ, aIndex } = pendingChoice;

  const selectedQDot = Array.from(column.querySelectorAll(".dot")).find(
    (d) => d.classList.contains("active") && d.innerText === activeQ
  );

  if (!selectedQDot) {
    pendingChoice = null;
    return hideModal();
  }

  const isCorrect = CORRECT_POS[category][activeQ] === aIndex;

  if (isCorrect) {
    aDot.classList.add("glowing");
    aDot.style.pointerEvents = "none";

    selectedQDot.classList.add("glowing");
    selectedQDot.classList.remove("active");
    selectedQDot.style.pointerEvents = "none";

    animateDot(aDot, "pop");
    animateDot(selectedQDot, "pop");
    drawMatchLine(selectedQDot, aDot);
    playCorrectSound();
    speak("Correct");

    correctCount++;
    streakCount++;
    if (streakCount > maxStreak) maxStreak = streakCount;
    categoryProgress[category]++;
    column.dataset.selectedQ = "";
    
    // Check if category is complete
    if (categoryProgress[category] === BANK[category].questions.length) {
      column.classList.add("complete");
    }
  } else {
    selectedQDot.classList.add("incorrect");
    selectedQDot.classList.remove("active");
    selectedQDot.style.pointerEvents = "none";
    column.dataset.selectedQ = "";

    animateDot(selectedQDot, "shake");
    animateDot(aDot, "shake");
    playIncorrectSound();
    speak("Incorrect");

    streakCount = 0;
    incorrectCount++;
  }
  answered.add(`${category}-${activeQ}`);

  pendingChoice = null;
  hideModal();
  setTimeout(() => {
    isProcessing = false;
    updateStats();
    checkForWin();
  }, 300);
}
window.chooseAnswerFromModal = chooseAnswerFromModal;

function updateStats() {
  // Legacy element
  const el = document.getElementById("matchStats");
  if (el) el.innerText = `Correct: ${correctCount} | Incorrect: ${incorrectCount}`;

  // HUD
  const hc = document.getElementById("hudCorrect");
  const hi = document.getElementById("hudIncorrect");
  const hm = document.getElementById("hudMatches");
  const hs = document.getElementById("hudStreak");
  const hsi = document.getElementById("hudStreakItem");
  if (hc) hc.textContent = String(correctCount);
  if (hi) hi.textContent = String(incorrectCount);
  if (hm) hm.textContent = String(answered.size);
  if (hs) hs.textContent = streakCount > 0 ? `🔥 ${streakCount}` : "—";
  if (hsi) hsi.classList.toggle("streak-hot", streakCount >= 3);
}

function checkForWin() {
  const totalQs = categories.reduce(
    (sum, c) => sum + BANK[c].questions.length,
    0
  );
  if (answered.size === totalQs) {
    stopTimer();
    setTimeout(showCompletionModal, 400);
  }
}

function showCompletionModal() {
  const totalQs = categories.reduce((s, c) => s + BANK[c].questions.length, 0);
  const m = Math.floor(timerSeconds / 60);
  const s = String(timerSeconds % 60).padStart(2, "0");
  const timeStr = `${m}:${s}`;
  const accuracy = Math.round((correctCount / totalQs) * 100);
  const isPerfect = incorrectCount === 0;
  const title = isPerfect ? "🎉 Perfect Run!" : accuracy >= 80 ? "😊 Nice Work!" : "🏁 Round Complete";

  saveBestScores(timerSeconds, accuracy);

  const overlay = document.createElement("div");
  overlay.className = "completion-modal";
  overlay.id = "completionModal";
  overlay.innerHTML = `
    <div class="completion-card">
      <h2>${title}</h2>
      <p class="completion-sub">${isPerfect
        ? "You matched every answer correctly!"
        : `Accuracy: ${accuracy}%`}</p>
      <div class="completion-stats">
        <div class="stat-box">
          <span class="stat-label">Time</span>
          <span class="stat-value">${timeStr}</span>
        </div>
        <div class="stat-box">
          <span class="stat-label">Accuracy</span>
          <span class="stat-value" style="color:#00ff99">${accuracy}%</span>
        </div>
        <div class="stat-box">
          <span class="stat-label">Streak</span>
          <span class="stat-value" style="color:${maxStreak >= 3 ? "#ff9900" : "#00ff99"}">${maxStreak >= 3 ? "🔥 " : ""}${maxStreak}</span>
        </div>
      </div>
      <button class="play-again-btn" onclick="location.reload()">Play Again</button>
    </div>
  `;
  document.body.appendChild(overlay);
}
window.showCompletionModal = showCompletionModal;

document.getElementById("playAgainBtn")?.addEventListener("click", () => {
  window.location.reload();
});

function resetGame() {
  window.location.reload();
}
window.resetGame = resetGame;

// Initialize
displayBestScores();
