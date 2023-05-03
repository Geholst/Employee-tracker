-- insert into company database 

USE company_db;

INSERT INTO department (name) VALUES
("Engineering"), 
("Finance"), 
("Legal"), 
("Sales");

INSERT INTO role (title, department_id, salary) VALUES
("Sales Lead",1,"100000"),
("Salesperson",2,"80000"),
("Lead Engineer",3,"150000"),
("Software Engineer",4,"120000"),
("Account Manager",5,"160000"),
("Accountant",6,"125000"),
("Legal Team Lead",7,"250000"),
("Lawyer",8,"190000");

INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES
("John","Doe",1,NULL),
("Mike","Chan",2, NULL ),
("Ashley","Rodriguez",3,NULL),
("Kevin","Tupik",4,NULL),
("Kunal","Singh",5,NUll),
("Malia","Brown",6,NULL),
("Sarah","Lourd",7 ,NULL),
("Tom","Allen",8 ,NULL);