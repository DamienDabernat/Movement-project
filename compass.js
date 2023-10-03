const compassCanvas = document.getElementById('compassCanvas');
const ctx = compassCanvas.getContext('2d');

function drawCompass(degree) {
    const radius = compassCanvas.width / 2;
    ctx.clearRect(0, 0, compassCanvas.width, compassCanvas.height);  // Effacer le canvas
    ctx.save();
    ctx.translate(radius, radius);  // Déplacer l'origine au centre du canvas
    ctx.rotate(degree * (Math.PI / 180));  // Convertir les degrés en radians et faire tourner le canvas

    // Dessiner l'aiguille de la boussole
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -radius);
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();
}

if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', (event) => {
        const alpha = event.alpha;  // Orientation autour de l'axe Z (0 - 360)
        drawCompass(alpha);
    });
} else {
    document.getElementById('error').innerHTML = 'Device orientation API not supported';
}
