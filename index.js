import express from "express";
import cors from "cors";
import { createConnection } from "mysql2/promise";
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
        res.send(json);
    } catch (error) {
        res.status(500).send({ error: "Internal Server Error!" });
    }
}

const getFoodById = async (req, res) => {
    try {
        const [json] = await connection.execute("select * from foods inner join nutritions using(food_id) where food_id=?", [req.params.id]);
        res.send(json);
    } catch (error) {
        res.status(500).send({ error: "Internal Server Error!" });
    }
}

const getRestaurantById = async (req, res) => {
    try {
        const [json] = await connection.execute("select * from restaurants where restaurant_id=?", [req.params.id]);
        res.send(json);
    } catch (error) {
        res.status(500).send({ error: "Internal Server Error!" });
    }
}

const getRestaurantByUserId = async (req, res) => {
    try {
        const [json] = await connection.execute("select * from restaurants inner join users on restaurants.restaurant_user_id=users.user_id where user_id=?", [req.params.id]);
        res.send(json);
    } catch (error) {
        res.status(500).send({ error: "Internal Server Error!" });
    }
}

const getUsers = async (req, res) => {
    try {
        const [json] = await connection.query(`select user_id, first_name, last_name, email, profile_picture, points, role from users`);
        res.send(json);
    } catch (error) {
        res.status(500).send({ error: "Internal Server Error!" });
    }
}

