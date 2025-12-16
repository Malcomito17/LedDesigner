import React, { useState, useEffect, useRef } from 'react';
import { Calculator, Grid, Settings, Download, Plus, Trash2, Save, Upload, Edit2, X, Check, Weight, Zap, Anchor } from 'lucide-react';

export default function LEDSystemDesigner() {
  // ==================== STATE ====================
  const [activeTab, setActiveTab] = useState('calculator');
  const canvasRef = useRef(null);
  
  // Project settings
  const [projectName, setProjectName] = useState('Mi Proyecto LED');
  const [groupIndexStart, setGroupIndexStart] = useState(1);
  
  // Wiring settings
  const [wiringPattern, setWiringPattern] = useState('horizontal-right');
  const [colorScheme, setColorScheme] = useState('cyan-magenta');

  // Módulos LED configurables
  const [modules, setModules] = useState({
    'arakur-p29': {
      id: 'arakur-p29',
      name: 'Arakur P2.9',
      description: 'Panel indoor alta resolución',
      pixelsW: 208,
      pixelsH: 208,
      width: 64,
      height: 64,
      weight: 18,
      power: 180,
      hangingPoints: 2
    },
    'generic-p39': {
      id: 'generic-p39',
      name: 'Generic P3.9',
      description: 'Panel outdoor estándar',
      pixelsW: 128,
      pixelsH: 256,
      width: 50,
      height: 100,
      weight: 15,
      power: 150,
      hangingPoints: 2
    }
  });

  // Procesadores configurables
  const [processors, setProcessors] = useState({
    'vx300': {
      id: 'vx300',
      brand: 'NovaStar',
      model: 'VX300',
      description: 'Controlador all-in-one entry level',
      outputs: 3,
      totalPixels: 3900000,
      maxWidth: 3840,
      maxHeight: 1200
    },
    'vx600': {
      id: 'vx600',
      brand: 'NovaStar',
      model: 'VX600',
      description: 'Controlador all-in-one mid-range',
      outputs: 6,
      totalPixels: 3900000,
      maxWidth: 10240,
      maxHeight: 8192
    },
    'vx1000': {
      id: 'vx1000',
      brand: 'NovaStar',
      model: 'VX1000',
      description: 'Controlador all-in-one high-end',
      outputs: 10,
      totalPixels: 6500000,
      maxWidth: 10240,
      maxHeight: 8192
    },
    'msd300': {
      id: 'msd300',
      brand: 'NovaStar',
      model: 'MSD300',
      description: 'Sending card básica',
      outputs: 2,
      totalPixels: 1300000,
      maxWidth: 1920,
      maxHeight: 1200
    },
    'msd600': {
      id: 'msd600',
      brand: 'NovaStar',
      model: 'MSD600',
      description: 'Sending card avanzada',
      outputs: 4,
      totalPixels: 2300000,
      maxWidth: 2048,
      maxHeight: 1152
    }
  });

  // Calculator state
  const [selectedModule, setSelectedModule] = useState('arakur-p29');
  const [selectedProcessor, setSelectedProcessor] = useState('vx600');
  const [inputMode, setInputMode] = useState('modules');
  const [widthModules, setWidthModules] = useState(6);
  const [heightModules, setHeightModules] = useState(4);
  const [widthCm, setWidthCm] = useState(384);
  const [heightCm, setHeightCm] = useState(256);

  // Config manager state - editing
  const [editingModuleId, setEditingModuleId] = useState(null);
  const [editingProcessorId, setEditingProcessorId] = useState(null);
  
  // Config manager state - new items (empty by default)
  const [newModule, setNewModule] = useState({
    name: '',
    description: '',
    pixelsW: '',
    pixelsH: '',
    width: '',
    height: '',
    weight: '',
    power: '',
    hangingPoints: ''
  });
  const [newProcessor, setNewProcessor] = useState({
    brand: '',
    model: '',
    description: '',
    outputs: '',
    totalPixels: '',
    maxWidth: '',
    maxHeight: ''
  });

  // Temporary edit state
  const [editModule, setEditModule] = useState(null);
  const [editProcessor, setEditProcessor] = useState(null);

  // Color schemes for pixel map
  const colorSchemes = {
    'cyan-magenta': { name: 'Cyan / Magenta', colors: ['#00FFFF', '#FF00FF'] },
    'blue-green': { name: 'Azul / Verde', colors: ['#4169E1', '#32CD32'] },
    'orange-purple': { name: 'Naranja / Púrpura', colors: ['#FF8C00', '#9932CC'] },
    'red-cyan': { name: 'Rojo / Cyan', colors: ['#FF4444', '#00CED1'] }
  };

  // Wiring patterns
  const wiringPatterns = {
    'horizontal-right': { 
      name: 'Horizontal →', 
      description: 'Serpentina horizontal, inicio derecha',
      getOrder: (w, h) => {
        const order = [];
        for (let row = 0; row < h; row++) {
          const rowModules = [];
          for (let col = 0; col < w; col++) {
            rowModules.push({ row, col });
          }
          if (row % 2 === 1) rowModules.reverse();
          order.push(...rowModules);
        }
        return order;
      }
    },
    'horizontal-left': { 
      name: 'Horizontal ←', 
      description: 'Serpentina horizontal, inicio izquierda',
      getOrder: (w, h) => {
        const order = [];
        for (let row = 0; row < h; row++) {
          const rowModules = [];
          for (let col = 0; col < w; col++) {
            rowModules.push({ row, col });
          }
          if (row % 2 === 0) rowModules.reverse();
          order.push(...rowModules);
        }
        return order;
      }
    },
    'vertical-down': { 
      name: 'Vertical ↓', 
      description: 'Serpentina vertical, inicio abajo',
      getOrder: (w, h) => {
        const order = [];
        for (let col = 0; col < w; col++) {
          const colModules = [];
          for (let row = 0; row < h; row++) {
            colModules.push({ row, col });
          }
          if (col % 2 === 1) colModules.reverse();
          order.push(...colModules);
        }
        return order;
      }
    },
    'vertical-up': { 
      name: 'Vertical ↑', 
      description: 'Serpentina vertical, inicio arriba',
      getOrder: (w, h) => {
        const order = [];
        for (let col = 0; col < w; col++) {
          const colModules = [];
          for (let row = 0; row < h; row++) {
            colModules.push({ row, col });
          }
          if (col % 2 === 0) colModules.reverse();
          order.push(...colModules);
        }
        return order;
      }
    }
  };

  // Load config from localStorage
  useEffect(() => {
    const savedModules = localStorage.getItem('led-modules');
    const savedProcessors = localStorage.getItem('led-processors');
    const savedProject = localStorage.getItem('led-project');
    if (savedModules) setModules(JSON.parse(savedModules));
    if (savedProcessors) setProcessors(JSON.parse(savedProcessors));
    if (savedProject) {
      const project = JSON.parse(savedProject);
      setProjectName(project.name || 'Mi Proyecto LED');
      setGroupIndexStart(project.groupIndexStart || 1);
      setWiringPattern(project.wiringPattern || 'horizontal-right');
      setColorScheme(project.colorScheme || 'cyan-magenta');
    }
  }, []);

  // Save config to localStorage
  useEffect(() => {
    localStorage.setItem('led-modules', JSON.stringify(modules));
  }, [modules]);

  useEffect(() => {
    localStorage.setItem('led-processors', JSON.stringify(processors));
  }, [processors]);

  useEffect(() => {
    localStorage.setItem('led-project', JSON.stringify({
      name: projectName,
      groupIndexStart,
      wiringPattern,
      colorScheme
    }));
  }, [projectName, groupIndexStart, wiringPattern, colorScheme]);

  // ==================== CALCULATIONS ====================
  const calculate = () => {
    const mod = modules[selectedModule];
    const proc = processors[selectedProcessor];
    if (!mod || !proc) return null;

    let finalWidthModules, finalHeightModules, finalWidthCm, finalHeightCm;

    if (inputMode === 'modules') {
      finalWidthModules = widthModules;
      finalHeightModules = heightModules;
      finalWidthCm = widthModules * mod.width;
      finalHeightCm = heightModules * mod.height;
    } else {
      finalWidthModules = Math.ceil(widthCm / mod.width);
      finalHeightModules = Math.ceil(heightCm / mod.height);
      finalWidthCm = finalWidthModules * mod.width;
      finalHeightCm = finalHeightModules * mod.height;
    }

    const totalModules = finalWidthModules * finalHeightModules;
    const resolutionW = finalWidthModules * mod.pixelsW;
    const resolutionH = finalHeightModules * mod.pixelsH;
    const totalPixels = resolutionW * resolutionH;
    const aspectRatio = resolutionW / resolutionH;

    // Aspect ratio analysis
    const standardRatios = [
      { ratio: 16/9, name: '16:9', w: 1920, h: 1080 },
      { ratio: 16/9, name: '16:9 (720p)', w: 1280, h: 720 },
      { ratio: 16/9, name: '16:9 (4K)', w: 3840, h: 2160 },
      { ratio: 4/3, name: '4:3', w: 1024, h: 768 },
      { ratio: 4/3, name: '4:3 (UXGA)', w: 1600, h: 1200 },
      { ratio: 1, name: '1:1', w: 1080, h: 1080 },
      { ratio: 21/9, name: '21:9', w: 2560, h: 1080 }
    ];

    const closestRatio = standardRatios.reduce((prev, curr) =>
      Math.abs(curr.ratio - aspectRatio) < Math.abs(prev.ratio - aspectRatio) ? curr : prev
    );

    // Letterbox/Pillarbox calculation
    let contentW, contentH, letterbox = 0, pillarbox = 0;
    if (aspectRatio > closestRatio.ratio) {
      contentH = resolutionH;
      contentW = Math.floor(resolutionH * closestRatio.ratio);
      pillarbox = resolutionW - contentW;
    } else {
      contentW = resolutionW;
      contentH = Math.floor(resolutionW / closestRatio.ratio);
      letterbox = resolutionH - contentH;
    }

    // Calculate pixels per output
    const pixelsPerOutput = Math.floor(proc.totalPixels / proc.outputs);
    
    // UTP calculation respecting processor limits
    const pixelsPerModule = mod.pixelsW * mod.pixelsH;
    
    // FIX: Handle edge case where module has more pixels than output capacity
    let modulesPerOutput = Math.floor(pixelsPerOutput / pixelsPerModule);
    if (modulesPerOutput === 0) {
      modulesPerOutput = 1; // At minimum, 1 module per output (even if it exceeds capacity)
    }
    
    // Calculate outputs needed with proper handling
    const outputsNeeded = Math.ceil(totalModules / modulesPerOutput);
    
    // Check if processor is sufficient (pixels, outputs, and max dimensions)
    const pixelsSufficient = totalPixels <= proc.totalPixels;
    const outputsSufficient = outputsNeeded <= proc.outputs;
    const widthSufficient = !proc.maxWidth || resolutionW <= proc.maxWidth;
    const heightSufficient = !proc.maxHeight || resolutionH <= proc.maxHeight;
    
    // Also check if single module exceeds output capacity
    const moduleExceedsOutput = pixelsPerModule > pixelsPerOutput;
    
    const processorSufficient = pixelsSufficient && outputsSufficient && widthSufficient && heightSufficient && !moduleExceedsOutput;
    
    // Calculate actual outputs to use (limited by available)
    const actualOutputs = Math.min(outputsNeeded, proc.outputs);
    
    // Distribute modules across outputs
    const modulesPerOutputActual = Math.ceil(totalModules / actualOutputs);
    
    // UTP cables
    const utpInputs = actualOutputs;
    const utpBridges = totalModules - actualOutputs;

    // ========== NEW: Weight, Power, and Rigging Calculations ==========
    
    // Area calculations (needed for power calc)
    const areaM2 = (finalWidthCm * finalHeightCm) / 10000;
    const pixelDensity = totalPixels / areaM2; // pixels per m²
    
    // Total weight calculation
    const totalWeight = totalModules * (mod.weight || 0);
    
    // Total power consumption - power is specified as W/m²
    const totalPower = areaM2 * (mod.power || 0);
    const totalAmps220 = totalPower / 220; // Amps at 220V
    const totalAmps110 = totalPower / 110; // Amps at 110V
    
    // Rigging calculations
    const hangingPointsPerModule = mod.hangingPoints || 2;
    // For a LED wall, typically only the top row hangs
    const hangingPointsTotal = finalWidthModules * hangingPointsPerModule;
    const weightPerHangingPoint = totalWeight / hangingPointsTotal;
    // Apply 2:1 safety factor for rigging
    const safeWorkingLoad = weightPerHangingPoint * 2;
    
    // Pitch calculation (mm between pixels)
    const pitchMm = (mod.width * 10) / mod.pixelsW;
    
    // Minimum viewing distance (rule of thumb: pitch in mm * 1.5-3 meters)
    const minViewingDistance = pitchMm * 1.5;
    const maxViewingDistance = pitchMm * 3;

    // Recommended processor
    let recommendedProcessor = null;
    const sortedProcessors = Object.values(processors).sort((a, b) => a.totalPixels - b.totalPixels);
    for (const p of sortedProcessors) {
      const pPixelsPerOutput = Math.floor(p.totalPixels / p.outputs);
      let pModulesPerOutput = Math.floor(pPixelsPerOutput / pixelsPerModule);
      if (pModulesPerOutput === 0) pModulesPerOutput = 1;
      const pOutputsNeeded = Math.ceil(totalModules / pModulesPerOutput);
      const pWidthOk = !p.maxWidth || resolutionW <= p.maxWidth;
      const pHeightOk = !p.maxHeight || resolutionH <= p.maxHeight;
      const pModuleOk = pixelsPerModule <= pPixelsPerOutput;
      if (totalPixels <= p.totalPixels && pOutputsNeeded <= p.outputs && pWidthOk && pHeightOk && pModuleOk) {
        recommendedProcessor = p;
        break;
      }
    }

    // Calculate output groups for wiring visualization
    const pattern = wiringPatterns[wiringPattern];
    const moduleOrder = pattern.getOrder(finalWidthModules, finalHeightModules);
    const outputGroups = [];
    let currentGroup = [];
    let currentGroupPixels = 0;
    
    for (let i = 0; i < moduleOrder.length; i++) {
      if (currentGroupPixels + pixelsPerModule > pixelsPerOutput && currentGroup.length > 0) {
        outputGroups.push([...currentGroup]);
        currentGroup = [];
        currentGroupPixels = 0;
      }
      currentGroup.push(moduleOrder[i]);
      currentGroupPixels += pixelsPerModule;
    }
    if (currentGroup.length > 0) {
      outputGroups.push(currentGroup);
    }

    return {
      // Dimensions
      finalWidthModules,
      finalHeightModules,
      finalWidthCm,
      finalHeightCm,
      widthM: (finalWidthCm / 100).toFixed(2),
      heightM: (finalHeightCm / 100).toFixed(2),
      totalModules,
      areaM2: areaM2.toFixed(2),
      
      // Resolution
      resolutionW,
      resolutionH,
      totalPixels,
      megapixels: (totalPixels / 1000000).toFixed(2),
      pixelsPerModule,
      pixelDensity: Math.round(pixelDensity),
      pitchMm: pitchMm.toFixed(1),
      minViewingDistance: minViewingDistance.toFixed(1),
      maxViewingDistance: maxViewingDistance.toFixed(1),
      
      // Aspect ratio
      aspectRatio: aspectRatio.toFixed(2),
      closestRatio,
      contentW,
      contentH,
      letterbox,
      pillarbox,
      
      // Processing
      pixelsPerOutput,
      modulesPerOutput,
      outputsNeeded,
      actualOutputs,
      modulesPerOutputActual,
      utpInputs,
      utpBridges,
      processorSufficient,
      pixelsSufficient,
      outputsSufficient,
      widthSufficient,
      heightSufficient,
      moduleExceedsOutput,
      recommendedProcessor,
      outputGroups,
      moduleOrder,
      
      // Weight and Power
      totalWeight,
      totalPower,
      totalAmps220: totalAmps220.toFixed(1),
      totalAmps110: totalAmps110.toFixed(1),
      
      // Rigging
      hangingPointsTotal,
      weightPerHangingPoint: weightPerHangingPoint.toFixed(1),
      safeWorkingLoad: safeWorkingLoad.toFixed(1),
      
      // Module info
      module: mod,
      processor: proc
    };
  };

  const results = calculate();

  // ==================== PIXEL MAP GENERATION ====================
  const generatePixelMap = () => {
    if (!results || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { resolutionW, resolutionH, finalWidthModules, finalHeightModules, outputGroups } = results;
    const mod = modules[selectedModule];
    const colors = colorSchemes[colorScheme].colors;

    // Set canvas to actual pixel resolution
    canvas.width = resolutionW;
    canvas.height = resolutionH;

    // Draw modules with alternating colors based on position (checkerboard)
    for (let row = 0; row < finalHeightModules; row++) {
      for (let col = 0; col < finalWidthModules; col++) {
        const colorIndex = (row + col) % 2;
        const x = col * mod.pixelsW;
        const y = row * mod.pixelsH;

        // Fill module
        ctx.fillStyle = colors[colorIndex];
        ctx.fillRect(x, y, mod.pixelsW, mod.pixelsH);

        // Draw border
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = Math.max(2, Math.min(mod.pixelsW, mod.pixelsH) / 50);
        ctx.strokeRect(x, y, mod.pixelsW, mod.pixelsH);
      }
    }

    // Draw wiring arrows
    const arrowSize = Math.min(mod.pixelsW, mod.pixelsH) / 6;
    ctx.fillStyle = '#000000';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = Math.max(2, arrowSize / 4);

    outputGroups.forEach((group, groupIndex) => {
      for (let i = 0; i < group.length; i++) {
        const pos = group[i];
        const x = pos.col * mod.pixelsW + mod.pixelsW / 2;
        const y = pos.row * mod.pixelsH + mod.pixelsH / 2;

        if (i < group.length - 1) {
          const nextPos = group[i + 1];
          const nextX = nextPos.col * mod.pixelsW + mod.pixelsW / 2;
          const nextY = nextPos.row * mod.pixelsH + mod.pixelsH / 2;

          // Draw arrow from current to next
          const angle = Math.atan2(nextY - y, nextX - x);
          const midX = (x + nextX) / 2;
          const midY = (y + nextY) / 2;

          // Arrow head
          ctx.beginPath();
          ctx.moveTo(midX + arrowSize * Math.cos(angle), midY + arrowSize * Math.sin(angle));
          ctx.lineTo(midX - arrowSize * 0.5 * Math.cos(angle - Math.PI / 6), midY - arrowSize * 0.5 * Math.sin(angle - Math.PI / 6));
          ctx.lineTo(midX - arrowSize * 0.5 * Math.cos(angle + Math.PI / 6), midY - arrowSize * 0.5 * Math.sin(angle + Math.PI / 6));
          ctx.closePath();
          ctx.fill();
        }
      }
    });

    // Draw output group numbers
    outputGroups.forEach((group, groupIndex) => {
      if (group.length === 0) return;
      const firstPos = group[0];
      const x = firstPos.col * mod.pixelsW;
      const y = firstPos.row * mod.pixelsH + mod.pixelsH;
      
      const circleRadius = Math.min(mod.pixelsW, mod.pixelsH) / 4;
      const circleX = x + circleRadius + 5;
      const circleY = y - circleRadius - 5;

      // Draw circle background
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(circleX, circleY, circleRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw number
      ctx.fillStyle = '#000000';
      ctx.font = `bold ${circleRadius}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(groupIndexStart + groupIndex), circleX, circleY);
    });

    // Draw project name in center
    const centerX = resolutionW / 2;
    const centerY = resolutionH / 2;
    const fontSize = Math.min(mod.pixelsW * 0.8, resolutionW / 15);
    
    // Background for project name
    ctx.font = `bold ${fontSize}px Arial`;
    const textMetrics = ctx.measureText(projectName);
    const textWidth = textMetrics.width + 20;
    const textHeight = fontSize * 1.5;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(centerX - textWidth / 2, centerY - textHeight / 2, textWidth, textHeight);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(centerX - textWidth / 2, centerY - textHeight / 2, textWidth, textHeight);
    
    // Project name text
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(projectName, centerX, centerY);

    // Draw info bar at bottom (2 lines)
    const infoFontSize = Math.max(12, Math.min(24, resolutionH / 40));
    const infoHeight = infoFontSize * 3;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fillRect(0, resolutionH - infoHeight, resolutionW, infoHeight);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, resolutionH - infoHeight, resolutionW, infoHeight);
    
    ctx.fillStyle = '#000000';
    ctx.font = `${infoFontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Line 1
    const line1 = `Panel Count: ${finalWidthModules} wide × ${finalHeightModules} high • ${results.totalModules} panels total • Resolution: ${resolutionW} × ${resolutionH} px • Aspect Ratio: ${results.aspectRatio}:1`;
    ctx.fillText(line1, resolutionW / 2, resolutionH - infoHeight + infoFontSize);
    
    // Line 2
    const line2 = `Size: ${results.widthM}m × ${results.heightM}m • Module: ${mod.name} (${mod.width}×${mod.height} cm) • Pitch: P${results.pitchMm}`;
    ctx.fillText(line2, resolutionW / 2, resolutionH - infoFontSize);
  };

  const downloadPixelMap = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `pixelmap_${results.resolutionW}x${results.resolutionH}_${projectName.replace(/\s+/g, '_')}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  // Generate pixel map when results change
  useEffect(() => {
    if (activeTab === 'pixelmap' && results) {
      generatePixelMap();
    }
  }, [activeTab, results, selectedModule, wiringPattern, colorScheme, projectName, groupIndexStart]);

  // ==================== CONFIG MANAGEMENT ====================
  const generateId = (name) => {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  };

  // Module functions
  const addModule = () => {
    if (!newModule.name || !newModule.pixelsW || !newModule.pixelsH || !newModule.width || !newModule.height) {
      alert('Complete los campos requeridos: Nombre, Píxeles (ancho/alto), Tamaño (ancho/alto)');
      return;
    }
    const id = generateId(newModule.name);
    if (modules[id]) {
      alert('Ya existe un módulo con ese nombre');
      return;
    }
    setModules(prev => ({
      ...prev,
      [id]: { 
        id, 
        name: newModule.name,
        description: newModule.description || '',
        pixelsW: parseInt(newModule.pixelsW),
        pixelsH: parseInt(newModule.pixelsH),
        width: parseInt(newModule.width),
        height: parseInt(newModule.height),
        weight: parseInt(newModule.weight) || 0,
        power: parseInt(newModule.power) || 0,
        hangingPoints: parseInt(newModule.hangingPoints) || 2
      }
    }));
    setNewModule({
      name: '',
      description: '',
      pixelsW: '',
      pixelsH: '',
      width: '',
      height: '',
      weight: '',
      power: '',
      hangingPoints: ''
    });
  };

  const startEditModule = (mod) => {
    setEditingModuleId(mod.id);
    setEditModule({ ...mod });
  };

  const saveEditModule = () => {
    if (!editModule.name || !editModule.pixelsW || !editModule.pixelsH || !editModule.width || !editModule.height) {
      alert('Complete los campos requeridos');
      return;
    }
    setModules(prev => ({
      ...prev,
      [editingModuleId]: {
        ...editModule,
        pixelsW: parseInt(editModule.pixelsW),
        pixelsH: parseInt(editModule.pixelsH),
        width: parseInt(editModule.width),
        height: parseInt(editModule.height),
        weight: parseInt(editModule.weight) || 0,
        power: parseInt(editModule.power) || 0,
        hangingPoints: parseInt(editModule.hangingPoints) || 2
      }
    }));
    setEditingModuleId(null);
    setEditModule(null);
  };

  const cancelEditModule = () => {
    setEditingModuleId(null);
    setEditModule(null);
  };

  const deleteModule = (id) => {
    if (Object.keys(modules).length <= 1) {
      alert('Debe mantener al menos un módulo');
      return;
    }
    const confirmed = window.confirm('¿Eliminar este módulo?');
    if (!confirmed) return;
    
    setModules(prev => {
      const { [id]: removed, ...rest } = prev;
      return rest;
    });
    
    if (selectedModule === id) {
      const remainingIds = Object.keys(modules).filter(key => key !== id);
      if (remainingIds.length > 0) {
        setSelectedModule(remainingIds[0]);
      }
    }
  };

  // Processor functions
  const addProcessor = () => {
    if (!newProcessor.model || !newProcessor.outputs || !newProcessor.totalPixels) {
      alert('Complete los campos requeridos: Modelo, Outputs UTP, Píxeles totales');
      return;
    }
    const id = generateId(`${newProcessor.brand}-${newProcessor.model}`);
    if (processors[id]) {
      alert('Ya existe un procesador con ese nombre');
      return;
    }
    setProcessors(prev => ({
      ...prev,
      [id]: { 
        id, 
        brand: newProcessor.brand || '',
        model: newProcessor.model,
        description: newProcessor.description || '',
        outputs: parseInt(newProcessor.outputs),
        totalPixels: parseInt(newProcessor.totalPixels),
        maxWidth: parseInt(newProcessor.maxWidth) || 0,
        maxHeight: parseInt(newProcessor.maxHeight) || 0
      }
    }));
    setNewProcessor({
      brand: '',
      model: '',
      description: '',
      outputs: '',
      totalPixels: '',
      maxWidth: '',
      maxHeight: ''
    });
  };

  const startEditProcessor = (proc) => {
    setEditingProcessorId(proc.id);
    setEditProcessor({ ...proc });
  };

  const saveEditProcessor = () => {
    if (!editProcessor.model || !editProcessor.outputs || !editProcessor.totalPixels) {
      alert('Complete los campos requeridos');
      return;
    }
    setProcessors(prev => ({
      ...prev,
      [editingProcessorId]: {
        ...editProcessor,
        outputs: parseInt(editProcessor.outputs),
        totalPixels: parseInt(editProcessor.totalPixels),
        maxWidth: parseInt(editProcessor.maxWidth) || 0,
        maxHeight: parseInt(editProcessor.maxHeight) || 0
      }
    }));
    setEditingProcessorId(null);
    setEditProcessor(null);
  };

  const cancelEditProcessor = () => {
    setEditingProcessorId(null);
    setEditProcessor(null);
  };

  const deleteProcessor = (id) => {
    if (Object.keys(processors).length <= 1) {
      alert('Debe mantener al menos un procesador');
      return;
    }
    const confirmed = window.confirm('¿Eliminar este procesador?');
    if (!confirmed) return;
    
    setProcessors(prev => {
      const { [id]: removed, ...rest } = prev;
      return rest;
    });
    
    if (selectedProcessor === id) {
      const remainingIds = Object.keys(processors).filter(key => key !== id);
      if (remainingIds.length > 0) {
        setSelectedProcessor(remainingIds[0]);
      }
    }
  };

  const exportConfig = () => {
    const config = { 
      modules, 
      processors,
      project: {
        name: projectName,
        groupIndexStart,
        wiringPattern,
        colorScheme
      }
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.download = 'led-config.json';
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  const importConfig = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const config = JSON.parse(event.target.result);
        if (config.modules) setModules(config.modules);
        if (config.processors) setProcessors(config.processors);
        if (config.project) {
          setProjectName(config.project.name || 'Mi Proyecto LED');
          setGroupIndexStart(config.project.groupIndexStart || 1);
          setWiringPattern(config.project.wiringPattern || 'horizontal-right');
          setColorScheme(config.project.colorScheme || 'cyan-magenta');
        }
      } catch (err) {
        alert('Error al importar configuración');
      }
    };
    reader.readAsText(file);
  };

  // ==================== EXPORT FUNCTIONS ====================
  const exportCommercial = () => {
    if (!results) return;
    const content = `
ESPECIFICACIONES COMERCIALES - PANTALLA LED
============================================
Proyecto: ${projectName}

DIMENSIONES
-----------
Tamaño: ${results.widthM}m × ${results.heightM}m
Área total: ${results.areaM2} m²
Módulos: ${results.finalWidthModules} × ${results.finalHeightModules} (${results.totalModules} unidades)
Resolución: ${results.resolutionW} × ${results.resolutionH} px (${results.megapixels} MP)

PROPORCIÓN
----------
Aspect Ratio: ${results.aspectRatio}:1
Estándar más cercano: ${results.closestRatio.name} (${results.closestRatio.w}×${results.closestRatio.h})
${results.letterbox > 0 ? `Letterbox: ${results.letterbox}px (barras horizontales)` : ''}
${results.pillarbox > 0 ? `Pillarbox: ${results.pillarbox}px (barras verticales)` : ''}

ESPECIFICACIONES TÉCNICAS
-------------------------
Tipo de módulo: ${results.module.name}
Pixel Pitch: P${results.pitchMm}
Distancia óptima de visualización: ${results.minViewingDistance}m - ${results.maxViewingDistance}m

PESO Y CONSUMO
--------------
Peso total: ${results.totalWeight} kg
Consumo eléctrico: ${Math.round(results.totalPower)} W
Amperaje requerido: ${results.totalAmps220}A @220V / ${results.totalAmps110}A @110V

---
Documento generado por Calculadora para Pantallas LED
by Euforía Técnica y Logística para Eventos
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.download = `comercial_${projectName.replace(/\s+/g, '_')}.txt`;
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  const exportTechnical = () => {
    if (!results) return;
    const content = `
ESPECIFICACIONES TÉCNICAS - PANTALLA LED
========================================
Proyecto: ${projectName}

CONFIGURACIÓN DE PANTALLA
-------------------------
Módulo: ${results.module.name}
${results.module.description ? `Descripción: ${results.module.description}` : ''}
Dimensiones módulo: ${results.module.width}cm × ${results.module.height}cm
Resolución módulo: ${results.module.pixelsW} × ${results.module.pixelsH} px (${results.pixelsPerModule.toLocaleString()} px/módulo)
Pixel Pitch: P${results.pitchMm}

Configuración: ${results.finalWidthModules} × ${results.finalHeightModules} módulos
Total módulos: ${results.totalModules}
Dimensión total: ${results.widthM}m × ${results.heightM}m (${results.areaM2} m²)
Resolución total: ${results.resolutionW} × ${results.resolutionH} px
Total píxeles: ${results.totalPixels.toLocaleString()} (${results.megapixels} MP)
Densidad de píxeles: ${results.pixelDensity.toLocaleString()} px/m²

Distancia de visualización: ${results.minViewingDistance}m - ${results.maxViewingDistance}m

PROCESAMIENTO DE VIDEO
----------------------
Procesador: ${results.processor.brand} ${results.processor.model}
${results.processor.description ? `Descripción: ${results.processor.description}` : ''}
Outputs disponibles: ${results.processor.outputs}
Píxeles por output: ${results.pixelsPerOutput.toLocaleString()}
Capacidad total: ${results.processor.totalPixels.toLocaleString()} px
${results.processor.maxWidth ? `Max resolución: ${results.processor.maxWidth} × ${results.processor.maxHeight} px` : ''}

Estado: ${results.processorSufficient ? '✓ SUFICIENTE' : '✗ INSUFICIENTE'}
Outputs necesarios: ${results.outputsNeeded}
Módulos por output: ~${results.modulesPerOutputActual}

${!results.processorSufficient && results.recommendedProcessor ? `RECOMENDACIÓN: ${results.recommendedProcessor.brand} ${results.recommendedProcessor.model}` : ''}
${results.moduleExceedsOutput ? '⚠ ATENCIÓN: Un solo módulo excede la capacidad de un output' : ''}

CABLEADO UTP
------------
Patrón de cableado: ${wiringPatterns[wiringPattern].name}
Grupo de inicio: ${groupIndexStart}

Cables de entrada (desde procesador): ${results.utpInputs}
Puentes entre módulos: ${results.utpBridges}
Total cables UTP: ${results.utpInputs + results.utpBridges}

Distribución por output:
${results.outputGroups.map((group, i) => 
  `  Output ${groupIndexStart + i}: ${group.length} módulos`
).join('\n')}

PESO Y CONSUMO ELÉCTRICO
------------------------
Peso por módulo: ${results.module.weight || 0} kg
Peso total: ${results.totalWeight} kg

Consumo especificado: ${results.module.power || 0} W/m²
Consumo total: ${results.totalPower.toFixed(0)} W
Amperaje @220V: ${results.totalAmps220} A
Amperaje @110V: ${results.totalAmps110} A

RIGGING / ESTRUCTURA
--------------------
Puntos de colgado por módulo: ${results.module.hangingPoints || 2}
Puntos de colgado totales (fila superior): ${results.hangingPointsTotal}
Carga por punto de colgado: ${results.weightPerHangingPoint} kg
Carga de trabajo segura (SWL 2:1): ${results.safeWorkingLoad} kg/punto

CONFIGURACIÓN RESOLUME
----------------------
Output resolution: ${results.resolutionW} × ${results.resolutionH}
Aspect ratio: ${results.aspectRatio}:1

---
Documento generado por Calculadora para Pantallas LED
by Euforía Técnica y Logística para Eventos
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.download = `tecnico_${projectName.replace(/\s+/g, '_')}.txt`;
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  // ==================== RENDER ====================
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 text-center">
        <h1 className="text-2xl font-bold">Calculadora para Pantallas LED</h1>
        <p className="text-sm text-gray-400">by Euforía Técnica y Logística para Eventos</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700">
        <button
          onClick={() => setActiveTab('calculator')}
          className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 ${
            activeTab === 'calculator' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          <Calculator size={20} />
          Calculadora
        </button>
        <button
          onClick={() => setActiveTab('pixelmap')}
          className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 ${
            activeTab === 'pixelmap' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          <Grid size={20} />
          Pixel Map
        </button>
        <button
          onClick={() => setActiveTab('config')}
          className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 ${
            activeTab === 'config' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          <Settings size={20} />
          Configuración
        </button>
      </div>

      {/* Content */}
      <div className="p-4 max-w-4xl mx-auto">
        {/* ==================== CALCULATOR TAB ==================== */}
        {activeTab === 'calculator' && (
          <div className="space-y-4">
            {/* Input Section */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-4">Configuración de Pantalla</h2>
              
              {/* Module Selection */}
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-2">Módulo LED</label>
                <select
                  value={selectedModule}
                  onChange={(e) => setSelectedModule(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                >
                  {Object.values(modules).map(mod => (
                    <option key={mod.id} value={mod.id}>
                      {mod.name} ({mod.width}×{mod.height}cm - {mod.pixelsW}×{mod.pixelsH}px)
                    </option>
                  ))}
                </select>
              </div>

              {/* Input Mode */}
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-2">Modo de entrada</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setInputMode('modules')}
                    className={`flex-1 py-2 rounded ${
                      inputMode === 'modules' ? 'bg-blue-600' : 'bg-gray-700'
                    }`}
                  >
                    Módulos
                  </button>
                  <button
                    onClick={() => setInputMode('cm')}
                    className={`flex-1 py-2 rounded ${
                      inputMode === 'cm' ? 'bg-blue-600' : 'bg-gray-700'
                    }`}
                  >
                    Centímetros
                  </button>
                </div>
              </div>

              {/* Dimensions Input */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                {inputMode === 'modules' ? (
                  <>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Ancho (módulos)</label>
                      <input
                        type="number"
                        value={widthModules}
                        onChange={(e) => setWidthModules(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Alto (módulos)</label>
                      <input
                        type="number"
                        value={heightModules}
                        onChange={(e) => setHeightModules(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                        min="1"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Ancho (cm)</label>
                      <input
                        type="number"
                        value={widthCm}
                        onChange={(e) => setWidthCm(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Alto (cm)</label>
                      <input
                        type="number"
                        value={heightCm}
                        onChange={(e) => setHeightCm(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                        min="1"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Processor Selection */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Procesador</label>
                <select
                  value={selectedProcessor}
                  onChange={(e) => setSelectedProcessor(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                >
                  {Object.values(processors).map(proc => (
                    <option key={proc.id} value={proc.id}>
                      {proc.brand} {proc.model} ({proc.outputs} outputs - {(proc.totalPixels / 1000000).toFixed(1)}MP)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Results Section */}
            {results && (
              <>
                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-gray-400">Dimensiones</p>
                    <p className="text-lg font-bold">{results.widthM}m × {results.heightM}m</p>
                    <p className="text-xs text-gray-500">{results.finalWidthModules}×{results.finalHeightModules} módulos • {results.areaM2} m²</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-gray-400">Resolución</p>
                    <p className="text-lg font-bold">{results.resolutionW}×{results.resolutionH}</p>
                    <p className="text-xs text-gray-500">{results.megapixels} MP • P{results.pitchMm}</p>
                  </div>
                </div>

                {/* Weight, Power, Rigging */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <span>⚖️</span> Peso Total
                    </p>
                    <p className="text-lg font-bold">{results.totalWeight} kg</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <span>⚡</span> Consumo
                    </p>
                    <p className="text-lg font-bold">{Math.round(results.totalPower)} W</p>
                    <p className="text-xs text-gray-500">{results.totalAmps220}A @220V</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <span>⚓</span> Rigging
                    </p>
                    <p className="text-lg font-bold">{results.hangingPointsTotal} pts</p>
                    <p className="text-xs text-gray-500">SWL: {results.safeWorkingLoad}kg/pt</p>
                  </div>
                </div>

                {/* Viewing Distance */}
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-400">Distancia de visualización óptima</p>
                  <p className="text-lg font-bold">{results.minViewingDistance}m - {results.maxViewingDistance}m</p>
                </div>

                {/* Aspect Ratio Visualization */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-sm font-semibold mb-3">Aspect Ratio: {results.aspectRatio}:1</h3>
                  <div className="flex items-center justify-center mb-3">
                    <div 
                      className="relative bg-gray-600 flex items-center justify-center"
                      style={{
                        width: '200px',
                        height: `${200 / results.aspectRatio}px`,
                        maxHeight: '150px'
                      }}
                    >
                      {/* Content area */}
                      <div
                        className="absolute bg-blue-500 flex items-center justify-center text-xs"
                        style={{
                          width: results.pillarbox > 0 
                            ? `${(results.contentW / results.resolutionW) * 100}%` 
                            : '100%',
                          height: results.letterbox > 0 
                            ? `${(results.contentH / results.resolutionH) * 100}%` 
                            : '100%'
                        }}
                      >
                        {results.closestRatio.name}
                      </div>
                      {/* Labels */}
                      {results.letterbox > 0 && (
                        <span className="absolute top-1 text-xs text-gray-300">Letterbox</span>
                      )}
                      {results.pillarbox > 0 && (
                        <span className="absolute left-1 text-xs text-gray-300" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>Pillar</span>
                      )}
                    </div>
                  </div>
                  <p className="text-center text-sm text-gray-400">
                    Estándar: {results.closestRatio.name} ({results.closestRatio.w}×{results.closestRatio.h})
                  </p>
                  {results.letterbox > 0 && (
                    <p className="text-center text-xs text-yellow-400">
                      Letterbox: {results.letterbox}px ({((results.letterbox / results.resolutionH) * 100).toFixed(1)}%)
                    </p>
                  )}
                  {results.pillarbox > 0 && (
                    <p className="text-center text-xs text-yellow-400">
                      Pillarbox: {results.pillarbox}px ({((results.pillarbox / results.resolutionW) * 100).toFixed(1)}%)
                    </p>
                  )}
                </div>

                {/* Processor Status */}
                <div className={`rounded-lg p-4 ${
                  results.processorSufficient 
                    ? 'bg-green-900/30 border border-green-600' 
                    : 'bg-red-900/30 border border-red-600'
                }`}>
                  <h3 className="font-semibold mb-2">
                    {results.processorSufficient ? '✓ Procesador OK' : '✗ Procesador Insuficiente'}
                  </h3>
                  <p className="text-sm">
                    {results.processor.brand} {results.processor.model}: {results.outputsNeeded}/{results.processor.outputs} outputs necesarios
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {results.totalPixels.toLocaleString()} / {results.processor.totalPixels.toLocaleString()} píxeles
                  </p>
                  {!results.pixelsSufficient && (
                    <p className="text-xs text-red-400 mt-1">
                      ⚠ Píxeles totales exceden capacidad del procesador
                    </p>
                  )}
                  {!results.outputsSufficient && (
                    <p className="text-xs text-red-400 mt-1">
                      ⚠ Outputs insuficientes ({results.outputsNeeded} necesarios, {results.processor.outputs} disponibles)
                    </p>
                  )}
                  {!results.widthSufficient && (
                    <p className="text-xs text-red-400 mt-1">
                      ⚠ Ancho excede máximo ({results.resolutionW} &gt; {results.processor.maxWidth}px)
                    </p>
                  )}
                  {!results.heightSufficient && (
                    <p className="text-xs text-red-400 mt-1">
                      ⚠ Alto excede máximo ({results.resolutionH} &gt; {results.processor.maxHeight}px)
                    </p>
                  )}
                  {results.moduleExceedsOutput && (
                    <p className="text-xs text-red-400 mt-1">
                      ⚠ Un módulo ({results.pixelsPerModule.toLocaleString()}px) excede capacidad por output ({results.pixelsPerOutput.toLocaleString()}px)
                    </p>
                  )}
                  {!results.processorSufficient && results.recommendedProcessor && (
                    <p className="text-sm text-yellow-400 mt-2">
                      Recomendado: {results.recommendedProcessor.brand} {results.recommendedProcessor.model}
                    </p>
                  )}
                </div>

                {/* UTP Cabling */}
                <div className="bg-cyan-900/30 border border-cyan-600 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Cableado UTP</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p>Entradas: <strong>{results.utpInputs}</strong></p>
                    <p>Puentes: <strong>{results.utpBridges}</strong></p>
                    <p className="col-span-2">Total cables: <strong>{results.utpInputs + results.utpBridges}</strong></p>
                  </div>
                </div>

                {/* Export Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={exportCommercial}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded flex items-center justify-center gap-2"
                  >
                    <Download size={18} />
                    Comercial
                  </button>
                  <button
                    onClick={exportTechnical}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 py-2 px-4 rounded flex items-center justify-center gap-2"
                  >
                    <Download size={18} />
                    Técnico
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ==================== PIXEL MAP TAB ==================== */}
        {activeTab === 'pixelmap' && results && (
          <div className="space-y-4">
            {/* Pixel Map Options */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-4">Opciones de Pixel Map</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Color Scheme */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Esquema de colores</label>
                  <select
                    value={colorScheme}
                    onChange={(e) => setColorScheme(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                  >
                    {Object.entries(colorSchemes).map(([key, scheme]) => (
                      <option key={key} value={key}>{scheme.name}</option>
                    ))}
                  </select>
                </div>

                {/* Wiring Pattern */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Patrón de cableado</label>
                  <select
                    value={wiringPattern}
                    onChange={(e) => setWiringPattern(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                  >
                    {Object.entries(wiringPatterns).map(([key, pattern]) => (
                      <option key={key} value={key}>{pattern.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <p className="text-sm text-gray-400">
                Resolución: {results.resolutionW} × {results.resolutionH} px | 
                Grid: {results.finalWidthModules} × {results.finalHeightModules} | 
                Outputs: {results.outputGroups.length}
              </p>
            </div>
            
            {/* Canvas */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="bg-gray-900 rounded-lg p-2 overflow-auto">
                <canvas
                  ref={canvasRef}
                  className="max-w-full h-auto mx-auto"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
            </div>

            <button
              onClick={downloadPixelMap}
              className="w-full bg-green-600 hover:bg-green-700 py-3 px-4 rounded flex items-center justify-center gap-2"
            >
              <Download size={20} />
              Descargar PNG ({results.resolutionW}×{results.resolutionH})
            </button>
          </div>
        )}

        {/* ==================== CONFIG TAB ==================== */}
        {activeTab === 'config' && (
          <div className="space-y-6">
            {/* Project Settings */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-3">Configuración del Proyecto</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Nombre del proyecto</label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                    placeholder="Mi Proyecto LED"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Grupo de inicio del cableado</label>
                  <input
                    type="number"
                    value={groupIndexStart}
                    onChange={(e) => setGroupIndexStart(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                    min="1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Número inicial para etiquetar los grupos de salida</p>
                </div>
              </div>
            </div>

            {/* Import/Export */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-3">Importar/Exportar</h2>
              <div className="flex gap-3">
                <button
                  onClick={exportConfig}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  Exportar Config
                </button>
                <label className="flex-1 bg-gray-600 hover:bg-gray-500 py-2 px-4 rounded flex items-center justify-center gap-2 cursor-pointer">
                  <Upload size={18} />
                  Importar Config
                  <input
                    type="file"
                    accept=".json"
                    onChange={importConfig}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Modules Config */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-3">Módulos LED</h2>
              
              {/* Existing modules */}
              <div className="space-y-2 mb-4">
                {Object.values(modules).map(mod => (
                  <div key={mod.id} className="bg-gray-700 rounded p-3">
                    {editingModuleId === mod.id ? (
                      // Edit mode
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs text-gray-400">Nombre *</label>
                            <input
                              value={editModule.name}
                              onChange={(e) => setEditModule(prev => ({ ...prev, name: e.target.value }))}
                              className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-400">Descripción</label>
                            <input
                              value={editModule.description}
                              onChange={(e) => setEditModule(prev => ({ ...prev, description: e.target.value }))}
                              className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-400">Píxeles ancho *</label>
                            <input
                              type="number"
                              value={editModule.pixelsW}
                              onChange={(e) => setEditModule(prev => ({ ...prev, pixelsW: e.target.value }))}
                              className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-400">Píxeles alto *</label>
                            <input
                              type="number"
                              value={editModule.pixelsH}
                              onChange={(e) => setEditModule(prev => ({ ...prev, pixelsH: e.target.value }))}
                              className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-400">Ancho cm *</label>
                            <input
                              type="number"
                              value={editModule.width}
                              onChange={(e) => setEditModule(prev => ({ ...prev, width: e.target.value }))}
                              className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-400">Alto cm *</label>
                            <input
                              type="number"
                              value={editModule.height}
                              onChange={(e) => setEditModule(prev => ({ ...prev, height: e.target.value }))}
                              className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-400">Peso kg</label>
                            <input
                              type="number"
                              value={editModule.weight}
                              onChange={(e) => setEditModule(prev => ({ ...prev, weight: e.target.value }))}
                              className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-400">Consumo W/m²</label>
                            <input
                              type="number"
                              value={editModule.power}
                              onChange={(e) => setEditModule(prev => ({ ...prev, power: e.target.value }))}
                              className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button onClick={cancelEditModule} className="p-1 text-gray-400 hover:text-white">
                            <X size={18} />
                          </button>
                          <button onClick={saveEditModule} className="p-1 text-green-400 hover:text-green-300">
                            <Check size={18} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      // View mode
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{mod.name}</p>
                          <p className="text-xs text-gray-400">
                            {mod.width}×{mod.height}cm | {mod.pixelsW}×{mod.pixelsH}px
                            {mod.weight ? ` | ${mod.weight}kg` : ''}
                            {mod.power ? ` | ${mod.power}W` : ''}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => startEditModule(mod)}
                            className="text-blue-400 hover:text-blue-300 p-1"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => deleteModule(mod.id)}
                            className="text-red-400 hover:text-red-300 p-1"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add new module */}
              <div className="border-t border-gray-600 pt-4">
                <h3 className="text-sm font-semibold mb-3">Agregar módulo</h3>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Nombre *</label>
                    <input
                      value={newModule.name}
                      onChange={(e) => setNewModule(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Descripción</label>
                    <input
                      value={newModule.description}
                      onChange={(e) => setNewModule(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Píxeles ancho *</label>
                    <input
                      type="number"
                      value={newModule.pixelsW}
                      onChange={(e) => setNewModule(prev => ({ ...prev, pixelsW: e.target.value }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Píxeles alto *</label>
                    <input
                      type="number"
                      value={newModule.pixelsH}
                      onChange={(e) => setNewModule(prev => ({ ...prev, pixelsH: e.target.value }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Ancho cm *</label>
                    <input
                      type="number"
                      value={newModule.width}
                      onChange={(e) => setNewModule(prev => ({ ...prev, width: e.target.value }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Alto cm *</label>
                    <input
                      type="number"
                      value={newModule.height}
                      onChange={(e) => setNewModule(prev => ({ ...prev, height: e.target.value }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Peso kg</label>
                    <input
                      type="number"
                      value={newModule.weight}
                      onChange={(e) => setNewModule(prev => ({ ...prev, weight: e.target.value }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Consumo W/m²</label>
                    <input
                      type="number"
                      value={newModule.power}
                      onChange={(e) => setNewModule(prev => ({ ...prev, power: e.target.value }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-400 mb-1">Puntos de colgado (1-4)</label>
                    <input
                      type="number"
                      value={newModule.hangingPoints}
                      onChange={(e) => setNewModule(prev => ({ ...prev, hangingPoints: e.target.value }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm"
                      min="1"
                      max="4"
                    />
                  </div>
                </div>
                <button
                  onClick={addModule}
                  className="w-full bg-green-600 hover:bg-green-700 py-2 rounded flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  Agregar Módulo
                </button>
              </div>
            </div>

            {/* Processors Config */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-3">Procesadores</h2>
              
              {/* Existing processors */}
              <div className="space-y-2 mb-4">
                {Object.values(processors).map(proc => (
                  <div key={proc.id} className="bg-gray-700 rounded p-3">
                    {editingProcessorId === proc.id ? (
                      // Edit mode
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs text-gray-400">Marca</label>
                            <input
                              value={editProcessor.brand}
                              onChange={(e) => setEditProcessor(prev => ({ ...prev, brand: e.target.value }))}
                              className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-400">Modelo *</label>
                            <input
                              value={editProcessor.model}
                              onChange={(e) => setEditProcessor(prev => ({ ...prev, model: e.target.value }))}
                              className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-xs text-gray-400">Descripción</label>
                            <input
                              value={editProcessor.description}
                              onChange={(e) => setEditProcessor(prev => ({ ...prev, description: e.target.value }))}
                              className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-400">Outputs UTP *</label>
                            <input
                              type="number"
                              value={editProcessor.outputs}
                              onChange={(e) => setEditProcessor(prev => ({ ...prev, outputs: e.target.value }))}
                              className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-400">Píxeles totales *</label>
                            <input
                              type="number"
                              value={editProcessor.totalPixels}
                              onChange={(e) => setEditProcessor(prev => ({ ...prev, totalPixels: e.target.value }))}
                              className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-400">Max píxeles ancho</label>
                            <input
                              type="number"
                              value={editProcessor.maxWidth}
                              onChange={(e) => setEditProcessor(prev => ({ ...prev, maxWidth: e.target.value }))}
                              className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-400">Max píxeles alto</label>
                            <input
                              type="number"
                              value={editProcessor.maxHeight}
                              onChange={(e) => setEditProcessor(prev => ({ ...prev, maxHeight: e.target.value }))}
                              className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm"
                            />
                          </div>
                        </div>
                        {editProcessor.outputs && editProcessor.totalPixels && (
                          <p className="text-xs text-gray-400">
                            Píxeles por output: {Math.floor(parseInt(editProcessor.totalPixels) / parseInt(editProcessor.outputs)).toLocaleString()}
                          </p>
                        )}
                        <div className="flex gap-2 justify-end">
                          <button onClick={cancelEditProcessor} className="p-1 text-gray-400 hover:text-white">
                            <X size={18} />
                          </button>
                          <button onClick={saveEditProcessor} className="p-1 text-green-400 hover:text-green-300">
                            <Check size={18} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      // View mode
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{proc.brand} {proc.model}</p>
                          <p className="text-xs text-gray-400">
                            {proc.outputs} outputs | {(proc.totalPixels / 1000000).toFixed(1)}MP | {Math.floor(proc.totalPixels / proc.outputs).toLocaleString()} px/output
                            {proc.maxWidth ? ` | Max: ${proc.maxWidth}×${proc.maxHeight}` : ''}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => startEditProcessor(proc)}
                            className="text-blue-400 hover:text-blue-300 p-1"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => deleteProcessor(proc.id)}
                            className="text-red-400 hover:text-red-300 p-1"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add new processor */}
              <div className="border-t border-gray-600 pt-4">
                <h3 className="text-sm font-semibold mb-3">Agregar procesador</h3>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Marca</label>
                    <input
                      value={newProcessor.brand}
                      onChange={(e) => setNewProcessor(prev => ({ ...prev, brand: e.target.value }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Modelo *</label>
                    <input
                      value={newProcessor.model}
                      onChange={(e) => setNewProcessor(prev => ({ ...prev, model: e.target.value }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-400 mb-1">Descripción</label>
                    <input
                      value={newProcessor.description}
                      onChange={(e) => setNewProcessor(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Outputs UTP *</label>
                    <input
                      type="number"
                      value={newProcessor.outputs}
                      onChange={(e) => setNewProcessor(prev => ({ ...prev, outputs: e.target.value }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Píxeles totales *</label>
                    <input
                      type="number"
                      value={newProcessor.totalPixels}
                      onChange={(e) => setNewProcessor(prev => ({ ...prev, totalPixels: e.target.value }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Max píxeles ancho</label>
                    <input
                      type="number"
                      value={newProcessor.maxWidth}
                      onChange={(e) => setNewProcessor(prev => ({ ...prev, maxWidth: e.target.value }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Max píxeles alto</label>
                    <input
                      type="number"
                      value={newProcessor.maxHeight}
                      onChange={(e) => setNewProcessor(prev => ({ ...prev, maxHeight: e.target.value }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm"
                    />
                  </div>
                </div>
                {newProcessor.outputs && newProcessor.totalPixels && (
                  <p className="text-xs text-gray-400 mb-2">
                    Píxeles por output: {Math.floor(parseInt(newProcessor.totalPixels) / parseInt(newProcessor.outputs)).toLocaleString()}
                  </p>
                )}
                <button
                  onClick={addProcessor}
                  className="w-full bg-green-600 hover:bg-green-700 py-2 rounded flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  Agregar Procesador
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
