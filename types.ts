
export interface Idea {
  title: string;
  description: string;
  category: IdeaCategory;
  track: IdeaTrack;
}

export type IdeaTrack = '高教主赛道' | '红旅赛道' | '职教赛道' | '产业赛道';

export interface DimensionDetail {
  score: number;
  maxScore: number;
  scoringPoints: string[];   
  weakness: string;          
  improvement: string;       
  bridgeStrategy: string;    
}

export interface TechnicalDiagnostic {
  component: string;      
  issue: string;          
  optimization: string;   
}

export interface EvaluationResult {
  overallScore: number;
  dimensions: {
    innovation: DimensionDetail; 
    education: DimensionDetail;  
    business: DimensionDetail;   
    team: DimensionDetail;       
    social: DimensionDetail;     
  };
  topicPivots: {
    newTitle: string;
    logic: string;           
    potential: string;       
  }[];
  implementation: {
    preciseScenarios: {
      scenario: string;      
      problemSolved: string; 
    }[]; 
    technicalBreakdown: TechnicalDiagnostic[]; 
    businessModel: {
      framework: string;     
      profitModels: string[]; 
      operationLogic: string; 
    };
    marketBenchmarking: {
      leaders: string[];      
      ourAdvantages: string[]; 
      marketProspect: string;  
      competitiveMoat: string; 
    };
  };
  expertComment: string;        
}

export enum IdeaCategory {
  // --- 新工科：信息、AI与数字化 (覆盖：大模型、边缘计算、网络安全等) ---
  ENG_AI_SOFTWARE = '新工科：通用/垂直AI大模型、基础软件与算法创新',
  ENG_EDGE_IOT = '新工科：边缘计算、云边协同、物联网安全与嵌入式开发',
  ENG_CHIP_SEMI = '新工科：半导体、集成电路、类脑芯片与新型存储',
  ENG_DATA_NETWORK = '新工科：大数据治理、区块链、5G/6G通讯与网络空间安全',
  ENG_INDUSTRIAL_DIGIT = '新工科：工业互联网、数字孪生与智慧工厂系统',

  // --- 新工科：制造、装备与空间 (覆盖：低空、机器人、航天等) ---
  ENG_ROBOT_AI = '新工科：具身智能、协作机器人、特种装备与无人系统',
  ENG_LOW_SPACE = '新工科：低空经济、商业航天、无人机与空天信息技术',
  ENG_MARINE_DEEP = '新工科：深海探测、极地工程、海洋装备与水下机器人',
  ENG_PRECISION_MFG = '新工科：高精尖制造、激光技术、数控机床与增材制造',

  // --- 新工科：能源、材料与环境 (覆盖：储能、环保、新材料等) ---
  ENG_ENERGY_TECH = '新工科：氢能/锂电储能、超导技术、光伏与核能应用',
  ENG_NEW_MATERIAL = '新工科：高性能复合材料、生物材料、纳米/超材料',
  ENV_GREEN_CARBON = '新工科：碳中和、污水/大气治理、绿色制造与循环经济',

  // --- 新医科：生物、医疗与健康 (覆盖：器械、药研、中医等) ---
  MED_DRUG_BIO = '新医科：生物制药、靶向药物、疫苗研发与合成生物学',
  MED_DEVICE_ROBOT = '新医科：精密手术机器人、高端影像、体外诊断(IVD)与辅具',
  MED_DIGITAL_HEALTH = '新医科：智慧医疗系统、远程诊断、互联网医院与康养平台',
  MED_TCM_MODERN = '新医科：中医药现代化、民族医药创新与数字化针灸',
  MED_PRECISION_GENE = '新医科：基因编辑、细胞治疗、精准医疗与早期筛查',

  // --- 新农科：农业、食品与生态 (覆盖：育种、农机、乡村等) ---
  AGRI_BIO_SEED = '新农科：生物育种、分子模块设计、种业安全与现代种植',
  AGRI_SMART_EQUIP = '新农科：智慧农业、农用无人机、现代农机与工厂化农业',
  AGRI_FOOD_SECURITY = '新农科：食品科学、功能性营养、保鲜技术与冷链物流',
  AGRI_ECO_RURAL = '新农科：乡村振兴服务、生态修复、农药减量与绿色畜牧',

  // --- 新文科：社会、文化与管理 (覆盖：文创、社科、治理等) ---
  ARTS_DIGITAL_CULTURE = '新文科：文化数字化、非遗活化、博物馆交互与元宇宙',
  ARTS_GOVERN_SOCIETY = '新文科：数智社会治理、智慧社区、应急管理与法治政府',
  ARTS_CREATIVE_BRAND = '新文科：数字创意、视觉传达、品牌出海与新媒体营销',
  ARTS_FIN_EDU_TECH = '新文科：金融科技(FinTech)、现代教育技术与数智办公',
  ARTS_SOCIAL_SERVICE = '新文科：适老化改造、普惠金融、公益慈善与社会创新'
}
