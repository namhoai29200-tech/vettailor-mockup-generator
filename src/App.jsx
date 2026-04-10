import { useState, useRef, useCallback, useEffect } from "react";

// ════════════════════════════════════════════════════════════
// PLATFORMS
// ════════════════════════════════════════════════════════════

const PLATFORMS = {
  gemini: { id: "gemini", label: "Google Gemini", icon: "✦", color: "#4285f4", keyPlaceholder: "AIzaSy...", keyHelp: "Free tại aistudio.google.com", keyLink: "https://aistudio.google.com",
    models: [{ id: "gemini-2.5-flash-image", label: "Nano Banana", detail: "Free ~500/day", tier: "free" }, { id: "gemini-3.1-flash-image-preview", label: "Nano Banana 2", detail: "Free · Mới nhất", tier: "free" }, { id: "gemini-3-pro-image-preview", label: "Nano Banana Pro", detail: "$0.134/img", tier: "paid" }] },
  openai: { id: "openai", label: "OpenAI DALL-E", icon: "◎", color: "#10a37f", keyPlaceholder: "sk-...", keyHelp: "Lấy tại platform.openai.com", keyLink: "https://platform.openai.com/api-keys",
    models: [{ id: "dall-e-3", label: "DALL-E 3", detail: "$0.04-0.12/img", tier: "paid" }, { id: "dall-e-2", label: "DALL-E 2", detail: "$0.02/img", tier: "paid" }] },
};

// ════════════════════════════════════════════════════════════
// OUTPUT SIZES
// ════════════════════════════════════════════════════════════

const OUTPUT_SIZES = [
  { id: "landscape", label: "Landscape 1.91:1 — 1920×1080", px: "1920×1080", ratio: "1.91:1", apiGemini: "1536x1024", apiOpenai: "1792x1024" },
  { id: "square", label: "Square 1:1 — 1200×1200", px: "1200×1200", ratio: "1:1", apiGemini: "1024x1024", apiOpenai: "1024x1024" },
  { id: "portrait", label: "Portrait 4:5 — 960×1200", px: "960×1200", ratio: "4:5", apiGemini: "1024x1536", apiOpenai: "1024x1792" },
  { id: "vertical", label: "Vertical 4:5 — 1080×1350", px: "1080×1350", ratio: "4:5", apiGemini: "1024x1536", apiOpenai: "1024x1792" },
];

const pick = arr => arr[Math.floor(Math.random() * arr.length)];

// ════════════════════════════════════════════════════════════
// PRODUCT FIDELITY RULES (đặt ĐẦU TIÊN trong mọi prompt)
// ════════════════════════════════════════════════════════════

const FIDELITY_RULES = `MOST IMPORTANT RULE — PRODUCT FIDELITY: The product from the reference image must be reproduced with 100% accuracy. Every color, pattern, text, emblem, stitch, and detail on the product must match the reference exactly. Do NOT alter, recolor, redesign, or simplify any part of the product. Do NOT crop or cut off any part of the product.`;

const NEGATIVE_RULES = `ABSOLUTE PROHIBITIONS — NEVER do any of these: Never add any text, words, letters, watermarks, logos, URLs, or brand names that are not on the original product. Never add labels like "Headline:", "CTA:", "Text Rules:" or any instruction text. Never add emoji overlays. Never change the product design in any way. Never make the product blurry or low quality.`;

// ════════════════════════════════════════════════════════════
// 10 MOCKUP STYLES (restructured: fidelity first, on-model for hats)
// ════════════════════════════════════════════════════════════

