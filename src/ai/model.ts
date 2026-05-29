const FALLBACK_MODEL = "claude-opus-4-8";

/**
 * Resolve the Claude model to use.
 * Dynamic by design: to move to a new model on a future release, set an env var
 * (no code change). Precedence:
 *   1. ELW_MODEL  (this tool only)
 *   2. S0NDER_MODEL  (shared across all s0nderlabs tools)
 *   3. FALLBACK_MODEL  (safe default, currently claude-opus-4-8)
 */
export function resolveModel(): string {
  return process.env.ELW_MODEL || process.env.S0NDER_MODEL || FALLBACK_MODEL;
}
