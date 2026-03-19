
import { 
  Droplets, Scissors, Zap, MessageSquareText, 
  Upload, Trash2, Image as ImageIcon, Pipette, ChevronDown, ChevronRight, 
  Scan, Eye, Brush, Sparkles, Wand2, HelpCircle, X, RotateCcw,
  Split, Palette, Lock, Users, Check, Undo2, MousePointer2, Plus, Save, Bookmark
} from 'lucide-react';
import React, { useRef, useCallback, useState, useMemo } from 'react';
import { BeautyState, CustomPreset } from '../types';
import { 
  SKIN_TONES, SKIN_TEXTURES, HAIR_COLOR_PRESETS, MAKEUP_PRESETS,
  HAIR_LENGTHS, HAIR_TEXTURES, BANG_STYLES,
  MALE_HAIR_LENGTHS, MALE_HAIR_TEXTURES, MALE_BANG_STYLES,
  EYEBROW_STYLES, EYELINER_STYLES, EYELASH_STYLES, BLUSH_STYLES, LIP_STYLES,
  MAKEUP_STYLES, HELP_CONTENT, FOUNDATION_SHADES, FOUNDATION_CATEGORIES, LENS_STYLES
} from '../constants';

interface SidebarProps {
  state: BeautyState;
  updateState: (updates: Partial<BeautyState>) => void;
  onRefUpload: (type: keyof BeautyState['referenceImages'] | 'base') => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResetCategory: (category: 'face' | 'skin' | 'hair' | 'makeup') => void;
}

const PRESET_DEFAULTS: Record<string, any> = {
  'Luminous Glass': { 
    eyelinerStyle: 'tightline', 
    eyelashStyle: 'natural', 
    blushStyle: 'none', 
    lipStyle: 'glossy_tanghulu', 
    eyeshadowColor: '#f5deb3', 
    lipColor: '#d6b6a0',
    blushIntensity: 10,
    lipstickGloss: 90
  },
  'Office Siren': { 
    eyelinerStyle: 'siren', 
    eyelashStyle: 'mascara', 
    blushStyle: 'side', 
    lipStyle: 'matte_blur', 
    eyeshadowColor: '#d2b48c', 
    lipColor: '#9b7653',
    contourIntensity: 60,
    eyelinerIntensity: 80
  },
  'Sunset Gradient': { 
    eyelinerStyle: 'classic', 
    eyelashStyle: 'mascara', 
    blushStyle: 'drunken', 
    lipStyle: 'gradient', 
    eyeshadowColor: '#fb923c', 
    lipColor: '#fb923c',
    blushIntensity: 60,
    blushColor: '#fdba74'
  },
  'Coquette Doll': { 
    eyelinerStyle: 'puppy', 
    eyelashStyle: 'idol', 
    blushStyle: 'apples', 
    lipStyle: 'glossy_tanghulu', 
    eyeshadowColor: '#ffb6c1', 
    lipColor: '#db2777',
    blushIntensity: 70,
    blushColor: '#f472b6'
  },
  'Cyber Mauve': { 
    eyelinerStyle: 'bold', 
    eyelashStyle: 'volume', 
    blushStyle: 'side', 
    lipStyle: 'matte_blur', 
    eyeshadowColor: '#bca0dc', 
    lipColor: '#a855f7',
    contourIntensity: 40,
    eyelinerIntensity: 90
  },
  'Monochrome Peach': { 
    eyelinerStyle: 'tightline', 
    eyelashStyle: 'mascara', 
    blushStyle: 'apples', 
    lipStyle: 'mlbb', 
    eyeshadowColor: '#e0ac9d', 
    lipColor: '#fb923c',
    blushColor: '#fca5a5',
    blushIntensity: 40
  }
};

const StyleSelector = ({ options, selectedId, onSelect, cols = 2 }: { options: { id: string, label: string }[], selectedId: string, onSelect: (id: string) => void, cols?: number }) => {
  return (
    <div className={`grid grid-cols-${cols} gap-1.5`}>
      {options.map(opt => (
        <button key={opt.id} onClick={() => onSelect(opt.id)} className={`relative p-2 rounded-xl text-left transition-all group overflow-hidden border ${selectedId === opt.id ? 'bg-zinc-800 border-indigo-500 shadow-md shadow-indigo-500/10' : 'bg-zinc-900/40 border-zinc-800/50 hover:bg-zinc-800 hover:border-zinc-700'}`}>
          {selectedId === opt.id && <div className="absolute top-0 right-0 w-2 h-2 bg-indigo-500 rounded-bl-lg" />}
          <div className="flex flex-col gap-1"><span className={`text-[10px] font-bold leading-tight ${selectedId === opt.id ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-300'}`}>{opt.label}</span></div>
        </button>
      ))}
    </div>
  );
};

const SubSection = ({ title, defaultOpen = true, children }: { title: string, defaultOpen?: boolean, children?: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border border-zinc-800/50 rounded-xl bg-zinc-900/20 overflow-hidden mb-2">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-3 hover:bg-zinc-800/30 transition-colors">
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">{isOpen ? <ChevronDown className="w-3 h-3 text-zinc-600" /> : <ChevronRight className="w-3 h-3 text-zinc-600" />}{title}</span>
      </button>
      {isOpen && <div className="p-3 pt-0 border-t border-zinc-800/30 animate-in slide-in-from-top-1 duration-200"><div className="pt-3 space-y-4">{children}</div></div>}
    </div>
  );
};

