"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Send to API
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: "", email: "", company: "", message: "" });
    }, 3000);
  };

  return (
    <div className="min-h-screen pt-32 px-4 sm:px-6 lg:px-8 pb-20">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-black mb-6">
            Let's Create <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Something Great</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Have a project in mind? We'd love to hear about it. Drop us a message
            and let's start a conversation.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            {[
              {
                icon: "📧",
                label: "Email",
                value: "hello@falahstudios.com",
              },
              {
                icon: "📱",
                label: "Phone",
                value: "+971 123 456 789",
              },
              {
                icon: "📍",
                label: "Location",
                value: "Dubai, UAE",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ x: 5 }}
                className="flex gap-4"
              >
                <div className="text-3xl">{item.icon}</div>
                <div>
                  <h3 className="text-amber-400 font-semibold mb-1">
                    {item.label}
                  </h3>
                  <p className="text-slate-400">{item.value}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Contact Form */}
          <motion.form
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleSubmit}
            className="lg:col-span-2 space-y-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleChange}
                required
                className="px-6 py-4 bg-slate-800/50 border border-slate-700 rounded-lg focus:border-amber-500 focus:outline-none transition text-white placeholder-slate-500"
              />
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={handleChange}
                required
                className="px-6 py-4 bg-slate-800/50 border border-slate-700 rounded-lg focus:border-amber-500 focus:outline-none transition text-white placeholder-slate-500"
              />
            </div>

            <input
              type="text"
              name="company"
              placeholder="Company (Optional)"
              value={formData.company}
              onChange={handleChange}
              className="w-full px-6 py-4 bg-slate-800/50 border border-slate-700 rounded-lg focus:border-amber-500 focus:outline-none transition text-white placeholder-slate-500"
            />

            <textarea
              name="message"
              placeholder="Tell us about your project..."
              rows={6}
              value={formData.message}
              onChange={handleChange}
              required
              className="w-full px-6 py-4 bg-slate-800/50 border border-slate-700 rounded-lg focus:border-amber-500 focus:outline-none transition text-white placeholder-slate-500 resize-none"
            />

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 bg-green-500/10 border border-green-500/50 rounded-lg text-center"
              >
                <p className="text-green-400 font-semibold">
                  ✅ Message sent successfully! We'll get back to you soon.
                </p>
              </motion.div>
            ) : (
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full px-8 py-4 bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-bold rounded-lg hover:shadow-lg hover:shadow-amber-500/50 transition-all"
              >
                Send Message
              </motion.button>
            )}
          </motion.form>
        </div>
      </div>
    </div>
  );
}
