import Topbar from "../components/Topbar";
import Footer from "../components/Footer";
import { FaPhoneAlt, FaEnvelope, FaArrowRight } from "react-icons/fa";
import { useState } from "react";

export default function ContactUs() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("General Inquiry");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const sendEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");

    let dataSend = {
      fullName,
      email,
      subject,
      message,
    };

    try {
      const response = await fetch(`${BASE_URL}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataSend),
      });

      if (!response.ok) {
        throw new Error("Failed to send message. Please try again later.");
      }

      const result = await response.json();
      console.log("Email sent successfully:", result);
      setStatus("Message sent successfully!");
      setFullName("");
      setEmail("");
      setSubject("General Inquiry");
      setMessage("");
    } catch (error) {
      console.error("Error sending email:", error);
      setStatus("Failed to send message. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Topbar />
      <div className="bg-gray-100">
        <div className="justify-center">
          <br />
          <br />
          <h1 className="text-center text-4xl">
            Namaste! <span className="text-[#19545c]">How can we help?</span>
          </h1>
          <p className="text-center ">
            Whether you are looking for cozy rooms or need assistance with your
            listing, we're here for you.
          </p>
        </div>

        {/* toaster */}
        {status === 'success' && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                    Message sent successfully!
                </div>
            )}
            
            {status === 'error' && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    Failed to send message. Please try again.
                </div>
            )}

        {/* contact section */}
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT: CONTACT FORM */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow p-8">
              <h3 className="text-3xl text-green-700 font-bold mb-6 flex items-center gap-2">
                Send us a message
              </h3>

              <form className="space-y-5" onSubmit={sendEmail}>
                {/* Name & Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Full Name</label>
                    <input
                      type="text"
                      placeholder="Ujjwal Timsina"
                      className="w-full mt-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none"
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-600">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="ujjwal@gmail.com"
                      className="w-full mt-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none"
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="text-sm text-gray-600">Subject</label>
                  <input type="text"
                  placeholder="ujjwal@gmail.com"
                  className="w-full mt-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none"
                  onChange={(e) => setSubject(e.target.value)} />
                </div>

                {/* Message */}
                <div>
                  <label className="text-sm text-gray-600">Message</label>
                  <textarea
                    rows="4"
                    placeholder="Tell us how we can help..."
                    className="w-full mt-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    We typically reply within 24 hours
                  </p>
                  <button 
                  type="submit"
                  className="bg-[#19545c] text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                  disabled={loading}
                  >
                    {loading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Sending...
                        </>
                    ) : (
                        'Submit'
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* RIGHT: SUPPORT INFO */}
            <div className="space-y-6">
              {/* Quick Support */}
              <div className="bg-blue-50 rounded-2xl p-6">
                <h4 className="font-semibold mb-4">Quick Support</h4>

                <div className="space-y-3 text-sm">
                  <p className="flex items-center gap-2 text-sm">
                    <FaPhoneAlt className="text-[#19545c]" />
                    <span>+977-9804060401</span>
                  </p>

                  <p className="flex items-center gap-2 text-sm">
                    <FaEnvelope className="text-[#19545c]" />
                    <span>support@easykotha.com</span>
                  </p>
                </div>
              </div>

              {/* Office Map */}
              <div className="bg-white rounded-2xl shadow overflow-hidden">
                <img
                  src="https://imgs.search.brave.com/ze4G9XolbChWJjIwSpDNaU624HhLigRyqZ48tHsCk2Y/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZi5i/c3RhdGljLmNvbS94/ZGF0YS9pbWFnZXMv/aG90ZWwvc3F1YXJl/NjAwLzU1NDc3MjAz/OS53ZWJwP2s9ZDRl/NDU4OGNjZjM2MWZl/YTUzY2ZhMzYwODY1/YTczNzg3NzZkN2Ey/MGIyYTU0ZmI5MDM4/ODk5ZjA1ZmZmNGQ3/OCZvPQ"
                  alt="Office Location"
                  className="w-full h-40 object-cover"
                />
                <div className="p-4 text-sm">
                  <h4 className="font-semibold mb-1">Our Office</h4>
                  <p className="text-gray-600">
                    Lazimpat Road, Kathmandu
                    <br />
                    Bagmati Province, Nepal
                  </p>
                  <a
                    href="#"
                    className="text-green-600 font-medium mt-2 flex items-center gap-1"
                  >
                    Get Directions <FaArrowRight size={12} />
                  </a>
                </div>
              </div>

              {/* Common Questions */}
              <div className="bg-white rounded-2xl shadow p-6">
                <h4 className="font-semibold mb-4">Common Questions</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>How to verify my ID?</li>
                  <li>Is listing a room free?</li>
                  <li>How to avoid scams?</li>
                </ul>

                <a
                  href="#"
                  className="text-green-600 font-medium mt-4 flex items-center gap-1"
                >
                  Visit Help Center <FaArrowRight size={12} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
