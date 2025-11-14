import express from "express";
import axios from "axios";
import { prisma } from "../db.js";
import jwt from "jsonwebtoken";

const router = express.Router();

router.get("/repos", async (req, res) => {
  const auth = req.headers.authorization?.split(" ")[1];
  if (!auth) return res.status(401).json({ error: "Missing token" });

  const { accessToken } = jwt.verify(auth, process.env.JWT_SECRET);

  const response = await axios.get("https://api.github.com/user/repos", {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  res.json(response.data.map(repo => ({
    name: repo.name,
    owner: repo.owner.login,
    fullName: repo.full_name
  })));
});

export default router;
