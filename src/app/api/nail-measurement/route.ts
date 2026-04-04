import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

function getOpenAIClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const photo = formData.get("photo") as File;

    if (!photo) {
      return NextResponse.json(
        { error: "No photo provided" },
        { status: 400 }
      );
    }

    // Convert image to base64
    const bytes = await photo.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString("base64");
    const mimeType = photo.type;
    const dataUrl = `data:${mimeType};base64,${base64Image}`;

    // Call OpenAI Vision API
    const response = await getOpenAIClient().chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this photo of a hand with all 5 fingers visible. You MUST return ONLY a valid JSON object with this exact structure:

{
  "measurements": [
    {"finger": "Thumb", "width": <number>, "length": <number>},
    {"finger": "Index", "width": <number>, "length": <number>},
    {"finger": "Middle", "width": <number>, "length": <number>},
    {"finger": "Ring", "width": <number>, "length": <number>},
    {"finger": "Pinky", "width": <number>, "length": <number>}
  ],
  "hand_type": "left or right",
  "reference_object": "detected reference object (credit card, etc)",
  "confidence": <number 0-100>,
  "notes": "any observations about nail shape, curvature, etc"
}

Instructions:
- Identify all 5 fingernails
- If a credit card or standard card is visible, use it to calibrate measurements (credit card = 85.6mm × 53.98mm)
- Estimate nail width (side to side) and length (cuticle to tip) in millimeters
- If no reference object, provide estimated measurements based on average hand proportions
- Return ONLY the JSON object, no markdown formatting, no extra text`,
            },
            {
              type: "image_url",
              image_url: {
                url: dataUrl,
                detail: "high",
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    // Parse JSON response
    let measurements;
    try {
      // Remove markdown code fences if present
      let cleanContent = content.trim();
      if (cleanContent.startsWith("```json")) {
        cleanContent = cleanContent.replace(/```json\n?/, "").replace(/```$/, "").trim();
      } else if (cleanContent.startsWith("```")) {
        cleanContent = cleanContent.replace(/```\n?/, "").replace(/```$/, "").trim();
      }
      measurements = JSON.parse(cleanContent);
    } catch (e) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Invalid response format from AI");
    }

    // Save to backend database
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    let profileId = null;

    try {
      const saveResponse = await fetch(`${backendUrl}/api/fit/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(measurements),
      });

      if (saveResponse.ok) {
        const savedData = await saveResponse.json();
        profileId = savedData.profile_id;
      }
    } catch (backendError) {
      // Backend save failed, but return measurements anyway
      console.error("Backend save failed:", backendError);
    }

    return NextResponse.json({
      ...measurements,
      profile_id: profileId,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Nail measurement error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process image" },
      { status: 500 }
    );
  }
}