import type { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { useAuthStore } from '~/stores/useAuthStore';

//definir el objeto de las props
interface ProtectedRoutesProps { 
   children: ReactNode;
   allowedUserTypes?: Array<"owner" | "vet">;
}

export default function ProtectedRoutes ({children, allowedUserTypes}: ProtectedRoutesProps) {
   const {isAuthenticated, userType} = useAuthStore();

   if (!isAuthenticated) {
      return <Navigate to="/" />
   }

   if (allowedUserTypes && userType && !allowedUserTypes.includes(userType)) {
      return <Navigate to="/unauthorized" />
   }

  return <>{children}</>;
}