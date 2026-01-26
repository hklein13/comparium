/**
 * Animation easing functions
 * All functions take t (0-1) and return eased value (0-1)
 */

/**
 * Linear (no easing)
 */
export function linear(t) {
  return t;
}

/**
 * Ease in (accelerate from zero velocity)
 * @param {number} t - Progress (0-1)
 * @param {number} power - Easing power (default 2 = quadratic)
 */
export function easeIn(t, power = 2) {
  return Math.pow(t, power);
}

/**
 * Ease out (decelerate to zero velocity)
 * @param {number} t - Progress (0-1)
 * @param {number} power - Easing power (default 2 = quadratic)
 */
export function easeOut(t, power = 2) {
  return 1 - Math.pow(1 - t, power);
}

/**
 * Ease in-out (accelerate then decelerate)
 * @param {number} t - Progress (0-1)
 * @param {number} power - Easing power (default 2 = quadratic)
 */
export function easeInOut(t, power = 2) {
  return t < 0.5
    ? Math.pow(2, power - 1) * Math.pow(t, power)
    : 1 - Math.pow(-2 * t + 2, power) / 2;
}

/**
 * Quadratic ease in
 */
export function easeInQuad(t) {
  return t * t;
}

/**
 * Quadratic ease out
 */
export function easeOutQuad(t) {
  return t * (2 - t);
}

/**
 * Quadratic ease in-out
 */
export function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

/**
 * Cubic ease in
 */
export function easeInCubic(t) {
  return t * t * t;
}

/**
 * Cubic ease out
 */
export function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Cubic ease in-out
 */
export function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Sine ease in
 */
export function easeInSine(t) {
  return 1 - Math.cos((t * Math.PI) / 2);
}

/**
 * Sine ease out
 */
export function easeOutSine(t) {
  return Math.sin((t * Math.PI) / 2);
}

/**
 * Sine ease in-out
 */
export function easeInOutSine(t) {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

/**
 * Exponential ease in
 */
export function easeInExpo(t) {
  return t === 0 ? 0 : Math.pow(2, 10 * t - 10);
}

/**
 * Exponential ease out
 */
export function easeOutExpo(t) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

/**
 * Exponential ease in-out
 */
export function easeInOutExpo(t) {
  return t === 0
    ? 0
    : t === 1
      ? 1
      : t < 0.5
        ? Math.pow(2, 20 * t - 10) / 2
        : (2 - Math.pow(2, -20 * t + 10)) / 2;
}

/**
 * Elastic ease out (bouncy overshoot)
 */
export function easeOutElastic(t) {
  const c4 = (2 * Math.PI) / 3;
  return t === 0
    ? 0
    : t === 1
      ? 1
      : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
}

/**
 * Bounce ease out
 */
export function easeOutBounce(t) {
  const n1 = 7.5625;
  const d1 = 2.75;

  if (t < 1 / d1) {
    return n1 * t * t;
  } else if (t < 2 / d1) {
    return n1 * (t -= 1.5 / d1) * t + 0.75;
  } else if (t < 2.5 / d1) {
    return n1 * (t -= 2.25 / d1) * t + 0.9375;
  } else {
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  }
}

/**
 * Spring animation (for bouncy natural motion)
 * @param {number} t - Progress (0-1)
 * @param {number} tension - Spring tension (default 0.5)
 * @returns {number} Spring-eased value
 */
export function spring(t, tension = 0.5) {
  return 1 - Math.cos(t * Math.PI * (0.5 + 2.5 * tension)) * Math.exp(-t * 6);
}

/**
 * Smoothstep - smooth Hermite interpolation
 * @param {number} t - Progress (0-1)
 * @returns {number} Smoothly interpolated value
 */
export function smoothstep(t) {
  return t * t * (3 - 2 * t);
}

/**
 * Smoother step - Ken Perlin's improved smoothstep
 * @param {number} t - Progress (0-1)
 * @returns {number} Even smoother interpolated value
 */
export function smootherstep(t) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

/**
 * Clamp value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Map value from one range to another
 * @param {number} value - Input value
 * @param {number} inMin - Input range minimum
 * @param {number} inMax - Input range maximum
 * @param {number} outMin - Output range minimum
 * @param {number} outMax - Output range maximum
 * @returns {number} Mapped value
 */
export function map(value, inMin, inMax, outMin, outMax) {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

/**
 * Linear interpolation
 * @param {number} a - Start value
 * @param {number} b - End value
 * @param {number} t - Interpolation factor (0-1)
 * @returns {number} Interpolated value
 */
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Inverse linear interpolation
 * @param {number} a - Start value
 * @param {number} b - End value
 * @param {number} value - Value to find t for
 * @returns {number} t value (0-1)
 */
export function inverseLerp(a, b, value) {
  return (value - a) / (b - a);
}

/**
 * Ping-pong - oscillate between 0 and 1
 * @param {number} t - Time value (can exceed 0-1)
 * @returns {number} Value oscillating between 0 and 1
 */
export function pingPong(t) {
  const cycle = Math.floor(t);
  const remainder = t - cycle;
  return cycle % 2 === 0 ? remainder : 1 - remainder;
}
