
import { GoogleGenAI, Type } from "@google/genai";
import { BeautyState } from "../types";
import { 
  SKIN_TONES, SKIN_TEXTURES, INITIAL_MAKEUP, 
  BANG_STYLES, MALE_BANG_STYLES, FOUNDATION_SHADES, INITIAL_FEATURES 
} from "../constants";

export const validateApiKey = async (apiKey: string): Promise<boolean> => {
  try {
    const ai = new GoogleGenAI({ apiKey });
    // Make a lightweight request to verify the key
    await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "ping",
      config: { maxOutputTokens: 1 }
    });
    return true;
  } catch (error) {
    console.error("API Key validation failed:", error);
    return false;
  }
};

const STYLE_DESCRIPTIONS: Record<string, string> = {
  'standard': 'standard soft eyebrow shape, natural oval arch',
  'high_arch': 'high arched eyebrows, sharp peak for a defined lift',
  'straight': 'K-beauty straight eyebrows, youthful linear shape',
  'curved': 'softly curved rounded eyebrows to soften angular features',
  'thin': 'thin and sleek 90s style elongated eyebrows',
  'soft_arch': 'soft angular arch peak suitable for diamond faces',
  'natural': 'natural length and volume eyelashes',
  'mascara': 'defined separated lashes with professional black mascara',
  'idol': 'K-pop idol style clumped spikes lashes, dolly effect',
  'volume': 'thick voluminous glamorous lashes',
  'under': 'emphasized lower lashes for big-eye expansion',
  'none': 'bare natural appearance without any makeup or liner',
  'tightline': 'invisible tightline filling only the upper waterline',
  'classic': 'classic natural winged eyeliner following eye shape',
  'puppy': 'downward puppy eyeliner for a sweet innocent look',
  'cat': 'sharp upward feline cat-eye lift',
  'siren': 'siren eyes fox definition with sharp inner corners',
  'bold': 'bold graphic thick black winged liner',
  'smoky': 'softly smudged and diffused smoky liner',
  'natural_lens': 'natural contact lenses that subtly enhance the iris color',
  'circle_lens': 'circle lenses with a defined outer ring to make eyes appear larger and more doll-like',
  'vibrant_lens': 'vibrant colored contact lenses with high pigment and clear patterns',
  'exotic_lens': 'exotic multi-tone contact lenses for a mystical, non-human or mixed-heritage eye look'
};

const HAIR_TEXTURE_DESCRIPTIONS: Record<string, string> = {
  'straight': 'sleek pin-straight hair with zero frizz',
  'c_curl': 'soft C-curl build perm with inward-curved ends',
  's_curl': 'elegant S-curl wavy layers',
  'grace_perm': 'elegant, voluminous S-curve waves with a soft flowing goddess perm silhouette',
  'jelly': 'tight jelly perm with consistent water-wave ripples',
  'hippie': 'bold hippie perm with tight kinky curls and maximum texture',
  'hershey': 'shaggy layered hershey cut with wispy textured ends',
  'hime': 'Japanese hime cut with sharp cheek-length side-locks',
  'volume': 'voluminous perm with soft root lift and natural flow',
  'shadow': 'shadow perm with textured, slightly messy layers',
  'garma': 'garma perm with a natural parted style and soft waves',
  'as_perm': 'as perm with a natural, flowing texture and slight curl',
  'spin_swallow': 'spin swallow perm with sharp, twisted, and edgy curls',
  'leaf': 'leaf cut with long, flowing layers resembling a leaf shape',
  'dandy': 'dandy cut with a neat, clean, and smooth texture',
  'crop': 'crop cut with very short, textured, and forward-swept hair',
  'ivy_league': 'ivy league cut with short sides and a slightly longer, styled top',
  'regent': 'regent cut with the front hair swept up and back boldly',
  'pomade': 'pomade style with a sleek, slicked-back or side-parted look',
  'two_block': 'two-block cut with shaved sides and a longer, disconnected top'
};

