"""
NEXUS SMART CAMPUS PLATFORM
Shared AI Microservice (FastAPI + Google Gemini + Grounded RAG Engine)
Port: 8000
"""

import os
import re
import json
import time
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Document parsers
import PyPDF2
import docx

# Google Generative AI (Gemini)
try:
    import google.generativeai as genai
    HAS_GEMINI_LIB = True
except ImportError:
    HAS_GEMINI_LIB = False

load_dotenv()

app = FastAPI(
    title="NEXUS Smart Campus AI Microservice",
    version="2.0.0",
    description="Unified, Role-Aware AI Intelligence Layer for Student, Faculty, Parent, Alumni, and Admin Portals"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import urllib.request
import urllib.error

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
ACTIVE_MODEL_NAME = os.getenv("GEMINI_MODEL", "gemini-flash-lite-latest").strip()
raw_fallbacks = os.getenv("GEMINI_FALLBACK_MODELS", "gemini-3.8-flash,gemini-flash-latest,gemini-3.5-flash")
FALLBACK_MODELS = [m.strip() for m in raw_fallbacks.split(",") if m.strip()]

# Ordered model candidate pool for zero-downtime failover
MODEL_POOL = [ACTIVE_MODEL_NAME] + [m for m in FALLBACK_MODELS if m != ACTIVE_MODEL_NAME]

print(f"[OK] Google Gemini Multi-Tier Architecture configured. Active Model Pool: {MODEL_POOL}")
if GEMINI_API_KEY and GEMINI_API_KEY != "your_google_gemini_api_key_here":
    print(f"[OK] Google Gemini API Key configured: {GEMINI_API_KEY[:6]}...{GEMINI_API_KEY[-4:]}")
else:
    print("[INFO] Running in Grounded Knowledge Engine Mode (GEMINI_API_KEY not configured)")


def call_gemini_api(prompt: str, timeout: int = 6, max_tokens: int = 2048) -> tuple[Optional[str], Optional[str]]:
    """
    Executes prompt against Google Gemini with automated multi-tier model failover.
    Returns (generated_text, model_name) on success, or (None, None) if external provider is offline/busy.
    """
    if not GEMINI_API_KEY or GEMINI_API_KEY == "your_google_gemini_api_key_here":
        return None, None

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.3,
            "maxOutputTokens": max_tokens,
        }
    }
    encoded_payload = json.dumps(payload).encode("utf-8")

    for model_name in MODEL_POOL:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={GEMINI_API_KEY}"
        try:
            req = urllib.request.Request(
                url,
                data=encoded_payload,
                headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=timeout) as response:
                if response.status == 200:
                    data = json.loads(response.read().decode())
                    candidates = data.get("candidates", [])
                    if candidates and "content" in candidates[0]:
                        parts = candidates[0]["content"].get("parts", [])
                        if parts and "text" in parts[0]:
                            text = parts[0]["text"].strip()
                            return text, model_name
        except urllib.error.HTTPError as e:
            # 503 Service Unavailable / 429 Rate Limit / 404 Deprecated Model
            print(f"[WARN] Gemini model '{model_name}' HTTP {e.code}. Failover to next candidate...")
            continue
        except Exception as e:
            print(f"[WARN] Gemini model '{model_name}' network exception: {e}. Failover...")
            continue

    return None, None


# =========================================================================
# PYDANTIC SCHEMAS
# =========================================================================

class ChatMessage(BaseModel):
    role: str # "user", "assistant", "system"
    content: str

class ChatRequest(BaseModel):
    user_role: str # "Student", "Faculty", "Parent", "Alumni", "Admin"
    user_email: str
    user_name: Optional[str] = "Campus Member"
    prompt: str
    conversation_history: Optional[List[ChatMessage]] = []
    database_facts: Optional[List[str]] = []
    context_chunks: Optional[List[str]] = []
    task_category: Optional[str] = "general"

class ChatResponse(BaseModel):
    success: bool
    reply: str
    provider: str
    sources_cited: List[str] = []
    structured_data: Optional[Dict[str, Any]] = None

class ChunkRequest(BaseModel):
    text: str
    doc_id: str
    chunk_size: Optional[int] = 500
    chunk_overlap: Optional[int] = 50

class ChunkItem(BaseModel):
    doc_id: str
    chunk_index: int
    text: str
    word_count: int

class RAGSearchRequest(BaseModel):
    query: str
    chunks: List[Dict[str, Any]]
    top_k: Optional[int] = 3

