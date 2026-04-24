'use strict';

// =====================
// TRANSLATIONS
// =====================
const TR = {
  de: {
    today:'Heute', vYear:'Jahr', v3Mon:'3 Mon.', vMonth:'Monat', vWeek:'Woche', vDay:'Tag',
    newEvent:'Neues Event', editEvent:'Event bearbeiten',
    titleLbl:'Titel', titlePh:'Titel (optional)',
    categoryLbl:'Kategorie', dateLbl:'Datum', dateEndLbl:'Bis Datum',
    fromLbl:'Von', toLbl:'Bis', repeatLbl:'Wiederholen',
    notesLbl:'Notizen', notesPh:'Notizen...',
    del:'Löschen', save:'Speichern', edit:'Bearbeiten',
    settings:'Einstellungen', appearance:'Darstellung', darkMode:'Dark Mode',
    langLbl:'Sprache', categories:'Kategorien', newCat:'Neue Kategorie',
    name:'Name', color:'Farbe', allDay:'Ganztag', addCat:'+ Kategorie hinzufügen',
    repNone:'Nie', repDaily:'Täglich', repWeekly:'Wöchentlich (gleicher Wochentag)',
    repCustom:'Bestimmte Wochentage', repYearly:'Jährlich',
    rLblDaily:'Täglich', rLblWeekly:'Wöchentlich', rLblCustom:'Bestimmte Tage', rLblYearly:'Jährlich',
    weekdaysLbl:'Wochentage',
    MON:['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'],
    MONS:['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'],
    DAY:['So','Mo','Di','Mi','Do','Fr','Sa'],
    DAYF:['Mo','Di','Mi','Do','Fr','Sa','So'],
    KW:'KW',
  },
  en: {
    today:'Today', vYear:'Year', v3Mon:'3 Mon.', vMonth:'Month', vWeek:'Week', vDay:'Day',
    newEvent:'New Event', editEvent:'Edit Event',
    titleLbl:'Title', titlePh:'Title (optional)',
    categoryLbl:'Category', dateLbl:'Date', dateEndLbl:'End Date',
    fromLbl:'From', toLbl:'To', repeatLbl:'Repeat',
    notesLbl:'Notes', notesPh:'Notes...',
    del:'Delete', save:'Save', edit:'Edit',
    settings:'Settings', appearance:'Appearance', darkMode:'Dark Mode',
    langLbl:'Language', categories:'Categories', newCat:'New Category',
    name:'Name', color:'Color', allDay:'All-day', addCat:'+ Add category',
    repNone:'Never', repDaily:'Daily', repWeekly:'Weekly (same weekday)',
    repCustom:'Specific weekdays', repYearly:'Yearly',
    rLblDaily:'Daily', rLblWeekly:'Weekly', rLblCustom:'Specific days', rLblYearly:'Yearly',
    weekdaysLbl:'Weekdays',
    MON:['January','February','March','April','May','June','July','August','September','October','November','December'],
    MONS:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    DAY:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
    DAYF:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
    KW:'Wk',
  },
  ru: {
    today:'Сегодня', vYear:'Год', v3Mon:'3 мес.', vMonth:'Месяц', vWeek:'Неделя', vDay:'День',
    newEvent:'Новое событие', editEvent:'Изменить',
    titleLbl:'Название', titlePh:'Название (необязательно)',
    categoryLbl:'Категория', dateLbl:'Дата', dateEndLbl:'Конец',
    fromLbl:'С', toLbl:'До', repeatLbl:'Повтор',
    notesLbl:'Заметки', notesPh:'Заметки...',
    del:'Удалить', save:'Сохранить', edit:'Изменить',
    settings:'Настройки', appearance:'Внешний вид', darkMode:'Тёмный режим',
    langLbl:'Язык', categories:'Категории', newCat:'Новая категория',
    name:'Название', color:'Цвет', allDay:'Весь день', addCat:'+ Добавить категорию',
    repNone:'Никогда', repDaily:'Ежедневно', repWeekly:'Еженедельно (тот же день)',
    repCustom:'Определённые дни', repYearly:'Ежегодно',
    rLblDaily:'Ежедневно', rLblWeekly:'Еженедельно', rLblCustom:'Определённые дни', rLblYearly:'Ежегодно',
    weekdaysLbl:'Дни недели',
    MON:['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
    MONS:['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'],
    DAY:['Вс','Пн','Вт','Ср','Чт','Пт','Сб'],
    DAYF:['Пн','Вт','Ср','Чт','Пт','Сб','Вс'],
    KW:'Нед',
  },
};
function t(k) { return (TR[S.lang]||TR.de)[k] ?? TR.de[k] ?? k; }

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPh);
  });
  // Update select options
  document.querySelectorAll('#ev-repeat option[data-i18n]').forEach(opt => {
    opt.textContent = t(opt.dataset.i18n);
  });
  // Update day chips in weekday selector
  const dayChips = document.querySelectorAll('#weekday-chips .day-chip');
  const dayMap = [t('DAY')[0], t('DAYF')[0], t('DAYF')[1], t('DAYF')[2], t('DAYF')[3], t('DAYF')[4], t('DAYF')[5]];
  const dayOrder = [1,2,3,4,5,6,0]; // Mo..So
  dayChips.forEach((btn, i) => { btn.textContent = t('DAYF')[i < 6 ? i : 6]; });
  // lang buttons active state
  document.querySelectorAll('.lang-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === S.lang);
  });
}

