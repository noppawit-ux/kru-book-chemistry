// ════════════════════════════════════════
//  minigame.js — Element Matching Game
//  ใช้ S (state), addExp(), addCoins(),
//  toast()
// ════════════════════════════════════════

const ELEMENTS = [
  {n:'ไฮโดรเจน', s:'H',  z:1},   {n:'ออกซิเจน',  s:'O',  z:8},
  {n:'คาร์บอน',  s:'C',  z:6},   {n:'โซเดียม',   s:'Na', z:11},
  {n:'คลอรีน',   s:'Cl', z:17},  {n:'เหล็ก',     s:'Fe', z:26},
  {n:'ทอง',      s:'Au', z:79},  {n:'ฮีเลียม',   s:'He', z:2},
  {n:'แคลเซียม', s:'Ca', z:20},  {n:'ไนโตรเจน',  s:'N',  z:7},
  {n:'กำมะถัน',  s:'S',  z:16},  {n:'ฟอสฟอรัส',  s:'P',  z:15},
  {n:'แมกนีเซียม',s:'Mg',z:12},  {n:'อะลูมิเนียม',s:'Al', z:13},
  {n:'ซิลิคอน',  s:'Si', z:14},  {n:'ฟลูออรีน',  s:'F',  z:9},
];

// EXP สูตรคำนวณ
const GAME_EXP_PER_PAIR  = 15;  // EXP ต่อคู่ที่จับได้
const GAME_EXP_TIME_BONUS = 2;  // EXP ต่อวินาทีที่เหลือ (ถ้าครบ)
const GAME_GOLD_RATIO     = 5;  // EXP หาร X = Gold ที่ได้

// ─── State เฉพาะ game (ไม่ผสม S เพื่อความสะอาด) ───────────
const G = {
  running:  false,
  timer:    60,
  score:    0,
  pairs:    0,
  selL:     null,
  selR:     null,
  matched:  new Set(),
  timerInt: null,
  round:    0,      // round ในการเล่นครั้งนี้ (reset board เมื่อครบ 4 คู่)
};

function shuffle(arr) { return [...arr].sort(() => Math.random() - .5); }

function startGame() {
  if (G.running) return;
  clearInterval(G.timerInt);

  // reset G
  G.running = true;
  G.timer   = 60;
  G.score   = 0;
  G.pairs   = 0;
  G.selL    = null;
  G.selR    = null;
  G.matched = new Set();
  G.round   = 0;

  document.getElementById('g-res').style.display  = 'none';
  document.getElementById('g-area').style.display = 'grid';
  document.getElementById('g-btn').textContent    = '⏸ กำลังเล่น...';
  document.getElementById('g-btn').disabled       = true;
  document.getElementById('g-msg').textContent    = 'เลือกชื่อธาตุซ้าย → จับคู่สัญลักษณ์ขวา';

  _renderBoard();
  _updateHUD();

  G.timerInt = setInterval(() => {
    G.timer--;
    document.getElementById('g-tm').textContent = G.timer;
    if (G.timer <= 0) endGame();
  }, 1000);
}

function _renderBoard() {
  const pool  = shuffle(ELEMENTS).slice(0, 4);
  const left  = shuffle(pool);
  const right = shuffle(pool);
  G.matched   = new Set();
  G.selL      = null;
  G.selR      = null;

  document.getElementById('g-left').innerHTML = left.map((el, i) =>
    `<div class="tile" id="L${i}" onclick="selectTile('L',${i},'${el.s}')">
      <div class="el-nm">${el.n}</div>
      <div class="el-n">Z = ${el.z}</div>
    </div>`
  ).join('');

  document.getElementById('g-right').innerHTML = right.map((el, i) =>
    `<div class="tile" id="R${i}" onclick="selectTile('R',${i},'${el.s}')">
      <div class="el-sym">${el.s}</div>
    </div>`
  ).join('');
}

function _updateHUD() {
  document.getElementById('g-sc').textContent = G.score;
  document.getElementById('g-pr').textContent = G.pairs;
  document.getElementById('g-tm').textContent = G.timer;
}