const getNutritions = async (req, res) => {
    try {
        const [json] = await connection.query(`select * from nutritions`);
        res.send(json);
    } catch (error) {
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

const getCartByCartId = async (req, res) => {
    try {
        const [json] = await connection.execute("select * from cart inner join foods using(food_id) where cart_id=?", [req.params.id])
        if (json.length > 0) res.send(json);
        else res.status(404).send({ error: "Cart not found!" })
    } catch (error) {
        res.status(500).send({ error: "Internal Server Error!" });
    }
}


const getRestaurants = async (req, res) => {
    try {
        const [json] = await connection.query(`select * from restaurants`);
        res.send(json);
    } catch (error) {
        res.status(500).send({ error: "Internal Server Error!" });
    }
}

const getOrders = async (req, res) => {
    try {
        const [json] = await connection.execute(`select * from orders inner join cart using(cart_id) where restaurant_id=?`, [req.params.id]);
        res.send(json);
    } catch (error) {
        res.status(500).send({ error: "Internal Server Error!" });
    }
}

const getConfirmedOrders = async (req, res) => {
    try {
        const [json] = await connection.execute(`select * from orders inner join restaurants using(restaurant_id) where restaurant_id=? and confirmed=true and finished=false`, [req.params.id]);
        res.send(json);
    } catch (error) {
        res.status(500).send({ error: "Internal Server Error!" });
    }
}

const getUnconfirmedOrders = async (req, res) => {
    try {
        const [json] = await connection.execute(`select * from orders inner join restaurants using(restaurant_id) where restaurant_id=? and confirmed=false`, [req.params.id]);
        res.send(json);
    } catch (error) {
        res.status(500).send({ error: "Internal Server Error!" });
    }
}

const getFinishedOrders = async (req, res) => {
    try {
        const [json] = await connection.execute(`select * from orders inner join restaurants using(restaurant_id) where restaurant_id=? finished=true`, [req.params.id]);
        res.send(json);
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
                    o.order_id = a;
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
        res.send(resp);
    } catch (error) {
        res.status(500).send({ error: "Internal Server Error!" });
    }
}



const newFood = async (req, res) => {
    if (!(req.body.name && req.body.price && req.body.image && req.body.allergens && req.body.kcal)) {
        return res.status(400).send({ error: "Bad Request!" });
    }
    let allergens = [];
    let arr = JSON.parse(req.body.allergens);
    for (let a of Object.keys(arr)) {
        allergens.push(a + "=" + arr[a]);
    }
    try {
        await connection.execute(`insert into foods set name=?, price=?, image=?;`, [req.body.name, req.body.price, req.body.image]);
        const [json] = await connection.execute("select food_id from foods order by food_id desc limit 1;");
        await connection.execute(`insert into allergens set food_id=${json[0].food_id}, ${allergens.map(x => x).join(", ")};`);
        await connection.execute(`insert into nutritions set food_id=?, kcal=?`, [json[0].food_id, req.body.kcal]);
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

const newOrder = async (req, res) => {
    if (!(req.body.user_id && req.body.cart && req.body.restaurant_id)) {
        return res.status(400).send({ error: "Bad Request!" });
    }
    try {
        let date = new Date().toJSON();
        let cart_id = req.body.user_id + "" + date;
        for (let i = 0; i < req.body.cart.length; i++) {
            await connection.execute(`insert into cart set cart_id=?, food_id=?, date="${date}", count=?`, [cart_id, req.body.cart[i].food_id, req.body.cart[i].size]);
        }
        await connection.execute(`insert into orders set cart_id=?, restaurant_id=?, user_id=?`, [cart_id, req.body.restaurant_id, req.body.user_id]);
        const [json] = await connection.execute(`select order_id from orders where cart_id=?`, [cart_id]);
        res.status(201).send({ status: "Created", order_id: json[0].order_id });
    } catch (error) {
        res.status(500).send({ error: "Internal Server Error!" });
    }
}

const newRestaurant = async (req, res) => {
    if (!(req.body.restaurant_picture && req.body.restaurant_address && req.body.restaurant_name && req.body.password)) {
        return res.status(400).send({ error: "Bad Request!" });
    }
    try {
        await connection.execute(`insert into restaurants set restaurant_picture=?, restaurant_address=?, restaurant_name=?`, [req.body.restaurant_picture, req.body.restaurant_address, req.body.restaurant_name]);
        const [json] = await connection.execute(`select * from restaurants order by restaurant_id desc limit 1;`);
        await connection.execute(`insert into users set first_name="-", last_name="-", email=?, password=sha2(?, 256), role='restaurant'`, ["restaurant" + json[0].restaurant_id, req.body.password]);
        const [j] = await connection.execute(`select * from users order by user_id desc limit 1;`);
        await connection.execute(`update restaurants set restaurant_user_id=? where restaurant_id=?`, [j[0].user_id, json[0].restaurant_id]);
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
        res.send({ status: "OK" });
    } catch (error) {
        res.status(500).send({ error: "Internal Server Error!" });
    }
}

const delUser = async (req, res) => {
    if (!(await contains("users", "user_id", req.params.id))) {
        return res.status(404).send({ error: "Not found!" });
    }
    try {
        const [j] = await connection.execute(`select * from users where user_id=?`, [req.params.id]);
        await connection.execute(`delete from users where user_id=?`, [req.params.id]);
        const [json] = await connection.execute(`select cart_id from orders where user_id=?`, [req.params.id]);
        if (j[0].role == "restaurant") await connection.execute(`delete from restaurants where user_id=?`, [req.params.id]);
        else{
            if (json.length > 0) {
                await connection.execute(`delete from orders where user_id=?`, [req.params.id]);
                for (let j of json) { await connection.execute(`delete from cart where cart_id=?`, [j.cart_id]); }
            }                
        }
        res.send({ status: "OK" });
    } catch (error) {
        res.status(500).send({ error: "Internal Server Error!" });
    }

}

const delFood = async (req, res) => {
    if (!(await contains("foods", "food_id", req.params.id))) {
        return res.status(404).send({ error: "Not found!" });
    }
    if (await contains("cart", "food_id", req.params.id)) {
        return res.status(400).send({ error: "Cannot be deleted! (an order contains this food)" });
    }
    try {
        await connection.execute(`delete from foods where food_id=?`, [req.params.id]);
        res.send({ status: "OK" });
    } catch (error) {
        res.status(500).send({ error: "Internal Server Error!" });
    }

}


const modFood = async (req, res) => {
    if (!(req.body.name && req.body.price && req.body.image && req.body.kcal)) {
        return res.status(400).send({ error: "Bad Request!" });
    }
    try {
        await connection.execute(`update foods set name=?, price=?, image=? where food_id=?`, [req.body.name, req.body.price, req.body.image, req.params.id]);
        await connection.execute(`update nutritions set kcal=? where food_id=?`, [req.body.kcal, req.params.id]);
        res.send({ status: "OK" });
    } catch (error) {
        res.status(500).send({ error: "Internal Server Error!" });
    }
}

const modUser = async (req, res) => {
    if (!(req.body.first_name && req.body.last_name && req.body.password && req.body.profile_picture)) {
        return res.status(400).send({ error: "Bad Request!" })
    }
    try {
        await connection.query(`update users set first_name=?, last_name=?, password=?, profile_picture=? where user_id=?`, [req.body.first_name, req.body.last_name, req.body.password, req.body.profile_picture, req.params.id]);
        res.send({ status: "OK" });
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
        res.send({ status: "OK" });
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
        res.send({ status: "OK" });
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
        res.send({ staus: "OK" });
    } catch (err) {
        res.status(500).send({ error: "Internal Server Error!" });
    }
}

const modRestaurant = async (req, res) => {
    if (!(req.body.restaurant_name && req.body.restaurant_address && req.body.restaurant_picture)) {
        return res.status(400).send({ error: "Bad Request!" });
    }
    try {
        await connection.execute(`update restaurants set restaurant_name=?, restaurant_picture=?, restaurant_address=? where restaurant_id=?`, [req.body.restaurant_name, req.body.restaurant_picture, req.body.restaurant_address, req.params.id]);
        res.send({ status: "OK" });
    } catch (error) {
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

        res.send({ status: "OK" });
    } catch (error) {
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

        res.send({ status: "OK" });
    } catch (error) {
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
        await connection.execute(`update users set profile_picture=? where user_id=?`, [req.body.image, req.params.id]);
        //const [json] = await connection.execute(`select * from users where user_id=?`, [req.params.id]);
        res.send({ status: "OK" });
    } catch (error) {
        res.status(500).send({ error: "Internal Server Error!" });
    }
}

const modUserPassword = async (req, res) => {
    if (!(req.body.password && req.body.passwordOld)) {
        return res.status(400).send({ error: "Bad Request!" });
    }
    if (!(await contains("users", "user_id", req.params.id))) {
        return res.status(404).send({ error: "ID not found!" });
    }
    try {
        const [json] = await connection.execute(`select user_id from users where password=sha2(?, 256)`, [req.body.passwordOld]);
        if (json.length == 0) return res.status(401).send({ error: "Invalid password!" });
        if (!(json.filter(v => v.user_id == req.params.id).length)) return res.status(401).send({ error: "Invalid password!" });
        await connection.execute(`update users set password=sha2(?, 256) where user_id=?`, [req.body.password, req.params.id]);
        res.send({ status: "OK" });
    } catch (error) {
        res.status(500).send({ error: "Internal Server Error!" });
    }
}

const modUserName = async (req, res) => {
    if (!(await contains("users", "user_id", req.params.id))) {
        return res.status(404).send({ error: "ID not found!" });
    }
    if (!(req.body.first_name && req.body.last_name && req.body.password)) {
        return res.status(400).send({ error: "Bad Request!" });
    }
    try {
        const [json] = await connection.execute(`select user_id from users where password=sha2(?, 256)`, [req.body.password]);
        if (json.length == 0) return res.status(401).send({ error: "Invalid password!" });
        if (!(json.filter(v => v.user_id == req.params.id).length)) return res.status(401).send({ error: "Invalid password!" });
        await connection.execute(`update users set first_name=?, last_name=? where user_id=?`, [req.body.first_name, req.body.last_name, req.params.id]);
        res.send({ status: "OK" });
    } catch (error) {
        res.status(500).send({ error: "Internal Server Error!" });
    }
}

const confirmOrder = async (req, res) => {
    try {
        await connection.execute("update orders set confirmed=true where order_id=?", [req.params.id]);
        res.send({ status: "Order confirmed" });
    } catch (err) {
        res.status(500).send({ error: "Internal Server Error!" });
    }
}

const finishOrder = async (req, res) => {
    try {
        await connection.execute("update orders set finished=true where order_id=?", [req.params.id]);
        res.send({ status: "Order finished" });
    } catch (err) {
        res.status(500).send({ error: "Internal Server Error!" });
    }
}

const modUserEmail = async (req, res) => {
    if (!req.body.email) {
        return res.status(400).send({ error: "Bad Request!" });
    }
    if (!(await contains("users", "user_id", req.params.id))) {
        return res.status(404).send({ error: "ID not found!" });
    }
    try {
        const [json] = await connection.execute(`select user_id from users where password=sha2(?, 256)`, [req.body.password]);
        if (json.length == 0) return res.status(401).send({ error: "Invalid password!" });
        if (!(json.filter(v => v.user_id == req.params.id).length)) return res.status(401).send({ error: "Invalid password!" });
        await connection.execute(`update users set email=? where user_id=?`, [req.body.email, req.params.id]);
        //const [json] = await connection.execute(`select * from users where user_id=?`, [req.params.id]);
        res.send({ status: "OK" });
    } catch (error) {
        res.status(500).send({ error: "Internal Server Error!" });
    }
}

const contains = async (table, column, value) => {
    const [json] = await connection.execute(`select * from ${table} where ${column}=?`, [value]);
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
        if (json.length > 0) res.send({ status: "OK", first_name: json[0].first_name, last_name: json[0].last_name, email: json[0].email, role: json[0].role, user_id: json[0].user_id, profile_picture: json[0].profile_picture });
        else res.status(401).send({ error: "Wrong password!" });
    } catch (err) {
        res.status(500).send({ error: "Internal Server Error!" })
    }
}


app.get("/", (req, res) => {
    res.send("<h1>Foodastic</h1>");
});
app.get("/foods", getFoods);
app.get("/food/:id", getFoodById);
app.get("/restaurant/:id", getRestaurantById);
app.get("/restaurantbyuserid/:id", getRestaurantByUserId);
app.get("/users", getUsers);
app.get("/nutritions", getNutritions);
app.get("/cart/:id", getCart);
app.get("/cartbycartid/:id", getCartByCartId);
app.get("/restaurants", getRestaurants);
app.get("/orders/:id", getOrders);
app.get("/orders/confirmed/:id", getConfirmedOrders);
app.get("/orders/unconfirmed/:id", getUnconfirmedOrders);
app.get("/orders/finished/:id", getFinishedOrders);
app.get("/orderhistory/:id", getOrderHistory);


app.post("/food", newFood);
app.post("/user", newUser);
app.post("/nutrition", newNutrition);
app.post("/order", newOrder);
app.post("/restaurant", newRestaurant);
app.post("/login", login);

app.delete("/food/:id", delFood);
app.delete("/user/:id", delUser);
app.delete("/nutrition/:id", (req, res) => del(req, res, "nutritions", "food_id", req.params.id));
app.delete("/restaurant/:id", (req, res) => del(req, res, "restaurants", "restaurant_id", req.params.id));


app.put("/food/:id", modFood);
app.put("/user/:id", modUser);
app.put("/nutrition/:id", modNutrition);
app.put("/restaurant/:id", modRestaurant);


app.patch("/foodimage/:id", modFoodImage);
app.patch("/foodprice/:id", modPrice);

app.patch("/user/points/:id", modPoints);
app.patch("/user/password/:id", modUserPassword);
app.patch("/user/image/:id", modUserImage);
app.patch("/user/name/:id", modUserName);
app.patch("/user/email/:id", modUserEmail);
app.patch("/message/:id", modMessage);
app.patch("/order/confirm/:id", confirmOrder);
app.patch("/order/finish/:id", finishOrder);

const port = process.env.API_PORT || 89;

app.listen(port, err => console.log(err ? err : `Server runnin' on port :${port}`));