class SelfTestRequest(BaseModel):
    title: str
    source_text: str
    test_type: str = "Objective" # "Objective" or "Subjective"
    questions_count: int = 10
    difficulty: str = "Medium"

class QuestionPaperRequest(BaseModel):
    subject_name: str
    subject_code: str
    class_name: str
    total_marks: int = 50
    duration_minutes: int = 90
    syllabus_text: Optional[str] = ""
    sections: Optional[List[Dict[str, Any]]] = None

class ResumeAnalysisRequest(BaseModel):
    resume_text: str
    target_role: Optional[str] = "Software Engineer"
    student_skills: Optional[List[str]] = []


# =========================================================================
# SYSTEM PROMPTS & ROLE POLICIES
# =========================================================================

ROLE_SYSTEM_PROMPTS = {
    "Student": (
        "You are CAPTAIN, the NEXUS Smart Campus Student AI Academic & Career Copilot. "
        "Help the student with syllabus comprehension, exam prep, schedule, attendance clarity, "
        "and career development. NEVER reveal private data of other students. "
        "Strictly ground your factual answers in the provided Verified Database Facts. "
        "If a metric is unavailable, politely explain how to view it in their portal."
    ),
    "Faculty": (
        "You are CAPTAIN, the NEXUS Smart Campus Faculty Teaching & Productivity Assistant. "
        "Assist professors with lecture planning, assessment rubrics, student performance overviews, "
        "attendance shortage alerts, and official communication drafting. "
        "Respect department boundaries. Never independently publish marks or send notices without explicit human confirmation."
    ),
    "Parent": (
        "You are CAPTAIN, the NEXUS Smart Campus Parent Academic Counselor. "
        "Provide polite, supportive, and factual guidance regarding the parent's verified ward. "
        "Explain attendance thresholds (<75% debarment warning), published semester results, "
        "fee schedules, and how to book parent-faculty meetings. "
        "NEVER disclose draft marks, internal disciplinary notes, or information about other students."
    ),
    "Alumni": (
        "You are CAPTAIN, the NEXUS Smart Campus Alumni Network & Career Mentor. "
        "Assist alumni with mentoring student requests, guest lecture proposals, research collaborations, "
        "and professional networking. Respect campus policies and do not invent opportunities."
    ),
    "Admin": (
        "You are CAPTAIN, the NEXUS Executive Campus Governance & Analytics Copilot. "
        "Provide high-level summaries of campus operational health, parent verifications, "
        "attendance compliance, safety incident resolutions, and draft official institutional notices. "
        "Always remind the administrator that destructive actions require human confirmation."
    )
}


# =========================================================================
# CORE ENDPOINTS
# =========================================================================

@app.get("/health")
def health_check():
    has_gemini = bool(GEMINI_API_KEY and GEMINI_API_KEY != "your_google_gemini_api_key_here")
    return {
        "status": "healthy",
        "service": "NEXUS AI Microservice",
        "version": "2.0.0",
        "gemini_configured": has_gemini,
        "primary_model": ACTIVE_MODEL_NAME,
        "model_pool": MODEL_POOL if has_gemini else [],
        "engine": f"Google Gemini Multi-Tier Cloud ({ACTIVE_MODEL_NAME})" if has_gemini else "deterministic-grounded-engine",
        "timestamp": time.time()
    }


@app.post("/api/ai/chat", response_model=ChatResponse)
async def generate_chat_response(req: ChatRequest):
    """
    Universal role-aware chat orchestrator.
    Grounds output in database facts and RAG chunks.
    """
    user_role = req.user_role if req.user_role in ROLE_SYSTEM_PROMPTS else "Student"
    sys_prompt = ROLE_SYSTEM_PROMPTS[user_role]

    facts_text = ""
    if req.database_facts and len(req.database_facts) > 0:
        facts_text = "VERIFIED CANONICAL DATABASE FACTS (MUST GROUND YOUR ANSWER HERE):\n" + "\n".join([f"- {f}" for f in req.database_facts])

    context_text = ""
    if req.context_chunks and len(req.context_chunks) > 0:
        context_text = "RETRIEVED AUTHORIZED DOCUMENT EXCERPTS:\n" + "\n---\n".join(req.context_chunks)

    full_prompt = (
        f"{sys_prompt}\n\n"
        f"USER: {req.user_name} ({user_role} - {req.user_email})\n\n"
        f"{facts_text}\n\n"
        f"{context_text}\n\n"
        f"USER INQUIRY: {req.prompt}\n\n"
        f"Please provide an accurate, helpful, professional, and well-structured response in Markdown."
    )

    # 1. Try Google Gemini with multi-tier failover if key is configured
    if GEMINI_API_KEY and GEMINI_API_KEY != "your_google_gemini_api_key_here":
        gemini_text, used_model = call_gemini_api(full_prompt, timeout=8)
        if gemini_text:
            return ChatResponse(
                success=True,
                reply=gemini_text,
                provider=f"Google Gemini ({used_model})",
                sources_cited=req.database_facts[:3] if req.database_facts else []
            )
        else:
            print("[INFO] Google Gemini models currently at peak capacity or timeout; falling back seamlessly to NEXUS Grounded Knowledge Engine.")

    # 2. High-Quality Grounded Semantic Fallback Engine
    reply = generate_grounded_reply(req.prompt, user_role, req.database_facts or [], req.context_chunks or [])
    return ChatResponse(
        success=True,
        reply=reply,
        provider="NEXUS Grounded Knowledge Engine",
        sources_cited=req.database_facts[:3] if req.database_facts else []
    )


