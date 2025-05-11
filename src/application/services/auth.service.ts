import { Injectable } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import { LoginDto, RegisterDto } from '../dtos/auth.dto';
import { AuthUseCase } from '../use-cases/auth.use-case';
import { TokenUseCases } from '../use-cases/token-use-cases';
import { LoggerService } from '../../infrastructure/logger/logger.service'; // Importa LoggerService

@Injectable()
export class AuthService {
  constructor(
    private readonly authUseCase: AuthUseCase,
    private readonly tokenUseCases: TokenUseCases,
    private readonly loggerService: LoggerService, // Inyecta LoggerService
  ) {}

  async registerWithRoles(registerDto: RegisterDto, roles: string[]): Promise<User> {
    this.loggerService.log(`AuthService - Registering user with roles: ${roles.join(', ')} and email: ${registerDto.email}`);
    const user = await this.authUseCase.registerWithRoles(registerDto, roles);
    this.loggerService.debug(`AuthService - Registration with roles successful for user ID: ${user.id}`);
    return user;
  }

  async register(registerDto: RegisterDto): Promise<User> {
    this.loggerService.log(`AuthService - Registering user with email: ${registerDto.email}`);
    const user = await this.authUseCase.register(registerDto);
    this.loggerService.debug(`AuthService - Registration successful for user ID: ${user.id}`);
    return user;
  }

  async login(loginDto: LoginDto): Promise<{ access_token: string }> {
    this.loggerService.log(`AuthService - Logging in user with email: ${loginDto.email}`);
    const token = await this.authUseCase.login(loginDto);
    this.loggerService.debug(`AuthService - Login successful for user: ${loginDto.email}`);
    return token;
  }

  async verifyToken(token: string): Promise<any> {
    this.loggerService.log(`AuthService - Verifying token: ${token}`);
    const payload = await this.tokenUseCases.verifyToken(token);
    this.loggerService.debug(`AuthService - Token verification result: ${JSON.stringify(payload)}`);
    return payload;
  }

  async refreshToken(token: string): Promise<{ access_token: string }> {
    this.loggerService.log(`AuthService - Refreshing token: ${token}`);
    const newToken = await this.tokenUseCases.refreshToken(token);
    this.loggerService.debug(`AuthService - Token refresh successful`);
    return newToken;
  }
}