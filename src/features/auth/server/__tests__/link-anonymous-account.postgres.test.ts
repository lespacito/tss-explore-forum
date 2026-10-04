import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type postgres from "postgres";

const mocks = vi.hoisted(() => ({
  sql: null as ReturnType<typeof postgres> | null,
  verify: vi.fn(),
  sourceId: "source",
  beforeCreate: null as null | (() => Promise<void>),
}));
// Scheduling barrier only: every read/write still uses the real Drizzle/PG helper.
vi.mock("@/features/alias/server/db/alias-queries", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/features/alias/server/db/alias-queries")>();
  return { ...actual, createAliasRecord: async (data: Parameters<typeof actual.createAliasRecord>[0]) => {
    await mocks.beforeCreate?.();
    return actual.createAliasRecord(data);
  } };
});
// Opt-in only: never read DATABASE_URL or any app/staging configuration.
const enabled = !!process.env.TEST_LINK_PG_PORT;
vi.mock("@/db", async () => {
  const { default: postgres } = await import("postgres");
  const { drizzle } = await import("drizzle-orm/postgres-js");
  const port = Number(process.env.TEST_LINK_PG_PORT);
  if (!Number.isInteger(port) || port < 1024 || port > 65535)
    throw new Error("Dedicated disposable Postgres port required");
  const sql = postgres({ host: "127.0.0.1", port, database: "pv_link_disposable", username: "postgres", max: 10 });
  mocks.sql = sql;
  return { db: drizzle(sql) };
});
vi.mock("@tanstack/react-start", () => ({
  createServerFn: () => ({ validator: (schema: { parse: (data: unknown) => unknown }) => ({
    handler: (handler: (input: { data: unknown }) => unknown) => (input: { data: unknown }) => handler({ data: schema.parse(input.data) }),
  }) }),
}));
vi.mock("@tanstack/react-start/server", () => ({
  getRequest: () => new Request("http://localhost/link"),
  getRequestIP: () => "127.0.0.1",
}));
vi.mock("@/features/auth/lib/security/arcjet-policies", () => ({ protectAuthEndpoint: async () => ({ isDenied: () => false, isErrored: () => false }) }));
vi.mock("@/features/auth/lib/security/link-attempt-limiter", () => ({ consumeLinkAttempt: () => true }));
vi.mock("@/features/auth/server/get-auth-session", () => ({ getAuthSession: async () => ({ isAuthenticated: true,
  user: { id: mocks.sourceId, isAnonymous: true }, session: { id: `session-${mocks.sourceId}`, token: `token-${mocks.sourceId}` },
}) }));
vi.mock("@/features/auth/lib/auth", () => ({ auth: { $context: Promise.resolve({
  internalAdapter: {
    findUserById: async (id: string) => (await sql()`select * from "user" where id = ${id}`).map((row) => ({ ...row, isAnonymous: row.is_anonymous }))[0],
    findUserByEmail: async (email: string) => {
      const [row] = await sql()`select * from "user" where email = ${email}`;
      if (!row) return null;
      const accounts = await sql()`select * from account where user_id = ${row.id}`;
      return { user: { ...row, isAnonymous: row.is_anonymous, emailVerified: row.email_verified }, accounts: accounts.map((row) => ({ ...row, providerId: row.provider_id, userId: row.user_id })) };
    },
  }, password: { verify: mocks.verify },
}) } }));
vi.mock("@/features/alias/lib/generate-alias", () => ({ generateAlias: vi.fn(() => `generated-${crypto.randomUUID()}`) }));
vi.mock("@/lib/logger/server", () => ({ logger: { error: vi.fn() } }));

