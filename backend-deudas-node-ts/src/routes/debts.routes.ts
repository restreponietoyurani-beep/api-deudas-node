import { Router } from "express";
import {
  createDebt,
  getDebts,
  getDebtById,
  updateDebt,
  deleteDebt,
  markAsPaid,
  exportDebtsCSV,
  getDebtsSummary
} from "../controllers/debts.controller";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

// Aplicar middleware de autenticación a todas las rutas de deudas
router.use(authMiddleware);

router.post("/", createDebt);
router.get("/", getDebts);
router.get("/export", exportDebtsCSV);
router.get("/summary", getDebtsSummary);
router.get("/:id", getDebtById);
router.put("/:id", updateDebt);
router.delete("/:id", deleteDebt);
router.patch("/:id/pay", markAsPaid);

export default router;