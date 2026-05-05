(function(){"use strict";const ae=`*, *::before, *::after {
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

/* ── Consent ─────────────────────────────────────────────── */

.lk-consent {
  display: grid;
  grid-template-columns: 18px 1fr;
  gap: 9px;
  align-items: start;
}

.lk-checkbox {
  width: 16px;
  height: 16px;
  margin-top: 2px;
  accent-color: var(--lk-primary, #111827);
}

.lk-consent-label {
  font-size: 12px;
  line-height: 1.45;
  color: var(--lk-muted, #6b7280);
}

.lk-consent-label a {
  color: var(--lk-primary, #111827);
  text-decoration: underline;
  text-underline-offset: 2px;
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
`,H="https://legjobbkocsma-reserve.vercel.app/api/public".replace(/\/$/,"");async function se(a){const o=new URL(`${H}/venues`);a&&o.searchParams.set("group_slug",a);const d=await fetch(o.toString());if(!d.ok)throw new Error(`venues:${d.status}`);return(await d.json()).data}async function oe(a,o,d){const i=new URL(`${H}/availability`);i.searchParams.set("venue_slug",a),i.searchParams.set("date",o),i.searchParams.set("party_size",String(d));const m=await fetch(i.toString());if(!m.ok)throw new Error(`availability:${m.status}`);return(await m.json()).slots}async function ie(a){const o=await fetch(`${H}/reservations`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(a)});if(!o.ok){let d="";try{const m=await o.json();d=m.message??m.error??""}catch{}const i=new Error(d||String(o.status));throw i.status=o.status,i}return o.json()}function re(){try{return new URL(document.referrer).hostname}catch{return"direct"}}function de(a,o){return a===422&&o.includes("party size")?"party_size_exceeded":a===422&&o.includes("not accepting")?"booking_disabled":a===404?"venue_not_found":a===400?"invalid_payload":"unknown"}function C(a,o={}){const d={event:a,domain:re(),...o};fetch(`${H}/track`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(d)}).catch(()=>{})}if(!document.getElementById("lk-embed-styles")){const a=document.createElement("style");a.id="lk-embed-styles",a.textContent=ae,document.head.appendChild(a)}function ce(a,o){const d=o.useSlots,i=o.venueSlug,m=o.venueGroup,W=o.open,pe=o.close,O=o.privacyUrl;let M=[],j=!1,D=!1,b=i??"",f=G(),p="",v="",T="",z="",_="",P="",x=[],y=!1,N=!1,S=!1,g=!1,q=0,Y="",R=!1,Q=!1,X=!1,L=!1,U=null,F=null;function B(){return M.find(e=>e.slug===b)??null}function V(e,l){return e.trim().replace(/[\x00-\x1F\x7F]/g,"").slice(0,l)}function ue(e){return e===""||/^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/.test(e)}function me(e){return e===""||/^\+?[\d\s\-(). ]{6,20}$/.test(e)}function Z(){if(!b||!f||!p||!R)return!1;const e=Number(v);if(!v||!Number.isInteger(e)||e<1||e>500||!T.trim()||T.trim().length>100)return!1;const l=z.trim(),n=_.trim();return!(!l&&!n||l&&!ue(l)||n&&!me(n))}function G(){const e=new Date;return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`}function fe(){const e=B();if(!e)return null;const l=new Date;return l.setDate(l.getDate()+e.venue_settings.max_advance_booking_days),l.toISOString().slice(0,10)}function ke(){const e=B(),l=(e==null?void 0:e.venue_settings.min_duration_minutes)??60,n=(e==null?void 0:e.venue_settings.min_notice_minutes)??60,t=E=>{const[Le,Fe]=E.split(":").map(Number);return Le*60+Fe},s=(e==null?void 0:e.venue_settings.open_time)??W,r=(e==null?void 0:e.venue_settings.close_time)??pe,u=t(s),h=t(r)-l,w=new Date,c=f!==""&&f===G()?w.getHours()*60+w.getMinutes()+n:-1/0,le=[];for(let E=u;E<=h;E+=30)E<=c||le.push(`${String(Math.floor(E/60)).padStart(2,"0")}:${String(E%60).padStart(2,"0")}`);return le}function ge(e,l){a.dispatchEvent(new CustomEvent(e,{detail:l,bubbles:!0})),window.parent.postMessage({type:e,...l},"*")}async function ee(e){var t;if(!((t=window.crypto)!=null&&t.subtle))return null;const l=new TextEncoder().encode(e),n=await window.crypto.subtle.digest("SHA-256",l);return Array.from(new Uint8Array(n)).map(s=>s.toString(16).padStart(2,"0")).join("")}async function he(){const e={},l=z.trim().toLowerCase(),n=_.trim().replace(/[^\d+]/g,"");if(l){const t=await ee(l);t&&(e.email_sha256=t)}if(n){const t=await ee(n);t&&(e.phone_sha256=t)}return e}function I(){if(a.innerHTML="",U){be();return}if(j){const e=document.createElement("div");e.className="lk-loading",e.textContent="Betöltés…",a.appendChild(e);return}if(!i&&D){const e=document.createElement("p");e.className="lk-msg-error",e.style.padding="8px 0",e.textContent="Nem sikerült betölteni az adatokat. Frissítse az oldalt.",a.appendChild(e);return}if(Q){const e=document.createElement("p");e.className="lk-msg-error",e.style.padding="8px 0",e.textContent=`Helyszín nem található: "${i}"`,a.appendChild(e);return}if(X){const e=document.createElement("p");e.className="lk-msg-error",e.style.padding="8px 0",e.textContent=`Helyszíncsoport nem található: "${m}"`,a.appendChild(e);return}a.appendChild(ve()),$(),k()}function be(){const e=U,l=e.status==="confirmed",n=document.createElement("div");n.className="lk-success";const t=document.createElement("div");t.className="lk-success-icon",t.innerHTML='<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',n.appendChild(t);const s=document.createElement("p");s.className="lk-success-title",s.textContent=l?"Foglalás visszaigazolva!":"Köszönjük!",n.appendChild(s);const r=document.createElement("p");r.className="lk-success-body",r.textContent=l?`Visszaigazolót küldtünk emailben. (#${e.reservation_id})`:"Foglalási igényét megkaptuk. Kollégáink hamarosan visszaigazolják az asztalt.",n.appendChild(r),a.appendChild(n)}function ve(){const e=document.createElement("form");e.className="lk-form",e.id="lk-form",e.noValidate=!0,i||e.appendChild(ye());const l=document.createElement("div");l.className="lk-row lk-row--date-party",l.appendChild(we()),l.appendChild(Ee()),e.appendChild(l),e.appendChild(Ce()),e.appendChild(K("lk-full-name","Teljes név","text","Kiss János",!0,()=>T,u=>{T=u}));const n=document.createElement("div");n.className="lk-row lk-row--contact",n.appendChild(K("lk-email","E-mail","email","pelda@email.hu",!1,()=>z,u=>{z=u})),n.appendChild(K("lk-phone","Telefon","tel","+36301234567",!1,()=>_,u=>{_=u})),e.appendChild(n),e.appendChild(ze()),e.appendChild(_e());const t=document.createElement("p");t.className="lk-note",t.textContent="* E-mail vagy telefonszám megadása kötelező.",e.appendChild(t);const s=document.createElement("div");s.className="lk-field lk-field--submit",s.id="lk-submit-wrap";const r=document.createElement("button");return r.type="submit",r.className="lk-btn",r.id="lk-submit",r.textContent="Foglalás küldése",s.appendChild(r),e.appendChild(s),e.appendChild(xe()),e.addEventListener("submit",Ne),e}function xe(){const e=document.createElement("div");e.className="lk-hp",e.setAttribute("aria-hidden","true");const l=document.createElement("label");l.htmlFor="lk-website",l.textContent="Website",e.appendChild(l);const n=document.createElement("input");return n.type="text",n.id="lk-website",n.name="website",n.tabIndex=-1,n.autocomplete="off",n.addEventListener("input",()=>{Y=n.value}),e.appendChild(n),e}function ye(){const e=document.createElement("div");e.className="lk-field lk-field--venue";const l=document.createElement("label");l.htmlFor="lk-venue",l.className="lk-label lk-label--venue",l.innerHTML='Helyszín <span class="lk-req">*</span>',e.appendChild(l);const n=document.createElement("select");if(n.className="lk-select",n.id="lk-venue",n.appendChild(new Option("Válasszon helyszínt…","")),j)n.disabled=!0,n.options[0].text="Betöltés…";else if(D)n.disabled=!0,n.options[0].text="Nem sikerült betölteni a helyszíneket.";else{for(const t of M)n.appendChild(new Option(t.name,t.slug));b&&(n.value=b)}return n.addEventListener("change",()=>{b=n.value,f="",p="",x=[],y=!1,N=!1,S=!1,g=!1,I()}),e.appendChild(n),e}function we(){const e=document.createElement("div");e.className="lk-field lk-field--date";const l=document.createElement("label");l.htmlFor="lk-date",l.className="lk-label lk-label--date",l.innerHTML='Dátum <span class="lk-req">*</span>',e.appendChild(l);const n=document.createElement("input");n.type="date",n.className="lk-input",n.id="lk-date",n.min=G();const t=fe();return t&&(n.max=t),f&&(n.value=f),n.addEventListener("change",()=>{f=n.value,p="",x=[],y=!1,N=!1,S=!1,g=!1,te(),$(),k()}),e.appendChild(n),e}function Ee(){const e=document.createElement("div");e.className="lk-field lk-field--party-size";const l=document.createElement("label");l.htmlFor="lk-party",l.className="lk-label lk-label--party-size",l.innerHTML='Létszám <span class="lk-req">*</span>',e.appendChild(l);const n=document.createElement("input");n.type="number",n.className="lk-input",n.id="lk-party",n.min="1",n.placeholder="1",v&&(n.value=v);const t=B();return t&&(n.max=String(t.venue_settings.max_party_size)),n.addEventListener("input",()=>{v=n.value,p="",x=[],y=!1,N=!1,S=!1,g=!1,te(),$(),k()}),e.appendChild(n),e}function Ce(){const e=document.createElement("div");e.className="lk-field lk-field--time";const l=document.createElement("label");l.htmlFor="lk-time",l.className="lk-label lk-label--time",l.innerHTML='Időpont <span class="lk-req">*</span>',e.appendChild(l);const n=document.createElement("div");return n.id="lk-time-content",e.appendChild(n),e}function K(e,l,n,t,s,r,u){const h=e.replace("lk-",""),w=document.createElement("div");w.className=`lk-field lk-field--${h}`;const A=document.createElement("label");A.htmlFor=e,A.className=`lk-label lk-label--${h}`,A.innerHTML=s?`${l} <span class="lk-req">*</span>`:l,w.appendChild(A);const c=document.createElement("input");return c.type=n,c.className="lk-input",c.id=e,c.placeholder=t,c.value=r(),n==="email"?(c.autocomplete="email",c.maxLength=254):n==="tel"?(c.autocomplete="tel",c.maxLength=20):(c.autocomplete="name",c.maxLength=100),c.addEventListener("input",()=>{u(c.value),k()}),w.appendChild(c),w}function ze(){const e=document.createElement("div");e.className="lk-field lk-field--message";const l=document.createElement("label");l.htmlFor="lk-message",l.className="lk-label lk-label--message",l.textContent="Megjegyzés",e.appendChild(l);const n=document.createElement("textarea");return n.className="lk-textarea",n.id="lk-message",n.placeholder="Különleges kérés, megjegyzés…",n.maxLength=1e3,n.value=P,n.addEventListener("input",()=>{P=n.value}),e.appendChild(n),e}function _e(){const e=document.createElement("div");e.className="lk-consent lk-consent--gdpr";const l=document.createElement("input");l.type="checkbox",l.className="lk-checkbox",l.id="lk-gdpr",l.checked=R;const n=document.createElement("label");if(n.className="lk-consent-label",n.htmlFor="lk-gdpr",n.append("Elfogadom, hogy a foglalás kezeléséhez a megadott adataimat kezeljék"),O){n.append(" az ");const t=document.createElement("a");t.href=O,t.target="_blank",t.rel="noopener noreferrer",t.textContent="adatkezelési tájékoztató",n.appendChild(t),n.append(" szerint")}return n.append("."),l.addEventListener("change",()=>{R=l.checked,k()}),e.appendChild(l),e.appendChild(n),e}function $(){const e=document.getElementById("lk-time-content");if(!e)return;if(e.innerHTML="",!f){const t=document.createElement("p");t.className="lk-msg-muted",t.textContent="Először válasszon dátumot.",e.appendChild(t);return}if(d&&y){const t=document.createElement("div");t.className="lk-slots-loading",t.innerHTML='<div class="lk-spinner"></div><span>Időpontok betöltése…</span>',e.appendChild(t);return}if(d&&g&&x.length>0){const t=document.createElement("select");t.className="lk-select lk-select--slots",t.id="lk-time",t.appendChild(new Option("Válasszon időpontot…",""));for(const s of x){const r=new Date(s.starts_at).toLocaleTimeString("hu-HU",{hour:"2-digit",minute:"2-digit"});t.appendChild(new Option(r,s.starts_at))}p&&(t.value=p),t.addEventListener("change",()=>{p=t.value,k()}),e.appendChild(t);return}if(d&&S){const t=document.createElement("p");t.className="lk-msg-muted",t.style.marginBottom="6px",t.textContent="Erre a napra nincs szabad időpont, de igényét így is elküldheti.",e.appendChild(t)}if(d&&N){const t=document.createElement("p");t.className="lk-msg-error",t.style.marginBottom="6px",t.textContent="Nem sikerült betölteni az időpontokat.",e.appendChild(t)}const l=ke();if(l.length===0){const t=document.createElement("p");t.className="lk-msg-muted",t.textContent="Erre a napra már nincs foglalható időpont.",e.appendChild(t);return}const n=document.createElement("select");n.className="lk-select lk-select--time",n.id="lk-time",n.appendChild(new Option("Válasszon időpontot…",""));for(const t of l)n.appendChild(new Option(t,t));p&&l.includes(p)&&(n.value=p),n.addEventListener("change",()=>{p=n.value,k()}),e.appendChild(n)}function k(){const e=document.getElementById("lk-submit");e&&(e.disabled=!Z()||L,e.textContent=L?"Küldés…":"Foglalás küldése")}function ne(e){var n;const l=document.getElementById("lk-submit-wrap");if(l&&((n=l.querySelector(".lk-msg-error"))==null||n.remove(),e)){const t=document.createElement("p");t.className="lk-msg-error",t.textContent=e,l.appendChild(t)}}async function te(){if(!d)return;const e=b,l=f,n=Number(v);if(!e||!l||!n||n<1)return;const t=++q;y=!0,N=!1,S=!1,g=!1,x=[],$();try{const s=await oe(e,l,n);if(t!==q)return;x=s,y=!1,s.length===0?(S=!0,g=!1,C("slots_empty")):(g=!0,C("slots_loaded",{slot_count:s.length}))}catch{if(t!==q)return;y=!1,N=!0,g=!1,C("error",{code:0,reason:"unknown"})}$(),k()}async function Ne(e){if(e.preventDefault(),!Z()||L)return;L=!0,F=null,k(),ne(null);const l=d&&g?p:new Date(`${f}T${p}:00`).toISOString(),n={venue_slug:b,starts_at:l,party_size:Number(v),customer:{full_name:V(T,100),...z.trim()?{email:V(z,254)}:{},..._.trim()?{phone:V(_,20)}:{}},...P.trim()?{message:V(P,1e3)}:{},consents:{reservation_data_processing:!0,reservation_data_processing_text:"Elfogadom, hogy a foglalás kezeléséhez a megadott adataimat kezeljék.",...O?{privacy_url:O}:{}},_hp:Y};try{const t=await ie(n);L=!1,U=t,C("submit",{status:t.status});const s=await he();ge("lk:confirmed",{reservation_id:t.reservation_id,status:t.status,...Object.keys(s).length>0?{enhanced_conversions:s}:{}}),I()}catch(t){L=!1;const s=t,r=s.status??0,u=s.message??"",h=de(r,u);C("error",{code:r,reason:h}),h==="party_size_exceeded"?F="A megadott létszám meghaladja a helyszín maximumát.":h==="booking_disabled"?F="A helyszín jelenleg nem fogad foglalásokat.":h==="venue_not_found"?F="A helyszín nem található.":F="Hiba történt. Kérjük, próbálja újra később.",k(),ne(F)}}async function Se(){C("load",i?{venue_slug:i}:{}),j=!0,I();try{M=await se(i?void 0:m??void 0),j=!1,i&&!M.find(l=>l.slug===i)?Q=!0:m&&!i&&M.length===0&&(X=!0)}catch{j=!1,D=!0}I()}Se()}function J(){document.querySelectorAll("[data-lk-venue], [data-lk-group], [data-lk]").forEach(a=>{a.dataset.lkMounted||(a.dataset.lkMounted="1",ce(a,{venueSlug:a.dataset.lkVenue??null,venueGroup:a.dataset.lkGroup??null,useSlots:a.dataset.lkSlots==="1",open:a.dataset.lkOpen??"10:00",close:a.dataset.lkClose??"23:00",privacyUrl:a.dataset.lkPrivacyUrl??null}))})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",J):J()})();
