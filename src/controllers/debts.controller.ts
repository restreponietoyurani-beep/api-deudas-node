import { Request, Response } from "express";
import { pool } from "../db";

// Crear deuda
export const createDebt = async (req: Request, res: Response) => {
    try {
        const { user_id, description, amount } = req.body;

        if (!user_id || !description || amount === undefined) {
            return res.status(400).json({ error: "Todos los campos son obligatorios" });
        }

        if (amount < 0) {
            return res.status(400).json({ error: "El valor de la deuda no puede ser negativo" });
        }

        const result = await pool.query(
            "INSERT INTO debts (user_id, description, amount) VALUES ($1, $2, $3) RETURNING *",
            [user_id, description, amount]
        );

        return res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Error creando deuda" });
    }
};

// Listar todas las deudas de un usuario
export const getDebts = async (req: Request, res: Response) => {
    try {
        const { user_id, is_paid } = req.query;

        if (!user_id) {
            return res.status(400).json({ error: "user_id es obligatorio" });
        }

        let query = "SELECT * FROM debts WHERE user_id = $1";
        const params: any[] = [user_id];

        if (is_paid !== undefined) {
            query += " AND is_paid = $2";
            params.push(is_paid === "true");
        }

        const result = await pool.query(query, params);

        return res.json(result.rows);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Error obteniendo deudas" });
    }
};

// Obtener deuda por ID
export const getDebtById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const result = await pool.query("SELECT * FROM debts WHERE id = $1", [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Deuda no encontrada" });
        }

        return res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Error obteniendo deuda" });
    }
};

// Editar deuda (solo si no está pagada)
export const updateDebt = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { description, amount } = req.body;

        const existing = await pool.query("SELECT * FROM debts WHERE id = $1", [id]);
        if (existing.rowCount === 0) {
            return res.status(404).json({ error: "Deuda no encontrada" });
        }
        if (existing.rows[0].is_paid) {
            return res.status(400).json({ error: "No se puede editar una deuda pagada" });
        }
        if (amount < 0) {
            return res.status(400).json({ error: "El valor de la deuda no puede ser negativo" });
        }

        const result = await pool.query(
            "UPDATE debts SET description = $1, amount = $2 WHERE id = $3 RETURNING *",
            [description || existing.rows[0].description, amount ?? existing.rows[0].amount, id]
        );

        return res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Error actualizando deuda" });
    }
};

// Eliminar deuda
export const deleteDebt = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const result = await pool.query("DELETE FROM debts WHERE id = $1 RETURNING *", [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Deuda no encontrada" });
        }

        return res.json({ message: "Deuda eliminada" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Error eliminando deuda" });
    }
};

// Marcar deuda como pagada
export const markAsPaid = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "UPDATE debts SET is_paid = TRUE WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Deuda no encontrada" });
        }

        return res.json({ message: "Deuda marcada como pagada", debt: result.rows[0] });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Error marcando deuda como pagada" });
    }
};