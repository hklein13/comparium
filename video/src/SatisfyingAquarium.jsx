/**
 * SatisfyingAquarium - Main generative composition
 * Combines water gradient, light rays, and bubbles for a satisfying underwater scene
 * Perfect for TikTok/Reels ambient content
 */

import { AbsoluteFill } from "remotion";
import { WaterGradient } from "./generative/WaterGradient.jsx";
import { LightRays } from "./generative/LightRays.jsx";
import { Bubbles } from "./generative/Bubbles.jsx";
import { palettes } from "./utils/colors.js";

/**
 * Satisfying aquarium generative video
 *
 * @param {Object} props
 * @param {string} props.palette - Color palette name (default: "deepOcean")
 * @param {number} props.bubbleCount - Number of bubbles (default: 35)
 * @param {number} props.bubbleSpeed - Bubble rise speed (default: 1)
 * @param {number} props.lightRayCount - Number of light rays (default: 5)
 * @param {number} props.lightIntensity - Light ray intensity (default: 0.8)
 */
export const SatisfyingAquarium = ({
  palette = "deepOcean",
  bubbleCount = 35,
  bubbleSpeed = 1,
  lightRayCount = 5,
  lightIntensity = 0.8,
}) => {
  // Get palette info for bubble color
  const paletteData = palettes[palette] || palettes.deepOcean;
  const bubbleColor = paletteData.accent;

  return (
    <AbsoluteFill>
      {/* Layer 1: Water gradient background */}
      <WaterGradient
        paletteName={palette}
        animationSpeed={0.3}
        enableNoise={true}
        noiseIntensity={0.02}
      />

      {/* Layer 2: Volumetric light rays */}
      <LightRays
        count={lightRayCount}
        intensity={lightIntensity}
        color="#ffffff"
        animate={true}
      />

      {/* Layer 3: Rising bubbles */}
      <Bubbles
        count={bubbleCount}
        speed={bubbleSpeed}
        color={bubbleColor}
        minSize={3}
        maxSize={18}
      />
    </AbsoluteFill>
  );
};

export default SatisfyingAquarium;
