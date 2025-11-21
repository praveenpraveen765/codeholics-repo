import React from 'react';
import { Loader2, Search, FileText, CheckCircle, Sparkles } from './Icons';
import { AgentStatus } from '../types';

interface StatusVisualizerProps {
  status: AgentStatus;
  topic: string;
}

const StatusVisualizer: React.FC<StatusVisualizerProps> = ({ status, topic }) => {
  if (status === AgentStatus.IDLE || status === AgentStatus.COMPLETE) return null;

  const steps = [
    { 
      id: AgentStatus.RESEARCHING, 
      label: "Conducting Autonomous Research", 
      subtext: "Scanning web sources, verifying facts with Google Grounding...",
      icon: Search 
    },
    { 
      id: AgentStatus.SYNTHESIZING, 
      label: "Synthesizing Executive Summary", 
      subtext: "Distilling insights, formatting slides, generating strategic outlook...",
      icon: FileText 
    },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === status);

  return (
    <div className="w-full max-w-2xl mx-auto mt-12 bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 backdrop-blur-md">
      <div className="flex flex-col items-center text-center space-y-6">
        
        {/* Animated Icon */}
        <div className="relative">
          <div className="absolute inset-0 bg-violet-600 rounded-full blur-xl opacity-20 animate-pulse"></div>
          <div className="relative bg-black p-4 rounded-full border border-violet-500/30">
            <Sparkles className="w-8 h-8 text-violet-400 animate-spin-slow" />
          </div>
        </div>

        <h3 className="text-2xl font-bold text-white">
          Agent Active: <span className="text-violet-400">{topic}</span>
        </h3>

        {/* Steps Progress */}
        <div className="w-full space-y-4">
          {steps.map((step, idx) => {
            const isActive = step.id === status;
            const isCompleted = currentStepIndex > idx;
            const isPending = currentStepIndex < idx;

            return (
              <div 
                key={step.id}
                className={`flex items-center p-4 rounded-lg border transition-all duration-500 ${
                  isActive 
                    ? 'bg-violet-950/20 border-violet-500/40 shadow-[0_0_15px_rgba(139,92,246,0.1)]' 
                    : isCompleted
                    ? 'bg-zinc-900/50 border-emerald-500/30'
                    : 'bg-zinc-900/30 border-zinc-800 opacity-50'
                }`}
              >
                <div className={`mr-4 p-2 rounded-full ${
                  isActive ? 'bg-violet-500/20 text-violet-400' : isCompleted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-500'
                }`}>
                  {isActive ? <Loader2 className="w-5 h-5 animate-spin" /> : isCompleted ? <CheckCircle className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                </div>
                <div className="text-left">
                  <p className={`font-medium ${isActive ? 'text-violet-100' : 'text-zinc-400'}`}>{step.label}</p>
                  <p className="text-xs text-zinc-500 mt-1">{step.subtext}</p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default StatusVisualizer;