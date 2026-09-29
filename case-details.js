// Read-only records generated from the deployed synthetic pediatric intake demo.
import {sourceData} from './source-data.js';

export const detailTabs = ['Summary','Services and aide','Medical and DE','Documents','Conversation','Timeline','Internal notes'];
export const sourceCases = Object.fromEntries(sourceData.cases.map(c=>[c.id,c]));
export const messageTemplates = sourceData.templates;

const [year,month,date] = sourceData.snapshotDate.split('-').map(Number);
const snapshot = Date.UTC(year,month-1,date);
const dayFormat = new Intl.DateTimeFormat('en-US',{timeZone:'UTC',month:'short',day:'numeric',year:'numeric'});
const offsetDate = days => days == null ? '—' : dayFormat.format(new Date(snapshot-days*86400000));
const calendarDate = value => value ? dayFormat.format(new Date(`${value}T12:00:00Z`)) : '—';
const text = value => value == null || value === '' ? '—' : String(value);
const yesNo = value => value ? 'Yes' : 'No';
const knownBoolean = value => value == null ? '—' : yesNo(value);
const time = (days,hour,minute) => `${offsetDate(days)} ${hour%12||12}:${String(minute).padStart(2,'0')} ${hour>=12?'PM':'AM'}`;
const checkLabels = ['OPWDD eligibility','Pediatric eligibility','Insurance type','Requested services','Geographic coverage','Aide to train'];
const ageAtSnapshot = dob => Math.floor((snapshot-new Date(dob).getTime())/31557600000);
const field = (label,value) => [label,text(value)];

function summaryFor(c){
 const copied=c.extra.length?c.extra.map(item=>`${item.n} · ${item.e}`).join('; '):'Nobody else is copied on this case.';
 const summary=[
  {title:'Case and family',fields:[field('Case ID',c.id),field('Case origin','New referral'),field('Child name',c.child),field('Date of birth',c.dob),field('Medicaid ID',c.mid),field('Age at referral',`${ageAtSnapshot(c.dob)} years`),field('Borough / county',c.boro),field('Family language',c.lang),field('Address',c.addr),field('Referral received',calendarDate(c.receivedOn)),field('Parent name',c.parent),field('Relationship to child',c.prel),field('Parent phone',c.pphone),field('Parent email',c.pemail)]},
  {title:'Referral',fields:[field('Referral source',c.source),field('Referral source type',c.sourceType),field('Referring contact',c.contact),field('Contact email',c.cemail),field('Always copied on updates',copied),field('Duplicate check',c.dupe),field('Matched case',c.matched)],note:c.dupeNote||'Checked on the Medicaid ID against referrals this system has seen. Home Care Homebase was not checked.'},
  {title:'Eligibility',fields:[field('Medicaid status as submitted',c.submitted),field('Medicaid status verified',c.verified),field('Code 95 present',knownBoolean(c.code95)),field('H78 on record',c.verified?yesNo(c.h78):'—'),field('Verified by',c.verifiedBy),field('Verified on',c.verified?calendarDate(c.verifiedDate):'—'),field('Third-party insurance',c.verified?yesNo(c.tpl):'—'),field('Third-party carrier',c.tplCarrier),field('Case type (provisional)',c.prov),field('Case type',c.type)],checks:checkLabels.map((label,index)=>[label,Boolean(c.chk[index])])}
 ];
 if(c.exc.length)summary.push(...c.exc.map(item=>({title:`${item.k}: ${item.r}`,fields:[field('What needs attention',item.d),field('Raised',`${item.raised} days ago`)]})));
 if(c.aideTraining)summary.push({title:'Active hold',fields:[field('Reason','Aide in training'),field('Aide',c.aideName),field('Training agency',c.trainPlace),field('Held for','17 days')],note:'This case cannot advance past Signed medical returned until the hold clears.'});
 if(c.discharge)summary.push({title:'Active hold',fields:[field('Reason','Discharge from other agency required'),field('Agency',c.dischargeAgency),field('Agreed discharge date',calendarDate(c.dischargeDateLocal)),field('Held for','11 days')],note:'This case cannot advance past Signed medical returned until the hold clears.'});
 return summary;
}

function servicesFor(c){
 const services={title:'Services',fields:[field('Services in the home already',yesNo(c.existing)),field('Services requested',c.hours?'Aide':'—'),field('Existing services detail',c.existingDetail),field('Discharge from another CHHA required',yesNo(c.discharge)),field('Discharging agency',c.dischargeAgency),field('Agreed discharge date',calendarDate(c.dischargeDateLocal)),field('Hours requested',c.hours==null?'—':`${c.hours} per week`),field('Above-40 approval',c.above40)],note:'Hours requested is informational in the source workflow. Above 40 shows a notice and stops there.'};
 const aide={title:'Aide',fields:[field('Aide arrangement',c.aideArr),field('Aide in training',yesNo(c.aideTraining)),field('Aide name',c.aideName),field('Relationship to child',c.aideRel),field('Training placement',c.trainPlace),field('Weekly schedule',c.aideSched)],note:c.aideTraining?`${c.aideName} is training at ${c.trainPlace}. This is an active hold.`:c.discharge?`Discharge from ${c.dischargeAgency} is an active hold.`:'No active holds. Awaiting LHCSA staffing is tracked as an exception, not a hold.'};
 return [services,aide];
}

function medicalFor(c){
 const medical={title:'Medical',fields:[field('Medical vendor',c.medicalVendor),field('Packet generated',yesNo(c.packetSent != null)),field('Packet sent',calendarDate(c.packetSentDate)),field('Telehealth scheduled',calendarDate(c.telehealthScheduledDate)),field('Telehealth completed',calendarDate(c.telehealthCompletedDate)),field('Signed medical returned',calendarDate(c.signedDate)),field('Visit notes received',calendarDate(c.visitNotesDate))],note:'The packet uses the client order form. A vendor reply sets the telehealth schedule when it can be parsed.'};
 let de;
 if(c.type==='DE')de={title:'Disenrollment',fields:[field('DE submitted',calendarDate(c.deSubmittedDate)),field('DE confirmed',calendarDate(c.deConfirmedDate)),field('H78 on record',yesNo(c.h78)),field('Target conversion date',calendarDate(c.targetDate)),field('Days remaining',c.targetDate?Math.round((new Date(`${c.targetDate}T12:00:00Z`).getTime()-snapshot)/86400000):'—')],note:'The source shows remaining days until conversion and calls for a named family touchpoint every two weeks.'};
 else if(c.type==='NoCert')de={title:'Disenrollment',fields:[field('Status','Certification case. Code 95 is absent; this case is never sent to the disenrollment vendor.')]};
 else de={title:'Disenrollment',fields:[field('Status','Not a disenrollment case')]};
 return [medical,de];
}

function conversationFor(c){
 return c.msgs.map(message=>({
  direction:message.dir,
  channel:message.ch,
  party:message.party,
  sender:message.auto?'Automated':message.who,
  subject:message.subj,
  body:message.body,
  status:message.stat,
  when:time(message.d,message.h,message.d%40)
 }));
}

function timelineFor(c){
 return c.events.map(event=>[event.x,`${event.t} · ${time(event.d,event.h,(event.d*7)%60)}`]);
}

export const detailedCases=Object.fromEntries(sourceData.cases.map(c=>[c.id,{
 summary:summaryFor(c),
 services:servicesFor(c),
 medical:medicalFor(c),
 documents:c.documents.map(document=>[document.name,document.writtenBy,calendarDate(document.modifiedOn),document.size]),
 conversation:conversationFor(c),
 timeline:timelineFor(c),
 notes:c.notes
}]));
