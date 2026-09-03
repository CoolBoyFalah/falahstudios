"use client";

import { motion } from "framer-motion";

export default function CTA() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  };

  return (
    <section id="contact" className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-amber-950/20 to-slate-950 pointer-events-none" />

      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 25, repeat: Infinity }}
        />
      </div>

      <motion.div
        className="max-w-5xl mx-auto text-center relative z-10"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        {/* Accent Line */}
        <motion.div variants={itemVariants} className="mb-8 flex justify-center">
          <div className="w-20 h-1 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full" />
        </motion.div>

        {/* Main Heading */}
        <motion.h2
          variants={itemVariants}
          className="text-5xl md:text-7xl font-black mb-8 leading-tight"
        >
          Ready to Build Something
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600">
            Extraordinary?
          </span>
        </motion.h2>

        {/* Subheading */}
        <motion.p
          variants={itemVariants}
          className="text-lg md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed"
        >
          Let's transform your vision into reality. Our team is ready to collaborate on your next digital project.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-6 justify-center mb-16"
        >
          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow: "0 0 60px rgba(217, 119, 6, 0.4)",
            }}
            whileTap={{ scale: 0.95 }}
            className="px-10 py-5 bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-black text-lg rounded-xl hover:shadow-2xl transition-all"
          >
            Start Your Project
          </motion.button>

          <motion.button
            whileHover={{
              scale: 1.05,
              backgroundColor: "rgba(217, 119, 6, 0.15)",
              borderColor: "rgba(217, 119, 6, 0.8)",
            }}
            whileTap={{ scale: 0.95 }}
            className="px-10 py-5 border-2 border-amber-500/50 text-amber-400 font-black text-lg rounded-xl hover:bg-amber-500/10 transition-all"
          >
            Schedule a Call
          </motion.button>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          variants={itemVariants}
          className="border-t border-amber-500/20 pt-12"
        >
          <p className="text-slate-400 text-sm uppercase tracking-widest mb-8">
            Trusted by leading brands and startups
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              "Fast Turnaround",
              "Expert Team",
              "Dedicated Support",
              "Proven Results",
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl mb-2">
                  {i === 0 ? "⚡" : i === 1 ? "👥" : i === 2 ? "💬" : "🎯"}
                </div>
                <p className="text-slate-300 font-semibold">{item}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
