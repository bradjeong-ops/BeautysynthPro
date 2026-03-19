
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { get, set } from 'idb-keyval';
import { StudioSidebar } from './components/StudioSidebar';
import { PreviewCanvas } from './components/PreviewCanvas';
import { generateBeautyImage, generateBeautyPrompt, analyzeImageAttributes, analyzeResultingAesthetics, setQuotaExceededCallback } from './services/geminiService';
import { BeautyState, CustomPreset } from './types';
import { INITIAL_FEATURES, INITIAL_HAIR, MALE_INITIAL_HAIR, INITIAL_MAKEUP } from './constants';
import { Sparkles, Upload, Trash2, Zap, Eye, EyeOff, Download, RefreshCcw, Search, Activity, Copy, Check, Loader2, User, Key, BadgeCheck, ArrowRight, X, ChevronLeft, ChevronRight, Image as ImageIcon, Layers, Maximize2 } from 'lucide-react';
import GuestLoginModal from './components/GuestLoginModal';

const PRESETS_STORAGE_KEY = 'beautysynth_custom_presets';

const App: React.FC = () => {
  // Use lazy initialization for state to ensure localStorage is read BEFORE first render
  const [state, setState] = useState<BeautyState>(() => {
    let savedPresets: CustomPreset[] = [];
    try {
      const saved = localStorage.getItem(PRESETS_STORAGE_KEY);
      if (saved) {
        savedPresets = JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load presets from storage", e);
    }

    return {
      gender: 'female',
      baseImage: null,
      referenceImages: {
        face: null,
        skin: null,
        hair: null,
        makeup: null
      },
      features: INITIAL_FEATURES,
      skin: { 
        tone: 'natural', 
        texture: ['Smooth'],
        skinAge: 20,
        glowIntensity: 50,
        blemishIntensity: 10
      },
      hair: INITIAL_HAIR,
      makeup: INITIAL_MAKEUP,
      customMakeupPresets: savedPresets, // Initialized from storage
      customPrompts: {
        face: '',
        skin: '',
        hair: '',
        makeup: ''
      },
      editModes: {
        face: false,
        skin: false,
        hair: false,
        makeup: false
      },
      aspectRatio: '1:1',
      baseline: undefined
    };
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [resultAnalysis, setResultAnalysis] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [isCheckingKey, setIsCheckingKey] = useState(true);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [currentGuestNumber, setCurrentGuestNumber] = useState<string>("");
  const [showQuotaWarning, setShowQuotaWarning] = useState(false);
  
  // Custom Modals State
  const [loginModalMode, setLoginModalMode] = useState<'pin' | 'key' | 'both' | null>(null);

  // History Pagination & Modal State
  const [historyPage, setHistoryPage] = useState(1);
  const [selectedHistoryIndex, setSelectedHistoryIndex] = useState<number | null>(null);
  const [isHistoryComparing, setIsHistoryComparing] = useState(false);
  const itemsPerPage = 12;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedHistoryIndex === null) return;
      if (e.key === 'ArrowLeft') {
        setSelectedHistoryIndex(prev => prev !== null && prev > 0 ? prev - 1 : prev);
      } else if (e.key === 'ArrowRight') {
        setSelectedHistoryIndex(prev => prev !== null && prev < galleryImages.length - 1 ? prev + 1 : prev);
      } else if (e.key === 'Escape') {
        setSelectedHistoryIndex(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedHistoryIndex, galleryImages.length]);

  useEffect(() => {
    setQuotaExceededCallback(() => {
      setShowQuotaWarning(true);
    });
  }, []);

  const getAIStudio = () => (window as any).aistudio;

  useEffect(() => {
    const checkKey = async () => {
      try {
        const selected = await getAIStudio().hasSelectedApiKey();
        const customKey = localStorage.getItem('custom_gemini_api_key');
        setHasApiKey(selected || !!customKey);
      } catch (e) {
        const customKey = localStorage.getItem('custom_gemini_api_key');
        setHasApiKey(!!customKey);
      } finally {
        setIsCheckingKey(false);
      }
    };
    checkKey();
    
    // Load last guest number if exists
    try {
      const lastGuest = localStorage.getItem('last_guest_pin');
      if (lastGuest) {
        setCurrentGuestNumber(lastGuest);
        loadGallery(lastGuest);
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (!isCheckingKey && !hasApiKey) {
      if (!currentGuestNumber) {
        setLoginModalMode('both');
      } else {
        setLoginModalMode('key');
      }
    }
  }, [isCheckingKey, hasApiKey, currentGuestNumber]);

  const loadGallery = async (guestNum: string) => {
    try {
      const savedImages = await get('beautysynth_gallery') || {};
      if (savedImages[guestNum]) {
        setGalleryImages(savedImages[guestNum]);
      } else {
        setGalleryImages([]);
      }
    } catch (err) {
      console.error("Failed to load gallery:", err);
    }
  };

  const handleLogin = (pin: string) => {
    if (pin) {
      setCurrentGuestNumber(pin);
      localStorage.setItem('last_guest_pin', pin);
      loadGallery(pin);
    }
    
    // Check if key was saved
    const customKey = localStorage.getItem('custom_gemini_api_key');
    if (customKey) {
      setHasApiKey(true);
    }
    
    setLoginModalMode(null);
  };

  const handleSelectApiKey = async () => {
    const customKey = localStorage.getItem('custom_gemini_api_key');
    if (customKey) {
      setLoginModalMode('key');
      return;
    }

    try {
      await getAIStudio().openSelectKey();
      setHasApiKey(true);
      setError(null);
    } catch (e) {
      console.error("AI Studio key selection failed, showing manual input modal", e);
      setLoginModalMode('key');
    }
  };

  // Sync custom presets to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(state.customMakeupPresets));
  }, [state.customMakeupPresets]);

  const calculateAspectRatio = (img: HTMLImageElement): string => {
    const ratio = img.width / img.height;
    const options: { label: string, value: number }[] = [
      { label: "1:1", value: 1 },
      { label: "3:4", value: 0.75 },
      { label: "4:3", value: 1.33 },
      { label: "9:16", value: 0.5625 },
      { label: "16:9", value: 1.777 }
    ];
    return options.reduce((prev, curr) => Math.abs(curr.value - ratio) < Math.abs(prev.value - ratio) ? curr : prev).label;
  };

  const applyAnalysis = async (data: any, originalImage: string, detectedRatio: string) => {
    const scale = (val: number | undefined) => {
      if (typeof val !== 'number') return 50;
      return val <= 1 ? Math.round(val * 100) : Math.round(val);
    };

    const validRatios = ["1:1", "3:4", "4:3", "9:16", "16:9"];
    const finalRatio = (validRatios.includes(detectedRatio) ? detectedRatio : "1:1") as BeautyState['aspectRatio'];

    const detectedGender = (data.gender && data.gender.toLowerCase() === 'male') ? 'male' : (data.gender && data.gender.toLowerCase() === 'female' ? 'female' : state.gender);

    const skinToneVal = scale(data.skinTone);
    const skinToneId = skinToneVal < 20 ? 'porcelain' 
                     : skinToneVal < 40 ? 'fair' 
                     : skinToneVal < 60 ? 'natural' 
                     : skinToneVal < 80 ? 'tanned' 
                     : 'deep';

    const hairLen = detectedGender === 'male' 
      ? (data.hairLength === 'short' ? 'short' : data.hairLength === 'medium' ? 'medium' : 'long')
      : (data.hairLength === 'short' ? 'bob' : data.hairLength === 'medium' ? 'medium' : 'long');
    const hairTex = detectedGender === 'male'
      ? (data.hairTexture === 'straight' ? 'straight' : 'volume')
      : (data.hairTexture === 'straight' ? 'straight' : 's_curl');

    const analyzedFeatures = {
      ...INITIAL_FEATURES,
      eyeSize: scale(data.eyeSize ?? 50),
      canthalTilt: scale(data.eyeTilt ?? 50),
      noseBridge: scale(data.noseBridge ?? 50),
      noseWidth: scale(data.noseWidth ?? 50),
      faceWidth: scale(data.faceWidth ?? 50),
      cheekboneHeight: scale(data.cheekboneHeight ?? 50),
      jawShape: scale(data.jawShape ?? 50),
      lipThickness: scale(data.lipFullness ?? 50),
    };

    const analyzedSkin = {
      ...state.skin,
      tone: skinToneId,
      skinAge: scale(data.skinAge ?? 20),
    };

    const baseHair = detectedGender === 'male' ? MALE_INITIAL_HAIR : INITIAL_HAIR;
    const analyzedHair = {
      ...baseHair,
      hairLength: hairLen,
      hairTexture: hairTex,
    };

    const analyzedMakeup = {
      ...INITIAL_MAKEUP,
      eyebrowStyle: data.eyebrowStyle || INITIAL_MAKEUP.eyebrowStyle,
      eyebrowColor: data.eyebrowColor || INITIAL_MAKEUP.eyebrowColor,
      eyelinerStyle: data.eyelinerStyle || INITIAL_MAKEUP.eyelinerStyle,
      eyelashStyle: data.eyelashStyle || INITIAL_MAKEUP.eyelashStyle,
      eyeshadowColor: data.eyeshadowColor || INITIAL_MAKEUP.eyeshadowColor,
      blushStyle: data.blushStyle || INITIAL_MAKEUP.blushStyle,
      blushColor: data.blushColor || INITIAL_MAKEUP.blushColor,
      lipStyle: data.lipStyle || INITIAL_MAKEUP.lipStyle,
      lipColor: data.lipColor || INITIAL_MAKEUP.lipColor,
      lensStyle: data.lensStyle || INITIAL_MAKEUP.lensStyle,
      lensColor: data.lensColor || INITIAL_MAKEUP.lensColor,
    };

    setState(prev => ({
      ...prev,
      gender: detectedGender,
      baseImage: originalImage,
      aspectRatio: finalRatio,
      features: analyzedFeatures,
      skin: analyzedSkin,
      hair: analyzedHair,
      makeup: analyzedMakeup,
      baseline: {
        features: analyzedFeatures,
        skin: analyzedSkin,
        hair: {
          hairLength: hairLen,
          hairTexture: hairTex
        },
        makeup: analyzedMakeup
      }
    }));
  };

  const handleGenerate = async () => {
    if (!hasApiKey) {
      handleSelectApiKey();
      return;
    }
    try {
      setIsGenerating(true);
      setError(null);
      setResultAnalysis(null);
      const result = await generateBeautyImage(state);
      if (result) {
        setGeneratedImage(result);
        const analysis = await analyzeResultingAesthetics(result);
        setResultAnalysis(analysis);
        
        // Auto-save to history
        if (currentGuestNumber) {
          try {
            const savedImages = await get('beautysynth_gallery') || {};
            if (!savedImages[currentGuestNumber]) {
              savedImages[currentGuestNumber] = [];
            }
            const newItem = {
              id: Date.now().toString(),
              image: result,
              timestamp: new Date().toISOString(),
              analysis: analysis,
              state: JSON.parse(JSON.stringify(state)),
              originalImage: state.baseImage
            };
            savedImages[currentGuestNumber].unshift(newItem);
            await set('beautysynth_gallery', savedImages);
            setGalleryImages(savedImages[currentGuestNumber]);
          } catch (err) {
            console.error("Auto-save failed:", err);
          }
        }
      } else {
        setError("Synthesis failed. Please check your settings and try again.");
      }
    } catch (err: any) {
      const rawMsg = err.message || "Unknown API Error";
      let displayMsg = rawMsg;
      if (rawMsg.includes("403")) displayMsg = "403 Forbidden: 유료 결제 계정이 아니거나 API 접근 권한이 없습니다.";
      if (rawMsg.includes("429")) displayMsg = "429 Too Many Requests: 할당량을 초과했습니다. 잠시 후 시도하세요.";
      if (rawMsg.includes("entity was not found")) {
        displayMsg = "API 키가 올바른 프로젝트에 속해 있지 않습니다. 키를 다시 선택하세요.";
        setHasApiKey(false);
      }
      setError(displayMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `BeautySynth_PRO_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUseAsBase = async () => {
    if (!generatedImage) return;
    
    try {
      setIsAnalyzing(true);
      const newImage = generatedImage;
      
      // We need to clear generatedImage first to show loading on the source panel
      setGeneratedImage(null);
      setResultAnalysis(null);
      setIsComparing(false);
      
      const img = new Image();
      img.onload = async () => {
        const detectedRatio = calculateAspectRatio(img);
        try {
          const analysis = await analyzeImageAttributes(newImage);
          await applyAnalysis(analysis, newImage, detectedRatio);
        } catch (err: any) {
          console.error("Re-analysis failed:", err);
          const rawMsg = err.message || "Unknown error";
          let displayMsg = `Failed to re-analyze synthesized result: ${rawMsg}`;
          if (rawMsg.includes("403")) displayMsg = "403 Forbidden: 유료 결제 계정이 아니거나 API 접근 권한이 없습니다.";
          if (rawMsg.includes("429")) displayMsg = "429 Too Many Requests: 할당량을 초과했습니다. 잠시 후 시도하세요.";
          if (rawMsg.includes("entity was not found")) {
            displayMsg = "API 키가 올바른 프로젝트에 속해 있지 않습니다. 키를 다시 선택하세요.";
            setHasApiKey(false);
          }
          setError(displayMsg);
          // Fallback: at least set the image
          const validRatios = ["1:1", "3:4", "4:3", "9:16", "16:9"];
          const finalRatio = (validRatios.includes(detectedRatio) ? detectedRatio : "1:1") as BeautyState['aspectRatio'];
          updateState({ baseImage: newImage, aspectRatio: finalRatio });
        } finally {
          setIsAnalyzing(false);
        }
      };
      img.src = newImage;
    } catch (err) {
      setIsAnalyzing(false);
      setError("An error occurred while moving the result to base.");
    }
  };

  const handleCopyAnalysis = () => {
    if (resultAnalysis) {
      navigator.clipboard.writeText(resultAnalysis);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleDeleteBaseImage = () => {
    updateState({ baseImage: null, baseline: undefined });
    setGeneratedImage(null);
    setResultAnalysis(null);
  };

  const handleDeleteHistoryItem = async (index: number) => {
    if (!currentGuestNumber) return;
    try {
      const savedImages = await get('beautysynth_gallery') || {};
      if (savedImages[currentGuestNumber]) {
        savedImages[currentGuestNumber].splice(index, 1);
        await set('beautysynth_gallery', savedImages);
        setGalleryImages([...savedImages[currentGuestNumber]]);
        
        // Adjust pagination if necessary
        const maxPage = Math.ceil(savedImages[currentGuestNumber].length / itemsPerPage);
        if (historyPage > maxPage && maxPage > 0) {
          setHistoryPage(maxPage);
        }
      }
    } catch (err) {
      console.error("Failed to delete history item:", err);
    }
  };

  const handleResetCategory = (category: 'face' | 'skin' | 'hair' | 'makeup') => {
    setState(prev => {
      const updates: Partial<BeautyState> = {};
      if (category === 'face') {
        updates.features = prev.baseline ? { ...INITIAL_FEATURES, ...prev.baseline.features } : INITIAL_FEATURES;
      } else if (category === 'skin') {
        updates.skin = prev.baseline ? { ...prev.skin, ...prev.baseline.skin } : { ...prev.skin, tone: 'natural', skinAge: 20 };
      } else if (category === 'hair') {
        updates.hair = prev.baseline && prev.baseline.hair ? { ...prev.hair, ...prev.baseline.hair } : (prev.gender === 'male' ? MALE_INITIAL_HAIR : INITIAL_HAIR);
      } else if (category === 'makeup') {
        updates.makeup = INITIAL_MAKEUP;
      }
      return { ...prev, ...updates };
    });
  };

  const updateState = (updates: Partial<BeautyState>) => {
    setState(prev => {
      const newState = { ...prev, ...updates };
      if (updates.gender && updates.gender !== prev.gender) {
        newState.hair = updates.gender === 'male' ? MALE_INITIAL_HAIR : INITIAL_HAIR;
      }
      return newState;
    });
  };

  const handleSetBaseImage = (base64String: string) => {
    const img = new Image();
    img.onload = async () => {
      const detectedRatio = calculateAspectRatio(img);
      const validRatios = ["1:1", "3:4", "4:3", "9:16", "16:9"];
      const finalRatio = (validRatios.includes(detectedRatio) ? detectedRatio : "1:1") as BeautyState['aspectRatio'];
      
      updateState({ baseImage: base64String, aspectRatio: finalRatio, baseline: undefined });
      try {
        setIsAnalyzing(true);
        const analysis = await analyzeImageAttributes(base64String);
        await applyAnalysis(analysis, base64String, detectedRatio);
      } catch (err: any) {
        console.error("Analysis failed:", err);
        const rawMsg = err.message || "Unknown error";
        let displayMsg = `AI analysis failed: ${rawMsg}. Please check your API key and connection.`;
        if (rawMsg.includes("403")) displayMsg = "403 Forbidden: 유료 결제 계정이 아니거나 API 접근 권한이 없습니다.";
        if (rawMsg.includes("429")) displayMsg = "429 Too Many Requests: 할당량을 초과했습니다. 잠시 후 시도하세요.";
        if (rawMsg.includes("entity was not found")) {
          displayMsg = "API 키가 올바른 프로젝트에 속해 있지 않습니다. 키를 다시 선택하세요.";
          setHasApiKey(false);
        }
        setError(displayMsg);
      } finally {
        setIsAnalyzing(false);
      }
    };
    img.src = base64String;
  };

  const onFileUpload = (type: keyof BeautyState['referenceImages'] | 'base') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (type === 'base') {
          handleSetBaseImage(base64String);
        } else {
          updateState({ referenceImages: { ...state.referenceImages, [type]: base64String } });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const currentPrompt = useMemo(() => generateBeautyPrompt(state), [state]);

  return (
    <div className="flex flex-col h-screen bg-[#050505] overflow-hidden text-zinc-100 selection:bg-indigo-500/30">
      <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-zinc-950/60 backdrop-blur-3xl z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-600/30">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight leading-none uppercase">BeautySynth <span className="text-indigo-500">PRO</span></h1>
            <p className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.2em] mt-1">High-End Digital Aesthetics</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setLoginModalMode('pin')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/5 hover:bg-zinc-800 transition-colors">
            <User className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[10px] font-bold text-zinc-300 tracking-widest">GUEST: {currentGuestNumber || 'NONE'}</span>
          </button>
          <button onClick={handleSelectApiKey} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/30 border border-indigo-500/20 hover:bg-indigo-900/40 transition-colors">
            {hasApiKey ? <BadgeCheck className="w-3.5 h-3.5 text-indigo-400" /> : <Key className="w-3.5 h-3.5 text-rose-400" />}
            <span className="text-[10px] font-bold text-indigo-300 tracking-widest">{hasApiKey ? 'PRO ACTIVE' : 'API KEY'}</span>
          </button>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        <StudioSidebar state={state} updateState={updateState} onRefUpload={onFileUpload} onResetCategory={handleResetCategory} />
        <div className="flex-1 p-8 overflow-y-auto bg-[#09090b] scroll-smooth">
          <div className="flex flex-col gap-6 max-w-[1600px] mx-auto min-h-full">
            {error && <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-5 py-3 rounded-2xl flex items-center justify-between text-xs font-bold shrink-0"><span>{error}</span><button onClick={() => setError(null)}>✕</button></div>}
            
            {showQuotaWarning && (
              <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 px-5 py-3 rounded-2xl flex items-center justify-between text-xs font-bold shrink-0 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-3">
                  <Zap className="w-4 h-4" />
                  <span>Gemini 3.1 Pro 할당량이 모두 소진되었습니다. 더 빠른 분석을 위해 자동으로 Gemini 3 Flash 모델로 전환되었습니다.</span>
                </div>
                <button onClick={() => setShowQuotaWarning(false)} className="hover:text-amber-200 transition-colors">알겠어요</button>
              </div>
            )}
            
            {/* Top Section: Images */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[65vh] min-h-[500px] shrink-0">
              <div className="bg-zinc-900/30 border border-white/5 rounded-[40px] overflow-hidden flex flex-col relative group shadow-2xl backdrop-blur-sm">
                <div className="py-2.5 px-5 border-b border-white/5 flex justify-between items-center bg-white/5">
                  <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Source Input</h3>
                  <div className="flex items-center gap-4">
                    {isAnalyzing && (
                      <span className="text-[9px] font-black text-indigo-400 flex items-center gap-1.5 animate-pulse uppercase">
                        <Search className="w-3 h-3" /> Face Analyzing...
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex-1 flex items-center justify-center relative bg-black overflow-hidden">
                  {state.baseImage ? (
                    <>
                      <img src={state.baseImage} className={`max-w-full max-h-full object-contain transition-all duration-700 ${isAnalyzing ? 'opacity-40 grayscale blur-md scale-95' : 'opacity-100'}`} alt="Base" />
                      {isAnalyzing && (
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-indigo-500/5 backdrop-blur-[2px]">
                          <div className="relative">
                            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                            <div className="absolute inset-0 blur-xl bg-indigo-500/20 animate-pulse" />
                          </div>
                          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Face Analyzing</p>
                        </div>
                      )}
                      {!isAnalyzing && (
                        <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button 
                            onClick={handleDeleteBaseImage}
                            className="p-2 bg-rose-500/20 hover:bg-rose-500/40 border border-rose-500/30 rounded-full text-rose-300 hover:text-rose-100 transition-all shadow-lg backdrop-blur-md"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center gap-6">
                      <div className="w-16 h-16 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center group-hover:bg-zinc-800 transition-all">
                        <Upload className="w-6 h-6 text-zinc-700 group-hover:text-indigo-500 transition-colors" />
                      </div>
                      <div className="text-center">
                        <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Upload Portrait</p>
                        <p className="text-[9px] text-zinc-600 mt-1">RAW / JPEG / PNG</p>
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={onFileUpload('base')} />
                    </label>
                  )}
                </div>
              </div>
              <div className="bg-zinc-900/30 border border-white/5 rounded-[40px] overflow-hidden flex flex-col relative shadow-2xl backdrop-blur-sm">
                <div className="py-2.5 px-5 border-b border-white/5 flex justify-between items-center bg-white/5">
                  <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Synthetic Output</h3>
                </div>
                <div className="flex-1 bg-black relative flex items-center justify-center group overflow-hidden">
                  <PreviewCanvas 
                    image={isComparing ? state.baseImage : generatedImage} 
                    loading={isGenerating} 
                    onDownload={handleDownload} 
                    onClick={() => { if (galleryImages.length > 0) setSelectedHistoryIndex(0); }}
                  />
                  {isComparing && (
                    <div className="absolute top-4 left-4 px-3 py-1 bg-zinc-950/80 backdrop-blur-md border border-white/10 rounded-full text-[9px] font-black text-white tracking-widest uppercase z-20">Original Base</div>
                  )}
                  {generatedImage && (
                    <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                      <button onClick={handleDownload} className="p-2.5 bg-zinc-900/80 hover:bg-zinc-800 backdrop-blur-md border border-white/10 rounded-full text-zinc-300 hover:text-white transition-all shadow-xl" title="Download">
                        <Download className="w-4 h-4" />
                      </button>
                      <button onClick={handleUseAsBase} className="p-2.5 bg-zinc-900/80 hover:bg-zinc-800 backdrop-blur-md border border-white/10 rounded-full text-zinc-300 hover:text-white transition-all shadow-xl" title="Set as Base">
                        <ImageIcon className="w-4 h-4" />
                      </button>
                      <button 
                        onMouseDown={() => setIsComparing(true)}
                        onMouseUp={() => setIsComparing(false)}
                        onMouseLeave={() => setIsComparing(false)}
                        className="p-2.5 bg-zinc-900/80 hover:bg-zinc-800 backdrop-blur-md border border-white/10 rounded-full text-zinc-300 hover:text-white transition-all shadow-xl"
                        title="Compare"
                      >
                        {isComparing ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button onClick={() => { if (galleryImages.length > 0) setSelectedHistoryIndex(0); }} className="p-2.5 bg-zinc-900/80 hover:bg-zinc-800 backdrop-blur-md border border-white/10 rounded-full text-zinc-300 hover:text-white transition-all shadow-xl" title="Expand">
                        <Maximize2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Start Synthesis Button */}
            <button 
              onClick={handleGenerate} 
              disabled={isGenerating || !state.baseImage} 
              className={`w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl font-black text-sm tracking-[0.2em] transition-all shrink-0 ${isGenerating || !state.baseImage ? 'bg-zinc-900 text-zinc-600 cursor-not-allowed border border-white/5' : 'bg-indigo-600 hover:bg-indigo-500 text-white active:scale-95 shadow-2xl shadow-indigo-600/40 border border-indigo-400/30'}`}
            >
              {isGenerating ? <div className="w-5 h-5 border-[3px] border-white/30 border-t-white rounded-full animate-spin" /> : <Zap className="w-5 h-5 fill-current" />}
              {isGenerating ? 'SYNTHESIZING...' : 'START SYNTHESIS'}
            </button>

            {/* History Grid */}
            <div className="bg-zinc-900/30 border border-white/5 rounded-[32px] p-4 flex flex-col gap-3 shadow-2xl backdrop-blur-sm shrink-0 mb-8">
              <div className="flex items-center justify-between px-2 shrink-0">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5" />
                  {currentGuestNumber ? `Guest History: ${currentGuestNumber}` : 'Guest History'}
                </h3>
                <div className="flex items-center gap-4">
                  {galleryImages.length > itemsPerPage && (
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                        disabled={historyPage === 1}
                        className="p-1 text-zinc-500 hover:text-white disabled:opacity-30 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-[10px] font-bold text-zinc-400">
                        {historyPage} / {Math.ceil(galleryImages.length / itemsPerPage)}
                      </span>
                      <button 
                        onClick={() => setHistoryPage(p => Math.min(Math.ceil(galleryImages.length / itemsPerPage), p + 1))}
                        disabled={historyPage === Math.ceil(galleryImages.length / itemsPerPage)}
                        className="p-1 text-zinc-500 hover:text-white disabled:opacity-30 transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto px-2 pb-2">
                {!currentGuestNumber && (
                  <div className="h-full flex items-center justify-center text-xs text-zinc-600 italic">Enter a Guest ID to view or save history.</div>
                )}
                {currentGuestNumber && galleryImages.length === 0 && (
                  <div className="h-full flex items-center justify-center text-xs text-zinc-600 italic">No images saved yet.</div>
                )}
                {galleryImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-3 auto-rows-max">
                    {galleryImages.slice((historyPage - 1) * itemsPerPage, historyPage * itemsPerPage).map((item, idx) => (
                      <div 
                        key={item.id} 
                        className="relative group rounded-2xl overflow-hidden border border-white/10 hover:border-indigo-500/50 transition-colors bg-zinc-900/50 flex flex-col"
                      >
                        <div className="aspect-[3/4] relative overflow-hidden">
                          <img 
                            src={item.image} 
                            className="w-full h-full object-cover object-top cursor-pointer" 
                            alt="history" 
                            onClick={() => setSelectedHistoryIndex((historyPage - 1) * itemsPerPage + idx)}
                          />
                          <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                const link = document.createElement('a');
                                link.href = item.image;
                                link.download = `beautysynth-history-${item.id}.png`;
                                link.click();
                              }}
                              className="p-2 bg-black/60 hover:bg-black/80 backdrop-blur-md rounded-full text-white transition-all"
                              title="Save"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSetBaseImage(item.image);
                              }}
                              className="p-2 bg-black/60 hover:bg-black/80 backdrop-blur-md rounded-full text-white transition-all"
                              title="Set Base"
                            >
                              <ImageIcon className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteHistoryItem((historyPage - 1) * itemsPerPage + idx);
                              }}
                              className="p-2 bg-black/60 hover:bg-rose-500/80 backdrop-blur-md rounded-full text-white transition-all"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="p-3 flex flex-col gap-1 border-t border-white/5">
                          <p className="text-[10px] font-bold text-zinc-300 truncate uppercase tracking-wider">
                            {item.state?.skin?.tone ? `SKIN: ${item.state.skin.tone}` : 'BEAUTYSYNTH PRO'}
                          </p>
                          <p className="text-[9px] text-zinc-500">
                            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Guest Login / API Key Modal */}
      {loginModalMode && (
        <GuestLoginModal
          mode={loginModalMode}
          initialPin={currentGuestNumber}
          onLogin={handleLogin}
          onClose={loginModalMode === 'both' && !hasApiKey ? undefined : () => setLoginModalMode(null)}
        />
      )}

      {/* History Full-Screen Modal */}
      {selectedHistoryIndex !== null && galleryImages[selectedHistoryIndex] && (
        <div className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-xl flex animate-in fade-in duration-200">
          {/* Navigation Left */}
          <button 
            onClick={() => setSelectedHistoryIndex(prev => prev !== null && prev > 0 ? prev - 1 : prev)}
            disabled={selectedHistoryIndex === 0}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white disabled:opacity-0 transition-colors z-50"
          >
            <ChevronLeft className="w-12 h-12" />
          </button>

          {/* Navigation Right */}
          <button 
            onClick={() => setSelectedHistoryIndex(prev => prev !== null && prev < galleryImages.length - 1 ? prev + 1 : prev)}
            disabled={selectedHistoryIndex === galleryImages.length - 1}
            className="absolute right-[416px] top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white disabled:opacity-0 transition-colors z-50"
          >
            <ChevronRight className="w-12 h-12" />
          </button>

          {/* Close Button */}
          <button onClick={() => setSelectedHistoryIndex(null)} className="absolute top-6 right-[424px] p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-50">
            <X className="w-6 h-6" />
          </button>

          {/* Left: Image Viewer */}
          <div className="flex-1 flex flex-col items-center justify-center relative p-12 pr-[400px]">
            <div className="relative max-w-full max-h-full rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center">
              <img 
                src={isHistoryComparing && galleryImages[selectedHistoryIndex].originalImage ? galleryImages[selectedHistoryIndex].originalImage : galleryImages[selectedHistoryIndex].image} 
                className="max-w-full max-h-[85vh] object-contain" 
                alt="History Large" 
              />
              {galleryImages[selectedHistoryIndex].originalImage && (
                <button 
                  onMouseDown={() => setIsHistoryComparing(true)}
                  onMouseUp={() => setIsHistoryComparing(false)}
                  onMouseLeave={() => setIsHistoryComparing(false)}
                  className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-black text-white bg-black/60 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 hover:bg-black/80 transition-all active:scale-95 flex items-center gap-2 uppercase tracking-widest select-none shadow-2xl"
                >
                  {isHistoryComparing ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />} 
                  HOLD TO COMPARE
                </button>
              )}
            </div>
          </div>

          {/* Right: Details Panel */}
          <div className="w-[400px] bg-zinc-900 border-l border-white/10 flex flex-col h-full overflow-y-auto absolute right-0 top-0 bottom-0 shadow-2xl">
            <div className="p-8 border-b border-white/5 flex flex-col gap-6 sticky top-0 bg-zinc-900/90 backdrop-blur-md z-10">
              <div>
                <h2 className="text-xl font-black text-white tracking-tight uppercase">Generation Details</h2>
                <p className="text-xs text-zinc-500 mt-1">{new Date(galleryImages[selectedHistoryIndex].timestamp).toLocaleString()}</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = galleryImages[selectedHistoryIndex].image;
                    link.download = `beautysynth-history-${Date.now()}.png`;
                    link.click();
                  }}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs tracking-widest transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" /> SAVE
                </button>
                <button 
                  onClick={() => {
                    handleSetBaseImage(galleryImages[selectedHistoryIndex].image);
                    setSelectedHistoryIndex(null);
                  }}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs tracking-widest transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <ImageIcon className="w-4 h-4" /> SET BASE
                </button>
              </div>
            </div>

            <div className="p-8 flex flex-col gap-8">
              {/* Applied Settings Categories */}
              {galleryImages[selectedHistoryIndex].state ? (
                <>
                  <HistoryCategory 
                    title="Skin" 
                    data={galleryImages[selectedHistoryIndex].state.skin} 
                    onApply={() => {
                      updateState({ skin: galleryImages[selectedHistoryIndex].state.skin });
                      alert("Skin settings applied!");
                    }} 
                  />
                  <HistoryCategory 
                    title="Face Features" 
                    data={galleryImages[selectedHistoryIndex].state.features} 
                    onApply={() => {
                      updateState({ features: galleryImages[selectedHistoryIndex].state.features });
                      alert("Face feature settings applied!");
                    }} 
                  />
                  <HistoryCategory 
                    title="Hair" 
                    data={galleryImages[selectedHistoryIndex].state.hair} 
                    onApply={() => {
                      updateState({ hair: galleryImages[selectedHistoryIndex].state.hair });
                      alert("Hair settings applied!");
                    }} 
                  />
                  <HistoryCategory 
                    title="Makeup" 
                    data={galleryImages[selectedHistoryIndex].state.makeup} 
                    onApply={() => {
                      updateState({ makeup: galleryImages[selectedHistoryIndex].state.makeup });
                      alert("Makeup settings applied!");
                    }} 
                  />
                </>
              ) : (
                <div className="text-sm text-zinc-500 italic">Detailed settings are not available for this older image.</div>
              )}

              {galleryImages[selectedHistoryIndex].analysis && (
                <div className="mt-4">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-3">AI Analysis</h4>
                  <div className="bg-black/40 p-4 rounded-xl border border-white/5 text-[11px] leading-relaxed text-zinc-400 whitespace-pre-wrap">
                    {galleryImages[selectedHistoryIndex].analysis}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const HistoryCategory = ({ title, data, onApply }: { title: string, data: any, onApply: () => void }) => {
  if (!data) return null;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">{title}</h4>
        <button onClick={onApply} className="text-[9px] font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-full hover:bg-indigo-500/20 transition-colors uppercase tracking-widest">
          Apply
        </button>
      </div>
      <div className="bg-white/5 rounded-xl p-4 grid grid-cols-2 gap-y-3 gap-x-4">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="flex flex-col">
            <span className="text-[9px] text-zinc-500 uppercase tracking-wider">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
            <span className="text-xs font-medium text-zinc-200 truncate">{String(value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
