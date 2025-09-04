import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { cacheService } from "../services/cache";

const JWT_SECRET = process.env.JWT_SECRET || "secret_key";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "No autorizado: falta token" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "No autorizado: token inválido" });
    }

    // Verificar JWT
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; email: string };

    // Verificar si el token está en la cache
    const cachedSession = cacheService.get(token);
    if (!cachedSession) {
      return res.status(401).json({ error: "Sesión expirada o inválida" });
    }

    // Adjuntar usuario al request
    (req as any).user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({ error: "No autorizado: token inválido" });
  }
};