import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to conditionally join classNames together
 * Combines clsx and tailwind-merge for clean, consolidated class strings
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
} 