import { getStore } from "@netlify/blobs";

// ฐานข้อมูลกลาง (Netlify Blobs) — ถ้าตั้ง APP_KEY ไว้ ต้องส่งรหัสมาด้วยจึงอ่าน/เขียนได้
export default async (req) => {
  const need = Netlify.env.get("APP_KEY");
  if (need && req.headers.get("x-app-key") !== need) return new Response("unauthorized", { status: 401 });

  const store = getStore({ name: "trainer", consistency: "strong" });
  const id = decodeURIComponent(new URL(req.url).pathname.replace(/^\/api\/db\/?/, ""));
  if (id && !/^[A-Za-z0-9_.-]{1,80}$/.test(id)) return new Response("bad key", { status: 400 });

  if (req.method === "GET" && !id) {
    const { blobs } = await store.list();
    const out = {};
    await Promise.all(blobs.map(async (b) => { out[b.key] = await store.get(b.key); }));
    return Response.json(out);
  }
  if (req.method === "PUT" && id) { await store.set(id, await req.text()); return Response.json({ ok: 1 }); }
  if (req.method === "DELETE" && id) { await store.delete(id); return Response.json({ ok: 1 }); }
  return new Response("bad request", { status: 400 });
};

export const config = { path: ["/api/db", "/api/db/*"] };
