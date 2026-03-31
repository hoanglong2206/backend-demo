import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { IUserProfileRepository } from '@modules/user/domain/repositories/user-profile.repository';
import { IUserSettingsRepository } from '@modules/user/domain/repositories/user-settings.repository';
import { UserProfile } from '@modules/user/domain/entities/user-profile.entity';
import { UserSettings } from '@modules/user/domain/entities/user-settings.entity';
import { Username } from '@modules/user/domain/value-objects/username.vo';
import { FullName } from '@modules/user/domain/value-objects/full-name.vo';
import { AvatarUrl } from '@modules/user/domain/value-objects/avatar-url.vo';
import {
  CreateUserInput,
  CreateUserOutput,
  UserProfileOutput,
} from './create-user.dto';
import * as crypto from 'crypto';

/**
 * Use-case: Create a new user profile.
 *
 * Creates a UserProfile aggregate and default UserSettings, then persists
 * both. Typically called after the auth account-creation flow to establish
 * the user's public-facing profile.
 */
@Injectable()
export class CreateUserHandler {
  constructor(
    @Inject('IUserProfileRepository')
    private readonly userProfileRepo: IUserProfileRepository,

    @Inject('IUserSettingsRepository')
    private readonly userSettingsRepo: IUserSettingsRepository,
  ) {}

  async execute(input: CreateUserInput): Promise<CreateUserOutput> {
    // 1. Validate and create value objects
    const usernameResult = Username.create(input.username);
    if (usernameResult.isFailure()) {
      throw new ConflictException(usernameResult.getError());
    }
    const username = usernameResult.getValue();

    const fullNameResult = FullName.create(input.fullName);
    if (fullNameResult.isFailure()) {
      throw new ConflictException(fullNameResult.getError());
    }
    const fullName = fullNameResult.getValue();

    const avatarUrlResult = AvatarUrl.create(input.avatarUrl ?? null);
    if (avatarUrlResult.isFailure()) {
      throw new ConflictException(avatarUrlResult.getError());
    }
    const avatarUrl = avatarUrlResult.getValue();

    // 2. Check username uniqueness
    const taken = await this.userProfileRepo.existsByUsername(username);
    if (taken) {
      throw new ConflictException('This username is already taken.');
    }

    // 3. Create and persist the UserProfile
    const userProfile = UserProfile.create(
      input.id,
      username,
      fullName,
      avatarUrl,
    );
    await this.userProfileRepo.save(userProfile);

    // 4. Create and persist default UserSettings
    const settingsId = crypto.randomUUID();
    const userSettings = UserSettings.createDefault(settingsId, userProfile.id);
    await this.userSettingsRepo.save(userSettings);

    // 5. Build response
    const user = new UserProfileOutput();
    user.id = userProfile.id;
    user.username = userProfile.username.value;
    user.fullName = userProfile.fullName.value;
    user.avatarUrl = userProfile.avatarUrl.value;
    user.createdAt = userProfile.createdAt.toISOString();
    user.updatedAt = userProfile.updatedAt.toISOString();

    const output = new CreateUserOutput();
    output.user = user;
    return output;
  }
}
