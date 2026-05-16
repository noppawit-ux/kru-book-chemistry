// ════════════════════════════════════════
//  quest.js — ระบบ Quest และ Weekly Challenge
//  ใช้ S (state), expBonus(), goldBonus(),
//  questCoinBonus(), addExp(), addCoins(),
//  checkLvUp(), updateUI(), toast()
// ════════════════════════════════════════

const QUESTS = [
  {text:'ส่งการบ้านวันนี้ให้ครูบุ๊ค',        exp:30, coins:10},
  {text:'ถามคำถามในห้องเรียน 1 ครั้ง',        exp:20, coins:5},
  {text:'ช่วยเพื่อนแก้โจทย์เคมี 1 ข้อ',      exp:40, coins:15},
  {text:'อ่านบทเรียนก่อนเข้าห้อง',            exp:25, coins:8},
  {text:'เขียน note สรุปเนื้อหาวันนี้',       exp:15, coins:5},
];

const WEEKLY = [
  {text:'ทำ Quiz ครบทุกวัน 5 วัน',           exp:200, coins:50},
  {text:'เล่นเกม Element Matching คะแนน >80', exp:150, coins:40},
  {text:'ทำ Daily Quest ครบทุกข้อ 3 วัน',    exp:180, coins:45},
];

function renderQuests() {
  const div = document.getElementById('quest-list');
  if (!div) return;
  div.innerHTML = QUESTS.map((q, idx) => {
    const done = S.quests[idx];
    return `<div class="qr-row">
      <div class="qr-chk ${done ? 'done' : ''}" onclick="${done ? '' : 'toggleQuest(' + idx + ')'}">${done ? '✓' : ''}</div>
      <div class="qr-tx ${done ? 'done' : ''}">${q.text}</div>
      <div class="qr-rw">💎 +${q.exp} EXP / 🪙 +${q.coins}</div>
    </div>`;
  }).join('');

  const wk = document.getElementById('wk-list');
  if (!wk) return;
  const questsDoneToday = S.quests.filter(Boolean).length;
  wk.innerHTML = WEEKLY.map((w, i) => {
    const prog = i === 0 ? S.streak + '/5 วัน'
               : i === 1 ? (S.gScore >= 80 ? '✅ สำเร็จ' : 'ยังไม่ถึง 80 คะแนน')
               : questsDoneToday + '/5 ข้อวันนี้';
    return `<div class="wk-row">
      <span style="font-size:18px">🌟</span>
      <div style="flex:1;font-size:11px;line-height:1.5">
        ${w.text}
        <div style="font-size:10px;color:var(--text2);margin-top:2px">${prog}</div>
      </div>
      <div style="font-size:10px;color:var(--gold);font-weight:700;white-space:nowrap">
        💎 +${w.exp}<br>🪙 +${w.coins}
      </div>
    </div>`;
  }).join('');
}

function toggleQuest(idx) {
  if (S.quests[idx]) return;
  S.quests[idx] = true;
  const q = QUESTS[idx];
  const expGain  = expBonus(q.exp);
  const coinGain = goldBonus(questCoinBonus(q.coins));
  addExp(q.exp);
  addCoins(coinGain);
  S.quest_done++;
  toast('✅ เควสสำเร็จ! +' + expGain + ' EXP 🪙' + coinGain);
  checkLvUp();
  updateUI();
  // เช็ค Weekly Quest ครบ 5 ข้อ
  if (S.quests.filter(Boolean).length === 5 && !S._weeklyQuestClaimed) {
    S._weeklyQuestClaimed = true;
    setTimeout(() => {
      addExp(WEEKLY[2].exp);
      addCoins(WEEKLY[2].coins);
      toast('🌟 Weekly Quest! ทำครบ 5 ข้อ +' + WEEKLY[2].exp + ' EXP');
    }, 800);
  }
  renderQuests();
}
