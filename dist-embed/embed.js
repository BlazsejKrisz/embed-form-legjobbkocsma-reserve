(function(){"use strict";const te=`*, *::before, *::after {
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

/* ── Honeypot (bot trap) ─────────────────────────────────── */

.lk-hp {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
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
`,H="https://legjobbkocsma-reserve.vercel.app/api/public".replace(/\/$/,"");async function ne(a){const o=new URL(`${H}/venues`);a&&o.searchParams.set("group_slug",a);const d=await fetch(o.toString());if(!d.ok)throw new Error(`venues:${d.status}`);return(await d.json()).data}async function le(a,o,d){const i=new URL(`${H}/availability`);i.searchParams.set("venue_slug",a),i.searchParams.set("date",o),i.searchParams.set("party_size",String(d));const m=await fetch(i.toString());if(!m.ok)throw new Error(`availability:${m.status}`);return(await m.json()).slots}async function ae(a){const o=await fetch(`${H}/reservations`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(a)});if(!o.ok){let d="";try{const m=await o.json();d=m.message??m.error??""}catch{}const i=new Error(d||String(o.status));throw i.status=o.status,i}return o.json()}function se(){try{return new URL(document.referrer).hostname}catch{return"direct"}}function oe(a,o){return a===422&&o.includes("party size")?"party_size_exceeded":a===422&&o.includes("not accepting")?"booking_disabled":a===404?"venue_not_found":a===400?"invalid_payload":"unknown"}function C(a,o={}){const d={event:a,domain:se(),...o};fetch(`${H}/track`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(d)}).catch(()=>{})}if(!document.getElementById("lk-embed-styles")){const a=document.createElement("style");a.id="lk-embed-styles",a.textContent=te,document.head.appendChild(a)}function ie(a,o){const d=o.useSlots,i=o.venueSlug,m=o.venueGroup,G=o.open,re=o.close;let L=[],M=!1,D=!1,b=i??"",f=R(),u="",v="",F="",j="",T="",A="",x=[],y=!1,z=!1,N=!1,k=!1,I=0,J="",W=!1,Y=!1,S=!1,q=null,_=null;function B(){return L.find(e=>e.slug===b)??null}function P(e,n){return e.trim().replace(/[\x00-\x1F\x7F]/g,"").slice(0,n)}function de(e){return e===""||/^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/.test(e)}function ce(e){return e===""||/^\+?[\d\s\-(). ]{6,20}$/.test(e)}function Q(){if(!b||!f||!u)return!1;const e=Number(v);if(!v||!Number.isInteger(e)||e<1||e>500||!F.trim()||F.trim().length>100)return!1;const n=j.trim(),t=T.trim();return!(!n&&!t||n&&!de(n)||t&&!ce(t))}function R(){const e=new Date;return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`}function ue(){const e=B();if(!e)return null;const n=new Date;return n.setDate(n.getDate()+e.venue_settings.max_advance_booking_days),n.toISOString().slice(0,10)}function pe(){const e=B(),n=(e==null?void 0:e.venue_settings.min_duration_minutes)??60,t=(e==null?void 0:e.venue_settings.min_notice_minutes)??60,l=w=>{const[Ce,ze]=w.split(":").map(Number);return Ce*60+ze},s=(e==null?void 0:e.venue_settings.open_time)??G,r=(e==null?void 0:e.venue_settings.close_time)??re,p=l(s),h=l(r)-n,E=new Date,c=f!==""&&f===R()?E.getHours()*60+E.getMinutes()+t:-1/0,ee=[];for(let w=p;w<=h;w+=30)w<=c||ee.push(`${String(Math.floor(w/60)).padStart(2,"0")}:${String(w%60).padStart(2,"0")}`);return ee}function me(e,n){a.dispatchEvent(new CustomEvent(e,{detail:n,bubbles:!0})),window.parent.postMessage({type:e,...n},"*")}function V(){if(a.innerHTML="",q){fe();return}if(M){const e=document.createElement("div");e.className="lk-loading",e.textContent="Betöltés…",a.appendChild(e);return}if(!i&&D){const e=document.createElement("p");e.className="lk-msg-error",e.style.padding="8px 0",e.textContent="Nem sikerült betölteni az adatokat. Frissítse az oldalt.",a.appendChild(e);return}if(W){const e=document.createElement("p");e.className="lk-msg-error",e.style.padding="8px 0",e.textContent=`Helyszín nem található: "${i}"`,a.appendChild(e);return}if(Y){const e=document.createElement("p");e.className="lk-msg-error",e.style.padding="8px 0",e.textContent=`Helyszíncsoport nem található: "${m}"`,a.appendChild(e);return}a.appendChild(ke()),$(),g()}function fe(){const e=q,n=e.status==="confirmed",t=document.createElement("div");t.className="lk-success";const l=document.createElement("div");l.className="lk-success-icon",l.innerHTML='<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',t.appendChild(l);const s=document.createElement("p");s.className="lk-success-title",s.textContent=n?"Foglalás visszaigazolva!":"Köszönjük!",t.appendChild(s);const r=document.createElement("p");r.className="lk-success-body",r.textContent=n?`Visszaigazolót küldtünk emailben. (#${e.reservation_id})`:"Foglalási igényét megkaptuk. Kollégáink hamarosan visszaigazolják az asztalt.",t.appendChild(r),a.appendChild(t)}function ke(){const e=document.createElement("form");e.className="lk-form",e.id="lk-form",e.noValidate=!0,i||e.appendChild(he());const n=document.createElement("div");n.className="lk-row lk-row--date-party",n.appendChild(be()),n.appendChild(ve()),e.appendChild(n),e.appendChild(xe()),e.appendChild(U("lk-full-name","Teljes név","text","Kiss János",!0,()=>F,p=>{F=p}));const t=document.createElement("div");t.className="lk-row lk-row--contact",t.appendChild(U("lk-email","E-mail","email","pelda@email.hu",!1,()=>j,p=>{j=p})),t.appendChild(U("lk-phone","Telefon","tel","+36301234567",!1,()=>T,p=>{T=p})),e.appendChild(t),e.appendChild(ye());const l=document.createElement("p");l.className="lk-note",l.textContent="* E-mail vagy telefonszám megadása kötelező.",e.appendChild(l);const s=document.createElement("div");s.className="lk-field lk-field--submit",s.id="lk-submit-wrap";const r=document.createElement("button");return r.type="submit",r.className="lk-btn",r.id="lk-submit",r.textContent="Foglalás küldése",s.appendChild(r),e.appendChild(s),e.appendChild(ge()),e.addEventListener("submit",Ee),e}function ge(){const e=document.createElement("div");e.className="lk-hp",e.setAttribute("aria-hidden","true");const n=document.createElement("label");n.htmlFor="lk-website",n.textContent="Website",e.appendChild(n);const t=document.createElement("input");return t.type="text",t.id="lk-website",t.name="website",t.tabIndex=-1,t.autocomplete="off",t.addEventListener("input",()=>{J=t.value}),e.appendChild(t),e}function he(){const e=document.createElement("div");e.className="lk-field lk-field--venue";const n=document.createElement("label");n.htmlFor="lk-venue",n.className="lk-label lk-label--venue",n.innerHTML='Helyszín <span class="lk-req">*</span>',e.appendChild(n);const t=document.createElement("select");if(t.className="lk-select",t.id="lk-venue",t.appendChild(new Option("Válasszon helyszínt…","")),M)t.disabled=!0,t.options[0].text="Betöltés…";else if(D)t.disabled=!0,t.options[0].text="Nem sikerült betölteni a helyszíneket.";else{for(const l of L)t.appendChild(new Option(l.name,l.slug));b&&(t.value=b)}return t.addEventListener("change",()=>{b=t.value,f="",u="",x=[],y=!1,z=!1,N=!1,k=!1,V()}),e.appendChild(t),e}function be(){const e=document.createElement("div");e.className="lk-field lk-field--date";const n=document.createElement("label");n.htmlFor="lk-date",n.className="lk-label lk-label--date",n.innerHTML='Dátum <span class="lk-req">*</span>',e.appendChild(n);const t=document.createElement("input");t.type="date",t.className="lk-input",t.id="lk-date",t.min=R();const l=ue();return l&&(t.max=l),f&&(t.value=f),t.addEventListener("change",()=>{f=t.value,u="",x=[],y=!1,z=!1,N=!1,k=!1,Z(),$(),g()}),e.appendChild(t),e}function ve(){const e=document.createElement("div");e.className="lk-field lk-field--party-size";const n=document.createElement("label");n.htmlFor="lk-party",n.className="lk-label lk-label--party-size",n.innerHTML='Létszám <span class="lk-req">*</span>',e.appendChild(n);const t=document.createElement("input");t.type="number",t.className="lk-input",t.id="lk-party",t.min="1",t.placeholder="1",v&&(t.value=v);const l=B();return l&&(t.max=String(l.venue_settings.max_party_size)),t.addEventListener("input",()=>{v=t.value,u="",x=[],y=!1,z=!1,N=!1,k=!1,Z(),$(),g()}),e.appendChild(t),e}function xe(){const e=document.createElement("div");e.className="lk-field lk-field--time";const n=document.createElement("label");n.htmlFor="lk-time",n.className="lk-label lk-label--time",n.innerHTML='Időpont <span class="lk-req">*</span>',e.appendChild(n);const t=document.createElement("div");return t.id="lk-time-content",e.appendChild(t),e}function U(e,n,t,l,s,r,p){const h=e.replace("lk-",""),E=document.createElement("div");E.className=`lk-field lk-field--${h}`;const O=document.createElement("label");O.htmlFor=e,O.className=`lk-label lk-label--${h}`,O.innerHTML=s?`${n} <span class="lk-req">*</span>`:n,E.appendChild(O);const c=document.createElement("input");return c.type=t,c.className="lk-input",c.id=e,c.placeholder=l,c.value=r(),t==="email"?(c.autocomplete="email",c.maxLength=254):t==="tel"?(c.autocomplete="tel",c.maxLength=20):(c.autocomplete="name",c.maxLength=100),c.addEventListener("input",()=>{p(c.value),g()}),E.appendChild(c),E}function ye(){const e=document.createElement("div");e.className="lk-field lk-field--message";const n=document.createElement("label");n.htmlFor="lk-message",n.className="lk-label lk-label--message",n.textContent="Megjegyzés",e.appendChild(n);const t=document.createElement("textarea");return t.className="lk-textarea",t.id="lk-message",t.placeholder="Különleges kérés, megjegyzés…",t.maxLength=1e3,t.value=A,t.addEventListener("input",()=>{A=t.value}),e.appendChild(t),e}function $(){const e=document.getElementById("lk-time-content");if(!e)return;if(e.innerHTML="",!f){const l=document.createElement("p");l.className="lk-msg-muted",l.textContent="Először válasszon dátumot.",e.appendChild(l);return}if(d&&y){const l=document.createElement("div");l.className="lk-slots-loading",l.innerHTML='<div class="lk-spinner"></div><span>Időpontok betöltése…</span>',e.appendChild(l);return}if(d&&k&&x.length>0){const l=document.createElement("select");l.className="lk-select lk-select--slots",l.id="lk-time",l.appendChild(new Option("Válasszon időpontot…",""));for(const s of x){const r=new Date(s.starts_at).toLocaleTimeString("hu-HU",{hour:"2-digit",minute:"2-digit"});l.appendChild(new Option(r,s.starts_at))}u&&(l.value=u),l.addEventListener("change",()=>{u=l.value,g()}),e.appendChild(l);return}if(d&&N){const l=document.createElement("p");l.className="lk-msg-muted",l.style.marginBottom="6px",l.textContent="Erre a napra nincs szabad időpont, de igényét így is elküldheti.",e.appendChild(l)}if(d&&z){const l=document.createElement("p");l.className="lk-msg-error",l.style.marginBottom="6px",l.textContent="Nem sikerült betölteni az időpontokat.",e.appendChild(l)}const n=pe();if(n.length===0){const l=document.createElement("p");l.className="lk-msg-muted",l.textContent="Erre a napra már nincs foglalható időpont.",e.appendChild(l);return}const t=document.createElement("select");t.className="lk-select lk-select--time",t.id="lk-time",t.appendChild(new Option("Válasszon időpontot…",""));for(const l of n)t.appendChild(new Option(l,l));u&&n.includes(u)&&(t.value=u),t.addEventListener("change",()=>{u=t.value,g()}),e.appendChild(t)}function g(){const e=document.getElementById("lk-submit");e&&(e.disabled=!Q()||S,e.textContent=S?"Küldés…":"Foglalás küldése")}function X(e){var t;const n=document.getElementById("lk-submit-wrap");if(n&&((t=n.querySelector(".lk-msg-error"))==null||t.remove(),e)){const l=document.createElement("p");l.className="lk-msg-error",l.textContent=e,n.appendChild(l)}}async function Z(){if(!d)return;const e=b,n=f,t=Number(v);if(!e||!n||!t||t<1)return;const l=++I;y=!0,z=!1,N=!1,k=!1,x=[],$();try{const s=await le(e,n,t);if(l!==I)return;x=s,y=!1,s.length===0?(N=!0,k=!1,C("slots_empty")):(k=!0,C("slots_loaded",{slot_count:s.length}))}catch{if(l!==I)return;y=!1,z=!0,k=!1,C("error",{code:0,reason:"unknown"})}$(),g()}async function Ee(e){if(e.preventDefault(),!Q()||S)return;S=!0,_=null,g(),X(null);const n=d&&k?u:new Date(`${f}T${u}:00`).toISOString(),t={venue_slug:b,starts_at:n,party_size:Number(v),customer:{full_name:P(F,100),...j.trim()?{email:P(j,254)}:{},...T.trim()?{phone:P(T,20)}:{}},...A.trim()?{message:P(A,1e3)}:{},_hp:J};try{const l=await ae(t);S=!1,q=l,C("submit",{status:l.status}),me("lk:confirmed",{reservation_id:l.reservation_id,status:l.status}),V()}catch(l){S=!1;const s=l,r=s.status??0,p=s.message??"",h=oe(r,p);C("error",{code:r,reason:h}),h==="party_size_exceeded"?_="A megadott létszám meghaladja a helyszín maximumát.":h==="booking_disabled"?_="A helyszín jelenleg nem fogad foglalásokat.":h==="venue_not_found"?_="A helyszín nem található.":_="Hiba történt. Kérjük, próbálja újra később.",g(),X(_)}}async function we(){C("load",i?{venue_slug:i}:{}),M=!0,V();try{L=await ne(i?void 0:m??void 0),M=!1,i&&!L.find(n=>n.slug===i)?W=!0:m&&!i&&L.length===0&&(Y=!0)}catch{M=!1,D=!0}V()}we()}function K(){document.querySelectorAll("[data-lk-venue], [data-lk-group], [data-lk]").forEach(a=>{a.dataset.lkMounted||(a.dataset.lkMounted="1",ie(a,{venueSlug:a.dataset.lkVenue??null,venueGroup:a.dataset.lkGroup??null,useSlots:a.dataset.lkSlots==="1",open:a.dataset.lkOpen??"10:00",close:a.dataset.lkClose??"23:00"}))})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",K):K()})();
