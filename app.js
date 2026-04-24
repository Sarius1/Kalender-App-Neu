'use strict';

// =====================
// STATE
// =====================
const S = {
  view: 'week',
  today: startOfDay(new Date()),
  cursor: startOfDay(new Date()),
  events: [],
  categories: [
    { id: 'gym',       name: 'GYM',       color: '#ef4444' },
    { id: 'uni',       name: 'UNI',       color: '#3b82f6' },
    { id: 'nachtruhe', name: 'Nachtruhe', color: '#8b5cf6' },
  ],
  dark: true,
  editingId: null,
};

// =====================
// PERSISTENCE
// =====================
function persist() {
  try {
    localStorage.setItem('kal_events', JSON.stringify(S.events));
    localStorage.setItem('kal_cats', JSON.stringify(S.categories));
    localStorage.setItem('kal_dark', S.dark ? '1' : '0');
  } catch(e) {}
}
function hydrate() {
  try {
    const ev = localStorage.getItem('kal_events');
    if (ev) S.events = JSON.parse(ev);
    const cats = localStorage.getItem('kal_cats');
    if (cats) S.categories = JSON.parse(cats);
    const dark = localStorage.getItem('kal_dark');
    if (dark !== null) S.dark = dark === '1';
  } catch(e) {}
}

// =====================
// DATE UTILS
// =====================
function startOfDay(d) {
  const r = new Date(d); r.setHours(0,0,0,0); return r;
}
function addDays(d, n) {
  const r = new Date(d); r.setDate(r.getDate() + n); return r;
}
function sameDay(a, b) {
  return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
}
function toDS(d) { // date string YYYY-MM-DD
  return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
}
function fromDS(s) {
  if (!s) return null;
  const [y,m,d] = s.split('-').map(Number);
  return new Date(y, m-1, d);
}
function pad(n) { return String(n).padStart(2,'0'); }
function hhmm(h, m) { return pad(h)+':'+pad(m); }
function parseHHMM(s) {
  if (!s) return null;
  const [h,m] = s.split(':').map(Number);
  return { h, m, total: h*60+m };
}
function isoWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dow = d.getUTCDay()||7;
  d.setUTCDate(d.getUTCDate()+4-dow);
  const y1 = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  return Math.ceil(((d-y1)/86400000+1)/7);
}
function mondayOf(date) {
  const d = startOfDay(date);
  const dow = d.getDay(); // 0=Sun
  d.setDate(d.getDate() - (dow===0?6:dow-1));
  return d;
}

const MON_LONG  = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
const MON_SHORT = ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'];
const DAY_SHORT = ['So','Mo','Di','Mi','Do','Fr','Sa'];

// =====================
// EVENT EXPANSION
// =====================
function getCat(id) {
  return S.categories.find(c=>c.id===id) || {name:id||'?', color:'#6b7280'};
}
function uid() { return Date.now().toString(36)+Math.random().toString(36).slice(2); }

// Returns instances of events overlapping [from, to] (Date objects, inclusive days)
function expand(from, to) {
  const out = [];
  for (const ev of S.events) {
    const base = fromDS(ev.date);
    if (!base) continue;
    const baseEnd = ev.dateEnd ? fromDS(ev.dateEnd) : base;

    if (!ev.repeat || ev.repeat === 'none') {
      if (baseEnd >= from && base <= to) {
        out.push({ ...ev, _s: base, _e: baseEnd });
      }
    } else {
      // Generate occurrences
      let cur = new Date(base);
      const limit = addDays(to, 1);
      let safety = 0;
      while (cur < limit && safety++ < 3000) {
        if (cur >= from && cur <= to) {
          out.push({ ...ev, _s: new Date(cur), _e: new Date(cur) });
        }
        if (ev.repeat === 'daily') {
          cur = addDays(cur, 1);
        } else if (ev.repeat === 'weekly') {
          cur = addDays(cur, 7);
        } else if (ev.repeat === 'custom') {
          const days = ev.repeatDays || [];
          if (!days.length) break;
          let advanced = false;
          for (let i = 1; i <= 7; i++) {
            const next = addDays(cur, i);
            if (days.includes(next.getDay())) { cur = next; advanced = true; break; }
          }
          if (!advanced) break;
        } else if (ev.repeat === 'yearly') {
          cur = new Date(cur); cur.setFullYear(cur.getFullYear()+1);
        } else break;
      }
    }
  }
  return out;
}

