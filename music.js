let paused = false;

let soundEffect = undefined;

if (!window.DeviceMotionEvent) {
  document.getElementById('error').innerHTML = 'Device motion API not supported';
} else {

  requestPermission()
      .then(() => {
        // Code à exécuter après avoir obtenu la permission sur iOS ou sur Android
        window.addEventListener("devicemotion",  (event) => {
          draw(event)
        }, false);
      })
      .catch(err => {
        console.error('An error occurred:', err);
      });


  document.getElementById('pause').addEventListener("click", function(ev){
    paused = !paused;
    document.getElementById('error').innerHTML = (isRefresh ? '' : 'Paused');
  });

}

const drawingCanvas = document.getElementById('drawingCanvas');
const drawingContext = drawingCanvas.getContext('2d');

let lastX = drawingCanvas.width / 2;
let lastY = drawingCanvas.height / 2;

function draw(event) {
  const accel = event.accelerationIncludingGravity;

  // Inverser les axes sur iOS
  const factor = is_iOS() ? -1 : 1;

  // Calculer la nouvelle position du pinceau en fonction de l'inclinaison
  let newX = lastX - (accel.x * factor);
  let newY = lastY + (accel.y * factor);


  // On s'assure que les nouvelles coordonnées sont dans les limites du canvas
  newX = Math.max(0, Math.min(newX, drawingCanvas.width));
  newY = Math.max(0, Math.min(newY, drawingCanvas.height));

  // Dessiner une ligne de la dernière position à la nouvelle position
  drawingContext.beginPath();
  drawingContext.moveTo(lastX, lastY);
  drawingContext.lineTo(newX, newY);
  drawingContext.lineWidth = 4;
  drawingContext.strokeStyle = '#000d5d';
  drawingContext.stroke();

  // Mettre à jour la dernière position pour le prochain dessin
  lastX = newX;
  lastY = newY;

  // drawingContext.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height); // Effacer le canvas
}
