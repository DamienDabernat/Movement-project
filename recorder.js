let isRecording = false;
let selectedMode = Mode.accelerometer;
let samples = [];
let startTimestamp = null;
let targetDuration = null;
let lastRecordedLabel = '';

const labelInput = document.getElementById('activityLabel');
const modeSelect = document.getElementById('modeSelect');
const durationInput = document.getElementById('durationInput');
const startButton = document.getElementById('startRecording');
const stopButton = document.getElementById('stopRecording');
const downloadButton = document.getElementById('downloadCsv');
const statusElement = document.getElementById('recorderStatus');
const errorElement = document.getElementById('recorderError');
const safariButton = document.getElementById('safariRecorder');
const sampleCountElement = document.getElementById('sampleCount');

if (!window.DeviceMotionEvent) {
    statusElement.textContent = 'Device motion API not supported on this device.';
    errorElement.textContent = 'Device motion API not supported';
    disableControls();
} else {
    statusElement.textContent = is_iOS() ? 'Tap "Allow motion sensors" to begin.' : 'Requesting motion permissions…';
    requestPermission('safariRecorder', 'recorderError')
        .then(() => {
            window.addEventListener('devicemotion', handleDeviceMotion, false);
            statusElement.textContent = 'Ready. Enter a label and press Start recording.';
            startButton.disabled = false;
        })
        .catch((err) => {
            errorElement.textContent = err.message || 'Permission was not granted.';
            disableControls();
        });
}

modeSelect.addEventListener('change', () => {
    selectedMode = mapModeValue(modeSelect.value);
});

startButton.addEventListener('click', startRecording);
stopButton.addEventListener('click', stopRecording);
downloadButton.addEventListener('click', downloadCsv);

function disableControls() {
    startButton.disabled = true;
    stopButton.disabled = true;
    downloadButton.disabled = true;
    safariButton.style.display = 'none';
}

function mapModeValue(value) {
    switch (value) {
        case 'gyroscope':
            return Mode.gyroscope;
        case 'both':
            return Mode.both;
        case 'accelerometer':
        default:
            return Mode.accelerometer;
    }
}

function startRecording() {
    if (!window.DeviceMotionEvent) {
        errorElement.textContent = 'Device motion API not supported';
        return;
    }

    const label = labelInput.value.trim();
    if (!label) {
        errorElement.textContent = 'Please provide an activity label.';
        return;
    }

    errorElement.textContent = '';
    selectedMode = mapModeValue(modeSelect.value);
    samples = [];
    lastRecordedLabel = label;
    startTimestamp = Date.now();
    targetDuration = parseFloat(durationInput.value);
    if (Number.isNaN(targetDuration) || targetDuration <= 0) {
        targetDuration = null;
    }

    isRecording = true;
    sampleCountElement.textContent = 'Samples: 0';
    statusElement.textContent = 'Recording…';

    startButton.disabled = true;
    stopButton.disabled = false;
    downloadButton.disabled = true;
    labelInput.disabled = true;
    modeSelect.disabled = true;
    durationInput.disabled = true;
}

function stopRecording() {
    if (!isRecording) {
        return;
    }

    isRecording = false;
    startButton.disabled = false;
    stopButton.disabled = true;
    labelInput.disabled = false;
    modeSelect.disabled = false;
    durationInput.disabled = false;
    downloadButton.disabled = samples.length === 0;

    const seconds = samples.length > 0 ? samples[samples.length - 1].timestamp.toFixed(2) : '0.00';
    statusElement.textContent = `Recording stopped. ${samples.length} samples recorded in ${seconds} s.`;
}

function handleDeviceMotion(event) {
    if (!isRecording) {
        return;
    }

    if (!startTimestamp) {
        startTimestamp = Date.now();
    }

    const elapsedSeconds = (Date.now() - startTimestamp) / 1000;
    const accelSource = event.accelerationIncludingGravity || event.acceleration || {};
    const rotationSource = event.rotationRate || {};

    const shouldRecordAccel = selectedMode === Mode.accelerometer || selectedMode === Mode.both;
    const shouldRecordGyro = selectedMode === Mode.gyroscope || selectedMode === Mode.both;

    const sample = {
        timestamp: elapsedSeconds,
        accelX: shouldRecordAccel ? sanitizeNumber(accelSource.x) : null,
        accelY: shouldRecordAccel ? sanitizeNumber(accelSource.y) : null,
        accelZ: shouldRecordAccel ? sanitizeNumber(accelSource.z) : null,
        gyroAlpha: shouldRecordGyro ? sanitizeNumber(rotationSource.alpha) : null,
        gyroBeta: shouldRecordGyro ? sanitizeNumber(rotationSource.beta) : null,
        gyroGamma: shouldRecordGyro ? sanitizeNumber(rotationSource.gamma) : null,
    };

    samples.push(sample);
    sampleCountElement.textContent = `Samples: ${samples.length}`;

    if (targetDuration && elapsedSeconds >= targetDuration) {
        stopRecording();
    }
}

function sanitizeNumber(value) {
    if (typeof value === 'number' && !Number.isNaN(value)) {
        return value;
    }
    return null;
}

function buildCsvContent(label, data) {
    const header = 'label,timestamp,accelX,accelY,accelZ,gyroAlpha,gyroBeta,gyroGamma';
    const escapedLabel = escapeLabel(label);
    const rows = data.map((sample) => {
        return [
            escapedLabel,
            formatNumber(sample.timestamp),
            formatNumber(sample.accelX),
            formatNumber(sample.accelY),
            formatNumber(sample.accelZ),
            formatNumber(sample.gyroAlpha),
            formatNumber(sample.gyroBeta),
            formatNumber(sample.gyroGamma),
        ].join(',');
    });
    return `${header}\n${rows.join('\n')}`;
}

function escapeLabel(label) {
    if (label.includes(',') || label.includes('"')) {
        return `"${label.replace(/"/g, '""')}"`;
    }
    return label;
}

function formatNumber(value) {
    if (value === null || typeof value === 'undefined') {
        return '';
    }
    return Number(value).toString();
}

function downloadCsv() {
    if (samples.length === 0) {
        errorElement.textContent = 'No samples to export yet.';
        return;
    }

    const label = lastRecordedLabel || labelInput.value.trim();
    if (!label) {
        errorElement.textContent = 'Missing label for export.';
        return;
    }

    const csvContent = buildCsvContent(label, samples);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const safeLabel = label.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${safeLabel || 'activity'}_${timestamp}.csv`;

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    statusElement.textContent = 'CSV ready. You can record a new sequence or download again.';
}
