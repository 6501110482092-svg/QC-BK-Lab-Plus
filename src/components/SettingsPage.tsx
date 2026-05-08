import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Beaker, FlaskConical, Calculator, Save, ChevronRight, Target } from 'lucide-react';
import { QCConfig, Instrument, SavedCalculation } from '../types';
import { calculateStats } from '../lib/qcLogic';

interface SettingsPageProps {
  configs: QCConfig[];
  instruments: Instrument[];
  savedCalculations: SavedCalculation[];
  onAddConfig: (config: QCConfig) => void;
  onAddInstrument: (inst: Instrument) => void;
  onAddCalculation: (calc: SavedCalculation) => void;
  onDeleteConfig: (id: string) => void;
  onDeleteInstrument: (id: string) => void;
  onDeleteCalculation: (id: string) => void;
}

export default function SettingsPage({
  configs,
  instruments,
  savedCalculations,
  onAddConfig,
  onAddInstrument,
  onAddCalculation,
  onDeleteConfig,
  onDeleteInstrument,
  onDeleteCalculation,
}: SettingsPageProps) {
  const [newTest, setNewTest] = useState({ 
    name: '', unit: '', 
    m1: '', s1: '', cv1: '',
    m2: '', s2: '', cv2: '',
    m3: '', s3: '', cv3: '',
    tea: '10' 
  });
  const [newInst, setNewInst] = useState({ name: '', model: '' });

  // Calculator State
  const [calcName, setCalcName] = useState('');
  const [rawData, setRawData] = useState('');
  
  const statsResult = useMemo(() => {
    const values = rawData.split(/[\s,]+/).map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
    return calculateStats(values);
  }, [rawData]);

  const handleAddCalculation = () => {
    if (!calcName ) return;
    const calc: SavedCalculation = {
      id: `calc-${Date.now()}`,
      name: calcName,
      ...statsResult,
      rawData
    };
    onAddCalculation(calc);
    setCalcName('');
    setRawData('');
  };

  const applyCalcToLevel = (calc: SavedCalculation, level: 1 | 2 | 3) => {
    if (level === 1) {
      setNewTest({ ...newTest, m1: calc.mean.toFixed(3), s1: calc.sd.toFixed(3), cv1: calc.cv.toFixed(2) });
    } else if (level === 2) {
      setNewTest({ ...newTest, m2: calc.mean.toFixed(3), s2: calc.sd.toFixed(3), cv2: calc.cv.toFixed(2) });
    } else {
      setNewTest({ ...newTest, m3: calc.mean.toFixed(3), s3: calc.sd.toFixed(3), cv3: calc.cv.toFixed(2) });
    }
  };

  const handleAddTest = (e: React.FormEvent) => {
    e.preventDefault();
    const config: QCConfig = {
      id: `test-${Date.now()}`,
      testName: newTest.name,
      unit: newTest.unit,
      allowableError: parseFloat(newTest.tea),
      level1: { mean: parseFloat(newTest.m1), sd: parseFloat(newTest.s1), cv: parseFloat(newTest.cv1) },
      level2: { mean: parseFloat(newTest.m2), sd: parseFloat(newTest.s2), cv: parseFloat(newTest.cv2) },
      level3: newTest.m3 ? { mean: parseFloat(newTest.m3), sd: parseFloat(newTest.s3), cv: parseFloat(newTest.cv3) } : undefined,
    };
    onAddConfig(config);
    setNewTest({ name: '', unit: '', m1: '', s1: '', cv1: '', m2: '', s2: '', cv2: '', m3: '', s3: '', cv3: '', tea: '10' });
  };

  const handleAddInst = (e: React.FormEvent) => {
    e.preventDefault();
    const inst: Instrument = {
      id: `inst-${Date.now()}`,
      name: newInst.name,
      model: newInst.model,
    };
    onAddInstrument(inst);
    setNewInst({ name: '', model: '' });
  };

  return (
    <div className="space-y-12 pb-20">
      {/* 1. Statistics Calculator */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-100/50">
        <div className="flex items-center space-x-3 mb-8 text-[#0F4C81]">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Calculator size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black">Mean / SD / CV Calculator</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">หมวดคำนวณและบันทึกค่าทางสถิติ</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-tight">ตั้งชื่อชุดข้อมูล (Test Name / Lot No.)</label>
              <input
                placeholder="เช่น Glucose Lot 123"
                value={calcName}
                onChange={e => setCalcName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-[#0F4C81]/20 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-tight">วางค่าที่ตรวจได้ทั้งหมด (แยกด้วยเว้นวรรค หรือ จุลภาค)</label>
              <textarea
                placeholder="100 102 98 101..."
                value={rawData}
                onChange={e => setRawData(e.target.value)}
                rows={4}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-mono focus:ring-2 focus:ring-[#0F4C81]/20 outline-none transition-all resize-none"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-6 bg-slate-50 p-6 rounded-3xl border border-slate-100">
               <div className="text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Mean</p>
                  <p className="text-lg font-black text-[#0F4C81]">{statsResult.mean.toFixed(3)}</p>
               </div>
               <div className="text-center border-x border-slate-200">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">SD</p>
                  <p className="text-lg font-black text-[#0F4C81]">{statsResult.sd.toFixed(3)}</p>
               </div>
               <div className="text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">CV (%)</p>
                  <p className="text-lg font-black text-emerald-600">{statsResult.cv.toFixed(2)}%</p>
               </div>
            </div>

            <button 
              onClick={handleAddCalculation}
              disabled={!calcName || statsResult.mean === 0}
              className="w-full bg-[#0F4C81] text-white font-black py-4 rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-blue-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
            >
              <Save size={18} />
              <span>Save Statistical Result</span>
            </button>
          </div>

          <div className="bg-slate-50/50 rounded-3xl border border-slate-100 flex flex-col h-full">
             <div className="p-6 border-b border-slate-100">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center justify-between">
                  <span>Saved Calculations</span>
                  <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-lg text-[9px]">{savedCalculations.length} items</span>
                </h4>
             </div>
             <div className="flex-1 overflow-y-auto max-h-[400px] p-4 space-y-3">
                {savedCalculations.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-slate-300 py-12">
                     <Calculator size={32} strokeWidth={1} className="mb-2" />
                     <p className="text-xs font-bold uppercase">No records found</p>
                  </div>
                )}
                {savedCalculations.map(calc => (
                  <div key={calc.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group">
                    <div className="flex-1 min-w-0 mr-4">
                      <p className="font-extrabold text-slate-800 text-sm truncate">{calc.name}</p>
                      <p className="text-[10px] font-bold text-slate-400">M: {calc.mean.toFixed(2)} | SD: {calc.sd.toFixed(2)} | CV: {calc.cv.toFixed(2)}%</p>
                    </div>
                    <div className="flex items-center space-x-2">
                       <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1 transition-all">
                          <button 
                             onClick={() => applyCalcToLevel(calc, 1)}
                             className="text-[10px] font-black px-2 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                          >
                             Apply L1
                          </button>
                          <button 
                             onClick={() => applyCalcToLevel(calc, 2)}
                             className="text-[10px] font-black px-2 py-1 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100"
                          >
                             Apply L2
                          </button>
                          <button 
                             onClick={() => applyCalcToLevel(calc, 3)}
                             className="text-[10px] font-black px-2 py-1 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100"
                          >
                             Apply L3
                          </button>
                       </div>
                       <button onClick={() => onDeleteCalculation(calc.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* IQC Test Configuration */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center space-x-3 mb-8 text-[#0F4C81]">
              <div className="p-2 bg-slate-50 rounded-lg">
                <FlaskConical size={20} />
              </div>
              <h3 className="text-lg font-black italic">Add New Test Parameter</h3>
            </div>
            
            <form onSubmit={handleAddTest} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Test Name</label>
                  <input
                    placeholder="e.g. Glucose"
                    value={newTest.name}
                    onChange={e => setNewTest({...newTest, name: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Unit</label>
                  <input
                    placeholder="mg/dL"
                    value={newTest.unit}
                    onChange={e => setNewTest({...newTest, unit: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-6">
                {[1, 2, 3].map(lvl => (
                  <div key={lvl} className={`p-5 rounded-2xl border border-slate-100 ${lvl === 1 ? 'bg-blue-50/30' : lvl === 2 ? 'bg-purple-50/30' : 'bg-orange-50/30'}`}>
                    <div className="flex items-center justify-between mb-4">
                       <p className={`text-[11px] font-black uppercase tracking-widest ${lvl === 1 ? 'text-blue-500' : lvl === 2 ? 'text-purple-500' : 'text-orange-500'}`}>Level {lvl} Parameters</p>
                       {savedCalculations.length > 0 && (
                         <div className="relative group">
                            <button type="button" className="text-[9px] font-black bg-white border border-slate-200 px-2 py-1 rounded-lg flex items-center hover:bg-slate-50 transition-colors">
                               Use Saved <ChevronRight size={10} className="ml-1" />
                            </button>
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 hidden group-hover:block overflow-hidden">
                                {savedCalculations.map(c => (
                                   <button 
                                      key={c.id} type="button"
                                      onClick={() => applyCalcToLevel(c, lvl as any)}
                                      className="w-full text-left px-3 py-2 text-[10px] font-bold hover:bg-slate-50 border-b last:border-0 border-slate-100 truncate"
                                    >
                                      {c.name}
                                   </button>
                                ))}
                            </div>
                         </div>
                       )}
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase">Mean</label>
                        <input
                          type="number" step="0.001" placeholder="0.00"
                          value={lvl === 1 ? newTest.m1 : (lvl === 2 ? newTest.m2 : newTest.m3)} 
                          onChange={e => setNewTest({...newTest, [lvl === 1 ? 'm1' : (lvl === 2 ? 'm2' : 'm3')]: e.target.value})}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-black outline-none" 
                          required={lvl < 3}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase">SD</label>
                        <input
                          type="number" step="0.001" placeholder="0.00"
                          value={lvl === 1 ? newTest.s1 : (lvl === 2 ? newTest.s2 : newTest.s3)} 
                          onChange={e => setNewTest({...newTest, [lvl === 1 ? 's1' : (lvl === 2 ? 's2' : 's3')]: e.target.value})}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-black outline-none" 
                          required={lvl < 3}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase">CV %</label>
                        <input
                          type="number" step="0.01" placeholder="0.0%"
                          value={lvl === 1 ? newTest.cv1 : (lvl === 2 ? newTest.cv2 : newTest.cv3)} 
                          onChange={e => setNewTest({...newTest, [lvl === 1 ? 'cv1' : (lvl === 2 ? 'cv2' : 'cv3')]: e.target.value})}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-black outline-none text-emerald-600" 
                          required={lvl < 3}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t pt-6">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center">
                   <Target size={12} className="mr-1" /> Precision & Error Limit
                 </p>
                 <div className="flex items-center space-x-4">
                    <span className="text-xs font-black text-slate-500 whitespace-nowrap">Allowable Error (%TEa):</span>
                    <input
                      type="number" placeholder="10"
                      value={newTest.tea} onChange={e => setNewTest({...newTest, tea: e.target.value})}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-black text-center focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                 </div>
              </div>
              
              <button type="submit" className="w-full bg-[#0F4C81] text-white font-black py-4 rounded-2xl flex items-center justify-center space-x-2 hover:scale-[1.01] active:scale-95 transition-all shadow-lg shadow-blue-900/10">
                <Plus size={18} />
                <span>Register Test Library</span>
              </button>
            </form>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-8 py-6 border-b bg-slate-50/50">
              <h3 className="font-black text-slate-800 flex items-center">
                 <FlaskConical size={18} className="mr-2 text-blue-600" />
                 Active Test Library
              </h3>
            </div>
            <div className="divide-y divide-slate-100 text-sm overflow-y-auto max-h-[600px]">
              {configs.map(c => (
                <div key={c.id} className="px-8 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="space-y-2">
                    <p className="font-black text-slate-900 text-base">{c.testName}</p>
                    <div className="space-y-1.5">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[9px] font-black uppercase">{c.unit}</span>
                        <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded-md text-[9px] font-black uppercase">%TEa: {c.allowableError}%</span>
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 space-y-0.5 uppercase">
                         <p className="flex items-center">
                            <span className="w-12">Level 1:</span> 
                            <span className="text-slate-600">M: {c.level1.mean} | SD: {c.level1.sd} | CV: {c.level1.cv}%</span>
                         </p>
                         <p className="flex items-center">
                            <span className="w-12">Level 2:</span> 
                            <span className="text-slate-600">M: {c.level2.mean} | SD: {c.level2.sd} | CV: {c.level2.cv}%</span>
                         </p>
                         {c.level3 && (
                           <p className="flex items-center">
                              <span className="w-12">Level 3:</span> 
                              <span className="text-slate-600">M: {c.level3.mean} | SD: {c.level3.sd} | CV: {c.level3.cv}%</span>
                           </p>
                         )}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => onDeleteConfig(c.id)} className="p-3 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Instrument Management */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center space-x-3 mb-8 text-[#0F4C81]">
              <div className="p-2 bg-slate-50 rounded-lg">
                <Beaker size={20} />
              </div>
              <h3 className="text-lg font-black italic">Add New Instrument</h3>
            </div>
            <form onSubmit={handleAddInst} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Instrument Name</label>
                <input
                  placeholder="e.g. Alinity i"
                  value={newInst.name}
                  onChange={e => setNewInst({...newInst, name: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Model / Serial</label>
                <input
                  placeholder="Abbott Diagnostics"
                  value={newInst.model}
                  onChange={e => setNewInst({...newInst, model: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                  required
                />
              </div>
              <button type="submit" className="w-full bg-[#0F4C81] text-white font-black py-4 rounded-2xl flex items-center justify-center space-x-2 hover:scale-[1.01] active:scale-95 transition-all shadow-lg shadow-blue-900/10">
                <Plus size={18} />
                <span>Add Machine</span>
              </button>
            </form>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-8 py-6 border-b bg-slate-50/50">
              <h3 className="font-black text-slate-800 flex items-center">
                 <Beaker size={18} className="mr-2 text-purple-600" />
                 Laboratory Inventory
              </h3>
            </div>
            <div className="divide-y divide-slate-100 text-sm overflow-y-auto max-h-[400px]">
              {instruments.map(i => (
                <div key={i.id} className="px-8 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="font-black text-slate-800 text-base">{i.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{i.model}</p>
                  </div>
                  <button onClick={() => onDeleteInstrument(i.id)} className="p-3 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
