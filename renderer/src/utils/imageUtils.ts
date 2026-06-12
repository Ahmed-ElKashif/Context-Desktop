/**
 * Utility functions for optimizing images on the frontend.
 */

/**
 * Takes a raw Cloudinary URL and injects performance optimization parameters
 * to serve a highly compressed, resized WebP image instead of the raw upload.
 * 
 * @param url The raw Cloudinary image URL
 * @param width The target width (default: 150)
 * @returns The optimized Cloudinary URL
 */
export const getOptimizedAvatarUrl = (url?: string | null, width = 150): string => {
  if (!url) return "";
  
  // Only apply transformations to Cloudinary URLs
  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    // Inject w_{width},q_auto,f_auto right after /upload/
    return url.replace("/upload/", `/upload/w_${width},q_auto,f_auto/`);
  }
  
  return url;
};
