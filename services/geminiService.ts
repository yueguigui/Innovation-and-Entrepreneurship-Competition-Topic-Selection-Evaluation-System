
import { GoogleGenAI, Type } from "@google/genai";
import { Idea, EvaluationResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function evaluateIdea(idea: Idea): Promise<EvaluationResult> {
  const dimensionSchema = {
    type: Type.OBJECT,
    properties: {
      score: { type: Type.NUMBER, description: "维度得分" },
      maxScore: { type: Type.NUMBER, description: "该维度满分" },
      scoringPoints: { type: Type.ARRAY, items: { type: Type.STRING }, description: "命中的具体得分点" },
      weakness: { type: Type.STRING, description: "该维度存在的问题" },
      improvement: { type: Type.STRING, description: "改进方向" },
      bridgeStrategy: { type: Type.STRING, description: "维度关联建议" }
    },
    required: ["score", "maxScore", "scoringPoints", "weakness", "improvement", "bridgeStrategy"]
  };

  const prompt = `
    你现在是中国国际大学生创新大赛（2026）的国家级评审专家组组长。
    我已经通过 2025 年金奖获奖名单（如：血管化心脏类器官、SpermSeek AI、LipiRelief 靶向药等）深度掌握了医药赛道的评审逻辑。

    ### 医药/生物类金奖评估准则：
    1. **临床价值穿透**：必须点名解决了哪种“临床未被满足的需求”（Unmet Clinical Need）。
    2. **技术护城河**：是否具备专利壁垒或复杂的生物工艺（如磁控溅射、微流控、蛋白质计算）。
    3. **药政前瞻性**：如果是药/械，必须对“型检”、“临床申报”或“伦理”有明确的路径设想。
    4. **国产替代/首创**：强调针对外资垄断（如高端医用缝合线、手术导航系统）的突破。

    ### 评审任务：
    请对以下选题构思进行【深度诊断报告】。

    - 赛道：${idea.track}
    - 领域：${idea.category}
    - 标题：${idea.title}
    - 描述：${idea.description}

    ### 输出要求：
    - **选题进化 (Pivot)**：医药类题目必须更具科学性（例如：从“智能拐杖”魔改为“基于多模态传感的共融型下肢外骨骼机器人”）。
    - **技术预警**：点名目前实验进度、一致性或安全性上的潜在缺陷。
    - **商业闭环**：对标美敦力、强生、恒瑞、大疆医疗等头部。

    请以 JSON 格式输出。
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overallScore: { type: Type.NUMBER },
          dimensions: {
            type: Type.OBJECT,
            properties: {
              education: dimensionSchema,
              innovation: dimensionSchema,
              team: dimensionSchema,
              business: dimensionSchema,
              social: dimensionSchema
            },
            required: ["education", "innovation", "team", "business", "social"]
          },
          topicPivots: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                newTitle: { type: Type.STRING },
                logic: { type: Type.STRING },
                potential: { type: Type.STRING }
              },
              required: ["newTitle", "logic", "potential"]
            }
          },
          implementation: {
            type: Type.OBJECT,
            properties: {
              preciseScenarios: { type: Type.ARRAY, items: { type: Type.STRING } },
              painPointSolving: { type: Type.STRING },
              technicalShortcomings: { type: Type.ARRAY, items: { type: Type.STRING } },
              researchRoadmap: { type: Type.STRING }
            },
            required: ["preciseScenarios", "painPointSolving", "technicalShortcomings", "researchRoadmap"]
          },
          businessFramework: {
            type: Type.OBJECT,
            properties: {
              revenueModel: { type: Type.STRING },
              businessFramework: { type: Type.STRING },
              benchmarks: { type: Type.ARRAY, items: { type: Type.STRING } },
              competitiveAdvantages: { type: Type.STRING }
            },
            required: ["revenueModel", "businessFramework", "benchmarks", "competitiveAdvantages"]
          },
          expertComment: { type: Type.STRING }
        },
        required: ["overallScore", "dimensions", "topicPivots", "implementation", "businessFramework", "expertComment"]
      }
    }
  });

  return JSON.parse(response.text.trim());
}
