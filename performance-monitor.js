// ===== PERFORMANCE-MONITOR.JS =====
// Monitor de rendimiento para verificar tiempos de carga

(function() {
  'use strict';
  
  const PerformanceMonitor = {
    startTime: performance.now(),
    milestones: {},
    
    // Registrar hitos importantes
    mark(milestone) {
      const time = performance.now();
      const elapsed = time - this.startTime;
      this.milestones[milestone] = elapsed;
      
      console.log(`🎯 ${milestone}: ${elapsed.toFixed(0)}ms`);
      
      // Alertar si toma más de 5 segundos
      if (elapsed > 5000) {
        console.warn(`⚠️ ${milestone} tardó más de 5 segundos: ${elapsed.toFixed(0)}ms`);
      }
      
      return elapsed;
    },
    
    // Obtener reporte completo
    getReport() {
      const total = performance.now() - this.startTime;
      console.log('\n📊 REPORTE DE RENDIMIENTO:');
      console.log('================================');
      
      Object.entries(this.milestones).forEach(([milestone, time]) => {
        const percentage = ((time / total) * 100).toFixed(1);
        console.log(`${milestone}: ${time.toFixed(0)}ms (${percentage}%)`);
      });
      
      console.log(`TOTAL: ${total.toFixed(0)}ms`);
      console.log('================================\n');
      
      return {
        total,
        milestones: this.milestones,
        isOptimal: total <= 5000
      };
    },
    
    // Verificar si cumple con objetivos de rendimiento
    checkPerformanceGoals() {
      const report = this.getReport();
      
      if (report.isOptimal) {
        console.log('✅ OBJETIVO ALCANZADO: Carga completa en menos de 5 segundos');
      } else {
        console.log('❌ OBJETIVO NO ALCANZADO: Carga tardó más de 5 segundos');
        console.log('💡 Sugerencias de optimización:');
        
        // Sugerencias específicas basadas en los tiempos
        if (this.milestones['Cámara Lista'] > 3000) {
          console.log('- Optimizar inicialización de la cámara');
        }
        if (this.milestones['Recursos Precargados'] > 10000) {
          console.log('- Reducir tamaño de recursos o cargar menos en paralelo');
        }
      }
      
      return report;
    }
  };
  
  // Hacer disponible globalmente
  window.PerformanceMonitor = PerformanceMonitor;
  
  // Registrar eventos clave
  document.addEventListener('DOMContentLoaded', () => {
    PerformanceMonitor.mark('DOM Cargado');
  });
  
  window.addEventListener('load', () => {
    PerformanceMonitor.mark('Página Completamente Cargada');
  });
  
  // Interceptar eventos de A-Frame
  document.addEventListener('DOMContentLoaded', () => {
    const scene = document.querySelector('a-scene');
    
    if (scene) {
      scene.addEventListener('renderstart', () => {
        PerformanceMonitor.mark('A-Frame Render Iniciado');
      });
      
      scene.addEventListener('loaded', () => {
        PerformanceMonitor.mark('A-Frame Completamente Cargado');
      });
    }
  });
  
})();

// ===== INTEGRACION CON FUNCTIONS.JS =====
// Agregar estas líneas en functions.js en los puntos correspondientes:

/*
// En onCameraQuickStart():
PerformanceMonitor.mark('Cámara Lista');

// En startBackgroundLoading():
PerformanceMonitor.mark('Inicio Carga en Segundo Plano');

// En processLoadingQueue() cuando termine:
if (loadingQueue.length === 0) {
  PerformanceMonitor.mark('Recursos Precargados');
  console.log('✅ Todos los recursos cargados en segundo plano');
  PerformanceMonitor.checkPerformanceGoals();
}

// En onTargetFound():
PerformanceMonitor.mark(`Marcador ${targetIndex} Detectado`);
*/