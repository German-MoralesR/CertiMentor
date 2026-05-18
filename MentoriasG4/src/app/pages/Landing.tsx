import { useNavigate } from "react-router";
import { Clock, Users, Star, ArrowRight, CheckCircle2, Shield, LogOut, User } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useAuth } from "../context/AuthContext";

export default function Landing() {
  const navigate = useNavigate();
  const { user, logout, isLoggedIn } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900">MicroMentorías</span>
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
                    🔒 Panel Admin
                  </button>
                )}

                {user?.role === "mentor" && (
                  <>
                    <button
                      onClick={() => navigate("/mentor-dashboard")}
                      className="px-3 py-2 text-gray-700 hover:text-gray-900 transition-colors flex items-center gap-2 text-sm"
                    >
                      👨‍🏫 Mi Dashboard
                    </button>
                    <button
                      onClick={() => navigate("/mentor-schedule")}
                      className="px-3 py-2 text-gray-700 hover:text-gray-900 transition-colors flex items-center gap-2 text-sm"
                    >
                      📅 Mi Calendario
                    </button>
                  </>
                )}

                {user?.role === "estudiante" && (
                  <>
                    <button
                      onClick={() => navigate("/buscar")}
                      className="px-3 py-2 text-gray-700 hover:text-gray-900 transition-colors flex items-center gap-2 text-sm"
                    >
                      🔍 Buscar Mentores
                    </button>
                    <button
                      onClick={() => navigate("/student-schedule")}
                      className="px-3 py-2 text-gray-700 hover:text-gray-900 transition-colors flex items-center gap-2 text-sm"
                    >
                      📅 Mis Sesiones
                    </button>
                  </>
                )}

                {/* Perfil y Logout */}
                <div className="flex items-center gap-2 ml-4 pl-4 border-l border-gray-200">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                    <div className="text-xs text-gray-500 capitalize">
                      {user?.role === "estudiante"
                        ? "🎓 Estudiante"
                        : user?.role === "mentor"
                        ? "👨‍🏫 Mentor"
                        : "🔒 Admin"}
                    </div>
                  </div>
                  {/* Botón de Perfil: Se oculta para el administrador */}
                  {user?.role !== "admin" && (
                    <button
                      onClick={() => navigate("/perfil")}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Mi Perfil"
                    >
                      <User className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Iniciar sesión
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Resuelve tus dudas en{" "}
              <span className="text-indigo-600">15 minutos</span>
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
                      className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                    >
                      Buscar mentores
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  )}
                  {user?.role === "mentor" && (
                    <button
                      onClick={() => navigate("/mentor-dashboard")}
                      className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                    >
                      Mi Dashboard
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  )}
                  {user?.role === "admin" && (
                    <button
                      onClick={() => navigate("/admin")}
                      className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                    >
                      Panel de Control
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate("/buscar")}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                  >
                    Buscar mentores
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => navigate("/login")}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 transition-colors"
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
              className="w-full h-[400px] object-cover rounded-2xl shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-600 mb-2">15-30min</div>
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">¿Cómo funciona?</h2>
          <p className="text-lg text-gray-600">
            En 3 simples pasos conectas con un mentor
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
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
              micro-mentoría de 15-30 minutos.
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

      {/* Benefits */}
      <section className="bg-gray-50 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                ¿Por qué MicroMentorías?
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
            onClick={() => navigate("/buscar")}
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
            <p>&copy; 2026 MicroMentorías. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}