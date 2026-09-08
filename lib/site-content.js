import { createSupabaseServerClient } from "@/lib/supabase/server";

const FALLBACK_BLOCKS = {
  home_hero: {
    section_key: "home_hero",
    eyebrow: "Welcome Home",
    title: "Jesus-centered. Spirit-led. Family-minded.",
    body: "A place to know Jesus, grow in His Word, and walk together as a church family.",
    media_url: "https://www.golibertychurch.com/assets/hero_vids/worship_hero.mp4",
    media_type: "video",
    image_alt: "Liberty Church worship",
    cta_label: "Plan Your Visit",
    cta_url: "/visit",
  },
  home_pastor: {
    section_key: "home_pastor",
    eyebrow: "Meet Our Pastor",
    title: "Pastor Andrew Stokes",
    body: "Pastor Andrew Stokes has led our church family since October 2013. He and his wife, Erin, our worship leader, serve side by side with their daughters, Ellington and Emery, who are active in media and worship. Though both Andrew and Erin are bi-vocational, their hearts are fully committed to the church God has entrusted to their care. They long for Liberty Church to be a place where everyone can approach the throne of God freely and give Him the praise He deserves. Pastor Andrew teaches the Word with the guidance of the Holy Spirit, encouraging every person, member and guest alike, to pursue Christ wholeheartedly, just as He passionately pursues us.",
    image_url: "https://www.golibertychurch.com/assets/Pastor%26Fam.jpg",
    image_alt: "Pastor Andrew Stokes and family",
  },
  home_discover: {
    section_key: "home_discover",
    eyebrow: "Learn More",
    title: "Discover Liberty Church",
    body: "Explore what we believe, plan your visit, and see how your family can get involved right away.",
    cta_label: "Learn More About Our Church",
    cta_url: "/beliefs",
  },
};

export async function getPublicSiteContentBlocks() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return FALLBACK_BLOCKS;
  }

  const { data, error } = await supabase
    .from("site_content_blocks")
    .select("section_key, eyebrow, title, body, image_url, image_alt, media_url, media_type, cta_label, cta_url, sort_order")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  if (error || !Array.isArray(data)) {
    return FALLBACK_BLOCKS;
  }

  const blocks = { ...FALLBACK_BLOCKS };
  for (const item of data) {
    const key = String(item?.section_key || "").trim();
    if (!key) continue;
    blocks[key] = { ...(blocks[key] || {}), ...item };
  }
  return blocks;
}
