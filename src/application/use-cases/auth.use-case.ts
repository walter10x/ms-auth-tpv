import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { USER_REPOSITORY, IUserRepository } from '../../domain/repositories/user.repository';
import { User } from '../../domain/entities/user.entity';
import { RegisterDto, LoginDto } from '../dtos/auth.dto';

@Injectable()
export class AuthUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
  ) {}

  // Caso de uso: Registro de usuario
  async register(registerDto: RegisterDto): Promise<User> {
    // Verificar si el usuario ya existe
    const existingUser = await this.userRepository.findByEmail(registerDto.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    
    // Crear nuevo usuario
    const newUser = new User({
      ...registerDto,
      password: hashedPassword,
    });
    
    // Guardar en base de datos
    return this.userRepository.create(newUser);
  }

  // Caso de uso: Login de usuario
  async login(loginDto: LoginDto): Promise<{ access_token: string }> {
    // Buscar usuario
    const user = await this.userRepository.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generar token JWT
    const payload = { sub: user.id, email: user.email, roles: user.roles };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
// Caso de uso: Obtener usuario por ID
 // async getUserById(userId: string): Promise<User> {
   // const user = await this.userRepository.findById(userId);
    //if (!user) {
     // throw new UnauthorizedException('User not found');
   // }
   // return user;
  //}
//}