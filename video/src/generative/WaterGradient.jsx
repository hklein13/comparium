/**
 * WaterGradient - Animated water depth gradient background
 * Creates a natural-looking underwater atmosphere with subtle color shifts
 */

import { useCallback } from "react";
import { CanvasBackground } from "./CanvasBackground.jsx";
import { palettes, getPaletteColor, hexToRgba } from "../utils/colors.js";
import { noise2D } from "../utils/noise.js";
import { smoothstep } from "../utils/easing.js";

/**
 * Animated water gradient component
 *
 * @param {Object} props
 * @param {string} props.paletteName - Name of palette from palettes object (default: "deepOcean")
 * @param {number} props.animationSpeed - Speed of color animation (default: 0.5)
 * @param {boolean} props.enableNoise - Add subtle noise texture (default: true)
 * @param {number} props.noiseIntensity - Noise texture intensity (default: 0.03)
 */
export const WaterGradient = ({
  paletteName = "deepOcean",
  animationSpeed = 0.5,
  enableNoise = true,
  noiseIntensity = 0.03,
}) => {
  const palette = palettes[paletteName] || palettes.deepOcean;

  const draw = useCallback(
    (ctx, frame, width, height, fps) => {
      const time = frame / fps;

      // Draw base gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      const colors = palette.colors;

      // Animate color positions slightly
      colors.forEach((color, i) => {
        const basePos = i / (colors.length - 1);
        // Subtle vertical movement
        const offset = Math.sin(time * animationSpeed + i * 0.5) * 0.02;
        const pos = Math.max(0, Math.min(1, basePos + offset));
        gradient.addColorStop(pos, color);
      });

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Add subtle noise texture for organic feel
      if (enableNoise) {
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        const noiseScale = 0.01;

        for (let y = 0; y < height; y += 2) {
          // Skip every other row for performance
          for (let x = 0; x < width; x += 2) {
            // Skip every other column
            const noiseVal = noise2D(
              x * noiseScale + time * 0.1,
              y * noiseScale + time * 0.1
            );
            const adjustment = noiseVal * noiseIntensity * 255;

            const idx = (y * width + x) * 4;
            data[idx] = Math.max(0, Math.min(255, data[idx] + adjustment));
            data[idx + 1] = Math.max(
              0,
              Math.min(255, data[idx + 1] + adjustment)
            );
            data[idx + 2] = Math.max(
              0,
              Math.min(255, data[idx + 2] + adjustment)
            );
          }
        }

        ctx.putImageData(imageData, 0, 0);
      }

      // Add subtle vignette effect
      const vignetteGradient = ctx.createRadialGradient(
        width / 2,
        height / 2,
        height * 0.3,
        width / 2,
        height / 2,
        height * 0.9
      );
      vignetteGradient.addColorStop(0, "rgba(0, 0, 0, 0)");
      vignetteGradient.addColorStop(1, "rgba(0, 0, 0, 0.3)");

      ctx.fillStyle = vignetteGradient;
      ctx.fillRect(0, 0, width, height);
    },
    [palette, animationSpeed, enableNoise, noiseIntensity]
  );

  return <CanvasBackground draw={draw} />;
};

export default WaterGradient;
