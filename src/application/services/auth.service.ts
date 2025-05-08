import { Injectable } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import { LoginDto, RegisterDto } from '../dtos/auth.dto';
import { AuthUseCase } from '../use-cases/auth.use-case';
import { TokenUseCases } from '../use-cases/token-use-cases';

@Injectable()
export class AuthService {
  constructor(
    private readonly authUseCase: AuthUseCase,
    private readonly tokenUseCases: TokenUseCases,
  ) {}

  async register(registerDto: RegisterDto): Promise<User> {
    return this.authUseCase.register(registerDto);
  }

  async login(loginDto: LoginDto): Promise<{ access_token: string }> {
    return this.authUseCase.login(loginDto);
  }

  async verifyToken(token: string): Promise<any> {
    return this.tokenUseCases.verifyToken(token);
  }

  async refreshToken(token: string): Promise<{ access_token: string }> {
    return this.tokenUseCases.refreshToken(token);
  }
}
