// ----- Modes -----

const Mode = Object.freeze({
    accelerometer: 'accelerometer',
    gyroscope: 'gyroscope',
    both: 'both',
});

// ----- DOM references -----

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
const elapsedTimeElement = document.getElementById('elapsedTime');

// ----- Motion recorder class -----

class MotionRecorder {
    constructor() {
        this.reset();
    }

    reset() {
        this.isRecording = false;
        this.selectedMode = Mode.both;
        this.samples = [];
        this.segments = [];
        this.currentSegment = [];
        this.startTimestamp = null; // in performance.now() units
        this.segmentDurationSeconds = 5;
        this.nextSegmentThreshold = 0;
        this.targetDuration = null;
        this.lastRecordedLabel = '';
        this.sessionId = null;
    }

    start(label, mode, segmentDurationSeconds, targetDurationSeconds) {
        this.reset();
        this.isRecording = true;
        this.selectedMode = mode;
        this.segmentDurationSeconds = segmentDurationSeconds;
        this.targetDuration =
            typeof targetDurationSeconds === 'number' && targetDurationSeconds > 0
                ? targetDurationSeconds
                : null;
        this.lastRecordedLabel = label;
        this.startTimestamp = performance.now();
        this.nextSegmentThreshold = this.segmentDurationSeconds;
        this.sessionId = generateSessionId();
    }

    stop() {
        if (!this.isRecording) {
            return;
        }
        this.finalizeSegments();
        this.isRecording = false;
    }

    handleDeviceMotion(event) {
        if (!this.isRecording || !this.startTimestamp) {
            return null;
        }

        const now = performance.now();
        const elapsedSeconds = (now - this.startTimestamp) / 1000;

        const accelSource = event.accelerationIncludingGravity || event.acceleration || {};
        const rotationSource = event.rotationRate || {};

        const shouldRecordAccel =
            this.selectedMode === Mode.accelerometer || this.selectedMode === Mode.both;
        const shouldRecordGyro =
            this.selectedMode === Mode.gyroscope || this.selectedMode === Mode.both;

        const sample = {
            timestamp: elapsedSeconds,
            accelX: shouldRecordAccel ? sanitizeNumber(accelSource.x) : null,
            accelY: shouldRecordAccel ? sanitizeNumber(accelSource.y) : null,
            accelZ: shouldRecordAccel ? sanitizeNumber(accelSource.z) : null,
            gyroAlpha: shouldRecordGyro ? sanitizeNumber(rotationSource.alpha) : null,
            gyroBeta: shouldRecordGyro ? sanitizeNumber(rotationSource.beta) : null,
            gyroGamma: shouldRecordGyro ? sanitizeNumber(rotationSource.gamma) : null,
        };

        this.samples.push(sample);
        this.currentSegment.push(sample);

        if (this.segmentDurationSeconds && elapsedSeconds >= this.nextSegmentThreshold) {
            this.closeCurrentSegment(true);
        }

        if (this.targetDuration && elapsedSeconds >= this.targetDuration) {
            this.stop();
        }

        return sample;
    }

    closeCurrentSegment(incrementThreshold) {
        if (this.currentSegment.length > 0) {
            this.segments.push(this.currentSegment);
            this.currentSegment = [];
        }

        if (incrementThreshold) {
            this.nextSegmentThreshold += this.segmentDurationSeconds;
        }
    }

    finalizeSegments() {
        this.closeCurrentSegment(false);
    }

    getElapsedSeconds() {
        if (!this.isRecording || !this.startTimestamp) {
            return 0;
        }
        return (performance.now() - this.startTimestamp) / 1000;
    }
}

// ----- State -----
let recorder = new MotionRecorder();
let selectedMode = Mode.both;
let elapsedRafId = null;

// ----- Initialization -----

updateSegmentInfoUI();
resetElapsedTimer();
setIdleUIState(false);

if (!window.DeviceMotionEvent) {
    statusElement.textContent = 'Device motion API not supported on this device.';
    errorElement.textContent = 'Device motion API not supported';
    disableControls();
} else {
    statusElement.textContent = isIOS()
        ? 'Tap "Allow motion sensors" to begin.'
        : 'Requesting motion permissions…';

    requestMotionPermission(safariButton, errorElement)
        .then(() => {
            window.addEventListener('devicemotion', globalDeviceMotionHandler, false);
            statusElement.textContent =
                'Ready. Enter a label, set segment duration, and press Start recording.';
            startButton.disabled = false;
        })
        .catch((err) => {
            errorElement.textContent = err.message || 'Permission was not granted.';
            disableControls();
        });
}

