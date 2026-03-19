
import { FacialFeatures, MakeupFeatures, HairFeatures } from './types';

export const HELP_CONTENT = {
  skin: {
    title: "✨ 피부 & 베이스 가이드",
    desc: `
[1. Base Tone & Age]
• 스킨 톤: 퍼스널 컬러(13호~31호) 및 언더톤 기반 선택
• 피부 나이 (Age):
  - 0~20: 모공이 없는 '베이비 스킨'
  - 80~100: 중후한 주름이 있는 '머추어 스킨'

[2. Texture & Quality]
• 윤광 (Glow): 
  - 0~30: 보송한 벨벳/매트 피니쉬
  - 70~100: 스킨케어 직후의 물광/오일광
• 잡티 (Blemish): 수치를 높일수록 주근깨, 모공 등 리얼한 피부 질감
• 텍스처 스타일:
  - Glass: 결점 없는 유리알 광택
  - Freckles: 주근깨가 있는 자연스러운 소녀 감성
  - Radiant: 속부터 차오르는 고급스러운 속광`
  },
  face: {
    title: "👁️ 페이스 스컬핑 가이드",
    desc: `
[1. Eyes & Brows]
• 이마 높이 (Forehead): 헤어라인의 위치 조절 (낮을수록 좁은 이마)
• 눈썹 모양 (Shape):
  - Standard: 표준 눈썹
  - High Arch: 높은 아치
• 쌍꺼풀 (Eyelid): 무쌍, 인아웃, 아웃라인(서구적)
• 눈 크기 (Size): 눈의 전체적인 개방감
• 눈매 교정 (Tilt): 강아지상 ↔ 고양이상

[2. Nose & Lips]
• 코 (Nose): 콧대 높이(Bridge) 및 코볼 너비(Width) 조절
• 입술 (Lips): 입술 전체 볼륨 조절
• 인중 (Cupid's): 입술산 선명도
• 입꼬리 (Corners): 0(무표정) ↔ 100(미소)

[3. Face Shape]
• 턱 높이 (Chin Height): 턱 끝의 수직 기장 조절 (낮을수록 짧은 턱)
• 턱선 선명도 (Sharpness): 턱 밑 살 제거 및 음영 강조
• 얼굴 너비 (Width): 얼굴 전체 가로 폭 조절
• 광대 (Cheekbone): 사선 광대 강조
• 턱 모양 (Jaw Shape): 브이라인 ↔ 각진 귀족턱`
  },
  hair: {
    title: "💇‍♀️ 헤어 스튜디오 가이드",
    desc: `
[1. Cut & Style]
• 기장 (Length): 픽시 / 리프 / 태슬 / 롱
• 텍스처 (Texture): 슬릭 / 빌드 / 히피 / 히메
• 앞머리 (Bangs): 시스루, 풀뱅, 사이드뱅

[2. Quality & Volume]
• 볼륨 (Volume): 뿌리 볼륨 및 풍성함
• 윤기 (Shine): 매트 ↔ 엔젤링 살롱 광택`
  },
  makeup: {
    title: "💄 메이크업 아티스트 가이드",
    desc: `
[1. Base & Concept]
• 스타일 프리셋: 2025 트렌드 룩 즉시 적용

[2. Eye Makeup]
• 아이라인 (Eyeliner): 사이렌, 캣아이, 스모키 등
• 속눈썹 (Lashes): 아이돌 가닥속눈썹 등
• 렌즈 (Lenses): 써클렌즈, 컬러렌즈 등 패션 렌즈 착용
  - Natural: 홍채 색상만 자연스럽게 변경
  - Circle: 눈동자가 커 보이는 또렷한 테두리
  - Vibrant: 화려하고 선명한 발색의 컬러 렌즈
  - Exotic: 신비롭고 이국적인 혼혈 렌즈 스타일

[3. Cheek & Shading]
• 블러셔: 앞볼, 사이드, 가로형 스타일 조절

[4. Lip & Finish]
• 립 피니쉬: 탕후루 광택, 매트 블러, 오버립`
  }
};

