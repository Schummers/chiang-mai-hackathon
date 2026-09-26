# Northern Thailand: Agricultural & Seasonal Food Calendar

Context data for Contextual Translate (market and food conversations). Machine-readable data is in `seasonal_produce.json` (68 items, `months` = 1-12) and `northern_dishes.json` (37 dishes). Each entry has `source` and `confidence`. **Low-confidence items need expert review before you rely on them.**

## How to use in the context packet
- Filter `seasonal_produce.json` by the current month (`months` contains M). Use `peak_months` to pick 3-6 "what's in the market now" items, and pass them with `northern_dishes`.
- A cultural note can say what is in season, what dish it goes into, and any Kham Mueang name (e.g. cha-om = *phak la*; het pho = *het thop*).
- An item with an empty `months` array has no verified season. Don't claim seasonality for it.

## The three seasons (food view)
| Season | Approx. months | Market signature |
|---|---|---|
| Cool / dry | Nov-Feb | New sticky rice, tangerines, strawberries (Samoeng, peaking at the festival around 14 Feb), coffee cherry picking (Nov-Feb), makhwaen harvest (Nov-Dec), bamboo worms (rot duan, Nov-Feb). Cha-om is scarce and expensive (Nov-Jan). |
| Hot / dry | Feb/Mar-May | Red ant eggs (khai mot daeng) and wild phak wan (Feb-May). Mango (Mar-Jul), watermelon, dried kapok flower collection (from Feb). Khai river weed harvested on the Mekong at Chiang Khong (Feb-Apr). Oolong first flush (Mar-Apr). Burning and haze season. |
| Rainy | May-Oct | Het thop / het pho earthstar mushrooms at the first rains (May-Jun), then termite mushrooms (het khon) and boletes. Phak kut fern, cha-om at its most plentiful, bamboo shoots. Lychee (mid-May to mid-Jun), longan (late Jun to late Aug), persimmon on Doi Inthanon (late Jul-Sep), avocado (Jul-Dec). |

## Rice cycle (Chiang Mai)
Plough in May-Jun once rain allows standing water. Seedlings spend 3-6 weeks in the nursery, then are transplanted in Jul-Aug. Harvest comes in Sep-Oct as the fields dry, and later varieties run into Nov-Dec. Glutinous rice is the Northern staple (source: chiangmai1.com). New-crop sticky rice (ข้าวเหนียวใหม่) is a natural small-talk topic after the harvest. *Month precision for new rice: medium.*

## Month-by-month quick list (high/medium items)
- **Jan**: tangerine, strawberry, jujube, guava (peak), tamarind, coffee picking, rot duan
- **Feb**: strawberry (Samoeng festival), red ant eggs begin, phak wan pa begins, kapok flowers, khai river weed, watermelon
- **Mar**: red ant eggs, phak wan pa, mango begins, khai river weed, oolong first flush
- **Apr**: mango, red ant eggs, phak wan, pineapple, durian (trucked in), Songkran feasts (kaeng khanun, hang le)
- **May**: het thop / het pho (first rains), lychee (mid-May), mango, rambutan, mangosteen, cha-om abundance starts
- **Jun**: het thop, lychee (to mid-Jun), longan starts (late Jun), termite mushrooms and het tap tao, phak kut, rice nursery
- **Jul**: longan (peak), persimmon starts, avocado starts, langsat, custard apple, rice transplanting
- **Aug**: longan (peak), persimmon, avocado, bamboo shoots, forest mushrooms, pomelo, dragon fruit
- **Sep**: persimmon (festival in late Sep), avocado, custard apple, langsat, rice harvest begins
- **Oct**: avocado, pomelo, tangerine starts, termite mushrooms (some species), rice harvest
- **Nov**: tangerine (peak), makhwaen harvest, coffee picking starts, new rice, strawberries start
- **Dec**: tangerine, strawberry, makhwaen, rose apple (peak), new rice, rot duan

