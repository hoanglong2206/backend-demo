import { IsEmail, IsNotEmpty } from 'class-validator';

export class RegisterEmailInput {
  @IsEmail()
  @IsNotEmpty()
  email: string = '';
}

export class RegisterEmailOutput {
  verification_token: string = '';
  expires_at: number = 0; // Unix timestamp (ms)
}
