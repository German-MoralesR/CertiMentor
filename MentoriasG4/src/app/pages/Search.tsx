import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Search as SearchIcon, Star, Users, Filter, ArrowLeft, AlertCircle } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useAuth } from "../context/AuthContext";

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
  timeStart: string;
  timeEnd: string;
  availability: string;
  skills: string[];
  availableDates: string[];
}

const allSkills = [
  "React",
  "TypeScript",
  "JavaScript",
  "Node.js",
  "Python",
  "SQL",
  "MongoDB",
  "PostgreSQL",
  "AWS",
  "Docker",
  "Kubernetes",
  "Machine Learning",
  "Flutter",
  "iOS",
  "Android",
];

export default function Search() {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();

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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [offers, setOffers] = useState<MentorshipOffer[]>([]);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await fetch("http://localhost:8082/api/mentorship-offers");
        if (response.ok) {
          const data: MentorshipOffer[] = await response.json();
          
          // Enriquecemos cada oferta con los datos calculados vivos de otros microservicios
          const enrichedOffers = await Promise.all(
            data.map(async (offer) => {
              let realRating = 0;
              let realReviewsCount = 0;
              let realSessionsCount = 0;

              try {
                // Buscar reseñas específicas para esta oferta
                const reviewsRes = await fetch(`http://localhost:8084/api/reviews/offer/${offer.id}`);
                if (reviewsRes.ok) {
                  const reviews = await reviewsRes.json();
                  realReviewsCount = reviews.length;
                  if (realReviewsCount > 0) {
                    const totalStars = reviews.reduce((acc: any, rev: any) => acc + rev.rating, 0);
                    realRating = Number((totalStars / realReviewsCount).toFixed(1));
                  }
                }

                // Buscar sesiones completadas del mentor
                const sessionsRes = await fetch(`http://localhost:8083/api/mentorship-sessions/mentor/${offer.mentorId}`);
                if (sessionsRes.ok) {
                  const sessions = await sessionsRes.json();
                  realSessionsCount = sessions.filter((s: any) => s.status === 'completada').length;
                }
              } catch (e) {
                console.error(`Error al obtener estadísticas en vivo para la oferta ${offer.id}:`, e);
              }

              return { ...offer, rating: realRating, reviews: realReviewsCount, sessionsCompleted: realSessionsCount };
            })
          );
          setOffers(enrichedOffers);
        } else {
          console.error("Error fetching offers:", await response.text());
        }
      } catch (error) {
        console.error("Error fetching offers:", error);
      }
    };
    fetchOffers();
  }, []);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : [...prev, skill]
    );
  };

  const filteredMentors = offers.filter((mentor) => {
    if (mentor.status === "eliminada") return false;
    // Protecciones en caso de que la DB envíe valores nulos
    const name = mentor.mentorName || "";
    const title = mentor.title || "";
    const skills = mentor.skills || [];

    const matchesSearch =
      searchQuery === "" ||
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skills.some((skill) =>
        skill.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesSkills =
      selectedSkills.length === 0 ||
      selectedSkills.some((skill) => skills.includes(skill));

    return matchesSearch && matchesSkills;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
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
                  MicroMentorías
                </span>
              </div>
            </div>
            {isLoggedIn ? (
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
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                Mi cuenta
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Encuentra tu mentor ideal
          </h1>
          <p className="text-gray-600">
            Explora {offers.length} mentores disponibles para ayudarte
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, habilidad o área..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-6 py-3 border rounded-lg transition-colors flex items-center gap-2 ${
                showFilters
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
              }`}
            >
              <Filter className="w-5 h-5" />
              Filtros
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">
                    Habilidades
                  </h3>
                  {selectedSkills.length > 0 && (
                    <button
                      onClick={() => setSelectedSkills([])}
                      className="text-sm text-indigo-600 hover:text-indigo-700"
                    >
                      Limpiar
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {allSkills.map((skill) => (
                    <button
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                        selectedSkills.includes(skill)
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {filteredMentors.length}{" "}
            {filteredMentors.length === 1 ? "mentor encontrado" : "mentores encontrados"}
          </p>
        </div>

        {/* Mentors Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMentors.map((mentor) => (
            <div
              key={mentor.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/mentor/${mentor.id}`)}
            >
              <div className="relative h-48 bg-gray-200">
                <ImageWithFallback
                  src={mentor.image}
                  alt={mentor.mentorName}
                  className="w-full h-full object-cover"
                />
                {mentor.availableDates && mentor.availableDates.length > 0 && (
                  <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded-full text-xs font-medium text-gray-700 shadow-sm">
                    📅 {mentor.availableDates.length} días disponibles
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">
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
                  {(mentor.skills || []).slice(0, 4).map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-md"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Horarios */}
                {mentor.timeStart && mentor.timeEnd && (
                  <div className="mb-4 p-2 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-700 font-medium">
                      ⏰ Disponible de{" "}
                      <strong>
                        {mentor.timeStart} - {mentor.timeEnd}
                      </strong>
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="text-sm text-gray-600">
                    {mentor.sessionsCompleted} sesiones
                  </div>
                  <div className="font-semibold text-indigo-600">
                    {mentor.price === 0 ? "Gratis" : `$${mentor.price.toLocaleString("es-CL")} / sesión`}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredMentors.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <SearchIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No se encontraron mentores
            </h3>
            <p className="text-gray-600 mb-4">
              Intenta ajustar tu búsqueda o filtros
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedSkills([]);
              }}
              className="px-4 py-2 text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Limpiar búsqueda
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
