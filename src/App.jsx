import React, { Suspense, lazy } from "react";
import { BrowserRouter,createBrowserRouter,Route,RouterProvider,Routes } from "react-router-dom"
import AdminDashboard from "./pages/DashboardHome";
import AdminLayout from "./layouts/AdminLayout";
import DashboardHome from "./pages/DashboardHome";
import BingeEatingTipsManagement from "./pages/BingeEatingTips";
import UserManagement from "./pages/UsersManagment";
const LoginPage = lazy(()=> import('./pages/auth/Login'))



// Loading component
const LoadingSpinner = () => (
  <div className="loading-spinner">
    <div className="spinner"></div>
    <p>Loading...</p>
  </div>
);

const  SuspenseWrapper = ({children})=>{
   return <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
}

const router = createBrowserRouter([
  {
    path:'/',
    element: (
      <SuspenseWrapper>
        <LoginPage/>
      </SuspenseWrapper>
    ),
  },
  {
    path:'/admin',
    element:<AdminLayout/>,
    children:[
      {
        path:'dashboard',
        element:( <SuspenseWrapper><DashboardHome/></SuspenseWrapper> )
      },
      {
        path:'binge-eating-tips',
        element:( <SuspenseWrapper><BingeEatingTipsManagement/></SuspenseWrapper> )
      },
      {
        path:'users',
        element:( <SuspenseWrapper><UserManagement/></SuspenseWrapper> )
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