const getSliderAdjective = (value: number, type: string): string => {
  const isExtremeHigh = value >= 85;
  const isHigh = value >= 65 && value < 85;
  const isLow = value <= 35 && value > 15;
  const isExtremeLow = value <= 15;

  if (isExtremeHigh) {
    switch (type) {
      case 'faceWidth': return "EXTREMELY BROAD; expansive and powerful facial architecture";
      case 'jawlineSharpness': return "HYPER-DEFINED; razor-sharp, bone-deep jaw definition";
      case 'jawShape': return "STRONG SQUARE JAW; sharp L-line masculine/aristocratic bone structure";
      case 'eyeSize': return "EXTREME ENLARGEMENT; massive doll-like eyes, wide-open aperture";
      case 'lipThickness': return "MAXIMUM PLUMP; significant volume, extremely full and thick lips";
      case 'noseWidth': return "PRONOUNCED WIDE; strong, broad nasal base";
      case 'canthalTilt': return "MAXIMUM UPWARD LIFT; aggressive feline/siren eye tilt, outer corner significantly higher than inner";
      case 'cheekboneHeight': return "EXTREME HIGH-PROJECTION; dramatic skeletal couture-model cheekbones";
      case 'eyeDistance': return "ULTRA WIDE-SET; expansive distance between eyes";
      case 'noseBridge': return "TALL PROMINENT BRIDGE; very high Grecian profile";
      case 'mouthCorners': return "EXTREME UPTURN; dramatic permanent smile expression. Morph only the corner contours, keep lip color intact.";
      case 'lipCupidBow': return "EXTREME M-SHAPE; sharp, pointed, deep cupid's bow peaks";
      case 'skinAge': return "VERY MATURE; deep realistic wrinkles and textured skin";
      case 'chinHeight': return "EXTREMELY ELONGATED CHIN; significantly longer lower face vertically";
      case 'foreheadHeight': return "ULTRA-HIGH FOREHEAD; push the hairline significantly back/upwards to expand the upper face area dramatically";
    }
  }

  if (isHigh) {
    switch (type) {
      case 'faceWidth': return "noticeably broad and wider facial frame";
      case 'jawlineSharpness': return "sharply defined and clear jawline shadow";
      case 'jawShape': return "clearly defined angular jaw structure";
      case 'eyeSize': return "larger, more expressive eyes";
      case 'lipThickness': return "noticeably fuller and thicker lips";
      case 'noseWidth': return "broad and stronger nose shape";
      case 'canthalTilt': return "clearly upturned and lifted outer eye corners, sharp feline look";
      case 'cheekboneHeight': return "pronounced and high cheekbone definition";
      case 'eyeDistance': return "noticeably wide-set eye positioning";
      case 'noseBridge': return "strong and elevated nasal bridge";
      case 'mouthCorners': return "cheerfully upturned lip corners into a smile. Morph geometric lines only.";
      case 'lipCupidBow': return "well-defined and sharp cupid's bow";
      case 'skinAge': return "showing mature texture and light character lines";
      case 'chinHeight': return "slightly longer chin and lower face";
      case 'foreheadHeight': return "tall forehead; recede the hairline slightly to increase forehead height";
    }
  }

  if (isExtremeLow) {
    switch (type) {
      case 'faceWidth': return "ULTRA-SLENDER; physically very narrow, fragile delicate skull";
      case 'jawlineSharpness': return "COMPLETE SOFT-FOCUS; no bone definition, rounded transition to neck";
      case 'jawShape': return "FULL ROUNDED LOWER FACE; complete absence of bone, chubby youthful curves, maximum facial fat";
      case 'eyeSize': return "MINIMALIST; very small, tight, or heavily hooded eyes";
      case 'lipThickness': return "ULTRA-THIN; nearly invisible vertical lip height, very narrow";
      case 'noseWidth': return "EXTREMELY PINCHED; needle-thin nasal base and nostrils";
      case 'canthalTilt': return "MAXIMUM DOWNWARD ROTATION; outer eye corner is lower than inner corner. Keep eyes alert.";
      case 'cheekboneHeight': return "TOTAL MIDFACE FULLNESS; flat bone structure, fully rounded fleshy cheeks with no skeletal protrusion";
      case 'eyeDistance': return "ULTRA CLOSE-SET; eyes positioned very close to the nose";
      case 'noseBridge': return "FLAT BUTTON NOSE; nearly absent nasal bridge profile";
      case 'skinAge': return "PORCELAIN SMOOTH; zero texture, fetal-level blur and softness";
      case 'chinHeight': return "ULTRA-SHORT CHIN; extremely compact lower face with the chin tucked upwards significantly";
      case 'foreheadHeight': return "MINIMAL FOREHEAD; lower the hairline significantly towards the eyebrows to compress the upper face vertically";
    }
  }

  if (isLow) {
    switch (type) {
      case 'faceWidth': return "noticeably narrow and slim facial shape";
      case 'jawlineSharpness': return "soft and rounded jawline transition";
      case 'jawShape': return "youthful, round, and soft jaw profile with fuller cheeks";
      case 'eyeSize': return "smaller, subtle aesthetic eyes";
      case 'lipThickness': return "slim and thin lip appearance";
      case 'noseWidth': return "narrow and petite nose width";
      case 'canthalTilt': return "downward rotated eye axis; outer corner lower than inner corner.";
      case 'cheekboneHeight': return "smooth and soft midface with minimal bone projection and added facial volume";
      case 'eyeDistance': return "close-set eye positioning";
      case 'noseBridge': return "low and soft nasal bridge";
      case 'skinAge': return "very smooth and youthful skin appearance";
      case 'chinHeight': return "shorter, more compact chin and lower face area";
      case 'foreheadHeight': return "low hairline; pull the hair roots down to shorten the vertical forehead length";
    }
  }

  return `neutral/standard ${type}`;
};

