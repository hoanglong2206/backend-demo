import { IsNotEmpty, IsString } from 'class-validator';
import { SessionOutput } from '../create-account/create-account.dto';

export class RefreshTokenInput {
  @IsString()
  @IsNotEmpty()
  refresh_token: string = '';
}

export class RefreshTokenOutput extends SessionOutput {}
