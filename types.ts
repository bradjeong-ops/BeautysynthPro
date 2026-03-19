

export interface FacialFeatures {
  eyeSize: number;
  lipThickness: number;
  noseWidth: number;
  eyelidType: 'Monolid' | 'Double' | 'Hooded';
  jawlineSharpness: number;
  canthalTilt: number; // eyeTilt
  jawShape: number;
  cheekboneHeight: number;
  faceWidth: number;
  eyeDistance: number;
  noseBridge: number;
  mouthCorners: number;
  lipCupidBow: number;
  chinHeight: number;
  foreheadHeight: number;
}

export interface SkinFeatures {
  tone: string;
  texture: string[];
  skinAge: number;
  glowIntensity: number;
  blemishIntensity: number;
}

export interface HairFeatures {
  hairStyle: string;
  hairLength: 'pixie' | 'leaf' | 'bob' | 'medium' | 'long' | 'extra_long';
  // Fixed: Added 'grace_perm' to the allowed union type for hairTexture
  hairTexture: 'straight' | 'c_curl' | 's_curl' | 'jelly' | 'hippie' | 'hershey' | 'hime' | 'grace_perm';
  bangStyle: 'none' | 'see_through' | 'full_blunt' | 'side' | 'choppy' | 'onion';
  hairVolume: number;
  hairShine: number;
  isGradient: boolean;
  hairColorTop: string;
  hairColorBottom: string;
  hairColorBoundary: number;
}

export interface MakeupFeatures {
  makeupStyle: string;
  foundationTone: string;
  eyebrowStyle: 'standard' | 'high_arch' | 'straight' | 'curved' | 'thin' | 'soft_arch';
  eyebrowColor: string;
  eyelinerStyle: 'none' | 'tightline' | 'classic' | 'puppy' | 'cat' | 'siren' | 'bold' | 'smoky';
  eyelashStyle: 'natural' | 'mascara' | 'idol' | 'volume' | 'under';
  eyeshadowColor: string;
  eyelinerIntensity: number;
  blushStyle: 'none' | 'apples' | 'side' | 'drunken' | 'sunburn';
  blushColor: string;
  blushIntensity: number;
  contourIntensity: number;
  lipStyle: 'matte_blur' | 'glossy_tanghulu' | 'gradient' | 'overlip' | 'mlbb';
  lipColor: string;
  lipstickGloss: number;
  lensStyle: 'none' | 'natural' | 'circle' | 'vibrant' | 'exotic';
  lensColor: string;
}

export interface CustomPreset {
  id: string;
  name: string;
  config: Partial<MakeupFeatures>;
}

export interface BeautyState {
  baseImage: string | null;
  referenceImages: {
    face: string | null;
    skin: string | null;
    hair: string | null;
    makeup: string | null;
  };
  features: FacialFeatures;
  skin: SkinFeatures;
  hair: HairFeatures;
  makeup: MakeupFeatures;
  customMakeupPresets: CustomPreset[];
  customPrompts: {
    face: string;
    skin: string;
    hair: string;
    makeup: string;
  };
  editModes: {
    face: boolean;
    skin: boolean;
    hair: boolean;
    makeup: boolean;
  };
  aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9";
  baseline?: {
    features: Partial<FacialFeatures>;
    skin: Partial<SkinFeatures>;
    hair?: {
      hairLength: HairFeatures['hairLength'];
      hairTexture: HairFeatures['hairTexture'];
    };
    makeup?: Partial<MakeupFeatures>;
  };
}

export enum TabType {
  FEATURES = 'FEATURES',
  SKIN = 'SKIN',
  HAIR = 'HAIR',
  MAKEUP = 'MAKEUP'
}

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}
