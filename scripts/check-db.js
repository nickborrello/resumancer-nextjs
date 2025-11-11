const { db } = require('./src/database/db');
const { users } = require('./src/database/schema');

async function checkUsers() {
  try {
    const allUsers = await db.select().from(users);
    console.log('Users in database:', allUsers);
  } catch (error) {
    console.error('Error querying database:', error);
  } finally {
    process.exit();
  }
}

checkUsers();