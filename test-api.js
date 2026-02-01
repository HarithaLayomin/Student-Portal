const http = require('http');

const data = JSON.stringify({
  name: "Test User",
  email: "test" + Date.now() + "@example.com",
  password: "password123",
  role: "student",
  permittedCourses: ["Maths"]
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/admin/users',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  res.on('end', () => {
    console.log('RESPONSE:', body);
    process.exit(0);
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
  process.exit(1);
});

req.write(data);
req.end();
