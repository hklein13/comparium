/**
 * CanvasBackground - Base component for canvas-based generative art in Remotion
 * Handles canvas setup, frame synchronization, and proper render timing
 */

import { useRef, useEffect } from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  delayRender,
  continueRender,
  AbsoluteFill,
} from "remotion";

/**
 * Base canvas component that syncs with Remotion's frame system
 *
 * @param {Object} props
 * @param {Function} props.draw - Draw function called each frame: (ctx, frame, width, height, fps) => void
 * @param {Object} props.style - Additional styles for the canvas container
 */
export const CanvasBackground = ({ draw, style = {} }) => {
  const canvasRef = useRef(null);
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size to match video dimensions
    canvas.width = width;
    canvas.height = height;

    // Delay render until drawing is complete
    const handle = delayRender("Drawing canvas frame");

    try {
      // Clear canvas before drawing
      ctx.clearRect(0, 0, width, height);

      // Call the draw function with current frame context
      draw(ctx, frame, width, height, fps);

      // Signal that rendering is complete
      continueRender(handle);
    } catch (error) {
      console.error("Canvas draw error:", error);
      continueRender(handle);
    }
  }, [frame, width, height, fps, draw]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "transparent",
        ...style,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
        }}
      />
    </AbsoluteFill>
  );
};

export default CanvasBackground;