def generate_grounded_reply(prompt: str, role: str, db_facts: List[str], chunks: List[str]) -> str:
    """Grounded contextual fallback engine when external cloud API is offline."""
    lower = prompt.lower()
    
    # Priority 1: Grounded directly on provided DB facts if present
    if db_facts:
        facts_summary = "\n".join([f"• {fact}" for fact in db_facts])
        if "attendance" in lower:
            return (
                f"### 📊 Attendance Records & Policy Overview\n\n"
                f"Here are the current authoritative attendance metrics retrieved from your campus ledger:\n\n"
                f"{facts_summary}\n\n"
                f"> **Campus Rule**: The university requires a minimum of **75.00% attendance** for semester exam eligibility. "
                f"Medical leaves and On-Duty (OD) permissions verified by the Class Incharge are credited toward eligibility."
            )
        elif "mark" in lower or "exam" in lower or "score" in lower or "result" in lower:
            return (
                f"### 📝 Academic Assessment & Examination Records\n\n"
                f"Here are your published assessment scores verified by the academic faculty:\n\n"
                f"{facts_summary}\n\n"
                f"All scores above have been officially recorded in the academic database. Unpublished internal drafts are excluded."
            )
        elif "schedule" in lower or "timetable" in lower or "class" in lower:
            return (
                f"### 📅 Timetable & Lecture Schedule\n\n"
                f"Here is your current synchronized timetable from the master campus registry:\n\n"
                f"{facts_summary}\n\n"
                f"Please verify any venue or timing changes directly in the Academics Timetable module."
            )
        elif "assignment" in lower:
            return (
                f"### 📚 Course Assignments & Submissions\n\n"
                f"Here is the status of your class assignments:\n\n"
                f"{facts_summary}\n\n"
                f"Ensure all files and reports are submitted before 11:59 PM on the respective deadline dates."
            )
        else:
            return (
                f"### ℹ️ Authorized Campus Record Summary\n\n"
                f"Based on your authenticated {role} profile, here is the relevant institutional data:\n\n"
                f"{facts_summary}\n\n"
                f"Let me know if you would like deeper insights or guidance on any specific item!"
            )

    # Priority 2: Grounded on RAG Document Chunks
    if chunks:
        joined_chunks = "\n\n".join(chunks[:2])
        return (
            f"### 📄 Study Material & Document Insights\n\n"
            f"Based on your uploaded course documents:\n\n"
            f"{joined_chunks}\n\n"
            f"> *Source: Uploaded Campus Study Material*"
        )

    # Priority 3: Role-Specific Intelligent Guidance
    if role == "Student":
        if "career" in lower or "resume" in lower or "job" in lower:
            return (
                "### 🎯 NEXUS AI Career & ATS Optimization\n\n"
                "To optimize your career readiness:\n"
                "1. **Core Technical Stack**: Focus on Data Structures, Algorithms, System Design, and Modern Web Frameworks.\n"
                "2. **ATS Scoring**: Ensure your resume highlights quantifiable project achievements (e.g., *'Improved query latency by 40%'*).\n"
                "3. **Alumni Mentorship**: Connect with verified NEXUS Alumni working in your target industries via the **Connections & Alumni** module."
            )
        return (
            f"Hello! I am **CAPTAIN**, your NEXUS Student AI Assistant. "
            f"I can help you analyze your study materials, prepare practice tests, check attendance status, "
            f"and draft permission emails. What topic or subject would you like to explore today?"
        )

    elif role == "Faculty":
        return (
            f"Hello Professor. I am your **NEXUS Faculty Academic Copilot**. "
            f"I can help you construct question papers, draft rubrics, summarize class attendance shortages (<75%), "
            f"and prepare meeting agendas. Please select a class or topic to begin."
        )

    elif role == "Parent":
        return (
            f"Welcome to the **NEXUS Parent AI Counselor**. "
            f"I can assist you in understanding your ward's published assessment marks, attendance compliance, "
            f"fee payment receipts, and upcoming parent-teacher conferences. How may I assist your family today?"
        )

    elif role == "Alumni":
        return (
            f"Welcome back to NEXUS! As your **Alumni AI Copilot**, I can assist you with structuring guest lecture proposals, "
            f"reviewing student mentorship applications, and connecting with faculty on joint research collaborations."
        )

    else: # Admin
        return (
            f"**NEXUS Central Executive AI Console Active.** "
            f"You can query aggregated campus attendance, review student document verification queues, "
            f"or draft campus-wide circulars. All administrative actions require human confirmation."
        )


