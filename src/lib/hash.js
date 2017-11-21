/* eslint-disable import/prefer-default-export */

// Bcrypt hashing functions

// ----------------------
// IMPORTS

/* NPM */

// JSON web tokens
import jwt from 'jsonwebtoken';
import hasher from 'wordpress-hash-node';

// ----------------------

// JWT secret key -- do not expose this!  It's generally a better idea to
// have secret keys set by environment vars and not baked into the code, but
// for the sake of brevity, we'll keep this as a constant for now
const JWT_SECRET = 'change me before you go to production!';

/* JWT */

// Sign a JWT.  Pass in an object, which will be publicly visible.
export function encodeJWT(data) {
  return jwt.sign(data, JWT_SECRET);
}

// Verify a JWT.  Note:  This can throw an error if the token is invalid,
// so always catch it!
export function decodeJWT(token) {
  return jwt.verify(token, JWT_SECRET);
}

export async function checkPassword(plainTextPassword, hash) {
  return hasher.CheckPassword(plainTextPassword, hash);
}