function eventsForDay(date) {
  const d = startOfDay(date);
  return expand(d, d);
}

// =====================
// RENDER DISPATCH
// =====================
function render() {
  updateTitle();
  updateViewBtns();
  const content = document.getElementById('cal-content');
  content.innerHTML = '';
  let el;
  if (S.view==='year')  el = buildYear();
  else if (S.view==='month') el = buildMonth();
  else if (S.view==='week')  el = buildWeek();
  else                       el = buildDay();
  el.classList.add('view-enter');
  content.appendChild(el);
  if (S.view==='week'||S.view==='day') {
    requestAnimationFrame(() => {
      const scroll = el.querySelector('.week-scroll,.day-scroll');
      if (scroll) scroll.scrollTop = 7*60; // 07:00
    });
  }
}

function updateTitle() {
  const el = document.getElementById('topbar-title');
  const c = S.cursor;
  if (S.view==='year') {
    el.textContent = c.getFullYear();
  } else if (S.view==='month') {
    el.textContent = MON_LONG[c.getMonth()]+' '+c.getFullYear();
  } else if (S.view==='week') {
    const ws = mondayOf(c);
    const we = addDays(ws,6);
    el.textContent = ws.getMonth()===we.getMonth()
      ? MON_SHORT[ws.getMonth()]+' '+ws.getFullYear()
      : MON_SHORT[ws.getMonth()]+'–'+MON_SHORT[we.getMonth()]+' '+ws.getFullYear();
  } else {
    el.textContent = c.getDate()+'. '+MON_LONG[c.getMonth()]+' '+c.getFullYear();
  }
}

function updateViewBtns() {
  document.querySelectorAll('.view-btn').forEach(b=>b.classList.toggle('active', b.dataset.view===S.view));
}

// =====================
// CATEGORY LEGEND
// =====================
function buildLegend() {
  const bar = el('div','cat-legend');
  S.categories.forEach(cat => {
    const item = el('div','legend-item');
    const dot = el('span','legend-dot');
    dot.style.background = cat.color;
    const name = el('span','legend-name');
    name.textContent = cat.name;
    item.appendChild(dot);
    item.appendChild(name);
    bar.appendChild(item);
  });
  return bar;
}

// =====================
// YEAR VIEW
// =====================
function buildYear() {
  const wrap = el('div','year-view');
  wrap.appendChild(buildLegend());
  const grid = el('div','year-grid');
  const y = S.cursor.getFullYear();
  for (let m=0;m<12;m++) grid.appendChild(miniMonth(y,m));

  // Pinch-to-zoom: spreading fingers zooms into the month underneath
  let pinchStart = 0;
  let pinchMonth = null;
  grid.addEventListener('touchstart', e => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchStart = Math.hypot(dx, dy);
      // find which month card the midpoint is over
      const mx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const my = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      const card = document.elementFromPoint(mx, my)?.closest('.year-month');
      pinchMonth = card ? parseInt(card.dataset.month) : null;
    }
  }, {passive:true});
  grid.addEventListener('touchend', e => {
    if (pinchStart > 0 && e.changedTouches.length <= 2) {
      // check final distance from remaining touches
      const touches = e.touches.length === 1 ? [...e.touches, e.changedTouches[0]]
                    : e.touches.length === 0 ? [e.changedTouches[0], e.changedTouches[1] || e.changedTouches[0]]
                    : [...e.touches];
      if (touches.length >= 2) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        const pinchEnd = Math.hypot(dx, dy);
        if (pinchEnd - pinchStart > 40 && pinchMonth !== null) {
          S.cursor = new Date(y, pinchMonth, 1);
          setView('month');
        }
      }
      pinchStart = 0;
    }
  }, {passive:true});

  wrap.appendChild(grid);
  return wrap;
}
function miniMonth(y, m) {
  const card = el('div','year-month');
  card.dataset.month = m;
  card.addEventListener('click',()=>{ S.cursor=new Date(y,m,1); setView('month'); });

  const name = el('div','year-month-name'); name.textContent=MON_SHORT[m]; card.appendChild(name);
  const grid = el('div','ymini'); card.appendChild(grid);

  // Day headers Mo..So
  ['Mo','Di','Mi','Do','Fr','Sa','So'].forEach(d=>{ const h=el('div','ymini-hd'); h.textContent=d; grid.appendChild(h); });

  const first = new Date(y,m,1);
  let dow = first.getDay(); dow = dow===0?6:dow-1;
  const dim = new Date(y,m+1,0).getDate();
  const range0 = new Date(y,m,1), range1 = new Date(y,m,dim);
  const evDays = new Set(expand(range0,range1).map(e=>toDS(e._s)));

  for (let i=0;i<dow;i++){ const c=el('div','ymini-cell other'); grid.appendChild(c); }
  for (let d=1;d<=dim;d++) {
    const date = new Date(y,m,d);
    const dw = date.getDay();
    let cls = 'ymini-cell';
    if (dw===0||dw===6) cls+=' wkend';
    if (sameDay(date,S.today)) cls+=' today';
    if (evDays.has(toDS(date))) cls+=' dot';
    const c = el('div',cls); c.textContent=d; grid.appendChild(c);
  }
  return card;
}

