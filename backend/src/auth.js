import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import { prisma } from "./db.js";
import "dotenv/config";

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "http://localhost:4000/auth/github/callback",
      scope: ["read:user", "repo"]
    },
    async (accessToken, refreshToken, profile, done) => {
      const user = await prisma.user.upsert({
        where: { githubId: profile.id },
        update: {},
        create: {
          githubId: profile.id,
          name: profile.displayName,
          avatarUrl: profile.photos[0].value
        }
      });
      user.accessToken = accessToken; // Attach accessToken to user object
      return done(null, user);
    }
  )
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await prisma.user.findUnique({ where: { id } });
  return done(null, user);
});

export default passport;
