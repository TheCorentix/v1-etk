import winston from 'winston';
import path from 'path';
import fs from 'fs';
import { env } from './env';

// Ensure the logs directory exists
const logDirectory = path.resolve(process.cwd(), 'logs');
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const level = () => {
  return env.NODE_ENV === 'development' ? 'debug' : 'info';
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }), // Include stack trace on errors
  winston.format.splat(),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `[${info.timestamp}] [${info.level}]: ${info.message}${info.stack ? `\n${info.stack}` : ''}`
  )
);

const transports = [
  // Output logs to console
  new winston.transports.Console({
    format: consoleFormat,
  }),
  // Output error logs to error.log
  new winston.transports.File({
    filename: path.join(logDirectory, 'error.log'),
    level: 'error',
  }),
  // Output all logs to combined.log
  new winston.transports.File({
    filename: path.join(logDirectory, 'combined.log'),
  }),
];

export const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
  exitOnError: false, // Do not exit on handled exceptions
});

export default logger;