// =====================
// MONTH VIEW
// =====================
function buildMonth() {
  const wrap = el('div','month-view');
  wrap.appendChild(buildLegend());
  const y=S.cursor.getFullYear(), m=S.cursor.getMonth();

  // Header
  const hdr = el('div','month-hdr');
  const kwH = el('div','month-hdr-cell kw'); kwH.textContent='KW'; hdr.appendChild(kwH);
  ['Mo','Di','Mi','Do','Fr','Sa','So'].forEach((d,i)=>{
    const c=el('div','month-hdr-cell'+(i>=5?' wkend':'')); c.textContent=d; hdr.appendChild(c);
  });
  wrap.appendChild(hdr);

  const first=new Date(y,m,1), last=new Date(y,m+1,0);
  let dow=first.getDay(); dow=dow===0?6:dow-1;
  const gridStart=addDays(first,-dow);
  const weeks=Math.ceil((dow+last.getDate())/7);
  const gridEnd=addDays(gridStart,weeks*7-1);
  const allEvs=expand(gridStart,gridEnd);

  const grid=el('div','month-grid'); wrap.appendChild(grid);

  for (let w=0;w<weeks;w++) {
    const row=el('div','month-row'); grid.appendChild(row);
    const ws=addDays(gridStart,w*7);
    const kw=el('div','month-kw'); kw.textContent=isoWeek(ws); row.appendChild(kw);
    for (let d=0;d<7;d++) {
      const date=addDays(gridStart,w*7+d);
      let cls='month-cell';
      if (date.getMonth()!==m) cls+=' other';
      if (sameDay(date,S.today)) cls+=' today';
      if (d>=5) cls+=' wkend';
      const cell=el('div',cls);
      cell.addEventListener('click',()=>newEvent(toDS(date)));

      const dayNum=el('div','mday'); dayNum.textContent=date.getDate(); cell.appendChild(dayNum);

      const dayEvs=allEvs.filter(e=>sameDay(e._s,date));
      const max=3;
      dayEvs.slice(0,max).forEach(ev=>{
        const cat=getCat(ev.category);
        const chip=el('span','mev');
        chip.style.background=cat.color;
        chip.textContent=ev.title||cat.name;
        chip.addEventListener('click',e=>{e.stopPropagation();openDetail(ev);});
        cell.appendChild(chip);
      });
      if (dayEvs.length>max) {
        const more=el('div','mev-more'); more.textContent='+'+(dayEvs.length-max)+' mehr'; cell.appendChild(more);
      }
      row.appendChild(cell);
    }
  }
  return wrap;
}

