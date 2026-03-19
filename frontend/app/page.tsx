import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8m-8 5h8m-4 9l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v9a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          </div>
          <span className="text-2xl font-bold tracking-tight">RideMate</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <button className="text-white/80 hover:text-white transition-colors px-4 py-2">
              Log in
            </button>
          </Link>
          <Link href="/register">
            <button className="bg-white text-black font-semibold px-6 py-2.5 rounded-full hover:bg-gray-200 transition-all">
              Sign up
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative">
        {/* Background gradient orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-green-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-1/4 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-8 pt-16 pb-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8 animate-slide-up">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-sm text-white/80">Campus rides made easy</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                Share rides.
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
                  Save money.
                </span>
                <br />
                Connect.
              </h1>
              
              <p className="text-xl text-white/60 max-w-lg leading-relaxed">
                The smartest way to commute around campus. Find rides, share costs, and reduce your carbon footprint with fellow students.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/register">
                  <button className="group bg-white text-black font-semibold px-8 py-4 rounded-full hover:bg-gray-100 transition-all flex items-center justify-center gap-3 w-full sm:w-auto">
                    Get started
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                </Link>
                <Link href="/login">
                  <button className="border border-white/30 text-white font-semibold px-8 py-4 rounded-full hover:bg-white/10 transition-all w-full sm:w-auto">
                    I have an account
                  </button>
                </Link>
              </div>
            </div>
            
            {/* Right Content - Car Illustration */}
            <div className="relative animate-float hidden lg:block">
              <div className="relative w-full aspect-square max-w-lg mx-auto">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/30 to-emerald-600/20 rounded-full blur-3xl"></div>
                
                {/* Car cards */}
                <div className="absolute top-1/4 left-1/4 bg-zinc-900/80 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-2xl transform -rotate-6 hover:rotate-0 transition-transform">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm">Pickup</p>
                      <p className="text-white font-semibold">Main Library</p>
                    </div>
                  </div>
                </div>
                
                <div className="absolute top-1/2 right-8 bg-zinc-900/80 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm">You save</p>
                      <p className="text-emerald-400 font-bold text-xl">₹150/ride</p>
                    </div>
                  </div>
                </div>
                
                <div className="absolute bottom-1/4 left-12 bg-zinc-900/80 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-2xl transform rotate-6 hover:rotate-0 transition-transform">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm">Active riders</p>
                      <p className="text-white font-bold text-xl">2,400+</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="border-t border-white/10 bg-zinc-950/50">
        <div className="container mx-auto px-8 py-20">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group p-8 rounded-3xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-white/5 hover:border-green-500/30 transition-all">
              <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-500/20 transition-colors">
                <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Instant Matching</h3>
              <p className="text-white/50 leading-relaxed">
                Find rides going your way in seconds. Our smart algorithm matches you with the perfect carpool buddy.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="group p-8 rounded-3xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-white/5 hover:border-green-500/30 transition-all">
              <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-500/20 transition-colors">
                <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Verified Students</h3>
              <p className="text-white/50 leading-relaxed">
                Ride only with verified college students. Your safety is our top priority with ID verification.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="group p-8 rounded-3xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-white/5 hover:border-green-500/30 transition-all">
              <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-500/20 transition-colors">
                <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Eco Friendly</h3>
              <p className="text-white/50 leading-relaxed">
                Reduce your carbon footprint while saving money. Track your environmental impact with every ride.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="container mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8m-8 5h8m-4 9l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v9a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <span className="font-semibold">RideMate</span>
          </div>
          <p className="text-white/40 text-sm">
            © 2026 RideMate. Made for students, by students.
          </p>
        </div>
      </footer>
    </div>
  );
}
