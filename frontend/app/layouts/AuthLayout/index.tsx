import { Outlet } from "react-router";
import asideImage from "./../../resources/images/registerImage.jpg";

export default function App() {
  return (
    <div className="flex h-screen">
      <div className="w-full md:w-1/2 flex justify-center items-center">
        <div className="w-4/5 max-w-md text-center">
          <h1 className="text-2xl font-bold mb-4">
            Ingresa tu información personal
          </h1>
          <div className="bg-white shadow-md p-6 rounded-lg">
            <Outlet />
          </div>
        </div>
      </div>

      <div
        className="hidden md:block md:w-1/2 bg-cover bg-center"
        style={{
          backgroundImage: `url(${asideImage})`,
        }}
      ></div>
    </div>
  );
}