const getDiffFeaturePrompt = (current: number, baseline: number | undefined, type: string): string => {
  if (baseline === undefined) return `FIXED: Strictly maintain current ${type}.`;
  const diff = current - baseline;
  const absDiff = Math.abs(diff);
  
  if (absDiff < 5) return `FIXED: Strictly keep the original ${type} unchanged.`;

  let intensityVerb = "slightly adjust";
  if (absDiff > 40) intensityVerb = "DRAMATICALLY OVERHAUL and EXAGGERATE";
  else if (absDiff > 20) intensityVerb = "SIGNIFICANTLY MORPH";
  else intensityVerb = "NOTICEABLY modify";

  const prefix = type === 'foreheadHeight' ? "HAIRLINE REPOSITIONING: " : "MORPH GEOMETRY: ";

  return `${prefix}${intensityVerb} the ${type} to be ${getSliderAdjective(current, type)}. IMPORTANT: Only change the structural shape, do not alter surface colors or makeup pigments in this area.`;
};

const getApiKey = (): string => {
  try {
    const customKey = localStorage.getItem('custom_gemini_api_key');
    if (customKey) return customKey;
  } catch (e) {}
  const env = (import.meta as any).env || {};
  const proc = (globalThis as any).process?.env || {};
  return env.VITE_GEMINI_API_KEY || env.VITE_API_KEY || 
         proc.GEMINI_API_KEY || proc.API_KEY || 
         process.env.GEMINI_API_KEY || process.env.API_KEY || "";
};

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

let isProQuotaExceeded = false;
let quotaExceededCallback: (() => void) | null = null;

export const setQuotaExceededCallback = (callback: () => void) => {
  quotaExceededCallback = callback;
};

async function retryWithBackoff<T>(fn: (model: string) => Promise<T>, preferredModel: string, retries = 3, backoff = 2000): Promise<T> {
  const isProModel = preferredModel.includes('pro');
  let currentModel = (isProQuotaExceeded && isProModel) ? 'gemini-3-flash-preview' : preferredModel;
  
  try {
    return await fn(currentModel);
  } catch (error: any) {
    const errorStr = JSON.stringify(error);
    const isQuotaExceeded = 
      error?.status === 'RESOURCE_EXHAUSTED' || 
      error?.code === 429 || 
      error?.error?.code === 429 ||
      (error?.message && (
        error.message.includes('429') || 
        error.message.includes('quota') || 
        error.message.includes('RESOURCE_EXHAUSTED')
      )) ||
      errorStr.includes('429') ||
      errorStr.includes('quota') ||
      errorStr.includes('RESOURCE_EXHAUSTED');
    
    if (isQuotaExceeded && isProModel && !currentModel.includes('flash')) {
      console.warn("Gemini Pro quota exceeded, falling back to Gemini 3 Flash.");
      isProQuotaExceeded = true;
      if (quotaExceededCallback) quotaExceededCallback();
      // Reset retries for the fallback model
      return retryWithBackoff(fn, 'gemini-3-flash-preview', 3, backoff);
    }

    if (retries > 0 && isQuotaExceeded) {
      console.warn(`Resource exhausted, retrying in ${backoff}ms...`);
      await delay(backoff);
      return retryWithBackoff(fn, currentModel, retries - 1, backoff * 2);
    }
    throw error;
  }
}

