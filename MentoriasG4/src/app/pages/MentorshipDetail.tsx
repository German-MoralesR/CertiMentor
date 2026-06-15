import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  Star,
  CheckCircle2,
  User,
  Calendar,
  Clock,
  MessageCircle,
} from "lucide-react";
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
  status?: string;
  timeStart: string;
  timeEnd: string;
  availability: string;
  skills: string[];
  availableDates: string[];
}

export interface Review {
  id: number;
  mentorId: number;
  offerId?: number;
  studentId: number;
  sessionId?: number;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function MentorshipDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, isLoggedIn } = useAuth();

  const [mentor, setMentor] = useState<MentorshipOffer | null>(null);
  const [mentorUser, setMentorUser] = useState<any>(null);
  const [bookedSlots, setBookedSlots] = useState<{date: string, time: string}[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const isOfferEliminada = mentor?.status === "eliminada";

  // Variables de agendamiento
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingNotes, setBookingNotes] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const timeSlots = useMemo(() => {
    if (!mentor?.timeStart || !mentor?.timeEnd) return [];
    const [startH, startM] = mentor.timeStart.split(":").map(Number);
    const [endH, endM] = mentor.timeEnd.split(":").map(Number);
    if ([startH, startM, endH, endM].some((n) => Number.isNaN(n))) return [];
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    if (endMinutes <= startMinutes) return [];

    const slots: { value: string; label: string }[] = [];
    const intervalMinutes = 60;
    const durationMinutes = 40;
    for (let current = startMinutes; current + durationMinutes <= endMinutes; current += intervalMinutes) {
      const hours = Math.floor(current / 60).toString().padStart(2, "0");
      const minutes = (current % 60).toString().padStart(2, "0");
      const endHStr = Math.floor((current + durationMinutes) / 60).toString().padStart(2, "0");
      const endMStr = ((current + durationMinutes) % 60).toString().padStart(2, "0");
      slots.push({
        value: `${hours}:${minutes}`,
        label: `${hours}:${minutes} - ${endHStr}:${endMStr}`
      });
    }
    return slots;
  }, [mentor?.timeStart, mentor?.timeEnd]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "failure") {
      alert("El pago no pudo ser procesado o fue cancelado. Por favor, intenta de nuevo.");
      window.history.replaceState(null, "", window.location.pathname); // Limpiar la URL
    }
  }, []);

  useEffect(() => {
    if (id) {
      fetch(`http://localhost:8082/api/mentorship-offers/${id}`)
        .then(res => res.json())
        .then(data => {
          setMentor(data);
          if (data && data.mentorId) {
            fetch(`http://localhost:8083/api/mentorship-sessions/mentor/${data.mentorId}`)
              .then(res => res.json())
              .then(sessions => {
                const booked = sessions
                  .filter((s: any) => s.status !== "cancelada")
                  .map((s: any) => ({ date: s.date, time: s.time }));
                setBookedSlots(booked);

                const completedCount = sessions.filter((s: any) => s.status === "completada").length;
                setMentor(prev => prev ? { ...prev, sessionsCompleted: completedCount } : prev);
              })
              .catch(err => console.error("Error fetching sessions:", err));

            fetch(`http://localhost:8084/api/reviews/offer/${id}`)
              .then(res => res.json())
              .then(fetchedReviews => setReviews(fetchedReviews))
              .catch(err => console.error("Error fetching reviews:", err));
              
            fetch(`http://localhost:8081/api/users/${data.mentorId}`)
              .then(res => res.json())
              .then(userData => setMentorUser(userData))
              .catch(err => console.error("Error fetching mentor user:", err));
          }
        })
        .catch(err => console.error("Error fetching mentorship detail:", err));
    }
  }, [id]);

  const handleBooking = () => {
    if (isOfferEliminada) {
      alert("Esta mentoría ya no está disponible.");
      return;
    }
    if (!selectedDate || !selectedSlot) {
      alert("Por favor selecciona un día y horario");
      return;
    }
    setShowBookingModal(true);
  };

  const confirmBooking = () => {
    if (!mentor || !selectedDate || !selectedSlot || !user || !user.id) {
      alert("No se pudo identificar tu usuario. Por favor, vuelve a iniciar sesión.");
      return;
    }

    const studentImage = (user as { profileImage?: string }).profileImage || `https://ui-avatars.com/api/?name=${user.name.replace(" ", "+")}`;

    const bookingPayload = {
      mentorId: mentor.mentorId,
      offerId: mentor.id,
      offerTitle: mentor.title,
      studentId: user.id,
      mentorName: mentor.mentorName,
      mentorImage: mentorUser?.profileImage || `https://ui-avatars.com/api/?name=${mentor.mentorName.replace(" ", "+")}`,
      studentName: user.name,
      studentImage,
      topic: bookingNotes.trim() || `Mentoría general sobre ${mentor.skills[0] || 'desarrollo'}`,
      date: selectedDate,
      time: selectedSlot,
      duration: 40,
      price: mentor.price,
      status: "pendiente",
    };

    // Si la mentoría tiene costo, vamos a Mercado Pago primero
    if (mentor.price > 0) {
      setIsBooking(true);
      
      // Guardamos la reserva pendiente temporalmente para recuperarla al volver del pago
      localStorage.setItem("pendingBooking", JSON.stringify(bookingPayload));

      fetch('http://localhost:8086/api/payments/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Mentoría: ${mentor.title}`,
          price: mentor.price,
          offerId: mentor.id
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.init_point) {
          window.location.href = data.init_point; // Redirigimos a la pantalla de pago segura
        } else {
          alert("Error al conectar con Mercado Pago");
          setIsBooking(false);
        }
      })
      .catch(err => {
        console.error("Error payment:", err);
        setIsBooking(false);
      });
      return; // Detenemos la ejecución aquí para no agendar sin pagar
    }

    setIsBooking(true);

    fetch('http://localhost:8083/api/mentorship-sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingPayload)
    })
    .then(res => {
      setIsBooking(false);
      if (res.ok) {
        setShowBookingModal(false);
        setBookingSuccess(true);
      } else {
        alert("Error al agendar la sesión.");
      }
    })
    .catch(err => {
      setIsBooking(false);
      console.error("Error booking session:", err);
    });
  };

  if (!mentor) {
    return <div className="min-h-screen flex items-center justify-center">Cargando detalles de la mentoría...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/buscar")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver a búsqueda
          </button>
          
          {isLoggedIn && (
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/student-schedule")}
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Mis Sesiones
              </button>
              <button
                onClick={() => navigate("/perfil")}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                <span className="font-medium">Mi Perfil</span>
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Offer Detail Card */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-8">
                <div className="flex gap-6">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden flex-shrink-0 border-4 border-gray-100">
                    {mentorUser?.profileImage ? (
                      <img src={mentorUser.profileImage} alt={mentor.mentorName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-indigo-100 flex items-center justify-center">
                        <User className="w-12 h-12 text-indigo-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {mentor.title}
                    </h1>
                    <p 
                      className="text-lg text-indigo-600 hover:text-indigo-800 cursor-pointer mb-4 inline-block transition-colors font-medium" 
                      onClick={() => navigate(`/mentor/${mentor.mentorId}`)}
                      title="Ver el perfil de este mentor"
                    >
                      Impartida por {mentor.mentorName} →
                    </p>

                    <div className="flex flex-wrap gap-4 mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-gray-900">
                          {reviews.length > 0 ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length).toFixed(1) : mentor.rating}
                        </span>
                        <span className="text-gray-600">
                          ({reviews.length} reseñas)
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        {mentor.sessionsCompleted} sesiones completadas
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {mentor.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 bg-indigo-50 text-indigo-700 text-sm rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    <div className="mt-6 border-t border-gray-100 pt-6">
                      <h3 className="font-semibold text-gray-900 mb-2">Sobre esta mentoría</h3>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">{mentor.description || "Sin descripción detallada."}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Reseñas ({reviews.length})
                </h2>
                <div className="flex items-center gap-2">
                  <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                  <span className="text-2xl font-bold text-gray-900">
                    {reviews.length > 0 ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length).toFixed(1) : mentor.rating}
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                {reviews.length === 0 ? (
                  <p className="text-gray-500">Aún no hay reseñas para esta oferta.</p>
                ) : (
                  reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-100 last:border-b-0 pb-6 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="font-semibold text-indigo-600">
                            {review.userName ? review.userName.charAt(0).toUpperCase() : "U"}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{review.userName}</div>
                          <div className="text-sm text-gray-500">
                            {new Intl.DateTimeFormat("es-ES", { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(review.createdAt))}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => <Star key={i} className={`w-4 h-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />)}
                      </div>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                )))}
              </div>
            </div>
          </div>

          {/* Sidebar - Booking */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Agendar sesión
              </h3>

              {/* Session Duration */}
              <div className="flex items-center gap-3 mb-6 p-3 bg-gray-50 rounded-lg">
                <Clock className="w-5 h-5 text-indigo-600" />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    Duración: 40 min
                  </div>
                  <div className="text-xs text-gray-600">{mentor.price === 0 ? "Sesión gratuita" : `$${mentor.price.toLocaleString("es-CL")} por sesión`}</div>
                </div>
              </div>

              {isOfferEliminada ? (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  Esta mentoría ya finalizó y no está disponible para agendar.
                </div>
              ) : (
                <>
                  {/* Day Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Selecciona un día
                    </label>
                    <div className="space-y-2 max-h-[260px] overflow-y-auto pr-2">
                      {mentor.availableDates.map((date) => (
                        <button
                          key={date}
                          onClick={() => {
                            setSelectedDate(date);
                            setSelectedSlot(null);
                          }}
                          className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                            selectedDate === date
                              ? "border-indigo-600 bg-indigo-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-600" />
                            <span className="font-medium text-gray-900">
                              {new Intl.DateTimeFormat("es-ES", { weekday: 'long', day: 'numeric', month: 'short' }).format(new Date(date + "T00:00"))}
                            </span>
                          </div>
                          <span className="text-sm text-gray-600">
                            Disponible
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Time Slots */}
                  {selectedDate && (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Horarios disponibles
                      </label>
                      {timeSlots.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {timeSlots.map((slotObj) => {
                          const isBooked = bookedSlots.some(b => b.date === selectedDate && b.time === slotObj.value);
                            return (
                            <button
                            key={slotObj.value}
                            onClick={() => !isBooked && setSelectedSlot(slotObj.value)}
                              disabled={isBooked}
                              className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                                isBooked
                                  ? "bg-gray-100 text-gray-400 cursor-not-allowed line-through opacity-60"
                                : selectedSlot === slotObj.value
                                  ? "bg-indigo-600 text-white"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              }`}
                            >
                            {slotObj.label}
                            </button>
                          )})}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg p-3">
                          No hay horarios disponibles para el rango seleccionado.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Book Button */}
                  <button
                    onClick={handleBooking}
                    disabled={!selectedDate || !selectedSlot}
                    className={`w-full py-3 rounded-lg font-medium transition-colors ${
                      selectedDate && selectedSlot
                        ? "bg-indigo-600 text-white hover:bg-indigo-700"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    Reservar sesión
                  </button>
                </>
              )}

              {/* Contact */}
              <button className="w-full mt-3 py-3 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:border-gray-400 transition-colors flex items-center justify-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Enviar mensaje
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Confirmation Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                ¡Confirmar reserva!
              </h3>
              <p className="text-gray-600 mb-6">
                Estás a punto de agendar una sesión con {mentor.mentorName}
              </p>

              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mentor:</span>
                    <span className="font-medium text-gray-900">
                      {mentor.mentorName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Día:</span>
                    <span className="font-medium text-gray-900">{selectedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hora:</span>
                    <span className="font-medium text-gray-900">{selectedSlot}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duración:</span>
                    <span className="font-medium text-gray-900">40 min</span>
                  </div>
                </div>
              </div>

              {/* Textarea para propósito de la mentoría */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ¿Qué te gustaría aprender o resolver en esta sesión?
                </label>
                <textarea
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  placeholder="Ej: Tengo dudas sobre cómo implementar la autenticación o me gustaría revisar un error en mi código..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowBookingModal(false)}
                  disabled={isBooking}
                  className="flex-1 py-3 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:border-gray-400 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmBooking}
                  disabled={isBooking}
                  className={`flex-1 py-3 text-white rounded-lg font-medium transition-colors ${
                    isBooking ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                >
                  {isBooking ? "Confirmando..." : "Confirmar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Éxito */}
      {bookingSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center transform transition-all scale-100">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">¡Reserva Exitosa!</h3>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Tu sesión ha sido agendada correctamente. En breve recibirás un comprobante y los detalles en tu correo electrónico.
            </p>
            <button
              onClick={() => {
                setBookingSuccess(false);
                navigate("/student-schedule");
              }}
              className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
            >
              Ver Mis Sesiones
            </button>
          </div>
        </div>
      )}
    </div>
  );
}