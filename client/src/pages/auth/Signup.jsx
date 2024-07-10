import React from "react";

function Signup() {
  return (
    <div className="bg-gray-500 h-screen w-screen">
      <p className="text-white text-center font-bold text-xl py-5">SIGN UP</p>

      <div className="flex justify-center">
        <form className="flex justify-center items-center flex-col gap-3">
          <div>
            <label>first name : </label>
            <input type="text" />
          </div>

          <div>
            <label>last name : </label>
            <input type="text" />
          </div>

          <div>
            <label>email : </label>
            <input type="email" />
          </div>

          <div>
            <label>password : </label>
            <input type="password" />
          </div>

          <div>
            <label>confirm password : </label>
            <input type="password" />
          </div>

          <div>
            <label>contact number : </label>
            <input type="number" />
          </div>

          

        </form>
      </div>
    </div>
  );
}

export default Signup;

// "firstName":"tech",
// "lastName":"gyan",
// "password":"tech@123",
// "confirmPassword":"tech@123",
// "email":"techgyan2629@gmail.com",
// "accountType":"Student",
// "contactNumber": "1234567890",
