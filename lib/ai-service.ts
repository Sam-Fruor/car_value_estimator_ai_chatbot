"use server"

import { GoogleGenerativeAI } from "@google/generative-ai"

type CarDetails = {
  make: string
  model: string
  year: string
  mileage: string
  condition: string
  additionalInfo?: string
}

export async function estimateCarValue(carDetails: CarDetails): Promise<string> {
  const { make, model, year, mileage, condition, additionalInfo } = carDetails

  const prompt = `
    Provide a concise car valuation in Indian Rupees (₹) for:
    
    Make: ${make}
    Model: ${model}
    Year: ${year}
    Mileage: ${mileage} miles
    Condition: ${condition}
    Additional Info: ${additionalInfo || "None provided"}
    
    Include:
    1. Value range in ₹ (minimum and maximum)
    2. 2-3 key factors affecting valuation
    3. Brief market trend
    4. 1-2 tips for maximizing value
    
    Keep it under 200 words. Format with markdown headings and bullet points for readability.
  `

  try {
    // Initialize the Google Generative AI with your API key
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "")

    // Create a model instance
    // First try with gemini-1.5-flash
    let model
    try {
      model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
    } catch (error) {
      console.log("Failed to load gemini-1.5-flash, trying gemini-1.0-pro")
      model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" })
    }

    // Generate content
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    return text
  } catch (error) {
    console.error("Error generating car valuation:", error)
    return "There was an error generating your car valuation. Please try again later."
  }
}

