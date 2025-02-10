import express from "express";
import cors from "cors";
import { createConnection } from "mysql2/promise";

const connection = await createConnection({
    host: "localhost",
    port: 3306,
    database: "foodastic",
    user: "root",
    password: ""
});

const app = express();
app.use(express.json());
app.use(cors());


//  FUNCTIONS

const get = async (res, table) => {
    try{
        const [ json ] = await connection.query("select * from foods");
        res.status(200).send(json);
    } catch {
        res.status(500).send({ error : "Wrong query!" });
    }
}

const create = async (req, res, table) => {
    let columns;
    switch(table) {
        case "foods":
          if (!(req.body.name && req.body.price && req.body.image)){
            res.status(400).send({ error : "Wrong parameters!" });
            return;
          }
          columns = `name="${req.body.name}", price=${req.body.price}, image=${req.body.image}`  
          break;
        case "users":
          if (!(req.body.first_name && req.body.last_name && req.body.email && req.body.password && req.body.profile_picture)){
            res.status(400).send({ error : "Wrong parameters!" })
            return;
           }
          columns = `first_name="${req.body.first_name}", last_name="${req.body.last_name}", email="${req.body.email}", password="${req.body.password}", profile_picture="${req.body.profile_picture}"`;
          break;
    } 
    try{
        await connection.query(`insert into ${table} set ${columns}`);
        res.status(201).send({ status : "Created" });
    } catch {
        res.status(500).send({ error : "Wrong query!" });
    }
}

const del = async (req, res, table) => {
    if (!(req.params.id)){
        res.status(400).send({ error : "ID not found!" });
        return;
    }
    try{
        await connection.query(`delete from ${table} where ${table.substring(0, table.length-1)}_id=${req.params.id}`);
        res.status(200).send({ status : "OK" });
    } catch {
        res.status(500).send({ error : "Wrong query!" });
    }
}

const mod = async (req, res, table) => {
    if (!(req.params.food_id)){
        res.status(400).send({ error : "ID not found!" });
        return;
    }
    let columns;
    switch(table) {
        case "foods":
          if (!(req.body.name && req.body.price && req.body.image)){
            res.status(400).send({ error : "Wrong parameters!" });
            return;
          }
          columns = `name="${req.body.name}", price=${req.body.price}, image=${req.body.image}`  
          break;
        case "users":
          if (!(req.body.first_name && req.body.last_name && req.body.email && req.body.password && req.body.profile_picture)){
            res.status(400).send({ error : "Wrong parameters!" })
            return;
           }
          columns = `first_name="${req.body.first_name}", last_name="${req.body.last_name}", email="${req.body.email}", password="${req.body.password}", profile_picture="${req.body.profile_picture}"`;
          break;
    } 
    try{
        await connection.query(`update ${table} where ${table.substring(0, table.length-1)}_id=${req.params.id} set ${columns}`);
        res.status(200).send({ status : "OK" });
    } catch {
        res.status(500).send({ error : "Wrong query!" });
    }
}

//  GET

app.get("/", (req, res) => res.status(200).send("<h1>Foodastic v1.0.0</h1>"));
app.get("/foods", (req, res) => get(res, "foods"));
app.get("/users", (req, res) => get(res, "users"));
app.get("/cart", (req, res) => get(res, "cart"));

//  POST

app.post("/food", (req, res) => create(req, res, "foods"));
app.post("/user", (req, res) => create(req, res, "users"));

//  DELETE

app.delete("/food/:id", (req, res) => del(req, res, "foods"));
app.delete("/user/:id", (req, res) => del(req, res, "users"));

//  PUT

app.put("/food/:id", (req, res) => mod(req, res, "foods"));
app.put("/user/:id", (req, res) => mod(req, res, "users"));




app.listen(88, err => console.log(err ? err : "Server runnin' on port :88"));