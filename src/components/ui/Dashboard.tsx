'use client';

import React, { useState, useEffect } from 'react';
import type { Account } from '@/lib/auth';
import { isAdmin } from '@/lib/auth';
import { StoredReportsList } from '@/components/report/StoredReportsList';
import type { StoredReport } from '@/lib/storage/report-storage';

export type DashboardView = 'dashboard' | 'weekly' | 'monthly' | 'triannual' | 'aging';

interface DashboardProps {
  account: Account;
  onSelectReport: (view: DashboardView) => void;
  onOpenStoredReport?: (report: StoredReport) => void;
  onLogout: () => void;
}

export function Dashboard({ account, onSelectReport, onOpenStoredReport, onLogout }: DashboardProps) {
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    // Load Tailwind CDN
    if (!document.getElementById('tailwind-cdn')) {
      const script = document.createElement('script');
      script.id = 'tailwind-cdn';
      script.src = 'https://cdn.tailwindcss.com/3.4.17';
      document.head.appendChild(script);
    }
    // Load Lucide CDN
    if (!document.getElementById('lucide-cdn')) {
      const script = document.createElement('script');
      script.id = 'lucide-cdn';
      script.src = 'https://cdn.jsdelivr.net/npm/lucide@0.577.0/dist/umd/lucide.min.js';
      script.onload = () => {
        // @ts-ignore
        if (window.lucide) window.lucide.createIcons();
      };
      document.head.appendChild(script);
    } else {
      // @ts-ignore
      if (window.lucide) window.lucide.createIcons();
    }
  }, [selected]); // re-run lucide icons when selection changes if needed

  function handleOpen(view: DashboardView) {
    onSelectReport(view);
  }

  return (
    <>
      <style>{`
        :root { --ink:#091426; --panel:#101f36; --panel-2:#14253f; --line:#263a57; --muted:#8fa3bf; --blue:#3b82f6; --cyan:#55d6ff; --good:#54d89a; --amber:#f7c65b; }
        * { box-sizing:border-box; }
        .dashboard-body { width:100%; min-height:100%; font-family:"DM Sans",sans-serif; background:var(--ink); color:#f6f9ff; }
        button, input, select { font:inherit; }
        button:focus-visible, input:focus-visible, select:focus-visible { outline:3px solid #55d6ff; outline-offset:3px; }
        .shell { width:100%; min-height:calc(100 * min(var(--vh, 1vh), 1vh)); background:radial-gradient(circle at 82% 0%, #17375c 0%, transparent 32%), #091426; }
        .topbar { height:64px; border-bottom:1px solid #243650; background:#0d1a2e; }
        .page-wrap { width:100%; max-width:1240px; margin:0 auto; padding:28px 32px 44px; }
        .eyebrow { letter-spacing:.14em; text-transform:uppercase; font-size:11px; font-weight:700; color:var(--cyan); }
        .card { background:linear-gradient(145deg,rgba(20,37,63,.96),rgba(13,27,47,.96)); border:1px solid var(--line); box-shadow:0 18px 38px rgba(0,0,0,.18); }
        .report-card { min-height:258px; height:100%; display:flex; flex-direction:column; padding:24px; border-radius:18px; transition:transform .2s ease,border-color .2s ease,box-shadow .2s ease; cursor:pointer; }
        .report-card:hover, .report-card.is-selected { transform:translateY(-3px); border-color:#428fff; box-shadow:0 18px 40px rgba(18,95,200,.22); }
        .report-card.is-selected { background:linear-gradient(145deg,#17375e,#102440); }
        .status-dot { width:10px;height:10px;border-radius:999px;background:#526781; display:inline-block; }
        .report-card.is-selected .status-dot { background:var(--good); box-shadow:0 0 0 5px rgba(84,216,154,.12); }
        .primary-btn { background:#2878f0; color:white; border:1px solid #4a94ff; border-radius:10px; font-weight:700; transition:.2s; }
        .primary-btn:hover { background:#4390ff; }
        .secondary-btn { background:#132844; color:#dce9fa; border:1px solid #34506f; border-radius:10px; font-weight:600; }
        .view { display:none; }
        .view.active { display:block; animation:rise .35s ease both; }
        @keyframes rise { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
      <div className="dashboard-body shell" style={{ background: 'rgb(9, 20, 38)' }}>
        <header className="topbar">
          <div className="topbar-inner mx-auto flex h-full max-w-[1240px] items-center justify-between px-8">
            <div className="flex items-center gap-4">
              <div className="grid h-29 w-16 place-items-center" aria-hidden="true">
                <img src="/images/EQUI.png" alt="Equicom Logo" className="w-full h-full object-contain scale-110" />
              </div>
              <div>
                <p className="m-0 text-[10px] font-bold uppercase tracking-[.14em] text-sky-300" style={{ color: 'rgb(125, 211, 252)', fontWeight: 700, fontStyle: 'normal', fontSize: '10px', letterSpacing: '0.12rem' }}>Incident Management</p>
                <h1 className="m-0 text-sm font-bold text-white" style={{ color: 'rgb(255, 255, 255)', fontWeight: 700, fontStyle: 'normal', fontSize: '30px' }}>SMAC REPORTING</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={onLogout}
                className="header-user-badge"
                title="Click to log out"
              >
                👤 {account.name}
                {isAdmin(account) && (
                  <span className="badge-role">Admin</span>
                )}
              </button>
            </div>
          </div>
        </header>
        <main className="page-wrap">
          <section id="landing-view" className="view active" aria-labelledby="landing-heading">
            <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow mb-2" style={{ color: 'rgb(85, 214, 255)', fontWeight: 700, fontStyle: 'normal', fontSize: '15px' }}>Reporting workspace</p>
                <h2 id="landing-heading" className="m-0 text-3xl font-bold tracking-tight text-white" style={{ color: 'rgb(255, 255, 255)', fontWeight: 700, fontStyle: 'normal', fontSize: '23px' }}>Choose a report section</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300" style={{ color: 'rgb(203, 213, 225)', fontWeight: 400, fontStyle: 'normal', fontSize: '15px' }}>Select a scheduled workflow to generate an incident report.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4" aria-label="Available report sections">

              <article className={`report-card card ${selected === 'weekly' ? 'is-selected' : ''}`} onClick={() => setSelected('weekly')}>
                <div className="flex items-start justify-between gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-blue-500/15 text-blue-300">
                    <i data-lucide="calendar-days" style={{ width: 21, height: 21 }}></i>
                  </div>
                  <span className="flex items-center gap-2 text-xs text-slate-300">
                    <span className="status-dot"></span><span className="selection-copy">{selected === 'weekly' ? 'Selected' : 'Not selected'}</span>
                  </span>
                </div>
                <p className="mt-7 text-xs font-bold uppercase tracking-[.12em] text-sky-300" style={{ color: 'rgb(125, 211, 252)', fontWeight: 700, fontStyle: 'normal', fontSize: '15px' }}>Scheduled follow-up</p>
                <h3 className="mt-2 text-xl font-bold leading-tight text-white" style={{ color: 'rgb(255, 255, 255)', fontWeight: 700, fontStyle: 'normal', fontSize: '18px' }}>Weekly Report</h3>
                <button type="button" className="open-report primary-btn mt-auto flex w-full items-center justify-center gap-2 px-4 py-3" onClick={(e) => { e.stopPropagation(); handleOpen('weekly'); }}>
                  <span>Open report</span><i data-lucide="arrow-right" style={{ width: 16, height: 16 }}></i>
                </button>
              </article>

              <article className={`report-card card ${selected === 'monthly' ? 'is-selected' : ''}`} onClick={() => setSelected('monthly')}>
                <div className="flex items-start justify-between gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-violet-500/15 text-violet-300">
                    <i data-lucide="calendar-range" style={{ width: 21, height: 21 }}></i>
                  </div>
                  <span className="flex items-center gap-2 text-xs text-slate-300">
                    <span className="status-dot"></span><span className="selection-copy">{selected === 'monthly' ? 'Selected' : 'Not selected'}</span>
                  </span>
                </div>
                <p className="mt-7 text-xs font-bold uppercase tracking-[.12em] text-violet-300" style={{ color: 'rgb(196, 181, 253)', fontWeight: 700, fontStyle: 'normal', fontSize: '15px' }}>Monthly review</p>
                <h3 className="mt-2 text-xl font-bold leading-tight text-white" style={{ color: 'rgb(255, 255, 255)', fontWeight: 700, fontStyle: 'normal', fontSize: '18px' }}>Monthly Incident Report</h3>
                <button type="button" className="open-report primary-btn mt-auto flex w-full items-center justify-center gap-2 px-4 py-3" onClick={(e) => { e.stopPropagation(); handleOpen('monthly'); }}>
                  <span>Open report</span><i data-lucide="arrow-right" style={{ width: 16, height: 16 }}></i>
                </button>
              </article>

              <article className={`report-card card ${selected === 'triannual' ? 'is-selected' : ''}`} onClick={() => setSelected('triannual')}>
                <div className="flex items-start justify-between gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-cyan-500/15 text-cyan-300">
                    <i data-lucide="layers-3" style={{ width: 21, height: 21 }}></i>
                  </div>
                  <span className="flex items-center gap-2 text-xs text-slate-300">
                    <span className="status-dot"></span><span className="selection-copy">{selected === 'triannual' ? 'Selected' : 'Not selected'}</span>
                  </span>
                </div>
                <p className="mt-7 text-xs font-bold uppercase tracking-[.12em] text-cyan-300" style={{ color: 'rgb(103, 232, 249)', fontWeight: 700, fontStyle: 'normal', fontSize: '15px' }}>Extended review</p>
                <h3 className="mt-2 text-xl font-bold leading-tight text-white" style={{ color: 'rgb(255, 255, 255)', fontWeight: 700, fontStyle: 'normal', fontSize: '18px' }}>Triannual Incident Report</h3>
                <button type="button" className="open-report primary-btn mt-auto flex w-full items-center justify-center gap-2 px-4 py-3" onClick={(e) => { e.stopPropagation(); handleOpen('triannual'); }}>
                  <span>Open report</span><i data-lucide="arrow-right" style={{ width: 16, height: 16 }}></i>
                </button>
              </article>

              <article className={`report-card card ${selected === 'aging' ? 'is-selected' : ''}`} onClick={() => setSelected('aging')}>
                <div className="flex items-start justify-between gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-amber-500/15 text-amber-300">
                    <i data-lucide="trending-up" style={{ width: 21, height: 21 }}></i>
                  </div>
                  <span className="flex items-center gap-2 text-xs text-slate-300">
                    <span className="status-dot"></span><span className="selection-copy">{selected === 'aging' ? 'Selected' : 'Not selected'}</span>
                  </span>
                </div>
                <p className="mt-7 text-xs font-bold uppercase tracking-[.12em] text-amber-300" style={{ color: 'rgb(252, 211, 77)', fontWeight: 700, fontStyle: 'normal', fontSize: '15px' }}>Aging trends</p>
                <h3 className="mt-2 text-xl font-bold leading-tight text-white" style={{ color: 'rgb(255, 255, 255)', fontWeight: 700, fontStyle: 'normal', fontSize: '18px' }}>Aging Incident Report</h3>
                <button type="button" className="open-report primary-btn mt-auto flex w-full items-center justify-center gap-2 px-4 py-3" onClick={(e) => { e.stopPropagation(); handleOpen('aging'); }}>
                  <span>Open report</span><i data-lucide="arrow-right" style={{ width: 16, height: 16 }}></i>
                </button>
              </article>

            </div>

            {/* Stored Reports Section */}
            <div className="mt-10">
              <StoredReportsList
                onOpenReport={(report) => {
                  if (onOpenStoredReport) {
                    onOpenStoredReport(report);
                  }
                }}
              />
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
