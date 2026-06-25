import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Edit3, Save, Mail, Shield, User, BookOpen, Award, LogOut, Clock, Users, Search } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { API } from "../config";

export default function MentorProfile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, isLoggedIn, logout } = useAuth();

  const [mentorUser, setMentorUser] = useState<any>(null);
  const [mentorOffers, setMentorOffers] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: "", description: "" });

  const isOwnProfile = isLoggedIn && user?.id === Number(id);

  useEffect(() => {
    if (id) {
      // Obtener datos del usuario (mentor)
      fetch(`${API.USER_SERVICE}/api/users/${id}`)
        .then(res => res.json())
        .then(data => {
          setMentorUser(data);
          setEditData({ name: data.name || "", description: data.description || "" });
        })
        .catch(err => console.error("Error fetching user profile:", err));

      // Obtener ofertas activas del mentor para listarlas en su perfil
      fetch(`${API.MENTORSHIP_SERVICE}/api/mentorship-offers/mentor/${id}`)
        .then(res => res.json())
        .then(data => setMentorOffers(data.filter((o: any) => o.status !== "eliminada")))
        .catch(err => console.error("Error fetching mentor offers:", err));
    }
  }, [id]);

  const handleSave = async () => {
    try {
      const response = await fetch(`${API.USER_SERVICE}/api/users/${id}/profile`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(editData),
      });
      if (response.ok) {
        setMentorUser({ ...mentorUser, ...editData });
        setIsEditing(false);
        if (isOwnProfile) {
            const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
            storedUser.name = editData.name;
            localStorage.setItem("user", JSON.stringify(storedUser));
        }
      } else {
        alert("Error al guardar perfil");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión");
    }
  };

  if (!mentorUser) {
    return <div className="min-h-screen flex items-center justify-center">Cargando perfil público del mentor...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b sticky top-0 bg-white/80 backdrop-blur-sm z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-gray-900">CertiMentor</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isLoggedIn && user ? (
              <>
                {user.role === 'estudiante' && (
                  <button onClick={() => navigate("/buscar")} className="px-3 py-2 text-gray-700 hover:text-gray-900 transition-colors flex items-center gap-2 text-sm">
                    <Search className="w-4 h-4" /> Buscar Mentores
                  </button>
                )}
                {user.role === 'mentor' && (
                  <button onClick={() => navigate("/mentor-dashboard")} className="px-3 py-2 text-gray-700 hover:text-gray-900 transition-colors flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4" /> Mi Dashboard
                  </button>
                )}

                {/* Perfil y Logout */}
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
                  <button onClick={logout} className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Cerrar Sesión">
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mentor Profile Overview */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-8">
          <div className="p-8">
            {isEditing ? (
              <div className="space-y-4">
                <h2 className="text-xl font-bold mb-4">Editar Perfil Público</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Mostrado</label>
                  <input type="text" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Acerca de mí</label>
                  <textarea value={editData.description} onChange={e => setEditData({...editData, description: e.target.value})} rows={4} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none" placeholder="Cuenta un poco sobre tu experiencia profesional..." />
                </div>
                <div className="flex justify-end gap-3 mt-4 border-t border-gray-100 pt-4">
                  <button onClick={() => setIsEditing(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancelar</button>
                  <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"><Save className="w-4 h-4"/> Guardar Perfil</button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div className="w-32 h-32 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden border-4 border-gray-100">
                  {mentorUser.profileImage ? (
                    <img src={mentorUser.profileImage} alt={mentorUser.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-indigo-600" />
                  )}
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{mentorUser.name}</h1>
                  <div className="flex flex-col sm:flex-row gap-4 text-gray-600 mb-6 justify-center sm:justify-start">
                    <span className="flex items-center gap-1 justify-center"><Mail className="w-4 h-4" /> {mentorUser.email}</span>
                    <span className="flex items-center gap-1 justify-center capitalize"><Shield className="w-4 h-4" /> {mentorUser.role?.name || mentorUser.role}</span>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-6">
                    <h3 className="font-semibold text-gray-900 mb-2">Acerca de mí</h3>
                    <p className="text-gray-700 whitespace-pre-line text-sm leading-relaxed">
                      {mentorUser.description || "El mentor aún no ha añadido una descripción a su perfil."}
                    </p>
                  </div>

                  {isOwnProfile && (
                    <button onClick={() => setIsEditing(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors font-medium text-sm">
                      <Edit3 className="w-4 h-4" /> Modificar mi Perfil
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mentor's Offers */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-600" />
            Avisos de Mentoría
          </h2>
          {mentorOffers.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {mentorOffers.map(offer => (
                <div key={offer.id} onClick={() => navigate(`/oferta/${offer.id}`)} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer flex flex-col">
                  <div className="h-32 bg-gray-200 relative">
                    <ImageWithFallback src={offer.image} alt={offer.title} className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-xs font-medium text-gray-700 shadow-sm">
                      {offer.availability}
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">{offer.title}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">{offer.description}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="text-indigo-600 font-semibold">{offer.price === 0 ? "Gratis" : `$${offer.price.toLocaleString("es-CL")}`}</span>
                      <span className="text-sm text-gray-500 px-2 py-1 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">Ver Detalles →</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-lg border border-gray-200 text-center">
              <p className="text-gray-500">Este mentor aún no ha publicado ofertas activas.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
