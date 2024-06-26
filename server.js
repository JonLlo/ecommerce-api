const express = require('express');
const { connectDatabase, closeDatabase, client } = require('./config/database'); // Import database connection functions and client
const bodyParser = require('body-parser');


const app = express();
const port = 3000; // You can change this port number if needed
app.use(express.json());
app.use(express.static('public'));




// general routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/home.html'); // Serve the HTML file
});

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
                <link rel="stylesheet" href="styles.css">
            </head>
            <body className="custom-body">
                <h1>Users </h1>
                <ul>
                    ${users.map(user => `<li>Name: ${user.username}. Email: ${user.email}. Password: ${user.password}. id = ${user.id}</li>`).join('')}
                </ul>
                <form id="registrationbutton">
                    <input type="submit" value="See registration form">
                </form>
                <form id="removalbutton">
                    <input type="submit" value="see removal form">
                </form>
                <form id="removalnamebutton">
                    <input type="submit" value="see removal name form">
                </form>
                <form id="loginbutton">
                    <input type="submit" value="see login form">
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

                    document.getElementById('removalnamebutton').addEventListener('submit', function(event) {
                        event.preventDefault(); // Prevent the default form submission behavior
                        window.location.href = 'removalnameform.html'; // Redirect to current URL + /users
                    });

                    document.getElementById('loginbutton').addEventListener('submit', function(event) {
                        event.preventDefault(); // Prevent the default form submission behavior
                        window.location.href = 'loginform.html'; // Redirect to current URL + /users
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




///register
app.post('/register', async (req, res) => {
    // Extract username, email, and password from the request body
    console.log(req.body); // Log the entire req.body object

    const  {user_name, pass_word, e_mail}   = req.body
    console.log(user_name, pass_word, e_mail,"camea")


   try {
        // Validate input (e.g., check for required fields)
        if (!user_name || !e_mail || !pass_word) {
            return res.status(400).send(`You need to put email, username and password in
           <br>
            <br>
            <button onclick="window.location.href='/users'">Go to Users</button>`);} 
    

        await connectDatabase();

        // Insert the user data into the database
        const insertQuery = 'INSERT INTO "User" (username, email, password) VALUES ($1, $2, $3)';
        await client.query(insertQuery, [user_name, e_mail, pass_word]);

        const successMessage = `User registered successfully! username: ${user_name}, email: ${e_mail}, password: ${pass_word}`;

        // Respond with a success message and button to redirect to /users
        res.status(200).send(`
            ${successMessage}
            <br>
            <br>
            <button onclick="window.location.href='/users'">Go to Users</button>
        `);

    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send(`Internal server error
                    <br>
            <br>
            <button onclick="window.location.href='/users'">Go to Users</button>
        
        
        `);
    }
});
///login

app.post('/login', async (req, res) => {
    // Extract username, email, and password from the request body
    const { user_name, pass_word, e_mail } = req.body;

    try {
        // Validate input (e.g., check for required fields)
        if (!user_name || !e_mail || !pass_word) {
            return res.status(400).send(`You need to provide email, username, and password.
                <br><br>
                <button onclick="window.location.href='/loginform.html'">Back to login form</button>
                <button onclick="window.location.href='/users'">Back to users</button>
                `);
        }

        await connectDatabase();

        // Check if the user exists in the database
        const checkQuery = 'SELECT id FROM "User" WHERE username = $1 AND email = $2 AND password = $3';
        const { rows } = await client.query(checkQuery, [user_name, e_mail, pass_word]);

        if (rows.length > 0) {
            // User exists, send success response
            res.status(200).send(`Login successful!
            <button onclick="window.location.href='/successful.login.html'">secretcode</button>
            
            `);
        } else {
            // User does not exist or credentials are incorrect, send error response
            res.status(401).send(`Invalid username, email, or password.
                <br><br>
                <button onclick="window.location.href='/loginform.html'">Back to login form</button>
                <button onclick="window.location.href='/users'">Back to users</button>`
                );
                
        }
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).send(`Internal server error.
            <br><br>
            <button onclick="window.location.href='/users'">Go to Users</button>`);
    }
});

// POST request route handler
app.get('/removal/:id', async (req, res) => {
    const userId = req.params.id;
    
    try {
        // Connect to the database
        await connectDatabase();

        // Query the database to check if the user ID exists
        const result = await client.query('SELECT * FROM "User" WHERE id = $1', [userId]);
        
        // Check if the query returned any rows (i.e., if the user ID exists)
        if (result.rows.length > 0) {
            // User ID exists, proceed with deletion
            const deleteQuery = 'DELETE FROM "User" WHERE id = $1';
            await client.query(deleteQuery, [userId]);

            const successMessage = `User with ID ${userId} removed very successfully`;

            // Respond with a success message and button to redirect to /users
            res.status(200).send(`
                ${successMessage}
                <br>
                <br>
                <button onclick="window.location.href='/users'">Go to Users</button>
            `);
        } else {
            // User ID does not exist
            res.status(200).send(`
            This user does not exist
            <br>
            <br>
            <button onclick="window.location.href='/users'">Go to Users</button>
        `);
        }
    } catch (error) {
        console.error('Error removing user:', error);
        res.status(500).send(
            
            `Internal server error
            <button onclick="window.location.href='/users'">Go to Users</button>
            
            `);
    }
});

app.get('/removal/name/:name', async (req, res) => {
    const usernamebosh = req.params.name;
    
    try {
        // Connect to the database
        await connectDatabase();

        // Query the database to check if the user ID exists
        const result2 = await client.query('SELECT * FROM "User" WHERE username = $1', [usernamebosh]);
        
        // Check if the query returned any rows (i.e., if the user ID exists)
        if (result2.rows.length > 0) {
            // User ID exists, proceed with deletion
            const deleteQuery2 = 'DELETE FROM "User" WHERE username = $1';
            await client.query(deleteQuery2, [usernamebosh]);

            const successMessage2 = `User with name ${usernamebosh} removed very successfully`;

            // Respond with a success message and button to redirect to /users
            res.status(200).send(`
                ${successMessage2}
                <br>
                <br>
                <button onclick="window.location.href='/users'">Go to Users</button>
            `);
        } else {
            // User ID does not exist
            res.status(200).send(`
            No user has this name
            <br>
            <br>
            <button onclick="window.location.href='/users'">Go to Users</button>
        `);
        }
    } catch (error) {
        console.error('Error removing user:', error);
        res.status(500).send(
            
            `Internal server error
            <button onclick="window.location.href='/users'">Go to Users</button>
            
            `);
    }
});

//app listen
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });