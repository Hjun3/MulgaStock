import "dotenv/config";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const response = await client.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [
    {
      role: "user",
      content: "휘발유 현재가 1823원, 전주 대비 +3.2% 상승했어. 한 문장으로 시황 코멘트 써줘.",
    },
  ],
});

console.log(response.choices[0].message.content);