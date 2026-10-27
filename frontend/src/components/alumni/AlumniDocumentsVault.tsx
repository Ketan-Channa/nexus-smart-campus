import React, { useState, useEffect } from 'react';
import {
  FileCheck,
  Plus,
  Trash2,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  X,
} from 'lucide-react';

interface AlumniDocumentsVaultProps {
  session: any;
}

export const AlumniDocumentsVault: React.FC<AlumniDocumentsVaultProps> = ({ session }) => {
  const userEmail = session?.email || '';

  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [docTitle, setDocTitle] = useState('');
  const [docType, setDocType] = useState('Degree Certificate');
  const [fileUrl, setFileUrl] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, [userEmail]);

  const fetchDocuments = async () => {
    if (!userEmail) return;
    setLoading(true);
    try {
      const res = await fetch(`https://nexus-smart-campus-backend.onrender.com/api/alumni/documents?alumniEmail=${encodeURIComponent(userEmail)}`);
      const data = await res.json();
      if (data.status === 'success') {
        setDocuments(data.documents || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('https://nexus-smart-campus-backend.onrender.com/api/alumni/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alumniEmail: userEmail,
          documentTitle: docTitle,
          documentType: docType,
          fileUrl,
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setSuccessMsg('Document / credential registered successfully!');
        setShowAddModal(false);
        setDocTitle('');
        setFileUrl('');
        fetchDocuments();
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`https://nexus-smart-campus-backend.onrender.com/api/alumni/documents/${id}`, { method: 'DELETE' });
      fetchDocuments();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display font-black text-xl text-slate-900 dark:text-white flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-indigo-500" />
              Alumni Documents, Degrees & Credentials Vault
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage degree certificates, verified credentials, publications, and professional licenses.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs shadow-md transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Credential / Document</span>
          </button>
        </div>
      </div>

      {/* Documents Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading documents...</div>
      ) : documents.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <FileText className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-xs text-slate-500">No documents or credentials uploaded yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold">
                    {doc.document_type}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      doc.verification_status === 'VERIFIED'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {doc.verification_status === 'VERIFIED' ? 'Verified' : 'Self-Reported'}
                  </span>
                </div>

                <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white truncate">
                  {doc.document_title}
                </h4>

                <p className="text-[10px] text-slate-400">
                  Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>View Document</span>
                </a>

                <button
                  onClick={() => handleDelete(doc.id)}
                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all"
                  title="Delete Document"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-indigo-500" />
                Register Credential / Document
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDocument} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="e.g. B.Tech Degree Certificate"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Document Category
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                >
                  <option value="Degree Certificate">Degree Certificate</option>
                  <option value="Experience Letter">Experience Letter</option>
                  <option value="Achievement / Award">Achievement / Award</option>
                  <option value="Publication">Research Publication</option>
                  <option value="Patent">Patent / Intellectual Property</option>
                  <option value="Other">Other Credential</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Secure File URL or Document Drive Link
                </label>
                <input
                  type="url"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  placeholder="https://drive.google.com/file/..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl font-bold text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md"
                >
                  Save Credential
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
