import React, { useState, useEffect, useRef } from 'react';
import { useJourneyStore } from '../../stores/useJourneyStore';
import { portfolioData } from '../../data';
import {
  Mic,
  MicOff,
  Send,
  X,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface VoiceSuggestion {
  text: string;
  stationIndex?: number;
}

const STATION_KEYWORD_RULES: {
  index: number;
  primaryKeywords: string[];
  secondaryKeywords: string[];
}[] = [
  {
    index: 0, // Station 1: About Me
    primaryKeywords: ['about', 'who are you', 'charan', 'ravi', 'daliparthy', 'profile', 'bio', 'introduction', 'overview', 'origin concourse', 'executive', 'start', 'first station', 'station 1', 'station one', 'station 01', 'stn 1'],
    secondaryKeywords: ['software engineer', 'ai researcher', 'portfolio', 'welcome', 'creator', 'author'],
  },
  {
    index: 1, // Station 2: Narayana MPC
    primaryKeywords: ['narayana', 'intermediate', 'mpc', 'maths', 'mathematics', 'physics', 'chemistry', '12th', 'junior college', 'high school', 'jee', 'station 2', 'station two', 'station 02', 'stn 2', 'second station'],
    secondaryKeywords: ['jee main', 'jee score', '97.8', 'analytical', 'telangana board', 'hyderabad intermediate'],
  },
  {
    index: 2, // Station 3: SASTRA University
    primaryKeywords: ['sastra', 'university', 'btech', 'b.tech', 'degree', 'ict', 'cgpa', 'college', 'bachelor', 'undergrad', 'thanjavur', 'station 3', 'station three', 'station 03', 'stn 3', 'third station'],
    secondaryKeywords: ['computer science', 'academics', 'gpa', 'engineering degree', 'information technology', 'coursework'],
  },
  {
    index: 3, // Station 4: President & Technical Leadership (Clubs)
    primaryKeywords: ['clubs', 'club', 'leadership', 'president', 'sigma', 'maths club', 's@s', 's at s', 'lead', 'extracurricular', 'station 4', 'station four', 'station 04', 'stn 4', 'fourth station'],
    secondaryKeywords: ['student body', 'peer teaching', 'mentoring', 'team lead', 'organizer', 'club president'],
  },
  {
    index: 4, // Station 5: GeoAI Drone Outpost (Mozambique)
    primaryKeywords: ['drone', 'drones', 'rooftop', 'roof', 'aerial', 'mozambique', 'nacala', 'segmentation', 'u-net', 'unet', 'computer vision', 'station 5', 'station five', 'station 05', 'stn 5', 'fifth station'],
    secondaryKeywords: ['satellite', 'mapping', 'informal settlements', 'disaster resilience', 'geospatial', 'drone imagery'],
  },
  {
    index: 5, // Station 6: IIT Dhanbad Seismic Paper
    primaryKeywords: ['seismic', 'earthquake', 'dhanbad', 'iit dhanbad', 'paper', 'research', 'publication', 'sme', 'sme-2025', 'ism dhanbad', 'station 6', 'station six', 'station 06', 'stn 6', 'sixth station'],
    secondaryKeywords: ['geophysics', 'deep learning paper', 'peer-reviewed', 'hindukush', 'tectonic', 'earthquake detection', 'published'],
  },
  {
    index: 6, // Station 7: Expense Tracker PWA (Full-Stack)
    primaryKeywords: ['full stack', 'fullstack', 'expense', 'expenses', 'finance', 'financial', 'pwa', 'budget', 'tracker', 'turso', 'sqlite', 'money', 'powerbi', 'station 7', 'station seven', 'station 07', 'stn 7', 'seventh station'],
    secondaryKeywords: ['angular', 'personal finance', 'offline first', 'analytics dashboard', 'full stack project', 'web app'],
  },
  {
    index: 7, // Station 8: Resume Agent
    primaryKeywords: ['resume agent', 'resume optimizer', 'cloudflare', 'cloudflare workers', 'optimizer', 'ats', 'vectorize', 'edge microservice', 'station 8', 'station eight', 'station 08', 'stn 8', 'eighth station'],
    secondaryKeywords: ['rag', 'embedding', 'semantic search', 'llm agent', 'serverless', 'tailoring'],
  },
  {
    index: 8, // Station 9: AI Interviewer
    primaryKeywords: ['interview', 'interviewer', 'mock interview', 'interview coach', 'coach', 'groq', 'whisper', 'voice interview', 'dsa evaluation', 'station 9', 'station nine', 'station 09', 'stn 9', 'ninth station'],
    secondaryKeywords: ['speech to text', 'audio coach', 'technical interview', 'voice agent', 'coding interview'],
  },
  {
    index: 9, // Station 10: National AI/ML Hackathon Finalist
    primaryKeywords: ['hackathon', 'hackathons', 'tirupati', 'iit tirupati', 'panchayati', 'panchayati raj', 'mopr', 'svamitva', 'finalist', 'top 40', 'top 10%', 'competition', 'station 10', 'station ten', 'stn 10', 'tenth station'],
    secondaryKeywords: ['national finalist', 'rural governance', 'ministry', 'land parcel', 'dispute resolution', 'hackathon winner'],
  },
  {
    index: 10, // Station 11: Certifications & Internships
    primaryKeywords: ['certification', 'certifications', 'certificate', 'certificates', 'internship', 'internships', 'training', 'matrimony', 'bharat matrimony', 'upskilling', 'credentials', 'station 11', 'station eleven', 'stn 11', 'eleventh station'],
    secondaryKeywords: ['professional training', 'courses', 'industry experience', 'mongodb', 'deep learning certificate'],
  },
  {
    index: 11, // Station 12: Terminus: Hyderabad Grand Central
    primaryKeywords: ['terminus', 'hyderabad', 'grand central', 'final station', 'end station', 'destination', 'station 12', 'station twelve', 'stn 12', 'twelfth station', 'last station'],
    secondaryKeywords: ['career concourse', 'contact platform', 'journey end', 'terminus concourse', 'conclusion'],
  },
];

export const VoiceAssistantModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [targetStation, setTargetStation] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<VoiceSuggestion[]>([
    { text: 'Clubs & Leadership (Station 4)', stationIndex: 3 },
    { text: 'Full Stack PWA (Station 7)', stationIndex: 6 },
    { text: 'Projects Overview', stationIndex: 4 },
    { text: 'National Hackathon Finalist', stationIndex: 9 },
    { text: 'IIT Dhanbad Seismic Research', stationIndex: 5 },
  ]);
  const [hasMicSupport, setHasMicSupport] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<any>(null);
  const goToStation = useJourneyStore((s) => s.goToStation);

  useEffect(() => {
    if (!isOpen) return;

    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRec) {
      setHasMicSupport(true);
      try {
        const recognition = new SpeechRec();
        recognition.continuous = false;
        recognition.interimResults = true;
        // en-US has maximum browser engine network reliability
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
          setMicError(null);
        };

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
          setInputText(currentTranscript);

          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            try {
              recognition.stop();
            } catch (_) {}
            setIsListening(false);
            if (currentTranscript.trim()) {
              handleProcessQuery(currentTranscript.trim());
            }
          }, 1400);
        };

        recognition.onerror = (e: any) => {
          console.warn('Speech recognition error:', e.error);
          if (e.error === 'not-allowed') {
            setMicError('Microphone permission denied. Please allow microphone access in your browser address bar.');
          } else if (e.error === 'no-speech') {
            setMicError('No speech detected. Tap the mic and speak.');
          } else if (e.error === 'network') {
            setMicError('Browser speech service offline/busy. You can type or use your OS dictation into the text box below.');
          } else {
            setMicError('Microphone error: ' + e.error);
          }
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } catch (err: any) {
        console.warn('SpeechRecognition initialization error:', err);
        setHasMicSupport(false);
      }
    } else {
      setHasMicSupport(false);
    }

    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    setMicError(null);
    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
      setIsListening(false);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    } else {
      setTranscript('');
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Start recognition error:', err);
        try {
          recognitionRef.current.abort();
          recognitionRef.current.start();
          setIsListening(true);
        } catch (_) {}
      }
    }
  };

  const handleProcessQuery = (query: string) => {
    const q = query.toLowerCase().trim();
    setAnswer(null);
    setTargetStation(null);

    // 1. Direct App Navigation Commands
    if (q.includes('next') || q.includes('forward')) {
      useJourneyStore.getState().nextStation();
      setAnswer('Advancing train along the tracks to the next station.');
      return;
    }
    if (q.includes('previous') || q.includes('prev') || q.includes('back')) {
      useJourneyStore.getState().prevStation();
      setAnswer('Reversing train to the previous station.');
      return;
    }
    if (q.includes('resume') || q.includes('cv')) {
      window.open('/Daliparthy_Ravi_Krishna_Charan_Resume.pdf', '_blank');
      setAnswer('Opening official verified master resume PDF in a new tab.');
      return;
    }
    if (q.includes('contact') || q.includes('email') || q.includes('reach out') || q.includes('hire') || q.includes('message')) {
      useJourneyStore.getState().setContactModalOpen(true);
      setAnswer('Opening contact transmission form.');
      onClose();
      return;
    }
    if (q.includes('mute') || q.includes('audio') || q.includes('sound') || q.includes('volume')) {
      useJourneyStore.getState().toggleMute();
      setAnswer('Toggled journey audio state.');
      return;
    }
    if (q.includes('recruiter') || q.includes('dossier') || q.includes('ats')) {
      useJourneyStore.getState().setRecruiterDrawerOpen(true);
      setAnswer('Opening Recruiter Dossier.');
      onClose();
      return;
    }
    if (q.includes('map') || q.includes('roadmap') || q.includes('territory') || q.includes('states')) {
      useJourneyStore.getState().setRoadmapOpen(true);
      setAnswer('Opening 6-State Territory Roadmap.');
      onClose();
      return;
    }
    if (
      q.includes('story') ||
      q.includes('stories') ||
      q.includes('case study') ||
      q.includes('tradeoff') ||
      q.includes('difficulty') ||
      q.includes('difficulties') ||
      q.includes('obstacle') ||
      q.includes('challenge')
    ) {
      useJourneyStore.getState().setStoryModalOpen(true);
      setAnswer('Opening Engineering Stories & Hard Tradeoffs (5 Case Studies).');
      onClose();
      return;
    }

    // 2. High-Level Composite Intents: Projects Overview
    if (
      q === 'projects' ||
      q === 'project' ||
      q.includes('all projects') ||
      q.includes('show projects') ||
      q.includes('what projects') ||
      q.includes('portfolio projects') ||
      q.includes('what did you build') ||
      q.includes('work done')
    ) {
      setAnswer(
        "Charan has engineered 5 major verified technical projects across the 12 stations:\n• Station 5: Drone Rooftop Material Segmentation (Computer Vision)\n• Station 7: Expense Tracker PWA & Financial Analytics (Full Stack)\n• Station 8: Cloudflare Resume Agent (LLM Edge Microservice)\n• Station 9: AI Technical Interview Coach (Voice LLM + DSA)\n• Station 10: National AI/ML Hackathon 2026 Finalist (Rural Governance AI)"
      );
      setTargetStation(6); // Default jump to Station 7 (Full-Stack PWA)
      setSuggestions([
        { text: 'Station 7: Full Stack PWA', stationIndex: 6 },
        { text: 'Station 5: Drone GeoAI', stationIndex: 4 },
        { text: 'Station 10: Hackathon Finalist', stationIndex: 9 },
        { text: 'Station 8: Cloudflare Agent', stationIndex: 7 },
        { text: 'Station 9: Interview Coach', stationIndex: 8 },
      ]);
      return;
    }

    // 3. High-Level Composite Intents: Skills & Tech Stack
    if (
      q.includes('skills') ||
      q.includes('tech stack') ||
      q.includes('technologies') ||
      q.includes('languages') ||
      q.includes('frameworks')
    ) {
      setAnswer(
        "Charan's core engineering stack comprises Python, TypeScript, React, PyTorch, TensorFlow, Cloudflare Workers, FastAPI, SQLite, and DSA. Station 1 covers the Executive Profile & Skills, and Station 11 details Industry Certifications."
      );
      setTargetStation(0);
      setSuggestions([
        { text: 'Station 1: Executive Profile', stationIndex: 0 },
        { text: 'Station 11: Certifications', stationIndex: 10 },
        { text: 'Download Resume PDF' },
      ]);
      return;
    }

    // 4. High-Level Composite Intents: Education & Academics
    if (
      q === 'education' ||
      q === 'academics' ||
      q.includes('where did you study') ||
      q.includes('college') ||
      q.includes('school')
    ) {
      setAnswer(
        "Charan completed his B.Tech in ICT at SASTRA Deemed University (Station 3) and his Intermediate MPC at Narayana Junior College with a 97.8% score (Station 2)."
      );
      setTargetStation(2);
      setSuggestions([
        { text: 'Station 3: SASTRA University', stationIndex: 2 },
        { text: 'Station 2: Narayana MPC', stationIndex: 1 },
      ]);
      return;
    }

    // 5. Intelligent Multi-Signal Keyword Scoring Engine across All 12 Stations
    const stations = portfolioData.stations;
    let bestStationIndex: number | null = null;
    let bestScore = 0;

    for (const rule of STATION_KEYWORD_RULES) {
      let score = 0;
      for (const kw of rule.primaryKeywords) {
        if (q === kw) {
          score += 300;
        } else if (q.includes(kw)) {
          score += 150 + kw.length * 2;
        }
      }
      for (const kw of rule.secondaryKeywords) {
        if (q.includes(kw)) {
          score += 70 + kw.length;
        }
      }

      // Check station title and organization tokens
      const stn = stations[rule.index];
      if (stn) {
        const titleWords = stn.title.toLowerCase().split(/\s+/);
        for (const tw of titleWords) {
          if (tw.length > 3 && q.includes(tw)) {
            score += 40;
          }
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestStationIndex = rule.index;
      }
    }

    // Check if user spoke a direct station navigation command ("take me to", "go to", "jump to")
    const isDirectNavIntent =
      q.startsWith('take me to') ||
      q.startsWith('go to') ||
      q.startsWith('jump to') ||
      q.startsWith('navigate to') ||
      q.startsWith('open station');

    if (bestStationIndex !== null && bestScore >= 50) {
      const stn = stations[bestStationIndex];
      setTargetStation(bestStationIndex);
      setAnswer(`Station ${bestStationIndex + 1}: ${stn.title}. ${stn.summary}`);
      setSuggestions([
        { text: `Jump to Station ${bestStationIndex + 1}`, stationIndex: bestStationIndex },
        { text: 'Download Resume PDF' },
        { text: 'Send Message' },
      ]);

      if (isDirectNavIntent) {
        goToStation(bestStationIndex);
        onClose();
      }
      return;
    }

    // 6. Deep Q&A Database Search (Across all 12 stations)
    let bestQA: { question: string; answer: string; stnIdx: number } | null = null;
    let bestQAScore = 0;

    for (let sIdx = 0; sIdx < stations.length; sIdx++) {
      const stn = stations[sIdx];
      for (const qa of stn.qa) {
        const qaQ = qa.question.toLowerCase();
        if (qaQ.includes(q) || q.includes(qaQ)) {
          bestQA = { question: qa.question, answer: qa.answer, stnIdx: sIdx };
          bestQAScore = 200;
          break;
        }
        // Token overlap
        const qWords = q.split(/\s+/).filter((w) => w.length > 3);
        const matchCount = qWords.filter((w) => qaQ.includes(w)).length;
        if (matchCount >= 2 && matchCount > bestQAScore) {
          bestQA = { question: qa.question, answer: qa.answer, stnIdx: sIdx };
          bestQAScore = matchCount;
        }
      }
      if (bestQAScore >= 200) break;
    }

    if (bestQA) {
      setAnswer(bestQA.answer);
      setTargetStation(bestQA.stnIdx);
      setSuggestions([
        { text: `Jump to Station ${bestQA.stnIdx + 1}`, stationIndex: bestQA.stnIdx },
        { text: 'Download Resume PDF' },
      ]);
      return;
    }

    // 7. Contextual Helpful Fallback (Zero Guessing / Inventing)
    setAnswer(
      "I couldn't locate an exact station for that inquiry. Try asking for 'clubs', 'full stack', 'drone', 'hackathon', 'seismic paper', or 'projects'."
    );
    setSuggestions([
      { text: 'Clubs & Leadership (Station 4)', stationIndex: 3 },
      { text: 'Full Stack PWA (Station 7)', stationIndex: 6 },
      { text: 'National Hackathon Finalist', stationIndex: 9 },
      { text: 'IIT Dhanbad Seismic Research', stationIndex: 5 },
    ]);
  };

  const handleGoToTarget = (idx: number) => {
    goToStation(idx);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 pointer-events-auto backdrop-blur-xs select-none"
    >
      <div className="relative w-full max-w-lg rounded-3xl border-2 border-amber-400/80 bg-[#04160e] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.95)] text-slate-100 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-400/30 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-400/60 bg-[#092c1b] text-amber-300">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-black font-mono tracking-wide text-amber-300 uppercase">
                Voice Assistant & Fast Router
              </h2>
              <p className="text-[11px] text-emerald-400 font-mono">
                Hands-Free Speech • Real-Time Route Navigation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            aria-label="Close voice assistant"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Microphone Lane & Spoken Transcript */}
        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#061e13] border border-emerald-500/30">
            {hasMicSupport ? (
              <button
                onClick={toggleListening}
                className={`relative flex h-16 w-16 items-center justify-center rounded-full border-2 transition-all cursor-pointer shadow-lg ${
                  isListening
                    ? 'border-amber-400 bg-amber-400 text-slate-950 scale-110 shadow-amber-500/50 animate-pulse'
                    : 'border-amber-400/60 bg-[#0a301e] text-amber-300 hover:bg-amber-400 hover:text-slate-950'
                }`}
                title={isListening ? 'Tap to stop listening' : 'Tap to speak'}
              >
                {isListening ? <MicOff className="h-7 w-7" /> : <Mic className="h-7 w-7" />}
              </button>
            ) : (
              <div className="text-xs text-amber-400 font-mono text-center">
                Speech recognition is not supported in this browser. Type your inquiry below.
              </div>
            )}

            <p className="mt-3 text-xs font-mono font-bold text-slate-300 text-center">
              {isListening ? 'Listening... Speak now' : 'Tap microphone to speak or type below'}
            </p>

            {transcript && (
              <div className="mt-2 text-xs italic text-amber-200 text-center px-4">
                "{transcript}"
              </div>
            )}

            {micError && (
              <div className="mt-2 text-center">
                <p className="text-xs text-rose-400 font-mono">{micError}</p>
                <p className="text-[10px] text-amber-300/80 mt-1">
                  Type your destination below or click any quick shortcut!
                </p>
              </div>
            )}
          </div>

          {/* Quick Text Query Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (inputText.trim()) handleProcessQuery(inputText.trim());
            }}
            className="relative"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask anything or jump to any project (e.g., 'hackathon')..."
              className="w-full rounded-xl border border-amber-400/40 bg-[#03130b] px-4 py-2.5 pr-10 text-xs font-medium text-white placeholder-slate-400 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-amber-300 hover:bg-amber-400/20 transition-colors cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

          {/* Answer Box */}
          {answer && (
            <div className="rounded-2xl border border-amber-400/50 bg-[#062014] p-3.5 space-y-2.5 animate-in fade-in duration-150">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold block">
                Response
              </span>
              <p className="text-xs leading-relaxed text-slate-100">{answer}</p>
              {targetStation !== null && (
                <button
                  onClick={() => handleGoToTarget(targetStation)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-black text-slate-950 hover:bg-amber-300 transition-colors cursor-pointer shadow-sm"
                >
                  <span>Take me there</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Quick Follow-up Chips */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
              Suggested Queries:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInputText(s.text);
                    handleProcessQuery(s.text);
                  }}
                  className="rounded-lg border border-emerald-500/30 bg-[#061d12] px-2.5 py-1 text-[11px] font-mono text-emerald-300 hover:border-amber-400 hover:text-white transition-colors cursor-pointer"
                >
                  {s.text}
                </button>
              ))}
            </div>
          </div>

          {/* Privacy Notice */}
          <p className="text-[10px] font-mono text-slate-400 text-center pt-1 border-t border-amber-400/10">
            Speech is processed locally by your browser's speech service. Store no audio and log nothing.
          </p>
        </div>
      </div>
    </div>
  );
};
