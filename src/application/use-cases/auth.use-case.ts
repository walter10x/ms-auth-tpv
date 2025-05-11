import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { USER_REPOSITORY, IUserRepository } from '../../domain/repositories/user.repository';
import { User } from '../../domain/entities/user.entity';
import { RegisterDto, LoginDto } from '../dtos/auth.dto';
import { LoggerService } from '../../infrastructure/logger/logger.service'; // Importa LoggerService

@Injectable()
export class AuthUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
    private readonly loggerService: LoggerService, // Inyecta LoggerService
  ) {}

  // Caso de uso: Registro de usuario
  async register(registerDto: RegisterDto): Promise<User> {
    this.loggerService.log(`Attempting to register user with email: ${registerDto.email}`);

    // Verificar si el usuario ya existe
    const existingUser = await this.userRepository.findByEmail(registerDto.email);
    if (existingUser) {
      this.loggerService.warn(`Registration failed: User with email ${registerDto.email} already exists`);
      throw new Error('User already exists');
    }

    // Encriptar contraseña
    this.loggerService.debug('Hashing password...');
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Crear nuevo usuario
    const newUser = new User({
      ...registerDto,
      password: hashedPassword,
      roles: ['user'], // Asignar rol por defecto
      createdAt: new Date(),
    });

    // Guardar en base de datos
    this.loggerService.log(`Creating new user with email: ${registerDto.email}`);
    const createdUser = await this.userRepository.create(newUser);
    this.loggerService.log(`User successfully registered with ID: ${createdUser.id}`);

    return createdUser;
  }

  // Nuevo método para registrar con roles específicos
  async registerWithRoles(registerDto: RegisterDto, roles: string[]): Promise<User> {
    this.loggerService.log(`Attempting to register user with roles [${roles.join(', ')}] and email: ${registerDto.email}`);

    // Verificar si el usuario ya existe
    const existingUser = await this.userRepository.findByEmail(registerDto.email);
    if (existingUser) {
      this.loggerService.warn(`Registration with roles failed: User with email ${registerDto.email} already exists`);
      throw new Error('User already exists');
    }

    // Encriptar contraseña
    this.loggerService.debug('Hashing password...');
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Crear nuevo usuario con los roles especificados
    const newUser = new User({
      ...registerDto,
      password: hashedPassword,
      roles: roles, // Asignar los roles especificados
      createdAt: new Date(),
    });

    // Guardar en base de datos
    this.loggerService.log(`Creating new user with custom roles and email: ${registerDto.email}`);
    const createdUser = await this.userRepository.create(newUser);
    this.loggerService.log(`User with custom roles successfully registered with ID: ${createdUser.id}`);

    return createdUser;
  }

  // Caso de uso: Login de usuario
  async login(loginDto: LoginDto): Promise<{ access_token: string }> {
    this.loggerService.log(`Login attempt for user: ${loginDto.email}`);

    // Buscar usuario
    const user = await this.userRepository.findByEmail(loginDto.email);

    if (!user) {
      this.loggerService.warn(`Login failed: User not found with email: ${loginDto.email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    this.loggerService.debug(`User found: ${user.id}`);

    // Verificar contraseña
    this.loggerService.debug('Comparing password...');
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      this.loggerService.warn(`Login failed: Invalid password for user: ${loginDto.email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generar token JWT incluyendo los roles
    this.loggerService.debug(`Generating JWT token with roles: ${user.roles.join(', ')}`);
    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles
    };

    const token = this.jwtService.sign(payload);
    this.loggerService.log(`User ${loginDto.email} successfully logged in`);

    return {
      access_token: token,
    };
  }
}