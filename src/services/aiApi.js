const getEnvValue = (key) => {
  try {
    if (typeof process !== "undefined" && process.env) {
      return process.env[key] || null;
    }
  } catch (error) {
    return null;
  }

  return null;
};

function buildOfflineCareerAdvice(prompt) {
  const value = (prompt || "").trim();
  const lower = value.toLowerCase();

  const roleHint =
    /developer|software|frontend|backend|full stack|engineer|react|node|python|java|sql|data/i.test(lower)
      ? "developer role"
      : /nurse|doctor|medical|healthcare|clinical/i.test(lower)
        ? "healthcare role"
        : /teacher|education|school|lecturer/i.test(lower)
          ? "education role"
          : /sales|marketing|customer|business|account|manager/i.test(lower)
            ? "business role"
            : /driver|logistics|warehouse|operations/i.test(lower)
              ? "operations role"
              : "job application";

  const questionType = /cv|resume|curriculum|profile/i.test(lower)
    ? "CV and profile"
    : /interview|meeting|questions|introduction|pitch/i.test(lower)
      ? "interview answer"
      : /cover letter|application|job description|tailor|apply/i.test(lower)
        ? "application tailoring"
        : /salary|offer|negotiat/i.test(lower)
          ? "salary and offer"
          : "job-search strategy";

  const opening =
    questionType === "CV and profile"
      ? "Your CV should lead with the exact skills and results the employer is asking for."
      : questionType === "interview answer"
        ? "Your interview answer should sound confident, clear, and focused on real evidence from your experience."
        : questionType === "application tailoring"
          ? "Your application should match the role’s requirements and show why you fit quickly."
          : questionType === "salary and offer"
            ? "Your salary conversation should be grounded in value, market rate, and your measurable contribution."
            : "Your answer should be practical, role-specific, and easy for an employer to trust.";

  const coreAdvice =
    questionType === "CV and profile"
      ? [
          "1. Put your strongest relevant experience first.",
          "2. Match the job description with measurable examples.",
          "3. Highlight tools, outcomes, and impact in plain language.",
        ]
      : questionType === "interview answer"
        ? [
            "1. Start with a short, relevant summary of your experience.",
            "2. Explain how you solved problems in a specific example.",
            "3. Close by showing why you are ready for this role.",
          ]
        : questionType === "application tailoring"
          ? [
              "1. Read the description and mirror the main requirements.",
              "2. Show how your background matches the role in clear points.",
              "3. Focus on employer value, not just duties you have done before.",
            ]
          : questionType === "salary and offer"
            ? [
                "1. Benchmark your value against the market and your experience.",
                "2. Tie your ask to business value and prior impact.",
                "3. Keep the conversation respectful but confident.",
              ]
            : [
                "1. Align your message to the exact role and employer need.",
                "2. Show evidence of results, not just responsibility.",
                "3. Keep the tone professional, direct, and easy to trust.",
              ];

  const sample =
    questionType === "CV and profile"
      ? `Example: “I have hands-on experience in ${roleHint}, and I have delivered results by improving efficiency, solving real problems, and working closely with teams to meet business goals.”`
      : questionType === "interview answer"
        ? `Example: “I am excited about this ${roleHint} because it matches my background in delivering measurable value, learning quickly, and contributing to team goals from day one.”`
        : questionType === "application tailoring"
          ? `Example: “I am applying for this role because my experience directly aligns with the responsibilities, tools, and outcomes described in the job brief.”`
          : questionType === "salary and offer"
            ? `Example: “Based on my experience and the value I bring, I am looking for a package that reflects both the market rate and my impact in this role.”`
            : `Example: “I bring a clear mix of relevant experience, strong communication, and practical problem-solving that fits this opportunity well.”`;

  return [
    `Here is a more specific answer for your ${roleHint}:`,
    "",
    opening,
    "",
    ...coreAdvice,
    "",
    `For your question: "${value}"`,
    sample,
    "",
    "Keep it professional, confident, and tailored to the exact role you want.",
  ].join("\n");
}

export async function askJobMateAI(prompt, apiKeyOverride = "", provider = "openai") {
  const openRouterKey = getEnvValue("EXPO_PUBLIC_OPENROUTER_API_KEY");
  const openAiKey = getEnvValue("EXPO_PUBLIC_OPENAI_API_KEY");
  const envKey = openRouterKey || openAiKey;
  const apiKey = (apiKeyOverride || envKey || "").trim();

  if (!apiKey) {
    return buildOfflineCareerAdvice(prompt);
  }

  const isOpenRouter = provider === "openrouter" || (!apiKey.startsWith("sk-") && !!(openRouterKey || apiKeyOverride));
  const endpoint = isOpenRouter
    ? "https://openrouter.ai/api/v1/chat/completions"
    : "https://api.openai.com/v1/chat/completions";

  const model = isOpenRouter ? "openai/gpt-4o-mini" : "gpt-4o-mini";

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      ...(isOpenRouter
        ? {
            "HTTP-Referer": "https://job-mate-ai.com",
            "X-Title": "JobMate AI",
          }
        : {}),
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content:
            "You are JobMate AI, a helpful career coach for job seekers. Give practical advice, keep answers concise but useful, and tailor guidance to CVs, interviews, and job search strategy.",
        },
        {
          role: "user",
          content: `Help me with this career question: ${prompt}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  let payload = {};

  try {
    payload = await response.json();
  } catch (error) {
    payload = {};
  }

  if (!response.ok) {
    const message =
      payload?.error?.message ||
      payload?.message ||
      "The AI request failed. Please check your API key and try again.";
    throw new Error(message);
  }

  const content = payload?.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error("The AI response was empty. Please try a different question.");
  }

  return content.replace(/\n{3,}/g, "\n\n").trim();
}
