import type { Request, Response } from "express";
import { HTTP_STATUS } from "../../../../shared/constants/http-status";
import type { CreateUserUseCase } from "../../../../application/use-cases/CreateUserUseCase";

export class UserController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  public async create(request: Request, response: Response): Promise<void> {
    const user = await this.createUserUseCase.execute({
      name: String(request.body.name ?? ""),
      email: String(request.body.email ?? ""),
      password: String(request.body.password ?? "")
    });

    const { passwordHash, ...safeUser } = user.toJSON();
    passwordHash;

    response.status(HTTP_STATUS.CREATED).json(safeUser);
  }
}
