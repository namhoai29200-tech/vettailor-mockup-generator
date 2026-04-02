import { useState, useRef, useCallback, useEffect } from "react";

// ════════════════════════════════════════════════════════════
// PLATFORMS
// ════════════════════════════════════════════════════════════

const PLATFORMS = {
  gemini: { id: "gemini", label: "Google Gemini", icon: "✦", color: "#4285f4", keyPlaceholder: "AIzaSy...", keyHelp: "Free tại aistudio.google.com", keyLink: "https://aistudio.google.com",
    models: [{ id: "gemini-2.5-flash-image", label: "Nano Banana", detail: "Free ~500/day", tier: "free" }, { id: "gemini-3.1-flash-image-preview", label: "Nano Banana 2", detail: "Free · Mới nhất", tier: "free" }, { id: "gemini-3-pro-image-preview", label: "Nano Banana Pro", detail: "$0.134/img", tier: "paid" }] },
  openai: { id: "openai", label: "OpenAI GPT Image", icon: "◎", color: "#10a37f", keyPlaceholder: "sk-...", keyHelp: "Lấy tại platform.openai.com", keyLink: "https://platform.openai.com/api-keys",
    models: [{ id: "gpt-image-1", label: "GPT Image 1", detail: "$0.02-0.19/img", tier: "paid" }, { id: "gpt-image-1-mini", label: "GPT Image 1 Mini", detail: "Rẻ hơn 50-70%", tier: "paid" }] },
};

// ════════════════════════════════════════════════════════════
// OUTPUT SIZES
// ════════════════════════════════════════════════════════════

const OUTPUT_SIZES = [
  { id: "landscape", label: "Landscape 1.91:1 — 1920×1080", px: "1920×1080", ratio: "1.91:1", apiGemini: "1536x1024", apiOpenai: "1536x1024" },
  { id: "square", label: "Square 1:1 — 1200×1200", px: "1200×1200", ratio: "1:1", apiGemini: "1024x1024", apiOpenai: "1024x1024" },
  { id: "portrait", label: "Portrait 4:5 — 960×1200", px: "960×1200", ratio: "4:5", apiGemini: "1024x1536", apiOpenai: "1024x1536" },
  { id: "vertical", label: "Vertical 4:5 — 1080×1350", px: "1080×1350", ratio: "4:5", apiGemini: "1024x1536", apiOpenai: "1024x1536" },
];

const pick = arr => arr[Math.floor(Math.random() * arr.length)];

// ════════════════════════════════════════════════════════════
// 10 MOCKUP STYLES
// ════════════════════════════════════════════════════════════