export const SKIN_TONES = [
  { id: 'porcelain', label: '백옥 (13-17호)', color: '#fff0e5', prompt: "pale porcelain skin" },
  { id: 'fair', label: '라이트 (21호)', color: '#f3e5d0', prompt: "fair skin with pink undertone" },
  { id: 'natural', label: '내추럴 (23호)', color: '#e6c8a9', prompt: "natural warm beige skin" },
  { id: 'medium', label: '미디엄 (25호)', color: '#d2b48c', prompt: "medium healthy skin" },
  { id: 'tanned', label: '태닝 (31호+)', color: '#c68e62', prompt: "bronze tanned skin" },
  { id: 'deep', label: '딥 다크', color: '#8d5524', prompt: "rich deep skin tone" }
];

export const FOUNDATION_CATEGORIES = [
  { id: 'none', label: '기본' },
  { id: 'caucasian', label: '백인/밝은톤' },
  { id: 'asian', label: '아시아인/중간톤' },
  { id: 'latin', label: '남미/미디엄톤' },
  { id: 'black', label: '흑인/딥톤' }
];

export const FOUNDATION_SHADES = [
  { id: 'none', category: 'none', label: '미지정', color: 'transparent', prompt: 'original skin tone' },
  { id: '13', category: 'caucasian', label: '13호 페일', color: '#fff5ed', prompt: 'Foundation No. 13 (Ultra Pale Ivory)' },
  { id: '17', category: 'caucasian', label: '17호 포슬린', color: '#ffefe1', prompt: 'Foundation No. 17 (Porcelain)' },
  { id: '19', category: 'caucasian', label: '19호 바닐라', color: '#fce6d4', prompt: 'Foundation No. 19 (Light Vanilla Beige)' },
  { id: '21', category: 'asian', label: '21호 아이보리', color: '#f8dec8', prompt: 'Foundation No. 21 (Fair Ivory)' },
  { id: '22', category: 'asian', label: '22호 페탈', color: '#f4d5bc', prompt: 'Foundation No. 22 (Warm Petal Beige)' },
  { id: '23', category: 'asian', label: '23호 베이지', color: '#eccfb4', prompt: 'Foundation No. 23 (Natural Beige)' },
  { id: '25', category: 'latin', label: '25호 샌드', color: '#dcb898', prompt: 'Foundation No. 25 (Sand Tan)' },
  { id: '27', category: 'latin', label: '27호 앰버', color: '#cda17d', prompt: 'Foundation No. 27 (Amber Medium)' },
  { id: '29', category: 'latin', label: '29호 시나몬', color: '#b98b66', prompt: 'Foundation No. 29 (Cinnamon Deep Tan)' },
  { id: '31', category: 'black', label: '31호 너트멕', color: '#a0714f', prompt: 'Foundation No. 31 (Nutmeg Deep)' },
  { id: '33', category: 'black', label: '33호 브론즈', color: '#85583a', prompt: 'Foundation No. 33 (Bronze Espresso)' },
  { id: '35', category: 'black', label: '35호 에스프레소', color: '#613d29', prompt: 'Foundation No. 35 (Rich Dark Espresso)' }
];

export const SKIN_TEXTURES = [
  { id: 'Smooth', label: '매끈 결광', prompt: "flawless smooth texture" },
  { id: 'Glass Skin', label: '물광/탕후루', prompt: "extreme glass skin, wet look" },
  { id: 'Velvet', label: '벨벳 매트', prompt: "soft velvet matte finish" },
  { id: 'Freckles', label: '주근깨/소녀', prompt: "natural freckles on cheeks" },
  { id: 'Radiant', label: '속광/윤기', prompt: "inner radiant glow" }
];

export const HAIR_LENGTHS = [
  { id: 'pixie', label: '픽시/숏컷' },
  { id: 'leaf', label: '리프컷' },
  { id: 'bob', label: '태슬/단발' },
  { id: 'medium', label: '중단발/거지존' },
  { id: 'long', label: '롱 레이어드' },
  { id: 'extra_long', label: '수퍼 롱(허리)' }
];

