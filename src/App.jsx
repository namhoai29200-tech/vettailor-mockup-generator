cat > ~/vettailor-mockup-app/src/App.jsx << 'ENDOFFILE'
```

import { useState, useRef, useCallback, useEffect } from "react";

// ════════════════════════════════════════════════════════════
// PLATFORMS (Gemini + OpenAI only)
// ════════════════════════════════════════════════════════════

const PLATFORMS = {
  gemini: { id: "gemini", label: "Google Gemini", icon: "✦", color: "#4285f4", keyPlaceholder: "AIzaSy...", keyHelp: "Free tại aistudio.google.com", keyLink: "https://aistudio.google.com",
    models: [{ id: "gemini-2.5-flash-image", label: "Nano Banana", detail: "Free ~500/day", tier: "free" }, { id: "gemini-3.1-flash-image-preview", label: "Nano Banana 2", detail: "Free · Mới nhất", tier: "free" }, { id: "gemini-3-pro-image-preview", label: "Nano Banana Pro", detail: "$0.134/img", tier: "paid" }] },
  openai: { id: "openai", label: "OpenAI GPT Image", icon: "◎", color: "#10a37f", keyPlaceholder: "sk-...", keyHelp: "Lấy tại platform.openai.com", keyLink: "https://platform.openai.com/api-keys",
    models: [{ id: "gpt-image-1", label: "GPT Image 1", detail: "$0.02-0.19/img", tier: "paid" }, { id: "gpt-image-1-mini", label: "GPT Image 1 Mini", detail: "Rẻ hơn 50-70%", tier: "paid" }] },
};

// ════════════════════════════════════════════════════════════
// UNIFIED OUTPUT SIZES
// ════════════════════════════════════════════════════════════

const OUTPUT_SIZES = [
  { id: "landscape", label: "Landscape 1.91:1 — 1920×1080", px: "1920×1080", ratio: "1.91:1", apiGemini: "1536x1024", apiOpenai: "1536x1024" },
  { id: "square", label: "Square 1:1 — 1200×1200", px: "1200×1200", ratio: "1:1", apiGemini: "1024x1024", apiOpenai: "1024x1024" },
  { id: "portrait", label: "Portrait 4:5 — 960×1200", px: "960×1200", ratio: "4:5", apiGemini: "1024x1536", apiOpenai: "1024x1536" },
  { id: "vertical", label: "Vertical 4:5 — 1080×1350", px: "1080×1350", ratio: "4:5", apiGemini: "1024x1536", apiOpenai: "1024x1536" },
];

// ════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════

const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const pickN = (arr, n) => { const s = [...arr].sort(() => Math.random() - .5); return s.slice(0, Math.min(n, s.length)); };

// ════════════════════════════════════════════════════════════
// 10 MOCKUP STYLES — Core + Variation Pools
// ════════════════════════════════════════════════════════════

const MOCKUP_STYLES = [
  { id: "clean_studio", label: "Clean Studio", icon: "⬜", desc: "E-commerce, PMax, product page", purpose: "Google Shopping, PMax, product page",
    core: "Professional e-commerce product photography, clean minimal background, soft studio lighting, subtle shadow, product centered, high-end catalog feel, crisp and sharp focus, commercial product shot",
    variations: {
      background: ["pure white seamless", "light gray gradient", "warm beige seamless", "soft cream", "pale blue-gray"],
      shadow: ["soft drop shadow", "subtle reflection on surface", "floating feel with no shadow", "contact shadow only", "gentle ambient occlusion"],
      light: ["soft even studio lighting", "slight left key light with fill", "slight right key light with fill", "overhead diffused softbox", "back-lit with soft fill light"],
      surface: ["seamless infinity curve", "faint fabric texture surface", "smooth matte surface", "subtle gradient floor", "clean white platform"]
    }},
  { id: "dark_premium", label: "Dark Premium", icon: "🖤", desc: "Dramatic, luxury, scroll-stopping", purpose: "Meta Feed ads, jacket & hat focus",
    core: "Dramatic low-key product photography, dark moody background, cinematic rim lighting, premium luxury feel, subtle texture in background, high contrast, editorial product shot",
    variations: {
      background: ["dark wood grain surface", "black stone slate", "brushed dark metal", "weathered dark leather", "concrete with dark wash", "subtle smoke haze on black"],
      light: ["warm amber rim light from left", "cold blue rim light from right", "dual-side rim lighting", "single overhead spot with fall-off", "golden backlight with dark fill", "dramatic side slash lighting"],
      tone: ["warm amber tones", "cool steel blue tones", "neutral deep blacks", "moody teal undertone", "rich burgundy accent light"],
      atmosphere: ["clean dark void", "subtle smoke wisps", "dust particles in light beam", "deep vignette edges", "faint bokeh in background"]
    }},
  { id: "patriotic_outdoor", label: "Patriotic Outdoor", icon: "🇺🇸", desc: "Veteran pride, emotional, warm", purpose: "Meta Ads, emotional engagement",
    core: "American patriotic lifestyle setting, warm golden hour natural light, outdoor environment, proud authentic veteran atmosphere, subtle American elements in scene, natural and genuine feel, aspirational yet relatable",
    variations: {
      scene: ["backyard with wooden fence", "front porch of American home", "open country field at sunset", "lakeside dock", "park bench under old oak tree", "rural country road", "tailgate of classic pickup truck", "suburban driveway", "farmhouse setting", "small town Main Street"],
      time: ["golden hour warm side light", "soft early morning light", "bright midday with open shade", "late afternoon warm glow", "overcast soft even light"],
      elements: ["American flag partially visible in background", "red-white-blue color accents in environment", "vintage pickup truck nearby", "wooden fence with flag bunting", "patriotic garden decorations", "classic mailbox with small flag"],
      season: ["lush summer green", "warm autumn colors", "spring bloom flowers", "mild winter bare trees"]
    }},
  { id: "rugged_tactical", label: "Rugged Tactical", icon: "🔧", desc: "Military, gritty, masculine", purpose: "Bomber jacket, leather jacket focus",
    core: "Rugged military-inspired setting, gritty textured environment, strong masculine tone, industrial or tactical backdrop, muted earth tones, authentic and worn-in feel, utilitarian aesthetic",
    variations: {
      setting: ["mechanic garage with tools on wall", "military surplus store interior", "industrial workshop with workbench", "old aircraft hangar", "army barracks style room", "Jeep or military vehicle nearby", "metal warehouse with crates", "wooden ammo crate setup"],
      props: ["dog tags hanging nearby", "combat boots on floor", "military patches on table", "folded American flag", "tool wall in background", "old military maps pinned up", "vintage military radio", "olive drab canvas bags"],
      texture: ["raw concrete floor and walls", "rusted metal surfaces", "worn wooden planks", "canvas and burlap elements", "corrugated steel background", "riveted metal panels"],
      color: ["olive drab and tan palette", "gunmetal and rust tones", "dark earth and khaki", "military green and brown", "faded desert camo tones"]
    }},
  { id: "everyday_casual", label: "Everyday Casual", icon: "☕", desc: "Relatable, approachable, real life", purpose: "Retargeting, broad audience",
    core: "Casual everyday American lifestyle, relaxed natural setting, soft ambient light, approachable and comfortable mood, real-life context, candid and authentic feel, warm and inviting atmosphere",
    variations: {
      scene: ["coffee shop table by window", "living room couch area", "kitchen counter morning scene", "walking in suburban neighborhood", "sitting on front steps of house", "local diner booth", "home office desk", "backyard deck with chair", "local hardware store exterior", "standing by car in parking lot"],
      activity: ["morning coffee moment", "reading newspaper or phone", "casual relaxed conversation setting", "laid-back weekend vibe", "running errands look", "comfortable evening at home"],
      light: ["warm indoor ambient light", "window natural side light", "soft overhead interior lighting", "natural daylight from open doorway", "mixed warm indoor and cool window light"],
      mood: ["cozy and relaxed atmosphere", "quietly confident moment", "laid-back weekend feeling", "calm morning routine", "comfortable evening setting"]
    }},
  { id: "brotherhood", label: "Brotherhood / Group", icon: "🤝", desc: "Veteran community, camaraderie", purpose: "Meta Ads, community engagement",
    core: "Veterans brotherhood gathering, multiple people wearing themed gear together, camaraderie and pride, warm authentic group moment, genuine connection and shared bond, storytelling composition",
    variations: {
      scene: ["backyard BBQ party", "veteran reunion event", "local bar gathering with friends", "fishing trip by lake", "tailgate party before game", "VFW hall meeting", "camping trip around fire", "bowling alley group outing", "golf outing together"],
      dynamic: ["laughing together naturally", "toasting drinks with smiles", "standing shoulder-to-shoulder proud", "sharing a meal at table", "watching game together on TV", "casual group photo pose", "walking together down street"],
      groupSize: ["two close buddies side by side", "small group of 3-4 veterans", "band of brothers gathering of 5-6"],
      atmosphere: ["celebratory and fun energy", "nostalgic and warm bonding", "proud and strong together", "relaxed and casual friendship", "respectful memorial moment"]
    }},
  { id: "seasonal_holiday", label: "Seasonal / Holiday", icon: "🎆", desc: "Memorial Day, Veterans Day, 4th of July", purpose: "Holiday campaign mockups",
    core: "Festive American holiday atmosphere, seasonal decorations and colors, celebratory yet respectful mood, themed environment that honors veterans, seasonal warmth and pride",
    variations: {
      holiday: ["4th of July with fireworks and red-white-blue bunting and sparklers", "Memorial Day with poppies and flags and solemn pride", "Veterans Day with Thank You signs and ceremony setting and salute", "Christmas with warm lights and wreath and fireplace and snow", "Thanksgiving with family table and autumn harvest and gratitude"],
      setting: ["outdoor celebration with decorations", "home decorated for the holiday", "community event gathering", "family gathering indoors", "public ceremony or parade"],
      palette: ["vibrant red-white-blue patriotic", "muted respectful navy and white with flag accents", "warm Christmas red-green-gold with military accent", "autumn orange-brown-cream harvest tones"],
      mood: ["celebratory and festive energy", "solemn and honoring atmosphere", "warm and family-centered feeling", "energetic and patriotic excitement", "grateful and reflective tone"]
    }},
  { id: "flat_lay", label: "Flat Lay Arrangement", icon: "📐", desc: "Overhead styled, Instagram aesthetic", purpose: "Bundle shot, Instagram, upsell",
    core: "Overhead flat lay product arrangement, styled with complementary accessories, organized aesthetic layout, clean surface background, editorial styling, curated collection feel, top-down photography",
    variations: {
      surface: ["light oak wood table", "dark walnut surface", "concrete slab", "white marble with gray veins", "worn leather desk surface", "military olive canvas", "dark slate", "natural linen fabric", "rustic barnwood"],
      accessories: ["aviator sunglasses and classic watch", "dog tags and leather wallet", "American flag patch and pocket knife", "coffee mug and vintage compass", "military challenge coin and old photographs", "brass zippo lighter and worn leather journal", "reading glasses and pen with notepad"],
      layout: ["symmetrical grid arrangement", "casual scattered natural layout", "diagonal arrangement with flow", "centered hero with surrounding items", "L-shape composition", "minimal with lots of negative space"],
      detail: ["fresh coffee with visible steam", "morning newspaper corner visible", "small plant greenery accent", "warm side lighting creating shadows", "slightly overhead angled not perfectly flat"]
    }},
  { id: "urban_veteran", label: "Urban Veteran", icon: "🏙️", desc: "City street, modern, cool", purpose: "Younger veteran audience, modern appeal",
    core: "Urban American street setting, modern city environment, confident streetwear energy mixed with veteran pride, contemporary and cool, natural daylight, editorial street photography feel",
    variations: {
      setting: ["downtown sidewalk with buildings", "brick wall alley backdrop", "colorful city mural behind", "parking structure rooftop", "local diner exterior neon signs", "barber shop storefront", "city park bench", "rooftop with skyline view", "industrial loading dock area"],
      vibe: ["gritty downtown energy", "clean suburban main street", "industrial district aesthetic", "hip neighborhood feel", "classic Americana small town drag", "waterfront boardwalk setting"],
      light: ["harsh midday urban shadows", "golden hour light between buildings", "overcast flat city light", "neon accent glow from storefront", "morning fog diffused city light"],
      energy: ["walking with purpose on sidewalk", "leaning against wall casually", "standing at crosswalk confidently", "sitting on concrete steps relaxed", "looking over shoulder with attitude"]
    }},
  { id: "heritage_vintage", label: "Heritage / Vintage", icon: "📷", desc: "Nostalgia, film look, timeless", purpose: "Storytelling, older veteran audience",
    core: "Vintage Americana aesthetic, nostalgic warm color grading, classic heritage feel, slightly faded film photography look, timeless military pride, retro authenticity, warm analog film tones",
    variations: {
      setting: ["old-school barber shop interior", "vintage diner counter with stools", "classic American car or truck", "wood cabin interior", "front porch with rocking chair", "old gas station roadside", "Route 66 style roadside stop", "antique shop interior", "VFW lodge with memorabilia", "old study with bookshelves"],
      elements: ["old radio on shelf", "vintage military photos on wall", "classic American car in background", "rotary phone on desk", "vinyl records visible", "worn American flag on wall", "vintage toolbox", "framed military medals"],
      filmLook: ["warm Kodak Portra color tones", "slightly desaturated with warm highlights", "golden sepia undertone", "Fuji film greens and blues", "faded Polaroid feel", "cross-processed vintage look"],
      era: ["1950s Americana nostalgia", "1960s military homecoming feel", "1970s road trip aesthetic", "1980s heartland warmth", "timeless era-ambiguous classic"]
    }},
];

function buildMockupPrompt(style, productDesc, sizeInfo) {
  const v = style.variations;
  const parts = [style.core];
  Object.keys(v).forEach(k => parts.push(pick(v[k])));
  parts.push(`Output aspect ratio: ${sizeInfo.ratio} (${sizeInfo.px})`);
  parts.push(`Product: ${productDesc}. The product design, colors, and ALL details must be preserved EXACTLY as shown in the reference image. Do NOT add any text, watermarks, or logos not present in the original.`);
  return parts.join(". ") + ".";
}

// ════════════════════════════════════════════════════════════
// 10 BANNER AD STYLES — Visual Core + Text Rules + Variations
// ════════════════════════════════════════════════════════════

const BANNER_STYLES = [
  { id: "hero_clean", label: "Hero Product — Clean", icon: "⬜", desc: "Product-focused, professional, Google Display", purpose: "Google Display, PMax, product ads",
    core: "Clean professional product advertisement, product takes center stage occupying 60-70% of frame, minimal clean background, soft studio lighting, high-end commercial feel, plenty of breathing space, polished and sharp",
    textRules: "Headline: short 3-6 words, bold clean sans-serif. CTA: clear button style with contrast. Layout: product center or one side, text opposite. Branding: small logo in corner. Text covers max 20% of area.",
    variations: {
      background: ["solid white clean", "light gray soft", "soft warm gradient", "soft cool gradient", "subtle beige texture", "pale navy"],
      layout: ["product left — text right", "product right — text left", "product center — text below", "product center — text above overlay"],
      textColor: ["dark text on light background", "white text with dark accent bar behind", "brand color headline on neutral background"],
      cta: ["solid color rounded button", "outlined button with border", "underlined text link style with arrow", "bold arrow CTA"],
      accent: ["thin color line divider between product and text", "subtle geometric shape behind product", "small badge or tag element near product", "clean with no accent element"]
    }},
  { id: "dark_cinematic", label: "Dark Cinematic", icon: "🖤", desc: "Moody, premium, scroll-stopping", purpose: "Meta Feed ads, dark products",
    core: "Dramatic dark cinematic advertisement, moody low-key lighting, dark rich background with subtle texture, premium luxury feel, high contrast between product and background, editorial and bold, product lit dramatically",
    textRules: "Headline: bold uppercase or elegant serif, white or gold on dark. CTA: bright and prominent on dark background. Layout: product dominant, text integrated into dark areas. Mood: powerful, premium, confident.",
    variations: {
      background: ["dark wood grain", "black concrete", "brushed gunmetal", "dark leather texture", "smoke haze on black", "dark fabric texture", "slate stone", "charcoal gradient"],
      lighting: ["warm amber rim light from left", "cold blue rim light from right", "backlit golden glow", "overhead spot with fall-off", "dual side rim lighting", "golden edge light accent"],
      textPlacement: ["bottom left corner stack", "top right corner minimal", "centered with dark gradient overlay behind text", "split — text top banner and product bottom"],
      accentColor: ["warm gold accents", "cool silver accents", "deep amber accents", "deep red accents", "ice blue accents", "pure white on black only"],
      typography: ["bold industrial sans-serif", "elegant thin serif", "military stencil style", "condensed uppercase block letters"]
    }},
  { id: "patriotic_lifestyle", label: "Patriotic Lifestyle", icon: "🇺🇸", desc: "Emotional, veteran pride, authentic", purpose: "Meta Ads, emotional engagement",
    core: "American patriotic lifestyle advertisement, warm golden natural light, authentic veteran atmosphere, outdoor or American home setting, proud and genuine mood, natural and aspirational, red-white-blue color accents woven into scene naturally",
    textRules: "Headline: emotional pride-driven copy, 5-10 words. CTA: warm and inviting, not aggressive. Layout: lifestyle image dominant, text overlay on area with enough contrast. Branding: small logo blending into composition. Mood: proud, genuine, warm.",
    variations: {
      scene: ["backyard with American flag", "front porch of American home", "country road at sunset", "lakeside with dock", "tailgate of pickup truck", "park with old oak trees", "farmhouse at golden hour", "small town main street", "open field with sunset sky"],
      timeLight: ["golden hour warm side light", "soft morning gentle light", "late afternoon warm glow", "overcast soft even light", "bright midday with open shade"],
      americanElements: ["flag partially visible in background", "red-white-blue bunting decoration", "vintage pickup truck", "wooden fence with small flags", "classic mailbox with flag", "porch swing with cushions"],
      textOverlay: ["semi-transparent dark bar behind text", "text directly on open sky area", "gradient fade from image to solid color panel with text", "text in natural dark shadow zone of image"],
      headlineAngle: ["pride and honor statement", "brotherhood and bond message", "service and sacrifice honor", "family legacy and pride", "everyday hero celebration"]
    }},
  { id: "bold_typography", label: "Bold Typography", icon: "🔤", desc: "Text is hero, product secondary", purpose: "Scroll-stopping Meta Feed",
    core: "Typography-dominant advertisement design, large bold impactful text as the main visual element, product shown smaller as secondary element, strong graphic composition, high contrast, designed to stop the scroll with powerful words",
    textRules: "Headline: HUGE occupying 50-70% of banner, extremely bold or expressive font. CTA: smaller but clear. Layout: text is center of attention, product in corner or beside. Branding: logo integrated into composition. Mood: powerful, confident, instant impact.",
    variations: {
      background: ["solid black", "solid deep navy", "solid army olive green", "dark textured surface", "two-tone bold split color", "solid bold red or orange"],
      typography: ["ultra bold sans-serif massive", "condensed tall capitals", "military stencil rough", "distressed rough texture on text", "clean modern geometric type", "editorial serif bold"],
      layout: ["text stacked centered — product bottom right small", "text left aligned huge — product right", "text diagonal across entire banner", "text wrapping around product shape", "full bleed text — product overlapping"],
      textColor: ["white on dark background", "cream on deep navy", "gold on black", "red on dark background", "all white with one colored accent word"],
      headlineAngle: ["veteran identity bold statement", "military motto style command", "pride declaration strong", "brotherhood call to action", "short punchy 3-word command", "honor and service tribute"]
    }},
  { id: "ugc_authentic", label: "UGC / Authentic", icon: "📱", desc: "Looks real, not like an ad", purpose: "Meta Ads, outperforms polished ads",
    core: "User-generated content style advertisement, looks like a real photo taken by a real person, slightly imperfect and casual, authentic and relatable, not overly designed, natural smartphone photography feel, genuine and trustworthy",
    textRules: "Headline: casual conversational, can use emoji. CTA: gentle not aggressive — 'Check it out' or 'Link in bio' style. Layout: natural photo with casual text overlay. Branding: very light, small watermark at most. Mood: real, friendly, like a friend sharing.",
    variations: {
      photoStyle: ["mirror selfie wearing product proudly", "casual outdoor candid photo", "close-up product held in hand", "flat lay on messy real table naturally", "product packaging just arrived unboxing", "wearing product doing everyday activity"],
      textOverlay: ["handwritten casual font overlay", "iPhone caption style text at bottom", "sticky note overlay graphic", "highlight marker style emphasis", "no-design plain text minimal", "chat bubble style message"],
      imperfection: ["slight natural photo tilt angle", "natural indoor lighting with real shadows", "visible realistic background clutter", "slightly warm phone camera color tone", "slightly cool phone camera tone", "candid not perfectly posed angle"],
      captionAngle: ["excited review — 'Just got this and wow'", "casual flex — 'New favorite piece'", "question to audience — 'Fellow veterans you need this'", "unboxing moment excitement", "recommendation to a friend style", "wearing it daily testimonial"],
      ctaTreatment: ["small subtle text at bottom", "arrow pointing down to link", "simple 'Link below' text", "emoji pointer hand directing", "underlined minimal text"]
    }},
  { id: "sale_promo", label: "Sale / Promotion", icon: "🏷️", desc: "Discount-focused, urgent, conversion", purpose: "Retargeting, seasonal sales, conversion",
    core: "Promotional sale advertisement, clear and bold discount or offer as focal point, product shown alongside the deal, sense of urgency and value, commercial and direct, designed to drive immediate action",
    textRules: "Offer text: LARGEST element in banner. Headline: supports offer with context. CTA: urgent — 'Shop Now', 'Claim Offer'. Layout: offer number is hero, product beside it. Branding: logo present for trust. Urgency element: deadline or scarcity.",
    variations: {
      offerDisplay: ["giant percentage number dominating", "slash-through old price showing new price", "BUY 1 GET 1 bold block letters", "dollar amount OFF with ribbon banner", "circular badge with offer inside", "starburst explosion shape with deal"],
      background: ["solid bold red background", "solid bold orange energy", "dark navy premium", "product photo with color overlay", "dark background with bright offer text", "clean white with bold color accents"],
      layout: ["offer left large — product right", "offer centered huge — product smaller below", "product dominant — offer badge overlapping corner", "horizontal split top offer bottom product", "diagonal dynamic split"],
      urgency: ["ENDS MONDAY deadline text", "LIMITED TIME badge", "WHILE SUPPLIES LAST warning", "TODAY ONLY urgency", "48 HOURS LEFT countdown", "ONLY FEW LEFT scarcity"],
      colorEnergy: ["classic red and white sale", "black and gold premium sale", "navy and orange energetic", "military green and white themed", "red-white-blue patriotic seasonal sale"]
    }},
  { id: "testimonial_proof", label: "Testimonial / Social Proof", icon: "⭐", desc: "Reviews, trust building, real quotes", purpose: "Mid-funnel retargeting, trust building",
    core: "Testimonial-based advertisement, features a real customer quote or review prominently, product shown alongside the testimonial, warm and trustworthy atmosphere, authentic human connection, social proof design",
    textRules: "Quote: prominent position with quote marks or decorative marks. Attribution: name and status (Verified Veteran Buyer), optional star rating. Product: shown beside or below quote. CTA: trust-based — 'Join 5000+ Veterans'. Branding: logo plus trust badge.",
    variations: {
      quoteDisplay: ["large decorative quote marks framing text", "italic serif font elegant quote", "handwritten style authentic quote", "speech bubble graphic design", "highlighted key phrase within quote", "card panel with quote inside bordered"],
      layout: ["quote left side — product right side", "quote above — product below centered", "blurred product background — quote overlay prominent", "full width quote — small product in corner", "split screen even halves"],
      starRating: ["5 gold stars displayed below quote", "star rating prominently above quote", "integrated into attribution line subtle", "large single star with 5/5 text", "no stars — text testimonial only"],
      backgroundMood: ["warm neutral cream and beige", "soft out-of-focus lifestyle behind", "clean white with warm color accent", "dark background with warm lighting", "subtle patriotic hint in background"],
      trustElement: ["Verified Purchase badge visible", "★★★★★ 2000+ Reviews counter", "Trusted by Veterans Nationwide text", "Join X Happy Customers text", "star rating summary graphic"],
      quoteAngle: ["praising quality of product", "emotional pride wearing it daily", "receiving compliments from others", "perfect gift for a veteran", "brotherhood connection wearing it", "wearing it everywhere testimonial"]
    }},
  { id: "collection_bundle", label: "Collection / Bundle", icon: "🛍️", desc: "Multi-product, upsell, higher AOV", purpose: "Upsell, AOV increase, FBT campaign",
    core: "Product collection advertisement, multiple complementary products displayed together as a curated set, organized attractive arrangement, cohesive visual theme across products, bundle value proposition clear, editorial shopping feel",
    textRules: "Headline: collection or bundle concept — 'Complete Your Set'. Pricing: can show bundle savings. CTA: 'Shop the Set', 'Get the Bundle'. Layout: multiple products organized together. Branding: logo plus branch identifier.",
    variations: {
      arrangement: ["clean grid layout organized", "angled overlapping cascade dynamic", "flat lay overhead arrangement", "side-by-side lineup row", "stacked with shadows depth", "diagonal stagger arrangement"],
      background: ["dark wood surface premium", "clean white and gray minimal", "military themed subtle olive canvas", "two-tone split background", "gradient dark to light transition", "dark slate surface"],
      grouping: ["hat plus tee plus accessory full set", "jacket plus hat outerwear duo", "3 different designs same branch lineup", "tee plus hoodie plus hat apparel trio", "mixed accessories spread collection"],
      valueDisplay: ["Save $XX when you bundle text", "slash-through total versus bundle price", "3 for $XX deal text", "Complete Set Special Price badge", "no price — just Shop the Collection text"],
      branchCue: ["branch color accent throughout", "branch emblem subtle in background", "branch name prominent in headline", "color-coded border matching branch", "general veteran no specific branch"]
    }},
  { id: "seasonal_campaign", label: "Seasonal / Holiday Campaign", icon: "🎆", desc: "Memorial Day, Veterans Day, Christmas", purpose: "Time-sensitive holiday campaigns",
    core: "Seasonal holiday campaign advertisement, festive yet respectful atmosphere appropriate to the specific holiday, themed decorations and colors woven into design, celebratory or honoring mood matching the occasion, seasonal pride and connection",
    textRules: "Headline: holiday-specific connecting to veteran pride. Sub-headline: offer or campaign detail. CTA: time-bound urgent — 'Shop Memorial Day Collection'. Layout: holiday atmosphere immediately obvious. Branding: logo plus holiday campaign badge if applicable.",
    variations: {
      holiday: ["4th of July with fireworks and bunting and sparklers and vibrant celebration", "Memorial Day with poppies and flags on graves and solemn pride and remembrance", "Vietnam Veterans Day with service ribbon colors yellow-red and tribute", "Veterans Day with salute and ceremony and Thank You For Your Service", "Christmas with warm lights and wreath and gift giving and red-green-gold"],
      setting: ["outdoor holiday celebration scene", "home decorated for the holiday", "community gathering event", "family indoor celebration", "public ceremony or parade setting"],
      seasonalPlacement: ["holiday elements framing the product", "holiday elements in background only", "holiday elements integrated into text design", "holiday border and accent decorations", "confetti or overlay scattered elements"],
      urgencyStyle: ["Limited Edition exclusive badge", "Only Until specific date deadline", "Holiday Special offer text", "Seasonal Exclusive limited text", "Order by date for delivery guarantee"],
      moodRange: ["celebratory festive high energy", "solemn honoring respectful tone", "warm family-centered feeling", "energetic patriotic excitement", "grateful reflective thoughtful mood"]
    }},
  { id: "storytelling_cinematic", label: "Storytelling / Cinematic", icon: "🎬", desc: "Emotional, brand building, minimal text", purpose: "Top-of-funnel awareness, brand building",
    core: "Cinematic storytelling advertisement, emotionally powerful imagery, movie-poster quality composition, minimal text letting the image speak, atmospheric and evocative, captures a feeling rather than selling a product, aspirational and deeply resonant with veteran identity",
    textRules: "Headline: short powerful poetic — max 5 words. CTA: very subtle or none — can be just logo. Layout: cinematic image fills nearly everything, text overlay extremely minimal. Branding: logo enough for recognition. Mood: deep emotion, lasting impression.",
    variations: {
      scene: ["silhouette of veteran at dramatic sunset", "walking alone on empty road into distance", "standing looking at vast horizon", "hands on railing overlooking landscape", "sitting contemplative on weathered porch", "dog tags hanging in dramatic close-up", "shadow of soldier on wall", "boots on ground with flag behind"],
      lightingMood: ["golden hour epic warm light", "blue hour melancholy cool tones", "dramatic stormy cloudy sky", "backlit powerful silhouette", "soft misty morning atmospheric", "harsh desert sun high contrast"],
      colorGrading: ["warm Kodak film tones nostalgic", "desaturated moody dramatic", "high contrast black and gold", "teal and orange cinematic grade", "soft faded nostalgic warmth", "rich deep shadows with warm highlights"],
      textTreatment: ["small centered at bottom edge", "top left corner minimal and small", "barely visible watermark-style text", "text integrated into open sky space", "logo only no headline text", "single word large but semi-transparent overlay"],
      emotionAngle: ["pride and honor deep feeling", "quiet inner strength moment", "remembrance and reflection", "brotherhood eternal bond", "coming home emotion", "freedom's cost contemplation", "legacy and family connection"]
    }},
];

function buildBannerPrompt(style, productDesc, sizeInfo, opts = {}) {
  const { headline, cta, offer, branch } = opts;
  const v = style.variations;
  const parts = [style.core];
  Object.keys(v).forEach(k => parts.push(pick(v[k])));
  parts.push(style.textRules);
  parts.push(`Output aspect ratio: ${sizeInfo.ratio} (${sizeInfo.px})`);
  parts.push(`Product: ${productDesc}. The product design must be preserved EXACTLY as shown in the reference image.`);
  if (headline) parts.push(`Headline text to use: "${headline}"`);
  else parts.push("Generate an appropriate headline for US veteran audience.");
  parts.push(`CTA text: "${cta || "Shop Now"}"`);
  if (offer) parts.push(`Offer/promotion to display prominently: "${offer}"`);
  if (branch) parts.push(`Military branch: ${branch} — use appropriate branch colors and insignia.`);
  parts.push("All text must be clearly legible, correctly spelled, and readable within 2-3 seconds. Do NOT alter the product design.");
  return parts.join(". ") + ".";
}

// ════════════════════════════════════════════════════════════
// AI PRODUCT ANALYZER (adapted for v3)
// ════════════════════════════════════════════════════════════

function buildAnalyzePrompt(userNotes) {
  return `You are a product photography expert for Vettailor — a US Veterans apparel e-commerce store. Analyze this product image and return a JSON object.

