import { beforeEach, describe, expect, it, vi } from "vitest";

const generate = vi.fn();
vi.mock("@/lib/server/gemini", () => ({ generate: (...a: unknown[]) => generate(...a), TURN_MODEL: "main" }));

const { POST } = await import("./route");

function request(image: Blob | null, extra: Record<string, string> = {}) {
  const form = new FormData();
  if (image) form.append("image", image);
  form.append("language", extra.language ?? "en");
  form.append("myInfo", extra.myInfo ?? JSON.stringify({ allergies: ["peanuts"], spice: null, diet: [] }));
  return new Request("http://x/api/photo", { method: "POST", body: form });
}

const jpeg = new Blob([new Uint8Array([0xff, 0xd8, 0xff])], { type: "image/jpeg" });

beforeEach(() => {
  generate.mockReset();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("POST /api/photo", () => {
  it("returns a PhotoCard read by the model, with the image inline", async () => {
    generate.mockResolvedValue(JSON.stringify({ kind: "produce", title: "Longan", titleThai: "ลำไย", description: "Peel and eat." }));
    const res = await POST(request(jpeg, { language: "fr" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ kind: "produce", title: "Longan", titleThai: "ลำไย", description: "Peel and eat." });
    const [, parts, opts] = generate.mock.calls[0];
    expect(parts[0].inlineData.mimeType).toBe("image/jpeg");
    expect(parts[1].text).toContain("French");
    expect(opts.schema).toBeTruthy();
  });

  it("400 without an image", async () => {
    expect((await POST(request(null))).status).toBe(400);
  });

  it("413 over 4 MB", async () => {
    const big = new Blob([new Uint8Array(4 * 1024 * 1024 + 1)], { type: "image/jpeg" });
    expect((await POST(request(big))).status).toBe(413);
    expect(generate).not.toHaveBeenCalled();
  });

  it("502 when the provider fails or the key is missing", async () => {
    generate.mockRejectedValue(new Error("GEMINI_API_KEY is not set"));
    expect((await POST(request(jpeg))).status).toBe(502);
  });

  it("a malformed model answer still gives a Sign card", async () => {
    generate.mockResolvedValue("not json");
    const res = await POST(request(jpeg));
    expect(res.status).toBe(200);
    expect((await res.json()).kind).toBe("sign");
  });
});
