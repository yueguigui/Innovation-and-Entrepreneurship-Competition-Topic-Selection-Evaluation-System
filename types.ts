
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
  // 医药类专项
  PHARMA_INNOVATION = '创新药物（靶向/核素/合成）',
  MEDICAL_DEVICES = '高端医疗器械（机器人/影像）',
  TCM_MODERNIZATION = '中医药现代化（数字化转换）',
  REGEN_MEDICINE = '再生医学（组织工程/生物材料）',
  DIGITAL_HEALTH = '智慧医疗（AI辅助诊断/大模型）',
  // 2025 其他热门
  LOW_ALTITUDE_ECONOMY = '低空经济/无人驾驶系统',
  AI_AGENT_BRAIN = '类脑智能/AI智能体',
  SYNTHETIC_BIOLOGY = '合成生物/绿色化工',
  ADVANCED_SEMICONDUCTOR = '半导体/EDA工具/光子芯片',
  NEW_ENERGY_STORAGE = '固态电池/新型储能',
  DATA_ELEMENTS = '数据要素/数字资产加工'
}
