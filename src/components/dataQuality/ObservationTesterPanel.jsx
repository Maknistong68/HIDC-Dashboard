import { useState, memo } from 'react'
import { Brain, XCircle, AlignLeft, Target, Zap, HelpCircle } from 'lucide-react'
import { parseSentence, analyzeForRootCause } from '../../utils/sentenceParser'
import { categorizeHazard } from '../../utils/excelParser'

const ObservationTesterPanel = memo(({ isMobile }) => {
  const [showObservationTester, setShowObservationTester] = useState(false)
  const [testObservation, setTestObservation] = useState('')
  const [testResult, setTestResult] = useState(null)

  const handleTestObservation = () => {
    if (!testObservation.trim()) {
      setTestResult(null)
      return
    }
    const text = testObservation.trim()
    const parsed = parseSentence(text)
    const rootCause = analyzeForRootCause(text)
    const category = categorizeHazard(text)
    setTestResult({ text, parsed, rootCause, category })
  }

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setShowObservationTester(!showObservationTester)}
        className={`flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
          isMobile ? 'flex-1 h-11 px-3' : 'px-3 py-2'
        } ${
          showObservationTester
            ? 'bg-purple-600 text-white'
            : 'bg-white border border-purple-300 text-purple-700 hover:bg-purple-50'
        }`}
      >
        <Brain size={isMobile ? 18 : 16} />
        {isMobile ? 'Test' : 'Test Parser'}
      </button>

      {/* Panel Content */}
      {showObservationTester && (
        <div className="bg-white border border-purple-200 rounded-lg p-4 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-purple-800 flex items-center gap-2">
              <Brain size={16} />
              Observation Parser Tester
            </h3>
            <button
              onClick={() => setShowObservationTester(false)}
              className="text-surface-400 hover:text-surface-600"
            >
              <XCircle size={18} />
            </button>
          </div>

          <div className="space-y-3">
            {/* Input */}
            <div>
              <label className="text-xs font-medium text-surface-600 mb-1 block">
                Paste observation text to test:
              </label>
              <div className="flex gap-2">
                <textarea
                  value={testObservation}
                  onChange={(e) => setTestObservation(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleTestObservation()
                    }
                  }}
                  placeholder="e.g., Worker not wearing harness while working at height on scaffold"
                  className="flex-1 px-3 py-2 border border-surface-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={2}
                />
                <button
                  onClick={handleTestObservation}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium self-end"
                >
                  Parse
                </button>
              </div>
            </div>

            {/* Results */}
            {testResult && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
                {/* Sentence Breakdown */}
                <div className="bg-surface-50 border border-surface-200 rounded-lg p-3">
                  <h4 className="text-xs font-semibold text-surface-700 uppercase mb-2 flex items-center gap-1">
                    <AlignLeft size={12} />
                    Sentence Breakdown
                  </h4>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-start">
                      <span className="w-16 text-surface-500 font-medium shrink-0">WHO:</span>
                      <div className="flex flex-wrap items-center gap-1">
                        <span className="text-surface-800">{testResult.parsed.actor || '(none)'}</span>
                        {testResult.parsed.actorType && (
                          <span className="text-purple-600 text-[10px]">[{testResult.parsed.actorType}]</span>
                        )}
                        {testResult.parsed.actorIsSpecialist && (
                          <span className="bg-green-500 text-white text-[9px] px-1 py-0.5 rounded font-bold">SPECIALIST</span>
                        )}
                        {testResult.parsed.actorSuggestedHazard && (
                          <span className="text-green-600 text-[10px]">→ {testResult.parsed.actorSuggestedHazard} ({Math.round(testResult.parsed.actorHazardConfidence * 100)}%)</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="w-16 text-surface-500 font-medium shrink-0">WHAT:</span>
                      <div className="flex flex-wrap items-center gap-1">
                        <span className="text-surface-800">{testResult.parsed.object || '(none)'}</span>
                        {testResult.parsed.objectType && (
                          <span className="text-purple-600 text-[10px]">[{testResult.parsed.objectType}]</span>
                        )}
                        {testResult.parsed.objectSuggestedHazard && (
                          <span className="text-blue-600 text-[10px]">→ {testResult.parsed.objectSuggestedHazard}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="w-16 text-surface-500 font-medium shrink-0">ACTION:</span>
                      <div className="flex items-center gap-1">
                        <span className="text-surface-800">{testResult.parsed.action || '(none)'}</span>
                        {testResult.parsed.actionType && (
                          <span className="text-purple-600 text-[10px]">[{testResult.parsed.actionType}]</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="w-16 text-surface-500 font-medium shrink-0">WHERE:</span>
                      <div className="flex flex-wrap items-center gap-1">
                        <span className="text-surface-800">{testResult.parsed.location || '(none)'}</span>
                        {testResult.parsed.locationInfo?.preposition && (
                          <span className="text-orange-600 text-[10px]">[{testResult.parsed.locationInfo.preposition}]</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="w-16 text-surface-500 font-medium shrink-0">SUBJECT:</span>
                      <span className="text-surface-800 font-semibold">{testResult.parsed.mainSubject || '(none)'}</span>
                    </div>
                  </div>
                </div>

                {/* Classification Result */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <h4 className="text-xs font-semibold text-purple-700 uppercase mb-2 flex items-center gap-1">
                    <Target size={12} />
                    Classification
                  </h4>
                  <div className="space-y-2">
                    <div className="text-lg font-bold text-purple-900">
                      {testResult.category}
                    </div>
                    {testResult.parsed.keywords?.length > 0 && (
                      <div>
                        <span className="text-xs text-surface-500 font-medium">Keywords:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {testResult.parsed.keywords.map((k, i) => (
                            <span
                              key={i}
                              className={`text-xs px-1.5 py-0.5 rounded ${
                                k.role === 'SUBJECT' ? 'bg-green-100 text-green-700' :
                                k.role === 'OBJECT' ? 'bg-blue-100 text-blue-700' :
                                k.role === 'ACTOR' ? (k.isSpecialist ? 'bg-green-200 text-green-800 font-bold' : 'bg-yellow-100 text-yellow-700') :
                                k.role === 'ACTION' ? 'bg-orange-100 text-orange-700' :
                                k.role === 'LOCATION' ? 'bg-gray-100 text-gray-600' :
                                'bg-surface-100 text-surface-600'
                              }`}
                              title={k.suggestedHazard ? `Suggests: ${k.suggestedHazard}` : ''}
                            >
                              {k.text} ({Math.round(k.weight * 100)}%)
                              {k.isSpecialist && ' ⭐'}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Ambiguity Resolution */}
                {testResult.parsed.ambiguities?.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <h4 className="text-xs font-semibold text-yellow-700 uppercase mb-2 flex items-center gap-1">
                      <HelpCircle size={12} />
                      Ambiguity Resolution
                    </h4>
                    <div className="space-y-1.5 text-xs">
                      {testResult.parsed.ambiguities.map((amb, i) => (
                        <div key={i} className="flex items-start gap-1">
                          <span className="font-medium text-yellow-800">&quot;{amb.word}&quot;</span>
                          <span className="text-surface-500">→</span>
                          <span className={amb.resolved ? 'text-green-700' : 'text-orange-600'}>
                            {amb.hazard} ({Math.round(amb.confidence * 100)}%)
                          </span>
                          {amb.resolved && <span className="text-green-600 text-[10px]">✓ context matched</span>}
                          {!amb.resolved && <span className="text-orange-500 text-[10px]">(default)</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Root Cause Analysis */}
                {testResult.rootCause && (
                  <div className={`bg-amber-50 border border-amber-200 rounded-lg p-3 ${!testResult.parsed.ambiguities?.length ? 'lg:col-span-1' : ''}`}>
                    <h4 className="text-xs font-semibold text-amber-700 uppercase mb-2 flex items-center gap-1">
                      <Zap size={12} />
                      Root Cause Components
                    </h4>
                    <div className="space-y-1 text-xs">
                      <div>
                        <span className="text-surface-500 font-medium">Deviation: </span>
                        <span className="text-surface-800">{testResult.rootCause.deviation || '(none)'}</span>
                      </div>
                      <div>
                        <span className="text-surface-500 font-medium">Cause: </span>
                        <span className="text-surface-800">{testResult.rootCause.immediateCause || testResult.rootCause.cause || '(none)'}</span>
                      </div>
                      <div>
                        <span className="text-surface-500 font-medium">Consequence: </span>
                        <span className="text-surface-800">{testResult.rootCause.consequence || '(none)'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Confidence Summary */}
                <div className="md:col-span-2 lg:col-span-3 bg-surface-100 border border-surface-200 rounded-lg p-3">
                  <div className="flex flex-wrap items-center gap-4 text-xs">
                    <div>
                      <span className="text-surface-500 font-medium">Pattern: </span>
                      <span className="text-surface-800 font-mono">{testResult.parsed.pattern || 'NONE'}</span>
                    </div>
                    <div>
                      <span className="text-surface-500 font-medium">Parse Confidence: </span>
                      <span className={`font-bold ${testResult.parsed.confidence >= 0.7 ? 'text-green-600' : testResult.parsed.confidence >= 0.5 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {Math.round(testResult.parsed.confidence * 100)}%
                      </span>
                    </div>
                    {testResult.parsed.actorIsSpecialist && (
                      <div className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-[10px] font-bold">
                        Specialist Role Detected → Higher Confidence
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
})

ObservationTesterPanel.displayName = 'ObservationTesterPanel'

export default ObservationTesterPanel
