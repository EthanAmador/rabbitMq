require('dotenv').config();

const {
  RABBIT_MQ_HOST,
  RABBIT_MQ_PORT,
  RABBIT_MQ_USER,
  RABBIT_MQ_PASSWORD,
  RABIIT_MQ_PROTOCOL= 'amqp',
} = process.env;

module.exports = {
  rabbitmq: {
    protocol: RABIIT_MQ_PROTOCOL,
    hostname: RABBIT_MQ_HOST,
    port: +RABBIT_MQ_PORT,
    username: RABBIT_MQ_USER,
    password: RABBIT_MQ_PASSWORD,
    locale: 'en_US',
  }
};