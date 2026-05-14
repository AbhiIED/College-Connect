import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Footer from "../components/layout/Footer";
import Navbar from "../components/layout/Navbar";
export default function DonationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cause, setCause] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [amount, setAmount] = useState("");

  // 💡 Base URL
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchCause = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
        const res = await fetch(`${API_BASE_URL}/donations/${id}`);
        if (!res.ok) throw new Error("Failed to fetch cause details");
        const data = await res.json();
        setCause(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCause();
  }, [id, baseUrl]);

  const handlePayment = async () => {
    try {
      // 🧩 Get Razorpay key from backend
      const resKey = await fetch(`${baseUrl}/donations/get-key`);
      const { key } = await resKey.json();

      // 🧾 Create order on backend
      const resOrder = await fetch(`${baseUrl}/donations/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amount || cause.target }), // allow user input
      });
      const order = await resOrder.json();

      // 💸 Razorpay payment setup
      const options = {
        key,
        amount: order.amount,
        currency: "INR",
        name: "CollegeConnect Foundation",
        description: cause.title,
        image: cause.image,
        order_id: order.id,
        handler: function (response) {
          alert("Payment successful! 🎉");
        },
        prefill: {
          name: "Nidhi",
          email: "nidhi@example.com",
        },
        theme: { color: "#F59E0B" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment error:", err);
      alert("Payment failed, please try again.");
    }
  };

  if (loading)
    return <p className="text-center mt-10 text-gray-500">Loading...</p>;
  if (error)
    return <p className="text-center mt-10 text-red-500">Error: {error}</p>;
  if (!cause)
    return <p className="text-center mt-10 text-gray-500">Cause not found.</p>;

  return (
    <> <Navbar />
      <section className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-100 py-6 px-6 mt-10">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden mt-12">
          <div className="relative">
            <img
              src={cause.image}
              alt={cause.title}
              className="h-64 w-full object-cover"
            />
            <button
              onClick={() => navigate(-1)}
              className="absolute top-4 left-4 bg-white/70 hover:bg-white text-amber-800 px-3 py-1 rounded-full flex items-center gap-1 text-sm font-medium"
            >
              <ArrowLeft size={16} />
              Back
            </button>
          </div>

          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              {cause.title}
            </h1>
            <p className="text-gray-600 mb-6 leading-relaxed">
              {cause.description}
            </p>

            <div className="flex justify-between items-center mb-6">
              <p className="text-amber-700 font-medium">
                Raised: ₹{cause.raised?.toLocaleString()} / ₹
                {cause.target?.toLocaleString()}
              </p>
              <p className="text-gray-500 text-sm">
                {cause.supporters} alumni have supported this cause
              </p>
            </div>

            {/* 💰 Donation Input */}
            <input
              type="number"
              placeholder="Enter amount (₹)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border border-amber-300 rounded-full px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />

            <button
              onClick={handlePayment}
              className="w-full py-3 rounded-full bg-amber-600 text-white font-semibold hover:bg-amber-700 transition"
            >
              Proceed to Donate
            </button>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
