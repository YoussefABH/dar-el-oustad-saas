import { supabaseClient } from '../config/supabase.js';
import { getAppState } from '../core/state.js';
import { safeQuery } from './safeQuery.js';

export class ApiService {
    // Students
    static async fetchStudents() {
        const { centreId } = getAppState();
        return safeQuery(
            supabaseClient.from('students').select('*').eq('centre_id', centreId)
        );
    }

    static async createStudent(data) {
        const { centreId, user } = getAppState();
        return safeQuery(
            supabaseClient.from('students').insert([{
                ...data,
                centre_id: centreId,
                created_by: user.id
            }])
        );
    }

    // Teachers
    static async fetchTeachers() {
        const { centreId } = getAppState();
        return safeQuery(
            supabaseClient.from('teachers').select('*').eq('centre_id', centreId)
        );
    }

    static async createTeacher(data) {
        const { centreId, user } = getAppState();
        return safeQuery(
            supabaseClient.from('teachers').insert([{
                ...data,
                centre_id: centreId,
                created_by: user.id
            }])
        );
    }

    // Groups
    static async fetchGroups() {
        const { centreId } = getAppState();
        return safeQuery(
            supabaseClient.from('groups').select('*').eq('centre_id', centreId)
        );
    }

    static async createGroup(data) {
        const { centreId, user } = getAppState();
        return safeQuery(
            supabaseClient.from('groups').insert([{
                ...data,
                centre_id: centreId,
                created_by: user.id
            }])
        );
    }

    // Payments
    static async fetchPayments() {
        const { centreId } = getAppState();
        return safeQuery(
            supabaseClient.from('payments').select('*, students(name)').eq('centre_id', centreId)
        );
    }

    static async createPayment(data) {
        const { centreId, user } = getAppState();
        return safeQuery(
            supabaseClient.from('payments').insert([{
                ...data,
                centre_id: centreId,
                created_by: user.id
            }])
        );
    }

    // Attendance
    static async upsertAttendance(record) {
        const { centreId, user } = getAppState();
        return safeQuery(
            supabaseClient.from('attendance').upsert({
                ...record,
                centre_id: centreId,
                created_by: user.id
            })
        );
    }

    // Parents
    static async fetchParents() {
        const { centreId } = getAppState();
        return safeQuery(
            supabaseClient.from('parents').select('*').eq('centre_id', centreId)
        );
    }

    static async createParent(data) {
        const { centreId, user } = getAppState();
        return safeQuery(
            supabaseClient.from('parents').insert([{
                ...data,
                centre_id: centreId,
                created_by: user.id
            }])
        );
    }

    // Settings / Centre
    static async updateCentreSettings(data) {
        const { centreId } = getAppState();
        return safeQuery(
            supabaseClient.from('settings').upsert({ centre_id: centreId, ...data }, { onConflict: 'centre_id' })
        );
    }

    static async fetchCentreInfo() {
        const { centreId } = getAppState();
        return safeQuery(
            supabaseClient.from('centres').select('*').eq('id', centreId).single()
        );
    }

    static async updateCentreInfo(data) {
        const { centreId } = getAppState();
        return safeQuery(
            supabaseClient.from('centres').update(data).eq('id', centreId)
        );
    }
}
