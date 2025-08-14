import React, { useState, useEffect } from 'react';
import { AlertCircle, Zap, Server, Wifi } from 'lucide-react';

interface BlockchainModeToggleProps {
  onModeChange: (mode: 'real' | 'mock') => void;
  currentMode: 'real' | 'mock';
  isConnected: boolean;
}

export default function BlockchainModeToggle({ 
  onModeChange, 
  currentMode, 
  isConnected 
}: BlockchainModeToggleProps) {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="blockchain-mode-toggle">
      <div className="flex items-center gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
        <div className="flex items-center gap-2">
          {currentMode === 'real' ? (
            <Server className={`w-5 h-5 ${isConnected ? 'text-green-400' : 'text-red-400'}`} />
          ) : (
            <Zap className="w-5 h-5 text-yellow-400" />
          )}
          <span className="text-white font-medium">
            Blockchain Mode
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => onModeChange('real')}
            className={`px-3 py-1 rounded text-sm transition-all ${
              currentMode === 'real'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
            }`}
          >
            Real Chain
          </button>
          <button
            onClick={() => onModeChange('mock')}
            className={`px-3 py-1 rounded text-sm transition-all ${
              currentMode === 'mock'
                ? 'bg-yellow-500 text-black'
                : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
            }`}
          >
            Mock/Testing
          </button>
        </div>

        <button
          onClick={() => setShowInfo(!showInfo)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <AlertCircle className="w-4 h-4" />
        </button>
      </div>

      {showInfo && (
        <div className="mt-2 p-3 bg-gray-800/90 backdrop-blur-sm rounded-lg border border-gray-600 text-sm">
          <div className="space-y-2">
            <div>
              <strong className="text-blue-400">Real Chain:</strong>
              <p className="text-gray-300">Uses Aptos blockchain for permanent storage. Requires wallet connection and Aptos CLI setup.</p>
            </div>
            <div>
              <strong className="text-yellow-400">Mock/Testing:</strong>
              <p className="text-gray-300">JSON-based blockchain simulation for development and testing. Fully configurable via JSON config.</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-2 flex items-center gap-2 text-xs">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
        <span className="text-gray-400">
          {currentMode === 'real' ? (
            isConnected ? 'Connected to Aptos Devnet' : 'Not connected to blockchain'
          ) : (
            'Using JSON-based blockchain simulation'
          )}
        </span>
      </div>
    </div>
  );
}
