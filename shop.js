// ════════════════════════════════════════
//  shop.js — ระบบ Shop และไอเทม
//  ใช้ S (state), updateUI(), toast(),
//  getRankIdx()
// ════════════════════════════════════════

const SHOP = [
  // ── Cosmetic (ตกแต่งตัวละคร) ──
  {id:'hat',    em:'🎩', nm:'หมวกนักวิทย์',      pr:50,  tp:'cosmetic',  mr:0,
   desc:'เพิ่มความน่าเชื่อถือในห้องแล็บ'},
  {id:'lab',    em:'🥼', nm:'เสื้อกาวน์',         pr:80,  tp:'cosmetic',  mr:0,
   desc:'ชุดมาตรฐานนักวิทยาศาสตร์'},
  {id:'gogg',   em:'🥽', nm:'แว่นนิรภัย',         pr:60,  tp:'cosmetic',  mr:0,
   desc:'ปลอดภัยจากสารเคมีกระเด็น'},
  {id:'scope',  em:'🔭', nm:'กล้องโทรทรรศน์',    pr:70,  tp:'cosmetic',  mr:0,
   desc:'สำรวจจักรวาลแห่งธาตุ'},

  // ── Boost (เพิ่มพลัง) ──
  {id:'potion', em:'🧪', nm:'EXP Potion',         pr:80,  tp:'boost',     mr:0,
   desc:'+80 EXP ทันทีเมื่อใช้', effect:'exp', value:80},
  {id:'potion2',em:'⚗️', nm:'EXP Potion ×2',      pr:150, tp:'boost',     mr:2,
   desc:'+180 EXP ทันทีเมื่อใช้', effect:'exp', value:180},
  {id:'goldbar',em:'🪙', nm:'Gold Rush',           pr:100, tp:'boost',     mr:0,
   desc:'+60 เหรียญทันทีเมื่อใช้', effect:'gold', value:60},
  {id:'boost2', em:'⚡', nm:'XP Booster 1 วัน',   pr:120, tp:'boost',     mr:2,
   desc:'EXP +20% ตลอดวัน (reset เที่ยงคืน)', effect:'boost'},

  // ── Privilege (สิทธิพิเศษ) ──
  {id:'late',   em:'📝', nm:'ขอส่งงานช้า +1 วัน', pr:120, tp:'privilege', mr:0,
   desc:'ยืมเวลาส่งงาน 1 วัน (ใช้ได้ 1 ครั้ง)'},
  {id:'seat',   em:'🪑', nm:'เลือกที่นั่งอิสระ',  pr:180, tp:'privilege', mr:2,
   desc:'นั่งที่ไหนก็ได้ในห้องเรียน'},
  {id:'skip',   em:'📖', nm:'ข้ามการบ้าน 1 ครั้ง', pr:250, tp:'privilege', mr:3,
   desc:'ขอยกเว้นการบ้าน 1 ชิ้น'},
  {id:'bonus',  em:'⭐', nm:'คะแนนโบนัส +5%',      pr:400, tp:'privilege', mr:4,
   desc:'คะแนนสอบเพิ่มพิเศษ 5%'},
];

let shopFilter = 'all';

// ── คำอธิบาย type ──
const SHOP_TYPE_LABEL = {
  cosmetic:  '🎨 Cosmetic',
  boost:     '⚡ Boost',
  privilege: '⭐ Privilege',
};

function filtShop(f, btn) {
  shopFilter = f;
  document.querySelectorAll('.sh-tab').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderShop();
}

function renderShop() {
  document.getElementById('sh-coins').textContent = S.coins;
  const curRankIdx = getRankIdx();
  const items = shopFilter === 'all'
    ? SHOP
    : SHOP.filter(i => i.tp === shopFilter);

  document.getElementById('sh-grid').innerHTML = items.map(item => {
    const owned   = S.items.includes(item.id);
    const locked  = curRankIdx < item.mr;
    const canBuy  = !owned && !locked && S.coins >= item.pr;
    const isUsable = owned && item.effect && !S.usedItems?.includes(item.id);

    let priceLabel;
    if (owned && item.effect) priceLabel = isUsable ? '▶ ใช้งาน' : '✅ ใช้แล้ว';
    else if (owned)           priceLabel = '✅ มีแล้ว';
    else                      priceLabel = '🪙 ' + item.pr;

    const clickFn = canBuy
      ? `buyItem('${item.id}')`
      : (isUsable ? `useItem('${item.id}')` : '');

    return `<div class="sh-item ${owned ? 'owned' : ''} ${locked ? 'lk-item' : ''}"
      onclick="${clickFn}" title="${item.desc || ''}">
      ${locked ? `<span class="lk-lbl">🔒 Rank ${item.mr}</span>` : ''}
      <span class="sh-em">${item.em}</span>
      <div class="sh-nm">${item.nm}</div>
      <div style="font-size:9px;color:var(--text2);margin-bottom:3px;line-height:1.3">${item.desc || ''}</div>
      <div class="sh-pr">${priceLabel}</div>
      <span class="sh-tp ${item.tp}">${SHOP_TYPE_LABEL[item.tp] || item.tp}</span>
    </div>`;
  }).join('');
}

function buyItem(id) {
  const item = SHOP.find(i => i.id === id);
  if (!item) return;
  if (S.items.includes(id))    { toast('มีไอเทมนี้แล้ว'); return; }
  if (S.coins < item.pr)       { toast('🪙 เหรียญไม่พอ!'); return; }
  if (getRankIdx() < item.mr)  { toast('🔒 Rank ยังไม่ถึง'); return; }

  S.coins -= item.pr;
  S.items.push(id);
  S.dirty = true;
  toast('🛍️ ซื้อ ' + item.em + ' ' + item.nm + ' สำเร็จ!');
  updateUI();
  renderShop();

  // ถ้าเป็น Boost ที่ใช้ทันที ให้ถามก่อน
  if (item.effect === 'exp' || item.effect === 'gold') {
    setTimeout(() => useItem(id), 400);
  }
}

function useItem(id) {
  const item = SHOP.find(i => i.id === id);
  if (!item || !item.effect) return;
  if (!S.usedItems) S.usedItems = [];
  if (S.usedItems.includes(id)) { toast('ใช้ไอเทมนี้ไปแล้ว'); return; }

  if (item.effect === 'exp') {
    addExp(item.value);
    toast('🧪 ใช้ ' + item.nm + ' +' + item.value + ' EXP!');
  } else if (item.effect === 'gold') {
    addCoins(item.value);
    toast('🪙 ใช้ ' + item.nm + ' +' + item.value + ' เหรียญ!');
  } else if (item.effect === 'boost') {
    toast('⚡ ' + item.nm + ' เปิดใช้งานแล้ว! EXP +20% ตลอดวัน');
    S._boostActive = true;
  }
  S.usedItems.push(id);
  S.dirty = true;
  updateUI();
  renderShop();
}
