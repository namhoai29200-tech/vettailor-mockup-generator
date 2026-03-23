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
// CTCO MOCKUP SCENES — cấu trúc prompt tối ưu
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
  { id: "flat_lay", label: "Flat Lay", icon: "📐", desc: "Sản phẩm trên bàn themed",
    vars: { SHOT_TYPE: "overhead flat lay", MOOD: "clean and patriotic", AGE: "", GENDER_DESC: "", PHYSICAL_FEATURES: "", BASE_OUTFIT: "", WEARING_STYLE: "neatly folded and centered on a rustic dark wooden table", POSE: "surrounded by themed items: a folded American flag, metal dog tags, a vintage compass, and a worn leather journal", POSE_PURPOSE: "", LIGHTING_STYLE: "Soft warm side lighting", LIGHTING_DETAIL: "creating gentle shadows for depth", SETTING: "a styled product photography surface", SETTING_DETAIL: "dark wood grain texture visible beneath the arrangement" },
    customPrompt: true },
  { id: "closeup", label: "Close-up Detail", icon: "🔍", desc: "Cận cảnh chi tiết sản phẩm",
    vars: { SHOT_TYPE: "extreme close-up macro", MOOD: "premium and detailed", AGE: "", GENDER_DESC: "", PHYSICAL_FEATURES: "", BASE_OUTFIT: "", WEARING_STYLE: "displayed showing texture, stitching, and embroidery detail", POSE: "filling most of the frame at a slight angle", POSE_PURPOSE: "", LIGHTING_STYLE: "Dramatic studio lighting with rim light", LIGHTING_DETAIL: "highlighting every stitch and fiber of the material", SETTING: "a dark moody studio", SETTING_DETAIL: "smooth black gradient background with subtle reflections" },
    customPrompt: true },
  { id: "white_bg", label: "White BG", icon: "⬜", desc: "Nền trắng e-commerce",
    vars: { SHOT_TYPE: "product photo", MOOD: "clean and commercial", AGE: "", GENDER_DESC: "", PHYSICAL_FEATURES: "", BASE_OUTFIT: "", WEARING_STYLE: "positioned at a slight angle showing dimension and form", POSE: "centered with minimal soft shadow underneath", POSE_PURPOSE: "", LIGHTING_STYLE: "Even soft studio lighting", LIGHTING_DETAIL: "no harsh shadows, perfectly balanced exposure", SETTING: "a pure white infinity background", SETTING_DETAIL: "seamless white with subtle ground shadow for depth" },
    customPrompt: true },
  // ── NEW SCENES ──
  { id: "patriotic_portrait", label: "Patriotic Portrait", icon: "🎖️", desc: "Editorial cinematic portrait",
    vars: { SHOT_TYPE: "close-up profile", MOOD: "solemn, resolute, and reverent", AGE: "52", GENDER_DESC: "male veteran", PHYSICAL_FEATURES: "with a graying beard, weathered face, strong jaw, and detailed military tattoos on forearm including parachutist wings and unit crests", BASE_OUTFIT: "a fitted black t-shirt with subtle patriotic graphic", WEARING_STYLE: "worn with quiet pride and military bearing", POSE: "performing a sharp military salute, hand crisp at the brow", POSE_PURPOSE: "gazing into the distance with solemn respect", LIGHTING_STYLE: "Natural diffused cinematic lighting, extremely shallow depth of field", LIGHTING_DETAIL: "sharp focus on face, beard, hand, and cap details, everything else beautifully blurred", SETTING: "outdoors with a massive American flag waving behind", SETTING_DETAIL: "blurred city harbor or memorial in the background, Fujifilm film simulation color grade, reverent patriotic editorial style" } },
  { id: "motorcycle_biker", label: "Motorcycle / Biker", icon: "🏍️", desc: "Veteran cưỡi hoặc đứng cạnh xe",
    vars: { SHOT_TYPE: "three-quarter", MOOD: "fierce, free-spirited, and rebellious", AGE: "50", GENDER_DESC: "male veteran biker", PHYSICAL_FEATURES: "with a thick salt-and-pepper beard, muscular arms with military and eagle tattoos, sun-weathered skin, and aviator sunglasses pushed up on forehead", BASE_OUTFIT: "worn dark denim jeans, heavy black motorcycle boots, and a black leather vest over a dark henley shirt", WEARING_STYLE: "layered ruggedly with biker attitude", POSE: "straddling a classic Harley-Davidson motorcycle, one hand on the handlebar", POSE_PURPOSE: "looking at the camera with a confident half-grin", LIGHTING_STYLE: "Warm late afternoon golden light from the side", LIGHTING_DETAIL: "chrome reflections on the motorcycle, dramatic shadows on the face", SETTING: "a scenic empty highway with open desert or mountain road stretching behind", SETTING_DETAIL: "American flag bandana tied to the handlebars, leather saddlebags visible, Route 66 vibes" } },
  { id: "gift_unboxing", label: "Gift / Unboxing", icon: "🎁", desc: "Quà tặng, mở hộp",
    vars: { SHOT_TYPE: "medium overhead angle", MOOD: "warm, heartfelt, and celebratory", AGE: "55", GENDER_DESC: "male veteran", PHYSICAL_FEATURES: "with kind eyes, warm genuine smile, and silver hair", BASE_OUTFIT: "a comfortable plaid flannel shirt and reading glasses perched on nose", WEARING_STYLE: "being unwrapped from tissue paper inside a premium gift box", POSE: "seated at a dining table, holding up the product with both hands, admiring it", POSE_PURPOSE: "smiling warmly at the gift with visible emotion", LIGHTING_STYLE: "Soft warm indoor lighting", LIGHTING_DETAIL: "cozy ambient glow from a nearby window, holiday warmth", SETTING: "a warm family living room", SETTING_DETAIL: "a handwritten card reading 'Thank You For Your Service' on the table, gift wrapping paper and ribbon scattered nearby, family photos in the background" } },
  { id: "ugc_review", label: "UGC / Review", icon: "📱", desc: "Selfie style, trông như review thật",
    vars: { SHOT_TYPE: "smartphone selfie", MOOD: "casual, authentic, and genuinely happy", AGE: "42", GENDER_DESC: "male veteran", PHYSICAL_FEATURES: "with a friendly face, neat stubble, and a natural relaxed expression", BASE_OUTFIT: "casual everyday clothes", WEARING_STYLE: "worn naturally as if just received in the mail", POSE: "taking a mirror selfie or front-camera selfie, holding phone visible in frame", POSE_PURPOSE: "grinning proudly and pointing at the product with the other hand", LIGHTING_STYLE: "Natural indoor lighting, slightly warm, phone camera quality", LIGHTING_DETAIL: "minor lens distortion, realistic phone photo look, not overly polished", SETTING: "a normal bedroom or hallway with a mirror", SETTING_DETAIL: "an open shipping box from an online order visible on the bed or floor behind, casual messy-but-real home environment, looks like a genuine customer photo NOT a professional shoot" } },
];

function buildMockupPrompt(scene, productName, productColor, productDetails) {
  const v = scene.vars;
  if (scene.customPrompt) {
    return `A ${v.SHOT_TYPE} color photo of a ${v.MOOD} ${productColor} ${productName} ${v.WEARING_STYLE}. ${productDetails}. The product is ${v.POSE}. ${v.LIGHTING_STYLE}, ${v.LIGHTING_DETAIL}. The background is ${v.SETTING} with ${v.SETTING_DETAIL}. Full color photography, photorealistic. The product design, colors, and ALL details must be preserved EXACTLY as shown in the reference image. Do NOT add any text, watermarks, or logos not present in the original.`;
  }
  return `A ${v.SHOT_TYPE} color photo of a ${v.MOOD} ${v.AGE}-year-old American ${v.GENDER_DESC} ${v.PHYSICAL_FEATURES} in ${v.BASE_OUTFIT} and a ${productColor} ${productName} ${v.WEARING_STYLE}. ${productDetails}. The model is ${v.POSE} ${v.POSE_PURPOSE}. ${v.LIGHTING_STYLE}, ${v.LIGHTING_DETAIL}. The background is ${v.SETTING} with ${v.SETTING_DETAIL}. Full color photography, vibrant natural skin tones, color outdoor scene, photorealistic. The product design, colors, and ALL details must be preserved EXACTLY as shown in the reference image. Do NOT add any text, watermarks, or logos not present in the original.`;
}

