import { supabaseClient } from '../config/supabase.js';
import { safeQuery } from './safeQuery.js';
import { getAppState } from '../core/state.js';

export class ApiService {

    static getState() {
        const state = getAppState();

        if (!state) {
            throw new Error('AppState introuvable.');
        }

        return state;
    }

    static requireCentreId() {
        const state = this.getState();

        if (!state.centreId) {
            throw new Error(
                'centreId manquant. Vérifiez que setAppState() est exécuté après la connexion.'
            );
        }

        return state.centreId;
    }

    static requireUser() {
        const state = this.getState();

        if (!state.user?.id) {
            throw new Error(
                'Utilisateur non connecté.'
            );
        }

        return state.user;
    }

    // =====================
    // STUDENTS
    // =====================

    static async fetchStudents() {
        const centreId = this.requireCentreId();

        console.log('fetchStudents centreId =', centreId);

        return safeQuery(() =>
            supabaseClient
                .from('students')
                .select('*')
                .eq('centre_id', centreId)
                .order('created_at', { ascending: false })
        );
    }

    static async createStudent(studentData) {
        const centreId = this.requireCentreId();
        const user = this.requireUser();

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

    // =====================
    // TEACHERS
    // =====================

    static async fetchTeachers() {
        const centreId = this.requireCentreId();

        return safeQuery(() =>
            supabaseClient
                .from('teachers')
                .select('*')
                .eq('centre_id', centreId)
        );
    }

    static async createTeacher(teacherData) {
        const centreId = this.requireCentreId();
        const user = this.requireUser();

        return safeQuery(() =>
            supabaseClient
                .from('teachers')
                .insert([{
                    ...teacherData,
                    centre_id: centreId,
                    created_by: user.id
                }])
                .select()
        );
    }

    // =====================
    // GROUPS
    // =====================

    static async fetchGroups() {
        const centreId = this.requireCentreId();

        return safeQuery(() =>
            supabaseClient
                .from('groups')
                .select('*')
                .eq('centre_id', centreId)
        );
    }

    static async createGroup(groupData) {
        const centreId = this.requireCentreId();
        const user = this.requireUser();

        return safeQuery(() =>
            supabaseClient
                .from('groups')
                .insert([{
                    ...groupData,
                    centre_id: centreId,
                    created_by: user.id
                }])
                .select()
        );
    }

    // =====================
    // PAYMENTS
    // =====================

    static async fetchPayments() {
        const centreId = this.requireCentreId();

        return safeQuery(() =>
            supabaseClient
                .from('payments')
                .select(`
                    *,
                    students(name)
                `)
                .eq('centre_id', centreId)
                .order('payment_date', { ascending: false })
        );
    }

    static async createPayment(paymentData) {
        const centreId = this.requireCentreId();
        const user = this.requireUser();

        return safeQuery(() =>
            supabaseClient
                .from('payments')
                .insert([{
                    ...paymentData,
                    centre_id: centreId,
                    created_by: user.id
                }])
                .select()
        );
    }
        }
