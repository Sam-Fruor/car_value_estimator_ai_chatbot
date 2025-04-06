"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Car, Bot, User, Loader2, ArrowRight } from "lucide-react"
import { useTheme } from "@/lib/theme-context"
import { estimateCarValue } from "@/lib/ai-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import ReactMarkdown from "react-markdown"

type Message = {
  id: string
  content: string
  role: "user" | "assistant" | "system"
  timestamp: Date
}

type CarDetails = {
  make: string
  model: string
  year: string
  mileage: string
  condition: string
  additionalInfo?: string
}

export default function CarChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hi! I'm your AI car value assistant. To estimate your car's value, I need to know:\n\n- Make (e.g., Toyota, Honda)\n- Model (e.g., Camry, Civic)\n- Year (e.g., 2020)\n- Mileage (e.g., 50000)\n- Condition (excellent, good, fair, or poor)\n\nYou can tell me all at once or one at a time. What car would you like me to value?",
      role: "assistant",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [carDetails, setCarDetails] = useState<Partial<CarDetails>>({})
  const [lastUserMessage, setLastUserMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { isDarkMode } = useTheme()
  const { toast } = useToast()

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Process user input to extract car details
  const processUserInput = (input: string): Partial<CarDetails> => {
    const newDetails: Partial<CarDetails> = {}
    const lowerInput = input.toLowerCase()

    // Extract make
    const makes = [
      "toyota",
      "honda",
      "ford",
      "chevrolet",
      "hyundai",
      "kia",
      "bmw",
      "audi",
      "mercedes",
      "volkswagen",
      "nissan",
      "mazda",
      "subaru",
      "lexus",
      "jeep",
      "tesla",
    ]

    for (const make of makes) {
      if (lowerInput.includes(make)) {
        newDetails.make = make.charAt(0).toUpperCase() + make.slice(1)
        break
      }
    }

    // Extract specific models
    const modelMap: Record<string, string> = {
      innova: "Innova",
      creta: "Creta",
      creata: "Creta",
      camry: "Camry",
      civic: "Civic",
      corolla: "Corolla",
      fortuner: "Fortuner",
      city: "City",
      swift: "Swift",
      baleno: "Baleno",
      i20: "i20",
      i10: "i10",
      verna: "Verna",
      seltos: "Seltos",
      sonet: "Sonet",
    }

    for (const [modelKey, modelValue] of Object.entries(modelMap)) {
      if (lowerInput.includes(modelKey)) {
        newDetails.model = modelValue

        // If we found a model but no make, try to infer the make
        if (!newDetails.make) {
          const modelToMake: Record<string, string> = {
            Innova: "Toyota",
            Fortuner: "Toyota",
            Camry: "Toyota",
            Corolla: "Toyota",
            Creta: "Hyundai",
            i20: "Hyundai",
            i10: "Hyundai",
            Verna: "Hyundai",
            Civic: "Honda",
            City: "Honda",
            Swift: "Suzuki",
            Baleno: "Suzuki",
            Seltos: "Kia",
            Sonet: "Kia",
          }

          if (modelToMake[modelValue]) {
            newDetails.make = modelToMake[modelValue]
          }
        }

        break
      }
    }

    // Extract year (4 digit number between 1990 and current year + 1)
    const currentYear = new Date().getFullYear()
    const yearRegex = /\b(19[9][0-9]|20[0-2][0-9])\b/
    const yearMatch = input.match(yearRegex)
    if (yearMatch) {
      newDetails.year = yearMatch[1]
    }

    // Extract mileage (number followed by optional "km", "miles", "mi", or just a number)
    const mileageRegex = /\b(\d{1,3}(?:,\d{3})*|\d+)(?:\s*(?:km|miles|mi))?\b/i
    const mileageMatch = input.match(mileageRegex)
    if (mileageMatch) {
      // Don't extract years as mileage
      const potentialMileage = mileageMatch[1].replace(/,/g, "")
      if (
        potentialMileage.length !== 4 ||
        Number.parseInt(potentialMileage) > currentYear + 1 ||
        Number.parseInt(potentialMileage) < 1990
      ) {
        newDetails.mileage = potentialMileage
      }
    }

    // Extract condition
    const conditionKeywords = {
      excellent: ["excellent", "perfect", "mint", "like new"],
      good: ["good", "nice", "well maintained"],
      fair: ["fair", "average", "okay", "ok"],
      poor: ["poor", "bad", "needs work", "damaged"],
    }

    for (const [condition, keywords] of Object.entries(conditionKeywords)) {
      for (const keyword of keywords) {
        if (lowerInput.includes(keyword)) {
          newDetails.condition = condition
          break
        }
      }
      if (newDetails.condition) break
    }

    // Direct condition mention
    if (lowerInput.includes("condition")) {
      for (const condition of ["excellent", "good", "fair", "poor"]) {
        if (lowerInput.includes(condition)) {
          newDetails.condition = condition
          break
        }
      }
    }

    // Check for direct condition mention without the word "condition"
    if (!newDetails.condition) {
      const directConditions = ["excellent", "good", "fair", "poor"]
      for (const condition of directConditions) {
        if (lowerInput.includes(condition)) {
          newDetails.condition = condition
          break
        }
      }
    }

    return newDetails
  }

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setLastUserMessage(input)
    setInput("")
    setIsProcessing(true)

    // Process the user input to extract car details
    const newDetails = processUserInput(input)

    // Merge with existing details
    const updatedDetails = { ...carDetails, ...newDetails }
    setCarDetails(updatedDetails)

    // Check if we have all required details
    const requiredFields: (keyof CarDetails)[] = ["make", "model", "year", "mileage", "condition"]
    const missingFields = requiredFields.filter((field) => !updatedDetails[field])

    setTimeout(async () => {
      if (missingFields.length === 0) {
        // We have all the details, generate the estimate
        try {
          const loadingMessage: Message = {
            id: Date.now().toString(),
            content: "Great! I have all the details I need. Generating your car valuation...",
            role: "assistant",
            timestamp: new Date(),
          }

          setMessages((prev) => [...prev, loadingMessage])

          const completeDetails = updatedDetails as CarDetails

          const estimation = await estimateCarValue({
            make: completeDetails.make,
            model: completeDetails.model,
            year: completeDetails.year,
            mileage: completeDetails.mileage,
            condition: completeDetails.condition as "excellent" | "good" | "fair" | "poor",
            additionalInfo: input,
          })

          const resultMessage: Message = {
            id: Date.now().toString(),
            content: estimation,
            role: "assistant",
            timestamp: new Date(),
          }

          // Replace loading message with result
          setMessages((prev) => [...prev.filter((m) => m.id !== loadingMessage.id), resultMessage])

          // Reset car details for next estimation
          setCarDetails({})

          toast({
            title: "Valuation complete",
            description: "Your car valuation has been generated successfully.",
          })
        } catch (error) {
          console.error("Error estimating car value:", error)

          const errorMessage: Message = {
            id: Date.now().toString(),
            content: "I'm sorry, there was an error generating your car valuation. Please try again.",
            role: "assistant",
            timestamp: new Date(),
          }

          setMessages((prev) => [...prev, errorMessage])

          toast({
            variant: "destructive",
            title: "Estimation failed",
            description: "There was an error estimating your car's value. Please try again.",
          })
        }
      } else {
        // We still need more details
        const detailsCollected = requiredFields
          .filter((field) => updatedDetails[field])
          .map((field) => `${field.charAt(0).toUpperCase() + field.slice(1)}: ${updatedDetails[field]}`)

        let responseContent = ""

        if (detailsCollected.length > 0) {
          responseContent = `Thanks for providing these details:\n\n${detailsCollected.join("\n")}\n\nI still need the following to estimate your car's value: ${missingFields.join(", ")}.`
        } else {
          responseContent = `I need some details about your car to provide a valuation. Please tell me the ${missingFields.join(", ")} of your car.`
        }

        const assistantMessage: Message = {
          id: Date.now().toString(),
          content: responseContent,
          role: "assistant",
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, assistantMessage])
      }

      setIsProcessing(false)
    }, 1000)
  }

  // Format timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <Card className="bg-white dark:bg-zinc-900/80 backdrop-blur-sm border-gray-200 dark:border-zinc-800 shadow-xl h-full relative z-10 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-600"></div>
      <CardContent className="p-0 h-[600px] flex flex-col">
        {/* Chat header */}
        <div className="p-4 border-b border-gray-200 dark:border-zinc-800 flex items-center">
          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center mr-3">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">Car Value Assistant</h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400">Powered by AI</p>
          </div>
        </div>

        {/* Messages container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === "user" ? "bg-gray-200 dark:bg-zinc-700 ml-2" : "bg-emerald-500 mr-2"
                    }`}
                  >
                    {message.role === "user" ? (
                      <User className="h-4 w-4 text-gray-600 dark:text-white" />
                    ) : (
                      <Bot className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <div>
                    <div
                      className={`rounded-2xl px-4 py-2 ${
                        message.role === "user"
                          ? "bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-white"
                          : "bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                      }`}
                    >
                      {message.role === "assistant" && message.content.includes("# ") ? (
                        <div className="prose dark:prose-invert max-w-none">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="whitespace-pre-line">{message.content}</p>
                      )}
                    </div>
                    <p
                      className={`text-xs mt-1 text-gray-500 dark:text-zinc-500 ${message.role === "user" ? "text-right" : ""}`}
                    >
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="p-4 border-t border-gray-200 dark:border-zinc-800">
          <div className="flex items-center">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !isProcessing && handleSendMessage()}
              placeholder="Tell me about your car..."
              className="bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-emerald-500/20 dark:focus:ring-emerald-500/20"
              disabled={isProcessing}
            />
            <Button
              onClick={handleSendMessage}
              disabled={isProcessing || !input.trim()}
              className="ml-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90"
              size="icon"
            >
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>

          {/* Quick prompts */}
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-300"
              onClick={() => setInput("Toyota Innova 2024, 50000 km, good condition")}
            >
              <Car className="h-3 w-3 mr-1" />
              Toyota Innova
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-300"
              onClick={() => setInput("Hyundai Creta 2024, excellent condition")}
            >
              <Car className="h-3 w-3 mr-1" />
              Hyundai Creta
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-300"
              onClick={() => setInput("What details do you need for a car valuation?")}
            >
              <ArrowRight className="h-3 w-3 mr-1" />
              Help
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