const CategoryAccordion = ({ title, icon: Icon, children, defaultOpen = true, onOpenHelp, onReset }: { title: string, icon: any, children: React.ReactNode, defaultOpen?: boolean, onOpenHelp?: () => void, onReset?: () => void }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-zinc-900 last:border-0 bg-zinc-950/30">
      <div className="flex items-center group pr-3">
        <button onClick={() => setIsOpen(!isOpen)} className="flex-1 flex items-center justify-between py-4 text-left hover:bg-zinc-900/30 px-4 transition-all">
          <div className="flex items-center gap-3"><div className={`p-1.5 rounded-lg transition-colors ${isOpen ? 'bg-indigo-500/10 text-indigo-400' : 'bg-zinc-900 text-zinc-500'}`}><Icon className="w-3.5 h-3.5" /></div><span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${isOpen ? 'text-zinc-200' : 'text-zinc-500 group-hover:text-zinc-300'}`}>{title}</span></div>
          {isOpen ? <ChevronDown className="w-3 h-3 text-zinc-600" /> : <ChevronRight className="w-3 h-3 text-zinc-600" />}
        </button>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onReset && <button onClick={(e) => { e.stopPropagation(); onReset(); }} className="p-1.5 rounded-full text-zinc-600 hover:text-indigo-400 hover:bg-zinc-800 transition-all" title="분석 수치로 초기화"><RotateCcw className="w-3.5 h-3.5" /></button>}
          {onOpenHelp && <button onClick={(e) => { e.stopPropagation(); onOpenHelp(); }} className="p-1.5 rounded-full text-zinc-600 hover:text-rose-400 hover:bg-zinc-800 transition-all" title="도움말 보기"><HelpCircle className="w-3.5 h-3.5" /></button>}
        </div>
      </div>
      {isOpen && <div className="px-4 pb-6 animate-in fade-in slide-in-from-top-1 duration-200">{children}</div>}
    </div>
  );
};

const ColorSection = React.memo(({ label, id, presets, colorValue, disabled, onColorChange }: { label: string, id: string, presets: { color: string, label: string }[], colorValue: string, disabled: boolean, onColorChange: (id: string, value: string) => void }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const handlePickerClick = () => { if (!disabled && inputRef.current) inputRef.current.click(); };
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center"><span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{label}</span><div className="flex items-center gap-2"><span className="text-[8px] font-mono text-zinc-600 uppercase">{colorValue}</span><div onClick={handlePickerClick} className={`relative cursor-pointer group w-5 h-5 rounded-md border border-zinc-700 overflow-hidden shadow-inner flex items-center justify-center transition-all ${disabled ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:border-indigo-500 hover:scale-105 active:scale-95'}`}><div className="w-full h-full" style={{ backgroundColor: colorValue }} /><Pipette className="w-2.5 h-2.5 text-white absolute mix-blend-difference opacity-0 group-hover:opacity-100 transition-opacity" /><input ref={inputRef} type="color" className="absolute inset-0 opacity-0 pointer-events-none w-0 h-0" value={colorValue} disabled={disabled} onInput={(e) => onColorChange(id, (e.target as HTMLInputElement).value)} onChange={(e) => onColorChange(id, (e.target as HTMLInputElement).value)} /></div></div></div>
      <div className="flex flex-wrap gap-1 p-1.5 bg-black/20 rounded-xl border border-zinc-800/30">{presets.map((p, idx: number) => (<button key={idx} disabled={disabled} onClick={() => onColorChange(id, p.color)} className={`w-5 h-5 rounded-md border transition-all ${colorValue === p.color ? 'border-indigo-500 scale-110 shadow-lg shadow-indigo-500/20' : 'border-transparent hover:border-zinc-700'}`} style={{ backgroundColor: p.color }} title={p.label} />))}</div>
    </div>
  );
});

