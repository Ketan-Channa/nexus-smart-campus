import React, { useState } from 'react';
import {
  Compass,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Send,
  Copy,
  Check,
  TrendingUp,
  FileText,
  Briefcase,
  Award,
} from 'lucide-react';

interface AlumniCareerGuidanceProps {
  session: any;
}

export const AlumniCareerGuidance: React.FC<AlumniCareerGuidanceProps> = ({ session }) => {
  const [promptType, setPromptType] = useState('BIO_GENERATOR');
  const [targetRole, setTargetRole] = useState('Senior Software Engineer');
  const [company, setCompany] = useState(session?.currentCompany || 'Top Tech Enterprise');
  const [skills, setSkills] = useState('System Design, Cloud Native, React, Node.js');
  const [topic, setTopic] = useState('Career Transition & High Scale Architecture');
  const [generatedText, setGeneratedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/alumni/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptType,
          name: session?.name || 'Alumnus',
          company,
          designation: session?.currentDesignation || targetRole,
          skills,
          targetRole,
          topic,
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setGeneratedText(data.generatedContent || '');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
        <h2 className="font-display font-black text-xl text-slate-900 dark:text-white flex items-center gap-2">
          <Compass className="w-5 h-5 text-indigo-500" />
          AI Career Guidance & Mentorship Toolkit
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Harness AI to draft impactful bios, prepare student mentoring frameworks, write job descriptions, and generate endorsement notes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Generator Form */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-display font-black text-sm uppercase text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-500" />
            AI Career Assistant
          </h3>

          <form onSubmit={handleGenerate} className="space-y-3 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Assistant Mode
              </label>
              <select
                value={promptType}
                onChange={(e) => setPromptType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
              >
                <option value="BIO_GENERATOR">Professional Bio Generator</option>
                <option value="NETWORKING_MESSAGE">Networking Icebreaker Draft</option>
                <option value="MENTORSHIP_PITCH">Mentorship Framework & Objectives</option>
                <option value="REFERRAL_PITCH">Student Referral Pitch Template</option>
                <option value="JOB_DESCRIPTION">Hiring Job Post Creator</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Target Role / Domain
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Organization / Company
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Key Skills / Focus Areas
              </label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-md shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Generating AI Content...' : 'Generate Career Content'}</span>
            </button>
          </form>
        </div>

        {/* AI Output Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-black text-sm uppercase text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-500" />
                Generated Output
              </h3>
              {generatedText && (
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Text'}</span>
                </button>
              )}
            </div>

            {generatedText ? (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                {generatedText}
              </div>
            ) : (
              <div className="p-12 text-center text-xs text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                Configure parameters on the left and click Generate to produce high quality career content.
              </div>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60 text-xs text-indigo-900 dark:text-indigo-200 space-y-1">
            <span className="font-bold block">💡 Mentoring Tip:</span>
            <p className="text-[11px] text-indigo-700 dark:text-indigo-300">
              Students appreciate actionable advice on interview coding rounds and real-world system architecture tradeoffs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
