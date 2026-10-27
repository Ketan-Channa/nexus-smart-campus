import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Search,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Eye,
  X,
  FileCheck2,
} from 'lucide-react';

export const AdminDocumentsCertificates: React.FC = () => {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  // Preview Modal
  const [previewDoc, setPreviewDoc] = useState<any | null>(null);

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://nexus-smart-campus-backend.onrender.com/api/admin/documents');
      const data = await res.json();
      if (data.status === 'success') {
        setDocs(data.documents || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleVerifyDoc = async (docId: number, status: 'Verified' | 'Rejected') => {
    try {
      const res = await fetch('https://nexus-smart-campus-backend.onrender.com/api/admin/documents/verify', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docId,
          status,
          remarks: status === 'Verified' ? 'Document verified and approved' : 'Rejected - illegible or unverified',
          adminEmail: 'admin@nexus.edu',
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setActionMsg(`Document marked as ${status}!`);
        fetchDocs();
      }
    } catch (err: any) {
      setActionMsg(`Error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
            Student Documents & Certificates Verification
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit student certificates, identify verification evidence, and approve institutional documents.
          </p>
        </div>
        <button
          onClick={fetchDocs}
          disabled={loading}
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {actionMsg && (
        <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-center justify-between">
          <span>{actionMsg}</span>
          <button onClick={() => setActionMsg(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Documents Table */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 overflow-hidden backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-800/40 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Document Title</th>
                <th className="py-3 px-4">Student & Roll</th>
                <th className="py-3 px-4">File Details</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Verification Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    Loading student documents...
                  </td>
                </tr>
              ) : docs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-emerald-400">
                    <CheckCircle2 className="w-6 h-6 mx-auto mb-2" />
                    All student documents have been verified!
                  </td>
                </tr>
              ) : (
                docs.map((d) => {
                  const isVerified = d.verification_status === 'Verified';
                  return (
                    <tr key={d.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4 font-semibold text-white">
                        {d.document_title || d.original_filename || 'Certificate'}
                        <div className="text-[10px] text-slate-400 font-mono">{d.file_type || 'PDF/Document'}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-200">{d.student_name || 'Enrolled Student'}</div>
                        <div className="text-[11px] text-indigo-300 font-mono">{d.student_roll_number}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                        {d.file_size ? `${Math.round(d.file_size / 1024)} KB` : 'Uploaded'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            isVerified
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                          }`}
                        >
                          {d.verification_status || 'Pending'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        {d.file_data_url && (
                          <button
                            onClick={() => setPreviewDoc(d)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                            title="Preview File"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {!isVerified ? (
                          <>
                            <button
                              onClick={() => handleVerifyDoc(d.id, 'Verified')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-semibold border border-emerald-500/30 transition text-[11px]"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleVerifyDoc(d.id, 'Rejected')}
                              className="px-2.5 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 font-semibold border border-rose-500/30 transition text-[11px]"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <span className="text-[11px] text-emerald-400 font-semibold">Verified</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-sm font-bold text-white">Document Preview: {previewDoc.document_title}</h3>
              <button onClick={() => setPreviewDoc(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-auto bg-slate-950 rounded-xl p-4 flex items-center justify-center">
              {previewDoc.file_data_url?.startsWith('data:image') ? (
                <img src={previewDoc.file_data_url} alt="Document" className="max-h-[60vh] rounded object-contain" />
              ) : (
                <iframe src={previewDoc.file_data_url} className="w-full h-[60vh] rounded" title="Document Viewer" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
