"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Loader2, Car, DollarSign, BarChart, CheckCircle2, AlertCircle, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import ReactMarkdown from "react-markdown"
import { useTheme } from "@/lib/theme-context"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { estimateCarValue } from "@/lib/ai-service"

const currentYear = new Date().getFullYear()

const formSchema = z.object({
  make: z.string().min(1, { message: "Make is required" }),
  model: z.string().min(1, { message: "Model is required" }),
  year: z.string().refine(
    (val) => {
      const year = Number.parseInt(val)
      return !isNaN(year) && year >= 1950 && year <= currentYear
    },
    { message: `Year must be between 1950 and ${currentYear}` },
  ),
  mileage: z.string().refine(
    (val) => {
      const mileage = Number.parseInt(val)
      return !isNaN(mileage) && mileage >= 0 && mileage <= 1000000
    },
    { message: "Mileage must be between 0 and 1,000,000" },
  ),
  condition: z.enum(["excellent", "good", "fair", "poor"]),
  additionalInfo: z.string().optional(),
})

export default function CarValueEstimator() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const { toast } = useToast()
  const { isDarkMode } = useTheme()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      make: "",
      model: "",
      year: "",
      mileage: "",
      condition: "good",
      additionalInfo: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setResult(null)

    try {
      const estimation = await estimateCarValue(values)
      setResult(estimation)
      toast({
        title: "Valuation complete",
        description: "Your car valuation has been generated successfully.",
        variant: "default",
      })
    } catch (error) {
      console.error("Error estimating car value:", error)
      toast({
        variant: "destructive",
        title: "Estimation failed",
        description: "There was an error estimating your car's value. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, type: "spring" }}
        className="relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl transform -rotate-1 scale-105 blur-sm opacity-5 dark:opacity-10"></div>
        <Card className="bg-white dark:bg-zinc-900/80 backdrop-blur-sm border-gray-200 dark:border-zinc-800 shadow-xl relative z-10 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-600"></div>
          <CardContent className="pt-8 pb-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex items-center mb-6"
            >
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center mr-3">
                <Car className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Car Details</h2>
            </motion.div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="make"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 dark:text-zinc-300">Make</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Toyota"
                            {...field}
                            className="bg-gray-50 dark:bg-zinc-800/50 border-gray-300 dark:border-zinc-700 focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-emerald-500/20 dark:focus:ring-emerald-500/20 transition-all"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 dark:text-zinc-300">Model</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Camry"
                            {...field}
                            className="bg-gray-50 dark:bg-zinc-800/50 border-gray-300 dark:border-zinc-700 focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-emerald-500/20 dark:focus:ring-emerald-500/20 transition-all"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 dark:text-zinc-300">Year</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="2020"
                            {...field}
                            type="number"
                            min="1950"
                            max={currentYear}
                            className="bg-gray-50 dark:bg-zinc-800/50 border-gray-300 dark:border-zinc-700 focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-emerald-500/20 dark:focus:ring-emerald-500/20 transition-all"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="mileage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 dark:text-zinc-300">Mileage</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="50000"
                            {...field}
                            type="number"
                            min="0"
                            max="1000000"
                            className="bg-gray-50 dark:bg-zinc-800/50 border-gray-300 dark:border-zinc-700 focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-emerald-500/20 dark:focus:ring-emerald-500/20 transition-all"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-zinc-300">Condition</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-gray-50 dark:bg-zinc-800/50 border-gray-300 dark:border-zinc-700 focus:ring-emerald-500/20 dark:focus:ring-emerald-500/20">
                            <SelectValue placeholder="Select condition" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700">
                          <SelectItem value="excellent" className="focus:bg-emerald-50 dark:focus:bg-emerald-500/20">
                            <div className="flex items-center">
                              <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-500" />
                              Excellent
                            </div>
                          </SelectItem>
                          <SelectItem value="good" className="focus:bg-emerald-50 dark:focus:bg-emerald-500/20">
                            <div className="flex items-center">
                              <CheckCircle2 className="h-4 w-4 mr-2 text-teal-500" />
                              Good
                            </div>
                          </SelectItem>
                          <SelectItem value="fair" className="focus:bg-emerald-50 dark:focus:bg-emerald-500/20">
                            <div className="flex items-center">
                              <AlertCircle className="h-4 w-4 mr-2 text-yellow-500" />
                              Fair
                            </div>
                          </SelectItem>
                          <SelectItem value="poor" className="focus:bg-emerald-50 dark:focus:bg-emerald-500/20">
                            <div className="flex items-center">
                              <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
                              Poor
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-gray-500 dark:text-zinc-500">
                        The overall condition of your vehicle
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="additionalInfo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-zinc-300">
                        Additional Information (Optional)
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any modifications, accident history, special features, etc."
                          className="resize-none bg-gray-50 dark:bg-zinc-800/50 border-gray-300 dark:border-zinc-700 focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-emerald-500/20 dark:focus:ring-emerald-500/20 transition-all"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 shadow-lg shadow-emerald-500/10 dark:shadow-emerald-500/20 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Estimating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Estimate Value
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, type: "spring", delay: 0.1 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl transform rotate-1 scale-105 blur-sm opacity-5 dark:opacity-10"></div>
        <Card className="bg-white dark:bg-zinc-900/80 backdrop-blur-sm border-gray-200 dark:border-zinc-800 shadow-xl h-full relative z-10 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-600"></div>
          <CardContent className="pt-8 h-full flex flex-col">
            <AnimatePresence mode="wait">
              {!result && !isLoading ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-zinc-400 space-y-6 py-8"
                >
                  <motion.div
                    animate={{
                      y: [0, -10, 0],
                      opacity: [1, 0.8, 1],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Number.POSITIVE_INFINITY,
                      repeatType: "loop",
                    }}
                  >
                    <BarChart className="h-20 w-20 text-gray-300 dark:text-emerald-500/30" />
                  </motion.div>
                  <div>
                    <h3 className="text-2xl font-medium text-gray-700 dark:text-zinc-300 mb-3">
                      Your Estimate Will Appear Here
                    </h3>
                    <p className="text-gray-500 dark:text-zinc-500 max-w-md">
                      Fill out the form and submit to get an AI-powered estimate of your car's value in Indian Rupees
                    </p>
                  </div>
                </motion.div>
              ) : isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-full text-center py-8"
                >
                  <div className="relative mb-8">
                    <motion.div
                      className="h-28 w-28 rounded-full border-4 border-gray-200 dark:border-emerald-500/20"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    />
                    <motion.div
                      className="h-28 w-28 rounded-full border-t-4 border-emerald-500 absolute top-0 left-0"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    />
                    <DollarSign className="h-12 w-12 text-emerald-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <h3 className="text-2xl font-medium text-gray-700 dark:text-zinc-300 mb-3">Analyzing Market Data</h3>
                  <motion.p
                    className="text-gray-500 dark:text-zinc-500"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                  >
                    Our AI is processing your vehicle information...
                  </motion.p>
                </motion.div>
              ) : (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, type: "spring" }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-center">
                    <motion.div
                      className="h-20 w-20 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/10 dark:shadow-emerald-500/20"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 10 }}
                    >
                      <DollarSign className="h-10 w-10 text-white" />
                    </motion.div>
                  </div>
                  <motion.h3
                    className="text-2xl font-medium text-center text-gray-800 dark:text-zinc-200"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    Your Car Valuation
                  </motion.h3>
                  <motion.div
                    className="bg-gray-100 dark:bg-zinc-800/70 backdrop-blur-sm rounded-lg p-6 mt-4 prose dark:prose-invert max-w-none"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <ReactMarkdown>{result}</ReactMarkdown>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex justify-center"
                  >
                    <Button
                      onClick={() => {
                        setResult(null)
                        form.reset()
                      }}
                      variant="outline"
                      className="text-gray-600 dark:text-zinc-400 border-gray-300 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-800 dark:hover:text-zinc-300"
                    >
                      Start New Estimate
                    </Button>
                  </motion.div>
                  <motion.p
                    className="text-xs text-gray-500 dark:text-zinc-500 text-center mt-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    This estimate is based on current market data and AI analysis. Actual selling prices may vary.
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

