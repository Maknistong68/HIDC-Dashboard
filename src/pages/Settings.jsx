import React, { useState, useRef } from 'react'
import {
  Settings as SettingsIcon,
  Sparkles,
  Copy,
  CheckCircle,
  AlertTriangle,
  FolderTree,
  ArrowRightLeft,
  ListChecks,
  FileInput,
  Download,
  Upload,
  RotateCcw
} from 'lucide-react'
import useSettings from '../hooks/useSettings'
import {
  SettingSection,
  SubSection,
  SettingRow,
  Toggle,
  Dropdown,
  Slider,
  NumberInput,
  MultiSelect,
  RadioGroup,
  MappingTable
} from '../components/settings/SettingControls'

const Settings = () => {
  const {
    settings,
    isLoaded,
    updateSetting,
    getSetting,
    resetToDefaults,
    resetSection,
    exportSettings,
    importSettings,
    isModified,
    getModifiedCount
  } = useSettings()

  const [expandedSections, setExpandedSections] = useState(['cleanup'])
  const [importError, setImportError] = useState(null)
  const [importSuccess, setImportSuccess] = useState(false)
  const fileInputRef = useRef(null)

  const toggleSection = (section) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      await importSettings(file)
      setImportSuccess(true)
      setImportError(null)
      setTimeout(() => setImportSuccess(false), 3000)
    } catch (error) {
      setImportError(error.message)
      setImportSuccess(false)
    }
    e.target.value = ''
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading settings...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto pb-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <SettingsIcon size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-sm text-gray-500">Configure how your data is cleaned, validated, and organized</p>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {importError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <AlertTriangle size={18} />
          <span className="text-sm">{importError}</span>
          <button onClick={() => setImportError(null)} className="ml-auto text-red-500 hover:text-red-700">×</button>
        </div>
      )}
      {importSuccess && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
          <CheckCircle size={18} />
          <span className="text-sm">Settings imported successfully!</span>
        </div>
      )}

      {/* Settings Sections */}
      <div className="space-y-4">
        {/* 1. Clean Up My Data */}
        <SettingSection
          title="Clean Up My Data"
          description="Text cleanup, date handling, and name standardization"
          icon={Sparkles}
          isExpanded={expandedSections.includes('cleanup')}
          onToggle={() => toggleSection('cleanup')}
          modifiedCount={getModifiedCount('cleanup')}
          onReset={() => resetSection('cleanup')}
        >
          <SubSection title="Text Cleanup">
            <SettingRow
              label="Remove Extra Spaces"
              description="Gets rid of unnecessary spaces before, after, and between words"
              isModified={isModified('cleanup.text.removeExtraSpaces')}
            >
              <Toggle
                checked={getSetting('cleanup.text.removeExtraSpaces')}
                onChange={(v) => updateSetting('cleanup.text.removeExtraSpaces', v)}
              />
            </SettingRow>
            <SettingRow
              label="Fix Line Breaks"
              description="Keeps descriptions on one line instead of breaking across multiple"
              isModified={isModified('cleanup.text.fixLineBreaks')}
            >
              <Toggle
                checked={getSetting('cleanup.text.fixLineBreaks')}
                onChange={(v) => updateSetting('cleanup.text.fixLineBreaks', v)}
              />
            </SettingRow>
            <SettingRow
              label="Fix Text Capitalization"
              description="Standardize how text appears"
              isModified={isModified('cleanup.text.capitalization')}
            >
              <Dropdown
                value={getSetting('cleanup.text.capitalization')}
                onChange={(v) => updateSetting('cleanup.text.capitalization', v)}
                options={[
                  { value: 'none', label: 'Leave as-is' },
                  { value: 'title', label: 'Title Case' },
                  { value: 'upper', label: 'ALL CAPS' },
                  { value: 'lower', label: 'all lowercase' },
                  { value: 'sentence', label: 'Sentence case' },
                ]}
              />
            </SettingRow>
            <SettingRow
              label="Remove Unwanted Characters"
              description="Strip out emojis, symbols, or formatting codes"
              isModified={isModified('cleanup.text.removeUnwantedChars')}
            >
              <MultiSelect
                value={getSetting('cleanup.text.removeUnwantedChars') || []}
                onChange={(v) => updateSetting('cleanup.text.removeUnwantedChars', v)}
                options={[
                  { value: 'emojis', label: 'Emojis' },
                  { value: 'symbols', label: 'Symbols' },
                  { value: 'html', label: 'HTML tags' },
                  { value: 'nonPrintable', label: 'Hidden chars' },
                ]}
              />
            </SettingRow>
            <SettingRow
              label="Fix Quotation Marks"
              description="Convert fancy quotes to standard ones"
              isModified={isModified('cleanup.text.fixQuotationMarks')}
            >
              <Toggle
                checked={getSetting('cleanup.text.fixQuotationMarks')}
                onChange={(v) => updateSetting('cleanup.text.fixQuotationMarks', v)}
              />
            </SettingRow>
          </SubSection>

          <SubSection title="Date Cleanup">
            <SettingRow
              label="Date Format I Use"
              description="Tell the system what format your dates are in"
              isModified={isModified('cleanup.dates.inputFormat')}
            >
              <Dropdown
                value={getSetting('cleanup.dates.inputFormat')}
                onChange={(v) => updateSetting('cleanup.dates.inputFormat', v)}
                options={[
                  { value: 'DD/MM/YYYY', label: '25/12/2024 (DD/MM/YYYY)' },
                  { value: 'MM/DD/YYYY', label: '12/25/2024 (MM/DD/YYYY)' },
                  { value: 'YYYY-MM-DD', label: '2024-12-25 (YYYY-MM-DD)' },
                  { value: 'DD-MMM-YYYY', label: '25-Dec-2024' },
                ]}
              />
            </SettingRow>
            <SettingRow
              label="What To Do With Bad Dates"
              description="When a date can't be understood"
              isModified={isModified('cleanup.dates.badDateAction')}
            >
              <Dropdown
                value={getSetting('cleanup.dates.badDateAction')}
                onChange={(v) => updateSetting('cleanup.dates.badDateAction', v)}
                options={[
                  { value: 'flag', label: 'Mark for review' },
                  { value: 'reject', label: 'Reject the record' },
                  { value: 'useToday', label: "Use today's date" },
                ]}
              />
            </SettingRow>
            <SettingRow
              label="Allow Future Dates?"
              description="Should dates in the future be allowed?"
              isModified={isModified('cleanup.dates.allowFutureDates')}
            >
              <Toggle
                checked={getSetting('cleanup.dates.allowFutureDates')}
                onChange={(v) => updateSetting('cleanup.dates.allowFutureDates', v)}
              />
            </SettingRow>
            <SettingRow
              label="Valid Date Range"
              description="Only accept dates within this range"
              isModified={isModified('cleanup.dates.validDateRange')}
            >
              <div className="flex items-center gap-2">
                <Toggle
                  checked={getSetting('cleanup.dates.validDateRange.enabled')}
                  onChange={(v) => updateSetting('cleanup.dates.validDateRange.enabled', v)}
                />
                {getSetting('cleanup.dates.validDateRange.enabled') && (
                  <>
                    <NumberInput
                      value={getSetting('cleanup.dates.validDateRange.minYear')}
                      onChange={(v) => updateSetting('cleanup.dates.validDateRange.minYear', v)}
                      min={1990}
                      max={2100}
                    />
                    <span className="text-gray-400">to</span>
                    <NumberInput
                      value={getSetting('cleanup.dates.validDateRange.maxYear')}
                      onChange={(v) => updateSetting('cleanup.dates.validDateRange.maxYear', v)}
                      min={1990}
                      max={2100}
                    />
                  </>
                )}
              </div>
            </SettingRow>
          </SubSection>

          <SubSection title="Name Cleanup">
            <SettingRow
              label="Contractor Names"
              description="How to standardize contractor names"
              isModified={isModified('cleanup.names.contractor')}
            >
              <Dropdown
                value={getSetting('cleanup.names.contractor')}
                onChange={(v) => updateSetting('cleanup.names.contractor', v)}
                options={[
                  { value: 'none', label: 'Leave as-is' },
                  { value: 'trim', label: 'Clean up spacing' },
                  { value: 'title', label: 'Title Case' },
                  { value: 'upper', label: 'ALL CAPS' },
                  { value: 'fuzzy', label: 'Match to existing list' },
                ]}
              />
            </SettingRow>
            <SettingRow
              label="Site Names"
              description="How to standardize site names"
              isModified={isModified('cleanup.names.site')}
            >
              <Dropdown
                value={getSetting('cleanup.names.site')}
                onChange={(v) => updateSetting('cleanup.names.site', v)}
                options={[
                  { value: 'none', label: 'Leave as-is' },
                  { value: 'trim', label: 'Clean up spacing' },
                  { value: 'title', label: 'Title Case' },
                  { value: 'upper', label: 'ALL CAPS' },
                  { value: 'fuzzy', label: 'Match to existing list' },
                ]}
              />
            </SettingRow>
            <SettingRow
              label="Reporter Names"
              description="How to standardize reporter names"
              isModified={isModified('cleanup.names.reporter')}
            >
              <Dropdown
                value={getSetting('cleanup.names.reporter')}
                onChange={(v) => updateSetting('cleanup.names.reporter', v)}
                options={[
                  { value: 'none', label: 'Leave as-is' },
                  { value: 'trim', label: 'Clean up spacing' },
                  { value: 'title', label: 'Title Case' },
                  { value: 'flipName', label: 'Flip "Last, First" to "First Last"' },
                ]}
              />
            </SettingRow>
          </SubSection>

          <SubSection title="Description Rules">
            <SettingRow
              label="Minimum Length"
              description="Require descriptions to be at least this many characters"
              isModified={isModified('cleanup.description.minLength')}
            >
              <NumberInput
                value={getSetting('cleanup.description.minLength')}
                onChange={(v) => updateSetting('cleanup.description.minLength', v)}
                min={0}
                max={100}
                suffix="characters"
              />
            </SettingRow>
            <SettingRow
              label="Maximum Length"
              description="Warn or cut off descriptions longer than this"
              isModified={isModified('cleanup.description.maxLength')}
            >
              <NumberInput
                value={getSetting('cleanup.description.maxLength')}
                onChange={(v) => updateSetting('cleanup.description.maxLength', v)}
                min={100}
                max={10000}
                suffix="characters"
              />
            </SettingRow>
          </SubSection>
        </SettingSection>

        {/* 2. Find Duplicates */}
        <SettingSection
          title="Find Duplicates"
          description="Detect and handle duplicate records"
          icon={Copy}
          isExpanded={expandedSections.includes('duplicates')}
          onToggle={() => toggleSection('duplicates')}
          modifiedCount={getModifiedCount('duplicates')}
          onReset={() => resetSection('duplicates')}
        >
          <SubSection title="Detection Settings">
            <SettingRow
              label="Check for Duplicates"
              description="Turn duplicate checking on or off"
              isModified={isModified('duplicates.enabled')}
            >
              <Toggle
                checked={getSetting('duplicates.enabled')}
                onChange={(v) => updateSetting('duplicates.enabled', v)}
              />
            </SettingRow>
            <SettingRow
              label="How Strict?"
              description="How precisely records must match"
              isModified={isModified('duplicates.strictness')}
            >
              <Dropdown
                value={getSetting('duplicates.strictness')}
                onChange={(v) => updateSetting('duplicates.strictness', v)}
                options={[
                  { value: 'exact', label: 'Exact match only' },
                  { value: 'similar', label: 'Similar matches' },
                  { value: 'smart', label: 'Smart detection' },
                ]}
                disabled={!getSetting('duplicates.enabled')}
              />
            </SettingRow>
            <SettingRow
              label="Sensitivity"
              description="Lower = catch more potential duplicates"
              isModified={isModified('duplicates.sensitivity')}
            >
              <Slider
                value={getSetting('duplicates.sensitivity')}
                onChange={(v) => updateSetting('duplicates.sensitivity', v)}
                min={0.5}
                max={1}
                step={0.05}
                minLabel="Catch more"
                maxLabel="Only obvious"
                formatValue={(v) => `${Math.round(v * 100)}%`}
              />
            </SettingRow>
            <SettingRow
              label="Compare Against"
              description="What data to check for duplicates"
              isModified={isModified('duplicates.compareAgainst')}
            >
              <Dropdown
                value={getSetting('duplicates.compareAgainst')}
                onChange={(v) => updateSetting('duplicates.compareAgainst', v)}
                options={[
                  { value: 'thisImport', label: 'Just this import' },
                  { value: 'all', label: 'All existing data' },
                  { value: 'last30Days', label: 'Last 30 days' },
                ]}
                disabled={!getSetting('duplicates.enabled')}
              />
            </SettingRow>
          </SubSection>

          <SubSection title="What Makes a Duplicate?">
            <SettingRow
              label="Must Match"
              description="Fields that MUST be the same"
              isModified={isModified('duplicates.mustMatch')}
            >
              <MultiSelect
                value={getSetting('duplicates.mustMatch') || []}
                onChange={(v) => updateSetting('duplicates.mustMatch', v)}
                options={[
                  { value: 'date', label: 'Date' },
                  { value: 'contractor', label: 'Contractor' },
                  { value: 'site', label: 'Site' },
                  { value: 'description', label: 'Description' },
                  { value: 'reporter', label: 'Reporter' },
                  { value: 'type', label: 'Type' },
                ]}
              />
            </SettingRow>
            <SettingRow
              label="Should Be Similar"
              description="Fields to compare but don't have to match exactly"
              isModified={isModified('duplicates.shouldBeSimilar')}
            >
              <MultiSelect
                value={getSetting('duplicates.shouldBeSimilar') || []}
                onChange={(v) => updateSetting('duplicates.shouldBeSimilar', v)}
                options={[
                  { value: 'date', label: 'Date' },
                  { value: 'contractor', label: 'Contractor' },
                  { value: 'site', label: 'Site' },
                  { value: 'description', label: 'Description' },
                  { value: 'reporter', label: 'Reporter' },
                  { value: 'type', label: 'Type' },
                ]}
              />
            </SettingRow>
            <SettingRow
              label="Date Flexibility"
              description="Days difference still considered 'same date'"
              isModified={isModified('duplicates.dateFlexibility')}
            >
              <NumberInput
                value={getSetting('duplicates.dateFlexibility')}
                onChange={(v) => updateSetting('duplicates.dateFlexibility', v)}
                min={0}
                max={7}
                suffix="days"
              />
            </SettingRow>
          </SubSection>

          <SubSection title="When Duplicates Are Found">
            <SettingRow
              label="Action"
              description="What to do when a duplicate is detected"
              isModified={isModified('duplicates.whenFound.action')}
            >
              <Dropdown
                value={getSetting('duplicates.whenFound.action')}
                onChange={(v) => updateSetting('duplicates.whenFound.action', v)}
                options={[
                  { value: 'flag', label: 'Mark for review' },
                  { value: 'skip', label: 'Skip it' },
                  { value: 'importAnyway', label: 'Import anyway' },
                  { value: 'combine', label: 'Combine them' },
                ]}
              />
            </SettingRow>
            <SettingRow
              label="Which One to Keep"
              description="When combining or choosing"
              isModified={isModified('duplicates.whenFound.keepVersion')}
            >
              <Dropdown
                value={getSetting('duplicates.whenFound.keepVersion')}
                onChange={(v) => updateSetting('duplicates.whenFound.keepVersion', v)}
                options={[
                  { value: 'first', label: 'First one' },
                  { value: 'latest', label: 'Newest one' },
                  { value: 'bestQuality', label: 'Best quality one' },
                ]}
              />
            </SettingRow>
            <SettingRow
              label="Keep a Log"
              description="Save a record of what was skipped"
              isModified={isModified('duplicates.whenFound.keepLog')}
            >
              <Toggle
                checked={getSetting('duplicates.whenFound.keepLog')}
                onChange={(v) => updateSetting('duplicates.whenFound.keepLog', v)}
              />
            </SettingRow>
          </SubSection>
        </SettingSection>

        {/* 3. Auto-Categorize Hazards */}
        <SettingSection
          title="Auto-Categorize Hazards"
          description="Automatic hazard category assignment"
          icon={ListChecks}
          isExpanded={expandedSections.includes('categorization')}
          onToggle={() => toggleSection('categorization')}
          modifiedCount={getModifiedCount('categorization')}
          onReset={() => resetSection('categorization')}
        >
          <SubSection title="How It Works">
            <SettingRow
              label="Enable Auto-Categorization"
              description="Automatically assign hazard categories"
              isModified={isModified('categorization.enabled')}
            >
              <Toggle
                checked={getSetting('categorization.enabled')}
                onChange={(v) => updateSetting('categorization.enabled', v)}
              />
            </SettingRow>
            <SettingRow
              label="Confidence Level"
              description="How sure the system needs to be before assigning"
              isModified={isModified('categorization.confidenceLevel')}
            >
              <Slider
                value={getSetting('categorization.confidenceLevel')}
                onChange={(v) => updateSetting('categorization.confidenceLevel', v)}
                min={0.5}
                max={1}
                step={0.05}
                minLabel="Guess more"
                maxLabel="Be certain"
                formatValue={(v) => `${Math.round(v * 100)}%`}
              />
            </SettingRow>
            <SettingRow
              label="When Unsure"
              description="What to do when confidence is low"
              isModified={isModified('categorization.whenUnsure')}
            >
              <Dropdown
                value={getSetting('categorization.whenUnsure')}
                onChange={(v) => updateSetting('categorization.whenUnsure', v)}
                options={[
                  { value: 'flag', label: 'Mark for review' },
                  { value: 'bestGuess', label: 'Assign best guess' },
                  { value: 'leaveBlank', label: 'Leave blank' },
                  { value: 'useOther', label: 'Use "Other"' },
                ]}
              />
            </SettingRow>
            <SettingRow
              label="Multiple Matches"
              description="When multiple categories could apply"
              isModified={isModified('categorization.multipleMatches')}
            >
              <Dropdown
                value={getSetting('categorization.multipleMatches')}
                onChange={(v) => updateSetting('categorization.multipleMatches', v)}
                options={[
                  { value: 'highest', label: 'Use highest confidence' },
                  { value: 'first', label: 'Use first match' },
                  { value: 'mostSpecific', label: 'Use most specific' },
                  { value: 'flag', label: 'Mark for review' },
                ]}
              />
            </SettingRow>
          </SubSection>

          <SubSection title="Category Rules">
            <SettingRow
              label="Prioritize Major Hazards"
              description="Check dangerous categories first"
              isModified={isModified('categorization.rules.prioritizeMajorHazards')}
            >
              <Toggle
                checked={getSetting('categorization.rules.prioritizeMajorHazards')}
                onChange={(v) => updateSetting('categorization.rules.prioritizeMajorHazards', v)}
              />
            </SettingRow>
            <SettingRow
              label="Use Smart Corrections"
              description="Fix common mismatches automatically"
              isModified={isModified('categorization.rules.useSmartCorrections')}
              tooltip='e.g., "fire extinguisher" → PPE, not Fire'
            >
              <Toggle
                checked={getSetting('categorization.rules.useSmartCorrections')}
                onChange={(v) => updateSetting('categorization.rules.useSmartCorrections', v)}
              />
            </SettingRow>
            <SettingRow
              label="Use Exclusion Rules"
              description="Prevent wrong matches"
              isModified={isModified('categorization.rules.useExclusionRules')}
              tooltip={'e.g., "fire warden" should not match "Fire" hazard'}
            >
              <Toggle
                checked={getSetting('categorization.rules.useExclusionRules')}
                onChange={(v) => updateSetting('categorization.rules.useExclusionRules', v)}
              />
            </SettingRow>
          </SubSection>
        </SettingSection>

        {/* 4. Validate My Data */}
        <SettingSection
          title="Validate My Data"
          description="Required fields and quality scoring"
          icon={CheckCircle}
          isExpanded={expandedSections.includes('validation')}
          onToggle={() => toggleSection('validation')}
          modifiedCount={getModifiedCount('validation')}
          onReset={() => resetSection('validation')}
        >
          <SubSection title="Required Information">
            <SettingRow
              label="Required Fields"
              description="Fields that must be filled in"
              isModified={isModified('validation.requiredFields')}
            >
              <MultiSelect
                value={getSetting('validation.requiredFields') || []}
                onChange={(v) => updateSetting('validation.requiredFields', v)}
                options={[
                  { value: 'date', label: 'Date' },
                  { value: 'type', label: 'Type' },
                  { value: 'description', label: 'Description' },
                  { value: 'contractor', label: 'Contractor' },
                  { value: 'site', label: 'Site' },
                  { value: 'reporter', label: 'Reporter' },
                  { value: 'status', label: 'Status' },
                ]}
              />
            </SettingRow>
            <SettingRow
              label="When Missing"
              description="What to do when required fields are empty"
              isModified={isModified('validation.whenMissing')}
            >
              <Dropdown
                value={getSetting('validation.whenMissing')}
                onChange={(v) => updateSetting('validation.whenMissing', v)}
                options={[
                  { value: 'flag', label: 'Mark for review' },
                  { value: 'reject', label: 'Reject the record' },
                  { value: 'useDefault', label: 'Fill in a default' },
                ]}
              />
            </SettingRow>
          </SubSection>

          <SubSection title="Field Rules">
            <SettingRow
              label="Incident Types"
              description="How strict to be with type values"
              isModified={isModified('validation.fieldRules.incidentTypes')}
            >
              <Dropdown
                value={getSetting('validation.fieldRules.incidentTypes')}
                onChange={(v) => updateSetting('validation.fieldRules.incidentTypes', v)}
                options={[
                  { value: 'strict', label: 'Strict (7 types only)' },
                  { value: 'flexible', label: 'Flexible (try to match)' },
                  { value: 'any', label: 'Any value' },
                ]}
              />
            </SettingRow>
            <SettingRow
              label="Contractor Names"
              description="How to handle new contractor names"
              isModified={isModified('validation.fieldRules.contractorNames')}
            >
              <Dropdown
                value={getSetting('validation.fieldRules.contractorNames')}
                onChange={(v) => updateSetting('validation.fieldRules.contractorNames', v)}
                options={[
                  { value: 'any', label: 'Allow any' },
                  { value: 'mustExist', label: 'Must exist in list' },
                  { value: 'autoAdd', label: 'Auto-add new ones' },
                ]}
              />
            </SettingRow>
            <SettingRow
              label="Site Names"
              description="How to handle new site names"
              isModified={isModified('validation.fieldRules.siteNames')}
            >
              <Dropdown
                value={getSetting('validation.fieldRules.siteNames')}
                onChange={(v) => updateSetting('validation.fieldRules.siteNames', v)}
                options={[
                  { value: 'any', label: 'Allow any' },
                  { value: 'mustExist', label: 'Must exist in list' },
                  { value: 'autoAdd', label: 'Auto-add new ones' },
                ]}
              />
            </SettingRow>
          </SubSection>

          <SubSection title="Quality Scoring">
            <SettingRow
              label="Enable Quality Scores"
              description="Calculate a quality score for each record"
              isModified={isModified('validation.qualityScoring.enabled')}
            >
              <Toggle
                checked={getSetting('validation.qualityScoring.enabled')}
                onChange={(v) => updateSetting('validation.qualityScoring.enabled', v)}
              />
            </SettingRow>
            <SettingRow
              label="Description Importance"
              description="How much description quality affects the score"
              isModified={isModified('validation.qualityScoring.weights.description')}
            >
              <Slider
                value={getSetting('validation.qualityScoring.weights.description')}
                onChange={(v) => updateSetting('validation.qualityScoring.weights.description', v)}
                min={0}
                max={100}
                step={5}
                formatValue={(v) => `${v}%`}
              />
            </SettingRow>
            <SettingRow
              label="Categorization Importance"
              description="How much having a proper category affects the score"
              isModified={isModified('validation.qualityScoring.weights.categorization')}
            >
              <Slider
                value={getSetting('validation.qualityScoring.weights.categorization')}
                onChange={(v) => updateSetting('validation.qualityScoring.weights.categorization', v)}
                min={0}
                max={100}
                step={5}
                formatValue={(v) => `${v}%`}
              />
            </SettingRow>
            <SettingRow
              label="Completeness Importance"
              description="How much having all fields filled affects the score"
              isModified={isModified('validation.qualityScoring.weights.completeness')}
            >
              <Slider
                value={getSetting('validation.qualityScoring.weights.completeness')}
                onChange={(v) => updateSetting('validation.qualityScoring.weights.completeness', v)}
                min={0}
                max={100}
                step={5}
                formatValue={(v) => `${v}%`}
              />
            </SettingRow>
            <SettingRow
              label="Minimum Quality to Import"
              description="Reject records below this score (0 = accept all)"
              isModified={isModified('validation.qualityScoring.minQualityToImport')}
            >
              <Slider
                value={getSetting('validation.qualityScoring.minQualityToImport')}
                onChange={(v) => updateSetting('validation.qualityScoring.minQualityToImport', v)}
                min={0}
                max={100}
                step={5}
                formatValue={(v) => v === 0 ? 'Off' : `${v}%`}
              />
            </SettingRow>
          </SubSection>
        </SettingSection>

        {/* 5. Organize My Data */}
        <SettingSection
          title="Organize My Data"
          description="Sorting, grouping, and default filters"
          icon={FolderTree}
          isExpanded={expandedSections.includes('organize')}
          onToggle={() => toggleSection('organize')}
          modifiedCount={getModifiedCount('organize')}
          onReset={() => resetSection('organize')}
        >
          <SubSection title="Default Sorting">
            <SettingRow
              label="Sort By"
              description="Primary sort column"
              isModified={isModified('organize.sorting.primaryField')}
            >
              <Dropdown
                value={getSetting('organize.sorting.primaryField')}
                onChange={(v) => updateSetting('organize.sorting.primaryField', v)}
                options={[
                  { value: 'date', label: 'Date' },
                  { value: 'type', label: 'Type' },
                  { value: 'contractor', label: 'Contractor' },
                  { value: 'site', label: 'Site' },
                  { value: 'status', label: 'Status' },
                ]}
              />
            </SettingRow>
            <SettingRow
              label="Sort Order"
              description="Ascending or descending"
              isModified={isModified('organize.sorting.primaryOrder')}
            >
              <Dropdown
                value={getSetting('organize.sorting.primaryOrder')}
                onChange={(v) => updateSetting('organize.sorting.primaryOrder', v)}
                options={[
                  { value: 'desc', label: 'Newest/Z-A first' },
                  { value: 'asc', label: 'Oldest/A-Z first' },
                ]}
              />
            </SettingRow>
            <SettingRow
              label="Empty Values"
              description="Where to show records with empty values"
              isModified={isModified('organize.sorting.emptyValuesPosition')}
            >
              <Dropdown
                value={getSetting('organize.sorting.emptyValuesPosition')}
                onChange={(v) => updateSetting('organize.sorting.emptyValuesPosition', v)}
                options={[
                  { value: 'last', label: 'At the bottom' },
                  { value: 'first', label: 'At the top' },
                ]}
              />
            </SettingRow>
          </SubSection>

          <SubSection title="Grouping">
            <SettingRow
              label="Group Records"
              description="Group records by a field"
              isModified={isModified('organize.grouping.enabled')}
            >
              <Toggle
                checked={getSetting('organize.grouping.enabled')}
                onChange={(v) => updateSetting('organize.grouping.enabled', v)}
              />
            </SettingRow>
            <SettingRow
              label="Group By"
              description="Which field to group by"
              isModified={isModified('organize.grouping.groupBy')}
            >
              <Dropdown
                value={getSetting('organize.grouping.groupBy')}
                onChange={(v) => updateSetting('organize.grouping.groupBy', v)}
                options={[
                  { value: 'none', label: 'No grouping' },
                  { value: 'type', label: 'Type' },
                  { value: 'contractor', label: 'Contractor' },
                  { value: 'site', label: 'Site' },
                  { value: 'month', label: 'Month' },
                  { value: 'status', label: 'Status' },
                  { value: 'hazardCategory', label: 'Hazard Category' },
                ]}
                disabled={!getSetting('organize.grouping.enabled')}
              />
            </SettingRow>
            <SettingRow
              label="Start Collapsed"
              description="Show groups collapsed by default"
              isModified={isModified('organize.grouping.startCollapsed')}
            >
              <Toggle
                checked={getSetting('organize.grouping.startCollapsed')}
                onChange={(v) => updateSetting('organize.grouping.startCollapsed', v)}
                disabled={!getSetting('organize.grouping.enabled')}
              />
            </SettingRow>
          </SubSection>

          <SubSection title="Default Filters">
            <SettingRow
              label="Date Range"
              description="Default date range when loading"
              isModified={isModified('organize.defaultFilters.dateRange')}
            >
              <Dropdown
                value={getSetting('organize.defaultFilters.dateRange')}
                onChange={(v) => updateSetting('organize.defaultFilters.dateRange', v)}
                options={[
                  { value: 'allTime', label: 'All Time' },
                  { value: 'thisMonth', label: 'This Month' },
                  { value: 'last30Days', label: 'Last 30 Days' },
                  { value: 'thisQuarter', label: 'This Quarter' },
                  { value: 'thisYear', label: 'This Year' },
                  { value: 'ytd', label: 'Year to Date' },
                ]}
              />
            </SettingRow>
            <SettingRow
              label="Status"
              description="Default status filter"
              isModified={isModified('organize.defaultFilters.status')}
            >
              <Dropdown
                value={getSetting('organize.defaultFilters.status')}
                onChange={(v) => updateSetting('organize.defaultFilters.status', v)}
                options={[
                  { value: 'all', label: 'All' },
                  { value: 'open', label: 'Open Only' },
                  { value: 'closed', label: 'Closed Only' },
                ]}
              />
            </SettingRow>
            <SettingRow
              label="Remember My Filters"
              description="Keep filter selections when you come back"
              isModified={isModified('organize.defaultFilters.rememberFilters')}
            >
              <Toggle
                checked={getSetting('organize.defaultFilters.rememberFilters')}
                onChange={(v) => updateSetting('organize.defaultFilters.rememberFilters', v)}
              />
            </SettingRow>
          </SubSection>

          <SubSection title="Contractor & Site">
            <SettingRow
              label="Link Sites to Contractors"
              description="Only show sites for the selected contractor"
              isModified={isModified('organize.hierarchy.linkSitesToContractors')}
            >
              <Toggle
                checked={getSetting('organize.hierarchy.linkSitesToContractors')}
                onChange={(v) => updateSetting('organize.hierarchy.linkSitesToContractors', v)}
              />
            </SettingRow>
            <SettingRow
              label="Allow Shared Sites"
              description="Same site can exist under different contractors"
              isModified={isModified('organize.hierarchy.allowSharedSites')}
            >
              <Toggle
                checked={getSetting('organize.hierarchy.allowSharedSites')}
                onChange={(v) => updateSetting('organize.hierarchy.allowSharedSites', v)}
              />
            </SettingRow>
          </SubSection>
        </SettingSection>

        {/* 6. Transform My Data */}
        <SettingSection
          title="Transform My Data"
          description="Value mappings and auto-calculated fields"
          icon={ArrowRightLeft}
          isExpanded={expandedSections.includes('transform')}
          onToggle={() => toggleSection('transform')}
          modifiedCount={getModifiedCount('transform')}
          onReset={() => resetSection('transform')}
        >
          <SubSection title="Type Mapping">
            <SettingRow
              label="Enable Type Mapping"
              description="Convert imported types to standard ones"
              isModified={isModified('transform.typeMapping.enabled')}
            >
              <Toggle
                checked={getSetting('transform.typeMapping.enabled')}
                onChange={(v) => updateSetting('transform.typeMapping.enabled', v)}
              />
            </SettingRow>
            {getSetting('transform.typeMapping.enabled') && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-2">Map imported values to standard types:</p>
                <MappingTable
                  mappings={getSetting('transform.typeMapping.mappings') || {}}
                  onChange={(v) => updateSetting('transform.typeMapping.mappings', v)}
                  placeholder={{ from: 'Imported value', to: 'Standard type' }}
                />
              </div>
            )}
            <SettingRow
              label="When Unknown"
              description="What to do with unrecognized types"
              isModified={isModified('transform.typeMapping.whenUnknown')}
            >
              <Dropdown
                value={getSetting('transform.typeMapping.whenUnknown')}
                onChange={(v) => updateSetting('transform.typeMapping.whenUnknown', v)}
                options={[
                  { value: 'flag', label: 'Mark for review' },
                  { value: 'reject', label: 'Reject' },
                  { value: 'useDefault', label: 'Use default' },
                ]}
              />
            </SettingRow>
          </SubSection>

          <SubSection title="Status Mapping">
            <SettingRow
              label="Enable Status Mapping"
              description="Convert imported statuses to standard ones"
              isModified={isModified('transform.statusMapping.enabled')}
            >
              <Toggle
                checked={getSetting('transform.statusMapping.enabled')}
                onChange={(v) => updateSetting('transform.statusMapping.enabled', v)}
              />
            </SettingRow>
            {getSetting('transform.statusMapping.enabled') && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-2">Map imported values to standard statuses:</p>
                <MappingTable
                  mappings={getSetting('transform.statusMapping.mappings') || {}}
                  onChange={(v) => updateSetting('transform.statusMapping.mappings', v)}
                  placeholder={{ from: 'Imported value', to: 'Standard status' }}
                />
              </div>
            )}
          </SubSection>

          <SubSection title="Auto-Calculate Fields">
            <SettingRow
              label="Calculate Age"
              description="Automatically calculate days since creation"
              isModified={isModified('transform.autoCalculate.age')}
            >
              <Toggle
                checked={getSetting('transform.autoCalculate.age')}
                onChange={(v) => updateSetting('transform.autoCalculate.age', v)}
              />
            </SettingRow>
            <SettingRow
              label="Extract Month"
              description="Automatically add which month each record is from"
              isModified={isModified('transform.autoCalculate.month')}
            >
              <Toggle
                checked={getSetting('transform.autoCalculate.month')}
                onChange={(v) => updateSetting('transform.autoCalculate.month', v)}
              />
            </SettingRow>
            <SettingRow
              label="Extract Quarter"
              description="Automatically add which quarter (Q1-Q4)"
              isModified={isModified('transform.autoCalculate.quarter')}
            >
              <Toggle
                checked={getSetting('transform.autoCalculate.quarter')}
                onChange={(v) => updateSetting('transform.autoCalculate.quarter', v)}
              />
            </SettingRow>
            <SettingRow
              label="Generate ID"
              description="Create a unique ID if one is missing"
              isModified={isModified('transform.autoCalculate.generateId')}
            >
              <Toggle
                checked={getSetting('transform.autoCalculate.generateId')}
                onChange={(v) => updateSetting('transform.autoCalculate.generateId', v)}
              />
            </SettingRow>
          </SubSection>
        </SettingSection>

        {/* 7. Master Lists */}
        <SettingSection
          title="Master Lists"
          description="Manage contractors, sites, and categories"
          icon={ListChecks}
          isExpanded={expandedSections.includes('masterLists')}
          onToggle={() => toggleSection('masterLists')}
          modifiedCount={getModifiedCount('masterLists')}
          onReset={() => resetSection('masterLists')}
        >
          <SubSection title="Contractor List">
            <SettingRow
              label="Maintain Contractor List"
              description="Keep an official list of approved contractors"
              isModified={isModified('masterLists.contractors.enabled')}
            >
              <Toggle
                checked={getSetting('masterLists.contractors.enabled')}
                onChange={(v) => updateSetting('masterLists.contractors.enabled', v)}
              />
            </SettingRow>
            <SettingRow
              label="Auto-Add New"
              description="Automatically add new contractors found during import"
              isModified={isModified('masterLists.contractors.autoAddNew')}
            >
              <Toggle
                checked={getSetting('masterLists.contractors.autoAddNew')}
                onChange={(v) => updateSetting('masterLists.contractors.autoAddNew', v)}
              />
            </SettingRow>
            <SettingRow
              label="Match Similar Names"
              description="Automatically correct typos and variations"
              isModified={isModified('masterLists.contractors.matchSimilarNames')}
            >
              <Toggle
                checked={getSetting('masterLists.contractors.matchSimilarNames')}
                onChange={(v) => updateSetting('masterLists.contractors.matchSimilarNames', v)}
              />
            </SettingRow>
            <SettingRow
              label="Merge Duplicates"
              description="Combine contractor names that are clearly the same"
              isModified={isModified('masterLists.contractors.mergeDuplicates')}
            >
              <Toggle
                checked={getSetting('masterLists.contractors.mergeDuplicates')}
                onChange={(v) => updateSetting('masterLists.contractors.mergeDuplicates', v)}
              />
            </SettingRow>
          </SubSection>

          <SubSection title="Site List">
            <SettingRow
              label="Maintain Site List"
              description="Keep an official list of approved sites"
              isModified={isModified('masterLists.sites.enabled')}
            >
              <Toggle
                checked={getSetting('masterLists.sites.enabled')}
                onChange={(v) => updateSetting('masterLists.sites.enabled', v)}
              />
            </SettingRow>
            <SettingRow
              label="Link to Contractors"
              description="Each site belongs to specific contractor(s)"
              isModified={isModified('masterLists.sites.linkToContractors')}
            >
              <Toggle
                checked={getSetting('masterLists.sites.linkToContractors')}
                onChange={(v) => updateSetting('masterLists.sites.linkToContractors', v)}
              />
            </SettingRow>
            <SettingRow
              label="Auto-Add New"
              description="Automatically add new sites found during import"
              isModified={isModified('masterLists.sites.autoAddNew')}
            >
              <Toggle
                checked={getSetting('masterLists.sites.autoAddNew')}
                onChange={(v) => updateSetting('masterLists.sites.autoAddNew', v)}
              />
            </SettingRow>
            <SettingRow
              label="Auto-Fill Contractor"
              description="When a known site is found, automatically fill in its contractor"
              isModified={isModified('masterLists.sites.autoFillContractor')}
            >
              <Toggle
                checked={getSetting('masterLists.sites.autoFillContractor')}
                onChange={(v) => updateSetting('masterLists.sites.autoFillContractor', v)}
              />
            </SettingRow>
          </SubSection>

          <SubSection title="Hazard Categories">
            <SettingRow
              label="Use Standard Categories"
              description="Stick to the 30 approved hazard categories"
              isModified={isModified('masterLists.categories.useStandard')}
            >
              <Toggle
                checked={getSetting('masterLists.categories.useStandard')}
                onChange={(v) => updateSetting('masterLists.categories.useStandard', v)}
              />
            </SettingRow>
            <SettingRow
              label="Allow Custom Categories"
              description="Let users create their own categories"
              isModified={isModified('masterLists.categories.allowCustom')}
            >
              <Toggle
                checked={getSetting('masterLists.categories.allowCustom')}
                onChange={(v) => updateSetting('masterLists.categories.allowCustom', v)}
              />
            </SettingRow>
            {getSetting('masterLists.categories.allowCustom') && (
              <SettingRow
                label="Custom Category Limit"
                description="Maximum number of custom categories"
                isModified={isModified('masterLists.categories.customLimit')}
              >
                <NumberInput
                  value={getSetting('masterLists.categories.customLimit')}
                  onChange={(v) => updateSetting('masterLists.categories.customLimit', v)}
                  min={1}
                  max={50}
                />
              </SettingRow>
            )}
          </SubSection>
        </SettingSection>

        {/* 8. Import Process */}
        <SettingSection
          title="Import Process"
          description="Processing order and error handling"
          icon={FileInput}
          isExpanded={expandedSections.includes('importProcess')}
          onToggle={() => toggleSection('importProcess')}
          modifiedCount={getModifiedCount('importProcess')}
          onReset={() => resetSection('importProcess')}
        >
          <SubSection title="Processing">
            <SettingRow
              label="Stop on Errors"
              description="Stop the whole import if errors are found"
              isModified={isModified('importProcess.stopOnErrors')}
            >
              <Toggle
                checked={getSetting('importProcess.stopOnErrors')}
                onChange={(v) => updateSetting('importProcess.stopOnErrors', v)}
              />
            </SettingRow>
            <SettingRow
              label="Error Limit"
              description="Stop if more than this % of records have errors"
              isModified={isModified('importProcess.errorLimit')}
            >
              <Slider
                value={getSetting('importProcess.errorLimit')}
                onChange={(v) => updateSetting('importProcess.errorLimit', v)}
                min={1}
                max={100}
                step={1}
                formatValue={(v) => `${v}%`}
              />
            </SettingRow>
            <SettingRow
              label="Batch Size"
              description="Records to process at once (affects speed)"
              isModified={isModified('importProcess.batchSize')}
            >
              <Dropdown
                value={getSetting('importProcess.batchSize')}
                onChange={(v) => updateSetting('importProcess.batchSize', parseInt(v))}
                options={[
                  { value: '100', label: '100 (slower, less memory)' },
                  { value: '500', label: '500 (balanced)' },
                  { value: '1000', label: '1000 (faster)' },
                  { value: '5000', label: '5000 (fastest)' },
                ]}
              />
            </SettingRow>
          </SubSection>

          <SubSection title="Review Queue">
            <SettingRow
              label="Enable Review Queue"
              description="Hold problematic records for manual review"
              isModified={isModified('importProcess.reviewQueue.enabled')}
            >
              <Toggle
                checked={getSetting('importProcess.reviewQueue.enabled')}
                onChange={(v) => updateSetting('importProcess.reviewQueue.enabled', v)}
              />
            </SettingRow>
            <SettingRow
              label="Auto-Import Good Records"
              description="Immediately import records that pass all checks"
              isModified={isModified('importProcess.reviewQueue.autoImportGood')}
            >
              <Toggle
                checked={getSetting('importProcess.reviewQueue.autoImportGood')}
                onChange={(v) => updateSetting('importProcess.reviewQueue.autoImportGood', v)}
              />
            </SettingRow>
            <SettingRow
              label="Queue Expiry"
              description="Days before queued items are automatically removed"
              isModified={isModified('importProcess.reviewQueue.expiryDays')}
            >
              <NumberInput
                value={getSetting('importProcess.reviewQueue.expiryDays')}
                onChange={(v) => updateSetting('importProcess.reviewQueue.expiryDays', v)}
                min={1}
                max={30}
                suffix="days"
              />
            </SettingRow>
            <SettingRow
              label="Notify Me"
              description="Show alert when items are waiting for review"
              isModified={isModified('importProcess.reviewQueue.notifyMe')}
            >
              <Toggle
                checked={getSetting('importProcess.reviewQueue.notifyMe')}
                onChange={(v) => updateSetting('importProcess.reviewQueue.notifyMe', v)}
              />
            </SettingRow>
          </SubSection>
        </SettingSection>
      </div>

      {/* Footer Actions */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <button
            onClick={resetToDefaults}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RotateCcw size={16} />
            Reset to Defaults
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={exportSettings}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download size={16} />
              Export Settings
            </button>
            <button
              onClick={handleImportClick}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Upload size={16} />
              Import Settings
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
