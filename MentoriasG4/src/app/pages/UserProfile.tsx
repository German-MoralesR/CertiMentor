import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, User, Mail, Shield, BookOpen, Star, Clock, Edit3, Settings, LogOut, Key } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function UserProfile() {
  const navigate = useNavigate();
  const { user, isLoggedIn, logout } = useAuth();

  // Si el usuario no está logueado o es admin, lo redirigimos al inicio
  if (!isLoggedIn || (user && user.role === "admin")) {
    navigate("/");
    return null;
  }

  // Estados para estadísticas reales del mentor
  const [mentorStats, setMentorStats] = useState({
    sessionsGiven: 0,
    rating: 0,
    hoursMentored: 0,
  });

  // Estados para estadísticas reales del estudiante
  const [studentStats, setStudentStats] = useState({
    sessionsTaken: 0,
    mentorsContacted: 0,
    hoursLearned: 0,
  });

  // Estados para el cambio de contraseña
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [passwordMessage, setPasswordMessage] = useState({ type: "", text: "" });

  // Efecto para obtener las estadísticas reales
  useEffect(() => {
    if (user?.id) {
      if (user.role === "estudiante") {
        fetch(`http://localhost:8083/api/mentorship-sessions/student/${user.id}`)
          .then(res => res.json())
          .then(sessions => {
            const completed = sessions.filter((s: any) => s.status === "completada");
            const uniqueMentors = new Set(completed.map((s: any) => s.mentorId)).size;
            const totalMinutes = completed.reduce((acc: number, s: any) => acc + (s.duration || 0), 0);
            setStudentStats({
              sessionsTaken: completed.length,
              mentorsContacted: uniqueMentors,
              hoursLearned: Number((totalMinutes / 60).toFixed(1)),
            });
          })
          .catch(err => console.error("Error fetching student stats", err));
      } else if (user.role === "mentor") {
        // Estadísticas de sesiones para el mentor
        fetch(`http://localhost:8083/api/mentorship-sessions/mentor/${user.id}`)
          .then(res => res.json())
          .then(sessions => {
            const completed = sessions.filter((s: any) => s.status === "completada");
            const totalMinutes = completed.reduce((acc: number, s: any) => acc + (s.duration || 0), 0);
            setMentorStats(prev => ({ ...prev, sessionsGiven: completed.length, hoursMentored: Number((totalMinutes / 60).toFixed(1)) }));
          });
        
        // Promedio de calificación para el mentor
        fetch(`http://localhost:8084/api/reviews/mentor/${user.id}`)
          .then(res => res.json())
          .then(reviews => {
            if (reviews.length > 0) {
              const totalStars = reviews.reduce((acc: number, r: any) => acc + r.rating, 0);
              setMentorStats(prev => ({ ...prev, rating: Number((totalStars / reviews.length).toFixed(1)) }));
            }
          });
      }
    }
  }, [user]);

  const handleLogout = () => {
    if (logout) {
      logout();
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    navigate("/");
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      setPasswordMessage({ type: "error", text: "Las contraseñas nuevas no coinciden." });
      return;
    }
    try {
      const response = await fetch(`http://localhost:8081/api/users/${user?.id}/password`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.new
        }),
      });
      if (response.ok) {
        setPasswordMessage({ type: "success", text: "¡Contraseña actualizada exitosamente!" });
        setPasswords({ current: "", new: "", confirm: "" });
        setTimeout(() => {
          setShowPasswordModal(false);
          setPasswordMessage({ type: "", text: "" });
        }, 2000);
      } else {
        setPasswordMessage({ type: "error", text: "La contraseña actual es incorrecta." });
      }
    } catch (err) {
      setPasswordMessage({ type: "error", text: "Error de conexión con el servidor." });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Encabezado simple para volver atrás */}
      <header className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)} // Vuelve a la página anterior
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Mi Perfil</h1>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* TARJETA PRINCIPAL: Información Personal */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Avatar placeholder */}
              <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-3xl font-bold text-indigo-600">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
              
              {/* Datos del usuario */}
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{user?.name}</h2>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-gray-600 mb-4 justify-center sm:justify-start">
                  <span className="flex items-center gap-1 justify-center">
                    <Mail className="w-4 h-4" />
                    {user?.email}
                  </span>
                  <span className="flex items-center gap-1 justify-center capitalize">
                    <Shield className="w-4 h-4" />
                    {user?.role}
                  </span>
                </div>
                
                <button className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors font-medium text-sm">
                  <Edit3 className="w-4 h-4" />
                  Editar Información
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* TARJETA DE ESTADÍSTICAS: Cambia según el rol */}
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Resumen de tu actividad
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {user?.role === "mentor" ? (
            // ESTADÍSTICAS PARA MENTORES
            <>
              <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
                <BookOpen className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{mentorStats.sessionsGiven}</div>
                <div className="text-sm text-gray-600">Sesiones Impartidas</div>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
                <Star className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{mentorStats.rating}</div>
                <div className="text-sm text-gray-600">Calificación Promedio</div>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
                <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{mentorStats.hoursMentored}h</div>
                <div className="text-sm text-gray-600">Horas de Mentoría</div>
              </div>
            </>
          ) : (
            // ESTADÍSTICAS PARA ESTUDIANTES
            <>
              <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
                <BookOpen className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{studentStats.sessionsTaken}</div>
                <div className="text-sm text-gray-600">Sesiones Tomadas</div>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
                <User className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{studentStats.mentorsContacted}</div>
                <div className="text-sm text-gray-600">Mentores Diferentes</div>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
                <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{studentStats.hoursLearned}h</div>
                <div className="text-sm text-gray-600">Horas de Aprendizaje</div>
              </div>
            </>
          )}
        </div>

        {/* TARJETA DE CONFIGURACIÓN DE CUENTA */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-500" />
              Configuración de la Cuenta
            </h3>
          </div>
          <div className="p-6 space-y-4">
            {/* Cambiar Contraseña */}
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <div>
                <p className="font-medium text-gray-900">Contraseña</p>
                <p className="text-sm text-gray-500">Asegura tu cuenta con una buena contraseña</p>
              </div>
              <button 
                onClick={() => setShowPasswordModal(true)}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
              >
                Cambiar
              </button>
            </div>
            
            {/* Notificaciones */}
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <div>
                <p className="font-medium text-gray-900">Notificaciones por Email</p>
                <p className="text-sm text-gray-500">Recibir alertas de sesiones y mensajes</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {/* Zona de peligro */}
            <div className="pt-4 flex flex-col items-start gap-4">
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Modal para Cambio de Contraseña */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <Key className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Cambiar Contraseña</h3>
            </div>

            {passwordMessage.text && (
              <div className={`p-3 rounded-lg mb-4 text-sm font-medium ${passwordMessage.type === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
                {passwordMessage.text}
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña Actual</label>
                <input 
                  type="password" 
                  value={passwords.current}
                  onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
                <input 
                  type="password" 
                  value={passwords.new}
                  onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Nueva Contraseña</label>
                <input 
                  type="password" 
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required 
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowPasswordModal(false)} className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">Actualizar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}