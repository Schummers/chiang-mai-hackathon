# Cultural norms and etiquette in Northern Thailand (Lanna)

Context data for **Contextual Translate** (Claude Impact Labs, Chiang Mai, 2026-09-26).
Machine-readable version: `cultural_norms.json` (32 entries: topic, norm, do[], dont[], why, northern_specific, translation_implication, source, confidence, optional needs_expert_review).

> Framing rule for the app: describe norms as what *many* people do or believe. Practice varies between city and village, between generations, and between ethnic and religious communities. Most everyday politeness is shared across Thailand, so Lanna-specific points are marked **[N]**.

---

## 1. The five rules that matter most for translation

1. **"Yes" often means "I heard you".** A nod, a smile or a bare polite particle (khrap / kha / jao) is acknowledgement, not agreement. Refusals come as excuses, "maybe later", a change of topic or silence. The app should not render these as "Yes, I agree". It should flag possible polite refusals. *(Cultural Atlas; Ambele & Boonsuk 2018; PLOS GPH 2023 on kreng jai / arr-nar)*
2. **Soften outgoing refusals, complaints and corrections.** Blunt English → face-saving Thai: regret, reason, thanks, particle. Praise in public, correct in private. *(face / sia na)*
3. **Always add a politeness particle.** Use Central Thai khrap (male) or kha (female). **[N]** Kham Mueang uses **jao** (เจ้า). Sources disagree on whether men use jao: Wikipedia lists it as the female form (male = khap), while local usage reports suggest all genders use it. **Expert to rule.**
4. **Replace "you" with a kinship term** chosen by estimated age: phi (older), nong (younger), lung / pa (a parent's generation). **[N]** u-i (อุ๊ย) is for the generation above that: po-u-i / pho-u-i (ป้ออุ๊ย, elderly man) and mae-u-i (แม่อุ๊ย, elderly woman). Back-translate these as "you (respectful)" rather than literal "uncle/grandma".
5. **Some topics are hazardous.** Monarchy criticism or jokes carry legal risk under Section 112 (3 to 15 years per count, foreigners have been prosecuted). Also flag politics, questions about income or land, and citizenship or ID status (sensitive for some highland people) before translating.

## 2. Core values (pan-Thai, with Northern ethnography)

| Concept | Meaning | App behaviour |
|---|---|---|
| **Kreng jai** | Considerate restraint: not imposing, deferring to seniors, polite refusal. Literally "fear/awe-heart". | Flag hedges as a possible "no". Soften requests to elders. |
| **Na / sia na (face)** | Dignity and reputation. Losing face comes from public criticism, shouting or correction. | Offer face-saving phrasings. |
| **Jai yen** | "Cool heart", calm composure. Cassaniti's ethnography in Mae Jaeng, Chiang Mai province, shows it as a central local ideal. **[N]** | Tone down angry input and add a calm note. |
| **Mai pen rai** / **[N]** bo pen yang | Never mind, you're welcome, no problem. | Translate by context. |
| **Sanuk** | Fun and enjoyment in everyday life and work. Humour can ease awkwardness. | Don't read laughter as mockery. |

## 3. Body and space

- **Wai:** the junior person usually initiates. Hand height rises with respect (chest for peers, chin/nose for elders, forehead for monks). Return a wai when one is offered. Don't initiate a wai to children, and a smile or nod is fine for service staff.
- **Head high, feet low:** don't touch heads, including children's. Don't point feet or soles at people, monks, Buddha images or spirit houses. Sit with feet tucked. Don't step over people or food.
- **Gestures:** beckon palm-down. Use an open hand, not a pointing finger. Pass things with the right hand or both hands, and never toss money.
- **Monks:** women should not touch a monk or hand anything to one directly; use a cloth or tray, or a male intermediary. No one touches monks. Lower yourself when offering something. Monks don't return a wai.
- **[N] Lanna temple restrictions:** some temples bar women from certain areas (e.g. Wat Sri Suphan's ubosot, and areas at Wat Chedi Luang), rooted in older Lanna beliefs about protective objects buried under sacred ground. The practice is local and debated among Thais. Explain it neutrally.

## 4. Places and situations

- **Temples:** cover shoulders and knees, take shoes off, speak quietly, keep feet away from Buddha images, and don't climb on or pose disrespectfully with images.
- **Homes:** shoes off, step over the threshold (not on it), greet the oldest person first, and respect the spirit house or ancestral shrine. A small food gift is welcome. Don't expect gifts to be opened in front of you.
- **Eating:** spoon in the right hand, fork in the left to push food onto it. Share dishes using serving spoons. **[N]** Sticky rice is eaten by hand, rolled into small balls to scoop dips. **[N] Khantoke:** communal floor dining around a low round tray, so posture rules apply.
- **Markets:** bargaining is expected at night bazaars and souvenir stalls, with a smile, and only if you mean to buy. Don't bargain in malls, shops with posted prices, for street food, or with small produce sellers and highland traders over trivial sums. *(Low confidence: travel-blog sourcing. Don't present discount percentages as rules.)*
- **Tipping:** optional. Check for a 10% service charge. Small change at local restaurants, around 50-100 THB/hour for massage, nothing at street stalls. *(low confidence)*
- **Alcohol:** nationwide sales bans on Makha Bucha, Visakha Bucha, Asahna Bucha, Khao Phansa and Ok Phansa. Exemptions for hotels, licensed venues and airports were proposed in 2025 (confirm they were gazetted). General sales hours are now 11:00-24:00 (Royal Gazette, late May 2026, per [TAT](https://www.tatnews.org/2026/05/alcohol-sales-and-consumption-rules-updated-in-thailand-what-tourists-need-to-know/)); the old 14:00-17:00 afternoon ban no longer applies. *(Corrected by verifier 2026-09-26.)*
- **Royal institution:** stand still for the national anthem at 08:00 and 18:00 in public. Treat royal images (and banknotes) with care. Never generate monarchy commentary.
- **PDA and emotion:** avoid public affection, especially in villages and temples. Visible anger backfires.

## 5. Highland communities and photography [N]

- **Use self-designations:** Akha (not "Kaw/Ekaw"), Hmong (not "Meo/Miao"), Karen and its sub-groups S'gaw and Pwo ("Kariang" and "Yang" are exonyms), Lahu, Lisu, Mien, Lua/Lawa. If incoming text contains an exonym, translate it but annotate it, and never output one. The umbrella term 'hill tribe' (*chao khao*) is regarded as derogatory by IWGIA and indigenous-rights advocates ([Wikipedia](https://en.wikipedia.org/wiki/Hill_tribe_(Thailand))); prefer the group's own name.
- **Village conduct:** dress modestly, shoes off indoors, drink little or nothing, keep it quiet after about 10 pm, and follow the host's cues. In Akha villages, the carved gate marks the boundary between the human world and the spirit world. Don't play at it or photograph it without asking, and the tall swing is ritual, not play equipment. Many community members are Christian or Buddhist, so beliefs differ between villages.
- **Photography:** always ask first. Some villagers request a small fee (one Akha village charged 10 THB). Ask a parent before photographing children, and never photograph ceremonies without permission. Research shows villagers act as active agents in tourism, not passive subjects.
- **Avoid in small talk:** citizenship, ID or legal status, land, income.

## 6. Beliefs, often called "superstitions", framed respectfully [N]

- Many Khon Mueang households combine Theravada Buddhism with spirit beliefs: ancestral spirits (**phi pu ya**), village and temple guardian spirits, and the Chiang Mai city pillar (**Inthakhin**). Spirit houses receive daily offerings. Don't touch or take offerings.
- **Khwan:** vital essences in the body. **Su khwan / riak khwan** ceremonies call the khwan back and tie white cotton string (sai sin) around the wrist. Lanna healing rituals are often used *alongside* hospital care (Suwipa Champawan 2024). Accept a string graciously, and don't cut it off in front of the person who tied it.
- **Tai Tham script** tattoos and amulets are believed by some to hold protective power.
- **Dam hua** (Songkran / Pi Mai Mueang): pouring scented water over elders' hands to ask forgiveness and blessing. It is a gentle rite, not a water fight.
- App rule: write "many people believe…". Don't label these as "superstition" in output.

## 7. Language register [N]

- Kham Mueang is identity-laden and soft-spoken. Elders and rural people use it most, and some younger urban people prefer Central Thai. Visitors' greetings in Kham Mueang (sawatdi jao) are usually welcomed. Choose the register from the profile card, with Central Thai as the fallback.
- **Tones:** Northern Thai has six tones on open or sonorant-final syllables (per Wikipedia) and fewer on stop-final syllables. Its tone categories and some initials differ from Central Thai, so mark romanised Kham Mueang as approximate unless native-verified. Full detail is in `lanna-language.md` and `sound_correspondences.json`, written by other agents.

## 8. Lanna vs Bangkok

Northern social life is often described as slower-paced and softer-spoken, with a strong Lanna identity (language, script, sticky rice, khantoke, spirit cults). Historically, female authority was strong in the household: the house belonged to the woman, and grooms often married into the wife's family (Dr. Vithi Phanichphant, via Thai Enquirer). Everyday politeness (wai, face, head/feet, particles) is largely shared with Central Thailand. Don't overclaim differences.

---

## Sources (opened)

**Academic / research**
- PLOS Global Public Health (2023), kreng-jai / arr-nar norms: https://journals.plos.org/globalpublichealth/article?id=10.1371%2Fjournal.pgph.0001875
- Ambele & Boonsuk (2018), *Arab World English Journal*, silence and face in Thai politeness: https://files.eric.ed.gov/fulltext/EJ1311224.pdf
- Review of Cassaniti, *Living Buddhism* (Cornell UP 2015), jai yen in Mae Jaeng: https://medanthro.net/bookreview/review-of-living-buddhism-mind-self-and-emotion-in-a/
- Suwipa Champawan (2024), *Journal of Thai Studies*, Lanna healing and riak khwan rituals: https://so04.tci-thaijo.org/index.php/TSDJ/article/view/269648
- Ethnic Tourism in Northern Thailand: Viewpoints of the Akha and the Karen (ResearchGate): https://www.researchgate.net/publication/301659188_Ethnic_Tourism_in_Northern_Thailand_Viewpoints_of_the_Akha_and_the_Karen

**Reference**
- Cultural Atlas (Thai etiquette, communication, core concepts): https://theculturalatlas.org/thai-culture/thai-culture-etiquette · https://theculturalatlas.org/thai-culture/thai-culture-communication · https://theculturalatlas.org/thai-culture/thai-culture-core-concepts
- Wikipedia: Northern Thai language; Northern Thai people; Lèse-majesté in Thailand; Thai National Anthem; Akha people; Hmong people; Karen people; Tai folk religion; Sanuk

**News / regional**
- Khaosod English (2025), alcohol ban and exemptions: https://www.khaosodenglish.com/tourism/2025/03/04/thailand-keeps-buddhist-holiday-alcohol-ban-adds-tourism-exemptions/
- Nation Thailand, "gin khao reu yang": https://www.nationthailand.com/life/art-culture/40050932
- Thai Enquirer, Lanna women and pha sin: https://www.thaienquirer.com/18429/the-lanna-woman-and-pa-sin-tin-jok/
- Chiang Mai Citylife, Kham Mueang decline: https://chiangmaicitylife.com/citylife-articles/rip-kham-mueang-the-slow-death-of-a-language
- Chiang Rai Times (wai, tipping, Wat Sri Suphan sign): https://www.chiangraitimes.com/travel-guide/wai-etiquette-in-thailand/ · https://www.chiangraitimes.com/travel-guide/tipping-in-thailand/ · https://www.chiangraitimes.com/chiang-mai/chiang-mai-temple-sign-sparks-debate/

**Lower authority (marked low/medium)**
- teeneelanna.com, Kham Mueang community blog on อุ๊ย: https://teeneelanna.com/moojoomhao/home/space.php?uid=1&do=blog&id=1698
- Centara hotels, Kham Mueang phrases: https://www.centarahotelsresorts.com/journal/northern-thai-language-oo-kam-mueang
- lannakingdom.com (Lanna Creative): https://lannakingdom.com/culture
- amazingthailand.com (not TAT), monks: https://amazingthailand.com/don-t-touch-monks
- Green Trails, village code of conduct: https://www.green-trails.com/our-code-of-conduct-for-village-visits/
- Thai Holiday Guide, gestures: https://www.thaiholidayguide.com/thai-gestures-body-language/
- Chiang Mai Small House cooking school, table manners: https://thaicookingchiangmai.com/thai-etiquette-table-manners/
- The Longest Way Home, bargaining (travel blog): https://www.thelongestwayhome.com/travel-guides/thailand/how-to-bargain-for-souvenirs-deals-thailand.html

**Not reachable:** tourismthailand.org dos-and-don'ts (404). The GOV.UK local-laws page had no monarchy content. The Wikipedia "Hill tribes of Thailand" and Thai Wiktionary pages were cache-blocked.