function selectTile(side, idx, sym) {
  if (!G.running || G.matched.has(sym)) return;
  const el = document.getElementById(side + idx);
  if (!el || el.classList.contains('matched')) return;

  if (side === 'L') {
    document.querySelectorAll('#g-left .tile').forEach(t => t.classList.remove('sel'));
    el.classList.add('sel');
    G.selL = { idx, sym };
  } else {
    document.querySelectorAll('#g-right .tile').forEach(t => t.classList.remove('sel'));
    el.classList.add('sel');
    G.selR = { idx, sym };
  }

  if (!G.selL || !G.selR) return;

  if (G.selL.sym === G.selR.sym) {
    // ✅ ถูก
    document.getElementById('L' + G.selL.idx).classList.replace('sel', 'matched');
    document.getElementById('R' + G.selR.idx).classList.replace('sel', 'matched');
    G.matched.add(G.selL.sym);
    G.pairs++;
    G.score += GAME_EXP_PER_PAIR;
    G.selL = G.selR = null;
    _updateHUD();
    document.getElementById('g-msg').textContent = '🎯 ถูกต้อง! (' + G.pairs % 4 + '/4)';

    if (G.matched.size === 4) {
      // ครบ 4 คู่ → รอบถัดไป
      G.score += 10; // โบนัสครบรอบ
      G.round++;
      document.getElementById('g-msg').textContent = '🎉 ครบรอบที่ ' + G.round + '! +10 โบนัส → รอบต่อไป';
      setTimeout(() => {
        if (G.running) _renderBoard();
      }, 700);
    }
  } else {
    // ❌ ผิด
    document.getElementById('g-msg').textContent = '❌ ไม่ตรงกัน ลองใหม่';
    const lEl = document.getElementById('L' + G.selL.idx);
    const rEl = document.getElementById('R' + G.selR.idx);
    lEl.classList.add('shake');
    rEl.classList.add('shake');
    G.selL = G.selR = null;
    setTimeout(() => {
      lEl.classList.remove('sel', 'shake');
      rEl.classList.remove('sel', 'shake');
      document.getElementById('g-msg').textContent = 'เลือกชื่อธาตุซ้าย → จับคู่สัญลักษณ์ขวา';
    }, 380);
  }
}

function endGame() {
  clearInterval(G.timerInt);
  G.running = false;

  document.getElementById('g-area').style.display = 'none';
  document.getElementById('g-btn').textContent    = '▶ เริ่มเกมใหม่';
  document.getElementById('g-btn').disabled       = false;

  // คะแนนสุดท้าย: score + เวลาที่เหลือ (ถ้า score > 0)
  const timeBonus = (G.pairs > 0 && G.pairs % 4 === 0)
    ? G.timer * GAME_EXP_TIME_BONUS
    : 0;
  const totalExp  = G.score + timeBonus;
  const totalGold = Math.round(totalExp / GAME_GOLD_RATIO);

  const res = document.getElementById('g-res');
  res.style.display = 'block';
  res.innerHTML = `
    <div style="font-size:36px;margin-bottom:8px">${G.pairs >= 4 ? '🏆' : '⏱️'}</div>
    <div style="font-family:'Cinzel',serif;color:var(--gold);font-size:16px;margin-bottom:8px">
      ${G.pairs >= 4 ? 'ครบรอบที่ ' + G.round + '!' : 'หมดเวลา!'}
    </div>
    <div style="font-size:12px;color:var(--text2);line-height:2">
      จับคู่ถูก: ${G.pairs} คู่ &nbsp;|&nbsp;
      คะแนน: ${G.score} &nbsp;|&nbsp;
      โบนัสเวลา: +${timeBonus}<br>
      <span style="color:var(--teal);font-weight:700;font-size:14px">
        รับ +${totalExp} EXP และ 🪙${totalGold}
      </span>
    </div>`;

  if (totalExp > 0) {
    addExp(totalExp);
    addCoins(totalGold);
    toast('🎮 จบเกม! รับ +' + totalExp + ' EXP 🪙' + totalGold);
  }
  S.dirty = true;

  // บันทึก highscore เพื่อ Weekly Quest
  if (!S.gScore || G.score > S.gScore) S.gScore = G.score;
}
