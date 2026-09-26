# Contextual Translate

A translator that explains, designed for both people in a food conversation at a Chiang Mai market or restaurant. This glossary fixes the words the team uses for people, turns and the cards that link the conversation to local context.

## People and conversation

**Visitor**:
The newcomer who owns the phone, speaks their own language and asks about food.
_Avoid_: user, nomad, foreigner, "you" (outside code)

**Vendor**:
The Thai person who receives the phone and answers by voice, at a stall or in a restaurant.
_Avoid_: seller, local, Thai user

**Turn**:
One spoken message from either the Visitor or the Vendor, shown as one bubble with its translation (big) and original (small).
_Avoid_: message (in design talk), utterance

**My info**:
The Visitor's saved allergies, spice tolerance and diet, sent with every Turn.
_Avoid_: profile, preferences, profile card

**Memory**:
A short verbatim from a good exchange that the Visitor chooses to keep; the visible form of a real cultural exchange.
_Avoid_: history, log, saved chat

## Local context

**Context Pack**:
The curated body of Northern Thai knowledge (dishes, produce, Kham Mueang words, seasons, festivals, markets), where every fact carries a source and a confidence.
_Avoid_: dataset, knowledge base, Lanna context

**Trusted entry**:
A Context Pack entry with `high` or `medium` confidence; only Trusted entries can appear on a card.
_Avoid_: verified fact (nothing is native-reviewed yet)

**Mention**:
Something named in a Turn, by either side, that matches a Trusted entry of the Context Pack.
_Avoid_: entity, keyword, detection

**Kham Mueang**:
The spoken Northern Thai language; used to understand the Vendor and as an optional icebreaker, never as a translation target.
_Avoid_: Lanna (which names the script and the culture), Northern dialect

**Central Thai**:
The only language the app translates into for the Vendor.
_Avoid_: Thai (when the distinction with Kham Mueang matters)

## Cards

**Context Card**:
An informative, full-width card attached to a Turn that explains one Mention, with content copied from the Context Pack, never written by the model; at most one per Turn, none when there is no Mention.
_Avoid_: info card, tooltip, suggestion, follow-up question

**Card Type**:
The kind of Mention a Context Card explains: Dish, Word or Moment. When a Turn holds several Mentions, the order of precedence is Dish with an Allergy Flag, then Dish, then Word, then Moment.
_Avoid_: category

**Dish card**:
A Context Card for a dish or ingredient: what it is, main meat, spice level, and an Allergy Flag when My info calls for one.
_Avoid_: food card, menu card

**Word card**:
A Context Card for a Kham Mueang word or false friend heard in the conversation, with its meaning in Central Thai and in the Visitor's language.
_Avoid_: dictionary card, translation card

**Moment card**:
A Context Card for what makes today particular: the season, the weather or a festival.
_Avoid_: event card, season card

**Local detail**:
The single line on every Context Card that anchors it in Chiang Mai (when it is eaten, how it is eaten here, what locals say about it), meant to make the Visitor want to ask more.
_Avoid_: fun fact, tip, cultural note

**Allergy Flag**:
A warning on a Dish card that a Mention may conflict with My info; always a risk to check with the Vendor, never a guarantee.
_Avoid_: allergy alert, safe/unsafe label