// =====================
// STATE
// =====================
const S = {
  view: 'week',
  today: startOfDay(new Date()),
  cursor: startOfDay(new Date()),
  events: [],
  categories: [
    { id:'gym',       name:'GYM',       color:'#ef4444' },
    { id:'uni',       name:'UNI',       color:'#3b82f6' },
    { id:'nachtruhe', name:'Nachtruhe', color:'#8b5cf6' },
  ],
  dark: true,
  lang: 'de',
  editingId: null,
};

// =====================
// PERSISTENCE
// =====================
function persist() {
  try {
    localStorage.setItem('kal_events', JSON.stringify(S.events));
    localStorage.setItem('kal_cats',   JSON.stringify(S.categories));
    localStorage.setItem('kal_dark',   S.dark ? '1':'0');
    localStorage.setItem('kal_lang',   S.lang);
  } catch(e) {}
}
function hydrate() {
  try {
    const ev   = localStorage.getItem('kal_events'); if (ev)   S.events     = JSON.parse(ev);
    const cats = localStorage.getItem('kal_cats');   if (cats) S.categories = JSON.parse(cats);
    const dark = localStorage.getItem('kal_dark');   if (dark !== null) S.dark = dark==='1';
    const lang = localStorage.getItem('kal_lang');   if (lang) S.lang = lang;
  } catch(e) {}
}

// =====================
// DATE UTILS
// =====================
function startOfDay(d) { const r=new Date(d); r.setHours(0,0,0,0); return r; }
function addDays(d,n)   { const r=new Date(d); r.setDate(r.getDate()+n); return r; }
function sameDay(a,b)   { return a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate(); }
function toDS(d)        { return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate()); }
function fromDS(s)      { if(!s)return null; const[y,m,d]=s.split('-').map(Number); return new Date(y,m-1,d); }
function pad(n)         { return String(n).padStart(2,'0'); }
function hhmm(h,m)      { return pad(h)+':'+pad(m); }
function parseHHMM(s)   { if(!s)return null; const[h,m]=s.split(':').map(Number); return{h,m,total:h*60+m}; }
function isoWeek(date) {
  const d=new Date(Date.UTC(date.getFullYear(),date.getMonth(),date.getDate()));
  const dow=d.getUTCDay()||7; d.setUTCDate(d.getUTCDate()+4-dow);
  const y1=new Date(Date.UTC(d.getUTCFullYear(),0,1));
  return Math.ceil(((d-y1)/86400000+1)/7);
}
function mondayOf(date) {
  const d=startOfDay(date), dow=d.getDay();
  d.setDate(d.getDate()-(dow===0?6:dow-1)); return d;
}

// =====================
// EVENT EXPANSION
// =====================
function getCat(id) { return S.categories.find(c=>c.id===id)||{name:id||'?',color:'#6b7280'}; }
function uid()      { return Date.now().toString(36)+Math.random().toString(36).slice(2); }

function expand(from, to) {
  const out=[];
  for (const ev of S.events) {
    const base=fromDS(ev.date); if(!base)continue;
    const baseEnd=ev.dateEnd?fromDS(ev.dateEnd):base;
    if (!ev.repeat||ev.repeat==='none') {
      if (baseEnd>=from&&base<=to) out.push({...ev,_s:base,_e:baseEnd});
    } else {
      let cur=new Date(base), safety=0;
      const limit=addDays(to,1);
      while (cur<limit&&safety++<3000) {
        if (cur>=from&&cur<=to) out.push({...ev,_s:new Date(cur),_e:new Date(cur)});
        if      (ev.repeat==='daily')  cur=addDays(cur,1);
        else if (ev.repeat==='weekly') cur=addDays(cur,7);
        else if (ev.repeat==='custom') {
          const days=ev.repeatDays||[]; if(!days.length)break;
          let ok=false;
          for(let i=1;i<=7;i++){const nx=addDays(cur,i);if(days.includes(nx.getDay())){cur=nx;ok=true;break;}}
          if(!ok)break;
        } else if (ev.repeat==='yearly') { cur=new Date(cur); cur.setFullYear(cur.getFullYear()+1); }
        else break;
      }
    }
  }
  return out;
}
function eventsForDay(date) { const d=startOfDay(date); return expand(d,d); }

// =====================
// RENDER DISPATCH
// =====================
function render() {
  updateTitle(); updateViewBtns();
  const content=document.getElementById('cal-content');
  content.innerHTML='';
  let view;
  if      (S.view==='year')    view=buildYear();
  else if (S.view==='3months') view=build3Months();
  else if (S.view==='month')   view=buildMonth();
  else if (S.view==='week')    view=buildWeek();
  else                         view=buildDay();
  view.classList.add('view-enter');
  content.appendChild(view);
  if (S.view==='week'||S.view==='day') {
    requestAnimationFrame(()=>{
      const s=view.querySelector('.week-scroll,.day-scroll');
      if(s) s.scrollTop=7*60;
    });
  }
}

