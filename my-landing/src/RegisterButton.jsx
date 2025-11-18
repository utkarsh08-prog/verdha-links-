import React, { useState } from "react";
import Loader from "./components/Loader";

// Helper to dynamically load Razorpay script
function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return resolve();
    if (window.Razorpay) return resolve();
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Razorpay script failed to load"));
    document.head.appendChild(script);
  });
}

const RegisterButton = ({ amount = 99, className = "btn", label = "Register Now At ₹99/- Only" }) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      await loadRazorpayScript();

      // 1️⃣ Create order on backend
      const res = await fetch("https://vlbackend-1.onrender.com/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      if (!res.ok) throw new Error("Failed to create order");
      const order = await res.json();

      // 2️⃣ Open Razorpay checkout (testing options)
      const options = {
        key: "rzp_test_RfEZA7cY0icEUx",
        amount: order.amount, // amount from backend (in paise)
        currency: "INR",
        name: "Arunn Guptaa",
        description: "1-on-1 Guidance Session",
        order_id: order.id,
        handler: function (response) {
          // On successful payment, redirect the user to Calendly scheduling page
          window.location.href = "https://calendly.com/linksvardha/60min";
        },
        theme: { color: "#F6C84C" },
      };


      const rzp = new window.Razorpay(options);
      rzp.open();

      // checkout opened — clear loading so button becomes interactive again
      setLoading(false);
    } catch (err) {
      console.error(err);
      alert("Could not initiate payment: " + (err.message || err));
      setLoading(false);
    }
  };

  const combinedClass = `${className} ${loading ? "opacity-60 cursor-not-allowed" : ""}`;

  return (
    <button onClick={handlePayment} className={combinedClass} disabled={loading}>
      {loading ? <Loader /> : label}
    </button>
  );
};

export default RegisterButton;
