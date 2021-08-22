const mysql = require('mysql2');
const inquirer = require('inquirer');
const cTable = require(console.table);

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'rootr00t!',
    database: 'employee_db'
});

connection.connect((err) => {
    if (err) {
        console.log(err);
        throw err;
    }
    console.log(`Connected to server with ID ${connection.threadId}`)
    startPrompt();
});

function startPrompt() {
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
                viewAllEmployees()
                break;

            case 'View all employees by role':
                viewAllRoles
                break;

            case 'View all employees by manager':
                viewAllDepartments
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

function viewAllEmployees() {
    connection.query("SELECT employee.first_name, employee.last_name, role.title, role.salary, department.name, CONCAT(e.first_name, ' ' ,e.last_name) AS Manager FROM employee INNER JOIN role on role.id = employee.role_id INNER JOIN department on department.id = role.department_id left join employee e on employee.manager_id = e.id;",
        function (err, res) {
            if (err) throw err
            console.table(res)
            startPrompt()
        })
}
function viewAllRoles() {
    connection.query("SELECT employee.first_name, employee.last_name, role.title AS Title FROM employee JOIN role ON employee.role_id = role.id",
        function (err, res) {
            if (err) throw err
            console.table(res)
            startPrompt
        })
}
function viewAllDepartments() {
    connection.query("SELECT employee.first_name, employee.last_name, department.name AS Department FROM employee JOIN role ON employee.role_id = role.id JOIN department ON role.department_id = department.id ORDER BY employee.id;",
        function (err, res) {
            if (err) throw err
            console.table(res)
            startPrompt
        })
}