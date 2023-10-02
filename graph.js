
function drawAxis(grid) {
    CONTEXT.lineWidth = 1;
    CONTEXT.strokeStyle = '#000';
    CONTEXT.beginPath();
    CONTEXT.moveTo(0, HEIGHT/2);
    CONTEXT.lineTo(WIDTH, HEIGHT/2);
    CONTEXT.stroke();

    const count = HEIGHT / 2 / (grid * scaleY);

    CONTEXT.strokeStyle = '#bbb';
    for (let i=1; i<count; i++){
        CONTEXT.beginPath();
        CONTEXT.moveTo(0, HEIGHT/2-i*grid*scaleY);
        CONTEXT.lineTo(WIDTH, HEIGHT/2-i*grid*scaleY);
        CONTEXT.stroke();

        CONTEXT.beginPath();
        CONTEXT.moveTo(0, HEIGHT/2+i*grid*scaleY);
        CONTEXT.lineTo(WIDTH, HEIGHT/2+i*grid*scaleY);
        CONTEXT.stroke();
    }
}

function drawGraph(samples, color, scaleX, scaleY) {
    CONTEXT.save();
    CONTEXT.translate(0, HEIGHT/3);

    CONTEXT.strokeStyle = color;
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
