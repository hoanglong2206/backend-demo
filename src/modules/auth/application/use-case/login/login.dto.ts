import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import {
  SessionOutput,
  UserOutput,
} from '../create-account/create-account.dto';

export class LoginInput {
  @IsEmail()
  @IsNotEmpty()
  email: string = '';

  @IsString()
  @IsNotEmpty()
  password: string = '';
}

export class LoginOutput {
  user: UserOutput = new UserOutput();
  session: SessionOutput = new SessionOutput();
}
