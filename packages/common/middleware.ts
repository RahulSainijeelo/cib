import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const JWT_PUBLIC_KEY = process.env.JWT_PUBLIC_KEY ?? `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA7JkM9KqFNyC0B0ILTKJL
vOgqXrfDqhW9rwpq5Pn2Vyhp0DdzmSGPzY+H/2EMzZzc//9b8eX6fxZIrW02uQ7o
o1P6dv40vZab2Ie6tgpeKvSLyFcpdbZLWaDX4wH22uVnw7YH/yKdt3vEoSO+Pgev
wIcSyh1w92x1TZ/obSTUpSJ0Ll5A4bR+WUsMqw2pxmKJR6onEoMSUAztGTTqrcdk
32rnk/D3uFe2li5TtsL0Ytsj7CwyfpbHzpfDrqcdOHPEXptH4ALB14WvlHm0wrgw
Aru84NfJ1dH3q/AbNdUGHbLaHJfagSwLMfF5UyxZw8+SgBa5XDUTQu3JXE9GA65Y
DwIDAQAB
-----END PUBLIC KEY-----`;

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization; // Bearer token
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const decoded = jwt.verify(token, JWT_PUBLIC_KEY!, {
    algorithms: ["RS256"],
  });

  if (!decoded) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const userId = (decoded as any).sub;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  req.userId = userId;
  next();
}
