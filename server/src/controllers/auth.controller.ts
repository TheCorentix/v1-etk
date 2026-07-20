import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { env } from '../config/env';

export class AuthController {
  private userService = new UserService();

  /**
   * Helper to attach JWT session token to an HTTP-Only secure cookie.
   */
  private setTokenCookie(res: Response, token: string): void {
    res.cookie('token', token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    });
  }

  /**
   * Handles new client registration calls.
   */
  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { idToken, name, phone } = req.body;
      const { user, token } = await this.userService.register(idToken, name, phone);

      this.setTokenCookie(res, token);

      sendSuccess(res, { user, token }, 'Registration completed successfully.', 201);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handles client login verification calls.
   */
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { idToken } = req.body;
      const { user, token } = await this.userService.login(idToken);

      this.setTokenCookie(res, token);

      sendSuccess(res, { user, token }, 'Logged in successfully.', 200);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Clears the HTTP-Only JWT session cookie on client logout.
   */
  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.clearCookie('token', {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax',
      });
      sendSuccess(res, {}, 'Logged out successfully.', 200);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Fetches the current logged in user's profile details.
   */
  getProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const uid = req.user!.uid;
      const user = await this.userService.getProfile(uid);
      sendSuccess(res, { user }, 'Profile retrieved successfully.', 200);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Appends an address card to the user's registry.
   */
  addAddress = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const uid = req.user!.uid;
      const address = await this.userService.addAddress(uid, req.body);
      sendSuccess(res, { address }, 'Address added successfully.', 201);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Removes an address card from the user's registry.
   */
  deleteAddress = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const uid = req.user!.uid;
      const { addressId } = req.params;
      const updatedAddresses = await this.userService.deleteAddress(uid, addressId as string);
      sendSuccess(res, { addresses: updatedAddresses }, 'Address removed successfully.', 200);
    } catch (error) {
      next(error);
    }
  };
}

export default AuthController;
