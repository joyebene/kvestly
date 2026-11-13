import "server-only";
import bcrypt from "bcryptjs";

const COST = 12;
// Pre-computed hash so login takes the same time whether or not the account exists.
const DUMMY_HASH = bcrypt.hashSync("kvesty-timing-equaliser", COST);

export const hashPassword = (plain: string) => bcrypt.hash(plain, COST);

export async function verifyPassword(plain: string, hash: string | undefined): Promise<boolean> {
  const ok = await bcrypt.compare(plain, hash ?? DUMMY_HASH);
  return Boolean(hash) && ok;
}
