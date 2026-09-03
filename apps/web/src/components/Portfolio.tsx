"use client";

import { motion } from "framer-motion";
import { useState } from "react";

const projects = [
  {
    id: 1,
    title: "E-Commerce Platform",
    category: "Development",
    description: "Full-featured e-commerce solution with payment integration",
    image: "🛍️",
    tags: ["React", "Node.js", "MongoDB"],
    metrics: "+300% Revenue",
  },
  {
    id: 2,
    title: "Brand Identity",
    category: "Branding",
    description: "Complete brand redesign including logo and visual guidelines",
    image: "🎭",
    tags: ["Design", "Branding", "UI/UX"],
    metrics: "120+ Assets",
  },
  {
    id: 3,
    title: "Marketing Automation",
    category: "Automation",
    description: "Automated marketing workflows increasing engagement by 300%",
    image: "🤖",
    tags: ["Automation", "APIs", "Integration"],
    metrics: "+3x Engagement",
  },
  {
    id: 4,
    title: "Content Strategy",
    category: "Marketing",
    description:
      "Strategic content plan resulting in 5x organic traffic growth",
    image: "📱",
    tags: ["Strategy", "Content", "SEO"],
    metrics: "+500% Traffic",
  },
  {
    id: 5,
    title: "Mobile Application",
    category: "Development",
    description: "Native iOS/Android app with 50K+ active users",
    image: "📲",
    tags: ["Mobile", "iOS", "Android"],
    metrics: "50K+ Users",
  },
  {
    id: 6,
    title: "Analytics Dashboard",
    category: "Development",
    description: "Real-time analytics platform for data visualization",
    image: "📊",
    tags: ["Analytics", "Dashboard", "Data"],
    metrics: "Real-time Data",
  },
];

const categories = ["All", "Development", "Branding", "Marketing", "Automation"];

export default function Portfolio() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const filteredProjects = activeCategory === "All"
    ? projects
    : projects.filter((p) => p.category === activeCategory);

  return (
    <section
      id="portfolio"
      className="py-32 px-4 sm:px-6 lg:px-8 bg-slate-950 relative overflow-hidden"
    >
      {/* Background Decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl" />
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
            Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Work</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Our recent projects showcasing exceptional design and results
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {categories.map((category) => (
            <motion.button
              key={category}
              onClick={() => setActiveCategory(category)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-6 py-3 rounded-full font-semibold text-sm uppercase tracking-wider transition-all ${
                activeCategory === category
                  ? "bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/50"
                  : "bg-slate-800/50 text-slate-300 hover:bg-slate-800 border border-slate-700"
              }`}
            >
              {category}
            </motion.button>
          ))}
        </motion.div>

        {/* Projects Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              onMouseEnter={() => setHoveredId(project.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="group cursor-pointer"
            >
              <div className="relative h-80 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 hover:border-amber-500/50 transition-all">
                {/* Background Image Placeholder */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-slate-900 flex items-center justify-center text-7xl">
                  {project.image}
                </div>

                {/* Hover Overlay */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: hoveredId === project.id ? 1 : 0 }}
                  className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent flex flex-col justify-end p-6 z-20"
                >
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{
                      y: hoveredId === project.id ? 0 : 20,
                      opacity: hoveredId === project.id ? 1 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="text-amber-400 text-sm font-bold uppercase tracking-wider mb-2">
                      {project.category}
                    </div>
                    <h3 className="text-white text-xl font-black mb-2">
                      {project.title}
                    </h3>
                    <p className="text-slate-300 text-sm mb-4">
                      {project.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2 flex-wrap">
                        {project.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-amber-500/20 text-amber-300 text-xs rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <span className="text-amber-400 font-bold text-sm">
                        {project.metrics}
                      </span>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Static Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 z-10">
                  <h3 className="text-white text-2xl font-black">
                    {project.title}
                  </h3>
                  <p className="text-slate-300 text-sm mt-2">
                    {project.category}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-bold rounded-xl hover:shadow-lg hover:shadow-amber-500/50 transition-all"
          >
            View All Projects
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
