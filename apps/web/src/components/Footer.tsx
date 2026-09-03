"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  return (
    <footer className="bg-gradient-to-b from-slate-950 to-black border-t border-amber-500/20 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10"
      >
        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Section */}
          <motion.div variants={itemVariants}>
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
                <span className="text-slate-950 font-black">◆</span>
              </div>
              <span className="font-black text-lg tracking-widest">
                Falah <br /> Studios
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed">
              Transforming ambitious visions into exceptional digital realities
              through strategy, design, and technology.
            </p>
          </motion.div>

          {/* Services */}
          <motion.div variants={itemVariants}>
            <h3 className="text-white font-black mb-6 uppercase tracking-wider text-sm">
              Services
            </h3>
            <ul className="space-y-3">
              {[
                "Web Development",
                "Branding & Design",
                "Digital Marketing",
                "Automation",
              ].map((service) => (
                <li key={service}>
                  <Link
                    href="#"
                    className="text-slate-400 hover:text-amber-400 transition text-sm"
                  >
                    {service}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Company */}
          <motion.div variants={itemVariants}>
            <h3 className="text-white font-black mb-6 uppercase tracking-wider text-sm">
              Company
            </h3>
            <ul className="space-y-3">
              {[
                { label: "About Us", href: "#" },
                { label: "Blog", href: "#blog" },
                { label: "Careers", href: "#" },
                { label: "Contact", href: "#contact" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-slate-400 hover:text-amber-400 transition text-sm"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Connect */}
          <motion.div variants={itemVariants}>
            <h3 className="text-white font-black mb-6 uppercase tracking-wider text-sm">
              Connect With Us
            </h3>
            <div className="space-y-3 mb-6">
              <p className="text-slate-400 text-sm">
                <span className="text-amber-400">Email:</span>{" "}
                <a
                  href="mailto:hello@falahstudios.com"
                  className="hover:text-amber-400 transition"
                >
                  hello@falahstudios.com
                </a>
              </p>
              <p className="text-slate-400 text-sm">
                <span className="text-amber-400">Phone:</span>{" "}
                <a href="tel:+971123456789" className="hover:text-amber-400 transition">
                  +971 123 456 789
                </a>
              </p>
            </div>
            <div className="flex gap-4">
              {[
                { icon: "f", label: "Facebook" },
                { icon: "in", label: "LinkedIn" },
                { icon: "tw", label: "Twitter" },
                { icon: "ig", label: "Instagram" },
              ].map((social) => (
                <motion.a
                  key={social.label}
                  href="#"
                  whileHover={{ scale: 1.2, color: "#fbbf24" }}
                  className="w-10 h-10 rounded-lg border border-amber-500/30 flex items-center justify-center text-slate-400 hover:border-amber-500 transition"
                  title={social.label}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-800 mb-8" />

        {/* Bottom Section */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col md:flex-row justify-between items-center gap-6"
        >
          <p className="text-slate-400 text-sm">
            © {currentYear} Falah Studios. All rights reserved.
          </p>
          <div className="flex gap-8">
            <Link
              href="#"
              className="text-slate-400 hover:text-amber-400 transition text-sm"
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              className="text-slate-400 hover:text-amber-400 transition text-sm"
            >
              Terms of Service
            </Link>
            <Link
              href="#"
              className="text-slate-400 hover:text-amber-400 transition text-sm"
            >
              Sitemap
            </Link>
          </div>
        </motion.div>

        {/* Bottom Accent */}
        <motion.div
          animate={{
            width: ["0%", "100%", "0%"],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
          }}
          className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-amber-400 to-amber-600"
        />
      </motion.div>
    </footer>
  );
}