export const HAIR_TEXTURES = [
  { id: 'straight', label: '슬릭 (생머리)' },
  { id: 'c_curl', label: 'C컬/빌드펌' },
  { id: 's_curl', label: 'S컬/엘리자벳' },
  { id: 'grace_perm', label: '그레이스 (여신웨이브)' },
  { id: 'jelly', label: '젤리/물결펌' },
  { id: 'hippie', label: '히피/포그펌' },
  { id: 'hershey', label: '허쉬/울프컷' },
  { id: 'hime', label: '히메컷' }
];

export const BANG_STYLES = [
  { id: 'none', label: '없음 (여신머리)' },
  { id: 'see_through', label: '시스루 뱅' },
  { id: 'full_blunt', label: '풀 뱅' },
  { id: 'side', label: '사이드 뱅' },
  { id: 'choppy', label: '처피 뱅' },
  { id: 'onion', label: '잔머리 뱅' }
];

export const EYEBROW_STYLES = [
  { id: 'standard', label: '표준형 (Oval)' },
  { id: 'high_arch', label: '높은 아치 (Round)' },
  { id: 'straight', label: '일자형 (Oblong)' },
  { id: 'curved', label: '둥근형 (Square)' },
  { id: 'thin', label: '얇은형 (Triangle)' },
  { id: 'soft_arch', label: '부드운 아치 (Diamond)' }
];

export const EYELINER_STYLES = [
  { id: 'none', label: '없음' },
  { id: 'tightline', label: '투명/점막' },
  { id: 'classic', label: '클래식 윙 (Daily)' }, 
  { id: 'puppy', label: '강아지 (Down)' },      
  { id: 'cat', label: '캣아이 (Up)' },          
  { id: 'siren', label: '사이렌/여우 (Fox)' },  
  { id: 'bold', label: '볼드 그래픽 (Bold)' },  
  { id: 'smoky', label: '스모키 (Smudge)' }     
];

export const EYELASH_STYLES = [
  { id: 'natural', label: '내추럴' },
  { id: 'mascara', label: '롱래쉬 마스카라' },
  { id: 'idol', label: '아이돌 가닥' },
  { id: 'volume', label: '풍성한 볼륨' },
  { id: 'under', label: '언더래쉬 포인트' }
];

export const LENS_STYLES = [
  { id: 'none', label: '미착용' },
  { id: 'natural', label: '내추럴 컬러' },
  { id: 'circle', label: '써클 렌즈' },
  { id: 'vibrant', label: '비비드 컬러' },
  { id: 'exotic', label: '이국적/혼혈' }
];

export const BLUSH_STYLES = [
  { id: 'none', label: '없음' },
  { id: 'apples', label: '앞볼 (소녀)' },
  { id: 'side', label: '사이드 (쉐이딩)' },
  { id: 'drunken', label: '숙취/가로' },
  { id: 'sunburn', label: '그을린 듯' }
];

export const LIP_STYLES = [
  { id: 'matte_blur', label: '블러 매트' },
  { id: 'glossy_tanghulu', label: '탕후루 광택' },
  { id: 'gradient', label: '그라데이션' },
  { id: 'overlip', label: '오버립 (필러)' },
  { id: 'mlbb', label: 'MLBB 자연' }
];

export const HAIR_COLOR_PRESETS = [
  { color: '#1a1a1a', label: '블랙' },
  { color: '#3d251e', label: '다크 브라운' },
  { color: '#5a3825', label: '애쉬 브라운' },
  { color: '#8b4513', label: '초코' },
  { color: '#c4a484', label: '블론드' },
  { color: '#b22222', label: '레드 와인' },
  { color: '#ff7f50', label: '코랄 오렌지' },
  { color: '#ffb6c1', label: '파스텔 핑크' },
  { color: '#4b0082', label: '딥 퍼플' },
  { color: '#708090', label: '애쉬 그레이' }
];

export const MAKEUP_STYLES = [
  { id: 'Custom Look', label: '직접 설정 (Custom)' },
  { id: 'Luminous Glass', label: '2025 루미너스 글래스' },
  { id: 'Office Siren', label: '2025 오피스 사이렌' },
  { id: 'Sunset Gradient', label: '2025 선셋 그라데이션' },
  { id: 'Coquette Doll', label: '2025 코퀘트 돌' },
  { id: 'Cyber Mauve', label: '2025 사이버 모브' },
  { id: 'Monochrome Peach', label: '2025 모노크롬 피치' }
];

