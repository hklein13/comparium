/**
 * Species Spotlight Video Template - 3-Clue "Guess the Fish" Format
 *
 * A 15-second vertical video game where viewers guess the species.
 * Format: TikTok/YouTube Shorts/Instagram Reels (1080x1920)
 *
 * Timeline:
 * - 0-2s: "GUESS THE FISH" branded intro
 * - 2-4s: Clue 1 fades in
 * - 4-6s: Clue 2 fades in
 * - 6-8s: Clue 3 fades in
 * - 8-10s: Image fades in (all clues visible)
 * - 10-14s: Reveal - species name BIG + fact
 * - 14-15s: CTA
 */
import {
  AbsoluteFill,
  Img,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Sequence,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/PlayfairDisplay";
import { getVideoFact } from "./video-facts.js";

// Load font - this ensures it's ready before rendering
const { fontFamily } = loadFont();

// Color palette
const colors = {
  forest: "#234a3a",
  forestDark: "#1a3329",
  ivory: "#faf9f6",
  ivoryMuted: "#e8e6e2",
  gold: "#c4a574",
  goldBright: "#d4b896",
};

export const SpeciesSpotlight = ({ species }) => {
  const frame = useCurrentFrame();
  const { height } = useVideoConfig();

  // Get curated clues/reveal from video-facts.js
  const videoFact = getVideoFact(species.key);
  const clues = videoFact?.clues || ["Clue 1", "Clue 2", "Clue 3"];
  const reveal = videoFact?.reveal || "";

  // Animation helpers
  const fadeIn = (startFrame, duration = 20) =>
    interpolate(frame, [startFrame, startFrame + duration], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  const slideUp = (startFrame, duration = 20) =>
    interpolate(frame, [startFrame, startFrame + duration], [40, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  // Intro title animation (longer - 3.3s)
  const introScale = interpolate(frame, [0, 25, 75, 100], [0.8, 1.05, 1.05, 0.95], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const introOpacity = interpolate(frame, [0, 20, 75, 100], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Clues container fades out for reveal
  const cluesOpacity = interpolate(frame, [340, 380], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: colors.forestDark }}>
      {/* ===== LAYER 1: INTRO ===== */}
      <Sequence from={0} durationInFrames={105}>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            opacity: introOpacity,
            transform: `scale(${introScale})`,
            zIndex: 10,
          }}
        >
          <p
            style={{
              fontFamily,
              fontSize: 28,
              fontWeight: 500,
              color: colors.gold,
              margin: "0 0 15px 0",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
            }}
          >
            Can You
          </p>
          <h1
            style={{
              fontFamily,
              fontSize: 82,
              fontWeight: 700,
              color: colors.ivory,
              margin: 0,
              letterSpacing: "-0.02em",
              textShadow: "0 4px 40px rgba(0,0,0,0.5)",
            }}
          >
            Guess the Fish
          </h1>
          <p
            style={{
              fontFamily,
              fontSize: 26,
              fontWeight: 400,
              color: colors.ivoryMuted,
              margin: "20px 0 0 0",
              opacity: 0.8,
            }}
          >
            3 clues, 1 species
          </p>
        </div>
      </Sequence>

      {/* ===== LAYER 2: CLUES ===== */}
      <Sequence from={90} durationInFrames={310}>
        <div
          style={{
            position: "absolute",
            top: height * 0.2,
            left: 50,
            right: 50,
            bottom: height * 0.25,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            opacity: cluesOpacity,
            zIndex: 10,
          }}
        >
          {/* Clue 1 - appears at 3.3s */}
          <div
            style={{
              opacity: fadeIn(100, 25),
              transform: `translateY(${slideUp(100, 25)}px)`,
            }}
          >
            <ClueItem number={1} text={clues[0]} />
          </div>

          {/* Clue 2 - appears at 6.3s (3s gap) */}
          <div
            style={{
              opacity: fadeIn(190, 25),
              transform: `translateY(${slideUp(190, 25)}px)`,
            }}
          >
            <ClueItem number={2} text={clues[1]} />
          </div>

          {/* Clue 3 - appears at 9.3s (3s gap) */}
          <div
            style={{
              opacity: fadeIn(280, 25),
              transform: `translateY(${slideUp(280, 25)}px)`,
            }}
          >
            <ClueItem number={3} text={clues[2]} />
          </div>
        </div>
      </Sequence>

      {/* ===== LAYER 3: REVEAL ===== */}
      <Sequence from={370}>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 40,
            right: 40,
            bottom: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: 25,
            opacity: fadeIn(380, 25),
            transform: `translateY(${slideUp(380, 30)}px)`,
            zIndex: 10,
          }}
        >
          {/* Species name - BIG REVEAL */}
          <h1
            style={{
              fontFamily,
              fontSize: 72,
              fontWeight: 600,
              color: colors.goldBright,
              margin: 0,
              lineHeight: 1.1,
              textAlign: "center",
              textShadow: "0 4px 30px rgba(0,0,0,0.9)",
              letterSpacing: "-0.02em",
            }}
          >
            {species.commonName}
          </h1>

          {/* Scientific name */}
          <p
            style={{
              fontFamily,
              fontSize: 26,
              fontStyle: "italic",
              color: colors.gold,
              margin: 0,
              opacity: 0.85,
              textAlign: "center",
            }}
          >
            {species.scientificName}
          </p>

          {/* The fact */}
          <p
            style={{
              fontFamily,
              fontSize: 38,
              fontWeight: 400,
              color: colors.ivory,
              margin: "0 0 15px 0",
              lineHeight: 1.35,
              textAlign: "center",
            }}
          >
            {reveal}
          </p>

          {/* Contained photo */}
          <div
            style={{
              opacity: fadeIn(400, 30),
            }}
          >
            {species.imageUrl && (
              <div
                style={{
                  width: 900,
                  height: 600,
                  borderRadius: 20,
                  overflow: "hidden",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
                  border: `3px solid ${colors.gold}`,
                }}
              >
                <Img
                  src={species.imageUrl}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center center",
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </Sequence>

      {/* ===== LAYER 4: CTA ===== */}
      <Sequence from={520}>
        <div
          style={{
            position: "absolute",
            bottom: 90,
            left: 50,
            right: 50,
            textAlign: "center",
            opacity: fadeIn(530, 20),
            zIndex: 10,
          }}
        >
          <p
            style={{
              fontFamily: "system-ui, sans-serif",
              fontSize: 18,
              color: colors.ivory,
              margin: "0 0 6px 0",
              opacity: 0.7,
              letterSpacing: "0.05em",
            }}
          >
            Discover more at
          </p>
          <p
            style={{
              fontFamily,
              fontSize: 36,
              fontWeight: 700,
              color: colors.goldBright,
              margin: 0,
              letterSpacing: "0.02em",
            }}
          >
            comparium.net
          </p>
        </div>
      </Sequence>

      {/* ===== LAYER 5: WATERMARK ===== */}
      <div
        style={{
          position: "absolute",
          top: 50,
          right: 50,
          opacity: 0.5,
          zIndex: 10,
        }}
      >
        <p
          style={{
            fontFamily: "system-ui, sans-serif",
            fontSize: 16,
            fontWeight: 600,
            color: colors.ivory,
            margin: 0,
            letterSpacing: "0.15em",
          }}
        >
          COMPARIUM
        </p>
      </div>
    </AbsoluteFill>
  );
};

// Clue Item Component
const ClueItem = ({ number, text }) => (
  <div
    style={{
      display: "flex",
      alignItems: "flex-start",
      gap: 25,
    }}
  >
    {/* Number badge */}
    <div
      style={{
        width: 60,
        height: 60,
        borderRadius: "50%",
        backgroundColor: "rgba(196, 165, 116, 0.25)",
        border: `2px solid ${colors.gold}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontFamily,
          fontSize: 28,
          fontWeight: 600,
          color: colors.gold,
        }}
      >
        {number}
      </span>
    </div>

    {/* Clue text */}
    <p
      style={{
        fontFamily,
        fontSize: 48,
        fontWeight: 500,
        color: colors.ivory,
        margin: 0,
        lineHeight: 1.25,
        textShadow: "0 3px 30px rgba(0,0,0,0.8)",
        paddingTop: 6,
      }}
    >
      {text}
    </p>
  </div>
);
