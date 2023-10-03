//     <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest"></script>
const model = tf.sequential();
model.add(tf.layers.dense({units: 1, inputShape: [2], activation: 'sigmoid'}));
model.compile({optimizer: tf.train.adam(), loss: 'binaryCrossentropy', metrics: ['accuracy']});

const rawData = [
    {accelX: 0.1, accelY: 0.9, label: 1},
    {accelX: 0.4, accelY: 0.2, label: 0},
    // ...
];

const data = rawData.map(d => [d.accelX, d.accelY]);
const labels = rawData.map(d => d.label);

const trainingData = tf.tensor2d(data);
const trainingLabels = tf.tensor1d(labels);

model.fit(trainingData, trainingLabels, {
    epochs: 10,
    callbacks: {
        onEpochEnd: (epoch, log) => console.log(`Epoch ${epoch}: loss = ${log.loss}`)
    }
}).then(info => {
    console.log('Final loss', info.history.loss);

    const someNewData = [[0.3, 0.8]];
    const prediction = model.predict(tf.tensor2d(someNewData));
    prediction.data().then(values => {
        const predictedClass = values[0] >= 0.5 ? 1 : 0;
        console.log('Predicted Class:', predictedClass);
        document.body.innerHTML += `<p>Predicted Class: ${predictedClass}</p>`;
    });

});

