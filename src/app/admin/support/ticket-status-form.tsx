"use client";

import { useActionState, useEffect } from "react";
import { updateTicketStatusAction } from "./actions";
import { notify } from "@/lib/toast";
import type { TicketStatus } from "@/lib/repositories/support-ticket.repository";

type ActionResult = { error?: string; success?: boolean } | null;

export function TicketStatusForm({ ticketid, currentStatus }: { ticketid: string; currentStatus: TicketStatus }) {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(updateTicketStatusAction, null);

  useEffect(() => {
    if (state?.success) notify.success("Ticket updated.");
    if (state?.error) notify.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="mt-3 flex items-center gap-2">
      <input type="hidden" name="ticketid" value={ticketid} />
      <select name="status" defaultValue={currentStatus} className="rounded-md border border-mist px-2 py-1 text-xs">
        <option value="Open">Open</option>
        <option value="InProgress">In Progress</option>
        <option value="Resolved">Resolved</option>
      </select>
      <button type="submit" disabled={pending} className="text-xs font-semibold text-teal disabled:opacity-50">
        {pending ? "Updating..." : "Update"}
      </button>
    </form>
  );
}
