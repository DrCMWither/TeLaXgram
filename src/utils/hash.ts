export async function shortHash(input: string, length = 32): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(input)
  );
  return base64Url(new Uint8Array(digest)).slice(0, length);
}

export async function makeDocKey(userId: number, content: string): Promise<string> {
  const nonce = crypto.getRandomValues(new Uint8Array(8));
  const seed = `${userId}:${Date.now()}:${Array.from(nonce).join(",")}:${content}`;
  return shortHash(seed, 22);
}

function base64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
