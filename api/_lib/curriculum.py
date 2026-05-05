TOPIK_DESCRIPTIONS = {
    1: "absolute beginner — knows Hangul basics, simple greetings, numbers",
    2: "beginner — ~800 vocab words, present/past tense, simple sentences",
    3: "intermediate — ~1500-2000 vocab, expressing opinions, compound sentences",
    4: "upper-intermediate — ~3000 vocab, news topics, abstract reasoning",
    5: "advanced — ~5000 vocab, formal/informal register, complex grammar",
    6: "master — near-native, nuanced usage, idiomatic expressions",
}

TOPIK_GRAMMAR_CURRICULUM = {
    1: [
        "이다/아니다 (to be / not to be)",
        "은/는 (topic marker)",
        "이/가 (subject marker)",
        "을/를 (object marker)",
        "에 (location/time particle)",
        "Present tense: -아/어요",
        "Past tense: -았/었어요",
        "Negation: 안 + verb",
        "있다/없다 (existence/possession)",
        "-(으)로 (direction/means)",
    ],

    2: [
        "-(으)ㄹ 거예요 (future tense)",
        "-고 싶다 (want to)",
        "못 + verb (can't)",
        "-(으)면 (if/when conditional)",
        "-(아/어)서 (because/so, sequential)",
        "-(으)ㄴ/는데 (background contrast)",
        "-지만 (but/however)",
        "-(으)ㄹ 수 있다/없다 (can/cannot)",
        "-기 전에 (before doing)",
        "-고 나서 (after doing)",
    ],

    3: [
        # Core intermediate (high-frequency, must-know)
        "indirect speech: -다고 하다",
        "passive voice: -이/히/리/기",
        "causative: -이/히/리/기/우/추",
        "Honorifics basics",

        "-아/어 보다 (try doing)",
        "-(으)ㄹ 것 같다 (seems like)",
        "-게 되다 (end up doing)",

        # High-frequency connectors
        "-아/어도 (even if/though)",
        "-다가 (while doing → switch)",
        "-느라고 (because of, negative result)",
        "-더라도 (even if, stronger)",
        "-(으)ㄴ/는/(으)ㄹ 만큼 (to the extent of)",
        "-든지 (either/or, regardless)",
        "-는 대로 (as soon as / as is)",
        "-자마자 (as soon as)",

        # Time & sequence
        "-(으)ㄹ 때 (when)",
        "-는 동안 (while)",
        "-고 나서 vs -고 보니까 (realization)",

        # Expression patterns
        "-아/어 봤자 (even if you try)",
        "-(으)ㄹ까 봐(서) (for fear that)",
        "-기에는 (too... to)",
        "-거든 (if/when casual condition)",

        # Auxiliary / state
        "-아/어 있다 (state after action)",
    ],

    4: [
        # Contrast / cause / reasoning
        "-(으)ㄴ/는 반면에 (contrast)",
        "-는 바람에 (unexpected negative cause)",
        "-(으)ㄴ/는 탓에 (cause/blame)",
        "-느라고 vs -는 바람에 nuance",
        "-길래 (because I saw/felt)",
        "-다 보니(까) (as I kept doing)",
        "-기에 / -다기에 (because I heard)",

        # Advanced connectors
        "-(으)ㄹ 뿐만 아니라 (not only but also)",
        "-(으)면서(도) (while / even though)",
        "-도록 (to the extent / so that)",
        "-(으)ㄴ 채로 (while still in a state)",
        "-(으)ㄹ 겸 (while also doing)",
        "-는 김에 (while you're at it)",

        # Perception / guessing
        "-나 보다 / -(으)ㄴ가 보다",
        "-(으)ㄴ/는/(으)ㄹ 모양이다",
        "-(으)ㄴ/는/(으)ㄹ 듯하다",

        # Descriptive past
        "-던 / -았었던 (recollection vs completed past)",

        # Ending expressions
        "-(으)ㄴ/는 셈이다 (it amounts to)",
        "-(으)ㄹ 리가 없다 (no way)",
        "-던데(요) (background + reaction)",
        "-어/아 가다/오다 (change over time)",

        # Particles (보조사)
        "-치고(는)",
        "-(이)야말로",
        "-조차",
        "-마저",
        "-은/는커녕",
        "-밖에",
        "-(이)나마",
    ],

    5: [
        # Subtle connectors & discourse
        "-더니 / -았었더니 (change after experience)",
        "-는 둥 마는 둥 (half-hearted action)",
        "-곤하다 (habitual)",
        "-기만 하면 (whenever)",
        "-는 법이다 (general truth)",

        # Intent / plan / hesitation
        "-(으)려던 참이다 (was just about to)",
        "-(으)ㄹ까 하다 (thinking of doing)",
        "-(으)려다가 (was going to but…)",

        # Nuanced expressions
        "-(으)ㄴ/는 척하다 (pretend to)",
        "-다시피 하다 (almost / practically)",
        "-고 보니까 (realization after doing)",
        "-는 길에 (on the way)",

        # Results / inevitability
        "-고 말다 (end up doing)",
        "-기 마련이다 (inevitably happens)",
        "-(으)ㄹ 뻔하다 (almost did)",

        # Emphasis / tone
        "-기는 하다 (acknowledging contrast)",
        "-기는요 (denial / politeness nuance)",
    ],

    6: [
        # Formal / written / rare but high-value
        "Literary endings: -다 / -ㄴ다",
        "Formal connectors: -(으)ㄹ진대",
        "-(으)로 인해 (formal cause)",
        "-(으)ㄹ 따름이다 (nothing but)",
        "-(으)ㄹ 뿐이다 (only / merely)",

        # Complex structures
        "-(으)ㄴ다면 (hypothetical advanced)",
        "-(으)ㄴ 나머지 (extreme result)",
        "-고도 (even though)",
        "Double subject constructions",
        "Complex relative clauses",

        # High-level nuance connectors
        "-는 통에 (negative cause, stronger)",
        "-에 비하여 / 비해서 (comparison)",
        "-고 보니 (retrospective realization)",

        # Register & discourse mastery
        "Formal vs informal register contrast",
        "Nuances of speech levels",
        "Advanced nominalization (-음 vs -기)",

        # Idiomatic mastery
        "Proverbs and 사자성어",
    ],
}

DAILY_CHALLENGE_SENTENCES = {
    1: [
        "I go to school every day.",
        "This is my bag.",
        "The weather is nice today.",
        "I like Korean food.",
        "Where is the bathroom?",
        "How much is this?",
        "I am a student.",
        "Please speak slowly.",
    ],
    2: [
        "I want to travel to Korea next year.",
        "Can you recommend a good restaurant?",
        "I have been studying Korean for six months.",
        "She called me because she was worried.",
        "I can't eat spicy food.",
        "Before going to sleep, I read a book.",
    ],
    3: [
        "The more I study, the more I realize how much I don't know.",
        "Despite being tired, he finished all his work.",
        "I ended up moving to a new city for work.",
        "While I was cooking, my friend came over.",
        "In order to improve my Korean, I practice every day.",
    ],
    4: [
        "Not only did she pass the exam, but she also got the highest score.",
        "Depending on the weather, we may cancel the outdoor event.",
        "As long as you keep practicing, you will definitely improve.",
    ],
    5: [
        "The government announced new policies aimed at reducing carbon emissions.",
        "Despite the difficulties, the team managed to complete the project on time.",
    ],
    6: [
        "The significance of cultural exchange cannot be overstated in today's globalized world.",
        "One must consider both the short-term benefits and long-term consequences of such decisions.",
    ],
}
