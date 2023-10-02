
function drawAxis() {
    CONTEXT.lineWidth = 1;
    CONTEXT.strokeStyle = '#494949';

    // Définir l'intervalle entre les lignes de la grille
    const numberOfGridLines = 4;
    const gridInterval = HEIGHT / numberOfGridLines;

    for (let i = 1; i < numberOfGridLines; i++) {  // i commence à 1 et se termine à 3 pour dessiner trois lignes
        const yPos = i * gridInterval;

        // Vérifiez si i est égal à numberOfGridLines/ 2 (ligne du milieu)
        if (i === numberOfGridLines / 2) {
            CONTEXT.lineWidth = 2;
            CONTEXT.strokeStyle = '#000';  // Couleur plus foncée pour l'axe du milieu
        } else {
            CONTEXT.lineWidth = 1;
            CONTEXT.strokeStyle = '#bbb';  // Couleur plus claire pour les autres axes
        }

        CONTEXT.beginPath();
        CONTEXT.moveTo(0, yPos);
        CONTEXT.lineTo(WIDTH, yPos);
        CONTEXT.stroke();
    }
}

function drawGraph(samples, color, scaleX, scaleY) {
    CONTEXT.save();

    // Inverser l'axe des ordonnées et ajuster l'échelle
    CONTEXT.transform(1, 0, 0, -1, 0, HEIGHT);

    CONTEXT.strokeStyle = color;
    CONTEXT.lineWidth = 3;

    CONTEXT.beginPath();
    const len = samples.length;
    CONTEXT.moveTo(0, samples[0] * scaleY);
    for(let i = 0; i < len; i++){
        CONTEXT.lineTo(i*scaleX, samples[i]*scaleY);
    }
    CONTEXT.stroke();

    CONTEXT.restore();
}


function drawLegend() {
    const scale = 2;
    CONTEXT.save();
    CONTEXT.scale(scale, scale);

    if(selectedMode === Mode.accelerometer || selectedMode === Mode.both) {
        CONTEXT.fillStyle = COLORS.ACCEL.x;
        CONTEXT.fillRect(10, 10, 10, 10);
        CONTEXT.fillStyle = '#000';
        CONTEXT.fillText('Acc . X', 25, 20);

        CONTEXT.fillStyle = COLORS.ACCEL.y;
        CONTEXT.fillRect(70, 10, 10, 10);
        CONTEXT.fillStyle = '#000';
        CONTEXT.fillText('Acc. Y', 85, 20);

        CONTEXT.fillStyle = COLORS.ACCEL.z;
        CONTEXT.fillRect(130, 10, 10, 10);
        CONTEXT.fillStyle = '#000';
        CONTEXT.fillText('Acc. Z', 145, 20);
    }

    if(selectedMode === Mode.gyroscope || selectedMode === Mode.both) {
        CONTEXT.fillStyle = COLORS.GYRO.alpha;
        CONTEXT.fillRect(10, 30, 10, 10);
        CONTEXT.fillStyle = '#000';
        CONTEXT.fillText('G. Alpha', 25, 40);

        CONTEXT.fillStyle = COLORS.GYRO.beta;
        CONTEXT.fillRect(70, 30, 10, 10);
        CONTEXT.fillStyle = '#000';
        CONTEXT.fillText('G. Beta', 85, 40);

        CONTEXT.fillStyle = COLORS.GYRO.gamma;
        CONTEXT.fillRect(130, 30, 10, 10);
        CONTEXT.fillStyle = '#000';
        CONTEXT.fillText('G. Gamma', 145, 40);
    }

    CONTEXT.restore();
}
