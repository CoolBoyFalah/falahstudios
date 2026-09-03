"use client";

import { motion } from "framer-motion";

export default function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  };

  return (
    <section className="min-h-screen pt-32 px-4 sm:px-6 lg:px-8 flex items-center relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/2 -left-32 w-64 h-64 bg-amber-600/5 rounded-full blur-3xl"
          animate={{
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 25, repeat: Infinity }}
        />
      </div>

      <motion.div
        className="max-w-6xl mx-auto w-full relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Accent Label */}
        <motion.div variants={itemVariants} className="mb-8">
          <motion.span
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/30 bg-amber-500/5"
            whileHover={{ scale: 1.05, borderColor: "rgb(217, 119, 6)" }}
          >
            <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
            <span className="text-sm font-semibold tracking-wider text-amber-400 uppercase">
              Welcome to innovation
            </span>
          </motion.span>
        </motion.div>

        {/* Main Heading */}
        <motion.h1 variants={itemVariants} className="mb-8">
          <span className="block text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-none">
            Build Digital
          </span>
          <span className="block text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-none">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600">
              Experiences
            </span>
          </span>
          <span className="block text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-none">
            That Matter
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={itemVariants}
          className="text-lg md:text-xl text-slate-400 max-w-2xl mb-12 leading-relaxed"
        >
          We transform ambitious visions into exceptional digital realities.
          Strategy, design, and technology united to accelerate your growth.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(217, 119, 6, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-bold text-lg rounded-xl hover:shadow-xl transition-all"
          >
            Start Your Project
          </motion.button>

          <motion.button
            whileHover={{
              scale: 1.05,
              backgroundColor: "rgba(217, 119, 6, 0.1)",
            }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 border-2 border-amber-500 text-amber-400 font-bold text-lg rounded-xl hover:bg-amber-500/10 transition-all"
          >
            Explore Our Work
          </motion.button>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-3 gap-8 mt-20 pt-20 border-t border-amber-500/20"
        >
          {[
            { number: "150+", label: "Projects Delivered" },
            { number: "98%", label: "Client Satisfaction" },
            { number: "8+", label: "Years Experience" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-black text-amber-400 mb-2">
                {stat.number}
              </div>
              <div className="text-sm text-slate-400 uppercase tracking-wider">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
