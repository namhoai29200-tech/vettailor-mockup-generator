import { useState, useRef, useCallback, useEffect } from "react";

// ════════════════════════════════════════════════════════════
// PLATFORMS & SIZES
// ════════════════════════════════════════════════════════════

const PLATFORMS = {
  gemini: { id: "gemini", label: "Google Gemini", icon: "✦", color: "#4285f4", keyPlaceholder: "AIzaSy...", keyHelp: "Free tại aistudio.google.com", keyLink: "https://aistudio.google.com",
    models: [{ id: "gemini-2.5-flash-image", label: "Nano Banana", detail: "Free ~500/day", tier: "free" }, { id: "gemini-3.1-flash-image-preview", label: "Nano Banana 2", detail: "Free · Mới nhất", tier: "free" }, { id: "gemini-3-pro-image-preview", label: "Nano Banana Pro", detail: "$0.134/img", tier: "paid" }], supportsImageInput: true,
    sizes: [{ id: "1024x1024", label: "1024×1024 (1:1)" }, { id: "1536x1024", label: "1536×1024 (3:2 Landscape)" }, { id: "1024x1536", label: "1024×1536 (2:3 Portrait)" }] },
  openai: { id: "openai", label: "OpenAI GPT Image", icon: "◎", color: "#10a37f", keyPlaceholder: "sk-...", keyHelp: "Lấy tại platform.openai.com", keyLink: "https://platform.openai.com/api-keys",
    models: [{ id: "gpt-image-1", label: "GPT Image 1", detail: "$0.02-0.19/img", tier: "paid" }, { id: "gpt-image-1-mini", label: "GPT Image 1 Mini", detail: "Rẻ hơn 50-70%", tier: "paid" }], supportsImageInput: true,
    sizes: [{ id: "1024x1024", label: "1024×1024 (1:1)" }, { id: "1536x1024", label: "1536×1024 (Landscape)" }, { id: "1024x1536", label: "1024×1536 (Portrait)" }] },
  ideogram: { id: "ideogram", label: "Ideogram", icon: "◆", color: "#8b5cf6", keyPlaceholder: "ig-...", keyHelp: "Lấy tại developer.ideogram.ai", keyLink: "https://developer.ideogram.ai",
    models: [{ id: "V_3", label: "Ideogram v3", detail: "$0.03-0.06/img", tier: "paid" }, { id: "V_2_TURBO", label: "v2 Turbo", detail: "Nhanh", tier: "paid" }], supportsImageInput: false,
    sizes: [{ id: "ASPECT_1_1", label: "1:1 Square" }, { id: "ASPECT_16_9", label: "16:9 Landscape" }, { id: "ASPECT_9_16", label: "9:16 Portrait" }, { id: "ASPECT_4_3", label: "4:3" }, { id: "ASPECT_3_4", label: "3:4" }] },
};

// ════════════════════════════════════════════════════════════
// MOCKUP SCENES (giữ nguyên)
// ════════════════════════════════════════════════════════════

const MOCKUP_SCENES = [
  { id: "on_model_male", label: "On-Model (Nam)", icon: "👤", desc: "Nam veteran mặc sản phẩm",
    vars: { SHOT_TYPE: "medium", MOOD: "confident and proud", AGE: "45", GENDER_DESC: "male veteran", PHYSICAL_FEATURES: "with a strong athletic build, short cropped hair, and a square jaw", BASE_OUTFIT: "dark fitted jeans and brown leather boots", WEARING_STYLE: "worn casually with confidence", POSE: "standing with arms relaxed at his sides", POSE_PURPOSE: "looking directly at camera with a steady gaze", LIGHTING_STYLE: "Warm golden hour side lighting", LIGHTING_DETAIL: "casting soft shadows across the face and chest", SETTING: "a quiet suburban backyard", SETTING_DETAIL: "a wooden fence and mature oak trees softly blurred in the distance" } },
  { id: "on_model_female", label: "On-Model (Nữ)", icon: "👩", desc: "Nữ veteran mặc sản phẩm",
    vars: { SHOT_TYPE: "medium", MOOD: "strong and composed", AGE: "40", GENDER_DESC: "female veteran", PHYSICAL_FEATURES: "with an athletic build, shoulder-length dark hair, and sharp confident eyes", BASE_OUTFIT: "fitted dark cargo pants and black ankle boots", WEARING_STYLE: "styled neatly and fitted", POSE: "standing tall with one hand on her hip", POSE_PURPOSE: "gazing confidently into the camera", LIGHTING_STYLE: "Soft studio lighting with a warm fill", LIGHTING_DETAIL: "highlighting facial features and product details evenly", SETTING: "a clean modern studio", SETTING_DETAIL: "a smooth light gray gradient backdrop" } },
  { id: "lifestyle_bbq", label: "Lifestyle - BBQ", icon: "🏕️", desc: "Cảnh BBQ ngoài trời",
    vars: { SHOT_TYPE: "full body", MOOD: "relaxed and cheerful", AGE: "48", GENDER_DESC: "male veteran", PHYSICAL_FEATURES: "with a muscular build, buzz cut, and a warm genuine smile", BASE_OUTFIT: "khaki shorts and worn leather sandals", WEARING_STYLE: "worn casually at a summer gathering", POSE: "standing near a smoking grill holding tongs", POSE_PURPOSE: "laughing and looking off to the side at friends", LIGHTING_STYLE: "Golden hour warm backlight", LIGHTING_DETAIL: "with lens flare and soft ambient glow across the scene", SETTING: "a lively backyard BBQ party", SETTING_DETAIL: "American flags hung on the fence, string lights overhead, friends gathered at picnic tables" } },
  { id: "lifestyle_outdoor", label: "Lifestyle - Outdoor", icon: "🏔️", desc: "Outdoor, hiking, lake",
    vars: { SHOT_TYPE: "full body", MOOD: "rugged and peaceful", AGE: "50", GENDER_DESC: "male veteran", PHYSICAL_FEATURES: "with a weathered face, salt-and-pepper beard, and broad shoulders", BASE_OUTFIT: "durable hiking pants and trail boots", WEARING_STYLE: "layered for the outdoors", POSE: "standing on a rocky trail overlooking a lake", POSE_PURPOSE: "gazing out at the mountains with a sense of quiet strength", LIGHTING_STYLE: "Early morning golden light", LIGHTING_DETAIL: "filtering through pine trees with soft mist in the valley", SETTING: "a mountain trail near a pristine lake", SETTING_DETAIL: "snow-capped peaks in the distance, evergreen forest on both sides" } },
  { id: "lifestyle_garage", label: "Lifestyle - Garage", icon: "🔧", desc: "Garage, workshop, xe cổ",
    vars: { SHOT_TYPE: "three-quarter", MOOD: "focused and rugged", AGE: "52", GENDER_DESC: "male veteran", PHYSICAL_FEATURES: "with thick forearms, a shaved head, and oil-stained hands", BASE_OUTFIT: "worn work jeans and steel-toe boots", WEARING_STYLE: "worn naturally in a workshop setting", POSE: "leaning against a classic muscle car with arms crossed", POSE_PURPOSE: "looking at the camera with quiet intensity", LIGHTING_STYLE: "Warm industrial overhead lighting", LIGHTING_DETAIL: "mixed with natural light streaming through a garage door", SETTING: "a vintage car garage workshop", SETTING_DETAIL: "shelves of tools, an American flag on the wall, a 1969 Camaro behind him" } },
  { id: "flat_lay", label: "Flat Lay", icon: "📐", desc: "Sản phẩm trên bàn themed", customPrompt: true,
    vars: { SHOT_TYPE: "overhead flat lay", MOOD: "clean and patriotic", AGE: "", GENDER_DESC: "", PHYSICAL_FEATURES: "", BASE_OUTFIT: "", WEARING_STYLE: "neatly folded and centered on a rustic dark wooden table", POSE: "surrounded by themed items: a folded American flag, metal dog tags, a vintage compass, and a worn leather journal", POSE_PURPOSE: "", LIGHTING_STYLE: "Soft warm side lighting", LIGHTING_DETAIL: "creating gentle shadows for depth", SETTING: "a styled product photography surface", SETTING_DETAIL: "dark wood grain texture visible beneath the arrangement" } },
  { id: "closeup", label: "Close-up Detail", icon: "🔍", desc: "Cận cảnh chi tiết sản phẩm", customPrompt: true,
    vars: { SHOT_TYPE: "extreme close-up macro", MOOD: "premium and detailed", AGE: "", GENDER_DESC: "", PHYSICAL_FEATURES: "", BASE_OUTFIT: "", WEARING_STYLE: "displayed showing texture, stitching, and embroidery detail", POSE: "filling most of the frame at a slight angle", POSE_PURPOSE: "", LIGHTING_STYLE: "Dramatic studio lighting with rim light", LIGHTING_DETAIL: "highlighting every stitch and fiber of the material", SETTING: "a dark moody studio", SETTING_DETAIL: "smooth black gradient background with subtle reflections" } },
  { id: "white_bg", label: "White BG", icon: "⬜", desc: "Nền trắng e-commerce", customPrompt: true,
    vars: { SHOT_TYPE: "product photo", MOOD: "clean and commercial", AGE: "", GENDER_DESC: "", PHYSICAL_FEATURES: "", BASE_OUTFIT: "", WEARING_STYLE: "positioned at a slight angle showing dimension and form", POSE: "centered with minimal soft shadow underneath", POSE_PURPOSE: "", LIGHTING_STYLE: "Even soft studio lighting", LIGHTING_DETAIL: "no harsh shadows, perfectly balanced exposure", SETTING: "a pure white infinity background", SETTING_DETAIL: "seamless white with subtle ground shadow for depth" } },
  { id: "patriotic_portrait", label: "Patriotic Portrait", icon: "🎖️", desc: "Editorial cinematic portrait",
    vars: { SHOT_TYPE: "close-up profile", MOOD: "solemn, resolute, and reverent", AGE: "52", GENDER_DESC: "male veteran", PHYSICAL_FEATURES: "with a graying beard, weathered face, strong jaw, and detailed military tattoos on forearm", BASE_OUTFIT: "a fitted black t-shirt with subtle patriotic graphic", WEARING_STYLE: "worn with quiet pride and military bearing", POSE: "performing a sharp military salute", POSE_PURPOSE: "gazing into the distance with solemn respect", LIGHTING_STYLE: "Natural diffused cinematic lighting, extremely shallow depth of field", LIGHTING_DETAIL: "sharp focus on face and product details, everything else beautifully blurred", SETTING: "outdoors with a massive American flag waving behind", SETTING_DETAIL: "blurred city harbor or memorial in the background, Fujifilm film simulation color grade" } },
  { id: "motorcycle_biker", label: "Motorcycle / Biker", icon: "🏍️", desc: "Veteran cưỡi xe",
    vars: { SHOT_TYPE: "three-quarter", MOOD: "fierce, free-spirited, and rebellious", AGE: "50", GENDER_DESC: "male veteran biker", PHYSICAL_FEATURES: "with a thick salt-and-pepper beard, muscular arms with military tattoos, aviator sunglasses pushed up on forehead", BASE_OUTFIT: "worn dark denim jeans, heavy black motorcycle boots, and a black leather vest over a dark henley", WEARING_STYLE: "layered ruggedly with biker attitude", POSE: "straddling a classic Harley-Davidson motorcycle, one hand on the handlebar", POSE_PURPOSE: "looking at the camera with a confident half-grin", LIGHTING_STYLE: "Warm late afternoon golden light from the side", LIGHTING_DETAIL: "chrome reflections on the motorcycle, dramatic shadows on the face", SETTING: "a scenic empty highway with open desert or mountain road", SETTING_DETAIL: "American flag bandana tied to the handlebars, leather saddlebags visible, Route 66 vibes" } },
  { id: "gift_unboxing", label: "Gift / Unboxing", icon: "🎁", desc: "Quà tặng, mở hộp",
    vars: { SHOT_TYPE: "medium overhead angle", MOOD: "warm, heartfelt, and celebratory", AGE: "55", GENDER_DESC: "male veteran", PHYSICAL_FEATURES: "with kind eyes, warm genuine smile, and silver hair", BASE_OUTFIT: "a comfortable plaid flannel shirt and reading glasses", WEARING_STYLE: "being unwrapped from tissue paper inside a premium gift box", POSE: "seated at a dining table, holding up the product with both hands", POSE_PURPOSE: "smiling warmly at the gift with visible emotion", LIGHTING_STYLE: "Soft warm indoor lighting", LIGHTING_DETAIL: "cozy ambient glow from a nearby window", SETTING: "a warm family living room", SETTING_DETAIL: "a handwritten card reading 'Thank You For Your Service' on the table, gift wrapping nearby" } },
  { id: "ugc_review", label: "UGC / Review", icon: "📱", desc: "Selfie style, trông như review thật",
    vars: { SHOT_TYPE: "smartphone selfie", MOOD: "casual, authentic, and genuinely happy", AGE: "42", GENDER_DESC: "male veteran", PHYSICAL_FEATURES: "with a friendly face, neat stubble, and a natural relaxed expression", BASE_OUTFIT: "casual everyday clothes", WEARING_STYLE: "worn naturally as if just received in the mail", POSE: "taking a mirror selfie, holding phone visible in frame", POSE_PURPOSE: "grinning proudly and pointing at the product", LIGHTING_STYLE: "Natural indoor lighting, phone camera quality", LIGHTING_DETAIL: "minor lens distortion, realistic phone photo look, not overly polished", SETTING: "a normal bedroom or hallway with a mirror", SETTING_DETAIL: "an open shipping box visible on the bed or floor, casual real home environment, looks like a genuine customer photo NOT a professional shoot" } },
];

