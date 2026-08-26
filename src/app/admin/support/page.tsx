import { createClient } from "@/lib/supabase/server";
import { SupportTicketRepository } from "@/lib/repositories/support-ticket.repository";
import { TicketStatusForm } from "./ticket-status-form";

const STATUS_COLOR: Record<string, string> = {
  Open: "bg-danger-soft text-danger",
  InProgress: "bg-warning-soft text-warning",
  Resolved: "bg-success-soft text-success",
};

export default async function AdminSupportPage() {
  const supabase = await createClient();
  const tickets = await new SupportTicketRepository(supabase).findAll();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-2xl font-semibold text-navy dark:text-white">Support Tickets</h1>
      {tickets.length === 0 ? (
        <p className="text-sm text-slate-soft">No tickets yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {tickets.map((t) => {
            const person = t.students?.users?.persons;
            return (
              <div key={t.ticketid} className="rounded-md border border-mist bg-surface p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-ink">{t.subject}</p>
                    <p className="text-xs text-slate-soft">
                      {person ? `${person.first_name} ${person.last_name}` : "Student"} ·{" "}
                      {new Date(t.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`rounded-pill px-3 py-1 text-xs font-semibold ${STATUS_COLOR[t.status]}`}>
                    {t.status}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate">{t.message}</p>
                <TicketStatusForm ticketid={t.ticketid} currentStatus={t.status} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
