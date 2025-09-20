//This will be to test run the code for right now

import sql from "./db.js";


async function getUsersOver(age) {
  const users = await sql`
    select
      name,
      age
    from users
    where age > ${ age }
  `
  // users = Result [{ name: "Walter", age: 80 }, { name: 'Murray', age: 68 }, ...]
  return users
}


async function insertUser({ username, email, userpassword }) {
  const users = await sql`
    insert into "Users"
      (username, email, userpassword)
    values
      (${username}, ${email}, ${userpassword})
    returning username, email, userpassword
  `
  // users = Result [{ username: "Murray", email: "murray@example.com", userpassword: "securepassword" }]
  return users
}

insertUser({ username: "Connor", email: "connor@example.com", userpassword: "securepassword" })
  .then(user => {
    console.log(user);
  })
  .catch(err => {
    console.error(err);
  });