export const analyzeImageAttributes = async (base64Image: string) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.error("Gemini API Key is missing. Please check your environment variables.");
    throw new Error("API Key missing");
  }

  const ai = new GoogleGenAI({ apiKey });
  const [header, data] = base64Image.split(';base64,');
  const mimeType = header.split(':')[1];
  try {
    return await retryWithBackoff(async (model) => {
      const response = await ai.models.generateContent({
        model: model,
        contents: { 
          parts: [
            { inlineData: { data, mimeType } }, 
            { text: `Detailed anatomical facial analysis. First, detect the gender of the subject ('female' or 'male'). Then determine facial and skin percentages as INTEGERS between 0 and 100 (e.g., 50, 85). Return ONLY JSON.` }
          ] 
        },
        config: { 
          responseMimeType: "application/json", 
          responseSchema: { 
            type: Type.OBJECT, 
            properties: { 
              gender: { type: Type.STRING, enum: ["female", "male"], description: "Detected gender of the subject" },
              skinTone: { type: Type.NUMBER, description: "Skin tone percentage 0-100" }, 
              skinAge: { type: Type.NUMBER, description: "Skin age percentage 0-100" }, 
              eyeSize: { type: Type.NUMBER, description: "Eye size percentage 0-100" }, 
              eyeTilt: { type: Type.NUMBER, description: "Eye tilt percentage 0-100" }, 
              noseBridge: { type: Type.NUMBER, description: "Nose bridge height percentage 0-100" }, 
              noseWidth: { type: Type.NUMBER, description: "Nose width percentage 0-100" }, 
              faceWidth: { type: Type.NUMBER, description: "Face width percentage 0-100" }, 
              cheekboneHeight: { type: Type.NUMBER, description: "Cheekbone height percentage 0-100" }, 
              jawShape: { type: Type.NUMBER, description: "Jaw shape percentage 0-100" }, 
              lipFullness: { type: Type.NUMBER, description: "Lip fullness percentage 0-100" }, 
              hairLength: { type: Type.STRING, enum: ["short", "medium", "long"] }, 
              hairTexture: { type: Type.STRING, enum: ["straight", "curly", "wavy"] },
              eyebrowStyle: { type: Type.STRING, enum: ["standard", "high_arch", "straight", "curved", "thin", "soft_arch"] },
              eyebrowColor: { type: Type.STRING, description: "Hex color of eyebrows" },
              eyelinerStyle: { type: Type.STRING, enum: ["none", "tightline", "classic", "puppy", "cat", "siren", "bold", "smoky"] },
              eyelashStyle: { type: Type.STRING, enum: ["natural", "mascara", "idol", "volume", "under"] },
              eyeshadowColor: { type: Type.STRING, description: "Hex color of eyeshadow" },
              blushStyle: { type: Type.STRING, enum: ["none", "apples", "side", "drunken", "sunburn"] },
              blushColor: { type: Type.STRING, description: "Hex color of blush" },
              lipStyle: { type: Type.STRING, enum: ["matte_blur", "glossy_tanghulu", "gradient", "overlip", "mlbb"] },
              lipColor: { type: Type.STRING, description: "Hex color of lips" },
              lensStyle: { type: Type.STRING, enum: ["none", "natural", "circle", "vibrant", "exotic"] },
              lensColor: { type: Type.STRING, description: "Hex color of contact lenses" }
            }, 
            required: [
              "skinTone", "skinAge", "eyeSize", "eyeTilt", "noseBridge", "noseWidth", 
              "faceWidth", "cheekboneHeight", "jawShape", "lipFullness", "hairLength", 
              "hairTexture", "eyebrowStyle", "eyebrowColor", "eyelinerStyle", 
              "eyelashStyle", "eyeshadowColor", "blushStyle", "blushColor", 
              "lipStyle", "lipColor", "lensStyle", "lensColor"
            ] 
          } 
        }
      });
      return JSON.parse(response.text || '{}');
    }, 'gemini-3.1-pro-preview');
  } catch (error) { 
    console.error("Image analysis error:", error);
    throw error; 
  }
};

