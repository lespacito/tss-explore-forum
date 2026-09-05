/**
 * Logger Pino centralisé pour Parlons Violence
 * Compatible Bun - Remplacement de Winston
 *
 * Features:
 * - Format dev: coloré, lisible (pino-pretty)
 * - Format prod: JSON structuré
 * - Redaction automatique des données sensibles
 * - Support TypeScript complet
 * - Compatible Bun runtime
 */

import os from "node:os";
import type { Logger as PinoLogger } from "pino";
import pino from "pino";
import { env } from "@/data/env/server";

const isProd = env.NODE_ENV === "production";
const isTest = env.NODE_ENV === "test";
const serviceName = env.SERVICE_NAME;
const logLevel = env.LOG_LEVEL || (isProd ? "info" : "debug");

/**
 * Clés sensibles à redacter
 */
const SENSITIVE_KEYS = [
	"password",
	"pass",
	"token",
	"authorization",
	"auth",
	"secret",
	"secretCode",
	"apikey",
	"apiKey",
	"api_key",
	"bearer",
	"creditcard",
	"ssn",
];

/**
 * Configuration Pino
 */
const pinoConfig: pino.LoggerOptions = {
	level: logLevel,
	base: {
		service: serviceName,
		env: env.NODE_ENV,
		hostname: os.hostname(),
	},
	// Redaction automatique
	redact: {
		paths: SENSITIVE_KEYS,
		censor: "[REDACTED]",
	},
	// Format dev avec pino-pretty
	transport:
		!isProd && !isTest
			? {
					target: "pino-pretty",
					options: {
						colorize: true,
						translateTime: "yyyy-mm-dd HH:MM:ss.l",
						ignore: "pid,hostname",
						singleLine: false,
						messageFormat: "{msg}",
					},
				}
			: undefined,
	// Silent en test
	enabled: !isTest,
};

/**
 * Logger Pino principal
 */
const pinoLogger: PinoLogger = pino(pinoConfig);

/**
 * Adapter Pino vers API Winston-compatible
 */
export interface Logger {
	error(message: string, meta?: Record<string, any>): void;
	warn(message: string, meta?: Record<string, any>): void;
	info(message: string, meta?: Record<string, any>): void;
	http(message: string, meta?: Record<string, any>): void;
	verbose(message: string, meta?: Record<string, any>): void;
	debug(message: string, meta?: Record<string, any>): void;
	silly(message: string, meta?: Record<string, any>): void;
	child(meta: Record<string, any>): Logger;
}

/**
 * Wrapper pour compatibilité Winston
 */
class PinoWinstonAdapter implements Logger {
	constructor(private pino: PinoLogger) {}

	error(message: string, meta: Record<string, any> = {}): void {
		this.pino.error(meta, message);
	}

	warn(message: string, meta: Record<string, any> = {}): void {
		this.pino.warn(meta, message);
	}

	info(message: string, meta: Record<string, any> = {}): void {
		this.pino.info(meta, message);
	}

	http(message: string, meta: Record<string, any> = {}): void {
		// Pino n'a pas de niveau 'http', on utilise 'info'
		this.pino.info(meta, message);
	}

	verbose(message: string, meta: Record<string, any> = {}): void {
		// Pino n'a pas de niveau 'verbose', on utilise 'debug'
		this.pino.debug(meta, message);
	}

	debug(message: string, meta: Record<string, any> = {}): void {
		this.pino.debug(meta, message);
	}

	silly(message: string, meta: Record<string, any> = {}): void {
		// Pino n'a pas de niveau 'silly', on utilise 'trace'
		this.pino.trace(meta, message);
	}

	child(meta: Record<string, any> = {}): Logger {
		return new PinoWinstonAdapter(this.pino.child(meta));
	}
}

/**
 * Logger principal (compatible API Winston)
 */
export const logger: Logger = new PinoWinstonAdapter(pinoLogger);

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
