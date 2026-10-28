import React from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Home from "./components/home_layout/Home";
import LoginPortal from "./components/home_layout/LoginPortal";
import TiluRauteliLogin from "./components/home_layout/TiluRauteliLogin";
import AnganwadiLogin from "./components/home_layout/AnganwadiLogin";
import OTPLogin from "./components/login/OTPLogin";
import ITCellLogin from "./components/login/ITCellLogin";
import NavBar from "./components/nav_bar/NavBar";

import DisDashBoard from "./components/all_dashbords/dis_admin/DisDashBoard";
import DirectorTiluRauteli2026_27 from "./components/all_dashbords/dis_admin/DirectorTiluRauteli2026-27";
import DirectorAnganwadi2026_27 from "./components/all_dashbords/dis_admin/DirectorAnganwadi2026-27";

import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import Footer from "./components/footer/Footer";

import { LanguageProvider } from "./context/LanguageContext";
import StepF from "./components/child_regis/NominationForm/StepF";
import StepE from "./components/child_regis/NominationForm/StepE";
import StepD from "./components/child_regis/NominationForm/StepD";
import StepC from "./components/child_regis/NominationForm/StepC";
import StepB from "./components/child_regis/NominationForm/StepB";
import NominationForm from "./components/child_regis/NominationForm/NominationForm";
import StudentRegistration from "./components/child_regis/StudentRegistration/StudentRegistration";
import UserDashBoard from "./components/all_dashbords/dis_admin/user_dashboard/UserDashBoard";
import ITCellDashBoard from "./components/all_dashbords/dis_admin/IT_celll/ITCellDashBoard";
import ITCellAnganwadi2026_27 from "./components/all_dashbords/dis_admin/IT_celll/ITCellAnganwadi2026-27";
import DpoPhoneList from "./components/all_dashbords/dis_admin/IT_celll/DpoPhoneList";
import ApplicantQueries from "./components/all_dashbords/dis_admin/IT_celll/ApplicantQueries";
import DPODashboard from "./components/all_dashbords/dis_admin/DPO_cell/DPODashboard";
import DPOAnganwadi2026_27 from "./components/all_dashbords/dis_admin/DPO_cell/DPOAnganwadi2026-27";
import TiluRauteli2026_27 from "./components/all_dashbords/dis_admin/DPO_cell/tilurauteli2026-27";
import CDPODashboard from "./components/all_dashbords/dis_admin/CDPO_cell/CDPODashboard";
import CDPOAnganwadi2026_27 from "./components/all_dashbords/dis_admin/CDPO_cell/CDPOAnganwadi2026-27";
import TiluRauteliUserDashboard from "./components/all_dashbords/dis_admin/TiluRauteli_user_dashboard/TiluRauteliUserDashboard";
import AnganwadiUserDashboard from "./components/all_dashbords/dis_admin/Anganwadi_user_dashboard/AnganwadiUserDashboard";
import { useAuth } from "./components/login/AuthContext";

const roleLoginPath = (role, portal) => {
  if (portal === "anganwadi") return "/AnganwadiLogin";
  if (role === "ang_puruskar_user") return "/AnganwadiLogin";
  if (role === "it_cell") return "/loginit";
  if (role === "telu_rautli_user") return "/TiluRauteliLogin";
  return "/Login";
};

const ProtectedRoute = ({ allowedRoles, children, loginPath }) => {
  const { user } = useAuth();
  const normalizedRole = (user?.role || user?.user?.role || "")
    .toLowerCase()
    .replace(/-/g, "_");

  if (!user) {
    return (
      <Navigate
        to={loginPath || roleLoginPath(allowedRoles[0])}
        replace
      />
    );
  }
  if (!allowedRoles.includes(normalizedRole)) {
    return (
      <Navigate
        to={roleLoginPath(normalizedRole, user.portal)}
        replace
      />
    );
  }
  return children;
};