// =====================
// ALL-DAY / MULTI-DAY ROW
// =====================
function buildAlldayRow(days, alldayEvs) {
  const ws = startOfDay(new Date(days[0]));

  // Classify: multi-day (spans >1 day in this week) vs single-day allday
  const multi = [];
  const single = Array.from({length:7}, ()=>[]);

  alldayEvs.forEach(ev => {
    const s = Math.max(0, Math.round((startOfDay(new Date(ev._s)) - ws) / 86400000));
    const e = Math.min(6, Math.round((startOfDay(new Date(ev._e)) - ws) / 86400000));
    if (e > s) {
      multi.push({ev, s, e});
    } else if (s >= 0 && s <= 6) {
      single[s].push(ev);
    }
  });

  // Greedy lane assignment for multi-day banners
  const laneEnd = []; // laneEnd[i] = last occupied col in that lane
  multi.forEach(item => {
    let lane = 0;
    while (laneEnd[lane] !== undefined && laneEnd[lane] >= item.s) lane++;
    laneEnd[lane] = item.e;
    item.lane = lane;
  });
  const numLanes = laneEnd.length;

  const row = el('div','week-allday');
  const lbl = el('div','week-allday-lbl'); lbl.textContent='Ganztag'; row.appendChild(lbl);

  const body = el('div','week-allday-body');
  // grid rows: numLanes for banners + 1 for single-day chips
  body.style.gridTemplateRows = numLanes > 0
    ? `repeat(${numLanes}, 20px) auto`
    : 'auto';

  // Day separator lines (visual only)
  for (let d=0;d<7;d++) {
    const sep = el('div','allday-sep');
    sep.style.gridColumn = String(d+1);
    sep.style.gridRow = '1 / -1';
    body.appendChild(sep);
  }

  // Multi-day banners
  multi.forEach(({ev, s, e, lane}) => {
    const cat = getCat(ev.category);
    const banner = el('div','allday-banner');
    banner.style.background = cat.color;
    banner.style.gridColumn = `${s+1} / ${e+2}`;
    banner.style.gridRow = String(lane+1);
    banner.textContent = ev.title || cat.name;
    banner.addEventListener('click', ()=>openDetail(ev));
    body.appendChild(banner);
  });

  // Single-day allday chips
  single.forEach((evs, di) => {
    evs.forEach(ev => {
      const cat = getCat(ev.category);
      const chip = el('div','allday-chip');
      chip.style.background = cat.color;
      chip.style.gridColumn = String(di+1);
      chip.style.gridRow = String(numLanes+1);
      chip.textContent = ev.title || cat.name;
      chip.addEventListener('click', ()=>openDetail(ev));
      body.appendChild(chip);
    });
  });

  row.appendChild(body);
  return row;
}

// =====================
// WEEK VIEW
// =====================
function buildWeek() {
  const wrap = el('div','week-view');
  const ws = mondayOf(S.cursor);
  const days = Array.from({length:7},(_,i)=>addDays(ws,i));
  const kw = isoWeek(ws);

  // Header
  const hdr=el('div','week-hdr');
  const kwCell=el('div','week-hdr-kw'); kwCell.innerHTML='<span>KW</span><span>'+kw+'</span>'; hdr.appendChild(kwCell);
  days.forEach(day=>{
    const dw=day.getDay();
    let cls='week-hdr-day';
    if (sameDay(day,S.today)) cls+=' today';
    if (dw===0||dw===6) cls+=' wkend';
    const col=el('div',cls);
    col.innerHTML='<div class="whd-name">'+DAY_SHORT[dw]+'</div><div class="whd-num">'+day.getDate()+'</div>';
    col.addEventListener('click',()=>{ S.cursor=new Date(day); setView('day'); });
    hdr.appendChild(col);
  });
  wrap.appendChild(hdr);

  // All-day / multi-day row
  const ws0=startOfDay(new Date(days[0]));
  const we0=new Date(days[6]); we0.setHours(23,59,59,999);
  const allEvs=expand(ws0,we0);
  const timedEvs=allEvs.filter(e=>e.startTime&&!e.allDay);
  const alldayEvs=allEvs.filter(e=>!e.startTime||e.allDay);

  wrap.appendChild(buildAlldayRow(days, alldayEvs));

  // Scrollable time grid
  const scrollEl=el('div','week-scroll'); wrap.appendChild(scrollEl);
  const tg=el('div','week-timegrid'); scrollEl.appendChild(tg);

  // Time labels
  const lblCol=el('div','time-labels');
  for (let h=1;h<24;h++) {
    const lbl=el('div','time-lbl');
    lbl.style.top=(h*60)+'px';
    lbl.textContent=pad(h)+':00';
    lblCol.appendChild(lbl);
  }
  tg.appendChild(lblCol);

  // Day columns
  days.forEach((day,di)=>{
    const col=el('div','week-day-col');

    // Hour lines + tap zones
    for (let h=0;h<24;h++) {
      const line=el('div','hour-line'); line.style.top=(h*60)+'px'; col.appendChild(line);
      const half=el('div','half-line'); half.style.top=(h*60+30)+'px'; col.appendChild(half);
      const zone=el('div','week-tap-zone');
      zone.style.top=(h*60)+'px'; zone.style.height='60px';
      zone.addEventListener('click',()=>newEvent(toDS(day),hhmm(h,0)));
      col.appendChild(zone);
    }

    // Now line
    if (sameDay(day,S.today)) col.appendChild(makeNowLine());

    // Events
    const dayEvs=timedEvs.filter(e=>sameDay(e._s,day));
    layOut(dayEvs,col,false);

    tg.appendChild(col);
  });

  return wrap;
}

