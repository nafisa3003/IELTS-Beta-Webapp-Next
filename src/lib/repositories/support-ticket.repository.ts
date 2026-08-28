import type { SupabaseClient } from "@supabase/supabase-js";

export type TicketStatus = "Open" | "InProgress" | "Resolved";

export interface SupportTicket {
  ticketid: string;
  studentid: string;
  adminid: string | null;
  subject: string;
  message: string;
  status: TicketStatus;
  created_at: string;
  students?: { users: { persons: { first_name: string; last_name: string } | null } | null } | null;
}

export class SupportTicketRepository {
  constructor(private readonly db: SupabaseClient) {}

  async findAll(): Promise<SupportTicket[]> {
    const { data, error } = await this.db
      .from("support_tickets")
      .select("*, students(users(persons(first_name, last_name)))")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as unknown as SupportTicket[];
  }

  async findByStudent(studentid: string): Promise<SupportTicket[]> {
    const { data, error } = await this.db
      .from("support_tickets")
      .select("*")
      .eq("studentid", studentid)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as unknown as SupportTicket[];
  }

  async create(studentid: string, subject: string, message: string): Promise<SupportTicket> {
    const { data, error } = await this.db
      .from("support_tickets")
      .insert({ studentid, subject, message, status: "Open" })
      .select()
      .single();
    if (error) throw error;
    return data as unknown as SupportTicket;
  }

  async updateStatus(ticketid: string, status: TicketStatus, adminid: string): Promise<void> {
    const { error } = await this.db
      .from("support_tickets")
      .update({ status, adminid })
      .eq("ticketid", ticketid);
    if (error) throw error;

    const { error: logError } = await this.db.from("admin_logs").insert({
      adminid,
      action: "support_ticket_status_updated",
      details: { ticketid, new_status: status },
    });
    if (logError) throw logError;
  }
}
