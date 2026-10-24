
const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./db");

const app = express();
const studentsRouter = express.Router();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function validateStudent(body) {
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const course = typeof body?.course === "string" ? body.course.trim() : "";
    const age = Number(body?.age);

    if (!name || !course || !Number.isInteger(age) || age < 1 || age > 150) {
        return null;
    }

    return { name, course, age };
}

async function getStudents(req, res) {
    try {
        const [students] = await db.query(
            "SELECT id, name, course, age FROM students"
        );
        res.json(students);
    } catch (error) {
        console.error("Failed to retrieve students:", error.message);
        res.status(500).json({ error: "Failed to retrieve students" });
    }
}

studentsRouter.get("/", getStudents);

studentsRouter.post("/", async (req, res) => {
    const student = validateStudent(req.body);
    if (!student) {
        return res.status(400).json({
            error: "Enter a name, course, and an age between 1 and 150."
        });
    }

    try {
        const [result] = await db.query(
            "INSERT INTO students (name, course, age) VALUES (?, ?, ?)",
            [student.name, student.course, student.age]
        );
        res.status(201).json({
            id: result.insertId,
            ...student
        });
    } catch (error) {
        console.error("Failed to add student:", error.message);
        res.status(500).json({ error: "Failed to add student" });
    }
});

studentsRouter.put("/:id", async (req, res) => {
    const id = Number(req.params.id);
    const student = validateStudent(req.body);

    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({ error: "Invalid student ID" });
    }
    if (!student) {
        return res.status(400).json({
            error: "Enter a name, course, and an age between 1 and 150."
        });
    }

    try {
        const [result] = await db.query(
            "UPDATE students SET name = ?, course = ?, age = ? WHERE id = ?",
            [student.name, student.course, student.age, id]
        );

        if (result.affectedRows === 0) {
            const [existing] = await db.query(
                "SELECT id FROM students WHERE id = ?",
                [id]
            );
            if (existing.length === 0) {
                return res.status(404).json({ error: "Student not found" });
            }
        }

        res.json({ id, ...student });
    } catch (error) {
        console.error("Failed to update student:", error.message);
        res.status(500).json({ error: "Failed to update student" });
    }
});

studentsRouter.delete("/:id", async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({ error: "Invalid student ID" });
    }

    try {
        const [result] = await db.query(
            "DELETE FROM students WHERE id = ?",
            [id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Student not found" });
        }
        res.json({ message: "Student deleted", id });
    } catch (error) {
        console.error("Failed to delete student:", error.message);
        res.status(500).json({ error: "Failed to delete student" });
    }
});

app.use("/api/students", studentsRouter);
app.use("/students", studentsRouter);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});