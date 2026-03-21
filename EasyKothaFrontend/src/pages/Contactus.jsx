import { FaEnvelope, FaMapMarkerAlt, FaPhoneAlt, FaRegClock } from "react-icons/fa";
import Footer from "../components/Footer";
import Topbar from "../components/Topbar";

export default function Contactus() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50">
      <Topbar />

      <section className="relative overflow-hidden bg-linear-to-br from-green-900 via-green-800 to-emerald-700">
        <div className="mx-auto grid w-11/12 max-w-6xl gap-8 py-12 md:grid-cols-5 md:py-16">
          <div className="md:col-span-3">
            <p className="inline-flex w-fit rounded-full border border-white/30 bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur">
              Get In Touch
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight text-white md:text-5xl">
              Contact EasyKotha
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-green-50 md:text-base">
              Questions, partnership ideas, or listing support. Our team is here to
              help you find the fastest way forward.
            </p>
          </div>

          <div className="hidden rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur md:col-span-2 md:block">
            <p className="text-sm font-semibold uppercase tracking-wider text-green-100">Response Promise</p>
            <p className="mt-3 text-3xl font-bold text-white">Within 1 Business Day</p>
            <p className="mt-2 text-sm text-green-50">Urgent listing and booking issues are prioritized immediately.</p>
          </div>
        </div>
      </section>

      <main className="mx-auto -mt-6 w-11/12 max-w-6xl pb-14 md:-mt-8">
        <div className="grid gap-6 lg:grid-cols-5">
          <section className="rounded-2xl mt-20 border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:col-span-3">
            <h2 className="text-2xl font-semibold text-slate-900">Send Us A Message</h2>
            <p className="mt-2 text-sm text-slate-600">
              Fill in the form and we will reach out within one business day.
            </p>

            <form className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Full Name</span>
                <input
                  type="text"
                  placeholder="Your name"
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-green-800 focus:bg-white focus:ring-2 focus:ring-green-800/20"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email Address</span>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-green-800 focus:bg-white focus:ring-2 focus:ring-green-800/20"
                />
              </label>

              <label className="flex flex-col gap-2 sm:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Subject</span>
                <input
                  type="text"
                  placeholder="How can we help?"
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-green-800 focus:bg-white focus:ring-2 focus:ring-green-800/20"
                />
              </label>

              <label className="flex flex-col gap-2 sm:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Message</span>
                <textarea
                  rows={5}
                  placeholder="Tell us what you need..."
                  className="resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-green-800 focus:bg-white focus:ring-2 focus:ring-green-800/20"
                />
              </label>

              <div className="sm:col-span-2">
                <button
                  type="button"
                  className="inline-flex w-full items-center justify-center rounded-xl bg-green-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-900 sm:w-auto"
                >
                  Send Message
                </button>
              </div>
            </form>
          </section>

          <aside className="flex flex-col mt-20 gap-4 lg:col-span-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h3 className="text-lg font-semibold text-slate-900">Contact Details</h3>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="flex items-start gap-3 rounded-xl bg-green-50 p-3">
                  <FaPhoneAlt className="mt-0.5 text-green-800" />
                  <span>+977 9804060401</span>
                </div>
                <div className="flex items-start gap-3 rounded-xl bg-green-50 p-3">
                  <FaEnvelope className="mt-0.5 text-green-800" />
                  <span>support@easykotha.com</span>
                </div>
                <div className="flex items-start gap-3 rounded-xl bg-green-50 p-3">
                  <FaMapMarkerAlt className="mt-0.5 text-green-800" />
                  <span>Itahari, Nepal</span>
                </div>
                <div className="flex items-start gap-3 rounded-xl bg-green-50 p-3">
                  <FaRegClock className="mt-0.5 text-green-800" />
                  <span>Sun - Fri, 9:00 AM - 6:00 PM</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-green-100 bg-linear-to-br from-green-800 to-emerald-700 p-5 text-white shadow-sm sm:p-6">
              <h3 className="text-lg font-semibold">Need Urgent Help?</h3>
              <p className="mt-2 text-sm text-green-50">
                For immediate listing or booking issues, call our support line and
                we will prioritize your request.
              </p>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}