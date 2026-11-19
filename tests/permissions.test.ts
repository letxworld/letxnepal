import { describe, expect, it } from "vitest";
import {
  ADMIN_DOMAINS,
  CAPABILITIES,
  DOMAIN_CAPABILITIES,
  LOGIN_ROLES,
  authorize,
  isAdminDomain,
  type Actor,
  type Capability,
} from "../src/lib/auth/roles";

/**
 * The permission matrix is the security boundary of the back office. These tests pin
 * the rules from docs/spec.md §4 and §5:
 *
 *   - an Admin acts in exactly one domain and is denied everywhere else
 *   - a missing domain fails closed
 *   - SuperAdmin is a superset and holds provisioning
 *   - finance and customer are separate: customer requests, finance executes
 *   - a hotel owner can write their own availability and nothing else
 */

const admin = (domain?: string): Actor => ({
  userId: "u1",
  role: "admin",
  domain: domain as Actor["domain"],
});

const superAdmin: Actor = { userId: "root", role: "super_admin" };

describe("taxonomy", () => {
  it("has four login roles", () => {
    expect(LOGIN_ROLES).toEqual(["tourist", "hotel_owner", "agency", "guide"]);
  });

  it("has six admin domains", () => {
    expect(ADMIN_DOMAINS).toEqual(["blog", "hotel", "customer", "finance", "flight", "bus"]);
  });

  it("grants every domain at least one capability", () => {
    for (const domain of ADMIN_DOMAINS) {
      expect(DOMAIN_CAPABILITIES[domain].length, domain).toBeGreaterThan(0);
    }
  });

  it("gives each domain at least one capability no other domain holds", () => {
    // Shared read-only capabilities are fine, but each domain must own some
    // exclusive write or action capability, otherwise the domain is meaningless.
    for (const domain of ADMIN_DOMAINS) {
      const exclusive = DOMAIN_CAPABILITIES[domain].filter(
        (capability) =>
          !Object.entries(DOMAIN_CAPABILITIES).some(
            ([other, list]) => other !== domain && list.includes(capability),
          ),
      );
      expect(exclusive.length, `${domain} has no exclusive capability`).toBeGreaterThan(0);
    }
  });

  it("shares only read-only capabilities between domains", () => {
    const READ_ONLY: ReadonlySet<Capability> = new Set([
      "destination:read",
      "finance:read",
      "ledger:read",
      "audit:read",
      "customer:read",
    ]);
    for (const [domainA, listA] of Object.entries(DOMAIN_CAPABILITIES)) {
      for (const [domainB, listB] of Object.entries(DOMAIN_CAPABILITIES)) {
        if (domainA >= domainB) continue;
        for (const capability of listA) {
          if (listB.includes(capability)) {
            expect(
              READ_ONLY.has(capability),
              `${capability} is shared by ${domainA} and ${domainB} but is not read-only`,
            ).toBe(true);
          }
        }
      }
    }
  });

  it("recognises valid and invalid domains", () => {
    expect(isAdminDomain("finance")).toBe(true);
    expect(isAdminDomain("everything")).toBe(false);
    expect(isAdminDomain("")).toBe(false);
  });
});

describe("scoped Admin is denied outside its own domain", () => {
  it.each(ADMIN_DOMAINS)("a %s Admin cannot act in another domain", (domain) => {
    const actor = admin(domain);
    for (const other of ADMIN_DOMAINS) {
      if (other === domain) continue;
      for (const capability of DOMAIN_CAPABILITIES[other]) {
        // Shared read-only capabilities are intentionally available to both
        // domains; everything else must be denied.
        if (capability === "destination:read") continue;
        const result = authorize(actor, capability);
        expect(result.allowed, `${domain} Admin attempting ${capability}`).toBe(false);
        if (!result.allowed) expect(result.reason).toBe("wrong_domain");
      }
    }
  });

  it("a blog Admin can write a blog page but not touch a hotel", () => {
    const blog = admin("blog");
    expect(authorize(blog, "blog:write").allowed).toBe(true);
    expect(authorize(blog, "destination:read").allowed).toBe(true);
    expect(authorize(blog, "hotel:create").allowed).toBe(false);
    expect(authorize(blog, "finance:read").allowed).toBe(false);
    expect(authorize(blog, "customer:read").allowed).toBe(false);
  });

  it("a hotel Admin can add and remove listings but not write availability", () => {
    const hotel = admin("hotel");
    expect(authorize(hotel, "hotel:create").allowed).toBe(true);
    expect(authorize(hotel, "hotel:remove").allowed).toBe(true);
    expect(authorize(hotel, "hotel:assign_owner").allowed).toBe(true);
    // Pricing data belongs to the owner, not to the listing admin.
    expect(authorize(hotel, "availability:write_own").allowed).toBe(false);
  });

  it("fails closed when an Admin has no domain", () => {
    const orphan: Actor = { userId: "u2", role: "admin" };
    for (const capability of CAPABILITIES) {
      const result = authorize(orphan, capability);
      expect(result.allowed, capability).toBe(false);
      if (!result.allowed) expect(result.reason).toBe("wrong_domain");
    }
  });
});

