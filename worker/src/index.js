// Bagi Rata bill reader: the app posts a photo of a restaurant bill, Claude reads the items and prices.
// The Anthropic API key lives only here (secret ANTHROPIC_API_KEY), so app users need no AI account.
import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-sonnet-5-5";
const MAX_IMAGE = 5 * 1024 * 1024; // base64 characters; the app sends about 300-600 KB
const ORIGINS = ["https://liuskusuma.github.io"];

const SCHEMA = {
  type: "object",
  properties: {
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string", description: "Item name as printed, tidied (no codes, no qty prefix)" },
          qty: { type: "integer", description: "Number of portions on this line" },
          total: { type: "integer", description: "Line total in rupiah (qty x unit price), whole number" }
        },
        required: ["name", "qty", "total"],
        additionalProperties: false
      }
    },
    subtotal: { type: "integer", description: "Printed subtotal before tax and service, 0 if none" },
    extras: {
      type: "array",
      description: "Tax, service charge, PB1 and similar additions printed on the bill (not discounts)",
      items: {
        type: "object",
        properties: { label: { type: "string" }, amount: { type: "integer" } },
        required: ["label", "amount"],
        additionalProperties: false
      }
    },
    discount: { type: "integer", description: "Total discount printed on the bill as a positive number, 0 if none" },
    count: { type: "integer", description: "Item or portion count printed on the bill (e.g. '13 items'), 0 if none" }
  },
  required: ["items", "subtotal", "extras", "discount", "count"],
  additionalProperties: false
};

const PROMPT = `This is a photo of a restaurant or cafe bill, usually Indonesian. List every food and drink line.
- Prices are rupiah. "25.000", "25,000" and "25rb" all mean 25000. Return whole numbers.
- total is the line total (what the bill prints at the right of that line). If only a unit price is printed, multiply by qty.
- Do not list subtotal, tax, PB1, service, rounding, payment, change or discount lines as items; put tax and service in extras.
- Keep modifiers (like "Pedas" or "Less sugar") inside the item name only if they have no price of their own; a priced add-on is its own item.
- Check that the item totals add up to the printed subtotal. If they do not, look again at the digits that might be misread.
- If the photo is not a bill, return an empty items list.`;

function cors(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin"
  };
}
const reply = (body, status, origin) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...cors(origin) } });

// Optional daily limit per visitor, if a KV namespace is bound as LIMITS (DAILY_LIMIT, default 20).
async function overLimit(env, request) {
  if (!env.LIMITS) return false;
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const key = `${new Date().toISOString().slice(0, 10)}:${ip}`;
  const used = +(await env.LIMITS.get(key)) || 0;
  if (used >= (+env.DAILY_LIMIT || 20)) return true;
  await env.LIMITS.put(key, String(used + 1), { expirationTtl: 172800 });
  return false;
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowed = ORIGINS.concat((env.ALLOWED_ORIGINS || "").split(",").map(s => s.trim()).filter(Boolean));
    if (!allowed.includes(origin)) return new Response("Forbidden", { status: 403 });
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(origin) });
    if (request.method !== "POST") return reply({ error: "method" }, 405, origin);

    let image, mediaType;
    try { ({ image, mediaType } = await request.json()); } catch { return reply({ error: "bad_request" }, 400, origin); }
    if (typeof image !== "string" || !image || image.length > MAX_IMAGE) return reply({ error: "bad_image" }, 400, origin);
    if (!["image/jpeg", "image/png", "image/webp"].includes(mediaType)) mediaType = "image/jpeg";
    if (await overLimit(env, request)) return reply({ error: "limit" }, 429, origin);

    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
    try {
      const msg = await client.messages.create({
        model: env.MODEL || MODEL,
        max_tokens: 4000,
        output_config: { format: { type: "json_schema", schema: SCHEMA } },
        messages: [{
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: image } },
            { type: "text", text: PROMPT }
          ]
        }]
      });
      if (msg.stop_reason === "refusal" || msg.stop_reason === "max_tokens") return reply({ error: "unreadable" }, 422, origin);
      const text = msg.content.find(b => b.type === "text")?.text || "{}";
      return reply(JSON.parse(text), 200, origin);
    } catch (e) {
      const status = e instanceof Anthropic.APIError ? e.status : 0;
      console.log("scan failed", status, e?.message);
      return reply({ error: status === 429 || status === 529 ? "busy" : "ai_failed" }, 502, origin);
    }
  }
};
