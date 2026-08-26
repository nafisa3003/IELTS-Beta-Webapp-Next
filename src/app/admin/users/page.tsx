import { createClient } from "@/lib/supabase/server";
import { UserRepository } from "@/lib/repositories/user.repository";
import { RoleSelectForm } from "./role-select-form";

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const users = await new UserRepository(supabase).findAll();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-display text-2xl font-semibold text-navy dark:text-white">Users</h1>
        <p className="mt-1 text-xs text-slate-soft">
          Changing a role updates the account's permissions and creates the matching
          student/teacher/admin profile row automatically.
        </p>
      </div>
      <div className="overflow-hidden rounded-lg border border-mist bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="bg-mist text-xs uppercase text-slate-soft">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.userid} className="border-t border-mist">
                <td className="px-4 py-3 font-mono text-xs font-semibold text-teal">{u.display_id ?? "—"}</td>
                <td className="px-4 py-3 text-ink">
                  {u.persons ? `${u.persons.first_name} ${u.persons.last_name}` : "—"}
                </td>
                <td className="px-4 py-3 text-slate">{u.email}</td>
                <td className="px-4 py-3">
                  <RoleSelectForm userid={u.userid} currentRole={u.role} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}