const MOCKUP_STYLES = [
  { id: "clean_studio", label: "Clean Studio", icon: "⬜", desc: "E-commerce, PMax, product page", purpose: "Google Shopping, PMax",
    core: "Professional e-commerce product photography, clean minimal background, soft studio lighting, subtle shadow, product centered, high-end catalog feel, crisp and sharp focus, commercial product shot",
    variations: {
      background: ["pure white seamless backdrop", "light gray gradient backdrop", "warm beige seamless surface", "soft cream background", "pale blue-gray studio backdrop"],
      shadow: ["soft diffused drop shadow beneath product", "subtle mirror-like reflection on glossy surface", "floating feel with no visible shadow", "contact shadow only where product meets surface"],
      light: ["soft even studio lighting from all sides", "slight left key light with gentle fill on right", "slight right key light with gentle fill on left", "overhead diffused softbox creating even illumination", "back-lit with soft fill light creating subtle rim glow"],
      surface: ["seamless infinity curve paper", "faint woven fabric texture beneath product", "smooth matte acrylic surface", "subtle warm-to-cool gradient floor", "clean white elevated platform"]
    }},
  { id: "dark_premium", label: "Dark Premium", icon: "🖤", desc: "Dramatic, luxury, scroll-stopping", purpose: "Meta Feed, jacket & hat",
    core: "Dramatic low-key product photography, dark moody background, cinematic rim lighting, premium luxury feel, subtle texture in background, high contrast, editorial product shot",
    variations: {
      background: ["dark wood grain surface with visible knots", "polished black stone slate with subtle veining", "brushed dark gunmetal surface", "weathered dark leather with natural patina", "concrete surface with dark charcoal wash", "subtle smoke and haze drifting on black void"],
      light: ["warm amber rim light glowing from left side", "cold blue rim light cutting from right side", "dual-side rim lighting warm left and cool right", "single overhead spot with dramatic fall-off into darkness", "golden backlight creating halo with dark fill on front"],
      tone: ["warm amber and gold tones throughout", "cool steel blue monochromatic tones", "neutral deep blacks with minimal color cast", "moody teal undertone in shadows", "rich burgundy accent light bleeding into edges"],
      atmosphere: ["clean dark void with deep blacks", "subtle smoke wisps curling through light beam", "fine dust particles floating in visible light beam", "deep dark vignette framing product in center"]
    }},
  { id: "patriotic_outdoor", label: "Patriotic Outdoor", icon: "🇺🇸", desc: "Veteran pride, emotional, warm", purpose: "Meta Ads, emotional",
    core: "American patriotic lifestyle setting, warm golden hour natural light, outdoor environment, proud authentic veteran atmosphere, subtle American elements in scene, natural and genuine feel, aspirational yet relatable",
    variations: {
      scene: ["backyard with weathered wooden fence and green lawn", "front porch of classic American home with columns", "open country field with tall grass at sunset", "peaceful lakeside wooden dock", "park bench under a massive old oak tree", "quiet rural country dirt road stretching into distance", "tailgate of a classic American pickup truck", "red barn farmhouse setting with rolling hills", "small town Main Street with American storefronts"],
      time: ["golden hour warm side light with long shadows", "soft early morning light with gentle dew", "bright midday sun with open shade under tree", "late afternoon warm amber glow", "overcast sky providing soft even diffused light"],
      elements: ["American flag partially visible waving gently in background", "red-white-blue bunting draped on railing or fence", "vintage pickup truck parked nearby in background", "wooden fence with small American flag bunting", "classic mailbox with small American flag attached"],
      season: ["lush summer green with full foliage", "warm autumn colors with orange and red leaves", "spring bloom with flowers and fresh green", "mild winter with bare trees and cool light"]
    }},
  { id: "rugged_tactical", label: "Rugged Tactical", icon: "🔧", desc: "Military, gritty, masculine", purpose: "Bomber & leather jacket",
    core: "Rugged military-inspired setting, gritty textured environment, strong masculine tone, industrial or tactical backdrop, muted earth tones, authentic and worn-in feel, utilitarian aesthetic",
    variations: {
      setting: ["mechanic garage with tools hanging on pegboard wall", "military surplus store interior with shelves of gear", "industrial workshop with heavy workbench and vise", "old aircraft hangar with corrugated metal walls", "army barracks style room with metal bunks", "olive green Jeep or military vehicle parked nearby", "metal warehouse with wooden shipping crates"],
      props: ["metal dog tags hanging from a nail or hook", "worn combat boots placed on floor nearby", "military patches and insignia laid on table", "folded American flag in triangle display case", "tool wall with wrenches and equipment in background", "old military maps pinned to wall", "vintage olive drab military radio on shelf"],
      texture: ["raw poured concrete floor and walls", "rusted corroded metal surfaces and fixtures", "worn weathered wooden planks and beams", "rough canvas and burlap material elements", "corrugated galvanized steel wall panels", "riveted heavy metal industrial panels"],
      color: ["olive drab green and desert tan palette", "gunmetal gray and orange rust tones", "dark earth brown and sandy khaki", "military forest green and chocolate brown", "faded desert camouflage muted tones"]
    }},
  { id: "everyday_casual", label: "Everyday Casual", icon: "☕", desc: "Relatable, approachable, real life", purpose: "Retargeting, broad audience",
    core: "Casual everyday American lifestyle, relaxed natural setting, soft ambient light, approachable and comfortable mood, real-life context, candid and authentic feel, warm and inviting atmosphere",
    variations: {
      scene: ["cozy coffee shop table by large window", "comfortable living room couch area with throw pillows", "kitchen counter with morning coffee and sunlight", "walking casually through suburban neighborhood sidewalk", "sitting relaxed on front steps of house", "classic local diner booth with red vinyl seats", "home office desk with computer and coffee mug", "backyard wooden deck with lounge chair"],
      activity: ["morning coffee moment with steam rising from mug", "reading newspaper or scrolling phone casually", "casual relaxed conversation setting with friend", "laid-back Saturday weekend vibe at home", "running errands look carrying grocery bag"],
      light: ["warm indoor ambient tungsten light", "natural window side light streaming in", "soft overhead interior ceiling lighting", "natural bright daylight from open doorway", "mixed warm indoor lamps and cool window daylight"],
      mood: ["cozy warm and deeply relaxed atmosphere", "quietly confident everyday moment", "laid-back casual weekend afternoon feeling", "calm peaceful morning routine energy"]
    }},
  { id: "brotherhood", label: "Brotherhood / Group", icon: "🤝", desc: "Veteran community, camaraderie", purpose: "Meta, community engagement",
    core: "Veterans brotherhood gathering, multiple people wearing themed gear together, camaraderie and pride, warm authentic group moment, genuine connection and shared bond, storytelling composition",
    variations: {
      scene: ["lively backyard BBQ party with smoke from grill", "veteran reunion event with banner and decorations", "local bar gathering with wood interior and dim lighting", "fishing trip together by calm lake with rods", "tailgate party before a football game with coolers", "VFW hall meeting room with memorabilia on walls", "camping trip around crackling campfire at night"],
      dynamic: ["laughing together naturally at shared joke", "raising glasses toasting drinks with big smiles", "standing shoulder-to-shoulder proudly arms crossed", "sharing a hearty meal at long table together", "watching the big game together cheering on TV", "casual group photo pose with arms around shoulders"],
      groupSize: ["two close buddies standing side by side", "small tight group of 3-4 veteran friends", "full band of brothers gathering of 5-6 guys"],
      atmosphere: ["celebratory high-energy party fun", "nostalgic warm bonding and old stories", "proud strong silent respect together", "relaxed casual easy friendship laughter"]
    }},
  { id: "seasonal_holiday", label: "Seasonal / Holiday", icon: "🎆", desc: "Memorial Day, Veterans Day, 4th of July", purpose: "Holiday campaigns",
    core: "Festive American holiday atmosphere, seasonal decorations and colors, celebratory yet respectful mood, themed environment that honors veterans, seasonal warmth and pride",
    variations: {
      holiday: ["4th of July celebration with fireworks in sky and red-white-blue bunting and sparklers", "Memorial Day scene with red poppies and American flags on graves and solemn pride", "Veterans Day ceremony with Thank You For Your Service signs and salute and honor guard", "Christmas setting with warm string lights and green wreath and fireplace glow and light snow", "Thanksgiving scene with family table and autumn harvest centerpiece and gratitude theme"],
      setting: ["outdoor community celebration with bunting and decorations", "home beautifully decorated for the holiday inside and out", "community gathering event with crowd and festivities", "intimate family gathering indoors with holiday decor"],
      palette: ["vibrant saturated red-white-blue patriotic colors", "muted respectful navy and cream with subtle flag accents", "warm Christmas red-green-gold with rustic military accent", "rich autumn orange-brown-cream harvest warm tones"],
      mood: ["loud celebratory festive party energy", "solemn quiet honoring reverent atmosphere", "warm family-centered togetherness feeling", "deeply grateful reflective peaceful tone"]
    }},
  { id: "flat_lay", label: "Flat Lay Arrangement", icon: "📐", desc: "Overhead styled, Instagram aesthetic", purpose: "Bundle shot, Instagram, upsell",
    core: "Overhead flat lay product arrangement, styled with complementary accessories, organized aesthetic layout, clean surface background, editorial styling, curated collection feel, top-down photography",
    variations: {
      surface: ["light natural oak wood table with visible grain", "dark rich walnut surface polished", "raw concrete slab with texture", "white marble surface with subtle gray veining", "worn vintage leather desk surface with patina", "military olive drab canvas fabric laid flat", "rustic reclaimed barnwood planks"],
      accessories: ["classic aviator sunglasses and vintage wristwatch placed nearby", "metal dog tags on chain and worn leather wallet", "embroidered American flag patch and folding pocket knife", "ceramic coffee mug with dark brew and brass vintage compass", "military challenge coin collection and old black-and-white photographs", "brass Zippo lighter with patina and worn leather-bound journal"],
      layout: ["clean symmetrical grid arrangement perfectly aligned", "casual naturally scattered organic layout", "dynamic diagonal arrangement with visual flow", "centered hero product with smaller items radiating outward", "minimal arrangement with generous negative space around product"],
      detail: ["fresh hot coffee with visible steam wisps rising", "corner of morning newspaper peeking in", "small potted plant or greenery accent adding life", "warm angled side lighting creating long editorial shadows"]
    }},
  { id: "urban_veteran", label: "Urban Veteran", icon: "🏙️", desc: "City street, modern, cool", purpose: "Younger veteran audience",
    core: "Urban American street setting, modern city environment, confident streetwear energy mixed with veteran pride, contemporary and cool, natural daylight, editorial street photography feel",
    variations: {
      setting: ["busy downtown sidewalk with pedestrians blurred", "textured brick wall alley with fire escape above", "colorful large city mural graffiti backdrop", "concrete parking structure rooftop with open sky", "retro local diner exterior with neon signs glowing", "classic barber shop storefront with striped pole", "rooftop terrace with dramatic city skyline view"],
      vibe: ["gritty raw downtown energy with character", "clean well-maintained suburban main street feel", "converted industrial district with creative energy", "hip trendy neighborhood with coffee shops and boutiques", "waterfront boardwalk with ocean breeze atmosphere"],
      light: ["harsh midday urban shadows with strong contrast", "golden hour light streaming between tall buildings", "flat overcast diffused city light even and soft", "colored neon accent glow from nearby storefront sign", "early morning fog creating diffused atmospheric city light"],
      energy: ["walking with purpose and confidence on sidewalk", "leaning casually against brick or concrete wall", "standing at crosswalk with confident relaxed posture", "sitting on concrete steps with elbows on knees relaxed"]
    }},
  { id: "heritage_vintage", label: "Heritage / Vintage", icon: "📷", desc: "Nostalgia, film look, timeless", purpose: "Storytelling, older audience",
    core: "Vintage Americana aesthetic, nostalgic warm color grading, classic heritage feel, slightly faded film photography look, timeless military pride, retro authenticity, warm analog film tones",
    variations: {
      setting: ["old-school barber shop interior with chrome chairs and mirrors", "vintage diner counter with chrome stools and neon menu", "classic restored American muscle car or old pickup truck", "cozy wood cabin interior with stone fireplace", "covered front porch with wooden rocking chair", "retro old gas station with vintage pumps and signage", "VFW lodge hall with flags and framed photos on walls"],
      elements: ["old vacuum tube radio sitting on wooden shelf", "framed vintage black-and-white military photos on wall", "classic 1960s American car visible through window or door", "black rotary telephone on desk or table", "worn faded American flag hanging on wall", "glass display case with framed military medals and ribbons"],
      filmLook: ["warm Kodak Portra 400 golden skin tones and soft contrast", "slightly desaturated image with warm glowing highlights", "deep golden sepia undertone throughout image", "Fuji film characteristic greens and muted blues", "washed out faded Polaroid instant photo feel"],
      era: ["1950s classic Americana diner and drive-in nostalgia", "1960s military homecoming and Kennedy-era pride", "1970s road trip freedom and open highway aesthetic", "1980s heartland Americana warmth and optimism", "timeless era-ambiguous classic American heritage feel"]
    }},
];

function buildMockupPrompt(style, productDesc, sizeInfo) {
  const v = style.variations;
  const parts = [style.core];
  Object.keys(v).forEach(k => parts.push(pick(v[k])));
  return `${parts.join(". ")}. Output aspect ratio: ${sizeInfo.ratio} (${sizeInfo.px}). Product: ${productDesc}. CRITICAL: The product design, colors, patterns, text, and ALL visual details must be preserved EXACTLY as shown in the reference image. Do NOT add any text, watermarks, logos not present in the original. Do NOT alter the product — only change surrounding environment.`;
}

// ════════════════════════════════════════════════════════════
// 10 BANNER STYLES
// ════════════════════════════════════════════════════════════

