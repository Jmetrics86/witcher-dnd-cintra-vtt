import React, { useState, useRef } from 'react';
import {
  X,
  Scroll,
  Clock,
  Compass,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  Eye,
  EyeOff,
  Send,
  Zap,
  GitBranch,
  UserCheck,
  MessageSquarePlus,
  Type,
  Layers,
  Map as MapIcon,
} from 'lucide-react';
import {
  WITCHER_ADVENTURE,
  AdventureAct,
  PartyChoicePoint,
  CharacterBeatOpportunity,
  CauseAndEffectRipple,
} from '../data/adventure';
import { PartyChoiceRecord, StoryVisualOverlay, WitcherSchool } from '../types';

interface AdventureGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeStoryVisual?: StoryVisualOverlay | null;
  onShowStoryVisual?: (visual: StoryVisualOverlay | null) => void;
  partyChoices?: Record<string, PartyChoiceRecord>;
  onUpdatePartyChoice?: (choice: PartyChoiceRecord) => void;
  completedSpotlights?: Record<string, boolean>;
  onToggleSpotlight?: (spotlightId: string) => void;
  onSendScriptToChat?: (text: string, title?: string) => void;
  isHost?: boolean;
}

export const AdventureGuideModal: React.FC<AdventureGuideModalProps> = ({
  isOpen,
  onClose,
  activeStoryVisual = null,
  onShowStoryVisual,
  partyChoices = {},
  onUpdatePartyChoice,
  completedSpotlights = {},
  onToggleSpotlight,
  onSendScriptToChat,
}) => {
  // Continuous scroll mode vs single act tab mode (Default: continuous scroll as requested!)
  const [viewMode, setViewMode] = useState<'continuous' | 'single'>('continuous');
  const [activeActNumber, setActiveActNumber] = useState<number>(1);
  // Script font size control: 'normal' (16px), 'large' (18px - default), 'xl' (21px)
  const [scriptFontSize, setScriptFontSize] = useState<'normal' | 'large' | 'xl'>('large');
  // Local state for custom "Other" text inputs before/while typing
  const [customSurpriseDrafts, setCustomSurpriseDrafts] = useState<Record<string, string>>({});

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const actRefs = useRef<Record<number, HTMLDivElement | null>>({});

  if (!isOpen) return null;

  const getScriptTextClass = () => {
    switch (scriptFontSize) {
      case 'normal':
        return 'text-base leading-relaxed';
      case 'large':
        return 'text-lg leading-relaxed';
      case 'xl':
        return 'text-xl leading-loose';
    }
  };

  const getBodyTextClass = () => {
    switch (scriptFontSize) {
      case 'normal':
        return 'text-sm leading-relaxed';
      case 'large':
        return 'text-[15px] leading-relaxed';
      case 'xl':
        return 'text-base leading-relaxed';
    }
  };

  const getSchoolBadgeStyle = (school: WitcherSchool) => {
    switch (school) {
      case 'Wolf':
        return 'border-amber-500/50 bg-amber-950/30 text-amber-300';
      case 'Cat':
        return 'border-cyan-500/50 bg-cyan-950/30 text-cyan-300';
      case 'Griffin':
        return 'border-purple-500/50 bg-purple-950/30 text-purple-300';
      case 'Bear':
        return 'border-rose-500/50 bg-rose-950/30 text-rose-300';
    }
  };

  const handleJumpToAct = (actNum: number) => {
    setActiveActNumber(actNum);
    if (viewMode === 'continuous') {
      const target = actRefs.current[actNum];
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleSelectChoice = (
    choicePoint: PartyChoicePoint,
    optionId: string,
    customText?: string
  ) => {
    if (!onUpdatePartyChoice) return;
    const existing = partyChoices[choicePoint.id];
    const surpriseText =
      customText !== undefined
        ? customText
        : customSurpriseDrafts[choicePoint.id] ?? existing?.customSurpriseText ?? '';

    onUpdatePartyChoice({
      choicePointId: choicePoint.id,
      actNumber: choicePoint.actNumber,
      selectedOptionId: optionId,
      customSurpriseText: optionId === 'other' ? surpriseText : undefined,
      updatedAt: Date.now(),
    });
  };

  // Compute all active Cause & Effect ripples targeting a specific Act (2, 3, 4, or 5)
  const getRipplesForAct = (
    targetAct: number
  ): {
    sourceAct: number;
    choiceTitle: string;
    selectedLabel: string;
    isCustomOther: boolean;
    customText?: string;
    ripple?: CauseAndEffectRipple;
  }[] => {
    const results: {
      sourceAct: number;
      choiceTitle: string;
      selectedLabel: string;
      isCustomOther: boolean;
      customText?: string;
      ripple?: CauseAndEffectRipple;
    }[] = [];

    const allChoicePoints: PartyChoicePoint[] = [
      ...WITCHER_ADVENTURE.acts.flatMap((a) => a.choicePoints),
      ...WITCHER_ADVENTURE.epilogue.choicePoints,
    ];

    for (const cp of allChoicePoints) {
      if (cp.actNumber >= targetAct) continue;
      const recorded = partyChoices[cp.id];
      if (!recorded) continue;

      if (recorded.selectedOptionId === 'other') {
        // Custom "Other" surprise always ripples forward to keep cause-and-effect alive!
        if (recorded.customSurpriseText && recorded.customSurpriseText.trim()) {
          results.push({
            sourceAct: cp.actNumber,
            choiceTitle: cp.title,
            selectedLabel: 'Custom Party Surprise ("Other")',
            isCustomOther: true,
            customText: recorded.customSurpriseText.trim(),
          });
        }
      } else {
        const opt = cp.options.find((o) => o.id === recorded.selectedOptionId);
        if (opt) {
          const matchingRipples = opt.futureRipples.filter((r) => r.targetAct === targetAct);
          for (const rip of matchingRipples) {
            results.push({
              sourceAct: cp.actNumber,
              choiceTitle: cp.title,
              selectedLabel: opt.label,
              isCustomOther: false,
              ripple: rip,
            });
          }
        }
      }
    }

    return results;
  };

  // Render Story Visual Card with "Show to Players instead of Battle Map" button
  const renderStoryVisualCard = (visual: StoryVisualOverlay) => {
    const isCurrentlyShown = activeStoryVisual?.id === visual.id;

    return (
      <div
        key={visual.id}
        className={`rounded-2xl overflow-hidden border-2 transition-all shadow-2xl ${
          isCurrentlyShown
            ? 'border-emerald-500 ring-2 ring-emerald-500/40 bg-[#121916]'
            : 'border-[#c99a45]/50 bg-[#111316]'
        }`}
      >
        <div className="relative group">
          <img
            src={visual.imageUrl}
            alt={visual.title}
            className="w-full max-h-[380px] object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f12] via-transparent to-black/40" />

          {/* Status Pill Top Left */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-cinzel font-bold uppercase tracking-wider bg-black/80 text-[#e2ba6d] border border-[#c99a45]/50 backdrop-blur-md">
              🎨 Story Visualization • Act {visual.actNumber === 5 ? 'Epilogue' : visual.actNumber}
            </span>
            {isCurrentlyShown && (
              <span className="px-3 py-1 rounded-full text-xs font-cinzel font-bold bg-emerald-600 text-white shadow-lg flex items-center gap-1.5 animate-pulse">
                <Eye className="w-3.5 h-3.5" /> Live on Players&apos; Screen
              </span>
            )}
          </div>

          {/* Title overlay bottom */}
          <div className="absolute bottom-3 left-4 right-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="text-xs font-cinzel text-[#c99a45] font-semibold uppercase tracking-wider">
                {visual.subtitle}
              </div>
              <h4 className="font-cinzel text-lg sm:text-xl font-bold text-white drop-shadow-md">
                {visual.title}
              </h4>
            </div>

            {onShowStoryVisual && (
              <button
                type="button"
                onClick={() => onShowStoryVisual(isCurrentlyShown ? null : visual)}
                className={`px-4 py-2.5 rounded-xl font-cinzel font-bold text-xs sm:text-sm transition-all flex items-center gap-2 shadow-xl shrink-0 ${
                  isCurrentlyShown
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-300'
                    : 'bg-[#c99a45] hover:bg-[#e2ba6d] text-black border border-amber-200'
                }`}
              >
                {isCurrentlyShown ? (
                  <>
                    <MapIcon className="w-4 h-4" />
                    <span>Return Players to Battle Map</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    <span>Show Image to Players (Instead of Battle Map)</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        <div className="px-4 py-3 bg-[#15181c] border-t border-[#262c33] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <p className={`${getBodyTextClass()} text-[#c4ccd4] font-cormorant italic`}>
            {visual.caption}
          </p>
          {isCurrentlyShown && (
            <span className="text-xs font-mono text-emerald-400 shrink-0">
              ✓ Battle Map hidden — Players are viewing this illustration
            </span>
          )}
        </div>
      </div>
    );
  };

  // Render Character-Specific Opportunities Grid
  const renderCharacterOpportunities = (opportunities: CharacterBeatOpportunity[]) => {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-cinzel text-sm sm:text-base font-bold text-[#e2ba6d] uppercase tracking-wider flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-[#c99a45]" />
            <span>Special Witcher School Opportunities (Story Beat Spotlights)</span>
          </h4>
          <span className="text-xs text-[#8a929a]">
            Tailored moments for each Witcher at this point in the story
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {opportunities.map((opp) => {
            const isDone = Boolean(completedSpotlights[opp.id]);
            return (
              <div
                key={opp.id}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                  isDone
                    ? 'bg-emerald-950/20 border-emerald-500/50'
                    : 'bg-[#111316] border-[#2c333b] hover:border-[#c99a45]/50'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-xs font-cinzel font-bold px-2.5 py-0.5 rounded border uppercase ${getSchoolBadgeStyle(
                        opp.school
                      )}`}
                    >
                      School of the {opp.school} • {opp.witcherName}
                    </span>
                    {onToggleSpotlight && (
                      <button
                        type="button"
                        onClick={() => onToggleSpotlight(opp.id)}
                        className={`text-xs font-mono px-2 py-0.5 rounded border transition-colors flex items-center gap-1 ${
                          isDone
                            ? 'bg-emerald-600/30 border-emerald-400 text-emerald-300'
                            : 'bg-[#1a1d21] border-[#343b43] text-[#8a929a] hover:text-white'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isDone ? 'Spotlight Done' : 'Mark Used'}</span>
                      </button>
                    )}
                  </div>

                  <h5 className="font-cinzel text-base font-bold text-white">{opp.beatTitle}</h5>

                  <div className={`${getBodyTextClass()} space-y-1.5 text-[#c4ccd4]`}>
                    <div>
                      <span className="font-semibold text-amber-300">Trigger: </span>
                      {opp.trigger}
                    </div>
                    <div>
                      <span className="font-semibold text-sky-300">Check / Action: </span>
                      <span className="font-mono text-xs bg-black/40 px-1.5 py-0.5 rounded border border-white/10">
                        {opp.checkOrAction}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-emerald-400">Unique Payoff: </span>
                      {opp.uniqueOutcome}
                    </div>
                  </div>
                </div>

                {/* Read-Aloud Spotlight Prompt & Send to Chat */}
                <div className="pt-2 border-t border-white/10 space-y-2">
                  <p className="text-sm text-[#e8e2d5] font-cormorant italic bg-black/40 p-2.5 rounded-lg border border-amber-500/20">
                    &ldquo;{opp.scriptPrompt}&rdquo;
                  </p>
                  {onSendScriptToChat && (
                    <button
                      type="button"
                      onClick={() =>
                        onSendScriptToChat(opp.scriptPrompt, `${opp.school} Witcher Spotlight`)
                      }
                      className="w-full py-1.5 px-3 rounded-lg bg-[#1e2329] hover:bg-[#2a313a] text-[#e2ba6d] border border-[#c99a45]/40 text-xs font-cinzel font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <MessageSquarePlus className="w-3.5 h-3.5" />
                      <span>Send {opp.school} Spotlight Prompt to Chat Log</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render Interactive Party Choice Point (Always includes "Other" for surprises + Cause & Effect)
  const renderChoicePoint = (cp: PartyChoicePoint) => {
    const currentRecord = partyChoices[cp.id];
    const selectedId = currentRecord?.selectedOptionId;
    const selectedPreset = cp.options.find((o) => o.id === selectedId);
    const customDraft =
      customSurpriseDrafts[cp.id] ?? currentRecord?.customSurpriseText ?? '';

    return (
      <div
        key={cp.id}
        className="p-5 rounded-2xl border-2 border-amber-500/40 bg-gradient-to-br from-[#191612] to-[#121417] space-y-4 shadow-xl"
      >
        <div className="flex flex-wrap items-start justify-between gap-2 border-b border-amber-500/20 pb-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-cinzel font-bold text-amber-400 uppercase tracking-wider">
              <GitBranch className="w-4 h-4" />
              <span>Interactive DM Choice Tracker • Cause &amp; Effect Engine</span>
            </div>
            <h4 className="font-cinzel text-lg font-bold text-white mt-0.5">{cp.title}</h4>
          </div>
          {selectedId && (
            <span className="px-2.5 py-1 rounded-full text-xs font-cinzel font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Choice Recorded
            </span>
          )}
        </div>

        <p className={`${getBodyTextClass()} text-[#e2ba6d] font-semibold`}>{cp.promptQuestion}</p>
        <p className="text-xs text-[#9aa3ab]">{cp.contextNote}</p>

        {/* Options Grid (3 Presets + 1 "Other" for Surprises) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {cp.options.map((opt) => {
            const isSelected = selectedId === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelectChoice(cp, opt.id)}
                className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 ${
                  isSelected
                    ? 'bg-amber-950/40 border-[#c99a45] ring-2 ring-[#c99a45]/50 shadow-lg'
                    : 'bg-[#111316] border-[#2b3138] hover:border-[#c99a45]/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-cinzel text-sm font-bold text-white">{opt.label}</span>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-[#c99a45] shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-[#b0b8c0] mt-1 leading-relaxed">{opt.summary}</p>
                </div>

                {opt.futureRipples.length > 0 && (
                  <div className="text-[11px] font-mono text-amber-300/90 bg-black/40 px-2 py-1 rounded border border-amber-500/20">
                    ⚡ Ripples into Act{' '}
                    {opt.futureRipples
                      .map((r) => (r.targetAct === 5 ? 'Epilogue' : r.targetAct))
                      .join(' & ')}
                  </div>
                )}
              </button>
            );
          })}

          {/* ALWAYS INCLUDE "OTHER (PARTY SURPRISE!)" */}
          <div
            onClick={() => {
              if (selectedId !== 'other') {
                handleSelectChoice(cp, 'other');
              }
            }}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
              selectedId === 'other'
                ? 'bg-purple-950/40 border-purple-400 ring-2 ring-purple-400/50 shadow-lg'
                : 'bg-[#111316] border-[#2b3138] hover:border-purple-400/50'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-cinzel text-sm font-bold text-purple-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>Other: Custom Party Surprise!</span>
                </span>
                {selectedId === 'other' && (
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                )}
              </div>
              <p className="text-xs text-[#b0b8c0] mt-1 leading-relaxed">
                {cp.otherSurpriseGuidance}
              </p>
            </div>

            <div className="mt-2" onClick={(e) => e.stopPropagation()}>
              <textarea
                rows={2}
                value={customDraft}
                onChange={(e) => {
                  const val = e.target.value;
                  setCustomSurpriseDrafts((prev) => ({ ...prev, [cp.id]: val }));
                  handleSelectChoice(cp, 'other', val);
                }}
                placeholder="Type what the players unexpectedly did & its consequence..."
                className="w-full bg-black/60 border border-purple-500/40 rounded-lg p-2 text-xs text-white placeholder-[#6c757d] focus:outline-none focus:border-purple-400"
              />
            </div>
          </div>
        </div>

        {/* Display Immediate Outcome & Ripple Preview when selected */}
        {selectedPreset && (
          <div className="p-4 rounded-xl bg-black/50 border border-emerald-500/40 space-y-2 animate-fadeIn">
            <div className="text-xs font-cinzel font-bold text-emerald-400 uppercase tracking-wider">
              ✓ Active Outcome: {selectedPreset.label}
            </div>
            <p className={`${getBodyTextClass()} text-white`}>
              {selectedPreset.immediateOutcome}
            </p>
            {selectedPreset.immediateReadAloud && (
              <div className="p-3 rounded-lg bg-[#1a1814] border border-amber-500/30 mt-2">
                <div className="text-[11px] font-cinzel text-[#e2ba6d] uppercase mb-1">
                  Read-Aloud Consequence Script:
                </div>
                <p className={`${getScriptTextClass()} text-[#f3efe6] font-cormorant italic`}>
                  &ldquo;{selectedPreset.immediateReadAloud}&rdquo;
                </p>
              </div>
            )}
          </div>
        )}

        {selectedId === 'other' && customDraft.trim() && (
          <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/40 space-y-1.5 animate-fadeIn">
            <div className="text-xs font-cinzel font-bold text-purple-300 uppercase tracking-wider">
              ✨ Custom Party Surprise Logged (Will Ripple Across All Subsequent Acts):
            </div>
            <p className={`${getBodyTextClass()} text-white italic`}>&ldquo;{customDraft}&rdquo;</p>
          </div>
        )}
      </div>
    );
  };

  // Render Cause & Effect Banner at the start of an Act
  const renderActCauseAndEffectBanner = (actNum: number) => {
    const ripples = getRipplesForAct(actNum);
    if (ripples.length === 0) return null;

    return (
      <div className="p-4 rounded-2xl border-2 border-emerald-500/50 bg-gradient-to-r from-emerald-950/40 via-[#121816] to-[#121518] space-y-3 shadow-lg">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-cinzel font-bold text-emerald-300 uppercase tracking-wider">
          <Zap className="w-4 h-4 text-emerald-400" />
          <span>
            Active Cause &amp; Effect Ripples in {actNum === 5 ? 'the Epilogue' : `Act ${actNum}`} (From Earlier Party Choices)
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {ripples.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-black/50 border border-emerald-500/30 space-y-1.5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-cinzel text-sm font-bold text-[#e2ba6d]">
                  {item.isCustomOther
                    ? `✨ Custom Surprise from Act ${item.sourceAct}: ${item.choiceTitle}`
                    : `⚡ ${item.ripple?.rippleTitle}`}
                </span>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                  From Act {item.sourceAct}: {item.selectedLabel}
                </span>
              </div>

              {item.isCustomOther ? (
                <p className={`${getBodyTextClass()} text-purple-200`}>
                  <strong className="text-purple-300">DM Surprise Note:</strong> &ldquo;
                  {item.customText}&rdquo; — Weave this unexpected turn directly into the NPCs or monsters of this Act!
                </p>
              ) : (
                item.ripple && (
                  <div className={`${getBodyTextClass()} space-y-1 text-[#d6d9dc]`}>
                    <p>
                      <strong className="text-white">Story Consequence: </strong>
                      {item.ripple.narrativeEffect}
                    </p>
                    <p className="text-emerald-300 font-mono text-xs sm:text-sm">
                      <strong>Mechanical Effect: </strong>
                      {item.ripple.mechanicalEffect}
                    </p>
                  </div>
                )
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render a Complete Act Section
  const renderActSection = (act: AdventureAct) => {
    return (
      <div
        key={act.act}
        ref={(el) => {
          actRefs.current[act.act] = el;
        }}
        className="space-y-6 pb-10 border-b-2 border-[#2a3038] scroll-mt-4"
      >
        {/* Act Title Header */}
        <div className="bg-gradient-to-r from-[#1c2026] to-[#15181c] p-5 rounded-2xl border border-[#38414b] shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs font-cinzel font-bold uppercase tracking-widest text-[#c99a45]">
                Act {act.act} of IV • {act.location}
              </span>
              <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-white mt-0.5">
                {act.title}
              </h3>
            </div>
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-mono text-amber-300 bg-amber-950/50 px-3 py-1.5 rounded-lg border border-amber-500/40">
              <Clock className="w-4 h-4" />
              <span>{act.timeEstimate}</span>
            </div>
          </div>
          <p className={`${getBodyTextClass()} text-[#c4ccd4] mt-3`}>{act.overview}</p>
        </div>

        {/* Active Cause & Effect Ripples from Previous Acts */}
        {renderActCauseAndEffectBanner(act.act)}

        {/* Story Visualization Image(s) with "Show to Players instead of Battle Map" button */}
        {act.storyVisuals.map((vis) => renderStoryVisualCard(vis))}

        {/* Primary Opening Read-Aloud Script Box (Larger, High-Contrast Font) */}
        <div className="p-5 sm:p-6 rounded-2xl border-2 border-[#c99a45]/60 bg-gradient-to-br from-[#1d1912] via-[#161410] to-[#12110e] shadow-2xl space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#c99a45]/30 pb-2.5">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-cinzel font-bold text-[#e2ba6d] uppercase tracking-wider">
              <Scroll className="w-4 h-4 text-[#c99a45]" />
              <span>DM Read-Aloud Script • Opening Narration (Act {act.act})</span>
            </div>
            {onSendScriptToChat && (
              <button
                type="button"
                onClick={() => onSendScriptToChat(act.readAloud, `${act.title} — Narration`)}
                className="px-3 py-1 rounded-lg bg-[#c99a45]/20 hover:bg-[#c99a45]/30 text-[#e2ba6d] border border-[#c99a45]/40 text-xs font-cinzel font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post Narration to Party Chat</span>
              </button>
            )}
          </div>

          <div
            className={`${getScriptTextClass()} text-[#f5f0e6] font-cormorant italic whitespace-pre-line tracking-wide`}
          >
            {act.readAloud}
          </div>
        </div>

        {/* Detailed Sequential Story Beats */}
        <div className="space-y-4">
          <h4 className="font-cinzel text-sm sm:text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#c99a45]" />
            <span>Act {act.act} Sequential Story Beats &amp; Script Dialogue</span>
          </h4>

          <div className="grid grid-cols-1 gap-4">
            {act.storyBeats.map((beat) => (
              <div
                key={beat.id}
                className="p-5 rounded-xl bg-[#111316] border border-[#2a3038] space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-[#c99a45]/20 text-[#e2ba6d] border border-[#c99a45]/40 font-cinzel font-bold text-xs">
                      {beat.beatNumber}
                    </span>
                    <h5 className="font-cinzel text-base sm:text-lg font-bold text-white">
                      {beat.title}
                    </h5>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#8a929a]">{beat.timeMarker}</span>
                    {onSendScriptToChat && (
                      <button
                        type="button"
                        onClick={() => onSendScriptToChat(beat.readAloudScript, beat.title)}
                        className="px-2.5 py-1 rounded bg-[#1d2228] hover:bg-[#272e36] text-[#e2ba6d] border border-[#363f49] text-xs font-cinzel flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" />
                        <span>Send Script</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Beat Read-Aloud Script */}
                <div
                  className={`${getScriptTextClass()} p-4 rounded-xl bg-[#181612] border-l-4 border-[#c99a45] text-[#f3efe6] font-cormorant italic whitespace-pre-line`}
                >
                  {beat.readAloudScript}
                </div>

                {/* NPC & Running Notes */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-xs font-cinzel font-bold text-amber-400 uppercase">
                    DM Roleplay &amp; Scene Direction:
                  </div>
                  <ul className={`${getBodyTextClass()} text-[#b8c0c8] space-y-1 list-disc list-inside`}>
                    {beat.npcRoleplayNotes.map((note, idx) => (
                      <li key={idx}>{note}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Character-Specific Opportunities for this Act */}
        {renderCharacterOpportunities(act.characterOpportunities)}

        {/* Witcher Senses & Investigation DCs */}
        <div>
          <h4 className="font-cinzel text-sm sm:text-base font-bold text-white uppercase tracking-wider mb-2.5">
            Witcher Senses &amp; Investigation DCs (Act {act.act})
          </h4>
          <div className="border border-[#2b3138] rounded-xl overflow-hidden">
            <table className={`w-full text-left ${getBodyTextClass()}`}>
              <thead className="bg-[#101214] text-[#a6b1b9] font-cinzel border-b border-[#2b3138] text-xs uppercase">
                <tr>
                  <th className="p-3">Check / Skill</th>
                  <th className="p-3 w-20">DC</th>
                  <th className="p-3">Clue &amp; Consequence Discovered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2226] bg-[#141619]">
                {act.investigationDCs.map((dc, i) => (
                  <tr key={i} className="hover:bg-[#1a1d22]">
                    <td className="p-3 font-semibold text-white">{dc.check}</td>
                    <td className="p-3 font-mono text-[#c99a45] font-bold">DC {dc.dc}</td>
                    <td className="p-3 text-[#c4ccd4]">{dc.result}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Interactive Party Decision Point(s) for Cause & Effect */}
        <div className="space-y-4">
          {act.choicePoints.map((cp) => renderChoicePoint(cp))}
        </div>

        {/* GM Pacing & Tactical Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[#111315] border border-[#262b31]">
            <div className="font-cinzel text-xs sm:text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>GM Pacing &amp; Encounters</span>
            </div>
            <ul className={`${getBodyTextClass()} text-[#b0b8c0] space-y-2 list-disc list-inside`}>
              {act.dmPrompts.map((prompt, i) => (
                <li key={i}>{prompt}</li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-[#111315] border border-[#262b31]">
            <div className="font-cinzel text-xs sm:text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Tactical Synergies &amp; Combat Flow</span>
            </div>
            <p className={`${getBodyTextClass()} text-[#b0b8c0]`}>{act.tacticalAdvice}</p>
          </div>
        </div>
      </div>
    );
  };

  // Render Epilogue Section
  const renderEpilogueSection = () => {
    const ep = WITCHER_ADVENTURE.epilogue;
    return (
      <div
        ref={(el) => {
          actRefs.current[5] = el;
        }}
        className="space-y-6 pb-8 scroll-mt-4"
      >
        <div className="bg-gradient-to-r from-[#231d14] to-[#16181c] p-5 rounded-2xl border border-[#c99a45]/50 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-xs font-cinzel font-bold uppercase tracking-widest text-[#c99a45]">
                Final Reckoning • {ep.location}
              </span>
              <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-white mt-0.5">
                {ep.title}
              </h3>
            </div>
            <span className="text-xs sm:text-sm font-mono text-amber-300 bg-amber-950/50 px-3 py-1.5 rounded-lg border border-amber-500/40">
              {ep.timeEstimate}
            </span>
          </div>
          <p className={`${getBodyTextClass()} text-[#c4ccd4] mt-3`}>{ep.overview}</p>
        </div>

        {/* All Cumulative Cause & Effect Ripples Converging in the Epilogue */}
        {renderActCauseAndEffectBanner(5)}

        {/* Epilogue Story Visual */}
        {ep.storyVisuals.map((vis) => renderStoryVisualCard(vis))}

        {/* Epilogue Read-Aloud Script */}
        <div className="p-5 sm:p-6 rounded-2xl border-2 border-[#c99a45]/60 bg-gradient-to-br from-[#1d1912] via-[#161410] to-[#12110e] shadow-2xl space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#c99a45]/30 pb-2.5">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-cinzel font-bold text-[#e2ba6d] uppercase tracking-wider">
              <Scroll className="w-4 h-4 text-[#c99a45]" />
              <span>DM Read-Aloud Script • Epilogue in Castle Marnadal</span>
            </div>
            {onSendScriptToChat && (
              <button
                type="button"
                onClick={() => onSendScriptToChat(ep.readAloud, 'Epilogue — Castle Marnadal')}
                className="px-3 py-1 rounded-lg bg-[#c99a45]/20 hover:bg-[#c99a45]/30 text-[#e2ba6d] border border-[#c99a45]/40 text-xs font-cinzel font-semibold flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post Narration to Party Chat</span>
              </button>
            )}
          </div>
          <div
            className={`${getScriptTextClass()} text-[#f5f0e6] font-cormorant italic whitespace-pre-line tracking-wide`}
          >
            {ep.readAloud}
          </div>
        </div>

        {/* Epilogue Character Opportunities */}
        {renderCharacterOpportunities(ep.characterOpportunities)}

        {/* Final Ending Interactive Choice */}
        {ep.choicePoints.map((cp) => renderChoicePoint(cp))}
      </div>
    );
  };

  const singleActObj =
    WITCHER_ADVENTURE.acts.find((a) => a.act === activeActNumber) || WITCHER_ADVENTURE.acts[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#131517] border border-[#3b4249] rounded-2xl max-w-6xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Header with Font Size & Scroll Mode Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-[#282d33] bg-[#181b1e]">
          <div className="flex items-center gap-2.5">
            <Scroll className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <h2 className="font-cinzel text-base sm:text-lg font-bold text-white tracking-wide">
                {WITCHER_ADVENTURE.title}: {WITCHER_ADVENTURE.subtitle}
              </h2>
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#9aa3ab] font-cormorant">
                <span className="flex items-center gap-1 text-amber-300 font-semibold">
                  <Clock className="w-3.5 h-3.5" /> {WITCHER_ADVENTURE.estimatedPlaytime}
                </span>
                <span>•</span>
                <span>Cause &amp; Effect Interactive DM Campaign</span>
              </div>
            </div>
          </div>

          {/* Right Controls: Script Font Size, Scroll Mode, Active Visual Indicator, Close */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Active Story Visual Banner Reset */}
            {activeStoryVisual && onShowStoryVisual && (
              <button
                type="button"
                onClick={() => onShowStoryVisual(null)}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-cinzel font-bold flex items-center gap-1.5 shadow-md"
                title="Switch players back to the Tactical Battle Map"
              >
                <EyeOff className="w-3.5 h-3.5" />
                <span>Hide Story Visual (Return to Battle Map)</span>
              </button>
            )}

            {/* Font Size Toggle */}
            <div className="flex items-center bg-[#101214] p-0.5 rounded-lg border border-[#2c333a]">
              <span className="px-2 text-[11px] text-[#8a929a] flex items-center gap-1 font-cinzel">
                <Type className="w-3.5 h-3.5 text-[#c99a45]" /> Script Size:
              </span>
              {(['normal', 'large', 'xl'] as const).map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setScriptFontSize(sz)}
                  className={`px-2 py-1 rounded text-xs font-cinzel font-bold transition-colors ${
                    scriptFontSize === sz
                      ? 'bg-[#c99a45] text-black'
                      : 'text-[#8a929a] hover:text-white'
                  }`}
                >
                  {sz === 'normal' ? 'A' : sz === 'large' ? 'A+' : 'A++'}
                </button>
              ))}
            </div>

            {/* Continuous Scroll vs Single Act Toggle */}
            <button
              type="button"
              onClick={() => setViewMode(viewMode === 'continuous' ? 'single' : 'continuous')}
              className="px-3 py-1.5 rounded-lg bg-[#1d2228] hover:bg-[#262d35] text-xs font-cinzel text-[#e2ba6d] border border-[#343c46] transition-colors"
            >
              {viewMode === 'continuous' ? '📜 Mode: Full Page Scroll' : '📑 Mode: Single Act Tab'}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-md text-[#8a929a] hover:text-white hover:bg-[#282e34] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sticky Act Jump Bar */}
        <div className="flex items-center justify-between border-b border-[#282d33] bg-[#101214] px-4 overflow-x-auto shrink-0">
          <div className="flex items-center">
            {WITCHER_ADVENTURE.acts.map((act) => (
              <button
                key={act.act}
                type="button"
                onClick={() => handleJumpToAct(act.act)}
                className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-cinzel border-b-2 transition-all whitespace-nowrap ${
                  activeActNumber === act.act
                    ? 'border-[#c99a45] text-[#c99a45] font-bold bg-[#171a1d]'
                    : 'border-transparent text-[#9aa3ab] hover:text-white'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>
                  Act {act.act}: {act.title.split(':')[1] || act.title}
                </span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleJumpToAct(5)}
              className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-cinzel border-b-2 transition-all whitespace-nowrap ${
                activeActNumber === 5
                  ? 'border-[#c99a45] text-[#c99a45] font-bold bg-[#171a1d]'
                  : 'border-transparent text-[#9aa3ab] hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Epilogue: Castle Marnadal</span>
            </button>
          </div>
        </div>

        {/* Scrollable Module Body */}
        <div
          ref={scrollContainerRef}
          className="p-5 sm:p-7 overflow-y-auto space-y-10 flex-1 bg-[#141619]"
        >
          {viewMode === 'continuous' ? (
            <>
              {/* Setting Lore Overview */}
              <div className="p-4 rounded-xl bg-[#101215] border border-[#282e36] space-y-2">
                <div className="text-xs font-cinzel font-bold text-[#c99a45] uppercase tracking-wider">
                  Campaign Setting Lore • Cintra, 1184
                </div>
                <p className={`${getBodyTextClass()} text-[#b8c0c8] whitespace-pre-line`}>
                  {WITCHER_ADVENTURE.settingLore}
                </p>
              </div>

              {/* Render All 4 Acts + Epilogue in one continuous scrollable DM page */}
              {WITCHER_ADVENTURE.acts.map((act) => renderActSection(act))}
              {renderEpilogueSection()}
            </>
          ) : activeActNumber <= 4 ? (
            renderActSection(singleActObj)
          ) : (
            renderEpilogueSection()
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#15171a] border-t border-[#262b30] flex flex-wrap items-center justify-between gap-2 shrink-0">
          <span className="text-xs text-[#9aa3ab] font-cormorant italic">
            💡 DM Tip: Click any choice (or type in &ldquo;Other&rdquo;) as your party plays—subsequent Acts will automatically update with Cause &amp; Effect consequences!
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-[#252b31] hover:bg-[#323942] text-white rounded font-cinzel text-xs"
          >
            Close Module Guide
          </button>
        </div>
      </div>
    </div>
  );
};
