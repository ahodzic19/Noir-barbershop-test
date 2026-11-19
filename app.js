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
  const timeInput = $('#booking-time');
  const error = $('#form-error');
  const success = $('#booking-success');
  const serviceInput = $('#booking-service');
  const schedule = ['10:00', '11:30', '13:00', '14:30', '16:00', '17:30'];

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

  // Date is computed in local time so there is no off-by-one UTC error.
  const now = new Date();
  const todayString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  dateInput.min = todayString;
  function openBooking(service) {
    form.hidden = false;
    success.hidden = true;
    error.textContent = '';
    if (service && ['signature','beard','combo','refresh'].includes(service)) serviceInput.value = service;
    if (!dateInput.value) dateInput.value = todayString;
    if (typeof modal.showModal === 'function') modal.showModal(); else modal.setAttribute('open','');
    document.body.classList.add('modal-open');
  }
  function closeBooking() {
    if (typeof modal.close === 'function') modal.close(); else modal.removeAttribute('open');
    document.body.classList.remove('modal-open');
  }
  $$('a[href="#booking"]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); closeMobileMenu(); openBooking(); }));
  $$('.open-booking').forEach(btn => btn.addEventListener('click', () => openBooking()));
  $$('.service-row').forEach(btn => btn.addEventListener('click', () => openBooking(btn.dataset.service)));
  $('#close-booking').addEventListener('click', closeBooking);
  modal.addEventListener('close', () => { document.body.classList.remove('modal-open'); });
  modal.addEventListener('click', e => { if (e.target === modal) closeBooking(); });
  $$('.time-slot').forEach(btn => btn.addEventListener('click', () => {
    $$('.time-slot').forEach(slot => { slot.classList.remove('active'); slot.setAttribute('aria-pressed','false'); });
    btn.classList.add('active'); btn.setAttribute('aria-pressed', 'true');
    timeInput.value = btn.dataset.time; error.textContent = '';
  }));
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    if (!timeInput.value || !schedule.includes(timeInput.value)) { error.textContent = 'Please choose an appointment time.'; return; }
    if (dateInput.value < todayString) { error.textContent = 'Please select today or a future date.'; return; }
    const data = new FormData(form);
    const selectedService = serviceInput.options[serviceInput.selectedIndex].text;
    $('#booking-summary').textContent = `${data.get('name')}, here is your preview: ${selectedService} with ${data.get('barber')} on ${data.get('date')} at ${data.get('time')}.`;
    form.hidden = true; success.hidden = false;
  });
  $('#book-another').addEventListener('click', () => {
    form.reset(); timeInput.value = ''; $$('.time-slot').forEach(s => { s.classList.remove('active'); s.setAttribute('aria-pressed','false'); });
    form.hidden = false; success.hidden = true; error.textContent = '';
  });
})();