// =====================
// DAY VIEW
// =====================
function buildDay() {
  const wrap=el('div','day-view');
  const day=S.cursor;
  const allEvs=eventsForDay(day);
  const timed=allEvs.filter(e=>e.startTime&&!e.allDay);
  const allday=allEvs.filter(e=>!e.startTime||e.allDay);

  if (allday.length) {
    const row=el('div','day-allday');
    allday.forEach(ev=>{
      const cat=getCat(ev.category);
      const chip=el('div','day-allday-chip');
      chip.style.background=cat.color;
      chip.textContent=ev.title||cat.name;
      chip.addEventListener('click',()=>openDetail(ev));
      row.appendChild(chip);
    });
    wrap.appendChild(row);
  }

  const scrollEl=el('div','day-scroll'); wrap.appendChild(scrollEl);
  const tg=el('div','day-timegrid'); scrollEl.appendChild(tg);

  const lbls=el('div','day-labels');
  for (let h=1;h<24;h++) {
    const lbl=el('div','day-lbl');
    lbl.style.top=(h*60)+'px';
    lbl.textContent=pad(h)+':00';
    lbls.appendChild(lbl);
  }
  tg.appendChild(lbls);

  const col=el('div','day-col');
  for (let h=0;h<24;h++) {
    const line=el('div','day-hour-line'); line.style.top=(h*60)+'px'; col.appendChild(line);
    const half=el('div','day-half-line'); half.style.top=(h*60+30)+'px'; col.appendChild(half);
    const zone=el('div','day-tap-zone');
    zone.style.top=(h*60)+'px'; zone.style.height='60px';
    zone.addEventListener('click',()=>newEvent(toDS(day),hhmm(h,0)));
    col.appendChild(zone);
  }
  if (sameDay(day,S.today)) col.appendChild(makeNowLine());
  layOut(timed,col,true);
  tg.appendChild(col);

  return wrap;
}

// =====================
// EVENT LAYOUT (overlap)
// =====================
function layOut(events, col, isDayView) {
  const sorted=[...events].sort((a,b)=>{
    const at=parseHHMM(a.startTime), bt=parseHHMM(b.startTime);
    return at.total-bt.total;
  });

  // Greedy column assignment
  const cols=[]; // each entry: endMin of last event in that column
  const assigned=[];

  sorted.forEach(ev=>{
    const st=parseHHMM(ev.startTime);
    const et=ev.endTime ? parseHHMM(ev.endTime) : {total:st.total+60};
    const startMin=st.total, endMin=Math.max(et.total, startMin+15);

    let c=0;
    while (cols[c]!==undefined && cols[c]>startMin) c++;
    cols[c]=endMin;
    assigned.push({ev, startMin, endMin, col:c});
  });

  const numCols=cols.length||1;

  assigned.forEach(({ev, startMin, endMin, col:c})=>{
    const cat=getCat(ev.category);
    const block=el('div', isDayView?'dev':'wev');
    block.style.background=cat.color;
    block.style.top=startMin+'px';
    block.style.height=Math.max(20,endMin-startMin)+'px';

    const slotW=100/numCols;
    block.style.left=(isDayView?4:2)+c*slotW+'%'; // rough
    if (isDayView) {
      block.style.left='calc('+( c*(100/numCols) )+'% + 4px)';
      block.style.right='calc('+(((numCols-c-1)*(100/numCols)))+'% + 4px)';
    } else {
      block.style.left='calc('+(c*slotW)+'% + 2px)';
      block.style.right='calc('+(((numCols-c-1)*slotW))+'% + 2px)';
    }

    const title=ev.title||getCat(ev.category).name;
    if (isDayView) {
      block.innerHTML='<div class="dev-time">'+ev.startTime+(ev.endTime?' – '+ev.endTime:'')+'</div><div>'+escH(title)+'</div>';
    } else {
      block.innerHTML='<span class="wev-title">'+escH(title)+'</span>'+(endMin-startMin>25?'<span class="wev-time">'+ev.startTime+'</span>':'');
    }
    block.addEventListener('click',e=>{e.stopPropagation();openDetail(ev);});
    col.appendChild(block);
  });
}

