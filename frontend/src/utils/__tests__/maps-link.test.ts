import { describe, expect, it } from "vitest";
import { buildMapsLink, detectMapsPlatform } from "@/utils/maps-link";

describe("detectMapsPlatform", () => {
  it("mengenali iPhone, iPad (termasuk iPadOS yang mengaku Mac), dan Android", () => {
    expect(detectMapsPlatform("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)")).toBe(
      "ios",
    );
    expect(detectMapsPlatform("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", 5)).toBe("ios");
    expect(detectMapsPlatform("Mozilla/5.0 (Linux; Android 14; Pixel 8)")).toBe("android");
  });

  it("Mac dan Windows tanpa layar sentuh dianggap desktop", () => {
    expect(detectMapsPlatform("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", 0)).toBe(
      "desktop",
    );
    expect(detectMapsPlatform("Mozilla/5.0 (Windows NT 10.0; Win64; x64)")).toBe("desktop");
  });
});

describe("buildMapsLink", () => {
  const lat = -6.9608;
  const lng = 107.604;

  it("desktop → Google Maps di tab baru", () => {
    expect(buildMapsLink(lat, lng, "Sensor", "desktop")).toEqual({
      href: "https://www.google.com/maps/search/?api=1&query=-6.9608,107.604",
      label: "Buka di Google Maps",
      newTab: true,
    });
  });

  it("Android → URI geo: dengan nama ter-encode, di tab yang sama", () => {
    const link = buildMapsLink(lat, lng, "Sensor Banjir & Co", "android");
    expect(link.href).toBe("geo:-6.9608,107.604?q=-6.9608,107.604(Sensor%20Banjir%20%26%20Co)");
    expect(link.newTab).toBe(false);
  });

  it("iOS → Apple Maps", () => {
    expect(buildMapsLink(lat, lng, "Sensor", "ios").href).toBe(
      "https://maps.apple.com/?ll=-6.9608,107.604&q=Sensor",
    );
  });
});