// A wrapper component to conditionally render the NavBar
const AppContent = () => {
  const location = useLocation();
  const normalizedPath = location.pathname.replace(/\/+$/, "").toLowerCase() || "/";
  const isDisRoute = [
    "/UserDashBoard",
    "/ITCellDashBoard",
    "/ITCellDpoPhoneList",
    "/ITCellApplicantQueries",
    "/ITCellAnganwadi2026-27",
    "/DPODashBoard",
    "/TiluRauteli2026-27",
    "/DPOAnganwadi2026-27",
    "/CDPODashBoard",
    "/CDPOAnganwadi2026-27",
    "/TiluRauteliUserDashboard",
    "/AnganwadiUserDashboard",
    "/DisDashBoard",
    "/DirectorTiluRauteli2026-27",
    "/DirectorAnganwadi2026-27",
  ].some((route) => location.pathname.startsWith(route));
  const isHomeRoute = normalizedPath === "/";
  const isLoginRoute = ["/login", "/loginit"].includes(normalizedPath);
  const isStandaloneLoginRoute = [
    "/login",
    "/loginportal",
    "/tilurautelilogin",
    "/anganwadilogin",
    "/loginit",
  ].includes(normalizedPath);

  return (
    <>
      {!isDisRoute && !isLoginRoute && <NavBar />}
      <div className={!isDisRoute && !isLoginRoute ? "main-content" : ""}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/LoginPortal" element={<LoginPortal />} />
          <Route path="/TiluRauteliLogin" element={<TiluRauteliLogin />} />
          <Route path="/AnganwadiLogin" element={<AnganwadiLogin />} />
          <Route path="/StepC" element={<StepC />} />
          <Route path="/StudentRegistration" element={<StudentRegistration />} />
          <Route path="/StepB" element={<StepB />} />
          <Route path="/NominationForm" element={<NominationForm />} />
         
          <Route path="/Login" element={<OTPLogin />} />
          <Route path="/loginit" element={<ITCellLogin />} />
          <Route path="/StepD" element={<StepD />} />
          <Route path="/StepE" element={<StepE />} />
          <Route path="/StepF" element={<StepF />} />
          <Route
            path="/UserDashBoard"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <UserDashBoard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/AnganwadiUserDashboard"
            element={
              <ProtectedRoute
                allowedRoles={["ang_puruskar_user"]}
                loginPath="/AnganwadiLogin"
              >
                <AnganwadiUserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/TiluRauteliUserDashboard"
            element={
              <ProtectedRoute allowedRoles={["telu_rautli_user"]}>
                <TiluRauteliUserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ITCellDashBoard"
            element={
              <ProtectedRoute allowedRoles={["it_cell"]}>
                <ITCellDashBoard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ITCellDpoPhoneList"
            element={
              <ProtectedRoute allowedRoles={["it_cell"]}>
                <DpoPhoneList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ITCellApplicantQueries"
            element={
              <ProtectedRoute allowedRoles={["it_cell"]}>
                <ApplicantQueries />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ITCellAnganwadi2026-27"
            element={
              <ProtectedRoute allowedRoles={["it_cell"]}>
                <ITCellAnganwadi2026_27 />
              </ProtectedRoute>
            }
          />
          <Route
            path="/DPODashBoard"
            element={
              <ProtectedRoute allowedRoles={["dpo"]}>
                <DPODashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/TiluRauteli2026-27"
            element={
              <ProtectedRoute allowedRoles={["dpo"]}>
                <TiluRauteli2026_27 />
              </ProtectedRoute>
            }
          />
          <Route
            path="/DPOAnganwadi2026-27"
            element={
              <ProtectedRoute allowedRoles={["dpo"]}>
                <DPOAnganwadi2026_27 />
              </ProtectedRoute>
            }
          />
          <Route
            path="/CDPODashBoard"
            element={
              <ProtectedRoute allowedRoles={["cdpo"]}>
                <CDPODashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/CDPOAnganwadi2026-27"
            element={
              <ProtectedRoute allowedRoles={["cdpo"]}>
                <CDPOAnganwadi2026_27 />
              </ProtectedRoute>
            }
          />
          <Route
            path="/DisDashBoard"
            element={
              <ProtectedRoute allowedRoles={["director"]}>
                <DisDashBoard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/DirectorTiluRauteli2026-27"
            element={
              <ProtectedRoute allowedRoles={["director"]}>
                <DirectorTiluRauteli2026_27 />
              </ProtectedRoute>
            }
          />
          <Route
            path="/DirectorAnganwadi2026-27"
            element={
              <ProtectedRoute allowedRoles={["director"]}>
                <DirectorAnganwadi2026_27 />
              </ProtectedRoute>
            }
          />
          

          {/* Dis Routes */}
          
          
          
          {/* Add other Dis routes from DisLeftNav here as needed */}
        </Routes>
      </div>
      {!isDisRoute && !isHomeRoute && !isStandaloneLoginRoute && <Footer />}
    </>
  );
};

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;