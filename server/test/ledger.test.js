const { api, sequelize, resetDatabase, createAccount, postTransaction, getBalance } = require("./helpers");

beforeEach(resetDatabase);
afterAll(() => sequelize.close());

describe("Accounts", () => {
  test("creates an account with a zero balance and system timestamps", async () => {
    const res = await api().post("/api/accounts").send({ name: "  Asha  " });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({ name: "Asha", balance: 0 });
    expect(res.body.data.id).toEqual(expect.any(Number));
    expect(res.body.data.created_at).toBeTruthy();
  });

  test("assigns unique ids", async () => {
    const a = await createAccount("A");
    const b = await createAccount("B");
    expect(a.id).not.toBe(b.id);
  });

  test.each([
    [{}, "name is required"],
    [{ name: "   " }, "name is required"],
    [{ name: 42 }, "name must be a string"],
  ])("rejects invalid name %j", async (body, message) => {
    const res = await api().post("/api/accounts").send(body);
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ success: false, errCode: "VALIDATION_ERROR", errorMessage: message });
  });

  test("does not allow the client to set the initial balance", async () => {
    const res = await api().post("/api/accounts").send({ name: "Rich", balance: 1000 });
    expect(res.status).toBe(400);
    expect(res.body.errorMessage).toMatch(/balance cannot be set/);
  });

  test("rejects malformed JSON and non-object bodies", async () => {
    const bad = await api().post("/api/accounts").set("Content-Type", "application/json").send('{"name": ');
    expect(bad.status).toBe(400);
    expect(bad.body.errCode).toBe("INVALID_REQUEST_BODY");

    const arr = await api().post("/api/accounts").send([{ name: "x" }]);
    expect(arr.status).toBe(400);
    expect(arr.body.errCode).toBe("INVALID_REQUEST_BODY");
  });
});

describe("Balance", () => {
  test("returns account_id and balance", async () => {
    const acc = await createAccount();
    const res = await api().get(`/api/accounts/${acc.id}/balance`);
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ account_id: acc.id, balance: 0 });
  });

  test("404 for a missing account, 400 for an invalid id", async () => {
    const missing = await api().get("/api/accounts/999999/balance");
    expect(missing.status).toBe(404);
    expect(missing.body.errCode).toBe("ACCOUNT_NOT_FOUND");

    const invalid = await api().get("/api/accounts/abc/balance");
    expect(invalid.status).toBe(400);
    expect(invalid.body.errCode).toBe("INVALID_ACCOUNT_ID");
  });
});

