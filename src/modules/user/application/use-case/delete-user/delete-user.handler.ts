import { Injectable, Inject } from '@nestjs/common';
import { IUserProfileRepository } from '@modules/user/domain/repositories/user-profile.repository';
import { IUserSettingsRepository } from '@modules/user/domain/repositories/user-settings.repository';
import { UserNotFoundException } from '@modules/user/domain/exceptions/user-not-found.exception';
import { DeleteUserInput, DeleteUserOutput } from './delete-user.dto';

/**
 * Use-case: Soft-delete a user profile.
 *
 * Marks the UserProfile as deleted and removes associated settings.
 * The underlying record is retained for audit purposes.
 */
@Injectable()
export class DeleteUserHandler {
  constructor(
    @Inject('IUserProfileRepository')
    private readonly userProfileRepo: IUserProfileRepository,

    @Inject('IUserSettingsRepository')
    private readonly userSettingsRepo: IUserSettingsRepository,
  ) {}

  async execute(input: DeleteUserInput): Promise<DeleteUserOutput> {
    // 1. Find the user profile
    const userProfile = await this.userProfileRepo.findById(input.id);
    if (!userProfile || userProfile.isDeleted()) {
      throw new UserNotFoundException();
    }

    // 2. Soft-delete the profile (domain enforces invariants)
    userProfile.delete();
    await this.userProfileRepo.softDelete(userProfile.id);

    // 3. Remove associated settings
    await this.userSettingsRepo.deleteByUserId(userProfile.id);

    const output = new DeleteUserOutput();
    output.message = 'User deleted successfully.';
    return output;
  }
}
