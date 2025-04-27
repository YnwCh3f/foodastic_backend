import { describe, test, expect } from "vitest";



describe('GET /foods', () => {
    test("", async () => {
        const res = await fetch("http://localhost:88/foods");
        expect(res.status).toBe(200);
    });
});

describe('PATCH /name/:id', () => {
    test("Existing user", async () => {
        const res = await fetch("http://localhost:88/user/name/1", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                first_name: "Próba",
                last_name: "Teszt"
            })
        });
        expect(res.status).toBe(200);
    });
    test("Non existing user", async () => {
        const res = await fetch("http://localhost:88/user/name/1025", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                first_name: "Próba",
                last_name: "Teszt"
            })
        });
        expect(res.status).toBe(200);
    });
});

describe('POST /food', () => {
    test("", async () => {
        const res = await fetch("http://localhost:88/food", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: "Próba",
                price: 500,
                image: "-"
            })
        });
        expect(res.status).toBe(201);
    });
    test("", async () => {
        const res = await fetch("http://localhost:88/food", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: "Próba",
                price: 65
            })
        });
        expect(res.status).toBe(400);
    });
});

describe('DELETE /food', () => {
    test("", async () => {
        const res = await fetch("http://localhost:88/food/11", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" }
        });
        expect(res.status).toBe(200);
    });
    test("", async () => {
        const res = await fetch("http://localhost:88/food/6511", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
        });
        expect(res.status).toBe(404);
    });
});
