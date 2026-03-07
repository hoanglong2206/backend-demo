/**
 * Domain service interface for generating authentication tokens.
 *
 * WHY: The domain needs tokens (access tokens, refresh tokens) but
 * should not know about JWT, signing keys, or token formats.
 * Infrastructure adapters handle the cryptographic details.
 */
export interface ITokenGeneratorService {
  /**
   * Generate an access token for the given user.
   *
   * @param userId  - Unique identifier of the authenticated user.
   * @param payload - Optional additional claims to embed in the token.
   * @returns The signed access token string.
   */
  generateAccessToken(
    userId: string,
    payload?: Record<string, unknown>,
  ): Promise<string>;

  /**
   * Generate a refresh token for the given user.
   *
   * @param userId - Unique identifier of the authenticated user.
   * @returns The signed or opaque refresh token string.
   */
  generateRefreshToken(userId: string): Promise<string>;

  /**
   * Verify and decode an access token, returning its payload.
   *
   * @throws if the token is invalid, expired, or tampered with.
   */
  verifyAccessToken(token: string): Promise<Record<string, unknown>>;

  /**
   * Verify a refresh token and return the associated user ID.
   *
   * @throws if the token is invalid or expired.
   */
  verifyRefreshToken(token: string): Promise<string>;
}
