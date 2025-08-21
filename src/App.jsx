import React, { Suspense, lazy } from "react";
import { BrowserRouter, createBrowserRouter, Route, RouterProvider, Routes } from "react-router-dom"
import AdminDashboard from "./pages/DashboardHome";
import AdminLayout from "./layouts/AdminLayout";
import DashboardHome from "./pages/DashboardHome";
import BingeEatingTipsManagement from "./pages/BingeEatingTips";
import UserManagement from "./pages/UsersManagment";
import BodyShapeTipManagement from "./pages/BodyShapeTipManagement";
import FailingTipsManagement from "./pages/FailingTipsManagement";
import GuiltTipsManagement from "./pages/GuiltTipsManagement";
import GeneralTipsManagement from "./pages/GeneralTipsManagement";
import DepressionTipsManagement from "./pages/DepressionTipsManagement";
import PanicAttackTipsManagement from "./pages/PanicAttackTipsManagement";
import CrisisContactsManagement from "./pages/CrisisContactsManagement";
import CrisisMessagesManagement from "./pages/CrisisMessagesManagement";
import EmergencyActionsManagement from "./pages/EmergencyActionsManagement";
import SelfHarmCopingStrategiesManagement from "./pages/SelfHarmCopingStrategiesManagement";
import TestimonialsManagement from "./pages/TestimonialsManagement";

const LoginPage = lazy(() => import('./pages/auth/Login'))



// Loading component
const LoadingSpinner = () => (
  <div className="loading-spinner">
    <div className="spinner"></div>
    <p>Loading...</p>
  </div>
);

const SuspenseWrapper = ({ children }) => {
  return <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
}

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <SuspenseWrapper>
        <LoginPage />
      </SuspenseWrapper>
    ),
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        path: 'dashboard',
        element: (<SuspenseWrapper><DashboardHome /></SuspenseWrapper>)
      },
      {
        path: 'binge-eating-tips',
        element: (<SuspenseWrapper><BingeEatingTipsManagement /></SuspenseWrapper>)
      },
      {
        path: 'body-shape-tips',
        element: (<SuspenseWrapper><BodyShapeTipManagement /></SuspenseWrapper>)
      },
      {
        path: 'depression-tips',
        element: (<SuspenseWrapper><DepressionTipsManagement /></SuspenseWrapper>)
      },
      {
        path: 'failing-tips',
        element: (<SuspenseWrapper><FailingTipsManagement /></SuspenseWrapper>)
      },
      {
        path: 'general-tips',
        element: (<SuspenseWrapper><GeneralTipsManagement /></SuspenseWrapper>)
      },
      {
        path: 'guilt-tips',
        element: (<SuspenseWrapper><GuiltTipsManagement /></SuspenseWrapper>)
      },
      {
        path: 'panic-attack-tips',
        element: (<SuspenseWrapper><PanicAttackTipsManagement /></SuspenseWrapper>)
      },
      {
        path: 'crisis-contacts',
        element: (<SuspenseWrapper><CrisisContactsManagement /></SuspenseWrapper>)
      },
      {
        path: 'crisis-messages',
        element: (<SuspenseWrapper><CrisisMessagesManagement /></SuspenseWrapper>)
      },
      {
        path: 'emergency-actions',
        element: (<SuspenseWrapper><EmergencyActionsManagement /></SuspenseWrapper>)
      },
      {
        path: 'self-harm-coping-strategies',
        element: (<SuspenseWrapper><SelfHarmCopingStrategiesManagement /></SuspenseWrapper>)
      },
      {
        path: 'testimonials',
        element: (<SuspenseWrapper><TestimonialsManagement /></SuspenseWrapper>)
      },
      {
        path: 'users',
        element: (<SuspenseWrapper><UserManagement /></SuspenseWrapper>)
      },
    ]
  }
])

function App() {
  return (
    <>
      <RouterProvider router={router}></RouterProvider>
    </>
  )
}

export default App
