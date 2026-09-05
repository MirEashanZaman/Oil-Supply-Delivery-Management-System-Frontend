import Link from "next/link";
import MyNavigation from "@/components/navigation";
import MyHeader from "@/components/header";

export default function AboutUs() {
    return (
        <div className="w-full flex flex-col items-center">
            <MyHeader name="About Us" message="Global logistics infrastructure and certified fuel supply network" />
            <MyNavigation />

            <div className="w-full max-w-5xl mt-8 space-y-8">
                {/* Hero Card */}
                <div className="card bg-base-100 shadow-xl border border-base-300 overflow-hidden">
                    <div className="card-body p-8 lg:p-10">
                        <div className="max-w-2xl">
                            <span className="badge badge-primary badge-outline text-xs font-bold uppercase tracking-wider mb-3">
                                Energy Distribution Network
                            </span>
                            <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                                Powering Industrial & Commercial Energy Delivery Across Regions
                            </h1>
                            <p className="mt-4 text-slate-600 leading-relaxed text-sm lg:text-base">
                                PetroFlow Supply & Logistics operates a dependable digital exchange and physical pipeline network connecting certified oil refineries, commercial fleet distributors, and enterprise buyers. Our mission is to eliminate delivery bottlenecks through end-to-end transparency, ISO-certified handling standards, and automated inventory tracking.
                            </p>
                            <div className="mt-6 flex flex-wrap gap-3">
                                <Link href="/contact" className="btn btn-primary text-white font-semibold">
                                    Contact Fleet Operations
                                </Link>
                                <Link href="/dashboard" className="btn btn-outline border-slate-300">
                                    Browse Inventory
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="stats stats-vertical lg:stats-horizontal shadow-lg bg-base-100 border border-base-300 w-full">
                    <div className="stat p-6">
                        <div className="stat-figure text-primary">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <div className="stat-title text-xs font-semibold uppercase text-slate-500">Annual Throughput</div>
                        <div className="stat-value text-primary text-3xl font-black">14.8M</div>
                        <div className="stat-desc text-xs text-slate-500">Barrels delivered worldwide</div>
                    </div>

                    <div className="stat p-6">
                        <div className="stat-figure text-secondary">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="stat-title text-xs font-semibold uppercase text-slate-500">Punctuality Rate</div>
                        <div className="stat-value text-secondary text-3xl font-black">99.4%</div>
                        <div className="stat-desc text-xs text-slate-500">Scheduled on-time delivery</div>
                    </div>

                    <div className="stat p-6">
                        <div className="stat-figure text-accent">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <div className="stat-title text-xs font-semibold uppercase text-slate-500">Verified Terminals</div>
                        <div className="stat-value text-accent text-3xl font-black">120+</div>
                        <div className="stat-desc text-xs text-slate-500">Storage and depot hubs</div>
                    </div>

                    <div className="stat p-6">
                        <div className="stat-figure text-slate-400">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <div className="stat-title text-xs font-semibold uppercase text-slate-500">Network Partners</div>
                        <div className="stat-value text-slate-800 text-3xl font-black">480+</div>
                        <div className="stat-desc text-xs text-slate-500">Dealers and bulk consumers</div>
                    </div>
                </div>

                {/* Values & Operational Capabilities Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="card bg-base-100 shadow-md border border-base-300">
                        <div className="card-body p-6">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold mb-3">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <h2 className="card-title text-base font-bold text-slate-900">Safety & Compliance</h2>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                Every consignment adheres strictly to international hazardous material transit guidelines, OSHA standards, and environmental protection safety protocols.
                            </p>
                        </div>
                    </div>

                    <div className="card bg-base-100 shadow-md border border-base-300">
                        <div className="card-body p-6">
                            <div className="w-10 h-10 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center font-bold mb-3">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h2 className="card-title text-base font-bold text-slate-900">Live Logistics Tracking</h2>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                Continuous satellite telemetry monitoring tanker route telemetry, temperature thresholds, discharge volumes, and secure chain-of-custody handoffs.
                            </p>
                        </div>
                    </div>

                    <div className="card bg-base-100 shadow-md border border-base-300">
                        <div className="card-body p-6">
                            <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center font-bold mb-3">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                                </svg>
                            </div>
                            <h2 className="card-title text-base font-bold text-slate-900">Transparent Pricing</h2>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                Direct refinery spot-index integration ensures accurate real-time market quotes with zero hidden middleman markups for registered buyers.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}