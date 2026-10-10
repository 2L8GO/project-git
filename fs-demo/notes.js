// ============================================
// Задание 8. Работа с файловой системой
// Программа "Заметки" — сохраняет заметки в файл
// ============================================

const fs = require("fs");
const path = require("path");
const readline = require("readline");

// Путь к файлу с заметками (в той же папке, где скрипт)
const NOTES_FILE = path.join(__dirname, "notes.json");

// --------------------------------------------
// ФУНКЦИИ РАБОТЫ С ФАЙЛОМ
// --------------------------------------------

// Прочитать все заметки из файла
function loadNotes() {
    if (!fs.existsSync(NOTES_FILE)) {
        return [];
    }
    const content = fs.readFileSync(NOTES_FILE, "utf-8");
    if (!content.trim()) {
        return [];
    }
    try {
        return JSON.parse(content);
    } catch (err) {
        console.error("Ошибка чтения файла:", err.message);
        return [];
    }
}

// Сохранить заметки в файл
function saveNotes(notes) {
    const json = JSON.stringify(notes, null, 2);
    fs.writeFileSync(NOTES_FILE, json, "utf-8");
}

// --------------------------------------------
// КОМАНДЫ
// --------------------------------------------

// Добавить заметку
function addNote(text) {
    if (!text || !text.trim()) {
        console.error("Ошибка: текст заметки не может быть пустым");
        process.exit(1);
    }
    const notes = loadNotes();
    const newNote = {
        id: Date.now(),
        text: text.trim(),
        createdAt: new Date().toISOString()
    };
    notes.push(newNote);
    saveNotes(notes);
    console.log(`✔ Заметка добавлена (ID: ${newNote.id})`);
}

// Показать все заметки
function listNotes() {
    const notes = loadNotes();
    if (notes.length === 0) {
        console.log("Заметок пока нет.");
        return;
    }
    console.log(`Всего заметок: ${notes.length}\n`);
    notes.forEach((note, i) => {
        console.log(`${i + 1}. [ID: ${note.id}] ${note.text}`);
        console.log(`   Создана: ${new Date(note.createdAt).toLocaleString("ru-RU")}`);
        console.log("");
    });
}

// Удалить заметку по ID
function deleteNote(idStr) {
    const id = Number(idStr);
    if (!id) {
        console.error("Ошибка: укажите ID заметки для удаления");
        process.exit(1);
    }
    const notes = loadNotes();
    const filtered = notes.filter(n => n.id !== id);
    if (filtered.length === notes.length) {
        console.error(`Заметка с ID ${id} не найдена`);
        process.exit(1);
    }
    saveNotes(filtered);
    console.log(`✔ Заметка с ID ${id} удалена`);
}

// --------------------------------------------
// ИНТЕРАКТИВНЫЙ РЕЖИМ (ввод с клавиатуры)
// --------------------------------------------

function interactiveMode() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    console.log("=== Интерактивный режим ввода заметок ===");
    console.log("Введите текст заметки и нажмите Enter.");
    console.log("Чтобы выйти, оставьте поле пустым и нажмите Enter.\n");

    function askNext() {
        rl.question("Заметка: ", (answer) => {
            if (!answer.trim()) {
                rl.close();
                console.log("\nСохранение завершено.");
                return;
            }
            const notes = loadNotes();
            const newNote = {
                id: Date.now(),
                text: answer.trim(),
                createdAt: new Date().toISOString()
            };
            notes.push(newNote);
            saveNotes(notes);
            console.log(`✔ Добавлено: "${newNote.text}"\n`);
            askNext();
        });
    }

    askNext();
}

// --------------------------------------------
// ГЛАВНАЯ ЛОГИКА: разбор аргументов командной строки
// --------------------------------------------

const args = process.argv.slice(2);
const command = args[0];

switch (command) {
    case "add":
        addNote(args.slice(1).join(" "));
        break;
    case "list":
        listNotes();
        break;
    case "delete":
        deleteNote(args[1]);
        break;
    case "interactive":
        interactiveMode();
        break;
    default:
        console.log("Использование:");
        console.log('  node notes.js add "Текст заметки"    — добавить заметку');
        console.log("  node notes.js list                    — показать все заметки");
        console.log("  node notes.js delete <ID>             — удалить заметку по ID");
        console.log("  node notes.js interactive             — интерактивный ввод");
        break;
}