// all dependencies required
const mysql = require('mysql2');
const inquirer = require('inquirer');
const cTable = require('console.table');
const { isBuffer } = require('util');

// mysql connection to localhost server
const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'rootr00t!',
    database: 'employee_db'
});

// connect to the database, give a nice little welcome message, and start the application
connection.connect((err) => {
    if (err) {
        console.log(err);
        throw err;
    }
    console.log(`Connected to server with ID ${connection.threadId}`)
    startPrompt();
});

// main apllication
function startPrompt() {
    // main menu prompt showing all choices
    inquirer.prompt([
        {
            type: 'list',
            message: 'What would you like to do?',
            name: 'choice',
            choices: [
                'View all employees',
                'View all employees by role',
                'View all employees by department',
                'Update employee role',
                'Add employee',
                'Add role',
                'Add department',
                // 'Delete employee',
                // 'Delete Role',
                // 'Delete department'
            ]
        }
        // switch function to allow each choice to fire it's own function that will run
    ]).then(function (val) {
        switch (val.choice) {
            case 'View all employees':
                viewAllEmployees()
                break;

            case 'View all employees by role':
                viewAllRoles()
                break;

            case 'View all employees by department':
                viewAllDepartments()
                break

            case 'Update employee role':
                updateEmployee()
                break

            case 'Add employee':
                addEmployee()
                break

            case 'Add role':
                addRole()
                break

            case 'Add department':
                addDepartment()
                break

            // case 'Delete employee':
            //     deleteEmployee()
            //     break

            // case 'Delete role':

            //     break

            // case 'Delete department':

            //     break
        }
    })
}

// simple function that grabs all the employees names, roles, salaries, and the department they belong to and displays it on screen
function viewAllEmployees() {
    connection.query("SELECT employee.first_name, employee.last_name, role.title, role.salary, department.name, CONCAT(e.first_name, ' ' ,e.last_name) AS Manager FROM employee INNER JOIN role on role.id = employee.role_id INNER JOIN department on department.id = role.department_id left join employee e on employee.manager_id = e.id;",
        function (err, res) {
            if (err) throw err
            console.table(res)
            startPrompt()
        })
}

// simple query function that returns employee names, and roles
function viewAllRoles() {
    connection.query("SELECT employee.first_name, employee.last_name, role.title AS Title FROM employee JOIN role ON employee.role_id = role.id",
        function (err, res) {
            if (err) throw err
            console.table(res)
            startPrompt()
        })
}

// simple query function that returns employee names, and the department they belong to
function viewAllDepartments() {
    connection.query("SELECT employee.first_name, employee.last_name, department.name AS Department FROM employee JOIN role ON employee.role_id = role.id JOIN department ON role.department_id = department.id ORDER BY employee.id;",
        function (err, res) {
            if (err) throw err
            console.table(res)
            startPrompt()
        })
}

// empty array to contain the different roles
const roleArray = [];
function selectRole() {
    // grab all the roles in the database
    connection.query("SELECT * FROM role", function (err, res) {
        if (err) throw err
        for (let i = 0; i < res.length; i++) {
            // push returned roles into the empty array
            roleArray.push(res[i].title);
        }
    })
    // return the now filled array containing all available roles
    return roleArray;
}

// empty array to contain the name of all our managers
const managerArray = [];
function selectManager() {
    // grab the name of every manager as indicated by the null manager id on their employee class card
    connection.query("SELECT first_name, last_name FROM employee WHERE manager_id IS NULL", function (err, res) {
        if (err) throw err
        for (let i = 0; i < res.length; i++) {
            // push the returned names into the empty array
            managerArray.push(res[i].first_name);
        }
    })
    // return the now filled array containing all the managers names
    return managerArray;
}

// empty array to contain all the departments in the business
const departmentArray = [];
function selectDepartment() {
    // simple query grabbing all the departments and putting them in ascending order
    connection.query("SELECT id, name FROM department ORDER BY name ASC", function (err, res) {
        if (err) throw err
        for (let i = 0; i < res.length; i++) {
            // push the returned departments into the empty array
            departmentArray.push(res[i].name)
        }
    })
    // return the now filled array containing all of our departments
    return departmentArray;
}


function addEmployee() {
    // questions required to add a new employee to the database
    inquirer.prompt([
        {
            type: 'input',
            message: "Please enter new employee's first name.",
            name: 'first_name'
        },
        {
            type: 'input',
            message: "Please enter new employee's last name.",
            name: 'last_name'
        },
        {
            type: 'list',
            message: "Please select new employee's role.",
            // here we use the selectRole function made earlier to provide a list of available roles
            choices: selectRole(),
            name: 'role'
        },
        {
            type: 'rawlist',
            message: "Please select new employee's manager",
            // use the selectManager function here to provide a list of all the managers
            choices: selectManager(),
            name: 'manager'
        }
    ]).then(function (val) {
        // give them a unique role id
        let roleId = selectRole().indexOf(val.role) + 1
        // give them the appropriate manager id
        let managerId = selectManager().indexOf(val.manager) + 1
        // simple query that inserts the provided information into the employee table
        connection.query('INSERT INTO employee SET ?', {
            first_name: val.first_name,
            last_name: val.last_name,
            manager_id: managerId,
            role_id: roleId
        }, function (err) {
            if (err) throw err
            console.table(val)
            startPrompt()
        })
    })
}

