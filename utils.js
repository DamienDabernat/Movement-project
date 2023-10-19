const Mode = {
    gyroscope: 0,
    accelerometer: 1,
    both: 2,
}

const SAMPLES_COUNT = 64;

const COLORS = {
    GYRO: {
        alpha: '#e40303',
        beta: '#ff8c00',
        gamma: '#ffed00'
    },
    ACCEL: {
        x: '#008026',
        y: '#004dff',
        z: '#750787'
    }
};

let normalizedData = {
    gyroscope: {
        min : { alpha: Infinity, beta: Infinity, gamma: Infinity },
        max : { alpha: -Infinity, beta: -Infinity, gamma: -Infinity },
    },
    accelerometer: {
        min : { x: Infinity, y: Infinity, z: Infinity },
        max : { x: -Infinity, y: -Infinity, z: -Infinity },
    }
};

function updateMinMax(value, axis, mode) {
    if(mode === Mode.accelerometer) {
        normalizedData.accelerometer.min[axis] = Math.min(normalizedData.accelerometer.min[axis], value);
        normalizedData.accelerometer.max[axis] = Math.max(normalizedData.accelerometer.max[axis], value);
    }

    if(mode === Mode.gyroscope) {
        normalizedData.gyroscope.min[axis] = Math.min(normalizedData.gyroscope.min[axis], value);
        normalizedData.gyroscope.max[axis] = Math.max(normalizedData.gyroscope.max[axis], value);
    }
}

/// Normalize gyro readings with min and max values for each axis to [0, 1]
function normalize(value, axis, mode) {
    updateMinMax(value, axis, mode)

    if(mode === Mode.accelerometer) {
        return (value - normalizedData.accelerometer.min[axis]) / (normalizedData.accelerometer.max[axis] - normalizedData.accelerometer.min[axis]);
    }

    if(mode === Mode.gyroscope) {
        return (value - normalizedData.gyroscope.min[axis]) / (normalizedData.gyroscope.max[axis] - normalizedData.gyroscope.min[axis]);
    }
}

//get Float32Array of length initialized to 0
function getInitArr(length) {
    const arr = new Float32Array(length);
    for (let i = 0; i < length; i++) {
        arr[i] = 0;
    }
    return arr;
}

//add a sample to the end of the array
function shift(arr, datum) {
    const ret = arr[0];
    for (let i = 1; i < arr.length; i++) {
        arr[i - 1] = arr[i];
    }
    arr[arr.length - 1] = datum;
    return ret;
}

function is_iOS() {
    return [
            'iPad Simulator',
            'iPhone Simulator',
            'iPod Simulator',
            'iPad',
            'iPhone',
            'iPod'
        ].includes(navigator.platform)
        // iPad on iOS 13 detection
        || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
}

/**
 * Demande la permission d'accéder aux événements d'orientation et de mouvement du dispositif.
 * @param {string} safariButtonId - ID de l'élément du DOM qui sera cliqué pour demander la permission sous iOS.
 * @param {string} errorElementId - ID de l'élément du DOM où les messages d'erreur seront affichés.
 * @returns {Promise} Une promesse qui est résolue si les permissions sont accordées et rejetée sinon.
 */
function requestPermission(safariButtonId, errorElementId) {
    return new Promise(async (resolve, reject) => {
        const safariButton = document.getElementById(safariButtonId);
        const errorElement = document.getElementById(errorElementId);

        if (!window.DeviceMotionEvent) {
            errorElement.innerHTML = 'Device motion API not supported';
            reject(new Error('Device motion API not supported'));
            return false;
        }

        if (is_iOS()) {
            safariButton.addEventListener("click", async function (ev) {

                // Fonction interne pour demander la permission pour un type d'événement donné
                async function request(eventConstructor) {
                    const type = eventConstructor.name;
                    if (typeof eventConstructor.requestPermission === "function") {
                        const permissionState = await eventConstructor.requestPermission();
                        if (permissionState === "granted") {
                            return true;
                        } else {
                            errorElement.innerHTML = `${type} permission denied`;
                            reject(new Error(`${type} permission denied`));
                            return false;
                        }
                    } else {
                        reject(new Error(`${type}.requestPermission is not a function`));
                        return false;
                    }
                }

                const orientationGranted = await request(DeviceOrientationEvent);
                if (!orientationGranted) return;

                const motionGranted = await request(DeviceMotionEvent);
                if (!motionGranted) return;

                if (orientationGranted && motionGranted) {
                    safariButton.style.display = "none";  // Hide Safari button
                    resolve();  // Both permissions granted
                }

            });
        } else {
            safariButton.style.display = "none";  // Hide Safari button
            resolve();  // No need for permissions on Android, resolve immediately
        }
    });
}

