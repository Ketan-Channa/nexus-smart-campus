import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Globe,
  Building2,
  Send,
  Users,
  Sparkles,
  X,
  ExternalLink,
  Award,
  Layers,
} from 'lucide-react';
import { API_BASE } from '../../config/api';
import { type UserSession } from '../../types/auth';

interface ResearchProject {
  id: number;
  projectId: string;
  creatorEmail: string;
  creatorName: string;
  department: string;
  institution: string;
  title: string;
  researchDomain: string;
  description: string;
  requiredExpertise: string;
  visibility: 'Intra-College' | 'Inter-College' | 'Public';
  projectStage: string;
  status: string;
  milestones: any[];
  members: any[];
  createdAt: string;
}

interface FacultyResearchCollaborationsProps {
  session: UserSession;
  facultyName?: string;
  facultyEmail?: string;
  department?: string;
}

export const FacultyResearchCollaborations: React.FC<FacultyResearchCollaborationsProps> = ({
  session,
  facultyName = 'Dr. SMB',
  facultyEmail = 'faculty@nexus.edu',
  department = 'Computer Science & Engineering',
}) => {
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'my-projects'>('all');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [selectedStage, setSelectedStage] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ResearchProject | null>(null);
  const [applyProposal, setApplyProposal] = useState('');
  const [proposedRole, setProposedRole] = useState('Co-Investigator');
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State for New Project
  const [title, setTitle] = useState('');
  const [researchDomain, setResearchDomain] = useState('Artificial Intelligence');
  const [description, setDescription] = useState('');
  const [requiredExpertise, setRequiredExpertise] = useState('Python, PyTorch, Blockchain, Distributed Systems');
  const [visibility, setVisibility] = useState<'Intra-College' | 'Inter-College' | 'Public'>('Intra-College');
  const [projectStage, setProjectStage] = useState('Proposal / Ideation');

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/faculty/research/projects`, {
        params: {
          domain: selectedDomain,
          stage: selectedStage,
        },
      });
      if (res.data.success) {
        setProjects(res.data.projects || []);
      }
    } catch (err: any) {
      console.warn('Could not fetch research projects:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [selectedDomain, selectedStage]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      alert('Please fill in title and description.');
      return;
    }

    try {
      const res = await axios.post(`${API_BASE}/faculty/research/projects`, {
        creatorEmail: facultyEmail,
        creatorName: facultyName,
        department,
        institution: 'NEXUS Institute of Technology',
        title,
        researchDomain,
        description,
        requiredExpertise,
        visibility,
        projectStage,
        milestones: [
          { title: 'Literature Review & Dataset Collection', status: 'Completed', deadline: 'Month 1' },
          { title: 'Baseline Architecture Prototyping', status: 'In Progress', deadline: 'Month 3' },
          { title: 'Peer Review Paper Submission', status: 'Pending', deadline: 'Month 6' },
        ],
      });

      if (res.data.success) {
        setIsCreateModalOpen(false);
        setTitle('');
        setDescription('');
        setActionMsg({
          type: 'success',
          text: 'Research opportunity published successfully! Collaborators can now request to join.',
        });
        fetchProjects();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !applyProposal.trim()) return;

    try {
      const res = await axios.post(`${API_BASE}/faculty/research/apply`, {
        projectId: selectedProject.projectId,
        applicantEmail: facultyEmail,
        applicantName: facultyName,
        applicantDepartment: department,
        applicantInstitution: 'NEXUS Institute of Technology',
        message: applyProposal,
        proposedRole,
      });

      if (res.data.success) {
        setIsApplyModalOpen(false);
        setApplyProposal('');
        setActionMsg({
          type: 'success',
          text: `Collaboration request sent to ${selectedProject.creatorName}!`,
        });
      }
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const filteredProjects = projects.filter((p) => {
    if (activeTab === 'my-projects' && p.creatorEmail !== facultyEmail) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.creatorName.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-black text-2xl text-slate-900 dark:text-white flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-500/10 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <span>Research & Collaborations</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            Intra & Inter-College Faculty Research Hub • Co-Investigator Matchmaking • Funded Grants & Paper Submissions
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#7c3aed] hover:bg-purple-700 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Research Opportunity</span>
        </button>
      </div>

      {actionMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionMsg.text}</span>
        </div>
      )}

      {/* FILTER & SEARCH BAR */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0a0d18] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            All Campus Projects ({projects.length})
          </button>
          <button
            onClick={() => setActiveTab('my-projects')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'my-projects'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            My Projects ({projects.filter((p) => p.creatorEmail === facultyEmail).length})
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by title, domain, author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200"
            />
          </div>

          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200"
          >
            <option value="All">All Domains</option>
            <option value="Artificial Intelligence">Artificial Intelligence</option>
            <option value="Blockchain & Web3">Blockchain & Web3</option>
            <option value="Cybersecurity">Cybersecurity</option>
            <option value="Data Engineering">Data Engineering</option>
            <option value="IoT & Robotics">IoT & Robotics</option>
          </select>
        </div>
      </div>

      {/* PROJECTS LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredProjects.length === 0 ? (
          <div className="col-span-2 p-12 text-center rounded-3xl bg-white dark:bg-[#0a0d18] border border-slate-200 dark:border-slate-800">
            <BookOpen className="w-10 h-10 text-purple-600 mx-auto mb-2 opacity-50" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">No Research Opportunities Found</h3>
            <p className="text-xs text-slate-400 mt-1">Publish a new research initiative to find faculty collaborators.</p>
          </div>
        ) : (
          filteredProjects.map((p) => {
            const isOwner = p.creatorEmail === facultyEmail;

            return (
              <div
                key={p.projectId}
                className="p-6 rounded-3xl bg-white dark:bg-[#0a0d18] border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col justify-between space-y-4 hover:border-purple-500/40 transition-all text-left"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                      {p.researchDomain}
                    </span>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-bold">
                      {p.visibility}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display font-bold text-base text-slate-900 dark:text-white leading-tight">
                      {p.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                      <span>PI: {p.creatorName}</span>
                      <span>•</span>
                      <span>{p.department}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                    {p.description}
                  </p>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-[11px] space-y-1">
                    <div className="font-bold text-slate-700 dark:text-slate-300">Required Expertise:</div>
                    <div className="text-slate-500 dark:text-slate-400">{p.requiredExpertise || 'Open to all domain scholars'}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <span className="text-[11px] text-slate-400 font-mono">Stage: {p.projectStage}</span>

                  {isOwner ? (
                    <span className="text-xs px-3 py-1 rounded-xl bg-purple-500/10 text-purple-600 font-bold">
                      Your Project
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedProject(p);
                        setIsApplyModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#7c3aed] hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition-all"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Request Collaboration</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CREATE MODAL */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg p-6 rounded-3xl bg-white dark:bg-[#0c0f1d] border border-slate-200 dark:border-slate-800 shadow-2xl text-left space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Publish Research Opportunity</h3>
                </div>
                <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Project Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Decentralized Zero-Knowledge Proofs for Smart Campus Identity"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">Research Domain</label>
                    <select
                      value={researchDomain}
                      onChange={(e) => setResearchDomain(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200"
                    >
                      <option value="Artificial Intelligence">Artificial Intelligence</option>
                      <option value="Blockchain & Web3">Blockchain & Web3</option>
                      <option value="Cybersecurity">Cybersecurity</option>
                      <option value="Data Engineering">Data Engineering</option>
                      <option value="IoT & Robotics">IoT & Robotics</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">Visibility</label>
                    <select
                      value={visibility}
                      onChange={(e: any) => setVisibility(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200"
                    >
                      <option value="Intra-College">Intra-College Only</option>
                      <option value="Inter-College">Inter-College Network</option>
                      <option value="Public">Public Academic Community</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Project Abstract & Objectives</label>
                  <textarea
                    rows={4}
                    placeholder="Provide a comprehensive abstract of the research problem, methodology, and targets..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Required Skills / Prerequisites</label>
                  <input
                    type="text"
                    placeholder="e.g. Smart Contracts, Solidity, Python, LaTeX Paper Writing"
                    value={requiredExpertise}
                    onChange={(e) => setRequiredExpertise(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#7c3aed] hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/30"
                  >
                    Publish Project
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* APPLY MODAL */}
      <AnimatePresence>
        {isApplyModalOpen && selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md p-6 rounded-3xl bg-white dark:bg-[#0c0f1d] border border-slate-200 dark:border-slate-800 shadow-2xl text-left space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Send className="w-5 h-5 text-purple-600" />
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Request Collaboration</h3>
                </div>
                <button onClick={() => setIsApplyModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-500 font-semibold">{selectedProject.title}</p>

              <form onSubmit={handleApply} className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Proposed Collaboration Role</label>
                  <select
                    value={proposedRole}
                    onChange={(e) => setProposedRole(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200"
                  >
                    <option value="Co-Investigator">Co-Investigator (Co-PI)</option>
                    <option value="Domain Specialist / Consultant">Domain Specialist / Consultant</option>
                    <option value="Data Analyst / Implementer">Data Analyst / Implementer</option>
                    <option value="Paper Author / Reviewer">Paper Author / Reviewer</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Proposal & Background Experience</label>
                  <textarea
                    rows={4}
                    placeholder="Describe how your background and expertise can contribute to this project..."
                    value={applyProposal}
                    onChange={(e) => setApplyProposal(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 outline-none"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsApplyModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#7c3aed] hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/30"
                  >
                    Send Request
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