const MOCKUP_STYLES = [
  { id: "clean_studio", label: "Clean Studio", icon: "⬜", desc: "E-commerce, PMax, product page", purpose: "Google Shopping, PMax, product page",
    core: "Professional e-commerce product photography. The product is placed on a clean hat stand or mannequin head (for hats) or invisible mannequin (for apparel). Clean minimal background, soft studio lighting, subtle shadow, centered composition, high-end catalog feel, crisp sharp focus",
    variations: {
      background: ["pure white seamless backdrop", "light gray gradient backdrop", "warm beige seamless surface", "soft cream background", "pale blue-gray studio backdrop"],
      shadow: ["soft diffused drop shadow beneath product", "subtle mirror-like reflection on glossy surface", "floating feel with minimal shadow", "contact shadow only where product meets surface"],
      light: ["soft even studio lighting from all sides", "slight left key light with gentle fill on right", "overhead diffused softbox creating even illumination", "back-lit with soft fill light creating subtle rim glow"],
      surface: ["seamless infinity curve paper", "smooth matte acrylic surface", "subtle warm-to-cool gradient floor", "clean white elevated platform"]
    }},
  { id: "dark_premium", label: "Dark Premium", icon: "🖤", desc: "Dramatic, luxury, scroll-stopping", purpose: "Meta Feed, jacket & hat focus",
    core: "Dramatic low-key product photography. Product placed on dark hat stand or mannequin head (for hats) or displayed on invisible mannequin (for apparel). Dark moody background, cinematic rim lighting, premium luxury feel, high contrast, editorial product shot",
    variations: {
      background: ["dark wood grain surface with visible knots", "polished black stone slate with subtle veining", "brushed dark gunmetal surface", "weathered dark leather with natural patina", "concrete surface with dark charcoal wash"],
      light: ["warm amber rim light glowing from left side", "cold blue rim light cutting from right side", "dual-side rim lighting warm left and cool right", "single overhead spot with dramatic fall-off into darkness", "golden backlight creating halo with dark fill on front"],
      tone: ["warm amber and gold tones throughout", "cool steel blue monochromatic tones", "neutral deep blacks with minimal color cast", "rich burgundy accent light bleeding into edges"],
      atmosphere: ["clean dark void with deep blacks", "subtle smoke wisps curling through light beam", "fine dust particles floating in visible light beam", "deep dark vignette framing product in center"]
    }},
  { id: "patriotic_outdoor", label: "Patriotic Outdoor", icon: "🇺🇸", desc: "Veteran pride, emotional, warm", purpose: "Meta Ads, emotional engagement",
    core: "American patriotic lifestyle photograph. A proud middle-aged American veteran man wearing the product (hat on his head, or apparel on his body). Golden hour warm natural outdoor light. The veteran looks confident and relaxed. Focus on the product while showing the patriotic American setting behind him",
    variations: {
      scene: ["standing in his backyard with a weathered wooden fence and green lawn behind him", "sitting relaxed on the front porch of a classic American home", "standing in an open country field with tall grass at golden sunset", "leaning against a classic American pickup truck", "standing proudly on a quiet rural country road"],
      time: ["golden hour warm side light with long shadows", "soft early morning light with gentle warmth", "late afternoon warm amber glow", "overcast sky providing soft even diffused light"],
      elements: ["American flag partially visible in the background", "vintage pickup truck parked nearby", "wooden fence with natural surroundings"],
      pose: ["looking slightly to the side with a confident calm expression", "arms crossed standing tall and proud", "casual relaxed posture with hands in pockets", "slight smile looking toward camera"]
    }},
  { id: "rugged_tactical", label: "Rugged Tactical", icon: "🔧", desc: "Military, gritty, masculine", purpose: "Bomber & leather jacket focus",
    core: "Rugged military-inspired photograph. A tough veteran man wearing the product in a gritty industrial or tactical environment. Strong masculine energy, muted earth tones, authentic worn-in feel. The man looks like a real veteran — weathered, strong, confident. Product is clearly visible and in sharp focus",
    variations: {
      setting: ["standing in a mechanic garage with tools on the wall behind him", "inside an old aircraft hangar with corrugated metal walls", "in an industrial workshop with a heavy workbench", "next to an olive green military vehicle", "in a metal warehouse with wooden shipping crates"],
      props: ["metal dog tags visible around his neck", "worn combat boots on his feet", "military patches visible in background"],
      texture: ["raw concrete floor and walls in background", "rusted metal surfaces and fixtures nearby", "worn weathered wooden planks and beams", "corrugated galvanized steel wall panels"],
      color: ["olive drab green and desert tan palette", "gunmetal gray and rust tones", "dark earth brown and sandy khaki", "military forest green and chocolate brown"]
    }},
  { id: "everyday_casual", label: "Everyday Casual", icon: "☕", desc: "Relatable, approachable, real life", purpose: "Retargeting, broad audience",
    core: "Casual everyday American lifestyle photograph. A friendly veteran man wearing the product in a normal everyday setting. Relaxed natural feel, soft ambient light, approachable and comfortable. He looks like a real person in his daily life — not posing, just being himself. Product clearly visible",
    variations: {
      scene: ["sitting in a cozy coffee shop by a large window with a mug", "relaxing on a comfortable couch at home", "walking casually on a suburban neighborhood sidewalk", "sitting on front steps of his house", "in a home office at his desk"],
      activity: ["enjoying a morning coffee moment", "casually scrolling his phone and relaxing", "having a laid-back Saturday at home", "chatting with a friend at a local spot"],
      light: ["warm indoor ambient light", "natural window side light streaming in", "natural bright daylight from open doorway", "mixed warm indoor lamps and cool window daylight"],
      mood: ["cozy warm and relaxed atmosphere", "quietly confident everyday moment", "laid-back casual weekend feeling", "calm peaceful morning routine energy"]
    }},
  { id: "brotherhood", label: "Brotherhood / Group", icon: "🤝", desc: "Veteran community, camaraderie", purpose: "Meta, community engagement",
    core: "Veterans brotherhood photograph. A group of veteran friends together, with the main veteran prominently wearing the product. Warm authentic group moment showing genuine connection, laughter, and shared bond. The product on the main veteran is clearly visible and in focus. Candid storytelling feel",
    variations: {
      scene: ["at a lively backyard BBQ with smoke from the grill", "at a veteran reunion gathering", "at a local bar with wood interior", "fishing together by a calm lake", "at a tailgate party before a football game"],
      dynamic: ["laughing together naturally at a shared joke", "raising glasses toasting with big smiles", "standing shoulder-to-shoulder proudly", "sharing a hearty meal at a long table", "casual group photo with arms around shoulders"],
      groupSize: ["two close buddies standing side by side", "small tight group of 3-4 veteran friends", "band of brothers gathering of 5-6"],
      atmosphere: ["celebratory high-energy fun", "nostalgic warm bonding", "proud strong silent respect", "relaxed easy friendship and laughter"]
    }},
  { id: "seasonal_holiday", label: "Seasonal / Holiday", icon: "🎆", desc: "Memorial Day, Veterans Day, 4th of July", purpose: "Holiday campaigns",
    core: "American holiday celebration photograph. A veteran man wearing the product at a festive American holiday gathering. The holiday atmosphere is clear but not overwhelming — the product remains the star. Warm celebratory yet respectful mood",
    variations: {
      holiday: ["4th of July with fireworks in the sky and red-white-blue bunting visible", "Memorial Day with American flags and a solemn proud atmosphere", "Veterans Day with a Thank You For Your Service vibe", "Christmas with warm string lights and a cozy fireplace glow", "Thanksgiving with family and autumn warmth"],
      setting: ["outdoor community celebration with decorations", "home decorated for the holiday", "intimate family gathering indoors"],
      palette: ["vibrant red-white-blue patriotic colors", "muted respectful navy and cream", "warm Christmas red-green-gold", "rich autumn orange-brown-cream"],
      mood: ["celebratory festive energy", "solemn quiet honoring atmosphere", "warm family togetherness", "grateful reflective peaceful tone"]
    }},
  { id: "flat_lay", label: "Flat Lay Arrangement", icon: "📐", desc: "Overhead styled, Instagram aesthetic", purpose: "Bundle shot, Instagram, upsell",
    core: "Overhead flat lay product arrangement, photographed from DIRECTLY above looking straight down. The product is laid completely flat on the surface. Styled with 2-3 small complementary veteran accessories around it. Clean organized aesthetic layout, editorial styling. Everything must appear naturally flat as seen from a perfect top-down bird-eye camera angle",
    variations: {
      surface: ["light natural oak wood table", "dark rich walnut surface", "raw concrete slab", "white marble with subtle gray veining", "military olive drab canvas fabric"],
      accessories: ["classic aviator sunglasses and a vintage wristwatch", "metal dog tags on chain and a worn leather wallet", "a ceramic coffee mug and a brass compass", "a brass Zippo lighter and a worn leather journal"],
      layout: ["clean symmetrical grid arrangement", "casual naturally scattered organic layout", "centered hero product with smaller items around it", "minimal arrangement with generous negative space"],
      detail: ["warm angled side lighting creating long editorial shadows", "soft even overhead light with minimal shadows", "natural daylight from a nearby window casting gentle shadows"]
    }},
  { id: "urban_veteran", label: "Urban Veteran", icon: "🏙️", desc: "City street, modern, cool", purpose: "Younger veteran audience, modern appeal",
    core: "Urban street style photograph. A cool confident younger veteran man wearing the product on a modern American city street. Streetwear energy mixed with veteran pride. Natural daylight, editorial street photography feel. He looks effortlessly cool. Product is clearly visible and sharp",
    variations: {
      setting: ["walking on a busy downtown sidewalk", "standing against a textured brick wall", "near colorful city mural or graffiti", "on a rooftop with city skyline behind him", "outside a retro diner with neon signs"],
      vibe: ["gritty raw downtown energy", "hip trendy neighborhood feel", "converted industrial district", "waterfront boardwalk atmosphere"],
      light: ["harsh midday urban shadows with strong contrast", "golden hour light streaming between buildings", "flat overcast diffused city light", "neon accent glow from a nearby sign"],
      energy: ["walking with purpose and confidence", "leaning casually against a wall", "standing at a crosswalk with relaxed posture", "sitting on concrete steps elbows on knees"]
    }},
  { id: "heritage_vintage", label: "Heritage / Vintage", icon: "📷", desc: "Nostalgia, film look, timeless", purpose: "Storytelling, older audience",
    core: "Vintage Americana photograph with nostalgic warm color grading. An older distinguished veteran man wearing the product in a classic American setting. Slightly faded film photography look, timeless military pride, warm analog film tones. The man embodies classic American veteran dignity",
    variations: {
      setting: ["inside an old-school barber shop with chrome chairs", "at a vintage diner counter with chrome stools", "next to a classic restored American muscle car", "on a covered front porch in a wooden rocking chair", "at a VFW lodge hall with flags and photos on walls"],
      elements: ["framed vintage black-and-white military photos on wall", "old vacuum tube radio on a wooden shelf", "a classic 1960s car visible in the scene"],
      filmLook: ["warm Kodak Portra 400 golden skin tones", "slightly desaturated with warm glowing highlights", "deep golden sepia undertone", "washed out faded Polaroid feel"],
      era: ["1950s classic Americana nostalgia", "1960s military homecoming pride", "1970s road trip freedom aesthetic", "timeless era-ambiguous American heritage"]
    }},
];

