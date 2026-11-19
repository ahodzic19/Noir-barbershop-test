(() => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));
  const header = $('#site-header');
  const progress = $('#progress-bar');
  const mobileMenu = $('#mobile-nav');
  const menuToggle = $('.menu-toggle');
  const modal = $('#booking-modal');
  const form = $('#booking-form');
  const dateInput = $('#booking-date');
  const timeInput = $('#booking-time-select');
  const error = $('#form-error');
  const success = $('#booking-success');
  const flightScene = $('#flight-scene');
  const deliveryComplete = $('#delivery-complete');
  const deliveryTitle = $('#delivery-title');
  const deliveryStatus = $('#delivery-status');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let deliveryTimer = null;
  const serviceInput = $('#booking-service');

  function updateScroll() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (max > 0 ? Math.min(100, window.scrollY / max * 100) : 0) + '%';
    header.classList.toggle('scrolled', window.scrollY > 24);
  }
  window.addEventListener('scroll', updateScroll, { passive: true });
  updateScroll();

  function closeMobileMenu() {
    mobileMenu.hidden = true;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation');
  }
  menuToggle.addEventListener('click', () => {
    const open = mobileMenu.hidden;
    mobileMenu.hidden = !open;
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  });
  $$('#mobile-nav a').forEach(a => a.addEventListener('click', closeMobileMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMobileMenu(); });

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); }
      });
    }, { threshold: .08, rootMargin: '0px 0px -28px 0px' });
    $$('.reveal').forEach(el => revealObserver.observe(el));
  } else { $$('.reveal').forEach(el => el.classList.add('visible')); }

  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const cursor = $('.ambient-cursor');
    window.addEventListener('pointermove', e => {
      cursor.style.left = e.clientX + 'px'; cursor.style.top = e.clientY + 'px'; cursor.style.opacity = '1';
    }, { passive: true });
    $$('.magnetic').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect(); const dx = (e.clientX - r.left - r.width / 2) * .095; const dy = (e.clientY - r.top - r.height / 2) * .15;
        el.style.transform = `translate(${dx}px,${dy}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  const testimonials = [
    { q: 'Not just a haircut — the whole experience feels different. Clean, considered, and absolutely worth it.', name: 'ALEX M.' },
    { q: 'Sharp lines, incredible attention to detail, and the kind of atmosphere you want to come back to.', name: 'JAMIE R.' },
    { q: 'An everyday routine turned into something you genuinely look forward to. That is what good design feels like.', name: 'CHRIS D.' }
  ];
  let reviewIndex = 0;
  function changeReview(dir) {
    reviewIndex = (reviewIndex + dir + testimonials.length) % testimonials.length;
    const quote = $('#quote-text'); const name = $('#quote-name');
    quote.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 350, easing: 'ease-out' });
    quote.textContent = testimonials[reviewIndex].q;
    name.textContent = testimonials[reviewIndex].name;
  }
  $('#prev-review').addEventListener('click', () => changeReview(-1));
  $('#next-review').addEventListener('click', () => changeReview(1));

  // Functional portfolio booking demo. Shared in this browser ONLY (localStorage).
  // Production use requires a backend and authenticated admin access.
  const store = window.NOIR_STORE;
  const barberInput = $('#booking-form select[name="barber"]');
  const timeGrid = $('#time-grid');
  const timeNote = $('#time-note');
  const showTimeGrid = $('#show-time-grid');
  const nextOpenDay = $('#next-open-day');
  const hoursStatus = $('#hours-status');
  const hoursList = $('#public-hours-list');
  const serviceDuration = () => store.SERVICES[serviceInput.value]?.minutes || 30;

  function futureDate(days) {
    const d = new Date(); d.setDate(d.getDate()+days); return store.dateKey(d);
  }
  dateInput.min = store.dateKey(new Date());
  dateInput.max = futureDate(60);
  function firstOpenDate(startDate = new Date(), skipStart = false) {
    const base = new Date(startDate);
    base.setHours(12, 0, 0, 0); // avoid DST boundary shifts
    const first = skipStart ? 1 : 0;
    for (let i = first; i <= 60; i++) {
      const day = new Date(base); day.setDate(base.getDate() + i);
      const d = store.dateKey(day);
      if (d > dateInput.max) break;
      if (d >= dateInput.min && store.slotOptions(d, serviceInput.value, barberInput.value).some(s => s.available)) return d;
    }
    return null;
  }

  function renderHours() {
    const list=store.getHours(), today=new Date(), todayDay=today.getDay();
    hoursList.replaceChildren();
    // Start at Monday for an easy-to-scan workweek.
    [1,2,3,4,5,6,0].forEach(day => {
      const h = list[day], row = document.createElement('div');
      row.className='hours-row'+(day===todayDay?' today':'')+(h.closed?' closed':'');
      const name=document.createElement('span'),time=document.createElement('span');
      name.className='day'; name.textContent=store.DAY_NAMES[day];
      time.className='time'; time.textContent=h.closed?'Closed':`${h.open} – ${h.close}`;
      row.append(name,time); hoursList.append(row);
    });
    const todayHours=list[todayDay],current=today.getHours()*60+today.getMinutes();
    const isOpen=!todayHours.closed && current>=store.toMinutes(todayHours.open) && current<store.toMinutes(todayHours.close);
    hoursStatus.classList.toggle('is-open',isOpen);
    hoursStatus.classList.toggle('is-closed',!isOpen);
    hoursStatus.querySelector('span:last-child').textContent = isOpen
      ? `We're open today until ${todayHours.close}.`
      : todayHours.closed ? 'The studio is closed today.' : `Currently closed · Today's hours ${todayHours.open}–${todayHours.close}.`;
  }

  function renderSlots() {
    const selected = timeInput.value;
    const slots = store.slotOptions(dateInput.value, serviceInput.value, barberInput.value);
    const availableSlots = slots.filter(slot => slot.available);
    timeGrid.replaceChildren();
    timeInput.replaceChildren();
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = availableSlots.length ? 'Select an available time…' : 'No times on this date — choose another day';
    timeInput.append(placeholder);
    availableSlots.forEach(slot => {
      const option = document.createElement('option');
      option.value = slot.time;
      option.textContent = slot.time;
      timeInput.append(option);
    });
    if (availableSlots.some(slot => slot.time === selected)) timeInput.value = selected;
    else timeInput.value = '';
    slots.forEach(slot => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'time-slot';
      b.textContent = slot.time; b.dataset.time = slot.time; b.disabled = !slot.available;
      b.setAttribute('aria-pressed', String(slot.available && timeInput.value === slot.time));
      if (slot.available) {
        if (timeInput.value === slot.time) b.classList.add('active');
        b.addEventListener('click', () => {
          timeInput.value = slot.time;
          error.textContent = '';
          $$('.time-slot').forEach(el => {
            el.classList.toggle('active', el === b);
            el.setAttribute('aria-pressed', String(el === b));
          });
        });
      }
      timeGrid.append(b);
    });
    const h = store.dayHours(dateInput.value);
    if (!h) timeNote.textContent = 'Choose a date within the next 60 days.';
    else if (h.closed) timeNote.textContent = 'Closed on this date. Click “Next available day” to choose another date.';
    else if (!availableSlots.length) timeNote.textContent = 'No slots available. Try another date, service or barber.';
    else timeNote.textContent = `${availableSlots.length} available times · ${serviceDuration()} min service · demo only`;
    timeInput.disabled = availableSlots.length === 0;
    showTimeGrid.disabled = slots.length === 0;
    nextOpenDay.disabled = !firstOpenDate(store.parseDate(dateInput.value) || new Date(), true);
  }
  function openBooking(service) {
    form.hidden=false; success.hidden=true; resetDelivery(); error.textContent='';
    if (service && store.SERVICES[service]) serviceInput.value=service;
    if (!dateInput.value || dateInput.value < dateInput.min || dateInput.value > dateInput.max) dateInput.value = firstOpenDate() || dateInput.min;
    renderSlots();
    if (typeof modal.showModal==='function') modal.showModal(); else modal.setAttribute('open','');
    document.body.classList.add('modal-open');
  }
  function closeBooking() {
    if (deliveryTimer) { clearTimeout(deliveryTimer); deliveryTimer=null; }
    if (typeof modal.close==='function') modal.close(); else modal.removeAttribute('open');
    document.body.classList.remove('modal-open');
  }
  $$('a[href="#booking"]').forEach(a => a.addEventListener('click',e=>{e.preventDefault();closeMobileMenu();openBooking();}));
  $$('.open-booking').forEach(btn=>btn.addEventListener('click',()=>openBooking()));
  $$('.service-row').forEach(btn=>btn.addEventListener('click',()=>openBooking(btn.dataset.service)));
  $('#close-booking').addEventListener('click',closeBooking);
  modal.addEventListener('close',()=>document.body.classList.remove('modal-open'));
  modal.addEventListener('click',e=>{if(e.target===modal)closeBooking();});
  [serviceInput, barberInput, dateInput].forEach(el => el.addEventListener('change', () => { error.textContent = ''; renderSlots(); }));
  timeInput.addEventListener('change', () => {
    error.textContent = '';
    $$('.time-slot').forEach(b => {
      const active = b.dataset.time === timeInput.value;
      b.classList.toggle('active', active);
      b.setAttribute('aria-pressed', String(active));
    });
  });
  showTimeGrid.addEventListener('click', () => {
    const expanded = showTimeGrid.getAttribute('aria-expanded') === 'true';
    showTimeGrid.setAttribute('aria-expanded', String(!expanded));
    showTimeGrid.innerHTML = expanded ? 'VIEW ALL TIME SLOTS <span aria-hidden="true">⌄</span>' : 'HIDE TIME SLOTS <span aria-hidden="true">⌃</span>';
    timeGrid.hidden = expanded;
  });
  nextOpenDay.addEventListener('click', () => {
    const next = firstOpenDate(store.parseDate(dateInput.value) || new Date(), true);
    if (next) { dateInput.value = next; renderSlots(); timeInput.focus(); }
  });

  form.addEventListener('submit',e=>{
    e.preventDefault();
    if (!form.reportValidity()) return;
    if (!timeInput.value) {error.textContent='Please select an available appointment time.';return;}
    const data=new FormData(form);
    let booking;
    try {
      booking=store.createBooking({name:String(data.get('name')||''),service:String(data.get('service')||''),
        barber:String(data.get('barber')||''),date:String(data.get('date')||''),time:String(data.get('time')||'')});
    } catch (err) {
      error.textContent=err.message || 'Unable to save this demo booking.';
      renderSlots();return;
    }
    const service=store.SERVICES[booking.service];
    $('#booking-summary').textContent=`${booking.name} · ${service.name} · ${booking.barber} · ${booking.date} at ${booking.time}. Status: Pending (demo).`;
    form.hidden=true;success.hidden=false;resetDelivery();
    modal.scrollTo({top:0,behavior:'auto'});
    if(reducedMotion.matches){finishDelivery();}
    else{void flightScene.offsetWidth;flightScene.classList.add('is-flying');deliveryTimer=setTimeout(finishDelivery,2440);}
  });
  function resetDelivery(){
    if(deliveryTimer){clearTimeout(deliveryTimer);deliveryTimer=null;}
    flightScene.classList.remove('is-flying','is-delivered');deliveryComplete.hidden=true;
    deliveryTitle.innerHTML='TAKING <em>FLIGHT.</em>';
    deliveryStatus.textContent='Your demo request is flying to the NOIR inbox.';
  }
  function finishDelivery(){
    deliveryTimer=null;flightScene.classList.add('is-delivered');deliveryComplete.hidden=false;
    deliveryTitle.innerHTML='JUST <em>LANDED.</em>';
    deliveryStatus.textContent='Your demo appointment is now visible in the local admin dashboard.';
  }
  $('#book-another').addEventListener('click',()=>{
    form.reset();dateInput.value=firstOpenDate() || dateInput.min;timeInput.value='';form.hidden=false;success.hidden=true;
    resetDelivery();error.textContent='';renderSlots();
  });
  window.addEventListener('storage',()=>{renderHours();if(modal.open && !form.hidden)renderSlots();});
  window.addEventListener('noir:update',()=>{renderHours();});
  renderHours();
})();
