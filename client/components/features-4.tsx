'use client'

import { motion } from 'framer-motion'
import { BookOpen, Clock, FileText, GraduationCap, PenTool, Sparkles } from 'lucide-react'

export default function Features() {
    return (
        <section className="py-12 md:py-20" id="features">
            <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
                <div className="relative z-10 mx-auto max-w-xl space-y-6 text-center md:space-y-12">
                    <h2 className="text-balance text-4xl font-medium lg:text-5xl">How Luna helps students excel</h2>
                    <p>Luna is your AI-powered assignment web app that helps students create high-quality academic assignments in a few minutes.</p>
                </div>

                <div className="relative mx-auto grid max-w-4xl divide-x divide-y border *:p-12 sm:grid-cols-2 lg:grid-cols-3">
                    <motion.div 
                        className="space-y-3 cursor-pointer"
                        whileHover={{ 
                            scale: 1.05,
                            backgroundColor: "rgba(59, 130, 246, 0.05)",
                            transition: { duration: 0.2 }
                        }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div className="flex items-center gap-2">
                            <Clock className="size-4" />
                            <h3 className="text-sm font-medium">Fast & Efficient</h3>
                        </div>
                        <p className="text-sm">Generate well-structured assignments in minutes, not hours. Save time for what matters most.</p>
                    </motion.div>
                    <motion.div 
                        className="space-y-2 cursor-pointer"
                        whileHover={{ 
                            scale: 1.05,
                            backgroundColor: "rgba(59, 130, 246, 0.05)",
                            transition: { duration: 0.2 }
                        }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div className="flex items-center gap-2">
                            <GraduationCap className="size-4" />
                            <h3 className="text-sm font-medium">Academic Excellence</h3>
                        </div>
                        <p className="text-sm">Maintain high academic standards with proper citations, formatting, and research-backed content.</p>
                    </motion.div>
                    <motion.div 
                        className="space-y-2 cursor-pointer"
                        whileHover={{ 
                            scale: 1.05,
                            backgroundColor: "rgba(59, 130, 246, 0.05)",
                            transition: { duration: 0.2 }
                        }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div className="flex items-center gap-2">
                            <FileText className="size-4" />
                            <h3 className="text-sm font-medium">Multiple Formats</h3>
                        </div>
                        <p className="text-sm">Support for essays, research papers, reports, and more with proper academic formatting.</p>
                    </motion.div>
                    <motion.div 
                        className="space-y-2 cursor-pointer"
                        whileHover={{ 
                            scale: 1.05,
                            backgroundColor: "rgba(59, 130, 246, 0.05)",
                            transition: { duration: 0.2 }
                        }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div className="flex items-center gap-2">
                            <PenTool className="size-4" />
                            <h3 className="text-sm font-medium">Smart Writing</h3>
                        </div>
                        <p className="text-sm">AI-powered writing assistance that adapts to your academic level and subject requirements.</p>
                    </motion.div>
                    <motion.div 
                        className="space-y-2 cursor-pointer"
                        whileHover={{ 
                            scale: 1.05,
                            backgroundColor: "rgba(59, 130, 246, 0.05)",
                            transition: { duration: 0.2 }
                        }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div className="flex items-center gap-2">
                            <BookOpen className="size-4" />
                            <h3 className="text-sm font-medium">Research Integration</h3>
                        </div>
                        <p className="text-sm">Seamlessly integrate credible sources and references to strengthen your arguments.</p>
                    </motion.div>
                    <motion.div 
                        className="space-y-2 cursor-pointer"
                        whileHover={{ 
                            scale: 1.05,
                            backgroundColor: "rgba(59, 130, 246, 0.05)",
                            transition: { duration: 0.2 }
                        }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div className="flex items-center gap-2">
                            <Sparkles className="size-4" />
                            <h3 className="text-sm font-medium">AI-Powered</h3>
                        </div>
                        <p className="text-sm">Advanced AI technology that understands academic requirements and delivers quality results.</p>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
