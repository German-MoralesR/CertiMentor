export const API = {
  USER_SERVICE: import.meta.env.VITE_USER_SERVICE_URL || "http://localhost:8081",
  MENTORSHIP_SERVICE: import.meta.env.VITE_MENTORSHIP_SERVICE_URL || "http://localhost:8082",
  SCHEDULING_SERVICE: import.meta.env.VITE_SCHEDULING_SERVICE_URL || "http://localhost:8083",
  FEEDBACK_SERVICE: import.meta.env.VITE_FEEDBACK_SERVICE_URL || "http://localhost:8084",
  NOTIFICATION_SERVICE: import.meta.env.VITE_NOTIFICATION_SERVICE_URL || "http://localhost:8085",
  PAYMENT_SERVICE: import.meta.env.VITE_PAYMENT_SERVICE_URL || "http://localhost:8086",
};