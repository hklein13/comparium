/**
 * Canvas drawing utilities for generative art
 */

import { hexToRgba, getPaletteColor } from "./colors.js";

/**
 * Clear canvas with optional color
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {string} [color] - Optional fill color (hex)
 */
export function clearCanvas(ctx, width, height, color) {
  if (color) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);
  } else {
    ctx.clearRect(0, 0, width, height);
  }
}

/**
 * Draw a vertical linear gradient
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {Object} palette - Palette object with colors array
 */
export function drawVerticalGradient(ctx, width, height, palette) {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  const colors = palette.colors;

  colors.forEach((color, i) => {
    gradient.addColorStop(i / (colors.length - 1), color);
  });

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

/**
 * Draw a radial gradient
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x - Center X
 * @param {number} y - Center Y
 * @param {number} innerRadius - Inner radius
 * @param {number} outerRadius - Outer radius
 * @param {string} innerColor - Inner color (hex)
 * @param {string} outerColor - Outer color (hex)
 */
export function drawRadialGradient(
  ctx,
  x,
  y,
  innerRadius,
  outerRadius,
  innerColor,
  outerColor
) {
  const gradient = ctx.createRadialGradient(
    x,
    y,
    innerRadius,
    x,
    y,
    outerRadius
  );
  gradient.addColorStop(0, innerColor);
  gradient.addColorStop(1, outerColor);

  ctx.fillStyle = gradient;
  ctx.fillRect(x - outerRadius, y - outerRadius, outerRadius * 2, outerRadius * 2);
}

/**
 * Draw a filled circle
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x - Center X
 * @param {number} y - Center Y
 * @param {number} radius - Radius
 * @param {string} color - Fill color (hex or rgba)
 */
export function drawCircle(ctx, x, y, radius, color) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

/**
 * Draw a circle with gradient fill (for bubble effect)
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x - Center X
 * @param {number} y - Center Y
 * @param {number} radius - Radius
 * @param {string} baseColor - Base color (hex)
 * @param {number} alpha - Overall alpha (0-1)
 */
export function drawBubble(ctx, x, y, radius, baseColor, alpha = 0.6) {
  // Main bubble body
  const gradient = ctx.createRadialGradient(
    x - radius * 0.3,
    y - radius * 0.3,
    radius * 0.1,
    x,
    y,
    radius
  );
  gradient.addColorStop(0, hexToRgba(baseColor, alpha * 0.9));
  gradient.addColorStop(0.5, hexToRgba(baseColor, alpha * 0.4));
  gradient.addColorStop(1, hexToRgba(baseColor, alpha * 0.1));

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();

  // Highlight
  const highlightGradient = ctx.createRadialGradient(
    x - radius * 0.3,
    y - radius * 0.4,
    0,
    x - radius * 0.3,
    y - radius * 0.4,
    radius * 0.4
  );
  highlightGradient.addColorStop(0, hexToRgba("#ffffff", alpha * 0.8));
  highlightGradient.addColorStop(1, hexToRgba("#ffffff", 0));

  ctx.beginPath();
  ctx.arc(x - radius * 0.3, y - radius * 0.4, radius * 0.4, 0, Math.PI * 2);
  ctx.fillStyle = highlightGradient;
  ctx.fill();
}

/**
 * Draw a light ray (volumetric beam)
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x - Top X position
 * @param {number} topWidth - Width at top
 * @param {number} bottomWidth - Width at bottom
 * @param {number} height - Ray height
 * @param {string} color - Ray color (hex)
 * @param {number} alpha - Opacity (0-1)
 */
export function drawLightRay(ctx, x, topWidth, bottomWidth, height, color, alpha) {
  ctx.save();

  // Create trapezoid path
  ctx.beginPath();
  ctx.moveTo(x - topWidth / 2, 0);
  ctx.lineTo(x + topWidth / 2, 0);
  ctx.lineTo(x + bottomWidth / 2, height);
  ctx.lineTo(x - bottomWidth / 2, height);
  ctx.closePath();

  // Gradient from top to bottom
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, hexToRgba(color, alpha));
  gradient.addColorStop(0.5, hexToRgba(color, alpha * 0.5));
  gradient.addColorStop(1, hexToRgba(color, 0));

  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.restore();
}

/**
 * Draw soft glow effect
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x - Center X
 * @param {number} y - Center Y
 * @param {number} radius - Glow radius
 * @param {string} color - Glow color (hex)
 * @param {number} alpha - Max alpha (0-1)
 */
export function drawGlow(ctx, x, y, radius, color, alpha = 0.5) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, hexToRgba(color, alpha));
  gradient.addColorStop(0.5, hexToRgba(color, alpha * 0.3));
  gradient.addColorStop(1, hexToRgba(color, 0));

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Draw animated wave pattern overlay
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {number} time - Animation time (frames or seconds)
 * @param {string} color - Wave color (hex)
 * @param {number} alpha - Max alpha (0-1)
 */
export function drawWaveOverlay(ctx, width, height, time, color, alpha = 0.1) {
  ctx.save();
  ctx.globalCompositeOperation = "overlay";

  const waveHeight = height * 0.02;
  const frequency = 0.005;
  const speed = 0.05;

  ctx.beginPath();
  ctx.moveTo(0, 0);

  for (let x = 0; x <= width; x += 5) {
    const y =
      Math.sin(x * frequency + time * speed) * waveHeight +
      Math.sin(x * frequency * 2 + time * speed * 1.5) * (waveHeight * 0.5);
    ctx.lineTo(x, y + height * 0.1);
  }

  ctx.lineTo(width, 0);
  ctx.closePath();

  ctx.fillStyle = hexToRgba(color, alpha);
  ctx.fill();

  ctx.restore();
}

/**
 * Apply blur effect using stacking (canvas-native approach)
 * Note: For true Gaussian blur, use CSS filter or CanvasRenderingContext2D.filter
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} amount - Blur amount (px)
 */
export function setBlur(ctx, amount) {
  ctx.filter = `blur(${amount}px)`;
}

/**
 * Reset filters
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 */
export function resetFilters(ctx) {
  ctx.filter = "none";
}
