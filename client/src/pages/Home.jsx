import React from "react";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="bg-gray-500 h-screen w-screen flex items-center justify-center flex-col gap-5">
      <p className="font-bold text-white text-xl">Home page</p>
      <div className="font-bold text-black flex gap-4 ">
        <Link to="/login" className="border-2 p-2 border-black ">
          Login
        </Link>
        <Link to="/signup" className="border-2 p-2 border-black ">
          Sign up
        </Link>
      </div>
    </div>
  );
}

export default Home;