// ════════════════════════════════════════════════════════════
// BANNER PROMPT BUILDER
// ════════════════════════════════════════════════════════════

const BANNER_PRESETS = [
  { id: "sale", label: "🔥 Sale/Discount",
    bgColor: "deep navy blue", bgPattern: "subtle diagonal stripes", patternDetail: "thin white lines at 45 degrees", textureStyle: "smooth matte finish", bgMood: "bold and urgent",
    leftWidth: "45%", modelMood: "confident and proud", modelAge: "45", modelGender: "male", modelFeatures: "strong athletic build, short cropped hair, square jaw", productFullDesc: "", lightingStyle: "warm golden hour side lighting", separationTechnique: "soft edge blend into background", modelBrightness: "natural brightness", modelBg: "subtle dark gradient behind model",
    rightWidth: "55%", hookText: "LIMITED TIME OFFER", hookBgStyle: "semi-transparent dark strip", headlineText: "UP TO 50% OFF", subText: "HONOR THE SERVICE — SHOP TODAY", offerLabel: "BEST SELLER", productDisplay: "front-facing product shot", ctaColor: "bright red", ctaText: "SHOP NOW — FREE SHIPPING", badgeType: "military", badgeIcon: "★", badgeText: "TRUSTED BY 50,000+ CUSTOMERS", badgeColor: "gold on dark",
    footerLeft: "", footerRight: "", overallStyle: "bold patriotic commercial" },
  { id: "new_product", label: "✨ New Arrival",
    bgColor: "charcoal black", bgPattern: "subtle geometric grid", patternDetail: "thin hexagonal outlines", textureStyle: "clean modern matte", bgMood: "sleek and premium",
    leftWidth: "45%", modelMood: "confident", modelAge: "40", modelGender: "male", modelFeatures: "athletic build, neat beard, intense eyes", productFullDesc: "", lightingStyle: "cool studio rim lighting", separationTechnique: "sharp shadow cutoff", modelBrightness: "slightly elevated brightness", modelBg: "dark studio backdrop",
    rightWidth: "55%", hookText: "JUST DROPPED", hookBgStyle: "accent color strip", headlineText: "NEW COLLECTION 2026", subText: "DESIGNED FOR THOSE WHO SERVED", offerLabel: "NEW", productDisplay: "angled product shot", ctaColor: "military green", ctaText: "EXPLORE THE COLLECTION", badgeType: "modern minimal", badgeIcon: "🇺🇸", badgeText: "MADE IN USA", badgeColor: "white on dark green",
    footerLeft: "", footerRight: "", overallStyle: "modern premium military" },
  { id: "holiday", label: "🎖️ Veterans Day",
    bgColor: "dark red and navy gradient", bgPattern: "faded American flag texture", patternDetail: "low opacity stars and stripes overlay", textureStyle: "slightly worn vintage", bgMood: "patriotic and emotional",
    leftWidth: "45%", modelMood: "proud and solemn", modelAge: "50", modelGender: "male", modelFeatures: "weathered face, broad shoulders, strong posture", productFullDesc: "", lightingStyle: "warm dramatic side light", separationTechnique: "soft vignette blend", modelBrightness: "warm golden tones", modelBg: "dark flag-themed gradient",
    rightWidth: "55%", hookText: "THANK YOU FOR YOUR SERVICE", hookBgStyle: "gold accent line above text", headlineText: "VETERANS DAY SALE", subText: "HONORING ALL WHO SERVED — 25% OFF SITEWIDE", offerLabel: "SPECIAL EDITION", productDisplay: "hero product shot", ctaColor: "deep red with gold border", ctaText: "HONOR & SAVE TODAY", badgeType: "ribbon", badgeIcon: "🎖️", badgeText: "PROUDLY AMERICAN", badgeColor: "gold on navy",
    footerLeft: "", footerRight: "", overallStyle: "patriotic emotional premium" },
  { id: "social", label: "📱 Social Media",
    bgColor: "dark slate", bgPattern: "subtle noise texture", patternDetail: "fine grain overlay", textureStyle: "modern digital clean", bgMood: "trendy and eye-catching",
    leftWidth: "45%", modelMood: "energetic and approachable", modelAge: "35", modelGender: "male", modelFeatures: "fit build, casual confidence, warm smile", productFullDesc: "", lightingStyle: "bright natural daylight", separationTechnique: "color contrast separation", modelBrightness: "high key bright", modelBg: "complementary color wash",
    rightWidth: "55%", hookText: "AS SEEN ON INSTAGRAM", hookBgStyle: "gradient accent bar", headlineText: "WEAR YOUR PRIDE", subText: "JOIN 50,000+ HAPPY CUSTOMERS", offerLabel: "TRENDING", productDisplay: "lifestyle product shot", ctaColor: "bright blue", ctaText: "GET YOURS NOW", badgeType: "star rating", badgeIcon: "⭐", badgeText: "⭐⭐⭐⭐⭐ 4.9 RATED", badgeColor: "yellow on dark",
    footerLeft: "", footerRight: "", overallStyle: "social media optimized, eye-catching" },
];

const BANNER_SIZES = [
  { id: "1200x628", label: "1200×628 — Facebook/Meta Ads" },
  { id: "1080x1080", label: "1080×1080 — Instagram Square" },
  { id: "1080x1920", label: "1080×1920 — Story/Reels" },
  { id: "1456x180", label: "1456×180 — Website Banner" },
  { id: "1200x600", label: "1200×600 — Google Display" },
];

function buildBannerPrompt(c) {
  return `Marketing banner design, ${c.bannerSize}, landscape orientation. Full composition with all elements rendered completely. Background: ${c.bgColor} with ${c.bgPattern}, ${c.patternDetail}, ${c.textureStyle}, ${c.bgMood}. LEFT HALF (${c.leftWidth} width): full-height lifestyle photo of ${c.modelMood} ${c.modelAge} year old American veteran ${c.modelGender} with ${c.modelFeatures}, wearing ${c.productFullDesc}, ${c.lightingStyle}, ${c.separationTechnique}, ${c.modelBrightness}, ${c.modelBg}, photorealistic, bleeds to left edge with no border or frame. RIGHT HALF (${c.rightWidth} width): TOP — "${c.hookText}" in small bold white all-caps on ${c.hookBgStyle}. BELOW — "${c.headlineText}" in very large bold white condensed font, 2-3x larger than all other text. BELOW — "${c.subText}" in small white all-caps. CENTER — rounded product box with "${c.offerLabel}" pill above, showing ${c.productDisplay} of ${c.productName}. BELOW BOX — ${c.badgeType} badge with ${c.badgeIcon} and "${c.badgeText}" in ${c.badgeColor}. BOTTOM — ${c.ctaColor} CTA full width: "${c.ctaText}"${c.footerLeft ? `, footer left: "${c.footerLeft}"` : ""}${c.footerRight ? `, footer right: "${c.footerRight}"` : ""}${c.footerLeft || c.footerRight ? ", same line NOT stacked" : ""}. Style: ${c.overallStyle}. All text must be clearly legible and correctly spelled.`;
}

