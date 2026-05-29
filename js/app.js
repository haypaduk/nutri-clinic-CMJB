import { Auth } from './modules/auth.js';
import { Patients } from './modules/patients.js';
import { Consultations } from './modules/consultations.js';
import { UI } from './modules/ui.js';

// Verificar autenticación
if (!Auth.requireAuth()) {
    throw new Error('No autorizado');
}

// Mostrar nombre del nutriólogo con icono
const currentUser = Auth.getCurrentUser();
if (currentUser) {
    const nameElement = document.getElementById('nutriologoName');
    if (nameElement) {
        nameElement.innerHTML = `<i class="fas fa-user-md" style="color: white; margin-right: 5px;"></i> ${currentUser.name}`;
    }
}

// Variables de estado
let currentPatient = null;

// Referencias a elementos DOM
const patientForm = document.getElementById('patientForm');
const patientSelect = document.getElementById('patientSelect');
const consultationForm = document.getElementById('consultationForm');
const logoutBtn = document.getElementById('logoutBtn');
const deletePatientBtn = document.getElementById('deletePatientBtn');
const deleteAllConsultationsBtn = document.getElementById('deleteAllConsultationsBtn');

// Preview de IMC en tiempo real
const weightInput = document.getElementById('patientWeight');
const heightInput = document.getElementById('patientHeight');

if (weightInput && heightInput) {
    weightInput.addEventListener('input', () => {
        UI.updateIMCPreview(weightInput.value, heightInput.value);
    });
    heightInput.addEventListener('input', () => {
        UI.updateIMCPreview(weightInput.value, heightInput.value);
    });
}

// GUARDAR PACIENTE (Nuevo o editar)
if (patientForm) {
    patientForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const patientId = document.getElementById('patientId').value;
        const patientData = {
            name: document.getElementById('patientName').value,
            age: document.getElementById('patientAge').value,
            weight: document.getElementById('patientWeight').value,
            height: document.getElementById('patientHeight').value
        };
        
        // Validaciones
        if (!patientData.name || !patientData.age || !patientData.weight || !patientData.height) {
            alert('⚠️ Por favor, complete todos los campos');
            return;
        }
        
        if (patientData.weight <= 0 || patientData.weight > 300) {
            alert('⚠️ El peso debe estar entre 1 y 300 kg');
            return;
        }
        
        if (patientData.height <= 0 || patientData.height > 2.5) {
            alert('⚠️ La altura debe estar entre 0.5 y 2.5 metros');
            return;
        }
        
        if (patientId) {
            Patients.update(patientId, patientData);
            alert('✅ Paciente actualizado correctamente');
        } else {
            Patients.add(patientData);
            alert('✅ Paciente registrado correctamente');
        }
        
        // Limpiar formulario
        patientForm.reset();
        document.getElementById('patientId').value = '';
        UI.updateIMCPreview('', '');
        
        // Recargar lista de pacientes
        loadPatients();
        
        // Si se estaba editando, limpiar selección actual
        if (patientId) {
            currentPatient = null;
            UI.renderPatientInfo(null);
            const historyContainer = document.getElementById('consultationsHistory');
            if (historyContainer) {
                historyContainer.innerHTML = '<p class="placeholder"><i class="fas fa-folder-open"></i> Seleccione un paciente para ver su historial</p>';
            }
        }
    });
}

// Cargar lista de pacientes
function loadPatients() {
    const patients = Patients.getAll();
    if (patientSelect) {
        UI.renderPatientsList(patients, patientSelect, (patientId) => {
            if (patientId) {
                currentPatient = Patients.getById(patientId);
                UI.renderPatientInfo(currentPatient);
                loadConsultations(patientId);
                UI.clearConsultationForm();
                
                // Mostrar botones de eliminar
                if (deletePatientBtn) {
                    deletePatientBtn.style.display = 'flex';
                }
                if (deleteAllConsultationsBtn) {
                    deleteAllConsultationsBtn.style.display = 'flex';
                }
                
                const currentPatientIdInput = document.getElementById('currentPatientId');
                if (currentPatientIdInput) {
                    currentPatientIdInput.value = patientId;
                }
            } else {
                currentPatient = null;
                UI.renderPatientInfo(null);
                const historyContainer = document.getElementById('consultationsHistory');
                if (historyContainer) {
                    historyContainer.innerHTML = '<p class="placeholder"><i class="fas fa-folder-open"></i> Seleccione un paciente para ver su historial</p>';
                }
                if (deletePatientBtn) deletePatientBtn.style.display = 'none';
                if (deleteAllConsultationsBtn) deleteAllConsultationsBtn.style.display = 'none';
            }
        });
    }
}