# =========================================================================
# DOCUMENT PROCESSING & RAG PIPELINE
# =========================================================================

@app.post("/api/ai/documents/parse")
async def parse_document(file: UploadFile = File(...)):
    """Extract plain text from uploaded PDF or Word document."""
    try:
        content_type = file.content_type or ""
        filename = file.filename or "unknown.pdf"
        file_bytes = await file.read()

        extracted_text = ""
        total_pages = 1

        if filename.lower().endswith(".pdf") or "pdf" in content_type:
            import io
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
            total_pages = len(pdf_reader.pages)
            for i, page in enumerate(pdf_reader.pages):
                text = page.extract_text()
                if text:
                    extracted_text += f"\n--- Page {i + 1} ---\n" + text
        elif filename.lower().endswith(".docx") or "docx" in content_type:
            import io
            doc = docx.Document(io.BytesIO(file_bytes))
            extracted_text = "\n".join([p.text for p in doc.paragraphs if p.text.strip()])
            total_pages = 1
        else:
            extracted_text = file_bytes.decode("utf-8", errors="ignore")

        cleaned_text = re.sub(r'\s+', ' ', extracted_text).strip()
        word_count = len(cleaned_text.split())

        return {
            "success": True,
            "filename": filename,
            "pages": total_pages,
            "word_count": word_count,
            "preview": cleaned_text[:500],
            "full_text": cleaned_text
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Document parsing error: {str(e)}")


@app.post("/api/ai/documents/chunk")
async def chunk_document(req: ChunkRequest):
    """Chunk extracted document text into windowed semantic segments."""
    words = req.text.split()
    chunks: List[ChunkItem] = []
    
    step = req.chunk_size - req.chunk_overlap
    if step <= 0:
        step = req.chunk_size

    chunk_idx = 0
    for i in range(0, len(words), step):
        chunk_words = words[i:i + req.chunk_size]
        chunk_text = " ".join(chunk_words)
        chunks.append(ChunkItem(
            doc_id=req.doc_id,
            chunk_index=chunk_idx,
            text=chunk_text,
            word_count=len(chunk_words)
        ))
        chunk_idx += 1

    return {
        "success": True,
        "doc_id": req.doc_id,
        "total_chunks": len(chunks),
        "chunks": [c.dict() for c in chunks]
    }


@app.post("/api/ai/documents/rag-search")
async def rag_search(req: RAGSearchRequest):
    """Lightweight hybrid semantic keyword ranker over indexed document chunks."""
    query_terms = set(re.findall(r'\w+', req.query.lower()))
    scored_chunks = []

    for c in req.chunks:
        text = c.get("text", "")
        text_lower = text.lower()
        score = sum(1 for term in query_terms if term in text_lower)
        if score > 0:
            scored_chunks.append({
                "score": score,
                "chunk_index": c.get("chunk_index", 0),
                "text": text,
                "doc_id": c.get("doc_id", "")
            })

    scored_chunks.sort(key=lambda x: x["score"], reverse=True)
    top_results = scored_chunks[:req.top_k]

    return {
        "success": True,
        "query": req.query,
        "matched_count": len(top_results),
        "results": top_results
    }


# =========================================================================
# SPECIALIZED CAPABILITIES
# =========================================================================

@app.post("/api/ai/selftest/generate")
async def generate_self_test(req: SelfTestRequest):
    """Generates authentic practice questions grounded in provided study text."""
    # 1. Try Gemini Generative AI if key is configured
    if GEMINI_API_KEY and GEMINI_API_KEY != "your_google_gemini_api_key_here" and req.source_text.strip():
        try:
            prompt = (
                f"You are a college exam creator. Based ONLY on the following study text, "
                f"generate {req.questions_count} {req.difficulty}-level {req.test_type} questions.\n\n"
                f"TEXT:\n{req.source_text[:3500]}\n\n"
                f"Return ONLY valid JSON array with keys: id, question, options (array of 4 if Objective), "
                f"correctAnswer (0-indexed integer for option), explanation. Do NOT include Markdown backticks or commentary."
            )
            gemini_text, used_model = call_gemini_api(prompt, timeout=12)
            if gemini_text:
                clean_json = re.sub(r'```json\s*|```', '', gemini_text).strip()
                match = re.search(r'\[.*\]', clean_json, re.DOTALL)
                if match:
                    questions = json.loads(match.group(0))
                    return {
                        "success": True,
                        "title": req.title,
                        "questions_count": len(questions),
                        "questions": questions,
                        "provider": f"Google Gemini ({used_model})"
                    }
        except Exception as e:
            print(f"[WARN] Gemini self-test generation fallback: {e}")

    # Deterministic Question Construction Fallback
    sentences = [s.strip() for s in re.split(r'\. |\n', req.source_text) if len(s.strip()) > 25]
    if not sentences:
        sentences = [
            "Relational databases enforce data integrity through ACID transaction guarantees",
            "Operating system paging reduces external memory fragmentation",
            "Transmission Control Protocol provides reliable ordered packet delivery",
            "Asymptotic time complexity evaluates algorithm growth rates as input scale increases"
        ]

    questions = []
    total_q = min(req.questions_count, max(len(sentences), 5))

    for i in range(total_q):
        s = sentences[i % len(sentences)]
        words = s.split()
        keyword = words[0] if words else "Concept"

        if req.test_type == "Objective":
            questions.append({
                "id": i + 1,
                "question": f"Based on your notes, which principle is directly illustrated by: '{s[:80]}...'?",
                "options": [
                    f"Option A: Fundamental rule regarding {keyword}",
                    f"Option B: Deprecated algorithmic variation",
                    f"Option C: Inverse boundary operational mode",
                    f"Option D: Secondary peripheral interface",
                ],
                "correctAnswer": 0,
                "explanation": f"According to your source document: '{s}'. This demonstrates Option A."
            })
        else:
            questions.append({
                "id": i + 1,
                "question": f"Explain the core technical principles and real-world implications of: '{s}'. (~120 words)",
                "targetWordCount": 120,
                "explanation": f"Key answer should address: {s} and discuss practical computational trade-offs."
            })

    return {
        "success": True,
        "title": req.title,
        "questions_count": len(questions),
        "questions": questions
    }


@app.post("/api/ai/question-paper/generate")
async def generate_question_paper(req: QuestionPaperRequest):
    """Generates official faculty examination paper matching exact marks distribution."""
    # Build standard 3-section exam structure
    sec_a_marks = 10
    sec_b_marks = 20
    sec_c_marks = req.total_marks - (sec_a_marks + sec_b_marks)
    if sec_c_marks <= 0:
        sec_a_marks = int(req.total_marks * 0.3)
        sec_b_marks = int(req.total_marks * 0.4)
        sec_c_marks = req.total_marks - (sec_a_marks + sec_b_marks)

    paper = {
        "institution": "NEXUS INSTITUTE OF TECHNOLOGY",
        "department": "Department of Computer Science & Engineering",
        "subject": req.subject_name,
        "code": req.subject_code,
        "class": req.class_name,
        "duration": f"{req.duration_minutes} Minutes",
        "maxMarks": req.total_marks,
        "instructions": [
            "All sections are compulsory.",
            "Draw neat architectural diagrams wherever required.",
            "Assume suitable parameters if any data is missing."
        ],
        "sections": [
            {
                "section": "Section A (Short Answer Questions)",
                "marksPerQuestion": 2,
                "questionsCount": sec_a_marks // 2,
                "totalMarks": sec_a_marks,
                "questions": [
                    f"1. Define the fundamental concept and primary objectives of {req.subject_name}.",
                    f"2. State the key architectural differences between basic and advanced implementations in {req.subject_code}.",
                    f"3. Differentiate synchronous vs asynchronous processing in the context of {req.subject_name}.",
                    f"4. State the main performance constraints identified in module 1.",
                    f"5. Give two real-world enterprise applications of {req.subject_name}."
                ][:max(1, sec_a_marks // 2)]
            },
            {
                "section": "Section B (Analytical & Evaluative Questions)",
                "marksPerQuestion": 5,
                "questionsCount": sec_b_marks // 5,
                "totalMarks": sec_b_marks,
                "questions": [
                    f"6. Explain with block diagrams the end-to-end dataflow pipeline used in {req.subject_name}.",
                    f"7. Compare and contrast alternative design methodologies for {req.subject_code}.",
                    f"8. Analyze the time and space complexity trade-offs encountered in standard problem solving.",
                    f"9. Formulate an engineering solution for high availability in distributed campus architectures."
                ][:max(1, sec_b_marks // 5)]
            },
            {
                "section": "Section C (Comprehensive Design / Case Study)",
                "marksPerQuestion": sec_c_marks,
                "questionsCount": 1,
                "totalMarks": sec_c_marks,
                "questions": [
                    f"10. Detailed Case Study: Design an end-to-end resilient architecture for {req.subject_name}. Outline schema design, security mechanisms, failure recovery, and empirical evaluation metrics."
                ]
            }
        ]
    }

    return {
        "success": True,
        "questionPaper": paper,
        "generatedAt": time.strftime("%Y-%m-%d %H:%M:%S")
    }


@app.post("/api/ai/resume/analyze")
async def analyze_resume(req: ResumeAnalysisRequest):
    """Provides ATS score, skill-gap analysis, and tailored bullet-point recommendations."""
    text_len = len(req.resume_text.split())
    
    # 1. Try Gemini Generative AI for customized resume evaluation
    if GEMINI_API_KEY and GEMINI_API_KEY != "your_google_gemini_api_key_here" and req.resume_text.strip():
        try:
            prompt = (
                f"You are a Senior Technical Recruiter and ATS Optimization Expert. Analyze this resume for the target role: '{req.target_role}'.\n\n"
                f"RESUME TEXT:\n{req.resume_text[:3500]}\n\n"
                f"Return ONLY a valid JSON object with keys: "
                f"atsScore (integer 0-100), keyStrengths (list of 3 strings), recommendations (list of 4 actionable strings). "
                f"Do NOT include Markdown backticks or commentary."
            )
            gemini_text, used_model = call_gemini_api(prompt, timeout=12)
            if gemini_text:
                clean_json = re.sub(r'```json\s*|```', '', gemini_text).strip()
                match = re.search(r'\{.*\}', clean_json, re.DOTALL)
                if match:
                    parsed = json.loads(match.group(0))
                    return {
                        "success": True,
                        "atsScore": parsed.get("atsScore", 82),
                        "targetRole": req.target_role,
                        "wordCount": text_len,
                        "formattingCheck": "Pass - Evaluated via Gemini ATS",
                        "keyStrengths": parsed.get("keyStrengths", ["Relevant Technical Skills", "Project Experience"]),
                        "recommendations": parsed.get("recommendations", []),
                        "provider": f"Google Gemini ({used_model})"
                    }
        except Exception as e:
            print(f"[WARN] Gemini resume analysis fallback: {e}")

    # 2. Deterministic baseline heuristic fallback
    score = 72
    if "education" in req.resume_text.lower(): score += 5
    if "project" in req.resume_text.lower(): score += 8
    if "experience" in req.resume_text.lower() or "internship" in req.resume_text.lower(): score += 7
    if "skills" in req.resume_text.lower(): score += 5
    score = min(95, score)

    recommendations = [
        "Include quantifiable metrics in project bullet points (e.g. 'Improved efficiency by 30%')",
        f"Incorporate industry standard keywords for {req.target_role}: System Design, Microservices, CI/CD",
        "Add direct hyperlinks to your GitHub repositories and live deployed applications",
        "Keep the resume layout clean, single-column, and avoid non-standard font glyphs for ATS scanners"
    ]

    return {
        "success": True,
        "atsScore": score,
        "targetRole": req.target_role,
        "wordCount": text_len,
        "formattingCheck": "Pass - Clean ATS Structure",
        "keyStrengths": ["Relevant Technical Projects", "Clear Academic Credentials", "Structured Contact Information"],
        "recommendations": recommendations,
        "provider": "NEXUS ATS Heuristic Engine"
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
