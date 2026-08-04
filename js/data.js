const portfolioData = {
  projects: [
    { id:1, cat:"real-estate", title:"Real Estate Reel", client:"Property Co.", retention:"72%", views:"180K+", delivery:"24h", goal:"Boost listing engagement", result:"3x more inquiries" },
    { id:2, cat:"ugc", title:"UGC Product Ad", client:"Beauty Brand", retention:"68%", views:"95K+", delivery:"12h", goal:"Drive product purchases", result:"$4.2 ROAS" },
    { id:3, cat:"reels", title:"Personal Brand Reel", client:"Coach & Speaker", retention:"81%", views:"240K+", delivery:"48h", goal:"Grow Instagram following", result:"+12K followers" },
    { id:4, cat:"youtube", title:"YouTube Long-Form", client:"Tech Channel", retention:"55%", views:"60K+", delivery:"5 days", goal:"Increase watch time", result:"+40% watch time" },
    { id:5, cat:"reels", title:"Restaurant Reel", client:"Cairo Restaurant", retention:"74%", views:"120K+", delivery:"24h", goal:"Drive foot traffic", result:"Weekend fully booked" },
    { id:6, cat:"ugc", title:"E-commerce Ad", client:"Fashion Brand", retention:"70%", views:"85K+", delivery:"18h", goal:"Lower CAC", result:"CAC down 35%" },
    { id:6, cat:"reels", title:"E-commerce Ad", client:"Fashion Brand", retention:"70%", views:"85K+", delivery:"18h", goal:"Lower CAC", result:"CAC down 35%" },
  ],

  services: [
    { icon:"🎬", title:"Short Form Editing", desc:"Reels, TikToks, Shorts that stop the scroll and keep viewers watching to the end." },
    { icon:"🏠", title:"Real Estate Reels", desc:"Property videos that turn views into inquiries — cinematic, fast-paced, results-driven." },
    { icon:"📱", title:"UGC Ads", desc:"Native-feeling ads that blend into the feed and convert viewers into buyers." },
    { icon:"✨", title:"Motion Graphics", desc:"Text animations, transitions, lower thirds — polish that elevates every frame." },
    { icon:"▶", title:"YouTube Editing", desc:"Long-form content edited for maximum watch time, engagement, and retention." },
    { icon:"🎙", title:"Podcast Editing", desc:"Video podcasts edited with clean cuts, B-roll, and branded graphics." },
  ],

  process: [
    { step:"01", title:"Receive Footage", desc:"You send raw clips via Google Drive, WeTransfer, or any platform." },
    { step:"02", title:"Script Review", desc:"You send raw clips via Google Drive, WeTransfer, or any platform." },
    { step:"03", title:"Rough Cut", desc:"I review your brief, hook strategy, and target audience before cutting." },
    { step:"04", title:"Color correction & Grading", desc:"First assembly with pacing, structure, and story arc established." },
    { step:"05", title:"B-Roll & Effects", desc:"Add B-roll, transitions, text overlays, and motion graphics." },
    { step:"06", title:"Sound Design", desc:"Music selection, SFX layering, voice cleanup, and audio mastering." },
    { step:"07", title:"Final Delivery", desc:"Export in the format you need + revision rounds included." },
  ],

  pricing: [
    { type:"Reels", price:"$20", unit:"per video", features:["Subtitles included","Music & SFX","1 revision round","24h delivery"] },
    { type:"UGC Ads", price:"$40", unit:"per video", features:["Hook variations","B-roll integration","2 revision rounds","48h delivery"], featured:true },
    { type:"YouTube", price:"$80", unit:"per video", features:["Long-form editing","Chapters & cards","Thumbnail guide","5 day delivery"] },
  ],

  testimonials: [
    { name:"Sarah K.", role:"Real Estate Agent", text:"Ahmed delivered a reel that got 180K views in 3 days. Our listings literally sold faster after that.", avatar:"SK" },
    { name:"Mohamed A.", role:"Brand Owner", text:"Best investment I made. The UGC ad he edited has a 4.2 ROAS — still running after 2 months.", avatar:"MA" },
    { name:"Lena V.", role:"Content Creator", text:"Fast, professional, and he actually understands retention psychology. My views doubled in 2 weeks.", avatar:"LV" },
    { name:"Abdullah A.", role:"Engeiner", text:"Fast, professional, and he actually understands retention psychology. My views doubled in 2 weeks.", avatar:"AA" },
  ],

  faq: [
    // { q:"How fast do you deliver?", a:"Reels within 24h, UGC Ads within 48h, YouTube within 5 business days. Rush delivery available." },
    // { q:"Can you edit Arabic & English videos?", a:"Yes! I work in both Arabic and English with Arabic subtitles, lower thirds, and native text styles." },
    // { q:"Do you provide subtitles?", a:"Subtitles are included in all packages — auto-generated, then manually checked for accuracy." },
    // { q:"How many revisions do I get?", a:"All packages include at least 1 revision round. UGC and YouTube packages include 2 rounds." },
    // { q:"What do you need from me?", a:"Raw footage, a brief with goals and reference examples, and any branding assets (logo, colors, fonts)." },
  ]
};
