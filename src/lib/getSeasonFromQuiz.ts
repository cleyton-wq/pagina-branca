export async function getSeasonFromQuiz(answersText: string): Promise<"Spring" | "Summer" | "Autumn" | "Winter"> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: "You are a color analysis expert. Your job is to choose ONE seasonal palette: Spring, Summer, Autumn or Winter.",
        },
        {
          role: "user",
          content:
            "Based on these quiz answers, decide the best season and return ONLY one word: Spring, Summer, Autumn or Winter.\n\n" +
            answersText,
        },
      ],
      max_tokens: 5,
      temperature: 0,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to call OpenAI API");
  }

  const data = await response.json();
  const raw = (data.choices?.[0]?.message?.content || "").trim().toLowerCase();

  if (raw.includes("spring")) return "Spring";
  if (raw.includes("summer")) return "Summer";
  if (raw.includes("autumn")) return "Autumn";
  if (raw.includes("winter")) return "Winter";

  // fallback caso algo venha errado
  return "Spring";
}