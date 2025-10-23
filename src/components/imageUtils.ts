/**
 * Image utility functions for consistent handling across all components
 */

/**
 * Get the object-fit class for character images based on their URL
 * All images use 'contain' to scale naturally
 */
export function getCharacterImageFit(imageUrl: string): 'cover' | 'contain' {
  return 'contain'; // Scale entire image naturally
}

/**
 * Get the object-position style for character images based on their URL
 * pngall.com images positioned left for clipping
 */
export function getCharacterImagePosition(imageUrl: string): string {
  if (imageUrl.includes('pngall.com')) {
    return 'left center'; // Position left for clip-path
  }
  return 'center center'; // Default centered positioning
}

/**
 * Get the width for character images based on their URL
 * All images use auto width to display naturally
 */
export function getCharacterImageWidth(imageUrl: string): string {
  return 'auto'; // Default auto width
}

/**
 * Get the clip-path for character images based on their URL
 * pngall.com images are clipped to show ONLY the left 50% of pixels
 */
export function getCharacterImageClipPath(imageUrl: string): string | undefined {
  if (imageUrl.includes('pngall.com')) {
    return 'inset(0 50% 0 0)'; // Clip right 50%, showing only left half
  }
  return undefined; // No clipping for other images
}

/**
 * Get the transform for character images based on their URL
 * pngall.com images are shifted right to center the visible clipped portion and up
 */
export function getCharacterImageTransform(imageUrl: string): string | undefined {
  if (imageUrl.includes('pngall.com')) {
    return 'translate(30%, -15%)'; // Shift right by 30% and up by 15%
  }
  return undefined; // No transform for other images
}

/**
 * Get the height for character images based on their URL
 * pngall.com images are slightly smaller
 */
export function getCharacterImageHeight(imageUrl: string, defaultHeight: string, pngallHeight: string): string {
  if (imageUrl.includes('pngall.com')) {
    return pngallHeight;
  }
  return defaultHeight;
}
