import { useEffect, useState } from "react";
import axios from "axios";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid"; // <- Heroicons
import { useNavigate } from "react-router-dom";

interface Debt {
    id: string;
    description: string;
    amount: number | string;
    is_paid: boolean;
    created_at: string;
}

const API_URL = "http://localhost:4000/api/debts";

// Función auxiliar para formatear el monto
const formatAmount = (amount: number | string): string => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return isNaN(numAmount) ? '$0.00' : `$${numAmount.toFixed(2)}`;
};

// Función auxiliar para convertir is_paid a texto
const getStatusText = (isPaid: boolean): string => {
    return isPaid ? "Pagada" : "Pendiente";
};

// Función auxiliar para formatear fecha
const formatDate = (dateString: string): string => {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return dateString; // Si hay error, devolver la fecha original
    }
};

function DebtsPage() {
    const [debts, setDebts] = useState<Debt[]>([]);
    const [filter, setFilter] = useState<"all" | "pendiente" | "pagada">("all");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [newDescription, setNewDescription] = useState("");
    const [newAmount, setNewAmount] = useState<number | "">("");
    const [creating, setCreating] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [debtToDelete, setDebtToDelete] = useState<string | null>(null);
    const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
    const [isPaid, setIsPaid] = useState(false);

    const userId = localStorage.getItem("user_id");
    const token = localStorage.getItem("token");
    const navigate = useNavigate();

    // Función auxiliar para manejar errores de autenticación
    const handleAuthError = (error: any) => {
        if (error.response?.status === 401) {
            // Mostrar mensaje de sesión expirada
            setError("Tu sesión ha expirado. Serás redirigido al login en 3 segundos...");
            
            // Redirigir después de 3 segundos
            setTimeout(() => {
                handleLogout();
            }, 3000);
            
            return true; // Indica que se manejó el error
        }
        return false; // No se manejó el error
    };

    const fetchDebts = async (statusFilter?: "all" | "pendiente" | "pagada") => {
        setLoading(true);
        setError("");
        try {
            let is_paid;
            if (statusFilter === "pendiente") is_paid = "false";
            else if (statusFilter === "pagada") is_paid = "true";

            const res = await axios.get(API_URL, {
                params: { user_id: userId, is_paid },
                headers: { Authorization: `Bearer ${token}` },
            });
            setDebts(res.data);
        } catch (err: any) {
            if (handleAuthError(err)) return;
            setError(err.response?.data?.error || "Error al obtener las deudas");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Verificar si el usuario está autenticado
        if (!token) {
            navigate("/login");
            return;
        }
        fetchDebts(filter);
    }, []);

    const filteredDebts = debts.filter((debt) => {
        if (filter === "all") return true;
        if (filter === "pendiente") return !debt.is_paid;
        if (filter === "pagada") return debt.is_paid;
        return true;
    });

    const handleCreateDebt = async () => {
        if (!newDescription.trim()) return alert("La descripción es obligatoria");
        if (newAmount === "" || newAmount <= 0)
            return alert("El valor debe ser mayor a 0");

        setCreating(true);
        try {
            if (editingDebt) {
                // EDITAR deuda
                await axios.put(
                    `${API_URL}/${editingDebt.id}`,
                    { description: newDescription, amount: newAmount, is_paid: isPaid },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } else {
                // CREAR deuda
                await axios.post(
                    API_URL,
                    { user_id: userId, description: newDescription, amount: newAmount },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }
            setShowModal(false);
            fetchDebts(filter);
        } catch (err: any) {
            if (handleAuthError(err)) return;
            alert(err.response?.data?.error || "Error guardando la deuda");
        } finally {
            setCreating(false);
            setEditingDebt(null);
            setNewDescription("");
            setNewAmount("");
            setIsPaid(false);
        }
    };
    const handleDeleteDebt = async (id: string) => {
        setDebtToDelete(id);      // Guardamos la deuda que queremos eliminar
        setShowConfirm(true);
    }
    const handleConfirmDelete = async () => {
        if (!debtToDelete) return;
        try {
            await axios.delete(`${API_URL}/${debtToDelete}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchDebts(filter);      // Refrescar lista de deudas
        } catch (err: any) {
            if (handleAuthError(err)) return;
            alert(err.response?.data?.error || "Error eliminando la deuda");
        } finally {
            setShowConfirm(false);   // Cerramos el modal
            setDebtToDelete(null);   // Limpiamos la deuda seleccionada
        }
    };
    const handleCancelDelete = () => {
        setShowConfirm(false);
        setDebtToDelete(null);
    };
    // Abrir modal para editar
    const handleOpenEditModal = (debt: Debt) => {
        setEditingDebt(debt);
        setNewDescription(debt.description);
        setNewAmount(typeof debt.amount === "string" ? Number(debt.amount) : debt.amount);
        setIsPaid(debt.is_paid);
        setShowModal(true);
    };

    // Función para cerrar sesión
    const handleLogout = async () => {
        try {
            // Llamar al endpoint de logout para limpiar la cache del servidor
            await axios.post("http://localhost:4000/api/auth/logout", {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.log("Error en logout:", error);
        } finally {
            // Limpiar localStorage y redirigir
            localStorage.removeItem("token");
            localStorage.removeItem("user_id");
            navigate("/login");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl p-6 space-y-6">
                {/* Header con título y botón de salir */}
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-800">Listado de Deudas</h1>
                    <button
                        onClick={handleLogout}
                        className="text-gray-800 hover:text-gray-900 transition duration-200 flex items-center gap-1 text-sm"
                        title="Cerrar sesión"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Cerrar sesión
                    </button>
                </div>

                {/* Filtros y botón de crear */}
                <div className="flex gap-4 mb-4 items-center">
                    <button
                        onClick={() => {
                            setFilter("all");
                            fetchDebts("all");
                        }}
                        className={`px-4 py-2 rounded-xl font-medium ${filter === "all"
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-700"
                            }`}
                    >
                        Todas
                    </button>
                    <button
                        onClick={() => {
                            setFilter("pendiente");
                            fetchDebts("pendiente");
                        }}
                        className={`px-4 py-2 rounded-xl font-medium ${filter === "pendiente"
                            ? "bg-yellow-400 text-white"
                            : "bg-gray-200 text-gray-700"
                            }`}
                    >
                        Pendientes
                    </button>
                    <button
                        onClick={() => {
                            setFilter("pagada");
                            fetchDebts("pagada");
                        }}
                        className={`px-4 py-2 rounded-xl font-medium ${filter === "pagada"
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 text-gray-700"
                            }`}
                    >
                        Pagadas
                    </button>
                    <button
                        onClick={() => setShowModal(true)}
                        className="ml-auto px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
                    >
                        Nueva deuda
                    </button>
                </div>

                {/* Mensaje de error */}
                {error && (
                    <div className={`p-4 rounded-lg border ${
                        error.includes("sesión ha expirado") 
                            ? "bg-yellow-50 border-yellow-200 text-yellow-800" 
                            : "bg-red-50 border-red-200 text-red-800"
                    }`}>
                        <div className="flex items-center">
                            <span className="text-lg mr-2">
                                {error.includes("sesión ha expirado") ? "⏰" : "⚠️"}
                            </span>
                            <p className="font-medium">{error}</p>
                        </div>
                    </div>
                )}

                {/* Tabla de deudas */}
                {loading ? (
                    <p>Cargando...</p>
                ) : filteredDebts.length === 0 ? (
                    <p className="text-gray-500">No hay deudas para mostrar</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full table-auto border-collapse">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="px-4 py-2 text-left">Acciones</th>
                                    <th className="px-4 py-2 text-left">Descripción</th>
                                    <th className="px-4 py-2 text-left">Monto</th>
                                    <th className="px-4 py-2 text-left">Estado</th>
                                    <th className="px-4 py-2 text-left">Fecha creación</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredDebts.map((debt) => (
                                    <tr key={debt.id} className="border-b hover:bg-gray-50">
                                        <td className="px-4 py-2 flex gap-2">
                                            <button onClick={() => handleOpenEditModal(debt)}  disabled={debt.is_paid} className="p-1 rounded hover:bg-gray-200">
                                                <PencilIcon className="h-5 w-5 text-blue-600" />
                                            </button>
                                            <button onClick={() => handleDeleteDebt(debt.id)} className="p-1 rounded hover:bg-gray-200">
                                                <TrashIcon className="h-5 w-5 text-red-600" />
                                            </button>
                                        </td>
                                        <td className="px-4 py-2">{debt.description}</td>
                                        <td className="px-4 py-2">{formatAmount(debt.amount)}</td>
                                        <td
                                            className={`px-4 py-2 font-medium ${!debt.is_paid
                                                ? "text-yellow-600"
                                                : "text-green-600"
                                                }`}
                                        >
                                            {getStatusText(debt.is_paid)}
                                        </td>
                                        <td className="px-4 py-2">{formatDate(debt.created_at)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Modal para crear nueva deuda */}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md relative">
                            <h2 className="text-2xl font-bold mb-4">
                                {editingDebt ? "Editar deuda" : "Crear nueva deuda"}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 font-bold"
                            >
                                ✕
                            </button>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleCreateDebt();
                                }}
                                className="space-y-4"
                            >
                                <input
                                    type="text"
                                    placeholder="Descripción"
                                    value={newDescription}
                                    onChange={(e) => setNewDescription(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    required
                                />
                                <input
                                    type="number"
                                    placeholder="Valor"
                                    value={newAmount}
                                    onChange={(e) => setNewAmount(Number(e.target.value))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    min={0}
                                    required
                                />

                                {/* Campo solo en edición */}
                                {editingDebt && (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="isPaid"
                                            checked={isPaid}
                                            onChange={(e) => setIsPaid(e.target.checked)}
                                            className="w-4 h-4"
                                        />
                                        <label htmlFor="isPaid" className="text-gray-700">¿Deuda pagada?</label>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:scale-105 transform transition-all"
                                >
                                    {creating
                                        ? (editingDebt ? "Guardando..." : "Creando...")
                                        : (editingDebt ? "Guardar cambios" : "Guardar deuda")}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
                {showConfirm && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                        <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full">
                            <p className="mb-4 text-gray-700">¿Seguro que quieres eliminar esta deuda?</p>
                            <div className="flex justify-end gap-4">
                                <button onClick={handleCancelDelete} className="px-4 py-2 rounded bg-gray-300">Cancelar</button>
                                <button onClick={handleConfirmDelete} className="px-4 py-2 rounded bg-red-500 text-white">Eliminar</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default DebtsPage;