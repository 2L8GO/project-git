const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

// Подключение к базе данных (файл users.db создастся автоматически)
const db = new sqlite3.Database("users.db");

// Создание таблицы при первом запуске
db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL
    )
`);

// GET /users — получить всех пользователей
app.get("/users", function (req, res) {
    db.all("SELECT * FROM users ORDER BY id", function (err, rows) {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// GET /users/:id — получить одного пользователя
app.get("/users/:id", function (req, res) {
    db.get("SELECT * FROM users WHERE id = ?", [req.params.id], function (err, row) {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: "Пользователь не найден" });
        res.json(row);
    });
});

// POST /users — создать нового пользователя
app.post("/users", function (req, res) {
    const { name, email } = req.body;
    if (!name || !email) {
        return res.status(400).json({ error: "Поля name и email обязательны" });
    }
    db.run("INSERT INTO users (name, email) VALUES (?, ?)", [name, email],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ id: this.lastID, name: name, email: email });
        });
});

// PUT /users/:id — обновить пользователя
app.put("/users/:id", function (req, res) {
    const { name, email } = req.body;
    db.run("UPDATE users SET name = ?, email = ? WHERE id = ?",
        [name, email, req.params.id],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ error: "Пользователь не найден" });
            res.json({ ok: true, message: "Пользователь обновлён" });
        });
});

// DELETE /users/:id — удалить пользователя
app.delete("/users/:id", function (req, res) {
    db.run("DELETE FROM users WHERE id = ?", [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: "Пользователь не найден" });
        res.json({ ok: true, message: "Пользователь удалён" });
    });
});

// Запуск сервера
app.listen(PORT, function () {
    console.log("Сервер запущен: http://localhost:" + PORT);
    console.log("GET    http://localhost:" + PORT + "/users");
    console.log("POST   http://localhost:" + PORT + "/users");
});