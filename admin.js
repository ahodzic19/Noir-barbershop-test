(() => {
  'use strict';
  const store = window.NOIR_STORE;
  const $ = (selector, root=document) => root.querySelector(selector);
  const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];
  const tbody = $('#bookings-body');
  const emptyState = $('#empty-state');
  const editor = $('#hours-editor');
  const dayOrder = [1,2,3,4,5,6,0];
  let toastTimer;

  function toast(message, isError=false) {
    const el=$('#toast');
    el.textContent=message;
    el.classList.toggle('error',isError);
    el.classList.add('visible');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer=setTimeout(()=>el.classList.remove('visible'),4200);
  }
  function make(tag, className, content) {
    const el=document.createElement(tag);
    if (className) el.className=className;
    if (content!==undefined) el.textContent=String(content);
    return el;
  }
  function todayStr(){return store.dateKey(new Date());}
  function isUpcoming(booking) {
    if (!store.ACTIVE_STATUSES.includes(booking.status)) return false;
    const d=new Date();
    const t=store.toMinutes(booking.time);
    return booking.date>store.dateKey(d)||(booking.date===store.dateKey(d)&&t >= d.getHours()*60+d.getMinutes());
  }
  function displayDate(s) {
    const d=store.parseDate(s);
    return d?d.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}):s;
  }
  function renderMetrics(bookings) {
    $('#metric-total').textContent=bookings.length;
    $('#metric-upcoming').textContent=bookings.filter(isUpcoming).length;
    $('#metric-today').textContent=bookings.filter(b=>b.date===todayStr()&&store.ACTIVE_STATUSES.includes(b.status)).length;
    $('#metric-open').textContent=store.getHours().filter(d=>!d.closed).length;
    $('#nav-count').textContent=bookings.filter(b=>b.status==='Pending').length;
  }
  function renderWeek(bookings) {
    const root=$('#week-strip');root.replaceChildren();
    const today=new Date();
    for(let i=0;i<7;i++){
      const d=new Date(today.getFullYear(),today.getMonth(),today.getDate()+i);
      const date=store.dateKey(d),day=store.getHours()[d.getDay()];
      const count=bookings.filter(b=>b.date===date&&store.ACTIVE_STATUSES.includes(b.status)).length;
      const tile=make('div','day-tile'+(i===0?' today':'')+(day.closed?' closed':''));
      tile.append(make('span','day-name',d.toLocaleDateString('en-GB',{weekday:'short'}).toUpperCase()),make('span','day-number',d.getDate()));
      const bottom=make('span','day-count');
      bottom.textContent=day.closed?'Closed':`${count} booking${count===1?'':'s'}`;
      tile.append(bottom);root.append(tile);
    }
  }
  function makeBookingRow(b) {
    const tr=make('tr');
    const guest=make('td'),guestName=make('strong','',b.name),guestCaption=make('small','',`#${b.id.slice(0,8).toUpperCase()}`);
    guest.append(guestName,guestCaption);
    const service=store.SERVICES[b.service];
    const serviceTd=make('td'),serviceName=make('strong','',service?.name || b.service),price=make('small','',service?`€${service.price} · ${service.minutes} min`:'Demo service');
    serviceTd.append(serviceName,price);
    const when=make('td'),date=make('strong','',displayDate(b.date)),time=make('small','',b.time);
    when.append(date,time);
    const barber=make('td','',b.barber);
    const status=make('td'),tag=make('span','status-tag '+b.status.toLowerCase(),b.status); status.append(tag);
    const actions=make('td'),select=make('select','status-select');
    select.setAttribute('aria-label',`Change status for ${b.name}`);
    store.STATUSES.forEach(st=>{const option=make('option','',st);option.value=st;option.selected=b.status===st;select.append(option);});
    select.addEventListener('change',()=>{
      try {store.setStatus(b.id,select.value);toast(`${b.name}: ${select.value.toLowerCase()}.`);renderAll();}
      catch(err){toast(err.message,true);select.value=b.status;}
    });
    const del=make('button','delete-btn','Delete');del.type='button';del.setAttribute('aria-label',`Delete reservation for ${b.name}`);
    del.addEventListener('click',()=>{
      if(!window.confirm(`Delete the demo reservation for ${b.name} on ${b.date} at ${b.time}?`))return;
      store.deleteBooking(b.id);renderAll();toast('Demo reservation deleted.');
    });
    actions.append(select,del);
    tr.append(guest,serviceTd,when,barber,status,actions);
    return tr;
  }
  function renderBookings(bookings) {
    const filter=$('#filter-status').value;
    const query=$('#search-bookings').value.trim().toLowerCase();
    const filtered=bookings.filter(b=>{
      if(filter!=='All' && b.status!==filter) return false;
      const service=store.SERVICES[b.service]?.name||b.service;
      return `${b.name} ${service} ${b.barber} ${b.date} ${b.time}`.toLowerCase().includes(query);
    }).sort((a,b)=>a.date.localeCompare(b.date)||a.time.localeCompare(b.time)||a.name.localeCompare(b.name));
    tbody.replaceChildren(...filtered.map(makeBookingRow));
    emptyState.hidden=filtered.length>0;
    $('#table-count').textContent=`Showing ${filtered.length} of ${bookings.length} reservations`;
  }
  function renderAll() {
    const bookings=store.getBookings();
    renderMetrics(bookings);renderWeek(bookings);renderBookings(bookings);
  }
  function makeDayRow(index,h) {
    const row=make('div','day-row'+(h.closed?' is-closed':''));row.dataset.day=String(index);
    const dayLabel=make('div','day-label',store.DAY_NAMES[index]);
    if(index===new Date().getDay())dayLabel.append(make('span','today-label','TODAY'));
    const label=make('label','open-toggle'),checkbox=make('input');
    checkbox.type='checkbox';checkbox.name=`open-${index}`;checkbox.checked=!h.closed;
    const openText=make('span','',h.closed?'Closed':'Open');label.append(checkbox,openText);
    const fields=make('div','hour-inputs'),start=make('input'),end=make('input');
    start.type=end.type='time';start.step=end.step='1800';start.value=h.open;end.value=h.close;
    start.name=`start-${index}`;end.name=`end-${index}`;
    start.setAttribute('aria-label',`${store.DAY_NAMES[index]} opening time`);
    end.setAttribute('aria-label',`${store.DAY_NAMES[index]} closing time`);
    const separator=make('span','','—');fields.append(start,separator,end);
    function updateState(){row.classList.toggle('is-closed',!checkbox.checked);start.disabled=end.disabled=!checkbox.checked;openText.textContent=checkbox.checked?'Open':'Closed';}
    checkbox.addEventListener('change',updateState);updateState();
    row.append(dayLabel,label,fields);return row;
  }
  function renderHoursEditor(){
    const hours=store.getHours();editor.replaceChildren(...dayOrder.map(index=>makeDayRow(index,hours[index])));
  }
  $('#hours-form').addEventListener('submit',e=>{
    e.preventDefault();
    const schedule=store.getHours();
    for(const row of $$('.day-row',editor)){
      const day=Number(row.dataset.day),toggle=$('input[type="checkbox"]',row);
      const times=$$('input[type="time"]',row);
      schedule[day]={closed:!toggle.checked,open:times[0].value,close:times[1].value};
    }
    try {store.setHours(schedule);toast('Opening hours saved for this browser.');renderAll();renderHoursEditor();}
    catch(err){toast(err.message,true);}
  });
  $('#search-bookings').addEventListener('input',renderAll);
  $('#filter-status').addEventListener('change',renderAll);
  $('#sample-data').addEventListener('click',()=>{
    try{const count=store.addSampleBookings();renderAll();toast(count?`${count} fictional sample reservations added.`:'No free demo slots to add samples.');}
    catch(err){toast(err.message,true);}
  });
  $('#clear-bookings').addEventListener('click',()=>{
    if(!window.confirm('Clear ALL demo reservations in this browser? This cannot be undone.'))return;
    try{store.clearBookings();renderAll();toast('Demo reservations cleared.');}
    catch(err){toast(err.message,true);}
  });
  $('#export-csv').addEventListener('click',()=>{
    const bookings=store.getBookings();
    if(!bookings.length){toast('Nothing to export yet.');return;}
    const cols=['ID','Name','Service','Barber','Date','Time','Status','Created at'];
    // Escape CSV and prefix dangerous spreadsheet-formula characters.
    const cell=value=>{
      let text=String(value??'');
      if (/^[\s\u0000-\u001f]*[=+\-@]/.test(text)) text="'"+text;
      return '"'+text.replace(/"/g,'""')+'"';
    };
    const csv=[cols.map(cell).join(','),...bookings.map(b=>[b.id,b.name,store.SERVICES[b.service]?.name||b.service,b.barber,b.date,b.time,b.status,b.createdAt].map(cell).join(','))].join('\r\n');
    const url=URL.createObjectURL(new Blob(['\ufeff',csv],{type:'text/csv;charset=utf-8'}));
    const a=make('a');a.href=url;a.download=`noir-demo-reservations-${todayStr()}.csv`;
    document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
    toast('CSV exported.');
  });
  $('#current-date').textContent=new Date().toLocaleDateString('en-GB',{weekday:'short',month:'short',day:'numeric',year:'numeric'});
  if('IntersectionObserver' in window){
    const navLinks=$$('.side-nav a');
    const observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{if(entry.isIntersecting){navLinks.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+entry.target.id));}});
    },{rootMargin:'-15% 0px -65% 0px'});
    ['overview','reservations','opening-hours'].forEach(id=>observer.observe(document.getElementById(id)));
  }
  window.addEventListener('storage',()=>{renderAll();renderHoursEditor();});
  renderHoursEditor();renderAll();
})();