function buildMockupPrompt(scene, productName, productColor, productDetails) {
  const v = scene.vars;
  if (scene.customPrompt) {
    return `A ${v.SHOT_TYPE} color photo of a ${v.MOOD} ${productColor} ${productName} ${v.WEARING_STYLE}. ${productDetails}. The product is ${v.POSE}. ${v.LIGHTING_STYLE}, ${v.LIGHTING_DETAIL}. The background is ${v.SETTING} with ${v.SETTING_DETAIL}. Full color photography, photorealistic. The product design, colors, and ALL details must be preserved EXACTLY as shown in the reference image. Do NOT add any text, watermarks, or logos not present in the original.`;
  }
  return `A ${v.SHOT_TYPE} color photo of a ${v.MOOD} ${v.AGE}-year-old American ${v.GENDER_DESC} ${v.PHYSICAL_FEATURES} in ${v.BASE_OUTFIT} and a ${productColor} ${productName} ${v.WEARING_STYLE}. ${productDetails}. The model is ${v.POSE} ${v.POSE_PURPOSE}. ${v.LIGHTING_STYLE}, ${v.LIGHTING_DETAIL}. The background is ${v.SETTING} with ${v.SETTING_DETAIL}. Full color photography, vibrant natural skin tones, photorealistic. The product design, colors, and ALL details must be preserved EXACTLY as shown in the reference image. Do NOT add any text, watermarks, or logos not present in the original.`;
}

// ════════════════════════════════════════════════════════════
// 10 BANNER TEMPLATES — mỗi template có prompt builder riêng
// ════════════════════════════════════════════════════════════

