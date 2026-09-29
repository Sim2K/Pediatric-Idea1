// Synthetic demonstration data transcribed from the supplied intake mockups.
export const cases = [
  {id:'CAS-00421',name:'Marcus Whitfield',borough:'Bronx',language:'English',source:'Anchor Home Healthcare',type:'Straight Medicaid',owner:'Elaine Walsh',stage:'Family contacted',days:11,totalDays:19,hold:'Discharge from other agency required',holdDays:11,follow:true},
  {id:'CAS-00418',name:'Devorah Klein',borough:'Brooklyn',language:'Yiddish',source:'High Standard Home Care',type:'Straight Medicaid',owner:'Justin Delluomo',stage:'Signed medical returned',days:9,totalDays:26,hold:'Aide in training',holdDays:17,follow:true},
  {id:'CAS-00437',name:'Tzvi Ehrenreich',borough:'Brooklyn',language:'Yiddish',source:'High Standard Home Care',type:'Disenrollment',owner:"Christine O'Donohue",stage:'Family contacted',days:8,totalDays:16,exception:'Awaiting LHCSA staffing confirmation',exceptionKind:'In-flight',follow:true},
  {id:'CAS-00427',name:'Sofia Duran',borough:'Bronx',language:'Spanish',source:'Gem Care Coordination',type:'No OPWDD cert',owner:'Unassigned',stage:'Eligibility reviewed',days:7,totalDays:8,cert:true,follow:true},
  {id:'CAS-00435',name:'Nina Adeyemi',borough:'Manhattan',language:'English',source:'Anchor Home Healthcare',type:'Straight Medicaid',owner:'Mary Noto',stage:'Sent to intake',days:6,totalDays:48,closed:true},
  {id:'CAS-00423',name:'Amelia Ferrand',borough:'Queens',language:'Creole',source:'Cottage Home Care Services',type:'Disenrollment',owner:'Patsy Locasto',stage:'Eligibility reviewed',days:5,totalDays:6,exception:'Third-party insurance requires confirmation',exceptionKind:'In-flight'},
  {id:'CAS-00431',name:'Jayden Pierre-Louis',borough:'Brooklyn',language:'Creole',source:'Cottage Home Care Services',type:'Not typed',owner:'Unassigned',stage:'Referral received',days:5,totalDays:5,exception:'Age ineligible',exceptionKind:'Arrival blocker'},
  {id:'CAS-00412',name:'Kayden Alvarez',borough:'Brooklyn',language:'Spanish',source:'Z Best Home Care',type:'Disenrollment',owner:'Mary Noto',stage:'Medical vendor',days:4,totalDays:14,follow:true,medical:'Telehealth scheduled for Aug 27'},
  {id:'CAS-00433',name:'Elena Marku',borough:'Brooklyn',language:'Other',source:'High Standard Home Care',type:'Not typed',owner:'Unassigned',stage:'Referral received',days:4,totalDays:4,exception:'Partial duplicate match',exceptionKind:'Arrival blocker'},
  {id:'CAS-00430',name:'Rivka Stern',borough:'Brooklyn',language:'Yiddish',source:'Marcy Fried',type:'Undetermined',owner:'Unassigned',stage:'Referral received',days:3,totalDays:3,exception:'Medicaid status not available',exceptionKind:'Arrival blocker'},
  {id:'CAS-00425',name:'Yosef Brander',borough:'Brooklyn',language:'Yiddish',source:'High Standard Home Care',type:'Straight, reported',owner:'Justin Delluomo',stage:'Referral received',days:2,totalDays:2},
  {id:'CAS-00429',name:'Liam Osei',borough:'Queens',language:'English',source:'Riverside Pediatrics',type:'Straight Medicaid',owner:"Christine O'Donohue",stage:'Ready for intake',days:2,totalDays:33,ready:true}
];

export const stages = ['Referral received','Eligibility reviewed','Family contacted','Medical vendor','Signed medical returned','Ready for intake','Sent to intake'];
