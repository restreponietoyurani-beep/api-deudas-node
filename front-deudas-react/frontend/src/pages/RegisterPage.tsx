import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:4000/api/auth";

function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/register`, { email, password });
      navigate("/login"); // redirigir al login después del registro
    } catch (err: any) {
      setError(err.response?.data?.error || "Error en registro");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-tr from-blue-100 via-blue-200 to-blue-300 px-4">
      <form
        onSubmit={handleRegister}
        className="bg-white p-10 rounded-3xl shadow-2xl max-w-md w-full space-y-6"
      >
        <h2 className="text-4xl font-extrabold text-center text-gray-800">Crear cuenta</h2>
        <p className="text-center text-gray-500">Regístrate para continuar</p>

        {error && (
          <p className="text-red-500 text-center font-medium">{error}</p>
        )}

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:scale-105 transform transition-all"
        >
          Registrarse
        </button>

        <p className="text-sm text-center text-gray-500">
          ¿Ya tienes cuenta?{" "}
          <a
            href="/login"
            className="text-blue-600 font-medium hover:underline"
          >
            Inicia sesión
          </a>
        </p>
      </form>
    </div>
  );
}

export default RegisterPage;