const BANNER_STYLES = [
  { id: "hero_clean", label: "Hero Product — Clean", icon: "⬜", desc: "Product-focused, professional", purpose: "Google Display, PMax",
    core: "Clean professional product advertisement, product takes center stage occupying 60-70% of frame, minimal clean background, soft studio lighting, high-end commercial feel, plenty of breathing space, polished and sharp",
    textRules: `HEADLINE: Short 3-6 words, bold clean sans-serif, dark or high-contrast. CTA: Clear button shape with strong contrast. LAYOUT: Product 60-70%, text opposite side. Text covers max 20% area. All text readable within 2 seconds.`,
    variations: {
      background: ["solid pure white", "light cool gray gradient", "soft warm cream-to-white gradient", "soft cool blue-to-white gradient", "subtle beige linen texture", "pale navy-to-white gradient"],
      layout: ["product left 60% — text stacked right", "product right 60% — text stacked left", "product centered — headline above CTA below", "product centered — text below edge"],
      textColor: ["dark charcoal on light bg", "white text on dark accent bar", "navy headline with gray subtext on white"],
      cta: ["solid bright rounded button", "outlined dark button with arrow", "bold underlined text with arrow", "contrasting pill-shape CTA"],
      accent: ["thin colored line divider", "subtle geometric shape behind product", "small Best Seller badge tag", "no accent — pure minimal"]
    }},
  { id: "dark_cinematic", label: "Dark Cinematic", icon: "🖤", desc: "Moody, premium, scroll-stopping", purpose: "Meta Feed, dark products",
    core: "Dramatic dark cinematic advertisement, moody low-key lighting, dark rich background with subtle texture, premium luxury feel, high contrast, editorial and bold, product lit dramatically",
    textRules: `HEADLINE: Bold uppercase or elegant serif, white or gold on dark. CTA: Bright prominent on dark — white or accent color. LAYOUT: Product dominant, text in dark negative space. MOOD: Powerful, premium. All text high contrast scannable in 2-3s.`,
    variations: {
      background: ["rich dark wood grain", "polished black concrete", "brushed dark gunmetal steel", "aged dark leather with creases", "atmospheric smoke on black", "dark woven fabric texture", "deep charcoal gradient to black"],
      lighting: ["warm amber rim light from left", "cold blue rim light from right", "backlit golden glow halo", "single overhead spotlight dramatic fall-off", "dual-side rim warm left cool right", "golden edge light tracing outline"],
      textPlacement: ["text stacked bottom left", "headline top right CTA bottom right", "text centered with dark gradient overlay", "headline across top — product fills bottom"],
      accentColor: ["warm rich gold", "cool polished silver", "deep warm amber", "deep crimson red", "ice cold blue", "pure white on black no color"],
      typography: ["bold heavy industrial sans-serif", "elegant thin high-contrast serif", "military stencil rough textured", "tall condensed uppercase geometric"]
    }},
  { id: "patriotic_lifestyle", label: "Patriotic Lifestyle", icon: "🇺🇸", desc: "Emotional, veteran pride", purpose: "Meta, emotional engagement",
    core: "American patriotic lifestyle advertisement, warm golden natural light, authentic veteran atmosphere, outdoor or American home setting, proud and genuine mood, red-white-blue accents woven naturally",
    textRules: `HEADLINE: Emotional pride copy 5-10 words, warm serif or sans-serif, white/cream for readability. CTA: Warm inviting not aggressive. LAYOUT: Lifestyle image 80%+, text on contrast area with dark overlay if needed. MOOD: Proud, authentic, warm.`,
    variations: {
      scene: ["backyard with American flag on pole", "front porch classic American home", "golden country road into sunset", "peaceful lakeside wooden dock", "tailgate of vintage pickup truck", "park with massive oak trees dappled sunlight", "red barn farmhouse golden hour", "small town Main Street with flags"],
      timeLight: ["golden hour warm side light", "soft gentle morning light", "late afternoon warm amber glow", "overcast soft even light", "bright midday shade under tree"],
      americanElements: ["American flag waving in breeze", "red-white-blue bunting on railing", "classic vintage pickup truck", "wooden fence with small flags", "classic mailbox with flag"],
      textOverlay: ["semi-transparent dark bar behind text", "text on open sky with drop shadow", "gradient fade from image to dark panel with text", "text in natural dark shadow zone"],
      headlineAngle: ["pride and honor statement", "brotherhood bond message", "sacrifice and service honor", "family legacy pride", "everyday hero celebration"]
    }},
  { id: "bold_typography", label: "Bold Typography", icon: "🔤", desc: "Text is hero, product secondary", purpose: "Scroll-stopping Meta Feed",
    core: "Typography-dominant advertisement, large bold text as PRIMARY element occupying 50-70% of banner, product shown smaller as secondary, strong graphic composition, extremely high contrast, designed to stop scroll with words",
    textRules: `HEADLINE: MASSIVE 50-70% of banner. Extremely bold/heavy font. This IS the visual. CTA: Smaller but visible near product. LAYOUT: Text center of attention, product 20-30% in corner or edge. Max 6 words headline.`,
    variations: {
      background: ["solid pure black", "solid deep navy", "solid army olive green", "dark textured concrete", "bold two-tone diagonal split", "solid bold red or orange"],
      typography: ["ultra heavy bold sans-serif", "extremely tall condensed all-caps", "rough military stencil spray paint", "distressed worn texture on text", "clean modern geometric sans-serif", "bold editorial serif thick-thin contrast"],
      layout: ["giant text centered — product small bottom right", "huge text left — product right edge", "text diagonal across entire banner", "text wrapping around product", "full bleed text — product overlapping"],
      textColor: ["white on dark black", "cream on deep navy", "gold on black", "red on dark", "all white with ONE accent color word"],
      headlineAngle: ["BUILT TO SERVE", "STAND YOUR GROUND", "VETERAN AND PROUD", "ONCE A SOLDIER ALWAYS", "HONOR YOUR SERVICE", "NEVER FORGOTTEN"]
    }},
  { id: "ugc_authentic", label: "UGC / Authentic", icon: "📱", desc: "Looks real, not like an ad", purpose: "Meta, outperforms polished",
    core: "User-generated content style, looks like a real smartphone photo, slightly imperfect and casual, authentic and relatable, NOT designed or polished, natural phone photography feel, genuine and trustworthy",
    textRules: `HEADLINE: Casual conversational, can use emoji, handwritten or casual font. CTA: Very gentle — "Check it out 👇", "Link in bio". LAYOUT: Natural unplanned photo, text added casually. IMPERFECTION IS KEY: slight tilt, natural lighting, real background.`,
    variations: {
      photoStyle: ["mirror selfie proudly showing off product", "casual outdoor candid photo", "close-up product held in hand", "messy natural flat lay on real table", "excited unboxing with shipping packaging", "wearing product doing everyday activity"],
      textOverlay: ["casual handwritten font overlay", "iPhone caption style white text bottom", "yellow sticky note with handwriting", "highlight marker emphasis on key words", "plain minimal text no design", "chat bubble style typed text"],
      imperfection: ["slight natural photo tilt", "natural uneven indoor lighting with shadows", "visible realistic background clutter", "slightly warm yellowed phone camera tone", "slightly cool bluish night phone tone", "candid unposed natural angle"],
      captionAngle: ["Just got this and WOW 🔥", "New favorite piece in my closet", "Fellow veterans — you NEED this", "Look what just arrived!! 📦", "My buddy needs to see this", "Wore this all week no regrets"],
      ctaTreatment: ["almost invisible small text bottom", "small arrow emoji pointing down", "simple Link below ⬇️", "emoji hand 👉 pointing", "underlined minimal small text corner"]
    }},
  { id: "sale_promo", label: "Sale / Promotion", icon: "🏷️", desc: "Discount-focused, urgent", purpose: "Retargeting, conversion",
    core: "Promotional sale advertisement, bold discount/offer as absolute focal point and LARGEST element, product alongside deal, strong urgency and value, commercial and direct, drives immediate action",
    textRules: `OFFER: LARGEST element — bigger than headline and product. "20% OFF" or "BUY 1 GET 1" must dominate. HEADLINE: Supports offer context. CTA: Urgent — "Shop Now", "Claim Offer". URGENCY: Must include deadline/scarcity. Offer readable from thumbnail — make it HUGE.`,
    variations: {
      offerDisplay: ["giant percentage number filling half frame", "old price slashed with bold new price", "BUY 1 GET 1 massive block letters", "dollar amount OFF on ribbon banner", "large circular badge with offer", "starburst explosion shape with deal"],
      background: ["solid bold red", "solid bold orange", "deep navy premium dark", "product photo with color overlay", "dark bg with bright offer text", "clean white with bold accents"],
      layout: ["offer large left — product right", "offer massive centered — product below", "product dominant — offer badge corner", "horizontal split offer top product bottom", "diagonal split offer and product"],
      urgency: ["ENDS MONDAY with clock icon", "LIMITED TIME ONLY warning", "WHILE SUPPLIES LAST", "TODAY ONLY — 24 HOURS", "48 HOURS LEFT countdown", "ONLY A FEW LEFT scarcity"],
      colorEnergy: ["classic red and white", "black and metallic gold", "navy and bright orange", "olive green and white", "red-white-blue patriotic"]
    }},
  { id: "testimonial_proof", label: "Testimonial / Social Proof", icon: "⭐", desc: "Reviews, trust building", purpose: "Mid-funnel retargeting",
    core: "Testimonial-based advertisement featuring customer quote/review prominently, product alongside, warm trustworthy atmosphere, authentic social proof, builds confidence",
    textRules: `QUOTE: Primary element with large quotation marks. 1-2 sentences max. ATTRIBUTION: "— James R., Verified Veteran Buyer" with ★★★★★. PRODUCT: Beside or below quote. CTA: Trust-based — "Join 5,000+ Veterans". Must include star rating or trust badge.`,
    variations: {
      quoteDisplay: ["oversized decorative quotation marks framing text", "italic elegant serif with em dash attribution", "handwritten authentic style quote", "speech bubble graphic containing quote", "key phrase highlighted with color underline", "card panel with rounded corners containing quote"],
      layout: ["quote left — product right", "quote above — product below", "blurred product background — quote overlay", "full width quote — small product corner", "even split screen halves"],
      starRating: ["five gold stars ★★★★★ below quote", "star rating above quote", "stars in attribution line", "single large star with 5/5 text", "no stars — text testimonial only"],
      backgroundMood: ["warm neutral cream beige", "soft out-of-focus lifestyle", "clean white with gold accent", "dark charcoal warm amber lighting", "subtle patriotic faded flag accent"],
      trustElement: ["Verified Purchase ✓ badge", "★★★★★ 2,000+ Reviews", "Trusted by Veterans Nationwide", "Join 12,000+ Happy Customers", "star rating summary graphic"],
      quoteAngle: ["Best quality I've ever seen", "Everyone asked where I got it", "My wife loves it more than I do", "Got this for my dad he was speechless", "Haven't taken it off since it arrived", "Every veteran brother needs one"]
    }},
  { id: "collection_bundle", label: "Collection / Bundle", icon: "🛍️", desc: "Multi-product, upsell, AOV", purpose: "Upsell, AOV, FBT",
    core: "Product collection ad displaying multiple complementary products as curated set, organized attractive arrangement, cohesive visual theme, bundle value clear, editorial shopping feel",
    textRules: `HEADLINE: Collection/bundle concept — "Complete Your Set", "The Full Kit". PRICING: Can show bundle savings. CTA: "Shop the Set", "Get the Bundle". LAYOUT: Multiple products organized attractively.`,
    variations: {
      arrangement: ["clean grid layout equal spacing", "angled overlapping cascade with depth", "overhead flat lay editorial", "side-by-side horizontal lineup", "stacked layered with shadows", "diagonal stagger with energy"],
      background: ["dark wood warm premium", "clean white and gray minimal", "military olive canvas subtle", "two-tone split dark and light", "gradient dark to light", "dark slate stone texture"],
      grouping: ["hat + tee + keychain full set", "bomber jacket + hat outerwear duo", "3 different tee designs same branch", "tee + hoodie + hat core trio", "mixed accessories spread"],
      valueDisplay: ["Save $XX When You Bundle", "slashed total showing bundle price", "3 for $XX deal text", "Complete Set Special Price badge", "no price — Shop the Collection"],
      branchCue: ["branch color accent throughout", "branch emblem watermark background", "branch name in headline", "color-coded border matching branch", "general veteran no specific branch"]
    }},
  { id: "seasonal_campaign", label: "Seasonal / Holiday", icon: "🎆", desc: "Memorial Day, Veterans Day, Christmas", purpose: "Time-sensitive holidays",
    core: "Seasonal holiday campaign ad, festive yet respectful atmosphere, themed decorations and colors woven in, celebratory or honoring mood, seasonal pride and veteran connection",
    textRules: `HEADLINE: Holiday-specific connecting to veteran pride. SUB: Offer/campaign detail. CTA: Time-bound — "Shop Memorial Day Collection", "Limited Holiday Edition". Holiday atmosphere immediately obvious.`,
    variations: {
      holiday: ["4th of July with fireworks bunting sparklers celebration", "Memorial Day poppies flags on graves solemn pride", "Vietnam Veterans Day ribbon colors yellow-red tribute", "Veterans Day salute ceremony Thank You For Your Service", "Christmas warm lights wreath fireplace snow Perfect Gift"],
      setting: ["outdoor festive celebration", "home decorated for holiday", "community gathering event", "intimate family indoor celebration", "formal ceremony or parade"],
      seasonalPlacement: ["holiday elements framing product all sides", "holiday elements background only", "integrated into text design", "festive border accents edges", "scattered confetti overlay"],
      urgencyStyle: ["Limited Edition exclusive badge", "Only Until [Date] deadline", "Holiday Special This Week Only", "Seasonal Exclusive While They Last", "Order by [Date] for Holiday Delivery"],
      moodRange: ["loud celebratory maximum energy", "quiet solemn honoring reverential", "warm family togetherness love", "energetic patriotic excitement", "grateful reflective contemplation"]
    }},
  { id: "storytelling_cinematic", label: "Storytelling / Cinematic", icon: "🎬", desc: "Emotional, brand building", purpose: "Top-of-funnel awareness",
    core: "Cinematic storytelling ad, emotionally powerful movie-poster quality, extremely minimal text letting image speak, atmospheric and evocative, captures feeling not selling, deeply resonant with veteran identity",
    textRules: `HEADLINE: Short powerful poetic MAX 5 words. Single word ok. CTA: Very subtle or none — just logo. LAYOUT: Cinematic image 90-95%, text extremely minimal. MOOD: Deep lasting emotion. No headline (logo only) is acceptable for this style.`,
    variations: {
      scene: ["veteran silhouette against dramatic sunset", "lone figure walking down endless road to horizon", "veteran standing tall looking at vast landscape", "weathered hands gripping railing overlooking distance", "back turned with flag softly blowing in distance", "sitting contemplative on old weathered porch", "dog tags hanging dramatic lighting close-up", "pair of worn boots on ground flag behind"],
      lightingMood: ["epic golden hour warm long shadows", "melancholy blue hour cool tones", "dramatic stormy sky with golden breaks", "powerful backlit silhouette bright sky dark figure", "soft ethereal misty morning diffused", "harsh desert sun extreme contrast"],
      colorGrading: ["warm Kodak film golden highlights", "heavily desaturated moody dramatic", "high contrast black shadows warm gold highlights", "teal shadows orange highlights cinematic", "soft faded nostalgic with grain", "ultra-deep shadows selective warm highlights"],
      textTreatment: ["very small centered bottom edge", "minimal small top left barely noticeable", "barely visible transparent watermark blending in", "subtly integrated into open sky space", "no text — only small logo corner", "single large word semi-transparent ghost overlay"],
      emotionAngle: ["deep pride and honor for service", "quiet inner strength resilience", "solemn remembrance of fallen", "eternal brotherhood transcending time", "emotion of coming home", "heavy cost of freedom meaning", "legacy passed to next generation"]
    }},
];

