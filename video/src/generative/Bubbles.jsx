/**
 * Bubbles - Rising bubble particle system
 * Creates floating bubbles that rise from bottom with natural movement
 */

import { useCallback, useMemo } from "react";
import { useVideoConfig, random } from "remotion";
import { CanvasBackground } from "./CanvasBackground.jsx";
import { drawBubble } from "../utils/canvas.js";
import { noise2D, noise3D } from "../utils/noise.js";
import { smoothstep, easeOutQuad } from "../utils/easing.js";

/**
 * Create deterministic bubble instances using Remotion's random
 */
function createBubbles(count, seed, width, height) {
  const bubbles = [];
  for (let i = 0; i < count; i++) {
    bubbles.push({
      id: i,
      // Initial X position (spread across width)
      x: random(`bubble-x-${seed}-${i}`) * width,
      // Starting Y offset (stagger spawn times)
      startOffset: random(`bubble-start-${seed}-${i}`) * 1.5,
      // Size variation
      radius: 4 + random(`bubble-size-${seed}-${i}`) * 16,
      // Speed variation
      speed: 0.5 + random(`bubble-speed-${seed}-${i}`) * 0.8,
      // Horizontal wobble frequency
      wobbleFreq: 1 + random(`bubble-wobble-${seed}-${i}`) * 2,
      // Wobble amplitude
      wobbleAmp: 10 + random(`bubble-amp-${seed}-${i}`) * 20,
      // Opacity variation
      alpha: 0.3 + random(`bubble-alpha-${seed}-${i}`) * 0.4,
      // Phase offset for wobble
      phase: random(`bubble-phase-${seed}-${i}`) * Math.PI * 2,
    });
  }
  return bubbles;
}

/**
 * Rising bubble particle system
 *
 * @param {Object} props
 * @param {number} props.count - Number of bubbles (default: 30)
 * @param {number} props.speed - Overall speed multiplier (default: 1)
 * @param {string} props.color - Bubble color (default: "#88d4f5")
 * @param {number} props.minSize - Minimum bubble radius (default: 4)
 * @param {number} props.maxSize - Maximum bubble radius (default: 20)
 * @param {number} props.seed - Random seed for deterministic bubbles (default: 42)
 */
export const Bubbles = ({
  count = 30,
  speed = 1,
  color = "#88d4f5",
  minSize = 4,
  maxSize = 20,
  seed = 42,
}) => {
  const { width, height, fps, durationInFrames } = useVideoConfig();

  // Create bubble instances once (deterministic)
  const bubbles = useMemo(
    () => createBubbles(count, seed, width, height),
    [count, seed, width, height]
  );

  const draw = useCallback(
    (ctx, frame, canvasWidth, canvasHeight, fps) => {
      const time = frame / fps;
      const totalDuration = durationInFrames / fps;

      bubbles.forEach((bubble) => {
        // Calculate bubble lifecycle position
        const cycleTime = (time + bubble.startOffset * totalDuration) % totalDuration;
        const progress = cycleTime / totalDuration;

        // Y position: start below screen, rise to above screen
        const baseY = canvasHeight * 1.2 - progress * (canvasHeight * 1.5) * bubble.speed * speed;

        // Skip if off screen
        if (baseY < -50 || baseY > canvasHeight + 50) return;

        // Horizontal wobble using noise for organic movement
        const noiseX = noise3D(bubble.id * 0.1, time * bubble.wobbleFreq * 0.3, 0);
        const wobbleX = noiseX * bubble.wobbleAmp;

        // Also add sine wave for larger movement
        const sineWobble =
          Math.sin(time * bubble.wobbleFreq + bubble.phase) * bubble.wobbleAmp * 0.5;

        const x = bubble.x + wobbleX + sineWobble;
        const y = baseY;

        // Size variation based on depth (smaller at top = further away feel)
        const depthFactor = 0.7 + (y / canvasHeight) * 0.3;
        const sizeRange = maxSize - minSize;
        const baseRadius = minSize + (bubble.radius / 20) * sizeRange;
        const radius = baseRadius * depthFactor;

        // Fade in at bottom, fade out at top
        let alpha = bubble.alpha;
        if (y > canvasHeight * 0.8) {
          alpha *= smoothstep(1 - (y - canvasHeight * 0.8) / (canvasHeight * 0.2));
        }
        if (y < canvasHeight * 0.2) {
          alpha *= smoothstep(y / (canvasHeight * 0.2));
        }

        // Draw the bubble
        drawBubble(ctx, x, y, radius, color, alpha);
      });
    },
    [bubbles, speed, color, minSize, maxSize, durationInFrames]
  );

  return <CanvasBackground draw={draw} />;
};

export default Bubbles;
