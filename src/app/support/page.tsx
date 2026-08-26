import { createClient } from "@/lib/supabase/server";
import { SupportTicketRepository, type TicketStatus } from "@/lib/repositories/support-ticket.repository";
import { getCurrentStudentId } from "@/lib/auth/current-user";
import { CreateTicketForm } from "./create-ticket-form";
import { WarningIcon, InfoIcon, CheckIcon } from "@/components/icons/stat-icons";
import { EmptyState } from "@/components/ui/empty-state";

const STATUS_ICON: Record<TicketStatus, typeof WarningIcon> = {
  Open: WarningIcon,
  InProgress: InfoIcon,
  Resolved: CheckIcon,
};
const STATUS_LABEL: Record<TicketStatus, string> = {
  Open: "Open",
  InProgress: "In progress",
  Resolved: "Resolved",
};

export default async function SupportPage() {
  const studentid = await getCurrentStudentId();
  if (!studentid) return null;

  const supabase = await createClient();
  const tickets = await new SupportTicketRepository(supabase).findByStudent(studentid);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-navy dark:text-white">Support</h1>
        <p className="text-sm text-slate">Need help? Open a ticket and we'll follow up by email.</p>
      </div>

      <CreateTicketForm />

      <div className="flex flex-col gap-3">
        <h2 className="font-display text-lg font-semibold text-ink">Your tickets</h2>
        {tickets.length === 0 ? (
          <EmptyState icon={<CheckIcon size={28} />} title="No tickets yet" body="Nothing to report — that's a good thing." />
        ) : (
          tickets.map((t) => {
            const Icon = STATUS_ICON[t.status];
            return (
              <div key={t.ticketid} className="flex gap-3 rounded-lg border border-mist bg-surface p-4">
                <Icon size={20} className="mt-0.5 shrink-0" />
                <div className="flex-1">
                  <div className="flex items-baseline justify-between">
                    <p className="text-sm font-semibold text-ink">{t.subject}</p>
                    <span className="text-xs text-slate-soft">{new Date(t.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate">{t.message}</p>
                  <span className="mt-2 inline-block rounded-pill bg-mist px-2.5 py-0.5 text-xs font-medium text-slate">
                    {STATUS_LABEL[t.status]}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
