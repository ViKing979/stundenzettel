const APP_LOCALE = APP_LOCALES[APP_LANGUAGE] || "de-DE";
const DAY_LABELS = Array.from({length:7},(_,i)=>new Date(2024,0,1+i).toLocaleDateString(APP_LOCALE,{weekday:"long"}));
const MONTH_NAMES = Array.from({length:12},(_,i)=>new Date(2024,i,1).toLocaleDateString(APP_LOCALE,{month:"long"}));
const GERMAN_DAY_LABELS = ["Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag","Sonntag"];
const GERMAN_MONTH_NAMES = ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];
const STATUS_META = {
  urlaub:    { label: "Urlaub",              bg: "#fef9c3", fg: "#ca8a04" },
  krankheit: { label: "Krankheit",           bg: "#fee2e2", fg: "#dc2626" },
  feiertag:  { label: "Feiertag",            bg: "#dbeafe", fg: "#2563eb" },
  unbezahlt: { label: "Unbezahlter Urlaub",  bg: "#e7e5e4", fg: "#57534e" }
};
const WORK_META = { bg: "#dcfce7", fg: "#16a34a" };
const STATUS_ABBR = { urlaub: "U", krankheit: "K", feiertag: "F", unbezahlt: "UU" };
const STORAGE_PREFIX = "stundenzettel_";

function pad(n){ return String(n).padStart(2,"0"); }
function toISODate(d){ return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
function weekdayIndex(d){ return (d.getDay()+6)%7; } // Montag=0..Sonntag=6

function timeToMinutes(t){
  if(!t) return null;
  const parts = t.split(":");
  const h = Number(parts[0]), m = Number(parts[1]);
  if(Number.isNaN(h)||Number.isNaN(m)) return null;
  return h*60+m;
}
function computeBookingResult(booking){
  const start = timeToMinutes(booking.beginn), end = timeToMinutes(booking.ende), pause = Number(booking.pause)||0;
  if(start === null || end === null) return {minutes:0,error:null};
  const diff = end-start;
  if(diff < 0) return {minutes:0,error:"Endzeit darf nicht vor der Beginnzeit liegen."};
  if(pause > diff) return {minutes:0,error:"Die Pause darf nicht länger als die Buchungszeit sein."};
  return {minutes:Math.max(0,diff-pause),error:null};
}
function computeDailyResult(entry){
  if(entry.status) return {minutes:0,error:null};
  let minutes=0;
  for(const booking of (entry.buchungen||[])){
    const result=computeBookingResult(booking);
    if(result.error) return {minutes,error:result.error};
    minutes+=result.minutes;
  }
  return {minutes,error:null};
}
function computeDailyMinutes(entry){ return computeDailyResult(entry).minutes; }
function formatMinutes(min){
  const h = Math.floor(min/60), m = min%60;
  return `${pad(h)}:${pad(m)}`;
}
function formatMinutesCompact(min){
  const h = Math.floor(min/60), m = min%60;
  return `${h}:${pad(m)}`;
}
function emptyBooking(){ return { beginn:"", ende:"", pause:"", projekt:"" }; }
function emptyEntry(){ return { buchungen:[], status:"" }; }
function normalizeStatus(value){ return ["","urlaub","krankheit","feiertag","unbezahlt"].includes(value)?value:""; }
function normalizeEntry(raw){
  if(!raw || typeof raw !== "object") return emptyEntry();
  if(Array.isArray(raw.buchungen)) return {buchungen:raw.buchungen.map(b=>{b=b||{};return {beginn:String(b.beginn||""),ende:String(b.ende||""),pause:String(b.pause||""),projekt:String(b.projekt||"")};}),status:normalizeStatus(raw.status||"")};
  const booking={beginn:String(raw.beginn||""),ende:String(raw.ende||""),pause:String(raw.pause||""),projekt:String(raw.projekt||"")};
  return {buchungen:(booking.beginn||booking.ende||booking.pause||booking.projekt)?[booking]:[],status:normalizeStatus(raw.status||"")};
}
function escapeHTML(value){ return String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function normalizeAdmin(raw={}){
  const projects=Array.isArray(raw.projects)?raw.projects:[];
  return {
    vorname:String(raw.vorname||""),nachname:String(raw.nachname||""),personalnummer:String(raw.personalnummer||""),
    empfaengerEmail:String(raw.empfaengerEmail||""),timePicker:raw.timePicker==="wheel"?"wheel":"clock",
    projects:[...new Set(projects.map(p=>String(p).trim()).filter(Boolean))],
    workingDays:[...new Set((Array.isArray(raw.workingDays)?raw.workingDays:[]).map(Number).filter(day=>Number.isInteger(day)&&day>=0&&day<=6))].sort((a,b)=>a-b)
  };
}

function dayKey(ds){ return STORAGE_PREFIX+"tag_"+ds; }
function loadDayEntry(ds){
  try {
    const raw = localStorage.getItem(dayKey(ds));
    if(!raw) return emptyEntry();
    const parsed=JSON.parse(raw), normalized=normalizeEntry(parsed);
    if(!Array.isArray(parsed.buchungen)) saveDayEntry(ds,normalized);
    return normalized;
  } catch(e){ return emptyEntry(); }
}
function saveDayEntry(ds, entry){
  try { localStorage.setItem(dayKey(ds), JSON.stringify(entry)); }
  catch(e){ console.error("Tag konnte nicht gespeichert werden", e); }
}

// Alte Wochen-Daten (Vorgängerversion) einmalig in das neue Tagesformat übernehmen
function migrateOldWeekData(){
  try {
    const prefix = STORAGE_PREFIX+"woche_";
    const keys = [];
    for (let i=0; i<localStorage.length; i++){
      const k = localStorage.key(i);
      if (k && k.indexOf(prefix) === 0) keys.push(k);
    }
    keys.forEach((k)=>{
      const mondayStr = k.substring(prefix.length);
      const monday = new Date(mondayStr+"T00:00:00");
      if (isNaN(monday.getTime())) return;
      let entries;
      try { entries = JSON.parse(localStorage.getItem(k)); } catch(e){ return; }
      if (!Array.isArray(entries)) return;
      entries.forEach((entry, i)=>{
        const d = new Date(monday);
        d.setDate(monday.getDate()+i);
        const ds = toISODate(d);
        if (!localStorage.getItem(dayKey(ds))){
          const normalized = normalizeEntry(entry);
          const hasData = normalized.buchungen.length || normalized.status;
          if (hasData) saveDayEntry(ds, normalized);
        }
      });
    });
  } catch(e){ console.error("Migration fehlgeschlagen", e); }
}

function loadAdmin(){
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX+"admin");
    if(raw) state.admin = normalizeAdmin(JSON.parse(raw));
  } catch(e){ console.error("Adminbereich konnte nicht geladen werden", e); }
}

