(function(){"use strict";const W=`*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background: var(--lk-bg, transparent);
  color: var(--lk-text, #111827);
  font-family: var(--lk-font, inherit);
  font-size: 15px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

#app {
  padding: 0;
}

/* ── Form layout ─────────────────────────────────────────── */

.lk-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.lk-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

@media (max-width: 480px) {
  .lk-row {
    grid-template-columns: 1fr;
  }
}

/* ── Field ───────────────────────────────────────────────── */

.lk-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.lk-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--lk-muted, #6b7280);
}

.lk-req {
  color: var(--lk-primary, #111827);
  margin-left: 2px;
}

/* ── Inputs ──────────────────────────────────────────────── */

.lk-input,
.lk-select,
.lk-textarea {
  width: 100%;
  padding: 9px 12px;
  border: 1px solid var(--lk-border, #e5e7eb);
  border-radius: var(--lk-radius, 6px);
  font-size: 15px;
  font-family: inherit;
  color: var(--lk-text, #111827);
  background: transparent;
  outline: none;
  transition: border-color 0.15s;
  appearance: none;
  -webkit-appearance: none;
}

.lk-input:focus,
.lk-select:focus,
.lk-textarea:focus {
  border-color: var(--lk-primary, #111827);
}

.lk-input:disabled,
.lk-select:disabled,
.lk-textarea:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.lk-select {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 32px;
  cursor: pointer;
}

.lk-textarea {
  min-height: 80px;
  resize: vertical;
}

/* ── Submit button ───────────────────────────────────────── */

.lk-btn {
  width: 100%;
  padding: 11px 20px;
  background: var(--lk-primary, #111827);
  color: var(--lk-primary-fg, #ffffff);
  border: none;
  border-radius: var(--lk-radius, 6px);
  font-size: 15px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: opacity 0.15s;
}

.lk-btn:hover:not(:disabled) {
  opacity: 0.88;
}

.lk-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

/* ── Slot picker states ───────────────────────────────────── */

.lk-slots-loading {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--lk-muted, #6b7280);
  font-size: 14px;
  padding: 9px 0;
}

.lk-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid var(--lk-border, #e5e7eb);
  border-top-color: var(--lk-primary, #111827);
  border-radius: 50%;
  animation: lk-spin 0.65s linear infinite;
  flex-shrink: 0;
}

@keyframes lk-spin {
  to { transform: rotate(360deg); }
}

/* ── Messages ────────────────────────────────────────────── */

.lk-msg-muted {
  font-size: 13px;
  color: var(--lk-muted, #6b7280);
  line-height: 1.5;
}

.lk-msg-error {
  font-size: 13px;
  color: #dc2626;
  line-height: 1.5;
}

.lk-note {
  font-size: 12px;
  color: var(--lk-muted, #6b7280);
  margin-top: -4px;
}

/* ── Loading / global error ──────────────────────────────── */

.lk-loading {
  font-size: 14px;
  color: var(--lk-muted, #6b7280);
  padding: 8px 0;
}

/* ── Success state ───────────────────────────────────────── */

.lk-success {
  padding: 24px 0 16px;
  text-align: center;
}

.lk-success-icon {
  width: 52px;
  height: 52px;
  margin: 0 auto 16px;
  background: var(--lk-primary, #111827);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lk-success-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--lk-text, #111827);
  margin-bottom: 8px;
}

.lk-success-body {
  font-size: 14px;
  color: var(--lk-muted, #6b7280);
  line-height: 1.6;
  max-width: 340px;
  margin: 0 auto;
}
`,T="https://legjobbkocsma-reserve.vercel.app/api/public".replace(/\/$/,"");async function Y(a){const i=new URL(`${T}/venues`);a&&i.searchParams.set("group_slug",a);const d=await fetch(i.toString());if(!d.ok)throw new Error(`venues:${d.status}`);return(await d.json()).data}async function Q(a,i,d){const c=new URL(`${T}/availability`);c.searchParams.set("venue_slug",a),c.searchParams.set("date",i),c.searchParams.set("party_size",String(d));const g=await fetch(c.toString());if(!g.ok)throw new Error(`availability:${g.status}`);return(await g.json()).slots}async function X(a){const i=await fetch(`${T}/reservations`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(a)});if(!i.ok){let d="";try{const g=await i.json();d=g.message??g.error??""}catch{}const c=new Error(d||String(i.status));throw c.status=i.status,c}return i.json()}function Z(){try{return new URL(document.referrer).hostname}catch{return"direct"}}function ee(a,i){return a===422&&i.includes("party size")?"party_size_exceeded":a===422&&i.includes("not accepting")?"booking_disabled":a===404?"venue_not_found":a===400?"invalid_payload":"unknown"}function E(a,i={}){const d={event:a,domain:Z(),...i};fetch(`${T}/track`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(d)}).catch(()=>{})}if(!document.getElementById("lk-embed-styles")){const a=document.createElement("style");a.id="lk-embed-styles",a.textContent=W,document.head.appendChild(a)}function ne(a,i){const d=i.useSlots,c=i.venueSlug,g=i.venueGroup,R=i.open,te=i.close;let D=[],L=!1,P=!1,b=c??"",p="",u="",v="",O="",M="",j="",$="",y=[],x=!1,C=!1,z=!1,f=!1,V=0,S=!1,q=null,N=null;function H(){return D.find(e=>e.slug===b)??null}function U(){return!(!b||!p||!u||!v||Number(v)<1||!O.trim()||!M.trim()&&!j.trim())}function K(){const e=new Date;return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`}function le(){const e=H();if(!e)return null;const l=new Date;return l.setDate(l.getDate()+e.venue_settings.max_advance_booking_days),l.toISOString().slice(0,10)}function ae(){const e=H(),l=(e==null?void 0:e.venue_settings.min_duration_minutes)??60,n=(e==null?void 0:e.venue_settings.min_notice_minutes)??60,t=o=>{const[ke,ge]=o.split(":").map(Number);return ke*60+ge},s=t(R),r=t(te)-l,m=new Date,_=p!==""&&p===K()?m.getHours()*60+m.getMinutes()+n:-1/0,w=[];for(let o=s;o<=r;o+=30)o<=_||w.push(`${String(Math.floor(o/60)).padStart(2,"0")}:${String(o%60).padStart(2,"0")}`);return w}function se(e,l){a.dispatchEvent(new CustomEvent(e,{detail:l,bubbles:!0})),window.parent.postMessage({type:e,...l},"*")}function A(){if(a.innerHTML="",q){ie();return}if(!c&&L){const e=document.createElement("div");e.className="lk-loading",e.textContent="Betöltés…",a.appendChild(e);return}if(!c&&P){const e=document.createElement("p");e.className="lk-msg-error",e.style.padding="8px 0",e.textContent="Nem sikerült betölteni az adatokat. Frissítse az oldalt.",a.appendChild(e);return}a.appendChild(oe()),F(),k()}function ie(){const e=q,l=e.status==="confirmed",n=document.createElement("div");n.className="lk-success";const t=document.createElement("div");t.className="lk-success-icon",t.innerHTML='<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',n.appendChild(t);const s=document.createElement("p");s.className="lk-success-title",s.textContent=l?"Foglalás visszaigazolva!":"Köszönjük!",n.appendChild(s);const r=document.createElement("p");r.className="lk-success-body",r.textContent=l?`Visszaigazolót küldtünk emailben. (#${e.reservation_id})`:"Foglalási igényét megkaptuk. Kollégáink hamarosan visszaigazolják az asztalt.",n.appendChild(r),a.appendChild(n)}function oe(){const e=document.createElement("form");e.className="lk-form",e.id="lk-form",e.noValidate=!0,c||e.appendChild(re());const l=document.createElement("div");l.className="lk-row lk-row--date-party",l.appendChild(de()),l.appendChild(ce()),e.appendChild(l),e.appendChild(ue()),e.appendChild(I("lk-full-name","Teljes név","text","Kiss János",!0,()=>O,m=>{O=m}));const n=document.createElement("div");n.className="lk-row lk-row--contact",n.appendChild(I("lk-email","E-mail","email","pelda@email.hu",!1,()=>M,m=>{M=m})),n.appendChild(I("lk-phone","Telefon","tel","+36301234567",!1,()=>j,m=>{j=m})),e.appendChild(n),e.appendChild(me());const t=document.createElement("p");t.className="lk-note",t.textContent="* E-mail vagy telefonszám megadása kötelező.",e.appendChild(t);const s=document.createElement("div");s.className="lk-field lk-field--submit",s.id="lk-submit-wrap";const r=document.createElement("button");return r.type="submit",r.className="lk-btn",r.id="lk-submit",r.textContent="Foglalás küldése",s.appendChild(r),e.appendChild(s),e.addEventListener("submit",pe),e}function re(){const e=document.createElement("div");e.className="lk-field lk-field--venue";const l=document.createElement("label");l.htmlFor="lk-venue",l.className="lk-label lk-label--venue",l.innerHTML='Helyszín <span class="lk-req">*</span>',e.appendChild(l);const n=document.createElement("select");if(n.className="lk-select",n.id="lk-venue",n.appendChild(new Option("Válasszon helyszínt…","")),L)n.disabled=!0,n.options[0].text="Betöltés…";else if(P)n.disabled=!0,n.options[0].text="Nem sikerült betölteni a helyszíneket.";else{for(const t of D)n.appendChild(new Option(t.name,t.slug));b&&(n.value=b)}return n.addEventListener("change",()=>{b=n.value,p="",u="",y=[],x=!1,C=!1,z=!1,f=!1,A()}),e.appendChild(n),e}function de(){const e=document.createElement("div");e.className="lk-field lk-field--date";const l=document.createElement("label");l.htmlFor="lk-date",l.className="lk-label lk-label--date",l.innerHTML='Dátum <span class="lk-req">*</span>',e.appendChild(l);const n=document.createElement("input");n.type="date",n.className="lk-input",n.id="lk-date",n.min=K();const t=le();return t&&(n.max=t),p&&(n.value=p),n.addEventListener("change",()=>{p=n.value,u="",y=[],x=!1,C=!1,z=!1,f=!1,J(),F(),k()}),e.appendChild(n),e}function ce(){const e=document.createElement("div");e.className="lk-field lk-field--party-size";const l=document.createElement("label");l.htmlFor="lk-party",l.className="lk-label lk-label--party-size",l.innerHTML='Létszám <span class="lk-req">*</span>',e.appendChild(l);const n=document.createElement("input");n.type="number",n.className="lk-input",n.id="lk-party",n.min="1",n.placeholder="1",v&&(n.value=v);const t=H();return t&&(n.max=String(t.venue_settings.max_party_size)),n.addEventListener("input",()=>{v=n.value,u="",y=[],x=!1,C=!1,z=!1,f=!1,J(),F(),k()}),e.appendChild(n),e}function ue(){const e=document.createElement("div");e.className="lk-field lk-field--time";const l=document.createElement("label");l.htmlFor="lk-time",l.className="lk-label lk-label--time",l.innerHTML='Időpont <span class="lk-req">*</span>',e.appendChild(l);const n=document.createElement("div");return n.id="lk-time-content",e.appendChild(n),e}function I(e,l,n,t,s,r,m){const h=e.replace("lk-",""),_=document.createElement("div");_.className=`lk-field lk-field--${h}`;const w=document.createElement("label");w.htmlFor=e,w.className=`lk-label lk-label--${h}`,w.innerHTML=s?`${l} <span class="lk-req">*</span>`:l,_.appendChild(w);const o=document.createElement("input");return o.type=n,o.className="lk-input",o.id=e,o.placeholder=t,o.value=r(),n==="email"?o.autocomplete="email":n==="tel"?o.autocomplete="tel":o.autocomplete="name",o.addEventListener("input",()=>{m(o.value),k()}),_.appendChild(o),_}function me(){const e=document.createElement("div");e.className="lk-field lk-field--message";const l=document.createElement("label");l.htmlFor="lk-message",l.className="lk-label lk-label--message",l.textContent="Megjegyzés",e.appendChild(l);const n=document.createElement("textarea");return n.className="lk-textarea",n.id="lk-message",n.placeholder="Különleges kérés, megjegyzés…",n.value=$,n.addEventListener("input",()=>{$=n.value}),e.appendChild(n),e}function F(){const e=document.getElementById("lk-time-content");if(!e)return;if(e.innerHTML="",d&&x){const t=document.createElement("div");t.className="lk-slots-loading",t.innerHTML='<div class="lk-spinner"></div><span>Időpontok betöltése…</span>',e.appendChild(t);return}if(d&&f&&y.length>0){const t=document.createElement("select");t.className="lk-select lk-select--slots",t.id="lk-time",t.appendChild(new Option("Válasszon időpontot…",""));for(const s of y){const r=new Date(s.starts_at).toLocaleTimeString("hu-HU",{hour:"2-digit",minute:"2-digit"});t.appendChild(new Option(r,s.starts_at))}u&&(t.value=u),t.addEventListener("change",()=>{u=t.value,k()}),e.appendChild(t);return}if(d&&z){const t=document.createElement("p");t.className="lk-msg-muted",t.style.marginBottom="6px",t.textContent="Erre a napra nincs szabad időpont, de igényét így is elküldheti.",e.appendChild(t)}if(d&&C){const t=document.createElement("p");t.className="lk-msg-error",t.style.marginBottom="6px",t.textContent="Nem sikerült betölteni az időpontokat.",e.appendChild(t)}const l=ae();if(l.length===0){const t=document.createElement("p");t.className="lk-msg-muted",t.textContent="Erre a napra már nincs foglalható időpont.",e.appendChild(t);return}const n=document.createElement("select");n.className="lk-select lk-select--time",n.id="lk-time",n.appendChild(new Option("Válasszon időpontot…",""));for(const t of l)n.appendChild(new Option(t,t));u&&l.includes(u)&&(n.value=u),n.addEventListener("change",()=>{u=n.value,k()}),e.appendChild(n)}function k(){const e=document.getElementById("lk-submit");e&&(e.disabled=!U()||S,e.textContent=S?"Küldés…":"Foglalás küldése")}function G(e){var n;const l=document.getElementById("lk-submit-wrap");if(l&&((n=l.querySelector(".lk-msg-error"))==null||n.remove(),e)){const t=document.createElement("p");t.className="lk-msg-error",t.textContent=e,l.appendChild(t)}}async function J(){if(!d)return;const e=b,l=p,n=Number(v);if(!e||!l||!n||n<1)return;const t=++V;x=!0,C=!1,z=!1,f=!1,y=[],F();try{const s=await Q(e,l,n);if(t!==V)return;y=s,x=!1,s.length===0?(z=!0,f=!1,E("slots_empty")):(f=!0,E("slots_loaded",{slot_count:s.length}))}catch{if(t!==V)return;x=!1,C=!0,f=!1,E("error",{code:0,reason:"unknown"})}F(),k()}async function pe(e){if(e.preventDefault(),!U()||S)return;S=!0,N=null,k(),G(null);const l=d&&f?u:new Date(`${p}T${u}:00`).toISOString(),n={venue_slug:b,starts_at:l,party_size:Number(v),customer:{full_name:O.trim(),...M.trim()?{email:M.trim()}:{},...j.trim()?{phone:j.trim()}:{}},...$.trim()?{message:$.trim()}:{}};try{const t=await X(n);S=!1,q=t,E("submit",{status:t.status}),se("lk:confirmed",{reservation_id:t.reservation_id,status:t.status}),A()}catch(t){S=!1;const s=t,r=s.status??0,m=s.message??"",h=ee(r,m);E("error",{code:r,reason:h}),h==="party_size_exceeded"?N="A megadott létszám meghaladja a helyszín maximumát.":h==="booking_disabled"?N="A helyszín jelenleg nem fogad foglalásokat.":h==="venue_not_found"?N="A helyszín nem található.":N="Hiba történt. Kérjük, próbálja újra később.",k(),G(N)}}async function fe(){E("load",c?{venue_slug:c}:{}),L=!0,A();try{D=await Y(c?void 0:g??void 0),L=!1}catch{L=!1,P=!0}A()}fe()}function B(){document.querySelectorAll("[data-lk-venue], [data-lk-group], [data-lk]").forEach(a=>{a.dataset.lkMounted||(a.dataset.lkMounted="1",ne(a,{venueSlug:a.dataset.lkVenue??null,venueGroup:a.dataset.lkGroup??null,useSlots:a.dataset.lkSlots==="1",open:a.dataset.lkOpen??"10:00",close:a.dataset.lkClose??"23:00"}))})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",B):B()})();
