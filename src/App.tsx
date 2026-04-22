/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import IQCPage from './components/IQCPage';
import SettingsPage from './components/SettingsPage';
import AdminPanel from './components/AdminPanel';
import EQAPage from './components/EQAPage';
import { User, QCResult, QCConfig, Instrument, EQARecord } from './types';
import { INSTRUMENTS, QC_CONFIGS } from './constants';

const ADMIN_USER: User = {
  id: 'admin-1',
  name: 'System Admin',
  licenseNumber: 'ADMIN',
  password: 'admin',
  role: 'ADMIN'
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string>();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Dynamic Application Data
  const [results, setResults] = useState<QCResult[]>([]);
  const [configs, setConfigs] = useState<QCConfig[]>(QC_CONFIGS);
  const [instruments, setInstruments] = useState<Instrument[]>(INSTRUMENTS);
  const [eqaRecords, setEqaRecords] = useState<EQARecord[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // Local Storage Sync (Robust parsing)
  useEffect(() => {
    const loadData = (key: string, setter: (val: any) => void) => {
      const data = localStorage.getItem(key);
      if (data) {
        try {
          const parsed = JSON.parse(data);
          if (parsed !== null && parsed !== undefined) {
            setter(parsed);
          }
        } catch (e) {
          console.error(`Error loading ${key}:`, e);
          localStorage.removeItem(key);
        }
      }
    };

    loadData('qc_results', setResults);
    loadData('qc_configs', setConfigs);
    loadData('qc_insts', setInstruments);
    loadData('qc_users', setUsers);
    loadData('qc_eqa', setEqaRecords);
    loadData('qc_current_user', setUser);
  }, []);

  useEffect(() => { 
    localStorage.setItem('qc_results', JSON.stringify(results));
    localStorage.setItem('qc_configs', JSON.stringify(configs));
    localStorage.setItem('qc_insts', JSON.stringify(instruments));
    localStorage.setItem('qc_users', JSON.stringify(users));
    localStorage.setItem('qc_eqa', JSON.stringify(eqaRecords));
  }, [results, configs, instruments, users, eqaRecords]);

  const handleLogin = (license: string, password: string) => {
    if (license === 'ADMIN' && password === 'admin') {
      setUser(ADMIN_USER);
      localStorage.setItem('qc_current_user', JSON.stringify(ADMIN_USER));
      setAuthError(undefined);
      return;
    }

    const found = users.find(u => u.licenseNumber === license);
    if (found && found.password === password) {
      setUser(found);
      localStorage.setItem('qc_current_user', JSON.stringify(found));
      setAuthError(undefined);
    } else {
      setAuthError('Invalid credentials. Access denied.');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('qc_current_user');
  };

  // Inactivity Timer (15 minutes)
  useEffect(() => {
    if (!user) return;

    const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 minutes in ms
    let timeoutId: number;

    const resetTimer = () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        handleLogout();
        alert('Session expired due to inactivity. Please login again.');
      }, INACTIVITY_LIMIT);
    };

    // Events to track user activity
    const activityEvents = [
      'mousedown', 'mousemove', 'keypress', 
      'scroll', 'touchstart', 'click'
    ];

    activityEvents.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer(); // Initialize timer

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      activityEvents.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [user]);

  const handleRegister = (newUser: User) => {
    setUsers(prev => [...prev, newUser]);
    setUser(newUser);
    localStorage.setItem('qc_current_user', JSON.stringify(newUser));
  };

  if (!user) {
    return <Auth onLogin={handleLogin} error={authError} />;
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} user={user} onLogout={handleLogout}>
      {activeTab === 'dashboard' && <Dashboard results={results} />}
      
      {activeTab === 'iqc' && (
        <IQCPage 
          results={results} 
          onAddResult={res => setResults(prev => [...prev, res])} 
          onDeleteResult={id => setResults(prev => prev.filter(x => x.id !== id))}
          configs={configs}
          instruments={instruments}
          eqaRecords={eqaRecords}
          currentUser={user}
        />
      )}

      {activeTab === 'eqa' && (
        <EQAPage 
          eqaRecords={eqaRecords}
          onAddEQA={rec => setEqaRecords(prev => [...prev, rec])}
          onDeleteEQA={id => setEqaRecords(prev => prev.filter(x => x.id !== id))}
          configs={configs}
          instruments={instruments}
        />
      )}

      {activeTab === 'instruments' && (
        <SettingsPage
          configs={configs}
          instruments={instruments}
          onAddConfig={c => setConfigs(prev => [...prev, c])}
          onAddInstrument={i => setInstruments(prev => [...prev, i])}
          onDeleteConfig={id => setConfigs(prev => prev.filter(x => x.id !== id))}
          onDeleteInstrument={id => setInstruments(prev => prev.filter(x => x.id !== id))}
        />
      )}

      {activeTab === 'settings' && user.role === 'ADMIN' && (
        <AdminPanel 
          users={users} 
          onAddUser={u => setUsers(prev => [...prev, u])}
          onDeleteUser={id => setUsers(prev => prev.filter(x => x.id !== id))}
        />
      )}
      
      {activeTab === 'settings' && user.role !== 'ADMIN' && (
        <div className="flex flex-col items-center justify-center h-full text-slate-400">
          <p className="font-bold">Administrative access required for user management.</p>
        </div>
      )}
    </Layout>
  );
}
