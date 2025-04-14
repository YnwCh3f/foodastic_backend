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
        res.status(200).send(json);
    } catch (error) {
        res.status(500).send({ error: "Internal Server Error!" });
    }
}

const getFoodById = async (req, res) => {
    try {
        const [json] = await connection.execute("select * from foods where food_id=?", [req.params.id]);
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

const getOrderHistory = async (req, res) => {
    if (!(await contains("users", "user_id", req.params.id))) {
        return res.status(404).send({ error: "ID not found!" });
    }
    if (!(await contains("orders", "user_id", req.params.id))) {
        return res.status(404).send({ error: "User has no orders!" });
    }
    try {
        const [json] = await connection.execute(`select * from orders inner join cart using(cart_id) inner join foods using(food_id) where user_id=? order by date`, [req.params.id]);
        let arr = [];
        let resp = []
        for (let j of json) {
            if (!arr.includes(j.order_id)) arr.push(j.order_id);
        }
        for (let a of arr) {
            let t = [];
            let o = {};
            for (let j of json) {
                if (a == j.order_id) {
                    o.order_id = a,
                        o.user_id = j.user_id;
                    o.cart_id = j.cart_id;
                    o.date = j.date;
                    o.restaurant_id = j.restaurant_id;
                    t.push({
                        food_id: j.food_id,
                        name: j.name,
                        count: j.count
                    });
                }
            }
            o.cart = t;
            resp.push(o);
        }
        res.status(200).send(resp);
    } catch (error) {
        res.status(500).send({ error: "Internal Server Error!" });
    }
}



const newFood = async (req, res) => {
    if (!(req.body.name && req.body.price && req.body.image)) {
        return res.status(400).send({ error: "Bad Request!" });
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
        return res.status(400).send({ error: "Bad Request!" });
    }
    if (await contains("users", "email", req.body.email)) {
        return res.status(409).send({ error: "Email address already in use!" });
    }
    try {
        await connection.execute(`insert into users set first_name=?, last_name=?, email=?, password=sha2(?, 256), role='user'`, [req.body.first_name, req.body.last_name, req.body.email, req.body.password]);
        const [json] = await connection.execute(`select * from users where email=?`, [req.body.email]);
        res.status(201).send({ status: "Created", first_name: req.body.first_name, last_name: req.body.last_name, email: req.body.email, role: "user", user_id: json[0].user_id });
    } catch (error) {
        res.status(500).send({ error: "Internal Server Error!" });
    }
}

const newNutrition = async (req, res) => {
    if (!(req.body.food_id && req.body.kcal)) {
        return res.status(400).send({ error: "Bad Request!" })
    }
    if (contains("nutritions", "food_id", req.body.food_id)) {
        return res.status(409).send({ error: "Already in use!" })
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
        return res.status(400).send({ error: "Bad Request!" });
    }
    try {
        await connection.execute(`insert into chats set sender_id=?, recipient_id=?, message=?`, [req.params.sender_id, req.params.recipient_id, req.body.message]);
        res.status(201).send({ status: "Created" });
    } catch (err) {
        res.status(500).send({ error: "Internal Server Error!" });
    }
}

const newOrder = async (req, res) => {
    if (!(req.body.user_id && req.body.cart && req.body.restaurant_id)) {
        return res.status(400).send({ error: "Bad Request!" });
    }
    console.log(req.body+"\n")
    try {
        let date = new Date().toJSON();
        let cart_id = "#" + req.body.user_id + "/" + date;
        //console.log(cart_id);
        //console.log(req.body.cart.length);
        for (let i = 0; i < req.body.cart.length; i++) {
            await connection.execute(`insert into cart set cart_id=?, food_id=?, date="${date}", count=?`, [cart_id, req.body.cart[i].food_id, req.body.cart[i].size]);
        }
        await connection.execute(`insert into orders set cart_id=?, restaurant_id=?, user_id=?`, [cart_id, req.body.restaurant_id, req.body.user_id]);
        const [json] = await connection.execute(`select order_id from orders where cart_id=?`, [cart_id]);
        res.status(201).send({ status: "Created", order_id: json.order_id });
    } catch (error) {
        console.log(error)
        res.status(500).send({ error: "Internal Server Error!" });
    }
}

const newRestaurant = async (req, res) => {
    if (!(req.body.restaurant_picture && req.body.restaurant_address && req.body.restaurant_name)) {
        return res.status(400).send({ error: "Bad Request!" });
    }
    try {
        const [json] = await connection.execute(`insert into restaurants set restaurant_picture=?, restaurant_address=?, restaurant_name=?`, [req.body.restaurant_picture, req.body.restaurant_address, req.body.restaurant_name]);
        res.status(201).send({ status: "Created" });
    } catch (err) {
        res.status(500).send({ error: "Internal Server Error!" });
    }
}




const del = async (req, res, table, column, value) => {
    if (!(await contains(table, column, value))) {
        return res.status(404).send({ error: "Not found!" });
    }
    try {
        await connection.execute(`delete from ${table} where ${column}=?`, [value]);
        res.status(200).send({ status: "OK" });
    } catch (error) {
        res.status(500).send({ error: "Internal Server Error!" });
    }
}

const delUser = async (req, res) => {
    if (!(await contains("users", "user_id", req.params.id))) {
        return res.status(404).send({ error: "Not found!" });
    }
    try {
        await connection.execute(`delete from users where user_id=?`, [req.params.id]);
        const [json] = await connection.execute(`select cart_id from orders where user_id=?`, [req.params.id]);
        if (json.length > 0) {
            await connection.execute(`delete from orders where user_id=?`, [req.params.id]);
            for (let j of json) { await connection.execute(`delete from cart where cart_id=?`, [j.cart_id]); }
        }
        res.status(200).send({ status: "OK" });
    } catch (error) {
        res.status(500).send({ error: "Internal Server Error!" });
    }

}

const delFood = async (req, res) => {
    if (!(await contains("foods", "food_id", req.params.id))) {
        return res.status(404).send({ error: "Not found!" });
    }
    if (await contains("cart", "food_id", req.params.id) || await contains("nutritions", "food_id", req.params.id)) {
        return res.status(400).send({ error: "Cannot be deleted!(item exists in another table)" });
    }
    try {
        await connection.execute(`delete from foods where food_id=?`, [req.params.id]);

        res.status(200).send({ status: "OK" });
    } catch (error) {
        res.status(500).send({ error: "Internal Server Error!" });
    }

}

const delFromCart = async (req, res) => {
    if (!(req.params.user_id && req.params.food_id)) {
        return res.status(400).send({ error: "ID not found!" });
    }
    try {
        await connection.execute(`delete from cart where user_id=? and food_id=?`, [req.params.user_id, req.params.food_id]);
        res.status(200).send({ status: "OK" });
    } catch (error) {
        res.status(500).send({ error: "Internal Server Error!" });
    }
}

const clearCart = async (req, res) => {
    if (!(await contains("orders", "user_id", req.params.user_id))) {
        return res.status(400).send({ error: "ID not found!" });
    }
    try {
        await connection.execute(`delete from orders where user_id=?`, [req.params.user_id]);
        await connection.execute(`delete from cart where user_id=?`, [req.params.user_id]);
        res.status(200).send({ status: "OK" });
    } catch (error) {
        res.status(500).send({ error: "Internal Server Error!" });
    }
}




const modFood = async (req, res) => {
    if (!(req.body.name && req.body.price && req.body.image)) {
        return res.status(400).send({ error: "Bad Request!" });
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
    if (!(req.body.first_name && req.body.last_name && req.body.password && req.body.profile_picture)) {
        return res.status(400).send({ error: "Bad Request!" })
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
        return res.status(400).send({ error: "Bad request!" });
    }
    if (!contains("nutritions", "food_id", req.params.id)) {
        return res.status(404).send({ error: "ID not found!" });
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
        return res.status(400).send({ error: "Bad request!" });
    }
    if (!(await contains("users", "user_id", req.params.id))) {
        return res.status(404).send({ error: "ID not found!" });
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
        return res.status(400).send({ error: "Bad Request!" });
    }
    try {
        const [json] = await connection.execute(`update chats set message=? where chat_id=?`, [req.body.message, req.params.id]);
        res.status(200).send({ staus: "OK" });
    } catch (err) {
        res.status(500).send({ error: "Internal Server Error!" });
    }
}


const modFoodImage = async (req, res) => {
    if (!(req.body.image)) {
        return res.status(400).send({ error: "Bad Request!" });
    }
    if (!(await contains("foods", "food_id", req.params.id))) {
        return res.status(404).send({ error: "ID not found!" });
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
        return res.status(400).send({ error: "Bad Request!" });
    }
    if (!(await contains("foods", "food_id", req.params.id))) {
        return res.status(404).send({ error: "ID not found!" });
    }
    try {
        await connection.execute(`update foods set price=? where food_id=?`, [req.body.price, req.params.id]);

        res.status(200).send({ status: "OK" });
    } catch (error) {
        //console.log(error);
        res.status(500).send({ error: "Internal Server Error!" });
    }
}

const modUserImage = async (req, res) => {
    if (!req.body.image) {
        return res.status(400).send({ error: "Bad Request!" });
    }
    if (!(await contains("users", "user_id", req.params.id))) {
        return res.status(404).send({ error: "ID not found!" });
    }
    try {
        await connection.execute(`update users set image=? where user_id=?`, [req.body.image, req.params.id]);
        const [json] = await connection.execute(`select * users where user_id=?`, [req.params.id]);
        res.status(200).send(json);
    } catch (error) {
        //console.log(error);
        res.status(500).send({ error: "Internal Server Error!" });
    }
}

const modUserPassword = async (req, res) => {
    if (!req.body.password) {
        return res.status(400).send({ error: "Bad Request!" });
    }
    if (!(await contains("users", "user_id", req.params.id))) {
        return res.status(404).send({ error: "ID not found!" });
    }
    try {
        await connection.execute(`update users set password=sha2(?, 256) where user_id=?`, [req.body.password, req.params.id]);
        res.status(200).send({ status: "OK" });
    } catch (error) {
        //console.log(error);
        res.status(500).send({ error: "Internal Server Error!" });
    }
}

const modUserName = async (req, res) => {
    if (!(req.body.first_name && req.body.last_name)) {
        return res.status(400).send({ error: "Bad Request!" });
    }
    if (!(await contains("users", "user_id", req.params.id))) {
        return res.status(404).send({ error: "ID not found!" });
    }
    try {
        await connection.execute(`update users set first_name=?, last_name=? where user_id=?`, [req.body.first_name, req.body.last_name, req.params.id]);
        const [json] = await connection.execute(`select * users where user_id=?`, [req.params.id]);
        res.status(200).send(json);
    } catch (error) {
        res.status(500).send({ error: "Internal Server Error!" });
    }
}


const modUserEmail = async (req, res) => {
    if (!(req.body.first_name && req.body.last_name)) {
        return res.status(400).send({ error: "Bad Request!" });
    }
    if (!(await contains("users", "user_id", req.params.id))) {
        return res.status(404).send({ error: "ID not found!" });
    }
    try {
        await connection.execute(`update users set email=? where user_id=?`, [req.body.email, req.params.id]);
        const [json] = await connection.execute(`select * users where user_id=?`, [req.params.id]);
        res.status(200).send(json);
    } catch (error) {
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
        return res.status(400).send({ error: "Bad Request!" });
    }
    if (!(await contains("users", "email", req.body.email))) {
        return res.status(404).send({ error: "User not found!" });
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
app.get("/food/:id", getFoodById)
app.get("/users", getUsers);
app.get("/nutritions", getNutritions);
app.get("/chat/:sender_id/:recipient_id", getChat);
app.get("/cart/:id", getCart);
app.get("/restaurants", getRestaurants);
app.get("/orders/:id", getOrders);
app.get("/orderhistory/:id", getOrderHistory);


app.post("/food", newFood);
app.post("/user", newUser);
app.post("/nutrition", newNutrition);
app.post("/message/:sender_id/:recipient_id", newMessage);
app.post("/order", newOrder);
app.post("/restaurant", newRestaurant);
app.post("/login", login);
//app.post("/allergen", newAllergen);

app.delete("/food/:id", delFood);
app.delete("/user/:id", delUser);
app.delete("/nutrition/:id", (req, res) => del(req, res, "nutritions", "food_id", req.params.id));
app.delete("/delfromcart/:user_id/:food_id", delFromCart);
app.delete("/clearcart/:user_id/", clearCart);
app.delete("/restaurant/:id", (req, res) => del(req, res, "restaurants", "restaurant_id", req.params.id));


app.put("/food/:id", modFood);
app.put("/user/:id", modUser);
app.put("/nutrition/:id", modNutrition);


app.patch("/foodimage/:id", modFoodImage);
app.patch("/foodprice/:id", modPrice);

app.patch("/user/points/:id", modPoints);
app.patch("/user/password/:id", modUserPassword);
app.patch("/user/image/:id", modUserImage);
app.patch("/user/name/:id", modUserName);
app.patch("/user/email/:id", modUserEmail);
app.patch("/message/:id", modMessage);

const port = process.env.API_PORT || 89;

app.listen(port, err => console.log(err ? err : `Server runnin' on port :${port}`));