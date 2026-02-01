const admin = require('./routes/admin');
console.log('Admin routes loaded successfully');
console.log('Router type:', typeof admin);
console.log('Router methods available:', admin.stack ? admin.stack.length + ' routes' : 'N/A');
