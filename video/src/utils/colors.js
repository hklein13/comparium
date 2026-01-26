/**
 * Color utilities and palettes for generative art
 * Aquarium-themed color schemes
 */

// Predefined color palettes (hex format)
export const palettes = {
  deepOcean: {
    name: "Deep Ocean",
    colors: ["#0a1628", "#1a3a5c", "#2d5a87", "#4a7c9b", "#6ba3c7"],
    accent: "#88d4f5",
    highlight: "#ffffff",
  },
  tropical: {
    name: "Tropical",
    colors: ["#004d40", "#00695c", "#00897b", "#26a69a", "#4db6ac"],
    accent: "#ffd54f",
    highlight: "#ffecb3",
  },
  plantedTank: {
    name: "Planted Tank",
    colors: ["#1b3d2f", "#2d5a43", "#3e7857", "#5a9b71", "#7bc08f"],
    accent: "#c8e6c9",
    highlight: "#e8f5e9",
  },
  golden: {
    name: "Golden Hour",
    colors: ["#1a1a2e", "#16213e", "#0f3460", "#533483", "#e94560"],
    accent: "#ffd700",
    highlight: "#ffe066",
  },
  midnight: {
    name: "Midnight",
    colors: ["#0d0d1a", "#1a1a33", "#26264d", "#333366", "#404080"],
    accent: "#9999ff",
    highlight: "#ccccff",
  },
  coral: {
    name: "Coral Reef",
    colors: ["#1a0a14", "#3d1a2d", "#5c2a45", "#8c4a6d", "#b86b8f"],
    accent: "#ff6b9d",
    highlight: "#ffa0c0",
  },
};

/**
 * Parse hex color to RGB object
 * @param {string} hex - Hex color string (e.g., "#ff0000")
 * @returns {{r: number, g: number, b: number}} RGB values (0-255)
 */
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

/**
 * Convert RGB to hex string
 * @param {number} r - Red (0-255)
 * @param {number} g - Green (0-255)
 * @param {number} b - Blue (0-255)
 * @returns {string} Hex color string
 */
export function rgbToHex(r, g, b) {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = Math.round(Math.max(0, Math.min(255, x))).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
}

/**
 * Convert RGB to HSL
 * @param {number} r - Red (0-255)
 * @param {number} g - Green (0-255)
 * @param {number} b - Blue (0-255)
 * @returns {{h: number, s: number, l: number}} HSL values (h: 0-360, s: 0-100, l: 0-100)
 */
export function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

/**
 * Convert HSL to RGB
 * @param {number} h - Hue (0-360)
 * @param {number} s - Saturation (0-100)
 * @param {number} l - Lightness (0-100)
 * @returns {{r: number, g: number, b: number}} RGB values (0-255)
 */
export function hslToRgb(h, s, l) {
  h /= 360;
  s /= 100;
  l /= 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

/**
 * Linearly interpolate between two colors
 * @param {string} color1 - First hex color
 * @param {string} color2 - Second hex color
 * @param {number} t - Interpolation factor (0-1)
 * @returns {string} Interpolated hex color
 */
export function lerpColor(color1, color2, t) {
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);

  const r = Math.round(c1.r + (c2.r - c1.r) * t);
  const g = Math.round(c1.g + (c2.g - c1.g) * t);
  const b = Math.round(c1.b + (c2.b - c1.b) * t);

  return rgbToHex(r, g, b);
}

/**
 * Get a color from a palette gradient at position t
 * @param {Object} palette - Palette object with colors array
 * @param {number} t - Position in gradient (0-1)
 * @returns {string} Hex color at position
 */
export function getPaletteColor(palette, t) {
  const colors = palette.colors;
  const numColors = colors.length;

  if (t <= 0) return colors[0];
  if (t >= 1) return colors[numColors - 1];

  const scaledT = t * (numColors - 1);
  const index = Math.floor(scaledT);
  const localT = scaledT - index;

  return lerpColor(colors[index], colors[index + 1], localT);
}

/**
 * Create RGBA string for canvas
 * @param {string} hex - Hex color
 * @param {number} alpha - Alpha (0-1)
 * @returns {string} RGBA string
 */
export function hexToRgba(hex, alpha = 1) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Lighten a color
 * @param {string} hex - Hex color
 * @param {number} amount - Amount to lighten (0-100)
 * @returns {string} Lightened hex color
 */
export function lighten(hex, amount) {
  const { r, g, b } = hexToRgb(hex);
  const { h, s, l } = rgbToHsl(r, g, b);
  const newL = Math.min(100, l + amount);
  const rgb = hslToRgb(h, s, newL);
  return rgbToHex(rgb.r, rgb.g, rgb.b);
}

/**
 * Darken a color
 * @param {string} hex - Hex color
 * @param {number} amount - Amount to darken (0-100)
 * @returns {string} Darkened hex color
 */
export function darken(hex, amount) {
  const { r, g, b } = hexToRgb(hex);
  const { h, s, l } = rgbToHsl(r, g, b);
  const newL = Math.max(0, l - amount);
  const rgb = hslToRgb(h, s, newL);
  return rgbToHex(rgb.r, rgb.g, rgb.b);
}