const EYEBROW_COLORS = [
  { color: '#1C1C1C', label: '#1 Ebony (블랙)' },
  { color: '#DCD0BA', label: '#2 Blonde (블론드)' },
  { color: '#4B3621', label: '#3 Chocolate (초코)' },
  { color: '#33261D', label: '#4 Dark Brown (다크)' },
  { color: '#8B6954', label: '#5 Soft Brown (소프트)' },
  { color: '#776A5F', label: '#10 Ash Brown (애쉬)' },
  { color: '#7B3F00', label: '#8 Auburn (적갈색)' },
  { color: '#9E9E9E', label: '#11 Granite (그레이)' }
];

export const MAKEUP_PRESETS = {
  eyeshadow: [
    { color: '#e0ac9d', label: '말린장미' },
    { color: '#d2b48c', label: '진저/음영' },
    { color: '#f5deb3', label: '샴페인' },
    { color: '#8b4513', label: '딥 브라운' },
    { color: '#ffb6c1', label: '쿨톤 핑크' },
    { color: '#708090', label: '스모키 그레이' },
    { color: '#bca0dc', label: '모브 라벤더' }
  ],
  eyebrow: EYEBROW_COLORS,
  lipstick: [
    { color: '#b91c1c', label: '칠리 레드' },
    { color: '#fb923c', label: '피치 코랄' },
    { color: '#db2777', label: '마젠타 핑크' },
    { color: '#a855f7', label: '플럼/모브' },
    { color: '#d6b6a0', label: '누드 베이지' },
    { color: '#800000', label: '딥 버건디' },
    { color: '#9b7653', label: '토프 브라운' }
  ],
  blush: [
    { color: '#fca5a5', label: '피치' },
    { color: '#f472b6', label: '로즈' },
    { color: '#fdba74', label: '애프리콧' },
    { color: '#e5e7eb', label: '하이라이터' },
    { color: '#d8bfd8', label: '모브 블러셔' }
  ],
  lens: [
    { color: '#5d4037', label: '초코 브라운' },
    { color: '#78909c', label: '애쉬 그레이' },
    { color: '#455a64', label: '딥 블루' },
    { color: '#2e7d32', label: '올리브 그린' },
    { color: '#9e9e9e', label: '실버 그레이' },
    { color: '#795548', label: '헤이즐넛' },
    { color: '#607d8b', label: '스카이 블루' }
  ]
};

export const INITIAL_FEATURES: FacialFeatures = {
  eyeSize: 50,
  lipThickness: 50,
  noseWidth: 50,
  eyelidType: 'Double',
  jawlineSharpness: 50,
  canthalTilt: 50,
  jawShape: 50,
  cheekboneHeight: 50,
  faceWidth: 50,
  eyeDistance: 50,
  noseBridge: 50,
  mouthCorners: 50,
  lipCupidBow: 50,
  chinHeight: 50,
  foreheadHeight: 50
};

export const INITIAL_HAIR: HairFeatures = {
  hairStyle: 'Custom Look',
  hairLength: 'long',
  hairTexture: 'grace_perm',
  bangStyle: 'none',
  hairVolume: 60,
  hairShine: 50,
  isGradient: false,
  hairColorTop: '#3d251e',
  hairColorBottom: '#3d251e',
  hairColorBoundary: 50
};

export const INITIAL_MAKEUP: MakeupFeatures = {
  makeupStyle: 'Custom Look',
  foundationTone: 'none',
  eyebrowStyle: 'standard',
  eyebrowColor: '#4B3621',
  eyelinerStyle: 'tightline',
  eyelashStyle: 'natural',
  eyeshadowColor: '#e0ac9d',
  eyelinerIntensity: 30,
  blushStyle: 'apples',
  blushColor: '#fca5a5',
  blushIntensity: 30,
  contourIntensity: 20,
  lipStyle: 'glossy_tanghulu',
  lipColor: '#fb923c',
  lipstickGloss: 40,
  lensStyle: 'none',
  lensColor: '#5d4037'
};
