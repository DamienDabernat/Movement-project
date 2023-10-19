function getSongDetails(songName) {
    let notes, labels, partition;

    const fullMajorScale = [261.63, 277.18, 293.66, 311.13, 329.63, 349.23, 369.99, 392.00, 415.30, 440.00, 466.16, 493.88, 523.25];
    const fullNoteNames = ["Do", "Do#", "Ré", "Ré#", "Mi", "Fa", "Fa#", "Sol", "Sol#", "La", "La#", "Si", "Do'"];

    const majorScale = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];
    const noteNames =  ["Do",   "Ré",   "Mi",   "Fa",  "Sol",   "La",   "Si",   "Do'"];

    const brotherJohn = [
        "Do", "Ré", "Mi", "Do",
        "Do", "Ré", "Mi", "Do",
        "Mi", "Fa", "Sol",
        "Mi", "Fa", "Sol",
        "Sol", "La", "Sol", "Fa",
        "Mi", "Do", "Mi", "Do",
        "Do", "Sol", "La", "Si",
        "Do", "Sol", "La", "Si",
        "Si", "La", "Sol", "Fa",
        "Mi", "Do", "Mi", "Do",
        "Do", "Sol", "Do",
        "Do", "Sol", "Do"
    ];

    const twinkleTwinkle = [
        "Do", "Do", "Sol", "Sol", "La", "La", "Sol",
        "Fa", "Fa", "Mi", "Mi", "Ré", "Ré", "Do",
        "Sol", "Sol", "Fa", "Fa", "Mi", "Mi", "Ré",
        "Sol", "Sol", "Fa", "Fa", "Mi", "Mi", "Ré",
        "Do", "Do", "Sol", "Sol", "La", "La", "Sol",
        "Fa", "Fa", "Mi", "Mi", "Ré", "Ré", "Do"
    ];

    const happyBirthday = [
        "Do", "Do", "Ré", "Do", "Fa", "Mi",
        "Do", "Do", "Ré", "Do", "Sol", "Fa",
        "Do", "Do", "Do'", "Ré", "Fa", "Mi", "Ré",
        "La#", "La#", "La", "Fa", "Sol", "Fa"
    ];

    const sevenNationArmy = [
        "Mi", "Sol", "Sol", "Fa#", "Mi", "Ré", "Do",
        "Mi", "Sol", "Sol", "Fa#", "Mi", "Ré", "Mi",
        "Mi", "Sol", "Sol", "Fa#", "Mi", "Ré", "Do",
        "Do", "Do", "Ré", "Mi"
    ];


    if (songName === "Brother John") {
        notes = majorScale;
        labels = noteNames;
        partition = brotherJohn;
    } else if (songName === "Twinkle Twinkle") {
        notes = majorScale;
        labels = noteNames;
        partition = twinkleTwinkle;
    } else if (songName === "Happy Birthday") {
        notes = fullMajorScale;
        labels = fullNoteNames;
        partition = happyBirthday;
    } else if (songName === "Seven Nation Army") {
        notes = fullMajorScale;
        labels = fullNoteNames;
        partition = sevenNationArmy;
    } else {
        return null;
    }

    return { notes : notes, labels : labels, partition : partition };
}

// Test the function
const songDetails = getSongDetails("Brother John");
console.log(songDetails);



//const majorScale = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];
//const noteNames =  ["Do",   "Ré",   "Mi",   "Fa",  "Sol",   "La",   "Si",   "Do'"];
const brotherJohn = [
    "Do", "Ré", "Mi", "Do",
    "Do", "Ré", "Mi", "Do",
    "Mi", "Fa", "Sol",
    "Mi", "Fa", "Sol",
    "Sol", "La", "Sol", "Fa",
    "Mi", "Do", "Mi", "Do",
    "Do", "Sol", "La", "Si",
    "Do", "Sol", "La", "Si",
    "Si", "La", "Sol", "Fa",
    "Mi", "Do", "Mi", "Do",
    "Do", "Sol", "Do",
    "Do", "Sol", "Do"
];

//const majorScale = [261.63, 277.18, 293.66, 311.13, 329.63, 349.23, 369.99, 392.00, 415.30, 440.00, 466.16, 493.88, 523.25];
//const noteNames = ["Do", "Do#", "Ré", "Ré#", "Mi", "Fa", "Fa#", "Sol", "Sol#", "La", "La#", "Si", "Do'"];
const furElise = [
    "Mi", "Ré#", "Mi", "Ré#", "Mi", "Si", "Do", "La",
    "Sol#", "Fa#", "Sol#", "Fa#", "Sol#", "Mi", "Do", "Si", "La",
    "Mi", "La", "Si",
    "Mi", "Sol#", "Si", "Do", "Ré",
    "Mi", "La", "Si",
    "Mi", "Sol#", "Si", "Do", "Ré",
    "Ré#", "Do", "Si", "La", "Si", "Do", "Ré#",
];