${userNotes ? `USER NOTES:\n${userNotes}\n` : ""}

CUSTOM TEXT REPLACEMENT RULES:
- Replace "CUSTOM TEXT"/"YOUR NAME"/etc → realistic veteran name (JOHNSON, RODRIGUEZ, MITCHELL...)
- Replace "0000"/"0000-0000"/fake years → realistic service years (1975-2003, 1982-2010...)
- Describe product WITH replaced text, not placeholders.

Return ONLY valid JSON:
{
  "productName": "U.S. Army Veteran Eagle All-Over Print T-Shirt",
  "productType": "t-shirt",
  "productColor": "olive-gray with gold and black accents",
  "productDesc": "An olive-gray U.S. Army veteran eagle all-over print t-shirt with bold eagle emblem, dog tags on chest, U.S. Army text, rank chevrons on sleeves, faded American flag background print, all-over sublimation, PAIRED WITH dark fitted jeans and brown leather boots",
  "branch": "U.S. Army",
  "suggestedMockupStyles": ["clean_studio", "dark_premium", "patriotic_outdoor", "rugged_tactical", "flat_lay"],
  "suggestedBannerStyles": ["hero_clean", "dark_cinematic", "patriotic_lifestyle", "sale_promo", "testimonial_proof"],
  "suggestedHeadline": "Built For Those Who Served",
  "suggestedOffer": "BUY 1 GET 1 FREE",
  "customTextReplaced": {"originalText": "CUSTOM TEXT", "replacedWith": "JOHNSON", "originalYears": "0000-0000", "replacedYears": "1975-2003"},
  "targetAudience": "US Army veterans, 40-65 years old"
}

