import { useNavigate } from "react-router";
import { Clock, Users, Star, ArrowRight, CheckCircle2, LogOut, User, Search, Award } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { API } from "../config";

export interface MentorshipOffer {
  id: number;
  mentorId: number;
  mentorName: string;
  title: string;
  image: string;
  price: number;
  sessionsCompleted: number;
  rating: number;
  reviews: number;
  status?: string;
  skills: string[];
}

export interface Review {
  id: number;
  studentId: number;
  studentName?: string;
  studentImage?: string;
  rating: number;
  comment: string;
}

const fallbackTestimonials: Review[] = [
  {
    id: -1,
    studentId: -1,
    studentName: "Valentina R.",
    rating: 5,
    comment: "En 20 minutos resolví un problema de arquitectura que me tenía bloqueado hace días. Increíble la calidad del mentor.",
  },
  {
    id: -2,
    studentId: -2,
    studentName: "Matías F.",
    rating: 5,
    comment: "La sesión fue directa al grano, sin rodeos. El mentor entendió mi problema al instante y me dio exactamente lo que necesitaba.",
  },
  {
    id: -3,
    studentId: -3,
    studentName: "Camila S.",
    rating: 5,
    comment: "Mucho mejor que buscar en Stack Overflow por horas. Reservé, me conecté y en 15 minutos tenía la solución funcionando.",
  },
];

