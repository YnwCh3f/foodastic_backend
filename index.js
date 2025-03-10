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

/*const get = async (req, res, table) => {
    let tables = table; 
    let filters = "";
    let search = "";
    if (table == "foods"){
        if (req.body.name){
            search = `name like "${req.body.name}%"` 
        }
        if (req.body.kcal){
            tables += ` inner join nutritions using(${table.substring(0, table. length-1)}_id)`;
            filters += `kcal=${req.body.kcal}`
        }
        if (req.body.price){
            filters += `${filters.length > 0 ? " and " : ""}price=${req.body.price} `
        }
    }
    //console.log(`select * from ${tables}` + ((filters.length > 0 || search.length > 0) ? " where " : "") + filters + (filters.length > 0 && search != "" ? " and " : "") + search);
    try{
        const [ json ] = await connection.query(`select * from ${tables}` + ((filters.length > 0 || search.length > 0) ? " where " : "") + filters + (filters.length > 0 && search != "" ? " and " : "") + search);
        res.status(200).send(json);
    } catch (error) {
        res.status(500).send({ error : "Internal Server Error!" });
    }
}*/

const getFoods = async (req, res) => {
    let tables = "foods"; 
    let filters = "";
    let search = "";
    if (req.body.name){
        search = `name like "${req.body.name}%"` 
    }
    if (req.body.kcal){
        tables += ` inner join nutritions using(${table.substring(0, table. length-1)}_id)`;
        filters += `kcal=${req.body.kcal}`
    }
    if (req.body.price){
        filters += `${filters.length > 0 ? " and " : ""}price=${req.body.price} `
    }
    try{
        const [ json ] = await connection.query(`select * from ${tables}` + ((filters.length > 0 || search.length > 0) ? " where " : "") + filters + (filters.length > 0 && search != "" ? " and " : "") + search);
        res.status(200).send(json);
    } catch (error) {
        res.status(500).send({ error : "Internal Server Error!" });
    }
}

const getUsers = async (req, res) => {
    try{
        const [ json ] = await connection.query(`select * from users`);
        res.status(200).send(json);
    } catch (error) {
        res.status(500).send({ error : "Internal Server Error!" });
    }
}

const getNutritions = async (req, res) => {
    try{
        const [ json ] = await connection.query(`select * from nutritions`);
        res.status(200).send(json);
    } catch (error) {
        res.status(500).send({ error : "Internal Server Error!" });
    }
}

const getChat = async (req, res) => {
    if (!(req.params.sender_id && req.params.recipient_id)){
        res.status(400).send({ error : "Bad Request!" });
        return;
    }
    try{
        const [ json ] = await connection.execute(`select u1.first_name, u1.last_name, u2.first_name, u2.last_name, message from chats inner join users as u1 on u1.user_id=sender_id inner join users as u2 on u2.user_id=recipient_id where sender_id=? and recipient_id=?`, req.params.sender_id, req.params.recipient_id);
        res.status(200).send(json);
    } catch (err) {
        res.status(500).send({ error : "Internal Server Error!" });
    }
}



/*const create = async (req, res, table) => {
    let columns;
    switch(table) {
        case "foods":
          if (!(req.body.name && req.body.price && req.body.image)){
            res.status(400).send({ error : "Bad Request!" });
            return;
          }
          columns = `name="${req.body.name}", price=${req.body.price}, image="${req.body.image}"`  
          break;
        case "users":
          if (!(req.body.first_name && req.body.last_name && req.body.email && req.body.password && req.body.profile_picture)){
            res.status(400).send({ error : "Bad Request!" })
            return;
           }
          columns = `first_name="${req.body.first_name}", last_name="${req.body.last_name}", email="${req.body.email}", password="${req.body.password}", profile_picture="${req.body.profile_picture}"`;
          break;
        case "nutritions":
            if (!(req.body.food_id && req.body.kcal)){
                res.status(400).send({ error : "Bad Request!" })
                return;
            }
            columns = `food_id=${req.body.food_id}, kcal=${req.body.kcal}`;
    } 
    console.log(`insert into ${table} set ${columns}`);
    try{
        await connection.query(`insert into ${table} set ${columns}`);
        res.status(201).send({ status : "Created" });
    } catch (error) {
        res.status(500).send({ error : "Internal Server Error!" });
    }
}*/