const BANNER_TEMPLATES = [
  { id: "classic_patriotic", label: "Classic Patriotic", icon: "🎖️",
    desc: "Model + Product, emotional", funnel: "Top", usage: "FB/IG cold, PMax",
    build: (v, sz) => `Marketing banner, ${sz}, complete composition, all elements fully rendered.
BACKGROUND: ${v.branchColorPrimary} to dark charcoal gradient, subtle faded American flag watermark at 15% opacity, premium patriotic feel.
LEFT SIDE (45%): Photorealistic portrait of a proud ${v.modelAge}-year-old American veteran ${v.modelGender}, ${v.modelFeatures}, wearing ${v.productFullDesc}, warm golden hour side lighting from the right, soft edge fade into background, natural skin tones, subtle dark vignette, bleeds to left edge no border.
RIGHT SIDE (55%), stacked vertically: TOP — "${v.branch} VETERAN" in small bold ${v.branchColorSecondary} all-caps on semi-transparent dark strip. HEADLINE — "${v.offer}" in very large bold white condensed font, 2.5× larger than all other text. SUB — "${v.tagline}" in small ${v.branchColorSecondary} all-caps. CENTER — Rounded product card with soft shadow, "BEST SELLER" pill badge in ${v.branchColorSecondary}, inside: front-facing product shot of ${v.productName} on dark background showing full detail. TRUST — Military star ★ "TRUSTED BY 20,000+ VETERANS" in ${v.branchColorSecondary}. BOTTOM — Full-width CTA button in ${v.branchColorSecondary}: "${v.cta} →" in bold dark text.
STYLE: Bold patriotic commercial. Palette: ${v.branchColorPrimary}, ${v.branchColorSecondary}, white, charcoal. All text legible, correctly spelled, no clipping.` },

  { id: "product_hero", label: "Product Hero", icon: "🏆",
    desc: "No model, clean product focus", funnel: "Mid", usage: "PMax asset, Shopping",
    build: (v, sz) => `Marketing banner, ${sz}, complete composition.
BACKGROUND: Solid dark (${v.branchColorPrimary} deepened to near-black), soft radial light gradient from center, faint American flag stars at 8% opacity top-right.
CENTER COMPOSITION: TOP — "${v.branch}" in wide-tracked small ${v.branchColorSecondary} all-caps. BELOW — "${v.productShort}" in large bold white condensed font. CENTER — Large hero product shot of ${v.productName}, angled 25 degrees showing design details (${v.productVisualDesc}), floating with soft drop shadow, occupies 50% frame height. BELOW — "${v.tagline}" in small ${v.branchColorSecondary} all-caps. OFFER BADGE — Angled ribbon top-right: "${v.offer}" in bold white on contrasting color. BOTTOM — Rounded CTA full width in ${v.branchColorSecondary}: "${v.cta} →" in bold dark text. TRUST — "★ 20,000+ Veterans Trust Vettailor" in small muted ${v.branchColorSecondary}.
STYLE: Premium e-commerce, minimal, dark + ${v.branchColorSecondary}. High-end clean. All text sharp.` },

  { id: "urgency_sale", label: "Urgency / Flash Sale", icon: "⚡",
    desc: "Bold, urgent, countdown", funnel: "Bottom", usage: "Flash sale, holiday promo",
    build: (v, sz) => `Marketing banner, ${sz}, complete composition.
BACKGROUND: Black to deep ${v.branchColorPrimary} gradient, bold diagonal ${v.branchColorSecondary} stripes at 15% opacity, high energy urgent feel.
LAYOUT — Dynamic split: TOP-LEFT (45%): Large product shot of ${v.productName}, front-facing, slightly tilted, ${v.productVisualDesc} clearly visible, dramatic shadow, glowing ${v.branchColorSecondary} rim light. BOTTOM-RIGHT (55%): Text stack.
TEXT STACK: "⚡ FLASH SALE" in bold red (#CC0000) all-caps with subtle glow. "${v.offer}" in massive bold white condensed font, largest element, 3× other text size. "${v.productName}" in medium ${v.branchColorSecondary} all-caps. Countdown graphic: "ENDS IN 24:00:00" in red on dark rounded box. BOTTOM — Full-width red CTA: "${v.cta} →" in bold white.
STYLE: High-urgency commercial. Black, ${v.branchColorPrimary}, ${v.branchColorSecondary}, red. Bold aggressive. All text crystal clear.` },

  { id: "social_proof", label: "Social Proof", icon: "⭐",
    desc: "Review + trust building", funnel: "Top", usage: "FB/IG prospecting, lookalike",
    build: (v, sz) => `Marketing banner, ${sz}, complete composition.
BACKGROUND: Warm dark ${v.branchColorPrimary} with soft golden light bloom from bottom-left, subtle worn canvas texture, authentic military feel.
TOP (35%): Five gold stars ★★★★★ large centered. Below: "'Best ${v.productType} I've ever owned. The quality and detail are unmatched.'" in white italic serif font, 2 lines max. Below quote: "— James R., ${v.branch}, Retired" in small ${v.branchColorSecondary} caps.
MIDDLE (35%): Hero product shot of ${v.productName}, front-facing centered, ${v.productVisualDesc} visible, slightly lighter dark bg with soft shadow, subtle rounded frame.
BOTTOM (30%): "${v.tagline}" in bold white condensed all-caps. "FREE SHIPPING ON ALL ORDERS" in small ${v.branchColorSecondary} with truck icon. Full-width CTA in ${v.branchColorSecondary}: "${v.cta} →" in bold dark text. "★ Rated 4.9/5 by 20,000+ Veterans" in small muted text.
STYLE: Warm, authentic, trust-driven. ${v.branchColorPrimary} + ${v.branchColorSecondary} warm undertones.` },

  { id: "custom_showcase", label: "Customization Showcase", icon: "✏️",
    desc: "Show personalization features", funnel: "Mid", usage: "Products with custom name/rank",
    build: (v, sz) => `Marketing banner, ${sz}, complete composition.
BACKGROUND: Clean dark ${v.branchColorPrimary} (#141b2d), very subtle grid pattern at 5% opacity, modern informational.
TOP: "MAKE IT YOURS" in large bold white condensed font centered. BELOW: "${v.productName}" in medium ${v.branchColorSecondary} all-caps.
CENTER: Large product shot of ${v.productName}, front-facing. THREE ${v.branchColorSecondary} callout lines extending from product to labels: Line 1 → "YOUR NAME" label, Line 2 → "YOUR RANK" label, Line 3 → "SERVICE YEARS" label. Clean annotated diagram style, each label in ${v.branchColorSecondary} with small connecting arrow.
BELOW: "100% PERSONALIZED FOR YOUR SERVICE" in small white all-caps. Three feature pills in a row: [🇺🇸 All Branches] [⭐ All Ranks] [🚚 Free Shipping] in small dark rounded boxes white text.
BOTTOM: Full-width CTA in ${v.branchColorSecondary}: "START CUSTOMIZING →" in bold dark text.
STYLE: Clean, modern, informational. ${v.branchColorPrimary} + ${v.branchColorSecondary} + white only.` },

  { id: "lifestyle_emotional", label: "Lifestyle / Emotional", icon: "🎬",
    desc: "Cinematic, storytelling", funnel: "Top", usage: "Brand awareness, video thumbnail",
    build: (v, sz) => `Marketing banner, ${sz}, complete composition.
BACKGROUND: Cinematic dark scene, American flag softly lit on weathered wooden wall, warm amber lighting, shallow depth of field, nostalgic reverent mood.
FULL-WIDTH: Photorealistic image of a proud ${v.modelAge}-year-old veteran ${v.modelGender}, standing tall facing camera, ${v.modelFeatures}, wearing ${v.productFullDesc}, arms crossed confidently, warm side lighting illuminating face and product, dark moody environment, military memorabilia subtly blurred in background.
BOTTOM OVERLAY: Semi-transparent dark gradient rising from bottom (60% to 0%). Text on overlay: "${v.tagline}" in large bold white condensed centered. "${v.productName}" in small ${v.branchColorSecondary} all-caps below. Small ${v.branchColorSecondary} CTA centered: "${v.cta} →".
TOP-RIGHT: Small "${v.offer}" badge in ${v.branchColorSecondary} circle, non-intrusive.
STYLE: Cinematic, emotional, editorial photography. Warm amber + dark + ${v.branchColorSecondary}. Minimal text, maximum impact.` },

  { id: "multi_product", label: "Multi-Product Collection", icon: "🛍️",
    desc: "Showcase 3 products together", funnel: "Mid", usage: "Cross-sell, promote collection",
    build: (v, sz) => `Marketing banner, ${sz}, complete composition.
BACKGROUND: Deep ${v.branchColorPrimary} to black gradient, subtle American flag stars at 8% opacity, premium dark.
TOP: "${v.branch} VETERAN COLLECTION" in bold ${v.branchColorSecondary} all-caps centered. BELOW: "${v.offer}" in large bold white condensed.
CENTER — Product grid (3 items in a row, equal width): LEFT: product shot of ${v.branch} veteran cap on dark bg, label "CAP" in white. CENTER: product shot of ${v.branch} veteran t-shirt flat-lay, label "T-SHIRT". RIGHT: product shot of ${v.branch} veteran hoodie flat-lay, label "HOODIE". All three consistent lighting, soft shadows, same scale, subtle rounded frames thin ${v.branchColorSecondary} border.
BELOW GRID: "ALL ITEMS FULLY CUSTOMIZABLE" in small ${v.branchColorSecondary} all-caps.
BOTTOM: Full-width CTA in ${v.branchColorSecondary}: "SHOP THE COLLECTION →" in bold dark text. TRUST: "★ Free Shipping • 20,000+ Happy Veterans • 30-Day Returns" in small white.
STYLE: E-commerce collection showcase, dark premium. Consistent product photography.` },

  { id: "holiday_event", label: "Holiday / Seasonal", icon: "🎆",
    desc: "Veterans Day, Memorial Day, 4th of July", funnel: "All", usage: "Holiday campaigns",
    build: (v, sz) => `Marketing banner, ${sz}, complete composition.
BACKGROUND: Dark navy to black, dramatic red-white-blue lighting streaks or bokeh, patriotic celebration, subtle firework sparks at low opacity, festive yet respectful.
TOP: "${v.holidayName || 'VETERANS DAY SALE'}" in bold red-white-blue gradient text, large.
BELOW: "HONOR THOSE WHO SERVED" in medium white condensed.
CENTER: Hero product shot of ${v.productName}, centered, slightly larger than usual, ${v.productVisualDesc} visible, patriotic red-white-blue rim glow, floating on dark background.
OFFER: "${v.offer}" in very large bold white condensed. ${v.promoCode ? `BELOW: "USE CODE: ${v.promoCode}" in ${v.branchColorSecondary} on dark rounded strip.` : ""}
BOTTOM: Full-width CTA in red (#CC0000): "${v.cta} →" in bold white. DEADLINE: "SALE ENDS SOON" in small white below.
STYLE: Patriotic celebration + commercial urgency. Red, white, blue, ${v.branchColorSecondary}. Respectful but bold.` },

  { id: "gift_angle", label: "Gift Angle", icon: "🎁",
    desc: "Target gift buyers (spouse, kids)", funnel: "Top+Mid", usage: "Father's Day, Christmas, birthdays",
    build: (v, sz) => `Marketing banner, ${sz}, complete composition.
BACKGROUND: Warm dark ${v.branchColorPrimary}, soft warm bokeh lights, cozy gift-giving setting, gentle heartfelt mood.
TOP: "THE PERFECT GIFT FOR A VETERAN" in bold white condensed centered. BELOW: "Show them their service matters" in small ${v.branchColorSecondary} italic centered.
CENTER: Product shot of ${v.productName} presented as gift — displayed on or emerging from dark premium gift box with ${v.branchColorSecondary} ribbon, ${v.productVisualDesc} visible, warm spotlight, soft shadow.
BELOW: "${v.productName}" in medium white all-caps. ${v.customFeatures ? `"PERSONALIZE WITH ${v.customFeatures.toUpperCase()}" in small ${v.branchColorSecondary}.` : ""} "${v.offer}" in bold white on dark rounded badge.
BOTTOM: Full-width warm CTA in ${v.branchColorSecondary}: "ORDER THEIR GIFT →" in bold dark text. TRUST: "🚚 Free Shipping • 🎁 Gift-Ready Packaging • ⭐ 4.9/5 Rating" in small white.
STYLE: Warm, heartfelt, gift-oriented. ${v.branchColorPrimary} + ${v.branchColorSecondary} + warm amber accents.` },

  { id: "why_us", label: "Why Us / Compare", icon: "🏅",
    desc: "USP highlights, differentiation", funnel: "Mid-Bottom", usage: "Retargeting, consideration",
    build: (v, sz) => `Marketing banner, ${sz}, complete composition.
BACKGROUND: Clean dark charcoal (#1a1a2e), subtle diagonal line pattern at 5% opacity, professional informative.
TOP: "NOT ALL VETERAN GEAR IS EQUAL" in bold white condensed centered. BELOW: "${v.branch} ${v.productType.toUpperCase()} — Built Different" in ${v.branchColorSecondary} all-caps.
CENTER: Product shot of ${v.productName}, front-facing, large detailed, ${v.productVisualDesc} visible.
FLANKING — Four USP callouts, two each side, small icons: LEFT TOP: "✦ Premium Quality Material". LEFT BOTTOM: "✦ Detailed ${v.branch} Insignia". RIGHT TOP: "✦ Fully Customizable". RIGHT BOTTOM: "✦ Veteran-Owned Verified". Each with thin ${v.branchColorSecondary} line connecting to product.
BELOW: "${v.offer}" in bold white on ${v.branchColorSecondary} rounded badge. Full-width CTA in ${v.branchColorSecondary}: "${v.cta} →" in bold dark text. "★ Trusted by 20,000+ Veterans Nationwide" in small muted.
STYLE: Informational, professional, trust-building. Dark + ${v.branchColorSecondary} + white. Clean, no clutter.` },
];

