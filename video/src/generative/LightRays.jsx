/**
 * LightRays - Volumetric light beams from above
 * Creates underwater sunlight effect with animated rays
 */

import { useCallback, useMemo } from "react";
import { useVideoConfig, random } from "remotion";
import { CanvasBackground } from "./CanvasBackground.jsx";
import { hexToRgba } from "../utils/colors.js";
import { noise2D } from "../utils/noise.js";
import { smoothstep, easeInOutSine } from "../utils/easing.js";

/**
 * Create deterministic light ray instances
 */
function createRays(count, seed, width) {
  const rays = [];
  const spacing = width / (count + 1);

  for (let i = 0; i < count; i++) {
    rays.push({
      id: i,
      // Spread rays across width with some randomness
      x: spacing * (i + 1) + (random(`ray-x-${seed}-${i}`) - 0.5) * spacing * 0.5,
      // Width variation
      topWidth: 20 + random(`ray-tw-${seed}-${i}`) * 60,
      bottomWidth: 100 + random(`ray-bw-${seed}-${i}`) * 200,
      // Height variation
      heightFactor: 0.6 + random(`ray-h-${seed}-${i}`) * 0.4,
      // Opacity variation
      alpha: 0.05 + random(`ray-alpha-${seed}-${i}`) * 0.1,
      // Animation phase offset
      phase: random(`ray-phase-${seed}-${i}`) * Math.PI * 2,
      // Sway speed
      swaySpeed: 0.3 + random(`ray-sway-${seed}-${i}`) * 0.4,
      // Sway amount
      swayAmount: 20 + random(`ray-swayamt-${seed}-${i}`) * 40,
    });
  }
  return rays;
}

/**
 * Volumetric light rays component
 *
 * @param {Object} props
 * @param {number} props.count - Number of light rays (default: 5)
 * @param {number} props.intensity - Overall intensity multiplier (default: 1)
 * @param {string} props.color - Ray color (default: "#ffffff")
 * @param {number} props.seed - Random seed for deterministic rays (default: 123)
 * @param {boolean} props.animate - Enable ray animation (default: true)
 */
export const LightRays = ({
  count = 5,
  intensity = 1,
  color = "#ffffff",
  seed = 123,
  animate = true,
}) => {
  const { width, height, fps } = useVideoConfig();

  // Create ray instances once (deterministic)
  const rays = useMemo(
    () => createRays(count, seed, width),
    [count, seed, width]
  );

  const draw = useCallback(
    (ctx, frame, canvasWidth, canvasHeight, fps) => {
      const time = frame / fps;

      // Set up blending for light effect
      ctx.globalCompositeOperation = "screen";

      rays.forEach((ray) => {
        // Animate ray position (gentle sway)
        let x = ray.x;
        if (animate) {
          const swayOffset =
            Math.sin(time * ray.swaySpeed + ray.phase) * ray.swayAmount;
          x += swayOffset;

          // Add noise-based secondary movement
          const noiseOffset = noise2D(ray.id * 0.5, time * 0.2) * ray.swayAmount * 0.3;
          x += noiseOffset;
        }

        // Animate opacity (subtle pulsing)
        let alpha = ray.alpha * intensity;
        if (animate) {
          const pulse = 0.7 + Math.sin(time * 0.5 + ray.phase) * 0.3;
          alpha *= pulse;
        }

        const rayHeight = canvasHeight * ray.heightFactor;

        // Draw ray as gradient trapezoid
        ctx.save();

        // Create trapezoid path
        ctx.beginPath();
        ctx.moveTo(x - ray.topWidth / 2, 0);
        ctx.lineTo(x + ray.topWidth / 2, 0);
        ctx.lineTo(x + ray.bottomWidth / 2, rayHeight);
        ctx.lineTo(x - ray.bottomWidth / 2, rayHeight);
        ctx.closePath();

        // Create gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, rayHeight);
        gradient.addColorStop(0, hexToRgba(color, alpha * 1.5));
        gradient.addColorStop(0.3, hexToRgba(color, alpha));
        gradient.addColorStop(0.7, hexToRgba(color, alpha * 0.5));
        gradient.addColorStop(1, hexToRgba(color, 0));

        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.restore();
      });

      // Reset composite operation
      ctx.globalCompositeOperation = "source-over";

      // Add overall light glow at top
      const topGlow = ctx.createLinearGradient(0, 0, 0, canvasHeight * 0.3);
      topGlow.addColorStop(0, hexToRgba(color, 0.15 * intensity));
      topGlow.addColorStop(1, hexToRgba(color, 0));

      ctx.fillStyle = topGlow;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight * 0.3);
    },
    [rays, color, intensity, animate]
  );

  return <CanvasBackground draw={draw} />;
};

export default LightRays;
