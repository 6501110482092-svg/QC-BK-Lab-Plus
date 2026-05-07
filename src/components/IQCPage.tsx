import React, { useState, useRef } from 'react';
import { Plus, History, Activity, Info, TrendingUp, Award, ShieldAlert, FileText, X, Printer, Camera } from 'lucide-react';
import { QCResult, QCConfig, Instrument, EQARecord } from '../types';
import { checkWestgardRules, getThaiSigmaRecommendation } from '../lib/qcLogic';
import LJChart from './LJChart';

interface IQCPageProps {
  results: QCResult[];
  onAddResult: (result: QCResult) => void;
  onDeleteResult: (id: string) => void;
  configs: QCConfig[];
  instruments: Instrument[];
  eqaRecords: EQARecord[];
  currentUser: any;
}

export default function IQCPage({ results, onAddResult, onDeleteResult, configs, instruments, eqaRecords, currentUser }: IQCPageProps) {
  const [selectedTest, setSelectedTest] = useState<string>(configs[0]?.id || '');
  const [selectedInst, setSelectedInst] = useState<string>(instruments[0]?.id || '');
  const [level, setLevel] = useState<1 | 2 | 3>(1);
  const [value, setValue] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [showReport, setShowReport] = useState(false);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '3m' | 'all'>('30d');

  const exportRef = useRef<HTMLDivElement>(null);

  const config = configs.find((c) => c.id === selectedTest);
  if (!config) return <div className="text-center py-20 text-slate-400">Please register a test in settings.</div>;

  const currentLevelParams = level === 1 ? config.level1 : (level === 2 ? config.level2 : config.level3);
  
  // Find the latest EQA Sigma for this combination
  const latestEQA = eqaRecords.filter(r => r.testId === selectedTest && r.instrumentId === selectedInst).pop();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value || !currentLevelParams) return;

    const numValue = parseFloat(value);
    const violations = checkWestgardRules(numValue, results, config, level, selectedInst, latestEQA?.sigma);

    const newResult: QCResult = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      value: numValue,
      level,
      instrumentId: selectedInst,
      testId: selectedTest,
      operatorId: currentUser.id,
      operatorName: currentUser.name,
      comment,
      westgardViolations: violations,
    };

    onAddResult(newResult);
    setValue('');
    setComment('');
  };

  const currentInstrument = instruments.find(i => i.id === selectedInst);

  const filteredResults = React.useMemo(() => {
    let filtered = results.filter(r => r.level === level && r.testId === selectedTest && r.instrumentId === selectedInst);
    
    if (dateRange === 'all') return filtered;

    const now = new Date();
    const cutoff = new Date();
    if (dateRange === '7d') cutoff.setDate(now.getDate() - 7);
    else if (dateRange === '30d') cutoff.setDate(now.getDate() - 30);
    else if (dateRange === '3m') cutoff.setMonth(now.getMonth() - 3);

    return filtered.filter(r => new Date(r.date) >= cutoff);
  }, [results, level, selectedTest, selectedInst, dateRange]);

  const levelParams = level === 1 ? config.level1 : (level === 2 ? config.level2 : config.level3);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Input Form */}
        <div className="xl:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:border-[#0F4C81]/30">
            <div className="flex items-center space-x-2 mb-6 text-[#0F4C81]">
              <Plus size={20} />
              <h3 className="font-bold">บันทึกผลการตรวจ IQC</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 label-thai">รายการทดสอบ (Test Parameter)</label>
                <select 
                  value={selectedTest}
                  onChange={(e) => setSelectedTest(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 outline-none"
                >
                  {configs.map(c => <option key={c.id} value={c.id}>{c.testName}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 label-thai">เครื่องวิเคราะห์ (Instrument)</label>
                <select 
                  value={selectedInst}
                  onChange={(e) => setSelectedInst(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium outline-none"
                >
                  {instruments.map(i => <option key={i.id} value={i.id}>{i.name} ({i.model})</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 label-thai">ระดับการคุม (Control Level)</label>
                  <div className="flex bg-slate-100 p-1 rounded-xl">
                    {[1, 2, 3].map(l => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => setLevel(l as any)}
                        className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                          level === l ? 'bg-white text-[#0F4C81] shadow-sm' : 'text-slate-500'
                        }`}
                      >
                        LV{l}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 label-thai">ผลการวิเคราะห์ ({config.unit})</label>
                  <input
                    type="number" step="0.001" required value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-[#0F4C81]/10 outline-none"
                  />
                </div>
              </div>

              <button type="submit" className="w-full bg-[#0F4C81] text-white font-bold py-3.5 rounded-xl hover:scale-[1.01] transition-transform shadow-lg shadow-[#0F4C81]/20">
                เพิ่มข้อมูล IQC (Add Run)
              </button>
            </form>
          </div>

          {/* Six Sigma Performance Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
               <TrendingUp size={80} />
            </div>
            <div className="flex items-center space-x-2 mb-6 text-[#0F4C81]">
               <Award size={20} />
               <h3 className="font-bold">Six Sigma Performance</h3>
            </div>
            
            {latestEQA ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                   <div className="text-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Sigma (จาก EQA)</p>
                      <p className={`text-2xl font-black ${latestEQA.sigma >= 6 ? 'text-emerald-600' : latestEQA.sigma >= 3 ? 'text-amber-500' : 'text-red-500'}`}>
                        {latestEQA.sigma.toFixed(2)}
                      </p>
                   </div>
                   <div className="text-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Bias %</p>
                      <p className="text-2xl font-black text-slate-700">
                        {latestEQA.bias.toFixed(2)}%
                      </p>
                   </div>
                </div>

                <div className="flex items-start space-x-3 p-4 bg-[#0F4C81]/5 rounded-xl border border-[#0F4C81]/10">
                  <ShieldAlert size={18} className="text-[#0F4C81] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-black text-[#0F4C81] uppercase tracking-wider mb-1">คำแนะนำทางเทคนิค</p>
                    <p className="text-[11px] text-[#0F4C81] leading-relaxed italic font-medium">
                      "{getThaiSigmaRecommendation(latestEQA.sigma, latestEQA.bias, latestEQA.cv)}"
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-slate-400 text-xs font-bold px-4">ยังไม่มีข้อมูล EQA สำหรับชุดตรวจนี้ กรุณาบันทึกข้อมูลในเมนู EQA ก่อน</p>
              </div>
            )}
          </div>
        </div>

        {/* Charts and History */}
        <div className="xl:col-span-8 space-y-8">
          <div ref={exportRef} id="export-area" className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <div className="flex flex-col space-y-1">
                <div className="flex items-center space-x-3 text-[#0F4C81]">
                  <Activity size={20} />
                  <h3 className="font-bold">Levey-Jennings: {config.testName} (Level {level})</h3>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Filter:</span>
                  {(['7d', '30d', '3m', 'all'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setDateRange(r)}
                      className={`text-[9px] font-black px-2 py-0.5 rounded-full border transition-all ${
                        dateRange === r 
                        ? 'bg-[#0F4C81] text-white border-[#0F4C81]' 
                        : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {r === '7d' ? '7 วันล่าสุด' : r === '30d' ? '30 วันล่าสุด' : r === '3m' ? '3 เดือนล่าสุด' : 'ทั้งหมด'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setShowReport(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-[#0F4C81] hover:bg-[#0b3a63] text-white rounded-xl text-xs font-black transition-all shadow-lg shadow-blue-900/20"
                >
                  <FileText size={14} />
                  <span>View Full Report</span>
                </button>
              </div>
            </div>
            <LJChart results={filteredResults} config={config} level={level} instrumentId={selectedInst} />
            
            {/* Sigma Summary in Export Area */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
               <div>
                 <p className="text-[9px] font-bold text-slate-400 uppercase">Target Mean</p>
                 <p className="font-bold text-slate-700">{levelParams?.mean}</p>
               </div>
               <div>
                 <p className="text-[9px] font-bold text-slate-400 uppercase">Target SD</p>
                 <p className="font-bold text-slate-700 text-sm">{levelParams?.sd}</p>
               </div>
               <div>
                 <p className="text-[9px] font-bold text-slate-400 uppercase">Target CV %</p>
                 <p className="font-bold text-emerald-600 text-sm">{levelParams?.cv?.toFixed(2)}%</p>
               </div>
               <div>
                 <p className="text-[9px] font-bold text-slate-400 uppercase">Bias %</p>
                 <p className="font-bold text-slate-700 text-sm">{latestEQA?.bias.toFixed(2) || '0.00'}%</p>
               </div>
               <div className="md:border-l md:pl-4">
                 <p className="text-[9px] font-bold text-slate-400 uppercase">Six Sigma</p>
                 <p className={`font-black text-sm ${latestEQA && latestEQA.sigma >= 6 ? 'text-emerald-600' : 'text-[#0F4C81]'}`}>
                   {latestEQA?.sigma.toFixed(2) || 'N/A'}
                 </p>
               </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center space-x-2">
               <ShieldAlert size={18} className="text-slate-400" />
               <h3 className="font-bold">Recent Level {level} Runs</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <tr>
                    <th className="px-6 py-3">Timestamp</th>
                    <th className="px-6 py-3">Operator</th>
                    <th className="px-6 py-3">Value</th>
                    <th className="px-6 py-3">Sigma-Z</th>
                    <th className="px-6 py-3">Westgard</th>
                    {currentUser.role === 'ADMIN' && <th className="px-6 py-3 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                   {filteredResults
                    .slice().reverse().map(r => (
                      <tr key={r.id}>
                        <td className="px-6 py-3 text-xs">{new Date(r.date).toLocaleString('th-TH')}</td>
                        <td className="px-6 py-3 font-medium text-slate-500">{r.operatorName || 'System'}</td>
                        <td className="px-6 py-3 font-mono font-bold text-slate-700">{r.value}</td>
                        <td className="px-6 py-3 font-mono text-slate-400">
                           {((r.value - currentLevelParams!.mean) / currentLevelParams!.sd).toFixed(2)}
                        </td>
                        <td className="px-6 py-3">
                           {r.westgardViolations.length > 0 ? (
                             <span className="text-red-500 font-bold px-2 py-0.5 bg-red-50 rounded text-xs">
                                {r.westgardViolations.join(', ')}
                             </span>
                           ) : <span className="text-emerald-500 font-bold text-xs ring-1 ring-emerald-100 px-2 py-0.5 rounded">PASSED</span>}
                        </td>
                        {currentUser.role === 'ADMIN' && (
                          <td className="px-6 py-3 text-right">
                             <button 
                               onClick={() => {
                                 if(window.confirm('Delete this record?')) onDeleteResult(r.id);
                               }}
                               className="text-red-400 hover:text-red-600 font-bold text-xs"
                             >
                               Delete
                             </button>
                          </td>
                        )}
                      </tr>
                   ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <ReportModal
        isOpen={showReport}
        onClose={() => setShowReport(false)}
        config={config}
        level={level}
        instrument={currentInstrument}
        levelParams={levelParams}
        eqa={latestEQA}
        results={filteredResults}
      />
    </div>
  );
}

function ReportModal({ 
  isOpen, 
  onClose, 
  config, 
  level, 
  instrument, 
  levelParams, 
  eqa, 
  results 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  config: QCConfig, 
  level: number, 
  instrument?: Instrument, 
  levelParams?: any, 
  eqa?: EQARecord, 
  results: QCResult[] 
}) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto cursor-pointer"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl my-8 cursor-default" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white px-8 py-4 border-b flex items-center justify-between z-10">
           <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 text-[#0F4C81] rounded-lg">
                <Camera size={20} />
              </div>
              <div>
                <h3 className="font-black text-slate-800">IQC Full Report View</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Screenshot Mode (กรุณาถ่ายภาพหน้าจอนี้เก็บไว้)</p>
              </div>
           </div>
           <div className="flex items-center space-x-3">
              <button 
                onClick={() => window.print()}
                className="flex items-center space-x-1 px-3 py-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                title="Print to PDF"
              >
                <Printer size={18} />
                <span className="text-xs font-bold">พิมพ์/PDF</span>
              </button>
              <button 
                onClick={onClose}
                className="flex items-center space-x-1 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-all border border-red-100 shadow-sm shadow-red-200/50"
                title="Close"
              >
                <X size={18} />
                <span className="text-xs font-black uppercase">ปิดหน้าจอ</span>
              </button>
           </div>
        </div>

        <div className="p-6 space-y-4 print:p-0" id="print-area">
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-3">
            <div>
              <h1 className="text-xl font-black text-[#0F4C81] mb-0.5 uppercase tracking-tighter">IQC Analysis Report</h1>
              <div className="flex items-center space-x-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                 <span>{config.testName}</span>
                 <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                 <span>Level {level}</span>
                 <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                 <span>{new Date().toLocaleDateString('th-TH')}</span>
              </div>
            </div>
            <div className="text-right">
               <p className="text-[8px] font-black text-slate-400 uppercase">Lab Name</p>
               <p className="text-xs font-black text-slate-800">BK LAB PLUS</p>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
             <div>
                <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">Instrument</p>
                <p className="text-[10px] font-black text-slate-700 truncate">{instrument?.name || 'N/A'}</p>
                <p className="text-[9px] font-bold text-slate-400">{instrument?.model || '-'}</p>
             </div>
             <div>
                <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">Target Params</p>
                <div className="text-[10px] font-black text-slate-700 flex flex-wrap gap-x-2">
                   <span>M: {levelParams?.mean}</span>
                   <span>SD: {levelParams?.sd}</span>
                   <span>CV: {levelParams?.cv}%</span>
                </div>
             </div>
             <div>
                <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">Comparison</p>
                <div className="text-[10px] font-black text-slate-700 flex flex-wrap gap-x-2">
                   <span>Sigma: {eqa?.sigma.toFixed(2) || 'N/A'}</span>
                   <span>Bias: {eqa?.bias.toFixed(2) || '0'}%</span>
                </div>
             </div>
             <div className="text-right">
                <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">Unit</p>
                <p className="text-base font-black text-[#0F4C81]">{config.unit}</p>
             </div>
          </div>

          {/* Chart Section */}
          <div className="space-y-2">
             <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-l-2 border-[#0F4C81] pl-2">Levey-Jennings Chart Analysis</h4>
             <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-sm overflow-hidden h-[240px]">
                <LJChart results={results} config={config} level={level as any} instrumentId={instrument?.id || ''} />
             </div>
          </div>

          {/* Data Table */}
          <div className="space-y-2">
             <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-l-2 border-[#0F4C81] pl-2">Raw QC History</h4>
             <div className="overflow-hidden rounded-xl border border-slate-100">
                <table className="w-full text-left text-[9px]">
                  <thead className="bg-[#0F4C81] text-white font-black uppercase tracking-wider">
                    <tr>
                      <th className="px-3 py-1.5">Timestamp</th>
                      <th className="px-3 py-1.5">Operator</th>
                      <th className="px-3 py-1.5 text-center">Value</th>
                      <th className="px-3 py-1.5 text-center">Z-Score</th>
                      <th className="px-3 py-1.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 italic">
                    {results.slice().reverse().slice(0, 10).map(r => (
                      <tr key={r.id}>
                        <td className="px-3 py-1 font-bold text-slate-500">{new Date(r.date).toLocaleString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
                        <td className="px-3 py-1 truncate max-w-[80px]">{r.operatorName}</td>
                        <td className="px-3 py-1 font-black text-slate-800 text-center">{r.value}</td>
                        <td className="px-3 py-1 text-slate-400 text-center">
                           {((r.value - levelParams!.mean) / levelParams!.sd).toFixed(2)}
                        </td>
                        <td className="px-3 py-1">
                           {r.westgardViolations.length > 0 ? (
                             <span className="text-red-600 font-bold text-[8px]">{r.westgardViolations.join(', ')}</span>
                           ) : <span className="text-emerald-600 font-black">PASS</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </div>

          {/* Footer Signature */}
          <div className="flex justify-between items-end pt-4 border-t border-dashed border-slate-200">
             <div className="flex space-x-8">
                <div className="space-y-1">
                   <p className="text-[8px] font-black text-slate-400 uppercase">Operator Signature</p>
                   <div className="w-32 border-b border-slate-900 h-4"></div>
                </div>
                <div className="space-y-1">
                   <p className="text-[8px] font-black text-slate-400 uppercase">Supervisor Review</p>
                   <div className="w-32 border-b border-slate-900 h-4"></div>
                </div>
             </div>
             <div className="text-right">
                <p className="text-[7px] font-bold text-slate-300">BK-LAB IQC v2.1 • {new Date().toLocaleTimeString('th-TH')}</p>
             </div>
          </div>
        </div>
      </div>
      
      {/* Report Modal Backdrop logic */}
      <ReportModalPortal />
    </div>
  );
}

function ReportModalPortal() {
  return null; // Just to avoid unused warning in block, handled by parent
}
