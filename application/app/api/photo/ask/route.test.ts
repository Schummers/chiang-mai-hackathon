import { beforeEach, describe, expect, it, vi } from "vitest";

const generate = vi.fn();
vi.mock("@/lib/server/gemini", () => ({ generate: (...a: unknown[]) => generate(...a), TURN_MODEL: "main" }));

const { POST } = await import("./route");

const card = { kind: "menu", title: "Menu", description: "Northern dishes.", items: [{ name: "Khao Soi" }] };
const jpeg = new Blob([new Uint8Array([0xff, 0xd8, 0xff])], { type: "image/jpeg" });

function request(fields: { image?: Blob | null; question?: string; card?: string } = {}) {
  const form = new FormData();
  if (fields.image !== null) form.append("image", fields.image ?? jpeg);
  form.append("question", fields.question ?? "which one is not spicy?");
  form.append("card", fields.card ?? JSON.stringify(card));
  form.append("language", "fr");
  form.append("myInfo", JSON.stringify({ allergies: ["peanuts"], spice: null, diet: [] }));
  return new Request("http://x/api/photo/ask", { method: "POST", body: form });
}

beforeEach(() => {
  generate.mockReset();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("POST /api/photo/ask", () => {
  it("answers with the image, the card and the question as context", async () => {
    generate.mockResolvedValue(JSON.stringify({ answer: "Le Khao Soi est doux." }));
    const res = await POST(request());
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ answer: "Le Khao Soi est doux." });
    const [, parts] = generate.mock.calls[0];
    expect(parts[0].inlineData.mimeType).toBe("image/jpeg");
    expect(parts[1].text).toContain("which one is not spicy?");
    expect(parts[1].text).toContain("Khao Soi");
    expect(parts[1].text).toContain("French");
    expect(parts[1].text).toContain("peanuts");
  });

  it("400 without an image or a question", async () => {
    expect((await POST(request({ image: null }))).status).toBe(400);
    expect((await POST(request({ question: "  " }))).status).toBe(400);
    expect((await POST(request({ card: "null" }))).status).toBe(400);
    expect((await POST(request({ card: "{}" }))).status).toBe(400);
  });

  it("413 over 4 MB", async () => {
    expect((await POST(request({ image: new Blob([new Uint8Array(4 * 1024 * 1024 + 1)]) }))).status).toBe(413);
  });

  it("502 on provider failure or an empty answer", async () => {
    generate.mockRejectedValueOnce(new Error("503"));
    expect((await POST(request())).status).toBe(502);
    generate.mockResolvedValueOnce(JSON.stringify({ answer: "" }));
    expect((await POST(request())).status).toBe(502);
  });
});
