import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { IUserCredentialRepository } from '@modules/auth/domain/repositories/user-credential.repository';
import { IUserProfileRepository } from '@modules/user/domain/repositories/user-profile.repository';
import { IUserSettingsRepository } from '@modules/user/domain/repositories/user-settings.repository';
import { UserProfile } from '@modules/user/domain/entities/user-profile.entity';
import { UserSettings } from '@modules/user/domain/entities/user-settings.entity';
import { Username } from '@modules/user/domain/value-objects/username.vo';
import { FullName } from '@modules/user/domain/value-objects/full-name.vo';
import { AvatarUrl } from '@modules/user/domain/value-objects/avatar-url.vo';
import {
  CompleteOnboardingInput,
  CompleteOnboardingOutput,
} from './complete-onboarding.dto';
import * as crypto from 'crypto';

/**
 * Use-case: Complete the onboarding flow.
 *
 * 1. Validates the auth record exists.
 * 2. Creates the user profile and default settings in the user bounded context.
 * 3. Marks the auth record as onboarded (isOnBoarding = true).
 *
 * WHY separated from create-account: The UserCredential is created eagerly
 * on registration; the user profile is only created once the user fills in
 * their profile details (username, full name, etc.) during onboarding.
 */
@Injectable()
export class CompleteOnboardingHandler {
  constructor(
    @Inject('IUserCredentialRepository')
    private readonly userCredentialRepo: IUserCredentialRepository,

    @Inject('IUserProfileRepository')
    private readonly userProfileRepo: IUserProfileRepository,

    @Inject('IUserSettingsRepository')
    private readonly userSettingsRepo: IUserSettingsRepository,
  ) {}

  async execute(
    input: CompleteOnboardingInput,
  ): Promise<CompleteOnboardingOutput> {
    // 1. Verify the auth record exists
    const auth = await this.userCredentialRepo.findById(input.authId);
    if (!auth) {
      throw new NotFoundException('Auth record not found.');
    }

    // 2. Validate and build value objects
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

    // 3. Check username uniqueness
    const taken = await this.userProfileRepo.existsByUsername(username);
    if (taken) {
      throw new ConflictException('This username is already taken.');
    }

    // 4. Create user profile (use the same ID as the auth record for correlation)
    const userProfile = UserProfile.create(
      input.authId,
      username,
      fullName,
      avatarUrl,
    );
    await this.userProfileRepo.save(userProfile);

    // 5. Create default user settings
    const settingsId = crypto.randomUUID();
    const userSettings = UserSettings.createDefault(settingsId, input.authId);
    await this.userSettingsRepo.save(userSettings);

    // 6. Mark onboarding complete on the auth aggregate
    auth.completeOnboarding();
    await this.userCredentialRepo.update(auth);

    const output = new CompleteOnboardingOutput();
    output.message = 'Onboarding completed successfully.';
    output.authId = auth.id;
    output.isOnBoarding = auth.isOnBoarding;
    return output;
  }
}