function updateEmployee() {
    // query that grabs the last name of the employee and their role to be updated
    connection.query("SELECT employee.last_name, role.title FROM employee JOIN role ON employee.role_id = role.id;", (err, res) => {
        if (err) throw err
        console.table(res)
        inquirer.prompt([
            {
                type: 'rawlist',
                message: "What is the employee's last name?",
                // a function that will take the query response and allow the user to select the employee they wish to update
                choices: function () {
                    let lastName = [];
                    for (let i = 0; i < res.length; i++) {
                        lastName.push(res[i].last_name);
                    }
                    return lastName;
                },
                name: 'last_name'
            },
            {
                type: 'rawlist',
                message: "What is the employee's new role?",
                // here we use the selectRole function again to give the user a choice of the employee's new role
                choices: selectRole(),
                name: 'role'
            }
        ]).then(function (val) {
            // make sure we update their role id accordingly
            let roleId = selectRole().indexOf(val.role) + 1
            // update the data in the table that was provided
            connection.query('UPDATE employee SET ? WHERE ?',
                [{
                    role_id: roleId,
                },
                {
                    last_name: val.last_name,
                }],
                function (err) {
                    if (err) throw err
                    console.table(val)
                    startPrompt()
                })
        });
    });
}

function addRole() {
    // inquirer prompt to aquire the name, salary, and deparment the new role will belong to
    inquirer.prompt([
        {
            type: 'input',
            message: 'What is the title of the new role?',
            name: 'Title'
        },
        {
            type: 'input',
            message: 'What is the salary of the new role?',
            name: 'Salary'
        },
        {
            type: 'rawlist',
            message: 'Which department does this new role belong to?',
            // use the selectDepartment function we made earlier to give the user a list of all departments to choose from
            choices: selectDepartment(),
            name: 'Department'
        }
    ]).then(function (res) {
        // here we make our department id for the new role and set it to the appropriate id using a for loop and the array we made containing all the departments
        let departmentId;
        for (let i = 0; i < departmentArray.length; i++) {
            if (res.Department == departmentArray[i].name) {
                departmentId = departmentArray[i].id;
            }
        }
        // simple query that inserts the role into the database
        connection.query('INSERT INTO role SET ?',
            {
                title: res.Title,
                salary: res.Salary,
                department_id: departmentId,
            },
            function (err, res) {
                if (err) throw err
                console.table(res);
                startPrompt();
            }
        )
    });
}

function addDepartment() {
    // quick inquirer prompt to get the name of the new department
    inquirer.prompt([
        {
            type: 'input',
            message: 'What is the name of the new Department?',
            name: 'name'
        }
    ]).then(function (res) {
        // simple query statement that inserts the newly created department into the database
        connection.query('INSERT INTO department SET ?',
            {
                name: res.name
            },
            function (err, res) {
                if (err) throw err
                console.table(res);
                startPrompt();
            }
        )
    })
}

// let employeeArray = [];
// function selectEmployee() {
//     connection.query("SELECT first_name, last_name AS employee FROM employee", function (err, res) {
//         if (err) throw err
//         for (let i = 0; i < res.length; i++) {
//             employeeArray.push(res[i].first_name);
//         }
//     })
//     return employeeArray;
// }

// function deleteEmployee() {
    //     inquirer.prompt([
        //         {
            //             type: 'rawlist',
            //             message: 'Which employee would you like to delete?',
            //             choices: selectEmployee(),
            //             name: 'choice'
            //         },
            //         {
                //             type: 'list',
                //             message: 'Confirm Deletion',
                //             choices: ['NO', 'YES'],
                //             name: 'confirmation'
                //         }
                //     ]).then(function (res) {
                    //         if (res.confirmation === 'YES') {
                        //             let employeeId;

                        //             for (i = 0; i < employeeArray.length; i++) {
//                 if (res.id == employeeArray[i].employee) {
//                     employeeId = employeeArray[i].id;
//                 }
//             }
//             connection.query(`DELETE FROM employee WHERE id=${employeeId};`, (err, res) => {
//                 if (err) return err;
//                 console.table(`EMPLOYEE '${res.employee}' DELETED`);
//                 startPrompt();
//             });
//         }
//         else {
//             console.table(`EMPLOYEE '${res.employee}' NOT DELETED`);
//             startPrompt();
//         }
//     })
// }