describe("refund handoff: customer requests, finance executes", () => {
  it("a customer Admin can raise a refund request", () => {
    expect(authorize(admin("customer"), "refund:request").allowed).toBe(true);
    expect(authorize(admin("customer"), "customer:read").allowed).toBe(true);
    expect(authorize(admin("customer"), "customer:update").allowed).toBe(true);
  });

  it("a customer Admin cannot execute a refund", () => {
    expect(authorize(admin("customer"), "refund:execute").allowed).toBe(false);
    expect(authorize(admin("customer"), "charge:execute").allowed).toBe(false);
    expect(authorize(admin("customer"), "payout:execute").allowed).toBe(false);
    expect(authorize(admin("customer"), "finance:read").allowed).toBe(false);
  });

  it("a finance Admin executes but cannot raise the request through the customer screens", () => {
    expect(authorize(admin("finance"), "refund:execute").allowed).toBe(true);
    expect(authorize(admin("finance"), "charge:execute").allowed).toBe(true);
    expect(authorize(admin("finance"), "payout:execute").allowed).toBe(true);
    expect(authorize(admin("finance"), "ledger:read").allowed).toBe(true);
    // Finance is not the customer-management domain.
    expect(authorize(admin("finance"), "customer:read").allowed).toBe(false);
    expect(authorize(admin("finance"), "refund:request").allowed).toBe(false);
  });

  it("no scoped Admin holds both request and execute", () => {
    for (const domain of ADMIN_DOMAINS) {
      const actor = admin(domain);
      const canRequest = authorize(actor, "refund:request").allowed;
      const canExecute = authorize(actor, "refund:execute").allowed;
      expect(canRequest && canExecute, domain).toBe(false);
    }
  });
});

describe("SuperAdmin", () => {
  it("holds every domain capability", () => {
    for (const list of Object.values(DOMAIN_CAPABILITIES)) {
      for (const capability of list) {
        expect(authorize(superAdmin, capability).allowed, capability).toBe(true);
      }
    }
  });

  it("is the only role that can provision and revoke Admins", () => {
    expect(authorize(superAdmin, "admin:provision").allowed).toBe(true);
    expect(authorize(superAdmin, "admin:revoke").allowed).toBe(true);
    for (const domain of ADMIN_DOMAINS) {
      expect(authorize(admin(domain), "admin:provision").allowed).toBe(false);
      expect(authorize(admin(domain), "admin:revoke").allowed).toBe(false);
      expect(authorize(admin(domain), "audit:read").allowed).toBe(false);
    }
  });

  it("a hotel owner cannot provision Admins", () => {
    const owner: Actor = { userId: "o1", role: "hotel_owner", organizationId: "org1" };
    expect(authorize(owner, "admin:provision").allowed).toBe(false);
    expect(authorize(owner, "availability:write_own").allowed).toBe(true);
  });
});

describe("login roles", () => {
  it("a hotel owner writes only their own availability", () => {
    const owner: Actor = { userId: "o1", role: "hotel_owner", organizationId: "org1" };
    expect(authorize(owner, "availability:write_own").allowed).toBe(true);
    expect(authorize(owner, "blog:write").allowed).toBe(false);
    expect(authorize(owner, "hotel:create").allowed).toBe(false);
  });

  it("tourists, agencies and guides hold no back-office capability", () => {
    for (const role of ["tourist", "agency", "guide"] as const) {
      const actor: Actor = { userId: "x", role };
      for (const capability of CAPABILITIES) {
        expect(authorize(actor, capability).allowed, `${role} -> ${capability}`).toBe(false);
      }
    }
  });
});
