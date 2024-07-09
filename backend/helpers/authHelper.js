import bcyptjs from "bcryptjs";
export const hashPassword = async (password) => {
  const saltRounds = 10;
  const hashedPassword = await bcyptjs.hash(password, saltRounds);
  return hashedPassword;
};
export const comparePassword = async (password, hashedPassword) => {
  return bcyptjs.compare(password, hashedPassword);
};
