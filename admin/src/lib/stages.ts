export const PIPELINE_STAGES = [
  "New Lead",
  "Appointment Booked",
  "Qualified",
  "Showed",
  "Disqualified",
  "No Show",
  "Pre-Scheduled",
  "Follow-Up",
  "Closed",
] as const;

export type PipelineStage = (typeof PIPELINE_STAGES)[number];
