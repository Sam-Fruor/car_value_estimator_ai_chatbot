"use client"

import { motion } from "framer-motion"
import { FormInput, MessageSquare } from "lucide-react"

type InterfaceToggleProps = {
  activeInterface: "form" | "chat"
  onChange: (interfaceType: "form" | "chat") => void
}

export default function InterfaceToggle({ activeInterface, onChange }: InterfaceToggleProps) {
  return (
    <div className="flex justify-center mb-8">
      <div className="bg-gray-200/70 dark:bg-zinc-800/70 backdrop-blur-sm rounded-full p-1 flex">
        <button
          onClick={() => onChange("form")}
          className={`relative rounded-full px-4 py-2 flex items-center transition-all duration-200 ${
            activeInterface === "form"
              ? "text-white"
              : "text-gray-600 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200"
          }`}
        >
          {activeInterface === "form" && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600"
              initial={false}
              transition={{ type: "spring", duration: 0.5 }}
            />
          )}
          <FormInput className="h-4 w-4 mr-2 relative z-10" />
          <span className="relative z-10">Form</span>
        </button>

        <button
          onClick={() => onChange("chat")}
          className={`relative rounded-full px-4 py-2 flex items-center transition-all duration-200 ${
            activeInterface === "chat"
              ? "text-white"
              : "text-gray-600 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200"
          }`}
        >
          {activeInterface === "chat" && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600"
              initial={false}
              transition={{ type: "spring", duration: 0.5 }}
            />
          )}
          <MessageSquare className="h-4 w-4 mr-2 relative z-10" />
          <span className="relative z-10">Chat</span>
        </button>
      </div>
    </div>
  )
}

