export const stageCapacity = Object.freeze({
  'Referral received': 6,
  'Eligibility reviewed': 3,
  'Family contacted': 3,
  'Medical vendor': 3,
  'Signed medical returned': 2,
  'Ready for intake': 2,
  'Sent to intake': 3
});

export function checkMove(item, destination, cohort, stages) {
  const from = stages.indexOf(item.stage);
  const to = stages.indexOf(destination);
  if (from < 0 || to < 0) return {ok:false,message:'That stage is unavailable.'};
  if (to <= from) return {ok:false,message:'Cases can only move forward to a later stage.'};
  const occupancy = cohort.filter(entry => entry.stage === destination).length;
  if (occupancy >= stageCapacity[destination]) return {ok:false,message:`${destination} is at capacity (${stageCapacity[destination]} cases). Choose another forward stage with space.`};
  return {ok:true,message:`${item.name} moved to ${destination}.`};
}
