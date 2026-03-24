import Footer from "../components/Footer";
import Topbar from "../components/Topbar";

export default function Aboutus() {
    return (
        <div className="min-h-screen overflow-x-hidden bg-slate-50">
            <Topbar />

            <section className="relative overflow-hidden bg-linear-to-r from-green-900 via-green-800 to-emerald-600 px-4 py-16 sm:px-8 lg:py-20">
                <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-5">
                    <div className="max-w-3xl lg:col-span-3">
                        <p className="mb-3 inline-flex rounded-full border border-white/30 bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur">
                            About EasyKotha
                        </p>
                        <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl">
                            Finding a home should feel simple, safe, and human.
                        </h1>
                        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-green-50 sm:text-base">
                            EasyKotha helps tenants and landlords connect faster with trust,
                            clarity, and better tools for real-world rental decisions.
                        </p>
                    </div>

                    <div className="hidden self-end rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur lg:col-span-2 lg:block">
                        <p className="text-xs font-semibold uppercase tracking-wider text-green-100">Built Around Trust</p>
                        <h3 className="mt-2 text-2xl font-bold text-white">Reliable Listings. Better Decisions.</h3>
                        <p className="mt-2 text-sm text-green-50">
                            Every feature is designed to make renting transparent and straightforward.
                        </p>
                    </div>
                </div>
            </section>

            <main className="mx-auto mt-10 grid w-11/12 max-w-6xl gap-6 pb-14  lg:grid-cols-3">
                <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
                    <h2 className="text-2xl font-semibold text-black">Who We Are</h2>
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
                    <h3 className="text-lg font-semibold text-black">What We Promise</h3>
                    <ul className="mt-4 space-y-3 text-sm text-slate-600">
                        <li className="rounded-lg border border-green-100 bg-green-50 px-3 py-2">Verified and relevant listings</li>
                        <li className="rounded-lg border border-green-100 bg-green-50 px-3 py-2">Fast tenant-landlord connection</li>
                        <li className="rounded-lg border border-green-100 bg-green-50 px-3 py-2">Clear pricing and details</li>
                        <li className="rounded-lg border border-green-100 bg-green-50 px-3 py-2">Helpful support when needed</li>
                    </ul>
                </aside>
            </main>

            <section className="mx-auto mb-14 grid w-11/12 max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm">
                    <p className="text-3xl font-bold text-green-800">10k+</p>
                    <p className="mt-1 text-sm text-slate-600">Active monthly users</p>
                </div>
                <div className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm">
                    <p className="text-3xl font-bold text-green-800">3k+</p>
                    <p className="mt-1 text-sm text-slate-600">Verified listings</p>
                </div>
                <div className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm">
                    <p className="text-3xl font-bold text-green-800">24/7</p>
                    <p className="mt-1 text-sm text-slate-600">Support assistance</p>
                </div>
                <div className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm">
                    <p className="text-3xl font-bold text-green-800">99%</p>
                    <p className="mt-1 text-sm text-slate-600">User trust score</p>
                </div>
            </section>

            <Footer />
        </div>
    );
}