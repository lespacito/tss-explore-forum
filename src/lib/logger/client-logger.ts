/**
 * Logger côté client (browser-safe)
 * Pour le serveur, utiliser @/lib/logger/logger
 */

type LogLevel = "debug" | "info" | "warn" | "error";

const isDev = import.meta.env.DEV;

class ClientLogger {
  private log(level: LogLevel, message: string, ...args: any[]) {
    // En test ou si console n'existe pas, ne rien faire
    if (typeof console === "undefined") return;

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    switch (level) {
      case "debug":
        if (isDev) console.debug(prefix, message, ...args);
        break;
      case "info":
        console.info(prefix, message, ...args);
        break;
      case "warn":
        console.warn(prefix, message, ...args);
        break;
      case "error":
        console.error(prefix, message, ...args);
        break;
    }
  }

  debug(message: string, ...args: any[]) {
    this.log("debug", message, ...args);
  }

  info(message: string, ...args: any[]) {
    this.log("info", message, ...args);
  }

  warn(message: string, ...args: any[]) {
    this.log("warn", message, ...args);
  }

  error(message: string, ...args: any[]) {
    this.log("error", message, ...args);
  }
}

export const logger = new ClientLogger();
