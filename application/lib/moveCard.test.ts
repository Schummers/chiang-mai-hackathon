import { describe, expect, it } from "vitest";
import type { MoveCard } from "./engine/types";
import { moveLines } from "./moveCard";

const base: MoveCard = {
  id: "say-hello",
  type: "say",
  stage: "start",
  english: "Hello",
  centralThai: "สวัสดีครับ",
  khamMueang: "สะหวัดดีคับ",
  romanised: { central: "sa-wat-dee khrap", khamMueang: "sa-wat-dee khap" },
};

describe("moveLines", () => {
  it("labels the three types in English", () => {
    expect(moveLines(base).label).toBe("Say it");
    expect(moveLines({ ...base, type: "ask" }).label).toBe("Ask");
    expect(moveLines({ ...base, type: "echo" }).label).toBe("Echo");
  });

  it("puts Kham Mueang big, Central Thai small, the romanised of the big line, English last", () => {
    expect(moveLines(base)).toMatchObject({
      big: "สะหวัดดีคับ",
      small: "สวัสดีครับ",
      roman: "sa-wat-dee khap",
      english: "Hello",
      speak: "สะหวัดดีคับ",
    });
  });

  it("gives Central Thai the big line when there is no Kham Mueang", () => {
    const lines = moveLines({ ...base, khamMueang: null, romanised: { central: "sa-wat-dee khrap", khamMueang: null } });
    expect(lines).toMatchObject({ big: "สวัสดีครับ", small: null, roman: "sa-wat-dee khrap", speak: "สวัสดีครับ" });
  });

  it("Echo: shows what the Vendor's word meant and the reply in English", () => {
    const echo: MoveCard = {
      ...base,
      id: "echo-sao",
      type: "echo",
      english: "Vendor says a price with 'ซาว' (= 20) -> repeat it: 'Twenty baht!'",
      centralThai: "ยี่สิบบาทครับ",
      khamMueang: "ซาวบาทคับ",
      heard: "ซาว",
      heardMeaning: "20",
    };
    expect(moveLines(echo)).toMatchObject({ heard: "ซาว = 20", english: "Twenty baht!", big: "ซาวบาทคับ" });
  });

  it("Echo: keeps apostrophes inside the quoted reply, and plain replies as they are", () => {
    const e = { ...base, type: "echo" as const, heard: "สบายดีบ๋อ" };
    expect(moveLines({ ...e, english: "Vendor asks 'สบายดีบ๋อ' (how are you?) -> 'I'm fine'" }).english).toBe("I'm fine");
    expect(moveLines({ ...e, english: "Vendor thanks you with 'ยินดีเจ้า' -> thank them back the Northern way" }).english).toBe(
      "Thank them back the Northern way",
    );
    // No meaning known: the heard word alone.
    expect(moveLines(e).heard).toBe("สบายดีบ๋อ");
  });

  it("Say it and Ask carry no heard line", () => {
    expect(moveLines(base).heard).toBeNull();
  });
});