let state = { admin: normalizeAdmin() };
let viewMonth = new Date(); viewMonth.setDate(1); viewMonth.setHours(0,0,0,0);
let selectedDate = toISODate(new Date());

function getCalendarCells(monthDate){
  const year = monthDate.getFullYear(), month = monthDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const lastOfMonth = new Date(year, month+1, 0);
  const offset = weekdayIndex(firstOfMonth);
  const totalCells = Math.ceil((offset + lastOfMonth.getDate()) / 7) * 7;
  const gridStart = new Date(firstOfMonth);
  gridStart.setDate(firstOfMonth.getDate() - offset);
  const cells = [];
  for (let i=0; i<totalCells; i++){
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate()+i);
    cells.push({ date:d, inMonth: d.getMonth()===month });
  }
  return cells;
}
function getMonthDates(monthDate){
  const year = monthDate.getFullYear(), month = monthDate.getMonth();
  const last = new Date(year, month+1, 0).getDate();
  const dates = [];
  for (let day=1; day<=last; day++) dates.push(new Date(year, month, day));
  return dates;
}

function renderMonthHeader(){
  document.getElementById("monthLabel").textContent = `${MONTH_NAMES[viewMonth.getMonth()]} ${viewMonth.getFullYear()}`;
}

function timeInputMarkup(booking,index,field,disabled,error){
  const id=`f${field[0].toUpperCase()}${field.slice(1)}${index}`;
  if((state.admin.timePicker||"clock")==="wheel") return `<input type="text" id="${id}" data-field="${field}" data-time-wheel readonly inputmode="none" value="${escapeHTML(booking[field])}" placeholder="--:--" ${disabled} class="${error?"input-error":""}" aria-label="${field==="beginn"?"Beginn":"Ende"} (24-Stunden-Rad)">`;
  return `<input type="time" id="${id}" data-field="${field}" value="${escapeHTML(booking[field])}" ${disabled} class="${error?"input-error":""}">`;
}

function getProjectSuggestions(){
  const recent=[];
  const dates=[];
  for(let i=0;i<localStorage.length;i++){
    const key=localStorage.key(i);
    if(key && key.startsWith(STORAGE_PREFIX+"tag_")) dates.push(key.slice((STORAGE_PREFIX+"tag_").length));
  }
  dates.sort((a,b)=>b.localeCompare(a));
  for(const date of dates){
    const entry=loadDayEntry(date);
    for(const booking of [...entry.buchungen].reverse()) if(booking.projekt.trim()&&!recent.includes(booking.projekt.trim())) recent.push(booking.projekt.trim());
  }
  return [...new Set([...(state.admin.projects||[]),...recent])];
}

function renderCalendar(){
  const cells = getCalendarCells(viewMonth);
  const todayStr = toISODate(new Date());
  const html = cells.map((c)=>{
    const ds = toISODate(c.date);
    const entry = loadDayEntry(ds);
    const result = computeDailyResult(entry);
    const meta = entry.status ? STATUS_META[entry.status] : null;
    const classes = ["cal-cell"];
    if(!c.inMonth) classes.push("cal-cell-out");
    if(ds === selectedDate) classes.push("cal-cell-selected");
    else if(ds === todayStr) classes.push("cal-cell-today");
    if(result.error) classes.push("cal-cell-error");
    let indicator = "";
    let cellStyle = "";
    if(entry.status){
        cellStyle = `background:${meta.bg};`;
        indicator = `<span class="cal-value" style="color:${meta.fg}">${STATUS_ABBR[entry.status]||""}</span>`;
    } else if(result.minutes > 0){
        cellStyle = `background:${WORK_META.bg};`;
        const projectCount=new Set(entry.buchungen.map(b=>b.projekt.trim()).filter(Boolean)).size;
        indicator = `<span class="cal-value" style="color:${WORK_META.fg}">${formatMinutesCompact(result.minutes)}${projectCount>1?` · ${projectCount}P`:""}</span>`;
    }
    const ariaDetails=entry.status?STATUS_META[entry.status]?.label||"":`${formatMinutes(result.minutes)} Stunden${(()=>{const n=new Set(entry.buchungen.map(b=>b.projekt.trim()).filter(Boolean)).size;return n>1?`, ${n} Projekte`:"";})()}`;
    return `<button type="button" class="${classes.join(" ")}" data-date="${ds}" style="${cellStyle}" aria-label="${c.date.getDate()}. ${MONTH_NAMES[c.date.getMonth()]} ${c.date.getFullYear()}, ${ariaDetails}">
      <span class="cal-daynum">${c.date.getDate()}</span>
      ${indicator}
    </button>`;
  }).join("");
  document.getElementById("calendarGrid").innerHTML = html;
}

