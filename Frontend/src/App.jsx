import { useState, useEffect } from "react";
import "prismjs/themes/prism-tomorrow.css";
import Editor from "react-simple-code-editor";
import prism from "prismjs";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const INITIAL_CODE = `// Paste your code here... \n`;

function App() {
  const [code, setCode] = useState(INITIAL_CODE);
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refactorData, setRefactorData] = useState(null);
  const [isRefactoring, setIsRefactoring] = useState(false);

  useEffect(() => {
    prism.highlightAll();
  }, []);

  async function reviewCode() {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/ai/get-review`, {
        code,
      });
      let parsed = response.data;
      if (typeof parsed === 'string') {
        try {
          parsed = JSON.parse(parsed.replace(/```json/g, '').replace(/```/g, ''));
        } catch (e) {
          parsed = {
            executiveSummary: "Parse error: " + parsed,
            reviewFindings: [],
            status: "ERROR"
          };
        }
      }
      setReview(parsed);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        `Request failed. Check if backend is running on ${API_BASE_URL}`;
      const details = error?.response?.data?.details;

      setReview({
        executiveSummary: `❌ ${message}`,
        reviewFindings: details ? [{ type: 'error', title: 'Error Details', description: details }] : [],
        status: "ERROR"
      });
    } finally {
      setLoading(false);
    }
  }

  async function applyFixes() {
    setIsModalOpen(true);
    setIsRefactoring(true);
    setRefactorData(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/ai/get-refactor`, { code });
      let parsed = response.data;
      if (typeof parsed === 'string') {
        parsed = JSON.parse(parsed.replace(/```json/g, '').replace(/```/g, ''));
      }
      setRefactorData(parsed);
    } catch (error) {
      setRefactorData({
        refactorDescription: "Failed to load refactored code.",
        refactoredCode: "Error: " + (error?.response?.data?.message || "Unknown error"),
        language: "TEXT"
      });
    } finally {
      setIsRefactoring(false);
    }
  }

  const copyRefactoredCode = () => {
    if (refactorData?.refactoredCode) {
      navigator.clipboard.writeText(refactorData.refactoredCode);
    }
  };

  const lineNumbers = code.split('\n').map((_, i) => i + 1);

  return (
    <>
      <main className="w-full max-w-7xl h-full md:h-[calc(100vh-6rem)] flex flex-col md:flex-row gap-4 md:gap-6 relative">
        {/* BEGIN: Left Pane - Code Editor */}
        <section className="flex-1 code-editor flex flex-col relative overflow-hidden min-h-[500px] md:min-h-0 rounded-custom shadow-2xl bg-[#1e1e1e]" data-purpose="code-editor-container">
          {/* Editor Header/Tab */}
          <header className="flex items-center justify-between px-4 py-3 bg-[#252526] border-b border-white/5">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1.5 px-2">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
              </div>
              <span className="text-xs text-gray-400 font-mono ml-2">main.js</span>
            </div>
          </header>

          {/* Code Content */}
          <div className="flex-1 p-6 font-mono text-sm leading-relaxed overflow-y-auto dark-scrollbar text-[#abb2bf]">
            <div className="flex">
              <div className="text-gray-600 pr-4 text-right select-none min-w-[3rem] font-mono leading-[21px]">
                {lineNumbers.map((num) => (
                  <div key={num}>{num}</div>
                ))}
              </div>
              <div className="flex-1 relative font-mono text-sm leading-[21px]">
                <Editor
                  value={code}
                  onValueChange={(code) => setCode(code)}
                  highlight={(code) =>
                    prism.highlight(code, prism.languages.typescript || prism.languages.javascript, "typescript")
                  }
                  padding={0}
                  style={{
                    fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                    fontSize: 14,
                    lineHeight: '21px',
                    backgroundColor: "transparent",
                    color: "#abb2bf",
                    outline: "none",
                    border: "none",
                  }}
                  textareaClassName="focus:outline-none w-full h-full resize-none"
                />
              </div>
            </div>
          </div>

          {/* Footer Action */}
          <div className="p-4 border-t border-white/5 bg-[#1e1e1e] flex justify-end">
            <button
              onClick={reviewCode}
              disabled={loading}
              className="bg-brand hover:bg-brand/90 text-white px-6 py-2 rounded-lg font-medium transition-all shadow-lg shadow-brand/20 active:scale-95 disabled:opacity-75 flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  <span>Reviewing...</span>
                </>
              ) : (
                <span>Review Code</span>
              )}
            </button>
          </div>
        </section>
        {/* END: Left Pane - Code Editor */}

        {/* BEGIN: Right Pane - Review Panel */}
        <section className="w-full md:w-[450px] lg:w-[450px] glass-panel flex flex-col rounded-custom shadow-xl bg-white" data-purpose="review-panel-container">
          {/* Panel Header */}
          <header className="p-4 md:p-6 border-b border-black/5 bg-transparent">
            <div className="flex items-center space-x-3 mb-2">
              <span className="bg-brand/10 text-brand text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded">AI Code Reviewer</span>
              <span className="text-xs text-gray-500">
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <h1 className="text-lg md:text-xl font-bold text-gray-900 tracking-tight">Code Review Analysis</h1>
          </header>

          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 md:space-y-8 bg-transparent relative">
            {review ? (
              <>
                {/* Summary Section */}
                <article data-purpose="review-summary">
                  <div className="flex items-center space-x-2 mb-3">
                    <svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <h2 className="font-semibold text-gray-900 text-[15px]">Executive Summary</h2>
                  </div>
                  <div className="text-[13px] text-gray-600 leading-relaxed prose prose-sm prose-p:my-1 prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded prose-code:text-red-500 max-w-none border-b border-gray-100 pb-6 mb-6">
                    <Markdown>{review.executiveSummary}</Markdown>
                  </div>
                </article>

                {/* Detailed Suggestions Section */}
                {review.reviewFindings && review.reviewFindings.length > 0 && (
                  <article className="space-y-4" data-purpose="suggestions-list">
                    <div className="flex items-center space-x-2 mb-4">
                      <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                      <h2 className="font-semibold text-gray-900 text-[15px]">Review Findings</h2>
                    </div>

                    {review.reviewFindings.map((finding, idx) => (
                      <div key={idx} className={`group flex gap-4 ${finding.type === 'success' ? 'p-4 rounded-xl bg-green-50/50 border border-green-100' : 'p-4 rounded-xl transition-colors border border-transparent bg-gray-50/50 hover:bg-gray-50'}`}>
                        <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full font-bold text-[15px] ${finding.type === 'error' ? 'bg-red-50 text-red-500' : finding.type === 'warning' ? 'bg-blue-50 text-blue-500' : 'bg-green-100 text-green-600'}`}>
                          {finding.type === 'error' ? '!' : finding.type === 'warning' ? (
                            <svg className="w-4 h-4 text-brand" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM5.884 6.607a1 1 0 011.414 0l.707.707a1 1 0 11-1.414 1.414l-.707-.707a1 1 0 010-1.414zm2.12 8.485l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 111.414 1.414zm5.286-5.286l.707-.707a1 1 0 111.414 1.414l-.707.707a1 1 0 01-1.414-1.414zm-1.414 2.828a1 1 0 011.414 0l.707.707a1 1 0 11-1.414 1.414l-.707-.707a1 1 0 010-1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"></path></svg>
                          ) : (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" clipRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"></path></svg>
                          )}
                        </div>
                        <div>
                          <h3 className="text-[13px] font-semibold text-gray-900">{finding.title}</h3>
                          <div className="text-[12px] text-gray-500 mt-1 leading-relaxed prose prose-sm prose-p:my-1 prose-a:text-brand max-w-none">
                            <Markdown>{finding.description}</Markdown>
                          </div>
                        </div>
                      </div>
                    ))}
                  </article>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50 mt-10">
                <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                <p className="text-gray-500 font-medium max-w-[250px]">Ready to analyze your code. Paste your JavaScript snippet and click Review Code.</p>
              </div>
            )}
          </div>

          {/* Final Verdict */}
          {review && (
            <article className="p-4 md:p-6 pt-0 mt-auto" data-purpose="review-footer">
              <div className="bg-[#111827] text-white p-4 rounded-xl flex items-center justify-between shadow-md mt-2">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${review.status === 'APPROVED' ? 'bg-green-400' : review.status === 'ERROR' ? 'bg-red-400' : 'bg-amber-400'} animate-pulse`}></div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider">Status: {review.status || 'REVIEW COMPLETE'}</span>
                </div>
                <button onClick={applyFixes} className="text-[10px] text-gray-300 font-bold uppercase tracking-widest hover:text-white transition-colors cursor-pointer disabled:opacity-50">Apply Fixes</button>
              </div>
            </article>
          )}
        </section>
        {/* END: Right Pane - Review Panel */}
      </main>

      {/* Refactor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>

          {/* Modal Content */}
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center text-brand">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                </div>
                <div>
                  <h3 className="text-gray-900 font-semibold text-sm md:text-base tracking-tight">Suggested Fixes</h3>
                  <p className="text-[11px] text-gray-500 uppercase tracking-widest font-medium">AI-powered optimization</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto w-full flex-1 min-h-[50vh] flex flex-col">
              {isRefactoring ? (
                <div className="flex-1 flex flex-col items-center justify-center space-y-4 opacity-75">
                  <svg className="animate-spin h-10 w-10 text-brand" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  <p className="text-sm font-medium text-gray-500 animate-pulse">Generating refactored code...</p>
                </div>
              ) : refactorData ? (
                <div className="space-y-6">
                  {/* Description */}
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" clipRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"></path></svg>
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Refactor Description</span>
                    </div>
                    <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100/50">
                      <p className="text-[13px] text-gray-600 leading-relaxed"><Markdown>{refactorData.refactorDescription}</Markdown></p>
                    </div>
                  </div>

                  {/* Code Block Container */}
                  <div className="rounded-xl overflow-hidden bg-[#111827] border border-gray-800 shadow-inner relative flex flex-col">
                    <div className="absolute top-2 right-2 bg-gray-800/80 backdrop-blur px-2 py-1 rounded text-[9px] font-bold tracking-widest text-gray-400 uppercase z-10">
                      {refactorData.language || 'CODE'}
                    </div>
                    <div className="p-4 overflow-x-auto custom-scrollbar font-mono text-xs leading-relaxed text-gray-300">
                      <pre><code className="language-javascript">{refactorData.refactoredCode}</code></pre>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end space-x-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors">Dismiss</button>
              <button
                onClick={copyRefactoredCode}
                disabled={isRefactoring || !refactorData}
                className="bg-brand hover:bg-brand/90 text-white px-5 py-2 rounded-lg text-xs font-semibold transition-all shadow-md active:scale-95 flex items-center space-x-2 disabled:opacity-50 disabled:pointer-events-none"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                <span>Copy Code</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