CRITICAL:
1. productDesc MUST include FULL outfit description (shirt+pants+shoes) to prevent shirtless/pantless AI generations
2. Match branch correctly: Army, USMC, Navy, Air Force, Coast Guard, Space Force
3. suggestedMockupStyles: pick 4-6 from: ${MOCKUP_STYLES.map(s => s.id).join(", ")}
4. suggestedBannerStyles: pick 4-6 from: ${BANNER_STYLES.map(s => s.id).join(", ")}
5. ALWAYS replace placeholder text with realistic values
6. suggestedHeadline: short, emotional, veteran-focused`;
}

async function analyzeProduct(geminiKey, imageBase64, mimeType, userNotes) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;
  const body = { contents: [{ role: "user", parts: [{ inline_data: { mime_type: mimeType, data: imageBase64 } }, { text: buildAnalyzePrompt(userNotes) }] }], generationConfig: { responseMimeType: "application/json" } };
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e?.error?.message || `Gemini ${res.status}`); }
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  return JSON.parse(text.replace(/```json|```/g, "").trim());
}

// ════════════════════════════════════════════════════════════
// API ADAPTERS
// ════════════════════════════════════════════════════════════

async function callGemini(key, model, b64, mime, prompt, sig) {
  const parts = [{ text: prompt }];
  if (b64) parts.unshift({ inline_data: { mime_type: mime, data: b64 } });
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ role: "user", parts }], generationConfig: { responseModalities: ["TEXT", "IMAGE"] } }), signal: sig });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e?.error?.message || `Gemini ${res.status}`); }
  const data = await res.json();
  const ps = data?.candidates?.[0]?.content?.parts || [];
  const img = ps.find(p => p.inlineData || p.inline_data);
  if (!img) throw new Error(ps.find(p => p.text)?.text?.slice(0, 120) || "No image returned");
  const d = img.inlineData || img.inline_data;
  return `data:${d.mimeType || d.mime_type};base64,${d.data}`;
}

async function callOpenAI(key, model, b64, mime, prompt, sig, apiSize) {
  const input = [];
  if (b64) input.push({ type: "input_image", image_url: `data:${mime};base64,${b64}` });
  input.push({ type: "input_text", text: prompt });
  const res = await fetch("https://api.openai.com/v1/responses", { method: "POST", signal: sig, headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` }, body: JSON.stringify({ model: "gpt-4.1-mini", input: [{ role: "user", content: input }], tools: [{ type: "image_generation", quality: "low", size: apiSize || "1024x1024" }] }) });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e?.error?.message || `OpenAI ${res.status}`); }
  const data = await res.json();
  const imgOut = (data.output || []).find(o => o.type === "image_generation_call");
  if (!imgOut?.result) throw new Error("OpenAI no image returned");
  return `data:image/png;base64,${imgOut.result}`;
}

