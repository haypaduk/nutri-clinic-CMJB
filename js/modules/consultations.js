// Módulo de gestión de consultas
const STORAGE_KEY = 'nutri_consultations';

export const Consultations = {
    getAll() {
        const consultations = localStorage.getItem(STORAGE_KEY);
        return consultations ? JSON.parse(consultations) : [];
    },
    
    save(consultations) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(consultations));
    },
    
    getByPatientId(patientId) {
        const consultations = this.getAll();
        return consultations
            .filter(c => c.patientId === parseInt(patientId))
            .sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));
    },
    
    add(consultationData) {
        const consultations = this.getAll();
        const newConsultation = {
            id: Date.now(),
            patientId: parseInt(consultationData.patientId),
            dateTime: consultationData.dateTime,
            evolution: consultationData.evolution,
            mealPlan: consultationData.mealPlan,
            createdAt: new Date().toISOString()
        };
        consultations.push(newConsultation);
        this.save(consultations);
        return newConsultation;
    },
    
    update(id, consultationData) {
        const consultations = this.getAll();
        const index = consultations.findIndex(c => c.id === parseInt(id));
        if (index !== -1) {
            consultations[index] = {
                ...consultations[index],
                dateTime: consultationData.dateTime,
                evolution: consultationData.evolution,
                mealPlan: consultationData.mealPlan
            };
            this.save(consultations);
            return consultations[index];
        }
        return null;
    },
    
    delete(id) {
        const consultations = this.getAll();
        const filtered = consultations.filter(c => c.id !== parseInt(id));
        this.save(filtered);
        return true;
    },
    
    deleteByPatientId(patientId) {
        const consultations = this.getAll();
        const filtered = consultations.filter(c => c.patientId !== parseInt(patientId));
        this.save(filtered);
        return true;
    },
    
    getById(id) {
        const consultations = this.getAll();
        return consultations.find(c => c.id === parseInt(id));
    }
};