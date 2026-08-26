import { createClient } from "@/lib/supabase/server";

interface LogRow {
  logid: string;
  action: string;
  timestamp: string;
  details: Record<string, unknown> | null;
}

export default async function AdminLogsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("admin_logs")
    .select("logid, action, timestamp, details")
    .order("timestamp", { ascending: false })
    .limit(100);

  const logs = (data ?? []) as LogRow[];

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-2xl font-semibold text-navy dark:text-white">Admin Logs</h1>
      {logs.length === 0 ? (
        <p className="text-sm text-slate-soft">No log entries yet.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-mist bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="bg-mist text-xs uppercase text-slate-soft">
              <tr>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Details</th>
                <th className="px-4 py-3">When</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.logid} className="border-t border-mist">
                  <td className="px-4 py-3 font-medium text-ink">{l.action}</td>
                  <td className="px-4 py-3 text-xs text-slate-soft">
                    {l.details ? JSON.stringify(l.details) : "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-soft">
                    {new Date(l.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
