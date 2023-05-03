// importing external modules
const inquirer = require('inquirer');
const mysql = require('mysql2/promise');
const cTable = require('console.table');
const express = require("express");
const PORT = process.env.PORT || 3001;

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// connecting to the local host
const db = mysql.createConnection(
    {
      host: "localhost",
      user: "root",
      password: "password",
      database: "employee_db",
    },
    console.log(`Connected to the employee_db database.`)
  );
  