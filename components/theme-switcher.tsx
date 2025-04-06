"use client"

import { Sun, Moon } from "lucide-react"
import { motion } from "framer-motion"
import { useTheme } from "@/lib/theme-context"

export default function ThemeSwitcher() {
  const { isDarkMode, toggleDarkMode } = useTheme()

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <motion.button
        onClick={toggleDarkMode}
        className="w-12 h-12 rounded-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 flex items-center justify-center shadow-lg"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {isDarkMode ? <Sun className="text-yellow-500 h-5 w-5" /> : <Moon className="text-blue-500 h-5 w-5" />}
      </motion.button>
    </div>
  )
}

