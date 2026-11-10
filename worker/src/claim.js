// Food claim links: the payer's app saves a food bill here and shares a link; friends open the link (k.html),
// pick their name and tick what they ordered. Later they say when they have transferred, and the payer confirms.
// Storage is a D1 database bound as DB. Tables are created on first use.
//
// POST   /claim                      create a bill            -> { code, admin }
// GET    /claim/:code                bill, claims, payments   (public)
// PUT    /claim/:code                update data/finals/closed (X-Admin)
// POST   /claim/:code/claim          { name, items: [ids] }   (public, while open)
// POST   /claim/:code/pay            { name, proof? }         (public, after the bill is sent)
// POST   /claim/:code/confirm        { name, status }         (X-Admin; status "paid" or "none")
// GET    /claim/:code/proof/:name    transfer screenshot      (X-Admin)

const CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const KEEP_DAYS = 30;
const MAX_DATA = 60000;
const MAX_PROOF = 700000;

const json = (body, status, headers) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...headers } });
const rand = (n, chars) => [...crypto.getRandomValues(new Uint8Array(n))].map(x => chars[x % chars.length]).join("");
const now = () => Date.now();

let ready = null;
function ensure(db) {
  if (!ready) ready = db.batch([
    db.prepare("CREATE TABLE IF NOT EXISTS bills (code TEXT PRIMARY KEY, admin TEXT NOT NULL, data TEXT NOT NULL, finals TEXT, closed INTEGER NOT NULL DEFAULT 0, created INTEGER NOT NULL)"),
    db.prepare("CREATE TABLE IF NOT EXISTS claims (code TEXT NOT NULL, name TEXT NOT NULL, items TEXT NOT NULL, updated INTEGER NOT NULL, PRIMARY KEY (code, name))"),
    db.prepare("CREATE TABLE IF NOT EXISTS pays (code TEXT NOT NULL, name TEXT NOT NULL, status TEXT NOT NULL, proof TEXT, updated INTEGER NOT NULL, PRIMARY KEY (code, name))")
  ]).catch(e => { ready = null; throw e; });
  return ready;
}

function people(bill) {
  try { return (JSON.parse(bill.data).people || []).map(String); } catch { return []; }
}