function buildBannerPrompt(style, productDesc, sizeInfo, opts = {}) {
  const { headline, cta, offer, branch } = opts;
  const v = style.variations;
  const parts = [style.core];
  Object.keys(v).forEach(k => parts.push(pick(v[k])));
  parts.push(style.textRules);
  parts.push(`Output: ${sizeInfo.ratio} (${sizeInfo.px})`);
  parts.push(`Product: ${productDesc}. Product design MUST be preserved EXACTLY.`);
  if (headline) parts.push(`HEADLINE: "${headline}"`);
  else parts.push("Generate appropriate headline for US veteran audience matching this style.");
  parts.push(`CTA: "${cta || "Shop Now"}"`);
  if (offer) parts.push(`OFFER PROMINENTLY: "${offer}"`);
  if (branch) parts.push(`Branch: ${branch} — use branch colors and insignia.`);
  parts.push(`TEXT RULES: 1) All text spelled correctly. 2) All text large enough to read at a glance. 3) Sufficient contrast for legibility. 4) Do NOT overlap product design. 5) Professional typesetting.`);
  return parts.join("\n\n");
}

// ════════════════════════════════════════════════════════════
// AI ANALYZER
// ════════════════════════════════════════════════════════════

function buildAnalyzePrompt(userNotes) {
  return `You are a product expert for Vettailor — US Veterans apparel store (AOP Hats, T-shirts, Bomber Jackets, Leather Jackets, Hoodies, Keychains). Analyze this product image.
${userNotes ? `USER NOTES:\n${userNotes}\n` : ""}
Replace "CUSTOM TEXT"/"YOUR NAME" → realistic veteran name. Replace "0000" → realistic years.
Return ONLY valid JSON:
{"productName":"...","productType":"...","productColor":"...","productDesc":"FULL outfit description","branch":"...","suggestedMockupStyles":["id1","id2"],"suggestedBannerStyles":["id1","id2"],"suggestedHeadline":"...","suggestedOffer":"...","customTextReplaced":{"originalText":"...","replacedWith":"...","originalYears":"...","replacedYears":"..."},"targetAudience":"..."}
CRITICAL: productDesc MUST include full outfit (pants+shoes) for on-model. Match branch colors.`;
}

