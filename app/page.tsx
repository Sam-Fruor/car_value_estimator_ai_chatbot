"use client"

import { useState } from "react"
import CarValueEstimator from "@/components/car-value-estimator"
import CarChatbot from "@/components/car-chatbot"
import InterfaceToggle from "@/components/interface-toggle"
import ThemeSwitcher from "@/components/theme-switcher"
import { Toaster } from "@/components/ui/toaster"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "@/lib/theme-context"

export default function Home() {
  const { isDarkMode } = useTheme()
  const [activeInterface, setActiveInterface] = useState<"form" | "chat">("form")

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gradient-to-br dark:from-zinc-900 dark:via-black dark:to-zinc-900 text-gray-900 dark:text-white overflow-hidden transition-colors duration-300">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5 dark:opacity-10 animate-blob"></div>
        <div className="absolute top-40 -left-20 w-80 h-80 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5 dark:opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-40 left-20 w-80 h-80 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5 dark:opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600">
            AI Car Value Estimator
          </h1>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <p className="text-gray-600 dark:text-zinc-400 max-w-2xl mx-auto text-lg">
              Get an accurate estimate of your car's value using advanced AI technology. Simply enter your car details
              below and our AI will analyze market data to provide you with a valuation.
            </p>
          </motion.div>
        </motion.div>

        <InterfaceToggle activeInterface={activeInterface} onChange={setActiveInterface} />

        <AnimatePresence mode="wait">
          {activeInterface === "form" ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <CarValueEstimator />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <CarChatbot />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="mt-16 text-center text-gray-500 dark:text-zinc-500 text-sm"
        >
          <p>© 2023 AI Car Estimator. Powered by advanced AI technology.</p>
        </motion.div>
      </div>
      <ThemeSwitcher />
      <Toaster />
    </main>
  )
}

