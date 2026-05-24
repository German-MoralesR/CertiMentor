import { useState, useEffect } from "react";
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
  FileText,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export interface User {
  id: number;
  name: string;
  email: string;
  role: "estudiante" | "mentor" | "admin";
  status: "activo" | "inactivo";
  createdAt: string;
  mentorRequest?: boolean;
  certificationCode?: string;
  institution?: string;
  profileImage?: string;
}

export interface Mentoría {
  id: number;
  topic: string;
  mentorName: string;
  mentorId: number;
  studentName: string;
  studentId: number;
  status: string;
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

export interface RequestData {
  id: number;
  type: string;
  status: string;
  certificationCode?: string;
  institution?: string;
  rejectionReason?: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
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
  
  // Obtenemos todos los usuarios (para la prueba simulamos el fetch)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("http://localhost:8081/api/users");
        if (res.ok) {
          const data = await res.json();
          setUsers(data.map((u: any) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role.name.toLowerCase(),
            status: u.status || "activo", 
            createdAt: new Date().toISOString(), 
            mentorRequest: u.mentorRequest,
            certificationCode: u.certificationCode,
            institution: u.institution,
            profileImage: u.profileImage
          })));
        }
      } catch (err) {}
    };
    fetchUsers();

    const fetchMentorias = async () => {
      try {
        const res = await fetch("http://localhost:8083/api/mentorship-sessions");
        if (res.ok) {
          const data = await res.json();
          setMentorías(data.map((m: any) => ({
            id: m.id,
            topic: m.topic || "Sin tema",
            mentorName: m.mentorName || "Mentor Desconocido",
            mentorId: m.mentorId,
            studentName: m.studentName || "Estudiante Desconocido",
            studentId: m.studentId,
            status: m.status?.toLowerCase() || "pendiente",
            createdAt: m.date ? new Date(m.date).toISOString() : new Date().toISOString(),
            sessionsCompleted: m.status === "completada" ? 1 : 0
          })));
        }
      } catch (err) { console.error("Error fetching mentorías:", err) }
    };
    fetchMentorias();

    const fetchRequests = async () => {
      try {
        const res = await fetch("http://localhost:8081/api/solicitudes");
        if (res.ok) {
          const data = await res.json();
          setRequests(data.map((req: any) => {
            // Manejar fechas que vienen como array desde Spring Boot LocalDateTime
            let parsedDate = req.createdAt;
            if (Array.isArray(parsedDate)) {
               parsedDate = new Date(parsedDate[0], parsedDate[1] - 1, parsedDate[2], parsedDate[3] || 0, parsedDate[4] || 0, parsedDate[5] || 0).toISOString();
            }
            return { ...req, createdAt: parsedDate || new Date().toISOString() };
          }));
        }
      } catch (err) {}
    };
    fetchRequests();
  }, []);

  const [users, setUsers] = useState<User[]>([]);
  const [mentorías, setMentorías] = useState<Mentoría[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [activeTab, setActiveTab] = useState<"users" | "mentorías" | "transacciones" | "solicitudes">("users");
  const [mentoriaFilter, setMentoriaFilter] = useState("todas");
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: "mentoría";
    id: number;
  } | null>(null);
  const [selectedMentorRequest, setSelectedMentorRequest] = useState<User | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMentoría, setSelectedMentoría] = useState<Mentoría | null>(null);
  const [selectedRequestView, setSelectedRequestView] = useState<RequestData | null>(null);

  // Funciones para usuarios
  const toggleUserStatus = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:8081/api/users/${id}/status`, { method: "PUT" });
      if (res.ok) {
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
      }
    } catch (err) { console.error(err) }
  };

  const handleApproveMentor = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:8081/api/users/${id}/approve-mentor`, {
        method: "PUT"
      });
      if (response.ok) {
        setUsers(
          users.map((user) =>
            user.id === id
              ? { ...user, role: "mentor", mentorRequest: false }
              : user
          )
        );
        setSelectedMentorRequest(null);
      }
    } catch (err) {
      console.error("Error aprobando mentor");
    }
  };

  const handleRejectMentor = async (id: number) => {
    if (!rejectReason.trim()) return;
    try {
      const response = await fetch(`http://localhost:8081/api/users/${id}/reject-mentor`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason })
      });
      if (response.ok) {
        setUsers(
          users.map((user) =>
            user.id === id
              ? { ...user, mentorRequest: false, certificationCode: undefined, institution: undefined }
              : user
          )
        );
        setSelectedMentorRequest(null);
        setIsRejecting(false);
        setRejectReason("");
      }
    } catch (err) {
      console.error("Error rechazando mentor");
    }
  };

  // Funciones para mentorías
  const handleDisableMentoría = (id: number) => {
    setMentorías(
      mentorías.map((m) =>
        m.id === id ? { ...m, status: "cancelada" } : m
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

  const filteredMentorías = mentorías.filter((m) => {
    const matchesSearch =
      m.mentorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.topic.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesFilter = mentoriaFilter === "todas" || m.status === mentoriaFilter;
    
    return matchesSearch && matchesFilter;
  });

  const filteredTransactions = transactions.filter(
    (t) =>
      t.mentorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.mentoriaTopic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRequests = requests.filter(
    (r) =>
      r.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.type?.toLowerCase().includes(searchQuery.toLowerCase())
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
          <button
            onClick={() => {
              setActiveTab("solicitudes");
              setSearchQuery("");
            }}
            className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeTab === "solicitudes"
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            <FileText className="w-5 h-5" />
            Historial Solicitudes ({requests.length})
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder={
              activeTab === "users"
                ? "Buscar usuario por nombre o email..."
                : activeTab === "mentorías"
                ? "Buscar mentoría..."
                : activeTab === "solicitudes"
                ? "Buscar en solicitudes..."
                : "Buscar transacción..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Filtro de Mentorías */}
        {activeTab === "mentorías" && (
          <div className="mb-6">
            <select
              value={mentoriaFilter}
              onChange={(e) => setMentoriaFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white min-w-[200px]"
            >
              <option value="todas">Todas las mentorías</option>
              <option value="pendiente">Pendientes</option>
              <option value="aceptada">Aceptadas</option>
              <option value="completada">Completadas</option>
              <option value="cancelada">Canceladas</option>
            </select>
          </div>
        )}

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
                        <div className="flex items-center gap-2">
                          {user.mentorRequest && (
                            <span className="w-2 h-2 bg-yellow-400 rounded-full" title="Solicita ser mentor"></span>
                          )}
                          {user.name}
                        </div>
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
                          {user.mentorRequest && (
                            <button
                              onClick={() => setSelectedMentorRequest(user)}
                              className="px-3 py-1 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded text-xs font-medium transition-colors flex items-center gap-1"
                              title="Revisar solicitud de mentor"
                            >
                              <Eye className="w-4 h-4" />
                              Revisar solicitud
                            </button>
                          )}
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
                            mentoría.status === "aceptada" || mentoría.status === "activa"
                              ? "bg-green-50 text-green-700"
                              : mentoría.status === "completada"
                              ? "bg-blue-50 text-blue-700"
                              : mentoría.status === "pendiente"
                              ? "bg-yellow-50 text-yellow-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {mentoría.status === "aceptada" || mentoría.status === "activa"
                            ? "🟢 Aceptada"
                            : mentoría.status === "completada"
                            ? "✓ Completada"
                            : mentoría.status === "pendiente"
                            ? "⏳ Pendiente"
                            : "🔴 Cancelada"}
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
                          {(mentoría.status === "activa" || mentoría.status === "aceptada" || mentoría.status === "pendiente") && (
                            <button
                              onClick={() => handleDisableMentoría(mentoría.id)}
                              className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                              title="Cancelar mentoría"
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

        {/* Solicitudes Tab (Historial) */}
        {activeTab === "solicitudes" && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Usuario</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Tipo</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Fecha</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Estado</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.length > 0 ? (
                  // Mostramos las solicitudes ordenadas de la más nueva a la más antigua
                  filteredRequests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((req) => (
                    <tr
                      key={req.id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div>
                          <p className="font-medium">{req.user?.name || "Usuario Desconocido"}</p>
                          <p className="text-gray-500 text-xs">{req.user?.email || "Sin email"}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                        {req.type}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(req.createdAt).toLocaleDateString("es-ES", { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            req.status === "PENDIENTE" ? "bg-yellow-50 text-yellow-700"
                            : req.status === "APROBADA" ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => setSelectedRequestView(req)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        No se encontraron solicitudes registradas
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Revisión de Solicitud de Mentor */}
      {selectedMentorRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Revisar Solicitud de Mentor
              </h2>
              <button
                onClick={() => {
                  setSelectedMentorRequest(null);
                  setIsRejecting(false);
                  setRejectReason("");
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Usuario solicitante</label>
                <p className="text-gray-900 font-medium">{selectedMentorRequest.name}</p>
                <p className="text-gray-500 text-sm">{selectedMentorRequest.email}</p>
              </div>
              <div className="bg-indigo-50 p-4 rounded-lg space-y-3 border border-indigo-100">
                <div>
                  <label className="block text-xs font-medium text-indigo-900 uppercase tracking-wider mb-1">
                    Código de Certificación
                  </label>
                  <p className="text-indigo-900 font-semibold">{selectedMentorRequest.certificationCode || "No proporcionado"}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-indigo-900 uppercase tracking-wider mb-1">
                    Institución Emisora
                  </label>
                  <p className="text-indigo-900 font-semibold">{selectedMentorRequest.institution || "No proporcionado"}</p>
                </div>
              </div>
              
              {isRejecting ? (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Razón del rechazo
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Indica por qué se rechaza esta solicitud..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    rows={3}
                  />
                </div>
              ) : (
                <p className="text-sm text-gray-600 mt-2">
                  Verifica la validez de la certificación antes de aprobar esta solicitud para asegurar la calidad de los mentores en la plataforma.
                </p>
              )}
            </div>
            
            <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              {isRejecting ? (
                <>
                  <button onClick={() => { setIsRejecting(false); setRejectReason(""); }} className="flex-1 px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                    Cancelar
                  </button>
                  <button onClick={() => handleRejectMentor(selectedMentorRequest.id)} disabled={!rejectReason.trim()} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors font-medium">
                    Confirmar Rechazo
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => setIsRejecting(true)} className="flex-1 px-4 py-2 border border-red-200 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-medium flex justify-center items-center gap-2">
                    <X className="w-4 h-4" /> Rechazar
                  </button>
                  <button onClick={() => handleApproveMentor(selectedMentorRequest.id)} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex justify-center items-center gap-2">
                    <Check className="w-4 h-4" /> Aprobar
                  </button>
                </>
              )}
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
                ¿Está seguro de que desea eliminar esta mentoría? Esta acción no se puede deshacer.
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
                  handleDeleteMentoría(deleteConfirm.id);
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalles de Solicitud (Modo Lectura) */}
      {selectedRequestView && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Registro de Solicitud
              </h2>
              <button
                onClick={() => setSelectedRequestView(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Usuario</label>
                  <p className="text-gray-900 font-medium">{selectedRequestView.user?.name || "Usuario Desconocido"}</p>
                  <p className="text-gray-500 text-sm">{selectedRequestView.user?.email || "Sin email"}</p>
                </div>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    selectedRequestView.status === "PENDIENTE" ? "bg-yellow-50 text-yellow-700" :
                    selectedRequestView.status === "APROBADA" ? "bg-green-50 text-green-700" :
                    "bg-red-50 text-red-700"
                  }`}>
                    {selectedRequestView.status}
                </span>
              </div>
              
              {selectedRequestView.type === "MENTOR" && (
                <div className="bg-indigo-50 p-4 rounded-lg space-y-3 border border-indigo-100 mt-2">
                  <div>
                    <label className="block text-xs font-medium text-indigo-900 uppercase tracking-wider mb-1">Código de Certificación</label>
                    <p className="text-indigo-900 font-semibold">{selectedRequestView.certificationCode || "N/A"}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-indigo-900 uppercase tracking-wider mb-1">Institución Emisora</label>
                    <p className="text-indigo-900 font-semibold">{selectedRequestView.institution || "N/A"}</p>
                  </div>
                </div>
              )}
              {selectedRequestView.status === "RECHAZADA" && selectedRequestView.rejectionReason && (
                <div className="bg-red-50 p-4 rounded-lg border border-red-100 mt-2">
                  <label className="block text-xs font-medium text-red-900 uppercase tracking-wider mb-1">Razón del Rechazo</label>
                  <p className="text-red-800 text-sm">{selectedRequestView.rejectionReason}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-500">Fecha de Creación</label>
                <p className="text-gray-900 text-sm">{new Date(selectedRequestView.createdAt).toLocaleString("es-ES")}</p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg flex justify-end">
              <button onClick={() => setSelectedRequestView(null)} className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                Cerrar
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
                          selectedMentoría.status === "aceptada" || selectedMentoría.status === "activa"
                          ? "bg-green-50 text-green-700"
                          : selectedMentoría.status === "completada"
                          ? "bg-blue-50 text-blue-700"
                            : selectedMentoría.status === "pendiente"
                            ? "bg-yellow-50 text-yellow-700"
                            : "bg-red-50 text-red-700"
                      }`}
                    >
                        {selectedMentoría.status === "aceptada" || selectedMentoría.status === "activa"
                          ? "🟢 Aceptada"
                        : selectedMentoría.status === "completada"
                        ? "✓ Completada"
                          : selectedMentoría.status === "pendiente"
                          ? "⏳ Pendiente"
                          : "🔴 Cancelada"}
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
              {(selectedMentoría.status === "activa" || selectedMentoría.status === "aceptada" || selectedMentoría.status === "pendiente") && (
                <button
                  onClick={() => {
                    handleDisableMentoría(selectedMentoría.id);
                    setSelectedMentoría(null);
                  }}
                  className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <EyeOff className="w-4 h-4" />
                  Cancelar Mentoría
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
