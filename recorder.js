let isRecording = false;
let selectedMode = Mode.both;
let samples = [];
let startTimestamp = null;
let targetDuration = null;
let lastRecordedLabel = '';
let segments = [];
let currentSegment = [];
let segmentDurationSeconds = 5;
let nextSegmentThreshold = 0;

const labelInput = document.getElementById('activityLabel');
const modeSelect = document.getElementById('modeSelect');
const durationInput = document.getElementById('durationInput');
const segmentDurationInput = document.getElementById('segmentDurationInput');
const startButton = document.getElementById('startRecording');
const stopButton = document.getElementById('stopRecording');
const downloadButton = document.getElementById('downloadZip');
const statusElement = document.getElementById('recorderStatus');
const errorElement = document.getElementById('recorderError');
const safariButton = document.getElementById('safariRecorder');
const sampleCountElement = document.getElementById('sampleCount');
const segmentInfoElement = document.getElementById('segmentInfo');

updateSegmentInfo();

if (!window.DeviceMotionEvent) {
    statusElement.textContent = 'Device motion API not supported on this device.';
    errorElement.textContent = 'Device motion API not supported';
    disableControls();
} else {
    statusElement.textContent = is_iOS() ? 'Tap "Allow motion sensors" to begin.' : 'Requesting motion permissions…';
    requestPermission('safariRecorder', 'recorderError')
        .then(() => {
            window.addEventListener('devicemotion', handleDeviceMotion, false);
            statusElement.textContent = 'Ready. Enter a label, set segment duration, and press Start recording.';
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
downloadButton.addEventListener('click', downloadZip);

function disableControls() {
    startButton.disabled = true;
    stopButton.disabled = true;
    downloadButton.disabled = true;
    labelInput.disabled = true;
    modeSelect.disabled = true;
    durationInput.disabled = true;
    segmentDurationInput.disabled = true;
    safariButton.style.display = 'none';
}

function mapModeValue(value) {
    switch (value) {
        case 'accelerometer':
            return Mode.accelerometer;
        case 'gyroscope':
            return Mode.gyroscope;
        case 'both':
        default:
            return Mode.both;
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

    const segmentValue = parseFloat(segmentDurationInput.value);
    if (Number.isNaN(segmentValue) || segmentValue <= 0) {
        errorElement.textContent = 'Please provide a valid segment duration (in seconds).';
        return;
    }

    errorElement.textContent = '';
    selectedMode = mapModeValue(modeSelect.value);
    segmentDurationSeconds = segmentValue;
    samples = [];
    segments = [];
    currentSegment = [];
    lastRecordedLabel = label;
    startTimestamp = Date.now();
    nextSegmentThreshold = segmentDurationSeconds;

    targetDuration = parseFloat(durationInput.value);
    if (Number.isNaN(targetDuration) || targetDuration <= 0) {
        targetDuration = null;
    }

    isRecording = true;
    sampleCountElement.textContent = 'Samples: 0';
    updateSegmentInfo();
    statusElement.textContent = 'Recording… Segment 1 in progress.';

    startButton.disabled = true;
    stopButton.disabled = false;
    downloadButton.disabled = true;
    labelInput.disabled = true;
    modeSelect.disabled = true;
    durationInput.disabled = true;
    segmentDurationInput.disabled = true;
}

function stopRecording() {
    if (!isRecording) {
        return;
    }

    finalizeRecordingSegments();

    isRecording = false;
    startButton.disabled = false;
    stopButton.disabled = true;
    labelInput.disabled = false;
    modeSelect.disabled = false;
    durationInput.disabled = false;
    segmentDurationInput.disabled = false;
    downloadButton.disabled = segments.length === 0;

    const seconds = samples.length > 0 ? samples[samples.length - 1].timestamp : 0;
    const sampleRate = estimateSampleRate(samples);
    const sampleRateText = sampleRate > 0 ? ` Estimated sample rate: ${sampleRate.toFixed(2)} Hz.` : '';
    statusElement.textContent = `Recording stopped. ${samples.length} samples recorded in ${seconds.toFixed(2)} s.${sampleRateText} Segments ready: ${segments.length}.`;
    updateSegmentInfo();
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
    currentSegment.push(sample);
    sampleCountElement.textContent = `Samples: ${samples.length}`;

    if (segmentDurationSeconds && elapsedSeconds >= nextSegmentThreshold) {
        closeCurrentSegment(true);
    }

    if (targetDuration && elapsedSeconds >= targetDuration) {
        stopRecording();
    }
}

function closeCurrentSegment(incrementThreshold) {
    if (currentSegment.length > 0) {
        segments.push(currentSegment);
        currentSegment = [];
    }

    if (incrementThreshold) {
        nextSegmentThreshold += segmentDurationSeconds;
    }

    updateSegmentInfo();
}

function finalizeRecordingSegments() {
    closeCurrentSegment(false);
}

function updateSegmentInfo() {
    const completed = segments.length;
    if (isRecording) {
        const currentIndex = completed + 1;
        segmentInfoElement.textContent = `Current segment: ${currentIndex} | Segments completed: ${completed}`;
    } else {
        segmentInfoElement.textContent = `Segments completed: ${completed}`;
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
    if (typeof value === 'number') {
        return value.toFixed(6);
    }
    const numericValue = Number(value);
    if (Number.isNaN(numericValue)) {
        return '';
    }
    return numericValue.toFixed(6);
}

function estimateSampleRate(recordedSamples) {
    if (!recordedSamples || recordedSamples.length < 2) {
        return 0;
    }

    const deltas = [];
    for (let i = 1; i < recordedSamples.length; i += 1) {
        deltas.push(recordedSamples[i].timestamp - recordedSamples[i - 1].timestamp);
    }

    const sum = deltas.reduce((acc, value) => acc + value, 0);
    const avgDelta = sum / deltas.length;
    if (avgDelta === 0) {
        return 0;
    }
    return 1 / avgDelta;
}

function downloadZip() {
    if (segments.length === 0) {
        errorElement.textContent = 'No segments to export yet.';
        return;
    }

    const label = lastRecordedLabel || labelInput.value.trim();
    if (!label) {
        errorElement.textContent = 'Missing label for export.';
        return;
    }

    if (typeof JSZip === 'undefined') {
        errorElement.textContent = 'ZIP library not loaded.';
        return;
    }

    errorElement.textContent = '';
    const zip = new JSZip();
    const folderName = sanitizeFolderName(label) || 'activity';
    const folder = zip.folder(folderName);

    segments.forEach((segmentData, index) => {
        const csvContent = buildCsvContent(label, segmentData);
        const fileIndex = String(index + 1).padStart(2, '0');
        folder.file(`${folderName}_${fileIndex}.csv`, csvContent);
    });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const archiveName = `${folderName}_segments_${timestamp}.zip`;

    zip.generateAsync({ type: 'blob' })
        .then((content) => {
            const url = URL.createObjectURL(content);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', archiveName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            statusElement.textContent = `ZIP ready with ${segments.length} segment(s).`;
        })
        .catch((err) => {
            errorElement.textContent = 'Failed to generate ZIP.';
            console.error(err);
        });
}

function sanitizeFolderName(name) {
    return name.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');
}
