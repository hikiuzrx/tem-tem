import winston from 'winston';

const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(
    (
      info: winston.Logform.TransformableInfo & {
        context?: string;
        trace?: string;
      },
    ) => {
      const { timestamp, level, message, context, trace } = info;

      const contextStr = context
        ? `[${context}]`.padEnd(13)
        : '[App]'.padEnd(13);
      const traceStr = trace ? `\n${trace}` : '';

      // Emoji map for log levels
      const levelEmoji: Record<string, string> = {
        error: '❌',
        warn: '⚠️ ',
        info: 'ℹ️ ',
        debug: '🐛',
        verbose: '📝',
      };

      const emoji = levelEmoji[level] || 'ℹ️ ';
      const levelStr = level.toUpperCase().padEnd(8);

      return `${String(timestamp)} ${emoji} ${levelStr} ${contextStr} ${String(message)}${traceStr}`;
    },
  ),
);

export const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize({ all: true }),
    customFormat,
  ),
});

export const fileTransport = new winston.transports.File({
  filename: 'logs/app.log',
  format: winston.format.combine(
    winston.format.uncolorize(),
    winston.format.json(),
  ),
});

export const errorFileTransport = new winston.transports.File({
  filename: 'logs/error.log',
  level: 'error',
  format: winston.format.combine(
    winston.format.uncolorize(),
    winston.format.json(),
  ),
});