const BANNER_SIZES = [
  { id: "1080x1080", label: "1080×1080 — Instagram Square" },
  { id: "1200x628", label: "1200×628 — Facebook/Meta Ads" },
  { id: "1080x1920", label: "1080×1920 — Story/Reels" },
  { id: "1456x180", label: "1456×180 — Website Banner" },
  { id: "1200x600", label: "1200×600 — Google Display" },
];

const DEFAULT_BANNER_VARS = {
  productName: "", productShort: "", productType: "t-shirt", productColor: "",
  productVisualDesc: "", productFullDesc: "",
  branch: "U.S. Army", branchColorPrimary: "olive green", branchColorSecondary: "gold",
  modelAge: "50", modelGender: "male", modelFeatures: "strong athletic build, short gray hair, square jaw",
  offer: "BUY 1 GET 1 FREE", cta: "CLAIM YOURS NOW", tagline: "HONOR YOUR SERVICE",
  customFeatures: "", holidayName: "", promoCode: "",
};

// Preset combos nhanh
const BANNER_QUICK_SETS = [
  { id: "scale", label: "🚀 Scale Traffic (4)", desc: "Broad reach", ids: ["classic_patriotic", "social_proof", "lifestyle_emotional", "why_us"] },
  { id: "convert", label: "💰 Push Conversion (4)", desc: "Bottom funnel", ids: ["urgency_sale", "holiday_event", "why_us", "product_hero"] },
  { id: "educate", label: "📚 Educate + Convert (4)", desc: "Mid funnel", ids: ["product_hero", "custom_showcase", "multi_product", "social_proof"] },
  { id: "seasonal", label: "🎆 Seasonal Campaign (4)", desc: "Holiday push", ids: ["holiday_event", "gift_angle", "urgency_sale", "classic_patriotic"] },
  { id: "all", label: "🎯 Full Set (10)", desc: "All templates", ids: BANNER_TEMPLATES.map(t => t.id) },
];

// ════════════════════════════════════════════════════════════
// AI PRODUCT ANALYZER — trả về shared banner vars
// ════════════════════════════════════════════════════════════

