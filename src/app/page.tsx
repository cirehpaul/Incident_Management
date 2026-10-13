'use client';

import React, { useReducer, useCallback, useState } from 'react';
import { PinLogin } from '@/components/ui/PinLogin';
import { Dashboard } from '@/components/ui/Dashboard';
import type { DashboardView } from '@/components/ui/Dashboard';
import type { Account } from '@/lib/auth';
import { isAdmin } from '@/lib/auth';
import { appReducer, initialState } from '@/lib/store';
import type { AppStep } from '@/lib/store';
import { Stepper } from '@/components/ui/Stepper';
import { FileUpload } from '@/components/upload/FileUpload';
import { ValidationSummaryView } from '@/components/validation/ValidationSummary';
import { RoutingPreview } from '@/components/routing/RoutingPreview';
import { PreviousWeekInput } from '@/components/report/PreviousWeekInput';
import { SLAReportTable } from '@/components/report/SLAReportTable';
import { ExportDropdown } from '@/components/report/ExportDropdown';
import { DetailModal } from '@/components/report/DetailModal';
import { AgingReportWorkflow } from '@/components/aging/AgingReportWorkflow';

import { parseFile } from '@/lib/excel/parser';
import { autoDetectMapping, mapAllRows } from '@/lib/excel/mapper';
import { applyRouting } from '@/lib/routing/routing-engine';
import { calculateSLAReport, splitIncidentsByWeek, calculateWeeklyCompletion } from '@/lib/sla/calculator';
import { exportAsPng } from '@/lib/report/export';
import { REPORT_TEAMS } from '@/lib/routing/routing-engine';

import type { ColumnMapping, Incident } from '@/types/incident';
import type { WeeklyReportData } from '@/types/sla';
import type { AgingReportData } from '@/types/aging';
import type { StoredReport } from '@/lib/storage/report-storage';

