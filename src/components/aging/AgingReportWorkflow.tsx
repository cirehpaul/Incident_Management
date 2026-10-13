'use client';

import React, { useReducer, useCallback } from 'react';
import type { Account } from '@/lib/auth';
import { isAdmin } from '@/lib/auth';
import { agingReducer, agingInitialState } from '@/lib/aging-store';
import type { AgingStep } from '@/lib/aging-store';
import { AgingStepper } from '@/components/aging/AgingStepper';
import { FileUpload } from '@/components/upload/FileUpload';
import { ValidationSummaryView } from '@/components/validation/ValidationSummary';
import { RoutingPreview } from '@/components/routing/RoutingPreview';
import { AgingPreviousWeekInput } from '@/components/aging/AgingPreviousWeekInput';
import { AgingReportTable } from '@/components/aging/AgingReportTable';
import { ExportDropdown } from '@/components/report/ExportDropdown';
import { DetailModal } from '@/components/report/DetailModal';

import { parseFile } from '@/lib/excel/parser';
import { autoDetectMapping, mapAllRows } from '@/lib/excel/mapper';
import { applyRouting } from '@/lib/routing/routing-engine';
import {
  calculateAgingSLA,
  calculateAgingDistribution,
  calculatePreviousWeekAging,
  splitAgingByWeek,
  filterOpenIncidents
} from '@/lib/aging/calculator';
import { exportAsPng } from '@/lib/report/export';
import { REPORT_TEAMS } from '@/lib/routing/routing-engine';

import type { ColumnMapping } from '@/types/incident';
import type { AgingReportData } from '@/types/aging';

interface AgingReportWorkflowProps {
  account: Account;
  onBack: () => void;
}

