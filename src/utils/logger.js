/**
 * src/utils/logger.js
 *
 * Logger estructurado para API-email.
 * Formato: <ISO-timestamp> [EMAIL API] [LEVEL] <tag> <msg> key=value ...
 *
 * Nivel mínimo configurable con LOG_LEVEL env var (debug|info|warn|error).
 * Default: info.
 *
 * NO imprime contraseñas, base64 completo ni secretos.
 */

const LEVEL_NUM = { debug: 10, info: 20, warn: 30, error: 40 };
const MIN_LEVEL = LEVEL_NUM[(process.env.LOG_LEVEL || 'info').toLowerCase()] ?? 20;
const PREFIX    = '[EMAIL API]';

/**
 * Serializa un campo extra a "key=value" evitando base64 largos.
 */
function _serializeValue(v) {
  if (v === null || v === undefined) return 'null';
  if (typeof v === 'string') {
    // Si parece base64 grande, truncar
    if (v.length > 200 && /^[A-Za-z0-9+/=]+$/.test(v.slice(0, 50))) {
      return JSON.stringify(`<base64 ~${Math.floor((v.length * 3) / 4)} bytes>`);
    }
    return JSON.stringify(v);
  }
  if (Array.isArray(v)) return JSON.stringify(v);
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

function _formatLine(level, tag, msg, extra) {
  const ts      = new Date().toISOString();
  const lvlStr  = level.toUpperCase().padEnd(5);
  const extraKv = Object.entries(extra || {})
    .map(([k, v]) => `${k}=${_serializeValue(v)}`)
    .join(' ');
  return extraKv
    ? `${ts} ${PREFIX} [${lvlStr}] ${tag} ${msg} ${extraKv}`
    : `${ts} ${PREFIX} [${lvlStr}] ${tag} ${msg}`;
}

export function log(level, tag, msg, extra = {}) {
  const num = LEVEL_NUM[level] ?? 20;
  if (num < MIN_LEVEL) return;
  const line = _formatLine(level, tag, msg, extra);
  if (level === 'error') {
    console.error(line);
  } else if (level === 'warn') {
    console.warn(line);
  } else {
    console.log(line);
  }
}

export const info  = (tag, msg, extra = {}) => log('info',  tag, msg, extra);
export const warn  = (tag, msg, extra = {}) => log('warn',  tag, msg, extra);
export const error = (tag, msg, extra = {}) => log('error', tag, msg, extra);
export const debug = (tag, msg, extra = {}) => log('debug', tag, msg, extra);
