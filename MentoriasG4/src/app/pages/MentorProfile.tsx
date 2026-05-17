import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  Star,
  Calendar,
  Clock,
  CheckCircle2,
  MessageCircle,
} from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useAuth } from "../context/AuthContext";

export interface MentorshipOffer {
  id: number;
  mentorId: number;
  mentorName: string;
  title: string;
  image: string;
  price: string;
  sessionsCompleted: number;
  rating: number;
  reviews: number;
  timeStart: string;
  timeEnd: string;
  availability: string;
  skills: string[];
  availableDates: string[];
}

export interface Review {
  id: number;
  mentorId: number;
  studentId: number;
  sessionId?: number;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function MentorProfile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  const [mentor, setMentor] = useState<MentorshipOffer | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<{date: string, time: string}[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    if (id) {
      fetch(`http://localhost:8082/api/mentorship-offers/${id}`)
        .then(res => res.json())
        .then(data => {
          setMentor(data);
          // Consultamos las sesiones agendadas de este mentor para bloquear los horarios
          if (data && data.mentorId) {
            fetch(`http://localhost:8083/api/mentorship-sessions/mentor/${data.mentorId}`)
              .then(res => res.json())
              .then(sessions => {
                const booked = sessions
                  .filter((s: any) => s.status !== "cancelada")
                  .map((s: any) => ({ date: s.date, time: s.time }));
                setBookedSlots(booked);
              })
              .catch(err => console.error("Error fetching sessions:", err));

          // Consultamos las reseñas desde el feedback-service
          fetch(`http://localhost:8084/api/reviews/mentor/${data.mentorId}`)
            .then(res => res.json())
            .then(fetchedReviews => setReviews(fetchedReviews))
            .catch(err => console.error("Error fetching reviews:", err));
          }
        })
        .catch(err => console.error("Error fetching mentor profile:", err));
    }
  }, [id]);

  const handleBooking = () => {
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

    const bookingPayload = {
      mentorId: mentor.mentorId,
      studentId: user.id,
      mentorName: mentor.mentorName,
      studentName: user.name,
      studentImage: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150&h=150",
      topic: `Mentoría sobre ${mentor.skills[0] || 'desarrollo'}`,
      date: selectedDate,
      time: selectedSlot,
      duration: 30,
      price: parseFloat(mentor.price.replace('$', '').replace('/sesión', '')) || 0,
      status: "pendiente",
    };

    fetch('http://localhost:8083/api/mentorship-sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingPayload)
    })
    .then(res => {
      if (res.ok) {
        alert(`¡Sesión agendada! ${selectedDate} a las ${selectedSlot}`);
        setShowBookingModal(false);
        navigate("/student-schedule");
      } else {
        alert("Error al agendar la sesión.");
      }
    })
    .catch(err => console.error("Error booking session:", err));
  };

  if (!mentor) {
    return <div className="min-h-screen flex items-center justify-center">Cargando perfil del mentor...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate("/buscar")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver a búsqueda
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-8">
                <div className="flex gap-6">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden flex-shrink-0 border-4 border-gray-100">
                    <ImageWithFallback
                      src={mentor.image}
                      alt={mentor.mentorName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {mentor.mentorName}
                    </h1>
                    <p className="text-lg text-gray-600 mb-4">{mentor.title}</p>

                    <div className="flex flex-wrap gap-4 mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-gray-900">
                          {mentor.rating}
                        </span>
                        <span className="text-gray-600">
                          ({mentor.reviews} reseñas)
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
                  </div>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Acerca de mí
              </h2>
              <p className="text-gray-700 leading-relaxed">Desarrollador con más de 8 años de experiencia. Me especializo en las tecnologías listadas y me apasiona ayudar a otros a resolver problemas complejos.</p>
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
                  <p className="text-gray-500">Aún no hay reseñas para este mentor.</p>
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
                          <div className="font-medium text-gray-900">
                            {review.userName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Intl.DateTimeFormat("es-ES", { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(review.createdAt))}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))
              )}
                
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
                    Duración: 15-30 min
                  </div>
                  <div className="text-xs text-gray-600">Sesión gratuita</div>
                </div>
              </div>

              {/* Day Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selecciona un día
                </label>
                <div className="space-y-2">
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
                  <div className="grid grid-cols-3 gap-2">
                    {['10:00', '11:00', '14:00', '15:00', '16:00'].map((slot) => {
                      const isBooked = bookedSlots.some(b => b.date === selectedDate && b.time === slot);
                      return (
                      <button
                        key={slot}
                        onClick={() => !isBooked && setSelectedSlot(slot)}
                        disabled={isBooked}
                        className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                          isBooked
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed line-through opacity-60"
                            : selectedSlot === slot
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {slot}
                      </button>
                    )})}
                  </div>
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
                    <span className="font-medium text-gray-900">15-30 min</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 py-3 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:border-gray-400 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmBooking}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