function updateTitle() {
  const el=document.getElementById('topbar-title');
  const c=S.cursor;
  const MON=t('MON'), MONS=t('MONS');
  if      (S.view==='year')    el.textContent=c.getFullYear();
  else if (S.view==='month')   el.textContent=MON[c.getMonth()]+' '+c.getFullYear();
  else if (S.view==='3months') {
    const e=new Date(c.getFullYear(),c.getMonth()+2,1);
    el.textContent=MONS[c.getMonth()]+' – '+MONS[e.getMonth()]+' '+c.getFullYear();
  }
  else if (S.view==='week') {
    const ws=mondayOf(c), we=addDays(ws,6);
    el.textContent=ws.getMonth()===we.getMonth()
      ? MONS[ws.getMonth()]+' '+ws.getFullYear()
      : MONS[ws.getMonth()]+'–'+MONS[we.getMonth()]+' '+ws.getFullYear();
  }
  else el.textContent=c.getDate()+'. '+MON[c.getMonth()]+' '+c.getFullYear();
}

function updateViewBtns() {
  document.querySelectorAll('.view-btn').forEach(b=>b.classList.toggle('active',b.dataset.view===S.view));
}

// =====================
// SHARED: MULTI-DAY BANNER BUILDER
// Used by month, 3months views
// days[0..6] = Date objects for the week
// allEvs = expanded events overlapping that week range
// =====================
function buildWeekBanners(days, allEvs) {
  const ws=startOfDay(new Date(days[0]));
  const multi=[], single=Array.from({length:days.length},()=>[]);

  allEvs.filter(e=>!e.startTime).forEach(ev=>{
    const s=Math.max(0, Math.round((startOfDay(new Date(ev._s))-ws)/86400000));
    const e=Math.min(days.length-1, Math.round((startOfDay(new Date(ev._e))-ws)/86400000));
    if (e>s) multi.push({ev,s,e});
    else if (s>=0&&s<days.length) single[s].push(ev);
  });

  // lane assignment
  const laneEnd=[];
  multi.forEach(item=>{
    let lane=0;
    while(laneEnd[lane]!==undefined&&laneEnd[lane]>=item.s) lane++;
    laneEnd[lane]=item.e; item.lane=lane;
  });

  return {multi, single, numLanes:laneEnd.length};
}

// =====================
// CATEGORY LEGEND
// =====================
function buildLegend() {
  const bar=el('div','cat-legend');
  S.categories.forEach(cat=>{
    const item=el('div','legend-item');
    const dot=el('span','legend-dot'); dot.style.background=cat.color;
    const name=el('span','legend-name'); name.textContent=cat.name;
    item.appendChild(dot); item.appendChild(name); bar.appendChild(item);
  });
  return bar;
}

// =====================
// YEAR VIEW
// =====================
function buildYear() {
  const wrap=el('div','year-view');
  wrap.appendChild(buildLegend());
  const grid=el('div','year-grid');
  const y=S.cursor.getFullYear();
  for(let m=0;m<12;m++) grid.appendChild(miniMonth(y,m));

  // Pinch → go to 3months view centered on that month
  let pinchStart=0, pinchMonth=null;
  grid.addEventListener('touchstart',e=>{
    if(e.touches.length===2){
      const dx=e.touches[0].clientX-e.touches[1].clientX;
      const dy=e.touches[0].clientY-e.touches[1].clientY;
      pinchStart=Math.hypot(dx,dy);
      const mx=(e.touches[0].clientX+e.touches[1].clientX)/2;
      const my=(e.touches[0].clientY+e.touches[1].clientY)/2;
      const card=document.elementFromPoint(mx,my)?.closest('.year-month');
      pinchMonth=card?parseInt(card.dataset.month):null;
    }
  },{passive:true});
  grid.addEventListener('touchend',e=>{
    if(pinchStart>0){
      const t0=e.changedTouches[0], t1=e.changedTouches[1]||t0;
      const dx=t0.clientX-t1.clientX, dy=t0.clientY-t1.clientY;
      if(Math.hypot(dx,dy)-pinchStart>40&&pinchMonth!==null){
        S.cursor=new Date(y,pinchMonth,1); setView('3months');
      }
      pinchStart=0;
    }
  },{passive:true});

  wrap.appendChild(grid);
  return wrap;
}

function miniMonth(y,m) {
  const card=el('div','year-month');
  card.dataset.month=m;
  card.addEventListener('click',()=>{ S.cursor=new Date(y,m,1); setView('month'); });

  const name=el('div','year-month-name'); name.textContent=t('MONS')[m]; card.appendChild(name);
  const grid=el('div','ymini'); card.appendChild(grid);

  t('DAYF').forEach(d=>{ const h=el('div','ymini-hd'); h.textContent=d[0]; grid.appendChild(h); });

  const first=new Date(y,m,1);
  let dow=first.getDay(); dow=dow===0?6:dow-1;
  const dim=new Date(y,m+1,0).getDate();
  const evDays=new Set(expand(new Date(y,m,1),new Date(y,m,dim)).map(e=>toDS(e._s)));

  for(let i=0;i<dow;i++){ const c=el('div','ymini-cell other'); grid.appendChild(c); }
  for(let d=1;d<=dim;d++){
    const date=new Date(y,m,d), dw=date.getDay();
    let cls='ymini-cell';
    if(dw===0||dw===6) cls+=' wkend';
    if(sameDay(date,S.today)) cls+=' today';
    if(evDays.has(toDS(date))) cls+=' dot';
    const c=el('div',cls); c.textContent=d; grid.appendChild(c);
  }
  return card;
}