function makeNowLine() {
  const now=new Date();
  const line=el('div','now-line');
  line.style.top=(now.getHours()*60+now.getMinutes())+'px';
  line.dataset.nl='1';
  return line;
}

// =====================
// NAVIGATION
// =====================
function navigate(dir) {
  const c=S.cursor;
  if (S.view==='year') c.setFullYear(c.getFullYear()+dir);
  else if (S.view==='month') c.setMonth(c.getMonth()+dir);
  else if (S.view==='week') c.setDate(c.getDate()+dir*7);
  else c.setDate(c.getDate()+dir);
  S.cursor=new Date(c);
  render();
}
function goToday() { S.cursor=new Date(S.today); render(); }
function setView(v) { S.view=v; render(); }

// =====================
// EVENT MODAL
// =====================
function updateTimeRowVisibility() {
  const date    = document.getElementById('ev-date').value;
  const dateEnd = document.getElementById('ev-date-end').value;
  const isMulti = dateEnd && dateEnd > date;
  document.getElementById('ev-time-row').classList.toggle('hidden', isMulti);
  if (isMulti) {
    document.getElementById('ev-start').value = '';
    document.getElementById('ev-end').value   = '';
  }
}

function newEvent(dateStr, timeStr) {
  S.editingId=null;
  document.getElementById('modal-title-label').textContent='Neues Event';
  document.getElementById('ev-title').value='';
  document.getElementById('ev-date').value=dateStr||toDS(S.cursor);
  document.getElementById('ev-date-end').value=dateStr||toDS(S.cursor);
  document.getElementById('ev-notes').value='';
  document.getElementById('ev-repeat').value='none';
  document.getElementById('ev-custom-days').classList.add('hidden');
  document.getElementById('ev-delete').classList.add('hidden');

  if (timeStr) {
    document.getElementById('ev-start').value=timeStr;
    const t=parseHHMM(timeStr);
    const eh=Math.min(23,t.h+1);
    document.getElementById('ev-end').value=hhmm(eh,t.m);
  } else {
    document.getElementById('ev-start').value='';
    document.getElementById('ev-end').value='';
  }
  updateTimeRowVisibility();
  buildCatChips(null);
  clearDayChips();
  showModal('event-modal');
}

function editEvent(ev) {
  S.editingId=ev.id;
  document.getElementById('modal-title-label').textContent='Event bearbeiten';
  document.getElementById('ev-title').value=ev.title||'';
  document.getElementById('ev-date').value=ev.date;
  document.getElementById('ev-date-end').value=ev.dateEnd||ev.date;
  document.getElementById('ev-start').value=ev.startTime||'';
  document.getElementById('ev-end').value=ev.endTime||'';
  document.getElementById('ev-notes').value=ev.notes||'';
  document.getElementById('ev-repeat').value=ev.repeat||'none';
  document.getElementById('ev-custom-days').classList.toggle('hidden',ev.repeat!=='custom');
  document.getElementById('ev-delete').classList.remove('hidden');
  updateTimeRowVisibility();
  buildCatChips(ev.category);
  clearDayChips();
  (ev.repeatDays||[]).forEach(d=>{
    document.querySelectorAll('.day-chip').forEach(b=>{ if (Number(b.dataset.day)===d) b.classList.add('sel'); });
  });
  hideModal('detail-modal');
  showModal('event-modal');
}

let _catEditMode = false;

function buildCatChips(selected) {
  _catEditMode = false;
  const row = document.getElementById('ev-category-row');
  row.innerHTML = '';
  renderCatChips(row, selected);
}

function renderCatChips(row, selected) {
  row.innerHTML = '';
  S.categories.forEach(cat => {
    const wrap = el('div', 'cat-chip-wrap');
    const chip = el('button', 'cat-chip' + (cat.id === selected ? ' selected' : ''));
    chip.style.background = cat.color;
    chip.textContent = cat.name;
    chip.dataset.id = cat.id;
    chip.addEventListener('click', () => {
      if (_catEditMode) return;
      row.querySelectorAll('.cat-chip').forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
      selected = cat.id;
    });
    wrap.appendChild(chip);

    if (_catEditMode) {
      const del = el('button', 'cat-chip-del');
      del.textContent = '✕';
      del.addEventListener('click', e => {
        e.stopPropagation();
        S.categories = S.categories.filter(c => c.id !== cat.id);
        if (selected === cat.id) selected = S.categories[0]?.id || null;
        persist();
        renderCatChips(row, selected);
      });
      wrap.appendChild(del);
    }
    row.appendChild(wrap);
  });

  // "+" add button
  const addBtn = el('button', 'cat-chip-add');
  addBtn.textContent = '+';
  addBtn.title = 'Neue Kategorie';
  addBtn.addEventListener('click', () => {
    _pendingCatSelected = selected;
    openCatModalFromEvent();
  });
  row.appendChild(addBtn);

  if (!selected && row.querySelector('.cat-chip')) {
    row.querySelector('.cat-chip').classList.add('selected');
  }
}

