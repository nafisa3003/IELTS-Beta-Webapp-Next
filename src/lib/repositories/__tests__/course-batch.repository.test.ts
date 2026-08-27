import { CourseBatchRepository } from "@/lib/repositories/course-batch.repository";
import { makeQueryBuilder, makeFakeDb } from "./test-utils/supabase-mock";

describe("CourseBatchRepository.nextBatchNumber", () => {
  it("returns 1 when the course has no existing batches", async () => {
    const db = makeFakeDb(() => makeQueryBuilder({ data: null, error: null }));
    const repo = new CourseBatchRepository(db as never);

    const next = await repo.nextBatchNumber("c1");
    expect(next).toBe(1);
  });

  it("returns the highest existing batch number plus one", async () => {
    const db = makeFakeDb(() => makeQueryBuilder({ data: { batch_number: 4 }, error: null }));
    const repo = new CourseBatchRepository(db as never);

    const next = await repo.nextBatchNumber("c1");
    expect(next).toBe(5);
  });

  it("throws when the query errors", async () => {
    const db = makeFakeDb(() => makeQueryBuilder({ data: null, error: new Error("boom") }));
    const repo = new CourseBatchRepository(db as never);

    await expect(repo.nextBatchNumber("c1")).rejects.toThrow("boom");
  });
});

describe("CourseBatchRepository.enrolledCount", () => {
  it("returns the count of active enrollments for the batch", async () => {
    const db = makeFakeDb(() => makeQueryBuilder({ count: 12, error: null } as never));
    const repo = new CourseBatchRepository(db as never);

    const count = await repo.enrolledCount("b1");
    expect(count).toBe(12);
  });

  it("returns 0 when count comes back null", async () => {
    const db = makeFakeDb(() => makeQueryBuilder({ count: null, error: null } as never));
    const repo = new CourseBatchRepository(db as never);

    const count = await repo.enrolledCount("b1");
    expect(count).toBe(0);
  });

  it("throws when the query errors", async () => {
    const db = makeFakeDb(() => makeQueryBuilder({ count: null, error: new Error("boom") } as never));
    const repo = new CourseBatchRepository(db as never);

    await expect(repo.enrolledCount("b1")).rejects.toThrow("boom");
  });
});

describe("CourseBatchRepository.findAllActive", () => {
  it("returns only the rows the query provides (filtering happens server-side via .eq)", async () => {
    const rows = [{ batchid: "b1", is_active: true }];
    const builder = makeQueryBuilder({ data: rows, error: null });
    const db = makeFakeDb(() => builder);
    const repo = new CourseBatchRepository(db as never);

    const result = await repo.findAllActive();
    expect(result).toEqual(rows);
    expect(builder.eq).toHaveBeenCalledWith("is_active", true);
  });
});

describe("CourseBatchRepository.deactivate", () => {
  it("updates is_active to false for the given batch", async () => {
    const builder = makeQueryBuilder({ data: null, error: null });
    const db = makeFakeDb(() => builder);
    const repo = new CourseBatchRepository(db as never);

    await repo.deactivate("b1");
    expect(builder.update).toHaveBeenCalledWith({ is_active: false });
    expect(builder.eq).toHaveBeenCalledWith("batchid", "b1");
  });

  it("throws when the update errors", async () => {
    const db = makeFakeDb(() => makeQueryBuilder({ data: null, error: new Error("boom") }));
    const repo = new CourseBatchRepository(db as never);

    await expect(repo.deactivate("b1")).rejects.toThrow("boom");
  });
});