async function genImage(plat, key, model, b64, mime, prompt, sig, apiSize) {
  if (plat === "gemini") return callGemini(key, model, b64, mime, prompt, sig);
  if (plat === "openai") return callOpenAI(key, model, b64, mime, prompt, sig, apiSize);
  throw new Error("Unknown platform");
}

// ════════════════════════════════════════════════════════════
// UI HELPERS
// ════════════════════════════════════════════════════════════

function Badge({ status }) {
  const m = { idle: { bg: "#374151", c: "#d1d5db", t: "Chờ" }, generating: { bg: "#7c3aed", c: "#ddd6fe", t: "Đang tạo..." }, success: { bg: "#059669", c: "#a7f3d0", t: "✓ Xong" }, error: { bg: "#dc2626", c: "#fecaca", t: "Lỗi" } };
  const s = m[status] || m.idle;
  return <span style={{ padding: "2px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600, background: s.bg, color: s.c, whiteSpace: "nowrap" }}>{status === "generating" && <span style={{ display: "inline-block", animation: "spin 1s linear infinite", marginRight: 4 }}>◌</span>}{s.t}</span>;
}

function dl(url, name) { const a = document.createElement("a"); a.href = url; a.download = name; document.body.appendChild(a); a.click(); document.body.removeChild(a); }

function Field({ label, value, onChange, placeholder, type = "text", rows }) {
  const Tag = rows ? "textarea" : "input";
  return <div style={{ marginBottom: 10 }}><label style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: 3 }}>{label}</label><Tag className="inp" type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} style={rows ? { fontSize: 12 } : {}} /></div>;
}

