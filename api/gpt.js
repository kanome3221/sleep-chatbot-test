export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: "No message provided" });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "당신은 수면 전문가입니다. 사용자가 입력한 수면 습관을 바탕으로 요약, 문제점, 개선점을 JSON 형태로 알려주세요."
          },
          {
            role: "user",
            content: message
          }
        ]
      })
    });

    const data = await response.json();
    console.log("응답:", JSON.stringify(data).slice(0, 500));

    if (!data.choices || !data.choices[0]) {
      return res.status(500).json({ error: "No choices in response", raw: data });
    }

    const reply = data.choices[0].message.content;
    try {
      const parsed = JSON.parse(reply);
      return res.status(200).json({ result: parsed, raw: data });
    } catch (e) {
      return res.status(200).json({ reply, raw: data });
    }
  } catch (err) {
    console.error("분석 오류:", err);
    return res.status(500).json({ error: err.message || "Unknown error" });
  }
}
