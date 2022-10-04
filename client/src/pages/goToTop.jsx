import React, { useEffect, useState } from "react";
import { FaArrowUp } from "react-icons/fa";

const GoToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const goToBtn = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  };

  const listentoScroll = () => {
    let heightToHidden = 2;
    const winScroll =
      document.body.scrollTop || document.documentElement.scrollTop;
    if (winScroll > heightToHidden) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", listentoScroll);
    return () => window.removeEventListener("scroll", listentoScroll);
  }, []);

  return (
    <>
      {isVisible && (
        <div className="top-btn" onClick={goToBtn} style={mystyle}>
          <FaArrowUp className="uparrow"></FaArrowUp>
          {/* <h1>Button here!!</h1> */}
        </div>
      )}
    </>
  );
};

const mystyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  cursor: "pointer",
  fontSize: "2.4rem",
  width: "5rem",
  height: "5rem",
  color: "#00ffa8",
  backgroundColor: "black",
  position: "fixed",
  bottom: "4rem",
  right: "4rem",
  zIndex: "999",
  borderRadius: "15px",
};

export default GoToTop;
