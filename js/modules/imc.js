// Módulo de cálculo de IMC y diagnóstico
export const IMC = {
    calculate(weight, height) {
        if (!weight || !height || height <= 0) return null;
        const imc = weight / (height * height);
        return parseFloat(imc.toFixed(2));
    },
    
    getDiagnostic(imc) {
        if (!imc) return 'Datos insuficientes';
        if (imc < 18.5) return 'Bajo Peso';
        if (imc >= 18.5 && imc < 25) return 'Peso Normal';
        if (imc >= 25 && imc < 30) return 'Sobrepeso';
        return 'Obesidad';
    },
    
    getColor(imc) {
        if (!imc) return '#ddd';
        if (imc < 18.5) return '#ffc107';
        if (imc >= 18.5 && imc < 25) return '#28a745';
        if (imc >= 25 && imc < 30) return '#fd7e14';
        return '#dc3545';
    }
};