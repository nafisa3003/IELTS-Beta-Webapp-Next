"use client";

import { useActionState, useEffect } from "react";
import { updateRoleAction } from "./actions";
import { notify } from "@/lib/toast";

type ActionResult = { error?: string; success?: boolean } | null;

export function RoleSelectForm({ userid, currentRole }: { userid: string; currentRole: string }) {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(updateRoleAction, null);

  useEffect(() => {
    if (state?.success) notify.success("Role updated.");
    if (state?.error) notify.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="userid" value={userid} />
      <select name="role" defaultValue={currentRole} className="rounded-md border border-mist px-2 py-1 text-xs">
        <option value="student">student</option>
        <option value="teacher">teacher</option>
        <option value="admin">admin</option>
      </select>
      <button type="submit" disabled={pending} className="text-xs font-semibold text-teal disabled:opacity-50">
        {pending ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
