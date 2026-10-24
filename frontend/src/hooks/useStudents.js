import { useCallback, useEffect, useState } from "react";
import studentApi from "../api/studentApi.js";

const useStudents = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState("");
    const [loadError, setLoadError] = useState(false);

    const fetchStudents = useCallback(async () => {
        try {
            setLoading(true);
            setLoadError(false);
            setError("");
            const data = await studentApi.getAll();
            setStudents(data);
        } catch (requestError) {
            console.error("Failed to load students:", requestError);
            setLoadError(true);
            setError(requestError.response?.data?.message || requestError.response?.data?.error || "Failed to load students.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

    const saveStudent = async (studentData, editingId = null) => {
        try {
            setSaving(true);
            setError("");
            if (editingId !== null) {
                await studentApi.update(editingId, studentData);
            } else {
                await studentApi.create(studentData);
            }
            await fetchStudents();
            return true;
        } catch (requestError) {
            console.error("Failed to save student:", requestError);
            setError(requestError.response?.data?.message || requestError.response?.data?.error || "Failed to save student.");
            return false;
        } finally {
            setSaving(false);
        }
    };

    const deleteStudent = async (id) => {
        try {
            setDeletingId(id);
            setError("");
            await studentApi.delete(id);
            setStudents((previousStudents) => previousStudents.filter((student) => student.id !== id));
            return true;
        } catch (requestError) {
            console.error("Failed to delete student:", requestError);
            setError(requestError.response?.data?.message || requestError.response?.data?.error || "Failed to delete student.");
            return false;
        } finally {
            setDeletingId(null);
        }
    };

    const clearError = () => setError("");

    return {
        students,
        loading,
        saving,
        deletingId,
        error,
        loadError,
        fetchStudents,
        saveStudent,
        deleteStudent,
        clearError
    };
};

export default useStudents;