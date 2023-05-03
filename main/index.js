// importing external modules
const inquirer = require('inquirer');
const mysql = require('mysql2/promise');
// const cTable = require('console.table');
// const PORT = process.env.PORT || 3001;


// connecting to the local host
async function askQuestion() {
    try {
   const db = await mysql.createConnection(
     {
       host: 'localhost',
       user: 'root',
       password: 'password',
       database: 'company_db'
     }
   );
  
   console.log('connected to db');
  
   // inquirer prompt to ask question
  
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'mainQuestion',
      message: 'What would you like to do?',
      choices: [
        'View all departments',
        'View all roles',
        'View all employees',
        'Add a department',
        'Add a role',
        'Add an employee',
        'Update an employee role'
      ]
    },
    {
        type: 'input',
        name: 'roleName',
        message: 'What is the name of the role?',
        when: (answers) => answers.mainQuestion === 'Add a role'
    },
    {
      type: 'input',
      name: 'departmentName',
      message: 'What is the name of the department?',
      when: (answers) => answers.mainQuestion === 'Add a department'
    },
    {
      type: 'input',
      name: 'roleDepartment',
      message: 'Which department does the role belong to?',
      when: (answers) => answers.mainQuestion === 'Add a role'
    },
    {
      type: 'input',
      name: 'roleSalary',
      message: 'What is the salary of the role?',
      when: (answers) => answers.mainQuestion === 'Add a role'
    },
    {
      type: 'input',
      name: 'firstName',
      message: 'What is the employee\'s first name?',
      when: (answers) => answers.mainQuestion === 'Add an employee'
    },
    {
      type: 'input',
      name: 'lastName',
      message: 'What is the employee\'s last name?',
      when: (answers) => answers.mainQuestion === 'Add an employee'
    }
  ]);



  switch (answers.mainQuestion) {
      case 'View all departments':
        const [deptRows, departmentFields] = await db.query('SELECT * FROM department');
        console.table(deptRows);
        break;
        case 'View all roles':
          const query = `
            SELECT role.id AS role_id, role.title AS job_title, department.name AS department, role.salary
            FROM role
            JOIN department ON role.department_id = department.id
          `;
          const [roleRows, roleFields] = await db.query(query);
          console.table(roleRows);
          break;
          case 'View all employees':
            const [empRows, empFields] = await db.query(`
              SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, department.name AS department, CONCAT(manager.first_name, ' ', manager.last_name) AS manager
              FROM employee
              INNER JOIN role ON employee.role_id = role.id
              INNER JOIN department ON role.department_id = department.id
              LEFT JOIN employee AS manager ON employee.manager_id = manager.id
            `);
            console.table(empRows);
            break;
          case 'Add a department':
            await db.query(`INSERT INTO department (name) VALUES (?)`, [answers.departmentName]);
            console.log('Department added!');
            break;
          case 'Add a role':
            const [deptRowsForRole, _] = await db.execute('SELECT * FROM department');
            const deptNames = deptRowsForRole.map(row => row.name);
            const { roleDepartment } = answers;
            if (!deptNames.includes(roleDepartment)) {
              console.log('Invalid department name!');
              return;
            }
        await db.execute(`
          INSERT INTO role (title, salary, department_id) 
          VALUES (?, ?, (SELECT id FROM department WHERE name = ?))
        `, [answers.roleName, answers.roleSalary, answers.roleDepartment]);
        console.log('Role added!');
        break;

      case 'Add an employee':
        const [empRowsForRoles, empData] = await db.execute('SELECT * FROM role');
        const roleNames = empRowsForRoles.map(row => row.title);
        const [empRowsForEmployee, mngData] = await db.execute('SELECT * FROM employee')
        const managerNames = empRowsForEmployee.map(row => row.first_name + ' ' + row.last_name);
        const { firstName, lastName } = answers;
        
        const { empRole, empManager } = await inquirer.prompt([

          {
            type: 'list',
            name: 'empRole',
            message: 'What is the new employees role?',
            choices: roleNames
          },
          {
            type: 'list',
            name: 'empManager',
            message: 'Who will be the new employee\'s manager?',
            choices: managerNames
          }
        ]);
        if (!firstName || !lastName || !roleNames.includes(empRole) || !managerNames.includes(empManager)) {
          console.log('Invalid input!');
          return;
        }
        await db.execute(`
          INSERT INTO employee (first_name, last_name, role_id, manager_id) 
          VALUES (?, ?, (SELECT id FROM role WHERE title = ?), (SELECT id FROM role WHERE CONCAT(first_name, ' ', last_name) = ?))
        `, [firstName, lastName, empRole, empManager]);
        console.log('Employee added!');
        break;

      case 'Update an employee role':
        const [empRowsForUpdate, empDataForUpdate] = await db.execute('SELECT * FROM employee');
        const empNamesForUpdate = empRowsForUpdate.map(row => row.first_name + ' ' + row.last_name);
        const [roleRowsForUpdate, roleDataForUpdate] = await db.execute('SELECT * FROM role');
       
        const roleTitlesForUpdate = roleRowsForUpdate.map(({id, title})=>({
          name: title,
          value: id
        }))
        const { employeeNameForUpdate, updateRoleTitle } = await inquirer.prompt([

          {
            type: 'list',
            name: 'employeeNameForUpdate',
            message: 'Which employee would you like to update?',
            choices: empNamesForUpdate
          },
          {
            type: 'list',
            name: 'updateRoleTitle',
            message: 'What is the employee\'s new role?',
            choices: roleTitlesForUpdate
          }
        ]);

        const [fName, lName] = employeeNameForUpdate.split(' ');
        console.log(updateRoleTitle)
      await db.execute(
      `UPDATE employee SET role_id = ? WHERE first_name = ? AND last_name = ?`,
      [updateRoleTitle, fName, lName]
      );
        console.log('Employee role updated!');
      break;

    }
  } catch (error) {
    console.log(error);
  }
  askQuestion();
}
askQuestion();