function clearDayChips() {
  document.querySelectorAll('.day-chip').forEach(b=>b.classList.remove('sel'));
}

function saveEvent() {
  const date=document.getElementById('ev-date').value;
  if (!date) return;
  const dateEnd=document.getElementById('ev-date-end').value;
  const title=document.getElementById('ev-title').value.trim();
  const startTime=document.getElementById('ev-start').value;
  const endTime=document.getElementById('ev-end').value;
  const notes=document.getElementById('ev-notes').value.trim();
  const repeat=document.getElementById('ev-repeat').value;
  const sel=document.querySelector('#ev-category-row .cat-chip.selected');
  const category=sel ? sel.dataset.id : (S.categories[0]?.id||'');
  const repeatDays=[];
  document.querySelectorAll('.day-chip.sel').forEach(b=>repeatDays.push(Number(b.dataset.day)));

  const data={title,date,dateEnd:dateEnd!==date?dateEnd:null,startTime,endTime,notes,repeat,repeatDays,category};

  if (S.editingId) {
    const i=S.events.findIndex(e=>e.id===S.editingId);
    if (i!==-1) S.events[i]={...S.events[i],...data};
  } else {
    S.events.push({id:uid(),...data});
  }
  persist(); hideModal('event-modal'); render();
}

function deleteEditingEvent() {
  if (!S.editingId) return;
  S.events=S.events.filter(e=>e.id!==S.editingId);
  persist(); hideModal('event-modal'); render();
}

// =====================
// DETAIL MODAL
// =====================
function openDetail(ev) {
  const cat=getCat(ev.category);
  const titleEl=document.getElementById('detail-title');
  titleEl.innerHTML='<span class="detail-cat-dot" style="background:'+cat.color+'"></span>'+escH(ev.title||cat.name);

  const body=document.getElementById('detail-body'); body.innerHTML='';

  function row(icon, val) {
    const r=el('div','detail-row');
    r.innerHTML='<span class="detail-icon">'+icon+'</span><span class="detail-val">'+val+'</span>';
    body.appendChild(r);
  }

  const d=fromDS(ev.date);
  let ds=d.getDate()+'. '+MON_LONG[d.getMonth()]+' '+d.getFullYear();
  if (ev.dateEnd&&ev.dateEnd!==ev.date) {
    const de=fromDS(ev.dateEnd);
    ds+=' – '+de.getDate()+'. '+MON_LONG[de.getMonth()];
  }
  row('📅', ds);
  if (ev.startTime) row('🕐', ev.startTime+(ev.endTime?' – '+ev.endTime:''));
  row('🏷', cat.name);
  const repLabels={daily:'Täglich',weekly:'Wöchentlich',custom:'Bestimmte Tage',yearly:'Jährlich'};
  if (ev.repeat&&ev.repeat!=='none') row('🔄', repLabels[ev.repeat]||ev.repeat);
  if (ev.notes) row('📝', escH(ev.notes));

  document.getElementById('detail-edit').onclick=()=>editEvent(ev);
  document.getElementById('detail-delete').onclick=()=>{
    S.events=S.events.filter(e=>e.id!==ev.id);
    persist(); hideModal('detail-modal'); render();
  };
  showModal('detail-modal');
}

// =====================
// CATEGORY MODAL
// =====================
let _newCatColor = '#ef4444';
let _pendingCatSelected = null;

function openCatModalFromEvent() {
  document.getElementById('cat-name').value = '';
  _newCatColor = '#ef4444';
  document.querySelectorAll('.color-chip').forEach(b => b.classList.toggle('sel', b.dataset.color === _newCatColor));
  showModal('cat-modal');
}

