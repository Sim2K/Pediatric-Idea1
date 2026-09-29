// Read-only synthetic records transcribed from Details/026–038.
export const detailTabs = ['Summary','Services and aide','Medical and DE','Documents','Conversation','Timeline','Internal notes'];
const commonServices = [
  ['Services in the home already','No'],['Services requested','Aide'],
  ['Discharge from another CHHA required','No'],['Hours requested','25 per week'],['Above-40 approval','N/A']
];
const commonEligibility = [
  ['Code 95 present','Yes'],['H78 on record','No'],['Third-party insurance','No'],
  ['Third-party carrier','—']
];

export const detailedCases = {
  'CAS-00412': {
    summary: [
      {title:'Case and family',fields:[['Case origin','New referral'],['Date of birth','Mar 14, 2019'],['Medicaid ID','AB41207Z'],['Age at referral','7 years'],['Borough / county','Brooklyn'],['Family language','Spanish'],['Address','1247 Ocean Pkwy, Apt 3B'],['Referral received','Aug 13, 2026'],['Parent name','Rosa Alvarez'],['Relationship to child','Mother'],['Parent phone','(347) 555-0182'],['Parent email','—']]},
      {title:'Referral',fields:[['Referral source','Z Best Home Care'],['Referral source type','LHCSA'],['Referring contact','Elisa Roth'],['Contact email','eroth@zbesthc.example'],['Always copied on updates','Z Best intake desk · peds@zbesthc.example']],note:'Duplicate check clear against referrals seen in this system. Home Care Homebase was not checked.'},
      {title:'Eligibility',fields:[['Medicaid status as submitted','Managed Medicaid'],['Medicaid status verified','Managed'],...commonEligibility,['Verified by','Mary Noto'],['Verified on','Aug 14, 2026'],['Case type (provisional)','DE'],['Case type','DE']],checks:['OPWDD eligibility','Pediatric eligibility','Insurance type','Requested services','Geographic coverage','Aide to train'],note:'Routing: Spanish narrowed the pool to Spanish speakers. Mary Noto had the fewest open cases at that moment.'}
    ],
    services: [
      {title:'Services',fields:commonServices,note:'Hours requested is informational in the source workflow. Above 40 shows a notice and stops there.'},
      {title:'Aide',fields:[['Aide arrangement','Train own'],['Aide in training','No'],['Aide name','Ines Batista'],['Relationship to child','Grandparent'],['Training placement','—'],['Weekly schedule','Mon–Fri 3pm–8pm']],note:'No active holds. Awaiting LHCSA staffing is tracked as an exception, not a hold.'}
    ],
    medical: [
      {title:'Medical',fields:[['Medical vendor','Suffolk Medical Group'],['Packet generated','Yes'],['Packet sent','Aug 23, 2026'],['Telehealth scheduled','Aug 27, 2026'],['Telehealth completed','—'],['Signed medical returned','—'],['Visit notes received','—']],note:'The packet uses the client order form. The mailbox parser sets telehealth scheduled from a vendor reply; uncertain replies go to review.'},
      {title:'Disenrollment',fields:[['DE submitted','Aug 16, 2026'],['DE confirmed','—'],['H78 on record','No'],['Target conversion date','Sep 1, 2026'],['Days remaining in source snapshot','5']],note:'The source calls for a named family touchpoint every two weeks while the conversion date is in the future.'}
    ],
    documents: [['Physician order packet - Kayden_Alvarez.pdf','Flow 16, generated','Aug 23, 2026','142 KB']],
    conversation: [
      ['Email · Referring contact','Referral received - Kayden Alvarez','We have Kayden Alvarez’s referral. Mary Noto is on it and will come back to you when the family has been reached.','Aug 13, 2026 9:14 AM · Delivered'],
      ['SMS · Family','First contact','Hi Rosa, this is Mary Noto from Care Management. Elisa Roth at Z Best Home Care sent us Kayden’s referral. I will call you shortly, or you can book a time here: care-mgmt.example/book','Aug 14, 2026 1:13 PM · Delivered'],
      ['SMS · Rosa Alvarez','Reply','Yes hello, after 4pm is best for me. Thank you','Aug 15, 2026 3:12 PM · Received'],
      ['Email · Medical vendor','Kayden Alvarez - physician order packet','Attached is the completed order form for Kayden Alvarez, Mar 14, 2019, Medicaid AB41207Z. Please schedule the televisit and return the signed order.','Aug 23, 2026 10:04 AM · Delivered'],
      ['Email · Suffolk Medical Group','RE: Kayden Alvarez - physician order packet','Scheduled for Aug 27, 2026 at 6:15 PM. Parent confirmed.','Aug 25, 2026 11:02 AM · Received'],
      ['SMS · Family','Televisit preparation','Hi Rosa, Kayden’s televisit with the doctor is Aug 27, 2026. Please save the number they call from, unknown numbers are often blocked and the visit fails.','Aug 25, 2026 12:02 PM · Delivered']
    ],
    timeline: [
      ['Referral received from Z Best Home Care, submitted by Elisa Roth.','System · Aug 13, 2026 8:38 AM'],
      ['Duplicate check on Medicaid ID AB41207Z came back clear against referrals this system has seen.','System · Aug 13, 2026 8:38 AM'],
      ['Return obligation recorded against Z Best Home Care.','System · Aug 13, 2026 8:38 AM'],
      ['Reported managed Medicaid, so provisionally a disenrollment case.','Routing · Aug 13, 2026 8:38 AM'],
      ['Spanish language and lowest open caseload routed the case to Mary Noto.','Routing · Aug 13, 2026 8:38 AM'],
      ['Medicaid status awaited ePACES verification by Mary Noto.','Routing · Aug 13, 2026 8:38 AM'],
      ['Eligibility verified on ePACES: Managed Medicaid, Code 95 present.','System · Aug 14, 2026 11:31 AM'],
      ['Moved to Family contacted; update 2 of 5 sent to Elisa Roth.','Stage change · Aug 15, 2026 2:24 PM'],
      ['Packet generated and emailed to Suffolk Medical Group; saved to Documents.','System · Aug 23, 2026 10:28 AM'],
      ['Mailbox parser set Telehealth scheduled; update 3 of 5 sent to Elisa Roth.','System · Aug 25, 2026 11:14 AM']
    ]
  },
  'CAS-00418': {
    summary: [
      {title:'Case and family',fields:[['Case origin','New referral'],['Date of birth','Nov 2, 2016'],['Medicaid ID','BC41883Y'],['Age at referral','9 years'],['Borough / county','Brooklyn'],['Family language','Yiddish'],['Address','842 E 21st St'],['Referral received','Aug 1, 2026'],['Parent name','Miriam Klein'],['Relationship to child','Mother'],['Parent phone','(718) 555-0347'],['Parent email','mklein@example.com']]},
      {title:'Referral',fields:[['Referral source','High Standard Home Care'],['Referral source type','LHCSA'],['Referring contact','John Reyes'],['Contact email','jreyes@highstandardhc.example'],['Always copied on updates','High Standard intake · intake@highstandardhc.example']],note:'Duplicate check clear against referrals seen in this system. Home Care Homebase was not checked.'},
      {title:'Eligibility',fields:[['Medicaid status as submitted','Straight Medicaid'],['Medicaid status verified','Straight'],...commonEligibility,['Verified by','Justin Delluomo'],['Verified on','Aug 2, 2026'],['Case type (provisional)','Straight'],['Case type','Straight']],checks:['OPWDD eligibility','Pediatric eligibility','Insurance type','Requested services','Geographic coverage','Aide to train'],note:'Justin Delluomo had the fewest open cases at routing. The active aide-training hold blocks progression beyond Signed medical returned in the source workflow.'}
    ],
    services: [
      {title:'Services',fields:commonServices,note:'Hours requested is informational in the source workflow. Above 40 shows a notice and stops there.'},
      {title:'Aide',fields:[['Aide arrangement','Train own'],['Aide in training','Yes'],['Aide name','Chana Weiss'],['Relationship to child','Aunt or uncle'],['Training placement','Anchor Home Healthcare'],['Weekly schedule','Sun–Thu 4pm–9pm']],note:'Active hold: aide in training for 17 days in the source snapshot. Chana Weiss is training at Anchor Home Healthcare.'}
    ],
    medical: [
      {title:'Medical',fields:[['Medical vendor','Path Care Medical'],['Packet generated','Yes'],['Packet sent','Aug 11, 2026'],['Telehealth scheduled','Aug 17, 2026'],['Telehealth completed','Aug 16, 2026'],['Signed medical returned','Aug 18, 2026'],['Visit notes received','Aug 18, 2026']],note:'The source lists a completion date before the scheduled date; both values are shown as supplied. The packet uses the client order form and vendor replies are parsed for scheduling.'},
      {title:'Disenrollment',fields:[['Status','Not a disenrollment case']]}
    ],
    documents: [
      ['Physician order packet - Devorah_Klein.pdf','Flow 16, generated','Aug 11, 2026','142 KB'],
      ['Signed order - Devorah_Klein.pdf','Mailbox parser, vendor reply','Aug 18, 2026','318 KB'],
      ['Televisit notes - Devorah_Klein.pdf','Mailbox parser, vendor reply','Aug 18, 2026','96 KB']
    ],
    conversation: [
      ['Email · Referring contact','Referral received - Devorah Klein','We have Devorah Klein’s referral. Justin Delluomo is on it and will come back to you when the family has been reached.','Aug 1, 2026 9:26 AM · Delivered'],
      ['SMS · Family','First contact','Hi Miriam, this is Justin Delluomo from Care Management. John Reyes at High Standard Home Care sent us Devorah’s referral. I will call you shortly, or you can book a time here: care-mgmt.example/book','Aug 2, 2026 1:25 PM · Delivered'],
      ['SMS · Miriam Klein','Reply','Yes hello, after 4pm is best for me. Thank you','Aug 3, 2026 3:24 PM · Received'],
      ['Email · Medical vendor','Devorah Klein - physician order packet','Attached is the completed order form for Devorah Klein, Nov 2, 2016, Medicaid BC41883Y. Please schedule the televisit and return the signed order.','Aug 11, 2026 10:16 AM · Delivered'],
      ['Email · Path Care Medical','RE: Devorah Klein - physician order packet','Scheduled for Aug 17, 2026 at 6:15 PM. Parent confirmed.','Aug 15, 2026 11:12 AM · Received'],
      ['SMS · Family','Televisit preparation','Hi Miriam, Devorah’s televisit with the doctor is Aug 17, 2026. Please save the number they call from, unknown numbers are often blocked and the visit fails.','Aug 15, 2026 12:12 PM · Delivered'],
      ['Email · Path Care Medical','Signed order + visit notes','Signed order attached, visit notes in the second attachment.','Aug 18, 2026 10:09 AM · Received'],
      ['Email · Training agency','Aide training status','Chana Weiss has been in training since Aug 10, 2026. Can you tell me where the background check and fingerprinting stand? The case cannot move until training completes.','Aug 21, 2026 9:06 AM · Delivered']
    ],
    timeline: [
      ['Referral received from High Standard Home Care, submitted by John Reyes.','System · Aug 1, 2026 8:02 AM'],
      ['Duplicate check on Medicaid ID BC41883Y came back clear against referrals this system has seen.','System · Aug 1, 2026 8:02 AM'],
      ['Return obligation recorded against High Standard Home Care.','System · Aug 1, 2026 8:02 AM'],
      ['Reported straight Medicaid, so provisionally a straight Medicaid case.','Routing · Aug 1, 2026 8:02 AM'],
      ['Fewest open cases routed this case to Justin Delluomo.','Routing · Aug 1, 2026 8:02 AM'],
      ['Medicaid status awaited ePACES verification by Justin Delluomo.','Routing · Aug 1, 2026 8:02 AM'],
      ['Eligibility verified on ePACES: Straight Medicaid, Code 95 present.','System · Aug 2, 2026 11:55 AM'],
      ['Moved to Family contacted; update 2 of 5 sent to John Reyes.','Stage change · Aug 3, 2026 2:48 PM'],
      ['Hold raised: Chana Weiss is in aide training at Anchor Home Healthcare.','Hold · Aug 10, 2026 9:59 AM'],
      ['Packet generated and emailed to Path Care Medical; saved to Documents.','System · Aug 11, 2026 10:52 AM'],
      ['Mailbox parser set Telehealth scheduled; update 3 of 5 sent to John Reyes.','System · Aug 15, 2026 11:24 AM'],
      ['Signed medical returned and saved to Documents; update 4 of 5 sent to John Reyes.','System · Aug 18, 2026 10:03 AM']
    ]
  }
};
