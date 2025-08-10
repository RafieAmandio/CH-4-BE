import winston from 'winston';
import { DateTime } from 'luxon';

const { combine, timestamp, printf, colorize } = winston.format;

// Custom log format
const logFormat = printf(({ level, message, timestamp }) => {
  const formattedTime = DateTime.fromISO(timestamp as string).toFormat(
    'yyyy-MM-dd HH:mm:ss'
  );
  return `[${formattedTime}] ${level}: ${message}`;
});

// Create logger
export const logger = winston.createLogger({
  level: process.env.ENVIRONMENT === 'production' ? 'info' : 'debug',
  format: combine(timestamp(), logFormat),
  transports: [
    // Console transport
    new winston.transports.Console({
      format: combine(colorize(), timestamp(), logFormat),
    }),
    // File transport for errors
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // File transport for all logs
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Export a stream object for Morgan
export const morganStream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};