// ════════════════════════════════════════════════════════════
// API ADAPTERS
// ════════════════════════════════════════════════════════════

async function callGemini(key, model, b64, mime, prompt, sig, size) {
  const parts = [{ text: prompt }];
  if (b64) parts.unshift({ inline_data: { mime_type: mime, data: b64 } });
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ role: "user", parts }], generationConfig: { responseModalities: ["TEXT", "IMAGE"] } }), signal: sig });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e?.error?.message || `Gemini ${res.status}`); }
  const data = await res.json();
  const ps = data?.candidates?.[0]?.content?.parts || [];
  const img = ps.find((p) => p.inlineData || p.inline_data);
  if (!img) throw new Error(ps.find((p) => p.text)?.text?.slice(0, 120) || "No image");
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
  const imgOut = (data.output || []).find((o) => o.type === "image_generation_call");
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
  if (plat === "gemini") return callGemini(key, model, b64, mime, prompt, sig, size);
  if (plat === "openai") return callOpenAI(key, model, b64, mime, prompt, sig, size);
  if (plat === "ideogram") return callIdeogram(key, model, b64, mime, prompt, sig, size);
  throw new Error("Unknown platform");
}

// ════════════════════════════════════════════════════════════
// AI PRODUCT ANALYZER — Gemini phân tích ảnh sản phẩm
// ════════════════════════════════════════════════════════════

const ANALYZE_PROMPT = `You are a product photography expert AND marketing creative director for a US Veterans apparel e-commerce store. Analyze this product image carefully and return a JSON object. Be VERY specific and detailed.

Return ONLY valid JSON, no markdown, no backticks, no explanation:
{
  "productName": "Navy Veteran Embroidered Baseball Cap",
  "productColor": "black with gold and navy blue accents",
  "productType": "hat",
  "productDetails": "Navy anchor and eagle emblem embroidered on front panel in gold thread, UNITED STATES NAVY text arc above emblem, 1775-2025 dates flanking the emblem, gold laurel wreath below, structured 6-panel design, pre-curved brim with gold leaf oak clusters, adjustable snapback closure",
  "productFullDesc": "a black Navy veteran embroidered baseball cap with gold eagle emblem on front, gold oak leaf details on brim, structured fit, PAIRED WITH a dark navy blue fitted t-shirt with small American flag on chest, dark fitted jeans, and brown leather belt",
  "suggestedScenes": ["on_model_male", "patriotic_portrait", "motorcycle_biker", "flat_lay", "closeup", "ugc_review"],
  "targetAudience": "US Navy veterans, 40-65 years old, proud of their service",
  "bannerSuggestions": {
    "hookText": "HONOR YOUR SERVICE",
    "headlineText": "NAVY VETERAN COLLECTION",
    "subText": "PREMIUM EMBROIDERED CAPS — BUILT TO LAST",
    "offerLabel": "BEST SELLER",
    "ctaText": "SHOP NAVY VETERAN GEAR",
    "ctaColor": "bright gold with navy border",
    "productDisplay": "front-angled product shot showing embroidery detail",
    "productName": "Navy Veteran Embroidered Cap",
    "badgeType": "military shield",
    "badgeIcon": "★",
    "badgeText": "TRUSTED BY 50,000+ VETERANS",
    "badgeColor": "gold on navy",
    "bgColor": "deep navy blue",
    "bgPattern": "subtle anchor pattern watermark",
    "patternDetail": "faded nautical rope border accent",
    "textureStyle": "smooth matte military grade",
    "bgMood": "proud, authoritative, premium",
    "overallStyle": "premium military navy themed with gold accents, clean typography",
    "modelMood": "proud and commanding",
    "modelAge": "50",
    "modelGender": "male",
    "modelFeatures": "weathered face, salt-and-pepper beard, strong jaw, Navy anchor tattoo on forearm, broad shoulders",
    "productFullDesc": "a black Navy veteran embroidered cap with gold eagle on front AND a fitted dark navy t-shirt with small anchor emblem, dark jeans, brown leather belt",
    "lightingStyle": "warm golden hour side lighting with cinematic depth",
    "separationTechnique": "soft edge blend with slight vignette",
    "modelBrightness": "warm natural skin tones, slightly elevated",
    "modelBg": "dark navy gradient matching banner background",
    "hookBgStyle": "semi-transparent gold accent strip",
    "leftWidth": "45%",
    "rightWidth": "55%",
    "footerLeft": "",
    "footerRight": ""
  }
}

CRITICAL RULES:
1. productFullDesc MUST include FULL outfit (shirt + pants + belt + shoes), not just the product being sold. This prevents AI from generating shirtless models.
2. bannerSuggestions.productFullDesc must ALSO include full outfit for the banner model.
3. Match banner colors/mood to the product's military branch or theme (Navy=blue/gold, Army=green/black, Marines=red/gold, Air Force=blue/silver, general veteran=red/white/blue).
4. modelFeatures should include appropriate tattoos and physical traits matching the military branch.
5. suggestedScenes should include the new scenes: patriotic_portrait, motorcycle_biker, gift_unboxing, ugc_review when appropriate.
6. lightingStyle and modelBg should complement the bgColor for a cohesive banner look.
7. Be creative with hookText and headlineText — make them emotionally compelling for veterans.`;

async function analyzeProduct(geminiKey, imageBase64, mimeType) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;
  const body = {
    contents: [{ role: "user", parts: [
      { inline_data: { mime_type: mimeType, data: imageBase64 } },
      { text: ANALYZE_PROMPT }
    ] }],
    generationConfig: { responseMimeType: "application/json" },
  };
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e?.error?.message || `Gemini Analyze Error ${res.status}`); }
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
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
  return <div style={{ marginBottom: 10 }}><label style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: 3 }}>{label}</label><Tag className="inp" type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows} style={rows ? { fontSize: 12 } : {}} /></div>;
}

// ════════════════════════════════════════════════════════════
// MAIN APP
// ════════════════════════════════════════════════════════════

const STATUS = { IDLE: "idle", GENERATING: "generating", SUCCESS: "success", ERROR: "error" };