export const StudioSidebar: React.FC<SidebarProps> = ({ state, updateState, onRefUpload, onResetCategory }) => {
  const [activeHelpId, setActiveHelpId] = useState<keyof typeof HELP_CONTENT | null>(null);
  const [isMultiMode, setIsMultiMode] = useState(false);
  const [activeFoundationCategory, setActiveFoundationCategory] = useState<string>('asian');
  const [isCustomFoundation, setIsCustomFoundation] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const filteredShades = useMemo(() => {
    return FOUNDATION_SHADES.filter(s => s.category === activeFoundationCategory);
  }, [activeFoundationCategory]);

  const handlePresetChange = (presetId: string) => {
    let defaults: any = null;
    
    // Check standard presets
    if (PRESET_DEFAULTS[presetId]) {
      defaults = PRESET_DEFAULTS[presetId];
    } 
    // Check user custom presets
    else {
      const custom = state.customMakeupPresets.find(p => p.id === presetId);
      if (custom) {
        defaults = custom.config;
      }
    }
    
    updateState({ makeup: { ...state.makeup, makeupStyle: presetId, ...(defaults || {}) } });
  };

  const handleSaveCustomPreset = () => {
    if (!newPresetName.trim()) return;
    
    setSaveStatus('saving');
    
    // Copy current makeup config (except style ID)
    const { makeupStyle, ...config } = state.makeup;
    const newPreset: CustomPreset = {
      id: `custom_${Date.now()}`,
      name: newPresetName.trim(),
      config: config
    };
    
    updateState({ 
      customMakeupPresets: [...state.customMakeupPresets, newPreset],
      makeup: { ...state.makeup, makeupStyle: newPreset.id }
    });
    
    setNewPresetName('');
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const handleDeletePreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = state.customMakeupPresets.filter(p => p.id !== id);
    updateState({ customMakeupPresets: updated });
  };

  const handleFeatureChange = useCallback((key: string, value: number | string) => { updateState({ features: { ...state.features, [key]: value } }); }, [state.features, updateState]);
  
  const handleMakeupChange = useCallback((id: string, value: string | number) => { 
    const newUpdates: Partial<BeautyState['makeup']> = { [id]: value };
    // If not standard 'Custom Look' and not choosing a preset, switch to manual mode
    if (id !== 'makeupStyle' && !state.makeup.makeupStyle.includes('custom_') && state.makeup.makeupStyle !== 'Custom Look') {
      newUpdates.makeupStyle = 'Custom Look';
    }
    updateState({ makeup: { ...state.makeup, ...newUpdates } }); 
  }, [state.makeup, updateState]);
  
  const handleHairChange = useCallback((id: string, value: string | number | boolean) => { 
    const hairUpdates: Partial<BeautyState['hair']> = { [id]: value };
    
    // Logic for single tone hair color synchronization
    if (!state.hair.isGradient && (id === 'hairColorTop' || id === 'hairColorBottom')) {
      hairUpdates.hairColorTop = value as string;
      hairUpdates.hairColorBottom = value as string;
    }
    
    // Logic for toggling gradient mode
    if (id === 'isGradient' && value === false) {
      hairUpdates.hairColorBottom = state.hair.hairColorTop;
    }

    updateState({ hair: { ...state.hair, ...hairUpdates } }); 
  }, [state.hair, updateState]);

  const handleSkinChange = useCallback((id: string, value: string | number | string[]) => { updateState({ skin: { ...state.skin, [id]: value } }); }, [state.skin, updateState]);
  const handleCustomPromptChange = useCallback((category: keyof BeautyState['customPrompts'], value: string) => { updateState({ customPrompts: { ...state.customPrompts, [category]: value } }); }, [state.customPrompts, updateState]);
  
  const handleSkinToneChange = useCallback((id: string) => { handleSkinChange('tone', id); }, [handleSkinChange]);

  const toggleEditMode = (mode: keyof BeautyState['editModes']) => {
    if (isMultiMode) updateState({ editModes: { ...state.editModes, [mode]: !state.editModes[mode] } });
    else updateState({ editModes: { face: false, skin: false, hair: false, makeup: false, [mode]: true } });
  };

  const renderRefUploader = (category: 'face' | 'skin' | 'hair' | 'makeup', label: string) => (
    <div className="space-y-3 pt-4 border-t border-zinc-900">
      <div className="flex items-center justify-between text-zinc-500">
        <div className="flex items-center gap-2"><ImageIcon className="w-3 h-3" /><span className="text-[10px] font-bold uppercase tracking-widest">{label} Ref</span></div>
        {state.referenceImages[category] && <button onClick={() => updateState({ referenceImages: { ...state.referenceImages, [category]: null }})} className="text-zinc-600 hover:text-red-400"><Trash2 className="w-3 h-3" /></button>}
      </div>
      <div className={`relative aspect-video bg-zinc-900/50 border border-dashed border-zinc-800 rounded-xl overflow-hidden flex items-center justify-center hover:bg-zinc-900 transition-colors group ${state.referenceImages[category] ? 'border-indigo-500/50' : ''}`}>
        {state.referenceImages[category] ? (
          <>
            <img src={state.referenceImages[category]!} className="w-full h-full object-contain opacity-50 group-hover:opacity-100 transition-opacity" alt="Reference" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-[10px] font-bold text-white bg-black/50 px-2 py-1 rounded-full backdrop-blur-sm">Reference Active</span>
            </div>
          </>
        ) : (
          <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center gap-2">
            <Upload className="w-4 h-4 text-zinc-600 group-hover:text-indigo-400" />
            <input type="file" className="hidden" accept="image/*" onChange={onRefUpload(category)} />
          </label>
        )}
      </div>
    </div>
  );

  const LockOverlay = ({ category }: { category: string }) => (
    <div className="absolute inset-0 z-10 bg-zinc-950/60 backdrop-blur-[1px] flex flex-col items-center justify-center text-center p-6 space-y-3 animate-in fade-in duration-300">
      <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
        <Lock className="w-4 h-4 text-zinc-500" />
      </div>
      <div>
        <h4 className="text-xs font-bold text-zinc-300">Controls Locked</h4>
        <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed">Reference image is active.<br/>AI will follow the image exclusively.</p>
      </div>
    </div>
  );

  const hasActiveModes = Object.values(state.editModes).some(v => v);

  return (
    <aside className="relative w-[340px] border-r border-zinc-900 bg-zinc-950 flex flex-col h-full z-50 shadow-2xl">
      {/* Help Panel */}
      <div className={`fixed top-0 bottom-0 w-[320px] bg-[#1a1a1a] border-r border-[#333] shadow-2xl z-40 overflow-y-auto p-6 transition-all duration-300 ease-in-out ${activeHelpId ? 'translate-x-0 opacity-100 pointer-events-auto' : '-translate-x-10 opacity-0 pointer-events-none'}`} style={{ left: '340px' }}>
        <div className="flex items-center justify-between mb-6"><h3 className="text-lg font-bold text-rose-400">{activeHelpId && HELP_CONTENT[activeHelpId].title}</h3><button onClick={() => setActiveHelpId(null)} className="p-1 rounded-full hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors"><X className="w-4 h-4" /></button></div>
        <div className="h-px bg-rose-400/20 mb-6" /><p className="text-[13px] text-zinc-300 leading-relaxed whitespace-pre-wrap font-medium">{activeHelpId && HELP_CONTENT[activeHelpId].desc}</p>
      </div>

      <div className="p-4 border-b border-zinc-900 bg-zinc-950 flex justify-center">
        <div className="flex bg-zinc-900 rounded-full p-1 w-full max-w-[240px]">
          <button
            onClick={() => updateState({ gender: 'female' })}
            className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-full transition-all ${state.gender === 'female' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            Female
          </button>
          <button
            onClick={() => updateState({ gender: 'male' })}
            className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-full transition-all ${state.gender === 'male' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            Male
          </button>
        </div>
      </div>

      <div className="p-6 border-b border-zinc-900 bg-black/40">
        <div className="flex items-center justify-between mb-4"><div className="flex items-center gap-2"><Zap className="w-4 h-4 text-indigo-500" /><h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-300">Expert Edit Modes</h3></div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => setIsMultiMode(!isMultiMode)}><span className={`text-[9px] font-bold uppercase transition-colors ${isMultiMode ? 'text-indigo-400' : 'text-zinc-600'}`}>Multi</span><div className={`w-7 h-3.5 rounded-full p-0.5 transition-colors relative ${isMultiMode ? 'bg-indigo-600' : 'bg-zinc-800'}`}><div className={`w-2.5 h-2.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${isMultiMode ? 'translate-x-3.5' : 'translate-x-0'}`} /></div></div>
            {hasActiveModes && <button onClick={() => updateState({ editModes: { face: false, skin: false, hair: false, makeup: false }})} className="text-[9px] font-bold text-zinc-600 hover:text-zinc-400 uppercase">Reset</button>}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">{[{ id: 'skin', label: 'Skin', icon: Droplets }, { id: 'face', label: 'Face', icon: Scan }, { id: 'hair', label: 'Hair', icon: Scissors }, { id: 'makeup', label: 'Makeup', icon: Brush }].map((mode) => { const isActive = state.editModes[mode.id as keyof BeautyState['editModes']]; return <button key={mode.id} onClick={() => toggleEditMode(mode.id as any)} className={`flex flex-col items-center justify-center gap-1.5 px-3 py-3 rounded-2xl border text-[10px] font-bold transition-all ${isActive ? 'bg-rose-500/10 border-rose-400/50 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.1)]' : 'bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:border-zinc-700 active:scale-95'}`}><mode.icon className={`w-4 h-4 ${isActive ? 'text-rose-400' : 'text-zinc-600'}`} />{mode.label}</button>; })}</div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar bg-zinc-950">
        {!hasActiveModes ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center gap-4 animate-in fade-in duration-500"><div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center"><Wand2 className="w-6 h-6 text-zinc-700" /></div><div className="space-y-1"><h4 className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Auto-Enhance Mode</h4><p className="text-[11px] text-zinc-600 leading-relaxed px-4">Select specific categories above for targeted editing, or click <b>Generate</b> now for a full professional makeover.</p></div></div>
        ) : (
          <div className="animate-in slide-in-from-bottom-2 duration-300">
            {state.editModes.skin && (
              <CategoryAccordion title="Skin & Base" icon={Droplets} onOpenHelp={() => setActiveHelpId('skin')} onReset={() => onResetCategory('skin')}>
                <div className="relative">
                  {state.referenceImages.skin && <LockOverlay category="Skin" />}
                  <div className={state.referenceImages.skin ? 'opacity-20 pointer-events-none filter blur-[1px]' : ''}>
                    <SubSection title="Base Tone & Age" defaultOpen={true}>
                      <div className="space-y-3"><div className="flex flex-wrap gap-2">{SKIN_TONES.map(tone => (<button key={tone.id} onClick={() => handleSkinToneChange(tone.id)} className={`relative w-8 h-8 rounded-full border-2 transition-all ${state.skin.tone === tone.id ? 'border-rose-400 scale-110 shadow-lg' : 'border-zinc-800'}`} style={{ backgroundColor: tone.color }} title={tone.label} />))}</div><div className="space-y-2"><div className="flex justify-between text-[10px] font-bold"><span className="text-zinc-500">Skin Age</span><span className="text-rose-400">{state.skin.skinAge}</span></div><input type="range" min="0" max="100" value={state.skin.skinAge} onChange={(e) => handleSkinChange('skinAge', parseInt(e.target.value))} className="w-full accent-rose-500 h-1 bg-zinc-900 rounded-full appearance-none cursor-pointer" /></div></div>
                    </SubSection>
                    <SubSection title="Texture & Quality" defaultOpen={false}>
                      <div className="space-y-4"><div className="space-y-2"><div className="flex justify-between text-[10px] font-bold"><span className="text-zinc-500">Glow (Matte/Oily)</span><span className="text-rose-400">{state.skin.glowIntensity}</span></div><input type="range" min="0" max="100" value={state.skin.glowIntensity} onChange={(e) => handleSkinChange('glowIntensity', parseInt(e.target.value))} className="w-full accent-rose-500 h-1 bg-zinc-900 rounded-full appearance-none cursor-pointer" /></div><div className="space-y-2"><div className="flex justify-between text-[10px] font-bold"><span className="text-zinc-500">Natural Blemishes</span><span className="text-rose-400">{state.skin.blemishIntensity}</span></div><input type="range" min="0" max="100" value={state.skin.blemishIntensity} onChange={(e) => handleSkinChange('blemishIntensity', parseInt(e.target.value))} className="w-full accent-rose-500 h-1 bg-zinc-900 rounded-full appearance-none cursor-pointer" /></div><StyleSelector options={SKIN_TEXTURES} selectedId={state.skin.texture[0] || 'Smooth'} onSelect={(id) => handleSkinChange('texture', [id])} cols={2} /></div>
                    </SubSection>
                  </div>
                </div>
                {renderRefUploader('skin', 'Skin')}
              </CategoryAccordion>
            )}

            {state.editModes.face && (
              <CategoryAccordion title="Face & Eyes Sculpting" icon={Eye} onOpenHelp={() => setActiveHelpId('face')} onReset={() => onResetCategory('face')}>
                <div className="relative">
                  {state.referenceImages.face && <LockOverlay category="Face" />}
                  <div className={state.referenceImages.face ? 'opacity-20 pointer-events-none filter blur-[1px]' : ''}>
                    <SubSection title="Eyes & Brows" defaultOpen={true}>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-[10px] font-bold"><span className="text-zinc-500">Forehead Height</span><span className="text-indigo-400">{state.features.foreheadHeight}</span></div>
                          <input type="range" min="0" max="100" value={state.features.foreheadHeight} onChange={(e) => handleFeatureChange('foreheadHeight', parseInt(e.target.value))} className="w-full accent-indigo-500 h-1 bg-zinc-900 rounded-full appearance-none cursor-pointer" />
                        </div>
                        <div className="space-y-2"><span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Eyebrow Style</span><StyleSelector options={EYEBROW_STYLES} selectedId={state.makeup.eyebrowStyle} onSelect={(id) => handleMakeupChange('eyebrowStyle', id)} /></div>
                        <div className="space-y-2"><span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Eyelid Type</span><div className="grid grid-cols-3 gap-1">{['Monolid', 'Double', 'Hooded'].map(type => (<button key={type} onClick={() => handleFeatureChange('eyelidType', type)} className={`py-2 rounded-lg text-[9px] font-bold border transition-all ${state.features.eyelidType === type ? 'bg-indigo-500/20 border-indigo-400 text-indigo-300' : 'bg-zinc-900/50 border-zinc-800 text-zinc-600'}`}>{type}</button>))}</div></div>
                        {[{ label: 'Eye Size', key: 'eyeSize' }, { label: 'Eye Tilt', key: 'canthalTilt' }, { label: 'Eye Distance', key: 'eyeDistance' }].map(f => (<div key={f.key} className="space-y-2"><div className="flex justify-between text-[10px] font-bold"><span className="text-zinc-500">{f.label}</span><span className="text-indigo-400">{(state.features as any)[f.key]}</span></div><input type="range" min="0" max="100" value={(state.features as any)[f.key]} onChange={(e) => handleFeatureChange(f.key, parseInt(e.target.value))} className="w-full accent-indigo-500 h-1 bg-zinc-900 rounded-full appearance-none cursor-pointer" /></div>))}
                      </div>
                    </SubSection>
                    <SubSection title="Nose & Lips" defaultOpen={false}>
                      <div className="space-y-4">{[{ label: 'Nose Bridge', key: 'noseBridge' }, { label: 'Nose Width', key: 'noseWidth' }, { label: 'Lip Volume', key: 'lipThickness' }, { label: 'Cupid\'s Bow', key: 'lipCupidBow' }, { label: 'Mouth Corners', key: 'mouthCorners' }].map(f => (<div key={f.key} className="space-y-2"><div className="flex justify-between text-[10px] font-bold"><span className="text-zinc-500">{f.label}</span><span className="text-rose-400">{(state.features as any)[f.key]}</span></div><input type="range" min="0" max="100" value={(state.features as any)[f.key]} onChange={(e) => handleFeatureChange(f.key, parseInt(e.target.value))} className="w-full accent-rose-500 h-1 bg-zinc-900 rounded-full appearance-none cursor-pointer" /></div>))}</div>
                    </SubSection>
                    <SubSection title="Face Shape" defaultOpen={false}>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-[10px] font-bold"><span className="text-zinc-500">Chin Height</span><span className="text-emerald-400">{state.features.chinHeight}</span></div>
                          <input type="range" min="0" max="100" value={state.features.chinHeight} onChange={(e) => handleFeatureChange('chinHeight', parseInt(e.target.value))} className="w-full accent-emerald-500 h-1 bg-zinc-900 rounded-full appearance-none cursor-pointer" />
                        </div>
                        {[{ label: 'Jawline Sharpness', key: 'jawlineSharpness' }, { label: 'Face Width', key: 'faceWidth' }, { label: 'Cheekbone Height', key: 'cheekboneHeight' }, { label: 'Jaw Shape', key: 'jawShape' }].map(f => (<div key={f.key} className="space-y-2"><div className="flex justify-between text-[10px] font-bold"><span className="text-zinc-500">{f.label}</span><span className="text-emerald-400">{(state.features as any)[f.key]}</span></div><input type="range" min="0" max="100" value={(state.features as any)[f.key]} onChange={(e) => handleFeatureChange(f.key, parseInt(e.target.value))} className="w-full accent-emerald-500 h-1 bg-zinc-900 rounded-full appearance-none cursor-pointer" /></div>))}
                      </div>
                    </SubSection>
                  </div>
                </div>
                {renderRefUploader('face', 'Facial')}
              </CategoryAccordion>
            )}

            {state.editModes.hair && (
              <CategoryAccordion title="Hair Studio" icon={Scissors} onOpenHelp={() => setActiveHelpId('hair')} onReset={() => onResetCategory('hair')}>
                <div className="relative">
                  {state.referenceImages.hair && <LockOverlay category="Hair" />}
                  <div className={state.referenceImages.hair ? 'opacity-20 pointer-events-none filter blur-[1px]' : ''}>
                    <SubSection title="Cut & Style" defaultOpen={true}>
                      <div className="space-y-4"><div className="space-y-2"><span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Length & Cut</span><StyleSelector options={state.gender === 'male' ? MALE_HAIR_LENGTHS : HAIR_LENGTHS} selectedId={state.hair.hairLength} onSelect={(id) => handleHairChange('hairLength', id)} /></div><div className="space-y-2"><span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Texture & Perm</span><StyleSelector options={state.gender === 'male' ? MALE_HAIR_TEXTURES : HAIR_TEXTURES} selectedId={state.hair.hairTexture} onSelect={(id) => handleHairChange('hairTexture', id)} /></div><div className="space-y-2"><span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Bangs</span><StyleSelector options={state.gender === 'male' ? MALE_BANG_STYLES : BANG_STYLES} selectedId={state.hair.bangStyle} onSelect={(id) => handleHairChange('bangStyle', id)} /></div></div>
                    </SubSection>
                    <SubSection title="Quality & Volume" defaultOpen={false}>
                      <div className="space-y-4"><div className="space-y-2"><div className="flex justify-between text-[10px] font-bold"><span className="text-zinc-500">Volume</span><span className="text-rose-400">{state.hair.hairVolume}</span></div><input type="range" min="0" max="100" value={state.hair.hairVolume} onChange={(e) => handleHairChange('hairVolume', parseInt(e.target.value))} className="w-full accent-rose-500 h-1 bg-zinc-900 rounded-full appearance-none cursor-pointer" /></div><div className="space-y-2"><div className="flex justify-between text-[10px] font-bold items-center"><div className="flex items-center gap-1"><Sparkles className="w-3 h-3 text-rose-400" /><span className="text-zinc-500">Hair Shine</span></div><span className="text-rose-400">{state.hair.hairShine}%</span></div><input type="range" min="0" max="100" value={state.hair.hairShine} onChange={(e) => handleHairChange('hairShine', parseInt(e.target.value))} className="w-full accent-rose-500 h-1 bg-zinc-900 rounded-full appearance-none cursor-pointer" /></div></div>
                    </SubSection>
                    <SubSection title="Color Studio" defaultOpen={true}>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 text-rose-400"><Palette className="w-3.5 h-3.5" /><span className="text-[10px] font-black uppercase tracking-[0.15em]">Color Mode</span></div>
                          <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => handleHairChange('isGradient', !state.hair.isGradient)}>
                            <span className={`text-[9px] font-bold uppercase transition-colors ${state.hair.isGradient ? 'text-rose-400' : 'text-zinc-600'}`}>Ombré</span>
                            <div className={`w-7 h-3.5 rounded-full p-0.5 transition-colors relative ${state.hair.isGradient ? 'bg-rose-600' : 'bg-zinc-800'}`}>
                              <div className={`w-2.5 h-2.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${state.hair.isGradient ? 'translate-x-3.5' : 'translate-x-0'}`} />
                            </div>
                          </div>
                        </div>

                        {!state.hair.isGradient ? (
                          <ColorSection label="Hair Color" id="hairColorTop" presets={HAIR_COLOR_PRESETS} colorValue={state.hair.hairColorTop} disabled={false} onColorChange={handleHairChange} />
                        ) : (
                          <div className="space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
                            <ColorSection label="Root Color" id="hairColorTop" presets={HAIR_COLOR_PRESETS} colorValue={state.hair.hairColorTop} disabled={false} onColorChange={handleHairChange} />
                            <div className="space-y-2">
                              <div className="flex justify-between text-[10px] font-bold items-center">
                                <div className="flex items-center gap-1"><Split className="w-3 h-3 text-rose-400" /><span className="text-zinc-500">Gradient Transition</span></div>
                                <span className="text-rose-400">{state.hair.hairColorBoundary}%</span>
                              </div>
                              <input type="range" min="0" max="100" value={state.hair.hairColorBoundary} onChange={(e) => handleHairChange('hairColorBoundary', parseInt(e.target.value))} className="w-full accent-rose-500 h-1 bg-zinc-900 rounded-full appearance-none cursor-pointer" />
                            </div>
                            <ColorSection label="Ends Color" id="hairColorBottom" presets={HAIR_COLOR_PRESETS} colorValue={state.hair.hairColorBottom} disabled={false} onColorChange={handleHairChange} />
                          </div>
                        )}
                      </div>
                    </SubSection>
                  </div>
                </div>
                {renderRefUploader('hair', 'Hair')}
              </CategoryAccordion>
            )}

            {state.editModes.makeup && (
              <CategoryAccordion title="Makeup Artist" icon={Brush} onOpenHelp={() => setActiveHelpId('makeup')} onReset={() => onResetCategory('makeup')}>
                <div className="relative">
                  {state.referenceImages.makeup && <LockOverlay category="Makeup" />}
                  <div className={state.referenceImages.makeup ? 'opacity-20 pointer-events-none filter blur-[1px]' : ''}>
                    <SubSection title="Base Guide" defaultOpen={true}>
                      <div className="space-y-5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-rose-400"><Pipette className="w-3.5 h-3.5" /><span className="text-[10px] font-black uppercase tracking-[0.15em]">Base Tone</span></div>
                          <button onClick={() => { setIsCustomFoundation(false); handleMakeupChange('foundationTone', 'none'); }} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-bold border transition-all ${state.makeup.foundationTone === 'none' && !isCustomFoundation ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'}`}><Undo2 className="w-3 h-3" /> Original</button>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          {FOUNDATION_CATEGORIES.filter(c => c.id !== 'none').map(cat => (<button key={cat.id} onClick={() => { setIsCustomFoundation(false); setActiveFoundationCategory(cat.id); }} className={`py-2 px-3 rounded-xl text-[10px] font-bold uppercase transition-all border text-center ${!isCustomFoundation && activeFoundationCategory === cat.id ? 'bg-zinc-800 border-indigo-500 text-indigo-400' : 'bg-zinc-900/40 border-zinc-800/50 text-zinc-600 hover:text-zinc-400'}`}>{cat.label.split('/')[0]}</button>))}
                          <button onClick={() => setIsCustomFoundation(true)} className={`py-2 px-3 rounded-xl text-[10px] font-bold uppercase transition-all border text-center ${isCustomFoundation ? 'bg-zinc-800 border-rose-500 text-rose-400' : 'bg-zinc-900/40 border-zinc-800/50 text-zinc-600 hover:text-zinc-400'}`}>Custom</button>
                        </div>
                        {isCustomFoundation ? (
                          <div className="p-4 bg-zinc-900/40 rounded-2xl border border-zinc-800 animate-in fade-in zoom-in-95 duration-200"><ColorSection label="Bespoke Base Shade" id="foundationTone" presets={[]} colorValue={state.makeup.foundationTone.startsWith('#') ? state.makeup.foundationTone : '#f4d5bc'} disabled={false} onColorChange={handleMakeupChange} /><p className="mt-3 text-[9px] text-zinc-600 font-medium">Fine-tune the perfect foundation shade manually.</p></div>
                        ) : (
                          <div className="space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                             <div className="flex flex-wrap gap-2 p-3 bg-black/30 rounded-2xl border border-zinc-800/50">
                                {filteredShades.map(shade => (<button key={shade.id} onClick={() => handleMakeupChange('foundationTone', shade.id)} className={`relative w-8 h-8 rounded-full border-2 transition-all ${state.makeup.foundationTone === shade.id ? 'border-rose-400 scale-110 shadow-lg shadow-rose-400/20' : 'border-zinc-800 hover:border-zinc-600'}`} style={{ backgroundColor: shade.color }} title={shade.label}>{state.makeup.foundationTone === shade.id && (<div className="absolute inset-0 flex items-center justify-center"><Check className="w-3 h-3 text-white drop-shadow-md" strokeWidth={4} /></div>)}</button>))}
                             </div>
                             <div className="px-1 flex justify-between items-center"><span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{FOUNDATION_SHADES.find(s => s.id === state.makeup.foundationTone)?.label || 'Select a shade'}</span></div>
                          </div>
                        )}
                      </div>
                    </SubSection>
                    <SubSection title="Concept & Library" defaultOpen={true}>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between"><div className="flex items-center gap-2">{state.makeup.makeupStyle.includes('custom_') ? <Bookmark className="w-3.5 h-3.5 text-indigo-400" /> : state.makeup.makeupStyle === 'Custom Look' ? <MousePointer2 className="w-3.5 h-3.5 text-rose-400" /> : <Palette className="w-3.5 h-3.5 text-rose-400" />}<span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">Style Preset</span></div>{state.makeup.makeupStyle.includes('custom_') && (<button onClick={(e) => handleDeletePreset(state.makeup.makeupStyle, e)} className="text-[9px] font-bold text-rose-500 hover:text-rose-400 uppercase tracking-widest flex items-center gap-1"><Trash2 className="w-3 h-3" /> Delete</button>)}</div>
                        <select value={state.makeup.makeupStyle} onChange={(e) => handlePresetChange(e.target.value)} className={`w-full bg-zinc-900 border rounded-xl px-4 py-3 text-[11px] font-bold outline-none transition-all ${state.makeup.makeupStyle.includes('custom_') ? 'border-indigo-500/50 text-indigo-300' : state.makeup.makeupStyle === 'Custom Look' ? 'border-rose-500/50 text-rose-300' : 'border-zinc-800 text-zinc-300 focus:border-rose-400'}`}><optgroup label="2025 Trends" className="bg-zinc-900 text-rose-400 font-black">{MAKEUP_STYLES.filter(s => s.id !== 'Custom Look').map(style => (<option key={style.id} value={style.id}>{style.label}</option>))}</optgroup><optgroup label="Default" className="bg-zinc-900"><option value="Custom Look">직접 설정 (Custom)</option></optgroup>{state.customMakeupPresets.length > 0 && (<optgroup label="User Library" className="bg-zinc-900 text-indigo-400">{state.customMakeupPresets.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}</optgroup>)}</select>
                        <div className="pt-2"><div className="flex items-center gap-2 bg-black/30 border border-zinc-800/50 p-1.5 rounded-2xl group focus-within:border-indigo-500/50 transition-all"><input type="text" value={newPresetName} onChange={(e) => setNewPresetName(e.target.value)} placeholder="Save current look..." className="flex-1 bg-transparent border-none outline-none text-[10px] font-bold text-zinc-300 px-2 placeholder:text-zinc-600" /><button onClick={handleSaveCustomPreset} disabled={!newPresetName.trim() || saveStatus !== 'idle'} className={`p-2 rounded-xl transition-all ${newPresetName.trim() ? 'bg-indigo-600 text-white hover:bg-indigo-500' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}`}>{saveStatus === 'saved' ? <Check className="w-3 h-3" /> : <Save className="w-3 h-3" />}</button></div><p className="mt-2 text-[8px] text-zinc-600 uppercase tracking-widest font-black text-center">Save custom settings to User Library</p></div>
                      </div>
                    </SubSection>
                    <SubSection title="Eye Makeup" defaultOpen={false}>
  <div className="space-y-4">
    <ColorSection label="Eyebrow Color" id="eyebrowColor" presets={MAKEUP_PRESETS.eyebrow} colorValue={state.makeup.eyebrowColor} disabled={false} onColorChange={handleMakeupChange} />
    <div className="space-y-2">
      <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Eyeliner</span>
      <StyleSelector options={EYELINER_STYLES} selectedId={state.makeup.eyelinerStyle} onSelect={(id) => handleMakeupChange('eyelinerStyle', id)} />
    </div>
    <div className="space-y-2">
      <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Lashes</span>
      <StyleSelector options={EYELASH_STYLES} selectedId={state.makeup.eyelashStyle} onSelect={(id) => handleMakeupChange('eyelashStyle', id)} />
    </div>
    <div className="space-y-4 pt-2 border-t border-zinc-900/50">
      <div className="space-y-2">
        <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Contact Lenses</span>
        <StyleSelector options={LENS_STYLES} selectedId={state.makeup.lensStyle} onSelect={(id) => handleMakeupChange('lensStyle', id)} />
      </div>
      {state.makeup.lensStyle !== 'none' && (
        <div className="animate-in fade-in slide-in-from-top-1 duration-200">
          <ColorSection label="Lens Color" id="lensColor" presets={MAKEUP_PRESETS.lens} colorValue={state.makeup.lensColor} disabled={false} onColorChange={handleMakeupChange} />
        </div>
      )}
    </div>
    <ColorSection label="Eyeshadow" id="eyeshadowColor" presets={MAKEUP_PRESETS.eyeshadow} colorValue={state.makeup.eyeshadowColor} disabled={false} onColorChange={handleMakeupChange} />
  </div>
</SubSection>
                    <SubSection title="Cheek & Shading" defaultOpen={false}><div className="space-y-4"><div className="space-y-2"><span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Blush Style</span><StyleSelector options={BLUSH_STYLES} selectedId={state.makeup.blushStyle} onSelect={(id) => handleMakeupChange('blushStyle', id)} /></div><ColorSection label="Blush Color" id="blushColor" presets={MAKEUP_PRESETS.blush} colorValue={state.makeup.blushColor} disabled={false} onColorChange={handleMakeupChange} /><div className="space-y-2"><div className="flex justify-between text-[10px] font-bold"><span className="text-zinc-500">Blush Intensity</span><span className="text-rose-400">{state.makeup.blushIntensity}</span></div><input type="range" min="0" max="100" value={state.makeup.blushIntensity} onChange={(e) => handleMakeupChange('blushIntensity', parseInt(e.target.value))} className="w-full accent-rose-500 h-1 bg-zinc-900 rounded-full appearance-none cursor-pointer" /></div><div className="space-y-2"><div className="flex justify-between text-[10px] font-bold"><span className="text-zinc-500">Contour Shading</span><span className="text-indigo-400">{state.makeup.contourIntensity}</span></div><input type="range" min="0" max="100" value={state.makeup.contourIntensity} onChange={(e) => handleMakeupChange('contourIntensity', parseInt(e.target.value))} className="w-full accent-indigo-500 h-1 bg-zinc-900 rounded-full appearance-none cursor-pointer" /></div></div></SubSection>
                    <SubSection title="Lip & Finish" defaultOpen={false}><div className="space-y-4"><div className="space-y-2"><span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Lip Finish</span><StyleSelector options={LIP_STYLES} selectedId={state.makeup.lipStyle} onSelect={(id) => handleMakeupChange('lipStyle', id)} /></div><ColorSection label="Lip Color" id="lipColor" presets={MAKEUP_PRESETS.lipstick} colorValue={state.makeup.lipColor} disabled={false} onColorChange={handleMakeupChange} /></div></SubSection>
                  </div>
                </div>
                <div className="space-y-3 pt-5 border-t border-zinc-900"><div className="flex items-center gap-2 text-zinc-500"><MessageSquareText className="w-3 h-3" /><span className="text-[9px] font-bold uppercase tracking-widest">Artist Notes</span></div><textarea value={state.customPrompts.makeup} onChange={(e) => handleCustomPromptChange('makeup', e.target.value)} placeholder="Glitter, matte finish, or specific reference..." className="w-full h-20 bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-[10px] text-zinc-300 outline-none focus:border-rose-400 transition-all resize-none" /></div>
                {renderRefUploader('makeup', 'Makeup')}
              </CategoryAccordion>
            )}
          </div>
        )}
      </div>
      <div className="p-4 bg-zinc-950 border-t border-zinc-900"><div className="flex items-center gap-2 text-rose-400 mb-1"><Zap className="w-3 h-3 fill-current" /><span className="text-[9px] font-bold uppercase tracking-widest">Context Engine v8.0</span></div><p className="text-[10px] text-zinc-600 leading-tight">2025 Trend Presets & Smart Logic Active.</p></div>
    </aside>
  );
};
