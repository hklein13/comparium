/**
 * Custom Perlin/Simplex noise implementation for generative art
 * No external dependencies - pure JavaScript
 */

// Permutation table for noise generation
const permutation = [
  151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140,
  36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120, 234,
  75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33, 88, 237,
  149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48,
  27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105,
  92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73,
  209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86,
  164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38,
  147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189,
  28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101,
  155, 167, 43, 172, 9, 129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232,
  178, 185, 112, 104, 218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12,
  191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31,
  181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254,
  138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215,
  61, 156, 180,
];

// Double the permutation table to avoid overflow
const p = [...permutation, ...permutation];

// Fade function for smooth interpolation
function fade(t) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

// Linear interpolation
function lerp(a, b, t) {
  return a + t * (b - a);
}

// Gradient function for 2D
function grad2D(hash, x, y) {
  const h = hash & 3;
  const u = h < 2 ? x : y;
  const v = h < 2 ? y : x;
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

// Gradient function for 3D
function grad3D(hash, x, y, z) {
  const h = hash & 15;
  const u = h < 8 ? x : y;
  const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

/**
 * 2D Perlin noise
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @returns {number} Noise value between -1 and 1
 */
export function noise2D(x, y) {
  // Find unit square containing point
  const X = Math.floor(x) & 255;
  const Y = Math.floor(y) & 255;

  // Relative position within square
  x -= Math.floor(x);
  y -= Math.floor(y);

  // Compute fade curves
  const u = fade(x);
  const v = fade(y);

  // Hash coordinates of square corners
  const A = p[X] + Y;
  const B = p[X + 1] + Y;

  // Blend gradients
  return lerp(
    lerp(grad2D(p[A], x, y), grad2D(p[B], x - 1, y), u),
    lerp(grad2D(p[A + 1], x, y - 1), grad2D(p[B + 1], x - 1, y - 1), u),
    v
  );
}

/**
 * 3D Perlin noise (z = time for animation)
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} z - Z coordinate (often time)
 * @returns {number} Noise value between -1 and 1
 */
export function noise3D(x, y, z) {
  // Find unit cube containing point
  const X = Math.floor(x) & 255;
  const Y = Math.floor(y) & 255;
  const Z = Math.floor(z) & 255;

  // Relative position within cube
  x -= Math.floor(x);
  y -= Math.floor(y);
  z -= Math.floor(z);

  // Compute fade curves
  const u = fade(x);
  const v = fade(y);
  const w = fade(z);

  // Hash coordinates of cube corners
  const A = p[X] + Y;
  const AA = p[A] + Z;
  const AB = p[A + 1] + Z;
  const B = p[X + 1] + Y;
  const BA = p[B] + Z;
  const BB = p[B + 1] + Z;

  // Blend gradients
  return lerp(
    lerp(
      lerp(grad3D(p[AA], x, y, z), grad3D(p[BA], x - 1, y, z), u),
      lerp(grad3D(p[AB], x, y - 1, z), grad3D(p[BB], x - 1, y - 1, z), u),
      v
    ),
    lerp(
      lerp(grad3D(p[AA + 1], x, y, z - 1), grad3D(p[BA + 1], x - 1, y, z - 1), u),
      lerp(
        grad3D(p[AB + 1], x, y - 1, z - 1),
        grad3D(p[BB + 1], x - 1, y - 1, z - 1),
        u
      ),
      v
    ),
    w
  );
}

/**
 * Fractal Brownian Motion - layers of noise for natural patterns
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} octaves - Number of noise layers (default 4)
 * @param {number} lacunarity - Frequency multiplier per octave (default 2)
 * @param {number} persistence - Amplitude multiplier per octave (default 0.5)
 * @returns {number} Noise value (range depends on octaves)
 */
export function fbm(x, y, octaves = 4, lacunarity = 2, persistence = 0.5) {
  let total = 0;
  let frequency = 1;
  let amplitude = 1;
  let maxValue = 0;

  for (let i = 0; i < octaves; i++) {
    total += noise2D(x * frequency, y * frequency) * amplitude;
    maxValue += amplitude;
    amplitude *= persistence;
    frequency *= lacunarity;
  }

  // Normalize to -1 to 1
  return total / maxValue;
}

/**
 * Fractal Brownian Motion with time (3D)
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} z - Z coordinate (time)
 * @param {number} octaves - Number of noise layers
 * @returns {number} Animated noise value
 */
export function fbm3D(x, y, z, octaves = 4) {
  let total = 0;
  let frequency = 1;
  let amplitude = 1;
  let maxValue = 0;

  for (let i = 0; i < octaves; i++) {
    total += noise3D(x * frequency, y * frequency, z * frequency) * amplitude;
    maxValue += amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }

  return total / maxValue;
}

/**
 * Turbulence - absolute value noise for cloud-like patterns
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} octaves - Number of noise layers
 * @returns {number} Turbulence value between 0 and 1
 */
export function turbulence(x, y, octaves = 4) {
  let total = 0;
  let frequency = 1;
  let amplitude = 1;

  for (let i = 0; i < octaves; i++) {
    total += Math.abs(noise2D(x * frequency, y * frequency)) * amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }

  return total;
}
