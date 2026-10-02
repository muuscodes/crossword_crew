import bcrypt from "bcrypt";

const BCRYPT_ROUNDS = 10;
// Checked when an account has no password, so a missing account takes as long to reject as a
// wrong password.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", BCRYPT_ROUNDS);

export function hashPassword(password) {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

// False when hash is missing (unknown user or a Google-only account).
export async function checkPassword(password, hash) {
  const matches = await bcrypt.compare(password, hash ?? DUMMY_HASH);
  return Boolean(hash) && matches;
}
