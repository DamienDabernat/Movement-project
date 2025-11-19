function getSongDetails(songName) {
    let notes, labels, partition, rhythm, bpm = 120;

    const fullMajorScale = [261.63, 277.18, 293.66, 311.13, 329.63, 349.23, 369.99, 392.00, 415.30, 440.00, 466.16, 493.88, 523.25];
    const fullNoteNames = ["Do", "Do#", "Ré", "Ré#", "Mi", "Fa", "Fa#", "Sol", "Sol#", "La", "La#", "Si", "Do'"];

    const majorScale = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];
    const noteNames =  ["Do",   "Ré",   "Mi",   "Fa",  "Sol",   "La",   "Si",   "Do'"];

    const brotherJohn = [
        "Do", "Ré", "Mi", "Do",
        "Do", "Ré", "Mi", "Do",
        "Mi", "Fa", "Sol",
        "Mi", "Fa", "Sol",
        "Sol", "La", "Sol", "Fa","Mi", "Do",
        "Sol", "La", "Sol", "Fa","Mi", "Do",
        "Do", "Sol", "Do",
        "Do", "Sol", "Do"
    ];

    const brotherJohnRhythm = [
        1, 1, 1, 1.25,
        1, 1, 1, 1.25,
        1, 1, 1.25,
        1, 1, 1.25,
        1, 1, 1, 1, 1, 1.25,
        1, 1, 1, 1, 1, 1.25,
        0.5, 1, 1, 1,
        0.5, 1, 1, 1
    ];

    const brotherJohnBpm = 160;

    const twinkleTwinkle = [
        "Do", "Do", "Sol", "Sol", "La", "La", "Sol",
        "Fa", "Fa", "Mi", "Mi", "Ré", "Ré", "Do",
        "Sol", "Sol", "Fa", "Fa", "Mi", "Mi", "Ré",
        "Sol", "Sol", "Fa", "Fa", "Mi", "Mi", "Ré",
        "Do", "Do", "Sol", "Sol", "La", "La", "Sol",
        "Fa", "Fa", "Mi", "Mi", "Ré", "Ré", "Do"
    ];

    const twinkleTwinkleRhythm = [
        1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1
    ];

    const twinkleTwinkleBpm = 110;

    const happyBirthday = [
        "Do", "Do", "Ré", "Do", "Fa", "Mi",
        "Do", "Do", "Ré", "Do", "Sol", "Fa",
        "Do", "Do", "Do'", "La", "Fa", "Mi", "Ré",
        "La#", "La#", "La", "Fa", "Sol", "Fa"
    ];

    const happyBirthdayRhythm = [
        0.75, 0.25, 1, 1, 1, 2,
        0.75, 0.25, 1, 1, 1, 2,
        0.75, 0.25, 1, 1, 1, 1, 1,
        0.75, 0.25, 1, 1, 1, 2
    ];

    const happyBirthdayBpm = 160;

    const imperialMarch = [
        "Mi", "Mi", "Mi",
        "Do", "Sol#", "Fa",
        "Do", "Sol#", "Fa",
        "Si", "Si", "Si",
        "Sol", "Ré#", "Do",
        "Sol", "Fa", "Fa",
    ];

    const imperialMarchRhythm = [
        2, 2, 2,
        1.5, 0.5, 2,
        1.5, 0.5, 4,
        2, 2, 2,
        1.5, 0.5, 2,
        1.5, 0.5, 4,
    ];

    const imperialMarchBpm = 112;

    if (songName === "Brother John") {
        notes = majorScale;
        labels = noteNames;
        partition = brotherJohn;
        rhythm = brotherJohnRhythm;
        bpm = brotherJohnBpm;
    } else if (songName === "Twinkle Twinkle") {
        notes = majorScale;
        labels = noteNames;
        partition = twinkleTwinkle;
        rhythm = twinkleTwinkleRhythm;
        bpm = twinkleTwinkleBpm;
    } else if (songName === "Happy Birthday") {
        notes = fullMajorScale;
        labels = fullNoteNames;
        partition = happyBirthday;
        rhythm = happyBirthdayRhythm;
        bpm = happyBirthdayBpm;
    } else if (songName === "Imperial March") {
        notes = fullMajorScale;
        labels = fullNoteNames;
        partition = imperialMarch;
        rhythm = imperialMarchRhythm
        bpm = imperialMarchBpm;
    } else {
        return null;
    }

    return { notes : notes, labels : labels, partition : partition, rhythm: rhythm, bpm : bpm };
}

function bpmToMilliseconds(bpm) {
    return 60000 / bpm;
}

function bpmToSeconds(bpm) {
    return 60 / bpm;
}
