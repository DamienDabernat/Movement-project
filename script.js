const canvas = document.getElementById('canvas');
const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const CONTEXT = canvas.getContext('2d');

let selectedMode = Mode.accelerometer;

const accel_samples = {};
const gyro_samples = {};

const scaleX = WIDTH / SAMPLES_COUNT;
const scaleY = 150;


let isRefresh = true;

accel_samples.x = getInitArr(SAMPLES_COUNT);
accel_samples.y = getInitArr(SAMPLES_COUNT);
accel_samples.z = getInitArr(SAMPLES_COUNT);

gyro_samples.x = getInitArr(SAMPLES_COUNT);
gyro_samples.y = getInitArr(SAMPLES_COUNT);
gyro_samples.z = getInitArr(SAMPLES_COUNT);

if (!window.DeviceMotionEvent) {

  document.getElementById('error').innerHTML = 'Device motion API not supported';

} else {

  window.addEventListener("devicemotion",  (event) => {
    doSample(event, selectedMode);
  }, false);

  document.getElementById('pause').addEventListener("click", function(ev){
    isRefresh = !isRefresh;
    document.getElementById('error').innerHTML = (isRefresh ? '' : 'Paused');
  });


  document.getElementById("canvas").addEventListener("click", function(ev){
    selectedMode = (selectedMode + 1) % 3;
    console.log(selectedMode);
    isRefresh = true;
  }, false);

  tick(selectedMode);
}

function doSample(event, mode) {

  if(mode === Mode.accelerometer || mode === Mode.both) {
    shift(accel_samples.x, normalize(event.accelerationIncludingGravity.x, 'x', Mode.accelerometer));
    shift(accel_samples.y, normalize(event.accelerationIncludingGravity.y, 'y', Mode.accelerometer));
    shift(accel_samples.z, normalize(event.accelerationIncludingGravity.z, 'z', Mode.accelerometer));
  }

  if(mode === Mode.gyroscope || mode === Mode.both) {
    // Storing normalized values
    shift(gyro_samples.x, normalize(event.rotationRate.alpha, 'alpha', Mode.gyroscope));
    shift(gyro_samples.y, normalize(event.rotationRate.beta, 'beta', Mode.gyroscope));
    shift(gyro_samples.z, normalize(event.rotationRate.gamma, 'gamma', Mode.gyroscope));
  }
}

function tick() {
  window.requestAnimationFrame(tick);

  if (!isRefresh){
    return;
  }
  CONTEXT.fillStyle = '#eee';
  CONTEXT.fillRect(0, 0, WIDTH, HEIGHT);

  drawAxis(0.5);

  if(selectedMode === Mode.accelerometer || selectedMode === Mode.both) {
    drawGraph(accel_samples.x, COLORS.ACCEL.x, scaleX, scaleY);
    drawGraph(accel_samples.y, COLORS.ACCEL.y, scaleX, scaleY);
    drawGraph(accel_samples.z, COLORS.ACCEL.z, scaleX, scaleY);
  }

  if(selectedMode === Mode.gyroscope || selectedMode === Mode.both) {
    drawGraph(gyro_samples.x, COLORS.GYRO.alpha, scaleX, scaleY);
    drawGraph(gyro_samples.y, COLORS.GYRO.beta, scaleX, scaleY);
    drawGraph(gyro_samples.z, COLORS.GYRO.gamma, scaleX, scaleY);
  }

  drawLegend();
}





//--------

const drawingCanvas = document.getElementById('drawingCanvas');
const drawingContext = drawingCanvas.getContext('2d');

let lastX = drawingCanvas.width / 2;
let lastY = drawingCanvas.height / 2;

if (!window.DeviceMotionEvent) {
  document.getElementById('error').innerHTML = 'Device motion API not supported';
} else {
  window.addEventListener("devicemotion", draw, false);
}

function draw(event) {
  const accel = event.accelerationIncludingGravity;

  // Calculer la nouvelle position du pinceau en fonction de l'inclinaison
  let newX = lastX - accel.x;
  let newY = lastY + accel.y;

  // On s'assure que les nouvelles coordonnées sont dans les limites du canvas
  newX = Math.max(0, Math.min(newX, drawingCanvas.width));
  newY = Math.max(0, Math.min(newY, drawingCanvas.height));

  // Dessiner une ligne de la dernière position à la nouvelle position
  drawingContext.beginPath();
  drawingContext.moveTo(lastX, lastY);
  drawingContext.lineTo(newX, newY);
  drawingContext.stroke();

  // Mettre à jour la dernière position pour le prochain dessin
  lastX = newX;
  lastY = newY;
}

// Optionnel : Ajouter un bouton pour réinitialiser le dessin
document.getElementById('reset').addEventListener("click", function() {
  drawingContext.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
});