function renderDayEditor(){
  const ds = selectedDate;
  const d = new Date(ds+"T00:00:00");
  const e = loadDayEntry(ds);
  const result = computeDailyResult(e);
  const disabled = e.status ? "disabled" : "";
  const meta = e.status ? STATUS_META[e.status] : null;
  const previousDate = new Date(d);
  previousDate.setDate(previousDate.getDate()-1);
  const previousEntry = loadDayEntry(toISODate(previousDate));
  const canCopyPrevious = !e.status && previousEntry.buchungen.some(b=>b.beginn||b.ende||b.pause||b.projekt);
  const bookingsHTML = e.buchungen.map((b,i)=>{
    const bookingResult=computeBookingResult(b);
    return `<div class="booking" data-booking="${i}">
      <div class="booking-head"><span class="booking-title">Buchung ${i+1}</span><span class="booking-duration">${formatMinutes(bookingResult.minutes)} Std.</span></div>
      <div class="field booking-project"><label for="fProjekt${i}">Projekt</label><input type="text" id="fProjekt${i}" data-field="projekt" list="projectOptions" value="${escapeHTML(b.projekt)}" placeholder="Projekt auswählen oder eingeben" ${disabled}></div>
      <div class="booking-fields">
        <div class="field"><label for="fBeginn${i}">Beginn</label>${timeInputMarkup(b,i,"beginn",disabled,false)}</div>
        <div class="field"><label for="fEnde${i}">Ende</label>${timeInputMarkup(b,i,"ende",disabled,!!bookingResult.error)}</div>
        <div class="field"><label for="fPause${i}">Pause (Min)</label><input type="number" min="0" step="5" placeholder="0" id="fPause${i}" data-field="pause" value="${escapeHTML(b.pause)}" ${disabled}></div>
        <button type="button" class="remove-booking" data-remove="${i}" aria-label="Buchung ${i+1} entfernen" ${disabled}>✕</button>
      </div>
      ${bookingResult.error?`<div class="day-error">${bookingResult.error}</div>`:""}
    </div>`;
  }).join("");
  const overlap = findBookingOverlap(e.buchungen);
  const dayError = result.error || (overlap!==null ? `Buchung ${overlap+1} überschneidet sich zeitlich mit einer anderen Buchung.` : "");
  document.getElementById("dayEditor").innerHTML = `
    <div class="card">
      <div class="card-head">
        <div>
          <div class="day-name">${DAY_LABELS[weekdayIndex(d)]}</div>
          <div class="day-date">${pad(d.getDate())}.${pad(d.getMonth()+1)}.${d.getFullYear()}</div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;">
          <span class="day-total" id="dayEditorTotal">${formatMinutes(result.minutes)} Std.</span>
          <span class="status-badge" id="dayEditorBadge" style="display:${meta?"inline-block":"none"};background:${meta?meta.bg:""};color:${meta?meta.fg:""};">${meta?meta.label:""}</span>
        </div>
      </div>
      ${e.buchungen.length?`<div class="booking-list">${bookingsHTML}</div>`:`<p class="empty-bookings">Für diesen Tag gibt es noch keine Buchung.</p>`}
      <div class="day-error" id="dayEditorError" style="display:${dayError?"block":"none"};">${dayError}</div>
      ${canCopyPrevious?`<div class="copy-previous-wrap"><button type="button" class="btn-secondary" id="copyPreviousBtn">⧉ Buchungen vom Vortag kopieren</button><small>Die Buchungen werden hinzugefügt. Vorhandene Einträge bleiben erhalten.</small></div>`:""}
      <button type="button" class="btn-add" id="addBookingBtn" ${disabled}>＋ Buchung hinzufügen</button>
      <div class="field day-status">
        <label>Status</label>
        <select id="fStatus">
          <option value="" ${!e.status?"selected":""}>Arbeitstag</option>
          <option value="urlaub" ${e.status==="urlaub"?"selected":""}>Urlaub</option>
          <option value="krankheit" ${e.status==="krankheit"?"selected":""}>Krankheit</option>
          <option value="feiertag" ${e.status==="feiertag"?"selected":""}>Feiertag</option>
          <option value="unbezahlt" ${e.status==="unbezahlt"?"selected":""}>Unbezahlter Urlaub</option>
        </select>
      </div>
      <div class="note" id="dayEditorNote">Gespeichert ✓</div>
    </div><datalist id="projectOptions">${getProjectSuggestions().map(project=>`<option value="${escapeHTML(project)}"></option>`).join("")}</datalist>`;
  document.getElementById("dayEditor").querySelectorAll("[data-field]").forEach(input=>input.addEventListener("input", onDayFieldChange));
  document.getElementById("dayEditor").querySelectorAll("[data-time-wheel]").forEach(input=>input.addEventListener("click",()=>openTimePicker(input)));
  document.getElementById("dayEditor").querySelectorAll("[data-remove]").forEach(button=>button.addEventListener("click",()=>removeBooking(Number(button.dataset.remove))));
  document.getElementById("addBookingBtn").addEventListener("click", addBooking);
  document.getElementById("copyPreviousBtn")?.addEventListener("click",copyPreviousBookings);
  document.getElementById("fStatus").addEventListener("change", onDayFieldChange);
}