// =====================
// 3 MONTHS VIEW
// =====================
function build3Months() {
  const wrap=el('div','threemon-view');
  wrap.appendChild(buildLegend());
  const scroll=el('div','threemon-scroll'); wrap.appendChild(scroll);

  for(let i=0;i<3;i++){
    const monthDate=new Date(S.cursor.getFullYear(), S.cursor.getMonth()+i, 1);
    scroll.appendChild(buildMonthBlock(monthDate, i===0));
  }

  // Pinch → go to individual month
  let pinchStart=0, pinchTarget=null;
  scroll.addEventListener('touchstart',e=>{
    if(e.touches.length===2){
      const dx=e.touches[0].clientX-e.touches[1].clientX;
      const dy=e.touches[0].clientY-e.touches[1].clientY;
      pinchStart=Math.hypot(dx,dy);
      const mx=(e.touches[0].clientX+e.touches[1].clientX)/2;
      const my=(e.touches[0].clientY+e.touches[1].clientY)/2;
      const block=document.elementFromPoint(mx,my)?.closest('.month-block');
      pinchTarget=block?block.dataset.month:null;
    }
  },{passive:true});
  scroll.addEventListener('touchend',e=>{
    if(pinchStart>0){
      const t0=e.changedTouches[0], t1=e.changedTouches[1]||t0;
      if(Math.hypot(t0.clientX-t1.clientX, t0.clientY-t1.clientY)-pinchStart>40&&pinchTarget){
        S.cursor=fromDS(pinchTarget+'-01'); setView('month');
      }
      pinchStart=0;
    }
  },{passive:true});

  return wrap;
}

// =====================
// MONTH BLOCK (used by month view and 3-months view)
// =====================
function buildMonthBlock(date, showLegend) {
  const y=date.getFullYear(), m=date.getMonth();
  const block=el('div','month-block');
  block.dataset.month=y+'-'+pad(m+1);

  // Month title row
  const title=el('div','month-block-title');
  title.textContent=t('MON')[m]+' '+y;
  title.addEventListener('click',()=>{ S.cursor=new Date(y,m,1); setView('month'); });
  block.appendChild(title);

  // Weekday header
  const hdr=el('div','month-hdr');
  const kwH=el('div','month-hdr-cell kw'); kwH.textContent=t('KW'); hdr.appendChild(kwH);
  t('DAYF').forEach((d,i)=>{
    const c=el('div','month-hdr-cell'+(i>=5?' wkend':'')); c.textContent=d; hdr.appendChild(c);
  });
  block.appendChild(hdr);

  // Grid
  const first=new Date(y,m,1), last=new Date(y,m+1,0);
  let dow=first.getDay(); dow=dow===0?6:dow-1;
  const gridStart=addDays(first,-dow);
  const weeks=Math.ceil((dow+last.getDate())/7);
  const gridEnd=addDays(gridStart,weeks*7-1);
  const allEvs=expand(gridStart,gridEnd);

  const grid=el('div','month-grid'); block.appendChild(grid);

  for(let w=0;w<weeks;w++){
    const ws=addDays(gridStart,w*7);
    const days=Array.from({length:7},(_,i)=>addDays(ws,i));
    const weekEvs=allEvs.filter(ev=>ev._s<=days[6]&&ev._e>=days[0]);
    grid.appendChild(buildMonthWeekRow(days, weekEvs, m));
  }
  return block;
}

function buildMonthWeekRow(days, weekEvs, currentMonth) {
  const row=el('div','month-row');
  const kw=el('div','month-kw'); kw.textContent=isoWeek(days[0]); row.appendChild(kw);

  const {multi, single, numLanes}=buildWeekBanners(days, weekEvs);

  const body=el('div','month-week-body');
  body.style.gridTemplateRows=numLanes>0?`repeat(${numLanes},20px) 1fr`:'1fr';

  // Multi-day banners
  multi.forEach(({ev,s,e,lane})=>{
    const cat=getCat(ev.category);
    const banner=el('div','month-banner');
    banner.style.background=cat.color;
    banner.style.gridColumn=`${s+1}/${e+2}`;
    banner.style.gridRow=String(lane+1);
    banner.textContent=ev.title||cat.name;
    banner.addEventListener('click',evt=>{evt.stopPropagation();openDetail(ev);});
    body.appendChild(banner);
  });

  // Day cells
  days.forEach((date,di)=>{
    let cls='month-cell';
    if(date.getMonth()!==currentMonth) cls+=' other';
    if(sameDay(date,S.today)) cls+=' today';
    if(di>=5) cls+=' wkend';
    const cell=el('div',cls);
    cell.style.gridColumn=String(di+1);
    cell.style.gridRow=String(numLanes+1);
    cell.addEventListener('click',()=>newEvent(toDS(date)));

    const dayNum=el('div','mday'); dayNum.textContent=date.getDate(); cell.appendChild(dayNum);

    // Single-day events in this cell
    const dayEvs=single[di]||[];
    const timedEvs=weekEvs.filter(e=>e.startTime&&sameDay(e._s,date));
    const allForDay=[...dayEvs,...timedEvs];
    const max=2;
    allForDay.slice(0,max).forEach(ev=>{
      const cat=getCat(ev.category);
      const chip=el('span','mev'); chip.style.background=cat.color;
      chip.textContent=ev.title||cat.name;
      chip.addEventListener('click',e=>{e.stopPropagation();openDetail(ev);});
      cell.appendChild(chip);
    });
    if(allForDay.length>max){
      const more=el('div','mev-more'); more.textContent='+'+(allForDay.length-max)+' mehr'; cell.appendChild(more);
    }
    body.appendChild(cell);
  });

  row.appendChild(body);
  return row;
}

