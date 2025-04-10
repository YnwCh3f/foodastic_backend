import express from "express";
import cors from "cors";
import { createConnection } from "mysql2/promise";
import { rateLimit } from 'express-rate-limit'
import dotenv from "dotenv";
import helmet from "helmet";

dotenv.config();

const connection = await createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
/*app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: 'draft-8',
    legacyHeaders: false
}));*/





const getFoods = async (req, res) => {
    let tables = "foods";
    let filters = "";
    let search = "";
    const { minkcal, maxkcal, name } = req.query;
    if (name) {
        search = `name like "${name}%"`;
    }
    if (minkcal && maxkcal && !(minkcal == 0 && maxkcal == 0)) {
        tables += ` inner join nutritions using(food_id)`;
        filters += `kcal>=${minkcal} and kcal<=${maxkcal}`;
    }
    let allergenNames = ["gluten", "lactose", "nuts", "mollusk", "fish", "egg", "soy"];
    let allergens = [];
    if (req.query.allergens) {
        let arr = JSON.parse(req.query.allergens);
        for (let a of arr) {
            if (JSON.stringify(a).includes("false")) allergens.push(allergenNames[arr.indexOf(a)] + "=false");
        }
    }
    if (allergens.length > 0) {
        tables += " inner join allergens using(food_id)";
        filters += `${filters != "" ? " and " : ""}${allergens.map(x => x).join(" and ")}`;
    }
    let query = `select * from ${tables}` + ((filters.length > 0 || search.length > 0) ? " where " : "") + filters + (filters.length > 0 && search != "" ? " and " : "") + search + ";";
    try {
        const [json] = await connection.query(query);
        //console.log(json);
        res.status(200).send(json);
    } catch (error) {
        res.status(500).send({ error: "Internal Server Error!" });
    }
}

const getUsers = async (req, res) => {
    try {
        const [json] = await connection.query(`select * from users`);
        res.status(200).send(json);
    } catch (error) {
        res.status(500).send({ error: "Internal Server Error!" });
    }
}

const getNutritions = async (req, res) => {
    try {
        const [json] = await connection.query(`select * from nutritions`);
        res.status(200).send(json);
    } catch (error) {
        res.status(500).send({ error: "Internal Server Error!" });
    }
}

const getChat = async (req, res) => {
    if (!(req.params.sender_id && req.params.recipient_id)) {
        res.status(400).send({ error: "Bad Request!" });
        return;
    }
    try {
        const [json] = await connection.execute(`select u1.first_name, u1.last_name, u2.first_name, u2.last_name, message from chats inner join users as u1 on u1.user_id=sender_id inner join users as u2 on u2.user_id=recipient_id where sender_id=? and recipient_id=?`, [req.params.sender_id, req.params.recipient_id]);
        res.status(200).send(json);
    } catch (err) {
        res.status(500).send({ error: "Internal Server Error!" });
    }
}

const getCart = async (req, res) => {
    try {
        const [json] = await connection.execute("select * from cart where user_id=?", [req.params.id])
        if (json.length > 0) res.send(json);
        else res.status(404).send({ error: "User not found!" })
    } catch (error) {
        res.status(500).send({ error: "Internal Server Error!" });
    }
}

const getRestaurants = async (req, res) => {
    try {
        const [json] = await connection.query(`select * from restaurants`);
        res.status(200).send(json);
    } catch (error) {
        res.status(500).send({ error: "Internal Server Error!" });
    }
}

const getOrders = async (req, res) => {
    try {
        const [json] = await connection.execute(`select * from orders inner join cart using(cart_id) where restaurant_id=?`, [req.params.id]);
        res.status(200).send(json);
    } catch (error) {
        res.status(500).send({ error: "Internal Server Error!" });
    }
}



const newFood = async (req, res) => {
    if (!(req.body.name && req.body.price && req.body.image)) {
        res.status(400).send({ error: "Bad Request!" });
        return;
    }
    try {
        await connection.execute(`insert into foods set name=?, price=?, image=?`, [req.body.name, req.body.price, req.body.image]);
        res.status(201).send({ status: "Created" });
    } catch (error) {
        res.status(500).send({ error: "Internal Server Error!" });
    }
}

