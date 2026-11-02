# PRD: Sleep-Safe Root Volume Clip

Ryann Owen and Norah McDowell

## Pitch

A satin-tipped root clip you can sleep in, so you wake up with lifted roots instead of reaching for a hot tool.

## Problem

People who wash their hair at night lose their root volume while they sleep, and nothing made for lifting roots is safe to sleep in.

Today they put in a claw clip for a few hours after the shower, then take it out before bed. Sleeping in a regular claw clip hurts the head and pulls at the roots (the founder has tried it). By morning the roots are flatter than they were when the clip came out, so they re-wet their hair or diffuse it with heat. That costs time every morning and adds heat damage.

The problem is common and frequent. In our Instagram survey, 54 of 66 people (82%) said their hair looks flat at least a few times a week, and 30 (45%) said almost every day.

Today's fixes cost time, cause damage, or are skipped entirely:

| What they do now for volume | Respondents |
| --- | --- |
| Heat tools (curling iron, blow dryer) | 22 (33%) |
| Nothing | 22 (33%) |
| Dry shampoo | 9 (14%) |
| Volumizing products | 8 (12%) |
| Sleep in a braid or bun | 3 (5%) |
| Heatless curlers | 2 (3%) |

Only 5 of 66 use anything overnight. Existing root clips are made to be worn for about 20 minutes, not a whole night.

## The bet

We bet that the night is an unclaimed slot for root volume: root clips are daytime tools, and sleep-in tools only make curls.

- **Opportunity:** 82% of respondents get flat roots weekly, a third fix it with heat, and none of the root clips we found are designed to be slept in. Sleep-in satin tools already sell well: the Kitsch heatless curling set has over 4,000 reviews at about $16.
- **Strategy:** compete on comfort and hair safety overnight, not on lift strength. Launch to the segment with the highest interest (women with medium-to-long, fine-to-medium, straight or wavy hair), price at $15, and sell through Instagram, where we already reached 66 respondents in two days.
- **Solution:** one comb-style clip worn at the front of the head, with satin-tipped rounded prongs and a slider that adjusts prong spacing for different hair textures.

**How it fits our strategy:** ENT 401 judges ideas on intensity, frequency, and density. This idea scores high on density (82% have the problem) and frequency (67% would use it at least a few nights a week). Intensity is moderate, with an average interest of 3.0 out of 5, so the prototype test has to show that the clip turns mild interest into purchases.

## Users

The launch user is a woman with medium-to-long, fine-to-medium hair, straight or wavy, who wakes up with flat roots most days. The survey changed this: we started with wavy and curly hair, but straight hair turned out to be the strongest segment.

| Segment | Respondents | Interest 4–5 out of 5 |
| --- | --- | --- |
| Straight hair | 40 | 16 (40%) |
| Wavy hair | 16 | 5 (31%) |
| Curly hair | 10 | 2 (20%) |
| Long hair | 35 | 17 (49%) |
| Medium hair | 13 | 4 (31%) |
| Short hair | 18 | 2 (11%) |

Straight hair also has the most frequent problem: 26 of 40 (65%) say it looks flat almost every day, compared with 2 of 16 wavy and 2 of 10 curly. Women were far more interested than men (21 of 51 versus 2 of 15). The goal is still every hair type, so curly hair stays in testing.

## Goals and metrics

We have three goals: prove the clip keeps volume overnight without pain or damage, prove people will pay $15, and prove they keep using it.

| Metric | Target | How we measure | Phase |
| --- | --- | --- | --- |
| Morning root volume | 7 of 10 testers rate it the same as or better than right after removing a regular clip | Night and morning photos plus a 1–5 rating | Prototype test |
| Comfort | Average 4 out of 5 or higher; at most 1 in 10 woken by the clip | Morning survey | Prototype test |
| Hair damage | Zero testers with hair pulled out, broken, or clamped | Check the clip and hair each morning | Prototype test |
| Dents or creases | At most 2 of 10 testers see a visible dent | Morning photo | Prototype test |
| Works across hair types | Volume and comfort targets met by at least 2 straight, 2 wavy, and 1 curly tester | Results split by hair type | Prototype test |
| Purchase intent | 6 of 10 testers would buy at $15 | Final tester survey | Prototype test |
| Conversion | 5% of Instagram landing-page visitors preorder | Landing-page analytics | Launch |
| Repeat use | Buyers use it 3 or more nights a week | Follow-up survey at 2 weeks | Launch |
| Net Promoter Score | 40 or higher | Follow-up survey at 2 weeks | Launch |
| Returns | Under 10% | Order records | Launch |

The 3-nights-a-week target comes from the survey, where 44 of 66 (67%) said they would use the clip a few nights a week or every night. Launch targets are our proposals and will be revised after the prototype test.

## Risks and assumptions

