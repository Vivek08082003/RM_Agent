import { Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import CallToTextAgentPage from "../pages/CallToTextAgentPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<CallToTextAgentPage />} />
      </Route>
    </Routes>
  );
}