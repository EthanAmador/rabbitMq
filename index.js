const { setup, publishMessage, readMessage } = require('./rabbitMq');
const { queuesInfo } = require('./constants');

const timeout = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fn = async (message) => {
  const { message: msg, date, index } = message;
  if (index === 5) {
    throw new Error('error');
  }
  console.log('processed completed', { msg, date, index });
};

const start = async () => {
  await setup(queuesInfo);

  const exchange = queuesInfo.exchanges.my_exchange.name;
  const routingKey = queuesInfo.queues.my_queue.bind.routingKey;
  let i = 0;
  do {
    const message = { message: 'hello world', date: new Date(), index:i };
    await publishMessage({ exchange, routingKey, message });
    i++;
  } while (i < 10);

  console.log('published all messages');
  await timeout(10000);
  console.log('start reading messages');

  const queue = queuesInfo.queues.my_queue;
  await readMessage({ queue, fn });
  const queueDlq = queuesInfo.queues.my_queue_dlq;
  await readMessage({
    queue: queueDlq,
    fn: (msg) => {
      console.log('Read From DLQ =>', msg);
    },
  });
};

start()
  .catch(console.error)
  .then(() => console.log('done'));
