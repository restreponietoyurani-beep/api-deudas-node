import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { pool } from "../db";
import bcrypt from "bcryptjs";

// Registrar usuario
export const registerUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Validar campos obligatorios
        if (!email || !password) {
            return res.status(400).json({ error: "Email y password son obligatorios" });
        }

        // Verificar si el usuario ya existe
        const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

        if (existingUser.rowCount && existingUser.rowCount > 0) {
            return res.status(400).json({ error: "El usuario ya está registrado" });
        }

        // Encriptar contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insertar en BD
        const result = await pool.query(
            "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email",
            [email, hashedPassword]
        );

        return res.status(201).json({
            message: "Usuario registrado exitosamente",
            user: result.rows[0],
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Error registrando usuario" });
    }
};

// Login usuario
export const loginUser = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
  
      if (!email || !password) {
        return res.status(400).json({ error: "Email y password son obligatorios" });
      }
  
      const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
      if ((user as any).rowCount === 0) {
        return res.status(400).json({ error: "Usuario no encontrado" });
      }
  
      const dbUser = user.rows[0];
      const validPassword = await bcrypt.compare(password, dbUser.password_hash);
  
      if (!validPassword) {
        return res.status(401).json({ error: "Contraseña incorrecta" });
      }
  
      const token = jwt.sign(
        { userId: dbUser.id, email: dbUser.email },
        process.env.JWT_SECRET as string,
        { expiresIn: "1h" }
      );
  
      return res.json({
        message: "Login exitoso",
        token,
        user: { id: dbUser.id, email: dbUser.email },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Error iniciando sesión" });
    }
  };