function buildMockupPrompt(style, productDesc, sizeInfo) {
  const v = style.variations;
  const sceneParts = [];
  Object.keys(v).forEach(k => sceneParts.push(pick(v[k])));
  return [
    FIDELITY_RULES,
    "",
    `SCENE: ${style.core}. ${sceneParts.join(". ")}.`,
    "",
    `OUTPUT: Photorealistic product photography, 8K quality, sharp focus. Aspect ratio ${sizeInfo.ratio} (${sizeInfo.px}).`,
    `PRODUCT: ${productDesc}.`,
    "",
    NEGATIVE_RULES
  ].join("\n");
}

// ════════════════════════════════════════════════════════════
// 10 BANNER STYLES (restructured: no label rendering)
// ════════════════════════════════════════════════════════════

const BANNER_STYLES = [
  { id: "hero_clean", label: "Hero Product — Clean", icon: "⬜", desc: "Product-focused, professional", purpose: "Google Display, PMax",
    core: "Clean professional product advertisement. Product takes center stage occupying 60-70% of the frame. Minimal clean background with soft studio lighting, high-end commercial feel, polished and sharp",
    textGuidance: `Place a short bold headline (3-6 words) in a clean sans-serif font. Add a clear call-to-action button shape. Product fills 60-70% of the frame, text occupies the remaining space opposite the product. Keep total text area under 20%.`,
    variations: {
      background: ["solid pure white", "light cool gray gradient", "soft warm cream-to-white gradient", "soft cool blue-to-white gradient", "pale navy-to-white gradient"],
      layout: ["product left 60% with text stacked right", "product right 60% with text stacked left", "product centered with headline above and button below"],
      textStyle: ["dark charcoal text on light background", "white text on a dark accent bar", "navy headline with gray subtext"],
      accent: ["thin colored line divider", "subtle geometric shape behind product", "small badge or tag detail", "no accent — pure minimal"]
    }},
  { id: "dark_cinematic", label: "Dark Cinematic", icon: "🖤", desc: "Moody, premium, scroll-stopping", purpose: "Meta Feed, dark products",
    core: "Dramatic dark cinematic advertisement. Moody low-key lighting, dark rich textured background, premium luxury feel, high contrast, product lit dramatically with rim lighting",
    textGuidance: `Place a bold uppercase headline in white or gold on the dark background. Add a bright prominent call-to-action that stands out against the dark. Product is dominant with text placed in the dark negative space area.`,
    variations: {
      background: ["rich dark wood grain", "polished black concrete", "brushed dark gunmetal steel", "atmospheric smoke on black", "deep charcoal gradient to black"],
      lighting: ["warm amber rim light from left", "cold blue rim light from right", "backlit golden glow halo", "single overhead spotlight with dramatic fall-off"],
      textPlacement: ["text stacked bottom left", "headline top right with button bottom right", "text centered with dark gradient overlay"],
      accentColor: ["warm rich gold", "cool polished silver", "deep crimson red", "pure white on black"],
      typography: ["bold heavy sans-serif", "elegant thin serif", "military stencil textured", "tall condensed uppercase"]
    }},
  { id: "patriotic_lifestyle", label: "Patriotic Lifestyle", icon: "🇺🇸", desc: "Emotional, veteran pride", purpose: "Meta, emotional engagement",
    core: "American patriotic lifestyle advertisement. Warm golden natural light, authentic veteran atmosphere, outdoor or American home setting, proud and genuine mood with red-white-blue accents visible naturally in the scene",
    textGuidance: `Place a warm emotional headline (5-10 words about veteran pride) in white or cream for readability. Add a warm inviting call-to-action. The lifestyle image fills 80%+ of the frame. If text is over a busy area, use a semi-transparent dark overlay behind the text for contrast.`,
    variations: {
      scene: ["backyard with American flag on pole", "front porch classic American home", "golden country road into sunset", "tailgate of vintage pickup truck", "small town Main Street with flags"],
      timeLight: ["golden hour warm side light", "soft gentle morning light", "late afternoon warm amber glow"],
      americanElements: ["American flag waving in breeze", "red-white-blue bunting on railing", "classic vintage pickup truck"],
      headlineAngle: ["a statement about pride and honor", "a brotherhood bond message", "a sacrifice and service tribute", "an everyday hero celebration"]
    }},
  { id: "bold_typography", label: "Bold Typography", icon: "🔤", desc: "Text is hero, product secondary", purpose: "Scroll-stopping Meta Feed",
    core: "Typography-dominant advertisement. Large bold text is THE main visual element occupying 50-70% of the banner. The product is shown smaller (20-30%) as secondary. Extremely high contrast, designed to stop scrolling with words",
    textGuidance: `The headline text IS the visual — make it MASSIVE, filling 50-70% of the frame in an extremely bold heavy font. The product should be smaller in a corner. Maximum 6 words for the headline.`,
    variations: {
      background: ["solid pure black", "solid deep navy", "solid army olive green", "dark textured concrete", "bold two-tone diagonal split"],
      typography: ["ultra heavy bold sans-serif", "extremely tall condensed all-caps", "rough military stencil style", "clean modern geometric sans-serif"],
      layout: ["giant text centered with product small bottom right", "huge text left with product right edge", "text diagonal across entire banner"],
      textColor: ["white on dark black", "cream on deep navy", "gold on black", "red on dark"],
      headlineContent: ["BUILT TO SERVE", "STAND YOUR GROUND", "VETERAN AND PROUD", "HONOR YOUR SERVICE", "NEVER FORGOTTEN"]
    }},
  { id: "ugc_authentic", label: "UGC / Authentic", icon: "📱", desc: "Looks real, not like an ad", purpose: "Meta, outperforms polished",
    core: "User-generated content style photo that looks like a real customer took it with their smartphone. Slightly imperfect and casual, authentic and relatable, NOT designed or polished. Natural phone photography feel. A real veteran proudly showing off the product in his natural environment",
    textGuidance: `Add a casual conversational caption in a simple handwritten or casual font. Keep it short and authentic like a real person wrote it. Add a very subtle small call-to-action at the bottom. The photo should look natural and unplanned.`,
    variations: {
      photoStyle: ["mirror selfie proudly showing off product", "casual outdoor candid photo in natural light", "close-up of product being worn", "excited unboxing with shipping packaging visible", "wearing product doing an everyday activity"],
      textOverlay: ["casual handwritten font at the top", "simple white text at the bottom like a phone caption", "minimal plain text no design", "small text in corner barely noticeable"],
      imperfection: ["slight natural photo tilt", "natural uneven indoor lighting", "visible realistic background items", "slightly warm yellowed phone camera tone", "candid unposed natural angle"],
      captionContent: ["Just got this and I love it", "New favorite piece right here", "Fellow veterans you need this", "Look what just arrived today", "Wore this all week no regrets"],
      ctaStyle: ["almost invisible small text at bottom", "small arrow pointing down", "simple small text in corner"]
    }},
  { id: "sale_promo", label: "Sale / Promotion", icon: "🏷️", desc: "Discount-focused, urgent", purpose: "Retargeting, conversion",
    core: "Promotional sale advertisement. The discount offer is the LARGEST and most prominent element in the entire image. Product shown alongside the deal. Strong urgency and value, commercial and direct",
    textGuidance: `The offer (like "20% OFF" or "BUY 1 GET 1") must be the BIGGEST element — larger than everything else including the product. Add a headline that supports the offer, and an urgent call-to-action. Include a deadline or scarcity message. The offer must be readable even at thumbnail size.`,
    variations: {
      offerDisplay: ["giant percentage number filling half the frame", "old price crossed out with bold new price", "BUY 1 GET 1 in massive block letters", "dollar amount OFF on a ribbon banner", "large circular badge with the deal"],
      background: ["solid bold red", "solid bold orange", "deep navy premium dark", "clean white with bold color accents"],
      layout: ["offer large left with product right", "offer massive centered with product below", "product dominant with offer badge in corner"],
      urgency: ["ENDS MONDAY with a clock", "LIMITED TIME ONLY", "WHILE SUPPLIES LAST", "TODAY ONLY", "48 HOURS LEFT"],
      colorEnergy: ["classic red and white", "black and metallic gold", "navy and bright orange", "red-white-blue patriotic"]
    }},
  { id: "testimonial_proof", label: "Testimonial / Social Proof", icon: "⭐", desc: "Reviews, trust building", purpose: "Mid-funnel retargeting",
    core: "Testimonial advertisement featuring a customer review quote prominently displayed next to the product. Warm trustworthy atmosphere, authentic social proof feel. The product is shown beautifully on one side, the review text on the other",
    textGuidance: `Display a customer review quote (1-2 sentences maximum) with large decorative quotation marks. Below the quote add an attribution like a name and "Verified Veteran Buyer" with a five-star rating. On the opposite side show the product beautifully. Add a trust-based call-to-action like "Join 5,000+ Veterans".`,
    variations: {
      quoteDisplay: ["oversized decorative quotation marks framing the text", "elegant italic serif with em dash attribution", "card panel with rounded corners containing the quote"],
      layout: ["quote on left with product on right", "quote above with product below", "blurred product background with quote overlay centered"],
      starRating: ["five gold stars below the quote", "star rating above the quote", "large star with 5/5 text beside it"],
      backgroundMood: ["warm neutral cream beige", "clean white with gold accent", "dark charcoal with warm amber lighting"],
      trustElement: ["Verified Purchase badge", "2,000+ Reviews text", "Trusted by Veterans Nationwide", "Join 12,000+ Happy Customers"],
      quoteContent: ["Best quality I have ever seen", "Everyone asked where I got it", "Got this for my dad he was speechless", "Have not taken it off since it arrived", "Every veteran brother needs one"]
    }},
  { id: "collection_bundle", label: "Collection / Bundle", icon: "🛍️", desc: "Multi-product, upsell, AOV", purpose: "Upsell, AOV boost",
    core: "Product collection advertisement displaying the main product as the hero centerpiece with a clean organized layout suggesting it is part of a larger set. The main product from the reference image is shown large and prominent. Text suggests matching items available. Editorial shopping feel",
    textGuidance: `Add a headline about the collection concept like "Complete Your Set" or "The Full Kit". Show the main product prominently. Add a call-to-action like "Shop the Set". Keep the focus on the single main product but suggest a collection through the headline and composition.`,
    variations: {
      arrangement: ["main product large centered with subtle shadow", "main product angled with editorial lighting", "main product on a clean platform or pedestal"],
      background: ["dark wood warm premium", "clean white and gray minimal", "military olive canvas subtle", "gradient dark to light"],
      valueDisplay: ["Save when you bundle text", "Complete Set Special Price badge", "Shop the Collection text"],
      branchCue: ["branch color accent throughout", "branch name in headline", "general veteran no specific branch"]
    }},
  { id: "seasonal_campaign", label: "Seasonal / Holiday", icon: "🎆", desc: "Memorial Day, Veterans Day, Christmas", purpose: "Time-sensitive holidays",
    core: "Seasonal holiday campaign advertisement. Festive yet respectful atmosphere with themed decorations and colors. The product is shown prominently within the holiday context. Celebratory or honoring mood with seasonal veteran connection",
    textGuidance: `Add a holiday-specific headline connecting to veteran pride. Include a time-bound call-to-action like "Shop Memorial Day Collection" or "Limited Holiday Edition". The holiday atmosphere should be immediately obvious but not overpower the product.`,
    variations: {
      holiday: ["4th of July with fireworks and bunting celebration", "Memorial Day with flags and solemn pride", "Veterans Day salute ceremony", "Christmas with warm lights and wreath", "Thanksgiving with family and autumn warmth"],
      setting: ["outdoor festive celebration", "home decorated for the holiday", "intimate family indoor celebration"],
      seasonalPlacement: ["holiday elements framing the product on all sides", "holiday elements in background only", "festive border accents around edges"],
      urgencyStyle: ["Limited Edition exclusive badge", "Holiday Special This Week Only", "Order by deadline for Holiday Delivery"],
      moodRange: ["loud celebratory energy", "quiet solemn honoring", "warm family togetherness", "grateful reflective contemplation"]
    }},
  { id: "storytelling_cinematic", label: "Storytelling / Cinematic", icon: "🎬", desc: "Emotional, brand building", purpose: "Top-of-funnel awareness",
    core: "Cinematic storytelling advertisement with movie-poster quality. Emotionally powerful, extremely minimal text, atmospheric and evocative. A veteran figure wearing the product in a deeply resonant scene. The image tells a story and captures a feeling, not selling",
    textGuidance: `Add only a very short powerful phrase of maximum 5 words, or just a small logo in the corner. The image IS the message. Text covers less than 10% of the frame. The mood should be deep and lasting.`,
    variations: {
      scene: ["veteran silhouette against dramatic sunset", "lone figure walking down an endless road to the horizon", "veteran standing tall looking at a vast landscape", "sitting contemplative on an old weathered porch"],
      lightingMood: ["epic golden hour with warm long shadows", "melancholy blue hour cool tones", "dramatic stormy sky with golden breaks", "powerful backlit silhouette"],
      colorGrading: ["warm Kodak film golden highlights", "heavily desaturated moody dramatic", "high contrast dark shadows warm gold highlights", "teal shadows orange highlights cinematic"],
      textTreatment: ["very small centered at the bottom edge", "minimal small top left barely noticeable", "no text at all just a small logo in the corner", "single large word semi-transparent ghost overlay"],
      emotionAngle: ["deep pride and honor for service", "quiet inner strength and resilience", "solemn remembrance", "eternal brotherhood", "legacy passed to next generation"]
    }},
];

