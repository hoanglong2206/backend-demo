import { IsNotEmpty, IsString } from 'class-validator';

export class LogoutInput {
  @IsString()
  @IsNotEmpty()
  refresh_token: string = '';
}

export class LogoutOutput {
  message: string = '';
}
