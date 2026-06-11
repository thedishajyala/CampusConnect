import { Link } from 'react-router-dom';
import { Calendar, Award, Users, CheckCircle, ArrowRight, Zap, Shield, Sparkles, Trophy, Star, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useRankings } from '../hooks/useApi';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const LandingPage = () => {
  const { data: topClubs, isLoading: isRankingsLoading } = useRankings();

  return (
    <div className="bg-secondary-50 dark:bg-secondary-950 min-h-screen overflow-hidden transition-colors duration-300">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-400/20 dark:bg-primary-600/10 blur-[100px] animate-blob" />
        <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-400/20 dark:bg-purple-600/10 blur-[120px] animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] rounded-full bg-accent-400/20 dark:bg-accent-600/10 blur-[150px] animate-blob animation-delay-4000" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTMwLjUgMGwuNS41LjUuNXY1OGwtLjUuNS0uNS41di02MHoiIGZpbGw9InJnYmEoMTMwLCAxMzAsIDEzMCwgMC4wMykiLz48dHJhbnNmb3JtPjxzY2FsZSB4PSIxIiB5PSIxIi8+PC90cmFuc2Zvcm0+PC9zdmc+')] [mask-image:linear-gradient(to_bottom,white,transparent)]" />
      </div>

      <div className="relative z-10">
        {/* Navigation placeholder space */}
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 lg:pt-36 lg:pb-40 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8 inline-flex items-center px-4 py-2 border border-primary-200 dark:border-primary-800/50 bg-primary-50/50 dark:bg-primary-900/20 backdrop-blur-md rounded-full text-primary-700 dark:text-primary-300 text-sm font-medium shadow-sm hover:scale-105 transition-transform cursor-pointer"
          >
            <Sparkles className="w-4 h-4 mr-2 text-primary-500" />
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
            </span>
            CampusConnect 2.0 is live
          </motion.div>

          <motion.h1 
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-secondary-900 dark:text-white max-w-4xl"
          >
            The Operating System for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-purple-600 dark:from-primary-400 dark:to-purple-400">
              Campus Events
            </span>
          </motion.h1>

          <motion.p 
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="mt-6 text-xl text-secondary-600 dark:text-secondary-400 max-w-2xl leading-relaxed"
          >
            Streamline registrations, automate attendance, and issue certificates instantly. The complete toolkit for modern college clubs.
          </motion.p>

          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            <Link to="/signup" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-secondary-900 dark:bg-white text-white dark:text-secondary-900 hover:bg-secondary-800 dark:hover:bg-secondary-100 hover:scale-105 shadow-xl shadow-secondary-900/20 dark:shadow-white/10 group">
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto hover:bg-white dark:hover:bg-secondary-800 shadow-lg">
                View Demo
              </Button>
            </Link>
          </motion.div>

          {/* Hero Image/Mockup Indicator */}
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, type: 'spring' }}
            className="mt-20 w-full max-w-5xl glass-panel p-2 sm:p-4 border-white/40 dark:border-secondary-700/50 shadow-2xl relative group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="bg-secondary-100 dark:bg-secondary-900 rounded-xl overflow-hidden border border-secondary-200 dark:border-secondary-800 shadow-inner aspect-[16/9] flex items-center justify-center relative">
               {/* Simplified Abstract Dashboard Mockup */}
               <div className="absolute top-0 left-0 right-0 h-10 bg-secondary-200/50 dark:bg-secondary-800/50 border-b border-secondary-300 dark:border-secondary-700 flex items-center px-4 space-x-2">
                 <div className="w-3 h-3 rounded-full bg-red-400"></div>
                 <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                 <div className="w-3 h-3 rounded-full bg-green-400"></div>
               </div>
               <div className="w-full h-full pt-10 flex text-secondary-400 dark:text-secondary-600">
                  <div className="w-1/4 h-full border-r border-secondary-200 dark:border-secondary-800 p-4 hidden sm:block">
                     <div className="h-4 w-20 bg-secondary-300 dark:bg-secondary-700 rounded mb-6"></div>
                     <div className="space-y-3">
                        <div className="h-3 w-full bg-secondary-300 dark:bg-secondary-700 rounded"></div>
                        <div className="h-3 w-5/6 bg-secondary-200 dark:bg-secondary-800 rounded"></div>
                        <div className="h-3 w-4/6 bg-secondary-200 dark:bg-secondary-800 rounded"></div>
                     </div>
                  </div>
                  <div className="flex-1 p-6 flex flex-col gap-6">
                     <div className="flex justify-between items-center">
                        <div className="h-6 w-48 bg-secondary-300 dark:bg-secondary-700 rounded"></div>
                        <div className="h-8 w-24 bg-primary-400 rounded-lg"></div>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[1, 2, 3].map(i => (
                           <div key={i} className="h-32 bg-secondary-200 dark:bg-secondary-800 rounded-xl animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}></div>
                        ))}
                     </div>
                     <div className="flex-1 bg-secondary-200 dark:bg-secondary-800 rounded-xl mt-4"></div>
                  </div>
               </div>
               <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/10 dark:bg-black/10 backdrop-blur-[2px]">
                  <div className="bg-white dark:bg-secondary-800 p-4 rounded-2xl shadow-2xl flex items-center gap-4 hover:scale-110 transition-transform cursor-pointer">
                    <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                      <CheckCircle size={24} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-secondary-900 dark:text-white">Attendance Marked</p>
                      <p className="text-xs text-secondary-500">Certificate generated</p>
                    </div>
                  </div>
               </div>
            </div>
          </motion.div>
        </section>

        {/* Top Ranked Clubs Section */}
        <section className="py-24 relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge variant="warning" className="mb-4 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800">
                 <Trophy size={14} className="mr-1 inline" /> AI Power Rankings
              </Badge>
              <h2 className="text-brand-primary text-secondary-900 dark:text-white text-3xl md:text-4xl font-bold mb-4">
                Top Performing <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-amber-500">Clubs of the Month</span>
              </h2>
              <p className="text-secondary-600 dark:text-secondary-400 text-lg">
                Our AI algorithm analyzes engagement, registration volumes, and attendance rates to highlight the most active communities.
              </p>
            </div>

            {isRankingsLoading ? (
               <div className="flex justify-center py-12"><div className="animate-spin h-10 w-10 border-b-2 border-primary-600 rounded-full"></div></div>
            ) : topClubs && topClubs.length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {topClubs.map((club, index) => (
                     <motion.div 
                        key={club._id}
                        variants={fadeInUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className={`relative group rounded-2xl p-8 transition-all duration-300 hover:-translate-y-2 backdrop-blur-md border ${
                           index === 0 ? 'bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-200 dark:border-yellow-700/50 shadow-xl shadow-yellow-500/10' :
                           index === 1 ? 'bg-gradient-to-br from-secondary-50 to-gray-100 dark:from-secondary-800/40 dark:to-secondary-800/20 border-secondary-200 dark:border-secondary-700 shadow-lg' :
                           'bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-700/50 shadow-lg'
                        }`}
                     >
                        {index === 0 && <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-yellow-300 to-amber-500 rounded-full flex items-center justify-center text-white shadow-lg animate-bounce"><Crown size={24} /></div>}
                        
                        <div className="flex items-center gap-4 mb-6">
                           <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl font-black ${
                              index === 0 ? 'bg-yellow-200 text-yellow-700 dark:bg-yellow-700/50 dark:text-yellow-300' :
                              index === 1 ? 'bg-secondary-200 text-secondary-700 dark:bg-secondary-700/50 dark:text-secondary-300' :
                              'bg-orange-200 text-orange-700 dark:bg-orange-700/50 dark:text-orange-300'
                           }`}>#{index + 1}</div>
                           <div>
                              <h3 className="text-2xl font-bold text-secondary-900 dark:text-white">{club.name}</h3>
                              <div className="flex items-center text-sm font-medium text-secondary-500">
                                 <Star size={14} className="mr-1 text-yellow-500 fill-yellow-500" /> AI Score: {club.score.toFixed(1)}
                              </div>
                           </div>
                        </div>

                        <div className="bg-white/60 dark:bg-secondary-900/60 rounded-xl p-5 mb-6 text-sm text-secondary-700 dark:text-secondary-300 italic border border-white/20 dark:border-secondary-700/30">
                           "{club.aiSummary}"
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-center">
                           <div className="bg-white/40 dark:bg-secondary-900/40 rounded-lg py-2 border border-secondary-100 dark:border-secondary-800">
                              <p className="text-secondary-500 text-xs uppercase tracking-wider font-bold mb-1">Events</p>
                              <p className="text-xl font-black text-secondary-900 dark:text-white">{club.metrics.totalEvents}</p>
                           </div>
                           <div className="bg-white/40 dark:bg-secondary-900/40 rounded-lg py-2 border border-secondary-100 dark:border-secondary-800">
                              <p className="text-secondary-500 text-xs uppercase tracking-wider font-bold mb-1">Attendance</p>
                              <p className="text-xl font-black text-secondary-900 dark:text-white">{club.metrics.attendanceRate.toFixed(0)}%</p>
                           </div>
                        </div>
                     </motion.div>
                  ))}
               </div>
            ) : null}
        </section>

        {/* Features Grid */}
        <section className="py-24 bg-white/50 dark:bg-secondary-950/50 backdrop-blur-3xl border-y border-secondary-200/50 dark:border-secondary-800/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-brand-primary text-secondary-900 dark:text-white text-3xl md:text-4xl font-bold mb-4">
                Everything you need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-indigo-500">scale your community</span>
              </h2>
              <p className="text-secondary-600 dark:text-secondary-400 text-lg">
                Say goodbye to chaotic spreadsheets and manual certificate generation.
              </p>
            </div>

            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {[
                { icon: <Zap className="text-yellow-500" />, title: 'Lightning Fast Registration', desc: 'One-click registrations for students. Real-time capacity management for admins.' },
                { icon: <CheckCircle className="text-green-500" />, title: 'Smart Attendance', desc: 'Mark attendance instantly at the venue. Syncs globally across the platform.' },
                { icon: <Award className="text-purple-500" />, title: 'Automated Certificates', desc: 'Beautiful PDF certificates generated on-the-fly for present attendees.' },
                { icon: <Shield className="text-blue-500" />, title: 'Role-Based Access', desc: 'Secure, segregated environments for Club Admins and Students.' },
                { icon: <Calendar className="text-orange-500" />, title: 'Central Calendar', desc: 'A unified view of all upcoming campus events to avoid scheduling conflicts.' },
                { icon: <Users className="text-pink-500" />, title: 'Profile Management', desc: 'Integrated Cloudinary uploads for avatars, keeping everything personalized.' },
              ].map((feature, i) => (
                <motion.div 
                  key={i}
                  variants={fadeInUp}
                  className="glass-panel p-8 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-white dark:bg-secondary-800 shadow-md border border-secondary-100 dark:border-secondary-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-secondary-900 dark:text-white mb-3">{feature.title}</h3>
                  <p className="text-secondary-600 dark:text-secondary-400 leading-relaxed">
                    {feature.desc}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 relative">
          <div className="absolute inset-0 bg-primary-600 dark:bg-primary-900">
             <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xNSkiLz48L3N2Zz4=')]"></div>
          </div>
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
            <h2 className="text-4xl font-extrabold mb-6">Ready to modernize your events?</h2>
            <p className="text-primary-100 text-xl mb-10 max-w-2xl mx-auto">
              Join hundreds of clubs already using CampusConnect to manage their workflow effortlessly.
            </p>
            <Link to="/signup">
              <Button size="lg" className="bg-white text-primary-600 hover:bg-gray-50 hover:scale-105 shadow-2xl">
                Get Started Now
                <Zap className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LandingPage;
