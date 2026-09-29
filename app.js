import {cases,stages} from './data.js';
import {stageCapacity,checkMove} from './board-rules.js';
import {detailTabs,detailedCases,sourceCases,messageTemplates} from './case-details.js';

const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const safe=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const initials=n=>n.split(/\s+/).slice(0,2).map(p=>p[0]).join('').toUpperCase();
const moveKey='americare-pediatric-idea1-moves-v1',sidebarKey='americare-pediatric-idea1-sidebar',replyKey='americare-pediatric-idea1-replies-v1';
const baseline=new Map(cases.map(c=>[c.id,{stage:c.stage,days:c.days,closed:Boolean(c.closed)}]));
const getStorage=key=>{try{return localStorage.getItem(key)}catch{return null}};
const state={view:'overview',search:'',stage:'all',charts:[],caseId:null,tab:0,toastTimer:null,lastFocus:null,draft:'',subject:'',recipient:'Referring contact',template:''};
function loadReplies(){try{const saved=JSON.parse(localStorage.getItem(replyKey)||'[]');return Array.isArray(saved)?saved.filter(entry=>sourceCases[entry.id]&&typeof entry.body==='string'&&typeof entry.when==='string'):[]}catch{return []}}
const demoReplies=loadReplies();
function saveReplies(){try{localStorage.setItem(replyKey,JSON.stringify(demoReplies))}catch{showToast('The reply is visible for this session, but browser storage is unavailable.')}}
const meta={
 all:['All cases','Every referral in one searchable view, including cases sent to intake.','ALL CASES'],
 active:['Active cases','Open cases are visible to every rep, so coverage is easy when someone is away.','ACTIVE CASES'],
 exceptions:['Exception queue','Arrival blockers and in-flight exceptions from the source workflow.','PRIORITY QUEUES'],
 holds:['Active holds','Aide training and agency discharge dependencies.','PRIORITY QUEUES'],
 followups:['Follow-ups due','Cases past a stage threshold or waiting on a medical vendor.','PRIORITY QUEUES'],
 ready:['Ready for intake','Cases at the supervisor review point.','PRIORITY QUEUES'],
 certification:['Certification handoff','Cases without OPWDD certification stay visible.','PRIORITY QUEUES']
};
const queues=()=>({
 all:cases,active:cases.filter(c=>!c.closed),exceptions:cases.filter(c=>c.exception&&!c.closed),
 holds:cases.filter(c=>c.hold&&!c.closed),followups:cases.filter(c=>c.follow&&!c.closed),
 ready:cases.filter(c=>c.stage==='Ready for intake'),certification:cases.filter(c=>c.cert&&!c.closed)
});
function showToast(message){const el=$('#toast');el.textContent=message;el.hidden=false;clearTimeout(state.toastTimer);state.toastTimer=setTimeout(()=>el.hidden=true,4500)}
function restoreMoves(){try{const saved=JSON.parse(localStorage.getItem(moveKey)||'{}');for(const [id,to] of Object.entries(saved)){const c=cases.find(x=>x.id===id);if(c&&stages.indexOf(to)>stages.indexOf(c.stage)){c.stage=to;c.days=0;c.closed=to===stages.at(-1);c.moved=true}}}catch{}}
function persistMoves(){try{localStorage.setItem(moveKey,JSON.stringify(Object.fromEntries(cases.filter(c=>c.moved).map(c=>[c.id,c.stage]))))}catch{showToast('Move saved for this session only; browser storage is unavailable.')}}
function resetBoard(){undoWindow.cancel();for(const c of cases){const original=baseline.get(c.id);c.stage=original.stage;c.days=original.days;c.closed=original.closed;delete c.moved}try{localStorage.removeItem(moveKey)}catch{}refreshCaseViews();showToast('Demo board restored to its starting stages.')}
function setTheme(next){document.documentElement.dataset.theme=next;try{localStorage.setItem('americare-pediatric-theme',next)}catch{};$$('#theme-toggle,#theme-toggle-side').forEach(b=>{b.setAttribute('aria-label',next==='dark'?'Switch to light mode':'Switch to dark mode');const icon=b.querySelector('.theme-symbol');if(icon)icon.textContent=next==='dark'?'☀':'☾';else b.textContent=next==='dark'?'☀':'☾'});drawCharts()}
function setSidebar(collapsed){$('.app-shell').classList.toggle('sidebar-collapsed',collapsed);$('#menu-button').setAttribute('aria-expanded',String(!collapsed));$('#menu-button').setAttribute('aria-label',collapsed?'Expand menu':'Collapse menu');try{localStorage.setItem(sidebarKey,collapsed?'collapsed':'expanded')}catch{}}
function setMobileMenu(open){$('#sidebar').classList.toggle('is-open',open);$('#menu-button').setAttribute('aria-expanded',String(open));$('#menu-button').setAttribute('aria-label',open?'Close menu':'Open menu')}
function navigate(view){const q=queues(),next=view==='overview'||view==='board'||q[view]?view:'overview';if(state.view==='board'&&next!=='board')undoWindow.commit({dust:false});state.view=next;state.search='';state.stage='all';$('#case-search').value='';$('#stage-filter').value='all';$('#overview-view').hidden=state.view!=='overview';$('#list-view').hidden=state.view==='overview'||state.view==='board';$('#board-view').hidden=state.view!=='board';$$('.nav-item').forEach(b=>b.classList.toggle('is-active',b.dataset.view===state.view));$('#breadcrumb-page').textContent=state.view==='overview'?'Overview':state.view==='board'?'Case board':meta[state.view][0];if(q[state.view])renderList();if(state.view==='board')renderBoard();if(matchMedia('(max-width:760px)').matches)setMobileMenu(false);window.scrollTo({top:0,behavior:'smooth'});history.replaceState(null,'','#'+state.view)}
function renderList(){
 const q=queues(),m=meta[state.view],base=q[state.view];
 if(!m||!base)return;
 const term=state.search.trim().toLowerCase();
 const shown=base.filter(c=>(state.stage==='all'||c.stage===state.stage)&&(!term||[c.id,c.name,c.borough,c.language,c.source,c.type,c.owner,c.stage,c.exception].some(v=>String(v??'').toLowerCase().includes(term))));
 $('#list-title').innerHTML=safe(m[0])+'<span class="heading-period">.</span>';
 $('#list-description').textContent=m[1];
 $('#list-kicker').textContent=m[2];
 $('#list-count').textContent=base.length;
 $('#result-count').textContent=shown.length+' of '+base.length+' shown';
 $('#case-list').innerHTML=shown.length?shown.map(c=>{
   const alert=c.totalDays>7?'age-total-alert':c.days>=4?'age-stage-alert':'';
   return `<div class="case-row ${alert}">
     <button class="row-open" data-case-full="${safe(c.id)}" aria-label="Open full case record for ${safe(c.name)}, ${safe(c.id)}"></button>
     <span class="row-person"><strong>${safe(c.name)}</strong><small class="row-case-id">${safe(c.id)}</small><small>${safe(c.borough)} · ${safe(c.language)}</small></span>
     <span class="row-type"><strong>${safe(c.type)}</strong><small>${safe(c.source)}</small></span>
     <span class="row-owner"><strong>${safe(c.owner)}</strong><small>Case owner</small></span>
     <span class="row-stage"><span class="stage-badge">${safe(c.stage)}</span><small>${safe(c.hold?'On hold · '+c.hold:c.exception??'')}</small></span>
     <span class="row-days"><span><b>${c.days}</b><small>in stage</small></span><span><b>${c.totalDays}</b><small>total days</small></span></span>
     <span class="row-actions"><button data-case-quick="${safe(c.id)}" aria-label="Quick view ${safe(c.name)}">◧<small>Quick</small></button><button data-case-full="${safe(c.id)}" aria-label="Full details for ${safe(c.name)}">↗<small>Details</small></button></span>
   </div>`;
 }).join(''):'<div class="empty-state">No cases match these filters.</div>';
}
function renderBoard(){$('#board-count').textContent=queues().active.length;$('#board').innerHTML=stages.map(stage=>{const items=cases.filter(c=>c.stage===stage);return `<div class="board-column" data-stage="${safe(stage)}"><div class="board-head"><strong>${safe(stage)}</strong><span>${items.length} / ${stageCapacity[stage]}</span></div><div class="board-stack">${items.map(c=>`<div class="board-card" data-card="${safe(c.id)}"><div class="board-card-top"><button class="board-drag" data-drag="${safe(c.id)}" aria-label="Drag ${safe(c.name)}">⋮⋮</button><span class="board-id">${safe(c.id)}</span></div><strong>${safe(c.name)}</strong><small>${safe(c.type)}</small><div class="board-meta"><span>${safe(c.owner)}</span><b>${c.days}d</b></div><div class="board-card-actions"><button data-case-quick="${safe(c.id)}">Quick view</button><button data-case-full="${safe(c.id)}">Full details ↗</button></div>${c.closed?'<p class="board-closed">Sent to intake · closed</p>':`<label class="board-move-label"><span>Move to</span><select data-move="${safe(c.id)}" aria-label="Move ${safe(c.name)} to a later stage"><option value="">Move to…</option>${stages.slice(stages.indexOf(c.stage)+1).map(next=>`<option value="${safe(next)}">${safe(next)}</option>`).join('')}</select></label>`}</div>`).join('')}</div></div>`}).join('')}
function refreshCaseViews(){renderBoard();renderOverview();drawCharts();renderList();if(state.caseId)renderFull()}
const undoWindow=window.createMoveUndoWindow({element:$('#move-undo'),onCommit:persistMoves,onUndo:move=>{const c=cases.find(x=>x.id===move.id);if(!c)return;c.stage=move.previous.stage;c.days=move.previous.days;c.closed=move.previous.closed;if(move.previous.moved)c.moved=true;else delete c.moved;refreshCaseViews();showToast(`${c.name} returned to ${c.stage}.`)}});
function moveCase(id,to){const c=cases.find(x=>x.id===id);if(!c)return false;const result=checkMove(c,to,cases,stages);if(!result.ok){showToast(result.message);return false}undoWindow.commit({dust:false});const previous={stage:c.stage,days:c.days,closed:Boolean(c.closed),moved:Boolean(c.moved)};c.stage=to;c.days=0;c.closed=to===stages.at(-1);c.moved=true;refreshCaseViews();undoWindow.begin({id,name:c.name,from:previous.stage,to,previous});return true}
function openQuick(id){const c=cases.find(x=>x.id===id);if(!c)return;state.quickOrigin=document.activeElement;const idx=stages.indexOf(c.stage),focus=c.hold?`${c.hold} · ${c.holdDays} days held in the source snapshot.`:c.exception||c.medical||'Continue the case through its current stage.';$('#drawer-content').innerHTML=`<h2>${safe(c.name)}</h2><div class="drawer-id">${safe(c.id)} · ${safe(c.source)}</div><div class="drawer-tagline"><span>${safe(c.type)}</span><span>${c.days} days in stage</span></div><button class="full-open-button" data-case-full="${safe(c.id)}">Open full case record ↗</button><div class="drawer-section"><h3>Case at a glance</h3><div class="drawer-grid"><div><label>CURRENT STAGE</label><strong>${safe(c.stage)}</strong></div><div><label>OWNER</label><strong>${safe(c.owner)}</strong></div><div><label>BOROUGH</label><strong>${safe(c.borough)}</strong></div><div><label>FAMILY LANGUAGE</label><strong>${safe(c.language)}</strong></div></div><div class="drawer-callout"><strong>Current focus</strong><p>${safe(focus)}</p></div></div><div class="drawer-section"><h3>Intake pathway</h3><div class="drawer-stage">${stages.map((s,i)=>`<span class="${i<idx?'done':i===idx?'current':''}">${i<idx?'✓ ':''}${safe(s)}</span>`).join('')}</div></div><p class="page-subtitle">Synthetic snapshot. No live records are connected.</p>`;$('#modal-backdrop').hidden=false;$('#detail-drawer').classList.add('is-open');$('#detail-drawer').setAttribute('aria-hidden','false');$('#drawer-close').focus()}
function closeQuick(){$('#modal-backdrop').hidden=true;$('#detail-drawer').classList.remove('is-open');$('#detail-drawer').setAttribute('aria-hidden','true')}
function cards(groups){return groups.map(g=>`<article class="record-card"><h3>${safe(g.title)}</h3><dl class="record-fields">${g.fields.map(([k,v])=>`<div><dt>${safe(k)}</dt><dd>${safe(v)}</dd></div>`).join('')}</dl>${g.checks?`<div class="record-checks"><h4>Six-point review</h4><div>${g.checks.map(([label,checked])=>`<span class="${checked?'is-checked':'is-unchecked'}">${checked?'✓':'○'} ${safe(label)}</span>`).join('')}</div></div>`:''}${g.note?`<p class="record-note">${safe(g.note)}</p>`:''}</article>`).join('')}
function templateOptions(c){
 const options=items=>items.map(t=>`<option value="${safe(t.id)}" ${state.template===t.id?'selected':''}>${safe(t.name)} (${safe(t.ch)})</option>`).join('');
 const local=messageTemplates.filter(t=>t.lang===c.language);
 const english=messageTemplates.filter(t=>t.lang==='English'&&c.language!=='English');
 return `<option value="">Choose a template…</option>${local.length?`<optgroup label="${safe(c.language)}">${options(local)}</optgroup>`:''}${english.length?`<optgroup label="English">${options(english)}</optgroup>`:''}`;
}
function conversationView(c,d){
 const messages=[...d.conversation,...demoReplies.filter(message=>message.id===c.id)];
 const thread=messages.map(message=>`<article class="message-card ${message.direction==='Inbound'?'is-inbound':'is-outbound'}${message.demo?' is-demo':''}"><div class="message-head"><span class="message-channel">${safe(message.channel)}</span><span>${safe(message.party)}</span><span>· ${safe(message.sender)}</span></div>${message.subject?`<h3>${safe(message.subject)}</h3>`:''}<p>${safe(message.body)}</p><div class="message-foot"><time>${safe(message.when)}</time><span>${safe(message.status)}</span></div></article>`).join('');
 return `<section class="conversation-shell"><div class="conversation-head"><div><h3>Conversation</h3><p>Messages from the family and vendors appear on the left. Outgoing messages appear on the right.</p></div><button type="button" class="respond-button" id="respond-button">Respond</button></div><div class="record-note">Source messages are synthetic. Replies you add here stay in this browser; no email or SMS is sent.</div><div class="message-thread" role="log" aria-label="Case conversation">${thread||'<p class="conversation-empty">No messages on this case yet.</p>'}</div></section>`;
}
function replyContent(c,d){
 const source=sourceCases[c.id],messages=[...d.conversation,...demoReplies.filter(message=>message.id===c.id)],latest=messages.at(-1);
 const recent=latest?`<div class="reply-latest"><p class="eyebrow">LATEST MESSAGE · ${safe(latest.channel)} · ${safe(latest.when)}</p><strong>${safe(latest.party)} · ${safe(latest.sender)}</strong><p>${safe(latest.body)}</p></div>`:'<p class="reply-latest">No messages on this case yet.</p>';
 return `<header class="reply-head"><div><p class="eyebrow">LOCAL DEMO REPLY</p><h2 id="reply-title">Respond to ${safe(c.name)}</h2><strong class="reply-case-id">${safe(c.id)}</strong></div><button type="button" class="icon-button" id="reply-close" aria-label="Close response window">×</button></header><div class="reply-body">${recent}<div class="conversation-compose"><div class="compose-grid"><div class="compose-channel"><span>Channel</span><div class="channel-switch" role="group" aria-label="Message channel"><button type="button" class="is-active" aria-pressed="true">Email</button><button type="button" disabled title="SMS needs a connected vendor">SMS</button></div></div><label>Template<select id="compose-template">${templateOptions(c)}</select></label><label>To<select id="compose-to"><option value="Referring contact" ${state.recipient==='Referring contact'?'selected':''}>Referring contact (${safe(source.contact)})</option><option value="Family" ${state.recipient==='Family'?'selected':''}>Family (${safe(source.parent)})</option><option value="Medical vendor" ${state.recipient==='Medical vendor'?'selected':''}>Medical vendor</option><option value="Training agency" ${state.recipient==='Training agency'?'selected':''}>Training agency</option></select></label></div><p class="compose-hint">Family language: ${safe(c.language)}. ${safe(c.language)} templates appear first. SMS is history only in this demo.</p><label class="compose-subject">Subject<input id="compose-subject" type="text" value="${safe(state.subject)}" placeholder="Email subject"></label><label class="compose-message">Message<textarea id="compose-message" rows="5" placeholder="Write a message, or choose a template above and edit it before saving.">${safe(state.draft)}</textarea></label><div class="compose-actions"><button type="button" class="compose-send" id="compose-send">Send</button><button type="button" class="compose-clear" id="compose-clear">Clear</button><small>Demo only. This adds a local message to the thread; nothing is transmitted.</small></div></div></div>`;
}
function openReply(){const c=cases.find(x=>x.id===state.caseId);if(!c)return;$('#reply-content').innerHTML=replyContent(c,detailedCases[c.id]);$('#reply-backdrop').hidden=false;$('#reply-modal').classList.add('is-open');$('#reply-modal').setAttribute('aria-hidden','false');$('#compose-message').focus()}
function closeReply(){if(!$('#reply-modal').classList.contains('is-open'))return;$('#reply-backdrop').hidden=true;$('#reply-modal').classList.remove('is-open');$('#reply-modal').setAttribute('aria-hidden','true');$('#respond-button')?.focus()}
function renderFull(){
 const c=cases.find(x=>x.id===state.caseId);if(!c)return;
 const d=detailedCases[c.id],idx=stages.indexOf(c.stage);
 $('#full-title').textContent=c.name;
 $('#full-subtitle').innerHTML=`<strong class="full-case-id">${safe(c.id)}</strong><span>${safe(c.source)} · ${safe(c.owner)} · ${safe(c.type)}</span>`;
 $('#full-path').innerHTML=stages.map((s,i)=>`<span class="${i<idx?'done':i===idx?'current':''}">${i<idx?'✓ ':''}${safe(s)}</span>`).join('');
 $('#full-tabs').innerHTML=detailTabs.map((t,i)=>`<button role="tab" data-detail-tab="${i}" aria-selected="${i===state.tab}" class="${i===state.tab?'is-active':''}">${safe(t)}</button>`).join('');
 const area=$('#full-body');
 switch(state.tab){
  case 0:area.innerHTML=cards(d.summary);break;
  case 1:area.innerHTML=cards(d.services);break;
  case 2:area.innerHTML=cards(d.medical);break;
  case 3:area.innerHTML=`<article class="record-card record-wide"><h3>Documents in the source demo</h3><p class="record-note">Reference filenames only. No files are connected or downloadable here.</p>${d.documents.length?`<div class="record-table-wrap"><table class="record-table"><thead><tr><th>Name</th><th>Written by</th><th>Modified</th><th>Size</th></tr></thead><tbody>${d.documents.map(row=>`<tr>${row.map(v=>`<td>${safe(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`:'<p class="record-empty">Nothing filed yet. The generated packet, signed order and visit notes appear as the case progresses.</p>'}</article>`;break;
  case 4:area.innerHTML=conversationView(c,d);break;
  case 5:area.innerHTML=`<div class="record-note record-note-wide">Source history. Local board moves do not rewrite these historical events.</div><ol class="record-timeline">${d.timeline.map(([e,w])=>`<li><strong>${safe(e)}</strong><small>${safe(w)}</small></li>`).join('')}</ol>`;break;
  case 6:area.innerHTML=`<article class="record-card record-wide"><h3>Internal notes</h3><p>${safe(d.notes||'No note content was supplied for this case.')}</p><p class="record-note">The source marks this field as intake-team only. This static demo has no login or access controls, so no private notes are stored here.</p></article>`;
 }
 area.scrollTop=0;
}
function openFull(id){if(!cases.some(c=>c.id===id))return;state.lastFocus=$('#detail-drawer').contains(document.activeElement)?state.quickOrigin:document.activeElement;closeQuick();state.caseId=id;state.tab=0;state.draft='';state.subject='';state.recipient='Referring contact';state.template='';renderFull();$('#full-backdrop').hidden=false;$('#full-modal').classList.add('is-open');$('#full-modal').setAttribute('aria-hidden','false');document.body.classList.add('modal-open');$('#full-close').focus()}
function closeFull(){if(!state.caseId)return;closeReply();state.caseId=null;$('#full-backdrop').hidden=true;$('#full-modal').classList.remove('is-open');$('#full-modal').setAttribute('aria-hidden','true');document.body.classList.remove('modal-open');if(state.lastFocus?.isConnected)state.lastFocus.focus()}
function renderOverview(){const q=queues();for(const [k,n] of Object.entries({all:q.all.length,active:q.active.length,exceptions:q.exceptions.length,holds:q.holds.length,followups:q.followups.length,ready:q.ready.length,certification:q.certification.length}))$('#nav-'+k).textContent=n;$('#hero-followups').textContent=q.followups.length+' follow-ups';$('#hero-ready').textContent=q.ready.length+(q.ready.length===1?' case':' cases');$('#hero-active').innerHTML=q.active.length+'<span>/'+q.all.length+'</span>';$('#hero-ready-badge').textContent=String(q.ready.length).padStart(2,'0')+' READY';for(const [k,n] of Object.entries({active:q.active.length,exceptions:q.exceptions.length,holds:q.holds.length,ready:q.ready.length}))$('#metric-'+k).textContent=n;$('.attention-count').textContent=q.followups.length+' DUE';$('#attention-list').innerHTML=q.followups.map(c=>`<button class="attention-row" data-case="${safe(c.id)}"><span class="initials">${initials(c.name)}</span><span class="attention-main"><strong>${safe(c.name)}</strong><small>${safe(c.stage)} · ${safe(c.source)}</small></span><span class="attention-days">${c.days}d ↗</span></button>`).join('')||'<p class="record-empty">No follow-ups are due.</p>';const ready=q.ready[0];$('#ready-feature').innerHTML=ready?`<div class="ready-feature"><span class="initials">${initials(ready.name)}</span><div><h4>${safe(ready.name)}</h4><p>${safe(ready.id)} · ${safe(ready.owner)}</p></div><button data-case-full="${safe(ready.id)}">Full details ↗</button></div>`:'<p class="record-empty">No cases currently await intake review.</p>';$('#blocker-list').innerHTML='<div class="blocker-list">'+q.exceptions.filter(c=>c.exceptionKind==='Arrival blocker').map(c=>`<button class="blocker-row" data-case="${safe(c.id)}"><span class="blocker-dot"></span><strong>${safe(c.name)}</strong><span>${safe(c.exception)} ↗</span></button>`).join('')+'</div>'}
function drawCharts(){state.charts.forEach(ch=>ch.destroy());state.charts=[];if(!window.Chart){$$('.chart-fallback').forEach(el=>el.hidden=false);return}const style=getComputedStyle(document.documentElement),color=k=>style.getPropertyValue(k).trim();const common={responsive:true,maintainAspectRatio:false,scales:{x:{grid:{display:false},ticks:{color:color('--muted'),font:{family:color('--font-main'),size:10},maxRotation:0}},y:{beginAtZero:true,ticks:{stepSize:1,color:color('--muted'),font:{size:10}},grid:{color:color('--line')},border:{display:false}}}};state.charts.push(new Chart($('#stage-chart'),{type:'bar',data:{labels:['Referral','Eligibility','Family','Medical','Signed','Ready','Sent'],datasets:[{data:stages.map(s=>cases.filter(c=>c.stage===s).length),backgroundColor:stages.map((_,i)=>i===0?color('--primary'):i===5?color('--teal'):color('--powder')),borderRadius:7,maxBarThickness:40}]},options:{...common,plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>ctx.parsed.y+' cases'}}}}}));state.charts.push(new Chart($('#momentum-chart'),{type:'line',data:{labels:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],datasets:[{label:'Referrals',data:[2,3,2,4,3,5,4],borderColor:color('--primary-emphasis'),backgroundColor:color('--primary-emphasis'),tension:.4,pointRadius:4,borderWidth:3},{label:'Stage progressions',data:[1,2,3,2,4,3,5],borderColor:color('--teal-emphasis'),backgroundColor:color('--teal-emphasis'),tension:.4,pointRadius:4,borderWidth:3}]},options:{...common,plugins:{legend:{display:true,position:'bottom',labels:{color:color('--muted'),usePointStyle:true,pointStyle:'circle',boxWidth:7,font:{family:color('--font-main'),size:10}}}}}}))}
let drag=null;
function dragStart(e){if(e.button!==0&&e.pointerType==='mouse')return;const h=e.target.closest('[data-drag]');if(!h)return;const card=h.closest('.board-card');drag={id:h.dataset.drag,card,startX:e.clientX,startY:e.clientY,rect:card.getBoundingClientRect(),ghost:null,target:null};h.setPointerCapture?.(e.pointerId);e.preventDefault()}
function dragMove(e){if(!drag)return;const d=drag;if(!d.ghost&&Math.hypot(e.clientX-d.startX,e.clientY-d.startY)<5)return;if(!d.ghost){d.ghost=d.card.cloneNode(true);d.ghost.classList.add('drag-ghost');Object.assign(d.ghost.style,{left:d.rect.left+'px',top:d.rect.top+'px',width:d.rect.width+'px',height:d.rect.height+'px'});document.body.append(d.ghost);d.card.classList.add('drag-source')}d.ghost.style.left=d.rect.left+e.clientX-d.startX+'px';d.ghost.style.top=d.rect.top+e.clientY-d.startY+'px';$$('.board-column').forEach(x=>x.classList.remove('drag-over'));const col=document.elementFromPoint(e.clientX,e.clientY)?.closest('.board-column');d.target=col?.dataset.stage??null;if(col)col.classList.add('drag-over');const board=$('#board'),r=board.getBoundingClientRect();if(e.clientX>r.right-35)board.scrollLeft+=16;if(e.clientX<r.left+35)board.scrollLeft-=16}
function dragEnd(e){if(!drag)return;const d=drag;drag=null;$$('.board-column').forEach(x=>x.classList.remove('drag-over'));if(!d.ghost)return;const c=cases.find(x=>x.id===d.id),result=d.target?checkMove(c,d.target,cases,stages):{ok:false,message:'Drop into a forward stage with space.'};d.ghost.classList.add('drag-returning');if(result.ok){d.ghost.style.opacity='0';d.ghost.style.transform='scale(.95)';setTimeout(()=>d.ghost.remove(),230);moveCase(d.id,d.target)}else{d.ghost.style.left=d.rect.left+'px';d.ghost.style.top=d.rect.top+'px';setTimeout(()=>{d.ghost.remove();d.card.classList.remove('drag-source')},240);showToast(result.message)}e.preventDefault()}
function init(){restoreMoves();$('#today-date').textContent=new Intl.DateTimeFormat('en-US',{weekday:'short',month:'short',day:'numeric'}).format(new Date());$('#stage-filter').insertAdjacentHTML('beforeend',stages.map(s=>`<option value="${safe(s)}">${safe(s)}</option>`).join(''));setTheme(getStorage('americare-pediatric-theme')==='dark'?'dark':'light');setSidebar(getStorage(sidebarKey)==='collapsed');if(matchMedia('(max-width:760px)').matches)setMobileMenu(false);renderOverview();document.addEventListener('click',e=>{const theme=e.target.closest('#theme-toggle,#theme-toggle-side');if(theme){setTheme(document.documentElement.dataset.theme==='dark'?'light':'dark');return}const full=e.target.closest('[data-case-full]');if(full){openFull(full.dataset.caseFull);return}const quick=e.target.closest('[data-case-quick]');if(quick){openQuick(quick.dataset.caseQuick);return}const tab=e.target.closest('[data-detail-tab]');if(tab){state.tab=Number(tab.dataset.detailTab);renderFull();$('#full-tabs button:nth-child('+(state.tab+1)+')').focus();return}if(e.target.closest('#reset-board')){resetBoard();return}if(e.target.closest('#full-close,#full-backdrop')){closeFull();return}if(e.target.closest('#drawer-close,#modal-backdrop')){closeQuick();return}if(e.target.closest('#menu-button')){if(matchMedia('(max-width:760px)').matches)setMobileMenu(!$('#sidebar').classList.contains('is-open'));else setSidebar(!$('.app-shell').classList.contains('sidebar-collapsed'));return}const nav=e.target.closest('[data-view],[data-jump]');if(nav){navigate(nav.dataset.view??nav.dataset.jump);return}const c=e.target.closest('[data-case]');if(c){openQuick(c.dataset.case);return}if(e.target.closest('#overview-all'))navigate('all');if(e.target.closest('#hero-focus'))navigate('followups')});$('#case-search').addEventListener('input',e=>{state.search=e.target.value;renderList()});$('#stage-filter').addEventListener('change',e=>{state.stage=e.target.value;renderList()});$('#board').addEventListener('change',e=>{const s=e.target.closest('[data-move]');if(s?.value){moveCase(s.dataset.move,s.value);if(s.isConnected)s.value=''}});$('#board').addEventListener('pointerdown',dragStart);window.addEventListener('pointermove',dragMove);window.addEventListener('pointerup',dragEnd);window.addEventListener('pointercancel',e=>{if(drag)drag.target=null;dragEnd(e)});document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeFull();closeQuick();if(matchMedia('(max-width:760px)').matches)setMobileMenu(false)}if(e.key==='Tab'&&state.caseId){const nodes=$$('button,select,[href],input,textarea,[tabindex="0"]',$('#full-modal')).filter(n=>!n.disabled&&n.offsetParent!==null);if(!nodes.length)return;const first=nodes[0],last=nodes.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});window.addEventListener('hashchange',()=>navigate(location.hash.slice(1)||'overview'));window.addEventListener('pagehide',()=>undoWindow.commit({dust:false}));navigate(location.hash.slice(1)||'overview')}
function templateDate(value){return value?new Intl.DateTimeFormat('en-US',{timeZone:'UTC',month:'short',day:'numeric',year:'numeric'}).format(new Date(`${value}T12:00:00Z`)):''}
function applyMessageTemplate(id){
 const template=messageTemplates.find(item=>item.id===id),source=sourceCases[state.caseId],caseView=cases.find(item=>item.id===state.caseId);
 if(!template||!source||!caseView)return;
 const holdDays=source.aideTraining?17:source.discharge?11:0;
 const holdDate=holdDays?new Date(Date.UTC(2026,7,27-holdDays)).toISOString().slice(0,10):'';
 const values={child:source.child,parent:source.parent,rep:caseView.owner==='Unassigned'?'Brigit Wieber':caseView.owner,source:source.source,contact:source.contact,stage:caseView.stage,tvdate:templateDate(source.telehealthScheduledDate)||'the scheduled date',aide:source.aideName||'the family aide',holdsince:templateDate(holdDate),holddays:String(holdDays),packetsent:templateDate(source.packetSentDate),booklink:'care-mgmt.example/book'};
 const fill=value=>String(value||'').replace(/\{(\w+)\}/g,(_,key)=>values[key]??'');
 state.template=id;state.draft=fill(template.body);state.subject=fill(template.subject);
 $('#compose-message').value=state.draft;$('#compose-subject').value=state.subject;
 if(template.ch==='SMS')showToast('SMS template loaded as an email draft. SMS sending is unavailable in this demo.');
 $('#compose-message').focus();
}
function sendDemoReply(){
 const body=$('#compose-message')?.value.trim();
 if(!body){showToast('Write a message before saving a demo reply.');$('#compose-message')?.focus();return}
 const subject=$('#compose-subject')?.value.trim()||'';
 const when=new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit'}).format(new Date());
 demoReplies.push({id:state.caseId,direction:'Outbound',channel:'Email',party:state.recipient,sender:'You · demo',subject,body,status:'Saved locally · not sent',when,demo:true});
 saveReplies();state.draft='';state.subject='';state.template='';
 renderFull();const area=$('#full-body');area.scrollTop=area.scrollHeight;
 const c=cases.find(item=>item.id===state.caseId);$('#reply-content').innerHTML=replyContent(c,detailedCases[c.id]);
 $('#compose-message')?.focus();showToast('Demo reply added to this conversation. Nothing was sent.');
}
init();
$('#full-body').addEventListener('click',event=>{
 if(event.target.closest('#respond-button'))openReply();
});
$('#reply-modal').addEventListener('click',event=>{
 if(event.target.closest('#reply-close')){closeReply();return}
 if(event.target.closest('#compose-send')){sendDemoReply();return}
 if(event.target.closest('#compose-clear')){state.draft='';state.subject='';state.template='';$('#compose-message').value='';$('#compose-subject').value='';$('#compose-template').value='';$('#compose-message').focus()}
});
$('#reply-backdrop').addEventListener('click',closeReply);
$('#reply-modal').addEventListener('change',event=>{
 if(event.target.id==='compose-template')applyMessageTemplate(event.target.value);
 if(event.target.id==='compose-to')state.recipient=event.target.value;
});
$('#reply-modal').addEventListener('input',event=>{
 if(event.target.id==='compose-message')state.draft=event.target.value;
 if(event.target.id==='compose-subject')state.subject=event.target.value;
});
document.addEventListener('keydown',event=>{
 if(!$('#reply-modal').classList.contains('is-open'))return;
 if(event.key==='Escape'){event.preventDefault();event.stopPropagation();closeReply();return}
 if(event.key!=='Tab')return;
 const nodes=$$('button,select,input,textarea,[tabindex="0"]',$('#reply-modal')).filter(node=>!node.disabled&&node.offsetParent!==null);
 if(!nodes.length)return;
 const first=nodes[0],last=nodes.at(-1);
 if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
 else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
 event.stopPropagation();
},true);



