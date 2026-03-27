import Footer from "../components/Footer";
import Topbar from "../components/Topbar";
import { useTranslation } from "react-i18next";

export default function Aboutus() {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen overflow-x-hidden bg-slate-50">
            <Topbar />

            <section className="relative overflow-hidden bg-linear-to-r from-green-900 via-green-800 to-emerald-600 px-4 py-16 sm:px-8 lg:py-20">
                <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-5">
                    <div className="max-w-3xl lg:col-span-3">
                        <p className="mb-3 inline-flex rounded-full border border-white/30 bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur">
                            {t("about.badge")}
                        </p>
                        <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl">
                            {t("about.title")}
                        </h1>
                        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-green-50 sm:text-base">
                            {t("about.subtitle")}
                        </p>
                    </div>

                    <div className="hidden self-end rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur lg:col-span-2 lg:block">
                        <p className="text-xs font-semibold uppercase tracking-wider text-green-100">{t("about.trustKicker")}</p>
                        <h3 className="mt-2 text-2xl font-bold text-white">{t("about.trustTitle")}</h3>
                        <p className="mt-2 text-sm text-green-50">
                            {t("about.trustDesc")}
                        </p>
                    </div>
                </div>
            </section>

            <main className="mx-auto mt-10 grid w-11/12 max-w-6xl gap-6 pb-14  lg:grid-cols-3">
                <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
                    <h2 className="text-2xl font-semibold text-black">{t("about.whoTitle")}</h2>
                    <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                        {t("about.para1")}
                    </p>
                    <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                        {t("about.para2")}
                    </p>
                    <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                        {t("about.para3")}
                    </p>
                </article>

                <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-black">{t("about.promiseTitle")}</h3>
                    <ul className="mt-4 space-y-3 text-sm text-slate-600">
                        <li className="rounded-lg border border-green-100 bg-green-50 px-3 py-2">{t("about.promise1")}</li>
                        <li className="rounded-lg border border-green-100 bg-green-50 px-3 py-2">{t("about.promise2")}</li>
                        <li className="rounded-lg border border-green-100 bg-green-50 px-3 py-2">{t("about.promise3")}</li>
                        <li className="rounded-lg border border-green-100 bg-green-50 px-3 py-2">{t("about.promise4")}</li>
                    </ul>
                </aside>
            </main>

            <section className="mx-auto mb-14 grid w-11/12 max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm">
                    <p className="text-3xl font-bold text-green-800">10k+</p>
                    <p className="mt-1 text-sm text-slate-600">{t("about.stats.activeUsers")}</p>
                </div>
                <div className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm">
                    <p className="text-3xl font-bold text-green-800">3k+</p>
                    <p className="mt-1 text-sm text-slate-600">{t("about.stats.verifiedListings")}</p>
                </div>
                <div className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm">
                    <p className="text-3xl font-bold text-green-800">24/7</p>
                    <p className="mt-1 text-sm text-slate-600">{t("about.stats.support")}</p>
                </div>
                <div className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm">
                    <p className="text-3xl font-bold text-green-800">99%</p>
                    <p className="mt-1 text-sm text-slate-600">{t("about.stats.trust")}</p>
                </div>
            </section>

            <Footer />
        </div>
    );
}