The biggest risks are the survey's top three buying worries: comfort, whether it works on their hair, and dents.

| Risk or assumption | Probability | Consequence if wrong | Mitigation |
| --- | --- | --- | --- |
| Uncomfortable to sleep in (top worry for 46 of 66) | Medium | High: the core promise fails | Rounded satin tips, front-of-head placement, light spring; founder tests 3 nights first |
| Doesn't work on my hair (41 of 66) | Medium | High: low sales and returns | Spacing slider; test on straight, wavy, and curly hair; show results by hair type |
| Leaves a dent or crease (34 of 66) | Medium | Medium: users go back to heat tools | Wide, rounded prongs with satin; a dent check is a test case |
| $15 is too high (28 of 64 would pay at most $10) | High | Medium: smaller market | Test $12 and $15 on the landing page |
| Satin slows drying or loosens the grip on damp hair | Medium | Medium: less lift, clip falls out | Satin on the tips only; test on damp hair |
| Clip falls out overnight | Medium | Medium: no volume by morning | Test side sleeping; adjust grip and spring |
| Survey skews toward young students in our own network (53 of 66 aged 18–25) | High | Medium: demand is overstated | Recruit testers outside our circles; track real preorders |
| Slider or satin wears out with nightly use | Medium | Low | Durability check after 5 nights |

The key assumption behind the whole bet is that people want root volume enough to sleep in a clip. Only 5 of 66 sleep in anything today, so the prototype test must confirm this.

## Core flow, design, and architecture

One clip, worn at the front of the head, goes in after the shower and comes out in the morning.

1. Shower at night and towel-dry to damp.
2. Set prong spacing with the slider to match hair texture (usually once, then as needed).
3. Put on the satin tips for night use.
4. Comb the clip into the roots at the front of the head so it lifts them.
5. Sleep on back or side.
6. Take the clip out in the morning; roots stay lifted, with no re-wetting or diffusing.

Day two: same steps on dry hair to keep volume from the last wash. Daytime: the plain plastic clip without satin tips.

**Architecture:** the clip has five parts.

| Part | Material | What it does |
| --- | --- | --- |
| Body and hinge | Matte plastic (PLA for the prototype) | Holds the clip together |
| Spring | Steel, lighter tension than a regular claw clip | Grips without clamping |
| Prongs | Comb-style, rounded ends | Lift the roots |
| Spacing slider | Plastic, on the outside of the clip | Sets prong spacing for hair texture |
| Tip caps | Polyester satin, removable and washable | Let hair glide, protect the scalp |

**Designs:** the concept sketch shows the clip from the front and how it sits on the head. The AI-generated visual and the fit and spacing guide by hair type will be added here once made.

*Concept sketch (front view, and side view on the head): see the online version of this PRD.*

Only the satin caps touch the scalp, and the slider moves the prongs closer together or further apart for different hair textures.

## Requirements

The must-haves cover safety on damp hair overnight and the survey's top worries; daytime use can slip.

| Requirement | Priority | Source |
| --- | --- | --- |
| Single comb-style clip worn at the front of the head | Must | Interviews |
| Lifts roots on damp and dry hair | Must | Interviews |
| Satin-tipped prongs with rounded ends that do not dig into the scalp | Must | Founder test; survey comfort worry |
| Holds overnight without clamping, pulling, or snagging hair | Must | Interviews |
| Comfortable when lying on back or side | Must | Survey comfort worry |
| Leaves no visible dent or crease | Must | Survey (new) |
| Works on straight hair | Must | Survey (raised from Should) |
| Slider to adjust prong spacing for hair texture | Must | Survey "works on my hair" worry |
| Satin tips removable and washable | Must | Interviews |
| Retail price of $15 | Must | Survey price data |
| Usable without satin tips as a daytime clip | Should | Partner idea |
| Physical prototype: modified clip with satin tip caps | Must (class) | ENT 401 |
| AI-made visual of the clip plus a fit and spacing guide | Must (class) | ENT 401 |

## Out of scope (what we're skipping)

- Heating or cooling features
- Motors or any powered parts
- Sets of multiple clips; v1 is one item
- Placement at the back of the head
- Hair styling products such as root-lift sprays

## Design research

Every root clip we found is a short daytime tool, and every sleep-in tool makes curls, not root lift. Nobody owns overnight root volume.

