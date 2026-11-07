// Mock data for the DreamLift Root Volume Clip prototype.
// All copy, numbers and options live here. No functions, no logic.
window.MOCK = {
  product: {
    name: "DreamLift Root Volume Clip",
    pitch: "A satin-tipped root clip you can sleep in, so you wake up with lifted roots instead of reaching for a hot tool.",
    problem: "Roots go flat overnight, and nothing made for lifting roots is safe to sleep in."
  },

  prices: {
    currency: "USD",
    price: 12
  },

  evidence: [
    {
      stat: "82%",
      text: "say their hair looks flat at least a few times a week",
      source: "Instagram survey, 66 responses, Oct 2026"
    },
    {
      stat: "67%",
      text: "would use a sleep-in root clip a few nights a week or every night",
      source: "Instagram survey, 66 responses, Oct 2026"
    }
  ],

  // Why DreamLift: the problem and the fix, as short points.
  problemPoints: [
    "Roots go flat while you sleep, especially after a night wash.",
    "A regular claw clip hurts to sleep in and pulls at the roots.",
    "So mornings mean re-wetting or heat: more time, more heat damage.",
    "Root clips are made for about 20 minutes, not a whole night."
  ],
  fixPoints: [
    "Made to sleep in: rounded prongs, and only the satin tips touch your scalp.",
    "Lifts your front roots overnight, on damp or dry hair.",
    "One slider sets the spacing for straight, wavy, curly or coily hair."
  ],

  // How it works: the night routine as short captions (full steps are in modes).
  quickSteps: [
    "Towel-dry to damp",
    "Set the slider for your hair",
    "Put on the satin tips",
    "Comb it into your front roots",
    "Sleep on your back or side",
    "Take it out in the morning"
  ],

  parts: [
    {
      id: "body",
      name: "Body and hinge",
      material: "Matte plastic (PLA for the prototype)",
      job: "Holds the clip together"
    },
    {
      id: "spring",
      name: "Spring",
      material: "Steel, lighter tension than a regular claw clip",
      job: "Grips without clamping"
    },
    {
      id: "prongs",
      name: "Prongs",
      material: "Comb-style, rounded ends",
      job: "Lift the roots"
    },
    {
      id: "slider",
      name: "Spacing slider",
      material: "Plastic, on the outside of the clip",
      job: "Sets prong spacing for hair texture"
    },
    {
      id: "caps",
      name: "Tip caps",
      material: "Polyester satin, removable and washable",
      job: "Let hair glide, protect the scalp"
    }
  ],

  worries: [
    {
      id: "comfort",
      question: "Will it be comfortable to sleep in?",
      answer: "It's designed to be, on your back or side: rounded satin tips and a light spring. Only the satin touches your scalp."
    },
    {
      id: "fit",
      question: "Will it work on my hair?",
      answer: "It's designed for straight, wavy, curly and coily hair. The slider moves the prongs closer together or further apart to suit yours."
    },
    {
      id: "dent",
      question: "Will it leave a dent or crease?",
      answer: "It's designed to avoid dents, with wide, rounded prongs and satin tips that let hair glide."
    }
  ],

  guide: {
    textures: ["straight", "wavy", "curly", "coily"],
    thicknesses: ["fine", "medium", "thick"],
    levels: ["narrow", "medium", "wide"],
    baseByTexture: { straight: "narrow", wavy: "medium", curly: "wide", coily: "wide" },
    thicknessShift: { fine: -1, medium: 0, thick: 1 },
    levelText: {
      narrow: "Slide the prongs close together. Closer prongs catch more strands at the root.",
      medium: "Set the slider in the middle, a balance between grip and room for your hair.",
      wide: "Slide the prongs further apart, so there's room for more hair between them."
    }
  },

  modes: [
    {
      id: "wash-night",
      label: "Night after washing",
      summary: "After a night wash, on damp hair.",
      hair: "damp",
      satin: true,
      steps: [
        "Shower at night and towel-dry your hair until it's damp.",
        "Set the prong spacing with the slider to match your hair texture. You usually do this once, then only as needed.",
        "Put on the satin tips for night use.",
        "Comb the clip into the roots at the front of your head so it lifts them.",
        "Sleep on your back or side.",
        "Take the clip out in the morning. Your roots stay lifted, with no re-wetting or diffusing."
      ]
    },
    {
      id: "day-two",
      label: "Day two (night)",
      summary: "Same steps on dry hair, to keep the volume from your last wash.",
      hair: "dry",
      satin: true,
      steps: [
        "Start with dry hair from your last wash. No need to wet it.",
        "Set the prong spacing with the slider to match your hair texture, if it isn't set already.",
        "Put on the satin tips for night use.",
        "Comb the clip into the roots at the front of your head so it lifts them.",
        "Sleep on your back or side.",
        "Take the clip out in the morning to keep the volume from your last wash."
      ]
    },
    {
      id: "daytime",
      label: "Daytime",
      summary: "The plain clip, satin tips off, on dry hair.",
      hair: "dry",
      satin: false,
      steps: [
        "Set the prong spacing with the slider to match your hair texture.",
        "Leave the satin tips off. In the daytime it's the plain plastic clip.",
        "Comb the clip into the roots at the front of your head."
      ]
    }
  ],

  copy: {
    banner: "Prototype. Preorders are not real: nothing is charged, sent or saved.",
    emailError: "Please enter a valid email, like name@example.com.",
    thanks: "Thanks for preordering at {price}. This is a prototype, so nothing was charged, sent or saved.",
    ui: {
      routeHomeTitle: "Home",
      routeWhyTitle: "Why DreamLift",
      routeHowTitle: "How it works",
      routeGuideTitle: "Fit guide",
      routePreorderTitle: "Preorder",
      routeThanksTitle: "Thanks",

      // Home
      tagline: "Sleep in it. Wake up with lifted roots, whatever your hair type.",
      heroCta: "Preorder",
      guideLink: "Find your slider setting",
      hairTypesHeading: "Designed for every hair type",
      hairTypesNote: "One slider sets the prong spacing for your hair.",
      hairSpacing_narrow: "Narrow spacing",
      hairSpacing_medium: "Medium spacing",
      hairSpacing_wide: "Wide spacing",
      clip3dLabel: "Turn it, slide the knob, or see it on a model in your hair type.",
      clip3dTitle: "Interactive 3D model of the clip",
      ctaBarLabel: "Preorder the clip",

      // Why DreamLift
      problemHeading: "The problem",
      evidenceHeading: "What our survey found",
      fixHeading: "How DreamLift fixes it",
      howLink: "See how it works",

      // How it works
      howIntro: "One clip at the front of your head. In after the shower, out in the morning.",
      nightHeading: "Your night routine",
      modesHeading: "Three ways to wear it",
      partsHeading: "Five parts",
      clipAlt: "Front view of one root clip: comb-style prongs with rounded satin tips, a spring and hinge at the top, and a spacing slider on the outside.",
      clipCaption: "One clip, worn at the front of the head. Only the satin tips touch the scalp.",
      worriesHeading: "Your top questions",

      priceNote: "One clip, satin tips included.",

      guideHeading: "Fit and spacing guide",
      guideIntro: "Pick your hair and how you'll wear it. We'll show your slider setting and the steps.",
      textureLabel: "Hair texture",
      thicknessLabel: "Hair thickness",
      modeLabel: "How you'll use it",
      resultHeading: "Your slider setting",
      resultPrompt: "Pick your hair texture and thickness to see your slider setting.",
      stepsHeading: "Steps",
      satinOn: "Satin tips on",
      satinOff: "Satin tips off",
      hairDamp: "Damp hair",
      hairDry: "Dry hair",

      preorderHeading: "Preorder the clip",
      emailLabel: "Email",
      emailPlaceholder: "name@example.com",
      preorderButton: "Preorder",

      thanksHeading: "Thanks for your preorder",
      backHome: "Back to home",

      validationHeading: "The prototype data has problems",

      texture_straight: "Straight",
      texture_wavy: "Wavy",
      texture_curly: "Curly",
      texture_coily: "Coily",
      thickness_fine: "Fine",
      thickness_medium: "Medium",
      thickness_thick: "Thick",
      level_narrow: "Narrow",
      level_medium: "Medium",
      level_wide: "Wide"
    }
  }
};