const proof = { email: "destination@example.com", password: "proof" };
const a = "00000000-0000-4000-8000-000000000001";
const b = "00000000-0000-4000-8000-000000000002";
const c = "00000000-0000-4000-8000-000000000003";
let invoke: (data: typeof proof) => Promise<{ success: boolean; linkedPostsCount?: number }>;
function sql() {
  if (!mocks.sql) throw new Error("Disposable Postgres client not initialized");
  return mocks.sql;
}
const aliases = () => sql()`select id::text, user_id, is_primary from alias order by id`;
// Observe an actual PostgreSQL lock wait instead of relying on a timing sleep.
const waitingFor = async (pattern: string) => {
  for (let attempt = 0; attempt < 100; attempt++) {
    const rows = await sql()`select pid from pg_stat_activity where datname = 'pv_link_disposable' and wait_event_type = 'Lock' and query like ${pattern}`;
    if (rows.length) return;
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  throw new Error(`No blocked real PostgreSQL query matching ${pattern}`);
};

describe.skipIf(!enabled)("actual linkage transaction on disposable Postgres", () => {
  beforeAll(async () => {
    const { linkAnonymousAccountFn } = await import("../link-anonymous-account");
    invoke = (data) => linkAnonymousAccountFn({ data });
    await sql()`create table if not exists "user" (id text primary key, name text not null default '', email text unique not null, email_verified boolean not null default false, image text, role text not null default 'USER', username text, display_username text, is_anonymous boolean not null default false, bio text, banned boolean not null default false, secret_code text, secret_code_generated_at timestamp, created_at timestamptz default now(), updated_at timestamptz default now())`;
    await sql()`create table if not exists session (id text primary key, expires_at timestamp not null, token text unique not null, user_id text references "user"(id), created_at timestamptz default now(), updated_at timestamptz default now(), ip_address text, user_agent text)`;
    await sql()`create table if not exists account (id text primary key, account_id text, provider_id text, user_id text references "user"(id), password text, access_token text, refresh_token text, id_token text, access_token_expires_at timestamp, refresh_token_expires_at timestamp, scope text, created_at timestamptz default now(), updated_at timestamptz default now())`;
    await sql()`create table if not exists alias (id uuid primary key default gen_random_uuid(), user_id text not null references "user"(id), alias text unique not null, is_primary boolean not null default false, rotation_enabled boolean not null default false, created_at timestamptz default now())`;
  });
  afterAll(async () => { await mocks.sql?.end(); });
  beforeEach(async () => {
    vi.clearAllMocks();
    mocks.sourceId = "source";
    mocks.beforeCreate = null;
    mocks.verify.mockResolvedValue(true);
    await sql()`drop trigger if exists test_fail_alias on alias`;
    await sql()`truncate alias, account, session, "user"`;
    await sql()`insert into "user" (id,email,is_anonymous,email_verified) values ('source','source@example.com',true,false), ('source2','source2@example.com',true,false), ('destination','destination@example.com',false,true)`;
    await sql()`insert into session (id,token,user_id,expires_at) values ('session-source','token-source','source',now()+interval '1 hour'), ('session-source2','token-source2','source2',now()+interval '1 hour')`;
    await sql()`insert into account (id,account_id,provider_id,user_id,password) values ('credential','destination','credential','destination','hash')`;
    await sql()`insert into alias (id,user_id,alias,is_primary) values (${a},'source','source-alias',true), (${b},'destination','destination-alias',true)`;
  });

  it("rejects an unverified destination before password work without alias effects", async () => {
    await sql()`update "user" set email_verified = false where id = 'destination'`;
    const before = await aliases();
    expect(await invoke(proof)).toEqual({ success: false, error: "Identifiants invalides" });
    expect(mocks.verify).not.toHaveBeenCalled();
    expect(await aliases()).toEqual(before);
  });

  it("rejects verification revoked after the initial password proof before the transaction", async () => {
    const before = await aliases();
    mocks.verify.mockImplementationOnce(async () => {
      // Initial adapter lookup already returned a verified destination. Commit on
      // a separate real connection before letting the transaction acquire locks.
      await sql()`update "user" set email_verified = false where id = 'destination'`;
      return true;
    });
    expect(await invoke(proof)).toEqual({ success: false, error: "Identifiants invalides" });
    expect(mocks.verify).toHaveBeenCalledOnce();
    expect(await aliases()).toEqual(before);
    expect(await sql()`select email_verified from "user" where id = 'destination'`).toEqual([{ email_verified: false }]);
  });

  it("rechecks verification revoked while linkage waits for the destination owner lock", async () => {
    const before = await aliases();
    let locked!: () => void;
    let release!: () => void;
    const ready = new Promise<void>((resolve) => { locked = resolve; });
    const gate = new Promise<void>((resolve) => { release = resolve; });
    const revoking = sql().begin(async (tx) => {
      await tx`update "user" set email_verified = false where id = 'destination'`;
      locked();
      await gate;
    });
    await ready;
    // MVCC lookup sees the still-committed verified record, then FOR UPDATE must
    // wait for revocation and revalidate the latest row after the lock releases.
    const linking = invoke(proof);
    try {
      await waitingFor('select %from "user"%for update%');
      expect(mocks.verify).toHaveBeenCalledOnce();
      expect(await aliases()).toEqual(before);
    } finally {
      release();
      await revoking;
      await linking;
    }
    expect(await linking).toEqual({ success: false, error: "Identifiants invalides" });
    expect(await aliases()).toEqual(before);
    expect(await sql()`select email_verified from "user" where id = 'destination'`).toEqual([{ email_verified: false }]);
  });

  it("rechecks the primary after a delayed auth-hook creation races with linkage", async () => {
    const { createPrimaryAlias } = await import("@/features/alias/lib/create-alias");
    const { getUserPrimaryAlias } = await import("@/features/alias/server/db/alias-queries");
    await sql()`delete from alias where user_id = 'destination'`;
    // The hook's initial read sees absence; pause its real creation before insertion.
    expect(await getUserPrimaryAlias("destination")).toBeNull();
    let reached!: () => void;
    let release!: () => void;
    const ready = new Promise<void>((resolve) => { reached = resolve; });
    const gate = new Promise<void>((resolve) => { release = resolve; });
    mocks.beforeCreate = async () => { reached(); await gate; };
    const creating = createPrimaryAlias("destination");
    await ready;
    try {
      expect((await invoke(proof)).success).toBe(true);
    } finally {
      release();
    }
    const created = await creating;
    const state = await aliases();
    expect(state).toEqual([{ id: a, user_id: "destination", is_primary: true }]);
    expect(created.id).toBe(a);
  });

  it("waits for an in-flight linkage owner lock before deciding to create a primary", async () => {
    const { createPrimaryAlias } = await import("@/features/alias/lib/create-alias");
    await sql()`delete from alias where user_id = 'destination'`;
    let locked!: () => void;
    let release!: () => void;
    const ready = new Promise<void>((resolve) => { locked = resolve; });
    const gate = new Promise<void>((resolve) => { release = resolve; });
    const holder = sql().begin(async (tx) => {
      await tx`select pg_advisory_xact_lock(914731)`;
      locked();
      await gate;
    });
    await ready;
    // Pause the real link transaction after it has acquired both owner locks.
    await sql()`create or replace function test_fail_alias() returns trigger language plpgsql as $$ begin if new.user_id <> old.user_id then perform pg_advisory_xact_lock(914731); end if; return new; end $$`;
    await sql()`create trigger test_fail_alias before update on alias for each row execute function test_fail_alias()`;
    const linking = invoke(proof);
    let creating: ReturnType<typeof createPrimaryAlias> | undefined;
    try {
      await waitingFor('update "alias"%');
      creating = createPrimaryAlias("destination");
      // Proves the primary writer participates in the SAME owner-lock protocol,
      // not just an unlocked last-minute existence check.
      await waitingFor('select "id" from "user"%for update%');
    } finally {
      release();
      await holder;
    }
    expect((await linking).success).toBe(true);
    expect((await creating)?.id).toBe(a);
    expect(await aliases()).toEqual([{ id: a, user_id: "destination", is_primary: true }]);
  });

  it("serializes simultaneous principal creations for an owner with no alias", async () => {
    const { createPrimaryAlias } = await import("@/features/alias/lib/create-alias");
    await sql()`delete from alias where user_id = 'destination'`;
    let count = 0;
    let release!: () => void;
    const gate = new Promise<void>((resolve) => { release = resolve; });
    mocks.beforeCreate = async () => { if (++count === 2) release(); await gate; };
    const [first, second] = await Promise.all([
      createPrimaryAlias("destination"), createPrimaryAlias("destination"),
    ]);
    expect(first.id).toBe(second.id);
    expect((await aliases()).filter((row) => row.user_id === "destination")).toEqual([
      { id: first.id, user_id: "destination", is_primary: true },
    ]);
  });

  it("retries a name uniqueness conflict committed after its availability read", async () => {
    const { createPrimaryAlias } = await import("@/features/alias/lib/create-alias");
    const { generateAlias } = await import("@/features/alias/lib/generate-alias");
    await sql()`delete from alias where user_id = 'destination'`;
    vi.mocked(generateAlias).mockReturnValueOnce("raced-name").mockReturnValueOnce("retry-name");
    mocks.beforeCreate = async () => {
      mocks.beforeCreate = null;
      await sql()`insert into alias (user_id,alias,is_primary) values ('source2','raced-name',false)`;
    };
    const created = await createPrimaryAlias("destination");
    expect(created.alias).toBe("retry-name");
    expect((await aliases()).filter((row) => row.user_id === "destination")).toEqual([
      { id: created.id, user_id: "destination", is_primary: true },
    ]);
    expect(await sql()`select user_id from alias where alias = 'raced-name'`).toEqual([{ user_id: "source2" }]);
  });

  it("rejects linkage without any recoverable alias instead of succeeding with zero primaries", async () => {
    await sql()`delete from alias`;
    expect((await invoke(proof)).success).toBe(false);
    expect(await aliases()).toEqual([]);
  });
  it("retains exactly one existing destination primary", async () => {
    expect((await invoke(proof)).success).toBe(true);
    expect(await aliases()).toEqual([{ id: a, user_id: "destination", is_primary: false }, { id: b, user_id: "destination", is_primary: true }]);
  });
  it("chooses a transferred primary when destination has none", async () => {
    await sql()`update alias set is_primary = false where user_id = 'destination'`;
    expect((await invoke(proof)).success).toBe(true);
    expect((await aliases()).filter((row) => row.is_primary).map((row) => row.id)).toEqual([a]);
  });
  it("deterministically repairs multiple destination primaries", async () => {
    await sql()`insert into alias (id,user_id,alias,is_primary) values (${c},'destination','other',true)`;
    expect((await invoke(proof)).success).toBe(true);
    expect((await aliases()).filter((row) => row.is_primary).map((row) => row.id)).toEqual([b]);
  });
  it("is repeatable without re-transferring or losing the primary", async () => {
    expect((await invoke(proof)).success).toBe(true);
    const state = await aliases();
    expect(await invoke(proof)).toEqual({ success: true, linkedPostsCount: 0 });
    expect(await aliases()).toEqual(state);
    expect(state.filter((row) => row.is_primary)).toHaveLength(1);
  });
  it("serializes overlapping real transactions with one primary", async () => {
    await sql()`insert into alias (id,user_id,alias,is_primary) values (${c},'source2','source2-alias',true)`;
    const first = invoke(proof);
    // Session function snapshots the source before its first await.
    mocks.sourceId = "source2";
    const second = invoke(proof);
    expect((await Promise.all([first, second])).every((result) => result.success)).toBe(true);
    const state = await aliases();
    expect(state.every((row) => row.user_id === "destination")).toBe(true);
    expect(state.filter((row) => row.is_primary).map((row) => row.id)).toEqual([b]);
  });
  it.each(["transfer", "primary normalization"])("rolls back a database failure during %s", async (stage) => {
    const before = await aliases();
    await sql().unsafe(`create or replace function test_fail_alias() returns trigger language plpgsql as $$ begin if ${stage === "transfer" ? "new.user_id <> old.user_id" : "new.is_primary <> old.is_primary"} then raise exception 'injected failure'; end if; return new; end $$`);
    await sql()`create trigger test_fail_alias before update on alias for each row execute function test_fail_alias()`;
    expect((await invoke(proof)).success).toBe(false);
    expect(await aliases()).toEqual(before);
  });
  it.each(["banned", "credential", "session"])("revalidates %s changed in another connection during password proof", async (kind) => {
    const before = await aliases();
    mocks.verify.mockImplementationOnce(async () => {
      if (kind === "banned") await sql()`update "user" set banned = true where id = 'destination'`;
      if (kind === "credential") await sql()`update account set password = 'changed' where id = 'credential'`;
      if (kind === "session") await sql()`delete from session where id = 'session-source'`;
      return true;
    });
    expect((await invoke(proof)).success).toBe(false);
    expect(await aliases()).toEqual(before);
  });
});
