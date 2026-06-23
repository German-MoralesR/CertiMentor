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
                    className="px-3 py-2 text-gray-700 hover:text-gray-900 transition-colors flex items-center gap-2 text-sm"
                  >
                    <User className="w-4 h-4" /> Panel Admin
                  </button>
                )}

                {user?.role === "mentor" && (
                  <>
                    <button
                      onClick={() => navigate("/mentor-dashboard")}
                      className="px-3 py-2 text-gray-700 hover:text-gray-900 transition-colors flex items-center gap-2 text-sm"
                    >
                      <Users className="w-4 h-4" /> Mi Dashboard
                    </button>
                    <button
                      onClick={() => navigate("/mentor-schedule")}
                      className="px-3 py-2 text-gray-700 hover:text-gray-900 transition-colors flex items-center gap-2 text-sm"
                    >
                      <Clock className="w-4 h-4" /> Mi Calendario
                    </button>
                  </>
                )}

                {user?.role === "estudiante" && (
                  <>
                    <button
                      onClick={() => navigate("/buscar")}
                      className="px-3 py-2 text-gray-700 hover:text-gray-900 transition-colors flex items-center gap-2 text-sm"
                    >
                      <Search className="w-4 h-4" /> Buscar Mentores
                    </button>
                    <button
                      onClick={() => navigate("/student-schedule")}
                      className="px-3 py-2 text-gray-700 hover:text-gray-900 transition-colors flex items-center gap-2 text-sm"
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
      <section className="relative bg-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Desbloquea tu potencial con mentorías <span className="text-indigo-600">uno a uno</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8">
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
                      className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 font-medium"
                    >
                      Buscar mentores
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  )}
                  {user?.role === "mentor" && (
                    <button
                      onClick={() => navigate("/mentor-dashboard")}
                      className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 font-medium"
                    >
                      Mi Dashboard
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  )}
                  {user?.role === "admin" && (
                    <button
                      onClick={() => navigate("/admin")}
                      className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 font-medium"
                    >
                      Panel de Control
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate(isLoggedIn ? "/buscar" : "/login")}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 font-medium"
                  >
                    Buscar mentores
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => navigate("/login")}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
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
              className="w-full h-full max-h-[400px] object-cover rounded-2xl shadow-xl"
            />
          </div>
        </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-600 mb-2">15-40min</div>
              <div className="text-gray-600">Duración de sesión</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-600 mb-2">500+</div>
              <div className="text-gray-600">Mentores activos</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-600 mb-2">4.8★</div>
              <div className="text-gray-600">Valoración promedio</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 max-w-full px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
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
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="bg-gray-50 py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Lo que nuestros estudiantes dicen</h2>
            </div>
            <div className="grid lg:grid-cols-3 gap-8">
              {testimonials.map(review => (
                <div key={review.id} className="bg-white p-8 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
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
      )}

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
        <div className="bg-indigo-600 rounded-2xl px-8 py-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Comienza a aprender hoy
          </h2>
          <p className="text-lg text-indigo-100 mb-8 max-w-2xl mx-auto">
            Únete a miles de estudiantes que ya están optimizando su tiempo de
            aprendizaje con micro-mentorías personalizadas.
          </p>
          <button
            onClick={() => navigate(isLoggedIn ? "/buscar" : "/login")}
            className="px-8 py-3 bg-white text-indigo-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
          >
            Explorar mentores
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2026 CertiMentor. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}