function findBookingOverlap(bookings){
  const timed=bookings.map((b,i)=>({i,start:timeToMinutes(b.beginn),end:timeToMinutes(b.ende)})).filter(b=>b.start!==null&&b.end!==null&&b.end>b.start).sort((a,b)=>a.start-b.start);
  for(let i=1;i<timed.length;i++) if(timed[i].start<timed[i-1].end) return Math.max(timed[i].i,timed[i-1].i);
  return null;
}
let activeTimeInput=null, wheelParts={hour:0,minute:0}, wheelScrollTimer=null;
function renderWheelColumn(elementId,count,selected){
  const column=document.getElementById(elementId);
  column.innerHTML=Array.from({length:count},(_,i)=>`<button type="button" class="wheel-item${i===selected?" selected":""}" data-value="${i}" aria-pressed="${i===selected}">${pad(i)}</button>`).join("");
  column.scrollTop=selected*44;
  column.onscroll=()=>{
    const index=Math.max(0,Math.min(count-1,Math.round(column.scrollTop/44)));
    wheelParts[elementId==="hourWheel"?"hour":"minute"]=index;
    updateWheelSelection(column,index);
    clearTimeout(wheelScrollTimer);
    wheelScrollTimer=setTimeout(()=>{ column.scrollTo({top:index*44,behavior:"smooth"}); },90);
  };
  column.onclick=(ev)=>{
    const item=ev.target.closest(".wheel-item"); if(!item) return;
    const index=Number(item.dataset.value);
    wheelParts[elementId==="hourWheel"?"hour":"minute"]=index;
    updateWheelSelection(column,index);
    column.scrollTo({top:index*44,behavior:"smooth"});
  };
}
function updateWheelSelection(column,index){
  column.querySelectorAll(".wheel-item").forEach((item,i)=>{const selected=i===index;item.classList.toggle("selected",selected);item.setAttribute("aria-pressed",String(selected));});
}
function openTimePicker(input){
  if(input.disabled) return;
  activeTimeInput=input;
  const current=input.value||"00:00", parts=current.split(":");
  wheelParts={hour:Number(parts[0])||0,minute:Number(parts[1])||0};
  const label=document.querySelector(`label[for="${input.id}"]`);
  document.getElementById("timePickerTitle").textContent=translateAppText(`${label?.textContent||"Zeit"} wählen`);
  renderWheelColumn("hourWheel",24,wheelParts.hour);
  renderWheelColumn("minuteWheel",60,wheelParts.minute);
  document.getElementById("timePickerOverlay").classList.add("open");
}
function closeTimePicker(){
  document.getElementById("timePickerOverlay").classList.remove("open");
  activeTimeInput=null;
}
document.getElementById("closeTimePicker").addEventListener("click",closeTimePicker);
document.getElementById("cancelTimePicker").addEventListener("click",closeTimePicker);
document.getElementById("timePickerOverlay").addEventListener("click",closeTimePicker);
document.getElementById("timePickerSheet").addEventListener("click",ev=>ev.stopPropagation());
document.getElementById("saveTimePicker").addEventListener("click",()=>{
  if(activeTimeInput){ activeTimeInput.value=`${pad(wheelParts.hour)}:${pad(wheelParts.minute)}`; activeTimeInput.dispatchEvent(new Event("input",{bubbles:true})); }
  closeTimePicker();
});
function addBooking(){
  const entry=loadDayEntry(selectedDate);
  const last=entry.buchungen[entry.buchungen.length-1];
  const next=emptyBooking();
  if(last && last.ende){ next.beginn=last.ende; next.projekt=last.projekt||""; }
  entry.buchungen.push(next);
  saveDayEntry(selectedDate,entry); renderDayEditor(); updateMonthTotal(); updateSendLink();
  const input=document.querySelector(`#fProjekt${entry.buchungen.length-1}`); if(input) input.focus();
}
function copyPreviousBookings(){
  const previousDate=new Date(selectedDate+"T00:00:00");
  previousDate.setDate(previousDate.getDate()-1);
  const previousEntry=loadDayEntry(toISODate(previousDate));
  const sourceBookings=previousEntry.buchungen.filter(b=>b.beginn||b.ende||b.pause||b.projekt);
  if(!sourceBookings.length) return;
  const entry=loadDayEntry(selectedDate);
  if(entry.status) return;
  const count=sourceBookings.length;
  const bookingWord=count===1?"Buchung":"Buchungen";
  if(entry.buchungen.length && !window.confirm(translateAppText(`Es werden ${count} ${bookingWord} zu diesem Tag hinzugefügt. Vorhandene Buchungen bleiben erhalten. Fortfahren?`))) return;
  entry.buchungen.push(...sourceBookings.map(booking=>({
    beginn:booking.beginn,ende:booking.ende,pause:booking.pause,projekt:booking.projekt
  })));
  saveDayEntry(selectedDate,entry);
  renderCalendar(); renderDayEditor(); updateMonthTotal(); updateSendLink();
}
function removeBooking(index){
  const entry=loadDayEntry(selectedDate);
  entry.buchungen.splice(index,1); saveDayEntry(selectedDate,entry);
  renderCalendar(); renderDayEditor(); updateMonthTotal(); updateSendLink();
}

let savedNoteTimer = null;
function onDayFieldChange(ev){
  const entry=loadDayEntry(selectedDate);
  const input=ev.target.closest("[data-field]");
  if(input){ const booking=input.closest("[data-booking]"); entry.buchungen[Number(booking.dataset.booking)][input.dataset.field]=input.value; }
  const statusInput=document.getElementById("fStatus");
  if(ev.target===statusInput) entry.status=statusInput.value;
  saveDayEntry(selectedDate, entry);

  const result = computeDailyResult(entry);
  document.getElementById("dayEditorTotal").textContent = formatMinutes(result.minutes)+" Std.";
  const errBox = document.getElementById("dayEditorError");
  const overlap=findBookingOverlap(entry.buchungen);
  const error=result.error || (overlap!==null ? `Buchung ${overlap+1} überschneidet sich zeitlich mit einer anderen Buchung.` : "");
  errBox.textContent=translateAppText(error); errBox.style.display=error?"block":"none";
  entry.buchungen.forEach((b,i)=>{
    const bookingResult=computeBookingResult(b), card=document.querySelector(`[data-booking="${i}"]`);
    if(card){ card.querySelector(".booking-duration").textContent=formatMinutes(bookingResult.minutes)+" Std."; const end=card.querySelector('[data-field="ende"]'); if(end) end.classList.toggle("input-error",!!bookingResult.error); }
  });

  const disable = !!entry.status;
  document.querySelectorAll("#dayEditor [data-field], .remove-booking, #addBookingBtn").forEach(el=>el.disabled=disable);

  const badge = document.getElementById("dayEditorBadge");
  const meta = STATUS_META[entry.status];
  if(meta){ badge.textContent=meta.label; badge.style.background=meta.bg; badge.style.color=meta.fg; badge.style.display="inline-block"; }
  else badge.style.display="none";

  const note = document.getElementById("dayEditorNote");
  note.style.display = "block";
  clearTimeout(savedNoteTimer);
  savedNoteTimer = setTimeout(()=>{ note.style.display="none"; }, 1200);

  renderCalendar();
  updateMonthTotal();
  updateSendLink();
}

function selectDate(ds){
  const d = new Date(ds+"T00:00:00");
  if(d.getMonth() !== viewMonth.getMonth() || d.getFullYear() !== viewMonth.getFullYear()){
    viewMonth = new Date(d.getFullYear(), d.getMonth(), 1);
  }
  selectedDate = ds;
  renderMonthHeader();
  renderCalendar();
  renderDayEditor();
  updateMonthTotal();
  updateSendLink();
}

function updateMonthTotal(){
  const dates=getMonthDates(viewMonth);
  const total = dates.reduce((sum,d)=>sum+computeDailyMinutes(loadDayEntry(toISODate(d))),0);
  document.getElementById("monthTotal").textContent = formatMinutes(total)+" Std.";
  renderMonthSummary(dates,total);
}

