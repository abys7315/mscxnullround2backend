// seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const Team = require('./src/models/Team');
const QuestionSet = require('./src/models/QuestionSet');
const Submission = require('./src/models/Submission');
const Feedback = require('./src/models/Feedback');

const questionSets = [];

const puzzles = [
  {
    title: "Puzzle R1 — “The Shattered Lock”",
    ciphertext: "KHOOR",
    clue: "“Three times I guard the door,<br>My modulus is a twin prime floor,<br>Break the cube and shift the key,<br>Only then you’ll talk to me.”",
    answer: "HELLO"
  },
  {
    title: "Puzzle R2 — “The Crossing Paths”",
    ciphertext: "OLSSV",
    clue: "“One path divides by three,<br>Another leaves one on four,<br>Together they whisper the number,<br>Which moves the words back in time.”",
    answer: "HELLO"
  },
  {
    title: "Puzzle R3 — “Mirror in the River”",
    ciphertext: "SVOOL",
    clue: "“What you see is not what you get,<br>For I am the mirror alphabet.<br>Decode me, and I’ll say hi,<br>But my cube key also waves nearby.”",
    answer: "HELLO"
  },
  {
    title: "Puzzle R4 — “The Endless Table”",
    ciphertext: "V0VG",
    clue: "“Letters on a table,<br>Yet not base ten.<br>Decode me once,<br>Then decode again.”",
    answer: "VIT"
  },
  {
    title: "Puzzle R5 — “The Split Rail”",
    ciphertext: "IRYHZOZS",
    clue: "“My words walk two tracks,<br>Yet reversed in a mirror of time.<br>Stitch them back, then invert,<br>And you’ll see my true rhyme.”",
    answer: "RAIL BASH"
  },
  {
    title: "Puzzle R6 — “The Wandering Sun”",
    ciphertext: "AXHETPL",
    clue: "“I rise with the key of light,<br>Guiding letters through the night.<br>When my journey’s done in pairs,<br>The path is straightened from the stairs.”",
    answer: "EXAMPLE"
  },
  {
    title: "Puzzle R7 — “The Twin Guardians”",
    ciphertext: "8",
    clue: "“Two numbers hold the gate,<br>One is 17, the other 3120’s fate.<br>Inverse the step, and walk back through,<br>Only then the message comes to you.”",
    answer: "A"
  },
  {
    title: "Puzzle 8 — RSA (mini) → Caesar",
    ciphertext: "KHOOR",
    clue: "RSA with n=77, e=3, c=27 gives key k (integer cube root). Then Caesar -k.",
    answer: "HELLO"
  },
  {
    title: "Puzzle 9 — CRT → Rail Fence (3 rails)",
    ciphertext: "HOELL",
    clue: "Solve x ≡ 0 (mod 3), x ≡ 1 (mod 2); let r = x. 3-rail fence decrypt with r rails.",
    answer: "HELLO"
  },
  {
    title: "Puzzle 10 — Base64 → Caesar −2",
    ciphertext: "U0VMTE8=",
    clue: "Base64 decode, then Caesar −2.",
    answer: "HELLO"
  },
  {
    title: "Puzzle 11 — Base32 → Atbash",
    ciphertext: "JBSWY3DP",
    clue: "Base32 decode, then Atbash.",
    answer: "SVOOL"
  },
  {
    title: "Puzzle 12 — Columnar (key=3142) → Atbash",
    ciphertext: "EHTOLWLROD",
    clue: "Columnar transposition decrypt (key=3142), then Atbash.",
    answer: "SVOOLDLIOW"
  },
  {
    title: "Puzzle 13 — Rail Fence (2 rails) → Base64",
    ciphertext: "SEVMTE8=",
    clue: "Base64 decode, then 2-rail fence decrypt.",
    answer: "HELLO"
  },
  {
    title: "Puzzle 14 — RSA (mini) → Atbash",
    ciphertext: "SVOOL",
    clue: "Atbash first, then RSA key for check: (n=55, e=3, c=8) ⇒ M is small cube. (The RSA step confirms the shift idea.)",
    answer: "HELLO"
  },
  {
    title: "Puzzle 15 — Vigenère (key=SUN) → Rail Fence (2 rails)",
    ciphertext: "AXHETPL",
    clue: "Vigenère decrypt (key=SUN), then 2-rail fence decrypt.",
    answer: "EXAMPLE"
  },
  {
    title: "Puzzle 16 — Base64 → Atbash → Caesar +1",
    ciphertext: "SEVMTE8=",
    clue: "Base64 decode, then Atbash, then Caesar +1.",
    answer: "SVOOL"
  },
  {
    title: "Puzzle 17 — CRT → Caesar",
    ciphertext: "OLSSV",
    clue: "Solve x ≡ 1 (mod 4), x ≡ 2 (mod 3); let k=x. Then Caesar −k.",
    answer: "HELLO"
  },
  {
    title: "Puzzle 18 — Base32 → Caesar +5 → Rail Fence (2 rails)",
    ciphertext: "JBSWY3DPFQQFO33SNRSCC===",
    clue: "Base32 decode, then Caesar +5, then 2-rail fence decrypt.",
    answer: "HELLO WORLD"
  },
  {
    title: "Puzzle 19 — Affine (a=5,b=8) → Atbash",
    ciphertext: "IWT",
    clue: "Affine decrypt with a=5, b=8, then Atbash.",
    answer: "XZG"
  },
  {
    title: "Puzzle 20 — Rail Fence (3 rails) → Base64",
    ciphertext: "SEVDUkVU",
    clue: "Base64 decode, then 3-rail fence decrypt.",
    answer: "SECRET"
  },
  {
    title: "Puzzle 21 — “Triple Encode”",
    ciphertext: "IJQXGZJTGI======",
    clue: "“Decode in three locks: Base64 → Base32 → Caesar -5.”",
    answer: "HELLO"
  },
  {
    title: "Puzzle 22 — “Layered Lock”",
    ciphertext: "WRUVZL",
    clue: "“Three steps: Vigenère (key=SECURE) → Columnar (key=53124) → Atbash.”",
    answer: "SAFETY"
  },
  {
    title: "Puzzle 23 — “Mini RSA”",
    ciphertext: "10",
    clue: "“n=33, e=3. Ciphertext=10. Find message.”",
    answer: "4"
  },
  {
    title: "Puzzle 24 — “Hill Cipher 2x2”",
    ciphertext: "POH",
    clue: "“Matrix [[3,3],[2,5]]. Decrypt.”",
    answer: "ATT"
  },
  {
    title: "Puzzle 25 — “Final Puzzle — ManyLocks”",
    ciphertext: "LZQXTGZ",
    clue: "“My first is mirrored,<br>my second shuffled in a grid,<br>my third walks rails of three,<br>my last is shifted back by 1.”",
    answer: "PUZZLING"
  },
  {
    title: "Puzzle 26 — “The Fractured Mirror”",
    ciphertext: "GSVXLWVGL",
    clue: "“I am a mirror turned twice,<br>yet my rails hide in threes,<br>Find the true me in steps,<br>and the greeting you will seize.”",
    answer: "HELLO"
  },
  {
    title: "Puzzle 27 — “The Modular Sun”",
    ciphertext: "QNUUX",
    clue: "“The sun hides in a key of light,<br>But before you shine, walk the modulus night.<br>Solve x ≡ 2 (mod 7), x ≡ 3 (mod 5),<br>That x will guide you where Caesar thrives.”",
    answer: "HELLO"
  },
  {
    title: "Puzzle 28 — “The Hidden Matrix”",
    ciphertext: "ZYDLLG",
    clue: "“My words are locked in a square,<br>a 2×2 grid with determinant fair.<br>Use the key [[7,8],[11,11]], invert my spell,<br>Only then my secret you can tell.”",
    answer: "SECRET"
  },
  {
    title: "Puzzle 29 — “The Triple Lock”",
    ciphertext: "JBSWY3DPEBLW64TMMQ======",
    clue: "“I speak in threes, base by base,<br>then shift with Caesar’s embrace.<br>At last I walk two rails in rhyme,<br>to bring my message back in time.”",
    answer: "HELLO WORLD"
  },
  {
    title: "Puzzle 30 — “The Final Cipher — Number’s End”",
    ciphertext: "1425",
    clue: "“My prison is a modulus of two primes,<br>I walk with a power of 7.<br>But my key is the mirror of 1001,<br>and only then I’ll reveal the time.”",
    answer: "{"
  },
  {
    title: "Puzzle 31 — Vigenère → Caesar → Reverse",
    ciphertext: "BQNH BBR XCBBA",
    clue: "First apply a Caesar shift of +4 (i.e., shift letters forward by 4).<br>Then reverse the whole line (read right-to-left).<br>Finally, decrypt with Vigenère key.",
    answer: "CHECK THE HASH"
  },
  {
    title: "Puzzle 32 — Rail fence (3 rails) → Caesar",
    ciphertext: "NAUGQMQTEGPEWT",
    clue: "Reconstruct a 3-rail rail-fence zig-zag (plaintext had no spaces), rails concatenated as rail1+rail2+rail3.<br>Then apply a Caesar shift of −2 (shift letters back by 2).<br>Insert spaces for a readable phrase.",
    answer: "LOCK YOUR SCREEN"
  },
  {
    title: "Puzzle 33 — Caesar → Base64",
    ciphertext: "V1VYVlcgUVIgUERGVVI=",
    clue: "First decode Base64 (it uses letters, digits, +, /, with = padding).<br>After decoding, apply a Caesar shift of -3 (shift letters back by 3) to get the final line.",
    answer: "TRUST NO MACRO"
  },
  {
    title: "Puzzle 34 — Affine → Reverse",
    ciphertext: "LUVFBUVGGH",
    clue: "First undo an Affine cipher with parameters a=5, b=7 (mod 26).<br>Then reverse the line (read right-to-left).<br>Spaces by meaning.",
    answer: "AFFINE KING"
  },
  {
    title: "Puzzle 35 — Hill (2×2) → Reverse",
    ciphertext: "APKGKAZSAKTE",
    clue: "This used a Hill 2×2 matrix [[3,3],[2,5]] and then the whole line was reversed.<br>Undo the reverse, then decrypt Hill (mod 26).",
    answer: "TRUST NO MACRO"
  },
  {
    title: "Puzzle 36 — Rail fence (3 rails) → Affine → Reverse",
    ciphertext: "PFBGMWMEJYXRCC",
    clue: "Undo a 3-rail rail-fence (plaintext had no spaces).<br>Then undo an Affine with a=7, b=2 (mod 26).",
    answer: "DISABLE AUTORUN"
  },
  {
    title: "Puzzle 37 — Caesar → Hill (3×3)",
    ciphertext: "CQZIZWFQAKAPBGKGZT",
    clue: "Decrypt a Hill 3×3 with matrix [[6,24,1],[13,16,10],[20,17,15]] (mod 26).<br>Undo a Caesar shift of −5 (i.e., shift letters back by 5).",
    answer: "DO NOT PLUG RANDOM USB"
  },
  {
    title: "Puzzle 38 — Base32 → Affine",
    ciphertext: "IZMVQWCFEBHUKTCYJY======",
    clue: "Decode Base32 to ASCII text.<br>Then undo an Affine cipher with a=11, b=6 (mod 26).",
    answer: "HELLO WORLD"
  },
  {
    title: "Puzzle 39 — Playfair → Reverse",
    ciphertext: "UOIDKOUPGKEYYX",
    clue: "Decrypt Playfair using key = SECURITY (I/J combined).<br>Then reverse the whole line.",
    answer: "WATCH FOR PHISH"
  },
  {
    title: "Puzzle 40 — Caesar → Playfair",
    ciphertext: "XAZBYHBWZXWKIC",
    clue: "First decrypt with Playfair key = PASSWORD.<br>Then apply a Caesar shift of −4.",
    answer: "ROTATE YOUR KEYS"
  },
  {
    title: "Puzzle 41 — Atbash → Rail Fence",
    ciphertext: "IRYHZOZS",
    clue: "Decrypt 2-rail fence cipher<br>Reverse atbash cipher",
    answer: "RAIL BASH"
  },
  {
    title: "Puzzle 42 — Iterative Base64",
    ciphertext: "VmtsVQ==",
    clue: "Decrypting one time might not be enough.",
    answer: "VIT"
  },
  {
    title: "Puzzle 43 — Iterative Base32",
    ciphertext: "JFHE2VKFKJFVG===",
    clue: "Decrypting multiple times until readable text is found.",
    answer: "CYBER"
  },
  {
    title: "Puzzle 44 — Playfair → Hill (2×2) → ROT13",
    ciphertext: "YWYVUHYWFCOB",
    clue: "“Undo ROT13, then invert Hill(2×2) with [[3,3],[2,5]], then Playfair (key = PUZZLE).”",
    answer: "ATTACK AT DAWN"
  },
  {
    title: "Puzzle 45 — Hill (2×2) → Playfair → Atbash",
    ciphertext: "LYBJ",
    clue: "“Atbash last. First invert Hill (key [[3,3],[2,5]]). Middle step: Playfair with key=SECRET.”",
    answer: "GOLD"
  },
  {
    title: "Puzzle 46 — Playfair → ROT+5 → MD5 (verification)",
    ciphertext: "e9d6025fb8a83cb249c5071cf280d410",
    clue: "“Playfair (key = GUARD) then ROT +5; the MD5 hash of the result is given for verification.”",
    answer: "SECRET"
  },
  {
    title: "Puzzle 47 — Hill (key [[7,8],[11,11]]) → Atbash → Base64",
    ciphertext: "UVRYSFpYRUM=",
    clue: "“Base64 decode, then Atbash, then invert Hill with [[7,8],[11,11]].”",
    answer: "TREASURE"
  },
  {
    title: "Puzzle 48 — CRT → ROT → Playfair (key ALERT)",
    ciphertext: "MCPRPL",
    clue: "“Solve CRT to get k; ROT −k next; finally Playfair decrypt with key = ALERT.”<br>(Specific CRT given in the riddle below.)<br>Riddle/CRT clue: “x ≡ 2 (mod 3), x ≡ 1 (mod 4). Use x as the rotation amount.”",
    answer: "DANGER"
  },
  {
    title: "Puzzle 49 — “The Simple Echo”",
    ciphertext: "URYYB",
    clue: "A single classic shift hides me.",
    answer: "HELLO"
  },
  {
    title: "Puzzle 50 — “The Zigzag Secret”",
    ciphertext: "HOLELWRDLO",
    clue: "Rebuild a 3‑rail rail‑fence zig‑zag (plaintext had no spaces).",
    answer: "HELLO WORLD"
  }
];

// Generate 50 fill-in-the-blanks questions
for (let i = 0; i < 50; i++) {
  const puzzle = puzzles[i];
  questionSets.push({
    setNumber: i + 1,
    question: {
      title: puzzle.title,
      description: `<strong>Ciphertext:</strong> ${puzzle.ciphertext}<br><strong>Riddle Clue:</strong><br>${puzzle.clue}`,
      type: 'fill_blank'
    },
    answer: puzzle.answer,
    active: true
  });
}

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding...');

    // Clear existing data
    await Team.deleteMany({});
    await QuestionSet.deleteMany({});
    await Submission.deleteMany({});
    await Feedback.deleteMany({});
    console.log('Cleared existing data.');

    // Insert new questions
    await QuestionSet.insertMany(questionSets);
    console.log('Question sets have been seeded.');

  } catch (err) {
    console.warn('Error seeding:', err);
  } finally {
    mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
};

seed();