function buildAnalyzePrompt(userNotes) {
  return `You are a product photography expert AND marketing creative director for Vettailor — a US Veterans apparel e-commerce store. Analyze this product image and return a JSON object with information used across 10 different banner styles.

${userNotes ? `USER NOTES:\n${userNotes}\n` : ""}

CUSTOM TEXT REPLACEMENT RULES:
- Replace "CUSTOM TEXT"/"YOUR NAME"/etc → realistic veteran name (JOHNSON, RODRIGUEZ, MITCHELL...)
- Replace "0000"/"0000-0000"/fake years → realistic service years (1975-2003, 1982-2010...)
- Describe product WITH replaced text, not placeholders.

Return ONLY valid JSON:
{
  "productName": "U.S. Army Veteran Eagle All-Over Print T-Shirt",
  "productShort": "Army Eagle Tee",
  "productType": "t-shirt",
  "productColor": "olive-gray with gold and black accents",
  "productVisualDesc": "Bold eagle emblem with dog tags on chest, U.S. Army text, rank chevrons on sleeves, faded American flag background print, all-over sublimation",
  "productFullDesc": "an olive-gray U.S. Army veteran eagle all-over print t-shirt with gold accents, PAIRED WITH dark fitted jeans, brown leather belt, and brown leather boots",
  "branch": "U.S. Army",
  "branchColorPrimary": "olive green",
  "branchColorSecondary": "gold",
  "modelAge": "50",
  "modelGender": "male",
  "modelFeatures": "strong athletic build, short gray hair, square jaw, Army eagle tattoo on forearm, weathered face",
  "offer": "BUY 1 GET 1 FREE",
  "cta": "CLAIM YOURS NOW",
  "tagline": "HONOR YOUR SERVICE",
  "customFeatures": "Name, Rank, Service Years",
  "holidayName": "VETERANS DAY SALE",
  "promoCode": "",
  "customTextReplaced": {"originalText": "CUSTOM TEXT", "replacedWith": "JOHNSON", "originalYears": "0000-0000", "replacedYears": "1975-2003"},
  "suggestedScenes": ["on_model_male", "patriotic_portrait", "lifestyle_bbq", "closeup", "ugc_review"],
  "suggestedBannerTemplates": ["classic_patriotic", "product_hero", "social_proof", "urgency_sale", "custom_showcase", "lifestyle_emotional"],
  "targetAudience": "US Army veterans, 40-65 years old"
}

CRITICAL:
1. productFullDesc MUST include FULL outfit (shirt+pants+belt+shoes) — prevents shirtless/pantless models
2. Match colors to branch: Army=olive/gold, USMC=red/gold, Navy=navy/gold, Air Force=blue/silver
3. suggestedBannerTemplates: pick 5-7 most relevant from: classic_patriotic, product_hero, urgency_sale, social_proof, custom_showcase, lifestyle_emotional, multi_product, holiday_event, gift_angle, why_us
4. If product has custom features → include custom_showcase in suggestions
5. modelFeatures should include branch-matching tattoos and traits
6. ALWAYS replace placeholder text with realistic values`;
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
// API ADAPTERS (giữ nguyên)
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

async function callOpenAI(key, model, b64, mime, prompt, sig, size) {
  const input = [];
  if (b64) input.push({ type: "input_image", image_url: `data:${mime};base64,${b64}` });
  input.push({ type: "input_text", text: prompt });
  const res = await fetch("https://api.openai.com/v1/responses", { method: "POST", signal: sig, headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` }, body: JSON.stringify({ model: "gpt-4.1-mini", input: [{ role: "user", content: input }], tools: [{ type: "image_generation", quality: "low", size: size || "1024x1024" }] }) });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e?.error?.message || `OpenAI ${res.status}`); }
  const data = await res.json();
  const imgOut = (data.output || []).find(o => o.type === "image_generation_call");
  if (!imgOut?.result) throw new Error("OpenAI no image returned");
  return `data:image/png;base64,${imgOut.result}`;
}

async function callIdeogram(key, model, b64, mime, prompt, sig, size) {
  const res = await fetch("https://api.ideogram.ai/generate", { method: "POST", headers: { "Content-Type": "application/json", "Api-Key": key }, body: JSON.stringify({ image_request: { prompt, model, magic_prompt_option: "AUTO", aspect_ratio: size || "ASPECT_1_1" } }), signal: sig });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e?.message || `Ideogram ${res.status}`); }
  const data = await res.json();
  const url = data?.data?.[0]?.url;
  if (!url) throw new Error("No image URL");
  const imgRes = await fetch(url, { signal: sig }); const blob = await imgRes.blob();
  return new Promise((ok, fail) => { const r = new FileReader(); r.onloadend = () => ok(r.result); r.onerror = fail; r.readAsDataURL(blob); });
}

async function genImage(plat, key, model, b64, mime, prompt, sig, size) {
  if (plat === "gemini") return callGemini(key, model, b64, mime, prompt, sig);
  if (plat === "openai") return callOpenAI(key, model, b64, mime, prompt, sig, size);
  if (plat === "ideogram") return callIdeogram(key, model, b64, mime, prompt, sig, size);
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
// MAIN APP
// ════════════════════════════════════════════════════════════

const STATUS = { IDLE: "idle", GENERATING: "generating", SUCCESS: "success", ERROR: "error" };

export default function App() {
  // ── Platform state ──
  const [plat, setPlat] = useState(() => localStorage.getItem("vt_plat") || "gemini");
  const [keys, setKeys] = useState(() => { try { return JSON.parse(localStorage.getItem("vt_keys") || "{}"); } catch { return {}; } });
  const [showKey, setShowKey] = useState(false);
  const [model, setModel] = useState("");
  const [size, setSize] = useState("");

  // ── Upload & notes ──
  const [imgs, setImgs] = useState([]);
  const [userNotes, setUserNotes] = useState("");

  // ── Mode toggle ──
  const [bannerMode, setBannerMode] = useState(false);

  // ── Mockup state ──
  const [selScenes, setSelScenes] = useState(["on_model_male", "lifestyle_bbq", "closeup", "flat_lay"]);
  const [productName, setProductName] = useState("veteran-themed graphic hat");
  const [productColor, setProductColor] = useState("black and camo");
  const [productDetails, setProductDetails] = useState("Bold eagle emblem embroidered on front, American flag patch on side");

  // ── Banner state (MỚI) ──
  const [bannerVars, setBannerVars] = useState({ ...DEFAULT_BANNER_VARS });
  const [selBannerTpls, setSelBannerTpls] = useState(["classic_patriotic", "product_hero", "urgency_sale", "social_proof"]);
  const [bannerSize, setBannerSize] = useState("1080x1080");
  const [promptOverrides, setPromptOverrides] = useState({}); // { templateId: "edited prompt" }
  const [expandedTpl, setExpandedTpl] = useState(null);

  // ── Analyze state ──
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeResult, setAnalyzeResult] = useState(null);

  // ── Generate state ──
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

  useEffect(() => { try { localStorage.setItem("vt_keys", JSON.stringify(keys)); } catch {} }, [keys]);
  useEffect(() => { localStorage.setItem("vt_plat", plat); const ms = PLATFORMS[plat]?.models; if (ms?.length) setModel(ms[0].id); const ss = PLATFORMS[plat]?.sizes; if (ss?.length) setSize(ss[0].id); }, [plat]);
  useEffect(() => { logEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [logs]);

  const setKey = v => setKeys(p => ({ ...p, [plat]: v }));
  const log = useCallback((msg, type = "info") => setLogs(p => [...p, { t: new Date().toLocaleTimeString(), msg, type }]), []);
  const onUpload = e => { Array.from(e.target.files).forEach(f => { const r = new FileReader(); r.onload = ev => setImgs(p => [...p, { id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, name: f.name, url: ev.target.result, b64: ev.target.result.split(",")[1], mime: f.type }]); r.readAsDataURL(f); }); e.target.value = ""; };
  const toggleScene = id => setSelScenes(p => p.includes(id) ? p.filter(t => t !== id) : [...p, id]);
  const toggleBannerTpl = id => setSelBannerTpls(p => p.includes(id) ? p.filter(t => t !== id) : [...p, id]);
  const updateVar = (k, v) => setBannerVars(p => ({ ...p, [k]: v }));

  // Build prompt cho 1 template
  const buildPromptFor = (tplId) => {
    if (promptOverrides[tplId]) return promptOverrides[tplId];
    const tpl = BANNER_TEMPLATES.find(t => t.id === tplId);
    const szLabel = BANNER_SIZES.find(s => s.id === bannerSize)?.label || bannerSize;
    return tpl?.build(bannerVars, szLabel) || "";
  };

  // ── AI ANALYZE ──
  const handleAnalyze = async (img) => {
    const geminiKey = keys.gemini;
    if (!geminiKey) { log("Cần Gemini API key để phân tích!", "error"); return; }
    setAnalyzing(true); log(`🔍 AI đang phân tích: ${img.name}...`);
    try {
      const r = await analyzeProduct(geminiKey, img.b64, img.mime, userNotes);
      setAnalyzeResult(r);

      // Log custom text replacements
      if (r.customTextReplaced) {
        const ct = r.customTextReplaced;
        if (ct.originalText) log(`📝 Text: "${ct.originalText}" → "${ct.replacedWith}"`);
        if (ct.originalYears) log(`📅 Years: "${ct.originalYears}" → "${ct.replacedYears}"`);
      }

      // Fill mockup fields
      if (r.productName) setProductName(r.productName);
      if (r.productColor) setProductColor(r.productColor);
      if (r.productVisualDesc) setProductDetails(r.productVisualDesc);
      if (r.suggestedScenes) setSelScenes(r.suggestedScenes);

      // Fill ALL banner shared vars
      setBannerVars(prev => ({
        ...prev,
        productName: r.productName || prev.productName,
        productShort: r.productShort || r.productName || prev.productShort,
        productType: r.productType || prev.productType,
        productColor: r.productColor || prev.productColor,
        productVisualDesc: r.productVisualDesc || prev.productVisualDesc,
        productFullDesc: r.productFullDesc || prev.productFullDesc,
        branch: r.branch || prev.branch,
        branchColorPrimary: r.branchColorPrimary || prev.branchColorPrimary,
        branchColorSecondary: r.branchColorSecondary || prev.branchColorSecondary,
        modelAge: r.modelAge || prev.modelAge,
        modelGender: r.modelGender || prev.modelGender,
        modelFeatures: r.modelFeatures || prev.modelFeatures,
        offer: r.offer || prev.offer,
        cta: r.cta || prev.cta,
        tagline: r.tagline || prev.tagline,
        customFeatures: r.customFeatures || prev.customFeatures,
        holidayName: r.holidayName || prev.holidayName,
        promoCode: r.promoCode || prev.promoCode,
      }));

      // Auto-select suggested banner templates
      if (r.suggestedBannerTemplates?.length) setSelBannerTpls(r.suggestedBannerTemplates);

      // Clear any manual overrides since vars changed
      setPromptOverrides({});

      const tplCount = r.suggestedBannerTemplates?.length || 0;
      log(`✅ Phân tích xong: ${r.productName} (${r.productType})`, "success");
      log(`🎖️ Branch: ${r.branch} | Palette: ${r.branchColorPrimary} + ${r.branchColorSecondary}`, "info");
      log(`🎯 Gợi ý ${tplCount} banner templates + ${r.suggestedScenes?.length || 0} mockup scenes`, "success");
    } catch (err) { log(`❌ Lỗi: ${err.message}`, "error"); }
    setAnalyzing(false);
  };

  // ── GENERATE ──
  const startGen = async () => {
    if (!key) return log("Chưa nhập API Key!", "error");
    if (!imgs.length) return log("Chưa upload ảnh!", "error");

    const q = [];
    if (bannerMode) {
      if (!selBannerTpls.length) return log("Chưa chọn banner template!", "error");
      imgs.forEach(img => {
        selBannerTpls.forEach(tplId => {
          const tpl = BANNER_TEMPLATES.find(t => t.id === tplId);
          const prompt = buildPromptFor(tplId);
          q.push({ id: `${img.id}_${tplId}`, img, label: tpl.label, prompt, sceneId: tplId, isBanner: true });
        });
      });
    } else {
      if (!selScenes.length) return log("Chưa chọn mockup scene!", "error");
      imgs.forEach(img => {
        selScenes.forEach(sid => {
          const scene = MOCKUP_SCENES.find(s => s.id === sid);
          const prompt = buildMockupPrompt(scene, productName, productColor, productDetails);
          q.push({ id: `${img.id}_${sid}`, img, label: scene.label, prompt, sceneId: sid });
        });
      });
    }

    setQueue(q.map(i => ({ ...i, status: STATUS.IDLE, result: null, error: null })));
    setResults([]); setRunning(true); setTab("generate"); setProg({ c: 0, t: q.length });
    const ctrl = new AbortController(); abortRef.current = ctrl;
    log(`🚀 ${q.length} ${bannerMode ? "banners" : "mockups"} · ${pf.label} · ${model}`);

    const u = q.map(i => ({ ...i, status: STATUS.IDLE, result: null, error: null }));
    let ok = 0;

    for (let i = 0; i < q.length; i++) {
      if (ctrl.signal.aborted) { log("⏹ Dừng.", "warn"); break; }
      u[i] = { ...u[i], status: STATUS.GENERATING }; setQueue([...u]); setProg({ c: i + 1, t: q.length });
      const b64 = pf.supportsImageInput ? q[i].img.b64 : null;
      const prompt = pf.supportsImageInput ? q[i].prompt : `${q[i].prompt}\n\nProduct reference: ${q[i].img.name}`;
      log(`[${i + 1}/${q.length}] ${q[i].img.name} → ${q[i].label}`);
      try {
        const url = await genImage(plat, key, model, b64, q[i].img.mime, prompt, ctrl.signal, size);
        u[i] = { ...u[i], status: STATUS.SUCCESS, result: url };
        setResults(p => [...p, { id: q[i].id, url, src: q[i].img.name, type: q[i].label, tid: q[i].sceneId }]);
        ok++; log(`✅ ${q[i].label}`, "success");
      } catch (err) {
        if (err.name === "AbortError") break;
        u[i] = { ...u[i], status: STATUS.ERROR, error: err.message }; log(`❌ ${err.message}`, "error");
        if (err.message.match(/429|quota|rate/i)) {
          log("⏳ Rate limit — 30s...", "warn"); await new Promise(r => setTimeout(r, 30000));
          if (ctrl.signal.aborted) break;
          try { const url = await genImage(plat, key, model, b64, q[i].img.mime, prompt, ctrl.signal, size); u[i] = { ...u[i], status: STATUS.SUCCESS, result: url, error: null }; setResults(p => [...p, { id: q[i].id, url, src: q[i].img.name, type: q[i].label, tid: q[i].sceneId }]); ok++; log(`✅ Retry OK`, "success"); } catch (re) { if (re.name === "AbortError") break; log(`❌ ${re.message}`, "error"); }
        }
      }
      setQueue([...u]);
      if (i < q.length - 1 && !ctrl.signal.aborted) await new Promise(r => setTimeout(r, delay * 1000));
    }
    setRunning(false); log(`🏁 ${ok}/${q.length} thành công.`);
  };

  const dlAll = () => results.forEach((r, i) => setTimeout(() => dl(r.url, `vettailor_${r.tid}_${r.src.replace(/\.[^.]+$/, "")}.png`), i * 400));
  const totalBanners = imgs.length * selBannerTpls.length;
  const totalMockups = imgs.length * selScenes.length;
  const total = bannerMode ? totalBanners : totalMockups;
  const tabs = [
    { id: "setup", l: "Setup", i: "⚙️" },
    { id: "upload", l: "Upload", i: "📤" },
    { id: "config", l: bannerMode ? "Banner" : "Mockup", i: bannerMode ? "🎯" : "🎨" },
    { id: "generate", l: "Generate", i: "🚀" },
    { id: "results", l: `Results${results.length ? ` (${results.length})` : ""}`, i: "🖼️" },
  ];

  return (
    <div style={{ fontFamily: "'Segoe UI',-apple-system,system-ui,sans-serif", background: "linear-gradient(145deg,#0a0a15,#111827,#0f172a)", color: "#e2e8f0", minHeight: "100vh" }}>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}*{box-sizing:border-box}::selection{background:#7c3aed;color:#fff}::-webkit-scrollbar{width:6px}::-webkit-scrollbar-thumb{background:#374151;border-radius:3px}.card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:20px;margin-bottom:14px}.inp{background:rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.1);color:#e2e8f0;padding:10px 14px;border-radius:8px;font-size:14px;width:100%;outline:none}.inp:focus{border-color:#7c3aed}.inp::placeholder{color:#4b5563}textarea.inp{resize:vertical;min-height:50px}.btn{border:none;cursor:pointer;font-weight:600;border-radius:8px;font-size:14px;display:inline-flex;align-items:center;gap:6px;transition:all .15s}.btn-p{background:linear-gradient(135deg,#7c3aed,#6d28d9);color:#fff;padding:11px 22px}.btn-p:hover{box-shadow:0 4px 20px rgba(124,58,237,.4)}.btn-p:disabled{opacity:.4;cursor:not-allowed}.btn-s{background:rgba(255,255,255,.07);color:#c0c8d8;border:1px solid rgba(255,255,255,.1);padding:8px 14px;font-size:13px}.btn-s:hover{background:rgba(255,255,255,.12)}.btn-d{background:rgba(220,38,38,.15);color:#fca5a5;border:1px solid rgba(220,38,38,.25);padding:10px 20px}.tab{padding:10px 16px;border:none;cursor:pointer;font-size:13px;font-weight:600;border-radius:10px 10px 0 0;display:flex;align-items:center;gap:6px;background:transparent;color:#64748b;transition:all .2s}.tab:hover{color:#94a3b8}.tab.on{background:rgba(124,58,237,.15);color:#c4b5fd;border-bottom:2px solid #7c3aed}.mcard{border:2px solid rgba(255,255,255,.06);border-radius:12px;padding:12px;cursor:pointer;transition:all .2s;background:rgba(0,0,0,.15)}.mcard:hover{border-color:rgba(124,58,237,.3)}.mcard.on{border-color:#7c3aed;background:rgba(124,58,237,.08)}.pbar{height:5px;background:rgba(255,255,255,.06);border-radius:3px;overflow:hidden}.pfill{height:100%;background:linear-gradient(90deg,#7c3aed,#a78bfa);border-radius:3px;transition:width .4s}.log{padding:3px 0;font-size:12px;font-family:Consolas,monospace;animation:fadeIn .25s}.log-info{color:#94a3b8}.log-success{color:#6ee7b7}.log-error{color:#fca5a5}.log-warn{color:#fcd34d}.rcard{border-radius:12px;overflow:hidden;background:rgba(0,0,0,.25);border:1px solid rgba(255,255,255,.06);transition:all .2s}.rcard:hover{transform:translateY(-3px);box-shadow:0 8px 30px rgba(0,0,0,.4)}.pfb{padding:12px 16px;border-radius:10px;cursor:pointer;border:2px solid rgba(255,255,255,.06);background:rgba(0,0,0,.2);display:flex;align-items:center;gap:10px;width:100%;transition:all .2s}.pfb:hover{border-color:rgba(255,255,255,.15)}.pfb.on{border-color:var(--pc);background:rgba(255,255,255,.04)}.mode-btn{padding:10px 20px;border-radius:8px;cursor:pointer;font-weight:600;font-size:14px;border:2px solid rgba(255,255,255,.1);transition:all .2s;background:rgba(0,0,0,.2);color:#94a3b8}.mode-btn:hover{border-color:rgba(255,255,255,.2)}.mode-btn.on{border-color:#7c3aed;background:rgba(124,58,237,.12);color:#c4b5fd}`}</style>

      {/* ═══ HEADER ═══ */}
      <header style={{ padding: "18px 24px 0", borderBottom: "1px solid rgba(255,255,255,.05)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 21, fontWeight: 700, color: "#f1f5f9", display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 26 }}>🎖️</span> Vettailor Generator v2</h1>
            <p style={{ margin: "3px 0 0", fontSize: 12, color: "#64748b" }}>10 Banner Templates · <span style={{ color: pf.color }}>{pf.icon} {pf.label}</span> · {bannerMode ? "🎯 Banner Mode" : "🎨 Mockup Mode"}</p>
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
              <button className={`mode-btn ${bannerMode ? "on" : ""}`} onClick={() => setBannerMode(true)}>🎯 Banner Generator (10 Templates)</button>
            </div>
          </div>
          <div className="card">
            <h3 style={{ margin: "0 0 10px", fontSize: 15, color: "#c4b5fd" }}>🌐 Nền tảng AI</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {Object.values(PLATFORMS).map(p => (
                <button key={p.id} className={`pfb ${plat === p.id ? "on" : ""}`} style={{ "--pc": p.color }} onClick={() => setPlat(p.id)}>
                  <span style={{ fontSize: 20, color: p.color, width: 28, textAlign: "center" }}>{p.icon}</span>
                  <div style={{ flex: 1, textAlign: "left" }}><div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{p.label}</div><div style={{ fontSize: 11, color: "#64748b" }}>{p.models.map(m => m.label).join(" · ")}{!p.supportsImageInput && <span style={{ color: "#fcd34d", marginLeft: 6 }}>⚠ Text-only</span>}</div></div>
                  <div style={{ width: 16, height: 16, borderRadius: "50%", border: `2px solid ${plat === p.id ? p.color : "rgba(255,255,255,.15)"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>{plat === p.id && <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color }} />}</div>
                </button>
              ))}
            </div>
          </div>
          <div className="card">
            <h3 style={{ margin: "0 0 4px", fontSize: 15, color: "#c4b5fd" }}>🔑 API Key & Model</h3>
            <p style={{ margin: "0 0 10px", fontSize: 12, color: "#64748b" }}>{pf.keyHelp} <a href={pf.keyLink} target="_blank" rel="noopener noreferrer" style={{ color: pf.color, textDecoration: "none" }}>↗</a></p>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}><input className="inp" type={showKey ? "text" : "password"} placeholder={pf.keyPlaceholder} value={key} onChange={e => setKey(e.target.value)} style={{ flex: 1 }} /><button className="btn btn-s" onClick={() => setShowKey(!showKey)}>{showKey ? "🙈" : "👁️"}</button></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><label style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: 4 }}>Model</label><select className="inp" value={model} onChange={e => setModel(e.target.value)} style={{ cursor: "pointer" }}>{pf.models.map(m => <option key={m.id} value={m.id}>{m.label} — {m.detail}</option>)}</select></div>
              <div><label style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: 4 }}>Kích thước ảnh</label><select className="inp" value={size} onChange={e => setSize(e.target.value)} style={{ cursor: "pointer" }}>{pf.sizes.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}</select></div>
            </div>
            <div style={{ marginTop: 10 }}><label style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: 3 }}>Delay (s)</label><input className="inp" type="number" min={1} max={30} value={delay} onChange={e => setDelay(Math.max(1, +e.target.value))} style={{ width: 70 }} /></div>
          </div>
          <button className="btn btn-p" onClick={() => key && setTab("upload")} disabled={!key} style={{ width: "100%" }}>Tiếp → Upload ảnh</button>
        </>)}

        {/* ═══ UPLOAD ═══ */}
        {tab === "upload" && (<>
          <div className="card">
            <h3 style={{ margin: "0 0 12px", fontSize: 15, color: "#c4b5fd" }}>📤 Upload ảnh sản phẩm</h3>
            <div style={{ border: "2px dashed rgba(255,255,255,.12)", borderRadius: 14, padding: 32, textAlign: "center", cursor: "pointer", background: "rgba(0,0,0,.1)" }} onClick={() => fileRef.current?.click()} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); onUpload({ target: { files: e.dataTransfer.files }, value: "" }); }}>
              <div style={{ fontSize: 32, marginBottom: 4 }}>📁</div><div style={{ fontSize: 14, fontWeight: 600, color: "#c0c8d8" }}>Click hoặc kéo thả</div><div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>PNG, JPG, WEBP</div>
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
              <textarea className="inp" value={userNotes} onChange={e => setUserNotes(e.target.value)} rows={3} placeholder={"VD: Thay CUSTOM TEXT → JOHNSON, years → 1975-2003\nTarget Navy veterans, tone premium dark navy + gold\nModel nên mặc polo navy blue"} style={{ fontSize: 12, lineHeight: 1.5 }} />
              {userNotes && <div style={{ marginTop: 4, fontSize: 10, color: "#6ee7b7" }}>✓ AI sẽ đọc ghi chú này</div>}
            </div>
          )}

          {/* AI ANALYZE */}
          {imgs.length > 0 && (
            <div className="card" style={{ border: "1px solid rgba(168,139,250,.3)", background: "rgba(124,58,237,.04)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 22 }}>🧠</span>
                <div><h4 style={{ margin: 0, fontSize: 14, color: "#c4b5fd" }}>AI Product Analyzer</h4><p style={{ margin: 0, fontSize: 11, color: "#64748b" }}>Phân tích ảnh → tự điền tất cả biến cho 10 banner templates + mockup scenes</p></div>
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
                    <div><span style={{ color: "#64748b" }}>Palette:</span> <span style={{ color: "#e2e8f0" }}>{analyzeResult.branchColorPrimary} + {analyzeResult.branchColorSecondary}</span></div>
                    <div><span style={{ color: "#64748b" }}>Audience:</span> <span style={{ color: "#e2e8f0" }}>{analyzeResult.targetAudience}</span></div>
                  </div>
                  {analyzeResult.customTextReplaced?.originalText && (
                    <div style={{ marginTop: 6, padding: "6px 10px", borderRadius: 6, background: "rgba(110,231,183,.08)", border: "1px solid rgba(110,231,183,.2)", fontSize: 11 }}>
                      <span style={{ color: "#6ee7b7", fontWeight: 600 }}>📝 Replaced:</span>
                      {analyzeResult.customTextReplaced.originalText && <span style={{ color: "#94a3b8" }}> "{analyzeResult.customTextReplaced.originalText}" → <span style={{ color: "#e2e8f0" }}>"{analyzeResult.customTextReplaced.replacedWith}"</span></span>}
                      {analyzeResult.customTextReplaced.originalYears && <span style={{ color: "#94a3b8" }}> · "{analyzeResult.customTextReplaced.originalYears}" → <span style={{ color: "#e2e8f0" }}>"{analyzeResult.customTextReplaced.replacedYears}"</span></span>}
                    </div>
                  )}
                  <div style={{ marginTop: 6, fontSize: 11, color: "#a78bfa" }}>
                    🎯 Banner templates: {analyzeResult.suggestedBannerTemplates?.join(", ")}
                  </div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>
                    🎨 Mockup scenes: {analyzeResult.suggestedScenes?.join(", ")}
                  </div>
                  <div style={{ marginTop: 6, fontSize: 11, color: "#6ee7b7" }}>→ Đã tự điền TẤT CẢ biến. Nhấn "Tiếp" để review & generate.</div>
                </div>
              )}
            </div>
          )}
          <button className="btn btn-p" onClick={() => imgs.length && setTab("config")} disabled={!imgs.length} style={{ width: "100%" }}>Tiếp → {bannerMode ? "Chọn Banner Templates" : "Chọn Mockup Scenes"}</button>
        </>)}

        {/* ═══ CONFIG — MOCKUP MODE ═══ */}
        {tab === "config" && !bannerMode && (<>
          <div className="card">
            <h3 style={{ margin: "0 0 8px", fontSize: 15, color: "#c4b5fd" }}>📝 Thông tin sản phẩm</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Field label="Tên sản phẩm" value={productName} onChange={setProductName} placeholder="veteran graphic hat" />
              <Field label="Màu sắc" value={productColor} onChange={setProductColor} placeholder="black and camo" />
            </div>
            <Field label="Chi tiết" value={productDetails} onChange={setProductDetails} placeholder="Eagle emblem, flag patch..." rows={2} />
          </div>
          <div className="card">
            <h3 style={{ margin: "0 0 10px", fontSize: 15, color: "#c4b5fd" }}>🎨 Chọn scene mockup</h3>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
              <button className="btn btn-s" onClick={() => setSelScenes(["on_model_male", "patriotic_portrait", "lifestyle_bbq", "closeup"])} style={{ fontSize: 12 }}>⚡ Quick (4)</button>
              <button className="btn btn-s" onClick={() => setSelScenes(MOCKUP_SCENES.map(s => s.id))} style={{ fontSize: 12 }}>🎯 Full (12)</button>
              <button className="btn btn-s" onClick={() => setSelScenes(["on_model_male", "closeup", "white_bg", "ugc_review"])} style={{ fontSize: 12 }}>🛒 E-com (4)</button>
              <button className="btn btn-s" onClick={() => setSelScenes(["patriotic_portrait", "motorcycle_biker", "lifestyle_bbq", "lifestyle_outdoor", "ugc_review"])} style={{ fontSize: 12 }}>📱 Social (5)</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {MOCKUP_SCENES.map(s => (
                <div key={s.id} className={`mcard ${selScenes.includes(s.id) ? "on" : ""}`} onClick={() => toggleScene(s.id)}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 18 }}>{s.icon}</span>
                    <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{s.label}</div><div style={{ fontSize: 10, color: "#64748b" }}>{s.desc}</div></div>
                    <div style={{ width: 18, height: 18, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, background: selScenes.includes(s.id) ? "#7c3aed" : "rgba(255,255,255,.06)", border: `1px solid ${selScenes.includes(s.id) ? "#7c3aed" : "rgba(255,255,255,.1)"}`, color: "#fff", flexShrink: 0 }}>{selScenes.includes(s.id) ? "✓" : ""}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 10, background: "rgba(124,58,237,.06)", border: "1px solid rgba(124,58,237,.12)" }}>
              <span style={{ fontSize: 13, color: "#94a3b8" }}>{imgs.length} ảnh × {selScenes.length} scenes = </span><strong style={{ color: "#c4b5fd" }}>{totalMockups} mockups</strong>
              <span style={{ fontSize: 12, color: "#64748b", marginLeft: 8 }}>~{Math.ceil((totalMockups * (delay + 5)) / 60)} phút</span>
            </div>
          </div>
          <button className="btn btn-p" onClick={startGen} disabled={running || !totalMockups} style={{ width: "100%" }}>🚀 Generate {totalMockups} mockups</button>
        </>)}

        {/* ═══ CONFIG — BANNER MODE (10 TEMPLATES) ═══ */}
        {tab === "config" && bannerMode && (<>
          {/* Banner Size */}
          <div className="card">
            <h3 style={{ margin: "0 0 10px", fontSize: 15, color: "#c4b5fd" }}>🎯 Banner Generator — 10 Templates</h3>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: 4 }}>Kích thước banner</label>
            <select className="inp" value={bannerSize} onChange={e => setBannerSize(e.target.value)} style={{ cursor: "pointer" }}>
              {BANNER_SIZES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>

          {/* Template Selection Grid */}
          <div className="card">
            <h4 style={{ margin: "0 0 8px", fontSize: 14, color: "#c4b5fd" }}>📋 Chọn templates ({selBannerTpls.length}/10)</h4>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
              {BANNER_QUICK_SETS.map(qs => (
                <button key={qs.id} className="btn btn-s" onClick={() => setSelBannerTpls(qs.ids)} style={{ fontSize: 11 }}>
                  {qs.label}
                </button>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {BANNER_TEMPLATES.map(t => (
                <div key={t.id} className={`mcard ${selBannerTpls.includes(t.id) ? "on" : ""}`} onClick={() => toggleBannerTpl(t.id)}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 20 }}>{t.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{t.label}</div>
                      <div style={{ fontSize: 10, color: "#64748b" }}>{t.desc}</div>
                      <div style={{ fontSize: 9, color: "#4b5563", marginTop: 2 }}>{t.funnel} funnel · {t.usage}</div>
                    </div>
                    <div style={{ width: 18, height: 18, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, background: selBannerTpls.includes(t.id) ? "#7c3aed" : "rgba(255,255,255,.06)", border: `1px solid ${selBannerTpls.includes(t.id) ? "#7c3aed" : "rgba(255,255,255,.1)"}`, color: "#fff", flexShrink: 0 }}>{selBannerTpls.includes(t.id) ? "✓" : ""}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shared Variables Editor */}
          <div className="card">
            <h4 style={{ margin: "0 0 4px", fontSize: 14, color: "#c4b5fd" }}>🔧 Biến chung — dùng cho tất cả templates</h4>
            <p style={{ margin: "0 0 12px", fontSize: 11, color: "#64748b" }}>AI đã tự điền từ phân tích ảnh. Bạn có thể sửa lại bất kỳ field nào.</p>

            <div style={{ padding: "6px 10px", borderRadius: 6, background: "rgba(124,58,237,.06)", marginBottom: 12, fontSize: 11, color: "#a78bfa" }}>
              🎖️ <strong>{bannerVars.branch}</strong> · Palette: <strong>{bannerVars.branchColorPrimary}</strong> + <strong>{bannerVars.branchColorSecondary}</strong>
            </div>

            {/* Product */}
            <div style={{ fontSize: 11, fontWeight: 700, color: "#6ee7b7", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Sản phẩm</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <Field label="Product name" value={bannerVars.productName} onChange={v => updateVar("productName", v)} />
              <Field label="Product short" value={bannerVars.productShort} onChange={v => updateVar("productShort", v)} />
              <Field label="Product type" value={bannerVars.productType} onChange={v => updateVar("productType", v)} />
              <Field label="Product color" value={bannerVars.productColor} onChange={v => updateVar("productColor", v)} />
            </div>
            <Field label="Visual description (chi tiết hình ảnh trên SP)" value={bannerVars.productVisualDesc} onChange={v => updateVar("productVisualDesc", v)} rows={2} />
            <div style={{ padding: "6px 10px", borderRadius: 6, background: "rgba(220,38,38,.08)", border: "1px solid rgba(220,38,38,.2)", marginBottom: 8, fontSize: 11, color: "#fca5a5" }}>
              ⚠️ productFullDesc phải mô tả ĐẦY ĐỦ trang phục model mặc (áo+quần+giày), không chỉ sản phẩm bán.
            </div>
            <Field label="Product full desc (mô tả đầy đủ trang phục model)" value={bannerVars.productFullDesc} onChange={v => updateVar("productFullDesc", v)} rows={2} />

            {/* Branch & Colors */}
            <div style={{ fontSize: 11, fontWeight: 700, color: "#6ee7b7", marginBottom: 6, marginTop: 8, textTransform: "uppercase", letterSpacing: 1 }}>Branch & Màu</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              <Field label="Branch" value={bannerVars.branch} onChange={v => updateVar("branch", v)} />
              <Field label="Color Primary" value={bannerVars.branchColorPrimary} onChange={v => updateVar("branchColorPrimary", v)} />
              <Field label="Color Secondary" value={bannerVars.branchColorSecondary} onChange={v => updateVar("branchColorSecondary", v)} />
            </div>

            {/* Model */}
            <div style={{ fontSize: 11, fontWeight: 700, color: "#6ee7b7", marginBottom: 6, marginTop: 8, textTransform: "uppercase", letterSpacing: 1 }}>Model</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              <Field label="Age" value={bannerVars.modelAge} onChange={v => updateVar("modelAge", v)} />
              <Field label="Gender" value={bannerVars.modelGender} onChange={v => updateVar("modelGender", v)} />
            </div>
            <Field label="Features (ngoại hình, tattoos)" value={bannerVars.modelFeatures} onChange={v => updateVar("modelFeatures", v)} rows={2} />

            {/* Marketing */}
            <div style={{ fontSize: 11, fontWeight: 700, color: "#6ee7b7", marginBottom: 6, marginTop: 8, textTransform: "uppercase", letterSpacing: 1 }}>Marketing</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <Field label="Offer" value={bannerVars.offer} onChange={v => updateVar("offer", v)} placeholder="BUY 1 GET 1 FREE" />
              <Field label="CTA" value={bannerVars.cta} onChange={v => updateVar("cta", v)} placeholder="CLAIM YOURS NOW" />
              <Field label="Tagline" value={bannerVars.tagline} onChange={v => updateVar("tagline", v)} placeholder="HONOR YOUR SERVICE" />
              <Field label="Custom features" value={bannerVars.customFeatures} onChange={v => updateVar("customFeatures", v)} placeholder="Name, Rank, Years" />
              <Field label="Holiday name (cho template #8)" value={bannerVars.holidayName} onChange={v => updateVar("holidayName", v)} placeholder="VETERANS DAY SALE" />
              <Field label="Promo code (tuỳ chọn)" value={bannerVars.promoCode} onChange={v => updateVar("promoCode", v)} placeholder="HONOR50" />
            </div>
          </div>

          {/* Prompt Preview per Template */}
          <div className="card" style={{ border: "1px solid rgba(168,139,250,.25)" }}>
            <h4 style={{ margin: "0 0 8px", fontSize: 14, color: "#a78bfa" }}>👁️ Preview & Edit prompt từng template</h4>
            <p style={{ fontSize: 11, color: "#64748b", marginBottom: 10 }}>Click để xem prompt. Sửa trực tiếp nếu muốn — prompt đã sửa sẽ được giữ lại.</p>
            {selBannerTpls.map(tplId => {
              const tpl = BANNER_TEMPLATES.find(t => t.id === tplId);
              if (!tpl) return null;
              const isExpanded = expandedTpl === tplId;
              const prompt = buildPromptFor(tplId);
              const isOverridden = !!promptOverrides[tplId];
              return (
                <div key={tplId} style={{ marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "8px 10px", borderRadius: 8, background: isExpanded ? "rgba(124,58,237,.08)" : "rgba(0,0,0,.15)", border: `1px solid ${isExpanded ? "rgba(124,58,237,.25)" : "rgba(255,255,255,.05)"}` }} onClick={() => setExpandedTpl(isExpanded ? null : tplId)}>
                    <span style={{ fontSize: 16 }}>{tpl.icon}</span>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{tpl.label}</span>
                      <span style={{ fontSize: 10, color: "#64748b", marginLeft: 8 }}>{tpl.funnel}</span>
                      {isOverridden && <span style={{ fontSize: 9, color: "#fcd34d", marginLeft: 6 }}>✏️ đã sửa</span>}
                    </div>
                    <span style={{ fontSize: 12, color: "#64748b" }}>{isExpanded ? "▼" : "▶"}</span>
                  </div>
                  {isExpanded && (
                    <div style={{ padding: "8px 10px", marginTop: 4 }}>
                      <textarea className="inp" value={prompt} onChange={e => setPromptOverrides(p => ({ ...p, [tplId]: e.target.value }))} rows={8} style={{ fontSize: 11, lineHeight: 1.5, fontFamily: "Consolas, monospace" }} />
                      <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                        {isOverridden && <button className="btn btn-s" onClick={() => setPromptOverrides(p => { const n = { ...p }; delete n[tplId]; return n; })} style={{ fontSize: 10 }}>🔄 Reset về auto</button>}
                        <button className="btn btn-s" onClick={() => { navigator.clipboard.writeText(prompt); }} style={{ fontSize: 10 }}>📋 Copy prompt</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Summary & Generate */}
          <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(124,58,237,.06)", border: "1px solid rgba(124,58,237,.12)", marginBottom: 14 }}>
            <strong style={{ color: "#c4b5fd" }}>{imgs.length} ảnh × {selBannerTpls.length} templates = {totalBanners} banners</strong>
            <span style={{ fontSize: 12, color: "#64748b", marginLeft: 8 }}>~{Math.ceil((totalBanners * (delay + 5)) / 60)} phút</span>
            <div style={{ marginTop: 4, fontSize: 11, color: "#94a3b8" }}>
              Templates: {selBannerTpls.map(id => BANNER_TEMPLATES.find(t => t.id === id)?.icon).join(" ")}
            </div>
          </div>
          <button className="btn btn-p" onClick={startGen} disabled={running || !totalBanners} style={{ width: "100%" }}>
            🎯 Generate {totalBanners} Banner{totalBanners > 1 ? "s" : ""} ({selBannerTpls.length} styles)
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
            {results.length > 0 && <button className="btn btn-p" onClick={dlAll} style={{ padding: "8px 16px", fontSize: 13 }}>⬇️ Download all</button>}
          </div>
          {!results.length
            ? <div className="card" style={{ textAlign: "center", padding: 40 }}><div style={{ fontSize: 34, marginBottom: 6 }}>🎨</div><div style={{ fontSize: 13, color: "#64748b" }}>Chưa có kết quả</div></div>
            : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 14 }}>
                {results.map(r => (
                  <div key={r.id} className="rcard">
                    <img src={r.url} alt="" style={{ width: "100%", height: 200, objectFit: "cover", display: "block" }} />
                    <div style={{ padding: 10 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0" }}>{r.type}</div>
                      <div style={{ fontSize: 10, color: "#64748b", marginTop: 1 }}>{r.src}</div>
                      <button className="btn btn-s" onClick={() => dl(r.url, `vettailor_${r.tid}_${r.src.replace(/\.[^.]+$/, "")}.png`)} style={{ width: "100%", marginTop: 8, fontSize: 11, padding: "6px", justifyContent: "center" }}>⬇️ Download</button>
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
