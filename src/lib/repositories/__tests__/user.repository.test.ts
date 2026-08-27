import { UserRepository } from "@/lib/repositories/user.repository";
import { makeQueryBuilder, makeFakeDb } from "./test-utils/supabase-mock";

describe("UserRepository.findAll", () => {
  it("falls back through student -> teacher -> admin display_id", () => {
    const rows = [
      {
        userid: "u1",
        email: "s@x.com",
        role: "student",
        created_at: "2026-01-01",
        persons: { first_name: "S", last_name: "One" },
        students: [{ display_id: "S00001" }],
        teachers: [],
        admins: [],
      },
      {
        userid: "u2",
        email: "t@x.com",
        role: "teacher",
        created_at: "2026-01-02",
        persons: { first_name: "T", last_name: "One" },
        students: [],
        teachers: [{ display_id: "T00001" }],
        admins: [],
      },
      {
        userid: "u3",
        email: "a@x.com",
        role: "admin",
        created_at: "2026-01-03",
        persons: { first_name: "A", last_name: "One" },
        students: [],
        teachers: [],
        admins: [{ display_id: "A00001" }],
      },
    ];
    const db = makeFakeDb(() => makeQueryBuilder({ data: rows, error: null }));
    const repo = new UserRepository(db as never);

    return repo.findAll().then((result) => {
      expect(result[0].display_id).toBe("S00001");
      expect(result[1].display_id).toBe("T00001");
      expect(result[2].display_id).toBe("A00001");
    });
  });

  it("returns null display_id when no subtype row exists for any role", async () => {
    const rows = [
      {
        userid: "u4",
        email: "orphan@x.com",
        role: "student",
        created_at: "2026-01-04",
        persons: null,
        students: [],
        teachers: [],
        admins: [],
      },
    ];
    const db = makeFakeDb(() => makeQueryBuilder({ data: rows, error: null }));
    const repo = new UserRepository(db as never);

    const result = await repo.findAll();
    expect(result[0].display_id).toBeNull();
  });

  it("throws when the query errors", async () => {
    const db = makeFakeDb(() => makeQueryBuilder({ data: null, error: new Error("db down") }));
    const repo = new UserRepository(db as never);

    await expect(repo.findAll()).rejects.toThrow("db down");
  });

  it("returns an empty array when there is no data", async () => {
    const db = makeFakeDb(() => makeQueryBuilder({ data: null, error: null }));
    const repo = new UserRepository(db as never);

    const result = await repo.findAll();
    expect(result).toEqual([]);
  });
});

describe("UserRepository.updateRole", () => {
  it("upserts into the students table when promoting to student", async () => {
    const db = makeFakeDb(() => makeQueryBuilder({ data: null, error: null }));
    const repo = new UserRepository(db as never);

    await repo.updateRole("u1", "student");
    expect(db.from).toHaveBeenCalledWith("users");
    expect(db.from).toHaveBeenCalledWith("students");
  });

  it("upserts into the teachers table when promoting to teacher", async () => {
    const db = makeFakeDb(() => makeQueryBuilder({ data: null, error: null }));
    const repo = new UserRepository(db as never);

    await repo.updateRole("u1", "teacher");
    expect(db.from).toHaveBeenCalledWith("teachers");
  });

  it("upserts into the admins table when promoting to admin", async () => {
    const db = makeFakeDb(() => makeQueryBuilder({ data: null, error: null }));
    const repo = new UserRepository(db as never);

    await repo.updateRole("u1", "admin");
    expect(db.from).toHaveBeenCalledWith("admins");
  });

  it("throws if the role label update fails, without attempting the subtype upsert", async () => {
    const db = makeFakeDb((table: string) =>
      table === "users"
        ? makeQueryBuilder({ data: null, error: new Error("update failed") })
        : makeQueryBuilder({ data: null, error: null })
    );
    const repo = new UserRepository(db as never);

    await expect(repo.updateRole("u1", "teacher")).rejects.toThrow("update failed");
    expect(db.from).not.toHaveBeenCalledWith("teachers");
  });
});