export default function Landing() {
  const navigate = useNavigate();
  const { user, logout, isLoggedIn } = useAuth();
  const [featuredMentors, setFeaturedMentors] = useState<MentorshipOffer[]>([]);
  const [testimonials, setTestimonials] = useState<Review[]>([]);

  useEffect(() => {
    // Fetch featured mentors
    const fetchMentors = async () => {
      try {
        const response = await fetch(`${API.MENTORSHIP_SERVICE}/api/mentorship-offers`);
        if (response.ok) {
          const data: MentorshipOffer[] = await response.json();
          // Enrich with live data and take the top 3 rated
          const enrichedOffers = await Promise.all(
            data.map(async (offer) => {
              let realRating = 0;
              let realReviewsCount = 0;
              try {
                const reviewsRes = await fetch(`${API.FEEDBACK_SERVICE}/api/reviews/offer/${offer.id}`);
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
          
          const activeOffers = enrichedOffers.filter(o => o.status !== 'eliminada');
          
          // Sort by rating and reviews, then take top 3
          activeOffers.sort((a, b) => {
            if (b.rating !== a.rating) {
              return b.rating - a.rating;
            }
            return b.reviews - a.reviews;
          });

          setFeaturedMentors(activeOffers.slice(0, 3));
        }
      } catch (error) {
        console.error("Error fetching featured mentors:", error);
      }
    };

    // Fetch testimonials
    const fetchTestimonials = async () => {
      try {
        const response = await fetch(`${API.FEEDBACK_SERVICE}/api/reviews`);
        if (response.ok) {
          const reviews: Review[] = await response.json();
          // Filter for good reviews with comments
          const goodReviews = reviews.filter(r => r.rating >= 4 && r.comment).slice(0, 3);
          
          // Enrich with student data
          const enrichedReviews = await Promise.all(
            goodReviews.map(async (review) => {
              try {
                const userRes = await fetch(`${API.USER_SERVICE}/api/users/${review.studentId}`);
                if (userRes.ok) {
                  const studentData = await userRes.json();
                  return { ...review, studentName: studentData.name, studentImage: studentData.profileImage };
                }
              } catch (e) {}
              return { ...review, studentName: "Estudiante Anónimo" }; // Fallback
            })
          );
          setTestimonials(enrichedReviews);
        }
      } catch (error) {
        console.error("Error fetching testimonials:", error);
      }
    };

    fetchMentors();
    fetchTestimonials();
  }, []);

  const displayTestimonials = testimonials.length > 0 ? testimonials : fallbackTestimonials;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b sticky top-0 bg-white/80 backdrop-blur-sm z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900">CertiMentor</span>
          </div>
          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <>
                {/* Menú según rol */}
                {user?.role === "admin" && (
                  <button
                    onClick={() => navigate("/admin")}
                    className="link-interaction px-3 py-2 text-gray-700 hover:text-gray-900 transition-colors flex items-center gap-2 text-sm"
                  >
                    <User className="w-4 h-4" /> Panel Admin
                  </button>
                )}

                {user?.role === "mentor" && (
                  <>
                    <button
                      onClick={() => navigate("/mentor-dashboard")}
                      className="link-interaction px-3 py-2 text-gray-700 hover:text-gray-900 transition-colors flex items-center gap-2 text-sm"
                    >
                      <Users className="w-4 h-4" /> Mi Dashboard
                    </button>
                    <button
                      onClick={() => navigate("/mentor-schedule")}
                      className="link-interaction px-3 py-2 text-gray-700 hover:text-gray-900 transition-colors flex items-center gap-2 text-sm"
                    >
                      <Clock className="w-4 h-4" /> Mi Calendario
                    </button>
                  </>
                )}

                {user?.role === "estudiante" && (
                  <>
                    <button
                      onClick={() => navigate("/buscar")}
                      className="link-interaction px-3 py-2 text-gray-700 hover:text-gray-900 transition-colors flex items-center gap-2 text-sm"
                    >
                      <Search className="w-4 h-4" /> Buscar Mentores
                    </button>
                    <button
                      onClick={() => navigate("/student-schedule")}
                      className="link-interaction px-3 py-2 text-gray-700 hover:text-gray-900 transition-colors flex items-center gap-2 text-sm"
                    >
                      <Clock className="w-4 h-4" /> Mis Sesiones
                    </button>
                  </>
                )}

                {/* Perfil y Logout */}
                <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-200">
                  <button onClick={() => navigate("/perfil")} className="flex items-center gap-3 text-left hover:bg-gray-100 p-1 rounded-lg transition-colors">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                      {user?.profileImage ? (
                        <img src={user.profileImage} alt="Perfil" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-lg font-bold text-indigo-600">
                          {user?.name?.charAt(0).toUpperCase() || "U"}
                        </span>
                      )}
                    </div>
                    <div className="hidden sm:block">
                      <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                      <div className="text-xs text-gray-500 capitalize">
                        {user?.role}
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={logout}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Cerrar Sesión"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                Iniciar sesión
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                Desbloquea tu potencial con mentorías <span className="text-yellow-300">uno a uno</span>
              </h1>
              <p className="text-lg text-indigo-100 mb-8">
                Conecta con mentores expertos que te ayudarán con sesiones breves y
                puntuales. No más horas buscando en foros, obtén la ayuda que necesitas
                de forma rápida y efectiva.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                {isLoggedIn ? (
                  <>
                    {user?.role === "estudiante" && (
                      <button
                        onClick={() => navigate("/buscar")}
                        className="px-6 py-3 bg-white text-indigo-700 rounded-lg hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 font-semibold shadow"
                      >
                        Buscar mentores
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    )}
                    {user?.role === "mentor" && (
                      <button
                        onClick={() => navigate("/mentor-dashboard")}
                        className="px-6 py-3 bg-white text-indigo-700 rounded-lg hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 font-semibold shadow"
                      >
                        Mi Dashboard
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    )}
                    {user?.role === "admin" && (
                      <button
                        onClick={() => navigate("/admin")}
                        className="px-6 py-3 bg-white text-indigo-700 rounded-lg hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 font-semibold shadow"
                      >
                        Panel de Control
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => navigate("/login")}
                      className="px-6 py-3 bg-white text-indigo-700 rounded-lg hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 font-semibold shadow"
                    >
                      Buscar mentores
                      <ArrowRight className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => navigate("/login")}
                      className="px-6 py-3 border-2 border-white text-white rounded-lg hover:bg-white/10 transition-colors font-medium"
                    >
                      Ser mentor
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="relative">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1673515335586-f9f662c01482?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbmxpbmUlMjBtZW50b3JpbmclMjBzdHVkZW50cyUyMGxlYXJuaW5nfGVufDF8fHx8MTc3MzkxNzc4MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Estudiantes aprendiendo"
                className="w-full h-full max-h-[400px] object-cover rounded-2xl shadow-2xl ring-4 ring-white/20"
              />
            </div>
          </div>
        </div>
      </section>


      {/* Before / After */}
      <section className="bg-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">¿Qué cambia con CertiMentor?</h2>
            <p className="text-lg text-gray-600">La diferencia entre quedarte bloqueado y seguir avanzando</p>
          </div>
          <div className="grid md:grid-cols-2 rounded-2xl overflow-hidden border border-gray-200">
            {/* Sin CertiMentor */}
            <div className="bg-gray-50 p-8">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-200">
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 text-xs font-bold">✕</span>
                </div>
                <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Sin CertiMentor</span>
              </div>
              <div className="space-y-5">
                <div className="flex gap-3">
                  <Clock className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-700">Horas buscando en foros</div>
                    <div className="text-sm text-gray-500">Stack Overflow, Reddit, YouTube — sin garantía de encontrar respuesta</div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Search className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-700">Respuestas genéricas</div>
                    <div className="text-sm text-gray-500">Tutoriales que no aplican a tu caso específico</div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Users className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-700">Sin retroalimentación real</div>
                    <div className="text-sm text-gray-500">Nadie revisa tu trabajo ni te explica el porqué</div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Star className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-700">Cursos largos y rígidos</div>
                    <div className="text-sm text-gray-500">Compromiso de semanas para resolver una duda puntual</div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-700">Te quedas bloqueado</div>
                    <div className="text-sm text-gray-500">La duda sin resolver frena todo tu avance</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Con CertiMentor */}
            <div className="bg-indigo-50 p-8">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-indigo-200">
                <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-semibold text-indigo-600 uppercase tracking-wide">Con CertiMentor</span>
              </div>
              <div className="space-y-5">
                <div className="flex gap-3">
                  <Clock className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">15 minutos con un experto</div>
                    <div className="text-sm text-gray-600">Resuelves en una sesión lo que no encontraste en días</div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <User className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">Ayuda 100% personalizada</div>
                    <div className="text-sm text-gray-600">El mentor entiende tu contexto y tu problema específico</div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Star className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">Explicación en tiempo real</div>
                    <div className="text-sm text-gray-600">Preguntas, respuestas y ejemplos en vivo — no videos pregrabados</div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">Agenda cuando puedas</div>
                    <div className="text-sm text-gray-600">Sin compromisos a largo plazo, reserva en minutos</div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <ArrowRight className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">Sigues avanzando</div>
                    <div className="text-sm text-gray-600">Desbloqueas tu proyecto y retomas el ritmo ese mismo día</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">¿Cómo funciona?</h2>
            <p className="text-lg text-gray-600">
              En 3 simples pasos conectas con un mentor
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                1. Busca un mentor
              </h3>
              <p className="text-gray-600">
                Explora perfiles de mentores según tu área de interés y revisa sus
                especialidades y valoraciones.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                2. Agenda una sesión
              </h3>
              <p className="text-gray-600">
                Selecciona un horario disponible que se ajuste a tu agenda y reserva tu
                micro-mentoría de 15-40 minutos.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                3. Aprende y valora
              </h3>
              <p className="text-gray-600">
                Resuelve tu duda en la sesión y comparte tu experiencia con una
                valoración para ayudar a otros estudiantes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Mentors */}
      {featuredMentors.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center mb-12 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Conoce a nuestros mentores</h2>
            <p className="text-lg text-gray-600">
              Estas son algunas de nuestras mentorías mejor valoradas por la comunidad.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredMentors.map((mentor) => (
              <div
                key={mentor.id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => navigate(`/oferta/${mentor.id}`)}
              >
                <div className="relative h-48 bg-gray-200">
                  <ImageWithFallback
                    src={mentor.image}
                    alt={mentor.mentorName}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">
                        {mentor.title}
                      </h3>
                      <p className="text-sm text-gray-600">{mentor.mentorName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-gray-900">
                        {mentor.rating}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      ({mentor.reviews} reseñas)
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {(mentor.skills || []).slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-md font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-bold text-indigo-600">
                      ${mentor.price.toLocaleString("es-CL")} CLP
                    </span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> 15-40 min
                    </span>
                  </div>

                  <button className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                    Ver mentoría
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="bg-gray-50 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Lo que nuestros estudiantes dicen</h2>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            {displayTestimonials.map((review) => (
              <div key={review.id} className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
                  ))}
                </div>
                <p className="text-gray-600 mb-6">"{review.comment}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center overflow-hidden">
                    {review.studentImage ? (
                      <img src={review.studentImage} alt={review.studentName} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-indigo-600" />
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{review.studentName}</div>
                    <div className="text-sm text-gray-500">Estudiante</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                ¿Por qué CertiMentor?
              </h2>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <CheckCircle2 className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-gray-900 mb-1">
                      Ahorra tiempo
                    </div>
                    <div className="text-gray-600">
                      Una sesión de 15 minutos puede resolver lo que horas de búsqueda
                      no logran.
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-gray-900 mb-1">
                      Mentores verificados
                    </div>
                    <div className="text-gray-600">
                      Todos los mentores son evaluados por la comunidad para garantizar
                      calidad.
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-gray-900 mb-1">
                      Flexibilidad total
                    </div>
                    <div className="text-gray-600">
                      Agenda según tu disponibilidad y la del mentor, sin compromisos a
                      largo plazo.
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-gray-900 mb-1">
                      Comunidad de apoyo
                    </div>
                    <div className="text-gray-600">
                      Forma parte de una red de estudiantes y profesionales que
                      comparten conocimiento.
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1565687981296-535f09db714e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXZlbG9wZXIlMjBtZW50b3JpbmclMjBwcm9ncmFtbWluZyUyMHRlYWNoaW5nfGVufDF8fHx8MTc3MzkxODQ0MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Mentor profesional"
                className="w-full h-[500px] object-cover rounded-2xl shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl px-8 py-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Comienza a aprender hoy
          </h2>
          <p className="text-lg text-indigo-100 mb-8 max-w-2xl mx-auto">
            Únete a miles de estudiantes que ya están optimizando su tiempo de
            aprendizaje con micro-mentorías personalizadas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate(isLoggedIn ? "/buscar" : "/login")}
              className="px-8 py-3 bg-white text-indigo-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold shadow"
            >
              Explorar mentores
            </button>
            {!isLoggedIn && (
              <button
                onClick={() => navigate("/login")}
                className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-lg hover:bg-white/10 transition-colors font-semibold"
              >
                Quiero ser mentor
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <Award className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-semibold text-gray-900">CertiMentor</span>
              </div>
              <p className="text-sm text-gray-500">
                Micro-mentorías personalizadas para resolver tus dudas rápido, con expertos verificados por la comunidad.
              </p>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Plataforma</div>
              <ul className="space-y-2 text-sm text-gray-500">
                <li>
                  <button onClick={() => navigate("/buscar")} className="link-interaction hover:text-indigo-600 transition-colors">
                    Buscar mentores
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate("/login")} className="link-interaction hover:text-indigo-600 transition-colors">
                    Ser mentor
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate("/login")} className="link-interaction hover:text-indigo-600 transition-colors">
                    Iniciar sesión
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Contacto</div>
              <p className="text-sm text-gray-500">¿Tienes dudas? Escríbenos y te respondemos pronto.</p>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-6 text-center text-sm text-gray-500">
            &copy; 2026 CertiMentor. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