const newUser = async (req, res) => {
    if (!(req.body.first_name && req.body.last_name && req.body.email && req.body.password)) {
        res.status(400).send({ error: "Bad Request!" })
        return;
    }
    if (await contains("users", "email", req.body.email)) {
        res.status(409).send({ error: "Email address already in use!" });
        return;
    }
    try {
        await connection.execute(`insert into users set first_name=?, last_name=?, email=?, password=sha2(?, 256), role='user'`, [req.body.first_name, req.body.last_name, req.body.email, req.body.password]);
        res.status(201).send({ status: "Created", first_name: req.body.first_name, last_name: req.body.last_name, email: req.body.email, role: "user", user_id: json[0].user_id });
    } catch (error) {
        res.status(500).send({ error: "Internal Server Error!" });
    }
}

const newNutrition = async (req, res) => {
    if (!(req.body.food_id && req.body.kcal)) {
        res.status(400).send({ error: "Bad Request!" })
        return;
    }
    if (contains("nutritions", "food_id", req.body.food_id)) {
        res.status(409).send({ error: "Already in use!" })
        return;
    }
    try {
        await connection.execute(`insert into nutritions set food_id=?, kcal=?`, [req.body.food_id, req.body.kcal]);
        res.status(201).send({ status: "Created" });
    } catch (error) {
        res.status(500).send({ error: "Internal Server Error!" });
    }
}

const newMessage = async (req, res) => {
    if (!req.body.message) {
        res.status(400).send({ error: "Bad Request!" });
        return;
    }
    try {
        const [json] = await connection.execute(`insert into chats set sender_id=?, recipient_id=?, message=?`, [req.params.sender_id, req.params.recipient_id, req.body.message]);
        res.status(201).send({ status: "Created" });
    } catch (err) {
        res.status(500).send({ error: "Internal Server Error!" });
    }
}

const addToCart = async (req, res) => {
    if (!(req.body.user_id && req.body.cart)) {
        res.status(400).send({ error: "Bad Request!" });
        return;
    }
    try {
        let date = new Date().toJSON();
        let cart_id = "#" + req.body.user_id + "" + date;
        for (let i = 0; i < req.body.cart.length; i++) {
            await connection.execute(`insert into cart set cart_id=? user_id=?, food_id=?, date=${date}, count=?, restaurant_id=?`, [cart_id, req.body.user_id, req.body.cart[i].food_id, req.body.cart[i].size, req.body.restaurant_id]);
        }
        await connection.execute(`insert into orders set cart_id=?`, [cart_id]);
        const [json] = connection.execute(`select order_id from orders where cart_id=?`, [cart_id]);
        res.status(201).send({ status: "Created", order_id: json.order_id });
    } catch (error) {
        res.status(500).send({ error: "Internal Server Error!" });
    }
}

const newRestaurant = async (req, res) => {
    if (!(req.body.restaurant_picture && req.body.restaurant_address && req.body.restaurant_name)) {
        res.status(400).send({ error: "Bad Request!" });
        return;
    }
    try {
        const [json] = await connection.execute(`insert into restaurants set restaurant_picture=?, restaurant_address=?, restaurant_name=?`, [req.body.restaurant_picture, req.body.restaurant_address, req.body.restaurant_name]);
        res.status(201).send({ status: "Created" });
    } catch (err) {
        res.status(500).send({ error: "Internal Server Error!" });
    }
}




const del = async (req, res, table, column, value) => {
    if (!(req.params.id)) {
        res.status(400).send({ error: "ID not found!" });
        return;
    }
    try {
        await connection.execute(`delete from ${table} where ${column}=?`, [value]);
        res.status(200).send({ status: "OK" });
    } catch (error) {
        res.status(500).send({ error: "Internal Server Error!" });
    }
}

const delFromCart = async (req, res) => {
    if (!(req.params.user_id && req.params.food_id)) {
        res.status(400).send({ error: "ID not found!" });
        return;
    }
    try {
        await connection.execute(`delete from cart where user_id=? and food_id=?`, [req.params.user_id, req.params.food_id]);
        res.status(200).send({ status: "OK" });
    } catch (error) {
        res.status(500).send({ error: "Internal Server Error!" });
    }
}

const clearCart = async (req, res) => {
    if (!(req.params.user_id)) {
        res.status(400).send({ error: "ID not found!" });
        return;
    }
    try {
        await connection.execute(`delete from cart where user_id=?`, [req.params.user_id]);
        res.status(200).send({ status: "OK" });
    } catch (error) {
        res.status(500).send({ error: "Internal Server Error!" });
    }
}




