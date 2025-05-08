import { Body, Controller, Post,Get} from '@nestjs/common';
import { AuthService } from '../../application/services/auth.service';
import { LoginDto, RegisterDto } from '../../application/dtos/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('test')
  test(){
    return {message:'Hello from auth controller'}
  }


  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.authService.register(registerDto);
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles,
    };
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
