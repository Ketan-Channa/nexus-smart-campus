import React, { useState } from 'react';
import { FileText, Download, ShieldCheck, CheckCircle2, Eye, RefreshCw } from 'lucide-react';
import { type LinkedStudent } from './ParentSidebar';

interface ParentDocumentsViewProps {
  parentEmail: string;
  selectedChild: LinkedStudent | null;
}

export const ParentDocumentsView: React.FC<ParentDocumentsViewProps> = ({
  parentEmail,
  selectedChild,
}) => {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const officialDocuments = [
    {
      id: 'DOC-1',
      title: 'Official Semester 3 Grade Transcript & Marksheet',
      category: 'Academic Records',
      issueDate: '2026-08-15',
      authority: 'Office of the Controller of Examinations',
      fileSize: '1.4 MB (Signed PDF)',
    },
    {
      id: 'DOC-2',
      title: 'Current Academic Year Bonafide Student Certificate',
      category: 'Institutional Verification',
      issueDate: '2026-09-01',
      authority: 'Dean of Academic Affairs',
      fileSize: '450 KB (Signed PDF)',
    },
    {
      id: 'DOC-3',
      title: 'Official Semester 4 Fee Payment Receipt (REC-2026-4401)',
      category: 'Financial Ledger',
      issueDate: '2026-10-20',
      authority: 'University Finance & Accounts Wing',
      fileSize: '320 KB (Tamper-proof Receipt)',
    },
    {
      id: 'DOC-4',
      title: 'Annual Campus Bus Transit Pass & Route Authorization',
      category: 'Transit Services',
      issueDate: '2026-07-28',
      authority: 'Chief Transport Supervisor',
      fileSize: '680 KB (QR Pass)',
    },
  ];

  const handleDownload = (docId: string, title: string) => {
    setDownloadingId(docId);
    setTimeout(() => {
      setDownloadingId(null);
      alert(`Document "${title}" is verified and ready for download. Institutional digital signature attached.`);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            Official Student Documents & Transcripts
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Institutional verified records, grade sheets, and certificates for {selectedChild?.full_name} ({selectedChild?.roll_number})
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950 px-3.5 py-1.5 rounded-full border border-teal-200/50 self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4" />
          <span>Legally Verified Vault</span>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {officialDocuments.map((doc) => (
          <div
            key={doc.id}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase mb-2">
                <span>{doc.category}</span>
                <span className="text-teal-600 dark:text-teal-400 font-extrabold">{doc.fileSize}</span>
              </div>

              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white line-clamp-1">
                {doc.title}
              </h3>

              <div className="mt-3 space-y-1 text-xs text-slate-500">
                <div>Issued By: <strong className="text-slate-700 dark:text-slate-300">{doc.authority}</strong></div>
                <div>Date of Issue: <strong>{doc.issueDate}</strong></div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <button
                onClick={() => handleDownload(doc.id, doc.title)}
                disabled={downloadingId === doc.id}
                className="flex-1 py-2 px-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{downloadingId === doc.id ? 'Verifying Signature...' : 'Download Document'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
