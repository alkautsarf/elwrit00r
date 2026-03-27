export interface Lesson {
  id: string;
  level: number;
  title: string;
  concept: string;
  example: string;
  exerciseType: "fix" | "write" | "choose" | "cut";
  exercisePrompt: string;
  exerciseText: string;
  feedbackPrompt: string;
}

export interface Level {
  name: string;
  lessons: Lesson[];
}

export const LEVELS: Level[] = [
  {
    name: "Grammar & Punctuation",
    lessons: [
      {
        id: "l0-1",
        level: 0,
        title: "Periods",
        concept: `A period ends a complete thought. One thought per sentence.

If your sentence has two ideas connected by "and", split it. Two short sentences are almost always clearer than one long one.

The period is the most powerful punctuation mark. It forces you to commit to a single idea and move on.`,
        example: `**Bad:**
"I started cooking last year and it was harder than I expected but eventually I got the hang of it and now I cook every day."

**Good:**
"I started cooking last year. It was harder than I expected. Eventually I got the hang of it. Now I cook every day."

The good version has four clear thoughts. Each one lands before the next begins.`,
        exerciseType: "fix",
        exercisePrompt: `Rewrite this run-on sentence as multiple short sentences:

"I moved to a new city last month and everything was unfamiliar but I found a good coffee shop near my apartment and the people there were friendly and now it feels like home."`,
        exerciseText: `I moved to a new city last month and everything was unfamiliar but I found a good coffee shop near my apartment and the people there were friendly and now it feels like home.`,
        feedbackPrompt: `Evaluate if the user split a run-on sentence into clear, short sentences. Check: each sentence has one complete thought, no run-ons with "and" chains, periods used correctly. Be encouraging but specific about what they got right and what could improve.`,
      },
      {
        id: "l0-2",
        level: 0,
        title: "Commas",
        concept: `A comma is a pause, not a breath. Don't add one just because the sentence feels long.

Three main uses:
1. **Lists** — "Ghostty, tmux, and Neovim" (the last comma before "and" is the Oxford comma — always use it)
2. **After introductory phrases** — "After switching to Neovim, I never looked back"
3. **Joining two sentences with and/but** — "I write in the terminal, but I browse with qutebrowser"

If you're unsure whether a comma belongs, read the sentence without it. If it still makes sense, you probably don't need it.`,
        example: `**Bad:**
"The park is quiet, and peaceful, it makes you, feel calm, nothing else."

**Good:**
"The park is quiet and peaceful. It makes you feel calm, nothing else."

The bad version scatters commas everywhere. The good version uses one comma (before "nothing else" — a natural pause) and splits the two ideas with a period.`,
        exerciseType: "fix",
        exercisePrompt: `Fix the comma usage in this paragraph. Remove unnecessary commas and add missing ones:

"When I started running I could barely do a mile. I needed everything, shoes socks a water bottle and a playlist that I updated constantly. Then one morning, I left my phone at home and everything changed."`,
        exerciseText: `When I started running I could barely do a mile. I needed everything, shoes socks a water bottle and a playlist that I updated constantly. Then one morning, I left my phone at home and everything changed.`,
        feedbackPrompt: `Evaluate comma usage. Check: comma after "When I started running" (introductory clause), Oxford commas in the list "shoes, socks, a water bottle, and a playlist", "Then one morning" comma is correct. Be specific about each comma decision.`,
      },
      {
        id: "l0-3",
        level: 0,
        title: "Semicolons & Colons",
        concept: `**Semicolons** connect two related sentences that could stand alone but are closely linked.

"The terminal is honest; it shows exactly what's happening."

Both halves are complete sentences. The semicolon says "these ideas are partners."

**Colons** introduce something — a list, an explanation, or an elaboration.

"I need three things every morning: coffee, silence, and sunlight."
"The rule is simple: write short sentences."

The colon says "here's what I mean."`,
        example: `**Semicolons:**
"I wanted to stay; something told me to leave." (Two related but independent thoughts.)

**Colons:**
"Life has one rule: keep moving." (The colon introduces the rule.)

**Wrong semicolon:**
"I like; mornings." (The second half isn't a complete sentence.)

**Wrong colon:**
"My hobbies are: reading." (Don't use a colon right after a verb.)`,
        exerciseType: "write",
        exercisePrompt: `Write 3 sentences:
1. One using a semicolon to connect two related ideas
2. One using a colon to introduce a list
3. One using a colon to introduce an explanation

Topic: anything you're interested in.`,
        exerciseText: "",
        feedbackPrompt: `Evaluate semicolon and colon usage. For the semicolon: both halves must be complete sentences. For the colon introducing a list: the part before the colon should be a complete thought. For the colon introducing an explanation: the second part should explain or elaborate the first. Check all three sentences.`,
      },
      {
        id: "l0-4",
        level: 0,
        title: "Dashes & Parentheses",
        concept: `**Em dashes (—)** are dramatic pauses. They interrupt a sentence to insert something important.

"The library — unlike any cafe — forces focus."

Use them sparingly. If every sentence has an em dash, none of them have impact.

**Parentheses** are whispered asides. They add context that's nice to know but not essential.

"The book (published in 1946) changed everything."

If the sentence works without the parenthetical, it belongs in parentheses. If it doesn't, use em dashes or make it its own sentence.`,
        example: `**Em dash — emphasis:**
"I visited every city — Tokyo, Berlin, Lisbon, Buenos Aires — before choosing where to live."

**Parentheses — aside:**
"Running (which I started three years ago) changed how I think."

**Overuse (bad):**
"The coffee — which was hot — tasted good — especially the first sip — because I was tired — from the long walk."

Too many dashes. The reader can't find the main thought.`,
        exerciseType: "write",
        exercisePrompt: `Write 2 sentences about anything:
1. One with an em dash (—) for emphasis or interruption
2. One with parentheses for a non-essential aside`,
        exerciseText: "",
        feedbackPrompt: `Evaluate em dash and parentheses usage. For the em dash: it should create a dramatic pause or insert an important interruption. For parentheses: the content inside should be removable without breaking the sentence. Check that neither is overused.`,
      },
      {
        id: "l0-5",
        level: 0,
        title: "Apostrophes",
        concept: `Apostrophes do two things:

**1. Contractions** — combining two words:
"it is" → "it's", "do not" → "don't", "they are" → "they're"

**2. Possession** — showing ownership:
"the city's energy", "Maria's book", "the reader's preference"

**The big trap: it's vs its**
- "it's" = "it is" (contraction)
- "its" = belonging to it (possession)

"It's fast" = "It is fast" ✓
"Its speed is unmatched" = "The speed belonging to it" ✓

If you can replace it with "it is" and it still makes sense, use "it's". Otherwise, "its".`,
        example: `**Correct:**
"It's impossible to go back." (it is impossible)
"The city's energy is contagious." (energy belonging to the city)
"The dog wagged its tail." (tail belonging to the dog)

**Wrong:**
"Its impossible to go back." (should be "it's" — "it is impossible")
"The citys energy is contagious." (should be "city's" — possession)
"The dog wagged it's tail." (should be "its" — belonging to it)`,
        exerciseType: "fix",
        exercisePrompt: `Fix the apostrophe errors in this paragraph:`,
        exerciseText: `Its hard to explain why the citys charm matters. The restaurant keeps it's menu simple. The chefs strength is that its authentic. Its not about variety — its about quality. Every meals purpose should be clear from it's ingredients.`,
        feedbackPrompt: `Evaluate apostrophe corrections. The correct version should be: "It's hard to explain why the city's charm matters. The restaurant keeps its menu simple. The chef's strength is that it's authentic. It's not about variety — it's about quality. Every meal's purpose should be clear from its ingredients." Check each apostrophe decision.`,
      },
      {
        id: "l0-6",
        level: 0,
        title: "Quotation Marks",
        concept: `**Direct quotes** — when you repeat someone's exact words:
"Paul Graham said, 'Write like you talk.'"

**Titles and terms** — referring to a specific word or phrase:
The word "leverage" is overused.
His essay "Write Like You Talk" changed how I think.

**Scare quotes** — indicating skepticism:
The "innovation" was just a rebrand.

In American English, periods and commas go inside quotes. Always.
"This is correct."
"This is wrong".

Single quotes go inside double quotes:
"He said 'keep it simple' and I listened."`,
        example: `**Direct quote:**
"Naval said, 'Clear writing is clear thinking.'"

**Referring to a word:**
Stop using the word "synergy."

**Scare quotes:**
Their "AI-powered" feature was just an if-else statement.

**Wrong punctuation:**
"This is wrong". (Period should be inside: "This is wrong.")
He said "keep it simple". (Should be: He said, "keep it simple.")`,
        exerciseType: "write",
        exercisePrompt: `Write 3 sentences:
1. Quote something someone said (real or made up)
2. Refer to a specific word or term using quotes
3. Use scare quotes to express skepticism about something`,
        exerciseText: "",
        feedbackPrompt: `Evaluate quotation mark usage. Check: direct quote has proper comma before the quote and punctuation inside. Word reference uses quotes around the specific term. Scare quotes convey skepticism. All punctuation should be inside the closing quotes (American English style).`,
      },
    ],
  },
  {
    name: "Sentence Craft",
    lessons: [
      {
        id: "l1-1",
        level: 1,
        title: "Active Voice",
        concept: `Active voice means the subject does the action. Passive voice means the action is done to the subject.

Active: "She wrote the letter."
Passive: "The letter was written by her."

Active voice is shorter, clearer, and more direct. Strunk called it Rule 10 of composition. Use it as your default. The passive voice has its place — when the doer is unknown or unimportant — but most sentences are better active.

Ask yourself: who is doing what? Put that person first.`,
        example: `**Passive (weak):**
"The decision was made by the committee to postpone the meeting."

**Active (strong):**
"The committee decided to postpone the meeting."

**Passive (weak):**
"Mistakes were made."

**Active (strong):**
"We made mistakes."

Notice how active voice forces accountability. "Mistakes were made" hides who made them. That's why politicians love the passive voice.`,
        exerciseType: "fix",
        exercisePrompt: `Rewrite these passive sentences in active voice:`,
        exerciseText: `The cake was eaten by the children before dinner was served by the host. The rules were explained by the teacher, and the test was taken by the students. A decision was reached by the board after the proposal was reviewed by the committee.`,
        feedbackPrompt: `Evaluate if the user converted passive voice to active voice correctly. Each sentence should have a clear subject performing the action. Check that no "was [verb]ed by" constructions remain unless justified. The meaning should be preserved.`,
      },
      {
        id: "l1-2",
        level: 1,
        title: "Positive Form",
        concept: `Say what something IS, not what it ISN'T.

Negative: "He was not very often on time."
Positive: "He usually came late."

Negative: "She did not think the food was good."
Positive: "She thought the food was bad."

Strunk's Rule 11: "Put statements in positive form." Negative statements are harder to process. The reader has to mentally flip "not good" into "bad." Do the work for them.

One exception: "not" works when you want to create a deliberate contrast. "Not bad" is different from "good" — it carries a tone of mild surprise.`,
        example: `**Negative (weak):**
"The signal did not go unnoticed."

**Positive (clear):**
"The signal was noticed."

**Negative (wordy):**
"He was not in agreement with the plan and did not think it would not fail."

**Positive (direct):**
"He disagreed with the plan and expected it to fail."

Double negatives like "did not think it would not fail" are the worst. The reader untangles two negations to find a positive statement buried underneath.`,
        exerciseType: "fix",
        exercisePrompt: `Rewrite these negative statements in positive form:`,
        exerciseText: `She did not remember the appointment. The music was not unpleasant. He did not have much faith in the plan. They were not in disagreement about the outcome. The weather was not unlike what we had expected.`,
        feedbackPrompt: `Evaluate if the user converted negative statements to positive form. "did not remember" → "forgot", "not unpleasant" → "pleasant" or similar, "did not have much faith" → "doubted". Check that the meaning is preserved and the sentences are more direct.`,
      },
      {
        id: "l1-3",
        level: 1,
        title: "Concrete Language",
        concept: `Strunk's Rule 12: "Use definite, specific, concrete language."

Vague: "A period of bad weather set in."
Concrete: "It rained every day for a week."

Vague: "He showed satisfaction."
Concrete: "He grinned."

General words — "things," "stuff," "aspects," "situation" — carry no picture. Specific words make the reader see, hear, and feel. Every time you write a general word, ask: can I replace this with something the reader can picture?`,
        example: `**Vague:**
"She had a good experience at the restaurant."

**Concrete:**
"She ordered the risotto, ate every grain, and asked for the recipe."

**Vague:**
"The situation was difficult and various factors contributed to the problem."

**Concrete:**
"The roof leaked, the furnace died, and the landlord stopped returning calls."

The concrete version tells a story. The vague version tells you nothing.`,
        exerciseType: "fix",
        exercisePrompt: `Rewrite these vague sentences with concrete, specific details. Invent details if needed — the point is to be specific:`,
        exerciseText: `He was a nice person. The trip was interesting. Things went wrong at work. She had a lot of stuff to do. The situation became problematic.`,
        feedbackPrompt: `Evaluate if the user replaced vague, abstract language with concrete, specific details. "nice person" should become specific behavior. "interesting trip" should name places or events. "things went wrong" should describe what actually happened. The sentences should create pictures in the reader's mind.`,
      },
      {
        id: "l1-4",
        level: 1,
        title: "Omit Needless Words",
        concept: `Strunk's most famous rule: "Omit needless words."

"Vigorous writing is concise. A sentence should contain no unnecessary words, a paragraph no unnecessary sentences, for the same reason that a drawing should have no unnecessary lines and a machine no unnecessary parts."

This doesn't mean every sentence must be short. It means every word must earn its place. Kill these on sight:

- "the fact that" → delete it, rephrase
- "in order to" → "to"
- "at this point in time" → "now"
- "due to the fact that" → "because"
- "in the event that" → "if"
- "it is important to note that" → delete entirely`,
        example: `**Bloated:**
"Due to the fact that the weather was bad, the game was called off."

**Concise:**
"The game was called off because of rain."

**Bloated:**
"He is a man who is very careful about his appearance."

**Concise:**
"He dresses carefully."

**Bloated:**
"In spite of the fact that she was exhausted, she continued working."

**Concise:**
"Exhausted, she kept working."

Count the words. The concise versions say the same thing in half the space.`,
        exerciseType: "cut",
        exercisePrompt: `Cut these sentences down. Remove every word that doesn't earn its place:`,
        exerciseText: `In order to apply for the position, it is necessary that you submit your resume at this point in time. Due to the fact that the traffic was heavy, we arrived late to the meeting that was scheduled for noon. She is a woman who always makes an effort to be on time. It is important to note that the results of the study were inconclusive. The question as to whether he should go or stay was on his mind.`,
        feedbackPrompt: `Evaluate if the user cut unnecessary words. "In order to" → "To". "it is necessary that" → delete. "at this point in time" → "now". "Due to the fact that" → "Because". "a woman who always makes an effort to be" → "always". "It is important to note that" → delete. "The question as to whether" → "Whether". Every sentence should be significantly shorter while preserving meaning.`,
      },
      {
        id: "l1-5",
        level: 1,
        title: "Sentence Rhythm",
        concept: `Good writing has rhythm. Not the rhythm of poetry — the rhythm of speech. Short sentences punch. Long sentences flow. The best writing mixes both.

Read this:
"He sat down. He looked at the paper. He picked up his pen. He started writing."

Monotonous — every sentence has the same length and structure. Now read this:

"He sat down and looked at the paper. For a long time he didn't move. Then he picked up his pen and started writing."

Same content, but the second version breathes. It varies sentence length: medium, short, long. The short sentence ("For a long time he didn't move") creates a pause that makes the reader feel the hesitation.

Rule of thumb: follow a long sentence with a short one. The short sentence hits harder because of the contrast.`,
        example: `**Monotonous (all same length):**
"The sun was setting. The birds were singing. The wind was blowing. The leaves were falling. It was a beautiful evening."

**Rhythmic (varied length):**
"The sun was setting behind the hills, and the birds had begun their evening song. The wind picked up. Leaves skittered across the path like small animals. It was the kind of evening that makes you stop walking and just stand there."

The short sentence "The wind picked up" breaks the flow and creates a moment. The long final sentence earns its length because the short one before it created contrast.`,
        exerciseType: "fix",
        exercisePrompt: `Rewrite this passage to vary the sentence lengths. Combine some sentences, split others, and create rhythm:`,
        exerciseText: `The room was quiet. The clock was ticking. The candle was burning low. The shadows were long. She sat in the corner. She was reading a book. She turned the pages slowly. She didn't notice the time passing. It was almost midnight.`,
        feedbackPrompt: `Evaluate if the user varied sentence rhythm. Look for: a mix of short and long sentences, some sentences combined for flow, at least one very short sentence for punch, and a natural reading rhythm. The passage should no longer feel monotonous. Read it "out loud" mentally — does it flow?`,
      },
      {
        id: "l1-6",
        level: 1,
        title: "Emphatic Position",
        concept: `Strunk's Rule 18: "Place the emphatic words of a sentence at the end."

The end of a sentence is where the reader's attention lands. Put your most important word there.

Weak: "Humanity has hardly advanced in fortitude since that time, though it has advanced in many other ways."

Strong: "Since that time, humanity has advanced in many ways, but hardly in fortitude."

"Fortitude" is the key word. The revised version puts it last, where it lingers in the reader's mind.

This applies to paragraphs too — the last sentence of a paragraph should be the strongest.`,
        example: `**Weak ending:**
"The concert was one of the most extraordinary I have ever attended, honestly."

**Strong ending:**
"Honestly, it was the most extraordinary concert I have ever attended."

**Weak ending:**
"She had been working toward this moment for twenty years, or thereabouts."

**Strong ending:**
"For twenty years, she had been working toward this moment."

"This moment" is the payoff. Put it last.`,
        exerciseType: "fix",
        exercisePrompt: `Rearrange these sentences so the most important word or phrase falls at the end:`,
        exerciseText: `The view from the summit was breathtaking, we all agreed. Success depends on hard work, in the final analysis. He discovered the truth about his family after all those years of searching. The experiment was, without a doubt, a complete failure.`,
        feedbackPrompt: `Evaluate if the user placed the emphatic word at the end of each sentence. "breathtaking" should end the first. "hard work" or similar emphasis should end the second. "the truth about his family" should end the third. "failure" should end the fourth. Check that meaning is preserved while the most important word lands last.`,
      },
    ],
  },
  {
    name: "Paragraphs & Structure",
    lessons: [
      {
        id: "l2-1",
        level: 2,
        title: "One Idea Per Paragraph",
        concept: `Strunk's Rule 8: "Make the paragraph the unit of composition: one paragraph to each topic."

Each paragraph is a container for a single idea. When you move to a new idea, start a new paragraph. When you're still developing the same idea, stay in the same paragraph.

A paragraph break is a signal to the reader: "We're moving on." If you break paragraphs randomly, the reader loses the thread. If you never break them, the reader drowns.

Test: can you summarize each paragraph in one sentence? If not, it's doing too much.`,
        example: `**Too much in one paragraph:**
"The morning was cold. I put on my coat and walked to the station. The train was late again. I've been thinking about switching to cycling. The exercise would be good for me, and I'd save money on the monthly pass. When the train finally arrived, it was packed."

**Better — split by idea:**
"The morning was cold. I put on my coat and walked to the station. The train was late again.

I've been thinking about switching to cycling. The exercise would be good for me, and I'd save money on the monthly pass.

When the train finally arrived, it was packed."

Three ideas: the commute, the cycling thought, the crowded train. Three paragraphs.`,
        exerciseType: "fix",
        exercisePrompt: `Split this into proper paragraphs. Find where the ideas change:`,
        exerciseText: `The library was empty when I arrived. I found a table near the window and spread out my notes. The exam was in three days and I hadn't started studying. My phone buzzed. It was a message from Sarah asking if I wanted to get coffee. I put the phone face down and opened the textbook. The first chapter was about cellular biology. I remembered liking this topic in high school. My teacher, Mr. Roberts, had a way of making everything interesting. He retired last year. I wondered what he was doing now. I read the first page twice without absorbing anything.`,
        feedbackPrompt: `Evaluate if the user split the text into logical paragraphs. Key break points: the library arrival (scene setting), the phone interruption (new event), the memory of Mr. Roberts (digression), and returning to studying (back to present). Each paragraph should contain one coherent idea.`,
      },
      {
        id: "l2-2",
        level: 2,
        title: "The Topic Sentence",
        concept: `Strunk's Rule 9: "Begin each paragraph with a topic sentence."

The first sentence tells the reader what the paragraph is about. Every other sentence supports it.

"The town was built on a single industry." — now the reader expects details about that industry. Every sentence in the paragraph should deliver on that promise.

If your paragraph starts with one topic and ends on another, something went wrong. Either split it or cut the wandering sentences.

The topic sentence is a contract with the reader: "Here's what I'm going to tell you." Don't break the contract.`,
        example: `**No clear topic sentence:**
"It was raining. I stayed inside. I made soup. The soup was good. I called my mother. She told me about her garden."

**With topic sentence:**
"Rainy days are for small rituals. I stayed inside, made a pot of soup, and called my mother. She told me about her garden while I ate."

The topic sentence "Rainy days are for small rituals" frames everything that follows. Each detail — the soup, the call, the garden — supports the idea of small rituals.`,
        exerciseType: "write",
        exercisePrompt: `Write 3 paragraphs. Each one must start with a clear topic sentence, and every following sentence must support it. Topics:

1. A place you know well
2. A habit you have
3. Something you changed your mind about`,
        exerciseText: "",
        feedbackPrompt: `Evaluate if each paragraph starts with a clear topic sentence and every following sentence supports it. Check: does the first sentence announce the topic? Do the remaining sentences stay on topic or wander? Could you summarize each paragraph in one sentence (the topic sentence)?`,
      },
      {
        id: "l2-3",
        level: 2,
        title: "The Hook",
        concept: `Your first sentence has one job: make the reader want to read the second sentence.

That's it. Not to summarize your piece, not to provide context, not to introduce yourself. Just curiosity.

Ways to hook:
- **A bold claim:** "Most of what you learned in school is wrong."
- **A question:** "What would you do with an extra hour every day?"
- **A scene:** "The phone rang at 3 AM."
- **A contradiction:** "I became a better writer by writing less."

What doesn't work: "In this essay I will discuss..." "Today I want to talk about..." "It's important to understand that..." These are throat-clearing. Skip them.`,
        example: `**Weak opening (throat-clearing):**
"In this article, I want to share some thoughts about the importance of morning routines and how they can impact your productivity."

**Strong hook:**
"I used to check my phone before I opened my eyes."

**Weak opening (too general):**
"Travel is something that many people enjoy and it can be a very enriching experience."

**Strong hook:**
"The best meal I ever ate was in a gas station in Portugal."

The strong hooks make you want to know more. The weak ones make you want to scroll past.`,
        exerciseType: "write",
        exercisePrompt: `Write 4 opening sentences (hooks) for these topics. Just the first sentence — make it irresistible:

1. Why you quit social media
2. The best advice you ever received
3. A skill that took years to learn
4. Moving to a new city`,
        exerciseText: "",
        feedbackPrompt: `Evaluate each hook. Does it create curiosity? Does it make you want to read the next sentence? Is it specific rather than generic? Penalize throat-clearing ("In this essay..."), generic statements ("X is important..."), and definitions ("X is defined as..."). Reward bold claims, vivid scenes, contradictions, and specificity.`,
      },
      {
        id: "l2-4",
        level: 2,
        title: "Transitions",
        concept: `Transitions are bridges between paragraphs. Without them, your writing feels like a list of unconnected thoughts.

Simple transitions use connecting words:
- **Addition:** also, furthermore, moreover
- **Contrast:** but, however, on the other hand
- **Cause:** because, therefore, as a result
- **Time:** then, meanwhile, afterward
- **Example:** for instance, specifically

Better transitions repeat a key word or idea from the previous paragraph:

"...the city never sleeps.

That sleeplessness has a cost."

The repetition of "sleeplessness/sleeps" stitches the paragraphs together without a clunky connector word. This is the invisible transition — the best kind.`,
        example: `**No transition (jarring):**
"The restaurant was packed every night. The owner decided to raise prices.

The new menu featured locally sourced ingredients."

**With transition:**
"The restaurant was packed every night. The owner decided to raise prices.

The higher prices demanded better quality. The new menu featured locally sourced ingredients."

"Higher prices" echoes the previous paragraph's idea, then pivots to the new topic (the menu). The reader crosses the bridge without noticing it.`,
        exerciseType: "write",
        exercisePrompt: `Write 3 short paragraphs (2-3 sentences each) on ANY topic. The paragraphs must flow into each other using transitions — either connecting words or repeated ideas. The reader should feel a smooth progression, not three disconnected blocks.`,
        exerciseText: "",
        feedbackPrompt: `Evaluate transitions between paragraphs. Does each paragraph connect to the previous one? Are the transitions smooth or clunky? Look for: repeated key words, connecting phrases, or logical flow. Penalize paragraphs that feel disconnected or transitions that are too mechanical ("Furthermore..." "Additionally...").`,
      },
      {
        id: "l2-5",
        level: 2,
        title: "Show, Don't Tell",
        concept: `"Don't tell me the moon is shining; show me the glint of light on broken glass." — Chekhov

Telling: "She was sad."
Showing: "She stared at the empty chair across the table."

Telling gives the reader a label. Showing gives the reader evidence and lets them reach the conclusion themselves. The reader feels smarter — they figured it out.

This applies to non-fiction too:
Telling: "The product was successful."
Showing: "The product sold out in two hours. The server crashed from the traffic."

Show with actions, details, and specifics. Tell only when speed matters more than impact.`,
        example: `**Telling:**
"He was nervous about the interview."

**Showing:**
"He arrived twenty minutes early and checked his reflection in the lobby window three times."

**Telling:**
"The neighborhood was dangerous."

**Showing:**
"Every car on the street had a steering wheel lock. The corner store had bulletproof glass at the register."

The showing versions let you draw your own conclusion. That's what makes them stick.`,
        exerciseType: "write",
        exercisePrompt: `Rewrite each "telling" statement as a "showing" passage (2-3 sentences). Use actions, details, and specifics:

1. "She was exhausted."
2. "The house was old."
3. "He loved his dog."
4. "The city was alive at night."`,
        exerciseText: "",
        feedbackPrompt: `Evaluate if the user showed instead of told. Each response should use concrete actions, sensory details, or specific evidence instead of abstract labels. "Exhausted" should become visible behavior. "Old house" should become cracked paint or creaking stairs. "Loved his dog" should become an action. Penalize any response that still uses the original abstract word.`,
      },
      {
        id: "l2-6",
        level: 2,
        title: "End Strong",
        concept: `The last sentence of a piece is the second most important sentence — right after the first.

The opening hooks the reader. The ending is what they remember. A weak ending ("In conclusion..." "And that's why...") deflates everything that came before.

Strong endings:
- **Circle back** to the opening — echo the first line with new meaning
- **Land on a concrete image** — not an abstraction
- **Stop suddenly** — don't summarize, just stop when you've said enough
- **The kicker** — a final line that reframes everything

The worst ending is a summary of what you just said. The reader was there. They don't need a recap.`,
        example: `**Weak ending (summary):**
"In conclusion, morning routines are important because they help you start the day right and improve your productivity."

**Strong ending (image):**
"By 7 AM, the day already feels like mine."

**Weak ending (trailing off):**
"So that's basically what happened, and I guess things worked out in the end."

**Strong ending (kicker):**
"He never opened that door again."

The strong endings create a feeling. The weak ones just... stop talking.`,
        exerciseType: "write",
        exercisePrompt: `Write 3 closing sentences for these scenarios. Just the final line — make it land:

1. An essay about leaving a job you loved
2. A story about learning to cook from your grandmother
3. A piece about why you prefer the night`,
        exerciseText: "",
        feedbackPrompt: `Evaluate each closing sentence. Does it create a feeling? Does it linger in the mind? Is it concrete rather than abstract? Penalize summaries ("In conclusion..."), trailing off ("I guess..."), and generic statements. Reward vivid images, callbacks, kickers, and sentences that make you pause after reading.`,
      },
    ],
  },
  {
    name: "Voice & Style",
    lessons: [
      {
        id: "l3-1",
        level: 3,
        title: "Write Like You Talk",
        concept: `Paul Graham's best advice: "Write like you talk."

Read your sentence out loud. If you wouldn't say it in conversation, rewrite it. Written language shouldn't sound like a different person from your spoken language.

"The utilization of this methodology enables enhanced outcomes" — nobody talks like that. "This method works better" — everyone talks like that.

Academic writing trained us to inflate our language. Unlearn it. The smartest people explain complex things simply. The insecure ones use big words to sound smart.`,
        example: `**Written voice (stiff):**
"It is my contention that the proliferation of digital communication has fundamentally altered interpersonal relationships."

**Spoken voice (natural):**
"I think texting changed how we talk to each other."

**Written voice (stiff):**
"The aforementioned considerations notwithstanding, the project proceeded as planned."

**Spoken voice (natural):**
"Despite all that, we kept going."

Read both versions out loud. Which one sounds like a person? That's the one to keep.`,
        exerciseType: "fix",
        exercisePrompt: `Rewrite these stiff, formal sentences as if you were explaining them to a friend:`,
        exerciseText: `The implementation of the new policy resulted in a significant improvement in employee satisfaction metrics. It should be noted that the consumption of excessive quantities of caffeine can have deleterious effects on one's health. The individual demonstrated a consistent pattern of arriving at the workplace subsequent to the designated start time.`,
        feedbackPrompt: `Evaluate if the user made the sentences sound natural and conversational. "implementation of the new policy" → something like "the new policy". "deleterious effects" → "bad for you". "subsequent to the designated start time" → "late". The rewritten sentences should sound like something you'd say out loud. Penalize any remaining formal/academic language.`,
      },
      {
        id: "l3-2",
        level: 3,
        title: "Kill Filler Words",
        concept: `Filler words are the "um" and "uh" of writing. They add nothing. Kill them.

The worst offenders:
- **just** — "I just think that..." → "I think that..."
- **really** — "It was really good" → "It was good" (or better: be specific)
- **very** — "very tired" → "exhausted". Mark Twain: "Substitute 'damn' every time you're inclined to write 'very.' Your editor will delete it and the writing will be just as it should be."
- **basically** — "It's basically a..." → "It's a..."
- **actually** — "I actually went..." → "I went..."
- **literally** — unless something literally happened, drop it
- **in my opinion** — it's your writing. Everything in it is your opinion.`,
        example: `**With filler:**
"I just really think that basically everyone should actually try to literally wake up early. In my opinion, it's very important."

**Without filler:**
"Everyone should try waking up early. It matters."

14 words instead of 24. Same meaning. More punch. Every filler word you remove makes the remaining words stronger.`,
        exerciseType: "cut",
        exercisePrompt: `Remove all filler words from this paragraph. Don't rewrite — just delete the unnecessary words:`,
        exerciseText: `I just wanted to basically say that I really think this is actually a very important topic. In my opinion, people should literally take more time to just think about what they're actually doing with their lives. It's really not that hard to basically make some very simple changes that can actually have a really big impact.`,
        feedbackPrompt: `Evaluate if the user removed filler words: just, basically, really, actually, very, literally, in my opinion. Count how many fillers remain. The paragraph should be significantly shorter. The meaning should be preserved. Award full marks if all fillers are removed and the text still reads naturally.`,
      },
      {
        id: "l3-3",
        level: 3,
        title: "Specifics Beat Generalities",
        concept: `Naval Ravikant writes: "Specific knowledge is knowledge you cannot be trained for." The same applies to writing — specific details make writing feel real.

General: "He made a lot of money."
Specific: "He made $4 million in three years."

General: "She was good at her job."
Specific: "She closed 47 deals in her first quarter."

General: "The food was great."
Specific: "The steak had a char on the outside and bled when you cut it."

Specifics are proof. Generalities are claims. The reader trusts proof.`,
        example: `**General:**
"He worked out regularly and was in great shape."

**Specific:**
"He ran six miles every morning before dawn and could deadlift twice his body weight."

**General:**
"The company grew quickly."

**Specific:**
"The company went from 3 employees in a garage to 200 in an office tower in eighteen months."

The specific versions don't just tell you something is true — they prove it.`,
        exerciseType: "fix",
        exercisePrompt: `Replace every generality with a specific detail. Invent numbers, names, and details — the point is to be concrete:`,
        exerciseText: `She traveled a lot and visited many countries. He was really smart and did well in school. The event was well-attended and people seemed to enjoy it. The apartment was small but nice. They had been friends for a long time.`,
        feedbackPrompt: `Evaluate if the user replaced generalities with specific details. "traveled a lot" should become specific countries or a number. "really smart" should become a specific achievement. "well-attended" should become a number. "small but nice" should name details. "a long time" should become years. Every sentence should contain at least one concrete number, name, or sensory detail.`,
      },
      {
        id: "l3-4",
        level: 3,
        title: "Opinions Are Interesting",
        concept: `Summaries are boring. Opinions are interesting.

Summary: "There are different approaches to morning routines."
Opinion: "Morning routines are overrated."

Summary: "Remote work has both advantages and disadvantages."
Opinion: "Remote work is better in every way that matters."

When you summarize, you're a reporter. When you opine, you're a thinker. Readers follow thinkers.

Derek Sivers: "If your opinion doesn't make someone uncomfortable, it's not an opinion." Take a side. The readers who disagree will still respect you for having a position.`,
        example: `**Summary (boring):**
"Social media has changed how people communicate. Some people think it's positive, while others believe it has negative effects."

**Opinion (interesting):**
"Social media made us better at broadcasting and worse at listening."

**Summary (boring):**
"There are many programming languages to choose from, each with its own strengths."

**Opinion (interesting):**
"Learn one language deeply. Dabbling in five teaches you nothing."

The opinions are debatable — that's what makes them worth reading.`,
        exerciseType: "write",
        exercisePrompt: `Turn these bland summaries into strong opinions. Take a side and commit to it:

1. "Exercise has many health benefits."
2. "Reading books can be educational."
3. "Different people have different learning styles."
4. "Technology has changed modern life."`,
        exerciseText: "",
        feedbackPrompt: `Evaluate if the user turned summaries into strong opinions. Each response should take a clear side — not hedge with "both sides" language. Check: is there a debatable claim? Would someone disagree with it? Is it specific rather than generic? Penalize "on the other hand" and "it depends" hedging.`,
      },
      {
        id: "l3-5",
        level: 3,
        title: "Read It Out Loud",
        concept: `The best editing tool is your voice. Read your writing out loud. Your ear catches what your eye misses.

If you stumble over a sentence, it's too long or too tangled. If you run out of breath, add a period. If something sounds awkward, it is awkward.

Zinsser rewrote every sentence that didn't sound right when spoken. He'd read passages aloud to himself in his office, testing the rhythm and flow.

This is why "write like you talk" works — writing that sounds good spoken always reads well on the page. The reverse isn't always true.

Your mouth is an editor. Use it.`,
        example: `**Hard to read aloud:**
"The fact that the implementation of the strategic initiative was not, in the final analysis, undertaken in accordance with the original timeline, notwithstanding the various efforts that were made by the team, was disappointing."

**Reads naturally:**
"The project was late. The team tried, but it wasn't enough. That was disappointing."

Try reading both out loud. The first one makes you gasp for air. The second flows like speech.`,
        exerciseType: "fix",
        exercisePrompt: `Rewrite this paragraph so it sounds natural when read aloud. Read your version to yourself before submitting:`,
        exerciseText: `The methodology that was employed in the course of this investigation, which involved the systematic examination of a substantial number of case studies pertaining to the subject matter in question, yielded results that were, on the whole, consistent with the hypothesis that had been formulated at the outset of the research endeavor.`,
        feedbackPrompt: `Evaluate if the rewritten version sounds natural when read aloud. It should be conversational, breathable, and clear. The one long sentence should be broken into several short ones. All academic jargon should be replaced with plain language. Test: could you say this to someone over coffee?`,
      },
      {
        id: "l3-6",
        level: 3,
        title: "What You Leave Out",
        concept: `Your style is defined as much by what you don't write as what you do.

Hemingway's "iceberg theory": show 10% on the surface, keep 90% beneath. The reader feels the weight of what's unsaid.

"For sale: baby shoes, never worn." — six words. The story is in what's missing.

In practice:
- Don't explain the joke
- Don't tell the reader how to feel ("This was a devastating loss")
- Don't over-describe ("The beautiful, stunning, gorgeous sunset painted the sky in brilliant hues of orange and red")
- Don't repeat yourself in different words

Trust your reader. They're smarter than you think.`,
        example: `**Over-written:**
"She looked at the letter for a long time, feeling a wave of sadness wash over her as she realized what it meant. Tears began to form in her eyes. She was devastated. It was the worst news she had ever received."

**Restrained:**
"She read the letter twice. Then she folded it carefully and put it in her pocket."

The restrained version is more powerful because the reader fills in the emotion themselves. The over-written version tells you how to feel — and by telling, it weakens the feeling.`,
        exerciseType: "cut",
        exercisePrompt: `Cut this paragraph to half its length. Remove explanations, redundancies, and anything that tells the reader how to feel:`,
        exerciseText: `The old man walked slowly and carefully along the beautiful, winding path that led to the magnificent, ancient oak tree that he had loved visiting for many, many years. He sat down on the worn wooden bench that was positioned beneath the tree's spreading, leafy branches. He felt a deep sense of peace and contentment wash over him as he listened to the gentle, soothing sounds of the birds singing their melodious songs in the trees above him. It was a truly wonderful and magical moment.`,
        feedbackPrompt: `Evaluate if the user cut the passage to roughly half length. Check: are redundant adjectives removed ("beautiful, winding" → one or neither)? Is "felt a deep sense of peace" replaced by showing or cut entirely? Is "truly wonderful and magical moment" cut? The result should be tighter and more powerful. Count words — the original is ~90 words, the result should be ~45-50.`,
      },
    ],
  },
  {
    name: "Writing Forms",
    lessons: [
      {
        id: "l4-1",
        level: 4,
        title: "The Opinion Essay",
        concept: `Structure: Hook → Claim → Evidence → "But" → Resolution

1. **Hook** — grab attention
2. **Claim** — state your opinion clearly
3. **Evidence** — support it with specifics (2-3 points)
4. **"But"** — acknowledge the strongest counterargument
5. **Resolution** — explain why your claim still holds

The "but" is what separates good essays from rants. Anyone can assert an opinion. Addressing the counterargument shows you've thought it through. It makes the reader trust you.`,
        example: `**Hook:** "Everyone says you should follow your passion. I think that's terrible advice."

**Claim:** Passion follows mastery, not the other way around.

**Evidence:** "Nobody is passionate about something they're bad at. Cal Newport studied people who love their work — they got good first, then fell in love."

**"But":** "Of course, you shouldn't force yourself into something you hate."

**Resolution:** "The point isn't to ignore what you enjoy. It's to stop waiting for passion to arrive and start building skill. Passion is a side effect of competence."`,
        exerciseType: "write",
        exercisePrompt: `Write a short opinion essay (5-8 sentences) using the structure: Hook → Claim → Evidence → "But" → Resolution.

Pick any topic you have an opinion about.`,
        exerciseText: "",
        feedbackPrompt: `Evaluate the essay structure. Check for: (1) a hook that grabs attention, (2) a clear claim/opinion, (3) at least one specific piece of evidence, (4) a counterargument addressed with "but/however", (5) a resolution that ties it together. The opinion should be clear and committed — not hedged.`,
      },
      {
        id: "l4-2",
        level: 4,
        title: "The Tutorial",
        concept: `Structure: Problem → Why it matters → Steps → Gotchas → Result

Good tutorials start with the problem, not the solution. The reader needs to care before they'll follow your instructions.

1. **Problem** — what pain does this solve?
2. **Why it matters** — who has this problem and why should they care?
3. **Steps** — numbered, concrete, one action per step
4. **Gotchas** — what goes wrong that the docs don't mention?
5. **Result** — what does success look like?

The gotchas section is what separates great tutorials from mediocre ones. Anyone can list steps. Only someone who's actually done it knows where it breaks.`,
        example: `**Problem:** "Your git history is a mess. Every commit says 'fix' or 'update'."

**Why it matters:** "In six months, you won't remember what any commit did."

**Steps:**
"1. Use conventional commits: feat:, fix:, docs:
2. Write the 'why' not the 'what' — the diff shows the what
3. One logical change per commit"

**Gotcha:** "Don't amend published commits — you'll break everyone's pull."

**Result:** "Your git log reads like a changelog."`,
        exerciseType: "write",
        exercisePrompt: `Write a mini-tutorial (8-10 sentences) teaching someone how to do something you know well. Follow the structure: Problem → Why it matters → Steps → Gotcha → Result.

Pick any topic — cooking, organizing, a daily habit, anything.`,
        exerciseText: "",
        feedbackPrompt: `Evaluate the tutorial structure. Check for: (1) a clear problem statement, (2) why the reader should care, (3) concrete numbered steps, (4) at least one gotcha/warning, (5) what success looks like. Steps should be specific actions, not vague advice. The gotcha should come from real experience.`,
      },
      {
        id: "l4-3",
        level: 4,
        title: "The Build Log",
        concept: `Structure: What I built → Why → How → What I learned

Build logs are the most natural writing for makers. You already did the work — now you're just telling the story.

1. **What** — one sentence about what you made
2. **Why** — what problem prompted it? What were you frustrated with?
3. **How** — the interesting decisions, not every detail. What did you try that didn't work? What did you choose and why?
4. **What I learned** — the insight that someone reading can take away

The "what I learned" section is the whole point. Without it, a build log is just a diary entry. With it, it's useful to others.`,
        example: `**What:** "I built a script that backs up my notes to a git repo every hour."

**Why:** "I lost a week of notes when my laptop died. Once was enough."

**How:** "Tried Dropbox first — too slow, synced conflicts. Tried iCloud — corrupted two files. Wrote a cron job that commits and pushes. Ten lines of shell."

**What I learned:** "The simplest backup is the one that runs. Cloud sync isn't backup — it's replication. Replication copies your mistakes too."`,
        exerciseType: "write",
        exercisePrompt: `Write a mini build log (8-10 sentences) about something you made, fixed, or set up. Follow the structure: What → Why → How → What I learned.

It doesn't have to be software — organizing a room, fixing a bike, or cooking a recipe all work.`,
        exerciseText: "",
        feedbackPrompt: `Evaluate the build log structure. Check for: (1) a clear description of what was built/done, (2) the motivation/frustration that prompted it, (3) interesting decisions or things that didn't work, (4) a takeaway lesson. The "what I learned" should be an insight someone else could use, not just "it was hard."`,
      },
      {
        id: "l4-4",
        level: 4,
        title: "The Narrative",
        concept: `Structure: Scene → Tension → Insight → Takeaway

Narrative writing tells a story with a point. Not fiction — real events, real experiences, but structured like a story.

1. **Scene** — put the reader in a moment. Where are you? What's happening?
2. **Tension** — what went wrong? What was at stake?
3. **Insight** — the turn. What did you realize?
4. **Takeaway** — why this matters beyond your personal experience

The scene is what hooks them. The tension keeps them reading. The insight is the payoff. The takeaway makes it worth their time.`,
        example: `**Scene:** "It was my third interview that week. I wore the same suit to all of them."

**Tension:** "The interviewer asked me where I saw myself in five years. I opened my mouth and nothing came out. Not because I didn't know the answer — because the honest answer was 'not here.'"

**Insight:** "That silence told me more than any career test ever had."

**Takeaway:** "Sometimes the question you can't answer is the answer."`,
        exerciseType: "write",
        exercisePrompt: `Write a short narrative (8-10 sentences) about a real moment from your life. Follow the structure: Scene → Tension → Insight → Takeaway.

Pick a moment where something shifted — a realization, a decision, or a surprise.`,
        exerciseText: "",
        feedbackPrompt: `Evaluate the narrative structure. Check for: (1) a vivid scene with sensory details, (2) tension or stakes, (3) a turning point or insight, (4) a broader takeaway. The scene should be specific ("third interview that week") not generic ("one day"). The insight should feel earned, not forced.`,
      },
      {
        id: "l4-5",
        level: 4,
        title: "The Reflection",
        concept: `Structure: Something happened → Why it stuck → What it means

Reflections are the simplest form of personal writing. Something caught your attention — a conversation, a book, a walk, a failure — and you're working out why.

1. **Something happened** — describe it simply
2. **Why it stuck** — what about it won't leave your mind?
3. **What it means** — connect it to something larger

Reflections don't need drama. The best ones find significance in small moments. A conversation with a stranger. A sign you walked past. The moment you realized you were wrong about something.`,
        example: `**Something happened:** "My neighbor gave me tomatoes from his garden. I didn't ask for them."

**Why it stuck:** "I've lived next to this man for two years and barely said hello. He knew I worked late because he saw my light on."

**What it means:** "There's a kind of attention that doesn't require conversation. Some people watch out for you without announcing it. That's a form of kindness I want to practice."`,
        exerciseType: "write",
        exercisePrompt: `Write a short reflection (6-8 sentences) about something small that stuck with you. Follow the structure: Something happened → Why it stuck → What it means.

No dramatic events needed — the best reflections come from ordinary moments.`,
        exerciseText: "",
        feedbackPrompt: `Evaluate the reflection. Check for: (1) a specific moment described simply, (2) an honest exploration of why it matters, (3) a connection to something larger. The moment should be concrete, not abstract. The "what it means" should feel genuine, not like a forced moral. Reward vulnerability and specificity.`,
      },
      {
        id: "l4-6",
        level: 4,
        title: "The Analysis",
        concept: `Structure: Context → Breakdown → Implications → Your take

Analysis writing explains something — a trend, a product, an event, a decision — and tells the reader what to think about it.

1. **Context** — what are we looking at and why now?
2. **Breakdown** — dissect it into parts. What are the key elements?
3. **Implications** — what does this mean for the future?
4. **Your take** — after all this analysis, what's your position?

The difference between analysis and summary: analysis has a brain. Summary reports facts. Analysis interprets them.`,
        example: `**Context:** "Apple removed the headphone jack in 2016. Ten years later, every phone company followed."

**Breakdown:** "The move served three purposes: waterproofing, thinner design, and AirPods revenue. The backlash was loud but short."

**Implications:** "It proved that convenience wins over principle. People complained, then bought the adapter, then bought AirPods."

**Your take:** "Apple didn't predict the future. They manufactured it. And that's what monopoly power looks like in consumer electronics."`,
        exerciseType: "write",
        exercisePrompt: `Write a mini-analysis (8-10 sentences) about something you've observed — a trend, a product, a decision someone made. Follow the structure: Context → Breakdown → Implications → Your take.`,
        exerciseText: "",
        feedbackPrompt: `Evaluate the analysis structure. Check for: (1) clear context that explains why this matters now, (2) a breakdown into specific elements, (3) implications or predictions, (4) a clear personal take. The analysis should go beyond surface-level description. The "your take" should be an opinion, not a summary.`,
      },
    ],
  },
  {
    name: "Editing & Rewriting",
    lessons: [
      {
        id: "l5-1",
        level: 5,
        title: "Cut 30%",
        concept: `Your first draft is always too long. Always.

Zinsser: "Rewriting is the essence of writing well." He wasn't talking about fixing typos — he meant cutting. His own manuscripts were covered in crossed-out sentences and arrows.

Rule of thumb: after your first draft, cut 30%. Not by removing ideas — by removing words. Tighten every sentence. Delete every sentence that doesn't earn its place.

If cutting 30% feels impossible, your draft has more fat than you think. Every writer overexplains on the first pass. It's natural — you're still figuring out what you're saying. The second pass is where you find it.`,
        example: `**First draft (68 words):**
"I have always believed that one of the most important things that a person can do in order to improve their overall quality of life is to make a conscious and deliberate effort to get enough sleep each night, because sleep has been shown by numerous scientific studies to have a significant impact on both physical health and mental well-being."

**After cutting 30% (24 words):**
"Get enough sleep. It's the single biggest lever for your physical health and mental clarity. The research is overwhelming."

Same idea. One-third the words. Three times the impact.`,
        exerciseType: "cut",
        exercisePrompt: `Cut this passage by at least 30%. The current word count is roughly 85 words. Get it under 60 while keeping the core idea:`,
        exerciseText: `There are many different reasons why people choose to start their own businesses rather than working for someone else. For some people, it is the desire to be their own boss and have the freedom to make their own decisions about how to run things. For others, it might be the potential financial rewards that come with building something from scratch. And for still others, it is simply the creative satisfaction of bringing an idea to life and watching it grow into something real.`,
        feedbackPrompt: `Evaluate the cut. Count the words in the user's version — is it under 60? Is the core idea preserved (reasons people start businesses: autonomy, money, creativity)? Were filler phrases removed ("there are many different reasons why" → something shorter)? Award bonus for cuts below 50 words that still read well.`,
      },
      {
        id: "l5-2",
        level: 5,
        title: "Read Backwards",
        concept: `When you read your writing forward, your brain auto-corrects errors. You see what you meant, not what you wrote.

Trick: read your sentences in reverse order. Start with the last sentence, then the second-to-last, and so on.

This breaks the narrative flow and forces you to evaluate each sentence in isolation. You'll catch:
- Sentences that don't make sense alone
- Repeated words you didn't notice
- Weak sentences hiding behind strong ones
- Sentences that say the same thing as another sentence

You don't need to literally read the words backwards — just the sentences in reverse order.`,
        example: `**Forward reading** (errors invisible):
"The team worked hard on the project. The project was a major undertaking. The undertaking required significant effort from the team."

Your brain glides right through this. Feels fine.

**Sentence-by-sentence backwards:**
3. "The undertaking required significant effort from the team."
2. "The project was a major undertaking."
1. "The team worked hard on the project."

Now you see it — all three sentences say the same thing. You need one of them, not three.`,
        exerciseType: "fix",
        exercisePrompt: `This paragraph has hidden problems: repeated ideas, weak sentences, and redundancies. Read it backwards (last sentence first) to find them, then rewrite it clean:`,
        exerciseText: `She was a talented musician who played beautifully. Her music had a way of touching people's hearts and moving them deeply. When she performed, audiences were always captivated and mesmerized by her playing. She had a natural gift for music that was obvious to anyone who heard her. Her performances were always memorable and unforgettable.`,
        feedbackPrompt: `Evaluate if the user identified the redundancy — all five sentences say "she plays music well." The rewritten version should collapse these into 1-2 sentences with specific details instead of generic praise. "talented/beautifully/touching/captivated/natural gift/memorable/unforgettable" are all saying the same thing. A good rewrite picks ONE concrete detail.`,
      },
      {
        id: "l5-3",
        level: 5,
        title: "The 24-Hour Rule",
        concept: `Never publish the day you write.

Stephen King puts every manuscript in a drawer for six weeks. You don't need six weeks — but you need at least one night of sleep between writing and publishing.

Why: your brain is still in creation mode when you finish writing. You're too close to see the flaws. After sleeping, you return with fresh eyes and suddenly see the sentence that makes no sense, the paragraph that wanders, the opening that bores.

Zinsser rewrote every piece at least three times. "The third draft is the one that says what I wanted to say."

The process: write (draft 1) → sleep → cut and restructure (draft 2) → sleep → polish and publish (draft 3).`,
        example: `**What you think at 11 PM:**
"This is the best thing I've ever written."

**What you see at 8 AM:**
"The first three paragraphs say the same thing. The ending trails off. And why did I use the word 'synergy'?"

**The fix isn't dramatic.** You cut the first two paragraphs (they were warm-up). You sharpen the ending. You replace "synergy" with "teamwork." Twenty minutes of editing transforms it from a draft into a piece.

The 24-hour rule isn't about finding errors — it's about gaining perspective.`,
        exerciseType: "write",
        exercisePrompt: `Write a short piece (6-8 sentences) on any topic. Then, WITHOUT rereading it from the top, write a second version of the same piece from memory. Compare the two — the second version is almost always tighter because you only remember what matters.`,
        exerciseText: "",
        feedbackPrompt: `Evaluate both versions. Is the second version tighter? Does it keep the essential ideas while dropping unnecessary details? This exercise demonstrates the 24-hour principle — distance from your first draft reveals what matters. Note: both versions should be on the topic. The second doesn't need to be perfect — the lesson is about the difference between them.`,
      },
    ],
  },
  {
    name: "Writing for the Web",
    lessons: [
      {
        id: "l6-1",
        level: 6,
        title: "Front-Load the Value",
        concept: `Web readers decide in 3 seconds. Your first paragraph must deliver value immediately.

Newspapers call this the "inverted pyramid" — the most important information comes first, details follow in descending order of importance.

Don't build up to your point. Start with it.

Blog post: "After extensive research and many conversations with experts in the field, I've come to believe that..." → NO.

Blog post: "Morning routines don't work. Here's what works instead." → YES.

The web reader's finger is on the scroll wheel. They're scanning, not reading. Earn their attention in the first line or lose them.`,
        example: `**Buried lead:**
"I've been thinking a lot lately about productivity. There are so many books and articles and courses about how to be more productive. Some of them are helpful, others less so. After trying dozens of approaches over the past five years, I've found that the single most effective strategy is simply sleeping more."

**Front-loaded:**
"Sleep more. That's it. That's the productivity hack that actually works. I tried dozens of approaches over five years. Nothing else came close."

Same content. The front-loaded version puts the answer in the first two words. The reader gets value immediately and stays to hear the reasoning.`,
        exerciseType: "fix",
        exercisePrompt: `Rewrite this opening to front-load the value. Put the key insight in the first sentence:`,
        exerciseText: `In today's rapidly changing world, it can be difficult to know which skills to invest time in learning. Technology evolves quickly, and what was relevant five years ago may not be relevant today. However, after spending considerable time researching and reflecting on this topic, I've concluded that the ability to write clearly is the most valuable skill anyone can develop, regardless of their profession or industry.`,
        feedbackPrompt: `Evaluate if the user front-loaded the value. "Clear writing is the most valuable skill" (or similar) should appear in the first sentence, not the last. The buildup ("in today's rapidly changing world...") should be cut or moved after the main point. Check: would a web reader get the key idea without scrolling?`,
      },
      {
        id: "l6-2",
        level: 6,
        title: "Headings as Navigation",
        concept: `On the web, headings aren't decoration — they're navigation.

A reader should understand your entire piece just by scanning the headings. If your headings are generic ("Introduction," "Discussion," "Conclusion"), they tell the reader nothing.

Good headings are mini-summaries:
- "Introduction" → "Why most diets fail"
- "Discussion" → "The three habits that actually work"
- "Conclusion" → "Start with breakfast"

Every heading should pass this test: if someone reads ONLY the headings, do they get the gist?

Use H2 for major sections, H3 for subsections. Skip H1 — that's your title.`,
        example: `**Generic headings (useless):**
- Introduction
- Background
- Main Points
- Discussion
- Conclusion

**Specific headings (useful):**
- Why I stopped using to-do lists
- The problem with capturing everything
- Three things that replaced my list
- What I lost (and what I gained)
- One notebook, one pen

A reader scanning the second set knows exactly what the article is about. The first set could be any article ever written.`,
        exerciseType: "write",
        exercisePrompt: `Write 5 headings (H2 level) for an article about one of these topics. The headings alone should tell the story:

1. Why you changed a habit
2. A tool that changed how you work
3. Something you learned the hard way

Pick one and write 5 headings.`,
        exerciseText: "",
        feedbackPrompt: `Evaluate the headings. Can you understand the article's story from the headings alone? Are they specific (not "Introduction" or "Conclusion")? Do they create a natural progression? Does each heading make you curious about what's underneath it? Penalize generic headings and reward specificity.`,
      },
      {
        id: "l6-3",
        level: 6,
        title: "White Space Is Your Friend",
        concept: `On the web, dense paragraphs die. Long blocks of text without breaks are unreadable on a screen.

Rules for web writing:
- **2-3 sentences per paragraph maximum.** What works in a book (5-7 sentences) doesn't work on screen.
- **One idea per paragraph.** Break aggressively.
- **Use line breaks between paragraphs.** Double spacing, not indentation.
- **Bold key phrases** so scanners catch the important parts.
- **Use lists** when you have 3+ parallel items.

White space isn't empty — it's breathing room. It tells the reader "you can pause here." Dense text says "figure it out yourself."

The best web writers — Paul Graham, Derek Sivers, Seth Godin — use short paragraphs. Some of Sivers' paragraphs are a single sentence.`,
        example: `**Dense (hard to read on screen):**
"When I first started writing online, I made every mistake possible. My paragraphs were long, my sentences were longer, and I had no idea how to format for the web. I'd write 500-word blocks of text with no subheadings, no bold, and no lists. It looked like a wall. Nobody read past the first paragraph. When I finally learned to break my writing into short paragraphs with lots of white space, my readership tripled."

**Formatted for web:**
"When I first started writing online, I made every mistake possible. Long paragraphs. Longer sentences. No formatting.

It looked like a wall. Nobody read past the first paragraph.

Then I learned to break text into short paragraphs with **lots of white space.**

My readership tripled."

Same word count. But one version gets read and the other gets scrolled past.`,
        exerciseType: "fix",
        exercisePrompt: `Reformat this dense paragraph for the web. Break it into short paragraphs, bold key phrases, and use a list where appropriate:`,
        exerciseText: `Making coffee at home saves money but most people do it wrong. They use pre-ground beans, they don't measure, and they wonder why it tastes bad. The three things that matter are fresh beans ground right before brewing, the correct ratio of coffee to water which is roughly one gram of coffee per fifteen grams of water, and water temperature between 195 and 205 degrees. If you get these three things right, your home coffee will taste better than most cafes. You don't need an expensive machine. A simple pour-over setup costs twenty dollars and makes better coffee than any pod machine.`,
        feedbackPrompt: `Evaluate the web formatting. Check for: (1) short paragraphs (2-3 sentences max), (2) bold on key phrases, (3) the three coffee rules formatted as a list, (4) white space between paragraphs. The content should be the same — just reformatted for readability. Penalize any paragraph longer than 3 sentences.`,
      },
    ],
  },
];

export function getLessonById(id: string): Lesson | undefined {
  for (const level of LEVELS) {
    const lesson = level.lessons.find((l) => l.id === id);
    if (lesson) return lesson;
  }
  return undefined;
}

export function getNextLesson(completedIds: string[]): Lesson | null {
  for (const level of LEVELS) {
    for (const lesson of level.lessons) {
      if (!completedIds.includes(lesson.id)) return lesson;
    }
  }
  return null;
}

export function isLevelUnlocked(levelIndex: number, completedIds: string[]): boolean {
  if (levelIndex === 0) return true;
  const prevLevel = LEVELS[levelIndex - 1];
  if (!prevLevel) return false;
  return prevLevel.lessons.every((l) => completedIds.includes(l.id));
}
