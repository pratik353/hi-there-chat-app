import jwt from "jsonwebtoken";

export const secretKey = "yourSecretKey"; // Replace with your own secret key

export const generateToken = (payload: any) => {
  const options = {
    expiresIn: "1h", // Token expiration time
  };

  const token = jwt.sign({ ...payload }, secretKey, options);

  return token;
};

export function decodeToken(token: string) {
  const user = jwt.verify(token, secretKey);
  return user;
}