function buildBannerPrompt(style, productDesc, sizeInfo, opts = {}) {
  const { headline, cta, offer, branch } = opts;
  const v = style.variations;
  const sceneParts = [];
  Object.keys(v).forEach(k => sceneParts.push(pick(v[k])));

  const textInstructions = [];
  if (headline) textInstructions.push(`Display this exact headline text on the banner: "${headline}"`);
  else textInstructions.push("Generate an appropriate short headline for US veteran audience matching this style.");
  textInstructions.push(`Display this exact call-to-action text: "${cta || "Shop Now"}"`);
  if (offer) textInstructions.push(`Display this offer prominently: "${offer}"`);
  if (branch) textInstructions.push(`This is for ${branch} — use appropriate branch colors and insignia in the design.`);

  return [
    FIDELITY_RULES,
    "",
    `SCENE: ${style.core}. ${sceneParts.join(". ")}.`,
    "",
    `TEXT ON THE BANNER: ${style.textGuidance}`,
    "",
    textInstructions.join("\n"),
    "",
    `CRITICAL TEXT RULES: All displayed text must be spelled correctly and large enough to read at a glance. Text must have sufficient contrast against its background. Do NOT overlap text on top of the product design. Use professional clean typesetting.`,
    "",
    `OUTPUT: High quality advertisement image. Aspect ratio ${sizeInfo.ratio} (${sizeInfo.px}).`,
    `PRODUCT: ${productDesc}.`,
    "",
    NEGATIVE_RULES,
    `Additional text prohibition: NEVER display the words "Headline", "CTA", "Text Rules", "Output", "Product", or any formatting instruction. Only display the actual headline, call-to-action, and offer text content.`
  ].join("\n");
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
// API ADAPTERS (OpenAI fixed to correct endpoint)
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
  const body = { model: model || "dall-e-3", prompt, n: 1, size: apiSize || "1024x1024", response_format: "b64_json" };
  if (model === "dall-e-3") body.quality = "standard";
  const res = await fetch("https://api.openai.com/v1/images/generations", { method: "POST", signal: sig, headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` }, body: JSON.stringify(body) });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e?.error?.message || `OpenAI ${res.status}`); }
  const data = await res.json();
  const b64Out = data?.data?.[0]?.b64_json;
  if (!b64Out) throw new Error("OpenAI no image returned");
  return `data:image/png;base64,${b64Out}`;
}

async function genImage(plat, key, model, b64, mime, prompt, sig, apiSize) {
  if (plat === "gemini") return callGemini(key, model, b64, mime, prompt, sig);
  if (plat === "openai") return callOpenAI(key, model, b64, mime, prompt, sig, apiSize);
  throw new Error("Unknown platform");
}

// ════════════════════════════════════════════════════════════
// RETRY WRAPPER (3 attempts, exponential backoff)
// ════════════════════════════════════════════════════════════

async function genImageWithRetry(plat, key, model, b64, mime, prompt, sig, apiSize, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await genImage(plat, key, model, b64, mime, prompt, sig, apiSize);
    } catch (err) {
      if (err.name === "AbortError") throw err;
      if (attempt === maxRetries) throw err;
      const delayMs = Math.min(1000 * Math.pow(2, attempt), 8000) + Math.random() * 1000;
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
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
  const [promptOverrides, setPromptOverrides] = useState({});
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

  // ── PARALLEL GENERATE (with retry) ──
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
      if (idx >= concurrency) await new Promise(r => setTimeout(r, delay * 1000));
      const styleObj = allStyles.find(s => s.id === item.styleId);
      const prompt = promptOverrides[item.styleId] || (bannerMode
        ? buildBannerPrompt(styleObj, productDesc || "veteran-themed product", sizeInfo, { headline: bannerHeadline, cta: bannerCta, offer: bannerOffer, branch: bannerBranch })
        : buildMockupPrompt(styleObj, productDesc || "veteran-themed product", sizeInfo));
      return await genImageWithRetry(plat, key, model, item.img.b64, item.img.mime, prompt, ctrl.signal, apiSize);
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
            <h1 style={{ margin: 0, fontSize: 21, fontWeight: 700, color: "#f1f5f9", display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 26 }}>🎖️</span> Vettailor Generator v4</h1>
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
