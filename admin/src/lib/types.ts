export type Lead = {
  id: string;
  created_at: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  email: string | null;
  company_name: string | null;
  revenue_range: string | null;
  qualification_status: string | null;
  appointment_booked: boolean;
  appointment_datetime: string | null;
  pipeline_stage: string;
  closed_amount: number | null;
};
