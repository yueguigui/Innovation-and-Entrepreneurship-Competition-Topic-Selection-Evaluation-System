
import { GoogleGenAI, Type } from "@google/genai";
import { Idea, EvaluationResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function evaluateIdea(idea: Idea): Promise<EvaluationResult> {
  const prompt = `
    你现在是中国国际大学生创新大赛（2026）的国家级评审组长。
    请结合 2023-2025 三年间的大赛演变逻辑，对以下选题进行【深度可行性评估与战略调整报告】。

    ### 专家评估原则：
    1. **维度深挖**：每个维度不仅要打分，还要点名符合2026评审规则的哪些具体“得分点”。对于早期构思中缺失的【教育】和【社会价值】维度，**禁止批评缺失**，必须给出如何将该项目与这两个维度产生强关联的“方向参考”。
    2. **选题进化**：若当前选题平庸，请基于原思路提供2个具有“金奖潜力”的【新选题参考】。
    3. **落地穿透**：提供具体的盈利模式框架，对标行业领先企业（如华为、大疆、宁德时代等对应领域的头部），说明本项目优势。
    4. **技术预警**：诚实点名目前技术路线的问题，并提供深入研究的科研方向。

    ### 项目信息：
    - 赛道：${idea.track}
    - 标题：${idea.title}
    - 描述：${idea.description}
    - 领域：${idea.category}

    请输出详细的 JSON 结果。
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
              education: { $ref: "#/definitions/dimension" },
              innovation: { $ref: "#/definitions/dimension" },
              team: { $ref: "#/definitions/dimension" },
              business: { $ref: "#/definitions/dimension" },
              social: { $ref: "#/definitions/dimension" }
            }
          },
          topicPivots: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                newTitle: { type: Type.STRING },
                logic: { type: Type.STRING },
                potential: { type: Type.STRING }
              }
            }
          },
          implementation: {
            type: Type.OBJECT,
            properties: {
              preciseScenarios: { type: Type.ARRAY, items: { type: Type.STRING } },
              painPointSolving: { type: Type.STRING },
              technicalShortcomings: { type: Type.ARRAY, items: { type: Type.STRING } },
              researchRoadmap: { type: Type.STRING }
            }
          },
          businessFramework: {
            type: Type.OBJECT,
            properties: {
              revenueModel: { type: Type.STRING },
              businessFramework: { type: Type.STRING },
              benchmarks: { type: Type.ARRAY, items: { type: Type.STRING } },
              competitiveAdvantages: { type: Type.STRING }
            }
          },
          expertComment: { type: Type.STRING }
        },
        required: ["overallScore", "dimensions", "topicPivots", "implementation", "businessFramework", "expertComment"],
        definitions: {
          dimension: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              maxScore: { type: Type.NUMBER },
              scoringPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
              weakness: { type: Type.STRING },
              improvement: { type: Type.STRING },
              bridgeStrategy: { type: Type.STRING }
            }
          }
        }
      }
    }
  });

  return JSON.parse(response.text.trim());
}
