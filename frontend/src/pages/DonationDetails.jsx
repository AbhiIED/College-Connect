import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Users, Target, Sparkles, Loader2, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const QUICK_AMOUNTS = [100, 500, 1000, 5000];

const categoryGradients = {
  Education: "from-blue-500 to-indigo-600",
  Infrastructure: "from-violet-500 to-purple-600",
  Environment: "from-emerald-500 to-teal-600",
  Sports: "from-orange-500 to-red-500",
  Health: "from-pink-500 to-rose-500",
};

const categoryBadgeColors = {
  Education: "bg-blue-100/80 text-blue-700",
  Infrastructure: "bg-violet-100/80 text-violet-700",
  Environment: "bg-emerald-100/80 text-emerald-700",
  Sports: "bg-orange-100/80 text-orange-700",
  Health: "bg-pink-100/80 text-pink-700",
};

const categoryBarColors = {
  Education: "from-blue-400 to-indigo-500",
  Infrastructure: "from-violet-400 to-purple-500",
  Environment: "from-emerald-400 to-teal-500",
  Sports: "from-orange-400 to-red-500",
  Health: "from-pink-400 to-rose-500",
};

export default function DonationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cause, setCause] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentStatus, setPaymentStatus] = useState(null); // null | 'loading'
  const [showSimulatedModal, setShowSimulatedModal] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchCause = async () => {
      try {
        const res = await fetch(`${baseUrl}/donations/${id}`);
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
    const donateAmount = Number(amount) || cause?.target;
    if (!donateAmount) return;
    setPaymentStatus("loading");
    
    const token = localStorage.getItem("token");

    try {
      // 1. Create order
      const resOrder = await fetch(`${baseUrl}/donations/create-order`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ amount: donateAmount }),
      });
      if (!resOrder.ok) throw new Error("Failed to create order");
      const order = await resOrder.json();

      // 2. Check if simulated order
      if (order.simulated) {
        // Trigger simulation flow
        setTimeout(() => {
          setShowSimulatedModal({
            orderId: order.id,
            amount: donateAmount,
            projectId: cause.id,
            title: cause.title
          });
          setPaymentStatus(null);
        }, 800);
        return;
      }

      // 3. Regular Razorpay checkout flow
      const resKey = await fetch(`${baseUrl}/donations/get-key`);
      const { key } = await resKey.json();

      const options = {
        key,
        amount: order.amount,
        currency: "INR",
        name: "CollegeConnect Foundation",
        description: cause.title,
        image: cause.image,
        order_id: order.id,
        handler: async function (response) {
          try {
            setPaymentStatus("loading");
            // Call verify payment
            const resVerify = await fetch(`${baseUrl}/donations/verify-payment`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({
                order_id: response.razorpay_order_id,
                payment_id: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                projectId: cause.id,
                amount: donateAmount,
                message: `Donation of ₹${donateAmount} via Razorpay`
              })
            });
            if (resVerify.ok) {
              // Refetch cause
              const refetch = await fetch(`${baseUrl}/donations/${id}`);
              const updated = await refetch.json();
              setCause(updated);
              setAmount("");
              setShowSuccessModal(true);
            } else {
              alert("Payment verification failed. Please contact support.");
            }
          } catch (err) {
            console.error("Verification error:", err);
            alert("An error occurred during verification.");
          } finally {
            setPaymentStatus(null);
          }
        },
        prefill: { name: "Alumni", email: "alumni@example.com" },
        theme: { color: "#e11d48" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      setPaymentStatus(null);
    } catch (err) {
      console.error("Payment error:", err);
      setPaymentStatus(null);
      alert("Payment failed, please try again.");
    }
  };

  // ── Loading state ──
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-rose-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-rose-100 flex items-center justify-center animate-pulse">
            <Heart className="w-7 h-7 text-rose-400" />
          </div>
          <p className="text-slate-500 text-sm">Loading cause details…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-red-500 font-medium">Error: {error}</p>
          <button onClick={() => navigate(-1)} className="mt-4 text-sm text-slate-500 hover:text-slate-700 underline">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!cause) return null;

  const progress = Math.min(Math.round((cause.raised / cause.target) * 100), 100);
  const grad = categoryGradients[cause.category] || "from-rose-500 to-amber-500";
  const badge = categoryBadgeColors[cause.category] || "bg-rose-100/80 text-rose-700";
  const bar = categoryBarColors[cause.category] || "from-rose-400 to-amber-500";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-rose-50/20">

      {/* ── FULL-BLEED HERO IMAGE ── */}
      <div className="relative w-full h-[360px] md:h-[420px] overflow-hidden">
        <img
          src={cause.image}
          alt={cause.title}
          className="w-full h-full object-cover"
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-20 left-5 flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white border border-white/30 px-4 py-2 rounded-full text-sm font-medium hover:bg-white/30 transition-all"
        >
          <ArrowLeft size={15} />
          Back
        </button>

        {/* Title & Category overlaid on image */}
        <div className="absolute bottom-8 left-0 right-0 px-6 md:px-12 max-w-6xl mx-auto">
          <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mb-3 ${badge} backdrop-blur-sm`}>
            {cause.category}
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight drop-shadow-lg max-w-2xl">
            {cause.title}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="flex items-center gap-1 text-white/80 text-sm">
              <Users size={14} /> {cause.supporters} supporters
            </span>
            <span className="text-white/40">·</span>
            <span className="flex items-center gap-1 text-white/80 text-sm">
              <Target size={14} /> ₹{cause.target?.toLocaleString()} goal
            </span>
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">

        {/* Left: description + progress */}
        <div className="space-y-8">
          {/* Description card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-7">
            <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Sparkles size={18} className="text-rose-500" />
              About This Cause
            </h2>
            <p className="text-slate-600 leading-relaxed text-[15px]">{cause.description}</p>
          </div>

          {/* Progress card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-7">
            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="text-2xl font-extrabold text-slate-800">
                  ₹{cause.raised?.toLocaleString()}
                </p>
                <p className="text-sm text-slate-400 mt-0.5">raised of ₹{cause.target?.toLocaleString()} goal</p>
              </div>
              <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${grad} text-white font-bold text-sm shadow-sm`}>
                {progress}%
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden mb-4">
              <div
                className={`h-3 rounded-full bg-gradient-to-r ${bar} transition-all duration-1000`}
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Supporters stat */}
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <div className="flex -space-x-1">
                {[...Array(Math.min(Number(cause.supporters) || 0, 4))].map((_, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full bg-gradient-to-br from-rose-300 to-amber-300 border-2 border-white"
                  />
                ))}
              </div>
              <span>
                <span className="font-semibold text-slate-700">{cause.supporters}</span> alumni have contributed
              </span>
            </div>
          </div>
        </div>

        {/* Right: Sticky donation panel */}
        <div className="lg:sticky lg:top-24">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-7">
            <h3 className="text-lg font-bold text-slate-800 mb-1">Make a Donation</h3>
            <p className="text-sm text-slate-400 mb-6">Your contribution makes a real difference.</p>

            {/* Quick amount chips */}
            <div className="grid grid-cols-4 gap-2 mb-5">
              {QUICK_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAmount(String(amt))}
                  className={`py-2 rounded-xl text-sm font-semibold border transition-all
                    ${String(amount) === String(amt)
                      ? "bg-rose-600 text-white border-rose-600 shadow-md"
                      : "bg-white text-slate-600 border-slate-200 hover:border-rose-300 hover:text-rose-600"
                    }`}
                >
                  ₹{amt >= 1000 ? `${amt / 1000}K` : amt}
                </button>
              ))}
            </div>

            {/* Custom amount input */}
            <div className="relative mb-5">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">₹</span>
              <input
                type="number"
                placeholder="Enter custom amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-3 border border-slate-200 rounded-xl text-slate-700 text-sm focus:ring-2 focus:ring-rose-300 focus:border-rose-300 focus:outline-none transition-all"
              />
            </div>

            {/* Donate CTA */}
            <button
              onClick={handlePayment}
              disabled={paymentStatus === "loading"}
              className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white text-sm shadow-lg transition-all bg-gradient-to-r ${grad}
                hover:opacity-90 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100`}
            >
              {paymentStatus === "loading" ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Processing…
                </>
              ) : (
                <>
                  <Heart size={16} className="fill-white" />
                  Proceed to Donate
                </>
              )}
            </button>

            {/* Trust badges */}
            <div className="mt-5 flex items-center justify-center gap-1.5 text-xs text-slate-400">
              <CheckCircle size={13} className="text-emerald-500" />
              Secure payment via Razorpay
            </div>
          </div>
        </div>
      </div>

      {/* Simulated Payment Modal */}
      <AnimatePresence>
        {showSimulatedModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 text-center"
            >
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                💳
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Simulated Checkout</h3>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                Razorpay credentials are not configured on the server. Do you want to approve this simulated donation of <strong>₹{showSimulatedModal.amount?.toLocaleString()}</strong> to <strong>{showSimulatedModal.title}</strong>?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowSimulatedModal(null)}
                  className="flex-1 py-3 border border-slate-200 rounded-xl text-slate-500 font-semibold text-sm hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    const modalData = showSimulatedModal;
                    setShowSimulatedModal(null);
                    setPaymentStatus("loading");
                    try {
                      const token = localStorage.getItem("token");
                      const resVerify = await fetch(`${baseUrl}/donations/verify-payment`, {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify({
                          order_id: modalData.orderId,
                          payment_id: "simulated_pay_" + Date.now(),
                          signature: "simulated_signature",
                          projectId: modalData.projectId,
                          amount: modalData.amount,
                          message: `Simulated donation of ₹${modalData.amount}`
                        })
                      });
                      if (resVerify.ok) {
                        // Refetch
                        const refetch = await fetch(`${baseUrl}/donations/${id}`);
                        const updated = await refetch.json();
                        setCause(updated);
                        setAmount("");
                        setShowSuccessModal(true);
                      } else {
                        alert("Simulation payment verification failed.");
                      }
                    } catch (e) {
                      console.error(e);
                    } finally {
                      setPaymentStatus(null);
                    }
                  }}
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm rounded-xl transition shadow-md"
                >
                  Pay Simulated
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Checkout Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 text-center"
            >
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                🎉
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Thank you!</h3>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                Your donation was successfully processed. Thank you so much for your support and for giving back to the community!
              </p>

              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition shadow-md"
              >
                Done
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