const modFood = async (req, res) => {
    if (!(req.body.name && req.body.price && req.body.image)) {
        res.status(400).send({ error: "Bad Request!" });
        return;
    }
    try {
        await connection.execute(`update foods set name=?, price=?, image=? where food_id=?`, [req.body.name, req.body.price, req.body.image, req.params.id]);
        res.status(200).send({ status: "OK" });
    } catch (error) {
        //console.log(error);
        res.status(500).send({ error: "Internal Server Error!" });
    }
}

const modUser = async (req, res) => {
    console.log(req.body)
    if (!(req.body.first_name && req.body.last_name && req.body.password && req.body.profile_picture)) {
        res.status(400).send({ error: "Bad Request!" })
        return;
    }
    try {
        await connection.query(`update users set first_name=?, last_name=?, password=?, profile_picture=? where user_id=?`, [req.body.first_name, req.body.last_name, req.body.password, req.body.profile_picture, req.params.id]);
        res.status(200).send({ status: "OK" });
    } catch (error) {
        res.status(500).send({ error: "Internal Server Error!" });
    }
}

const modNutrition = async (req, res) => {
    if (!req.body.kcal) {
        res.status(400).send({ error: "Bad request!" });
        return;
    }
    if (!contains("nutritions", "food_id", req.params.id)) {
        res.status(404).send({ error: "ID not found!" });
        return;
    }
    try {
        await connection.query(`update nutritions set kcal=? where food_id=? `, [req.body.kcal, req.params.id]);
        res.status(200).send({ status: "OK" });
    } catch (error) {
        res.status(500).send({ error: "Internal Server Error!" });
    }
}

const modPoints = async (req, res) => {
    if (!req.body.points) {
        res.status(400).send({ error: "Bad request!" });
        return;
    }
    if (!(await contains("users", "user_id", req.params.id))) {
        res.status(404).send({ error: "ID not found!" });
        return;
    }
    try {
        await connection.query(`update users set points=? where user_id=? `, [req.body.points, req.params.id]);
        res.status(200).send({ status: "OK" });
    } catch (error) {
        res.status(500).send({ error: "Internal Server Error!" });
    }
}

const modMessage = async (req, res) => {
    if (!(req.body.message)) {
        res.status(400).send({ error: "Bad Request!" });
        return;
    }
    try {
        const [json] = await connection.execute(`update chats set message=? where chat_id=?`, [req.body.message, req.params.id]);
        res.status(200).send({ staus: "OK" });
    } catch (err) {
        res.status(500).send({ error: "Internal Server Error!" });
    }
}


const modImage = async (req, res) => {
    if (!(req.body.image)) {
        res.status(400).send({ error: "Bad Request!" });
        return;
    }
    if (!(await contains("foods", "food_id", req.params.id))){
        res.status(404).send({ error: "ID not found!" });
        return;
    }
    try {
        await connection.execute(`update foods set image=? where food_id=?`, [req.body.image, req.params.id]);

        res.status(200).send({ status: "OK" });
    } catch (error) {
        //console.log(error);
        res.status(500).send({ error: "Internal Server Error!" });
    }
}

const modPrice = async (req, res) => {
    if (!req.body.price) {
        res.status(400).send({ error: "Bad Request!" });
        return;
    }
    if (!(await contains("foods", "food_id", req.params.id))){
        res.status(404).send({ error: "ID not found!" });
        return;
    }
    try {
        await connection.execute(`update foods set price=? where food_id=?`, [req.body.price, req.params.id]);

        res.status(200).send({ status: "OK" });
    } catch (error) {
        //console.log(error);
        res.status(500).send({ error: "Internal Server Error!" });
    }
}


const contains = async (table, column, value) => {
    const [json] = await connection.execute(`select * from ${table} where ${column}=?`, [value]);
    //console.log(json)
    return json.length != 0;
}

const login = async (req, res) => {
    if (!(req.body.email && req.body.password)) {
        res.status(400).send({ error: "Bad Request!" });
        return;
    }
    if (!(await contains("users", "email", req.body.email))) {
        res.status(404).send({ error: "User not found!" });
        return;
    }
    try {
        const [json] = await connection.execute("select * from users where email=? and password=sha2(?, 256)", [req.body.email, req.body.password]);
        if (json.length > 0) res.status(200).send({ status: "OK", first_name: json[0].first_name, last_name: json[0].last_name, email: json[0].email, role: json[0].role, user_id: json[0].user_id });
        else res.status(401).send({ error: "Wrong password!" })
    } catch (err) {
        res.status(500).send({ error: "Internal Server Error!" })
    }
}


