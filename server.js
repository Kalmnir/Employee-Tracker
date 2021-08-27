const mysql = require('mysql2');
const inquirer = require('inquirer');
const cTable = require('console.table');
const { isBuffer } = require('util');

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
                'View all employees by department',
                'Update employee',
                'Add employee',
                'Add role',
                'Add department',
                // 'Delete employee',
                // 'Delete Role',
                // 'Delete department'
            ]
        }
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

            case 'Update employee':
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
            startPrompt()
        })
}

function viewAllDepartments() {
    connection.query("SELECT employee.first_name, employee.last_name, department.name AS Department FROM employee JOIN role ON employee.role_id = role.id JOIN department ON role.department_id = department.id ORDER BY employee.id;",
        function (err, res) {
            if (err) throw err
            console.table(res)
            startPrompt()
        })
}

const roleArray = [];
function selectRole() {
    connection.query("SELECT * FROM role", function (err, res) {
        if (err) throw err
        for (let i = 0; i < res.length; i++) {
            roleArray.push(res[i].title);
        }
    })
    return roleArray;
}

const managerArray = [];
function selectManager() {
    connection.query("SELECT first_name, last_name FROM employee WHERE manager_id IS NULL", function (err, res) {
        if (err) throw err
        for (let i = 0; i < res.length; i++) {
            managerArray.push(res[i].first_name);
        }
    })
    return managerArray;
}

const departmentArray = [];
function selectDepartment() {
    connection.query("SELECT id, name FROM department ORDER BY name ASC", function (err, res) {
        if (err) throw err
        for (let i = 0; i < res.length; i++) {
            departmentArray.push(res[i].name)
        }
    })
    return departmentArray;
}


function addEmployee() {
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
            choices: selectRole(),
            name: 'role'
        },
        {
            type: 'rawlist',
            message: "Please select new employee's manager",
            choices: selectManager(),
            name: 'manager'
        }
    ]).then(function (val) {
        let roleId = selectRole().indexOf(val.role) + 1
        let managerId = selectManager().indexOf(val.manager) + 1
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
    connection.query("SELECT employee.last_name, role.title FROM employee JOIN role ON employee.role_id = role.id;", (err, res) => {
        if (err) throw err
        console.table(res)
        inquirer.prompt([
            {
                type: 'rawlist',
                message: "What is the employee's last name?",
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
                choices: selectRole(),
                name: 'role'
            }
        ]).then(function (val) {
            let roleId = selectRole().indexOf(val.role) + 1
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
            choices: selectDepartment(),
            name: 'Department'
        }
    ]).then(function (res) {
        let departmentId;
        for (let i = 0; i < departmentArray.length; i++) {
            if (res.Department == departmentArray[i].name) {
                departmentId = departmentArray[i].id;
            }
        }
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
    inquirer.prompt([
        {
            type: 'input',
            message: 'What is the name of the new Department?',
            name: 'name'
        }
    ]).then(function (res) {
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