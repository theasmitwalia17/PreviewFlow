import express from "express";
import { prisma } from "../db.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Middleware: verify auth
function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Missing token" });

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

router.get("/projects", auth, async (req, res) => {
  const projects = await prisma.project.findMany({
    where: { userId: req.user.userId },
    include: {
      previews: {
        orderBy: { prNumber: "desc" }
      }
    }
  });

  res.json(projects);
});

export default router;