export async function handleClaim(request, env, headers) {
  // Any D1 binding works; DB is the suggested name.
  const db = env.DB || Object.values(env).find(v => v && typeof v.prepare === "function" && typeof v.batch === "function");
  if (!db) return json({ error: "no_db" }, 503, headers);
  await ensure(db);
  const url = new URL(request.url);
  const parts = url.pathname.split("/").filter(Boolean); // ["claim", code?, action?, name?]
  const code = (parts[1] || "").toUpperCase();
  const action = parts[2] || "";
  const m = request.method;
  let body = {};
  if (m === "POST" || m === "PUT") {
    try { body = await request.json(); } catch { return json({ error: "bad_request" }, 400, headers); }
    if (!body || typeof body !== "object") return json({ error: "bad_request" }, 400, headers);
  }

  if (!code) {
    if (m !== "POST") return json({ error: "method" }, 405, headers);
    const data = JSON.stringify(body.data || null);
    if (!body.data || data.length > MAX_DATA) return json({ error: "bad_data" }, 400, headers);
    const old = now() - KEEP_DAYS * 864e5;
    const gone = (await db.prepare("SELECT code FROM bills WHERE created < ?").bind(old).all()).results || [];
    if (gone.length) await db.batch(gone.flatMap(g => ["bills", "claims", "pays"].map(t => db.prepare(`DELETE FROM ${t} WHERE code = ?`).bind(g.code))));
    for (let i = 0; i < 5; i++) {
      const c = rand(6, CODE_CHARS), admin = rand(32, "abcdefghijklmnopqrstuvwxyz0123456789");
      try {
        await db.prepare("INSERT INTO bills (code, admin, data, created) VALUES (?, ?, ?, ?)").bind(c, admin, data, now()).run();
        return json({ code: c, admin }, 200, headers);
      } catch (e) { /* code taken, try another */ }
    }
    return json({ error: "busy" }, 503, headers);
  }

  const bill = await db.prepare("SELECT * FROM bills WHERE code = ?").bind(code).first();
  if (!bill) return json({ error: "not_found" }, 404, headers);
  const isAdmin = (request.headers.get("X-Admin") || "") === bill.admin;
  const names = people(bill);
  const known = n => typeof n === "string" && names.includes(n);

  if (!action && m === "GET") {
    const claims = (await db.prepare("SELECT name, items, updated FROM claims WHERE code = ?").bind(code).all()).results || [];
    const pays = (await db.prepare("SELECT name, status, proof IS NOT NULL AND proof != '' AS hasProof, updated FROM pays WHERE code = ?").bind(code).all()).results || [];
    return json({
      code,
      data: JSON.parse(bill.data),
      finals: bill.finals ? JSON.parse(bill.finals) : null,
      closed: !!bill.closed,
      claims: Object.fromEntries(claims.map(c => [c.name, { items: JSON.parse(c.items), updated: c.updated }])),
      pays: Object.fromEntries(pays.map(p => [p.name, { status: p.status, proof: !!p.hasProof, updated: p.updated }]))
    }, 200, { ...headers, "Cache-Control": "no-store" });
  }

  if (!action && m === "PUT") {
    if (!isAdmin) return json({ error: "forbidden" }, 403, headers);
    const sets = [], vals = [];
    if (body.data !== undefined) {
      const data = JSON.stringify(body.data);
      if (!body.data || data.length > MAX_DATA) return json({ error: "bad_data" }, 400, headers);
      sets.push("data = ?"); vals.push(data);
    }
    if (body.finals !== undefined) {
      const f = body.finals && typeof body.finals === "object" ? JSON.stringify(body.finals) : null;
      if (f && f.length > MAX_DATA) return json({ error: "bad_data" }, 400, headers);
      sets.push("finals = ?"); vals.push(f);
    }
    if (body.closed !== undefined) { sets.push("closed = ?"); vals.push(body.closed ? 1 : 0); }
    if (sets.length) await db.prepare(`UPDATE bills SET ${sets.join(", ")} WHERE code = ?`).bind(...vals, code).run();
    return json({ ok: true }, 200, headers);
  }

  if (action === "claim" && m === "POST") {
    if (bill.closed) return json({ error: "closed" }, 409, headers);
    if (!known(body.name)) return json({ error: "bad_name" }, 400, headers);
    const items = Array.isArray(body.items) ? body.items.filter(x => typeof x === "string" && x.length < 40).slice(0, 300) : null;
    if (!items) return json({ error: "bad_items" }, 400, headers);
    await db.prepare("INSERT INTO claims (code, name, items, updated) VALUES (?, ?, ?, ?) ON CONFLICT (code, name) DO UPDATE SET items = excluded.items, updated = excluded.updated")
      .bind(code, body.name, JSON.stringify(items), now()).run();
    return json({ ok: true }, 200, headers);
  }

  if (action === "pay" && m === "POST") {
    if (!bill.finals) return json({ error: "not_sent" }, 409, headers);
    if (!known(body.name)) return json({ error: "bad_name" }, 400, headers);
    const proof = typeof body.proof === "string" && /^data:image\/(jpeg|png|webp);base64,/.test(body.proof) ? body.proof : null;
    if (proof && proof.length > MAX_PROOF) return json({ error: "proof_too_big" }, 413, headers);
    const cur = await db.prepare("SELECT status FROM pays WHERE code = ? AND name = ?").bind(code, body.name).first();
    if (cur && cur.status === "paid") return json({ ok: true, status: "paid" }, 200, headers);
    await db.prepare("INSERT INTO pays (code, name, status, proof, updated) VALUES (?, ?, 'sent', ?, ?) ON CONFLICT (code, name) DO UPDATE SET status = 'sent', proof = COALESCE(excluded.proof, pays.proof), updated = excluded.updated")
      .bind(code, body.name, proof, now()).run();
    return json({ ok: true, status: "sent" }, 200, headers);
  }

  if (action === "confirm" && m === "POST") {
    if (!isAdmin) return json({ error: "forbidden" }, 403, headers);
    if (!known(body.name)) return json({ error: "bad_name" }, 400, headers);
    if (body.status === "paid") {
      await db.prepare("INSERT INTO pays (code, name, status, updated) VALUES (?, ?, 'paid', ?) ON CONFLICT (code, name) DO UPDATE SET status = 'paid', updated = excluded.updated")
        .bind(code, body.name, now()).run();
    } else {
      await db.prepare("DELETE FROM pays WHERE code = ? AND name = ?").bind(code, body.name).run();
    }
    return json({ ok: true }, 200, headers);
  }

  if (action === "proof" && m === "GET") {
    if (!isAdmin) return json({ error: "forbidden" }, 403, headers);
    const name = decodeURIComponent(parts.slice(3).join("/"));
    const row = await db.prepare("SELECT proof FROM pays WHERE code = ? AND name = ?").bind(code, name).first();
    return json({ proof: row && row.proof || null }, 200, { ...headers, "Cache-Control": "no-store" });
  }

  return json({ error: "not_found" }, 404, headers);
}