function saveCat() {
  const name = document.getElementById('cat-name').value.trim();
  if (!name) return;
  const newCat = { id: uid(), name, color: _newCatColor };
  S.categories.push(newCat);
  persist();
  hideModal('cat-modal');
  // Refresh chips in event modal with new cat selected
  const row = document.getElementById('ev-category-row');
  if (row) renderCatChips(row, newCat.id);
}

// =====================
// MODAL HELPERS
// =====================
function showModal(id) { document.getElementById(id).classList.remove('hidden'); }
function hideModal(id) { document.getElementById(id).classList.add('hidden'); }
function hideAllModals() { document.querySelectorAll('.modal').forEach(m=>m.classList.add('hidden')); }

// =====================
// SWIPE
// =====================
let tx=0,ty=0;
document.addEventListener('touchstart',e=>{tx=e.touches[0].clientX;ty=e.touches[0].clientY;},{passive:true});
document.addEventListener('touchend',e=>{
  const dx=e.changedTouches[0].clientX-tx;
  const dy=e.changedTouches[0].clientY-ty;
  if (Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.5) {
    if (!document.querySelector('.modal:not(.hidden)')) navigate(dx<0?1:-1);
  }
},{passive:true});

// =====================
// UTILS
// =====================
function el(tag, cls) { const e=document.createElement(tag); if (cls) e.className=cls; return e; }
function escH(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

// Now-line updater
setInterval(()=>{
  const now=new Date();
  document.querySelectorAll('[data-nl]').forEach(l=>{ l.style.top=(now.getHours()*60+now.getMinutes())+'px'; });
},60000);

// =====================
// INIT
// =====================
function init() {
  hydrate();
  applyTheme();

  // View buttons
  document.querySelectorAll('.view-btn').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.view)));

  // Nav
  document.getElementById('btn-prev').addEventListener('click',()=>navigate(-1));
  document.getElementById('btn-next').addEventListener('click',()=>navigate(1));
  document.getElementById('btn-today').addEventListener('click',goToday);

  // FAB
  document.getElementById('fab').addEventListener('click',()=>newEvent());

  // Dark mode toggle
  document.getElementById('btn-darkmode').addEventListener('click', () => {
    S.dark = !S.dark; persist(); applyTheme();
  });

  // Category edit toggle in event modal
  document.getElementById('ev-cat-edit-toggle').addEventListener('click', () => {
    _catEditMode = !_catEditMode;
    const toggle = document.getElementById('ev-cat-edit-toggle');
    toggle.textContent = _catEditMode ? '✅' : '✏️';
    const row = document.getElementById('ev-category-row');
    const curSel = row.querySelector('.cat-chip.selected')?.dataset?.id || null;
    renderCatChips(row, curSel);
  });

  // Event modal
  document.getElementById('ev-save').addEventListener('click',saveEvent);
  document.getElementById('ev-delete').addEventListener('click',deleteEditingEvent);
  document.getElementById('ev-date').addEventListener('change', updateTimeRowVisibility);
  document.getElementById('ev-date-end').addEventListener('change', updateTimeRowVisibility);
  document.getElementById('ev-repeat').addEventListener('change',e=>{
    document.getElementById('ev-custom-days').classList.toggle('hidden',e.target.value!=='custom');
  });
  document.querySelectorAll('.day-chip').forEach(b=>b.addEventListener('click',()=>b.classList.toggle('sel')));

  // Color picker
  document.querySelectorAll('.color-chip').forEach(b=>b.addEventListener('click',()=>{
    _newCatColor=b.dataset.color;
    document.querySelectorAll('.color-chip').forEach(x=>x.classList.toggle('sel',x===b));
  }));

  // Cat save
  document.getElementById('cat-save').addEventListener('click',saveCat);

  // Close modals
  document.querySelectorAll('.modal-backdrop,.modal-close').forEach(el=>{
    el.addEventListener('click',hideAllModals);
  });
  document.querySelectorAll('.modal-sheet').forEach(s=>s.addEventListener('click',e=>e.stopPropagation()));

  render();
}

function applyTheme() {
  document.body.classList.toggle('dark', S.dark);
  document.body.classList.toggle('light', !S.dark);
  const meta = document.getElementById('theme-color-meta');
  if (meta) meta.content = S.dark ? '#0d0d1a' : '#ffffff';
  const icon = document.getElementById('darkmode-icon');
  if (icon) icon.textContent = S.dark ? '☀️' : '🌙';
}

document.addEventListener('DOMContentLoaded',init);
