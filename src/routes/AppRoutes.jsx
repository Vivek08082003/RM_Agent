import { Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import LeadInitiationPage from "../pages/LeadInitiationPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<LeadInitiationPage />} />
      </Route>
    </Routes>
  );
}