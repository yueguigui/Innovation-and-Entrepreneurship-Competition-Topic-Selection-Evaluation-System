
import React, { useState } from 'react';
import { Idea, EvaluationResult, IdeaCategory, DimensionDetail } from './types';
import { evaluateIdea } from './services/geminiService';
import { 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, 
  ResponsiveContainer
} from 'recharts';

const DimensionCard: React.FC<{ label: string; data: DimensionDetail; accent: string }> = ({ label, data, accent }) => (
  <div className={`bg-slate-800/50 border border-${accent}-500/20 rounded-3xl p-6 space-y-4`}>
    <div className="flex justify-between items-center border-b border-white/5 pb-3">
      <h5 className={`text-sm font-black text-${accent}-400`}>{label}</h5>
      <span className="text-xl font-black text-white">{data.score}<span className="text-[10px] text-gray-500 font-normal">/{data.maxScore}</span></span>
    </div>
    <div className="space-y-3">
      <div>
        <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">关键得分点</p>
        <div className="flex flex-wrap gap-2">
          {data.scoringPoints.map((p, i) => (
            <span key={i} className={`bg-${accent}-500/10 text-${accent}-300 text-[10px] px-2 py-0.5 rounded-md border border-${accent}-500/20`}>{p}</span>
          ))}
        </div>
      </div>
      {data.bridgeStrategy ? (
        <div className="bg-cyan-500/5 p-3 rounded-xl border border-cyan-500/10">
          <p className="text-[10px] text-cyan-400 font-bold uppercase mb-1">维度关联建议</p>
          <p className="text-xs text-cyan-200/80 leading-relaxed italic">{data.bridgeStrategy}</p>
        </div>
      ) : (
        <>
          <div>
            <p className="text-[10px] text-orange-400 font-bold uppercase mb-1">诊断问题</p>
            <p className="text-xs text-gray-300">{data.weakness}</p>
          </div>
          <div>
            <p className="text-[10px] text-emerald-400 font-bold uppercase mb-1">改进建议</p>
            <p className="text-xs text-gray-300">{data.improvement}</p>
          </div>
        </>
      )}
    </div>
  </div>
);

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [idea, setIdea] = useState<Idea>({
    title: '',
    description: '',
    category: IdeaCategory.AI_NATIVE,
    track: '高教主赛道'
  });
  const [result, setResult] = useState<EvaluationResult | null>(null);

  const handleEvaluate = async () => {
    if (!idea.title || !idea.description) {
      alert("请完整填写项目标题与思路描述");
      return;
    }
    setLoading(true);
    try {
      const evaluation = await evaluateIdea(idea);
      setResult(evaluation);
    } catch (error) {
      console.error(error);
      alert("专家系统会商异常，请重试");
    } finally {
      setLoading(false);
    }
  };

  const radarData = result ? [
    { subject: '创新', A: (result.dimensions.innovation.score / 30) * 10 },
    { subject: '教育', A: (result.dimensions.education.score / 30) * 10 },
    { subject: '商业', A: (result.dimensions.business.score / 15) * 10 },
    { subject: '团队', A: (result.dimensions.team.score / 15) * 10 },
    { subject: '社会', A: (result.dimensions.social.score / 10) * 10 },
  ] : [];

  return (
    <div className="min-h-screen bg-[#020617] text-gray-100 pb-20 selection:bg-cyan-500/30">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-900/20 blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-900/20 blur-[120px]"></div>
      </div>

      <header className="sticky top-0 z-50 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5 py-4 px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-cyan-500/20">创</div>
            <div>
              <h1 className="font-black tracking-tight text-lg">创赛智评专家系统</h1>
              <p className="text-[10px] text-cyan-400 font-bold tracking-widest uppercase">Expert Strategy Desk 2026</p>
            </div>
          </div>
          <div className="hidden lg:block text-right">
            <p className="text-[10px] text-gray-500 font-black uppercase">Session Active</p>
            <p className="text-xs font-bold text-gray-400">2026 评审逻辑已加载</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Input Column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900/50 border border-white/5 rounded-[2.5rem] p-8 space-y-6 shadow-2xl">
            <h3 className="text-lg font-black flex items-center gap-2">
              <span className="w-1.5 h-6 bg-cyan-500 rounded-full"></span>
              选题初始化
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase px-2">赛道/领域</label>
                <div className="grid grid-cols-1 gap-2 mt-1">
                  <select 
                    value={idea.track}
                    onChange={(e) => setIdea({...idea, track: e.target.value as any})}
                    className="w-full bg-slate-800 border-none p-3 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-cyan-500 outline-none"
                  >
                    <option>高教主赛道</option>
                    <option>红旅赛道</option>
                    <option>职教赛道</option>
                    <option>产业赛道</option>
                  </select>
                  <select 
                    value={idea.category}
                    onChange={(e) => setIdea({...idea, category: e.target.value as IdeaCategory})}
                    className="w-full bg-slate-800 border-none p-3 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-cyan-500 outline-none"
                  >
                    {Object.values(IdeaCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase px-2">项目战略标题</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-800 border-none p-4 rounded-2xl mt-1 focus:ring-2 focus:ring-cyan-500 outline-none font-bold"
                  placeholder="请输入当前项目名..."
                  value={idea.title}
                  onChange={(e) => setIdea({...idea, title: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase px-2">核心思路构思</label>
                <textarea 
                  rows={8}
                  className="w-full bg-slate-800 border-none p-4 rounded-2xl mt-1 focus:ring-2 focus:ring-cyan-500 outline-none text-sm leading-relaxed"
                  placeholder="详细描述您的技术路线或服务模式..."
                  value={idea.description}
                  onChange={(e) => setIdea({...idea, description: e.target.value})}
                />
              </div>
              <button 
                onClick={handleEvaluate}
                disabled={loading}
                className="w-full bg-cyan-600 hover:bg-cyan-500 py-5 rounded-3xl font-black shadow-xl shadow-cyan-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <span className="animate-pulse">专家组正在深度研判...</span> : "生成 2026 深度诊断报告"}
              </button>
            </div>
          </div>
        </div>

        {/* Output Column */}
        <div className="lg:col-span-8">
          {result ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
              
              {/* Radar & Score Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-slate-900/50 rounded-[2.5rem] p-8 border border-white/5 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-8">
                      <div className="text-[10px] text-gray-500 font-black uppercase text-right">综合推荐得分</div>
                      <div className="text-4xl font-black text-cyan-500">{result.overallScore}</div>
                   </div>
                   <h3 className="text-sm font-black mb-6 uppercase">五维战力诊断</h3>
                   <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                          <PolarGrid stroke="#1e293b" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} />
                          <Radar name="Project" dataKey="A" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.4} />
                        </RadarChart>
                      </ResponsiveContainer>
                   </div>
                </div>
                <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900/40 rounded-[2.5rem] p-8 border border-indigo-500/20">
                   <h3 className="text-sm font-black mb-4 uppercase">专家总评</h3>
                   <p className="text-lg font-serif italic text-gray-300 leading-relaxed italic">
                      “{result.expertComment}”
                   </p>
                </div>
              </div>

              {/* Detailed Dimensions Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DimensionCard label="创新维度 (Innovation)" data={result.dimensions.innovation} accent="cyan" />
                <DimensionCard label="教育维度 (Education)" data={result.dimensions.education} accent="blue" />
                <DimensionCard label="商业维度 (Business)" data={result.dimensions.business} accent="amber" />
                <DimensionCard label="社会价值 (Social)" data={result.dimensions.social} accent="emerald" />
              </div>

              {/* Topic Evolutions */}
              <div className="bg-white/5 border border-cyan-500/30 rounded-[3rem] p-10 space-y-8">
                 <h3 className="text-2xl font-black flex items-center gap-3">
                    <span className="text-cyan-500">◈</span> 选题进化论：建议升级方向
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {result.topicPivots.map((pivot, i) => (
                      <div key={i} className="bg-slate-800 p-6 rounded-3xl border border-white/5 group hover:border-cyan-500/50 transition-all">
                         <h4 className="text-lg font-black text-white mb-2 group-hover:text-cyan-400 transition-colors">{pivot.newTitle}</h4>
                         <p className="text-xs text-cyan-500 font-bold mb-3 uppercase tracking-tighter">逻辑：{pivot.logic}</p>
                         <p className="text-sm text-gray-400 leading-relaxed">{pivot.potential}</p>
                      </div>
                    ))}
                 </div>
              </div>

              {/* Implementation Deep Dive */}
              <div className="bg-slate-900/50 border border-white/5 rounded-[3rem] p-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
                 <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-black text-gray-500 uppercase mb-4 tracking-widest flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></span> 落地场景与痛点解决
                      </h4>
                      <p className="text-sm text-gray-200 leading-loose mb-4">{result.implementation.painPointSolving}</p>
                      <div className="flex flex-wrap gap-2">
                        {result.implementation.preciseScenarios.map((s, i) => (
                          <span key={i} className="bg-cyan-500/10 text-cyan-400 text-[10px] font-bold px-3 py-1 rounded-full border border-cyan-500/20">应用场景: {s}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-gray-500 uppercase mb-4 tracking-widest flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span> 技术预警与改进路径
                      </h4>
                      <ul className="space-y-2 mb-4">
                        {result.implementation.technicalShortcomings.map((ts, i) => (
                          <li key={i} className="text-xs text-red-400/80 font-medium">• {ts}</li>
                        ))}
                      </ul>
                      <div className="p-4 bg-red-500/5 rounded-2xl border border-red-500/10 text-xs text-gray-400 italic">
                        改进方向：{result.implementation.researchRoadmap}
                      </div>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div className="bg-emerald-500/5 p-6 rounded-[2rem] border border-emerald-500/10">
                      <h4 className="text-sm font-black text-emerald-400 uppercase mb-4 tracking-widest">商业运营框架</h4>
                      <div className="space-y-4">
                        <div>
                          <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">盈利模型</p>
                          <p className="text-xs text-emerald-200/80">{result.businessFramework.revenueModel}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">商业闭环</p>
                          <p className="text-xs text-gray-400">{result.businessFramework.businessFramework}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-blue-500/5 p-6 rounded-[2rem] border border-blue-500/10">
                      <h4 className="text-sm font-black text-blue-400 uppercase mb-4 tracking-widest">行业对标与竞争优势</h4>
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {result.businessFramework.benchmarks.map((b, i) => (
                            <span key={i} className="text-[10px] font-bold text-blue-300 border border-blue-500/20 px-2 py-0.5 rounded-md italic">Benchmarking: {b}</span>
                          ))}
                        </div>
                        <p className="text-xs text-gray-200 font-medium">核心优势：{result.businessFramework.competitiveAdvantages}</p>
                      </div>
                    </div>
                 </div>
              </div>

            </div>
          ) : (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-slate-900/20 border-2 border-dashed border-white/5 rounded-[3rem] p-20 text-center opacity-60">
              <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center mb-8 shadow-2xl">
                 <svg className="w-10 h-10 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 4a2 2 0 114 0v1a2 2 0 002 2 2 2 0 012 2v2.94l-2.09 2.09a1.998 1.998 0 01-2.83 0l-2.59-2.6a1.998 1.998 0 00-2.83 0L7 14.41V6a2 2 0 012-2h2z" /></svg>
              </div>
              <h2 className="text-2xl font-black mb-4">专家研判席等待接入</h2>
              <p className="text-gray-500 max-w-sm font-bold text-sm leading-relaxed">
                输入您的初期选题思路，我们将基于近三年大赛规则和 2026 预测趋势，为您生成全维度的深度诊断报告。
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