export function AgingReportWorkflow({ account, onBack }: AgingReportWorkflowProps) {
  const [state, dispatch] = useReducer(agingReducer, agingInitialState);

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

      const detectedMapping = autoDetectMapping(result.columns);
      const fullMapping: ColumnMapping = {
        ...state.columnMapping,
        ...detectedMapping,
      };
      dispatch({ type: 'SET_COLUMN_MAPPING', mapping: fullMapping });

      const { incidents, validationSummary } = mapAllRows(result.data, fullMapping);
      dispatch({ type: 'SET_VALIDATION', incidents, summary: validationSummary });
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
    // Instead of auto-calculating, just transition to the manual input step.
    // The previous week aging form state will just start with empty (null) values.
    dispatch({ type: 'SET_STEP', step: 'previous-week' });
  }, []);

  //REPORT GENERATION 
  const handleGenerateReport = useCallback(() => {
    // Current week incidents (for aging we just want the whole dataset effectively)
    const { currentWeek } = splitAgingByWeek(state.routedIncidents);
    
    // Find the latest created time in the dataset to use as the reference date ("today" for the report)
    let maxDate = new Date(0);
    for (const inc of currentWeek) {
      if (inc.createdTime && inc.createdTime > maxDate) maxDate = inc.createdTime;
    }
    const referenceDate = maxDate.getTime() === 0 ? new Date() : maxDate;

    // Both tables for Aging IR should use only OPEN incidents!
    const currentWeekOpen = filterOpenIncidents(currentWeek);
    
    // SLA logic for Aging IR uses only open incidents, measured against referenceDate
    const { rows: slaRows, totals: slaTotals } = calculateAgingSLA(currentWeekOpen, REPORT_TEAMS, referenceDate);
    
    // Aging Distribution logic uses only OPEN incidents, measured against referenceDate
    const agingRows = calculateAgingDistribution(currentWeekOpen, REPORT_TEAMS, referenceDate);
    const agingGrandTotal = agingRows.reduce((acc, row) => acc + row.totalAging, 0);

    const reportData: AgingReportData = {
      reportTitle: 'Aging Incident Report',
      reportPeriod: state.reportPeriod || `Week of ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`,
      generatedAt: new Date(),
      slaRows,
      slaTotals,
      agingRows,
      agingGrandTotal,
      previousWeek: state.previousWeekAging,
      teamOrder: REPORT_TEAMS,
    };

    dispatch({ type: 'SET_REPORT_DATA', data: reportData });
    dispatch({ type: 'SET_STEP', step: 'report' });
  }, [state.routedIncidents, state.previousWeekAging, state.reportPeriod]);

  //NAVIGATION
  const handleStepClick = useCallback((step: AgingStep) => {
    dispatch({ type: 'SET_STEP', step });
  }, []);

  // EXPORT
  const handleExportPng = useCallback(async () => {
    try {
      await exportAsPng('aging-report-canvas', `Aging_Report_${new Date().toISOString().split('T')[0]}.png`);
    } catch {
      dispatch({ type: 'SET_ERROR', error: 'Failed to export report as PNG' });
    }
  }, []);

  // DETAIL MODAL 
  const handleCellClick = useCallback((title: string, incidentIds: string[]) => {
    dispatch({ type: 'OPEN_DETAIL_MODAL', title, incidentIds });
  }, []);

  return (
    <main className="app-main">
      <header className="app-header">
        <div className="header-content">
          <div className="header-brand">
            <button
              className="btn btn-ghost btn-sm"
              onClick={onBack}
              style={{ marginRight: '0.5rem' }}
              title="Back to dashboard"
            >
              ←
            </button>
            <span className="brand-icon">📈</span>
            <div>
              <h1 className="brand-title">Aging Trends Module</h1>
              <p className="brand-subtitle">Analyze open incidents and SLA compliance</p>
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
            <button className="header-user-badge">
              👤 {account.name}
              {isAdmin(account) && (
                <span className="badge-role">Admin</span>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="stepper-container">
        <AgingStepper
          currentStep={state.currentStep}
          onStepClick={handleStepClick}
        />
      </div>

      {state.error && (
        <div className="error-banner">
          <span>⚠️ {state.error}</span>
          <button onClick={() => dispatch({ type: 'SET_ERROR', error: null })}>✕</button>
        </div>
      )}

      <div className="app-content">
        {state.currentStep === 'upload' && (
          <div className="step-content">
            <div className="step-intro">
              <h2>Upload Raw Incident Data</h2>
              <p>Upload your incident report file (XLSX or CSV) for Aging Trends analysis.</p>
            </div>
            <FileUpload
              onFileSelected={handleFileSelected}
              isProcessing={state.isProcessing}
            />
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

        {state.currentStep === 'validation' && state.validationSummary && (
          <ValidationSummaryView
            summary={state.validationSummary}
            onProceed={handleProceedToRouting}
            onBack={() => dispatch({ type: 'SET_STEP', step: 'upload' })}
          />
        )}

        {state.currentStep === 'routing' && state.routingSummary && (
          <RoutingPreview
            summary={state.routingSummary}
            onProceed={handleProceedToPreviousWeek}
            onBack={() => dispatch({ type: 'SET_STEP', step: 'validation' })}
          />
        )}

        {state.currentStep === 'previous-week' && (
          <AgingPreviousWeekInput
            initialValues={state.previousWeekAging}
            onSave={(values) => dispatch({ type: 'SET_PREVIOUS_WEEK', previousWeek: values })}
            onBack={() => dispatch({ type: 'SET_STEP', step: 'routing' })}
            onProceed={handleGenerateReport}
          />
        )}

        {state.currentStep === 'report' && state.reportData && (
          <div className="report-step">
            <div className="report-actions-bar">
              <button
                className="btn btn-secondary"
                onClick={() => dispatch({ type: 'SET_STEP', step: 'previous-week' })}
              >
                ← Back
              </button>
              <div className="report-export-buttons">
                <ExportDropdown
                  incidents={state.routedIncidents}
                  reportData={state.reportData}
                  baseFilename="SMAC_Aging_Report"
                />
                <button className="btn btn-export" onClick={handleExportPng}>
                  📷 Download PNG
                </button>
              </div>
            </div>

            <AgingReportTable data={state.reportData} onCellClick={handleCellClick} />
          </div>
        )}
      </div>

      <DetailModal
        isOpen={state.detailModal.isOpen}
        title={state.detailModal.title}
        incidentIds={state.detailModal.incidentIds}
        onClose={() => dispatch({ type: 'CLOSE_DETAIL_MODAL' })}
      />
    </main>
  );
}