app.get("/", (req, res) => res.status(200).send("<h1>Foodastic v1.0.0</h1>"));
app.get("/foods", getFoods);
app.get("/users", getUsers);
app.get("/nutritions", getNutritions);
app.get("/chat/:sender_id/:recipient_id", getChat);
app.get("/cart/:id", getCart);
app.get("/restaurants", getRestaurants);
app.get("/orders/:id", getOrders);


app.post("/food", newFood);
app.post("/user", newUser);
app.post("/nutrition", newNutrition);
app.post("/message/:sender_id/:recipient_id", newMessage);
app.post("/addtocart", addToCart);
app.post("/restaurant", newRestaurant);
app.post("/login", login);
//app.post("/allergen", newAllergen);

app.delete("/food/:id", (req, res) => del(req, res, "foods", "food_id", req.params.id));
app.delete("/user/:id", (req, res) => del(req, res, "users", "user_id", req.params.id));
app.delete("/nutrition/:id", (req, res) => del(req, res, "nutritions", "food_id", req.params.id));
app.delete("/delfromcart/:user_id/:food_id", delFromCart);
app.delete("/clearcart/:user_id/", clearCart);
app.delete("/restaurant/:id", (req, res) => del(req, res, "restaurants", "restaurant_id", req.params.id));


app.put("/food/:id", modFood);
app.put("/user/:id", modUser);
app.put("/nutrition/:id", modNutrition);


app.patch("/foodimage/:id", modImage);
app.patch("/foodprice/:id", modPrice);

app.patch("/user/points/:id", modPoints);
app.patch("/message/:id", modMessage);

const port = process.env.API_PORT || 89;

app.listen(port, err => console.log(err ? err : `Server runnin' on port :${port}`));



/*


INSERT INTO restaurants SET restaurant_picture='https://s3-eu-west-1.amazonaws.com/wijnspijs/images/height300/harbour-house-bristol.jpeg', restaurant_address='123 Main St, City';

INSERT INTO restaurants SET restaurant_picture='https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0d/53/ce/70/dinerbon-restaurant-pomphuis.jpg?w=500&h=300&s=1', restaurant_address='456 Elm St, City';

INSERT INTO restaurants SET restaurant_picture='https://s3-eu-west-1.amazonaws.com/wijnspijs/images/height300/restaurant:maison-by-glaschu.jpg', restaurant_address='789 Oak St, City';

INSERT INTO restaurants SET restaurant_name='The Gourmet Spot', restaurant_picture='https://s3-eu-west-1.amazonaws.com/wijnspijs/images/height300/harbour-house-bristol.jpeg', restaurant_address='123 Main St, City';

INSERT INTO restaurants SET restaurant_name='Urban Bites', restaurant_picture='https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0d/53/ce/70/dinerbon-restaurant-pomphuis.jpg?w=500&h=300&s=1', restaurant_address='456 Elm St, City';

INSERT INTO restaurants SET restaurant_name='Cozy Corner Cafe', restaurant_picture='https://s3-eu-west-1.amazonaws.com/wijnspijs/images/height300/restaurant:maison-by-glaschu.jpg', restaurant_address='789 Oak St, City';

*/


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


/*const mod = async (req, res, table) => {
    if (!(req.params.id)) {
        res.status(404).send({ error: "ID not found!" });
        return;
    }
    let columns;
    switch (table) {
        case "foods":
            if (!(req.body.name && req.body.price && req.body.image)) {
                res.status(400).send({ error: "Bad Request!" });
                return;
            }
            columns = `name="${req.body.name}", price=${req.body.price}, image=${req.body.image}`
            break;
        case "users":
            if (!(req.body.first_name && req.body.last_name && req.body.email && req.body.password && req.body.profile_picture)) {
                res.status(400).send({ error: "Bad Request!" })
                return;
            }
            columns = `first_name="${req.body.first_name}", last_name="${req.body.last_name}", email="${req.body.email}", password="${req.body.password}", profile_picture="${req.body.profile_picture}"`;
            break;
    }
    try {
        await connection.query(`update ${table} where ${table.substring(0, table.length - 1)}_id=${req.params.id} set ${columns}`);
        res.status(200).send({ status: "OK" });
    } catch (error) {
        res.status(500).send({ error: "Internal Server Error!" });
    }
}*/


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