import { randomBytes } from "node:crypto";
import argon2 from "argon2";

export type PasswordPolicy = {
  minLength: number;
  maxLength: number;
  memoryCostKiB: number;
  timeCost: number;
  parallelism: number;
};

export const DEFAULT_PASSWORD_POLICY: PasswordPolicy = {
  minLength: 12,
  maxLength: 128,
  memoryCostKiB: 19_456,
  timeCost: 2,
  parallelism: 1,
};

export class PasswordPolicyError extends Error {
  constructor(readonly reasons: string[]) {
    super("La contraseña no cumple la política configurada");
    this.name = "PasswordPolicyError";
  }
}

export function validatePassword(password: string, policy = DEFAULT_PASSWORD_POLICY) {
  const reasons: string[] = [];
  if (password.length < policy.minLength) reasons.push("too_short");
  if (password.length > policy.maxLength) reasons.push("too_long");
  if (!/[a-z]/.test(password)) reasons.push("missing_lowercase");
  if (!/[A-Z]/.test(password)) reasons.push("missing_uppercase");
  if (!/\d/.test(password)) reasons.push("missing_number");
  if (!/[^A-Za-z0-9]/.test(password)) reasons.push("missing_symbol");
  return reasons;
}

export function assertValidPassword(password: string, policy = DEFAULT_PASSWORD_POLICY) {
  const reasons = validatePassword(password, policy);
  if (reasons.length) throw new PasswordPolicyError(reasons);
}

export async function hashPassword(password: string, policy = DEFAULT_PASSWORD_POLICY) {
  assertValidPassword(password, policy);
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: policy.memoryCostKiB,
    timeCost: policy.timeCost,
    parallelism: policy.parallelism,
  });
}

export async function verifyPassword(hash: string, password: string) {
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}

export function generateInitialPassword() {
  const token = randomBytes(18).toString("base64url");
  return `Aula-${token}-9a!`;
}