const newFood = async (req, res) => {
    if (!(req.body.name && req.body.price && req.body.image)){
        res.status(400).send({ error : "Bad Request!" });
        return;
    }
    try{
        await connection.execute(`insert into foods set name=?, price=?, image=?`, req.body.name, req.body.price, req.body.image);
        res.status(201).send({ status : "Created" });
    } catch (error) {
        res.status(500).send({ error : "Internal Server Error!" });
    }
}

const newUser = async (req, res) => {
    if (!(req.body.first_name && req.body.last_name && req.body.email && req.body.password && req.body.profile_picture)){
        res.status(400).send({ error : "Bad Request!" })
        return;
       }
    try{
        await connection.execute(`insert into users set first_name=?, last_name=?, email=?, password=?, profile_picture=?`, req.body.first_name, req.body.last_name, req.body.email, req.body.password, req.body.profile_picture);
        res.status(201).send({ status : "Created" });
    } catch (error) {
        res.status(500).send({ error : "Internal Server Error!" });
    }
}

const newNutrition = async (req, res) => { /* NEM JÓ */ 
    if (!(req.body.food_id && req.body.kcal)){
        res.status(400).send({ error : "Bad Request!" })
        return;
    }
    try{
        await connection.execute(`insert into users set nutrition_id=?, kcal=?`, req.body.food_id, req.body.kcal);
        res.status(201).send({ status : "Created" });
    } catch (error) {
        res.status(500).send({ error : "Internal Server Error!" });
    }
}

const newMessage = async (req, res) => {
    if (!(req.params.sender_id && req.params.recipient_id && req.body.message)){
        res.status(400).send({ error : "Bad Request!" });
        return;
    }
    try{
        const [ json ] = await connection.execute(`insert into chats set sender_id=?, recipient_id=?, message=?`, req.params.sender_id, req.params.recipient_id, req.body.message);
        res.status(200).send(json);
    } catch (err) {
        res.status(500).send({ error : "Internal Server Error!" });
    }
}



const del = async (req, res, table) => {
    if (!(req.params.id)){
        res.status(400).send({ error : "ID not found!" });
        return;
    }
    try{
        await connection.execute(`delete from ${table} where ${table.substring(0, table.length-1)}_id=?`, req.params.id);
        res.status(200).send({ status : "OK" });
    } catch (error) {
        res.status(500).send({ error : "Internal Server Error!" });
    }
}



const mod = async (req, res, table) => {
    if (!(req.params.id)){
        res.status(404).send({ error : "ID not found!" });
        return;
    }
    let columns;
    switch(table) {
        case "foods":
          if (!(req.body.name && req.body.price && req.body.image)){
            res.status(400).send({ error : "Bad Request!" });
            return;
          }
          columns = `name="${req.body.name}", price=${req.body.price}, image=${req.body.image}`  
          break;
        case "users":
          if (!(req.body.first_name && req.body.last_name && req.body.email && req.body.password && req.body.profile_picture)){
            res.status(400).send({ error : "Bad Request!" })
            return;
           }
          columns = `first_name="${req.body.first_name}", last_name="${req.body.last_name}", email="${req.body.email}", password="${req.body.password}", profile_picture="${req.body.profile_picture}"`;
          break;
    } 
    try{
        await connection.query(`update ${table} where ${table.substring(0, table.length-1)}_id=${req.params.id} set ${columns}`);
        res.status(200).send({ status : "OK" });
    } catch (error) {
        res.status(500).send({ error : "Internal Server Error!" });
    }
}

