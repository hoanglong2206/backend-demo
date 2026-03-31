import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CompleteOnboardingInput {
  @IsString()
  @IsNotEmpty()
  authId: string = '';

  @IsString()
  @IsNotEmpty()
  username: string = '';

  @IsString()
  @IsNotEmpty()
  fullName: string = '';

  @IsString()
  @IsOptional()
  avatarUrl?: string;
}

export class CompleteOnboardingOutput {
  message: string = '';
  authId: string = '';
  isOnBoarding: boolean = true;
}
