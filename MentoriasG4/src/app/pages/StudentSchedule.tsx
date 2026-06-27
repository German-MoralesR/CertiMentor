import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  Video,
  LogOut,
  Award,
  Search,
  X,
  Star,
} from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useAuth } from "../context/AuthContext";
import { API } from "../config";

export interface ScheduledMentorship {
  id: number;
  mentorId: number;
  offerId: number;
  studentId: number;
  offerTitle?: string;
  mentorImage?: string;
  mentorName: string;
  studentName: string;
  studentImage?: string;
  topic: string;
  date: string;
  time: string;
  duration: number;
  price: number;
  status: "pendiente" | "aprobada" | "completada" | "cancelada" | "esperando_confirmacion" | "disputada";
  platformLink?: string;
  cancelReason?: string;
}

export default function StudentSchedule() {
  const navigate = useNavigate();
  const { user, isLoggedIn, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"upcoming" | "completed" | "canceled">("upcoming");
  const [showDetailModal, setShowDetailModal] = useState<number | null>(null);
  const [isCanceling, setIsCanceling] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Proteger acceso solo para estudiantes
  if (!isLoggedIn || user?.role !== "estudiante") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h1>
          <p className="text-gray-600 mb-6">
            Solo los estudiantes pueden acceder a esta página.
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

  // ID del estudiante actual
  const currentStudentId = user?.id;

  const [studentSessions, setStudentSessions] = useState<ScheduledMentorship[]>([]);

  const fetchSessions = async () => {
    if (!currentStudentId) return;
    try {
      const response = await fetch(`${API.SCHEDULING_SERVICE}/api/mentorship-sessions/student/${currentStudentId}`);
      if (response.ok) {
        const data = await response.json();
        setStudentSessions(data);
      }
    } catch (error) {
      console.error("Error fetching student sessions:", error);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [currentStudentId]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get("payment");

    if (paymentStatus === "success") {
      const pendingBookingStr = localStorage.getItem("pendingBooking");
      if (pendingBookingStr) {
        const bookingPayload = JSON.parse(pendingBookingStr);
        localStorage.removeItem("pendingBooking"); // Limpiar para no duplicar

        fetch(`${API.SCHEDULING_SERVICE}/api/mentorship-sessions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookingPayload)
        })
        .then(res => {
          if (res.ok) {
            alert("¡Pago procesado con éxito! Tu sesión ha sido agendada.");
            fetchSessions(); // Recargar la lista de sesiones
          } else {
            alert("El pago fue exitoso, pero ocurrió un error al registrar la sesión.");
          }
        })
        .catch(err => console.error("Error creating session after payment:", err))
        .finally(() => {
          window.history.replaceState(null, "", window.location.pathname);
        });
      } else {
        window.history.replaceState(null, "", window.location.pathname);
      }
    } else if (paymentStatus === "pending") {
      alert("Tu pago está siendo procesado. Te avisaremos cuando se confirme.");
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []); // Se ejecuta solo una vez al montar

  const todayStr = new Date().toLocaleDateString("en-CA");

  const upcomingSessions = studentSessions.filter(
    (s) => ["pendiente", "aprobada", "esperando_confirmacion", "disputada"].includes(s.status)
  );

  const completedSessions = studentSessions.filter((s) => s.status === "completada");

  const canceledSessions = studentSessions.filter((s) => s.status === "cancelada");

  const sessionDetail = showDetailModal
    ? studentSessions.find((s) => s.id === showDetailModal)
    : null;

  const handleOpenModal = async (session: ScheduledMentorship | null) => {
    setShowDetailModal(session ? session.id : null);
    setReviewSubmitted(false);
    setRating(5);
    setComment("");
    setIsCanceling(false);
    setCancelReason("");
    
    if (session && currentStudentId) {
      try {
        const res = await fetch(`${API.FEEDBACK_SERVICE}/api/reviews/exists?offerId=${session.offerId}&studentId=${currentStudentId}`);
        if (res.ok) {
          const exists = await res.json();
          setReviewSubmitted(exists);
        }
      } catch (error) { console.error("Error verifying review:", error) }
    }
  };

  const handleCompleteSession = async () => {
    if (!sessionDetail) return;
    try {
      const response = await fetch(`${API.SCHEDULING_SERVICE}/api/mentorship-sessions/${sessionDetail.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: "completada", platformLink: sessionDetail.platformLink }),
      });
      if (response.ok) {
        setStudentSessions(studentSessions.map(s => s.id === sessionDetail.id ? { ...s, status: "completada" } : s));
      }
    } catch (error) {
      console.error("Error completing session:", error);
    }
  };

  const handleDisputeSession = async () => {
    if (!sessionDetail) return;
    const reason = prompt("Por favor, describe brevemente por qué estás abriendo una disputa (ej: el mentor no se presentó).");
    if (!reason) return;
    try {
      const response = await fetch(`${API.SCHEDULING_SERVICE}/api/mentorship-sessions/${sessionDetail.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: "disputada", topic: sessionDetail.topic + ` [DISPUTA: ${reason}]` }),
      });
      if (response.ok) {
        await fetchSessions(); // Recargar datos
        setShowDetailModal(null);
      }
    } catch (error) {
      console.error("Error completing session:", error);
    }
  };

  const confirmCancelSession = async () => {
    if (!sessionDetail) return;
    try {
      const response = await fetch(`${API.SCHEDULING_SERVICE}/api/mentorship-sessions/${sessionDetail.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: "cancelada", cancelReason: cancelReason.trim() }),
      });
      if (response.ok) {
        await fetchSessions();
        setShowDetailModal(null);
      }
    } catch (error) {
      console.error("Error cancelling session:", error);
    }
  };

  const handleSubmitReview = async () => {
    if (!sessionDetail || !currentStudentId) return;
    try {
      const reviewPayload = { mentorId: sessionDetail.mentorId, offerId: sessionDetail.offerId, studentId: currentStudentId, rating, comment };
      const response = await fetch(`${API.FEEDBACK_SERVICE}/api/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewPayload)
      });
      if (response.ok) setReviewSubmitted(true);
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b sticky top-0 bg-white/80 backdrop-blur-sm z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900">CertiMentor</span>
          </div>

          <div className="flex items-center gap-2">
            {isLoggedIn && (
              <>
                <button
                  onClick={() => navigate("/buscar")}
                  className="px-3 py-2 text-gray-700 hover:text-gray-900 transition-colors flex items-center gap-2 text-sm"
                >
                  <Search className="w-4 h-4" />
                  Buscar Mentores
                </button>

                {/* Perfil */}
                <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-200">
                  <button onClick={() => navigate("/perfil")} className="flex items-center gap-3 text-left hover:bg-gray-100 p-1 rounded-lg transition-colors">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                      {user?.profileImage ? (
                        <img src={user.profileImage} alt="Perfil" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-lg font-bold text-indigo-600">{user?.name?.charAt(0).toUpperCase() || "U"}</span>
                      )}
                    </div>
                    <div className="hidden sm:block">
                      <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                      <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Sesiones de Mentoría</h1>
          <p className="text-gray-600">Gestiona tus sesiones agendadas, completadas y canceladas.</p>
        </div>
        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeTab === "upcoming"
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            <Calendar className="w-5 h-5" />
            Próximas ({upcomingSessions.length})
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeTab === "completed"
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            <CheckCircle2 className="w-5 h-5" />
            Completadas ({completedSessions.length})
          </button>
          <button
            onClick={() => setActiveTab("canceled")}
            className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeTab === "canceled"
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            <X className="w-5 h-5" />
            Canceladas ({canceledSessions.length})
          </button>
        </div>

        {/* Próximas Sesiones */}
        {activeTab === "upcoming" && (
          <div>
            {upcomingSessions.length > 0 ? (
              <div className="space-y-4">
                {upcomingSessions.map((session) => (
                  <div
                    key={session.id}
                    className="bg-white border-2 border-indigo-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex gap-4 flex-1">
                        {/* Foto del Mentor */}
                        <div className="w-16 h-16 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                          <ImageWithFallback
                            src={session.mentorImage || ""}
                            alt={session.mentorName}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Información */}
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-900 mb-1">
                            {session.offerTitle || "Sesión de Mentoría"}
                          </h3>
                          <p className="text-gray-600 mb-3">
                            con <strong>{session.mentorName}</strong>
                          </p>

                          <div className="flex gap-4 flex-wrap">
                            <div className="flex items-center gap-1 text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <span className="text-sm">
                                {new Intl.DateTimeFormat("es-ES", {
                                  weekday: "short",
                                  day: "numeric",
                                  month: "short",
                                }).format(new Date(session.date + "T00:00:00"))}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-600">
                              <Clock className="w-4 h-4" />
                              <span className="text-sm">
                                {session.time} (GMT-5)
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-600">
                              <AlertCircle className="w-4 h-4" />
                              <span className="text-sm">
                                {session.duration} minutos
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Precio */}
                      <div className="text-right flex-shrink-0">
                        <div className="text-2xl font-bold text-indigo-600 mb-2">
                          {session.price === 0 ? "Gratis" : `$${session.price.toLocaleString("es-CL")}`}
                        </div>
                        <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                          session.status === "cancelada"
                            ? "bg-red-100 text-red-700"
                            : session.status === "aprobada"
                            ? "bg-green-100 text-green-700"
                            : session.status === "pendiente"
                            ? "bg-yellow-100 text-yellow-700"
                            : session.status === "esperando_confirmacion"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-orange-100 text-orange-700"
                        }`}>
                          {session.status.replace("_", " ")}
                        </span>
                      </div>
                    </div>

                    {/* Botones */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenModal(session)}
                        className="flex-1 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors font-medium text-sm"
                      >
                        Ver Detalles
                      </button>
                      {session.status === "cancelada" ? (
                        <button disabled className="flex-1 px-4 py-2 bg-red-50 text-red-500 rounded-lg font-medium text-sm flex items-center justify-center gap-2 cursor-not-allowed">
                          <X className="w-4 h-4" /> Cancelada
                        </button>
                      ) : session.status === "aprobada" && session.platformLink ? (
                        <a
                          href={session.platformLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                        >
                          <Video className="w-4 h-4" />
                          Entrar Ahora
                        </a>
                      ) : (
                        <button disabled className="flex-1 px-4 py-2 bg-gray-200 text-gray-500 rounded-lg font-medium text-sm flex items-center justify-center gap-2 cursor-not-allowed">
                          <Clock className="w-4 h-4" />
                          Esperando Link
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No tienes sesiones próximas
                </h3>
                <p className="text-gray-600 mb-6">
                  Agenda una sesión con un mentor para comenzar
                </p>
                <button
                  onClick={() => navigate("/buscar")}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  Buscar Mentores
                </button>
              </div>
            )}
          </div>
        )}

        {/* Sesiones Completadas */}
        {activeTab === "completed" && (
          <div>
            {completedSessions.length > 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Mentor
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Tema
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Fecha
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Hora
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Duración
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {completedSessions.map((session) => (
                      <tr
                        key={session.id}
                        className="border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => handleOpenModal(session)}
                      >
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                              <ImageWithFallback
                                src={session.studentImage || ""}
                                alt={session.mentorName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            {session.mentorName}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {session.topic}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Intl.DateTimeFormat("es-ES", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }).format(new Date(session.date + "T00:00:00"))}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {session.time}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {session.duration} min
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700">
                            ✓ Completada
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <CheckCircle2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No hay sesiones completadas
                </h3>
                <p className="text-gray-600">
                  Las sesiones completadas aparecerán aquí
                </p>
              </div>
            )}
          </div>
        )}

        {/* Sesiones Canceladas */}
        {activeTab === "canceled" && (
          <div>
            {canceledSessions.length > 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Mentor</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Tema</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Fecha</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Hora</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Duración</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {canceledSessions.map((session) => (
                      <tr
                        key={session.id}
                        className="border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => handleOpenModal(session)}
                      >
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                              <ImageWithFallback
                                src={session.studentImage || ""}
                                alt={session.mentorName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="text-gray-500 line-through">{session.mentorName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400 line-through">
                          {session.topic}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400">
                          {new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", year: "numeric" }).format(new Date(session.date + "T00:00:00"))}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400">{session.time}</td>
                        <td className="px-6 py-4 text-sm text-gray-400">{session.duration} min</td>
                        <td className="px-6 py-4 text-sm">
                          <span className="px-3 py-1 text-xs font-medium rounded-full bg-red-50 text-red-700">
                            ✕ Cancelada
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No hay sesiones canceladas
                </h3>
                <p className="text-gray-600">
                  Tu historial de cancelaciones aparecerá aquí
                </p>
              </div>
            )}
          </div>
        )}

        {/* Botón de Cerrar Sesión */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={logout}
            className="w-full px-6 py-3 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Modal de Detalles */}
      {showDetailModal && sessionDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Detalles de la Sesión
              </h2>
              <button
                onClick={() => setShowDetailModal(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Mentor */}
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
                <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden">
                  <ImageWithFallback
                    src={sessionDetail.mentorImage || ""}
                    alt={sessionDetail.mentorName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {sessionDetail.mentorName}
                  </h3>
                  <p className="text-gray-600">Mentor</p>
                </div>
              </div>

              {/* Información */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mentoría
                  </label>
                  <p className="text-gray-900 font-semibold">
                    {sessionDetail.offerTitle || "Sesión de Mentoría"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tus Dudas / Propósito
                  </label>
                  <p className="text-gray-900 font-medium">
                    {sessionDetail.topic}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha
                  </label>
                  <p className="text-gray-900 font-semibold">
                    {new Intl.DateTimeFormat("es-ES", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }).format(new Date(sessionDetail.date + "T00:00:00"))}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hora
                  </label>
                  <p className="text-gray-900 font-semibold">
                    {sessionDetail.time} (GMT-5)
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duración
                  </label>
                  <p className="text-gray-900 font-semibold">
                    {sessionDetail.duration} minutos
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio
                  </label>
                  <p className="text-gray-900 font-semibold">
                    {sessionDetail.price === 0 ? "Gratis" : `$${sessionDetail.price.toLocaleString("es-CL")}`}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <p className="text-gray-900 font-semibold capitalize">
                    {sessionDetail.status === "pendiente"
                      ? "Por aprobar"
                      : sessionDetail.status === "aprobada"
                      ? "Aprobada"
                      : sessionDetail.status === "cancelada"
                      ? "Cancelada"
                      : "Completada"}
                  </p>
                </div>
              </div>

              {/* Visualización de la Razón de Cancelación */}
              {sessionDetail.status === "cancelada" && sessionDetail.cancelReason && (
                <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
                  <h3 className="text-sm font-semibold text-red-800 mb-1">Razón de la cancelación:</h3>
                  <p className="text-sm text-red-700">{sessionDetail.cancelReason}</p>
                </div>
              )}

              {/* Reseña (solo si está completada y aún no ha sido reseñada) */}
              {sessionDetail.status === "completada" && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    ¿Qué tal fue la mentoría?
                  </h3>
                  {reviewSubmitted ? (
                    <div className="bg-green-50 text-green-700 p-4 rounded-lg flex items-center gap-2 font-medium">
                      <CheckCircle2 className="w-5 h-5" />
                      ¡Gracias por tu reseña!
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button key={star} onClick={() => setRating(star)}>
                            <Star className={`w-8 h-8 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                          </button>
                        ))}
                      </div>
                      <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Escribe un comentario sobre la sesión..." className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" rows={3} />
                      <button onClick={handleSubmitReview} disabled={!comment.trim()} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 transition-colors font-medium">
                        Enviar Reseña
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Recordatorio */}
              {sessionDetail.status !== "completada" && sessionDetail.status !== "cancelada" && (
                <div className="mb-6 mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 Asegúrate de tener tu cámara y micrófono listos 10 minutos
                  antes de la sesión. Recibirás un enlace para entrar a la
                  videollamada.
                </p>
              </div>
              )}

              {/* Razón de cancelación */}
              {isCanceling && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Razón de la cancelación
                  </label>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Describe brevemente por qué deseas cancelar esta sesión..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    rows={3}
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-200">
              {isCanceling ? (
                <>
                  <button
                    onClick={() => { setIsCanceling(false); setCancelReason(""); }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                  >
                    Volver
                  </button>
                  <button
                    onClick={confirmCancelSession}
                    disabled={!cancelReason.trim()}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors font-medium"
                  >
                    Confirmar Cancelación
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleOpenModal(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cerrar
                  </button>
                  {sessionDetail.status === "esperando_confirmacion" && (
                    <>
                      <button onClick={handleDisputeSession} className="flex-1 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium flex items-center justify-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Reportar Problema
                      </button>
                      <button onClick={handleCompleteSession} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Confirmar Mentoría
                      </button>
                    </>
                  )}
                  {sessionDetail.status === "aprobada" && sessionDetail.platformLink && (
                    <a href={sessionDetail.platformLink} target="_blank" rel="noopener noreferrer" className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2 text-center">
                      <Video className="w-4 h-4" />
                      Entrar a la Sesión
                    </a>
                  )}
                  {(sessionDetail.status === "pendiente" || sessionDetail.status === "aprobada") && (
                    <button
                      onClick={() => setIsCanceling(true)}
                      className="flex-1 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" /> Cancelar Sesión
                    </button>
                  )}
                  {(sessionDetail.status === "pendiente" || (sessionDetail.status === "aprobada" && !sessionDetail.platformLink)) && (
                    <button disabled className="flex-1 px-4 py-2 bg-gray-200 text-gray-500 rounded-lg font-medium flex items-center justify-center gap-2 cursor-not-allowed">
                      <Clock className="w-4 h-4" />
                      Esperando Link
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
