const cluster = require('cluster');
const os = require('os');

const pid = process.pid;

const startWorker = () => {
    const worker = cluster.fork();
    worker.on('exit', () => {
        console.log(`Worker died. Pid: ${worker.process.pid}`);
        startWorker();
    })
    worker.send('Hello from server')
    worker.on('message', message => {
        console.log(`Message from worker ${worker.process.pid} : ${JSON.stringify(message)}`);
    })
}

if (cluster.isMaster) {
    const cpusCount = os.cpus().length;
    console.log(`CPUs: ${cpusCount}`);
    console.log(`Master cluster started; Pid ${pid}`);
    for (let i = 0; i < cpusCount - 1; i++) {
        startWorker();
    }
}

if (cluster.isWorker) {
    require('./worker');
    process.on('message', message => {
        console.log(`Message from master: ${message}`);
    })
    process.send({ text: 'Hello', pid: pid })
}