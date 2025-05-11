import { Body, Controller, Post, Get, UseGuards } from '@nestjs/common';
import { AuthService } from '../../application/services/auth.service';
import { LoginDto, RegisterDto } from '../../application/dtos/auth.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { Roles } from '../guards/roles.decorator';
import { RequirePermissions } from '../guards/permissions.decorator';
import { PERMISSIONS } from '../../domain/constants/permissions';
import { LoggerService } from '../logger/logger.service'; // Importa LoggerService

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: LoggerService, // Inyecta LoggerService
  ) {}

  @Get('test')
  test() {
    this.logger.log('AuthController - Test endpoint accessed'); // Ejemplo de log
    return { message: 'Hello this App tpv Welcome' };
  }

  // Nuevo endpoint para crear administradores
  @Post('register-admin')
  @UseGuards(JwtAuthGuard, RolesGuard) // Solo super-admins pueden crear admins
  @Roles('super-admin')
  async registerAdmin(@Body() registerDto: RegisterDto) {
    this.logger.log(`AuthController - Attempting to register admin with email: ${registerDto.email}`);
    const user = await this.authService.registerWithRoles(registerDto, ['admin']);
    this.logger.debug(`AuthController - Admin registered: ${JSON.stringify(user)}`);
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles,
    };
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    this.logger.log(`AuthController - Attempting to register user with email: ${registerDto.email}`);
    const user = await this.authService.register(registerDto);
    this.logger.debug(`AuthController - User registered: ${JSON.stringify(user)}`);
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles,
    };
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    this.logger.log(`AuthController - Attempting login with email: ${loginDto.email}`);
    const result = await this.authService.login(loginDto);
    this.logger.debug(`AuthController - Login successful for email: ${loginDto.email}`);
    return result;
  }

  // Ejemplo de endpoint protegido por rol
  @Get('admin-data')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super-admin')
  async getAdminData() {
    this.logger.log('AuthController - Accessing admin data');
    return { message: 'This data is only for admins' };
  }

  // Ejemplo de endpoint protegido por permiso específico
  @Post('create-user')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(PERMISSIONS.CREATE_USER)
  async createUser(@Body() userData: any) {
    this.logger.log('AuthController - Attempting to create user', userData);
    // Implementación para crear usuario
    const result = { message: 'User created successfully' }; // Simulación
    this.logger.debug('AuthController - User creation result:', result);
    return result;
  }
}

//@UseGuards(JwtAuthGuard)
//@Get('protected-route')
//getProtectedData() {
 // return { message: 'Solo accesible con JWT válido' };
//}



//{
  //"access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2ODIwZTBmYWJiNzM4M2E5N2FkODYxZTEiLCJlbWFpbCI6InN1cGVyQGV4YW1wbGUuY29tIiwicm9sZXMiOlsic3VwZXItYWRtaW4iXSwiaWF0IjoxNzQ2OTg1MjM3LCJleHAiOjE3NDcwNzE2Mzd9.OrurdDbb5IGk_VnWGSCLTAHoQm-r7j5bNv5IaBhNn_s"
//}