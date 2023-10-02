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
