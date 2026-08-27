/**
 * Builds a fake Supabase query-builder chain for unit tests.
 * Every chain method (select/eq/order/etc.) returns the same object so
 * calls can be chained arbitrarily, and the object itself is "thenable"
 * so `await db.from(...).select(...).order(...)` resolves to `result`
 * even when no terminal call like .single()/.maybeSingle() is made.
 */
export function makeQueryBuilder(result: { data: unknown; error: unknown }) {
  const chainMethods = [
    "select",
    "eq",
    "order",
    "update",
    "upsert",
    "insert",
    "delete",
    "limit",
    "ilike",
    "in",
  ] as const;

  const builder: Record<string, unknown> = {};
  for (const method of chainMethods) {
    builder[method] = jest.fn(() => builder);
  }
  builder.single = jest.fn(() => Promise.resolve(result));
  builder.maybeSingle = jest.fn(() => Promise.resolve(result));
  // Makes `await builder` resolve to `result` when no terminal call is made.
  builder.then = (resolve: (value: typeof result) => void) => resolve(result);

  return builder as Record<string, jest.Mock> & PromiseLike<typeof result>;
}

export function makeFakeDb(fromImpl: (table: string) => ReturnType<typeof makeQueryBuilder>) {
  return { from: jest.fn(fromImpl) };
}