function renderMonthSummary(dates=getMonthDates(viewMonth),total=dates.reduce((sum,d)=>sum+computeDailyMinutes(loadDayEntry(toISODate(d))),0)){
  const projectMinutes=new Map(); let workdays=0;
  for(const date of dates){
    const entry=loadDayEntry(toISODate(date));
    if(entry.status) continue;
    const dayMinutes=computeDailyMinutes(entry);
    if(dayMinutes>0) workdays++;
    for(const booking of entry.buchungen){
      const result=computeBookingResult(booking);
      if(result.error||result.minutes<=0) continue;
      const project=booking.projekt.trim()||"(Projekt fehlt)";
      projectMinutes.set(project,(projectMinutes.get(project)||0)+result.minutes);
    }
  }
  const warnings=validateMonthData().issues.slice();
  for(const date of dates){
    const entry=loadDayEntry(toISODate(date));
    if(!entry.status && computeDailyMinutes(entry)>12*60) warnings.push(`${DAY_LABELS[weekdayIndex(date)]}, ${pad(date.getDate())}.${pad(date.getMonth()+1)}.: mehr als 12 Arbeitsstunden.`);
  }
  const projects=[...projectMinutes.entries()].sort((a,b)=>b[1]-a[1]);
  const warningMarkup=warnings.length?`<div class="summary-warning"><strong>${warnings.length} offene oder auffällige Angabe${warnings.length===1?"":"n"}</strong><ul>${warnings.slice(0,5).map(w=>`<li>${escapeHTML(w)}</li>`).join("")}</ul>${warnings.length>5?`<span>und ${warnings.length-5} weitere …</span>`:""}</div>`:`<div class="summary-ok">Keine fehlenden Einträge, unvollständigen Buchungen oder Zeitüberschneidungen gefunden.</div>`;
  document.getElementById("monthSummary").innerHTML=`<section class="summary-card" aria-labelledby="summaryHeading">
    <h2 id="summaryHeading">Monatsauswertung · ${MONTH_NAMES[viewMonth.getMonth()]} ${viewMonth.getFullYear()}</h2>
    <div class="summary-stats"><div class="summary-stat"><span>Erfasste Arbeitstage</span><strong>${workdays}</strong></div><div class="summary-stat"><span>Arbeitszeit gesamt</span><strong>${formatMinutes(total)} Std.</strong></div></div>
    <div class="summary-title">Stunden je Projekt</div>
    ${projects.length?`<ul class="summary-list">${projects.map(([name,minutes])=>`<li><span>${escapeHTML(name)}</span><span>${formatMinutes(minutes)} Std.</span></li>`).join("")}</ul>`:`<div class="summary-ok">Für diesen Monat sind noch keine Projektstunden erfasst.</div>`}
    <div class="summary-title">Prüfung</div>${warningMarkup}
  </section>`;
}

document.getElementById("calendarGrid").addEventListener("click",(ev)=>{
  const btn = ev.target.closest(".cal-cell");
  if(!btn) return;
  selectDate(btn.dataset.date);
});
document.getElementById("prevMonth").addEventListener("click", ()=>{
  const d = new Date(viewMonth); d.setMonth(d.getMonth()-1);
  selectDate(toISODate(new Date(d.getFullYear(), d.getMonth(), 1)));
});
document.getElementById("nextMonth").addEventListener("click", ()=>{
  const d = new Date(viewMonth); d.setMonth(d.getMonth()+1);
  selectDate(toISODate(new Date(d.getFullYear(), d.getMonth(), 1)));
});

const menuBtn = document.getElementById("menuBtn");
const menu = document.getElementById("menu");
menuBtn.addEventListener("click",(e)=>{ e.stopPropagation(); menu.classList.toggle("open"); });
document.addEventListener("click", ()=> menu.classList.remove("open"));
document.getElementById("adminSheet").addEventListener("click",(e)=> e.stopPropagation());

const adminOverlay = document.getElementById("adminOverlay");
function openAdmin(){
  document.getElementById("fVorname").value = state.admin.vorname||"";
  document.getElementById("fNachname").value = state.admin.nachname||"";
  document.getElementById("fPersonalnummer").value = state.admin.personalnummer||"";
  document.getElementById("fEmpfaenger").value = state.admin.empfaengerEmail||"";
  document.getElementById("fTimePicker").value = state.admin.timePicker||"clock";
  document.getElementById("fProjects").value = (state.admin.projects||[]).join("\n");
  for(let day=0;day<7;day++) document.getElementById(`fWorkingDay${day}`).checked=state.admin.workingDays.includes(day);
  document.getElementById("adminNote").style.display="none";
  adminOverlay.classList.add("open");
}
function closeAdmin(){ adminOverlay.classList.remove("open"); }
document.getElementById("adminMenuBtn").addEventListener("click", ()=>{ menu.classList.remove("open"); openAdmin(); });
document.getElementById("closeAdmin").addEventListener("click", closeAdmin);
document.getElementById("cancelAdmin").addEventListener("click", closeAdmin);
adminOverlay.addEventListener("click", closeAdmin);

document.getElementById("saveAdmin").addEventListener("click", ()=>{
  const draft = normalizeAdmin({
    vorname: document.getElementById("fVorname").value.trim(),
    nachname: document.getElementById("fNachname").value.trim(),
    personalnummer: document.getElementById("fPersonalnummer").value.trim(),
    empfaengerEmail: document.getElementById("fEmpfaenger").value.trim(),
    timePicker: document.getElementById("fTimePicker").value==="wheel"?"wheel":"clock",
    projects:document.getElementById("fProjects").value.split(/\r?\n/),
    workingDays:Array.from({length:7},(_,day)=>day).filter(day=>document.getElementById(`fWorkingDay${day}`).checked),
  });
  const note = document.getElementById("adminNote");
  try {
    localStorage.setItem(STORAGE_PREFIX+"admin", JSON.stringify(draft));
    state.admin = draft;
    renderDayEditor();
    updateMonthTotal();
    note.textContent = translateAppText("Gespeichert");
    note.style.color = "var(--teal-700)";
    note.style.display = "block";
    updateSendLink();
    setTimeout(closeAdmin, 700);
  } catch(e){
    note.textContent = translateAppText("Speichern fehlgeschlagen: "+(e.message||"unbekannter Fehler"));
    note.style.color = "var(--red-600)";
    note.style.display = "block";
  }
});

