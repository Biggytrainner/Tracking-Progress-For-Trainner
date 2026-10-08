import { getStore } from "@netlify/blobs";

// ฐานข้อมูลกลาง: เก็บเป็น Netlify Blobs (key-value) ไม่ต้องสมัครบริการอื่น
export default async (req) => {
  const need = Netlify.env.get("APP_KEY");
  if (need && req.headers.get("x-app-key") !== need) {
    return new Response("unauthorized", { status: 401 });
  }
  const store = getStore({ name: "trainer", consistency: "strong" });
  const id = decodeURIComponent(new URL(req.url).pathname.replace(/^\/api\/db\/?/, ""));

  if (req.method === "GET" && !id) {
    const { blobs } = await store.list();
    const out = {};
    await Promise.all(blobs.map(async (b) => { out[b.key] = await store.get(b.key); }));
    return Response.json(out);
  }
  if (req.method === "PUT" && id) {
    await store.set(id, await req.text());
    return Response.json({ ok: 1 });
  }
  if (req.method === "DELETE" && id) {
    await store.delete(id);
    return Response.json({ ok: 1 });
  }
  return new Response("bad request", { status: 400 });
};

export const config = { path: ["/api/db", "/api/db/*"] };
