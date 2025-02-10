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

const getFoods = async (req, res) => {
    try{
        const [ json ] = await connection.query("select * from foods");
        res.status(200).send(json);
    } catch {
        res.status(500).send({ error : "Wrong query!" });
    }
}

//  GET

app.get("/", (req, res) => res.status(200).send("<h1>Foodastic v1.0.0</h1>"));
app.get("/foods", (req, res) => getFoods);

//  POST



//  DELETE



//  PUT






app.listen(88, err => console.log(err ? err : "Server runnin' on port :88"));