function buildBackupData(){
  const days={};
  for(let i=0;i<localStorage.length;i++){
    const key=localStorage.key(i), prefix=STORAGE_PREFIX+"tag_";
    if(key && key.startsWith(prefix)){
      const date=key.slice(prefix.length);
      if(/^\d{4}-\d{2}-\d{2}$/.test(date)) days[date]=loadDayEntry(date);
    }
  }
  return {format:"stundenzettel-backup",version:1,exportedAt:new Date().toISOString(),admin:normalizeAdmin(state.admin),days};
}
function showAdminNote(message,isError=false){
  const note=document.getElementById("adminNote");
  note.textContent=translateAppText(message); note.style.color=isError?"var(--red-600)":"var(--teal-700)"; note.style.display="block";
}
document.getElementById("backupExportBtn").addEventListener("click",()=>{
  const backup=buildBackupData();
  const blob=new Blob([JSON.stringify(backup,null,2)],{type:"application/json"});
  downloadBlob(blob,`Stundenzettel_Sicherung_${toISODate(new Date())}.json`);
  showAdminNote("Datensicherung wurde heruntergeladen.");
});
document.getElementById("backupImportBtn").addEventListener("click",()=>document.getElementById("backupImportInput").click());
document.getElementById("backupImportInput").addEventListener("change",async ev=>{
  const file=ev.target.files?.[0]; if(!file) return;
  try{
    const backup=JSON.parse(await file.text());
    if(backup.format!=="stundenzettel-backup"||backup.version!==1||!backup.days||typeof backup.days!=="object"||Array.isArray(backup.days)||!backup.admin||typeof backup.admin!=="object"||Array.isArray(backup.admin)) throw new Error("Die Datei ist keine unterstützte Stundenzettel-Sicherung.");
    const days={};
    for(const [date,raw] of Object.entries(backup.days)){
      const parsedDate=new Date(`${date}T00:00:00`);
      if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||isNaN(parsedDate.getTime())||toISODate(parsedDate)!==date) throw new Error("Die Sicherung enthält ein ungültiges Datum.");
      if(!raw||typeof raw!=="object"||Array.isArray(raw)||(raw.buchungen!==undefined&&!Array.isArray(raw.buchungen))) throw new Error("Die Sicherung enthält einen ungültigen Tageseintrag.");
      days[date]=normalizeEntry(raw);
    }
    const admin=normalizeAdmin(backup.admin);
    if(!window.confirm(translateAppText(`Diese Sicherung enthält ${Object.keys(days).length} Tage. Alle vorhandenen Stundenzettel-Daten auf diesem Gerät werden ersetzt. Fortfahren?`))) return;
    const oldData=[];
    for(let i=0;i<localStorage.length;i++){
      const key=localStorage.key(i);
      if(key?.startsWith(STORAGE_PREFIX)) oldData.push([key,localStorage.getItem(key)]);
    }
    try{
      for(const [key] of oldData) localStorage.removeItem(key);
      localStorage.setItem(STORAGE_PREFIX+"admin",JSON.stringify(admin));
      for(const [date,entry] of Object.entries(days)) localStorage.setItem(dayKey(date),JSON.stringify(entry));
    }catch(writeError){
      for(let i=localStorage.length-1;i>=0;i--){const key=localStorage.key(i);if(key?.startsWith(STORAGE_PREFIX))localStorage.removeItem(key);}
      oldData.forEach(([key,value])=>localStorage.setItem(key,value));
      throw writeError;
    }
    state.admin=admin;
    document.getElementById("fVorname").value=admin.vorname;
    document.getElementById("fNachname").value=admin.nachname;
    document.getElementById("fPersonalnummer").value=admin.personalnummer;
    document.getElementById("fEmpfaenger").value=admin.empfaengerEmail;
    document.getElementById("fTimePicker").value=admin.timePicker;
    document.getElementById("fProjects").value=admin.projects.join("\n");
    for(let day=0;day<7;day++) document.getElementById(`fWorkingDay${day}`).checked=admin.workingDays.includes(day);
    renderCalendar(); renderDayEditor(); updateMonthTotal(); updateSendLink();
    showAdminNote("Datensicherung wurde wiederhergestellt.");
  }catch(error){ showAdminNote(error.message||"Die Sicherung konnte nicht gelesen werden.",true); }
  finally{ ev.target.value=""; }
});

// ---- Monatsübersicht: Text für E-Mail, Datei-Export ----

function buildBodyText(){
  const dates = getMonthDates(viewMonth);
  const lines = [];
  lines.push(`Stundenuebersicht ${GERMAN_MONTH_NAMES[viewMonth.getMonth()]} ${viewMonth.getFullYear()}`);
  lines.push(`${state.admin.vorname} ${state.admin.nachname}${state.admin.personalnummer ? " (Personalnr. "+state.admin.personalnummer+")" : ""}`);
  lines.push("");
  lines.push("Tag          Datum   Beginn  Ende   Pause   Gesamt  Projekt          Abwesenheitsgrund");
  let totalMin = 0;
  const counts = { urlaub:0, krankheit:0, feiertag:0, unbezahlt:0 };
  dates.forEach((d)=>{
    const ds = toISODate(d);
    const e = loadDayEntry(ds);
    const result = computeDailyResult(e);
    totalMin += result.minutes;
    if(e.status && counts.hasOwnProperty(e.status)) counts[e.status]++;
    const abwesenheit = e.status && STATUS_META[e.status] ? STATUS_META[e.status].label : "";
    const tag = GERMAN_DAY_LABELS[weekdayIndex(d)].padEnd(12," ");
    const datum = `${pad(d.getDate())}.${pad(d.getMonth()+1)}.`.padEnd(7," ");
    if(e.status){ lines.push(`${tag} ${datum} ${"--:--".padEnd(7," ")} ${"--:--".padEnd(6," ")} ${"0 Min".padEnd(7," ")} ${"00:00".padEnd(7," ")} ${"".padEnd(16," ")} ${abwesenheit}`); }
    else if(!e.buchungen.length){ lines.push(`${tag} ${datum}`); }
    else e.buchungen.forEach((b,i)=>{
      const rowTag=i===0?tag:" ".repeat(12), rowDate=i===0?datum:" ".repeat(7);
      const bookingResult=computeBookingResult(b);
      lines.push(`${rowTag} ${rowDate} ${(b.beginn||"--:--").padEnd(7," ")} ${(b.ende||"--:--").padEnd(6," ")} ${((b.pause||"0")+" Min").padEnd(7," ")} ${formatMinutes(bookingResult.minutes).padEnd(7," ")} ${(b.projekt||"").padEnd(16," ")} ${i===0?"":""}`);
    });
  });
  lines.push("");
  lines.push(`Monatssumme Arbeitsstunden: ${formatMinutes(totalMin)} Std.`);
  const tagWort = (n)=> n===1 ? "Tag" : "Tage";
  lines.push(`Monatssumme Urlaub: ${counts.urlaub} ${tagWort(counts.urlaub)}`);
  lines.push(`Monatssumme Krankheit: ${counts.krankheit} ${tagWort(counts.krankheit)}`);
  lines.push(`Monatssumme Feiertag: ${counts.feiertag} ${tagWort(counts.feiertag)}`);
  lines.push(`Monatssumme Unbezahlter Urlaub: ${counts.unbezahlt} ${tagWort(counts.unbezahlt)}`);
  return lines.join("\n");
}

