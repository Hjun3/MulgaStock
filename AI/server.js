import "dotenv/config";
import express from "express";
import OpenAI from "openai";

const app = express();
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateInsight(stock) {
  const prompt = `
    종목명: ${stock.name}
    현재가: ${stock.currentPrice}원
    전일 대비 변동: ${stock.changePercent}%
    52주 최고가: ${stock.yearHigh}원
    52주 최저가: ${stock.yearLow}원

    위 데이터를 바탕으로 2문장 이내로 시황 코멘트를 작성해줘.
    투자 조언은 하지 말고, 가격 흐름만 설명해줘.
  `;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  return response.choices[0].message.content;
}

app.post("/api/insight", async (req, res) => {
  const stock = req.body;
  const insight = await generateInsight(stock);
  res.json({ insight });
});

app.listen(3000, () => {
  console.log("서버 실행 중: http://localhost:3000");
});