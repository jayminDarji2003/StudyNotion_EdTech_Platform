import React from "react";
import { Link } from "react-router-dom";
import { FaArrowRightLong } from "react-icons/fa6";

function Home() {
  return (
    <>
      {/* section 1 */}
      <div>
        <div className="flex justify-center ">
          <Link to={"/signup"} className="flex items-center gap-3 border">
            Become an Instructor
            <FaArrowRightLong />
          </Link>
        </div>

        <div></div>

        <div></div>

        <div></div>
      </div>

      {/* section 2 */}

      {/* section 3 */}

      {/* FOOTER SECTION */}
    </>
  );
}

export default Home;
