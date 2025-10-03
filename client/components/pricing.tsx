'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import Link from 'next/link'

export default function Pricing() {
    return (
        <section className="py-16 md:py-32" id='pricing'>
            <div className="mx-auto max-w-5xl px-6">
                <div className="mx-auto max-w-2xl space-y-6 text-center">
                    <h1 className="text-center text-4xl font-semibold lg:text-5xl">Choose Your Luna Plan</h1>
                    <p>Luna offers flexible pricing options to support students at every academic level. From basic assignment help to comprehensive academic support.</p>
                </div>

                <div className="mt-8 grid gap-6 md:mt-20 md:grid-cols-5 md:gap-0">
                    <motion.div 
                        className="rounded-(--radius) flex flex-col justify-between space-y-8 border p-6 md:col-span-2 md:my-2 md:rounded-r-none md:border-r-0 lg:p-10 cursor-pointer"
                        whileHover={{ 
                            scale: 1.02,
                            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                            transition: { duration: 0.2 }
                        }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div className="space-y-4">
                            <div>
                                <h2 className="font-medium">Student</h2>
                                <span className="my-3 block text-2xl font-semibold">$0 / mo</span>
                                <p className="text-muted-foreground text-sm">Perfect for getting started</p>
                            </div>

                            <Button
                                asChild
                                variant="outline"
                                className="w-full">
                                <Link href="/sign-up">Get Started Free</Link>
                            </Button>

                            <hr className="border-dashed" />

                            <ul className="list-outside space-y-3 text-sm">
                                {['3 assignments per month', 'Basic essay templates', 'Standard formatting', 'Email support'].map((item, index) => (
                                    <li
                                        key={index}
                                        className="flex items-center gap-2">
                                        <Check className="size-3" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>

                    <motion.div 
                        className="dark:bg-muted rounded-(--radius) border p-6 shadow-lg shadow-gray-950/5 md:col-span-3 lg:p-10 dark:[--color-muted:var(--color-zinc-900)] cursor-pointer"
                        whileHover={{ 
                            scale: 1.02,
                            boxShadow: "0 15px 35px rgba(59, 130, 246, 0.15)",
                            transition: { duration: 0.2 }
                        }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div className="grid gap-6 sm:grid-cols-2">
                            <div className="space-y-4">
                                <div>
                                    <h2 className="font-medium">Academic Pro</h2>
                                    <span className="my-3 block text-2xl font-semibold">$19 / mo</span>
                                    <p className="text-muted-foreground text-sm">For serious students</p>
                                </div>

                                <Button
                                    asChild
                                    className="w-full">
                                    <Link href="/sign-up">Upgrade to Pro</Link>
                                </Button>
                            </div>

                            <div>
                                <div className="text-sm font-medium">Everything in Student plus:</div>

                                <ul className="mt-4 list-outside space-y-3 text-sm">
                                    {['Unlimited assignments', 'Advanced research tools', 'Premium templates', 'Citation generator', 'Plagiarism checker', 'Priority support', 'Export to multiple formats', 'Custom writing styles', 'Collaboration features', 'Advanced AI assistance'].map((item, index) => (
                                        <li
                                            key={index}
                                            className="flex items-center gap-2">
                                            <Check className="size-3" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