// Cargar consultas de un paciente
function loadConsultations(patientId) {
    const consultations = Consultations.getByPatientId(patientId);
    UI.renderConsultationsHistory(consultations, (consultationId) => {
        const consultation = Consultations.getById(consultationId);
        if (consultation) {
            UI.fillConsultationForm(consultation);
        }
    }, (consultationId) => {
        if (confirm('⚠️ ¿Estás seguro de eliminar esta consulta?\n\nEsta acción no se puede deshacer.')) {
            Consultations.delete(consultationId);
            loadConsultations(currentPatient.id);
            alert('✅ Consulta eliminada correctamente');
        }
    });
}

// Guardar consulta
if (consultationForm) {
    consultationForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (!currentPatient) {
            alert('⚠️ Por favor, seleccione un paciente primero');
            return;
        }
        
        const consultationId = document.getElementById('consultationId').value;
        const consultationData = {
            patientId: currentPatient.id,
            dateTime: document.getElementById('consultationDateTime').value,
            evolution: document.getElementById('evolution').value,
            mealPlan: document.getElementById('mealPlan').value
        };
        
        if (!consultationData.dateTime) {
            alert('⚠️ Por favor, seleccione fecha y hora');
            return;
        }
        
        if (!consultationData.evolution || !consultationData.mealPlan) {
            alert('⚠️ Por favor, complete evolución y plan de alimentación');
            return;
        }
        
        if (consultationId) {
            Consultations.update(consultationId, consultationData);
            alert('✅ Consulta actualizada correctamente');
        } else {
            Consultations.add(consultationData);
            alert('✅ Consulta agregada correctamente');
        }
        
        loadConsultations(currentPatient.id);
        UI.clearConsultationForm();
    });
}

// Eliminar paciente completo
if (deletePatientBtn) {
    deletePatientBtn.addEventListener('click', () => {
        if (currentPatient && confirm(`⚠️ ¿ELIMINAR COMPLETAMENTE a ${currentPatient.name}?\n\nSe eliminarán:\n❌ Todos los datos del paciente\n❌ Todo su historial de consultas\n\n⚠️ Esta acción NO se puede deshacer.`)) {
            Consultations.deleteByPatientId(currentPatient.id);
            Patients.delete(currentPatient.id);
            loadPatients();
            currentPatient = null;
            UI.renderPatientInfo(null);
            const historyContainer = document.getElementById('consultationsHistory');
            if (historyContainer) {
                historyContainer.innerHTML = '<p class="placeholder"><i class="fas fa-folder-open"></i> Seleccione un paciente para ver su historial</p>';
            }
            if (deletePatientBtn) deletePatientBtn.style.display = 'none';
            if (deleteAllConsultationsBtn) deleteAllConsultationsBtn.style.display = 'none';
            alert('✅ Paciente y todo su historial eliminados correctamente');
        }
    });
}

// Eliminar todo el historial del paciente actual
if (deleteAllConsultationsBtn) {
    deleteAllConsultationsBtn.addEventListener('click', () => {
        if (currentPatient && confirm(`⚠️ ¿ELIMINAR TODO EL HISTORIAL de ${currentPatient.name}?\n\nSe eliminarán TODAS las consultas de este paciente.\n\n⚠️ Esta acción NO se puede deshacer.`)) {
            Consultations.deleteByPatientId(currentPatient.id);
            loadConsultations(currentPatient.id);
            alert('✅ Todo el historial eliminado correctamente');
        }
    });
}

// Cerrar sesión
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        Auth.logout();
    });
}

// Inicializar
loadPatients();