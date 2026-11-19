/**
 * Audit log.
 *
 * Some actions change who can act or move money. Those must be reconstructable after
 * the fact, so they are written here. The log is append-only: there is deliberately no
 * update or delete function in this module, and the `audit:read` capability belongs to
 * SuperAdmin alone, so no scoped Admin can inspect or conceal the record.
 *
 * Today this is an in-memory sink behind a narrow interface, so the write path and the
 * tests are built once and the durable store (a Postgres table with no update or delete
 * grant) slots in later. See docs/spec.md §8 and §10.
 */

import { AUDITED_CAPABILITIES, type Actor, type Capability } from "./roles";

export type AuditEntry = {
  id: string;
  /** ISO timestamp. */
  at: string;
  actorId: string;
  actorRole: string;
  actorDomain?: string;
  capability: Capability;
  /** What the action targeted: an organisation, a booking, a user. */
  targetType: string;
  targetId: string;
  /** Optional human-readable reason. Mandatory for provisioning and refunds. */
  reason?: string;
  /** Arbitrary structured context. Must not contain secrets or card data. */
  metadata?: Record<string, unknown>;
};

export type AuditWriter = (entry: AuditEntry) => void;

const memory: AuditEntry[] = [];

let writer: AuditWriter = (entry) => {
  memory.push(entry);
};

/** Replace the sink. Used when the durable store is connected. */
export function setAuditWriter(next: AuditWriter) {
  writer = next;
}

/** Test helper: inspect the in-memory sink. */
export function _readMemoryLog(): readonly AuditEntry[] {
  return memory;
}

export function _resetMemoryLog() {
  memory.length = 0;
}

let sequence = 0;

function nextId(): string {
  sequence += 1;
  return `audit_${Date.now().toString(36)}_${sequence}`;
}

/**
 * Record an action. Returns the stored entry.
 *
 * Does not throw: an audit failure must not break the action it describes, but it is
 * reported to the caller so a sensitive action can refuse to continue without a record.
 */
export function recordAudit(
  actor: Actor,
  capability: Capability,
  target: { type: string; id: string },
  options: { reason?: string; metadata?: Record<string, unknown> } = {},
): { ok: true; entry: AuditEntry } | { ok: false; error: string } {
  const entry: AuditEntry = {
    id: nextId(),
    at: new Date().toISOString(),
    actorId: actor.userId,
    actorRole: actor.role,
    actorDomain: actor.domain,
    capability,
    targetType: target.type,
    targetId: target.id,
    reason: options.reason,
    // Sanitised at the boundary: a caller must never be able to write a secret
    // into the log by forgetting to filter it themselves.
    metadata: options.metadata ? safeMetadata(options.metadata) : undefined,
  };

  try {
    writer(entry);
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "audit sink failed",
    };
  }
  return { ok: true, entry };
}

/** Whether a capability must be recorded. */
export function isAudited(capability: Capability): boolean {
  return AUDITED_CAPABILITIES.includes(capability);
}

/**
 * Record a sensitive action and refuse to proceed if the record could not be written.
 * Use this for provisioning, hotel removal, and any money movement.
 */
export function recordOrReject(
  actor: Actor,
  capability: Capability,
  target: { type: string; id: string },
  options: { reason?: string; metadata?: Record<string, unknown> } = {},
): { ok: true; entry: AuditEntry } | { ok: false; error: string } {
  const result = recordAudit(actor, capability, target, options);
  if (!result.ok) {
    return {
      ok: false,
      error: `Action refused: it could not be recorded in the audit log (${result.error}).`,
    };
  }
  return result;
}

/** Sanitise metadata before storage: secrets and card data must never be logged. */
export function safeMetadata(metadata: Record<string, unknown>): Record<string, unknown> {
  const forbidden = /password|secret|token|cvv|card.?number|cookie|authorization/i;
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (forbidden.test(key)) continue;
    if (typeof value === "string" && value.length > 500) {
      out[key] = `${value.slice(0, 500)}…`;
      continue;
    }
    out[key] = value;
  }
  return out;
}
