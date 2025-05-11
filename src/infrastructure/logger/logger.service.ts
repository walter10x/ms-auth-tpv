import { Injectable, LoggerService as NestLoggerService, LogLevel, Logger } from '@nestjs/common';

@Injectable()
export class LoggerService implements NestLoggerService {
  private readonly logger = new Logger(LoggerService.name);
  private readonly levels: LogLevel[] = ['log', 'error', 'warn', 'debug', 'verbose']; // Define tus niveles de log

  log(message: any, ...optionalParams: any[]) {
    this.logger.log(message, ...optionalParams);
  }

  error(message: any, ...optionalParams: any[]) {
    this.logger.error(message, ...optionalParams);
  }

  warn(message: any, ...optionalParams: any[]) {
    this.logger.warn(message, ...optionalParams);
  }

  debug?(message: any, ...optionalParams: any[]) {
    if (this.levels.includes('debug')) {
      this.logger.debug(message, ...optionalParams);
    }
  }

  verbose?(message: any, ...optionalParams: any[]) {
    if (this.levels.includes('verbose')) {
      this.logger.verbose(message, ...optionalParams);
    }
  }

  // Puedes añadir métodos específicos para loggear eventos de dominio importantes
  domainEvent(eventName: string, payload?: any) {
    this.logger.log(`[Domain Event] ${eventName}`, payload);
  }
}