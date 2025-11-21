
import React, { useState } from 'react';
import { AgentStatus, PresentationData } from './types';
import { performResearch, synthesizePresentation } from './services/geminiService';
import StatusVisualizer from './components/StatusVisualizer';
import PresentationDeck from './components/PresentationDeck';
import { Cpu, Search, ArrowRight, AlertCircle } from './components/Icons';

const App: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [status, setStatus] = useState<AgentStatus>(AgentStatus.IDLE);
  const [presentationData, setPresentationData] = useState<PresentationData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setStatus(AgentStatus.RESEARCHING);
    setError(null);
    setPresentationData(null);

    try {
      // 1. Autonomous Research Phase
      const researchResult = await performResearch(topic);
      
      // 2. Synthesis Phase
      setStatus(AgentStatus.SYNTHESIZING);
      const slides = await synthesizePresentation(topic, researchResult.rawText);

      setPresentationData({
        topic,
        slides,
        sources: researchResult.sources
      });
      setStatus(AgentStatus.COMPLETE);
      
    } catch (err) {
      console.error(err);
      setStatus(AgentStatus.ERROR);
      setError("The agent encountered an error while connecting to the knowledge base. Please verify your API key or try a different topic.");
    }
  };

  const handleReset = () => {
    setStatus(AgentStatus.IDLE);
    setPresentationData(null);
    setTopic('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#02040a] text-zinc-200 selection:bg-violet-500/30">
      
      {/* Background ambient effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-600/10 rounded-full blur-[100px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-12 md:py-20 flex flex-col items-center min-h-screen">
        
        {/* Brand Header */}
        <div className={`transition-all duration-700 ${status !== AgentStatus.IDLE ? 'scale-75 -translate-y-8 opacity-50 mb-0' : 'mb-12'}`}>
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="bg-gradient-to-br from-violet-600 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-violet-500/20">
              <Cpu className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Code<span className="text-violet-400">holics</span>
            </h1>
          </div>
        </div>

        {/* Main Input View (Visible when Idle or Error) */}
        {(status === AgentStatus.IDLE || status === AgentStatus.ERROR) && (
          <div className="w-full max-w-2xl animate-fade-in-up">
            <div className="text-center mb-10">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight leading-tight">
                Research any technical topic. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
                  Instantly.
                </span>
              </h2>
              <p className="text-lg text-zinc-400 max-w-lg mx-auto">
                Our AI agent autonomously researches the web, synthesizes findings, and builds an executive deck for you.
              </p>
            </div>

            <form onSubmit={handleResearch} className="relative group z-10">
              <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
              <div className="relative bg-black border border-zinc-800 rounded-2xl p-2 flex items-center shadow-2xl">
                <Search className="w-6 h-6 text-zinc-500 ml-4" />
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., The Future of Solid State Batteries"
                  className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-zinc-600 text-lg py-4 px-4"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!topic.trim()}
                  className="bg-violet-600 hover:bg-violet-500 text-white font-semibold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  Start Agent <ArrowRight className="ml-2 w-4 h-4" />
                </button>
              </div>
            </form>

            <div className="mt-8 flex justify-center gap-3 flex-wrap">
              {["Quantum Computing", "Fusion Energy", "AGI Safety", "Crispr Technology"].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setTopic(suggestion)}
                  className="px-4 py-2 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 rounded-full text-sm text-zinc-400 hover:text-violet-400 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            {status === AgentStatus.ERROR && (
              <div className="mt-8 p-4 bg-red-950/20 border border-red-500/20 rounded-lg flex items-center justify-center text-red-400">
                <AlertCircle className="w-5 h-5 mr-2" />
                {error}
              </div>
            )}
          </div>
        )}

        {/* Agent Working State */}
        {(status === AgentStatus.RESEARCHING || status === AgentStatus.SYNTHESIZING) && (
          <StatusVisualizer status={status} topic={topic} />
        )}

        {/* Final Result State */}
        {status === AgentStatus.COMPLETE && presentationData && (
          <PresentationDeck 
            slides={presentationData.slides} 
            sources={presentationData.sources}
            topic={presentationData.topic}
            onReset={handleReset}
          />
        )}

      </div>
    </div>
  );
};

export default App;