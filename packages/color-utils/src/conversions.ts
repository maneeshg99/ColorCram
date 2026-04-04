import type { HSB, RGB, XYZ, LAB } from "@colorcram/types";

/**
 * HSB to RGB conversion.
 * H: 0-360, S: 0-100, B: 0-100 -> R,G,B: 0-255
 */
export function hsbToRgb(hsb: HSB): RGB {
  const h = hsb.h / 60;
  const s = hsb.s / 100;
  const v = hsb.b / 100;

  const c = v * s;
  const x = c * (1 - Math.abs((h % 2) - 1));
  const m = v - c;

  let r1: number, g1: number, b1: number;

  if (h < 1) {
    [r1, g1, b1] = [c, x, 0];
  } else if (h < 2) {
    [r1, g1, b1] = [x, c, 0];
  } else if (h < 3) {
    [r1, g1, b1] = [0, c, x];
  } else if (h < 4) {
    [r1, g1, b1] = [0, x, c];
  } else if (h < 5) {
    [r1, g1, b1] = [x, 0, c];
  } else {
    [r1, g1, b1] = [c, 0, x];
  }

  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255),
  };
}

/**
 * RGB to HSB conversion.
 */
export function rgbToHsb(rgb: RGB): HSB {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;

  let h = 0;
  if (d !== 0) {
    if (max === r) {
      h = ((g - b) / d) % 6;
    } else if (max === g) {
      h = (b - r) / d + 2;
    } else {
      h = (r - g) / d + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }

  const s = max === 0 ? 0 : (d / max) * 100;
  const v = max * 100;

  return { h, s, b: v };
}

/**
 * sRGB gamma decompression (linearize).
 */
function srgbToLinear(c: number): number {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

/**
 * RGB to XYZ (D65 illuminant).
 */
export function rgbToXyz(rgb: RGB): XYZ {
  const r = srgbToLinear(rgb.r);
  const g = srgbToLinear(rgb.g);
  const b = srgbToLinear(rgb.b);

  return {
    x: 0.4124564 * r + 0.3575761 * g + 0.1804375 * b,
    y: 0.2126729 * r + 0.7151522 * g + 0.072175 * b,
    z: 0.0193339 * r + 0.119192 * g + 0.9503041 * b,
  };
}

// D65 reference white
const D65 = { x: 0.95047, y: 1.0, z: 1.08883 };

/**
 * XYZ to CIELAB.
 */
export function xyzToLab(xyz: XYZ): LAB {
  const epsilon = 0.008856;
  const kappa = 903.3;

  function f(t: number): number {
    return t > epsilon ? Math.cbrt(t) : (kappa * t + 16) / 116;
  }

  const fx = f(xyz.x / D65.x);
  const fy = f(xyz.y / D65.y);
  const fz = f(xyz.z / D65.z);

  return {
    l: 116 * fy - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz),
  };
}

/**
 * Composite: HSB -> LAB (via RGB -> XYZ -> LAB).
 */
export function hsbToLab(hsb: HSB): LAB {
  return xyzToLab(rgbToXyz(hsbToRgb(hsb)));
}

/**
 * HSB to hex string.
 */
export function hsbToHex(hsb: HSB): string {
  const rgb = hsbToRgb(hsb);
  return (
    "#" +
    [rgb.r, rgb.g, rgb.b]
      .map((c) => c.toString(16).padStart(2, "0"))
      .join("")
  );
}

/**
 * Hex string to RGB.
 */
export function hexToRgb(hex: string): RGB {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

/**
 * Hex string to HSB.
 */
export function hexToHsb(hex: string): HSB {
  return rgbToHsb(hexToRgb(hex));
}