const modFood = async (req, res) => {
    if (!(req.params.id)){
        res.status(404).send({ error : "ID not found!" });
        return;
    }
    if (!(req.body.name && req.body.price && req.body.image)){
        res.status(400).send({ error : "Bad Request!" });
        return;
    }
    try{
        await connection.query(`update foods where food_id=? set name=?, price=?, image=?`, req.params.id, req.body.name, req.body.price, req.body.image);
        res.status(200).send({ status : "OK" });
    } catch (error) {
        res.status(500).send({ error : "Internal Server Error!" });
    }
}

const modUser = async (req, res) => {
    if (!(req.params.id)){
        res.status(404).send({ error : "ID not found!" });
        return;
    }
    if (!(req.body.first_name && req.body.last_name && req.body.email && req.body.password && req.body.profile_picture)){
        res.status(400).send({ error : "Bad Request!" })
        return;
       }
       try{
        await connection.query(`update users where user_id=? set first_name=?, last_name=?, email=?, password=?, profile_picture=?`, req.body.first_name, req.body.last_name, req.body.email, req.body.image, req.body.password, req.body.profile_picture);
        res.status(200).send({ status : "OK" });
    } catch (error) {
        res.status(500).send({ error : "Internal Server Error!" });
    }
}

const modNutrition = async (req, res) => {  /* NEM JÓ */
    if (!(req.params.id)){
        res.status(404).send({ error : "ID not found!" });
        return;
    }
    if (!(req.body.first_name && req.body.last_name && req.body.email && req.body.password && req.body.profile_picture)){
        res.status(400).send({ error : "Bad Request!" })
        return;
       }
    try{
        await connection.query(`update foods where food_id=? set name=?, price=?, image=?`, req.params.id, req.body.name, req.body.price, req.body.image);
        res.status(200).send({ status : "OK" });
    } catch (error) {
        res.status(500).send({ error : "Internal Server Error!" });
    }
}




const modPoints = async (req, res) => {
    if (!(req.params.id)){
        res.status(404).send({ error : "ID not found!" });
        return;
    }
    try{
        await connection.query(`update users where user_id=? set points=?`, req.params.id, req.body.points);
        res.status(200).send({ status : "OK" });
    } catch (error) {
        res.status(500).send({ error : "Internal Server Error!" });
    }
}

const modMessage = async (req, res) => {
    if (!(req.params.sender_id && req.params.recipient_id && req.body.message)){
        res.status(400).send({ error : "Bad Request!" });
        return;
    }
    try{
        const [ json ] = await connection.execute(`update chats where sender_id=? and recipient_id=? set message=?`, req.params.sender_id, req.params.recipient_id, req.body.message);
        res.status(200).send(json);
    } catch (err) {
        res.status(500).send({ error : "Internal Server Error!" });
    }
}



const isRemovable = async (table, column, value) => {
        const [ json ] = await connection.query(`select * from ${table} where ${column}=${value}`);
        return json.length == 0;
}


app.get("/", (req, res) => res.status(200).send("<h1>Foodastic v1.0.0</h1>"));
app.get("/foods", getFoods);
app.get("/users", getUsers);
app.get("/nutritions", getNutritions);
app.get("/chat/:sender_id/:recipient_id", getChat)


app.post("/food", newFood);
app.post("/user", newUser);
app.post("/nutrition", newNutrition);
app.post("/message", newMessage);


app.delete("/food/:id", (req, res) => del(req, res, "foods"));
app.delete("/user/:id", (req, res) => del(req, res, "users"));
app.delete("/nutrition/:id", (req, res) => del(req, res, "nutritions"));


app.put("/food/:id", modFood);
app.put("/user/:id", modUser);
app.put("/nutrition/:id", modNutrition);


app.patch("/user/points/:id", modPoints)
app.patch("/message", modMessage);

app.listen(88, err => console.log(err ? err : "Server runnin' on port :88"));