/* NOIR portfolio demo — local browser storage only. NOT a secure/shared booking backend. */
(() => {
  'use strict';
  const HOURS_KEY = 'noir-demo-hours-v3';
  const BOOKINGS_KEY = 'noir-demo-bookings-v3';
  const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const BARBERS = ['Alex','Jordan'];
  const SERVICES = Object.freeze({
    signature: { name: 'The Signature Cut', price: 35, minutes: 45 },
    beard: { name: 'Beard Sculpt', price: 20, minutes: 30 },
    combo: { name: 'The Full Experience', price: 50, minutes: 75 },
    refresh: { name: 'The Quick Refresh', price: 25, minutes: 30 }
  });
  const DEFAULT_HOURS = [
    {open:'10:00',close:'19:00',closed:true}, // Sun
    {open:'10:00',close:'19:00',closed:true}, // Mon
    {open:'10:00',close:'19:00',closed:false},
    {open:'10:00',close:'19:00',closed:false},
    {open:'10:00',close:'19:00',closed:false},
    {open:'10:00',close:'19:00',closed:false},
    {open:'10:00',close:'19:00',closed:false}
  ];
  const ACTIVE_STATUSES = ['Pending','Confirmed'];
  const STATUSES = ['Pending','Confirmed','Completed','Cancelled'];
  const now = () => new Date();
  const pad = n => String(n).padStart(2,'0');
  function dateKey(d) { return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
  function parseDate(str) {
    if (typeof str !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(str)) return null;
    const [y,m,d] = str.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return dateKey(date) === str ? date : null;
  }
  function toMinutes(s) {
    if (!/^\d{2}:\d{2}$/.test(String(s))) return NaN;
    const [h,m] = s.split(':').map(Number);
    return h >= 0 && h <= 23 && m >= 0 && m <= 59 ? h*60+m : NaN;
  }
  function toTime(minutes) { return `${pad(Math.floor(minutes/60))}:${pad(minutes%60)}`; }
  function safeParse(key, fallback) {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
    catch { return fallback; }
  }
  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch { throw new Error('Your browser is blocking demo storage. Use a normal browser tab or local web server.'); }
    window.dispatchEvent(new CustomEvent('noir:update', {detail:{key}}));
  }
  function validateHours(items) {
    if (!Array.isArray(items) || items.length !== 7) throw new Error('Please provide hours for all seven days.');
    return items.map((item, i) => {
      if (!item || typeof item.closed !== 'boolean') throw new Error(`Invalid hours for ${DAY_NAMES[i]}.`);
      const open = toMinutes(item.open), close = toMinutes(item.close);
      if (!Number.isFinite(open) || !Number.isFinite(close) || open >= close || open%30 || close%30) {
        throw new Error(`Check ${DAY_NAMES[i]}: opening and closing hours must be in 30-minute steps, and closing must be later.`);
      }
      return {open:item.open, close:item.close, closed:item.closed};
    });
  }
  function getHours() {
    const stored = safeParse(HOURS_KEY, null);
    try { return validateHours(stored || DEFAULT_HOURS); }
    catch { return DEFAULT_HOURS.map(h=>({...h})); }
  }
  function setHours(days) { save(HOURS_KEY, validateHours(days)); }
  function getBookings() {
    const stored = safeParse(BOOKINGS_KEY, []);
    return Array.isArray(stored) ? stored.filter(b => b && typeof b.id === 'string' && parseDate(b.date) && STATUSES.includes(b.status)) : [];
  }
  function appointmentsOverlap(date, startMin, duration, barber, bookings) {
    const end = startMin + duration;
    return bookings.some(b => b.date === date && b.barber === barber && ACTIVE_STATUSES.includes(b.status) &&
      startMin < toMinutes(b.time) + (SERVICES[b.service]?.minutes || 30) && toMinutes(b.time) < end);
  }
  function dateIsAllowed(date) {
    const parsed = parseDate(date);
    if (!parsed) return false;
    const today = now(); today.setHours(0,0,0,0);
    const max = new Date(today); max.setDate(max.getDate()+60);
    return parsed >= today && parsed <= max;
  }
  function dayHours(date) { const parsed = parseDate(date); return parsed ? getHours()[parsed.getDay()] : null; }
  function slotOptions(date, service, barber = 'First available') {
    if (!SERVICES[service] || !dateIsAllowed(date)) return [];
    const hours = dayHours(date);
    if (!hours || hours.closed) return [];
    const booked = getBookings();
    const today = dateKey(now());
    const current = now();
    const threshold = current.getHours()*60 + current.getMinutes()+30; // demo: 30 min minimum notice
    const options = [];
    const duration = SERVICES[service].minutes;
    const requestedBarbers = BARBERS.includes(barber) ? [barber] : BARBERS;
    for (let start = toMinutes(hours.open); start+duration <= toMinutes(hours.close); start+=30) {
      const selectableBarber = requestedBarbers.find(person => !appointmentsOverlap(date,start,duration,person,booked));
      options.push({time:toTime(start), available: Boolean(selectableBarber) && !(date===today && start < threshold), barber: selectableBarber || null});
    }
    return options;
  }
  function createBooking(details) {
    const {name, service, date, time} = details;
    const requested = details.barber || 'First available';
    if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 80) throw new Error('Please enter a name of 2–80 characters.');
    if (!SERVICES[service]) throw new Error('Choose a valid service.');
    if (!BARBERS.includes(requested) && requested !== 'First available') throw new Error('Choose a valid barber.');
    if (!dateIsAllowed(date)) throw new Error('Choose a date within the next 60 days.');
    const slot = slotOptions(date, service, requested).find(s => s.time === time);
    if (!slot?.available) throw new Error('That time is unavailable. Please choose another slot.');
    const item = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name:name.trim(), service, barber:slot.barber, date, time,
      status:'Pending', createdAt:new Date().toISOString()
    };
    const all = getBookings(); all.push(item); save(BOOKINGS_KEY,all);
    return item;
  }
  function setStatus(id,status) {
    if (!STATUSES.includes(status)) throw new Error('Invalid reservation status.');
    const bookings = getBookings(), item=bookings.find(b=>b.id===id);
    if (!item) throw new Error('Reservation not found.');
    if (ACTIVE_STATUSES.includes(status) && !ACTIVE_STATUSES.includes(item.status)) {
      const duration = SERVICES[item.service]?.minutes || 30;
      if (appointmentsOverlap(item.date,toMinutes(item.time),duration,item.barber,bookings.filter(b=>b.id!==id))) {
        throw new Error('This appointment overlaps with another active reservation.');
      }
    }
    item.status=status; save(BOOKINGS_KEY,bookings);
  }
  function deleteBooking(id) { save(BOOKINGS_KEY,getBookings().filter(b=>b.id!==id)); }
  function clearBookings() { save(BOOKINGS_KEY,[]); }
  function addSampleBookings() {
    const names=['Taylor Reed','Morgan Lane','Sam Carter','Jamie Parker'];
    const services=['signature','combo','beard','refresh'];
    let count=0, i=0, days=1;
    while (count<4 && days<25) {
      const d = now(); d.setDate(d.getDate()+days); const date=dateKey(d);
      if (!dayHours(date)?.closed) {
        const service=services[count], choice=slotOptions(date,service,'First available').filter(s=>s.available);
        const slot=choice[Math.min(count*2,Math.max(0,choice.length-1))];
        if (slot) {
          const b=createBooking({name:names[count],service,date,time:slot.time,barber:'First available'});
          if (count===0 || count===2) setStatus(b.id,'Confirmed');
          count++;
        }
      }
      days++; i++;
    }
    return count;
  }
  window.NOIR_STORE = Object.freeze({DAY_NAMES,BARBERS,SERVICES,STATUSES,ACTIVE_STATUSES,DEFAULT_HOURS,
    dateKey,parseDate,toMinutes,toTime,getHours,setHours,getBookings,slotOptions,dayHours,
    createBooking,setStatus,deleteBooking,clearBookings,addSampleBookings});
})();
