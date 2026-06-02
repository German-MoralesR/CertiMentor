import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
} from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useAuth } from "../context/AuthContext";

export interface ScheduledMentorship {
  id: number;
  mentorId: number;
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
}

export default function MentorSchedule() {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();

  // Proteger acceso solo para mentores
  if (!isLoggedIn || user?.role !== "mentor") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h1>
          <p className="text-gray-600 mb-6">
            Solo los mentores pueden acceder a esta página.
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
  const [activeTab, setActiveTab] = useState<"upcoming" | "completed" | "canceled">("upcoming");
  const [showDetailModal, setShowDetailModal] = useState<number | null>(null);
  const [platformLinkInput, setPlatformLinkInput] = useState("");

  const currentMentorId = user?.id;

  const [mentorships, setMentorships] = useState<ScheduledMentorship[]>([]);

  useEffect(() => {
    if (currentMentorId) fetchMentorSessions();
  }, [currentMentorId]);

  const fetchMentorSessions = async () => {
    if (!currentMentorId) return;
    try {
      const response = await fetch(`http://localhost:8083/api/mentorship-sessions/mentor/${currentMentorId}`);
      if (response.ok) {
        const data = await response.json();
        setMentorships(data);
      }
    } catch (error) {
      console.error("Error fetching mentor sessions:", error);
    }
  };

  const todayStr = new Date().toLocaleDateString("en-CA");

  const upcomingMentorships = mentorships.filter(
    (m) => ["pendiente", "aprobada", "esperando_confirmacion", "disputada"].includes(m.status)
  ).sort((a, b) => new Date(a.date + "T" + a.time).getTime() - new Date(b.date + "T" + b.time).getTime());

  const completedMentorships = mentorships.filter((m) => m.status === "completada");

  const canceledMentorships = mentorships.filter((m) => m.status === "cancelada");

  const totalEarnings = useMemo(() => {
    return completedMentorships
      .filter((m) => m.status === "completada")
      .reduce((sum, m) => sum + m.price, 0);
  }, [completedMentorships]);

  const mentorshipDetail = showDetailModal
    ? mentorships.find((m) => m.id === showDetailModal)
    : null;

  const handleSaveLink = async () => {
    if (!mentorshipDetail || !platformLinkInput) return;

    try {
      const response = await fetch(`http://localhost:8083/api/mentorship-sessions/${mentorshipDetail.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: "aprobada", platformLink: platformLinkInput }),
      });
      if (response.ok) {
        await fetchMentorSessions(); // Recargar datos
        setShowDetailModal(null);
      }
    } catch (error) {
      console.error("Error updating session link:", error);
    }
  };

  const handleRejectSession = async () => {
    if (!mentorshipDetail) return;
    const confirm = window.confirm("¿Estás seguro de que deseas rechazar/cancelar esta sesión?");
    if (!confirm) return;

    try {
      const response = await fetch(`http://localhost:8083/api/mentorship-sessions/${mentorshipDetail.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: "cancelada", platformLink: "" }),
      });
      if (response.ok) {
        await fetchMentorSessions(); // Recargar datos
        setShowDetailModal(null);
      }
    } catch (error) {
      console.error("Error rejecting session:", error);
    }
  };

  const handleFinishSession = async () => {
    if (!mentorshipDetail) return;
    try {
      const response = await fetch(`http://localhost:8083/api/mentorship-sessions/${mentorshipDetail.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: "esperando_confirmacion" }),
      });
      if (response.ok) {
        await fetchMentorSessions();
        setShowDetailModal(null);
      }
    } catch (error) {
      console.error("Error finishing session:", error);
    }
  };

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
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Mi Calendario de Mentorías
                </h1>
                <p className="text-sm text-gray-600">
                  Gestiona tus sesiones programadas
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            Próximas Mentorías ({upcomingMentorships.length})
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
            Completadas ({completedMentorships.length})
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
            Canceladas ({canceledMentorships.length})
          </button>
        </div>

        {/* Próximas Mentorías Tab */}
        {activeTab === "upcoming" && (
          <div>
            {upcomingMentorships.length > 0 ? (
              <div>
                <div className="space-y-4">
                  {upcomingMentorships
                    .map((mentorship) => (
                      <div
                        key={mentorship.id}
                        className={`bg-white border-2 rounded-lg p-6 hover:shadow-lg transition-shadow ${mentorship.date === todayStr ? 'border-indigo-300' : 'border-gray-200'}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex gap-4 flex-1">
                            <div className="w-14 h-14 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                              <ImageWithFallback
                                src={mentorship.studentImage || ""}
                                alt={mentorship.studentName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">
                                {mentorship.date === todayStr && <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full mr-2">HOY</span>}
                                {mentorship.offerTitle || "Sesión de Mentoría"}
                              </h4>
                              <p className="text-gray-600 text-sm mb-1">
                                {mentorship.studentName}
                              </p>
                              <p className="text-gray-500 text-xs italic mb-2">"{mentorship.topic}"</p>
                              <div className="flex gap-4 flex-wrap text-sm">
                                <div className="flex items-center gap-1 text-gray-600">
                                  <Calendar className="w-4 h-4" />
                                  {new Intl.DateTimeFormat("es-ES", {
                                    weekday: "short",
                                    day: "numeric",
                                    month: "short",
                                  }).format(new Date(mentorship.date + "T00:00:00"))}
                                </div>
                                <div className="flex items-center gap-1 text-gray-600">
                                  <Clock className="w-4 h-4" />
                                  {mentorship.time} (GMT-5)
                                </div>
                                <div className="flex items-center gap-1 text-gray-600">
                                  <AlertCircle className="w-4 h-4" />
                                  <span className="text-sm">
                                    {mentorship.duration} minutos
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-xl font-bold text-indigo-600">
                              {mentorship.price === 0 ? "Gratis" : `$${mentorship.price.toLocaleString("es-CL")}`}
                            </div>
                            <div className="mt-2">
                              <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                                mentorship.status === "cancelada"
                                  ? "bg-red-100 text-red-700"
                                  : mentorship.status === "aprobada"
                                  ? "bg-green-100 text-green-700"
                                  : mentorship.status === "pendiente"
                                  ? "bg-yellow-100 text-yellow-700"
                                : mentorship.status === "esperando_confirmacion"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-orange-100 text-orange-700"
                              }`}>
                                {mentorship.status.replace("_", " ")}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                          <button
                            onClick={() => {
                              setShowDetailModal(mentorship.id);
                              setPlatformLinkInput(mentorship.platformLink || "");
                            }}
                            className="w-full px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            Ver Detalles
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No hay mentorías próximas
                </h3>
                <p className="text-gray-600">
                  Aún no tienes mentorías programadas para esta fecha
                </p>
              </div>
            )}
          </div>
        )}

        {/* Completadas Tab */}
        {activeTab === "completed" && (
          <div>
            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-gray-600 text-sm font-medium mb-2">
                  Sesiones Completadas
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {completedMentorships.length}
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-gray-600 text-sm font-medium mb-2">
                  Ganancia Total
                </div>
                <div className="text-3xl font-bold text-green-600 flex items-center gap-2">
                  <DollarSign className="w-7 h-7" />
                  {totalEarnings.toLocaleString("es-CL")}
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-gray-600 text-sm font-medium mb-2">
                  Promedio por Sesión
                </div>
                <div className="text-3xl font-bold text-indigo-600">
                  $
                  {completedMentorships.length > 0
                    ? Math.round(totalEarnings / completedMentorships.length).toLocaleString("es-CL")
                    : "0.00"}
                </div>
              </div>
            </div>

            {/* Lista de completadas */}
            {completedMentorships.length > 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Estudiante
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
                        Ganancia
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {completedMentorships.map((mentorship) => (
                      <tr
                        key={mentorship.id}
                        className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                              <ImageWithFallback
                                src={mentorship.studentImage || ""}
                                alt={mentorship.studentName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            {mentorship.studentName}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {mentorship.topic}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Intl.DateTimeFormat("es-ES", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }).format(new Date(mentorship.date + "T00:00:00"))}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {mentorship.time}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {mentorship.duration} min
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-green-600">
                          {mentorship.price === 0 ? "Gratis" : `$${mentorship.price.toLocaleString("es-CL")}`}
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
                  No hay mentorías completadas
                </h3>
                <p className="text-gray-600">
                  Las sesiones completadas aparecerán aquí
                </p>
              </div>
            )}
          </div>
        )}

        {/* Canceladas Tab */}
        {activeTab === "canceled" && (
          <div>
            {canceledMentorships.length > 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Estudiante</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Tema</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Fecha</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Hora</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Duración</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {canceledMentorships.map((mentorship) => (
                      <tr
                        key={mentorship.id}
                        className="border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => setShowDetailModal(mentorship.id)}
                      >
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                              <ImageWithFallback
                                src={mentorship.studentImage || ""}
                                alt={mentorship.studentName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="text-gray-500 line-through">{mentorship.studentName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400 line-through">
                          {mentorship.topic}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400">
                          {new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", year: "numeric" }).format(new Date(mentorship.date + "T00:00:00"))}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400">{mentorship.time}</td>
                        <td className="px-6 py-4 text-sm text-gray-400">{mentorship.duration} min</td>
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
                  No tienes mentorías canceladas
                </h3>
                <p className="text-gray-600">
                  El historial de sesiones canceladas aparecerá aquí
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de Detalles */}
      {showDetailModal && mentorshipDetail && (
        <>
          <div className="fixed inset-0 bg-transparent z-40" onClick={() => setShowDetailModal(null)}></div>
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
            <div className="bg-white rounded-xl shadow-2xl border-2 border-gray-400 max-w-2xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Detalles de la Mentoría
              </h2>
              <button
                onClick={() => setShowDetailModal(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Estudiante */}
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
                <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden">
                  <ImageWithFallback
                    src={mentorshipDetail.studentImage || ""}
                    alt={mentorshipDetail.studentName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {mentorshipDetail.studentName}
                  </h3>
                  <p className="text-gray-600">Estudiante</p>
                </div>
              </div>

              {/* Información */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mentoría a impartir
                  </label>
                  <p className="text-gray-900 font-semibold">
                    {mentorshipDetail.offerTitle || "Sesión de Mentoría"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dudas del estudiante
                  </label>
                  <p className="text-gray-900 font-semibold">
                    {mentorshipDetail.topic}
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
                    }).format(new Date(mentorshipDetail.date))}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hora
                  </label>
                  <p className="text-gray-900 font-semibold">
                    {mentorshipDetail.time} (GMT-5)
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duración
                  </label>
                  <p className="text-gray-900 font-semibold">
                    {mentorshipDetail.duration} minutos
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio
                  </label>
                  <p className="text-gray-900 font-semibold">
                    {mentorshipDetail.price === 0 ? "Gratis" : `$${mentorshipDetail.price.toLocaleString("es-CL")}`}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <p className="text-gray-900 font-semibold capitalize">
                    {mentorshipDetail.status === "pendiente"
                      ? "Pendiente (Por aprobar)"
                      : mentorshipDetail.status === "aprobada"
                      ? "Aprobada"
                      : mentorshipDetail.status === "cancelada"
                      ? "Cancelada"
                      : "Completada"}
                  </p>
                </div>
              </div>

              {/* Enlace de Plataforma */}
              {(mentorshipDetail.status === "pendiente" || mentorshipDetail.status === "aprobada") && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Link de Acceso a la Plataforma
                  </label>
                  {mentorshipDetail.platformLink ? (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Link actual:</p>
                      <a
                        href={mentorshipDetail.platformLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-700 break-all text-sm font-medium"
                      >
                        {mentorshipDetail.platformLink}
                      </a>
                    </div>
                  ) : null}
                  <input
                    type="url"
                    placeholder="https://zoom.us/j/123456789 o https://meet.google.com/..."
                    value={platformLinkInput}
                    onChange={(e) => setPlatformLinkInput(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Proporciona el enlace de acceso a Zoom, Google Meet u otra plataforma
                  </p>
                </div>
              )}

              {(mentorshipDetail.status === "completada" || mentorshipDetail.status === "cancelada") && mentorshipDetail.platformLink && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Plataforma utilizada:
                  </p>
                  <a
                    href={mentorshipDetail.platformLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-700 break-all text-sm"
                  >
                    {mentorshipDetail.platformLink}
                  </a>
                </div>
              )}
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowDetailModal(null);
                  setPlatformLinkInput("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                Cerrar
              </button>
              {mentorshipDetail.status === "pendiente" && (
                <>
                  <button
                    onClick={handleRejectSession}
                    className="flex-1 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    Rechazar
                  </button>
                  <button
                    onClick={handleSaveLink}
                    disabled={!platformLinkInput}
                        className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                        Aprobar con Link
                  </button>
                </>
              )}
                  {mentorshipDetail.status === "aprobada" && new Date(mentorshipDetail.date + "T" + mentorshipDetail.time) < new Date() && (
                    <>
                      <button onClick={handleRejectSession} className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium">
                        Cancelar Sesión
                      </button>
                      <button onClick={handleSaveLink} className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors font-medium">
                        Actualizar Link
                      </button>
                      <button onClick={handleFinishSession} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Finalizar Sesión
                      </button>
                    </>
                  )}
                  {mentorshipDetail.status === "esperando_confirmacion" && (
                    <div className="w-full text-center p-3 bg-blue-50 text-blue-700 rounded-lg font-medium">Esperando confirmación del estudiante...</div>
                  )}
            </div>
          </div>
        </div>
        </>
      )}
    </div>
  );
}
