// Módulo de gestión de pacientes
import { IMC } from './imc.js';

const STORAGE_KEY = 'nutri_patients';

export const Patients = {
    getAll() {
        const patients = localStorage.getItem(STORAGE_KEY);
        return patients ? JSON.parse(patients) : [];
    },
    
    save(patients) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
    },
    
    add(patientData) {
        const patients = this.getAll();
        const newPatient = {
            id: Date.now(),
            name: patientData.name,
            age: parseInt(patientData.age),
            weight: parseFloat(patientData.weight),
            height: parseFloat(patientData.height),
            imc: IMC.calculate(parseFloat(patientData.weight), parseFloat(patientData.height)),
            diagnostic: IMC.getDiagnostic(IMC.calculate(parseFloat(patientData.weight), parseFloat(patientData.height))),
            registrationDate: new Date().toISOString()
        };
        patients.push(newPatient);
        this.save(patients);
        return newPatient;
    },
    
    update(id, patientData) {
        const patients = this.getAll();
        const index = patients.findIndex(p => p.id === parseInt(id));
        if (index !== -1) {
            patients[index] = {
                ...patients[index],
                name: patientData.name,
                age: parseInt(patientData.age),
                weight: parseFloat(patientData.weight),
                height: parseFloat(patientData.height),
                imc: IMC.calculate(parseFloat(patientData.weight), parseFloat(patientData.height)),
                diagnostic: IMC.getDiagnostic(IMC.calculate(parseFloat(patientData.weight), parseFloat(patientData.height)))
            };
            this.save(patients);
            return patients[index];
        }
        return null;
    },
    
    delete(id) {
        const patients = this.getAll();
        const filtered = patients.filter(p => p.id !== parseInt(id));
        this.save(filtered);
        return true;
    },
    
    getById(id) {
        const patients = this.getAll();
        return patients.find(p => p.id === parseInt(id));
    }
};