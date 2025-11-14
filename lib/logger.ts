type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  animalId?: string;
  userId?: string;
  action?: string;
  [key: string]: unknown;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  error?: {
    message: string;
    stack?: string;
    name?: string;
  };
}

class Logger {
  private isDevelopment: boolean;

  constructor() {
    // Support both browser and Node.js environments
    this.isDevelopment = 
      (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') ||
      (typeof window !== 'undefined' && window.location?.hostname === 'localhost');
  }

  private formatLog(level: LogLevel, message: string, context?: LogContext, error?: Error): LogEntry {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
    };

    if (context) {
      entry.context = this.sanitizeContext(context);
    }

    if (error) {
      entry.error = {
        message: error.message,
        stack: error.stack,
        name: error.name,
      };
    }

    return entry;
  }

  private sanitizeContext(context: LogContext): LogContext {
    const sanitized: LogContext = { ...context };
    
    // Remove sensitive data
    const sensitiveKeys = ['password', 'token', 'apiKey', 'secret', 'authorization'];
    for (const key of sensitiveKeys) {
      if (key in sanitized) {
        sanitized[key] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  private output(entry: LogEntry): void {
    if (this.isDevelopment) {
      // Pretty print in development
      const prefix = `[${entry.level.toUpperCase()}] ${entry.timestamp}`;
      const contextStr = entry.context ? ` ${JSON.stringify(entry.context)}` : '';
      const errorStr = entry.error ? `\n${entry.error.stack || entry.error.message}` : '';
      
      console.log(`${prefix} ${entry.message}${contextStr}${errorStr}`);
    } else {
      // JSON output in production
      console.log(JSON.stringify(entry));
    }
  }

  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      const entry = this.formatLog('debug', message, context);
      this.output(entry);
    }
  }

  info(message: string, context?: LogContext): void {
    const entry = this.formatLog('info', message, context);
    this.output(entry);
  }

  warn(message: string, context?: LogContext): void {
    const entry = this.formatLog('warn', message, context);
    this.output(entry);
  }

  error(message: string, error?: Error, context?: LogContext): void {
    const entry = this.formatLog('error', message, context, error);
    this.output(entry);
  }
}

// Export singleton instance
export const logger = new Logger();

// Export types for use in other files
export type { LogContext, LogLevel };

