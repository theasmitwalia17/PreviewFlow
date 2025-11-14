import crypto from "crypto";

export function verifyGithubSignature(rawBody, signature, secret) {
  if (!signature) return false;
  const sigPrefix = "sha256=";
  if (!signature.startsWith(sigPrefix)) return false;
  const expected = sigPrefix + crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch (e) {
    return false;
  }
}
