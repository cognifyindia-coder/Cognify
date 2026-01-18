/* @ts-nocheck */
/**
 * Minimal dev logger for Supabase Edge Functions (Deno runtime).
 * Keeps logs consistent and avoids breaking builds when shared across functions.
 * Avoid logging secrets; this is only a thin console wrapper.
 */

const prefix = "[DODO]";

export const devLogger = {
  log: (...args: unknown[]) => {
    try {
      console.log(prefix, ...args);
    } catch {
      // ignore logging errors
    }
  },
  warn: (...args: unknown[]) => {
    try {
      console.warn(prefix, ...args);
    } catch {
      // ignore logging errors
    }
  },
  error: (...args: unknown[]) => {
    try {
      console.error(prefix, ...args);
    } catch {
      // ignore logging errors
    }
  },
};