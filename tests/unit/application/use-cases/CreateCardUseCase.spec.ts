import { beforeEach, describe, expect, it, vi } from "vitest";
import { CreateCardUseCase } from "../../../../src/application/use-cases/CreateCardUseCase";
import type { UserRepository } from "../../../../src/application/ports/UserRepository";
import type { CardRepository } from "../../../../src/application/ports/CardRepository";
import type { IdGenerator } from "../../../../src/application/ports/IdGenerator";
import { User } from "../../../../src/domain/entities/User";
import { NotFoundError } from "../../../../src/shared/errors/NotFoundError";
import { ValidationError } from "../../../../src/shared/errors/ValidationError";

const makeUser = () =>
  User.create({
    id: "user-1",
    name: "Alice",
    email: "alice@mail.com",
    passwordHash: "hash",
    createdAt: new Date()
  });

const makeCardRepository = (): CardRepository => ({
  findById: vi.fn(),
  findByUserId: vi.fn(),
  save: vi.fn()
});

const makeIdGenerator = (): IdGenerator => ({
  generate: vi.fn().mockReturnValue("card-1")
});

describe("CreateCardUseCase", () => {
  let cardRepository: CardRepository;
  let idGenerator: IdGenerator;

  beforeEach(() => {
    cardRepository = makeCardRepository();
    idGenerator = makeIdGenerator();
  });

  it("should create card for existing user", async () => {
    const userRepository: UserRepository = {
      findById: vi.fn().mockResolvedValue(makeUser()),
      findByEmail: vi.fn(),
      save: vi.fn()
    };

    const useCase = new CreateCardUseCase(userRepository, cardRepository, idGenerator);

    const card = await useCase.execute({
      userId: "user-1",
      cardNumber: "1234123412341234",
      limitCents: 1000
    });

    expect(card.id).toBe("card-1");
    expect(card.toJSON().last4).toBe("1234");
    expect(cardRepository.save).toHaveBeenCalledOnce();
  });

  it("should fail when user does not exist", async () => {
    const userRepository: UserRepository = {
      findById: vi.fn().mockResolvedValue(null),
      findByEmail: vi.fn(),
      save: vi.fn()
    };

    const useCase = new CreateCardUseCase(userRepository, cardRepository, idGenerator);

    await expect(
      useCase.execute({ userId: "user-1", cardNumber: "1234123412341234", limitCents: 1000 })
    ).rejects.toThrow(NotFoundError);
  });

  it("should fail when card number is invalid", async () => {
    const userRepository: UserRepository = {
      findById: vi.fn().mockResolvedValue(makeUser()),
      findByEmail: vi.fn(),
      save: vi.fn()
    };

    const useCase = new CreateCardUseCase(userRepository, cardRepository, idGenerator);

    await expect(
      useCase.execute({ userId: "user-1", cardNumber: "1234", limitCents: 1000 })
    ).rejects.toThrow(ValidationError);
  });
});