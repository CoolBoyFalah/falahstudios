"use client";

import { motion } from "framer-motion";
import { useState } from "react";

const services = [
  {
    id: 1,
    title: "Web Development",
    icon: "🌐",
    color: "from-blue-500/20 to-cyan-500/20",
    description:
      "Custom websites and applications built with cutting-edge technology and best practices.",
    features: ["Responsive Design", "Performance Optimized", "SEO Ready", "Scalable Architecture"],
  },
  {
    id: 2,
    title: "Branding & Design",
    icon: "🎨",
    color: "from-purple-500/20 to-pink-500/20",
    description:
      "Creative branding solutions that make your business stand out from the competition.",
    features: ["Logo Design", "Brand Guidelines", "Visual Identity", "UI/UX Design"],
  },
  {
    id: 3,
    title: "Digital Marketing",
    icon: "📈",
    color: "from-orange-500/20 to-red-500/20",
    description:
      "Comprehensive marketing strategies to grow your audience and increase conversions.",
    features: ["SEO Strategy", "Social Media", "Content Marketing", "Analytics"],
  },
  {
    id: 4,
    title: "Automation Systems",
    icon: "⚙️",
    color: "from-green-500/20 to-emerald-500/20",
    description:
      "Smart automation solutions to streamline your business processes and save time.",
    features: ["Process Automation", "API Integration", "Workflow Optimization", "Cost Reduction"],
  },
  {
    id: 5,
    title: "Content Creation",
    icon: "✍️",
    color: "from-yellow-500/20 to-orange-500/20",
    description:
      "Engaging content tailored to your brand voice and designed to resonate with your audience.",
    features: ["Video Production", "Copywriting", "Photography", "Animation"],
  },
  {
    id: 6,
    title: "Growth Strategy",
    icon: "🚀",
    color: "from-indigo-500/20 to-purple-500/20",
    description:
      "Data-driven strategies to scale your business and achieve sustainable growth.",
    features: ["Growth Planning", "A/B Testing", "Performance Analytics", "Optimization"],
  },
];

export default function Services() {
  const [selectedService, setSelectedService] = useState(1);

  const activeService = services.find((s) => s.id === selectedService);

  return (
    <section
      id="services"
      className="py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-950 to-slate-900 relative overflow-hidden"
    >
      {/* Background Decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-black mb-6">
            What We <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Deliver</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Comprehensive digital solutions tailored to elevate your business
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Service List */}
          <motion.div className="lg:col-span-1 space-y-3">
            {services.map((service) => (
              <motion.button
                key={service.id}
                onClick={() => setSelectedService(service.id)}
                whileHover={{ x: 5 }}
                className={`w-full p-4 rounded-lg text-left transition-all duration-300 group ${
                  selectedService === service.id
                    ? "bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/50"
                    : "hover:bg-slate-800/50 border border-slate-700/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{service.icon}</span>
                  <div>
                    <div className={`font-semibold transition-colors ${
                      selectedService === service.id
                        ? "text-amber-400"
                        : "text-slate-300 group-hover:text-white"
                    }`}>
                      {service.title}
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </motion.div>

          {/* Service Details */}
          {activeService && (
            <motion.div
              key={activeService.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="lg:col-span-2"
            >
              <div className={`bg-gradient-to-br ${activeService.color} border border-amber-500/20 rounded-2xl p-8 backdrop-blur-sm`}>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="text-6xl mb-6"
                >
                  {activeService.icon}
                </motion.div>

                <h3 className="text-3xl font-black mb-4 text-white">
                  {activeService.title}
                </h3>

                <p className="text-slate-300 mb-8 text-lg leading-relaxed">
                  {activeService.description}
                </p>

                <div className="mb-8">
                  <p className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-4">
                    Key Features
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {activeService.features.map((feature, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-2"
                      >
                        <div className="w-1.5 h-1.5 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full" />
                        <span className="text-slate-300">{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-bold rounded-lg hover:shadow-lg hover:shadow-amber-500/50 transition-all"
                >
                  Learn More
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