// =====================
// MONTH VIEW
// =====================
function buildMonth() {
  const wrap=el('div','month-view');
  wrap.appendChild(buildLegend());
  wrap.appendChild(buildMonthBlock(S.cursor, false));
  return wrap;
}

// =====================
// ALL-DAY ROW FOR WEEK VIEW
// =====================
function buildAlldayRow(days, alldayEvs) {
  const {multi, single, numLanes}=buildWeekBanners(days, alldayEvs);
  const row=el('div','week-allday');
  const lbl=el('div','week-allday-lbl'); lbl.textContent=t('allDay'); row.appendChild(lbl);

  const body=el('div','week-allday-body');
  body.style.gridTemplateRows=numLanes>0?`repeat(${numLanes},20px) auto`:'auto';

  for(let d=0;d<7;d++){
    const sep=el('div','allday-sep'); sep.style.gridColumn=String(d+1); sep.style.gridRow='1 / -1';
    body.appendChild(sep);
  }

  multi.forEach(({ev,s,e,lane})=>{
    const cat=getCat(ev.category);
    const banner=el('div','allday-banner');
    banner.style.background=cat.color;
    banner.style.gridColumn=`${s+1}/${e+2}`;
    banner.style.gridRow=String(lane+1);
    banner.textContent=ev.title||cat.name;
    banner.addEventListener('click',()=>openDetail(ev));
    body.appendChild(banner);
  });

  single.forEach((evs,di)=>{
    evs.forEach(ev=>{
      const cat=getCat(ev.category);
      const chip=el('div','allday-chip');
      chip.style.background=cat.color;
      chip.style.gridColumn=String(di+1);
      chip.style.gridRow=String(numLanes+1);
      chip.textContent=ev.title||cat.name;
      chip.addEventListener('click',()=>openDetail(ev));
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
  const wrap=el('div','week-view');
  const ws=mondayOf(S.cursor);
  const days=Array.from({length:7},(_,i)=>addDays(ws,i));
  const kw=isoWeek(ws);

  // Header
  const hdr=el('div','week-hdr');
  const kwCell=el('div','week-hdr-kw'); kwCell.innerHTML=`<span>${t('KW')}</span><span>${kw}</span>`; hdr.appendChild(kwCell);
  days.forEach(day=>{
    const dw=day.getDay();
    let cls='week-hdr-day';
    if(sameDay(day,S.today)) cls+=' today';
    if(dw===0||dw===6) cls+=' wkend';
    const col=el('div',cls);
    col.innerHTML=`<div class="whd-name">${t('DAY')[dw]}</div><div class="whd-num">${day.getDate()}</div>`;
    col.addEventListener('click',()=>{ S.cursor=new Date(day); setView('day'); });
    hdr.appendChild(col);
  });
  wrap.appendChild(hdr);

  // Events
  const ws0=startOfDay(new Date(days[0]));
  const we0=new Date(days[6]); we0.setHours(23,59,59,999);
  const allEvs=expand(ws0,we0);
  const timedEvs=allEvs.filter(e=>e.startTime&&!e.allDay);
  const alldayEvs=allEvs.filter(e=>!e.startTime||e.allDay);

  wrap.appendChild(buildAlldayRow(days, alldayEvs));

  // Time grid
  const scrollEl=el('div','week-scroll'); wrap.appendChild(scrollEl);
  const tg=el('div','week-timegrid'); scrollEl.appendChild(tg);

  const lblCol=el('div','time-labels');
  for(let h=1;h<24;h++){
    const lbl=el('div','time-lbl'); lbl.style.top=(h*60)+'px'; lbl.textContent=pad(h)+':00'; lblCol.appendChild(lbl);
  }
  tg.appendChild(lblCol);

  days.forEach((day,di)=>{
    const col=el('div','week-day-col');
    for(let h=0;h<24;h++){
      const line=el('div','hour-line'); line.style.top=(h*60)+'px'; col.appendChild(line);
      const half=el('div','half-line'); half.style.top=(h*60+30)+'px'; col.appendChild(half);
      const zone=el('div','week-tap-zone');
      zone.style.top=(h*60)+'px'; zone.style.height='60px';
      zone.addEventListener('click',()=>newEvent(toDS(day),hhmm(h,0)));
      col.appendChild(zone);
    }
    if(sameDay(day,S.today)) col.appendChild(makeNowLine());
    layOut(timedEvs.filter(e=>sameDay(e._s,day)),col,false);
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

  if(allday.length){
    const row=el('div','day-allday');
    allday.forEach(ev=>{
      const cat=getCat(ev.category);
      const chip=el('div','day-allday-chip'); chip.style.background=cat.color;
      chip.textContent=ev.title||cat.name;
      chip.addEventListener('click',()=>openDetail(ev)); row.appendChild(chip);
    });
    wrap.appendChild(row);
  }

  const scrollEl=el('div','day-scroll'); wrap.appendChild(scrollEl);
  const tg=el('div','day-timegrid'); scrollEl.appendChild(tg);

  const lbls=el('div','day-labels');
  for(let h=1;h<24;h++){
    const lbl=el('div','day-lbl'); lbl.style.top=(h*60)+'px'; lbl.textContent=pad(h)+':00'; lbls.appendChild(lbl);
  }
  tg.appendChild(lbls);

  const col=el('div','day-col');
  for(let h=0;h<24;h++){
    const line=el('div','day-hour-line'); line.style.top=(h*60)+'px'; col.appendChild(line);
    const half=el('div','day-half-line'); half.style.top=(h*60+30)+'px'; col.appendChild(half);
    const zone=el('div','day-tap-zone');
    zone.style.top=(h*60)+'px'; zone.style.height='60px';
    zone.addEventListener('click',()=>newEvent(toDS(day),hhmm(h,0))); col.appendChild(zone);
  }
  if(sameDay(day,S.today)) col.appendChild(makeNowLine());
  layOut(timed,col,true);
  tg.appendChild(col);
  return wrap;
}

// =====================
// EVENT LAYOUT (overlap)
// =====================
function layOut(events,col,isDayView){
  const sorted=[...events].sort((a,b)=>parseHHMM(a.startTime).total-parseHHMM(b.startTime).total);
  const colEnd=[], assigned=[];
  sorted.forEach(ev=>{
    const st=parseHHMM(ev.startTime);
    const et=ev.endTime?parseHHMM(ev.endTime):{total:st.total+60};
    const sm=st.total, em=Math.max(et.total,sm+15);
    let c=0; while(colEnd[c]!==undefined&&colEnd[c]>sm) c++;
    colEnd[c]=em; assigned.push({ev,sm,em,c});
  });
  const nCols=colEnd.length||1;
  assigned.forEach(({ev,sm,em,c})=>{
    const cat=getCat(ev.category);
    const block=el('div',isDayView?'dev':'wev');
    block.style.background=cat.color;
    block.style.top=sm+'px';
    block.style.height=Math.max(20,em-sm)+'px';
    const w=100/nCols;
    block.style.left=isDayView?`calc(${c*w}% + 4px)`:`calc(${c*w}% + 2px)`;
    block.style.right=isDayView?`calc(${(nCols-c-1)*w}% + 4px)`:`calc(${(nCols-c-1)*w}% + 2px)`;
    const title=ev.title||getCat(ev.category).name;
    block.innerHTML=isDayView
      ?`<div class="dev-time">${ev.startTime}${ev.endTime?' – '+ev.endTime:''}</div><div>${escH(title)}</div>`
      :`<span class="wev-title">${escH(title)}</span>${em-sm>25?`<span class="wev-time">${ev.startTime}</span>`:''}`;
    block.addEventListener('click',e=>{e.stopPropagation();openDetail(ev);});
    col.appendChild(block);
  });
}

function makeNowLine(){
  const now=new Date(), line=el('div','now-line');
  line.style.top=(now.getHours()*60+now.getMinutes())+'px'; line.dataset.nl='1'; return line;
}

setInterval(()=>{
  const now=new Date();
  document.querySelectorAll('[data-nl]').forEach(l=>l.style.top=(now.getHours()*60+now.getMinutes())+'px');
},60000);

// =====================
// NAVIGATION
// =====================
function navigate(dir){
  const c=S.cursor;
  if      (S.view==='year')    c.setFullYear(c.getFullYear()+dir);
  else if (S.view==='3months') c.setMonth(c.getMonth()+dir*3);
  else if (S.view==='month')   c.setMonth(c.getMonth()+dir);
  else if (S.view==='week')    c.setDate(c.getDate()+dir*7);
  else                         c.setDate(c.getDate()+dir);
  S.cursor=new Date(c); render();
}
function goToday(){ S.cursor=new Date(S.today); render(); }
function setView(v){ S.view=v; render(); }

// =====================
// TIME ROW VISIBILITY
// =====================
function updateTimeRow(){
  const date=document.getElementById('ev-date').value;
  const end =document.getElementById('ev-date-end').value;
  const multi=end&&end>date;
  document.getElementById('ev-time-row').classList.toggle('hidden',multi);
  if(multi){ document.getElementById('ev-start').value=''; document.getElementById('ev-end').value=''; }
}

// =====================
// EVENT MODAL
// =====================
function newEvent(dateStr, timeStr){
  S.editingId=null;
  document.getElementById('modal-title-label').textContent=t('newEvent');
  document.getElementById('ev-title').value='';
  document.getElementById('ev-date').value=dateStr||toDS(S.cursor);
  document.getElementById('ev-date-end').value=dateStr||toDS(S.cursor);
  document.getElementById('ev-notes').value='';
  document.getElementById('ev-repeat').value='none';
  document.getElementById('ev-custom-days').classList.add('hidden');
  document.getElementById('ev-delete').classList.add('hidden');
  if(timeStr){
    document.getElementById('ev-start').value=timeStr;
    const t0=parseHHMM(timeStr);
    document.getElementById('ev-end').value=hhmm(Math.min(23,t0.h+1),t0.m);
  } else {
    document.getElementById('ev-start').value='';
    document.getElementById('ev-end').value='';
  }
  updateTimeRow(); buildCatChips(null); clearDayChips();
  showModal('event-modal');
}

function editEvent(ev){
  S.editingId=ev.id;
  document.getElementById('modal-title-label').textContent=t('editEvent');
  document.getElementById('ev-title').value=ev.title||'';
  document.getElementById('ev-date').value=ev.date;
  document.getElementById('ev-date-end').value=ev.dateEnd||ev.date;
  document.getElementById('ev-start').value=ev.startTime||'';
  document.getElementById('ev-end').value=ev.endTime||'';
  document.getElementById('ev-notes').value=ev.notes||'';
  document.getElementById('ev-repeat').value=ev.repeat||'none';
  document.getElementById('ev-custom-days').classList.toggle('hidden',ev.repeat!=='custom');
  document.getElementById('ev-delete').classList.remove('hidden');
  updateTimeRow(); buildCatChips(ev.category); clearDayChips();
  (ev.repeatDays||[]).forEach(d=>{
    document.querySelectorAll('.day-chip').forEach(b=>{ if(Number(b.dataset.day)===d) b.classList.add('sel'); });
  });
  hideModal('detail-modal'); showModal('event-modal');
}

let _catEditMode=false;

function buildCatChips(selected){
  _catEditMode=false;
  document.getElementById('ev-cat-edit-toggle').textContent='✏️';
  renderCatChips(document.getElementById('ev-category-row'), selected);
}

function renderCatChips(row, selected){
  row.innerHTML='';
  S.categories.forEach(cat=>{
    const wrap=el('div','cat-chip-wrap');
    const chip=el('button','cat-chip'+(cat.id===selected?' selected':''));
    chip.style.background=cat.color; chip.textContent=cat.name; chip.dataset.id=cat.id;
    chip.addEventListener('click',()=>{
      if(_catEditMode)return;
      row.querySelectorAll('.cat-chip').forEach(c=>c.classList.remove('selected'));
      chip.classList.add('selected'); selected=cat.id;
    });
    wrap.appendChild(chip);
    if(_catEditMode){
      const d=el('button','cat-chip-del'); d.textContent='✕';
      d.addEventListener('click',e=>{
        e.stopPropagation();
        S.categories=S.categories.filter(c=>c.id!==cat.id);
        if(selected===cat.id) selected=S.categories[0]?.id||null;
        persist(); renderCatChips(row,selected);
        renderCatList(); // update settings list too if open
      });
      wrap.appendChild(d);
    }
    row.appendChild(wrap);
  });
  const addBtn=el('button','cat-chip-add'); addBtn.textContent='+';
  addBtn.addEventListener('click',()=>{ _pendingSelected=selected; openCatModalFromEvent(); });
  row.appendChild(addBtn);
  if(!selected&&row.querySelector('.cat-chip')) row.querySelector('.cat-chip').classList.add('selected');
}

function clearDayChips(){ document.querySelectorAll('.day-chip').forEach(b=>b.classList.remove('sel')); }

function saveEvent(){
  const date=document.getElementById('ev-date').value; if(!date)return;
  const dateEnd=document.getElementById('ev-date-end').value;
  const title=document.getElementById('ev-title').value.trim();
  const startTime=document.getElementById('ev-start').value;
  const endTime=document.getElementById('ev-end').value;
  const notes=document.getElementById('ev-notes').value.trim();
  const repeat=document.getElementById('ev-repeat').value;
  const sel=document.querySelector('#ev-category-row .cat-chip.selected');
  const category=sel?sel.dataset.id:(S.categories[0]?.id||'');
  const repeatDays=[];
  document.querySelectorAll('.day-chip.sel').forEach(b=>repeatDays.push(Number(b.dataset.day)));
  const data={title,date,dateEnd:dateEnd!==date?dateEnd:null,startTime,endTime,notes,repeat,repeatDays,category};
  if(S.editingId){
    const i=S.events.findIndex(e=>e.id===S.editingId); if(i!==-1) S.events[i]={...S.events[i],...data};
  } else {
    S.events.push({id:uid(),...data});
  }
  persist(); hideModal('event-modal'); render();
}

function deleteEditingEvent(){
  if(!S.editingId)return;
  S.events=S.events.filter(e=>e.id!==S.editingId);
  persist(); hideModal('event-modal'); render();
}

// =====================
// DETAIL MODAL
// =====================
function openDetail(ev){
  const cat=getCat(ev.category);
  document.getElementById('detail-title').innerHTML=
    `<span class="detail-cat-dot" style="background:${cat.color}"></span>${escH(ev.title||cat.name)}`;
  const body=document.getElementById('detail-body'); body.innerHTML='';
  const row=(icon,val)=>{
    const r=el('div','detail-row');
    r.innerHTML=`<span class="detail-icon">${icon}</span><span class="detail-val">${val}</span>`;
    body.appendChild(r);
  };
  const d=fromDS(ev.date);
  const MON=t('MON');
  let ds=d.getDate()+'. '+MON[d.getMonth()]+' '+d.getFullYear();
  if(ev.dateEnd&&ev.dateEnd!==ev.date){
    const de=fromDS(ev.dateEnd); ds+=' – '+de.getDate()+'. '+MON[de.getMonth()];
  }
  row('📅',ds);
  if(ev.startTime) row('🕐',ev.startTime+(ev.endTime?' – '+ev.endTime:''));
  row('🏷',cat.name);
  const rl={daily:t('rLblDaily'),weekly:t('rLblWeekly'),custom:t('rLblCustom'),yearly:t('rLblYearly')};
  if(ev.repeat&&ev.repeat!=='none') row('🔄',rl[ev.repeat]||ev.repeat);
  if(ev.notes) row('📝',escH(ev.notes));
  document.getElementById('detail-edit').onclick=()=>editEvent(ev);
  document.getElementById('detail-delete').onclick=()=>{
    S.events=S.events.filter(e=>e.id!==ev.id);
    persist(); hideModal('detail-modal'); render();
  };
  showModal('detail-modal');
}

// =====================
// SETTINGS
// =====================
function openSettings(){
  document.getElementById('toggle-dark').checked=S.dark;
  applyTranslations();
  renderCatList();
  showModal('settings-modal');
}

function renderCatList(){
  const list=document.getElementById('category-list'); if(!list)return;
  list.innerHTML='';
  S.categories.forEach(cat=>{
    const item=el('div','cat-item');
    item.innerHTML=`<span class="cat-dot" style="background:${cat.color}"></span><span class="cat-name">${escH(cat.name)}</span><button class="cat-del">✕</button>`;
    item.querySelector('.cat-del').addEventListener('click',()=>{
      S.categories=S.categories.filter(c=>c.id!==cat.id);
      persist(); renderCatList();
    });
    list.appendChild(item);
  });
}

// =====================
// CATEGORY MODAL
// =====================
let _newCatColor='#ef4444', _pendingSelected=null;

function openCatModalFromEvent(){
  document.getElementById('cat-name').value='';
  _newCatColor='#ef4444';
  document.querySelectorAll('.color-chip').forEach(b=>b.classList.toggle('sel',b.dataset.color===_newCatColor));
  showModal('cat-modal');
}

function saveCat(){
  const name=document.getElementById('cat-name').value.trim(); if(!name)return;
  const newCat={id:uid(),name,color:_newCatColor};
  S.categories.push(newCat); persist();
  hideModal('cat-modal');
  const row=document.getElementById('ev-category-row');
  if(row) renderCatChips(row,newCat.id);
  renderCatList();
}

// =====================
// MODAL HELPERS
// =====================
function showModal(id){ document.getElementById(id).classList.remove('hidden'); }
function hideModal(id){ document.getElementById(id).classList.add('hidden'); }
function hideAllModals(){ document.querySelectorAll('.modal').forEach(m=>m.classList.add('hidden')); }

// =====================
// SWIPE
// =====================
let tx=0,ty=0;
document.addEventListener('touchstart',e=>{tx=e.touches[0].clientX;ty=e.touches[0].clientY;},{passive:true});
document.addEventListener('touchend',e=>{
  const dx=e.changedTouches[0].clientX-tx;
  const dy=e.changedTouches[0].clientY-ty;
  if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.5){
    if(!document.querySelector('.modal:not(.hidden)')) navigate(dx<0?1:-1);
  }
},{passive:true});

// =====================
// UTILS
// =====================
function el(tag,cls){ const e=document.createElement(tag); if(cls)e.className=cls; return e; }
function escH(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

// =====================
// THEME
// =====================
function applyTheme(){
  document.body.classList.toggle('dark',S.dark);
  document.body.classList.toggle('light',!S.dark);
  const meta=document.getElementById('theme-color-meta');
  if(meta) meta.content=S.dark?'#0d0d1a':'#ffffff';
  const icon=document.getElementById('darkmode-icon');
  if(icon) icon.textContent=S.dark?'☀️':'🌙';
}

// =====================
// INIT
// =====================
function init(){
  hydrate(); applyTheme(); applyTranslations();

  document.querySelectorAll('.view-btn').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.view)));
  document.getElementById('btn-prev').addEventListener('click',()=>navigate(-1));
  document.getElementById('btn-next').addEventListener('click',()=>navigate(1));
  document.getElementById('btn-today').addEventListener('click',goToday);
  document.getElementById('fab').addEventListener('click',()=>newEvent());

  document.getElementById('btn-darkmode').addEventListener('click',()=>{ S.dark=!S.dark; persist(); applyTheme(); });
  document.getElementById('btn-settings').addEventListener('click',openSettings);

  document.getElementById('toggle-dark').addEventListener('change',e=>{ S.dark=e.target.checked; persist(); applyTheme(); });

  document.querySelectorAll('.lang-btn').forEach(b=>b.addEventListener('click',()=>{
    S.lang=b.dataset.lang; persist(); applyTranslations(); render();
  }));

  document.getElementById('btn-add-category').addEventListener('click',()=>{ hideModal('settings-modal'); openCatModalFromEvent(); });

  document.getElementById('ev-cat-edit-toggle').addEventListener('click',()=>{
    _catEditMode=!_catEditMode;
    document.getElementById('ev-cat-edit-toggle').textContent=_catEditMode?'✅':'✏️';
    const row=document.getElementById('ev-category-row');
    renderCatChips(row, row.querySelector('.cat-chip.selected')?.dataset?.id||null);
  });

  document.getElementById('ev-save').addEventListener('click',saveEvent);
  document.getElementById('ev-delete').addEventListener('click',deleteEditingEvent);
  document.getElementById('ev-date').addEventListener('change',updateTimeRow);
  document.getElementById('ev-date-end').addEventListener('change',updateTimeRow);
  document.getElementById('ev-repeat').addEventListener('change',e=>{
    document.getElementById('ev-custom-days').classList.toggle('hidden',e.target.value!=='custom');
  });
  document.querySelectorAll('.day-chip').forEach(b=>b.addEventListener('click',()=>b.classList.toggle('sel')));

  document.querySelectorAll('.color-chip').forEach(b=>b.addEventListener('click',()=>{
    _newCatColor=b.dataset.color;
    document.querySelectorAll('.color-chip').forEach(x=>x.classList.toggle('sel',x===b));
  }));

  document.getElementById('cat-save').addEventListener('click',saveCat);

  document.querySelectorAll('.modal-backdrop,.modal-close').forEach(el=>el.addEventListener('click',hideAllModals));
  document.querySelectorAll('.modal-sheet').forEach(s=>s.addEventListener('click',e=>e.stopPropagation()));

  render();
}

document.addEventListener('DOMContentLoaded',init);
