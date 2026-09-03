"use client";

import { motion } from "framer-motion";
import { useState } from "react";

const testimonials = [
  {
    name: "Ahmed Al Mansouri",
    role: "CEO",
    company: "Tech Ventures UAE",
    content:
      "Falah Studios transformed our digital presence. Their attention to detail and technical expertise is unmatched. They delivered beyond expectations.",
    image: "👨‍💼",
    rating: 5,
  },
  {
    name: "Fatima Al Kaabi",
    role: "Marketing Director",
    company: "Luxury Brand Co.",
    content:
      "The team delivered beyond expectations. Our conversion rate increased by 250% within 3 months. Exceptional work!",
    image: "👩‍💼",
    rating: 5,
  },
  {
    name: "Mohammed Al Zarouni",
    role: "Founder",
    company: "Digital Solutions LLC",
    content:
      "Professional, reliable, and innovative. Falah Studios is our go-to partner for all digital needs. Highly recommended!",
    image: "👨‍💻",
    rating: 5,
  },
  {
    name: "Layla Al Mansouri",
    role: "CEO",
    company: "Creative Agency",
    content:
      "Outstanding collaboration. Their strategic approach and creative solutions elevated our brand significantly.",
    image: "👩‍🎨",
    rating: 5,
  },
];

export default function Testimonials() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      zIndex: 0,
      x: dir < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrent((prev) => (prev + newDirection + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-900 to-slate-950 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-amber-600/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-black mb-6">
            Client <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Success Stories</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Real results from real clients who trusted us with their vision
          </p>
        </motion.div>

        {/* Testimonial Carousel */}
        <div className="relative h-96 flex items-center justify-center mb-8">
          <motion.div
            key={current}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.5 },
            }}
            className="absolute w-full max-w-2xl"
          >
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-8 md:p-12">
              <div className="flex flex-col items-center text-center">
                {/* Avatar */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-6xl mb-6"
                >
                  {testimonials[current].image}
                </motion.div>

                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonials[current].rating)].map((_, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="text-amber-400 text-xl"
                    >
                      ★
                    </motion.span>
                  ))}
                </div>

                {/* Content */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-slate-300 text-lg mb-8 italic leading-relaxed"
                >
                  "{testimonials[current].content}"
                </motion.p>

                {/* Name & Title */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-center"
                >
                  <h4 className="font-black text-white text-lg">
                    {testimonials[current].name}
                  </h4>
                  <p className="text-amber-400 text-sm font-semibold">
                    {testimonials[current].role}
                  </p>
                  <p className="text-slate-400 text-sm">
                    {testimonials[current].company}
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-6">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => paginate(-1)}
            className="p-3 rounded-full border border-amber-500/50 hover:bg-amber-500/10 transition-all"
          >
            <span className="text-amber-400 text-xl">←</span>
          </motion.button>

          {/* Dots */}
          <div className="flex gap-3">
            {testimonials.map((_, i) => (
              <motion.button
                key={i}
                onClick={() => {
                  setDirection(i > current ? 1 : -1);
                  setCurrent(i);
                }}
                className={`h-2 rounded-full transition-all ${
                  i === current
                    ? "w-8 bg-gradient-to-r from-amber-400 to-amber-600"
                    : "w-2 bg-slate-600 hover:bg-slate-500"
                }`}
                whileHover={{ scale: 1.2 }}
              />
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => paginate(1)}
            className="p-3 rounded-full border border-amber-500/50 hover:bg-amber-500/10 transition-all"
          >
            <span className="text-amber-400 text-xl">→</span>
          </motion.button>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="grid grid-cols-3 gap-8 mt-20 pt-20 border-t border-amber-500/20"
        >
          {[
            { number: "98%", label: "Client Satisfaction" },
            { number: "4.9/5", label: "Average Rating" },
            { number: "100+", label: "Happy Clients" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl font-black text-amber-400 mb-2">
                {stat.number}
              </div>
              <div className="text-sm text-slate-400 uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
