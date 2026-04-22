import React from 'react';
import { motion } from 'motion/react';
import { Activity, AlertTriangle, CheckCircle2, FlaskConical } from 'lucide-react';
import { QCResult } from '../types';

interface DashboardProps {
  results: QCResult[];
}

export default function Dashboard({ results }: DashboardProps) {
  const recentResults = results.slice(-5).reverse();
  const violations = results.filter(r => r.westgardViolations.length > 0).length;
  const total = results.length;
  const successRate = total > 0 ? Math.round(((total - violations) / total) * 100) : 100;

  const stats = [
    { label: 'จำนวนการทดสอบทั้งหมด', value: total, icon: FlaskConical, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'จำนวนที่ผิดกฎ QC', value: violations, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'อัตราการผ่านกฎ (%)', value: `${successRate}%`, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'เครื่องวิเคราะห์ที่ใช้งาน', value: 2, icon: Activity, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Results Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-sm">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800">รายการบันทึก IQC ล่าสุด (Recent Activities)</h3>
            <button className="text-[#0F4C81] font-semibold hover:underline">ดูทั้งหมด</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-3">วัน/เวลา</th>
                  <th className="px-6 py-3">ระดับ</th>
                  <th className="px-6 py-3">ผลการตรวจ</th>
                  <th className="px-6 py-3">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentResults.map((result) => (
                  <tr key={result.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(result.date).toLocaleString('th-TH', { 
                        dateStyle: 'short', timeStyle: 'short' 
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        result.level === 1 ? 'bg-blue-100 text-blue-700' : result.level === 2 ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        Level {result.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold">{result.value}</td>
                    <td className="px-6 py-4">
                      {result.westgardViolations.length > 0 ? (
                        <div className="flex items-center text-red-600 space-x-1 font-bold">
                          <AlertTriangle size={14} />
                          <span className="text-xs">{result.westgardViolations.join(', ')}</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-emerald-600 space-x-1 font-bold">
                          <CheckCircle2 size={14} />
                          <span className="text-xs">ผ่านเกณฑ์</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {recentResults.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-bold border-t">
                      ยังไม่มีข้อมูลการบันทึก IQC
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notifications / Rules Summary */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-bold text-slate-800 mb-6">สรุป Westgard Violation</h3>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
              <div className="flex items-center space-x-3 text-amber-800 mb-1">
                <AlertTriangle size={18} />
                <span className="font-bold text-sm">Warning: 1-2s Detected</span>
              </div>
              <p className="text-xs text-amber-700/80 leading-relaxed font-medium">
                ควรตรวจสอบแนวโน้มของข้อมูล หรือตรวจสอบค่า Systematic Shift ในระดับนี้
              </p>
            </div>
            <div className="p-4 rounded-xl bg-red-50 border border-red-100">
              <div className="flex items-center space-x-3 text-red-800 mb-1">
                <AlertTriangle size={18} />
                <span className="font-bold text-sm">Rejection: 1-3s Violation</span>
              </div>
              <p className="text-xs text-red-700/80 leading-relaxed font-medium">
                พบการละเมิดกฎ 1-3s แนะนำให้ปฏิเสธการใช้ผลการตรวจนี้และหาสาเหตุ Random Error ทันที
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