// ----- Event listeners -----

modeSelect.addEventListener('change', () => {
    selectedMode = mapModeValue(modeSelect.value);
});

startButton.addEventListener('click', startRecording);
stopButton.addEventListener('click', stopRecording);
downloadButton.addEventListener('click', downloadZip);

// ----- Motion recorder class -----

// ----- UI state helpers -----

function setRecordingUIState() {
    startButton.disabled = true;
    stopButton.disabled = false;
    downloadButton.disabled = true;

    labelInput.disabled = true;
    modeSelect.disabled = true;
    durationInput.disabled = true;
    segmentDurationInput.disabled = true;
}

function setIdleUIState(hasSegments) {
    startButton.disabled = false;
    stopButton.disabled = true;
    downloadButton.disabled = !hasSegments;

    labelInput.disabled = false;
    modeSelect.disabled = false;
    durationInput.disabled = false;
    segmentDurationInput.disabled = false;
}

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

// ----- Main UI actions -----

function startRecording() {
    if (!window.DeviceMotionEvent) {
        errorElement.textContent = 'Device motion API not supported.';
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

    const durationValue = parseFloat(durationInput.value);
    const targetDuration = !Number.isNaN(durationValue) && durationValue > 0 ? durationValue : null;

    errorElement.textContent = '';

    selectedMode = mapModeValue(modeSelect.value);

    recorder.start(label, selectedMode, segmentValue, targetDuration);

    sampleCountElement.textContent = 'Samples: 0';
    updateSegmentInfoUI();
    statusElement.textContent = 'Recording… Segment 1 in progress.';

    setRecordingUIState();
    startElapsedTimer();
}

function stopRecording() {
    if (!recorder.isRecording) {
        return;
    }

    recorder.stop();

    setIdleUIState(recorder.segments.length > 0);
    updateSegmentInfoUI();
    resetElapsedTimer();

    const samples = recorder.samples;
    const seconds = samples.length > 0 ? samples[samples.length - 1].timestamp : 0;
    const sampleRate = estimateSampleRate(samples);
    const sampleRateText =
        sampleRate > 0 ? ` Estimated sample rate: ${sampleRate.toFixed(2)} Hz.` : '';
    statusElement.textContent = `Recording stopped. ${samples.length} samples recorded in ${seconds.toFixed(
        2,
    )} s.${sampleRateText} Segments ready: ${recorder.segments.length}.`;
}

// ----- Global motion handler -----

function globalDeviceMotionHandler(event) {
    const sample = recorder.handleDeviceMotion(event);
    if (!sample) {
        return;
    }

    sampleCountElement.textContent = `Samples: ${recorder.samples.length}`;
    updateSegmentInfoUI();

    if (!recorder.isRecording) {
        // Auto-stop triggered by target duration
        setIdleUIState(recorder.segments.length > 0);
        resetElapsedTimer();

        const samples = recorder.samples;
        const seconds = samples.length > 0 ? samples[samples.length - 1].timestamp : 0;
        const sampleRate = estimateSampleRate(samples);
        const sampleRateText =
            sampleRate > 0 ? ` Estimated sample rate: ${sampleRate.toFixed(2)} Hz.` : '';
        statusElement.textContent = `Recording stopped (auto). ${
            samples.length
        } samples recorded in ${seconds.toFixed(2)} s.${sampleRateText} Segments ready: ${
            recorder.segments.length
        }.`;
    }
}

// ----- UI info helpers -----

function updateSegmentInfoUI() {
    const completed = recorder.segments.length;
    if (recorder.isRecording) {
        const currentIndex = completed + 1;
        segmentInfoElement.textContent = `Current segment: ${currentIndex} | Segments completed: ${completed}`;
    } else {
        segmentInfoElement.textContent = `Segments completed: ${completed}`;
    }
}

function startElapsedTimer() {
    if (elapsedRafId !== null) {
        cancelAnimationFrame(elapsedRafId);
        elapsedRafId = null;
    }

    const update = () => {
        const seconds = recorder.getElapsedSeconds();
        elapsedTimeElement.textContent = `Elapsed: ${seconds.toFixed(2)} s`;
        if (recorder.isRecording) {
            elapsedRafId = requestAnimationFrame(update);
        } else {
            elapsedRafId = null;
        }
    };

    update();
}

function resetElapsedTimer() {
    if (elapsedRafId !== null) {
        cancelAnimationFrame(elapsedRafId);
        elapsedRafId = null;
    }
    elapsedTimeElement.textContent = 'Elapsed: 0.00 s';
}

// ----- CSV / ZIP building -----

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

function buildMetaJson(label) {
    const sampleRate = estimateSampleRate(recorder.samples);
    return {
        label,
        mode: modeSelect.value,
        sampleRateHz: sampleRate,
        totalSamples: recorder.samples.length,
        segmentsCount: recorder.segments.length,
        createdAt: new Date().toISOString(),
        userAgent: navigator.userAgent,
        sessionId: recorder.sessionId,
    };
}

function downloadZip() {
    if (recorder.segments.length === 0) {
        errorElement.textContent = 'No segments to export yet.';
        return;
    }

    const label = recorder.lastRecordedLabel || labelInput.value.trim();
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

    recorder.segments.forEach((segmentData, index) => {
        const csvContent = buildCsvContent(label, segmentData);
        const fileIndex = String(index + 1).padStart(2, '0');
        const segmentDuration =
            segmentData.length > 1
                ? segmentData[segmentData.length - 1].timestamp - segmentData[0].timestamp
                : 0;
        const safeDuration = segmentDuration.toFixed(2);
        // Unique sample filenames thanks to sessionId
        const fileName = `${folderName}_${recorder.sessionId}_${fileIndex}_${safeDuration}s.csv`;
        folder.file(fileName, csvContent);
    });

    const meta = buildMetaJson(label);
    const metaFileName = `${folderName}_${recorder.sessionId}_meta.json`;
    zip.file(metaFileName, JSON.stringify(meta, null, 2));

    const archiveName = `${folderName}_segments_${recorder.sessionId}.zip`;

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
            statusElement.textContent = `ZIP ready with ${recorder.segments.length} segment(s).`;
        })
        .catch((err) => {
            errorElement.textContent = 'Failed to generate ZIP.';
            // eslint-disable-next-line no-console
            console.error(err);
        });
}

