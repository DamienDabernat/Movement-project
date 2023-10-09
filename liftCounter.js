let state = "waiting";
let threshold = 0.75;
let liftCounter = 0;

function handleAcceleration(event) {
    document.getElementById('gameTextButton').innerHTML = liftCounter;

    let y = normalize(event.accelerationIncludingGravity.z, 'z', Mode.accelerometer)

    switch (state) {
        case "waiting":
            if (y > threshold) {
                state = "upward movement detected";
            }
            break;

        case "upward movement detected":
            if (y < (1-threshold)) {
                state = "downward movement detected";
                console.log("Weight lift detected");
                liftCounter++;
                if (liftCounter >= 10) {
                    playSound();
                    liftCounter = 0;
                }
                state = "waiting";
            }
            break;
    }
}

function playSound() {
    soundEffect.src = 'game_combo.mp3';
    soundEffect.play();
}

document.getElementById('gameButton').addEventListener("click", async function (ev) {
    const soundEffect = new Audio();
    soundEffect.src = 'button_click.mp3';
    await soundEffect.play();
    window.addEventListener("devicemotion", handleAcceleration, true);
});