// ════════════════════════════════════════════════════════════
// BRANCHES
// ════════════════════════════════════════════════════════════

const BRANCHES = ["", "U.S. Army", "U.S. Navy", "U.S. Marine Corps", "U.S. Air Force", "U.S. Coast Guard", "U.S. Space Force"];

// ════════════════════════════════════════════════════════════
// MAIN APP
// ════════════════════════════════════════════════════════════

const STATUS = { IDLE: "idle", GENERATING: "generating", SUCCESS: "success", ERROR: "error" };

export default function App() {
  // ── Platform ──
  const [plat, setPlat] = useState(() => localStorage.getItem("vt_plat") || "gemini");
  const [keys, setKeys] = useState(() => { try { return JSON.parse(localStorage.getItem("vt_keys") || "{}"); } catch { return {}; } });
  const [showKey, setShowKey] = useState(false);
  const [model, setModel] = useState("");

  // ── Unified size ──
  const [outputSize, setOutputSize] = useState("square");

  // ── Upload & notes ──
  const [imgs, setImgs] = useState([]);
  const [userNotes, setUserNotes] = useState("");

  // ── Mode ──
  const [bannerMode, setBannerMode] = useState(false);

  // ── Mockup state ──
  const [selMockupStyle, setSelMockupStyle] = useState("clean_studio");
  const [productDesc, setProductDesc] = useState("");

  // ── Banner state ──
  const [selBannerStyle, setSelBannerStyle] = useState("hero_clean");
  const [bannerHeadline, setBannerHeadline] = useState("");
  const [bannerCta, setBannerCta] = useState("Shop Now");
  const [bannerOffer, setBannerOffer] = useState("");
  const [bannerBranch, setBannerBranch] = useState("");

  // ── Prompt override ──
  const [promptOverride, setPromptOverride] = useState("");
  const [showPrompt, setShowPrompt] = useState(false);

  // ── Analyze ──
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeResult, setAnalyzeResult] = useState(null);

  // ── Generate ──
  const [genCount, setGenCount] = useState(1);
  const [queue, setQueue] = useState([]);
  const [results, setResults] = useState([]);
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState([]);
  const [prog, setProg] = useState({ c: 0, t: 0 });
  const [tab, setTab] = useState("setup");
  const [delay, setDelay] = useState(4);
  const fileRef = useRef(null);
  const abortRef = useRef(null);
  const logEnd = useRef(null);

  const pf = PLATFORMS[plat];
  const key = keys[plat] || "";
  const sizeInfo = OUTPUT_SIZES.find(s => s.id === outputSize) || OUTPUT_SIZES[1];
  const apiSize = plat === "openai" ? sizeInfo.apiOpenai : sizeInfo.apiGemini;

  useEffect(() => { try { localStorage.setItem("vt_keys", JSON.stringify(keys)); } catch {} }, [keys]);
  useEffect(() => { localStorage.setItem("vt_plat", plat); const ms = PLATFORMS[plat]?.models; if (ms?.length) setModel(ms[0].id); }, [plat]);
  useEffect(() => { logEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [logs]);

  const setKey = v => setKeys(p => ({ ...p, [plat]: v }));
  const log = useCallback((msg, type = "info") => setLogs(p => [...p, { t: new Date().toLocaleTimeString(), msg, type }]), []);

  const onUpload = e => { Array.from(e.target.files).forEach(f => { const r = new FileReader(); r.onload = ev => setImgs(p => [...p, { id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, name: f.name, url: ev.target.result, b64: ev.target.result.split(",")[1], mime: f.type }]); r.readAsDataURL(f); }); e.target.value = ""; };

  // Get current prompt (for preview/override)
  const getCurrentPrompt = () => {
    if (promptOverride) return promptOverride;
    if (bannerMode) {
      const style = BANNER_STYLES.find(s => s.id === selBannerStyle);
      return buildBannerPrompt(style, productDesc || "veteran-themed product", sizeInfo, { headline: bannerHeadline, cta: bannerCta, offer: bannerOffer, branch: bannerBranch });
    } else {
      const style = MOCKUP_STYLES.find(s => s.id === selMockupStyle);
      return buildMockupPrompt(style, productDesc || "veteran-themed product", sizeInfo);
    }
  };

  // ── AI ANALYZE ──
  const handleAnalyze = async (img) => {
    const geminiKey = keys.gemini;
    if (!geminiKey) { log("Cần Gemini API key để phân tích!", "error"); return; }
    setAnalyzing(true); log(`🔍 AI đang phân tích: ${img.name}...`);
    try {
      const r = await analyzeProduct(geminiKey, img.b64, img.mime, userNotes);
      setAnalyzeResult(r);
      if (r.customTextReplaced) {
        const ct = r.customTextReplaced;
        if (ct.originalText) log(`📝 Text: "${ct.originalText}" → "${ct.replacedWith}"`);
        if (ct.originalYears) log(`📅 Years: "${ct.originalYears}" → "${ct.replacedYears}"`);
      }
      if (r.productDesc) setProductDesc(r.productDesc);
      else if (r.productName) setProductDesc(`${r.productColor || ""} ${r.productName}. ${r.productVisualDesc || ""}`.trim());
      if (r.branch) setBannerBranch(r.branch);
      if (r.suggestedHeadline) setBannerHeadline(r.suggestedHeadline);
      if (r.suggestedOffer) setBannerOffer(r.suggestedOffer);
      if (r.suggestedMockupStyles?.length) setSelMockupStyle(r.suggestedMockupStyles[0]);
      if (r.suggestedBannerStyles?.length) setSelBannerStyle(r.suggestedBannerStyles[0]);
      setPromptOverride("");
      log(`✅ ${r.productName} (${r.productType}) — ${r.branch || "General"}`, "success");
      log(`🎯 Mockup: ${r.suggestedMockupStyles?.join(", ")} | Banner: ${r.suggestedBannerStyles?.join(", ")}`, "info");
    } catch (err) { log(`❌ ${err.message}`, "error"); }
    setAnalyzing(false);
  };

  // ── GENERATE ──
  const startGen = async () => {
    if (!key) return log("Chưa nhập API Key!", "error");
    if (!imgs.length) return log("Chưa upload ảnh!", "error");

    const q = [];
    const styleId = bannerMode ? selBannerStyle : selMockupStyle;
    const styleObj = bannerMode ? BANNER_STYLES.find(s => s.id === styleId) : MOCKUP_STYLES.find(s => s.id === styleId);

    imgs.forEach(img => {
      for (let i = 0; i < genCount; i++) {
        const prompt = promptOverride || (bannerMode
          ? buildBannerPrompt(styleObj, productDesc || "veteran-themed product", sizeInfo, { headline: bannerHeadline, cta: bannerCta, offer: bannerOffer, branch: bannerBranch })
          : buildMockupPrompt(styleObj, productDesc || "veteran-themed product", sizeInfo));
        q.push({ id: `${img.id}_${styleId}_${i}`, img, label: `${styleObj.label} #${i + 1}`, prompt, styleId, idx: i });
      }
    });

    setQueue(q.map(i => ({ ...i, status: STATUS.IDLE, result: null, error: null })));
    setResults([]); setRunning(true); setTab("generate"); setProg({ c: 0, t: q.length });
    const ctrl = new AbortController(); abortRef.current = ctrl;
    log(`🚀 ${q.length} ${bannerMode ? "banners" : "mockups"} · ${pf.label} · ${model} · ${sizeInfo.px}`);

    const u = q.map(i => ({ ...i, status: STATUS.IDLE }));
    let ok = 0;

    for (let i = 0; i < q.length; i++) {
      if (ctrl.signal.aborted) { log("⏹ Dừng.", "warn"); break; }
      u[i] = { ...u[i], status: STATUS.GENERATING }; setQueue([...u]); setProg({ c: i + 1, t: q.length });

      // Rebuild prompt each iteration for fresh random variations (unless overridden)
      let prompt = q[i].prompt;
      if (!promptOverride && i > 0) {
        prompt = bannerMode
          ? buildBannerPrompt(styleObj, productDesc || "veteran-themed product", sizeInfo, { headline: bannerHeadline, cta: bannerCta, offer: bannerOffer, branch: bannerBranch })
          : buildMockupPrompt(styleObj, productDesc || "veteran-themed product", sizeInfo);
      }

      const b64 = q[i].img.b64;
      const fullPrompt = PLATFORMS[plat]?.supportsImageInput !== false ? prompt : `${prompt}\n\nProduct: ${q[i].img.name}`;
      log(`[${i + 1}/${q.length}] ${q[i].img.name} → ${q[i].label}`);

      try {
        const url = await genImage(plat, key, model, b64, q[i].img.mime, fullPrompt, ctrl.signal, apiSize);
        u[i] = { ...u[i], status: STATUS.SUCCESS, result: url };
        setResults(p => [...p, { id: q[i].id, url, src: q[i].img.name, type: q[i].label, styleId: q[i].styleId }]);
        ok++; log(`✅ ${q[i].label}`, "success");
      } catch (err) {
        if (err.name === "AbortError") break;
        u[i] = { ...u[i], status: STATUS.ERROR, error: err.message }; log(`❌ ${err.message}`, "error");
        if (err.message.match(/429|quota|rate/i)) {
          log("⏳ Rate limit — 30s...", "warn"); await new Promise(r => setTimeout(r, 30000));
          if (ctrl.signal.aborted) break;
          try {
            const url = await genImage(plat, key, model, b64, q[i].img.mime, fullPrompt, ctrl.signal, apiSize);
            u[i] = { ...u[i], status: STATUS.SUCCESS, result: url, error: null };
            setResults(p => [...p, { id: q[i].id, url, src: q[i].img.name, type: q[i].label, styleId: q[i].styleId }]);
            ok++; log(`✅ Retry OK`, "success");
          } catch (re) { if (re.name === "AbortError") break; log(`❌ ${re.message}`, "error"); }
        }
      }
      setQueue([...u]);
      if (i < q.length - 1 && !ctrl.signal.aborted) await new Promise(r => setTimeout(r, delay * 1000));
    }
    setRunning(false); log(`🏁 ${ok}/${q.length} thành công.`);
  };

  const dlAll = () => results.forEach((r, i) => setTimeout(() => dl(r.url, `vettailor_${r.styleId}_${i + 1}_${r.src.replace(/\.[^.]+$/, "")}.png`), i * 400));
  const total = imgs.length * genCount;

  const tabs = [
    { id: "setup", l: "Setup", i: "⚙️" },
    { id: "upload", l: "Upload", i: "📤" },
    { id: "style", l: bannerMode ? "Banner Style" : "Mockup Style", i: bannerMode ? "🎯" : "🎨" },
    { id: "generate", l: "Generate", i: "🚀" },
    { id: "results", l: `Results${results.length ? ` (${results.length})` : ""}`, i: "🖼️" },
  ];

  const currentStyles = bannerMode ? BANNER_STYLES : MOCKUP_STYLES;
  const currentSel = bannerMode ? selBannerStyle : selMockupStyle;
  const setCurrentSel = bannerMode ? setSelBannerStyle : setSelMockupStyle;

  return (
    <div style={{ fontFamily: "'Segoe UI',-apple-system,system-ui,sans-serif", background: "linear-gradient(145deg,#0a0a15,#111827,#0f172a)", color: "#e2e8f0", minHeight: "100vh" }}>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}*{box-sizing:border-box}::selection{background:#7c3aed;color:#fff}::-webkit-scrollbar{width:6px}::-webkit-scrollbar-thumb{background:#374151;border-radius:3px}.card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:20px;margin-bottom:14px}.inp{background:rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.1);color:#e2e8f0;padding:10px 14px;border-radius:8px;font-size:14px;width:100%;outline:none}.inp:focus{border-color:#7c3aed}.inp::placeholder{color:#4b5563}textarea.inp{resize:vertical;min-height:50px}.btn{border:none;cursor:pointer;font-weight:600;border-radius:8px;font-size:14px;display:inline-flex;align-items:center;gap:6px;transition:all .15s}.btn-p{background:linear-gradient(135deg,#7c3aed,#6d28d9);color:#fff;padding:11px 22px}.btn-p:hover{box-shadow:0 4px 20px rgba(124,58,237,.4)}.btn-p:disabled{opacity:.4;cursor:not-allowed}.btn-s{background:rgba(255,255,255,.07);color:#c0c8d8;border:1px solid rgba(255,255,255,.1);padding:8px 14px;font-size:13px}.btn-s:hover{background:rgba(255,255,255,.12)}.btn-d{background:rgba(220,38,38,.15);color:#fca5a5;border:1px solid rgba(220,38,38,.25);padding:10px 20px}.tab{padding:10px 16px;border:none;cursor:pointer;font-size:13px;font-weight:600;border-radius:10px 10px 0 0;display:flex;align-items:center;gap:6px;background:transparent;color:#64748b;transition:all .2s}.tab:hover{color:#94a3b8}.tab.on{background:rgba(124,58,237,.15);color:#c4b5fd;border-bottom:2px solid #7c3aed}.scard{border:2px solid rgba(255,255,255,.06);border-radius:12px;padding:14px;cursor:pointer;transition:all .2s;background:rgba(0,0,0,.15)}.scard:hover{border-color:rgba(124,58,237,.3)}.scard.on{border-color:#7c3aed;background:rgba(124,58,237,.08)}.pbar{height:5px;background:rgba(255,255,255,.06);border-radius:3px;overflow:hidden}.pfill{height:100%;background:linear-gradient(90deg,#7c3aed,#a78bfa);border-radius:3px;transition:width .4s}.log{padding:3px 0;font-size:12px;font-family:Consolas,monospace;animation:fadeIn .25s}.log-info{color:#94a3b8}.log-success{color:#6ee7b7}.log-error{color:#fca5a5}.log-warn{color:#fcd34d}.rcard{border-radius:12px;overflow:hidden;background:rgba(0,0,0,.25);border:1px solid rgba(255,255,255,.06);transition:all .2s}.rcard:hover{transform:translateY(-3px);box-shadow:0 8px 30px rgba(0,0,0,.4)}.pfb{padding:12px 16px;border-radius:10px;cursor:pointer;border:2px solid rgba(255,255,255,.06);background:rgba(0,0,0,.2);display:flex;align-items:center;gap:10px;width:100%;transition:all .2s}.pfb:hover{border-color:rgba(255,255,255,.15)}.pfb.on{border-color:var(--pc);background:rgba(255,255,255,.04)}.mode-btn{padding:10px 20px;border-radius:8px;cursor:pointer;font-weight:600;font-size:14px;border:2px solid rgba(255,255,255,.1);transition:all .2s;background:rgba(0,0,0,.2);color:#94a3b8}.mode-btn:hover{border-color:rgba(255,255,255,.2)}.mode-btn.on{border-color:#7c3aed;background:rgba(124,58,237,.12);color:#c4b5fd}`}</style>

      {/* ═══ HEADER ═══ */}
      <header style={{ padding: "18px 24px 0", borderBottom: "1px solid rgba(255,255,255,.05)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 21, fontWeight: 700, color: "#f1f5f9", display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 26 }}>🎖️</span> Vettailor Generator v3</h1>
            <p style={{ margin: "3px 0 0", fontSize: 12, color: "#64748b" }}><span style={{ color: pf.color }}>{pf.icon} {pf.label}</span> · {sizeInfo.px} · {bannerMode ? "🎯 Banner" : "🎨 Mockup"}</p>
          </div>
          {running && <div style={{ textAlign: "right" }}><div style={{ fontSize: 12, color: "#a78bfa", fontWeight: 600, marginBottom: 3 }}>{prog.c}/{prog.t}</div><div className="pbar" style={{ width: 110 }}><div className="pfill" style={{ width: `${prog.t ? (prog.c / prog.t) * 100 : 0}%` }} /></div></div>}
        </div>
        <div style={{ display: "flex", gap: 3, overflowX: "auto" }}>{tabs.map(t => <button key={t.id} className={`tab ${tab === t.id ? "on" : ""}`} onClick={() => setTab(t.id)}><span>{t.i}</span><span style={{ whiteSpace: "nowrap" }}>{t.l}</span></button>)}</div>
      </header>

      <main style={{ padding: "20px 24px 40px", maxWidth: 960, margin: "0 auto" }}>

        {/* ═══ SETUP ═══ */}
        {tab === "setup" && (<>
          <div className="card">
            <h3 style={{ margin: "0 0 10px", fontSize: 15, color: "#c4b5fd" }}>🔀 Chế độ</h3>
            <div style={{ display: "flex", gap: 8 }}>
              <button className={`mode-btn ${!bannerMode ? "on" : ""}`} onClick={() => setBannerMode(false)}>🎨 Mockup Generator</button>
              <button className={`mode-btn ${bannerMode ? "on" : ""}`} onClick={() => setBannerMode(true)}>🎯 Banner Generator</button>
            </div>
          </div>

          <div className="card">
            <h3 style={{ margin: "0 0 10px", fontSize: 15, color: "#c4b5fd" }}>🌐 Nền tảng AI</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {Object.values(PLATFORMS).map(p => (
                <button key={p.id} className={`pfb ${plat === p.id ? "on" : ""}`} style={{ "--pc": p.color }} onClick={() => setPlat(p.id)}>
                  <span style={{ fontSize: 20, color: p.color, width: 28, textAlign: "center" }}>{p.icon}</span>
                  <div style={{ flex: 1, textAlign: "left" }}><div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{p.label}</div><div style={{ fontSize: 11, color: "#64748b" }}>{p.models.map(m => m.label).join(" · ")}</div></div>
                  <div style={{ width: 16, height: 16, borderRadius: "50%", border: `2px solid ${plat === p.id ? p.color : "rgba(255,255,255,.15)"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>{plat === p.id && <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color }} />}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 style={{ margin: "0 0 4px", fontSize: 15, color: "#c4b5fd" }}>🔑 API Key & Model</h3>
            <p style={{ margin: "0 0 10px", fontSize: 12, color: "#64748b" }}>{pf.keyHelp} <a href={pf.keyLink} target="_blank" rel="noopener noreferrer" style={{ color: pf.color, textDecoration: "none" }}>↗</a></p>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <input className="inp" type={showKey ? "text" : "password"} placeholder={pf.keyPlaceholder} value={key} onChange={e => setKey(e.target.value)} style={{ flex: 1 }} />
              <button className="btn btn-s" onClick={() => setShowKey(!showKey)}>{showKey ? "🙈" : "👁️"}</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><label style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: 4 }}>Model</label><select className="inp" value={model} onChange={e => setModel(e.target.value)} style={{ cursor: "pointer" }}>{pf.models.map(m => <option key={m.id} value={m.id}>{m.label} — {m.detail}</option>)}</select></div>
              <div><label style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: 4 }}>Kích thước output</label><select className="inp" value={outputSize} onChange={e => setOutputSize(e.target.value)} style={{ cursor: "pointer" }}>{OUTPUT_SIZES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}</select></div>
            </div>
            <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><label style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: 3 }}>Delay (s)</label><input className="inp" type="number" min={1} max={30} value={delay} onChange={e => setDelay(Math.max(1, +e.target.value))} style={{ width: 70 }} /></div>
              <div><label style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: 3 }}>Số ảnh / style</label><input className="inp" type="number" min={1} max={20} value={genCount} onChange={e => setGenCount(Math.max(1, Math.min(20, +e.target.value)))} style={{ width: 70 }} /></div>
            </div>
          </div>
          <button className="btn btn-p" onClick={() => key && setTab("upload")} disabled={!key} style={{ width: "100%" }}>Tiếp → Upload ảnh</button>
        </>)}

        {/* ═══ UPLOAD ═══ */}
        {tab === "upload" && (<>
          <div className="card">
            <h3 style={{ margin: "0 0 12px", fontSize: 15, color: "#c4b5fd" }}>📤 Upload ảnh sản phẩm</h3>
            <div style={{ border: "2px dashed rgba(255,255,255,.12)", borderRadius: 14, padding: 32, textAlign: "center", cursor: "pointer", background: "rgba(0,0,0,.1)" }} onClick={() => fileRef.current?.click()} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); onUpload({ target: { files: e.dataTransfer.files }, value: "" }); }}>
              <div style={{ fontSize: 32, marginBottom: 4 }}>📁</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#c0c8d8" }}>Click hoặc kéo thả</div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>PNG, JPG, WEBP</div>
              <input ref={fileRef} type="file" accept="image/*" multiple onChange={onUpload} style={{ display: "none" }} />
            </div>
            {imgs.length > 0 && <div style={{ marginTop: 14 }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8" }}>{imgs.length} ảnh</span><button className="btn btn-s" onClick={() => setImgs([])} style={{ fontSize: 11 }}>Xoá hết</button></div><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(85px,1fr))", gap: 6 }}>{imgs.map(img => <div key={img.id} style={{ position: "relative" }}><img src={img.url} alt="" style={{ width: "100%", height: 85, objectFit: "cover", borderRadius: 8, border: "1px solid rgba(255,255,255,.08)" }} /><button onClick={() => setImgs(p => p.filter(i => i.id !== img.id))} style={{ position: "absolute", top: 2, right: 2, width: 18, height: 18, borderRadius: "50%", border: "none", background: "rgba(220,38,38,.8)", color: "#fff", fontSize: 9, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button></div>)}</div></div>}
          </div>

          {/* User Notes */}
          {imgs.length > 0 && (
            <div className="card">
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 20 }}>📋</span>
                <div><h4 style={{ margin: 0, fontSize: 14, color: "#c4b5fd" }}>Ghi chú cho AI</h4><p style={{ margin: 0, fontSize: 11, color: "#64748b" }}>Context, yêu cầu đặc biệt — AI dùng để phân tích chính xác hơn</p></div>
              </div>
              <textarea className="inp" value={userNotes} onChange={e => setUserNotes(e.target.value)} rows={3} placeholder={"VD: Thay CUSTOM TEXT → JOHNSON, years → 1975-2003\nTarget Navy veterans, tone premium dark navy + gold"} style={{ fontSize: 12, lineHeight: 1.5 }} />
            </div>
          )}

          {/* AI Analyze */}
          {imgs.length > 0 && (
            <div className="card" style={{ border: "1px solid rgba(168,139,250,.3)", background: "rgba(124,58,237,.04)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 22 }}>🧠</span>
                <div><h4 style={{ margin: 0, fontSize: 14, color: "#c4b5fd" }}>AI Product Analyzer</h4><p style={{ margin: 0, fontSize: 11, color: "#64748b" }}>Phân tích ảnh → tự điền product desc, branch, headline, gợi ý style</p></div>
              </div>
              {!keys.gemini && <div style={{ padding: "8px 10px", borderRadius: 6, background: "rgba(250,204,21,.08)", border: "1px solid rgba(250,204,21,.15)", marginBottom: 8, fontSize: 11, color: "#fcd34d" }}>⚠ Cần Gemini API key (free) — Setup → Gemini → nhập key.</div>}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {imgs.map(img => (
                  <button key={img.id} className="btn btn-s" disabled={analyzing || !keys.gemini} onClick={() => handleAnalyze(img)} style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
                    <img src={img.url} alt="" style={{ width: 24, height: 24, objectFit: "cover", borderRadius: 4 }} />
                    {analyzing ? "Đang phân tích..." : `Analyze: ${img.name.slice(0, 20)}`}
                  </button>
                ))}
              </div>
              {analyzeResult && (
                <div style={{ marginTop: 12, padding: "12px 14px", borderRadius: 8, background: "rgba(0,0,0,.2)" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#6ee7b7", marginBottom: 6 }}>✅ Kết quả phân tích:</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 12 }}>
                    <div><span style={{ color: "#64748b" }}>Sản phẩm:</span> <span style={{ color: "#e2e8f0" }}>{analyzeResult.productName}</span></div>
                    <div><span style={{ color: "#64748b" }}>Branch:</span> <span style={{ color: "#e2e8f0" }}>{analyzeResult.branch}</span></div>
                    <div><span style={{ color: "#64748b" }}>Headline:</span> <span style={{ color: "#e2e8f0" }}>{analyzeResult.suggestedHeadline}</span></div>
                    <div><span style={{ color: "#64748b" }}>Audience:</span> <span style={{ color: "#e2e8f0" }}>{analyzeResult.targetAudience}</span></div>
                  </div>
                  {analyzeResult.customTextReplaced?.originalText && (
                    <div style={{ marginTop: 6, padding: "6px 10px", borderRadius: 6, background: "rgba(110,231,183,.08)", border: "1px solid rgba(110,231,183,.2)", fontSize: 11 }}>
                      <span style={{ color: "#6ee7b7", fontWeight: 600 }}>📝 Replaced:</span>
                      {analyzeResult.customTextReplaced.originalText && <span style={{ color: "#94a3b8" }}> "{analyzeResult.customTextReplaced.originalText}" → "{analyzeResult.customTextReplaced.replacedWith}"</span>}
                      {analyzeResult.customTextReplaced.originalYears && <span style={{ color: "#94a3b8" }}> · "{analyzeResult.customTextReplaced.originalYears}" → "{analyzeResult.customTextReplaced.replacedYears}"</span>}
                    </div>
                  )}
                  <div style={{ marginTop: 6, fontSize: 11, color: "#6ee7b7" }}>→ Đã tự điền. Nhấn "Tiếp" để chọn style & generate.</div>
                </div>
              )}
            </div>
          )}

          {/* Product Desc (manual or from analyzer) */}
          {imgs.length > 0 && (
            <div className="card">
              <h4 style={{ margin: "0 0 8px", fontSize: 14, color: "#c4b5fd" }}>📝 Mô tả sản phẩm</h4>
              <p style={{ margin: "0 0 8px", fontSize: 11, color: "#64748b" }}>AI Analyzer tự điền. Bạn có thể sửa lại. Prompt gen ảnh sẽ dùng mô tả này.</p>
              <textarea className="inp" value={productDesc} onChange={e => setProductDesc(e.target.value)} rows={3} placeholder="Mô tả đầy đủ sản phẩm: tên, màu, chi tiết thiết kế, kèm outfit model mặc (quần, giày, phụ kiện)..." style={{ fontSize: 12, lineHeight: 1.5 }} />
            </div>
          )}

          <button className="btn btn-p" onClick={() => imgs.length && setTab("style")} disabled={!imgs.length} style={{ width: "100%" }}>Tiếp → Chọn {bannerMode ? "Banner" : "Mockup"} Style</button>
        </>)}

        {/* ═══ STYLE SELECTION ═══ */}
        {tab === "style" && (<>
          <div className="card">
            <h3 style={{ margin: "0 0 12px", fontSize: 15, color: "#c4b5fd" }}>
              {bannerMode ? "🎯 Chọn Banner Style" : "🎨 Chọn Mockup Style"}
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 10 }}>
              {currentStyles.map(s => (
                <div key={s.id} className={`scard ${currentSel === s.id ? "on" : ""}`} onClick={() => { setCurrentSel(s.id); setPromptOverride(""); }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 22 }}>{s.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{s.label}</div>
                      <div style={{ fontSize: 10, color: "#64748b" }}>{s.desc}</div>
                    </div>
                    {currentSel === s.id && <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff", flexShrink: 0 }}>✓</div>}
                  </div>
                  <div style={{ fontSize: 9, color: "#4b5563" }}>{s.purpose}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Banner-specific inputs */}
          {bannerMode && (
            <div className="card">
              <h4 style={{ margin: "0 0 8px", fontSize: 14, color: "#c4b5fd" }}>✏️ Banner Text (tuỳ chọn)</h4>
              <p style={{ margin: "0 0 10px", fontSize: 11, color: "#64748b" }}>Để trống → AI tự gen phù hợp với style và niche veteran.</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <Field label="Headline" value={bannerHeadline} onChange={setBannerHeadline} placeholder="AI tự gen nếu trống" />
                <Field label="CTA" value={bannerCta} onChange={setBannerCta} placeholder="Shop Now" />
                <Field label="Offer / Promo" value={bannerOffer} onChange={setBannerOffer} placeholder="20% OFF, Free Shipping..." />
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: 3 }}>Branch</label>
                  <select className="inp" value={bannerBranch} onChange={e => setBannerBranch(e.target.value)} style={{ cursor: "pointer" }}>
                    {BRANCHES.map(b => <option key={b} value={b}>{b || "— Auto / General Veteran"}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Prompt Preview/Editor */}
          <div className="card" style={{ border: "1px solid rgba(168,139,250,.2)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <h4 style={{ margin: 0, fontSize: 14, color: "#a78bfa" }}>👁️ Prompt Preview</h4>
              <button className="btn btn-s" onClick={() => setShowPrompt(!showPrompt)} style={{ fontSize: 11 }}>{showPrompt ? "Ẩn" : "Xem prompt"}</button>
            </div>
            {showPrompt && (
              <div>
                <p style={{ fontSize: 11, color: "#64748b", marginBottom: 6 }}>Prompt sẽ random mỗi lần gen. Sửa trực tiếp nếu muốn override (prompt đã sửa sẽ cố định, không random).</p>
                <textarea className="inp" value={promptOverride || getCurrentPrompt()} onChange={e => setPromptOverride(e.target.value)} rows={8} style={{ fontSize: 11, lineHeight: 1.5, fontFamily: "Consolas, monospace" }} />
                <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                  {promptOverride && <button className="btn btn-s" onClick={() => setPromptOverride("")} style={{ fontSize: 10 }}>🔄 Reset (bật random lại)</button>}
                  <button className="btn btn-s" onClick={() => { navigator.clipboard.writeText(promptOverride || getCurrentPrompt()); }} style={{ fontSize: 10 }}>📋 Copy</button>
                  {!promptOverride && <button className="btn btn-s" onClick={() => setShowPrompt(p => { /* just re-render to get new random */ return p; })} style={{ fontSize: 10 }}>🎲 Xem variation khác</button>}
                </div>
              </div>
            )}
          </div>

          {/* Summary & Generate */}
          <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(124,58,237,.06)", border: "1px solid rgba(124,58,237,.12)", marginBottom: 14 }}>
            <strong style={{ color: "#c4b5fd" }}>{imgs.length} ảnh × {genCount} lần = {total} {bannerMode ? "banners" : "mockups"}</strong>
            <span style={{ fontSize: 12, color: "#64748b", marginLeft: 8 }}>~{Math.ceil((total * (delay + 5)) / 60)} phút</span>
            <div style={{ marginTop: 4, fontSize: 11, color: "#94a3b8" }}>
              Style: {(bannerMode ? BANNER_STYLES : MOCKUP_STYLES).find(s => s.id === currentSel)?.icon} {(bannerMode ? BANNER_STYLES : MOCKUP_STYLES).find(s => s.id === currentSel)?.label} · {sizeInfo.px}
              {!promptOverride && <span style={{ color: "#6ee7b7", marginLeft: 6 }}>🎲 Random variations mỗi lần gen</span>}
              {promptOverride && <span style={{ color: "#fcd34d", marginLeft: 6 }}>✏️ Custom prompt (cố định)</span>}
            </div>
          </div>
          <button className="btn btn-p" onClick={startGen} disabled={running || !total} style={{ width: "100%" }}>
            🚀 Generate {total} {bannerMode ? "banner" : "mockup"}{total > 1 ? "s" : ""}
          </button>
        </>)}

        {/* ═══ GENERATE ═══ */}
        {tab === "generate" && (<>
          <div className="card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 15, color: "#c4b5fd" }}>{running ? "⚡ Generating..." : "📋 Queue"}</h3>
              {running && <button className="btn btn-d" onClick={() => abortRef.current?.abort()}>⏹ Dừng</button>}
            </div>
            {prog.t > 0 && <div style={{ marginBottom: 14 }}><div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginBottom: 3 }}><span>Tiến độ</span><span>{Math.round((prog.c / prog.t) * 100)}%</span></div><div className="pbar"><div className="pfill" style={{ width: `${(prog.c / prog.t) * 100}%` }} /></div></div>}
            <div style={{ maxHeight: 300, overflowY: "auto" }}>{queue.map(q => <div key={q.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,.03)" }}><img src={q.img.url} alt="" style={{ width: 34, height: 34, objectFit: "cover", borderRadius: 6 }} /><div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 12, fontWeight: 500, color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{q.img.name} → {q.label}</div>{q.error && <div style={{ fontSize: 10, color: "#fca5a5", marginTop: 1 }}>{q.error}</div>}</div><Badge status={q.status} /></div>)}</div>
          </div>
          <div className="card"><h4 style={{ margin: "0 0 6px", fontSize: 13, color: "#94a3b8" }}>📝 Logs</h4><div style={{ maxHeight: 200, overflowY: "auto", background: "rgba(0,0,0,.25)", borderRadius: 8, padding: 10, fontFamily: "Consolas,monospace" }}>{logs.length === 0 ? <div style={{ fontSize: 11, color: "#374151" }}>...</div> : logs.map((l, i) => <div key={i} className={`log log-${l.type}`}><span style={{ color: "#374151" }}>[{l.t}]</span> {l.msg}</div>)}<div ref={logEnd} /></div></div>
          {!running && results.length > 0 && <button className="btn btn-p" onClick={() => setTab("results")} style={{ width: "100%" }}>Xem {results.length} kết quả →</button>}
        </>)}

        {/* ═══ RESULTS ═══ */}
        {tab === "results" && (<>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ margin: 0, fontSize: 15, color: "#c4b5fd" }}>🖼️ {results.length} {bannerMode ? "banners" : "mockups"}</h3>
            <div style={{ display: "flex", gap: 8 }}>
              {results.length > 0 && <button className="btn btn-p" onClick={dlAll} style={{ padding: "8px 16px", fontSize: 13 }}>⬇️ Download all</button>}
              <button className="btn btn-s" onClick={() => setTab("style")} style={{ fontSize: 12 }}>🎲 Gen thêm</button>
            </div>
          </div>
          {!results.length
            ? <div className="card" style={{ textAlign: "center", padding: 40 }}><div style={{ fontSize: 34, marginBottom: 6 }}>🎨</div><div style={{ fontSize: 13, color: "#64748b" }}>Chưa có kết quả</div></div>
            : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 14 }}>
                {results.map((r, i) => (
                  <div key={r.id} className="rcard">
                    <img src={r.url} alt="" style={{ width: "100%", height: 200, objectFit: "cover", display: "block" }} />
                    <div style={{ padding: 10 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0" }}>{r.type}</div>
                      <div style={{ fontSize: 10, color: "#64748b", marginTop: 1 }}>{r.src}</div>
                      <button className="btn btn-s" onClick={() => dl(r.url, `vettailor_${r.styleId}_${i + 1}_${r.src.replace(/\.[^.]+$/, "")}.png`)} style={{ width: "100%", marginTop: 8, fontSize: 11, padding: "6px", justifyContent: "center" }}>⬇️ Download</button>
                    </div>
                  </div>
                ))}
              </div>
          }
        </>)}
      </main>
    </div>
  );
}
```
ENDOFFILE