import React, { useState, useRef } from 'react';
import { Plus, History, Activity, Info, TrendingUp, Award, ShieldAlert, FileDown, Image as ImageIcon, FileText } from 'lucide-react';
import { QCResult, QCConfig, Instrument, EQARecord } from '../types';
import { checkWestgardRules, getThaiSigmaRecommendation } from '../lib/qcLogic';
import LJChart from './LJChart';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

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
  const [isExporting, setIsExporting] = useState(false);
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

  const handleExportPDF = async () => {
    if (!exportRef.current) return;
    setIsExporting(true);
    
    try {
      // Capture the chart area first
      // We use html2canvas to capture the visual representation
      const canvas = await html2canvas(exportRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
        allowTaint: true
      });
      const chartImgData = canvas.toDataURL('image/jpeg', 0.95);

      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 14;
      
      // Header
      doc.setFontSize(18);
      doc.setTextColor(15, 76, 129); // #0F4C81
      doc.text('IQC Analysis Report', margin, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Export Date: ${new Date().toLocaleString('th-TH')}`, margin, 27);
      
      // 1. Info Table
      (doc as any).autoTable({
        startY: 35,
        head: [['Parameter', 'Detail']],
        body: [
          ['Test Name', config.testName],
          ['Instrument', `${currentInstrument?.name} (${currentInstrument?.model})`],
          ['Control Level', `Control Level ${level}`],
          ['Mean', levelParams?.mean.toString()],
          ['SD', levelParams?.sd.toString()],
          ['CV %', `${levelParams?.cv?.toString()}%`],
          ['Unit', config.unit],
          ['Latest Sigma', latestEQA?.sigma.toFixed(2) || 'N/A'],
          ['Bias %', latestEQA?.bias.toFixed(2) || 'N/A'],
        ],
        theme: 'striped',
        headStyles: { fillColor: [15, 76, 129] },
        styles: { fontSize: 9 }
      });

      // 2. Chart Image
      const chartY = (doc as any).lastAutoTable.finalY + 10;
      doc.text('Levey-Jennings Chart & Statistics Summary', margin, chartY);
      
      const imgWidth = pageWidth - (margin * 2);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Check if we need a new page for the chart
      if (chartY + imgHeight + 10 > doc.internal.pageSize.getHeight()) {
        doc.addPage();
        doc.addImage(chartImgData, 'JPEG', margin, 15, imgWidth, imgHeight);
      } else {
        doc.addImage(chartImgData, 'JPEG', margin, chartY + 5, imgWidth, imgHeight);
      }

      // 3. Data Table (Always new page for clarity)
      doc.addPage();
      doc.setFontSize(14);
      doc.setTextColor(15, 76, 129);
      doc.text('Historical QC Data Table', margin, 20);

      const tableData = filteredResults.map(r => [
        new Date(r.date).toLocaleString('th-TH'),
        r.operatorName,
        r.value,
        levelParams ? ((r.value - levelParams.mean) / levelParams.sd).toFixed(2) : 'N/A',
        r.westgardViolations.length > 0 ? r.westgardViolations.join(', ') : 'PASS'
      ]);

      (doc as any).autoTable({
        startY: 30,
        head: [['DateTime', 'Operator', 'Value', 'Sigma-Z', 'Status']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [15, 76, 129] },
        styles: { fontSize: 8 }
      });

      doc.save(`QC_Report_${config.testName}_LV${level}.pdf`);
    } catch (err) {
      console.error('PDF Export Failed:', err);
      alert('เกิดข้อผิดพลาดในการสร้างไฟล์ PDF กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsExporting(false);
    }
  };

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
          <div ref={exportRef} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
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
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  className="flex items-center space-x-2 px-4 py-2 bg-[#0F4C81] hover:bg-[#0b3a63] text-white rounded-xl text-xs font-black transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50"
                >
                  <FileText size={14} />
                  <span>{isExporting ? 'กำลังสร้าง PDF...' : 'Download PDF Report'}</span>
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
    </div>
  );
}
