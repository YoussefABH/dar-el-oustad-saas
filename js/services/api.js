import { supabaseClient } from '../config/supabase.js';
import { safeQuery } from './safeQuery.js';
import { getAppState } from '../core/state.js';

export class ApiService {

    // ==========================
    // ÉTUDIANTS
    // ==========================

    static async fetchStudents() {
        const { centreId } = getAppState();

        if (!centreId) {
            throw new Error('Centre ID introuvable.');
        }

        return safeQuery(() =>
            supabaseClient
                .from('students')
                .select('*')
                .eq('centre_id', centreId)
                .order('created_at', { ascending: false })
        );
    }

    static async createStudent(studentData) {
        const { centreId, user } = getAppState();

        if (!centreId) throw new Error('Centre ID introuvable.');
        if (!user?.id) throw new Error('Utilisateur non connecté.');

        return safeQuery(() =>
            supabaseClient
                .from('students')
                .insert([{
                    ...studentData,
                    centre_id: centreId,
                    created_by: user.id
                }])
                .select()
        );
    }

    static async updateStudent(id, studentData) {
        return safeQuery(() =>
            supabaseClient
                .from('students')
                .update(studentData)
                .eq('id', id)
                .select()
        );
    }

    static async deleteStudent(id) {
        return safeQuery(() =>
            supabaseClient
                .from('students')
                .delete()
                .eq('id', id)
        );
    }

    // ==========================
    // ENSEIGNANTS
    // ==========================

    static async fetchTeachers() {
        const { centreId } = getAppState();

        return safeQuery(() =>
