import { useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Users,
  Edit2,
  Trash2,
  X,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  BookOpen,
  Info,
  CreditCard,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export interface User {
  id: number;
  name: string;
  email: string;
  role: "estudiante" | "mentor" | "admin";
  status: "activo" | "inactivo";
  createdAt: string;
}

export interface Mentoría {
  id: number;
  topic: string;
  mentorName: string;
  mentorId: number;
  studentName: string;
  studentId: number;
  status: "activa" | "completada" | "deshabilitada";
  createdAt: string;
  sessionsCompleted: number;
}

export interface Transaction {
  id: number;
  mentoriaId: number;
  mentoriaTopic: string;
  mentorId: number;
  mentorName: string;
  studentId: number;
  studentName: string;
  amount: number;
  commission: number;
  mentorEarnings: number;
  date: string;
  status: "completada" | "pendiente" | "reembolsada";
  paymentMethod: "tarjeta" | "transferencia" | "billetera";
}

interface EditingUser {
  id: number;
  name: string;
  email: string;
}

export default function Admin() {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();

  // Proteger acceso solo para admins
  if (!isLoggedIn || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h1>
          <p className="text-gray-600 mb-6">
            Solo los administradores pueden acceder a esta página.
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }
  const [users, setUsers] = useState<User[]>([]);
  const [mentorías, setMentorías] = useState<Mentoría[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState<"users" | "mentorías" | "transacciones">("users");
  const [editingUser, setEditingUser] = useState<EditingUser | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: "user" | "mentoría";
    id: number;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMentoría, setSelectedMentoría] = useState<Mentoría | null>(null);

  // Funciones para usuarios
  const handleEditUser = (user: User) => {
    setEditingUser({
      id: user.id,
      name: user.name,
      email: user.email,
    });
    setShowEditModal(true);
  };

  const handleSaveUser = () => {
    if (editingUser) {
      setUsers(
        users.map((user) =>
          user.id === editingUser.id
            ? { ...user, name: editingUser.name, email: editingUser.email }
            : user
        )
      );
      setShowEditModal(false);
      setEditingUser(null);
    }
  };

  const handleDeleteUser = (id: number) => {
    setUsers(users.filter((user) => user.id !== id));
    setDeleteConfirm(null);
  };

  const toggleUserStatus = (id: number) => {
    setUsers(
      users.map((user) =>
        user.id === id
          ? {
              ...user,
              status: user.status === "activo" ? "inactivo" : "activo",
            }
          : user
      )
    );
  };

  // Funciones para mentorías
  const handleDisableMentoría = (id: number) => {
    setMentorías(
      mentorías.map((m) =>
        m.id === id ? { ...m, status: "deshabilitada" } : m
      )
    );
  };

  const handleDeleteMentoría = (id: number) => {
    setMentorías(mentorías.filter((m) => m.id !== id));
    setDeleteConfirm(null);
  };

  // Filtrado
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMentorías = mentorías.filter(
    (m) =>
      m.mentorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTransactions = transactions.filter(
    (t) =>
      t.mentorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.mentoriaTopic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Estadísticas de transacciones
  const totalIngresos = transactions.reduce((sum, t) => sum + t.amount, 0);
  const totalComisiones = transactions.reduce((sum, t) => sum + t.commission, 0);
  const totalGananiasmentores = transactions.reduce((sum, t) => sum + t.mentorEarnings, 0);
  const transaccionesCompletadas = transactions.filter(
    (t) => t.status === "completada"
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/")}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-semibold text-gray-900">
                  Panel de Administrador
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => {
              setActiveTab("users");
              setSearchQuery("");
            }}
            className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeTab === "users"
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            <Users className="w-5 h-5" />
            Usuarios ({users.length})
          </button>
          <button
            onClick={() => {
              setActiveTab("mentorías");
              setSearchQuery("");
            }}
            className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeTab === "mentorías"
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            <BookOpen className="w-5 h-5" />
            Mentorías ({mentorías.length})
          </button>
          <button
            onClick={() => {
              setActiveTab("transacciones");
              setSearchQuery("");
            }}
            className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeTab === "transacciones"
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            <CreditCard className="w-5 h-5" />
            Transacciones ({transactions.length})
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder={
              activeTab === "users"
                ? "Buscar usuario por nombre o email..."
                : "Buscar mentoría..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Usuarios Tab */}
        {activeTab === "users" && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Nombre
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Rol
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Fecha de Registro
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.role === "mentor"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-green-50 text-green-700"
                          }`}
                        >
                          {user.role === "mentor" ? "👨‍🏫 Mentor" : "🎓 Estudiante"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString("es-ES")}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => toggleUserStatus(user.id)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            user.status === "activo"
                              ? "bg-green-50 text-green-700 hover:bg-green-100"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {user.status === "activo" ? (
                            <>
                              <Eye className="w-4 h-4 inline mr-1" />
                              Activo
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-4 h-4 inline mr-1" />
                              Inactivo
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Editar usuario"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              setDeleteConfirm({ type: "user", id: user.id })
                            }
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar usuario"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        No se encontraron usuarios
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Mentorías Tab */}
        {activeTab === "mentorías" && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Tema
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Mentor
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Estudiante
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Sesiones
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Fecha
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredMentorías.length > 0 ? (
                  filteredMentorías.map((mentoría) => (
                    <tr
                      key={mentoría.id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {mentoría.topic}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {mentoría.mentorName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {mentoría.studentName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {mentoría.sessionsCompleted}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(mentoría.createdAt).toLocaleDateString(
                          "es-ES"
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            mentoría.status === "activa"
                              ? "bg-green-50 text-green-700"
                              : mentoría.status === "completada"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {mentoría.status === "activa"
                            ? "🟢 Activa"
                            : mentoría.status === "completada"
                            ? "✓ Completada"
                            : "🔴 Deshabilitada"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedMentoría(mentoría)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Ver detalles"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                          {mentoría.status === "activa" && (
                            <button
                              onClick={() => handleDisableMentoría(mentoría.id)}
                              className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                              title="Deshabilitar mentoría"
                            >
                              <EyeOff className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() =>
                              setDeleteConfirm({
                                type: "mentoría",
                                id: mentoría.id,
                              })
                            }
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar mentoría"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        No se encontraron mentorías
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Transacciones Tab */}
        {activeTab === "transacciones" && (
          <div>
            {/* Estadísticas */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-gray-600 text-sm font-medium mb-2">
                  Ingresos Totales
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  ${totalIngresos.toLocaleString("es-CL")}
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-gray-600 text-sm font-medium mb-2">
                  Comisiones (20%)
                </div>
                <div className="text-3xl font-bold text-red-600">
                  ${totalComisiones.toLocaleString("es-CL")}
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-gray-600 text-sm font-medium mb-2">
                  Ganancias Mentores
                </div>
                <div className="text-3xl font-bold text-green-600">
                  ${totalGananiasmentores.toLocaleString("es-CL")}
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-gray-600 text-sm font-medium mb-2">
                  Transacciones Completadas
                </div>
                <div className="text-3xl font-bold text-indigo-600">
                  {transaccionesCompletadas}
                </div>
              </div>
            </div>

            {/* Tabla de Transacciones */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Mentoría
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Mentor
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Estudiante
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Monto
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Comisión
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Ganancias Mentor
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Método
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Fecha
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((transaction) => (
                      <tr
                        key={transaction.id}
                        className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {transaction.mentoriaTopic}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {transaction.mentorName}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {transaction.studentName}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                          ${transaction.amount.toLocaleString("es-CL")}
                        </td>
                        <td className="px-6 py-4 text-sm text-red-600 font-medium">
                          -${transaction.commission.toLocaleString("es-CL")}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-green-600">
                          ${transaction.mentorEarnings.toLocaleString("es-CL")}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              transaction.paymentMethod === "tarjeta"
                                ? "bg-blue-50 text-blue-700"
                                : transaction.paymentMethod === "transferencia"
                                ? "bg-purple-50 text-purple-700"
                                : "bg-green-50 text-green-700"
                            }`}
                          >
                            {transaction.paymentMethod === "tarjeta"
                              ? "💳 Tarjeta"
                              : transaction.paymentMethod === "transferencia"
                              ? "🏦 Transferencia"
                              : "👛 Billetera"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(transaction.date).toLocaleDateString(
                            "es-ES"
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              transaction.status === "completada"
                                ? "bg-green-50 text-green-700"
                                : transaction.status === "pendiente"
                                ? "bg-yellow-50 text-yellow-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {transaction.status === "completada"
                              ? "✓ Completada"
                              : transaction.status === "pendiente"
                              ? "⏳ Pendiente"
                              : "🔄 Reembolsada"}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="px-6 py-12 text-center">
                        <div className="text-gray-500">
                          No se encontraron transacciones
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Edición de Usuario */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Editar Usuario
              </h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingUser(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <p className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 inline mr-2" />
                Información sensible (contraseña) no se puede editar desde aquí
              </p>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingUser(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveUser}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Confirmar eliminación
              </h3>
              <p className="text-gray-600 mb-6">
                {deleteConfirm.type === "user"
                  ? "¿Está seguro de que desea eliminar este usuario? Esta acción no se puede deshacer."
                  : "¿Está seguro de que desea eliminar esta mentoría? Esta acción no se puede deshacer."}
              </p>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (deleteConfirm.type === "user") {
                    handleDeleteUser(deleteConfirm.id);
                  } else {
                    handleDeleteMentoría(deleteConfirm.id);
                  }
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalles de Mentoría */}
      {selectedMentoría && (
        <div
          className="fixed inset-0 bg-black/10 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          onClick={() => setSelectedMentoría(null)}
        >
          <div
            className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-indigo-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Detalles de la Mentoría
                </h2>
              </div>
              <button
                onClick={() => setSelectedMentoría(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Tema */}
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Tema
                </h3>
                <p className="text-lg font-semibold text-gray-900">
                  {selectedMentoría.topic}
                </p>
              </div>

              {/* Información del Mentor y Estudiante */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Mentor
                  </h3>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="font-semibold text-gray-900">
                      {selectedMentoría.mentorName}
                    </p>
                    <p className="text-sm text-gray-600">
                      ID: {selectedMentoría.mentorId}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Estudiante
                  </h3>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="font-semibold text-gray-900">
                      {selectedMentoría.studentName}
                    </p>
                    <p className="text-sm text-gray-600">
                      ID: {selectedMentoría.studentId}
                    </p>
                  </div>
                </div>
              </div>

              {/* Estado y Sesiones */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Estado
                  </h3>
                  <div>
                    <span
                      className={`px-3 py-2 rounded-full text-sm font-medium inline-block ${
                        selectedMentoría.status === "activa"
                          ? "bg-green-50 text-green-700"
                          : selectedMentoría.status === "completada"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {selectedMentoría.status === "activa"
                        ? "🟢 Activa"
                        : selectedMentoría.status === "completada"
                        ? "✓ Completada"
                        : "🔴 Deshabilitada"}
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Sesiones Completadas
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-2xl font-bold text-indigo-600">
                      {selectedMentoría.sessionsCompleted}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">sesiones</p>
                  </div>
                </div>
              </div>

              {/* Fecha de Creación */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Fecha de Creación
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-900">
                    {new Date(selectedMentoría.createdAt).toLocaleDateString(
                      "es-ES",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </p>
                </div>
              </div>

              {/* Información adicional */}
              <div className="bg-indigo-50 p-4 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-indigo-900">
                    Información de la Mentoría
                  </p>
                  <p className="text-sm text-indigo-700 mt-1">
                    Esta mentoría fue creada el{" "}
                    {new Date(selectedMentoría.createdAt).toLocaleDateString(
                      "es-ES"
                    )}{" "}
                    y tiene {selectedMentoría.sessionsCompleted} sesiones
                    completadas.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setSelectedMentoría(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                Cerrar
              </button>
              {selectedMentoría.status === "activa" && (
                <button
                  onClick={() => {
                    handleDisableMentoría(selectedMentoría.id);
                    setSelectedMentoría(null);
                  }}
                  className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <EyeOff className="w-4 h-4" />
                  Deshabilitar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
