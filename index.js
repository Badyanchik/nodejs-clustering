const index = require('cluster');
const os = require('os');

const pid = process.pid;

const startWorker = () => {
    const worker = index.fork();
    worker.on('exit', () => {
        console.log(`Worker died. Pid: ${worker.process.pid}`);
        startWorker();
    })
    worker.send('Hello from server')
    worker.on('message', message => {
        console.log(`Message from worker ${worker.process.pid} : ${JSON.stringify(message)}`);
    })
}

if (index.isMaster) {
    const cpusCount = os.cpus().length;
    console.log(`CPUs: ${cpusCount}`);
    console.log(`Master cluster started; Pid ${pid}`);
    for (let i = 0; i < cpusCount - 1; i++) {
        startWorker();
    }
}

if (index.isWorker) {
    require('./worker');
    process.on('message', message => {
        console.log(`Message from master: ${message}`);
    })
    process.send({ text: 'Hello', pid: pid })
}