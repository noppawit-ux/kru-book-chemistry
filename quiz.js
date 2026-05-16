// ════════════════════════════════════════
//  quiz.js — ระบบ Daily Chemistry Quiz
//  ใช้ S (state), addExp(), addCoins(),
//  updateUI(), savePlayer(), toast()
// ════════════════════════════════════════

const QUIZZES = [
  {q:'ธาตุใดมีสัญลักษณ์ทางเคมีว่า "Au"?',
   opts:['ทองแดง','ทอง','เงิน','อาร์กอน'],
   a:1, ex:'Au มาจากภาษาละติน Aurum = ทอง'},
  {q:'อะตอมของคาร์บอน (C) มีเลขอะตอมเท่าไร?',
   opts:['4','6','8','12'],
   a:1, ex:'คาร์บอนมีโปรตอน 6 ตัว เลขอะตอม = 6'},
  {q:'สูตรทางเคมีของน้ำคืออะไร?',
   opts:['H₂O₂','CO₂','H₂O','NaCl'],
   a:2, ex:'น้ำ = H₂O มี H 2 อะตอม + O 1 อะตอม'},
  {q:'Noble Gas ข้อใดมีมากสุดในบรรยากาศโลก?',
   opts:['He','Ne','Ar','Kr'],
   a:2, ex:'อาร์กอน ~0.93% มากสุดในกลุ่ม Noble Gas'},
  {q:'pH ของสารที่เป็นกลางเท่าใด?',
   opts:['0','7','14','3'],
   a:1, ex:'pH 7 = กลาง, pH < 7 = กรด, pH > 7 = เบส'},
  {q:'พันธะโคเวเลนต์คืออะไร?',
   opts:['ถ่ายโอนอิเล็กตรอน','ใช้อิเล็กตรอนร่วมกัน','แรงดึงดูดของโลหะ','แรงแวนเดอร์วาลส์'],
   a:1, ex:'โคเวเลนต์ = 2 อะตอมใช้อิเล็กตรอนร่วมกัน'},
  {q:'โซเดียม (Na) อยู่ในหมู่ที่เท่าไรของตารางธาตุ?',
   opts:['หมู่ 2','หมู่ 1','หมู่ 7','หมู่ 17'],
   a:1, ex:'Na อยู่หมู่ 1 Alkali Metals มีเวเลนซ์ e⁻ = 1'},
  {q:'NaCl ละลายน้ำได้ไอออนอะไร?',
   opts:['Na⁺ และ Cl⁻','Na⁻ และ Cl⁺','Na และ Cl','NaCl เท่านั้น'],
   a:0, ex:'NaCl → Na⁺ + Cl⁻ เมื่อละลายน้ำ'},
  {q:'CH₄ มีรูปร่างโมเลกุลแบบใด?',
   opts:['เส้นตรง','V-shape','Tetrahedral','Trigonal planar'],
   a:2, ex:'C ตรงกลาง + H 4 ตัว = Tetrahedral'},
  {q:'ปฏิกิริยา 2H₂O → 2H₂ + O₂ เป็นประเภทใด?',
   opts:['การรวมตัว','การสลายตัว','การแทนที่','การสะเทิน'],
   a:1, ex:'สารหนึ่งแตกออกเป็นหลายสาร = Decomposition'},
];

// EXP และ Gold ที่ได้ต่อข้อ
const QUIZ_EXP_PER_Q  = 50;
const QUIZ_GOLD_PER_Q = 10;

let quizOrder = [];

function initQuiz() {
  const area = document.getElementById('qz-area');
  const done = document.getElementById('qz-done');
  if (S.quiz_finished) {
    area.style.display = 'none';
    done.style.display = 'block';
    document.getElementById('qz-sum').textContent =
      `คุณทำถูก ${S.quizScore}/${QUIZZES.length} ข้อ (+${S.quizScore * QUIZ_EXP_PER_Q} EXP)`;
    return;
  }
  area.style.display = 'block';
  done.style.display = 'none';
  if (quizOrder.length === 0) {
    quizOrder = [...Array(QUIZZES.length).keys()].sort(() => Math.random() - .5);
  }
  renderQuestion();
}

function renderQuestion() {
  if (S.quizIdx >= QUIZZES.length) { finishQuiz(); return; }
  const q     = QUIZZES[quizOrder[S.quizIdx]];
  const total = QUIZZES.length;

  document.getElementById('qn').textContent  = S.quizIdx + 1;
  document.getElementById('qt').textContent  = total;
  document.getElementById('qz-pb').style.width = ((S.quizIdx / total) * 100) + '%';
  document.getElementById('qz-q').textContent  = q.q;
  document.getElementById('qz-res').style.display  = 'none';
  document.getElementById('qz-next').style.display = 'none';

  document.getElementById('qz-opts').innerHTML = q.opts.map((opt, i) =>
    `<button class="qz-opt" onclick="answerQuiz(${i})">
      <span class="opt-L">${['A','B','C','D'][i]}</span>${opt}
    </button>`
  ).join('');
}

function answerQuiz(chosen) {
  const q    = QUIZZES[quizOrder[S.quizIdx]];
  const btns = document.querySelectorAll('.qz-opt');
  btns.forEach(b => b.disabled = true);

  const correct = chosen === q.a;
  btns[chosen].classList.add(correct ? 'ok' : 'bad');
  if (!correct) btns[q.a].classList.add('ok');

  const res = document.getElementById('qz-res');
  res.style.display = 'block';

  if (correct) {
    res.className   = 'qz-res ok';
    res.innerHTML   = `✅ ถูกต้อง! <span style="font-size:11px;font-weight:400">${q.ex}</span>`;
    S.quiz_correct++;
    S.quizScore++;
    addExp(QUIZ_EXP_PER_Q);
    addCoins(QUIZ_GOLD_PER_Q);
    S.dirty = true;
  } else {
    res.className = 'qz-res bad';
    res.innerHTML = `❌ ผิด — <span style="font-size:11px;font-weight:400">${q.ex}</span>`;
  }
  document.getElementById('qz-next').style.display = 'block';
}

function nextQuestion() {
  S.quizIdx++;
  if (S.quizIdx >= QUIZZES.length) { finishQuiz(); return; }
  renderQuestion();
}

function finishQuiz() {
  S.quiz_finished = true;
  document.getElementById('qz-area').style.display = 'none';
  document.getElementById('qz-done').style.display = 'block';
  document.getElementById('qz-sum').textContent =
    `คุณทำถูก ${S.quizScore}/${QUIZZES.length} ข้อ (+${S.quizScore * QUIZ_EXP_PER_Q} EXP)`;
  toast('🎉 Quiz เสร็จ! ได้รับ ' + (S.quizScore * QUIZ_EXP_PER_Q) + ' EXP');
  updateUI();
  savePlayer();
}

function resetQuiz() {
  S.quizIdx      = 0;
  S.quiz_finished = false;
  S.quizScore    = 0;
  quizOrder      = [];
  initQuiz();
}
