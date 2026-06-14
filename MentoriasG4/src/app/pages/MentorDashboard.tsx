import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Plus, X, Star, Trash2, Edit2, Calendar, AlertCircle } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useAuth } from "../context/AuthContext";

export interface MentorshipOffer {
  id: number;
  mentorId: number;
  mentorName: string;
  title: string;
  description?: string;
  image: string;
  price: number;
  sessionsCompleted: number;
  rating: number;
  reviews: number;
  timeStart: string;
  timeEnd: string;
  availability: string;
  skills: string[];
  availableDates: string[];
  status?: string;
}

interface FormData {
  title: string;
  imagePreview: string;
  imageFile: File | null;
  description: string;
  skills: string;
  price: string; // Se guarda como string en el estado para facilitar el input
  isGratis: boolean; // Estado para manejar el botón y deshabilitar el input
  timeStart: string;
  timeEnd: string;
  availableDates: string[];
  availability: string;
}

export default function MentorDashboard() {
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
  const [offers, setOffers] = useState<MentorshipOffer[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    imagePreview: "",
    imageFile: null,
    description: "",
    skills: "",
    price: "",
    isGratis: true,
    timeStart: "09:00",
    timeEnd: "18:00",
    availableDates: [],
    availability: "Disponible",
  });
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [validationError, setValidationError] = useState("");
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [realCompletedSessions, setRealCompletedSessions] = useState(0);
  const [confirmDeleteCheckbox, setConfirmDeleteCheckbox] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];

  const currentMentorId = user?.id;

  useEffect(() => {
    if (currentMentorId) {
      fetchOffers();
      fetchSessions();
    }
  }, [currentMentorId]);

  const fetchSessions = async () => {
    try {
      const response = await fetch(`http://localhost:8083/api/mentorship-sessions/mentor/${currentMentorId}`);
      if (response.ok) {
        const data = await response.json();
        setRealCompletedSessions(data.filter((s: any) => s.status === 'completada').length);
      }
    } catch (error) {
      console.error("Error fetching mentor sessions:", error);
    }
  };

  const fetchOffers = async () => {
    if (!currentMentorId) return;
    try {
      const response = await fetch(`http://localhost:8082/api/mentorship-offers/mentor/${currentMentorId}`);
      if (response.ok) {
        const data = await response.json();
        // Filtramos las ofertas eliminadas lógicamente
        const activeOffers = data.filter((o: any) => o.status !== "eliminada");
        
        // Enriquecemos con los datos reales
        const enrichedOffers = await Promise.all(
          activeOffers.map(async (offer: any) => {
            let realRating = offer.rating;
            let realReviewsCount = offer.reviews;
            try {
              const reviewsRes = await fetch(`http://localhost:8084/api/reviews/offer/${offer.id}`);
              if (reviewsRes.ok) {
                const reviews = await reviewsRes.json();
                realReviewsCount = reviews.length;
                if (realReviewsCount > 0) {
                  const totalStars = reviews.reduce((acc: any, rev: any) => acc + rev.rating, 0);
                  realRating = Number((totalStars / realReviewsCount).toFixed(1));
                }
              }
            } catch (e) {}
            return { ...offer, rating: realRating, reviews: realReviewsCount };
          })
        );
        setOffers(enrichedOffers);
      } else {
        console.error("Error al cargar ofertas:", await response.text());
      }
    } catch (error) {
      console.error("Error fetching offers:", error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setValidationError("");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({
        ...prev,
        imageFile: file,
        imagePreview: typeof reader.result === "string" ? reader.result : prev.imagePreview,
      }));
    };
    reader.readAsDataURL(file);
    setValidationError("");
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setValidationError("El título profesional es requerido");
      return false;
    }
    if (!formData.imagePreview.trim()) {
      setValidationError("Debes subir una imagen desde tu PC");
      return false;
    }
    if (!formData.description.trim()) {
      setValidationError("La descripción de la mentoría es requerida");
      return false;
    }
    if (!formData.skills.trim()) {
      setValidationError("Al menos una habilidad es requerida");
      return false;
    }
    if (!formData.isGratis && (!formData.price || parseInt(formData.price) <= 0)) {
      setValidationError("Ingresa un precio válido o marca la opción 'Gratis'");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const payload = {
      mentorId: currentMentorId,
      mentorName: user?.name || "Mentor Experto",
      title: formData.title,
      description: formData.description,
      image: formData.imagePreview,
      skills: formData.skills.split(",").map((s) => s.trim()).filter((s) => s),
      price: formData.isGratis ? 0 : parseInt(formData.price) || 0,
      timeStart: formData.timeStart,
      timeEnd: formData.timeEnd,
      availableDates: formData.availableDates,
      availability: formData.availability,
    };

    try {
      const url = editingId 
        ? `http://localhost:8082/api/mentorship-offers/${editingId}`
        : `http://localhost:8082/api/mentorship-offers`;
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await fetchOffers(); // Recargar datos frescos del servidor
        handleCancel(); // Limpia y cierra el formulario
      } else {
        const errorText = await response.text();
        console.error("Backend error:", errorText);
        setValidationError(`Error del servidor: ${response.status} - Revisa la consola (F12)`);
      }
    } catch (error) {
      console.error("Error saving offer:", error);
      setValidationError("Error de conexión: Verifica que el backend (puerto 8082) esté encendido.");
    }
  };

  const handleEdit = (offer: MentorshipOffer) => {
    setFormData({
      title: offer.title,
      imagePreview: offer.image,
      imageFile: null,
      description: offer.description || "",
      skills: offer.skills.join(", "),
      price: offer.price === 0 ? "" : offer.price.toString(),
      isGratis: offer.price === 0,
      timeStart: offer.timeStart || "09:00",
      timeEnd: offer.timeEnd || "18:00",
      availableDates: offer.availableDates || [],
      availability: offer.availability || "Disponible",
    });
    setEditingId(offer.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:8082/api/mentorship-offers/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setOffers(offers.filter((o) => o.id !== id));
      }
    } catch (error) {
      console.error("Error deleting offer:", error);
    }
    setDeleteConfirm(null);
    setConfirmDeleteCheckbox(false);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      title: "",
      imagePreview: "",
      imageFile: null,
      description: "",
      skills: "",
      price: "",
      isGratis: true,
      timeStart: "09:00",
      timeEnd: "18:00",
      availableDates: [],
      availability: "Disponible",
    });
    setRangeStart("");
    setRangeEnd("");
    setValidationError("");
  };

  // Manejar fechas disponibles
  const addDate = (date: string) => {
    if (date && !formData.availableDates.includes(date)) {
      setFormData({
        ...formData,
        availableDates: [...formData.availableDates, date].sort(),
      });
    }
  };

  const removeDate = (date: string) => {
    setFormData({
      ...formData,
      availableDates: formData.availableDates.filter((d) => d !== date),
    });
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Intl.DateTimeFormat("es-ES", {
        weekday: "short",
        day: "numeric",
        month: "short",
      }).format(new Date(dateStr + "T00:00"));
    } catch {
      return dateStr;
    }
  };

  // Agregar rango de fechas
  const addDateRange = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return;

    const start = new Date(startDate + "T00:00");
    const end = new Date(endDate + "T00:00");

    if (start > end) {
      setValidationError("La fecha inicio debe ser menor o igual a la fecha fin");
      return;
    }

    const newDates: string[] = [];
    const current = new Date(start);

    while (current <= end) {
      const dateStr = current.toISOString().split("T")[0];
      if (!formData.availableDates.includes(dateStr)) {
        newDates.push(dateStr);
      }
      current.setDate(current.getDate() + 1);
    }

    setValidationError("");
    setFormData({
      ...formData,
      availableDates: [...formData.availableDates, ...newDates].sort(),
    });
  };

  // Agrupar fechas consecutivas visualmente
  const groupConsecutiveDates = (dates: string[]) => {
    if (!dates.length) return [];
    const sorted = [...dates].sort();
    const groups: string[][] = [];
    let currentGroup = [sorted[0]];

    for (let i = 1; i < sorted.length; i++) {
      const prevDate = new Date(sorted[i - 1] + "T00:00");
      const currDate = new Date(sorted[i] + "T00:00");
      const diffTime = Math.abs(currDate.getTime() - prevDate.getTime());
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        currentGroup.push(sorted[i]);
      } else {
        groups.push(currentGroup);
        currentGroup = [sorted[i]];
      }
    }
    groups.push(currentGroup);
    return groups;
  };

  const removeDateGroup = (datesToRemove: string[]) => {
    setFormData({
      ...formData,
      availableDates: formData.availableDates.filter((d) => !datesToRemove.includes(d)),
    });
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
                  Mi Dashboard de Mentoría
                </h1>
                <p className="text-sm text-gray-600">
                  Gestiona tus avisos de mentoría
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 font-medium"
            >
              <Plus className="w-5 h-5" />
              Nuevo Aviso
            </button>
            <button
              onClick={() => navigate("/mentor-schedule")}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 font-medium"
            >
              <Calendar className="w-5 h-5" />
              Mi Calendario
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-gray-600 text-sm font-medium mb-2">
              Total de Avisos
            </div>
            <div className="text-3xl font-bold text-gray-900">{offers.length}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-gray-600 text-sm font-medium mb-2">
              Sesiones Completadas
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {realCompletedSessions}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-gray-600 text-sm font-medium mb-2">
              Calificación Promedio
            </div>
            <div className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              {offers.length > 0
                ? (offers.reduce((sum, o) => sum + o.rating, 0) / offers.length).toFixed(
                    1
                  )
                : "N/A"}
              {offers.length > 0 && (
                <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
              )}
            </div>
          </div>
        </div>

        {/* Ofertas */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Mis Avisos de Mentoría
          </h2>

          {offers.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay avisos creados
              </h3>
              <p className="text-gray-600 mb-6">
                Crea tu primer aviso de mentoría para que los estudiantes te encuentren
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors inline-flex items-center gap-2 font-medium"
              >
                <Plus className="w-5 h-5" />
                Crear Primer Aviso
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {offers.map((offer) => (
                <div
                  key={offer.id}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Imagen */}
                  <div className="relative h-48 bg-gray-200">
                    <ImageWithFallback
                      src={offer.image}
                      alt={offer.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded-full text-xs font-medium text-gray-700 shadow-sm">
                      {offer.availability}
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Título */}
                    <div className="mb-2">
                      <h3 className="font-semibold text-lg text-gray-900">
                        {offer.mentorName}
                      </h3>
                      <p className="text-sm text-gray-600">{offer.title}</p>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-gray-900">
                          {offer.rating}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        ({offer.reviews} reseñas)
                      </span>
                    </div>

                    {/* Habilidades */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {offer.skills.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-md"
                        >
                          {skill}
                        </span>
                      ))}
                      {offer.skills.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                          +{offer.skills.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Horarios */}
                    {offer.timeStart && offer.timeEnd && (
                      <div className="mb-4 p-2 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-xs text-blue-700">
                          <strong>⏰ {offer.timeStart}</strong> - <strong>{offer.timeEnd}</strong>
                        </p>
                      </div>
                    )}

                    {/* Pie */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 mb-4">
                      <div className="text-sm text-gray-600">
                        {offer.sessionsCompleted} sesiones
                      </div>
                      <div className="font-semibold text-indigo-600">
                        {offer.price === 0 ? "Gratis" : `$${offer.price.toLocaleString("es-CL")} / sesión`}
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(offer)}
                        className="flex-1 px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                      >
                        <Edit2 className="w-4 h-4" />
                        Editar
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(offer.id)}
                        className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Confirmación de Eliminación */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Eliminar aviso
              </h3>
              <p className="text-gray-600 mb-6">
                ¿Está seguro de que desea eliminar este aviso de mentoría? Esta acción
                no se puede deshacer.
              </p>
              
              <div className="flex items-start mt-4 bg-red-50 p-3 rounded-lg border border-red-100">
                <div className="flex items-center h-5">
                  <input
                    id="confirmDel"
                    type="checkbox"
                    checked={confirmDeleteCheckbox}
                    onChange={(e) => setConfirmDeleteCheckbox(e.target.checked)}
                    className="w-4 h-4 border border-red-300 rounded text-red-600 focus:ring-red-500 cursor-pointer"
                  />
                </div>
                <div className="ml-2 text-sm">
                  <label htmlFor="confirmDel" className="font-medium text-red-900 cursor-pointer">
                    Confirmo que deseo eliminar este aviso permanentemente.
                  </label>
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => { setDeleteConfirm(null); setConfirmDeleteCheckbox(false); }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={!confirmDeleteCheckbox}
                className={`flex-1 px-4 py-2 text-white rounded-lg font-medium transition-colors ${confirmDeleteCheckbox ? "bg-red-600 hover:bg-red-700" : "bg-gray-300 cursor-not-allowed"}`}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Formulario de Edición/Creación */}
      {showForm && (
        <div
          className="fixed inset-0 bg-black/10 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          onClick={handleCancel}
        >
          <div
            className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingId ? "Editar Aviso de Mentoría" : "Crear Nuevo Aviso de Mentoría"}
              </h2>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {validationError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                  {validationError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Título Profesional */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título Profesional / Ocupación
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Ej: Full Stack Developer, Senior Frontend Engineer..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                {/* Imagen */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Imagen de la Mentoría
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-2 bg-white"
                  />
                  <p className="text-xs text-gray-500 mb-2">
                    Sube una imagen desde tu PC. Se guardará en la base de datos vinculada a esta mentoría.
                  </p>
                  {formData.imagePreview && (
                    <div className="text-sm text-gray-600 mb-2">
                      Vista previa:
                    </div>
                  )}
                  {formData.imagePreview && (
                    <div className="relative h-40 bg-gray-100 rounded-lg overflow-hidden mb-4">
                      <ImageWithFallback
                        src={formData.imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* Descripción de la Mentoría */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción de la Mentoría
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe qué se enseñará, metodologías, requisitos, etc..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent h-24 resize-none"
                  />
                </div>

                {/* Habilidades */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Habilidades
                  </label>
                  <textarea
                    name="skills"
                    value={formData.skills}
                    onChange={handleInputChange}
                    placeholder="Separa las habilidades con comas. Ej: React, TypeScript, Node.js, MongoDB, AWS"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent h-24"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Escribe cada habilidad separada por comas
                  </p>
                </div>

                {/* Grid 2 columnas */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Precio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Precio de la Mentoría
                    </label>
                    <div className="flex gap-2 items-center">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                        <input
                          type="text"
                          name="price"
                          value={formData.price}
                          onChange={(e) => setFormData(prev => ({...prev, price: e.target.value.replace(/[^0-9]/g, "")}))}
                          disabled={formData.isGratis}
                          placeholder="Ej: 15000"
                          className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${formData.isGratis ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed" : "border-gray-300 focus:border-transparent"}`}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({...prev, isGratis: !prev.isGratis, price: prev.isGratis ? prev.price : ""}))}
                        className={`px-4 py-3 rounded-lg font-medium transition-colors border ${formData.isGratis ? "bg-green-100 text-green-700 border-green-300" : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300"}`}
                      >
                        Gratis
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Precio en CLP. Ej: 15000 (se mostrará como $15.000 / sesión)</p>
                  </div>
                </div>

                {/* Selector de Fechas Disponibles */}
                <div className="border-t pt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    📅 Selecciona los Días Disponibles para Mentoría
                  </label>
                  <p className="text-xs text-gray-500 mb-4">
                    Elige qué días específicos estarás disponible para impartir mentorías
                  </p>

                  {/* Selector de Rango */}
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="text-sm font-semibold text-blue-900 mb-3">
                      Opción 1: Seleccionar Rango de Fechas
                    </h3>
                    <div className="grid md:grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Desde:
                        </label>
                        <input
                          type="date"
                          value={rangeStart}
                          min={todayStr}
                          onChange={(e) => setRangeStart(e.target.value)}
                          className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Hasta:
                        </label>
                        <input
                          type="date"
                          value={rangeEnd}
                          min={rangeStart || todayStr}
                          onChange={(e) => setRangeEnd(e.target.value)}
                          className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => addDateRange(rangeStart, rangeEnd)}
                      disabled={!rangeStart || !rangeEnd}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors text-sm font-medium"
                    >
                      ➕ Agregar Rango
                    </button>
                  </div>

                  {/* O Selector Individual */}
                  <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <h3 className="text-sm font-semibold text-purple-900 mb-3">
                      Opción 2: Seleccionar Días Individuales
                    </h3>
                    <input
                      type="date"
                      id="dateSelector"
                      min={todayStr}
                      className="w-full px-4 py-3 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      onChange={(e) => {
                        if (e.target.value) {
                          addDate(e.target.value);
                          e.target.value = "";
                        }
                      }}
                    />
                  </div>

                  {/* Fechas Seleccionadas */}
                  {formData.availableDates.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700 mb-3">
                        ✅ Fechas seleccionadas ({formData.availableDates.length}):
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {groupConsecutiveDates(formData.availableDates).map((group, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 px-4 py-2 bg-green-100 border border-green-300 rounded-full hover:bg-green-150 transition-colors"
                          >
                            <span className="text-sm font-semibold text-green-700">
                              📅 {group.length === 1 
                                ? formatDate(group[0]) 
                                : `${formatDate(group[0])} - ${formatDate(group[group.length - 1])}`}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeDateGroup(group)}
                              className="text-green-600 hover:text-green-800 transition-colors"
                              title="Eliminar fechas"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                      <p className="text-sm text-yellow-700">
                        ⚠️ Selecciona al menos un día disponible
                      </p>
                    </div>
                  )}
                </div>

                {/* Horarios */}
                <div className="border-t pt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    ⏰ Horarios Disponibles
                  </label>
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Hora de Inicio */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hora de Inicio
                      </label>
                      <input
                        type="time"
                        name="timeStart"
                        value={formData.timeStart}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        {formData.timeStart && `Desde las ${formData.timeStart}`}
                      </p>
                    </div>

                    {/* Hora de Fin */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hora de Fin
                      </label>
                      <input
                        type="time"
                        name="timeEnd"
                        value={formData.timeEnd}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        {formData.timeEnd && `Hasta las ${formData.timeEnd}`}
                      </p>
                    </div>
                  </div>

                  {/* Resumen de horario */}
                  {formData.timeStart && formData.timeEnd && (
                    <div className="mt-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                      <p className="text-sm text-indigo-700">
                        📅 Disponible de <strong>{formData.timeStart}</strong> a{" "}
                        <strong>{formData.timeEnd}</strong> ({formData.availability})
                      </p>
                    </div>
                  )}
                </div>

                {/* Botones */}
                <div className="flex gap-4 border-t pt-6">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                  >
                    {editingId ? "Guardar Cambios" : "Crear Aviso"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