// ----- Helpers -----

function sanitizeNumber(value) {
    if (typeof value === 'number' && !Number.isNaN(value)) {
        return value;
    }
    return null;
}

function sanitizeFolderName(name) {
    return name.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');
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

function isIOS() {
    return (
        /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    );
}

function requestMotionPermission(safariButtonElement, errorElementElement) {
    return new Promise((resolve, reject) => {
        if (typeof DeviceMotionEvent === 'undefined') {
            reject(new Error('Device motion API not supported.'));
            return;
        }

        // Non-iOS or iOS without requestPermission: nothing special to do.
        if (typeof DeviceMotionEvent.requestPermission !== 'function') {
            safariButtonElement.style.display = 'none';
            resolve();
            return;
        }

        // iOS path: need a user gesture.
        safariButtonElement.style.display = 'inline-block';

        const handleSuccess = () => {
            safariButtonElement.style.display = 'none';
            resolve();
        };

        const handleError = (err) => {
            safariButtonElement.style.display = 'inline-block';
            errorElementElement.textContent =
                (err && err.message) || 'Motion permission was not granted.';
            reject(err instanceof Error ? err : new Error(errorElementElement.textContent));
        };

        const clickHandler = () => {
            DeviceMotionEvent.requestPermission()
                .then((state) => {
                    if (state === 'granted') {
                        handleSuccess();
                    } else {
                        handleError(new Error(`Permission state: ${state}`));
                    }
                })
                .catch(handleError);
        };

        const keyHandler = (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                clickHandler();
            }
        };

        safariButtonElement.addEventListener('click', clickHandler, { once: true });
        safariButtonElement.addEventListener('keydown', keyHandler, { once: true });
    });
}

function generateSessionId() {
    const now = new Date();
    const iso = now.toISOString().replace(/[-:.TZ]/g, '');
    const random = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, '0');
    return `${iso}_${random}`;
}