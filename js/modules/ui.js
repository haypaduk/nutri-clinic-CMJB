// Módulo de UI y renderizado
import { IMC } from './imc.js';

export const UI = {
    // Renderizar información del paciente seleccionado
    renderPatientInfo(patient) {
        const container = document.getElementById('patientInfo');
        if (!container) return;
        
        if (!patient) {
            container.innerHTML = '<p class="placeholder"><i class="fas fa-user-slash" style="color: #ff6666;"></i> Seleccione un paciente para ver sus datos</p>';
            return;
        }
        
        const imcColor = IMC.getColor(patient.imc);
        const diagnosticColor = this.getDiagnosticColor(patient.diagnostic);
        
        container.innerHTML = `
            <div class="info-card">
                <div class="info-row">
                    <span class="info-label"><i class="fas fa-user-circle" style="color: white;"></i> Nombre:</span>
                    <span class="info-value"><strong><i class="fas fa-stethoscope" style="color: #ff6666;"></i> ${patient.name}</strong></span>
                </div>
                <div class="info-row">
                    <span class="info-label"><i class="fas fa-calendar-alt" style="color: white;"></i> Edad:</span>
                    <span class="info-value">${patient.age} años</span>
                </div>
                <div class="info-row">
                    <span class="info-label"><i class="fas fa-weight-scale" style="color: white;"></i> Peso:</span>
                    <span class="info-value">${patient.weight} kg</span>
                </div>
                <div class="info-row">
                    <span class="info-label"><i class="fas fa-ruler" style="color: white;"></i> Altura:</span>
                    <span class="info-value">${patient.height} m</span>
                </div>
                <div class="info-row">
                    <span class="info-label"><i class="fas fa-chart-simple" style="color: white;"></i> IMC:</span>
                    <span class="info-value">
                        <span class="imc-badge" style="background: ${imcColor}">${patient.imc}</span>
                        <span class="diagnostic-badge" style="background: ${diagnosticColor}">${patient.diagnostic}</span>
                    </span>
                </div>
                <div class="info-row">
                    <span class="info-label"><i class="fas fa-clock" style="color: white;"></i> Registrado:</span>
                    <span class="info-value">${new Date(patient.registrationDate).toLocaleDateString()}</span>
                </div>
            </div>
        `;
    },
    
    getDiagnosticColor(diagnostic) {
        switch(diagnostic) {
            case 'Bajo Peso': return '#ffc107';
            case 'Peso Normal': return '#28a745';
            case 'Sobrepeso': return '#fd7e14';
            case 'Obesidad': return '#dc3545';
            default: return '#6c757d';
        }
    },
    
    updateIMCPreview(weight, height) {
        const preview = document.getElementById('imcPreview');
        if (preview && weight && height && height > 0) {
            const imc = IMC.calculate(parseFloat(weight), parseFloat(height));
            const diagnostic = IMC.getDiagnostic(imc);
            const color = IMC.getColor(imc);
            preview.innerHTML = `<div style="background: ${color}; padding: 10px; border-radius: 5px; color: white;">
                <i class="fas fa-calculator" style="color: white;"></i> IMC: ${imc} - Diagnóstico: ${diagnostic}
            </div>`;
        } else if (preview) {
            preview.innerHTML = '';
        }
    },
    
    renderPatientsList(patients, selectElement, onSelect) {
        if (!selectElement) return;
        
        selectElement.innerHTML = '<option value="">-- Seleccione un paciente --</option>';
        patients.forEach(patient => {
            const option = document.createElement('option');
            option.value = patient.id;
            // Iconos de diagnóstico en blanco/rojo suave
            let icon = '';
            if (patient.diagnostic === 'Bajo Peso') icon = '⚠️';
            else if (patient.diagnostic === 'Peso Normal') icon = '✅';
            else if (patient.diagnostic === 'Sobrepeso') icon = '📈';
            else icon = '🔴';
            
            option.textContent = `${icon} ${patient.name} - ${patient.age} años - IMC: ${patient.imc} (${patient.diagnostic})`;
            selectElement.appendChild(option);
        });
        
        selectElement.onchange = (e) => {
            if (e.target.value) {
                onSelect(parseInt(e.target.value));
            } else {
                onSelect(null);
            }
        };
    },
    
    renderConsultationsHistory(consultations, onEdit, onDelete) {
        const container = document.getElementById('consultationsHistory');
        if (!container) return;
        
        if (!consultations || consultations.length === 0) {
            container.innerHTML = '<p class="placeholder"><i class="fas fa-folder-open" style="color: #ff6666;"></i> No hay consultas registradas para este paciente</p>';
            return;
        }
        
        container.innerHTML = consultations.map(consultation => `
            <div class="consultation-card" data-id="${consultation.id}">
                <div class="header">
                    <span class="consultation-date"><i class="far fa-calendar-alt" style="color: white;"></i> ${new Date(consultation.dateTime).toLocaleString()}</span>
                    <div class="card-buttons">
                        <button class="btn-edit" data-id="${consultation.id}"><i class="fas fa-edit" style="color: white;"></i> Editar</button>
                        <button class="btn-delete-consultation" data-id="${consultation.id}"><i class="fas fa-trash-alt" style="color: white;"></i> Eliminar</button>
                    </div>
                </div>
                <div class="evolution">
                    <strong><i class="fas fa-chart-line" style="color: white;"></i> Evolución:</strong>
                    <p>${consultation.evolution}</p>
                </div>
                <div class="meal-plan">
                    <strong><i class="fas fa-utensils" style="color: white;"></i> Plan de Alimentación:</strong>
                    <p>${consultation.mealPlan}</p>
                </div>
            </div>
        `).join('');
        
        // Eventos para editar
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(btn.dataset.id);
                onEdit(id);
            });
        });
        
        // Eventos para eliminar consulta individual
        document.querySelectorAll('.btn-delete-consultation').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(btn.dataset.id);
                if (onDelete && confirm('⚠️ ¿Eliminar esta consulta permanentemente?')) {
                    onDelete(id);
                }
            });
        });
    },
    
    clearConsultationForm() {
        const consultationId = document.getElementById('consultationId');
        const dateTime = document.getElementById('consultationDateTime');
        const evolution = document.getElementById('evolution');
        const mealPlan = document.getElementById('mealPlan');
        const saveBtn = document.getElementById('saveConsultationBtn');
        
        if (consultationId) consultationId.value = '';
        if (dateTime) {
            const now = new Date();
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
            dateTime.value = now.toISOString().slice(0, 16);
        }
        if (evolution) evolution.value = '';
        if (mealPlan) mealPlan.value = '';
        if (saveBtn) saveBtn.innerHTML = '<i class="fas fa-save" style="color: white;"></i> Agregar Consulta';
    },
    
    fillConsultationForm(consultation) {
        const consultationId = document.getElementById('consultationId');
        const dateTime = document.getElementById('consultationDateTime');
        const evolution = document.getElementById('evolution');
        const mealPlan = document.getElementById('mealPlan');
        const saveBtn = document.getElementById('saveConsultationBtn');
        
        if (consultationId) consultationId.value = consultation.id;
        if (dateTime) dateTime.value = consultation.dateTime.slice(0, 16);
        if (evolution) evolution.value = consultation.evolution;
        if (mealPlan) mealPlan.value = consultation.mealPlan;
        if (saveBtn) saveBtn.innerHTML = '<i class="fas fa-save" style="color: white;"></i> Guardar Cambios';
    },
    
    showConfirmModal(message, onConfirm) {
        if (confirm(message)) {
            onConfirm();
        }
    }
};