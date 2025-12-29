
import React, { useState, useRef } from 'react';
import { Idea, EvaluationResult, IdeaCategory, DimensionDetail, IdeaTrack, TechnicalDiagnostic } from './types';
import { evaluateIdea } from './services/geminiService';
import { 
  RadarChart, PolarGrid, PolarAngleAxis, Radar, 
  ResponsiveContainer
} from 'recharts';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const DimensionCard: React.FC<{ label: string; data: DimensionDetail; accent: string }> = ({ label, data, accent }) => (
  <div className={`bg-slate-800/40 border border-${accent}-500/20 rounded-3xl p-6 space-y-4 backdrop-blur-md shadow-lg transition-transform hover:scale-[1.01]`}>
    <div className="flex justify-between items-center border-b border-white/5 pb-3">
      <h5 className={`text-base font-black text-${accent}-400 tracking-wider`}>{label}</h5>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-black text-white">{data.score}</span>
        <span className="text-xs text-gray-500 font-bold">/ {data.maxScore}</span>
      </div>
    </div>
    <div className="space-y-4">
      <div>
        <p className="text-[10px] text-gray-400 font-black mb-2 opacity-60 uppercase tracking-widest">核心评分命中点</p>
        <div className="flex flex-wrap gap-2">
          {data.scoringPoints.map((p, i) => (
            <span key={i} className={`bg-${accent}-500/10 text-${accent}-300 text-[10px] px-3 py-1 rounded-md border border-${accent}-500/10 font-bold`}>{p}</span>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
          <p className="text-[10px] text-orange-400 font-black mb-1 uppercase tracking-widest">专家维度诊断</p>
          <p className="text-xs text-gray-300 leading-relaxed font-medium">{data.weakness}</p>
        </div>
        <div className="bg-cyan-500/5 p-4 rounded-xl border border-cyan-500/10">
          <p className="text-[10px] text-cyan-400 font-black mb-1 uppercase tracking-widest">维度升级建议</p>
          <p className="text-xs text-cyan-100/80 leading-relaxed italic font-medium">{data.bridgeStrategy}</p>
        </div>
      </div>
    </div>
  </div>
);

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [idea, setIdea] = useState<Idea>({
    title: '',
    description: '',
    category: IdeaCategory.ENG_AI_SOFTWARE,
    track: '高教主赛道'
  });
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const handleEvaluate = async () => {
    if (!idea.title || idea.description.length < 20) {
      alert("请录入完整的项目标题，并提供至少20字的核心思路以便专家组进行深度研判。");
      return;
    }
    setLoading(true);
    try {
      const evaluation = await evaluateIdea(idea);
      setResult(evaluation);
    } catch (error) {
      console.error(error);
      alert("专家系统研判超时，请检查申报描述是否包含敏感词或稍后重试。");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!reportRef.current || !result) return;
    setExporting(true);
    
    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#020617',
        logging: false,
        onclone: (clonedDoc) => {
          // 在克隆的文档中可以根据需要调整样式
          const el = clonedDoc.getElementById('report-container');
          if (el) el.style.padding = '40px';
        }
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      // 处理多页
      let heightLeft = pdfHeight;
      let position = 0;
      const pageHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`创赛智评报告_${idea.title || '未命名项目'}.pdf`);
    } catch (error) {
      console.error('PDF Export Error:', error);
      alert('PDF 生成失败，请尝试在电脑端操作。');
    } finally {
      setExporting(false);
    }
  };

  const radarData = result ? [
    { subject: '创新维度', A: (result.dimensions.innovation.score / result.dimensions.innovation.maxScore) * 100 },
    { subject: '教育维度', A: (result.dimensions.education.score / result.dimensions.education.maxScore) * 100 },
    { subject: '商业维度', A: (result.dimensions.business.score / result.dimensions.business.maxScore) * 100 },
    { subject: '团队维度', A: (result.dimensions.team.score / result.dimensions.team.maxScore) * 100 },
    { subject: '社会价值', A: (result.dimensions.social.score / result.dimensions.social.maxScore) * 100 },
  ] : [];

  return (
    <div className="min-h-screen bg-[#020617] text-gray-100 pb-20 selection:bg-cyan-500/30">
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20 bg-blur-effect">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-900/20 blur-[140px]"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-900/20 blur-[140px]"></div>
      </div>

      <header className="sticky top-0 z-50 bg-[#020617]/90 backdrop-blur-xl border-b border-white/5 py-5 px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center font-black text-2xl shadow-2xl shadow-cyan-500/40">创</div>
            <div>
              <h1 className="font-black tracking-tight text-xl text-white">创赛智评：专家决策辅助桌面</h1>
              <p className="text-[10px] text-cyan-400 font-bold tracking-widest uppercase">2026 中国国际大学生创新大赛（原互联网+）</p>
            </div>
          </div>
          <div className="text-right flex items-center gap-6">
            <div className="hidden sm:block">
              <div className="flex items-center gap-2 justify-end mb-1">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">2025 金奖库全量同步（脱敏版）</p>
              </div>
              <p className="text-xs font-bold text-gray-500 italic">“四新”评审模型全链路激活</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* 输入面板 */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900/60 border border-white/5 rounded-[2.5rem] p-8 space-y-6 shadow-2xl backdrop-blur-xl">
            <h3 className="text-xl font-black flex items-center gap-3 text-white">
              <span className="w-1.5 h-8 bg-cyan-500 rounded-full shadow-lg shadow-cyan-500/50"></span>
              选题申报构思
            </h3>
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase px-2 tracking-widest">参赛赛道</label>
                  <select 
                    value={idea.track}
                    onChange={(e) => setIdea({...idea, track: e.target.value as IdeaTrack})}
                    className="w-full bg-slate-800 border-none p-3.5 rounded-2xl text-sm font-bold text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all cursor-pointer"
                  >
                    <option>高教主赛道</option>
                    <option>红旅赛道</option>
                    <option>职教赛道</option>
                    <option>产业赛道</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase px-2 tracking-widest">选题所属方向 (全维度覆盖)</label>
                  <select 
                    value={idea.category}
                    onChange={(e) => setIdea({...idea, category: e.target.value as IdeaCategory})}
                    className="w-full bg-slate-800 border-none p-3.5 rounded-2xl text-[11px] font-bold text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all cursor-pointer"
                  >
                    {Object.values(IdeaCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase px-2 tracking-widest">项目申报名称</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-800 border-none p-4 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none font-bold placeholder-gray-600 text-white"
                  placeholder="示例：慧影云控——面向离散制造的分布式智能视觉系统"
                  value={idea.title}
                  onChange={(e) => setIdea({...idea, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase px-2 tracking-widest">核心逻辑、技术细节与场景构想</label>
                <textarea 
                  rows={10}
                  className="w-full bg-slate-800 border-none p-4 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none text-sm leading-relaxed placeholder-gray-600 text-white"
                  placeholder="请详细录入您的创新点、技术栈（如：多模态融合、合成生物育种等）及具体的落地构想。建议字数不少于50字。"
                  value={idea.description}
                  onChange={(e) => setIdea({...idea, description: e.target.value})}
                />
              </div>
              <button 
                onClick={handleEvaluate}
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 py-5 rounded-3xl font-black shadow-2xl shadow-cyan-600/30 transition-all disabled:opacity-50 flex items-center justify-center gap-3 group"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>国赛组长级专家研判中...</span>
                  </div>
                ) : (
                  <>
                    <span>生成全维度专家评审报告</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 结果展示列 */}
        <div className="lg:col-span-8 space-y-12">
          {result ? (
            <div className="space-y-8">
              {/* 顶部操作区 */}
              <div className="flex justify-between items-center px-4 animate-in fade-in slide-in-from-top-2 duration-500">
                <h2 className="text-sm font-black text-cyan-400 uppercase tracking-widest">研判报告已就绪</h2>
                <button 
                  onClick={handleDownloadPDF}
                  disabled={exporting}
                  className="bg-white/5 hover:bg-white/10 text-white text-[11px] font-black px-6 py-2.5 rounded-full border border-white/10 transition-all flex items-center gap-2 group disabled:opacity-50"
                >
                  {exporting ? (
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                  )}
                  <span>{exporting ? '正在生成 PDF...' : '导出 PDF 评估报告'}</span>
                </button>
              </div>

              <div id="report-container" ref={reportRef} className="animate-in fade-in slide-in-from-bottom-5 duration-700 space-y-12 bg-[#020617]">
                
                {/* 1. 雷达诊断 */}
                <section className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 bg-slate-900/60 rounded-[3rem] p-10 border border-white/5 relative overflow-hidden shadow-2xl">
                      <div className="absolute top-0 right-0 p-10 text-right">
                          <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">金奖模型潜力评估</p>
                          <div className="text-6xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                            {result.overallScore}
                          </div>
                      </div>
                      <h3 className="text-lg font-black mb-10 text-gray-400 flex items-center gap-2">
                        <span className="w-2 h-2 bg-cyan-500 rounded-full"></span> 1. 战力雷达多维诊断
                      </h3>
                      <div className="h-72">
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                              <PolarGrid stroke="#1e293b" />
                              <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: '900' }} />
                              <Radar name="得分" dataKey="A" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.5} />
                            </RadarChart>
                          </ResponsiveContainer>
                      </div>
                    </div>
                    <div className="bg-slate-900/60 rounded-[3rem] p-10 border border-white/5 flex flex-col justify-center shadow-xl">
                      <p className="text-[10px] text-cyan-400 font-black mb-4 uppercase tracking-widest">专家会商声明</p>
                      <p className="text-xs text-gray-400 leading-relaxed font-bold italic">
                        本报告深度对标2026年最新评审逻辑，诊断内容涵盖“四新”建设要求，得分仅代表当前思路的初步研判。
                      </p>
                    </div>
                  </div>
                </section>

                {/* 2. 诊断总评 */}
                <section className="bg-slate-900/60 border border-white/5 rounded-[3rem] p-10 shadow-2xl relative">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-cyan-600/20 rounded-2xl flex items-center justify-center text-cyan-500">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
                    </div>
                    <h3 className="text-xl font-black text-white">2. 评审专家组长深度诊断总评</h3>
                  </div>
                  <div className="bg-slate-800/40 p-8 rounded-3xl border-l-4 border-cyan-500 shadow-inner">
                    <p className="text-lg font-serif italic text-gray-200 leading-loose font-medium">
                      “{result.expertComment}”
                    </p>
                  </div>
                </section>

                {/* 3. 各维度打分评价 */}
                <section className="space-y-6">
                  <h3 className="text-xl font-black flex items-center gap-3 ml-2 text-white">
                    <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span> 3. “四新”评审维度明细与短板诊断
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DimensionCard label="创新维度 (技术核心)" data={result.dimensions.innovation} accent="cyan" />
                    <DimensionCard label="教育维度 (培养反哺)" data={result.dimensions.education} accent="blue" />
                    <DimensionCard label="商业维度 (落地成长)" data={result.dimensions.business} accent="amber" />
                    <DimensionCard label="社会价值 (贡献普惠)" data={result.dimensions.social} accent="emerald" />
                  </div>
                </section>

                {/* 4. 精准落地场景和痛点 */}
                <section className="bg-slate-900/60 border border-white/5 rounded-[3.5rem] p-10 space-y-8 shadow-2xl">
                  <h3 className="text-xl font-black flex items-center gap-4 text-white">
                    <span className="text-cyan-500 text-2xl">◈</span> 4. 精准应用场景与痛点透传方案
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {result.implementation.preciseScenarios.map((s, i) => (
                      <div key={i} className="group bg-slate-800/40 p-8 rounded-[2.5rem] border border-white/5 shadow-lg">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-lg font-black text-[10px]">场景分析 {i+1}</span>
                          <h4 className="text-lg font-black text-white">{s.scenario}</h4>
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed font-medium pl-2 border-l-2 border-slate-700">
                          <span className="text-cyan-500/80 font-black text-[10px] block mb-1">解决的核心痛点</span>
                          {s.problemSolved}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* 5. 技术研判 */}
                <section className="bg-slate-900/60 border border-white/5 rounded-[3.5rem] p-10 space-y-10 shadow-2xl relative">
                  <h3 className="text-xl font-black flex items-center gap-4 text-white">
                    <span className="text-red-500 animate-pulse text-2xl">◈</span> 5. 技术细节拆解诊断 (外科手术级)
                  </h3>
                  <div className="space-y-6">
                    {result.implementation.technicalBreakdown.map((item, i) => (
                      <div key={i} className="group grid grid-cols-1 lg:grid-cols-12 gap-1 bg-slate-800/30 rounded-[2.5rem] overflow-hidden border border-white/5 shadow-xl">
                        <div className="lg:col-span-3 bg-slate-800/60 p-8 flex flex-col justify-center border-r border-white/5">
                          <p className="text-[10px] text-gray-500 font-black uppercase mb-2">关键模块</p>
                          <h4 className="text-base font-black text-white">{item.component}</h4>
                        </div>
                        <div className="lg:col-span-4 p-8 bg-red-500/5">
                          <p className="text-[10px] text-red-400 font-black mb-2 flex items-center gap-2">技术局限性诊断</p>
                          <p className="text-xs text-gray-300 leading-relaxed font-medium">{item.issue}</p>
                        </div>
                        <div className="lg:col-span-5 p-8 bg-emerald-500/5">
                          <p className="text-[10px] text-emerald-400 font-black mb-2">建议补强与优化路径</p>
                          <p className="text-xs text-emerald-100/90 leading-relaxed italic font-bold">“{item.optimization}”</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* 6. 商业模式 */}
                <section className="bg-slate-900/60 border border-white/5 rounded-[3.5rem] p-10 space-y-8 shadow-2xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-600/20 rounded-2xl flex items-center justify-center text-amber-500">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <h3 className="text-xl font-black text-white">6. 商业画布框架与企业级盈利闭环</h3>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="bg-slate-800/40 p-8 rounded-[2rem] border border-white/5 shadow-inner">
                        <p className="text-[10px] text-amber-500 font-black uppercase mb-4 tracking-widest border-l-2 border-amber-500 pl-4">商业架构分析</p>
                        <p className="text-sm text-gray-300 leading-relaxed font-medium">{result.implementation.businessModel.framework}</p>
                      </div>
                      <div className="bg-slate-800/40 p-8 rounded-[2rem] border border-white/5">
                        <p className="text-[10px] text-amber-500 font-black uppercase mb-4 tracking-widest border-l-2 border-amber-500 pl-4">核心盈利渠道</p>
                        <div className="flex flex-wrap gap-2">
                          {result.implementation.businessModel.profitModels.map((pm, i) => (
                            <span key={i} className="bg-amber-500/10 text-amber-400 text-[11px] font-black px-5 py-2.5 rounded-full border border-amber-500/20">{pm}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="bg-slate-900/80 p-10 rounded-[2rem] border border-amber-500/10 flex flex-col justify-center shadow-2xl">
                      <p className="text-[10px] text-gray-500 font-black uppercase mb-4 tracking-widest">专家侧真实运营逻辑分析</p>
                      <p className="text-base text-gray-200 leading-loose italic font-medium">
                        {result.implementation.businessModel.operationLogic}
                      </p>
                    </div>
                  </div>
                </section>

                {/* 7. 竞争优势与对标企业 */}
                <section className="bg-slate-900/60 border border-white/5 rounded-[3.5rem] p-10 space-y-10 shadow-2xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-500">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                    </div>
                    <h3 className="text-xl font-black text-white">7. 市场竞争护城河与核心优势对标</h3>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="bg-slate-800/40 p-8 rounded-3xl border border-white/5">
                      <p className="text-[10px] text-gray-500 font-black mb-5 tracking-widest uppercase">行业领先标杆 (产品/企业)</p>
                      <div className="space-y-4">
                        {result.implementation.marketBenchmarking.leaders.map((l, i) => (
                          <div key={i} className="bg-slate-900/60 p-4 rounded-2xl text-sm text-white font-bold flex items-center gap-4 border border-white/5 shadow-lg">
                            <div className="w-2 h-2 bg-blue-500 rounded-full shadow-lg shadow-blue-500"></div> {l}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-blue-600/5 p-8 rounded-3xl border border-blue-500/20 shadow-inner">
                      <p className="text-[10px] text-blue-400 font-black mb-6 tracking-widest uppercase">本项目核心差异化优势</p>
                      <ul className="space-y-4">
                        {result.implementation.marketBenchmarking.ourAdvantages.map((a, i) => (
                          <li key={i} className="text-sm text-blue-50 flex items-start gap-3">
                            <span className="text-blue-500 font-black mt-1 leading-none">▶</span> 
                            <span className="font-bold leading-relaxed">{a}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-6">
                      <div className="bg-slate-800/40 p-6 rounded-2xl border border-white/5">
                        <p className="text-[10px] text-gray-500 font-black mb-3 uppercase tracking-widest">核心竞争壁垒</p>
                        <p className="text-xs text-gray-400 leading-relaxed font-bold italic">{result.implementation.marketBenchmarking.competitiveMoat}</p>
                      </div>
                      <div className="bg-slate-800/40 p-6 rounded-2xl border border-white/5">
                        <p className="text-[10px] text-gray-500 font-black mb-3 uppercase tracking-widest">市场前景综述</p>
                        <p className="text-xs text-gray-400 leading-relaxed font-medium">{result.implementation.marketBenchmarking.marketProspect}</p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 8. 选题进化建议 (魔改方案) */}
                <section className="bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-900/20 border border-cyan-500/30 rounded-[4rem] p-12 space-y-12 shadow-2xl relative overflow-hidden">
                   <div className="flex items-center gap-6 relative">
                      <div className="w-16 h-16 bg-cyan-500 rounded-[1.5rem] flex items-center justify-center text-[#020617] shadow-2xl shadow-cyan-500/40">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      </div>
                      <div>
                        <h3 className="text-3xl font-black text-white tracking-tight">8. 选题进化论：专家组魔改参考方案 (脱敏)</h3>
                        <p className="text-cyan-400 font-bold text-xs uppercase tracking-widest mt-1">Transforming ideas into Gold Medal potential</p>
                      </div>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      {result.topicPivots.map((pivot, i) => (
                        <div key={i} className="group bg-slate-800/60 p-10 rounded-[3rem] border border-white/5 shadow-2xl">
                           <div className="flex justify-between items-start mb-6">
                              <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-4 py-1.5 rounded-full font-black uppercase tracking-widest">建议方案 {i+1}</span>
                           </div>
                           <h4 className="text-2xl font-black text-white mb-4 group-hover:text-cyan-400 transition-colors leading-snug">{pivot.newTitle}</h4>
                           <div className="h-1 bg-cyan-500/20 w-16 mb-8 group-hover:w-full transition-all duration-700"></div>
                           <div className="space-y-4">
                              <p className="text-[11px] text-cyan-500 font-black mb-2 uppercase tracking-widest">进化逻辑研判</p>
                              <p className="text-sm text-gray-300 leading-relaxed font-bold bg-slate-900/40 p-4 rounded-xl italic">“{pivot.logic}”</p>
                              <p className="text-sm text-gray-400 leading-relaxed font-medium mt-4 border-t border-white/5 pt-4">{pivot.potential}</p>
                           </div>
                        </div>
                      ))}
                   </div>
                </section>

                <div className="text-center py-10 opacity-40">
                  <p className="text-xs font-bold text-gray-500 tracking-widest uppercase">本项目报告由创赛智评专家系统生成 • 仅供中国国际大学生创新大赛申报参考</p>
                </div>

              </div>
            </div>
          ) : (
            <div className="h-full min-h-[800px] flex flex-col items-center justify-center bg-slate-900/20 border-2 border-dashed border-white/5 rounded-[5rem] p-20 text-center opacity-70 backdrop-blur-md relative overflow-hidden">
              <div className="w-32 h-32 bg-slate-800 rounded-[3rem] flex items-center justify-center mb-10 shadow-2xl relative z-10">
                 <div className="absolute inset-0 bg-cyan-500/20 blur-3xl rounded-full animate-pulse"></div>
                 <svg className="w-16 h-16 text-cyan-500 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A3.323 3.323 0 0010.603 2.022M3.136 12c0 2.136 1.05 4.025 2.664 5.174l-.196 2.056a1.2 1.2 0 001.442 1.298l2.132-.355c.961.54 2.062.85 3.238.85 3.313 0 6-2.687 6-6V9a2 2 0 114 0c0 3.313-2.687 6-6 6h-1.442a1.2 1.2 0 00-1.127.81L11 21M7 9a2 2 0 114 0 2 2 0 01-4 0z" /></svg>
              </div>
              <h2 className="text-4xl font-black mb-6 tracking-tight text-white relative z-10 font-serif">国赛级专家决策桌面</h2>
              <p className="text-gray-400 max-w-xl font-bold text-base leading-relaxed relative z-10">
                录入您的选题信息（含技术与场景细节）。系统将为您深度对标2026年最新评审趋势，提供包含技术外科手术级诊断、商业盈利闭环分析及选题魔改方案在内的全维度专家研判报告。
              </p>
              <div className="mt-12 flex gap-4 relative z-10 opacity-50">
                <span className="px-5 py-2.5 bg-slate-800 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 shadow-xl">“四新”评审模型</span>
                <span className="px-5 py-2.5 bg-slate-800 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 shadow-xl">全赛道深度覆盖</span>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
