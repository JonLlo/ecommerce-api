const express = require('express');
const { connectDatabase, closeDatabase, client } = require('./config/database'); // Import database connection functions and client
const bodyParser = require('body-parser');


const app = express();
const port = 3000; // You can change this port number if needed
app.use(express.json());



// general routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/home.html'); // Serve the HTML file
});
app.get('/', (req, res) => {
    res.send('Hello World!')
  })

//GET request route handler for all users:

app.get('/users', async (req, res) => {
    try {
        // Connect to the database
        await connectDatabase();


        // Query the database for all users
        const result = await client.query('SELECT * FROM "User"');

        // Retrieve the users from the query result
        const users = result.rows;
        const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Users</title>
            </head>
            <body>
                <h1>List of Users!</h1>
                <ul>
                    ${users.map(user => `<li>Name: ${user.username}. Email: ${user.email}. Password: ${user.password}. id = ${user.id}</li>`).join('')}
                </ul>
                <form id="registrationbutton">
                    <input type="submit" value="See registration form">
                </form>
                <form id="removalbutton">
                    <input type="submit" value="see removal form">
                </form>

                <script>
                    document.getElementById('registrationbutton').addEventListener('submit', function(event) {
                        event.preventDefault(); // Prevent the default form submission behavior
                        window.location.href = 'registration.html'; // Redirect to current URL + /users
                    });

                    document.getElementById('removalbutton').addEventListener('submit', function(event) {
                        event.preventDefault(); // Prevent the default form submission behavior
                        window.location.href = 'removalform.html'; // Redirect to current URL + /users
                    });
                </script>
            </body>
            </html>
        `;
    
        res.send(htmlContent)
 
    } catch (error) {
        // Handle errors
        console.error('Error retrieving users:', error);
        res.status(500).send(`Internal server error
        <br>
        <br>
        <button onclick="window.location.href='/users'">Go to Users</button>`);} 
});
//POST REQUEST FOR REGISTERING
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}))





app.post('/register', async (req, res) => {
    // Extract username, email, and password from the request body
    console.log(req.body); // Log the entire req.body object

   /*here*/
});


app.post('/removal', async (req, res) => {
    await connectDatabase();
    console.log("hello");
    res.status(200).send(`
    ${successMessage}
    <br>
    <br>
    <button onclick="window.location.href='/users'">Go to Users</button>
`);


})
    


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });