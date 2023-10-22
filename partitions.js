function getSongDetails(songName) {
    let notes, labels, partition, rhythm;

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
        1, 1, 1, 1,
        1, 1, 1, 1,
        1, 1, 1,
        1, 1, 1,
        0.75, 0.75, 0.75, 0.75, 0.75, 0.75,
        0.75, 0.75, 0.75, 0.75, 0.75, 0.75,
        1, 1, 1,
        1, 1, 1
    ];

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

    const imperialMarch = [
        "La", "La", "La",
        "Fa", "Do", "La",
        "Fa", "Do", "La",
        "Mi", "Mi", "Mi",
        "Fa", "Do", "La#",
        "Fa", "Do", "La#",
    ];

    const imperialMarchRhythm = [
        1, 1, 1,
        1, 0.5, 1,
        1, 0.5, 1,
        1, 1, 1,
        1, 0.5, 1,
        1, 0.5, 1,
    ];

    if (songName === "Brother John") {
        notes = majorScale;
        labels = noteNames;
        partition = brotherJohn;
        rhythm = brotherJohnRhythm;
    } else if (songName === "Twinkle Twinkle") {
        notes = majorScale;
        labels = noteNames;
        partition = twinkleTwinkle;
        rhythm = twinkleTwinkleRhythm;
    } else if (songName === "Happy Birthday") {
        notes = fullMajorScale;
        labels = fullNoteNames;
        partition = happyBirthday;
        rhythm = happyBirthdayRhythm;
    } else if (songName === "Imperial March") {
        notes = fullMajorScale;
        labels = fullNoteNames;
        partition = imperialMarch;
        rhythm = imperialMarchRhythm
    } else {
        return null;
    }

    return { notes : notes, labels : labels, partition : partition, rhythm: rhythm };
}
