import LeadForm from "@/components/LeadForm";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center gap-8 px-6 py-16">
      <h1 className="text-2xl font-semibold">Tell us about your business</h1>
      <LeadForm />
    </main>
  );
}
