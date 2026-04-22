import React, { useState } from 'react';
import { Plus, Trash2, Beaker, FlaskConical, Target, AlertTriangle } from 'lucide-react';
import { QCConfig, Instrument } from '../types';

interface SettingsPageProps {
  configs: QCConfig[];
  instruments: Instrument[];
  onAddConfig: (config: QCConfig) => void;
  onAddInstrument: (inst: Instrument) => void;
  onDeleteConfig: (id: string) => void;
  onDeleteInstrument: (id: string) => void;
}

export default function SettingsPage({
  configs,
  instruments,
  onAddConfig,
  onAddInstrument,
  onDeleteConfig,
  onDeleteInstrument,
}: SettingsPageProps) {
  const [newTest, setNewTest] = useState({ name: '', unit: '', m1: '', s1: '', m2: '', s2: '', m3: '', s3: '', tea: '10' });
  const [newInst, setNewInst] = useState({ name: '', model: '' });

  const handleAddTest = (e: React.FormEvent) => {
    e.preventDefault();
    const config: QCConfig = {
      id: `test-${Date.now()}`,
      testName: newTest.name,
      unit: newTest.unit,
      allowableError: parseFloat(newTest.tea),
      level1: { mean: parseFloat(newTest.m1), sd: parseFloat(newTest.s1) },
      level2: { mean: parseFloat(newTest.m2), sd: parseFloat(newTest.s2) },
      level3: newTest.m3 ? { mean: parseFloat(newTest.m3), sd: parseFloat(newTest.s3) } : undefined,
    };
    onAddConfig(config);
    setNewTest({ name: '', unit: '', m1: '', s1: '', m2: '', s2: '', m3: '', s3: '', tea: '10' });
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
    <div className="space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Test Management */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center space-x-2 mb-6 text-[#0F4C81]">
              <FlaskConical size={20} />
              <h3 className="font-bold">Add New Test Parameter</h3>
            </div>
            
            <form onSubmit={handleAddTest} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  placeholder="Test Name (e.g. Glucose)"
                  value={newTest.name}
                  onChange={e => setNewTest({...newTest, name: e.target.value})}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm"
                  required
                />
                <input
                  placeholder="Unit (mg/dL)"
                  value={newTest.unit}
                  onChange={e => setNewTest({...newTest, unit: e.target.value})}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm"
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-4 border-t pt-4">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Level 1 Params</p>
                  <input
                    type="number" step="0.001" placeholder="Mean"
                    value={newTest.m1} onChange={e => setNewTest({...newTest, m1: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-[10px]" required
                  />
                  <input
                    type="number" step="0.001" placeholder="SD"
                    value={newTest.s1} onChange={e => setNewTest({...newTest, s1: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-[10px]" required
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Level 2 Params</p>
                  <input
                    type="number" step="0.001" placeholder="Mean"
                    value={newTest.m2} onChange={e => setNewTest({...newTest, m2: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-[10px]" required
                  />
                  <input
                    type="number" step="0.001" placeholder="SD"
                    value={newTest.s2} onChange={e => setNewTest({...newTest, s2: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-[10px]" required
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Level 3 Params</p>
                  <input
                    type="number" step="0.001" placeholder="Mean"
                    value={newTest.m3} onChange={e => setNewTest({...newTest, m3: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-[10px]"
                  />
                  <input
                    type="number" step="0.001" placeholder="SD"
                    value={newTest.s3} onChange={e => setNewTest({...newTest, s3: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-[10px]"
                  />
                </div>
              </div>
              <div className="space-y-2 border-t pt-4">
                 <p className="text-[10px] font-bold text-slate-400 uppercase">Precision & Error</p>
                 <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-500">%TEa:</span>
                    <input
                      type="number" placeholder="Allowable Error %"
                      value={newTest.tea} onChange={e => setNewTest({...newTest, tea: e.target.value})}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-center"
                    />
                 </div>
              </div>
              <button type="submit" className="w-full bg-[#0F4C81] text-white font-bold py-2.5 rounded-xl flex items-center justify-center space-x-2 hover:bg-[#0b3a63]">
                <Plus size={16} />
                <span>Register Test</span>
              </button>
            </form>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h3 className="font-bold text-sm">Active Test Library</h3>
            </div>
            <div className="divide-y text-sm">
              {configs.map(c => (
                <div key={c.id} className="px-6 py-3 flex items-center justify-between hover:bg-slate-50">
                  <div>
                    <p className="font-bold text-slate-800">{c.testName}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">{c.unit} • %TEa: {c.allowableError}%</p>
                  </div>
                  <button onClick={() => onDeleteConfig(c.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Instrument Management */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center space-x-2 mb-6 text-[#0F4C81]">
              <Beaker size={20} />
              <h3 className="font-bold">Add New Instrument</h3>
            </div>
            <form onSubmit={handleAddInst} className="space-y-4">
              <input
                placeholder="Machine Name (e.g. Alinity)"
                value={newInst.name}
                onChange={e => setNewInst({...newInst, name: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm"
                required
              />
              <input
                placeholder="Manufacturer / Model"
                value={newInst.model}
                onChange={e => setNewInst({...newInst, model: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm"
                required
              />
              <button type="submit" className="w-full bg-[#0F4C81] text-white font-bold py-2.5 rounded-xl flex items-center justify-center space-x-2 hover:bg-[#0b3a63]">
                <Plus size={16} />
                <span>Add Machine</span>
              </button>
            </form>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h3 className="font-bold text-sm">Laboratory Inventory</h3>
            </div>
            <div className="divide-y text-sm">
              {instruments.map(i => (
                <div key={i.id} className="px-6 py-3 flex items-center justify-between hover:bg-slate-50">
                  <div>
                    <p className="font-bold text-slate-800">{i.name}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">{i.model}</p>
                  </div>
                  <button onClick={() => onDeleteInstrument(i.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
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
