import "dotenv/config";
import OpenAI from "openai";

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

// 테스트용 데이터
const testStock = {
  name: "휘발유",
  currentPrice: 1823,
  changePercent: 3.2,
  yearHigh: 2100,
  yearLow: 1650,
};

const insight = await generateInsight(testStock);
console.log(insight);