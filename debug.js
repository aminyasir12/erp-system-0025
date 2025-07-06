console.log('✅ Node.js is working!');
console.log('Node.js version:', process.version);
console.log('Platform:', process.platform);
console.log('Architecture:', process.arch);
console.log('Current directory:', process.cwd());

// Test environment variables
console.log('\nEnvironment Variables:');
console.log('- NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('- PATH:', process.env.PATH ? 'set' : 'not set');

// Test file system access
try {
  const fs = require('fs');
  const files = fs.readdirSync('.');
  console.log('\nFiles in current directory:', files);
} catch (error) {
  console.error('Error reading directory:', error);
}

// Test database connection
console.log('\nTesting database connection...');
try {
  const { Sequelize } = require('sequelize');
  console.log('Sequelize version:', require('sequelize/package.json').version);
  
  const sequelize = new Sequelize({
    dialect: 'postgres',
    host: 'localhost',
    port: 5432,
    database: 'postgres',
    username: 'postgres',
    password: 'postgres',
    logging: console.log,
  });
  
  sequelize.authenticate()
    .then(() => {
      console.log('✅ Database connection successful!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Database connection failed:', error.message);
      process.exit(1);
    });
} catch (error) {
  console.error('❌ Error testing database connection:', error.message);
  process.exit(1);
}
