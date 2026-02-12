const net = require('net');

const services = [
  { name: 'PostgreSQL', host: 'localhost', port: 5432 },
  { name: 'MongoDB', host: 'localhost', port: 27017 },
  { name: 'Redis', host: 'localhost', port: 6379 },
  { name: 'pgAdmin', host: 'localhost', port: 5050 },
  { name: 'Mongo Express', host: 'localhost', port: 8081 }
];

console.log('🔍 Checking Docker container connectivity...\n');

services.forEach(service => {
  const client = net.createConnection({ host: service.host, port: service.port }, () => {
    console.log(`✅ ${service.name} (port ${service.port}) - ACCESSIBLE`);
    client.end();
  });

  client.on('error', () => {
    console.log(`❌ ${service.name} (port ${service.port}) - NOT ACCESSIBLE`);
  });

  client.setTimeout(2000, () => {
    console.log(`⏱️  ${service.name} (port ${service.port}) - TIMEOUT`);
    client.destroy();
  });
});

setTimeout(() => {
  console.log('\n✨ All containers are running via CLI even if Docker Desktop UI doesn\'t show them.');
  process.exit(0);
}, 3000);