export const analyzeResultingAesthetics = async (base64Image: string): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) return "API Key missing";
  
  const ai = new GoogleGenAI({ apiKey });
  const [header, data] = base64Image.split(';base64,');
  const mimeType = header.split(':')[1];
  try {
    return await retryWithBackoff(async (model) => {
      const response = await ai.models.generateContent({
        model: model,
        contents: {
          parts: [
            { inlineData: { data, mimeType } },
            { text: "Analyze this beauty portrait and provide a high-quality, professional photography prompt that describes it. Focus on model characteristics, skin texture, lighting, camera settings (like lens), and overall mood. The output should be a single, detailed paragraph." }
          ]
        }
      });
      return response.text || "Analysis unavailable.";
    }, 'gemini-3.1-pro-preview');
  } catch (error) {
    console.error("Aesthetics analysis error:", error);
    return "Result Analysis failed.";
  }
};

export const generateBeautyPrompt = (state: BeautyState): string => {
  const { features, skin, hair, makeup, editModes, baseline, referenceImages, customPrompts } = state;
  const activeCategories = Object.entries(editModes).filter(([_, active]) => active).map(([name]) => name);
  const isTargetedEdit = activeCategories.length > 0;

  let faceIns = "";
  if (isTargetedEdit && !editModes.face) {
    faceIns = "ABSOLUTE EXPRESSION LOCK: The subject's current facial expression and mouth closure must remain 100% UNCHANGED.";
  } else if (referenceImages.face) {
    faceIns = "ANATOMICAL CLONING: Replicate exact bone structure from FACIAL REF.";
  } else {
    const mods: string[] = [];
    const keys = ['eyeSize', 'canthalTilt', 'noseBridge', 'lipThickness', 'noseWidth', 'jawlineSharpness', 'cheekboneHeight', 'faceWidth', 'eyeDistance', 'jawShape', 'mouthCorners', 'lipCupidBow', 'chinHeight', 'foreheadHeight'];
    keys.forEach(k => mods.push(getDiffFeaturePrompt((features as any)[k], (baseline?.features as any)?.[k], k)));
    
    const browShape = makeup.eyebrowStyle !== INITIAL_MAKEUP.eyebrowStyle 
      ? `EYEBROW SHAPE: ${STYLE_DESCRIPTIONS[makeup.eyebrowStyle]}` 
      : "EYEBROW SHAPE: Preserve original eyebrow arch.";
    mods.push(browShape);
    
    faceIns = `STRUCTURAL MODIFICATION: ${mods.join(" | ")}. Maintain all facial expressions exactly. ${customPrompts.face ? `CUSTOM FACE NOTE: ${customPrompts.face}` : ''}`;
  }

  let makeIns = "";
  if (isTargetedEdit && !editModes.makeup) {
    makeIns = "STRICT LOCK: Preserve all existing makeup and colors exactly as in base image.";
  } else if (referenceImages.makeup) {
    makeIns = "MAKEUP TRANSFER: Copy exact makeup from MAKEUP REF.";
  } else {
    const baseMakeup = baseline?.makeup || INITIAL_MAKEUP;
    
    const isFoundationModified = makeup.foundationTone !== baseMakeup.foundationTone;
    const isEyelinerModified = makeup.eyelinerStyle !== baseMakeup.eyelinerStyle;
    const isEyelashModified = makeup.eyelashStyle !== baseMakeup.eyelashStyle;
    const isLipModified = makeup.lipColor !== baseMakeup.lipColor || makeup.lipStyle !== baseMakeup.lipStyle;
    const isBlushModified = (makeup.blushStyle !== baseMakeup.blushStyle) || (Math.abs(makeup.blushIntensity - (baseMakeup.blushIntensity || 0)) > 5);
    const isContourModified = Math.abs(makeup.contourIntensity - (baseMakeup.contourIntensity || 0)) > 10;
    const isEyebrowColorModified = makeup.eyebrowColor.toUpperCase() !== baseMakeup.eyebrowColor?.toUpperCase();
    const isLensModified = makeup.lensStyle !== baseMakeup.lensStyle || makeup.lensColor !== baseMakeup.lensColor;

    let foundationPrompt = "GLOBAL PIGMENT LOCK: Strictly maintain original skin tone and base color balance. Do not introduce red or orange hues to unchanged areas.";
    if (isFoundationModified) {
      if (makeup.foundationTone === 'none') {
        foundationPrompt = "Foundation: Revert to original raw skin tone.";
      } else {
        const preset = FOUNDATION_SHADES.find(s => s.id === makeup.foundationTone);
        foundationPrompt = preset 
          ? `Foundation: Apply ${preset.prompt} across all skin areas evenly.` 
          : `Foundation: Apply custom shade ${makeup.foundationTone} to the skin.`;
      }
    }
      
    const eyebrowColorPrompt = isEyebrowColorModified
      ? `EYEBROW ARTISTRY: Apply ${makeup.eyebrowColor} pigment EXCLUSIVELY to the eyebrow hairs using a soft natural feathered gradient (lighter inner start, denser arch). DO NOT allow color to bleed into surrounding skin.`
      : "Eyebrow Color: STRICTLY PRESERVE original eyebrow color and texture from base image.";

    const eyelinerPrompt = isEyelinerModified 
      ? `Liner: ${STYLE_DESCRIPTIONS[makeup.eyelinerStyle]}.` 
      : "Liner: STRICTLY PRESERVE original eyeliner from base image.";
      
    const lashPrompt = isEyelashModified 
      ? `Lashes: ${STYLE_DESCRIPTIONS[makeup.eyelashStyle]}.` 
      : "Lashes: STRICTLY PRESERVE original eyelashes from base image.";

    const lipPrompt = isLipModified 
      ? `Lips: Apply ${makeup.lipColor} pigment in ${makeup.lipStyle} style. Keep the application EXCLUSIVELY to the lip area. DO NOT let lip saturation affect the brightness or intensity of the cheek blush or general skin tone.` 
      : "Lips: STRICTLY PRESERVE original lip color and texture from base image.";

    const blushPrompt = isBlushModified 
      ? `Blush: Apply a sheer, translucent wash of ${makeup.blushColor} in ${makeup.blushStyle} style at precisely ${makeup.blushIntensity}% intensity. Ensure the edges are extremely diffused and soft. CRITICAL: This blush should remain independent; do not darken or intensify it even if vibrant lip colors are present.` 
      : "Blush: STRICTLY PRESERVE original cheek color and blush from base image.";

    const contourPrompt = isContourModified 
      ? `Contour: Add ${makeup.contourIntensity}% depth shading.` 
      : "Contour: STRICTLY PRESERVE original facial shadows and contour.";

    const lensPrompt = isLensModified
      ? `Lenses: Apply ${makeup.lensColor} contact lenses in ${makeup.lensStyle === 'natural' ? 'natural_lens' : makeup.lensStyle === 'circle' ? 'circle_lens' : makeup.lensStyle === 'vibrant' ? 'vibrant_lens' : 'exotic_lens'} style. The eyes should have a clear, glassy reflection and realistic iris texture.`
      : "Lenses: STRICTLY PRESERVE original eye color and iris pattern from base image.";

    makeIns = `SELECTIVE MAKEUP LAYERING: ${foundationPrompt} ${eyebrowColorPrompt} ${eyelinerPrompt} ${lashPrompt} ${ lensPrompt} ${ lipPrompt} ${blushPrompt} ${contourPrompt}. ${customPrompts.makeup ? `ARTIST NOTE: ${customPrompts.makeup}` : ''}`;
  }

  let skinIns = "";
  if (isTargetedEdit && !editModes.skin) {
    skinIns = "STRICT LOCK: Maintain original skin texture and absolute color values.";
  } else if (referenceImages.skin) {
    skinIns = "DERMAL CLONE: Replicate skin texture from SKIN REF.";
  } else {
    let skinStyle = SKIN_TEXTURES.find(t => t.id === skin.texture[0])?.prompt || "smooth skin";
    
    // Anti-Redness Logic for Freckles
    if (skin.texture.includes('Freckles')) {
      skinStyle = "Add delicate, fine-point melanin freckles EXCLUSIVELY as small discrete dots on the cheeks and bridge of the nose. IMPORTANT: Do not change the underlying skin tone to red or tanned; maintain the original baseline skin color temperature and saturation exactly.";
    }

    skinIns = `DERMATOLOGY: ${SKIN_TONES.find(t => t.id === skin.tone)?.prompt}. Texture Enhancement: ${skinStyle}. Glow: ${skin.glowIntensity}%, Age: ${skin.skinAge}%, Blemish: ${skin.blemishIntensity}%. ${customPrompts.skin ? `SKIN NOTE: ${customPrompts.skin}` : ''}`;
  }

  let hairIns = "";
  if (isTargetedEdit && !editModes.hair) {
    hairIns = "STRICT LOCK: No hair changes.";
  } else if (referenceImages.hair) {
    hairIns = "HAIR REPLACEMENT: Copy from HAIR REF.";
  } else {
    const bangList = state.gender === 'male' ? MALE_BANG_STYLES : BANG_STYLES;
    const selectedBang = bangList.find(b => b.id === hair.bangStyle)?.label || 'none';
    const textureDesc = HAIR_TEXTURE_DESCRIPTIONS[hair.hairTexture] || hair.hairTexture;
    const colorPrompt = hair.isGradient 
      ? `Gradient Color: Starting with ${hair.hairColorTop} at roots, transitioning at ${hair.hairColorBoundary}% to ${hair.hairColorBottom} at the ends.`
      : `Solid Uniform Color: ${hair.hairColorTop} from roots to ends. No variation in hue.`;

    if (hair.hairLength === 'buzz') {
      hairIns = `HAIR: Extremely short buzz cut (shaved head, military style). No bangs, no volume, hair clipped very close to the scalp. ${colorPrompt} ${customPrompts.hair ? `HAIR NOTE: ${customPrompts.hair}` : ''}`;
    } else {
      hairIns = `HAIR: ${hair.hairLength} length with ${textureDesc}. Bangs: ${selectedBang}. ${colorPrompt} Volume: ${hair.hairVolume}%. ${customPrompts.hair ? `HAIR NOTE: ${customPrompts.hair}` : ''}`;
    }
  }

  return `Task: Professional Beauty Retouching for a ${state.gender} subject. 
    CRITICAL MANDATE: Only modify requested features. DO NOT CHANGE OVERALL SKIN COLOR TEMPERATURE OR SATURATION. Each makeup element (eyes, lips, cheeks) must be applied in its own isolated logic without affecting the color balance of others.
    FACIAL STRUCTURE: ${faceIns} 
    MAKEUP (INDEPENDENT LAYERS): ${makeIns}
    SKIN QUALITY: ${skinIns} 
    HAIR: ${hairIns} 
    Output 2K Ultra HD realistic portrait. Ensure the transition between edited spots and the original skin tone is seamless without any global color shifting or over-saturation of pigmented areas.`;
};