async function analyzeProduct(geminiKey, b64, mime, userNotes) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;
  const body = { contents: [{ role: "user", parts: [{ inline_data: { mime_type: mime, data: b64 } }, { text: buildAnalyzePrompt(userNotes) }] }], generationConfig: { responseMimeType: "application/json" } };
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
  if (!img) throw new Error(ps.find(p => p.text)?.text?.slice(0, 120) || "No image");
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
  if (!imgOut?.result) throw new Error("OpenAI no image");
  return `data:image/png;base64,${imgOut.result}`;
}

async function genImage(plat, key, model, b64, mime, prompt, sig, apiSize) {
  if (plat === "gemini") return callGemini(key, model, b64, mime, prompt, sig);
  if (plat === "openai") return callOpenAI(key, model, b64, mime, prompt, sig, apiSize);
  throw new Error("Unknown platform");
}

// ════════════════════════════════════════════════════════════
// PARALLEL EXECUTION ENGINE
// ════════════════════════════════════════════════════════════

async function runParallel(tasks, concurrency, onProgress, signal) {
  let idx = 0;
  const results = new Array(tasks.length).fill(null);
  let completed = 0;

  async function worker() {
    while (idx < tasks.length) {
      if (signal?.aborted) return;
      const i = idx++;
      if (i >= tasks.length) return;
      try {
        results[i] = { ok: true, value: await tasks[i]() };
      } catch (err) {
        results[i] = { ok: false, error: err };
      }
      completed++;
      onProgress(completed, i, results[i]);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, tasks.length) }, () => worker());
  await Promise.all(workers);
  return results;
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

const BRANCHES = ["", "U.S. Army", "U.S. Navy", "U.S. Marine Corps", "U.S. Air Force", "U.S. Coast Guard", "U.S. Space Force"];

// ════════════════════════════════════════════════════════════
// MAIN APP
// ════════════════════════════════════════════════════════════

const STATUS = { IDLE: "idle", GENERATING: "generating", SUCCESS: "success", ERROR: "error" };

