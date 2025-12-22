/**
 * Logger Winston centralisé pour Parlons Violence
 *
 * Features:
 * - Format dev: coloré, lisible
 * - Format prod: JSON structuré
 * - Redaction automatique des données sensibles
 * - Rotation quotidienne des fichiers en prod
 * - Gestion des exceptions et rejections
 * - Support TypeScript complet
 */

import os from "node:os";
import path from "node:path";
import { createLogger, format, transports } from "winston";
import type { Logger } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { env } from "@/data/env/server";

const { combine, timestamp, printf, json, colorize, errors, splat, metadata } =
  format;

const isProd = env.NODE_ENV === "production";
const isTest = env.NODE_ENV === "test";
const serviceName = env.SERVICE_NAME;
const logDir = env.LOG_DIR || path.join(process.cwd(), "logs");
const logLevel = env.LOG_LEVEL || (isProd ? "info" : "debug");

/**
 * Format de redaction pour masquer les données sensibles
 */
const redact = format((info) => {
  const SENSITIVE_KEYS = [
    "password",
    "pass",
    "token",
    "authorization",
    "auth",
    "secret",
    "apikey",
    "apiKey",
    "api_key",
    "bearer",
    "creditcard",
    "ssn",
  ];

  const redactValue = (key: string): boolean => {
    const lowerKey = key.toLowerCase();
    return SENSITIVE_KEYS.some((sensitiveKey) =>
      lowerKey.includes(sensitiveKey),
    );
  };

  const visit = (obj: any): any => {
    // Return primitives unchanged
    if (!obj || typeof obj !== "object") return obj;

    // Handle arrays
    if (Array.isArray(obj)) {
      return obj.map((item) => visit(item));
    }

    // Handle objects - create a new object to avoid mutation
    const result: Record<string, any> = {};
    for (const key of Object.keys(obj)) {
      const value = obj[key];
      if (redactValue(key)) {
        result[key] = "[REDACTED]";
      } else if (value && typeof value === "object") {
        result[key] = visit(value);
      } else {
        result[key] = value;
      }
    }
    return result;
  };

  // Redact message si objet
  if (typeof info.message === "object") {
    info.message = visit(info.message);
  }

  // Redact metadata
  if (info.metadata && typeof info.metadata === "object") {
    info.metadata = visit(info.metadata);
  }

  return info;
});

/**
 * Format pour développement: coloré et lisible
 */
const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
  splat(), // Support %s, %d, %j
  errors({ stack: true }), // Inclut stack sur Error
  metadata({ fillExcept: ["message", "level", "timestamp", "label"] }),
  redact(),
  format.prettyPrint({ depth: 6 }),
  printf((info) => {
    const { timestamp: ts, level, message, metadata: meta } = info;
    const metaStr =
      meta && Object.keys(meta).length
        ? ` ${JSON.stringify(meta, null, 2)}`
        : "";
    return `${ts} [${level}] ${message}${metaStr}`;
  }),
);

/**
 * Format pour production: JSON structuré
 */
const prodFormat = combine(
  timestamp(),
  splat(),
  errors({ stack: true }),
  metadata({ fillExcept: ["message", "level", "timestamp", "label"] }),
  redact(),
  json(),
);

/**
 * Transports de base (console + fichiers en prod)
 */
const baseTransports: any[] = [
  new transports.Console({
    level: logLevel,
    handleExceptions: true,
    handleRejections: true,
  }),
];

// Rotation de fichiers en production
if (isProd) {
  baseTransports.push(
    new DailyRotateFile({
      dirname: logDir,
      filename: "app-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
      level: "info",
    }),
    new DailyRotateFile({
      dirname: logDir,
      filename: "error-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "30d",
      level: "error",
    }),
  );
}

/**
 * Logger Winston principal
 */
export const logger: Logger = createLogger({
  level: logLevel,
  format: isProd ? prodFormat : devFormat,
  defaultMeta: {
    service: serviceName,
    env: env.NODE_ENV,
    hostname: os.hostname(),
  },
  transports: baseTransports,
  exitOnError: false, // Ne pas quitter sur erreur, laisser le process manager gérer
  silent: isTest, // Désactive les logs en test
});

/**
 * Crée un child logger avec metadata additionnelle
 *
 * @example
 * const reqLogger = withMeta({ correlationId: 'abc-123' });
 * reqLogger.info('User logged in', { userId: 42 });
 */
export const withMeta = (meta: Record<string, any> = {}): Logger => {
  return logger.child(meta);
};

/**
 * Log une erreur avec contexte
 */
export const logError = (
  message: string,
  error: Error | unknown,
  meta: Record<string, any> = {},
): void => {
  if (error instanceof Error) {
    logger.error(message, {
      ...meta,
      error: error.message,
      stack: error.stack,
    });
  } else {
    logger.error(message, { ...meta, error: String(error) });
  }
};

/**
 * Types d'export pour utilisation externe
 */
export type { Logger } from "winston";
