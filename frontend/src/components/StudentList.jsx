import React, { useState } from "react";
import useStudents from "../hooks/useStudents.js";
import "./StudentList.css";

const initialForm = { name: "", course: "", age: "" };

const StudentList = () => {
    const {
        students,
        loading,
        saving,
        deletingId,
        error,
        loadError,
        saveStudent,
        deleteStudent,
        clearError
    } = useStudents();
    const [form, setForm] = useState(initialForm);
    const [editingId, setEditingId] = useState(null);
    const [formError, setFormError] = useState("");

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((previousForm) => ({ ...previousForm, [name]: value }));
        setFormError("");
        clearError();
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const name = form.name.trim();
        const course = form.course.trim();
        const age = Number(form.age);

        if (!name || !course || !form.age.trim()) {
            setFormError("Please complete all fields.");
            return;
        }
        if (!Number.isInteger(age) || age <= 0 || age > 150) {
            setFormError("Please enter a valid age from 1 to 150.");
            return;
        }

        setFormError("");
        clearError();
        const success = await saveStudent({ name, course, age }, editingId);
        if (success) {
            setForm(initialForm);
            setEditingId(null);
        }
    };

    const handleEdit = (student) => {
        setForm({
            name: student.name ?? "",
            course: student.course ?? "",
            age: String(student.age ?? "")
        });
        setEditingId(student.id);
        setFormError("");
        clearError();
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this student?")) return;
        const success = await deleteStudent(id);
        if (success && editingId === id) {
            setForm(initialForm);
            setEditingId(null);
            setFormError("");
        }
    };

    const clearForm = () => {
        setForm(initialForm);
        setEditingId(null);
        setFormError("");
        clearError();
    };

    return (
        <main className="student-container">
            <h1 className="student-title">Student Management</h1>

            {(formError || error) && <p className="error-message" role="alert">{formError || error}</p>}

            <form className="student-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="name">Student Name</label>
                    <input id="name" type="text" name="name" placeholder="Enter student name" maxLength="100" value={form.name} onChange={handleChange} disabled={saving} required />
                </div>
                <div className="form-group">
                    <label htmlFor="course">Course</label>
                    <input id="course" type="text" name="course" placeholder="Enter course" maxLength="100" value={form.course} onChange={handleChange} disabled={saving} required />
                </div>
                <div className="form-group">
                    <label htmlFor="age">Age</label>
                    <input id="age" type="number" name="age" placeholder="Enter age" min="1" max="150" step="1" value={form.age} onChange={handleChange} disabled={saving} required />
                </div>
                <div className="button-group">
                    <button type="submit" className="submit-button" disabled={saving}>
                        {saving ? "Saving..." : editingId !== null ? "Update Student" : "Add Student"}
                    </button>
                    {editingId !== null && <button type="button" className="cancel-button" onClick={clearForm} disabled={saving}>Cancel</button>}
                </div>
            </form>

            <h2 className="list-title">Student List</h2>
            <div className="table-scroll">
                {loading ? (
                    <p className="list-message">Loading students...</p>
                ) : loadError ? (
                    <p className="list-message">Unable to load students.</p>
                ) : students.length === 0 ? (
                    <p className="list-message">No students found.</p>
                ) : (
                    <table className="student-table">
                        <thead>
                            <tr><th>ID</th><th>Name</th><th>Course</th><th>Age</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {students.map((student) => (
                                <tr key={student.id}>
                                    <td>{student.id}</td>
                                    <td>{student.name}</td>
                                    <td>{student.course}</td>
                                    <td>{student.age}</td>
                                    <td className="student-actions">
                                        <button type="button" className="edit-button" onClick={() => handleEdit(student)} disabled={saving || deletingId === student.id}>Edit</button>
                                        <button type="button" className="delete-button" onClick={() => handleDelete(student.id)} disabled={deletingId === student.id}>
                                            {deletingId === student.id ? "Deleting..." : "Delete"}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </main>
    );
};

export default StudentList;