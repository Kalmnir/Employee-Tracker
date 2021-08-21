const mysql = require('mysql2');
const inquirer = require('inquirer');
const connection = require('./db/connection');

connection.connect((err) => {
    if (err) {
        console.log(err);
        throw err;
    }
    console.log(`Connected to server with ID ${connection.threadId}`)
    startprompt();
});

function startprompt() {
    inquirer.prompt([
        {
            type: 'list',
            message: 'What would you like to do?',
            name: 'choice',
            choices: [
                'View all employees',
                'View all employees by role',
                'View all employees by manager',
                'Update employee',
                'Add employee',
                'Add role',
                'Add department'
            ]
        }
    ]).then(function (val) {
        switch (val.choice) {
            case 'View all employees':

                break;

            case 'View all employees by role':

                break;

            case 'View all employees by manager':

                break

            case 'Update employee':

                break

            case 'Add employee':

                break

            case 'Add Role':

                break

            case 'Add department':

                break
        }
    })
}