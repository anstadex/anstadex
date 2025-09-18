
import type { SelectOption } from './types';

export const ASPECT_RATIOS: SelectOption[] = [
  { value: "1:1", label: "1:1 (Square)" },
  { value: "16:9", label: "16:9 (Widescreen)" },
  { value: "9:16", label: "9:16 (Vertical)" },
  { value: "4:3", label: "4:3 (Standard)" },
  { value: "3:4", label: "3:4 (Portrait)" },
];

export const LIGHTING_STYLES: SelectOption[] = [
  { value: "soft studio lighting", label: "Soft Studio" },
  { value: "dramatic cinematic lighting", label: "Cinematic" },
  { value: "golden hour sunlight", label: "Golden Hour" },
  { value: "neon noir", label: "Neon Noir" },
  { value: "natural daylight", label: "Natural Daylight" },
  { value: "backlit", label: "Backlit" },
];

export const CAMERA_ANGLES: SelectOption[] = [
  { value: "eye-level shot", label: "Eye-Level" },
  { value: "low-angle shot", label: "Low-Angle" },
  { value: "high-angle shot", label: "High-Angle" },
  { value: "dutch angle", label: "Dutch Angle" },
  { value: "close-up shot", label: "Close-Up" },
  { value: "full-body shot", label: "Full-Body" },
];

export const POSE_MOVEMENTS: SelectOption[] = [
  { value: "none", label: "None" },
  { value: "dynamic action pose", label: "Dynamic Action" },
  { value: "elegant still pose", label: "Elegant Still" },
  { value: "candid laughter", label: "Candid Laughter" },
  { value: "dramatic turn", label: "Dramatic Turn" },
  { value: "thoughtful gaze", label: "Thoughtful Gaze" },
  { value: "custom", label: "Custom..." },
];

export const LOCATIONS: SelectOption[] = [
    { value: "none", label: "None" },
    { value: "outdoor", label: "Outdoor" },
    { value: "indoor", label: "Indoor" },
    { value: "custom", label: "Custom..." },
];

export const IMAGE_QUALITIES: SelectOption[] = [
    { value: "HD", label: "HD (1280x720)" },
    { value: "Full HD", label: "Full HD (1920x1080)" },
    { value: "4K", label: "4K (3840x2160)" },
];
