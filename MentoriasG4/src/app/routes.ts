import { createBrowserRouter } from "react-router";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Search from "./pages/Search";
import MentorProfile from "./pages/MentorProfile";
import Admin from "./pages/Admin";
import MentorDashboard from "./pages/MentorDashboard";
import MentorSchedule from "./pages/MentorSchedule";
import StudentSchedule from "./pages/StudentSchedule";
import UserProfile from "./pages/UserProfile";
import MentorshipDetail from "./pages/MentorshipDetail";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Landing,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/buscar",
    Component: Search,
  },
  {
    path: "/mentor/:id",
    Component: MentorProfile,
  },
  {
    path: "/oferta/:id",
    Component: MentorshipDetail,
  },
  {
    path: "/admin",
    Component: Admin,
  },
  {
    path: "/mentor-dashboard",
    Component: MentorDashboard,
  },
  {
    path: "/mentor-schedule",
    Component: MentorSchedule,
  },
  {
    path: "/student-schedule",
    Component: StudentSchedule,
  },
  {
    path: "/perfil",
    Component: UserProfile,
  },
]);
