/**
 * src/middleware/requestId.js
 *
 * Genera un request_id por request y lo adjunta a req.requestId.
 * También lee X-Workflow-Id / X-Correlation-Id del orquestador para
 * correlacionar logs entre servicios.
 *
 * El request_id se propaga de vuelta en el header X-Request-Id de la respuesta.
 */
import { randomUUID } from 'crypto';

export function requestIdMiddleware(req, res, next) {
  // Leer correlation_id del orquestador si viene en headers
  const incomingCorrelation =
    req.headers['x-workflow-id'] ||
    req.headers['x-correlation-id'] ||
    req.headers['x-request-id'] ||
    null;

  const requestId = incomingCorrelation || randomUUID();

  req.requestId     = requestId;
  req.correlationId = incomingCorrelation || requestId;
  req.startTime     = Date.now();

  // Propagar en la respuesta para trazabilidad
  res.setHeader('X-Request-Id', requestId);

  next();
}