## The team's two story cases
- **Phak kut (ผักกูด), the vegetable fern** (*Diplazium esculentum*): curled fronds that grow along streams and wet ground, most plentiful in the rainy season. Eaten as yam phak kut (a fern salad, sometimes with coconut cream), blanched with nam phrik, in an omelette, or in kaeng som. *Confidence: medium.* The source says "rainy season" but gives no months.
- **Cha-om (ชะอม), acacia shoots** (*Senegalia/Acacia pennata*): the Kham Mueang name is **phak la** (CMU gives the romanization; the Thai spelling ผักหละ still needs expert confirmation). Cha-om is sold all year but flushes in the rainy season. It is scarce and costs more in Nov-Jan. Khai chiao cha-om (the cha-om omelette) is national rather than specifically Lanna. Typical Northern uses are kaeng phak cha-om / kaeng phak la, kaeng khae, kaeng khanun, kaeng no mai and kaeng het lom. It has a strong smell and thorny stems, which makes a good cultural-note hook.

## Culturally sensitive or useful notes
- **Het thop and burning:** many people believe forest fires raise earthstar mushroom yields, and fires are set for that reason. Wikipedia says there is no evidence that burning increases yield. This is a charged topic during haze season, so keep notes neutral.
- **Raw dishes** (larb dip, lu, raw blood dishes): they are a cultural staple, and there are known public-health warnings about them. Offer the cooked version (*larb khua*) as a polite option.
- **Tai Yai (Shan) and Chin Haw (Yunnanese Muslim) influence:** nam ngiao, khao kan jin and thua nao are Tai Yai. Khao soi is linked to Chin Haw cooks, and hang le is Burmese-derived. Use each group's self-designation.
- **Auspicious dishes:** kaeng khanun (the jackfruit name suggests support and prosperity) is served at weddings and New Year. Kaeng hang le and nam ngiao are served at festive banquets. Kaeng ho is traditionally made from the leftovers after a feast.
- **Khai vs khai nam (don't confuse them):** *khai* (ไก/ไค) is green Mekong and Nan river weed (*Cladophora*) harvested Feb-Apr. *Khai nam* / *pham* (ผำ) is Wolffia, the tiny floating "water-meal" used in khua pham.
- **"Farang"** means both guava and Westerner, a common friendly joke at fruit stalls.

## Where things are sold (Chiang Mai)
- Ton Lamyai flower and fruit market (open 24h): fruit
- Warorot / Kad Luang: nam phrik num and ong, sai ua, khaep mu to take away
- Chiang Mai Gate market: het thop in season
- Village morning markets: forest greens, insects, mushrooms
- Royal Project shops: highland strawberries, persimmons, avocado, grapes, cape gooseberry

## Key sources
- Chiang Mai University Library, Northern Thai Information Center, Lanna Food database: https://lannainfo.library.cmu.ac.th/en_lannafood/classify_food.php (200+ dishes, used heavily)
- FAO: longan https://www.fao.org/4/x6908e/x6908e0d.htm, lychee https://www.fao.org/4/ac684e/ac684e0c.htm, avocado https://www.fao.org/4/x6902e/x6902e0b.htm
- Kasetsart farmers' library (cha-om season); Technology Chaoban / Khaosod (phak kut)
- Austin Bush (phak wan and red ant eggs); SEA Junction (khai river weed); MDPI Agriculture (makhwaen)
- Royal Project market site; Thailand Foundation fruit guide; Sansaket fruit calendar; Chang Puak Magazine

## Needs expert review (summary)
- Thai spellings of Kham Mueang forms: ผักหละ, แก๋งผักหละ, จิ๊นส้ม, แกงโฮะ vs แกงโฮ, หลู้, ไข่ป่าม, แอ็บ, ขั่วผำ, ไก (river weed)
- Species IDs of het lom, het khai and "phak khae" (Piper sarmentosum per Wikipedia)
- Months for bamboo shoots, garlic, nam pu, pu na, maeng da, maeng man, phak chiang da, phak hueat, jo phak kat greens
- "Ma kor" savoury fruit (Aug-Sep): Thai name and species
- Pomelo season: sources disagree (Jul vs Sep-Nov)