function updateSendLink(){
  const subject = `Stundenuebersicht ${GERMAN_MONTH_NAMES[viewMonth.getMonth()]} ${viewMonth.getFullYear()} - ${state.admin.vorname} ${state.admin.nachname}`;
  const body = buildBodyText();
  const link = document.getElementById("sendMailBtn");
  if(state.admin.empfaengerEmail){
    link.href = `mailto:${encodeURIComponent(state.admin.empfaengerEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  } else {
    link.href = "#";
  }
}

// ---- Prüfung vor dem Versand/Export ----

function validateMonthData(){
  const dates = getMonthDates(viewMonth);
  const issues = [];
  let hasAnyData = false;
  dates.forEach((d)=>{
    const ds = toISODate(d);
    const e = loadDayEntry(ds);
    const hasAny = e.buchungen.some(b=>b.beginn||b.ende||b.pause||b.projekt) || e.status;
    if(hasAny) hasAnyData = true;
    const label = `${DAY_LABELS[weekdayIndex(d)]}, ${pad(d.getDate())}.${pad(d.getMonth()+1)}.`;
    if(e.status && e.buchungen.some(b=>b.beginn||b.ende||b.pause||b.projekt)){
      issues.push(`${label}: Arbeitsbuchungen sind vorhanden, obwohl der Tag als „${STATUS_META[e.status]?.label||"Abwesenheit"}“ markiert ist.`);
    }
    if(!e.status){
      e.buchungen.forEach((b,i)=>{
        const any=b.beginn||b.ende||b.pause||b.projekt;
        if(!any) return;
        const result=computeBookingResult(b);
        if(result.error) issues.push(`${label}, Buchung ${i+1}: ${result.error}`);
        if(any&&(!b.beginn||!b.ende)) issues.push(`${label}, Buchung ${i+1}: Beginn oder Ende fehlt noch.`);
        if(b.beginn&&b.ende&&!b.projekt.trim()) issues.push(`${label}, Buchung ${i+1}: Projekt fehlt noch.`);
      });
      if(findBookingOverlap(e.buchungen)!==null) issues.push(`${label}: Buchungen überschneiden sich zeitlich.`);
    }
    const hasBookingData=e.buchungen.some(b=>b.beginn||b.ende||b.pause||b.projekt);
    if(ds<toISODate(new Date()) && state.admin.workingDays.includes(weekdayIndex(d)) && !e.status && !hasBookingData){
      issues.push(`${label}: üblicher Arbeitstag ohne Buchung oder Abwesenheitsstatus.`);
    }
  });
  return { issues, hasAnyData };
}

let pendingAction = null;
function openConfirm(message, issues){
  document.getElementById("confirmMessage").textContent = translateAppText(message);
  document.getElementById("confirmIssueList").innerHTML = issues.map(i=>`<li>${translateAppText(i)}</li>`).join("");
  document.getElementById("confirmOverlay").classList.add("open");
}
function closeConfirmOverlay(){
  document.getElementById("confirmOverlay").classList.remove("open");
  pendingAction = null;
}
document.getElementById("confirmProceed").addEventListener("click", ()=>{
  const action = pendingAction;
  document.getElementById("confirmOverlay").classList.remove("open");
  pendingAction = null;
  if(action) action();
});
document.getElementById("confirmCancel").addEventListener("click", closeConfirmOverlay);
document.getElementById("closeConfirm").addEventListener("click", closeConfirmOverlay);
document.getElementById("confirmOverlay").addEventListener("click", closeConfirmOverlay);
document.getElementById("confirmSheet").addEventListener("click",(e)=>e.stopPropagation());

function runWithValidation(actionFn){
  const { issues, hasAnyData } = validateMonthData();
  if(!hasAnyData){
    pendingAction = actionFn;
    openConfirm("Für diesen Monat wurden noch keine Stunden erfasst. Trotzdem fortfahren?", []);
    return;
  }
  if(issues.length){
    pendingAction = actionFn;
    openConfirm("Es gibt noch offene Punkte für diesen Monat:", issues);
    return;
  }
  actionFn();
}

// ---- E-Mail senden ----

document.getElementById("sendMailBtn").addEventListener("click",(e)=>{
  e.preventDefault();
  const errBox = document.getElementById("sendError");
  document.getElementById("sendNote").style.display="none";
  if(!state.admin.empfaengerEmail){
    errBox.textContent = translateAppText("Bitte zuerst die Empfänger-E-Mail im Adminbereich eintragen.");
    errBox.style.display="block";
    openAdmin();
    return;
  }
  errBox.style.display="none";
  runWithValidation(proceedWithMailSend);
});
async function proceedWithMailSend(){
  const errBox=document.getElementById("sendError");
  const {blob,filename}=buildWorkbookBlob();
  if(!blob){
    errBox.textContent=translateAppText("Excel-Datei konnte nicht erstellt werden. Bitte Internetverbindung prüfen und erneut versuchen.");
    errBox.style.display="block";
    return;
  }
  const file=new File([blob],filename,{type:blob.type});
  const subject=`Stundenuebersicht ${GERMAN_MONTH_NAMES[viewMonth.getMonth()]} ${viewMonth.getFullYear()} - ${state.admin.vorname} ${state.admin.nachname}`;
  const recipient=state.admin.empfaengerEmail;
  const body=buildBodyText();
  if(navigator.share && navigator.canShare){
    try{
      if(navigator.canShare({files:[file]})){
        await navigator.share({files:[file],title:subject,text:`An: ${recipient}\n\n${body}`});
        return;
      }
    }catch(e){
      if(e && e.name==="AbortError") return;
    }
  }
  // mailto links cannot attach files; download the workbook and open a prepared draft as a fallback.
  downloadBlob(blob,filename);
  const note=document.getElementById("sendNote");
  note.textContent=translateAppText("Dein Browser kann Dateien nicht direkt an die E-Mail übergeben. Die Excel-Datei wurde heruntergeladen; füge sie im E-Mail-Entwurf als Anhang hinzu.");
  note.style.display="block";
  document.getElementById("sendMailBtn").href=`mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href=document.getElementById("sendMailBtn").href;
}

document.getElementById("copyBtn").addEventListener("click", async ()=>{
  const subject = `Stundenuebersicht ${GERMAN_MONTH_NAMES[viewMonth.getMonth()]} ${viewMonth.getFullYear()} - ${state.admin.vorname} ${state.admin.nachname}`;
  const text = `An: ${state.admin.empfaengerEmail || "(keine Empfänger-E-Mail hinterlegt)"}\nBetreff: ${subject}\n\n${buildBodyText()}`;
  const note = document.getElementById("copyNote");
  let ok = false;
  try {
    await navigator.clipboard.writeText(text);
    ok = true;
  } catch(e){
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.focus(); ta.select();
      ok = document.execCommand("copy");
      document.body.removeChild(ta);
    } catch(e2){ ok = false; }
  }
  note.textContent = translateAppText(ok ? "In Zwischenablage kopiert – jetzt in der Mail-App einfügen." : "Kopieren nicht möglich – bitte Text manuell markieren.");
  note.style.display = "block";
  setTimeout(()=> note.style.display="none", 2500);
});

