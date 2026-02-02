/**
 * Safe Logger
 * Logs detailed error information server-side without exposing sensitive data
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  error?: string;
  stack?: string;
  code?: string;
  context?: Record<string, unknown>;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatEntry(
    level: LogLevel,
    message: string,
    meta?: Record<string, unknown>
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...(meta && {
        error: meta.error ? String(meta.error) : undefined,
        stack: meta.stack ? String(meta.stack) : undefined,
        code: meta.code ? String(meta.code) : undefined,
        context: meta.context as Record<string, unknown>,
      }),
    };
  }

  info(message: string, meta?: Record<string, unknown>) {
    const entry = this.formatEntry('info', message, meta);
    if (this.isDevelopment) {
      console.log('ℹ️ ', entry);
    } else {
      // In production, you would send to a logging service (e.g., Sentry, CloudLogging)
      this.sendToLoggingService(entry);
    }
  }

  warn(message: string, meta?: Record<string, unknown>) {
    const entry = this.formatEntry('warn', message, meta);
    if (this.isDevelopment) {
      console.warn('⚠️ ', entry);
    } else {
      this.sendToLoggingService(entry);
    }
  }

  error(meta: { message: string; error?: string; stack?: string; code?: string; context?: Record<string, unknown> }) {
    const entry = this.formatEntry('error', meta.message, meta);
    if (this.isDevelopment) {
      console.error('❌ ', entry);
    } else {
      // Send to logging service in production
      this.sendToLoggingService(entry);
    }
  }

  debug(message: string, meta?: Record<string, unknown>) {
    if (this.isDevelopment) {
      const entry = this.formatEntry('debug', message, meta);
      console.log('🔧 ', entry);
    }
  }

  private sendToLoggingService(entry: LogEntry) {
    // TODO: Integrate with your logging service
    // Examples: Sentry, Google Cloud Logging, LogRocket, Datadog
    //
    // Example (Sentry):
    // if (entry.level === 'error') {
    //   Sentry.captureException(new Error(entry.message), {
    //     extra: entry.context,
    //     tags: { code: entry.code },
    //   });
    // }
    //
    // Example (Google Cloud Logging):
    // logging.entry({ severity: entry.level }, entry.message, entry);
  }
}

export const logger = new Logger();
