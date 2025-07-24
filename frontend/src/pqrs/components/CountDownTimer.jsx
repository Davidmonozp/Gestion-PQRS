import React, { useState, useEffect } from "react";
// import "../styles/CountdownTimer.css";


function CountdownTimer({ targetDate }) {
  const calculateTimeLeft = () => {
    const now = new Date();
    const target = new Date(targetDate);
    const difference = target - now;

    if (difference > 0) {
      // Tiempo restante normal
      const totalHours = difference / (1000 * 60 * 60);
      const days = Math.floor(totalHours / 24);
      const hours = Math.floor(totalHours % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      return {
        expired: false,
        totalHours,
        days,
        hours,
        minutes,
        seconds,
      };
    } else {
      // Tiempo expirado, cuánto tiempo lleva expirado
      const diffExpired = now - target;
      const totalHours = diffExpired / (1000 * 60 * 60);
      const days = Math.floor(totalHours / 24);
      const hours = Math.floor(totalHours % 24);
      const minutes = Math.floor((diffExpired / 1000 / 60) % 60);
      const seconds = Math.floor((diffExpired / 1000) % 60);

      return {
        expired: true,
        totalHours,
        days,
        hours,
        minutes,
        seconds,
      };
    }
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  // 🎨 Lógica de color según horas restantes o expirado
  let color = "#515151";
  if (!timeLeft.expired) {
    if (timeLeft.totalHours <= 6) {
      color = "red";
    } else if (timeLeft.totalHours <= 12) {
      color = "orange";
    }
  } else {
    color = "red";
  }

  return (
    <span style={{ color, fontWeight: "bold" }}>
      {!timeLeft.expired ? (
        <>
          {timeLeft.days > 0 && `${timeLeft.days}d `}
          {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
        </>
      ) : (
        <>
          ⏰ Expirado hace{" "}
          {timeLeft.days > 0 && `${timeLeft.days}d `}
          {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
        </>
      )}
    </span>
  );
}

export default CountdownTimer;

// function CountdownTimer({ targetDate }) {
//   const calculateTimeLeft = () => {
//     const now = new Date();
//     const difference = new Date(targetDate) - now;

//     if (difference <= 0) return "⏰ Expirado";

//     const totalHours = difference / (1000 * 60 * 60);
//     const days = Math.floor(totalHours / 24);
//     const hours = Math.floor(totalHours % 24);
//     const minutes = Math.floor((difference / 1000 / 60) % 60);
//     const seconds = Math.floor((difference / 1000) % 60);

//     return {
//       totalHours,
//       days,
//       hours,
//       minutes,
//       seconds,
//     };
//   };

//   const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setTimeLeft(calculateTimeLeft());
//     }, 1000);
//     return () => clearInterval(timer);
//   }, [targetDate]);

//   if (timeLeft === "⏰ Expirado") {
//     return <span style={{ color: "red", fontWeight: "bold" }}>⏰ Expirado</span>;
//   }

//   // 🎨 Lógica de color según horas restantes
//   let color = "white";
//   if (timeLeft.totalHours <= 6) {
//     color = "red";
//   } else if (timeLeft.totalHours <= 12) {
//     color = "orange";
//   }

//   return (
//     <span style={{ color, fontWeight: "bold" }}>
//       {timeLeft.days > 0 && `${timeLeft.days}d `}
//       {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
//     </span>
//   );
// }

// export default CountdownTimer;


