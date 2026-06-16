import { useState } from "react";
import { useNavigate } from "react-router";
import { Users, ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { API } from "../config";

export default function Login() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [mentorRequest, setMentorRequest] = useState(false);
  const [certificationCode, setCertificationCode] = useState("");
  const [institution, setInstitution] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (mode === "register") {
      if (!firstName || !lastName || !email || !phoneNumber || !password || !confirmPassword) {
        setError("Por favor completa todos los campos");
        return;
      }
      if (password !== confirmPassword) {
        setError("Las contraseñas no coinciden");
        return;
      }
      // Validación de contraseña en el frontend para feedback inmediato
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-+=_{}[\]|;:'",.<>/?~]).{8,}$/;
      if (!passwordRegex.test(password)) {
        setError("La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo.");
        return;
      }
      if (!acceptTerms) {
        setError("Debes aceptar los Términos y Condiciones");
        return;
      }
      if (mentorRequest) {
        if (!certificationCode || !institution) {
          setError("Por favor completa los datos de certificación para ser mentor");
          return;
        }
      }
      const fullName = `${firstName} ${lastName}`.trim();
      
      // Hacemos el fetch directamente para poder enviar el nuevo campo 'mentorRequest'
      try {
        const response = await fetch(`${API.USER_SERVICE}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            name: fullName, 
            email, 
            phoneNumber,
            password, 
            mentorRequest,
            certificationCode: mentorRequest ? certificationCode : null,
            institution: mentorRequest ? institution : null
          }),
        });
        
        if (response.ok) {
        setMode("login");
        setSuccessMsg("¡Cuenta creada exitosamente! Por favor, inicia sesión con tus credenciales.");
        setPassword(""); // Limpiar contraseñas por seguridad
        setConfirmPassword("");
        setPhoneNumber("");
        setAcceptTerms(false);
        setMentorRequest(false);
        setCertificationCode("");
        setInstitution("");
        } else {
          const errorData = await response.json();
          setError(errorData.error || "Error al registrarse. El correo podría ya estar en uso.");
        }
      } catch (err) {
        setError("Error de conexión con el servidor.");
      }
      return;
    }

    if (!email || !password) {
      setError("Por favor completa todos los campos");
      return;
    }

    const success = await login(email, password);
    if (success) {
      navigate("/");
    } else {
      setError("Credenciales incorrectas o tu cuenta ha sido desactivada.");
    }
  };

  const loginTestUser = async (testEmail: string, testPassword: string) => {
    const success = await login(testEmail, testPassword);
    if (success) {
      navigate("/");
    } else {
      setError("Error al conectar. Verifica que el servidor de Spring Boot esté corriendo.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-md w-full">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Users className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-semibold text-gray-900">
                MicroMentorías
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {mode === "login" ? "Bienvenido de nuevo" : "Crear cuenta"}
            </h1>
            <p className="text-gray-600">
              {mode === "login"
                ? "Ingresa tus datos para continuar"
                : "Regístrate para comenzar"}
            </p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-lg shadow-sm border p-8">
            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => {
                  setMode("login");
                  setError("");
              setSuccessMsg("");
                }}
                className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                  mode === "login"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Iniciar sesión
              </button>
              <button
                onClick={() => {
                  setMode("register");
                  setError("");
              setSuccessMsg("");
                }}
                className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                  mode === "register"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Registrarse
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}
        {/* Success Message */}
        {successMsg && mode === "login" && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
            {successMsg}
          </div>
        )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "register" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nombre
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Tu nombre"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Apellido
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Tu apellido"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
              )}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {mode === "register" && (
                <div>
                  <label
                    htmlFor="phoneNumber"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Teléfono
                  </label>
                  <input
                    id="phoneNumber"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+56912345678"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {mode === "register" && (
                  <p className="mt-1 text-xs text-gray-500">
                    La contraseña debe tener al menos 8 caracteres, una
                    mayúscula, una minúscula, un número y un símbolo.
                  </p>
                )}
              </div>

          {mode === "register" && (
            <>
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Confirmar Contraseña
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              
              <div className="mt-4 bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="mentorReq"
                      type="checkbox"
                      checked={mentorRequest}
                      onChange={(e) => setMentorRequest(e.target.checked)}
                      className="w-4 h-4 border border-gray-300 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </div>
                  <div className="ml-2 text-sm">
                    <label htmlFor="mentorReq" className="font-medium text-indigo-900 cursor-pointer">
                      Quiero ser Mentor (Mi cuenta requerirá aprobación de un administrador)
                    </label>
                  </div>
                </div>
                
                {mentorRequest && (
                  <div className="mt-4 pl-6 space-y-3">
                    <div>
                      <label htmlFor="certificationCode" className="block text-sm font-medium text-indigo-900 mb-1">
                        Código de Certificación
                      </label>
                      <input
                        id="certificationCode"
                        type="text"
                        value={certificationCode}
                        onChange={(e) => setCertificationCode(e.target.value)}
                        placeholder="Ej: CERT-12345"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                      />
                    </div>
                    <div>
                      <label htmlFor="institution" className="block text-sm font-medium text-indigo-900 mb-1">
                        Institución
                      </label>
                      <input
                        id="institution"
                        type="text"
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        placeholder="Ej: Universidad de Ejemplo"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-start mt-4">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="w-4 h-4 border border-gray-300 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>
                <div className="ml-2 text-sm">
                  <label htmlFor="terms" className="font-medium text-gray-700 cursor-pointer">
                    Acepto los <a href="#" className="text-indigo-600 hover:text-indigo-500">Términos y Condiciones</a> y la Política de Privacidad
                  </label>
                </div>
              </div>
            </>
          )}

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Cuentas de prueba
                </span>
              </div>
            </div>

            {/* Usuarios de prueba */}
            {/* Información de credenciales */}
            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg mb-6">
              <p>
                <strong>Mentor:</strong> mentor@mentorias.com / 123456
              </p>
              <p>
                <strong>Estudiante:</strong> estudiante@mentorias.com / 123456
              </p>
              <p>
                <strong>Admin:</strong> admin@mentorias.com / 123456
              </p>
            </div>
          </div>

          {/* Footer text */}
          <p className="text-center text-sm text-gray-600 mt-6">
            {mode === "login" ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
            <button
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError("");
            setSuccessMsg("");
          }}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              {mode === "login" ? "Regístrate aquí" : "Inicia sesión"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
