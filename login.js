const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const path = require('path');

const connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : '',
	database : 'nodelogin'
});

const app = express();

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'static')));

// http://localhost:3000/
app.get('/', function(request, response) {
	// Render login template
	response.sendFile(path.join(__dirname + '/login.html'));
});

// http://localhost:3000/auth
app.post('/auth', function(request, response) {
	// Capture the input fields
	let username = request.body.username;
	let password = request.body.password;
	// Ensure the input fields exists and are not empty
	if (username && password) {
		// Execute SQL query that'll select the account from the database based on the specified username and password
		connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			// If there is an issue with the query, output the error
			if (error) throw error;
			// If the account exists
			if (results.length > 0) {
				// Authenticate the user
				request.session.loggedin = true;
				request.session.username = username;
				// Redirect to home page
				response.redirect('/home');
			} else {
				response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

app.get('/add-admin', function(request, response) {
	// Render login template
	response.sendFile(path.join(__dirname + '/add-admin.html'));
});

app.post('/add-admin', function(request, response) {
    let username = request.body.username;
	let email = request.body.email;
	let password = request.body.password;

    if (username && email && password) {
        // Execute SQL query that'll select the account from the database based on the specified username and password
        connection.query('SELECT COUNT(*) as count FROM accounts WHERE email = ?', [email], function(error, results, fields) {
            // If there is an issue with the query, output the error
            if (error) throw error;

            // Check if the email exists in the database
            if (results[0].count > 0) {
                response.send('Email exists!');
            } else {
                // If the email doesn't exist, you can add the member to the database here
                // Example: connection.query('INSERT INTO member_accounts (email) VALUES (?)', [email], function(error, results, fields) { ... });
				connection.query('INSERT INTO accounts (username, password, email) VALUES (?, ?, ?)', [username, password, email], function(error, results, fields) {
					if (error) throw error;
				});
                response.send('Add admin successfully!');
            }

            // End the response after processing
            response.end();
        });
    } else {
        response.send('Please fill in all the details!');
        response.end();
    }
});

// http://localhost:3000/home
app.get('/home', function(request, response) {
	// If the user is loggedin
	if (request.session.loggedin) {
		// Output username
		response.sendFile(path.join(__dirname + '/add-member.html'));
		
	} else {
		// Not logged in
		response.send('Please login to view this page!');
		response.end();
	}
	
});

app.post('/add-member', function(request, response) {
    let username = request.body.username;
	let email = request.body.email;
	let phone = request.body.phone;
	let password = request.body.password;

    if (email && username && phone && password) {
        // Execute SQL query that'll select the account from the database based on the specified username and password
        connection.query('SELECT COUNT(*) as count FROM member_accounts WHERE email = ?', [email], function(error, results, fields) {
            // If there is an issue with the query, output the error
            if (error) throw error;

            // Check if the email exists in the database
            if (results[0].count > 0) {
                response.send('Email exists!');
            } else {
                // If the email doesn't exist, you can add the member to the database here
                // Example: connection.query('INSERT INTO member_accounts (email) VALUES (?)', [email], function(error, results, fields) { ... });
				connection.query('INSERT INTO member_accounts (username, email, phone, password) VALUES (?, ?, ?, ?)', [username, email, phone, password], function(error, results, fields) {
					if (error) throw error;
				});
                response.send('Add member successfully!');
            }

            // End the response after processing
            response.end();
        });
    } else {
        response.send('Please fill in all the details!');
        response.end();
    }
});

app.listen(3000);