import React, { useState, useEffect } from 'react';
import {
  Award,
  BookOpen,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  FileText,
  Star,
} from 'lucide-react';
import { type LinkedStudent } from './ParentSidebar';

interface ParentExamsResultsProps {
  parentEmail: string;
  selectedChild: LinkedStudent | null;
}

export const ParentExamsResults: React.FC<ParentExamsResultsProps> = ({
  parentEmail,
  selectedChild,
}) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const fetchExams = async () => {
    if (!parentEmail || !selectedChild?.roll_number) return;
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/parent/academics/exams?email=${encodeURIComponent(
          parentEmail
        )}&studentRoll=${encodeURIComponent(selectedChild.roll_number)}`
      );
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error('Fetch exams error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, [parentEmail, selectedChild?.roll_number]);

  const subjects = data?.subjects || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <Award className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            Official Exams, Results & Analytics
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Institutional published evaluations for {selectedChild?.full_name} ({selectedChild?.roll_number})
          </p>
        </div>

        <button
          onClick={fetchExams}
          disabled={loading}
          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl flex items-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Results</span>
        </button>
      </div>

      {/* Security & Verification Banner */}
      <div className="p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/20 border border-teal-200/60 dark:border-teal-900/40 text-xs text-teal-900 dark:text-teal-300 flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0" />
        <div>
          <strong>Verified Academic Disclosures Only:</strong> By university academic governance rules, only results formally vetted and released by Department Faculty Examiners are visible. Internal faculty drafts remain confidential.
        </div>
      </div>

      {/* Subject Performance Cards */}
      {subjects.length > 0 ? (
        <div className="space-y-6">
          {subjects.map((sub: any, idx: number) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-teal-600 dark:text-teal-400">
                      {sub.code}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{sub.type}</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                    {sub.name}
                  </h3>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Total Scored</div>
                    <div className="text-lg font-black text-slate-900 dark:text-white">
                      {sub.totalObtained} / {sub.totalMax}
                    </div>
                  </div>

                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-500 text-white font-black text-xl flex items-center justify-center shadow-md">
                    {sub.grade}
                  </div>
                </div>
              </div>

              {/* Components List */}
              <div className="mt-4 space-y-3">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Assessment Components Breakdown
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {sub.components.map((comp: any, cIdx: number) => (
                    <div
                      key={cIdx}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-slate-900 dark:text-white">
                            {comp.componentName}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                            {comp.percentage}%
                          </span>
                        </div>
                        <div className="text-sm font-black text-teal-600 dark:text-teal-400 mt-2">
                          {comp.marksObtained} <span className="text-xs font-normal text-slate-400">/ {comp.maxMarks}</span>
                        </div>
                      </div>

                      {comp.remarks && (
                        <div className="mt-2.5 pt-2 border-t border-slate-200/50 dark:border-slate-700/50 text-[11px] text-slate-500 italic">
                          "{comp.remarks}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-sm">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700 dark:text-slate-300">No Published Examination Records</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Assessment marks for the current semester have not been formally released by the department examination committee yet.
          </p>
        </div>
      )}
    </div>
  );
};
