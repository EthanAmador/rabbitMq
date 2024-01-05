const amqp = require('amqplib');
const config = require('../config');

let rabbitClient = null;
const channels = {
  exchanges: {},
  queues: {},
};

const connect = async () => {
  rabbitClient = await amqp.connect({ ...config.rabbitmq });

  rabbitClient.on('close', async () => {
    console.log('RabbitMQ connection closed.');
    rabbitClient = null;
    connect();
  });

  rabbitClient.on('error', (err) => {
    console.error('RabbitMQ connection error.', err);
  });
};

const createExchange = async ({ name, type, options }) => {
  const channel = await rabbitClient.createChannel();
  await channel.assertExchange(name, type, options);
  return channel;
};

const createQueue = async ({
  name,
  options,
  bind = null,
  exchange_dql = null,
}) => {
  const channel = await rabbitClient.createChannel();

  const queueOptions = {
    ...options,
  };

  // register dead letter queue
  if (exchange_dql) {
    queueOptions.deadLetterExchange = exchange_dql.deadLetterExchange;
    queueOptions.deadLetterRoutingKey = exchange_dql.deadLetterRoutingKey;
  }

  await channel.assertQueue(name, queueOptions);
  if (bind) {
    await channel.bindQueue(name, bind.exchange, bind.routingKey);
  }
  return channel;
};

const setup = async (config) => {
  await connect();
  // setup exchanges
  for (const key in config.exchanges) {
    if (!config.exchanges.hasOwnProperty(key)) {
      continue;
    }
    const exchangeConfig = config.exchanges[key];
    channels.exchanges[key] = await createExchange(exchangeConfig);
  }

  // setup queues
  for (const key in config.queues) {
    if (!config.queues.hasOwnProperty(key)) {
      continue;
    }
    const queueConfig = config.queues[key];
    channels.queues[key] = await createQueue(queueConfig);
  }
};

const publishMessage = async ({ exchange, routingKey, message }) => {
  const channel = channels.exchanges[exchange];
  const buffer = Buffer.from(JSON.stringify(message), 'utf-8');
  await channel.publish(exchange, routingKey, buffer);
};

/**
 *
 * @param {queue} queueConfig
 * @param {function} fn
 */
const readMessage = async ({ queue, fn }) => {
  const { name:queueName, exchange_dql = null } = queue;
  const channel = channels.queues[queueName];
  await channel.consume(queueName, async (message) => {
    // console.log(
    //   '🚀 ~ file: index.js:70 ~ awaitchannel.consume ~ message:',
    //   message
    // );
    const content = JSON.parse(message.content.toString());
    try {
      await fn(content);
      // channel.ack(message);
    } catch (err) {
      console.error(err);
      if (exchange_dql) {
        const {
          deadLetterExchange: exchange,
          deadLetterRoutingKey: routingKey,
        } = exchange_dql;
        await publishMessage({
          exchange,
          routingKey,
          message: content,
        });
      }
      // channel.ack(message);
      // channel.nack(message);
    } finally {
      channel.ack(message);
    }
  });
};

module.exports = {
  setup,
  publishMessage,
  readMessage,
};
