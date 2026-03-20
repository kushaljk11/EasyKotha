import Footer from "../components/Footer";
import Topbar from "../components/Topbar";

export default function Aboutus() {
    return (
        <div className="min-h-screen bg-slate-50">
            <Topbar />

            <section className="relative overflow-hidden bg-[linear-gradient(120deg,#0f5132_0%,#0f766e_55%,#d9fbe8_100%)] px-4 py-16 sm:px-8 lg:py-20">
                <div className="mx-auto max-w-6xl">
                    <div className="max-w-3xl">
                        <p className="mb-3 inline-flex rounded-full bg-white/15 px-4 py-1 text-xs font-semibold text-white backdrop-blur">
                            About EasyKotha
                        </p>
                        <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
                            Finding a home should feel simple, safe, and human.
                        </h1>
                        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/90 sm:text-base">
                            EasyKotha helps tenants and landlords connect faster with trust,
                            clarity, and better tools for real-world rental decisions.
                        </p>
                    </div>
                </div>
            </section>

            <main className="mx-auto -mt-8 grid w-11/12 max-w-6xl gap-6 pb-14 lg:grid-cols-3">
                <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
                    <h2 className="text-2xl font-semibold text-slate-900">Who We Are</h2>
                    <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                        Welcome to EasyKotha, your trusted platform for finding the perfect
                        rental accommodation. We are dedicated to simplifying the rental
                        process and connecting tenants with landlords in a seamless,
                        efficient way.
                    </p>
                    <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                        We understand how difficult searching for the right room or flat can
                        be. That is why EasyKotha offers a wide range of listings, rich
                        property details, and practical search tools so students,
                        professionals, and families can find a place that fits.
                    </p>
                    <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                        Our team is committed to a smooth and reliable rental experience,
                        backed by responsive support at every step.
                    </p>
                </article>

                <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-900">What We Promise</h3>
                    <ul className="mt-4 space-y-3 text-sm text-slate-600">
                        <li className="rounded-lg bg-green-50 px-3 py-2">Verified and relevant listings</li>
                        <li className="rounded-lg bg-green-50 px-3 py-2">Fast tenant-landlord connection</li>
                        <li className="rounded-lg bg-green-50 px-3 py-2">Clear pricing and details</li>
                        <li className="rounded-lg bg-green-50 px-3 py-2">Helpful support when needed</li>
                    </ul>
                </aside>
            </main>

            <Footer />
        </div>
    );
}