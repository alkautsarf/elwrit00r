const FALLBACK_MODEL = "claude-opus-5-5";

/**
 * Resolve the Claude model to use.
 * Env vars override the model per user with no code change; bumping the shipped
 * default means editing FALLBACK_MODEL. Precedence:
 *   1. ELW_MODEL  (this tool only)
 *   2. S0NDER_MODEL  (shared across all s0nderlabs tools)
 *   3. FALLBACK_MODEL  (built-in safe default)
 */
export function resolveModel(): string {
  return process.env.ELW_MODEL || process.env.S0NDER_MODEL || FALLBACK_MODEL;
}
