import express from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../db.js";

const router = express.Router();

router.get("/me", async (req, res) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.replace("Bearer ", "");

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: payload.userId }});

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ tier: user.tier });
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
});

export default router; 
