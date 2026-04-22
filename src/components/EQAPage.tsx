import React, { useState } from 'react';
import { Plus, History, Activity, Award, TrendingUp, Info, Trash2, Beaker } from 'lucide-react';
import { EQARecord, QCConfig, Instrument } from '../types';
import { calculateEQASigma, getThaiSigmaRecommendation } from '../lib/qcLogic';
import { motion } from 'motion/react';

interface EQAPageProps {
  eqaRecords: EQARecord[];
  onAddEQA: (record: EQARecord) => void;
  onDeleteEQA: (id: string) => void;
  configs: QCConfig[];
  instruments: Instrument[];
}

export default function EQAPage({ eqaRecords, onAddEQA, onDeleteEQA, configs, instruments }: EQAPageProps) {
  const [testId, setTestId] = useState(configs[0]?.id || '');
  const [instId, setInstId] = useState(instruments[0]?.id || '');
  const [yourResult, setYourResult] = useState('');
  const [targetMean, setTargetMean] = useState('');
  const [peerSD, setPeerSD] = useState('');
  const [tea, setTea] = useState('10');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = parseFloat(yourResult);
    const target = parseFloat(targetMean);
    const sd = parseFloat(peerSD);
    const teaVal = parseFloat(tea);

    const { bias, cv, sigma } = calculateEQASigma(res, target, sd, teaVal);

    const record: EQARecord = {
      id: `eqa-${Date.now()}`,
      testId,
      instrumentId: instId,
      date: new Date().toISOString(),
      yourResult: res,
      targetMean: target,
      peerSD: sd,
      teaPercentage: teaVal,
      bias,
      cv,
      sigma
    };

    onAddEQA(record);
    setYourResult('');
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Input Form */}
        <div className="xl:col-span-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm sticky top-8">
            <div className="flex items-center space-x-2 mb-6 text-[#0F4C81]">
              <Plus size={20} />
              <h3 className="font-bold">เพิ่มผลการทดสอบ EQA</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Test Parameter</label>
                  <select
                    value={testId}
                    onChange={e => setTestId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 outline-none"
                  >
                    {configs.map(c => <option key={c.id} value={c.id}>{c.testName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Machine / Instrument</label>
                  <select
                    value={instId}
                    onChange={e => setInstId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium outline-none"
                  >
                    {instruments.map(i => <option key={i.id} value={i.id}>{i.name} ({i.model})</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t pt-4">
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Your Result</label>
                  <input
                    type="number" step="0.001" required value={yourResult}
                    onChange={e => setYourResult(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-mono"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Target Mean</label>
                  <input
                    type="number" step="0.001" required value={targetMean}
                    onChange={e => setTargetMean(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Peer Group SD</label>
                  <input
                    type="number" step="0.001" required value={peerSD}
                    onChange={e => setPeerSD(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-mono"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">%TEa Limit</label>
                  <input
                    type="number" step="0.1" required value={tea}
                    onChange={e => setTea(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-mono"
                  />
                </div>
              </div>

              <button type="submit" className="w-full bg-[#0F4C81] text-white font-bold py-4 rounded-xl shadow-lg shadow-[#0F4C81]/20 hover:scale-[1.01] transition-transform">
                วิเคราะห์ผล EQA (Calculate Sigma)
              </button>
            </form>
          </div>
        </div>

        {/* History and Analysis */}
        <div className="xl:col-span-8 space-y-8">
          {eqaRecords.length > 0 ? (
            eqaRecords.slice().reverse().map((record, idx) => {
              const test = configs.find(c => c.id === record.testId);
              const inst = instruments.find(i => i.id === record.instrumentId);
              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={record.id}
                  className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
                >
                  <div className="bg-slate-50 px-8 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white rounded-xl shadow-sm text-[#0F4C81]">
                        <Award size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-[#0F4C81]">{test?.testName || 'Unknown Test'}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{inst?.name} • {new Date(record.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <button onClick={() => onDeleteEQA(record.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sigma Score</p>
                        <p className={`text-4xl font-black ${record.sigma >= 6 ? 'text-emerald-600' : record.sigma >= 3 ? 'text-amber-500' : 'text-red-500'}`}>
                          {record.sigma.toFixed(2)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bias % (Accuracy)</p>
                        <p className="text-4xl font-black text-slate-800">{record.bias.toFixed(2)}%</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">CV % (Precision)</p>
                        <p className="text-4xl font-black text-slate-800">{record.cv.toFixed(2)}%</p>
                      </div>
                    </div>

                    <div className="bg-[#0F4C81]/5 rounded-2xl border border-[#0F4C81]/10 p-6">
                      <div className="flex items-start space-x-4">
                        <div className="p-2 bg-[#0F4C81] text-white rounded-lg shrink-0 mt-1">
                          <Info size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#0F4C81] mb-2">คำแนะนำทางเทคนิคการแพทย์ (Medical Recommendation)</p>
                          <p className="text-sm text-slate-700 leading-relaxed font-medium italic">
                            "{getThaiSigmaRecommendation(record.sigma, record.bias, record.cv)}"
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center p-20 bg-white rounded-3xl border border-dashed border-slate-300">
               <Beaker size={48} className="text-slate-200 mb-4" />
               <p className="text-slate-400 font-bold mb-1">ยังไม่มีข้อมูล EQA</p>
               <p className="text-xs text-slate-400">กรอกข้อมูลทางด้านซ้ายเพื่อประเมินค่า Sigma และประสิทธิภาพเครื่องวิเคราะห์</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
