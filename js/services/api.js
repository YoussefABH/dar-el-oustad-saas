import { supabaseClient } from '../config/supabase.js';
import { safeQuery } from './safeQuery.js';
import { getAppState } from '../core/state.js';

export class ApiService {
    
    // --- ÉTUDIANTS ---
    static async fetchStudents() {
        const { centreId } = getAppState();
        return safeQuery(() => supabaseClient
            .from('students')
            .select('*')
            .eq('centre_id', centreId)
            .order('created_at', { ascending: false })
        );
    }

    static async createStudent(studentData) {
        const { centreId, user } = getAppState();
        return safeQuery(() => supabaseClient
            .from('students')
            .insert([{
                ...studentData,
                centre_id: centreId,
                created_by: user.id
            }])
        );
    }

    // --- ENSEIGNANTS ---
    static async fetchTeachers() {
        const { centreId } = getAppState();
        return safeQuery(() => supabaseClient
            .from('teachers')
            .select('*')
            .eq('centre_id', centreId)
        );
    }

    static async createTeacher(teacherData) {
        const { centreId, user } = getAppState();
        return safeQuery(() => supabaseClient
            .from('teachers')
            .insert([{
                ...teacherData,
                centre_id: centreId,
                created_by: user.id
            }])
        );
    }

    // --- GROUPES ---
    static async fetchGroups() {
        const { centreId } = getAppState();
        return safeQuery(() => supabaseClient
            .from('groups')
            .select('*')
            .eq('centre_id', centreId)
        );
    }

    static async createGroup(groupData) {
        const { centreId, user } = getAppState();
        return safeQuery(() => supabaseClient
            .from('groups')
            .insert([{
                ...groupData,
                centre_id: centreId,
                created_by: user.id
            }])
        );
    }

    // --- PARENTS ---
    static async fetchParents() {
        const { centreId } = getAppState();
        return safeQuery(() => supabaseClient
            .from('parents')
            .select('*')
            .eq('centre_id', centreId)
        );
    }

    static async createParent(parentData) {
        const { centreId, user } = getAppState();
        return safeQuery(() => supabaseClient
            .from('parents')
            .insert([{
                ...parentData,
                centre_id: centreId,
                created_by: user.id
            }])
        );
    }

    // --- PRÉSENCES ---
    static async saveAttendance(attendanceRecords) {
        return safeQuery(() => supabaseClient
            .from('attendance')
            .upsert(attendanceRecords)
        );
    }

    // --- PAIEMENTS ---
    static async fetchPayments() {
        const { centreId } = getAppState();
        return safeQuery(() => supabaseClient
            .from('payments')
            .select('amount, payment_method, payment_date, students(name)')
            .eq('centre_id', centreId)
            .order('payment_date', { ascending: false })
        );
    }

    static async createPayment(paymentData) {
        const { centreId, user } = getAppState();
        return safeQuery(() => supabaseClient
            .from('payments')
            .insert([{
                ...paymentData,
                centre_id: centreId,
                created_by: user.id
            }])
        );
    }
}
