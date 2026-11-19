import { describe, expect, it } from "vitest";
import { authorize, CAPABILITIES, type Actor, type Capability } from "../src/lib/auth/roles";
import { isAudited, recordAudit, recordOrReject, safeMetadata, _readMemoryLog, _resetMemoryLog } from "../src/lib/auth/audit";

/**
 * The audit log is what makes provisioning and money movement answerable after the fact.
 * These tests pin the properties that matter: the right actions are recorded, a missing
 * record blocks the action, and secrets never reach the log.
 */

const root: Actor = { userId: "root", role: "super_admin" };

describe("audit coverage", () => {
  it("records provisioning and revocation", () => {
    expect(isAudited("admin:provision")).toBe(true);
    expect(isAudited("admin:revoke")).toBe(true);
  });

  it("records hotel add, remove and owner assignment", () => {
    expect(isAudited("hotel:create")).toBe(true);
    expect(isAudited("hotel:remove")).toBe(true);
    expect(isAudited("hotel:assign_owner")).toBe(true);
  });

  it("records every money movement, including the refund request", () => {
    expect(isAudited("charge:execute")).toBe(true);
    expect(isAudited("refund:execute")).toBe(true);
    expect(isAudited("payout:execute")).toBe(true);
    expect(isAudited("refund:request")).toBe(true);
  });

  it("does not record ordinary reads", () => {
    expect(isAudited("blog:write")).toBe(false);
    expect(isAudited("destination:read")).toBe(false);
    expect(isAudited("availability:write_own")).toBe(false);
  });

  it("only SuperAdmin may read the log", () => {
    expect(authorize(root, "audit:read").allowed).toBe(true);
    for (const domain of ["blog", "hotel", "customer", "finance", "flight", "bus"] as const) {
      const actor: Actor = { userId: "a", role: "admin", domain };
      expect(authorize(actor, "audit:read").allowed, domain).toBe(false);
    }
  });
});

describe("recordAudit", () => {
  it("writes an entry with actor, capability and target", () => {
    _resetMemoryLog();
    const result = recordAudit(root, "admin:provision", { type: "user", id: "u9" }, { reason: "new hire" });
    expect(result.ok).toBe(true);
    const log = _readMemoryLog();
    expect(log).toHaveLength(1);
    expect(log[0]).toMatchObject({
      actorId: "root",
      actorRole: "super_admin",
      capability: "admin:provision",
      targetType: "user",
      targetId: "u9",
      reason: "new hire",
    });
    expect(log[0]?.at).toBeTruthy();
    expect(log[0]?.id).toMatch(/^audit_/);
  });

  it("records the domain of a scoped Admin", () => {
    _resetMemoryLog();
    const finance: Actor = { userId: "f1", role: "admin", domain: "finance" };
    recordAudit(finance, "refund:execute", { type: "booking", id: "b1" }, { reason: "customer request" });
    expect(_readMemoryLog()[0]?.actorDomain).toBe("finance");
  });

  it("never exposes secrets in metadata", () => {
    _resetMemoryLog();
    recordAudit(root, "hotel:create", { type: "organization", id: "o1" }, {
      metadata: {
        name: "Hotel View",
        password: "hunter2",
        stripeSecretKey: "sk_live_xxx",
        cardNumber: "4242424242424242",
        cvv: "123",
        note: "ok",
      },
    });
    const metadata = _readMemoryLog()[0]?.metadata ?? {};
    expect(metadata).not.toHaveProperty("password");
    expect(metadata).not.toHaveProperty("stripeSecretKey");
    expect(metadata).not.toHaveProperty("cardNumber");
    expect(metadata).not.toHaveProperty("cvv");
    expect(metadata).toMatchObject({ name: "Hotel View", note: "ok" });
  });
});

describe("recordOrReject", () => {
  it("refuses an action when the log cannot be written", async () => {
    const failing = () => {
      throw new Error("disk full");
    };
    // Point the sink at something that throws, then restore the in-memory sink.
    const audit = await import("../src/lib/auth/audit");
    const sink: unknown[] = [];
    audit.setAuditWriter(failing);
    const result = audit.recordOrReject(root, "admin:provision", { type: "user", id: "u10" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("refused");
    audit.setAuditWriter((entry) => {
      sink.push(entry);
    });
    expect(sink).toHaveLength(0);
    _resetMemoryLog();
  });
});

describe("safeMetadata", () => {
  it("truncates very long values instead of storing them whole", () => {
    const out = safeMetadata({ note: "x".repeat(900) });
    expect(String(out.note).length).toBeLessThan(600);
  });

  it("keeps ordinary keys", () => {
    expect(safeMetadata({ a: 1, b: "two" })).toEqual({ a: 1, b: "two" });
  });
});

describe("capability catalogue", () => {
  it("every audited capability exists in the catalogue", () => {
    const audited = [
      "admin:provision", "admin:revoke", "hotel:create", "hotel:remove",
      "hotel:assign_owner", "charge:execute", "refund:execute", "payout:execute",
      "refund:request",
    ] as Capability[];
    for (const capability of audited) {
      expect(CAPABILITIES).toContain(capability);
    }
  });
});
