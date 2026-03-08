import { IsEmail, IsNotEmpty } from 'class-validator';

export class ResendOtpInput {
  @IsEmail()
  @IsNotEmpty()
  email: string = '';
}

export class ResendOtpOutput {
  verification_token: string = '';
  expires_at: number = 0; // Unix timestamp (ms)
}