export default function HomePage() {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [currentAccount, setCurrentAccount] = useState<Account | null>(null);
  const [activeView, setActiveView] = useState<DashboardView>('dashboard');
  const [agingStoredReport, setAgingStoredReport] = useState<{
    data: AgingReportData;
    incidents?: Incident[];
  } | null>(null);

  const handleOpenStoredReport = useCallback((storedReport: StoredReport) => {
    if (storedReport.type === 'weekly') {
      dispatch({
        type: 'LOAD_STORED_REPORT',
        reportData: storedReport.reportData as WeeklyReportData,
        routedIncidents: storedReport.routedIncidents || [],
      });
      setActiveView('weekly');
    } else if (storedReport.type === 'aging') {
      setAgingStoredReport({
        data: storedReport.reportData as AgingReportData,
        incidents: storedReport.routedIncidents,
      });
      setActiveView('aging');
    }
  }, []);

  //FILE UPLOAD
  const handleFileSelected = useCallback(async (file: File) => {
    dispatch({ type: 'SET_PROCESSING', isProcessing: true });
    dispatch({ type: 'SET_ERROR', error: null });

    try {
      const result = await parseFile(file);

      if (!result.success) {
        dispatch({ type: 'SET_ERROR', error: result.errors.join('. ') });
        dispatch({ type: 'SET_PROCESSING', isProcessing: false });
        return;
      }

      dispatch({
        type: 'SET_FILE',
        fileName: file.name,
        rawData: result.data as Record<string, unknown>[],
        columns: result.columns,
      });

      // Auto-detect column mapping
      const detectedMapping = autoDetectMapping(result.columns);
      const fullMapping: ColumnMapping = {
        ...state.columnMapping,
        ...detectedMapping,
      };
      dispatch({ type: 'SET_COLUMN_MAPPING', mapping: fullMapping });

      // Map and validate
      const { incidents, validationSummary } = mapAllRows(result.data, fullMapping);
      dispatch({ type: 'SET_VALIDATION', incidents, summary: validationSummary });

      // Auto-advance to validation
      dispatch({ type: 'SET_STEP', step: 'validation' });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        error: `Failed to process file: ${error instanceof Error ? error.message : String(error)}`,
      });
    } finally {
      dispatch({ type: 'SET_PROCESSING', isProcessing: false });
    }
  }, [state.columnMapping]);

  //ROUTING
  const handleProceedToRouting = useCallback(() => {
    const { routedIncidents, summary } = applyRouting(state.incidents, state.routingConfig);
    dispatch({ type: 'SET_ROUTING_RESULT', incidents: routedIncidents, summary });
    dispatch({ type: 'SET_STEP', step: 'routing' });
  }, [state.incidents, state.routingConfig]);

  // PREVIOUS WEEK
  const handleProceedToPreviousWeek = useCallback(() => {
    // Calculate SLA for all routed incidents in the raw dataset
    const slaReport = calculateSLAReport(state.routedIncidents, REPORT_TEAMS);
    dispatch({ type: 'SET_SLA_REPORT', report: slaReport });

    // Transition to the manual input step for previous week SLA.
    dispatch({ type: 'SET_STEP', step: 'previous-week' });
  }, [state.routedIncidents]);

  //REPORT GENERATION 
  const handleGenerateReport = useCallback(() => {
    const currentWeekReport = calculateSLAReport(state.routedIncidents, REPORT_TEAMS);
    const weeklyCompletion = calculateWeeklyCompletion(state.routedIncidents);

    const reportData: WeeklyReportData = {
      reportTitle: 'Closed Incident Weekly Report',
      reportPeriod: state.reportPeriod || `Week of ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`,
      generatedAt: new Date(),
      currentWeek: currentWeekReport,
      previousWeek: state.previousWeekSLA,
      weeklyCompletion,
      teamOrder: REPORT_TEAMS,
    };

    dispatch({ type: 'SET_REPORT_DATA', data: reportData });
    dispatch({ type: 'SET_STEP', step: 'report' });
  }, [state.routedIncidents, state.previousWeekSLA, state.reportPeriod]);

  //NAVIGATION
  const handleStepClick = useCallback((step: AppStep) => {
    dispatch({ type: 'SET_STEP', step });
  }, []);

  // EXPORT
  const handleExportPng = useCallback(async () => {
    try {
      await exportAsPng('sla-report-canvas', `SLA_Report_${new Date().toISOString().split('T')[0]}.png`);
    } catch {
      dispatch({ type: 'SET_ERROR', error: 'Failed to export report as PNG' });
    }
  }, []);

  // DETAIL MODAL 
  const handleCellClick = useCallback((title: string, incidentIds: string[]) => {
    dispatch({ type: 'OPEN_DETAIL_MODAL', title, incidentIds });
  }, []);


  // 1) Not logged in → PIN screen
  if (!currentAccount) {
    return <PinLogin onLogin={setCurrentAccount} />;
  }

  // 2) Dashboard
  if (activeView === 'dashboard') {
    return (
      <Dashboard
        account={currentAccount}
        onSelectReport={(view) => setActiveView(view)}
        onOpenStoredReport={handleOpenStoredReport}
        onLogout={() => {
          setCurrentAccount(null);
          setActiveView('dashboard');
        }}
      />
    );
  }

  // 3) Coming soon (Monthly / Triannual)
  if (activeView === 'monthly' || activeView === 'triannual') {
    const labels: Record<string, string> = {
      monthly: 'Monthly Incident Report',
      triannual: 'Triannual Incident Report',
    };
    return (
      <div className="db-shell">
        <header className="db-topbar">
          <div className="db-topbar-inner">
            <div className="db-brand">
              <span className="db-brand-title">📊 Weekly SLA Report Generator</span>
            </div>
            <button className="header-user-badge" onClick={() => setCurrentAccount(null)}>
              👤 {currentAccount.name}
              {isAdmin(currentAccount) && <span className="badge-role">Admin</span>}
            </button>
          </div>
        </header>
        <main className="db-page-wrap" style={{ textAlign: 'center', paddingTop: '5rem' }}>
          <p className="db-eyebrow" style={{ marginBottom: '1rem' }}>{labels[activeView]}</p>
          <h2 className="db-heading" style={{ marginBottom: '0.75rem' }}>🚧 Coming Soon</h2>
          <p className="db-subheading" style={{ margin: '0 auto 2rem' }}>
            This report type is not yet available. Check back in a future update.
          </p>
          <button
            className="db-open-btn"
            style={{ width: 'auto', display: 'inline-flex' }}
            onClick={() => setActiveView('dashboard')}
          >
            ← Back to dashboard
          </button>
        </main>
      </div>
    );
  }

  // 4) Aging Trends Module
  if (activeView === 'aging') {
    return (
      <AgingReportWorkflow
        account={currentAccount}
        onBack={() => {
          setAgingStoredReport(null);
          setActiveView('dashboard');
          dispatch({ type: 'RESET' });
        }}
        initialReportData={agingStoredReport?.data}
        initialRoutedIncidents={agingStoredReport?.incidents}
      />
    );
  }

  // 5) Weekly SLA Report (existing workflow)
  return (
    <main className="app-main">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="header-brand">
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setActiveView('dashboard');
                dispatch({ type: 'RESET' });
              }}
              style={{ marginRight: '0.5rem' }}
              title="Back to dashboard"
            >
              ←
            </button>
            <span className="brand-icon">📊</span>
            <div>
              <h1 className="brand-title">Weekly Aging Incident Report</h1>
              <p className="brand-subtitle">Transform raw incident data into accurate SLA reports</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {state.fileName && (
              <div className="header-file-info">
                <span className="file-badge">📄 {state.fileName}</span>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => dispatch({ type: 'RESET' })}
                >
                  Reset
                </button>
              </div>
            )}
            {/* Logged-in user badge */}
            <button
              className="header-user-badge"
              onClick={() => setCurrentAccount(null)}
              title="Click to log out"
            >
              👤 {currentAccount.name}
              {isAdmin(currentAccount) && (
                <span className="badge-role">Admin</span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Stepper */}
      <div className="stepper-container">
        <Stepper
          currentStep={state.currentStep}
          onStepClick={handleStepClick}
        />
      </div>

      {/* Error Banner */}
      {state.error && (
        <div className="error-banner">
          <span>⚠️ {state.error}</span>
          <button onClick={() => dispatch({ type: 'SET_ERROR', error: null })}>✕</button>
        </div>
      )}

      {/* Main Content */}
      <div className="app-content">
        {/* STEP 1: Upload */}
        {state.currentStep === 'upload' && (
          <div className="step-content">
            <div className="step-intro">
              <h2>Upload Raw Incident Data</h2>
              <p>
                Upload your incident report file (XLSX or CSV) exported from ServiceDesk Plus or
                similar system. The system will auto-detect columns and validate the data.
              </p>
            </div>
            <FileUpload
              onFileSelected={handleFileSelected}
              isProcessing={state.isProcessing}
            />

            {/* Report Period Input */}
            <div className="period-input-section">
              <label htmlFor="report-period" className="period-label">
                Report Period (optional)
              </label>
              <input
                id="report-period"
                type="text"
                className="period-input"
                placeholder="e.g., September 29 - October 5, 2026"
                value={state.reportPeriod}
                onChange={(e) => dispatch({ type: 'SET_REPORT_PERIOD', period: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* STEP 2: Validation */}
        {state.currentStep === 'validation' && state.validationSummary && (
          <ValidationSummaryView
            summary={state.validationSummary}
            onProceed={handleProceedToRouting}
            onBack={() => dispatch({ type: 'SET_STEP', step: 'upload' })}
          />
        )}

        {/* STEP 3: Routing */}
        {state.currentStep === 'routing' && state.routingSummary && (
          <RoutingPreview
            summary={state.routingSummary}
            onProceed={handleProceedToPreviousWeek}
            onBack={() => dispatch({ type: 'SET_STEP', step: 'validation' })}
          />
        )}

        {/* STEP 4: Previous Week */}
        {state.currentStep === 'previous-week' && (
          <PreviousWeekInput
            initialValues={state.previousWeekSLA}
            onSave={(values) => dispatch({ type: 'SET_PREVIOUS_WEEK', previousWeek: values })}
            onBack={() => dispatch({ type: 'SET_STEP', step: 'routing' })}
            onProceed={handleGenerateReport}
          />
        )}

        {/* STEP 5: Report */}
        {state.currentStep === 'report' && state.reportData && (
          <div className="report-step">
            <div className="report-actions-bar">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  if (!state.rawData) {
                    setActiveView('dashboard');
                  } else {
                    dispatch({ type: 'SET_STEP', step: 'previous-week' });
                  }
                }}
              >
                {state.rawData ? '← Back' : '← Back to Dashboard'}
              </button>
              <div className="report-export-buttons">
                <ExportDropdown
                  incidents={state.routedIncidents}
                  reportData={state.reportData}
                  baseFilename="SMAC_Incident_Report"
                />
                <button className="btn btn-export" onClick={handleExportPng}>
                  📷 Download PNG
                </button>
              </div>
            </div>

            <SLAReportTable
              data={state.reportData}
              onCellClick={handleCellClick}
              routedIncidents={state.routedIncidents}
            />
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <DetailModal
        isOpen={state.detailModal.isOpen}
        title={state.detailModal.title}
        incidentIds={state.detailModal.incidentIds}
        onClose={() => dispatch({ type: 'CLOSE_DETAIL_MODAL' })}
      />
    </main>
  );
}
