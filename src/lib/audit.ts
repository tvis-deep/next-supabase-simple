import "server-only";

import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export type AuditAction =
  | "todo.insert"
  | "todo.update"
  | "todo.delete"
  | "profile.update"
  | "billing.checkout"
  | "billing.webhook";

export async function auditLog(input: {
  actorUserId: string;
  action: AuditAction;
  entityType?: string | null;
  entityId?: string | null;
  metadata?: Record<string, unknown> | null;
}) {
  const supabaseAdmin = getSupabaseAdmin();
  const { error } = await supabaseAdmin.from("audit_logs").insert({
    actor_user_id: input.actorUserId,
    action: input.action,
    entity_type: input.entityType ?? null,
    entity_id: input.entityId ?? null,
    metadata: input.metadata ?? null,
  });

  if (error) throw error;
}