describe("Transactions", () => {
  test("credit increases and debit decreases the balance", async () => {
    const acc = await createAccount();
    await postTransaction(acc.id, "credit", 100);

    const credit = await postTransaction(acc.id, "credit", 50);
    expect(credit.status).toBe(201);
    expect(credit.body.data).toMatchObject({ type: "credit", amount: 50, balance_after: 150, account_id: acc.id });
    expect(await getBalance(acc.id)).toBe(150);

    const debit = await postTransaction(acc.id, "debit", 30);
    expect(debit.status).toBe(201);
    expect(await getBalance(acc.id)).toBe(120);
  });

  test("rejects a debit with insufficient balance and leaves the balance unchanged", async () => {
    const acc = await createAccount();
    await postTransaction(acc.id, "credit", 100);

    const res = await postTransaction(acc.id, "debit", 150);
    expect(res.status).toBe(422);
    expect(res.body.errCode).toBe("INSUFFICIENT_BALANCE");
    expect(await getBalance(acc.id)).toBe(100);

    const history = await api().get(`/api/accounts/${acc.id}/transactions`);
    expect(history.body.data.pagination.total_records).toBe(1);
  });

  test("balance equals the sum of all valid transactions", async () => {
    const acc = await createAccount();
    for (const [type, amount] of [
      ["credit", 100],
      ["credit", 50],
      ["debit", 30],
      ["debit", 20],
    ]) {
      await postTransaction(acc.id, type, amount);
    }
    await postTransaction(acc.id, "debit", 500); // rejected
    expect(await getBalance(acc.id)).toBe(100);
  });

  test("handles decimal amounts exactly", async () => {
    const acc = await createAccount();
    await postTransaction(acc.id, "credit", 0.1);
    await postTransaction(acc.id, "credit", 0.2);
    expect(await getBalance(acc.id)).toBe(0.3);
  });

  test("duplicate reference_id for the same account is rejected without side effects", async () => {
    const acc = await createAccount();
    const first = await postTransaction(acc.id, "credit", 100, { reference_id: "INV-1" });
    const dup = await postTransaction(acc.id, "credit", 100, { reference_id: "INV-1" });

    expect(dup.status).toBe(409);
    expect(dup.body.errCode).toBe("DUPLICATE_TRANSACTION");
    expect(dup.body.data.id).toBe(first.body.data.id);
    expect(await getBalance(acc.id)).toBe(100);
  });

  test("the same reference_id may be used on different accounts", async () => {
    const a = await createAccount("A");
    const b = await createAccount("B");
    expect((await postTransaction(a.id, "credit", 10, { reference_id: "SHARED" })).status).toBe(201);
    expect((await postTransaction(b.id, "credit", 10, { reference_id: "SHARED" })).status).toBe(201);
  });

  test.each([
    [{ type: "refund" }, "INVALID_TRANSACTION_TYPE"],
    [{ type: undefined }, "INVALID_TRANSACTION_TYPE"],
    [{ amount: 0 }, "INVALID_AMOUNT"],
    [{ amount: -5 }, "INVALID_AMOUNT"],
    [{ amount: "abc" }, "INVALID_AMOUNT"],
    [{ amount: 10.005 }, "INVALID_AMOUNT"],
    [{ amount: null }, "INVALID_AMOUNT"],
    [{ reference_id: "" }, "VALIDATION_ERROR"],
    [{ reference_id: undefined }, "VALIDATION_ERROR"],
    [{ reference_id: "TRF-1-IN" }, "VALIDATION_ERROR"],
    [{ account_id: "abc" }, "INVALID_ACCOUNT_ID"],
    [{ created_at: "2020-01-01" }, "VALIDATION_ERROR"],
  ])("rejects invalid payload %j", async (override, errCode) => {
    const acc = await createAccount();
    const res = await postTransaction(acc.id, "credit", 10, override);
    expect(res.status).toBe(400);
    expect(res.body.errCode).toBe(errCode);
    expect(await getBalance(acc.id)).toBe(0);
  });

  test("404 when the account does not exist", async () => {
    const res = await postTransaction(424242, "credit", 10);
    expect(res.status).toBe(404);
    expect(res.body.errCode).toBe("ACCOUNT_NOT_FOUND");
  });

  test("transactions cannot be edited or deleted via the API", async () => {
    const acc = await createAccount();
    const tx = (await postTransaction(acc.id, "credit", 10)).body.data;
    for (const method of ["put", "patch", "delete"]) {
      const res = await api()[method](`/api/transactions/${tx.id}`).send({ amount: 999 });
      expect(res.status).toBe(405);
      expect(res.body.errCode).toBe("TRANSACTION_IMMUTABLE");
    }
    const after = await api().get(`/api/transactions/${tx.id}`);
    expect(after.body.data.amount).toBe(10);
  });

  test("database rejects direct updates to ledger rows when triggers are installed", async () => {
    const [triggers] = await sequelize.query("SHOW TRIGGERS LIKE 'transactions'");
    if (!triggers.length) return; // trigger creation can be refused on some managed MySQL setups
    const acc = await createAccount();
    const tx = (await postTransaction(acc.id, "credit", 10)).body.data;
    await expect(sequelize.query(`UPDATE transactions SET amount = 1 WHERE id = ${tx.id}`)).rejects.toThrow(/LEDGER_IMMUTABLE/);
  });
});

describe("Concurrency", () => {
  test("parallel debits never overdraw the account", async () => {
    const acc = await createAccount();
    await postTransaction(acc.id, "credit", 100);

    const results = await Promise.all([...Array(10)].map(() => postTransaction(acc.id, "debit", 30)));
    const ok = results.filter((r) => r.status === 201).length;
    const rejected = results.filter((r) => r.status === 422).length;

    expect(ok).toBe(3);
    expect(rejected).toBe(7);
    expect(await getBalance(acc.id)).toBe(10);
  });

  test("parallel duplicates create exactly one transaction", async () => {
    const acc = await createAccount();
    const results = await Promise.all(
      [...Array(6)].map(() => postTransaction(acc.id, "credit", 25, { reference_id: "SAME-REF" })),
    );
    expect(results.filter((r) => r.status === 201)).toHaveLength(1);
    expect(results.filter((r) => r.status === 409)).toHaveLength(5);
    expect(await getBalance(acc.id)).toBe(25);
  });
});

