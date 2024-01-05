module.exports = {
  queuesInfo: {
    exchanges: {
      my_exchange: {
        name: 'my_exchange',
        type: 'direct',
        options: {
          durable: true,
          autoDelete: true,
        },
      },
      my_exchange_dlq: {
        name: 'my_exchange_dlq',
        type: 'direct',
        options: {
          durable: true,
          autoDelete: true,
        },
      },
    },
    queues: {
      my_queue: {
        name: 'my_queue',
        options: {
          durable: true,
          autoDelete: true,
        },
        bind: {
          exchange: 'my_exchange',
          routingKey: 'my_routing_key',
        },
        exchange_dql: {
          deadLetterExchange: 'my_exchange_dlq',
          deadLetterRoutingKey: 'my_routing_key_dlq',
        },
      },
      my_queue_dlq: {
        name: 'my_queue_dlq',
        options: {
          durable: true,
          autoDelete: true,
        },
        bind: {
          exchange: 'my_exchange_dlq',
          routingKey: 'my_routing_key_dlq',
        },
      },
    },
  },
};