export const generateBeautyImage = async (state: BeautyState): Promise<string | null> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.error("Gemini API Key is missing.");
    throw new Error("API Key missing");
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = generateBeautyPrompt(state);
  const parts: { text?: string; inlineData?: { data: string; mimeType: string } }[] = [{ text: prompt }];

  if (state.baseImage) {
    const [header, data] = state.baseImage.split(';base64,');
    parts.push({ text: "SOURCE BASE IMAGE (ABSOLUTE REFERENCE FOR BASE SKIN COLOR, LIGHTING, AND FEATURES)" }, { inlineData: { data, mimeType: header.split(':')[1] } });
  }

  const addRef = (category: keyof typeof state.referenceImages, label: string) => {
    if (state.editModes[category] && state.referenceImages[category]) {
      const [header, data] = state.referenceImages[category]!.split(';base64,');
      parts.push({ text: `${label} REF IMAGE` }, { inlineData: { data, mimeType: header.split(':')[1] } });
    }
  };

  addRef('hair', 'HAIR');
  addRef('makeup', 'MAKEUP');
  addRef('skin', 'SKIN');
  addRef('face', 'FACIAL');

  try {
    return await retryWithBackoff(async (model) => {
      const response = await ai.models.generateContent({ 
        model: model, 
        contents: { parts }, 
        config: { imageConfig: { aspectRatio: state.aspectRatio, imageSize: "2K" } } 
      });
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
      return null;
    }, 'gemini-3.1-flash-image-preview');
  } catch (error) { throw error; }
};
