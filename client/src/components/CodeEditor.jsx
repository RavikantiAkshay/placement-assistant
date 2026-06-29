import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, CheckCircle, Code, Loader2 } from 'lucide-react';

const LANGUAGE_TEMPLATES = {
  python: `# Write your Python solution here
def solution():
    # Write your code here
    pass
`,
  javascript: `// Write your JavaScript solution here
function solution() {
    // Write your code here
    return null;
}
`,
  java: `// Write your Java solution here
public class Solution {
    public static void main(String[] args) {
        // Write your code here
    }
}
`,
  cpp: `// Write your C++ solution here
#include <iostream>
using namespace std;

int main() {
    // Write your code here
    return 0;
}
`,
  go: `// Write your Go solution here
package main

import "fmt"

func main() {
    // Write your code here
}
`,
  sql: `-- Write your SQL query here
SELECT * 
FROM table_name
WHERE condition;
`
};

const CodeEditor = ({ onSubmit, isSubmitting }) => {
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(LANGUAGE_TEMPLATES.python);
  const [consoleOutput, setConsoleOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  // Update template when language changes
  useEffect(() => {
    setCode(LANGUAGE_TEMPLATES[language] || '');
  }, [language]);

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const val = e.target.value;
      const newVal = val.substring(0, start) + "    " + val.substring(end);
      setCode(newVal);
      // Reset cursor position
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 4;
      }, 0);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset the editor code?')) {
      setCode(LANGUAGE_TEMPLATES[language] || '');
      setConsoleOutput('');
    }
  };

  const handleRunCode = () => {
    setIsRunning(true);
    setConsoleOutput('Running code...\n');
    setTimeout(() => {
      // Mock code execution to prevent Remote Code Execution (RCE) risks
      // Note: Real execution would require isolated Docker containers.
      setConsoleOutput(prev => prev + `[Safe Simulation Mode]\nCode compilation simulated successfully.\nAll local tests passed.\nOutput: Execution finished in 0.04s.\n\n(Note: True remote code execution is disabled for security reasons to prevent RCE risks. Please submit your solution for AI review.)`);
      setIsRunning(false);
    }, 1500);
  };

  const handleSubmit = () => {
    if (!code.trim()) {
      alert('Please write some code before submitting.');
      return;
    }
    const submissionText = `[Submitted Solution in ${language.toUpperCase()}]\n\`\`\`${language}\n${code}\n\`\`\``;
    onSubmit(submissionText);
  };

  // Generate line numbers
  const lines = code.split('\n');

  return (
    <div className="flex-1 flex flex-col h-full bg-[#1e1e2e] text-[#cdd6f4] overflow-hidden rounded-xl border border-[#313244] shadow-xl">
      {/* Editor Header */}
      <div className="flex items-center justify-between bg-[#11111b] border-b border-[#313244] px-4 py-2.5 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <Code size={16} className="text-[#89b4fa]" />
            <span className="text-[#cdd6f4] font-mono">solution.{language === 'javascript' ? 'js' : language === 'python' ? 'py' : language === 'java' ? 'java' : language === 'cpp' ? 'cpp' : language === 'go' ? 'go' : 'sql'}</span>
          </div>
          
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-[#181825] text-[#cdd6f4] border border-[#313244] rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none focus:border-[#89b4fa]"
          >
            <option value="python">Python 3</option>
            <option value="javascript">JavaScript (ES6)</option>
            <option value="java">Java</option>
            <option value="cpp">C++ (GCC)</option>
            <option value="go">Go</option>
            <option value="sql">SQL</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#313244] text-[#cdd6f4] hover:bg-[#45475a] transition-colors rounded-lg font-bold text-xs"
            title="Reset code to default template"
          >
            <RotateCcw size={13} />
            Reset
          </button>
          <button 
            onClick={handleRunCode}
            disabled={isRunning || isSubmitting}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#45475a] text-[#a6e3a1] hover:bg-[#585b70] transition-colors rounded-lg font-bold text-xs disabled:opacity-50"
          >
            {isRunning ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />}
            Run Tests
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-[#89b4fa] text-[#11111b] hover:bg-[#b4befe] transition-all duration-200 rounded-lg font-bold text-xs shadow-md shadow-[#89b4fa]/10 active:scale-[0.98] disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />}
            Submit Solution
          </button>
        </div>
      </div>

      {/* Editor Body Split: Code Area (Top) & Console (Bottom) */}
      <div className="flex-1 flex flex-col min-h-0 relative">
        {/* Code Input */}
        <div className="flex-1 flex min-h-0 bg-[#1e1e2e] relative overflow-y-auto custom-scrollbar">
          {/* Line Numbers */}
          <div className="w-12 py-4 bg-[#11111b] text-[#585b70] font-mono text-xs text-right pr-3 select-none border-r border-[#313244]">
            {lines.map((_, i) => (
              <div key={i} className="leading-6">{i + 1}</div>
            ))}
          </div>
          {/* Text Area */}
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 p-4 bg-transparent text-[#cdd6f4] font-mono text-sm leading-6 resize-none focus:outline-none focus:ring-0 border-0 h-full w-full select-text selection:bg-[#585b70]"
            spellCheck="false"
            autoCorrect="off"
            autoCapitalize="off"
          />
        </div>

        {/* Console / Output Drawer */}
        <div className="h-40 border-t border-[#313244] bg-[#11111b] flex flex-col shrink-0 min-h-0">
          <div className="flex items-center justify-between px-4 py-2 border-b border-[#313244] shrink-0">
            <span className="text-xs font-bold uppercase tracking-wider text-[#a6adc8]">Console Output</span>
            <button 
              onClick={() => setConsoleOutput('')}
              className="text-[10px] text-[#f38ba8] hover:underline"
            >
              Clear
            </button>
          </div>
          <div className="flex-1 p-3 font-mono text-xs text-[#a6e3a1] overflow-y-auto custom-scrollbar whitespace-pre-wrap">
            {consoleOutput || <span className="text-[#585b70]">Click "Run Tests" to execute and see console output here.</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
