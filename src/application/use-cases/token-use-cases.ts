import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { USER_REPOSITORY, IUserRepository } from '../../domain/repositories/user.repository';

@Injectable()
export class TokenUseCases {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
  ) {}

  // Caso de uso: Verificar token
  async verifyToken(token: string): Promise<any> {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.userRepository.findById(payload.sub);
      
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      
      return {
        userId: user.id,
        email: user.email,
        roles: user.roles
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  // Caso de uso: Refrescar token
  async refreshToken(token: string): Promise<{ access_token: string }> {
    try {
      // Verificar que el token sea válido aunque esté expirado
      const payload = this.jwtService.verify(token, { ignoreExpiration: true });
      
      // Verificar que el usuario existe
      const user = await this.userRepository.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      
      // Generar nuevo token
      const newPayload = { sub: user.id, email: user.email, roles: user.roles };
      return {
        access_token: this.jwtService.sign(newPayload),
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
