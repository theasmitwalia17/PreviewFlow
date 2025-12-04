import jwt from "jsonwebtoken";
import { prisma } from "../db.js";

export async function decodeAuth(req) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.split(" ")[1] : null;
  if (!token) throw new Error("Missing JWT");

  const payload = jwt.verify(token, process.env.JWT_SECRET);
  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user) throw new Error("User not found");

  return { ...payload, user };
}

export function requireAuth(req, res, next) {
  decodeAuth(req)
    .then((auth) => {
      req.auth = auth;
      next();
    })
    .catch((err) => {
      res.status(401).json({ error: err.message });
    });
}
