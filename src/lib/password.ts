import bcrypt from "bcryptjs";

const COST = 12;
// A real hash used to equalise timing when the account doesn't exist.
const DUMMY = bcrypt.hashSync("kvesty-timing-equaliser", COST);

export const hashPassword = (p: string) => bcrypt.hash(p, COST);
export async function verifyPassword(p: string, hash?: string) {
  const ok = await bcrypt.compare(p, hash ?? DUMMY);
  return Boolean(hash) && ok;
}
