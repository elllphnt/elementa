// src/modules/auth/security.ts

import crypto from "crypto";
import os from "os";

export const getEncryptionKey = () => {
  const macAddress = os.networkInterfaces()?.eth0?.[0]?.mac || "default_mac";
  return crypto.createHash("sha256").update(macAddress).digest();
};

export const encrypt = (text: string, key: Buffer) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
};

export const decrypt = (text: string, key: Buffer) => {
  const [iv, encrypted] = text.split(":");
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    key,
    Buffer.from(iv, "hex"),
  );
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};
