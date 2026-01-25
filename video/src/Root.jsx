/**
 * Remotion Root - Registers all video compositions
 */
import { Composition } from "remotion";
import { SpeciesSpotlight } from "./SpeciesSpotlight.jsx";

// Default species data for preview
const defaultSpecies = {
  key: "celestialPearlDanio",
  commonName: "Celestial Pearl Danio",
  scientificName: "Danio margaritatus",
  imageUrl:
    "https://firebasestorage.googleapis.com/v0/b/comparium-21b69.firebasestorage.app/o/images%2Fspecies%2FcelestialPearlDanio.jpg?alt=media",
  tempMin: 72,
  tempMax: 78,
  tempUnit: "°F",
  phMin: 6.5,
  phMax: 7.5,
  tankSizeMin: 10,
  aggression: "Peaceful",
  careLevel: "Moderate",
  schooling: "School of 6+",
  maxSize: 1,
  sizeUnit: "inches",
  fact: "Discovered in 2006 in Myanmar, this tiny fish became an instant sensation in the aquarium hobby.",
};

export const RemotionRoot = () => {
  return (
    <>
      {/* Species Spotlight - Vertical (TikTok/Reels/Shorts) */}
      <Composition
        id="SpeciesSpotlight"
        component={SpeciesSpotlight}
        durationInFrames={600} // 20 seconds at 30fps
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          species: defaultSpecies,
        }}
      />

      {/* Species Spotlight - Square (Instagram Feed) */}
      <Composition
        id="SpeciesSpotlightSquare"
        component={SpeciesSpotlight}
        durationInFrames={600}
        fps={30}
        width={1080}
        height={1080}
        defaultProps={{
          species: defaultSpecies,
        }}
      />
    </>
  );
};
