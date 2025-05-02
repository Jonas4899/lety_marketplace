import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from "js-cookie";
import type { Owner, Vet, Pet } from "~/types/usersTypes";  // Importar los tipos

type AuthState = {
   isAuthenticated: boolean;
   userType: "owner" | "vet" | null;
   token: string | null;
   user: Owner | Vet | null;
   pets: Pet[] | null;

   //acciones
   login: (
      data: {
         token: string;
         userType: "owner" | "vet";
         user: Owner | Vet;
         pets?: Pet[] | null;
      }) => void;
   logout: () => void;
};

//crear la store
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      userType: null,
      token: null,
      user: null,
      pets: null,

      login: (data) => {
        Cookies.set("auth_token", data.token, { 
          expires: 1,
          //path: '/',
          secure: process.env.NODE_ENV === 'production',
          sameSite: "Lax", 
        });

        set({
          isAuthenticated: true,
          userType: data.userType,
          token: data.token,
          user: data.user,
          pets: data.pets || null,
        })
      },

      logout:() => {
        Cookies.remove("auth_token");
        set({
          isAuthenticated: false,
          userType: null,
          token: null,
          user: null,
          pets: null,
        });
      }
    }),

    {
      name: 'auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        userType: state.userType,
        user: state.user,
        pets: state.pets,
      })

    }
  )
)