
export interface Idea {
  title: string;
  description: string;
  category: string;
  track: '高教主赛道' | '红旅赛道' | '职教赛道' | '产业赛道' | '萌芽赛道';
}

export interface DimensionDetail {
  score: number;
  maxScore: number;
  scoringPoints: string[];   // 命中的得分点说明
  weakness: string;          // 存在的问题
  improvement: string;       // 改进方向
  bridgeStrategy?: string;    // 针对教育/社会价值的关联建议
}

export interface EvaluationResult {
  overallScore: number;
  dimensions: {
    education: DimensionDetail;
    innovation: DimensionDetail;
    team: DimensionDetail;
    business: DimensionDetail;
    social: DimensionDetail;
  };
  // 选题调整板块
  topicPivots: {
    newTitle: string;
    logic: string;           // 调整逻辑
    potential: string;       // 获奖潜力分析
  }[];
  // 落地与技术闭环
  implementation: {
    preciseScenarios: string[]; // 精准应用场景
    painPointSolving: string;   // 如何精准解决痛点
    technicalShortcomings: string[]; // 技术路线的不足
    researchRoadmap: string;    // 可改进深入的研究方向
  };
  // 商业框架
  businessFramework: {
    revenueModel: string;       // 具体的盈利模式
    businessFramework: string;   // 商业模式框架构建
    benchmarks: string[];       // 对标的行业领先产品/企业
    competitiveAdvantages: string; // 我们的核心优势点
  };
  expertComment: string;        // 专家一针见血总评
}

export enum IdeaCategory {
  AI_NATIVE = 'AI Native 原生智能',
  LOW_ALTITUDE = '低空经济/无人驾驶',
  QUANTUM_TECH = '量子信息/未来计算',
  BIO_MANUFACTURING = '合成生物/生命科学',
  NEW_ENERGY = '氢能/核能/新型储能',
  DEEP_SEA_SPACE = '空天海地探测装置',
  DATA_ELEMENTS = '数据要素/数字资产',
  RURAL_DIGITIZATION = '乡村振兴/数字治理'
}
