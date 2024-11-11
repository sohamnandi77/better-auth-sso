import { sha256 } from "oslo/crypto";
import { base64url } from "oslo/encoding";

export async function generateCodeChallenge(codeVerifier: string) {
  const codeChallengeBytes = await sha256(
    new TextEncoder().encode(codeVerifier)
  );
  return base64url.encode(new Uint8Array(codeChallengeBytes), {
    includePadding: false,
  });
}