export default function App() {
  const [plat, setPlat] = useState(() => localStorage.getItem("vt_plat") || "gemini");
  const [keys, setKeys] = useState(() => { try { return JSON.parse(localStorage.getItem("vt_keys") || "{}"); } catch { return {}; } });
  const [showKey, setShowKey] = useState(false);
  const [model, setModel] = useState("");
  const [outputSize, setOutputSize] = useState("square");
  const [imgs, setImgs] = useState([]);
  const [userNotes, setUserNotes] = useState("");
  const [bannerMode, setBannerMode] = useState(false);
  const [productDesc, setProductDesc] = useState("");

  // Multi-select styles
  const [selMockupStyles, setSelMockupStyles] = useState(["clean_studio", "dark_premium", "patriotic_outdoor"]);
  const [selBannerStyles, setSelBannerStyles] = useState(["hero_clean", "dark_cinematic", "patriotic_lifestyle"]);

  const [bannerHeadline, setBannerHeadline] = useState("");
  const [bannerCta, setBannerCta] = useState("Shop Now");
  const [bannerOffer, setBannerOffer] = useState("");
  const [bannerBranch, setBannerBranch] = useState("");
  const [showPrompt, setShowPrompt] = useState(false);
  const [previewStyleId, setPreviewStyleId] = useState(null);
  const [promptOverrides, setPromptOverrides] = useState({}); // { styleId: "edited prompt" }
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeResult, setAnalyzeResult] = useState(null);
  const [genCount, setGenCount] = useState(1);
  const [concurrency, setConcurrency] = useState(2);
  const [queue, setQueue] = useState([]);
  const [results, setResults] = useState([]);
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState([]);
  const [prog, setProg] = useState({ c: 0, t: 0 });
  const [tab, setTab] = useState("setup");
  const [delay, setDelay] = useState(2);
  const [selectedResults, setSelectedResults] = useState(new Set());
  const fileRef = useRef(null);
  const abortRef = useRef(null);
  const logEnd = useRef(null);

  const pf = PLATFORMS[plat];
  const key = keys[plat] || "";
  const sizeInfo = OUTPUT_SIZES.find(s => s.id === outputSize) || OUTPUT_SIZES[1];
  const apiSize = plat === "openai" ? sizeInfo.apiOpenai : sizeInfo.apiGemini;

  const selStyles = bannerMode ? selBannerStyles : selMockupStyles;
  const setSelStyles = bannerMode ? setSelBannerStyles : setSelMockupStyles;
  const allStyles = bannerMode ? BANNER_STYLES : MOCKUP_STYLES;

  useEffect(() => { try { localStorage.setItem("vt_keys", JSON.stringify(keys)); } catch {} }, [keys]);
  useEffect(() => { localStorage.setItem("vt_plat", plat); const ms = PLATFORMS[plat]?.models; if (ms?.length) setModel(ms[0].id); }, [plat]);
  useEffect(() => { logEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [logs]);

  const setKey = v => setKeys(p => ({ ...p, [plat]: v }));
  const log = useCallback((msg, type = "info") => setLogs(p => [...p, { t: new Date().toLocaleTimeString(), msg, type }]), []);
  const onUpload = e => { Array.from(e.target.files).forEach(f => { const r = new FileReader(); r.onload = ev => setImgs(p => [...p, { id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, name: f.name, url: ev.target.result, b64: ev.target.result.split(",")[1], mime: f.type }]); r.readAsDataURL(f); }); e.target.value = ""; };

  const toggleStyle = id => setSelStyles(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const getPromptForStyle = (styleId) => {
    if (bannerMode) {
      const style = BANNER_STYLES.find(s => s.id === styleId);
      return buildBannerPrompt(style, productDesc || "veteran-themed product", sizeInfo, { headline: bannerHeadline, cta: bannerCta, offer: bannerOffer, branch: bannerBranch });
    } else {
      const style = MOCKUP_STYLES.find(s => s.id === styleId);
      return buildMockupPrompt(style, productDesc || "veteran-themed product", sizeInfo);
    }
  };

  const handleAnalyze = async (img) => {
    const geminiKey = keys.gemini;
    if (!geminiKey) { log("Cần Gemini API key!", "error"); return; }
    setAnalyzing(true); log(`🔍 AI đang phân tích: ${img.name}...`);
    try {
      const r = await analyzeProduct(geminiKey, img.b64, img.mime, userNotes);
      setAnalyzeResult(r);
      if (r.productDesc) setProductDesc(r.productDesc);
      else if (r.productName) setProductDesc(`${r.productColor || ""} ${r.productName}`.trim());
      if (r.branch) setBannerBranch(r.branch);
      if (r.suggestedHeadline) setBannerHeadline(r.suggestedHeadline);
      if (r.suggestedOffer) setBannerOffer(r.suggestedOffer);
      if (r.suggestedMockupStyles?.length) setSelMockupStyles(r.suggestedMockupStyles);
      if (r.suggestedBannerStyles?.length) setSelBannerStyles(r.suggestedBannerStyles);
      log(`✅ ${r.productName} (${r.productType}) — ${r.branch || "General"}`, "success");
    } catch (err) { log(`❌ ${err.message}`, "error"); }
    setAnalyzing(false);
  };

  // ── PARALLEL GENERATE ──
  const startGen = async () => {
    if (!key) return log("Chưa nhập API Key!", "error");
    if (!imgs.length) return log("Chưa upload ảnh!", "error");
    if (!selStyles.length) return log("Chưa chọn style!", "error");

    const q = [];
    imgs.forEach(img => {
      selStyles.forEach(styleId => {
        const styleObj = allStyles.find(s => s.id === styleId);
        for (let i = 0; i < genCount; i++) {
          q.push({ id: `${img.id}_${styleId}_${i}_${Date.now()}_${Math.random().toString(36).slice(2,5)}`, img, label: `${styleObj.label} #${i + 1}`, styleId, idx: i });
        }
      });
    });

    const qState = q.map(i => ({ ...i, status: STATUS.IDLE, result: null, error: null }));
    setQueue(qState); setResults([]); setSelectedResults(new Set());
    setRunning(true); setTab("generate"); setProg({ c: 0, t: q.length });
    const ctrl = new AbortController(); abortRef.current = ctrl;
    log(`🚀 ${q.length} ${bannerMode ? "banners" : "mockups"} · ${selStyles.length} styles · ${pf.label} · ×${concurrency} parallel`);

    const tasks = q.map((item, idx) => async () => {
      if (ctrl.signal.aborted) throw new Error("Aborted");
      // Delay between tasks (except first batch)
      if (idx >= concurrency) await new Promise(r => setTimeout(r, delay * 1000));
      const styleObj = allStyles.find(s => s.id === item.styleId);
      const prompt = promptOverrides[item.styleId] || (bannerMode
        ? buildBannerPrompt(styleObj, productDesc || "veteran-themed product", sizeInfo, { headline: bannerHeadline, cta: bannerCta, offer: bannerOffer, branch: bannerBranch })
        : buildMockupPrompt(styleObj, productDesc || "veteran-themed product", sizeInfo));
      return await genImage(plat, key, model, item.img.b64, item.img.mime, prompt, ctrl.signal, apiSize);
    });

    let okCount = 0;
    await runParallel(tasks, concurrency, (completed, idx, result) => {
      const item = q[idx];
      if (result.ok) {
        qState[idx] = { ...qState[idx], status: STATUS.SUCCESS, result: result.value };
        setResults(p => [...p, { id: item.id, url: result.value, src: item.img.name, type: item.label, styleId: item.styleId }]);
        okCount++;
        log(`✅ [${completed}/${q.length}] ${item.label} — ${item.img.name}`, "success");
      } else {
        const errMsg = result.error?.name === "AbortError" ? "Stopped" : result.error?.message || "Error";
        qState[idx] = { ...qState[idx], status: STATUS.ERROR, error: errMsg };
        if (result.error?.name !== "AbortError") log(`❌ [${completed}/${q.length}] ${item.label} — ${errMsg}`, "error");
      }
      setQueue([...qState]);
      setProg({ c: completed, t: q.length });
    }, ctrl.signal);

    setRunning(false); log(`🏁 ${okCount}/${q.length} thành công.`);
  };

  const toggleResultSelect = id => setSelectedResults(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const selectAllResults = () => setSelectedResults(new Set(results.map(r => r.id)));
  const deselectAllResults = () => setSelectedResults(new Set());
  const dlItems = items => items.forEach((it, i) => setTimeout(() => dl(it.url, it.filename), i * 400));
  const dlSelected = () => dlItems(results.filter(r => selectedResults.has(r.id)).map((r, i) => ({ url: r.url, filename: `vettailor_${r.styleId}_${i + 1}_${r.src.replace(/\.[^.]+$/, "")}.png` })));
  const dlAll = () => dlItems(results.map((r, i) => ({ url: r.url, filename: `vettailor_${r.styleId}_${i + 1}_${r.src.replace(/\.[^.]+$/, "")}.png` })));

  const total = imgs.length * selStyles.length * genCount;
  const tabs2 = [
    { id: "setup", l: "Setup", i: "⚙️" },
    { id: "upload", l: "Upload", i: "📤" },
    { id: "style", l: bannerMode ? "Banner Styles" : "Mockup Styles", i: bannerMode ? "🎯" : "🎨" },
    { id: "generate", l: "Generate", i: "🚀" },
    { id: "results", l: `Results${results.length ? ` (${results.length})` : ""}`, i: "🖼️" },
  ];

  return (
    <div style={{ fontFamily: "'Segoe UI',-apple-system,system-ui,sans-serif", background: "linear-gradient(145deg,#0a0a15,#111827,#0f172a)", color: "#e2e8f0", minHeight: "100vh" }}>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}*{box-sizing:border-box}::selection{background:#7c3aed;color:#fff}::-webkit-scrollbar{width:6px}::-webkit-scrollbar-thumb{background:#374151;border-radius:3px}.card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:20px;margin-bottom:14px}.inp{background:rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.1);color:#e2e8f0;padding:10px 14px;border-radius:8px;font-size:14px;width:100%;outline:none}.inp:focus{border-color:#7c3aed}.inp::placeholder{color:#4b5563}textarea.inp{resize:vertical;min-height:50px}.btn{border:none;cursor:pointer;font-weight:600;border-radius:8px;font-size:14px;display:inline-flex;align-items:center;gap:6px;transition:all .15s}.btn-p{background:linear-gradient(135deg,#7c3aed,#6d28d9);color:#fff;padding:11px 22px}.btn-p:hover{box-shadow:0 4px 20px rgba(124,58,237,.4)}.btn-p:disabled{opacity:.4;cursor:not-allowed}.btn-s{background:rgba(255,255,255,.07);color:#c0c8d8;border:1px solid rgba(255,255,255,.1);padding:8px 14px;font-size:13px}.btn-s:hover{background:rgba(255,255,255,.12)}.btn-d{background:rgba(220,38,38,.15);color:#fca5a5;border:1px solid rgba(220,38,38,.25);padding:10px 20px}.tab{padding:10px 16px;border:none;cursor:pointer;font-size:13px;font-weight:600;border-radius:10px 10px 0 0;display:flex;align-items:center;gap:6px;background:transparent;color:#64748b;transition:all .2s}.tab:hover{color:#94a3b8}.tab.on{background:rgba(124,58,237,.15);color:#c4b5fd;border-bottom:2px solid #7c3aed}.scard{border:2px solid rgba(255,255,255,.06);border-radius:12px;padding:14px;cursor:pointer;transition:all .2s;background:rgba(0,0,0,.15)}.scard:hover{border-color:rgba(124,58,237,.3)}.scard.on{border-color:#7c3aed;background:rgba(124,58,237,.08)}.pbar{height:5px;background:rgba(255,255,255,.06);border-radius:3px;overflow:hidden}.pfill{height:100%;background:linear-gradient(90deg,#7c3aed,#a78bfa);border-radius:3px;transition:width .4s}.log{padding:3px 0;font-size:12px;font-family:Consolas,monospace;animation:fadeIn .25s}.log-info{color:#94a3b8}.log-success{color:#6ee7b7}.log-error{color:#fca5a5}.log-warn{color:#fcd34d}.rcard{border-radius:12px;overflow:hidden;background:rgba(0,0,0,.25);border:1px solid rgba(255,255,255,.06);transition:all .2s;position:relative}.rcard:hover{transform:translateY(-3px);box-shadow:0 8px 30px rgba(0,0,0,.4)}.rcard.sel{border-color:#7c3aed;box-shadow:0 0 0 2px rgba(124,58,237,.4)}.pfb{padding:12px 16px;border-radius:10px;cursor:pointer;border:2px solid rgba(255,255,255,.06);background:rgba(0,0,0,.2);display:flex;align-items:center;gap:10px;width:100%;transition:all .2s}.pfb:hover{border-color:rgba(255,255,255,.15)}.pfb.on{border-color:var(--pc);background:rgba(255,255,255,.04)}.mode-btn{padding:10px 20px;border-radius:8px;cursor:pointer;font-weight:600;font-size:14px;border:2px solid rgba(255,255,255,.1);transition:all .2s;background:rgba(0,0,0,.2);color:#94a3b8}.mode-btn:hover{border-color:rgba(255,255,255,.2)}.mode-btn.on{border-color:#7c3aed;background:rgba(124,58,237,.12);color:#c4b5fd}.chk{width:20px;height:20px;border-radius:6px;border:2px solid rgba(255,255,255,.2);background:rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s;position:absolute;top:8px;left:8px;z-index:2}.chk.on{border-color:#7c3aed;background:#7c3aed}`}</style>

      <header style={{ padding: "18px 24px 0", borderBottom: "1px solid rgba(255,255,255,.05)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 21, fontWeight: 700, color: "#f1f5f9", display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 26 }}>🎖️</span> Vettailor Generator v3</h1>
            <p style={{ margin: "3px 0 0", fontSize: 12, color: "#64748b" }}><span style={{ color: pf.color }}>{pf.icon} {pf.label}</span> · {sizeInfo.px} · {bannerMode ? "🎯 Banner" : "🎨 Mockup"} · ×{concurrency} parallel</p>
          </div>
          {running && <div style={{ textAlign: "right" }}><div style={{ fontSize: 12, color: "#a78bfa", fontWeight: 600, marginBottom: 3 }}>{prog.c}/{prog.t}</div><div className="pbar" style={{ width: 110 }}><div className="pfill" style={{ width: `${prog.t ? (prog.c / prog.t) * 100 : 0}%` }} /></div></div>}
        </div>
        <div style={{ display: "flex", gap: 3, overflowX: "auto" }}>{tabs2.map(t => <button key={t.id} className={`tab ${tab === t.id ? "on" : ""}`} onClick={() => setTab(t.id)}><span>{t.i}</span><span style={{ whiteSpace: "nowrap" }}>{t.l}</span></button>)}</div>
      </header>

      <main style={{ padding: "20px 24px 40px", maxWidth: 960, margin: "0 auto" }}>

        {/* ═══ SETUP ═══ */}
        {tab === "setup" && (<>
          <div className="card"><h3 style={{ margin: "0 0 10px", fontSize: 15, color: "#c4b5fd" }}>🔀 Chế độ</h3><div style={{ display: "flex", gap: 8 }}><button className={`mode-btn ${!bannerMode ? "on" : ""}`} onClick={() => setBannerMode(false)}>🎨 Mockup Generator</button><button className={`mode-btn ${bannerMode ? "on" : ""}`} onClick={() => setBannerMode(true)}>🎯 Banner Generator</button></div></div>
          <div className="card"><h3 style={{ margin: "0 0 10px", fontSize: 15, color: "#c4b5fd" }}>🌐 Nền tảng AI</h3><div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{Object.values(PLATFORMS).map(p => (<button key={p.id} className={`pfb ${plat === p.id ? "on" : ""}`} style={{ "--pc": p.color }} onClick={() => setPlat(p.id)}><span style={{ fontSize: 20, color: p.color, width: 28, textAlign: "center" }}>{p.icon}</span><div style={{ flex: 1, textAlign: "left" }}><div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{p.label}</div><div style={{ fontSize: 11, color: "#64748b" }}>{p.models.map(m => m.label).join(" · ")}</div></div><div style={{ width: 16, height: 16, borderRadius: "50%", border: `2px solid ${plat === p.id ? p.color : "rgba(255,255,255,.15)"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>{plat === p.id && <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color }} />}</div></button>))}</div></div>
          <div className="card">
            <h3 style={{ margin: "0 0 4px", fontSize: 15, color: "#c4b5fd" }}>🔑 API Key & Settings</h3>
            <p style={{ margin: "0 0 10px", fontSize: 12, color: "#64748b" }}>{pf.keyHelp} <a href={pf.keyLink} target="_blank" rel="noopener noreferrer" style={{ color: pf.color, textDecoration: "none" }}>↗</a></p>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}><input className="inp" type={showKey ? "text" : "password"} placeholder={pf.keyPlaceholder} value={key} onChange={e => setKey(e.target.value)} style={{ flex: 1 }} /><button className="btn btn-s" onClick={() => setShowKey(!showKey)}>{showKey ? "🙈" : "👁️"}</button></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><label style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: 4 }}>Model</label><select className="inp" value={model} onChange={e => setModel(e.target.value)} style={{ cursor: "pointer" }}>{pf.models.map(m => <option key={m.id} value={m.id}>{m.label} — {m.detail}</option>)}</select></div>
              <div><label style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: 4 }}>Kích thước output</label><select className="inp" value={outputSize} onChange={e => setOutputSize(e.target.value)} style={{ cursor: "pointer" }}>{OUTPUT_SIZES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}</select></div>
            </div>
            <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <div><label style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: 3 }}>Delay (s)</label><input className="inp" type="number" min={0} max={30} value={delay} onChange={e => setDelay(Math.max(0, +e.target.value))} style={{ width: 70 }} /></div>
              <div><label style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: 3 }}>Ảnh / style</label><input className="inp" type="number" min={1} max={20} value={genCount} onChange={e => setGenCount(Math.max(1, Math.min(20, +e.target.value)))} style={{ width: 70 }} /></div>
              <div><label style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: 3 }}>Parallel</label><input className="inp" type="number" min={1} max={5} value={concurrency} onChange={e => setConcurrency(Math.max(1, Math.min(5, +e.target.value)))} style={{ width: 70 }} /></div>
            </div>
            <p style={{ margin: "8px 0 0", fontSize: 10, color: "#64748b" }}>Parallel cao (3-5) nhanh hơn nhưng dễ bị rate limit. Khuyến nghị: Gemini Free = 2, Paid = 3-4.</p>
          </div>
          <button className="btn btn-p" onClick={() => key && setTab("upload")} disabled={!key} style={{ width: "100%" }}>Tiếp → Upload ảnh</button>
        </>)}

        {/* ═══ UPLOAD ═══ */}
        {tab === "upload" && (<>
          <div className="card"><h3 style={{ margin: "0 0 12px", fontSize: 15, color: "#c4b5fd" }}>📤 Upload ảnh sản phẩm</h3><div style={{ border: "2px dashed rgba(255,255,255,.12)", borderRadius: 14, padding: 32, textAlign: "center", cursor: "pointer", background: "rgba(0,0,0,.1)" }} onClick={() => fileRef.current?.click()} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); onUpload({ target: { files: e.dataTransfer.files }, value: "" }); }}><div style={{ fontSize: 32, marginBottom: 4 }}>📁</div><div style={{ fontSize: 14, fontWeight: 600, color: "#c0c8d8" }}>Click hoặc kéo thả</div><div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>PNG, JPG, WEBP</div><input ref={fileRef} type="file" accept="image/*" multiple onChange={onUpload} style={{ display: "none" }} /></div>
            {imgs.length > 0 && <div style={{ marginTop: 14 }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8" }}>{imgs.length} ảnh</span><button className="btn btn-s" onClick={() => setImgs([])} style={{ fontSize: 11 }}>Xoá hết</button></div><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(85px,1fr))", gap: 6 }}>{imgs.map(img => <div key={img.id} style={{ position: "relative" }}><img src={img.url} alt="" style={{ width: "100%", height: 85, objectFit: "cover", borderRadius: 8, border: "1px solid rgba(255,255,255,.08)" }} /><button onClick={() => setImgs(p => p.filter(i => i.id !== img.id))} style={{ position: "absolute", top: 2, right: 2, width: 18, height: 18, borderRadius: "50%", border: "none", background: "rgba(220,38,38,.8)", color: "#fff", fontSize: 9, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button></div>)}</div></div>}
          </div>
          {imgs.length > 0 && (<div className="card"><div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}><span style={{ fontSize: 20 }}>📋</span><div><h4 style={{ margin: 0, fontSize: 14, color: "#c4b5fd" }}>Ghi chú cho AI</h4></div></div><textarea className="inp" value={userNotes} onChange={e => setUserNotes(e.target.value)} rows={2} placeholder="VD: Thay CUSTOM TEXT → JOHNSON, years → 1975-2003" style={{ fontSize: 12 }} /></div>)}
          {imgs.length > 0 && (<div className="card" style={{ border: "1px solid rgba(168,139,250,.3)", background: "rgba(124,58,237,.04)" }}><div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}><span style={{ fontSize: 22 }}>🧠</span><div><h4 style={{ margin: 0, fontSize: 14, color: "#c4b5fd" }}>AI Product Analyzer</h4><p style={{ margin: 0, fontSize: 11, color: "#64748b" }}>Phân tích ảnh → tự điền mô tả, branch, headline, gợi ý styles</p></div></div>
            {!keys.gemini && <div style={{ padding: "8px 10px", borderRadius: 6, background: "rgba(250,204,21,.08)", border: "1px solid rgba(250,204,21,.15)", marginBottom: 8, fontSize: 11, color: "#fcd34d" }}>⚠ Cần Gemini key</div>}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{imgs.map(img => (<button key={img.id} className="btn btn-s" disabled={analyzing || !keys.gemini} onClick={() => handleAnalyze(img)} style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}><img src={img.url} alt="" style={{ width: 24, height: 24, objectFit: "cover", borderRadius: 4 }} />{analyzing ? "Đang phân tích..." : `Analyze: ${img.name.slice(0, 20)}`}</button>))}</div>
            {analyzeResult && (<div style={{ marginTop: 12, padding: "12px 14px", borderRadius: 8, background: "rgba(0,0,0,.2)" }}><div style={{ fontSize: 12, fontWeight: 600, color: "#6ee7b7", marginBottom: 6 }}>✅ {analyzeResult.productName} — {analyzeResult.branch}</div><div style={{ fontSize: 11, color: "#6ee7b7" }}>→ Đã tự điền + chọn styles gợi ý.</div></div>)}
          </div>)}
          {imgs.length > 0 && (<div className="card"><h4 style={{ margin: "0 0 8px", fontSize: 14, color: "#c4b5fd" }}>📝 Mô tả sản phẩm</h4><textarea className="inp" value={productDesc} onChange={e => setProductDesc(e.target.value)} rows={3} placeholder="Mô tả đầy đủ: tên SP, màu, chi tiết, kèm outfit model (quần, giày)..." style={{ fontSize: 12 }} /></div>)}
          <button className="btn btn-p" onClick={() => imgs.length && setTab("style")} disabled={!imgs.length} style={{ width: "100%" }}>Tiếp → Chọn {bannerMode ? "Banner" : "Mockup"} Styles</button>
        </>)}

        {/* ═══ STYLE MULTI-SELECT ═══ */}
        {tab === "style" && (<>
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 15, color: "#c4b5fd" }}>{bannerMode ? "🎯 Chọn Banner Styles" : "🎨 Chọn Mockup Styles"} ({selStyles.length}/10)</h3>
              <div style={{ display: "flex", gap: 6 }}>
                <button className="btn btn-s" onClick={() => setSelStyles(allStyles.map(s => s.id))} style={{ fontSize: 10 }}>Chọn hết</button>
                <button className="btn btn-s" onClick={() => setSelStyles([])} style={{ fontSize: 10 }}>Bỏ hết</button>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 10 }}>
              {allStyles.map(s => (
                <div key={s.id} className={`scard ${selStyles.includes(s.id) ? "on" : ""}`} onClick={() => toggleStyle(s.id)}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 22 }}>{s.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{s.label}</div>
                      <div style={{ fontSize: 10, color: "#64748b" }}>{s.desc}</div>
                    </div>
                    <div style={{ width: 20, height: 20, borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, background: selStyles.includes(s.id) ? "#7c3aed" : "rgba(255,255,255,.06)", border: `2px solid ${selStyles.includes(s.id) ? "#7c3aed" : "rgba(255,255,255,.1)"}`, color: "#fff", flexShrink: 0 }}>{selStyles.includes(s.id) ? "✓" : ""}</div>
                  </div>
                  <div style={{ fontSize: 9, color: "#4b5563" }}>{s.purpose}</div>
                </div>
              ))}
            </div>
          </div>

          {bannerMode && (<div className="card"><h4 style={{ margin: "0 0 8px", fontSize: 14, color: "#c4b5fd" }}>✏️ Banner Text (tuỳ chọn)</h4><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}><Field label="Headline" value={bannerHeadline} onChange={setBannerHeadline} placeholder="AI tự gen nếu trống" /><Field label="CTA" value={bannerCta} onChange={setBannerCta} placeholder="Shop Now" /><Field label="Offer" value={bannerOffer} onChange={setBannerOffer} placeholder="20% OFF..." /><div><label style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: 3 }}>Branch</label><select className="inp" value={bannerBranch} onChange={e => setBannerBranch(e.target.value)} style={{ cursor: "pointer" }}>{BRANCHES.map(b => <option key={b} value={b}>{b || "— Auto"}</option>)}</select></div></div></div>)}

          {/* Prompt Preview */}
          <div className="card" style={{ border: "1px solid rgba(168,139,250,.2)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <h4 style={{ margin: 0, fontSize: 14, color: "#a78bfa" }}>👁️ Prompt Preview</h4>
              <button className="btn btn-s" onClick={() => setShowPrompt(!showPrompt)} style={{ fontSize: 11 }}>{showPrompt ? "Ẩn" : "Xem"}</button>
            </div>
            {showPrompt && (<div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                {selStyles.map(id => {
                  const s = allStyles.find(x => x.id === id);
                  return <button key={id} className={`btn btn-s`} onClick={() => setPreviewStyleId(id)} style={{ fontSize: 10, background: previewStyleId === id ? "rgba(124,58,237,.2)" : undefined, borderColor: previewStyleId === id ? "#7c3aed" : undefined }}>{s?.icon} {s?.label}</button>;
                })}
              </div>
              {previewStyleId && (<div>
                <p style={{ fontSize: 10, color: "#64748b", marginBottom: 4 }}>{promptOverrides[previewStyleId] ? "✏️ Custom prompt (cố định, không random)" : "🎲 Random mỗi lần gen — sửa để override:"}</p>
                <textarea className="inp" value={promptOverrides[previewStyleId] || getPromptForStyle(previewStyleId)} onChange={e => setPromptOverrides(p => ({ ...p, [previewStyleId]: e.target.value }))} rows={8} style={{ fontSize: 11, lineHeight: 1.5, fontFamily: "Consolas, monospace" }} />
                <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                  {promptOverrides[previewStyleId] && <button className="btn btn-s" onClick={() => setPromptOverrides(p => { const n = { ...p }; delete n[previewStyleId]; return n; })} style={{ fontSize: 10 }}>🔄 Reset random</button>}
                  <button className="btn btn-s" onClick={() => navigator.clipboard.writeText(promptOverrides[previewStyleId] || getPromptForStyle(previewStyleId))} style={{ fontSize: 10 }}>📋 Copy</button>
                </div>
              </div>)}
            </div>)}
          </div>

          <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(124,58,237,.06)", border: "1px solid rgba(124,58,237,.12)", marginBottom: 14 }}>
            <strong style={{ color: "#c4b5fd" }}>{imgs.length} ảnh × {selStyles.length} styles × {genCount} lần = {total} ảnh</strong>
            <span style={{ fontSize: 12, color: "#64748b", marginLeft: 8 }}>~{Math.ceil((total * 8) / concurrency / 60)} phút (×{concurrency} parallel)</span>
            <div style={{ marginTop: 4, fontSize: 11, color: "#94a3b8" }}>
              Styles: {selStyles.map(id => allStyles.find(s => s.id === id)?.icon).join(" ")}
              <span style={{ color: "#6ee7b7", marginLeft: 6 }}>🎲 Random variations mỗi ảnh</span>
            </div>
          </div>
          <button className="btn btn-p" onClick={startGen} disabled={running || !total} style={{ width: "100%" }}>🚀 Generate {total} {bannerMode ? "banner" : "mockup"}{total > 1 ? "s" : ""}</button>
        </>)}

        {/* ═══ GENERATE ═══ */}
        {tab === "generate" && (<>
          <div className="card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 15, color: "#c4b5fd" }}>{running ? `⚡ Generating (×${concurrency})...` : "📋 Queue"}</h3>
              {running && <button className="btn btn-d" onClick={() => abortRef.current?.abort()}>⏹ Dừng</button>}
            </div>
            {prog.t > 0 && <div style={{ marginBottom: 14 }}><div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginBottom: 3 }}><span>Tiến độ</span><span>{prog.c}/{prog.t} ({Math.round((prog.c / prog.t) * 100)}%)</span></div><div className="pbar"><div className="pfill" style={{ width: `${(prog.c / prog.t) * 100}%` }} /></div></div>}
            <div style={{ maxHeight: 300, overflowY: "auto" }}>{queue.map(q => <div key={q.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,.03)" }}><img src={q.img.url} alt="" style={{ width: 34, height: 34, objectFit: "cover", borderRadius: 6 }} /><div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 12, fontWeight: 500, color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{q.img.name} → {q.label}</div>{q.error && <div style={{ fontSize: 10, color: "#fca5a5", marginTop: 1 }}>{q.error}</div>}</div><Badge status={q.status} /></div>)}</div>
          </div>
          <div className="card"><h4 style={{ margin: "0 0 6px", fontSize: 13, color: "#94a3b8" }}>📝 Logs</h4><div style={{ maxHeight: 200, overflowY: "auto", background: "rgba(0,0,0,.25)", borderRadius: 8, padding: 10, fontFamily: "Consolas,monospace" }}>{logs.length === 0 ? <div style={{ fontSize: 11, color: "#374151" }}>...</div> : logs.map((l, i) => <div key={i} className={`log log-${l.type}`}><span style={{ color: "#374151" }}>[{l.t}]</span> {l.msg}</div>)}<div ref={logEnd} /></div></div>
          {!running && results.length > 0 && <button className="btn btn-p" onClick={() => setTab("results")} style={{ width: "100%" }}>Xem {results.length} kết quả →</button>}
        </>)}

        {/* ═══ RESULTS ═══ */}
        {tab === "results" && (<>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
            <h3 style={{ margin: 0, fontSize: 15, color: "#c4b5fd" }}>🖼️ {results.length} {bannerMode ? "banners" : "mockups"}</h3>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {results.length > 0 && (<>
                <button className="btn btn-s" onClick={selectedResults.size === results.length ? deselectAllResults : selectAllResults} style={{ fontSize: 11 }}>{selectedResults.size === results.length ? "☐ Bỏ chọn" : "☑ Chọn tất cả"}</button>
                {selectedResults.size > 0 && <button className="btn btn-p" onClick={dlSelected} style={{ padding: "8px 16px", fontSize: 12 }}>⬇️ Download {selectedResults.size} ảnh</button>}
                <button className="btn btn-s" onClick={dlAll} style={{ fontSize: 11 }}>⬇️ Tải tất cả</button>
              </>)}
              <button className="btn btn-s" onClick={() => setTab("style")} style={{ fontSize: 11 }}>🎲 Gen thêm</button>
            </div>
          </div>
          {!results.length
            ? <div className="card" style={{ textAlign: "center", padding: 40 }}><div style={{ fontSize: 34, marginBottom: 6 }}>🎨</div><div style={{ fontSize: 13, color: "#64748b" }}>Chưa có kết quả</div></div>
            : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 14 }}>
                {results.map((r, i) => (
                  <div key={r.id} className={`rcard ${selectedResults.has(r.id) ? "sel" : ""}`}>
                    <div className={`chk ${selectedResults.has(r.id) ? "on" : ""}`} onClick={() => toggleResultSelect(r.id)}>{selectedResults.has(r.id) && <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>✓</span>}</div>
                    <img src={r.url} alt="" style={{ width: "100%", height: 200, objectFit: "cover", display: "block", cursor: "pointer" }} onClick={() => toggleResultSelect(r.id)} />
                    <div style={{ padding: 10 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0" }}>{r.type}</div>
                      <div style={{ fontSize: 10, color: "#64748b", marginTop: 1 }}>{r.src} · {r.styleId}</div>
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