describe("Transaction history", () => {
  const seedHistory = async () => {
    const acc = await createAccount();
    for (let i = 1; i <= 7; i += 1) {
      await postTransaction(acc.id, i % 3 === 0 ? "debit" : "credit", i * 10);
    }
    return acc;
  };

  test("returns latest first with pagination metadata", async () => {
    const acc = await seedHistory();
    const res = await api().get(`/api/accounts/${acc.id}/transactions?page=1&limit=3`);
    expect(res.status).toBe(200);
    const { transactions, pagination } = res.body.data;
    expect(transactions).toHaveLength(3);
    expect(pagination).toMatchObject({ current_page: 1, page_size: 3, total_records: 7, total_pages: 3, has_next_page: true });
    expect(transactions[0].amount).toBe(70);
    const times = transactions.map((t) => new Date(t.created_at).getTime());
    expect([...times].sort((a, b) => b - a)).toEqual(times);
  });

  test("filters by type", async () => {
    const acc = await seedHistory();
    const debits = await api().get(`/api/accounts/${acc.id}/transactions?type=debit`);
    expect(debits.body.data.transactions.every((t) => t.type === "debit")).toBe(true);
    expect(debits.body.data.pagination.total_records).toBe(2);

    const all = await api().get(`/api/accounts/${acc.id}/transactions`);
    expect(all.body.data.pagination.total_records).toBe(7);
  });

  test.each(["page=0", "page=abc", "limit=0", "limit=101", "type=refund"])("rejects invalid query %s", async (qs) => {
    const acc = await createAccount();
    const res = await api().get(`/api/accounts/${acc.id}/transactions?${qs}`);
    expect(res.status).toBe(400);
    expect(["INVALID_PAGINATION", "INVALID_TRANSACTION_TYPE"]).toContain(res.body.errCode);
  });

  test("404 for history of a missing account", async () => {
    const res = await api().get("/api/accounts/987654/transactions");
    expect(res.status).toBe(404);
  });
});

describe("Transfers", () => {
  const setup = async () => {
    const a = await createAccount("A");
    const b = await createAccount("B");
    await postTransaction(a.id, "credit", 100);
    await postTransaction(b.id, "credit", 50);
    return { a, b };
  };

  test("moves money atomically between accounts", async () => {
    const { a, b } = await setup();
    const res = await api()
      .post("/api/transfers")
      .send({ from_account_id: a.id, to_account_id: b.id, amount: 30, reference_id: "T-1" });

    expect(res.status).toBe(201);
    expect(res.body.data.entries).toHaveLength(2);
    expect(await getBalance(a.id)).toBe(70);
    expect(await getBalance(b.id)).toBe(80);
  });

  test("insufficient balance rolls back everything", async () => {
    const { a, b } = await setup();
    const res = await api()
      .post("/api/transfers")
      .send({ from_account_id: a.id, to_account_id: b.id, amount: 500, reference_id: "T-2" });

    expect(res.status).toBe(422);
    expect(await getBalance(a.id)).toBe(100);
    expect(await getBalance(b.id)).toBe(50);
    const transfers = await api().get("/api/transfers");
    expect(transfers.body.data.pagination.total_records).toBe(0);
  });

  test("validates accounts and duplicates", async () => {
    const { a, b } = await setup();
    const same = await api().post("/api/transfers").send({ from_account_id: a.id, to_account_id: a.id, amount: 1, reference_id: "X" });
    expect(same.status).toBe(400);
    expect(same.body.errCode).toBe("SAME_ACCOUNT_TRANSFER");

    const missing = await api().post("/api/transfers").send({ from_account_id: a.id, to_account_id: 99999, amount: 1, reference_id: "X" });
    expect(missing.status).toBe(404);

    const body = { from_account_id: a.id, to_account_id: b.id, amount: 10, reference_id: "T-DUP" };
    expect((await api().post("/api/transfers").send(body)).status).toBe(201);
    const dup = await api().post("/api/transfers").send(body);
    expect(dup.status).toBe(409);
    expect(dup.body.errCode).toBe("DUPLICATE_TRANSFER");
    expect(await getBalance(a.id)).toBe(90);
  });
});

describe("Misc", () => {
  test("unknown routes return a consistent 404", async () => {
    const res = await api().get("/api/nope");
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ success: false, errCode: "ROUTE_NOT_FOUND" });
  });

  test("dashboard summary aggregates the ledger", async () => {
    const acc = await createAccount();
    await postTransaction(acc.id, "credit", 100);
    await postTransaction(acc.id, "debit", 40);
    const res = await api().get("/api/dashboard/summary?tz_offset=330");
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ total_accounts: 1, total_balance: 60, total_credit: 100, total_debit: 40, transaction_count: 2 });
    expect(res.body.data.daily_volume).toHaveLength(14);
  });
});
