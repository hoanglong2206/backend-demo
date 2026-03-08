import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateAccountInput {
  @IsString()
  @IsNotEmpty()
  fullName: string = '';

  @IsEmail()
  @IsNotEmpty()
  email: string = '';

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters.' })
  password: string = '';

  @IsString()
  @IsNotEmpty()
  account_token: string = ''; // Token received after OTP verification
}

export class UserOutput {
  id: string = '';
  email: string = '';
  is_verified: boolean = false;
  is_active: boolean = false;
  created_at: string = '';
  updated_at: string = '';
}

export class SessionOutput {
  access_token: string = '';
  refresh_token: string = '';
  expires_at: number = 0; // Unix timestamp (ms)
}

export class CreateAccountOutput {
  user: UserOutput = new UserOutput();
  session: SessionOutput = new SessionOutput();
}
