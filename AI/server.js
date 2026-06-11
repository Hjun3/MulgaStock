import "dotenv/config";
import express from "express";
import OpenAI from "openai";

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function buildPrompt(type, data) {
  if (type === "landing") {
    return `오늘 물가 동향: 상승 ${data.gainersCount}종목, 하락 ${data.losersCount}종목, 전체 평균 변동률 ${data.totalChangePercent}%.
일반인이 이해하기 쉽게 오늘의 전체 물가 흐름을 한 문장으로 요약해줘. 투자 조언 없이 사실만 간결하게 서술해줘.`;
  }
  if (type === "market") {
    const sectors = (data.sectors || [])
      .filter((s) => s.stockCount > 0)
      .map((s) => `${s.displayName} ${s.averageChangePercent > 0 ? "+" : ""}${s.averageChangePercent}%`)
      .join(", ");
    return `오늘 물가 시황: 상승 ${data.gainersCount}종목, 하락 ${data.losersCount}종목. 카테고리별: ${sectors}.
상승/하락 수치와 카테고리 등락을 포함해 분석적인 시황을 한 문장으로 작성해줘. 투자 조언 없이 가격 흐름만 설명해줘.`;
  }
  // stock
  return `종목: ${data.name}, 현재가: ${data.currentPrice}원, 전일 대비: ${data.changePercent}%, 52주 최고: ${data.yearHigh}원, 52주 최저: ${data.yearLow}원.
이 종목의 가격 흐름을 한 문장으로 코멘트해줘. 투자 조언 없이 사실만 서술해줘.`;
}

app.post("/api/insight", async (req, res) => {
  try {
    const { type = "stock", ...data } = req.body;
    const prompt = buildPrompt(type, data);
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });
    res.json({ insight: response.choices[0].message.content });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(3000, () => {
  console.log("서버 실행 중: http://localhost:3000");
});
