import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../../application/services/auth.service';
import { AuthUseCase } from '../../application/use-cases/auth.use-case';
import { TokenUseCases } from '../../application/use-cases/token-use-cases';
import { User, UserSchema } from '../database/schemas/user.schema';
import { MongoUserRepository } from '../database/repositories/mongo-user.repository';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository';
import { RolesGuard } from '../guards/roles.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { JwtStrategy } from '../strategies/jwt.strategy';
import { LoggerService } from '../logger/logger.service'; // Importa LoggerService

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION', '1h'),
        },
      }),
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthUseCase,
    TokenUseCases,
    {
      provide: USER_REPOSITORY,
      useClass: MongoUserRepository,
    },
    RolesGuard,
    PermissionsGuard,
    JwtStrategy,
    LoggerService, // Registra LoggerService como proveedor
  ],
  exports: [AuthService, RolesGuard, PermissionsGuard],
})
export class AuthModule {}