export default function App() {
  const [plat, setPlat] = useState(() => localStorage.getItem("vt_plat") || "gemini");
  const [keys, setKeys] = useState(() => { try { return JSON.parse(localStorage.getItem("vt_keys") || "{}"); } catch { return {}; } });
  const [showKey, setShowKey] = useState(false);
  const [model, setModel] = useState("");
  const [size, setSize] = useState("");
  const [imgs, setImgs] = useState([]);
  const [selScenes, setSelScenes] = useState(["on_model_male", "lifestyle_bbq", "closeup", "flat_lay"]);
  const [productName, setProductName] = useState("veteran-themed graphic hat");
  const [productColor, setProductColor] = useState("black and camo");
  const [productDetails, setProductDetails] = useState("Bold eagle emblem embroidered on front, American flag patch on side, structured snapback fit");

  // Banner state
  const [bannerMode, setBannerMode] = useState(false);
  const [bannerPreset, setBannerPreset] = useState("sale");
  const [bannerSize, setBannerSize] = useState("1200x628");
  const [bannerCfg, setBannerCfg] = useState({ ...BANNER_PRESETS[0], productName: "", productFullDesc: "" });
  const [bannerPromptEdit, setBannerPromptEdit] = useState("");
  const [showPromptEdit, setShowPromptEdit] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeResult, setAnalyzeResult] = useState(null);

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
  useEffect(() => { const p = BANNER_PRESETS.find((b) => b.id === bannerPreset); if (p) setBannerCfg((prev) => ({ ...prev, ...p })); }, [bannerPreset]);

  const setKey = (v) => setKeys((p) => ({ ...p, [plat]: v }));
  const log = useCallback((msg, type = "info") => setLogs((p) => [...p, { t: new Date().toLocaleTimeString(), msg, type }]), []);
  const onUpload = (e) => { Array.from(e.target.files).forEach((f) => { const r = new FileReader(); r.onload = (ev) => setImgs((p) => [...p, { id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, name: f.name, url: ev.target.result, b64: ev.target.result.split(",")[1], mime: f.type }]); r.readAsDataURL(f); }); e.target.value = ""; };
  const toggleScene = (id) => setSelScenes((p) => p.includes(id) ? p.filter((t) => t !== id) : [...p, id]);
  const updateBanner = (k, v) => setBannerCfg((p) => ({ ...p, [k]: v }));

  // ── AI ANALYZE ──
  const handleAnalyze = async (img) => {
    const geminiKey = keys.gemini;
    if (!geminiKey) { log("Cần Gemini API key để phân tích ảnh! Vào Setup → chọn Gemini → nhập key.", "error"); return; }
    setAnalyzing(true); log(`🔍 AI đang phân tích: ${img.name}...`);
    try {
      const result = await analyzeProduct(geminiKey, img.b64, img.mime);
      setAnalyzeResult(result);
      // Auto-fill mockup fields
      if (result.productName) setProductName(result.productName);
      if (result.productColor) setProductColor(result.productColor);
      if (result.productDetails) setProductDetails(result.productDetails);
      if (result.suggestedScenes) setSelScenes(result.suggestedScenes);
      // Auto-fill ALL banner fields from analysis
      const bs = result.bannerSuggestions || {};
      setBannerCfg((prev) => ({
        ...prev,
        productName: bs.productName || result.productName || prev.productName,
        productFullDesc: bs.productFullDesc || result.productFullDesc || prev.productFullDesc,
        // Model fields
        modelMood: bs.modelMood || prev.modelMood,
        modelAge: bs.modelAge || prev.modelAge,
        modelGender: bs.modelGender || prev.modelGender,
        modelFeatures: bs.modelFeatures || prev.modelFeatures,
        lightingStyle: bs.lightingStyle || prev.lightingStyle,
        separationTechnique: bs.separationTechnique || prev.separationTechnique,
        modelBrightness: bs.modelBrightness || prev.modelBrightness,
        modelBg: bs.modelBg || prev.modelBg,
        // Content fields
        hookText: bs.hookText || prev.hookText,
        hookBgStyle: bs.hookBgStyle || prev.hookBgStyle,
        headlineText: bs.headlineText || prev.headlineText,
        subText: bs.subText || prev.subText,
        offerLabel: bs.offerLabel || prev.offerLabel,
        productDisplay: bs.productDisplay || prev.productDisplay,
        ctaText: bs.ctaText || prev.ctaText,
        ctaColor: bs.ctaColor || prev.ctaColor,
        badgeType: bs.badgeType || prev.badgeType,
        badgeIcon: bs.badgeIcon || prev.badgeIcon,
        badgeText: bs.badgeText || prev.badgeText,
        badgeColor: bs.badgeColor || prev.badgeColor,
        footerLeft: bs.footerLeft ?? prev.footerLeft,
        footerRight: bs.footerRight ?? prev.footerRight,
        // Style fields
        bgColor: bs.bgColor || prev.bgColor,
        bgPattern: bs.bgPattern || prev.bgPattern,
        patternDetail: bs.patternDetail || prev.patternDetail,
        textureStyle: bs.textureStyle || prev.textureStyle,
        bgMood: bs.bgMood || prev.bgMood,
        overallStyle: bs.overallStyle || prev.overallStyle,
        leftWidth: bs.leftWidth || prev.leftWidth,
        rightWidth: bs.rightWidth || prev.rightWidth,
      }));
      // Reset prompt editor so it regenerates with new values
      setBannerPromptEdit("");
      
      const filledCount = Object.keys(bs).length;
      log(`✅ Phân tích xong: ${result.productName} (${result.productType})`, "success");
      log(`🎨 Banner: đã tự điền ${filledCount} fields (model, background, text, style)`, "success");
      log(`💡 Bạn có thể review & sửa tất cả trong tab ${bannerMode ? "Banner" : "Mockup"}.`, "info");
    } catch (err) {
      log(`❌ Lỗi phân tích: ${err.message}`, "error");
    }
    setAnalyzing(false);
  };

  // ── GENERATE ──
  const startGen = async () => {
    if (!key) return log("Chưa nhập API Key!", "error");
    if (!imgs.length) return log("Chưa upload ảnh!", "error");

    const q = [];
    if (bannerMode) {
      imgs.forEach((img) => {
        const prompt = bannerPromptEdit.trim() || buildBannerPrompt({ ...bannerCfg, bannerSize: BANNER_SIZES.find((s) => s.id === bannerSize)?.label || bannerSize });
        q.push({ id: `${img.id}_banner`, img, label: `Banner — ${bannerCfg.headlineText}`, prompt, isBanner: true });
      });
    } else {
      if (!selScenes.length) return log("Chưa chọn mockup scene!", "error");
      imgs.forEach((img) => {
        selScenes.forEach((sid) => {
          const scene = MOCKUP_SCENES.find((s) => s.id === sid);
          const prompt = buildMockupPrompt(scene, productName, productColor, productDetails);
          q.push({ id: `${img.id}_${sid}`, img, label: scene.label, prompt, sceneId: sid });
        });
      });
    }

    setQueue(q.map((i) => ({ ...i, status: STATUS.IDLE, result: null, error: null })));
    setResults([]); setRunning(true); setTab("generate"); setProg({ c: 0, t: q.length });
    const ctrl = new AbortController(); abortRef.current = ctrl;
    log(`🚀 ${q.length} ${bannerMode ? "banners" : "mockups"} · ${pf.label} · ${model}`);

    const u = q.map((i) => ({ ...i, status: STATUS.IDLE, result: null, error: null }));
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
        setResults((p) => [...p, { id: q[i].id, url, src: q[i].img.name, type: q[i].label, tid: q[i].sceneId || "banner" }]);
        ok++; log(`✅ ${q[i].label}`, "success");
      } catch (err) {
        if (err.name === "AbortError") break;
        u[i] = { ...u[i], status: STATUS.ERROR, error: err.message }; log(`❌ ${err.message}`, "error");
        if (err.message.match(/429|quota|rate/i)) {
          log("⏳ Rate limit — 30s...", "warn"); await new Promise((r) => setTimeout(r, 30000));
          if (ctrl.signal.aborted) break;
          try { const url = await genImage(plat, key, model, b64, q[i].img.mime, prompt, ctrl.signal, size); u[i] = { ...u[i], status: STATUS.SUCCESS, result: url, error: null }; setResults((p) => [...p, { id: q[i].id, url, src: q[i].img.name, type: q[i].label, tid: q[i].sceneId || "banner" }]); ok++; log(`✅ Retry OK`, "success"); } catch (re) { if (re.name === "AbortError") break; log(`❌ ${re.message}`, "error"); }
        }
      }
      setQueue([...u]);
      if (i < q.length - 1 && !ctrl.signal.aborted) await new Promise((r) => setTimeout(r, delay * 1000));
    }
    setRunning(false); log(`🏁 ${ok}/${q.length} thành công.`);
  };

  const dlAll = () => results.forEach((r, i) => setTimeout(() => dl(r.url, `vettailor_${r.tid}_${r.src.replace(/\.[^.]+$/, "")}.png`), i * 400));
  const total = imgs.length * (bannerMode ? 1 : selScenes.length);
  const tabs = [{ id: "setup", l: "Setup", i: "⚙️" }, { id: "upload", l: "Upload", i: "📤" }, { id: "config", l: bannerMode ? "Banner" : "Mockup", i: bannerMode ? "🎯" : "🎨" }, { id: "generate", l: "Generate", i: "🚀" }, { id: "results", l: `Results${results.length ? ` (${results.length})` : ""}`, i: "🖼️" }];

  return (
    <div style={{ fontFamily: "'Segoe UI',-apple-system,system-ui,sans-serif", background: "linear-gradient(145deg,#0a0a15,#111827,#0f172a)", color: "#e2e8f0", minHeight: "100vh" }}>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}*{box-sizing:border-box}::selection{background:#7c3aed;color:#fff}::-webkit-scrollbar{width:6px}::-webkit-scrollbar-thumb{background:#374151;border-radius:3px}.card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:20px;margin-bottom:14px}.inp{background:rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.1);color:#e2e8f0;padding:10px 14px;border-radius:8px;font-size:14px;width:100%;outline:none}.inp:focus{border-color:#7c3aed}.inp::placeholder{color:#4b5563}textarea.inp{resize:vertical;min-height:50px}.btn{border:none;cursor:pointer;font-weight:600;border-radius:8px;font-size:14px;display:inline-flex;align-items:center;gap:6px;transition:all .15s}.btn-p{background:linear-gradient(135deg,#7c3aed,#6d28d9);color:#fff;padding:11px 22px}.btn-p:hover{box-shadow:0 4px 20px rgba(124,58,237,.4)}.btn-p:disabled{opacity:.4;cursor:not-allowed}.btn-s{background:rgba(255,255,255,.07);color:#c0c8d8;border:1px solid rgba(255,255,255,.1);padding:8px 14px;font-size:13px}.btn-s:hover{background:rgba(255,255,255,.12)}.btn-d{background:rgba(220,38,38,.15);color:#fca5a5;border:1px solid rgba(220,38,38,.25);padding:10px 20px}.tab{padding:10px 16px;border:none;cursor:pointer;font-size:13px;font-weight:600;border-radius:10px 10px 0 0;display:flex;align-items:center;gap:6px;background:transparent;color:#64748b;transition:all .2s}.tab:hover{color:#94a3b8}.tab.on{background:rgba(124,58,237,.15);color:#c4b5fd;border-bottom:2px solid #7c3aed}.mcard{border:2px solid rgba(255,255,255,.06);border-radius:12px;padding:12px;cursor:pointer;transition:all .2s;background:rgba(0,0,0,.15)}.mcard:hover{border-color:rgba(124,58,237,.3)}.mcard.on{border-color:#7c3aed;background:rgba(124,58,237,.08)}.pbar{height:5px;background:rgba(255,255,255,.06);border-radius:3px;overflow:hidden}.pfill{height:100%;background:linear-gradient(90deg,#7c3aed,#a78bfa);border-radius:3px;transition:width .4s}.log{padding:3px 0;font-size:12px;font-family:Consolas,monospace;animation:fadeIn .25s}.log-info{color:#94a3b8}.log-success{color:#6ee7b7}.log-error{color:#fca5a5}.log-warn{color:#fcd34d}.rcard{border-radius:12px;overflow:hidden;background:rgba(0,0,0,.25);border:1px solid rgba(255,255,255,.06);transition:all .2s}.rcard:hover{transform:translateY(-3px);box-shadow:0 8px 30px rgba(0,0,0,.4)}.pfb{padding:12px 16px;border-radius:10px;cursor:pointer;border:2px solid rgba(255,255,255,.06);background:rgba(0,0,0,.2);display:flex;align-items:center;gap:10px;width:100%;transition:all .2s}.pfb:hover{border-color:rgba(255,255,255,.15)}.pfb.on{border-color:var(--pc);background:rgba(255,255,255,.04)}.mode-btn{padding:10px 20px;border-radius:8px;cursor:pointer;font-weight:600;font-size:14px;border:2px solid rgba(255,255,255,.1);transition:all .2s;background:rgba(0,0,0,.2);color:#94a3b8}.mode-btn:hover{border-color:rgba(255,255,255,.2)}.mode-btn.on{border-color:#7c3aed;background:rgba(124,58,237,.12);color:#c4b5fd}`}</style>

      <header style={{ padding: "18px 24px 0", borderBottom: "1px solid rgba(255,255,255,.05)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 21, fontWeight: 700, color: "#f1f5f9", display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 26 }}>🎖️</span> Vettailor Mockup Generator</h1>
            <p style={{ margin: "3px 0 0", fontSize: 12, color: "#64748b" }}>CTCO Prompt System · <span style={{ color: pf.color }}>{pf.icon} {pf.label}</span> · {bannerMode ? "🎯 Banner Mode" : "🎨 Mockup Mode"}</p>
          </div>
          {running && <div style={{ textAlign: "right" }}><div style={{ fontSize: 12, color: "#a78bfa", fontWeight: 600, marginBottom: 3 }}>{prog.c}/{prog.t}</div><div className="pbar" style={{ width: 110 }}><div className="pfill" style={{ width: `${prog.t ? (prog.c / prog.t) * 100 : 0}%` }} /></div></div>}
        </div>
        <div style={{ display: "flex", gap: 3, overflowX: "auto" }}>{tabs.map((t) => <button key={t.id} className={`tab ${tab === t.id ? "on" : ""}`} onClick={() => setTab(t.id)}><span>{t.i}</span><span style={{ whiteSpace: "nowrap" }}>{t.l}</span></button>)}</div>
      </header>

      <main style={{ padding: "20px 24px 40px", maxWidth: 960, margin: "0 auto" }}>

        {/* ═══ SETUP ═══ */}
        {tab === "setup" && (<>
          {/* Mode toggle */}
          <div className="card">
            <h3 style={{ margin: "0 0 10px", fontSize: 15, color: "#c4b5fd" }}>🔀 Chế độ</h3>
            <div style={{ display: "flex", gap: 8 }}>
              <button className={`mode-btn ${!bannerMode ? "on" : ""}`} onClick={() => setBannerMode(false)}>🎨 Mockup Generator</button>
              <button className={`mode-btn ${bannerMode ? "on" : ""}`} onClick={() => setBannerMode(true)}>🎯 Banner Generator</button>
            </div>
          </div>

          {/* Platform */}
          <div className="card">
            <h3 style={{ margin: "0 0 10px", fontSize: 15, color: "#c4b5fd" }}>🌐 Nền tảng AI</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {Object.values(PLATFORMS).map((p) => (
                <button key={p.id} className={`pfb ${plat === p.id ? "on" : ""}`} style={{ "--pc": p.color }} onClick={() => setPlat(p.id)}>
                  <span style={{ fontSize: 20, color: p.color, width: 28, textAlign: "center" }}>{p.icon}</span>
                  <div style={{ flex: 1, textAlign: "left" }}><div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{p.label}</div><div style={{ fontSize: 11, color: "#64748b" }}>{p.models.map((m) => m.label).join(" · ")}{!p.supportsImageInput && <span style={{ color: "#fcd34d", marginLeft: 6 }}>⚠ Text-only</span>}</div></div>
                  <div style={{ width: 16, height: 16, borderRadius: "50%", border: `2px solid ${plat === p.id ? p.color : "rgba(255,255,255,.15)"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>{plat === p.id && <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color }} />}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Key + Model + Size */}
          <div className="card">
            <h3 style={{ margin: "0 0 4px", fontSize: 15, color: "#c4b5fd" }}>🔑 API Key & Model</h3>
            <p style={{ margin: "0 0 10px", fontSize: 12, color: "#64748b" }}>{pf.keyHelp} <a href={pf.keyLink} target="_blank" rel="noopener noreferrer" style={{ color: pf.color, textDecoration: "none" }}>↗</a></p>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}><input className="inp" type={showKey ? "text" : "password"} placeholder={pf.keyPlaceholder} value={key} onChange={(e) => setKey(e.target.value)} style={{ flex: 1 }} /><button className="btn btn-s" onClick={() => setShowKey(!showKey)}>{showKey ? "🙈" : "👁️"}</button></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: 4 }}>Model</label>
                <select className="inp" value={model} onChange={(e) => setModel(e.target.value)} style={{ cursor: "pointer" }}>
                  {pf.models.map((m) => <option key={m.id} value={m.id}>{m.label} — {m.detail}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: 4 }}>Kích thước ảnh</label>
                <select className="inp" value={size} onChange={(e) => setSize(e.target.value)} style={{ cursor: "pointer" }}>
                  {pf.sizes.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginTop: 10, display: "flex", gap: 12, alignItems: "center" }}>
              <div><label style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: 3 }}>Delay (s)</label><input className="inp" type="number" min={1} max={30} value={delay} onChange={(e) => setDelay(Math.max(1, +e.target.value))} style={{ width: 70 }} /></div>
            </div>
          </div>
          <button className="btn btn-p" onClick={() => key && setTab("upload")} disabled={!key} style={{ width: "100%" }}>Tiếp → Upload ảnh</button>
        </>)}

        {/* ═══ UPLOAD ═══ */}
        {tab === "upload" && (<>
          <div className="card">
            <h3 style={{ margin: "0 0 12px", fontSize: 15, color: "#c4b5fd" }}>📤 Upload ảnh sản phẩm</h3>
            <div style={{ border: "2px dashed rgba(255,255,255,.12)", borderRadius: 14, padding: 32, textAlign: "center", cursor: "pointer", background: "rgba(0,0,0,.1)" }} onClick={() => fileRef.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); onUpload({ target: { files: e.dataTransfer.files }, value: "" }); }}>
              <div style={{ fontSize: 32, marginBottom: 4 }}>📁</div><div style={{ fontSize: 14, fontWeight: 600, color: "#c0c8d8" }}>Click hoặc kéo thả</div><div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>PNG, JPG, WEBP</div>
              <input ref={fileRef} type="file" accept="image/*" multiple onChange={onUpload} style={{ display: "none" }} />
            </div>
            {imgs.length > 0 && <div style={{ marginTop: 14 }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8" }}>{imgs.length} ảnh</span><button className="btn btn-s" onClick={() => setImgs([])} style={{ fontSize: 11 }}>Xoá hết</button></div><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(85px,1fr))", gap: 6 }}>{imgs.map((img) => <div key={img.id} style={{ position: "relative" }}><img src={img.url} alt="" style={{ width: "100%", height: 85, objectFit: "cover", borderRadius: 8, border: "1px solid rgba(255,255,255,.08)" }} /><button onClick={() => setImgs((p) => p.filter((i) => i.id !== img.id))} style={{ position: "absolute", top: 2, right: 2, width: 18, height: 18, borderRadius: "50%", border: "none", background: "rgba(220,38,38,.8)", color: "#fff", fontSize: 9, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button></div>)}</div></div>}
          </div>

          {/* AI ANALYZE */}
          {imgs.length > 0 && (
            <div className="card" style={{ border: "1px solid rgba(168,139,250,.3)", background: "rgba(124,58,237,.04)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 22 }}>🧠</span>
                <div>
                  <h4 style={{ margin: 0, fontSize: 14, color: "#c4b5fd" }}>AI Product Analyzer</h4>
                  <p style={{ margin: 0, fontSize: 11, color: "#64748b" }}>Gemini phân tích ảnh → tự động gợi ý prompt, nội dung, scene phù hợp</p>
                </div>
              </div>

              {!keys.gemini && (
                <div style={{ padding: "8px 10px", borderRadius: 6, background: "rgba(250,204,21,.08)", border: "1px solid rgba(250,204,21,.15)", marginBottom: 8, fontSize: 11, color: "#fcd34d" }}>
                  ⚠ Cần Gemini API key (free) để dùng tính năng này. Vào Setup → chọn Gemini → nhập key.
                </div>
              )}

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {imgs.map((img) => (
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
                    <div><span style={{ color: "#64748b" }}>Loại:</span> <span style={{ color: "#e2e8f0" }}>{analyzeResult.productType}</span></div>
                    <div><span style={{ color: "#64748b" }}>Màu:</span> <span style={{ color: "#e2e8f0" }}>{analyzeResult.productColor}</span></div>
                    <div><span style={{ color: "#64748b" }}>Audience:</span> <span style={{ color: "#e2e8f0" }}>{analyzeResult.targetAudience}</span></div>
                  </div>
                  <div style={{ marginTop: 6, fontSize: 11, color: "#64748b" }}>
                    Mockup scenes: {analyzeResult.suggestedScenes?.join(", ")}
                  </div>
                  {analyzeResult.bannerSuggestions && (
                    <div style={{ marginTop: 8, padding: "8px 10px", borderRadius: 6, background: "rgba(124,58,237,.08)", border: "1px solid rgba(124,58,237,.15)" }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#c4b5fd", marginBottom: 4 }}>🎯 Banner auto-fill:</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, fontSize: 11 }}>
                        <div><span style={{ color: "#64748b" }}>Model:</span> <span style={{ color: "#94a3b8" }}>{analyzeResult.bannerSuggestions.modelMood} {analyzeResult.bannerSuggestions.modelAge}y {analyzeResult.bannerSuggestions.modelGender}</span></div>
                        <div><span style={{ color: "#64748b" }}>BG:</span> <span style={{ color: "#94a3b8" }}>{analyzeResult.bannerSuggestions.bgColor}</span></div>
                        <div><span style={{ color: "#64748b" }}>Headline:</span> <span style={{ color: "#94a3b8" }}>{analyzeResult.bannerSuggestions.headlineText}</span></div>
                        <div><span style={{ color: "#64748b" }}>Style:</span> <span style={{ color: "#94a3b8" }}>{analyzeResult.bannerSuggestions.overallStyle?.slice(0, 40)}</span></div>
                      </div>
                    </div>
                  )}
                  <div style={{ marginTop: 6, fontSize: 11, color: "#a78bfa" }}>
                    → Đã tự điền TẤT CẢ fields (mockup + banner). Nhấn "Tiếp" để review & sửa.
                  </div>
                </div>
              )}
            </div>
          )}

          <button className="btn btn-p" onClick={() => imgs.length && setTab("config")} disabled={!imgs.length} style={{ width: "100%" }}>Tiếp → {bannerMode ? "Cấu hình Banner" : "Chọn Mockup"}</button>
        </>)}

        {/* ═══ CONFIG — MOCKUP MODE ═══ */}
        {tab === "config" && !bannerMode && (<>
          <div className="card">
            <h3 style={{ margin: "0 0 8px", fontSize: 15, color: "#c4b5fd" }}>📝 Thông tin sản phẩm (dùng cho prompt CTCO)</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Field label="Tên sản phẩm" value={productName} onChange={setProductName} placeholder="veteran-themed graphic hat" />
              <Field label="Màu sắc" value={productColor} onChange={setProductColor} placeholder="black and camo" />
            </div>
            <Field label="Chi tiết sản phẩm (embroidery, patch, print...)" value={productDetails} onChange={setProductDetails} placeholder="Bold eagle emblem on front, flag patch on side..." rows={2} />
          </div>

          <div className="card">
            <h3 style={{ margin: "0 0 10px", fontSize: 15, color: "#c4b5fd" }}>🎨 Chọn scene mockup (CTCO)</h3>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
              <button className="btn btn-s" onClick={() => setSelScenes(["on_model_male", "patriotic_portrait", "lifestyle_bbq", "closeup"])} style={{ fontSize: 12 }}>⚡ Quick (4)</button>
              <button className="btn btn-s" onClick={() => setSelScenes(MOCKUP_SCENES.map((s) => s.id))} style={{ fontSize: 12 }}>🎯 Full (12)</button>
              <button className="btn btn-s" onClick={() => setSelScenes(["on_model_male", "closeup", "white_bg", "ugc_review"])} style={{ fontSize: 12 }}>🛒 E-com (4)</button>
              <button className="btn btn-s" onClick={() => setSelScenes(["patriotic_portrait", "motorcycle_biker", "lifestyle_bbq", "lifestyle_outdoor", "ugc_review"])} style={{ fontSize: 12 }}>📱 Social (5)</button>
              <button className="btn btn-s" onClick={() => setSelScenes(["gift_unboxing", "on_model_female", "patriotic_portrait", "ugc_review"])} style={{ fontSize: 12 }}>🎁 Gift (4)</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {MOCKUP_SCENES.map((s) => (
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
              <span style={{ fontSize: 13, color: "#94a3b8" }}>{imgs.length} ảnh × {selScenes.length} scenes = </span><strong style={{ color: "#c4b5fd" }}>{total} mockups</strong>
              <span style={{ fontSize: 12, color: "#64748b", marginLeft: 8 }}>~{Math.ceil((total * (delay + 5)) / 60)} phút</span>
            </div>
            {selScenes.length > 0 && (
              <div className="card" style={{ marginTop: 12, border: "1px solid rgba(168,139,250,.25)" }}>
                <h4 style={{ margin: "0 0 6px", fontSize: 13, color: "#a78bfa" }}>👁️ Preview prompt cho từng scene</h4>
                <div style={{ fontSize: 11, color: "#64748b", marginBottom: 8 }}>Đây là prompt sẽ được gửi tới AI. Kiểm tra trước khi generate.</div>
                {selScenes.map((sid) => { const sc = MOCKUP_SCENES.find((s) => s.id === sid); if (!sc) return null; const p = buildMockupPrompt(sc, productName, productColor, productDetails); return (
                  <details key={sid} style={{ marginBottom: 6 }}>
                    <summary style={{ cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#c4b5fd", padding: "6px 0" }}>{sc.icon} {sc.label}</summary>
                    <div style={{ padding: "8px 10px", background: "rgba(0,0,0,.2)", borderRadius: 6, fontSize: 11, color: "#94a3b8", lineHeight: 1.5, fontFamily: "Consolas, monospace", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{p}</div>
                  </details>
                ); })}
              </div>
            )}
          </div>
          <button className="btn btn-p" onClick={startGen} disabled={running || !total} style={{ width: "100%" }}>🚀 Generate {total} mockups</button>
        </>)}

        {/* ═══ CONFIG — BANNER MODE ═══ */}
        {tab === "config" && bannerMode && (<>
          <div className="card">
            <h3 style={{ margin: "0 0 10px", fontSize: 15, color: "#c4b5fd" }}>🎯 Banner Generator — CTCO Prompt</h3>

            <label style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: 4 }}>Preset phong cách</label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
              {BANNER_PRESETS.map((p) => <button key={p.id} className="btn btn-s" onClick={() => setBannerPreset(p.id)} style={{ fontSize: 12, background: bannerPreset === p.id ? "rgba(124,58,237,.2)" : undefined, borderColor: bannerPreset === p.id ? "rgba(124,58,237,.4)" : undefined, color: bannerPreset === p.id ? "#c4b5fd" : undefined }}>{p.label}</button>)}
            </div>

            <label style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: 4 }}>Kích thước banner</label>
            <select className="inp" value={bannerSize} onChange={(e) => setBannerSize(e.target.value)} style={{ marginBottom: 14, cursor: "pointer" }}>
              {BANNER_SIZES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>

          {/* LEFT HALF — Model & Product */}
          <div className="card">
            <h4 style={{ margin: "0 0 8px", fontSize: 13, color: "#a78bfa" }}>👤 Left Half — Model & Product</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <Field label="Left width" value={bannerCfg.leftWidth} onChange={(v) => updateBanner("leftWidth", v)} placeholder="45%" />
              <Field label="Model mood" value={bannerCfg.modelMood} onChange={(v) => updateBanner("modelMood", v)} placeholder="confident and proud" />
              <Field label="Model age" value={bannerCfg.modelAge} onChange={(v) => updateBanner("modelAge", v)} placeholder="45" />
              <Field label="Model gender" value={bannerCfg.modelGender} onChange={(v) => updateBanner("modelGender", v)} placeholder="male" />
            </div>
            <Field label="Model features (ngoại hình)" value={bannerCfg.modelFeatures} onChange={(v) => updateBanner("modelFeatures", v)} placeholder="strong athletic build, short cropped hair" />
            <div style={{ padding: "8px 10px", borderRadius: 6, background: "rgba(220,38,38,.08)", border: "1px solid rgba(220,38,38,.2)", marginBottom: 8, fontSize: 11, color: "#fca5a5" }}>
              ⚠️ QUAN TRỌNG: Mô tả đầy đủ quần áo model mặc (bao gồm áo/quần), không chỉ sản phẩm bán. Nếu chỉ ghi "hat" → AI sẽ tạo người cởi trần đội mũ.
            </div>
            <Field label="Product full description — MÔ TẢ ĐẦY ĐỦ trang phục model mặc" value={bannerCfg.productFullDesc} onChange={(v) => updateBanner("productFullDesc", v)} placeholder="VD: a black Navy veteran graphic t-shirt with eagle emblem on chest, fitted dark jeans, brown leather belt, AND a black Navy veteran embroidered cap on head" rows={3} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <Field label="Lighting style" value={bannerCfg.lightingStyle} onChange={(v) => updateBanner("lightingStyle", v)} />
              <Field label="Separation technique" value={bannerCfg.separationTechnique} onChange={(v) => updateBanner("separationTechnique", v)} />
              <Field label="Model brightness" value={bannerCfg.modelBrightness} onChange={(v) => updateBanner("modelBrightness", v)} />
              <Field label="Model background" value={bannerCfg.modelBg} onChange={(v) => updateBanner("modelBg", v)} />
            </div>
          </div>

          {/* RIGHT HALF — Text & CTA */}
          <div className="card">
            <h4 style={{ margin: "0 0 8px", fontSize: 13, color: "#a78bfa" }}>📝 Right Half — Text & CTA</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <Field label="Right width" value={bannerCfg.rightWidth} onChange={(v) => updateBanner("rightWidth", v)} placeholder="55%" />
              <Field label="Hook BG style" value={bannerCfg.hookBgStyle} onChange={(v) => updateBanner("hookBgStyle", v)} />
              <Field label="Hook text (top small)" value={bannerCfg.hookText} onChange={(v) => updateBanner("hookText", v)} />
              <Field label="Headline (largest text)" value={bannerCfg.headlineText} onChange={(v) => updateBanner("headlineText", v)} />
              <Field label="Sub text" value={bannerCfg.subText} onChange={(v) => updateBanner("subText", v)} />
              <Field label="Offer label (pill)" value={bannerCfg.offerLabel} onChange={(v) => updateBanner("offerLabel", v)} />
            </div>
            <Field label="Product name (hiện trong box)" value={bannerCfg.productName} onChange={(v) => updateBanner("productName", v)} placeholder="Eagle Veteran T-Shirt" />
            <Field label="Product display (cách hiện SP)" value={bannerCfg.productDisplay} onChange={(v) => updateBanner("productDisplay", v)} placeholder="front-facing product shot" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <Field label="Badge type" value={bannerCfg.badgeType} onChange={(v) => updateBanner("badgeType", v)} />
              <Field label="Badge icon" value={bannerCfg.badgeIcon} onChange={(v) => updateBanner("badgeIcon", v)} />
              <Field label="Badge text" value={bannerCfg.badgeText} onChange={(v) => updateBanner("badgeText", v)} />
              <Field label="Badge color" value={bannerCfg.badgeColor} onChange={(v) => updateBanner("badgeColor", v)} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <Field label="CTA color" value={bannerCfg.ctaColor} onChange={(v) => updateBanner("ctaColor", v)} />
              <Field label="CTA text" value={bannerCfg.ctaText} onChange={(v) => updateBanner("ctaText", v)} />
              <Field label="Footer left (tuỳ chọn)" value={bannerCfg.footerLeft} onChange={(v) => updateBanner("footerLeft", v)} placeholder="YourStore.com" />
              <Field label="Footer right (tuỳ chọn)" value={bannerCfg.footerRight} onChange={(v) => updateBanner("footerRight", v)} placeholder="Free Shipping" />
            </div>
          </div>

          {/* Background & Style */}
          <div className="card">
            <h4 style={{ margin: "0 0 8px", fontSize: 13, color: "#a78bfa" }}>🎨 Background & Style</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <Field label="BG color" value={bannerCfg.bgColor} onChange={(v) => updateBanner("bgColor", v)} />
              <Field label="BG pattern" value={bannerCfg.bgPattern} onChange={(v) => updateBanner("bgPattern", v)} />
              <Field label="Pattern detail" value={bannerCfg.patternDetail} onChange={(v) => updateBanner("patternDetail", v)} />
              <Field label="Texture style" value={bannerCfg.textureStyle} onChange={(v) => updateBanner("textureStyle", v)} />
              <Field label="BG mood" value={bannerCfg.bgMood} onChange={(v) => updateBanner("bgMood", v)} />
              <Field label="Overall style" value={bannerCfg.overallStyle} onChange={(v) => updateBanner("overallStyle", v)} />
            </div>
          </div>

          {/* PROMPT — ALWAYS VISIBLE & EDITABLE */}
          <div className="card" style={{ border: "1px solid rgba(168,139,250,.25)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <h4 style={{ margin: 0, fontSize: 14, color: "#a78bfa" }}>✏️ Final Prompt — Sửa trực tiếp trước khi generate</h4>
              <button className="btn btn-s" onClick={() => { setBannerPromptEdit(buildBannerPrompt({ ...bannerCfg, bannerSize: BANNER_SIZES.find((s) => s.id === bannerSize)?.label || bannerSize })); }} style={{ fontSize: 11 }}>🔄 Reset từ form</button>
            </div>
            <div style={{ padding: "8px 10px", borderRadius: 6, background: "rgba(250,204,21,.06)", border: "1px solid rgba(250,204,21,.15)", marginBottom: 8, fontSize: 11, color: "#fcd34d" }}>
              💡 Prompt bên dưới sẽ được gửi trực tiếp tới AI. Bạn có thể sửa bất kỳ chỗ nào — thêm/bớt chi tiết, đổi mô tả, v.v.
            </div>
            <textarea className="inp" value={bannerPromptEdit || buildBannerPrompt({ ...bannerCfg, bannerSize: BANNER_SIZES.find((s) => s.id === bannerSize)?.label || bannerSize })} onChange={(e) => setBannerPromptEdit(e.target.value)} rows={10} style={{ fontSize: 12, lineHeight: 1.6, fontFamily: "Consolas, monospace" }} />
          </div>

          <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(124,58,237,.06)", border: "1px solid rgba(124,58,237,.12)", marginBottom: 14 }}>
            <strong style={{ color: "#c4b5fd" }}>{imgs.length} banner{imgs.length > 1 ? "s" : ""}</strong>
            <span style={{ fontSize: 12, color: "#64748b", marginLeft: 8 }}>~{Math.ceil((imgs.length * (delay + 5)) / 60)} phút</span>
          </div>
          <button className="btn btn-p" onClick={startGen} disabled={running || !imgs.length} style={{ width: "100%" }}>🎯 Generate {imgs.length} Banner{imgs.length > 1 ? "s" : ""}</button>
        </>)}

        {/* ═══ GENERATE ═══ */}
        {tab === "generate" && (<>
          <div className="card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 15, color: "#c4b5fd" }}>{running ? "⚡ Generating..." : "📋 Queue"}</h3>
              {running && <button className="btn btn-d" onClick={() => abortRef.current?.abort()}>⏹ Dừng</button>}
            </div>
            {prog.t > 0 && <div style={{ marginBottom: 14 }}><div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginBottom: 3 }}><span>Tiến độ</span><span>{Math.round((prog.c / prog.t) * 100)}%</span></div><div className="pbar"><div className="pfill" style={{ width: `${(prog.c / prog.t) * 100}%` }} /></div></div>}
            <div style={{ maxHeight: 260, overflowY: "auto" }}>{queue.map((q) => <div key={q.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,.03)" }}><img src={q.img.url} alt="" style={{ width: 34, height: 34, objectFit: "cover", borderRadius: 6 }} /><div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 12, fontWeight: 500, color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{q.img.name} → {q.label}</div>{q.error && <div style={{ fontSize: 10, color: "#fca5a5", marginTop: 1 }}>{q.error}</div>}</div><Badge status={q.status} /></div>)}</div>
          </div>
          <div className="card"><h4 style={{ margin: "0 0 6px", fontSize: 13, color: "#94a3b8" }}>📝 Logs</h4><div style={{ maxHeight: 180, overflowY: "auto", background: "rgba(0,0,0,.25)", borderRadius: 8, padding: 10, fontFamily: "Consolas,monospace" }}>{logs.length === 0 ? <div style={{ fontSize: 11, color: "#374151" }}>...</div> : logs.map((l, i) => <div key={i} className={`log log-${l.type}`}><span style={{ color: "#374151" }}>[{l.t}]</span> {l.msg}</div>)}<div ref={logEnd} /></div></div>
          {!running && results.length > 0 && <button className="btn btn-p" onClick={() => setTab("results")} style={{ width: "100%" }}>Xem {results.length} kết quả →</button>}
        </>)}

        {/* ═══ RESULTS ═══ */}
        {tab === "results" && (<>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}><h3 style={{ margin: 0, fontSize: 15, color: "#c4b5fd" }}>🖼️ {results.length} {bannerMode ? "banners" : "mockups"}</h3>{results.length > 0 && <button className="btn btn-p" onClick={dlAll} style={{ padding: "8px 16px", fontSize: 13 }}>⬇️ Download all</button>}</div>
          {!results.length ? <div className="card" style={{ textAlign: "center", padding: 40 }}><div style={{ fontSize: 34, marginBottom: 6 }}>🎨</div><div style={{ fontSize: 13, color: "#64748b" }}>Chưa có kết quả</div></div>
          : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 14 }}>{results.map((r) => <div key={r.id} className="rcard"><img src={r.url} alt="" style={{ width: "100%", height: 200, objectFit: "cover", display: "block" }} /><div style={{ padding: 10 }}><div style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0" }}>{r.type}</div><div style={{ fontSize: 10, color: "#64748b", marginTop: 1 }}>{r.src}</div><button className="btn btn-s" onClick={() => dl(r.url, `vettailor_${r.tid}_${r.src.replace(/\.[^.]+$/, "")}.png`)} style={{ width: "100%", marginTop: 8, fontSize: 11, padding: "6px", justifyContent: "center" }}>⬇️ Download</button></div></div>)}</div>}
        </>)}
      </main>
    </div>
  );
}
