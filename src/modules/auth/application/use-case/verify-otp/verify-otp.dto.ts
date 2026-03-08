import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';

export class VerifyOtpInput {
  @IsEmail()
  @IsNotEmpty()
  email: string = '';

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{6}$/, { message: 'OTP code must be exactly 6 digits.' })
  otp: string = '';

  @IsString()
  @IsNotEmpty()
  verification_token: string = '';
}

export class VerifyOtpOutput {
  verified: boolean = false;
  account_token: string = ''; // Temporary token for account creation flow
}