| Product | Price | How it works | What we learn |
| --- | --- | --- | --- |
| [Conair Volumizing Root Clips](https://www.walmart.com/ip/5209903994) | 2-pack | Self-grip rollers, left in at least 20 minutes | The retailer notes they can get stuck in long hair or overnight. That is exactly the gap our satin tips address. |
| [Kitsch Volumizing Roller Clips and Fillimilli pins](https://www.newbeauty.com/view/hair-volumizing-clip) | $6–8 | Daytime clips, left in 15 minutes or more; popular on TikTok | Cheap clips set the price ceiling, so $15 needs the overnight benefit to justify it. |
| [Bounce Curl Volume Root Clips](https://www.bouncecurl.com/en-ca/products/volume-root-hair-clips) | $28 | Plastic body and steel spring, placed in damp hair, then air-dried or diffused; marketed to wavy, curly, and coily hair | Curly buyers will pay more for root clips on damp hair, and 80 of 91 reviews are five stars. Still not made for sleeping. |
| [Kitsch Satin Heatless Curling Set](https://www.walmart.com/ip/1357308615) | About $16 | Satin foam rod worn overnight for heatless curls | 4.4 stars from over 4,100 reviews shows people pay about $15 to style while they sleep, and that satin signals "safe for hair." |

Our design borrows the satin and sleep-in idea from heatless curlers and the root-lift shape from root clips.

## User feedback

We collected 66 responses to an Instagram survey on October 14–15, 2026, on top of earlier interviews with about 10 classmates. Respondents were mostly women (51), aged 18–25 (53), and students (39). The feedback changed the PRD in six specific ways:

| What we heard | Evidence | Change we made |
| --- | --- | --- |
| Straight hair goes flat most often and is most interested | 26 of 40 flat almost every day; 16 of 40 rated interest 4–5 | Straight hair moved from Should to Must; launch user now includes straight hair |
| Comfort is the biggest worry | 46 of 66 | Comfort is the first test case; founder tests 3 nights before others |
| People doubt it will work on their hair | 41 of 66 | Spacing slider stays a Must; tests split by hair type |
| People fear a dent or crease | 34 of 66 | New Must requirement and test case for no visible dent |
| Most will pay $10–15 | 53 of 64 named $10 or $15; 18 of the 23 most interested would pay $15 or more | Price set at $15, with $12 tested as a fallback |
| Short hair is barely interested | 2 of 18 rated interest 4–5 | Marketing focuses on medium-to-long hair; short hair is not excluded |

Earlier interviews drove the satin tips: the founder slept in a regular claw clip, and it hurt her head and roots.

## Data and integrations

This is a physical product with no software integrations; the data is customer evidence and test results.

- **Founder experience:** washing every other night; sleeping in a regular claw clip hurt her head and roots
- **Partner and classmates:** about 10 conversations in ENT 401, including people with straight hair
- **Survey:** 66 responses on Instagram, October 14–15, 2026 (see User feedback)
- **Overnight tests:** morning photos and ratings from testers (see below)
- **Digital prototype:** AI-generated visual of the clip and a fit and spacing guide, as the class requires

## Open questions

- [ ] How do the satin tips attach: sewn caps, glued caps, or one removable sleeve?
- [ ] Does satin slow drying at the roots or loosen the clip's grip overnight?
- [ ] What prong spacing does each hair texture need, and what range should the slider cover?
- [ ] Does it work on curly hair, the least interested segment in the survey?
- [ ] Is daytime use (no satin) part of v1 or a later extension?
- [ ] $15 or $12: which price converts better on the landing page?
- [ ] Does demand hold outside our own Instagram network?
- [ ] Prototype deadline?

## Test plan and release monitoring

We validate with a 5-night test on 10 testers, then watch the launch weekly against the metrics above.

**Setup:**

1. Build 2 to 3 prototypes: a comb-style claw clip with sewn or glued satin caps on the prong tips.
2. The founder sleeps in it for 3 nights first and fixes obvious problems.
3. Recruit 10 testers: at least 4 straight, 3 wavy, and 2 curly, with some from outside our own network.
4. Each night, testers put the clip in damp or day-two hair and photograph their roots. Each morning, they photograph again before touching their hair and answer a short survey.

**Test cases:**

| ID | Test case | Pass |
| --- | --- | --- |
| T1 | Comfort on back and side | Average 4 out of 5 or higher; at most 1 woken by the clip |
| T2 | Morning root volume | 7 of 10 rate it same or better than after a regular clip |
| T3 | No hair damage | Zero hairs pulled out or broken |
| T4 | No dent or crease | At most 2 of 10 see a dent in the morning photo |
| T5 | Stays in overnight | Clip in place for 9 of 10 testers |
| T6 | Works on damp hair with satin tips | Hair dries at the roots and T2 passes on damp nights |
| T7 | Works across hair types | T1–T4 pass within each hair type |
| T8 | Durability | Slider and satin caps intact after 5 nights |
| T9 | Purchase intent | 6 of 10 would buy at $15 |

**Monitoring the release:** after launch on Instagram, we check weekly: landing-page conversion at $15 versus $12, preorders, repeat use and NPS from a 2-week follow-up survey, returns, and reviews that mention pain, dents, or broken hair. If returns pass 10% or more than 1 in 10 reviews mention pain or damage, we pause sales and redesign the tips or spring.
