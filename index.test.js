import { describe, test, expect } from "vitest";


//  GET

describe('GET /foods', () => {
    test("", async () =>{
        const res = await fetch("http://localhost:88/foods");
        expect(res.status).toBe(200);
    });
});

describe('GET /users', () => {
    test("", async () =>{
        const res = await fetch("http://localhost:88/users");
        expect(res.status).toBe(200);
    })
});
describe('GET /nutritions', () => {
    test("", async () =>{
        const res = await fetch("http://localhost:88/nutritions");
        expect(res.status).toBe(200);
    })
});
describe('GET /chat/:sender_id/:recipient_id', () => {
    test("", () =>{

    })
});
describe('GET /login', () => {
    test("", () =>{

    })
});
describe('GET /cart', () => {
    test("", () =>{

    })
});
describe('GET /restaurants', () => {
    test("", () =>{

    })
});


//  POST


describe('POST /food', () => {
    test("", () =>{

    })
});

describe('POST /user', () => {
    test("", () =>{

    })
});
describe('POST /nutrition', () => {
    test("", () =>{

    })
});
describe('POST /message', () => {
    test("", () =>{

    })
});
describe('POST /addtocart', () => {
    test("", () =>{

    })
});
describe('POST /restaurant', () => {
    test("", () =>{

    })
});


//  DELETE


describe('DELETE /food/:id', () => {
    test("", () =>{

    })
});

describe('DELETE /user/:id', () => {
    test("", () =>{

    })
});
describe('DELETE /nutrition/:id', () => {
    test("", () =>{

    })
});
describe('DELETE /delfromcart/:user_id/:food_id', () => {
    test("", () =>{

    })
});
describe('DELETE /clearcart/:user_id', () => {
    test("", () =>{

    })
});
describe('DELETE /restaurant/:id', () => {
    test("", () =>{

    })
});


// PUT


describe('PUT /food/:id', () => {
    test("", () =>{

    })
});

describe('PUT /user/:id', () => {
    test("", () =>{

    })
});
describe('PUT /nutrition/:id', () => {
    test("", () =>{

    })
});


//  PATCH

describe('PATCH /foodimage/:id', () => {
    test("", () =>{

    })
});

describe('PATCH /foodprice/:id', () => {
    test("", () =>{

    })
});
describe('PATCH /user/points/:id', () => {
    test("", () =>{

    })
});
describe('PATCH /message', () => {
    test("", () =>{

    })
});