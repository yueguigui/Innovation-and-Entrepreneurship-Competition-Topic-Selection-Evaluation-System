
import { GoogleGenAI, Type } from "@google/genai";
import { Idea, EvaluationResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function evaluateIdea(idea: Idea): Promise<EvaluationResult> {
  const dimensionSchema = {
    type: Type.OBJECT,
    properties: {
      score: { type: Type.NUMBER },
      maxScore: { type: Type.NUMBER },
      scoringPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
      weakness: { type: Type.STRING },
      improvement: { type: Type.STRING },
      bridgeStrategy: { type: Type.STRING }
    },
    required: ["score", "maxScore", "scoringPoints", "weakness", "improvement", "bridgeStrategy"]
  };

  const prompt = `
    你现在是中国国际大学生创新大赛（2026）国家级评审专家组组长。
    请针对以下项目信息提供深度、详尽、极具专业洞察力的中文评审报告。

    ### 评审逻辑指引：
    1. **脱敏处理**：在生成“选题优化建议”时，请确保提供的新标题具有高度原创性，严禁直接套用历届国赛金奖项目的真实名称，应通过“核心技术词+场景动词+宏大愿景”进行重构。
    2. **全维度专业性**：
       - 对于“新医科”：重点关注临床评价路径、伦理风险、医疗器械注册证(NMPA)获取的可行性。
       - 对于“新农科”：关注土地普惠性、粮食安全红线、乡村振兴的可持续经营能力。
       - 对于“新文科”：避免纯文化展示，需强化“文化+科技”、“管理+数智”的落地闭环。
    3. **专家研判深度指标**：
       - **诊断总评**：不少于250字，需包含项目在当前“四新”背景下的战略卡位分析。
       - **技术研判**：实施“细胞级”拆解，指出具体环节的物理/工程局限。
       - **商业模式**：输出包含核心资源、关键业务、渠道通路、收入来源的完整逻辑。

    ### 待评项目信息：
    - 赛道：${idea.track}
    - 细分方向：${idea.category}
    - 项目题名：${idea.title}
    - 核心思路描述：${idea.description}

    请严格按JSON输出，内容需详尽、全面、具有指导意义。
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
              innovation: dimensionSchema,
              education: dimensionSchema,
              business: dimensionSchema,
              team: dimensionSchema,
              social: dimensionSchema
            },
            required: ["innovation", "education", "business", "team", "social"]
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
              preciseScenarios: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    scenario: { type: Type.STRING },
                    problemSolved: { type: Type.STRING }
                  },
                  required: ["scenario", "problemSolved"]
                }
              },
              technicalBreakdown: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    component: { type: Type.STRING },
                    issue: { type: Type.STRING },
                    optimization: { type: Type.STRING }
                  },
                  required: ["component", "issue", "optimization"]
                }
              },
              businessModel: {
                type: Type.OBJECT,
                properties: {
                  framework: { type: Type.STRING },
                  profitModels: { type: Type.ARRAY, items: { type: Type.STRING } },
                  operationLogic: { type: Type.STRING }
                },
                required: ["framework", "profitModels", "operationLogic"]
              },
              marketBenchmarking: {
                type: Type.OBJECT,
                properties: {
                  leaders: { type: Type.ARRAY, items: { type: Type.STRING } },
                  ourAdvantages: { type: Type.ARRAY, items: { type: Type.STRING } },
                  marketProspect: { type: Type.STRING },
                  competitiveMoat: { type: Type.STRING }
                },
                required: ["leaders", "ourAdvantages", "marketProspect", "competitiveMoat"]
              }
            },
            required: ["preciseScenarios", "technicalBreakdown", "businessModel", "marketBenchmarking"]
          },
          expertComment: { type: Type.STRING }
        },
        required: ["overallScore", "dimensions", "topicPivots", "implementation", "expertComment"]
      }
    }
  });

  const text = response.text || "{}";
  return JSON.parse(text.trim());
}
