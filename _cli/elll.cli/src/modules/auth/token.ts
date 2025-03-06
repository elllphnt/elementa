// Importing necessary modules

export function parseTokenClaims(token: string): { [key: string]: any } {
  const parts = token.split(".");
  return JSON.parse(Buffer.from(parts[1], "base64").toString()) as {
    elll_id: string;
    exp: number;
    iat: number;
    iss: string;
    sub: string;
  };
}
