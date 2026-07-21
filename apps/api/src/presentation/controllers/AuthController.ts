import type { Request, Response } from 'express';
import type { RegisterUseCase } from '@application/auth/RegisterUseCase';
import type { LoginUseCase } from '@application/auth/LoginUseCase';
import type { LogoutUseCase } from '@application/auth/LogoutUseCase';
import type { RefreshTokenUseCase } from '@application/auth/RefreshTokenUseCase';
import type { RegisterInput, LoginInput, RefreshInput } from '../schemas/auth.schema';

export class AuthController {
  constructor(
    private readonly registerUseCase:      RegisterUseCase,
    private readonly loginUseCase:         LoginUseCase,
    private readonly logoutUseCase:        LogoutUseCase,
    private readonly refreshTokenUseCase:  RefreshTokenUseCase,
  ) {}

  register = async (req: Request, res: Response): Promise<void> => {
    const body = req.body as RegisterInput;
    const result = await this.registerUseCase.execute({
      email:    body.email,
      password: body.password,
      role:     body.role as never,
    });
    res.status(201).json(result);
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const body = req.body as LoginInput;
    const tokens = await this.loginUseCase.execute({
      email:     body.email,
      password:  body.password,
      ipAddress: req.ip,
    });
    res.json(tokens);
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body as RefreshInput;
    await this.logoutUseCase.execute(refreshToken, req.user!.id);
    res.status(204).send();
  };

  refresh = async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body as RefreshInput;
    const tokens = await this.refreshTokenUseCase.execute(refreshToken);
    res.json(tokens);
  };
}
