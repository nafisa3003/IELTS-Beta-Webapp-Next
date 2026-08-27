import { GamificationRepository } from "@/lib/repositories/gamification.repository";
import { makeQueryBuilder, makeFakeDb } from "./test-utils/supabase-mock";

describe("GamificationRepository.getXpTotal", () => {
  it("sums the amount across all ledger rows", async () => {
    const rows = [{ amount: 10 }, { amount: 25 }, { amount: 5 }];
    const db = makeFakeDb(() => makeQueryBuilder({ data: rows, error: null }));
    const repo = new GamificationRepository(db as never);

    const total = await repo.getXpTotal("u1");
    expect(total).toBe(40);
  });

  it("returns 0 when the student has no ledger entries", async () => {
    const db = makeFakeDb(() => makeQueryBuilder({ data: [], error: null }));
    const repo = new GamificationRepository(db as never);

    const total = await repo.getXpTotal("u1");
    expect(total).toBe(0);
  });

  it("returns 0 rather than throwing when data comes back null", async () => {
    const db = makeFakeDb(() => makeQueryBuilder({ data: null, error: null }));
    const repo = new GamificationRepository(db as never);

    const total = await repo.getXpTotal("u1");
    expect(total).toBe(0);
  });

  it("throws when the query errors", async () => {
    const db = makeFakeDb(() => makeQueryBuilder({ data: null, error: new Error("db down") }));
    const repo = new GamificationRepository(db as never);

    await expect(repo.getXpTotal("u1")).rejects.toThrow("db down");
  });
});

describe("GamificationRepository.getStreak", () => {
  it("returns null when the student has no streak row", async () => {
    const db = makeFakeDb(() => makeQueryBuilder({ data: null, error: null }));
    const repo = new GamificationRepository(db as never);

    const streak = await repo.getStreak("u1");
    expect(streak).toBeNull();
  });

  it("returns the streak row when present", async () => {
    const db = makeFakeDb(() => makeQueryBuilder({ data: { current: 5 }, error: null }));
    const repo = new GamificationRepository(db as never);

    const streak = await repo.getStreak("u1");
    expect(streak).toEqual({ current: 5 });
  });
});

describe("GamificationRepository.getRecentXp", () => {
  it("passes the default limit of 10 through to the query", async () => {
    const builder = makeQueryBuilder({ data: [], error: null });
    const db = makeFakeDb(() => builder);
    const repo = new GamificationRepository(db as never);

    await repo.getRecentXp("u1");
    expect(builder.limit).toHaveBeenCalledWith(10);
  });

  it("passes a custom limit through to the query", async () => {
    const builder = makeQueryBuilder({ data: [], error: null });
    const db = makeFakeDb(() => builder);
    const repo = new GamificationRepository(db as never);

    await repo.getRecentXp("u1", 3);
    expect(builder.limit).toHaveBeenCalledWith(3);
  });
});
