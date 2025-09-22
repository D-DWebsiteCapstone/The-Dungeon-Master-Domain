//This will be to test run the code for right now

import sql from "./db.js";
import express from 'express';


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

//Create a seperate file for this later
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

//This is what I used to test insert into the database. Use node . for terminal input thanks to
//main src/index.js in package.json

// insertUser({ username: "Connor", email: "connor@example.com", userpassword: "securepassword" })
//   .then(user => {
//     console.log(user);
//   })
//   .catch(err => {
//     console.error(err);
//   });

//Express package testing
//This will serve the frontend with local hosting
const app = express()

app.use("/", express.static("public"))

app.listen(3000)