// ---- Excel-Export ----

function buildWorkbookBlob(){
  const dates = getMonthDates(viewMonth);
  const rows = [
    ["Stundenübersicht"],
    [`${state.admin.vorname} ${state.admin.nachname}`, state.admin.personalnummer?`Personalnr. ${state.admin.personalnummer}`:""],
    [`${GERMAN_MONTH_NAMES[viewMonth.getMonth()]} ${viewMonth.getFullYear()}`],
    [],
    ["Tag","Datum","Beginn","Ende","Pause (Min)","Gesamt (Std)","Projekt","Abwesenheitsgrund"]
  ];
  let totalMin = 0;
  const counts = { urlaub:0, krankheit:0, feiertag:0, unbezahlt:0 };
  dates.forEach((d)=>{
    const ds = toISODate(d);
    const e = loadDayEntry(ds);
    const result = computeDailyResult(e);
    totalMin += result.minutes;
    if(e.status && counts.hasOwnProperty(e.status)) counts[e.status]++;
    const abwesenheit = e.status && STATUS_META[e.status] ? STATUS_META[e.status].label : "";
    if(e.status) rows.push([GERMAN_DAY_LABELS[weekdayIndex(d)], ds, "", "", "0", "00:00", "", abwesenheit]);
    else if(!e.buchungen.length) rows.push([GERMAN_DAY_LABELS[weekdayIndex(d)],ds,"","","","00:00","",""]);
    else e.buchungen.forEach((b,i)=>{
      const bookingResult=computeBookingResult(b);
      rows.push([i===0?GERMAN_DAY_LABELS[weekdayIndex(d)]:"",i===0?ds:"",b.beginn||"",b.ende||"",b.pause||"0",formatMinutes(bookingResult.minutes),b.projekt||"",""]);
    });
  });
  rows.push([]);
  rows.push(["Monatssumme Arbeitsstunden","","","","",formatMinutes(totalMin),"",""]);
  const tagWort = (n)=> n===1 ? "Tag" : "Tage";
  rows.push([`Monatssumme Urlaub`, `${counts.urlaub} ${tagWort(counts.urlaub)}`]);
  rows.push([`Monatssumme Krankheit`, `${counts.krankheit} ${tagWort(counts.krankheit)}`]);
  rows.push([`Monatssumme Feiertag`, `${counts.feiertag} ${tagWort(counts.feiertag)}`]);
  rows.push([`Monatssumme Unbezahlter Urlaub`, `${counts.unbezahlt} ${tagWort(counts.unbezahlt)}`]);
  const filename = `Stundenzettel_${state.admin.nachname||"Mitarbeiter"}_${GERMAN_MONTH_NAMES[viewMonth.getMonth()]}_${viewMonth.getFullYear()}.xlsx`;

  if (typeof XLSX === "undefined") return { blob: null, filename };

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws["!cols"] = [{wch:14},{wch:12},{wch:8},{wch:8},{wch:12},{wch:12},{wch:16},{wch:18}];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Monat");
  const wbout = XLSX.write(wb, {bookType:"xlsx", type:"array"});
  const blob = new Blob([wbout], {type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
  return { blob, filename };
}

function downloadBlob(blob, filename){
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(()=>URL.revokeObjectURL(url), 3000);
}

document.getElementById("shareExcelBtn").addEventListener("click", ()=>{
  runWithValidation(proceedWithExcelDownload);
});
async function proceedWithExcelDownload(){
  const note = document.getElementById("shareNote");
  const {blob, filename} = buildWorkbookBlob();
  if (!blob){
    note.textContent = translateAppText("Excel-Bibliothek konnte nicht geladen werden (Internetverbindung prüfen) – bitte erneut versuchen.");
    note.style.color = "var(--red-600)";
    note.style.display = "block";
    return;
  }

  const file = new File([blob], filename, {type: blob.type});
  if (navigator.canShare && navigator.canShare({files:[file]})){
    try {
      const subject = `Stundenuebersicht ${GERMAN_MONTH_NAMES[viewMonth.getMonth()]} ${viewMonth.getFullYear()} - ${state.admin.vorname} ${state.admin.nachname}`;
      await navigator.share({files:[file], title: subject, text: buildBodyText()});
      return;
    } catch(e){
      if (e && e.name === "AbortError") return;
    }
  }

  downloadBlob(blob, filename);
  note.textContent = translateAppText(`Datei "${filename}" heruntergeladen – jetzt in deiner Mail-App als Anhang auswählen.`);
  note.style.color = "var(--teal-700)";
  note.style.display = "block";
  setTimeout(()=> note.style.display="none", 4500);
}

// ---- Start ----
initializeAppLanguage();
migrateOldWeekData();
loadAdmin();
renderMonthHeader();
renderCalendar();
renderDayEditor();
updateMonthTotal();
updateSendLink();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js", { updateViaCache: "none" })
      .then((registration) => registration.update())
      .catch(() => {});
  });
}

