import React, { useState, useEffect, useRef } from 'react';
import { Calculator, Grid, Settings, Download, Plus, Trash2, Save, Upload, Edit2, X, Check, Copy, FolderOpen, ChevronDown } from 'lucide-react';

// ==================== UTILITY FUNCTIONS ====================
const generateId = () => Math.random().toString(36).substr(2, 9);
const generateSlug = (name) => name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

// ==================== DEFAULT DATA ====================
const DEFAULT_MODULES = {
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
};

const DEFAULT_PROCESSORS = {
  'vx300': {
    id: 'vx300',
    brand: 'NovaStar',
    model: 'VX300',
    description: 'Controlador all-in-one entry level',
    outputs: 3,
    totalPixels: 3900000,
    maxWidth: 3840,
    maxHeight: 1200,
    maxModulesPerOutput: null
  },
  'vx600': {
    id: 'vx600',
    brand: 'NovaStar',
    model: 'VX600',
    description: 'Controlador all-in-one mid-range',
    outputs: 6,
    totalPixels: 3900000,
    maxWidth: 10240,
    maxHeight: 8192,
    maxModulesPerOutput: null
  },
  'vx1000': {
    id: 'vx1000',
    brand: 'NovaStar',
    model: 'VX1000',
    description: 'Controlador all-in-one high-end',
    outputs: 10,
    totalPixels: 6500000,
    maxWidth: 10240,
    maxHeight: 8192,
    maxModulesPerOutput: null
  },
  'msd300': {
    id: 'msd300',
    brand: 'NovaStar',
    model: 'MSD300',
    description: 'Sending card básica',
    outputs: 2,
    totalPixels: 1300000,
    maxWidth: 1920,
    maxHeight: 1200,
    maxModulesPerOutput: null
  },
  'msd600': {
    id: 'msd600',
    brand: 'NovaStar',
    model: 'MSD600',
    description: 'Sending card avanzada',
    outputs: 4,
    totalPixels: 2300000,
    maxWidth: 2048,
    maxHeight: 1152,
    maxModulesPerOutput: null
  }
};

// Color schemes for processors in pixel map
const PROCESSOR_COLORS = [
  { primary: '#00FFFF', secondary: '#00CCCC', name: 'Cyan' },
  { primary: '#FF00FF', secondary: '#CC00CC', name: 'Magenta' },
  { primary: '#FF8C00', secondary: '#CC7000', name: 'Naranja' },
  { primary: '#32CD32', secondary: '#28A428', name: 'Verde' },
  { primary: '#9932CC', secondary: '#7A28A3', name: 'Púrpura' },
  { primary: '#FFD700', secondary: '#CCB000', name: 'Amarillo' },
];

// ==================== MAIN COMPONENT ====================
export default function App() {
  const canvasRef = useRef(null);
  const [activeTab, setActiveTab] = useState('calculator');
  const [showProjectMenu, setShowProjectMenu] = useState(false);

  // ==================== DATA STATE ====================
  const [projects, setProjects] = useState({});
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [modules, setModules] = useState(DEFAULT_MODULES);
  const [processors, setProcessors] = useState(DEFAULT_PROCESSORS);

  // ==================== CURRENT PROJECT CONFIG ====================
  const [projectName, setProjectName] = useState('Nuevo Proyecto');
  const [selectedModule, setSelectedModule] = useState('arakur-p29');
  const [selectedProcessor, setSelectedProcessor] = useState('vx600');
  const [inputMode, setInputMode] = useState('modules');
  const [widthModules, setWidthModules] = useState(6);
  const [heightModules, setHeightModules] = useState(4);
  const [widthCm, setWidthCm] = useState(384);
  const [heightCm, setHeightCm] = useState(256);
  const [wiringPattern, setWiringPattern] = useState('horizontal-right');
  const [colorScheme, setColorScheme] = useState('cyan-magenta');
  const [groupIndexStart, setGroupIndexStart] = useState(1);

  // ==================== UI STATE ====================
  const [editingModuleId, setEditingModuleId] = useState(null);
  const [editingProcessorId, setEditingProcessorId] = useState(null);
  const [editModule, setEditModule] = useState(null);
  const [editProcessor, setEditProcessor] = useState(null);
  const [newModule, setNewModule] = useState({
    name: '', description: '', pixelsW: '', pixelsH: '',
    width: '', height: '', weight: '', power: '', hangingPoints: ''
  });
  const [newProcessor, setNewProcessor] = useState({
    brand: '', model: '', description: '', outputs: '',
    totalPixels: '', maxWidth: '', maxHeight: '', maxModulesPerOutput: ''
  });

  // Color schemes for pixel map (visual)
  const colorSchemes = {
    'cyan-magenta': { name: 'Cyan / Magenta', colors: ['#00FFFF', '#FF00FF'] },
    'blue-green': { name: 'Azul / Verde', colors: ['#4169E1', '#32CD32'] },
    'orange-purple': { name: 'Naranja / Púrpura', colors: ['#FF8C00', '#9932CC'] },
    'red-cyan': { name: 'Rojo / Cyan', colors: ['#FF4444', '#00CED1'] }
  };

  // ==================== LOAD/SAVE DATA ====================
  useEffect(() => {
    const savedData = localStorage.getItem('led-designer-data');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        if (data.modules) setModules({ ...DEFAULT_MODULES, ...data.modules });
        if (data.processors) setProcessors({ ...DEFAULT_PROCESSORS, ...data.processors });
        if (data.projects) setProjects(data.projects);
        if (data.activeProjectId && data.projects[data.activeProjectId]) {
          loadProject(data.projects[data.activeProjectId]);
          setActiveProjectId(data.activeProjectId);
        }
      } catch (e) {
        console.error('Error loading data:', e);
      }
    }
  }, []);

  const saveAllData = () => {
    const currentProject = {
      id: activeProjectId || generateId(),
      name: projectName,
      updatedAt: new Date().toISOString(),
      config: {
        selectedModule, selectedProcessor, inputMode,
        widthModules, heightModules, widthCm, heightCm,
        wiringPattern, colorScheme, groupIndexStart
      }
    };

    const updatedProjects = {
      ...projects,
      [currentProject.id]: currentProject
    };

    if (!activeProjectId) {
      setActiveProjectId(currentProject.id);
    }

    setProjects(updatedProjects);

    localStorage.setItem('led-designer-data', JSON.stringify({
      modules, processors,
      projects: updatedProjects,
      activeProjectId: currentProject.id
    }));
  };

  // Auto-save on changes
  useEffect(() => {
    const timeout = setTimeout(saveAllData, 500);
    return () => clearTimeout(timeout);
  }, [projectName, selectedModule, selectedProcessor, inputMode, widthModules, heightModules,
      widthCm, heightCm, wiringPattern, colorScheme, groupIndexStart, modules, processors]);

  const loadProject = (project) => {
    setProjectName(project.name);
    setActiveProjectId(project.id);
    if (project.config) {
      setSelectedModule(project.config.selectedModule || 'arakur-p29');
      setSelectedProcessor(project.config.selectedProcessor || 'vx600');
      setInputMode(project.config.inputMode || 'modules');
      setWidthModules(project.config.widthModules || 6);
      setHeightModules(project.config.heightModules || 4);
      setWidthCm(project.config.widthCm || 384);
      setHeightCm(project.config.heightCm || 256);
      setWiringPattern(project.config.wiringPattern || 'horizontal-right');
      setColorScheme(project.config.colorScheme || 'cyan-magenta');
      setGroupIndexStart(project.config.groupIndexStart || 1);
    }
  };

  const createNewProject = () => {
    const newId = generateId();
    const newProject = {
      id: newId,
      name: 'Nuevo Proyecto',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      config: {
        selectedModule: 'arakur-p29',
        selectedProcessor: 'vx600',
        inputMode: 'modules',
        widthModules: 6,
        heightModules: 4,
        widthCm: 384,
        heightCm: 256,
        wiringPattern: 'horizontal-right',
        colorScheme: 'cyan-magenta',
        groupIndexStart: 1
      }
    };
    setProjects(prev => ({ ...prev, [newId]: newProject }));
    loadProject(newProject);
    setShowProjectMenu(false);
  };

  const duplicateProject = () => {
    const newId = generateId();
    const newProject = {
      id: newId,
      name: `${projectName} (copia)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      config: {
        selectedModule, selectedProcessor, inputMode,
        widthModules, heightModules, widthCm, heightCm,
        wiringPattern, colorScheme, groupIndexStart
      }
    };
    setProjects(prev => ({ ...prev, [newId]: newProject }));
    loadProject(newProject);
    setShowProjectMenu(false);
  };

  const deleteProject = (id) => {
    if (Object.keys(projects).length <= 1) {
      alert('Debe mantener al menos un proyecto');
      return;
    }
    if (!window.confirm('¿Eliminar este proyecto?')) return;

    const { [id]: removed, ...rest } = projects;
    setProjects(rest);

    if (activeProjectId === id) {
      const firstProject = Object.values(rest)[0];
      if (firstProject) loadProject(firstProject);
    }
    setShowProjectMenu(false);
  };

  // ==================== CALCULATIONS ====================
  const calculate = () => {
    const mod = modules[selectedModule];
    const proc = processors[selectedProcessor];
    if (!mod || !proc) return null;

    // Calculate dimensions
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
      { ratio: 1, name: '1:1', w: 1080, h: 1080 },
      { ratio: 21/9, name: '21:9', w: 2560, h: 1080 }
    ];
    const closestRatio = standardRatios.reduce((prev, curr) =>
      Math.abs(curr.ratio - aspectRatio) < Math.abs(prev.ratio - aspectRatio) ? curr : prev
    );

    // Letterbox/Pillarbox
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

    // Calculate processor requirements
    const pixelsPerOutput = Math.floor(proc.totalPixels / proc.outputs);
    const pixelsPerModule = mod.pixelsW * mod.pixelsH;

    // Calculate max modules per output (by pixels)
    let calculatedModulesPerOutput = Math.floor(pixelsPerOutput / pixelsPerModule);
    if (calculatedModulesPerOutput === 0) calculatedModulesPerOutput = 1;

    // Apply configured limit if set
    const effectiveModulesPerOutput = proc.maxModulesPerOutput
      ? Math.min(calculatedModulesPerOutput, proc.maxModulesPerOutput)
      : calculatedModulesPerOutput;

    // Determine if pattern is horizontal or vertical
    const isHorizontal = wiringPattern.startsWith('horizontal');
    const isReverseStart = wiringPattern.endsWith('left') || wiringPattern.endsWith('up');
    const lineSize = isHorizontal ? finalWidthModules : finalHeightModules;
    const numLines = isHorizontal ? finalHeightModules : finalWidthModules;

    // Calculate total outputs needed with serpentine (continuous across lines)
    const totalOutputsNeeded = Math.ceil(totalModules / effectiveModulesPerOutput);

    // Calculate processors needed and distribute lines for straight cuts
    // Each processor handles complete lines only
    const modulesPerProcessorMax = proc.outputs * effectiveModulesPerOutput;
    const linesPerProcessorMax = Math.floor(modulesPerProcessorMax / lineSize);

    // Calculate minimum processors needed (must handle complete lines)
    let processorsNeeded = Math.ceil(numLines / linesPerProcessorMax);
    if (processorsNeeded === 0) processorsNeeded = 1;

    // Distribute lines evenly between processors for balanced load
    const baseLinesPerProc = Math.floor(numLines / processorsNeeded);
    const extraLines = numLines % processorsNeeded;

    // Build processor distribution with balanced outputs
    const processorDistribution = [];
    let lineIndex = 0;
    let globalOutputIndex = 0;

    for (let p = 0; p < processorsNeeded; p++) {
      // Distribute extra lines to later processors for better balance
      const linesForThisProc = baseLinesPerProc + (p >= processorsNeeded - extraLines ? 1 : 0);
      const modulesForThisProc = linesForThisProc * lineSize;
      const outputsForThisProc = Math.ceil(modulesForThisProc / effectiveModulesPerOutput);

      processorDistribution.push({
        processorIndex: p + 1,
        startLine: lineIndex,
        endLine: lineIndex + linesForThisProc - 1,
        linesCount: linesForThisProc,
        outputsUsed: outputsForThisProc,
        modulesCount: modulesForThisProc,
        startOutputIndex: globalOutputIndex
      });

      lineIndex += linesForThisProc;
      globalOutputIndex += outputsForThisProc;
    }

    const totalOutputsAvailable = processorsNeeded * proc.outputs;

    // Build serpentine path for the entire screen
    const buildSerpentinePath = () => {
      const path = [];
      for (let line = 0; line < numLines; line++) {
        // Determine direction based on line number and start direction
        const isEvenLine = line % 2 === 0;
        const goForward = isReverseStart ? !isEvenLine : isEvenLine;

        for (let pos = 0; pos < lineSize; pos++) {
          const actualPos = goForward ? pos : (lineSize - 1 - pos);
          if (isHorizontal) {
            path.push({ row: line, col: actualPos, lineIndex: line });
          } else {
            path.push({ row: actualPos, col: line, lineIndex: line });
          }
        }
      }
      return path;
    };

    const serpentinePath = buildSerpentinePath();

    // Build output groups following serpentine within each processor's lines
    const outputGroups = [];

    for (let procIdx = 0; procIdx < processorDistribution.length; procIdx++) {
      const procDist = processorDistribution[procIdx];

      // Get all modules for this processor (complete lines only)
      const procModules = serpentinePath.filter(
        m => m.lineIndex >= procDist.startLine && m.lineIndex <= procDist.endLine
      );

      // Split into outputs (serpentine continuous within processor)
      let localOutputIndex = 0;
      for (let i = 0; i < procModules.length; i += effectiveModulesPerOutput) {
        const group = procModules.slice(i, i + effectiveModulesPerOutput).map(m => ({
          row: m.row,
          col: m.col
        }));

        outputGroups.push({
          modules: group,
          outputIndex: procDist.startOutputIndex + localOutputIndex,
          processorIndex: procIdx,
          localOutputIndex: localOutputIndex + 1 // 1-based for display
        });
        localOutputIndex++;
      }
    }

    // Balanced distribution of modules per output
    const modulesPerOutputBalanced = Math.ceil(totalModules / totalOutputsNeeded);

    // Check processor sufficiency
    const pixelsSufficient = totalPixels <= proc.totalPixels * processorsNeeded;
    const outputsSufficient = totalOutputsNeeded <= proc.outputs;
    const widthSufficient = !proc.maxWidth || resolutionW <= proc.maxWidth;
    const heightSufficient = !proc.maxHeight || resolutionH <= proc.maxHeight;
    const singleProcessorSufficient = totalOutputsNeeded <= proc.outputs && totalPixels <= proc.totalPixels;

    // Find best alternative processor
    let recommendedProcessor = null;
    let recommendedProcessorCount = null;
    const sortedProcessors = Object.values(processors).sort((a, b) => a.outputs - b.outputs);

    for (const p of sortedProcessors) {
      if (p.id === proc.id) continue;
      const pPixelsPerOutput = Math.floor(p.totalPixels / p.outputs);
      let pCalcModules = Math.floor(pPixelsPerOutput / pixelsPerModule);
      if (pCalcModules === 0) pCalcModules = 1;
      const pEffective = p.maxModulesPerOutput ? Math.min(pCalcModules, p.maxModulesPerOutput) : pCalcModules;
      const pModulesPerProcMax = p.outputs * pEffective;
      const pLinesPerProcMax = Math.floor(pModulesPerProcMax / lineSize);
      let pProcessorsNeeded = Math.ceil(numLines / pLinesPerProcMax);
      if (pProcessorsNeeded === 0) pProcessorsNeeded = 1;

      const pWidthOk = !p.maxWidth || resolutionW <= p.maxWidth;
      const pHeightOk = !p.maxHeight || resolutionH <= p.maxHeight;

      if (pWidthOk && pHeightOk && totalPixels <= p.totalPixels * pProcessorsNeeded) {
        if (!recommendedProcessor || pProcessorsNeeded < recommendedProcessorCount ||
            (pProcessorsNeeded === recommendedProcessorCount && p.outputs < recommendedProcessor.outputs)) {
          recommendedProcessor = p;
          recommendedProcessorCount = pProcessorsNeeded;
        }
      }
    }

    // Weight and power calculations
    const areaM2 = (finalWidthCm * finalHeightCm) / 10000;
    const totalWeight = totalModules * (mod.weight || 0);
    const totalPower = areaM2 * (mod.power || 0);
    const totalAmps220 = totalPower / 220;
    const totalAmps110 = totalPower / 110;

    // Rigging
    const hangingPointsTotal = finalWidthModules * (mod.hangingPoints || 2);
    const weightPerHangingPoint = totalWeight / hangingPointsTotal;
    const safeWorkingLoad = weightPerHangingPoint * 2;

    // Pitch and viewing distance
    const pitchMm = (mod.width * 10) / mod.pixelsW;
    const minViewingDistance = pitchMm * 1.5;
    const maxViewingDistance = pitchMm * 3;

    return {
      // Dimensions
      finalWidthModules, finalHeightModules, finalWidthCm, finalHeightCm,
      widthM: (finalWidthCm / 100).toFixed(2),
      heightM: (finalHeightCm / 100).toFixed(2),
      totalModules, areaM2: areaM2.toFixed(2),

      // Resolution
      resolutionW, resolutionH, totalPixels,
      megapixels: (totalPixels / 1000000).toFixed(2),
      pixelsPerModule, pixelDensity: Math.round(totalPixels / areaM2),
      pitchMm: pitchMm.toFixed(1),
      minViewingDistance: minViewingDistance.toFixed(1),
      maxViewingDistance: maxViewingDistance.toFixed(1),

      // Aspect ratio
      aspectRatio: aspectRatio.toFixed(2), closestRatio,
      contentW, contentH, letterbox, pillarbox,

      // Processing
      pixelsPerOutput, calculatedModulesPerOutput, effectiveModulesPerOutput,
      totalOutputsNeeded, processorsNeeded, totalOutputsAvailable,
      processorDistribution, outputGroups,
      singleProcessorSufficient, pixelsSufficient, widthSufficient, heightSufficient,
      recommendedProcessor, recommendedProcessorCount,
      modulesPerOutputBalanced,

      // Cabling
      utpInputs: totalOutputsNeeded,
      utpBridges: totalModules - totalOutputsNeeded,

      // Weight and Power
      totalWeight, totalPower,
      totalAmps220: totalAmps220.toFixed(1),
      totalAmps110: totalAmps110.toFixed(1),

      // Rigging
      hangingPointsTotal,
      weightPerHangingPoint: weightPerHangingPoint.toFixed(1),
      safeWorkingLoad: safeWorkingLoad.toFixed(1),

      // References
      module: mod, processor: proc,
      isHorizontal, lineSize, numLines
    };
  };

  const results = calculate();

  // ==================== PIXEL MAP GENERATION ====================
  const generatePixelMap = () => {
    if (!results || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { resolutionW, resolutionH, finalWidthModules, finalHeightModules,
            outputGroups, processorDistribution, isHorizontal } = results;
    const mod = modules[selectedModule];

    canvas.width = resolutionW;
    canvas.height = resolutionH;

    // Draw modules with processor-based colors
    outputGroups.forEach((group) => {
      const procColors = PROCESSOR_COLORS[group.processorIndex % PROCESSOR_COLORS.length];

      group.modules.forEach((pos, idx) => {
        const x = pos.col * mod.pixelsW;
        const y = pos.row * mod.pixelsH;

        // Alternate colors within processor
        const colorIndex = (pos.row + pos.col) % 2;
        ctx.fillStyle = colorIndex === 0 ? procColors.primary : procColors.secondary;
        ctx.fillRect(x, y, mod.pixelsW, mod.pixelsH);

        // Border
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = Math.max(2, Math.min(mod.pixelsW, mod.pixelsH) / 50);
        ctx.strokeRect(x, y, mod.pixelsW, mod.pixelsH);
      });
    });

    // Draw subtle divider lines between processors
    if (processorDistribution.length > 1) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = Math.max(4, Math.min(mod.pixelsW, mod.pixelsH) / 20);
      ctx.setLineDash([10, 10]);

      for (let i = 0; i < processorDistribution.length - 1; i++) {
        const dist = processorDistribution[i];
        if (isHorizontal) {
          const y = (dist.endLine + 1) * mod.pixelsH;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(resolutionW, y);
          ctx.stroke();
        } else {
          const x = (dist.endLine + 1) * mod.pixelsW;
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, resolutionH);
          ctx.stroke();
        }
      }
      ctx.setLineDash([]);
    }

    // Draw wiring arrows
    const arrowSize = Math.min(mod.pixelsW, mod.pixelsH) / 6;
    ctx.fillStyle = '#000000';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = Math.max(2, arrowSize / 4);

    outputGroups.forEach((group) => {
      for (let i = 0; i < group.modules.length - 1; i++) {
        const pos = group.modules[i];
        const nextPos = group.modules[i + 1];
        const x = pos.col * mod.pixelsW + mod.pixelsW / 2;
        const y = pos.row * mod.pixelsH + mod.pixelsH / 2;
        const nextX = nextPos.col * mod.pixelsW + mod.pixelsW / 2;
        const nextY = nextPos.row * mod.pixelsH + mod.pixelsH / 2;

        const angle = Math.atan2(nextY - y, nextX - x);
        const midX = (x + nextX) / 2;
        const midY = (y + nextY) / 2;

        ctx.beginPath();
        ctx.moveTo(midX + arrowSize * Math.cos(angle), midY + arrowSize * Math.sin(angle));
        ctx.lineTo(midX - arrowSize * 0.5 * Math.cos(angle - Math.PI / 6), midY - arrowSize * 0.5 * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(midX - arrowSize * 0.5 * Math.cos(angle + Math.PI / 6), midY - arrowSize * 0.5 * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fill();
      }
    });

    // Draw output numbers
    outputGroups.forEach((group) => {
      if (group.modules.length === 0) return;
      const firstPos = group.modules[0];
      const x = firstPos.col * mod.pixelsW;
      const y = firstPos.row * mod.pixelsH + mod.pixelsH;

      const circleRadius = Math.min(mod.pixelsW, mod.pixelsH) / 4;
      const circleX = x + circleRadius + 5;
      const circleY = y - circleRadius - 5;

      const procColors = PROCESSOR_COLORS[group.processorIndex % PROCESSOR_COLORS.length];

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(circleX, circleY, circleRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = procColors.primary;
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#000000';
      ctx.font = `bold ${circleRadius}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(groupIndexStart + group.outputIndex), circleX, circleY);
    });

    // Draw project name
    const centerX = resolutionW / 2;
    const centerY = resolutionH / 2;
    const fontSize = Math.min(mod.pixelsW * 0.8, resolutionW / 15);

    ctx.font = `bold ${fontSize}px Arial`;
    const textMetrics = ctx.measureText(projectName);
    const textWidth = textMetrics.width + 20;
    const textHeight = fontSize * 1.5;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(centerX - textWidth / 2, centerY - textHeight / 2, textWidth, textHeight);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(centerX - textWidth / 2, centerY - textHeight / 2, textWidth, textHeight);

    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(projectName, centerX, centerY);

    // Draw processor legend
    if (processorDistribution.length > 1) {
      const legendY = 20;
      const legendHeight = 25;
      let legendX = 20;

      processorDistribution.forEach((dist, idx) => {
        const procColors = PROCESSOR_COLORS[idx % PROCESSOR_COLORS.length];
        const label = `Proc ${idx + 1}`;

        ctx.fillStyle = procColors.primary;
        ctx.fillRect(legendX, legendY, 20, legendHeight);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.strokeRect(legendX, legendY, 20, legendHeight);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, legendX + 25, legendY + legendHeight / 2);

        legendX += 80;
      });
    }

    // Draw info bar
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

    const line1 = `${finalWidthModules}×${finalHeightModules} panels (${results.totalModules} total) • ${resolutionW}×${resolutionH}px • ${results.processorsNeeded} procesador(es)`;
    ctx.fillText(line1, resolutionW / 2, resolutionH - infoHeight + infoFontSize);

    const line2 = `${results.widthM}m × ${results.heightM}m • ${mod.name} • P${results.pitchMm}`;
    ctx.fillText(line2, resolutionW / 2, resolutionH - infoFontSize);
  };

  const downloadPixelMap = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `pixelmap_${results.resolutionW}x${results.resolutionH}_${projectName.replace(/\s+/g, '_')}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  useEffect(() => {
    if (activeTab === 'pixelmap' && results) {
      generatePixelMap();
    }
  }, [activeTab, results, selectedModule, wiringPattern, colorScheme, projectName, groupIndexStart]);

  // ==================== MODULE FUNCTIONS ====================
  const addModule = () => {
    if (!newModule.name || !newModule.pixelsW || !newModule.pixelsH || !newModule.width || !newModule.height) {
      alert('Complete los campos requeridos');
      return;
    }
    const id = generateSlug(newModule.name);
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
    setNewModule({ name: '', description: '', pixelsW: '', pixelsH: '', width: '', height: '', weight: '', power: '', hangingPoints: '' });
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

  const deleteModule = (id) => {
    if (Object.keys(modules).length <= 1) {
      alert('Debe mantener al menos un módulo');
      return;
    }
    if (!window.confirm('¿Eliminar este módulo?')) return;
    setModules(prev => {
      const { [id]: removed, ...rest } = prev;
      return rest;
    });
    if (selectedModule === id) {
      setSelectedModule(Object.keys(modules).filter(k => k !== id)[0]);
    }
  };

  // ==================== PROCESSOR FUNCTIONS ====================
  const getMaxModulesOptions = (proc) => {
    if (!proc || !modules[selectedModule]) return [];
    const mod = modules[selectedModule];
    const pixelsPerOutput = Math.floor(proc.totalPixels / proc.outputs);
    const pixelsPerModule = mod.pixelsW * mod.pixelsH;
    const maxByPixels = Math.floor(pixelsPerOutput / pixelsPerModule);
    const max = Math.max(1, maxByPixels);
    return Array.from({ length: max }, (_, i) => max - i);
  };

  const addProcessor = () => {
    if (!newProcessor.model || !newProcessor.outputs || !newProcessor.totalPixels) {
      alert('Complete los campos requeridos');
      return;
    }
    const id = generateSlug(`${newProcessor.brand}-${newProcessor.model}`);
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
        maxHeight: parseInt(newProcessor.maxHeight) || 0,
        maxModulesPerOutput: newProcessor.maxModulesPerOutput ? parseInt(newProcessor.maxModulesPerOutput) : null
      }
    }));
    setNewProcessor({ brand: '', model: '', description: '', outputs: '', totalPixels: '', maxWidth: '', maxHeight: '', maxModulesPerOutput: '' });
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
        maxHeight: parseInt(editProcessor.maxHeight) || 0,
        maxModulesPerOutput: editProcessor.maxModulesPerOutput ? parseInt(editProcessor.maxModulesPerOutput) : null
      }
    }));
    setEditingProcessorId(null);
    setEditProcessor(null);
  };

  const deleteProcessor = (id) => {
    if (Object.keys(processors).length <= 1) {
      alert('Debe mantener al menos un procesador');
      return;
    }
    if (!window.confirm('¿Eliminar este procesador?')) return;
    setProcessors(prev => {
      const { [id]: removed, ...rest } = prev;
      return rest;
    });
    if (selectedProcessor === id) {
      setSelectedProcessor(Object.keys(processors).filter(k => k !== id)[0]);
    }
  };

  // ==================== EXPORT/IMPORT ====================
  const exportConfig = () => {
    const config = { modules, processors, projects };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.download = 'led-designer-config.json';
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
        if (config.modules) setModules({ ...DEFAULT_MODULES, ...config.modules });
        if (config.processors) setProcessors({ ...DEFAULT_PROCESSORS, ...config.processors });
        if (config.projects) setProjects(config.projects);
      } catch (err) {
        alert('Error al importar configuración');
      }
    };
    reader.readAsText(file);
  };

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
Estándar más cercano: ${results.closestRatio.name}
${results.letterbox > 0 ? `Letterbox: ${results.letterbox}px` : ''}
${results.pillarbox > 0 ? `Pillarbox: ${results.pillarbox}px` : ''}

EQUIPAMIENTO
------------
Procesador: ${results.processor.brand} ${results.processor.model}
Cantidad de procesadores: ${results.processorsNeeded}

PESO Y CONSUMO
--------------
Peso total: ${results.totalWeight} kg
Consumo eléctrico: ${Math.round(results.totalPower)} W
Amperaje: ${results.totalAmps220}A @220V / ${results.totalAmps110}A @110V

---
Calculadora para Pantallas LED - Euforía Técnica y Logística
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
Dimensiones módulo: ${results.module.width}cm × ${results.module.height}cm
Resolución módulo: ${results.module.pixelsW} × ${results.module.pixelsH} px
Pixel Pitch: P${results.pitchMm}

Configuración: ${results.finalWidthModules} × ${results.finalHeightModules} módulos
Total módulos: ${results.totalModules}
Dimensión total: ${results.widthM}m × ${results.heightM}m
Resolución total: ${results.resolutionW} × ${results.resolutionH} px

PROCESAMIENTO
-------------
Procesador: ${results.processor.brand} ${results.processor.model}
Procesadores necesarios: ${results.processorsNeeded}
Outputs totales utilizados: ${results.totalOutputsNeeded}
Módulos por output (balanceado): ~${results.modulesPerOutputBalanced}

Distribución por procesador:
${results.processorDistribution.map(d =>
  `  Procesador ${d.processorIndex}: ${d.linesCount} líneas, ${d.outputsUsed} outputs, ${d.modulesCount} módulos`
).join('\n')}

${!results.singleProcessorSufficient && results.recommendedProcessor ?
`ALTERNATIVA RECOMENDADA
-----------------------
${results.recommendedProcessor.brand} ${results.recommendedProcessor.model}
Cantidad necesaria: ${results.recommendedProcessorCount}
` : ''}

CABLEADO UTP
------------
Patrón: ${wiringPattern}
Cables de entrada: ${results.utpInputs}
Puentes entre módulos: ${results.utpBridges}
Total cables: ${results.utpInputs + results.utpBridges}

RIGGING
-------
Puntos de colgado: ${results.hangingPointsTotal}
Carga por punto: ${results.weightPerHangingPoint} kg
SWL (2:1): ${results.safeWorkingLoad} kg/punto

---
Calculadora para Pantallas LED - Euforía Técnica y Logística
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
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl font-bold text-center">Calculadora para Pantallas LED</h1>
          <p className="text-xs text-gray-400 text-center">by Euforía Técnica y Logística para Eventos</p>

          {/* Project Selector */}
          <div className="mt-3 relative">
            <button
              onClick={() => setShowProjectMenu(!showProjectMenu)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <FolderOpen size={16} />
                <span className="font-medium">{projectName}</span>
              </span>
              <ChevronDown size={16} />
            </button>

            {showProjectMenu && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded shadow-lg z-50">
                <div className="p-2 border-b border-gray-700">
                  <button
                    onClick={createNewProject}
                    className="w-full text-left px-3 py-2 hover:bg-gray-700 rounded flex items-center gap-2"
                  >
                    <Plus size={16} /> Nuevo Proyecto
                  </button>
                  <button
                    onClick={duplicateProject}
                    className="w-full text-left px-3 py-2 hover:bg-gray-700 rounded flex items-center gap-2"
                  >
                    <Copy size={16} /> Duplicar Actual
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {Object.values(projects).map(proj => (
                    <div
                      key={proj.id}
                      className={`px-3 py-2 flex items-center justify-between hover:bg-gray-700 ${
                        proj.id === activeProjectId ? 'bg-blue-900/30' : ''
                      }`}
                    >
                      <button
                        onClick={() => { loadProject(proj); setShowProjectMenu(false); }}
                        className="flex-1 text-left"
                      >
                        {proj.name}
                      </button>
                      {Object.keys(projects).length > 1 && (
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteProject(proj.id); }}
                          className="text-red-400 hover:text-red-300 p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
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
          Config
        </button>
      </div>

      {/* Content */}
      <div className="p-4 max-w-4xl mx-auto">
        {/* ==================== CALCULATOR TAB ==================== */}
        {activeTab === 'calculator' && (
          <div className="space-y-4">
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
                      {mod.name} ({mod.width}×{mod.height}cm)
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
                    className={`flex-1 py-2 rounded ${inputMode === 'modules' ? 'bg-blue-600' : 'bg-gray-700'}`}
                  >
                    Módulos
                  </button>
                  <button
                    onClick={() => setInputMode('cm')}
                    className={`flex-1 py-2 rounded ${inputMode === 'cm' ? 'bg-blue-600' : 'bg-gray-700'}`}
                  >
                    Centímetros
                  </button>
                </div>
              </div>

              {/* Dimensions */}
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
                      {proc.brand} {proc.model} ({proc.outputs} out)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Results */}
            {results && (
              <>
                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-gray-400">Dimensiones</p>
                    <p className="text-lg font-bold">{results.widthM}m × {results.heightM}m</p>
                    <p className="text-xs text-gray-500">{results.totalModules} módulos • {results.areaM2} m²</p>
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
                    <p className="text-xs text-gray-400">Peso Total</p>
                    <p className="text-lg font-bold">{results.totalWeight} kg</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-gray-400">Consumo</p>
                    <p className="text-lg font-bold">{Math.round(results.totalPower)} W</p>
                    <p className="text-xs text-gray-500">{results.totalAmps220}A @220V</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-gray-400">Rigging</p>
                    <p className="text-lg font-bold">{results.hangingPointsTotal} pts</p>
                    <p className="text-xs text-gray-500">SWL: {results.safeWorkingLoad}kg</p>
                  </div>
                </div>

                {/* Processor Status */}
                <div className={`rounded-lg p-4 ${
                  results.singleProcessorSufficient
                    ? 'bg-green-900/30 border border-green-600'
                    : 'bg-yellow-900/30 border border-yellow-600'
                }`}>
                  <h3 className="font-semibold mb-2">
                    {results.singleProcessorSufficient ? '✓ 1 Procesador Suficiente' : `⚠ Se requieren ${results.processorsNeeded} procesadores`}
                  </h3>
                  <p className="text-sm">
                    {results.processor.brand} {results.processor.model}: {results.totalOutputsNeeded} outputs necesarios
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    ~{results.modulesPerOutputBalanced} módulos/output (máx configurado: {results.effectiveModulesPerOutput})
                  </p>

                  {results.processorsNeeded > 1 && (
                    <div className="mt-3 pt-3 border-t border-gray-600">
                      <p className="text-sm font-medium mb-2">Distribución:</p>
                      {results.processorDistribution.map((dist, idx) => (
                        <p key={idx} className="text-xs text-gray-300">
                          Procesador {dist.processorIndex}: {dist.linesCount} líneas, {dist.outputsUsed} outputs, {dist.modulesCount} módulos
                        </p>
                      ))}
                    </div>
                  )}

                  {results.recommendedProcessor && (
                    <div className="mt-3 pt-3 border-t border-gray-600">
                      <p className="text-sm text-cyan-400">
                        Alternativa: {results.recommendedProcessorCount}× {results.recommendedProcessor.brand} {results.recommendedProcessor.model}
                      </p>
                    </div>
                  )}
                </div>

                {/* UTP Cabling */}
                <div className="bg-cyan-900/30 border border-cyan-600 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Cableado UTP</h3>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <p>Entradas: <strong>{results.utpInputs}</strong></p>
                    <p>Puentes: <strong>{results.utpBridges}</strong></p>
                    <p>Total: <strong>{results.utpInputs + results.utpBridges}</strong></p>
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
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-4">Opciones de Pixel Map</h2>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Patrón de cableado</label>
                  <select
                    value={wiringPattern}
                    onChange={(e) => setWiringPattern(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                  >
                    <option value="horizontal-right">Horizontal → (inicio izq)</option>
                    <option value="horizontal-left">Horizontal ← (inicio der)</option>
                    <option value="vertical-down">Vertical ↓ (inicio arriba)</option>
                    <option value="vertical-up">Vertical ↑ (inicio abajo)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Grupo inicial</label>
                  <input
                    type="number"
                    value={groupIndexStart}
                    onChange={(e) => setGroupIndexStart(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                    min="1"
                  />
                </div>
              </div>

              <p className="text-sm text-gray-400">
                {results.resolutionW}×{results.resolutionH}px | {results.processorsNeeded} procesador(es) | {results.outputGroups.length} outputs
              </p>
            </div>

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
              Descargar PNG
            </button>
          </div>
        )}

        {/* ==================== CONFIG TAB ==================== */}
        {activeTab === 'config' && (
          <div className="space-y-6">
            {/* Project Settings */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-3">Proyecto</h2>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                placeholder="Nombre del proyecto"
              />
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
                  Exportar Todo
                </button>
                <label className="flex-1 bg-gray-600 hover:bg-gray-500 py-2 px-4 rounded flex items-center justify-center gap-2 cursor-pointer">
                  <Upload size={18} />
                  Importar
                  <input type="file" accept=".json" onChange={importConfig} className="hidden" />
                </label>
              </div>
            </div>

            {/* Modules Config */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-3">Módulos LED</h2>

              <div className="space-y-2 mb-4">
                {Object.values(modules).map(mod => (
                  <div key={mod.id} className="bg-gray-700 rounded p-3">
                    {editingModuleId === mod.id ? (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            value={editModule.name}
                            onChange={(e) => setEditModule(prev => ({ ...prev, name: e.target.value }))}
                            className="bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm"
                            placeholder="Nombre *"
                          />
                          <input
                            value={editModule.description}
                            onChange={(e) => setEditModule(prev => ({ ...prev, description: e.target.value }))}
                            className="bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm"
                            placeholder="Descripción"
                          />
                          <input
                            type="number"
                            value={editModule.pixelsW}
                            onChange={(e) => setEditModule(prev => ({ ...prev, pixelsW: e.target.value }))}
                            className="bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm"
                            placeholder="Px ancho *"
                          />
                          <input
                            type="number"
                            value={editModule.pixelsH}
                            onChange={(e) => setEditModule(prev => ({ ...prev, pixelsH: e.target.value }))}
                            className="bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm"
                            placeholder="Px alto *"
                          />
                          <input
                            type="number"
                            value={editModule.width}
                            onChange={(e) => setEditModule(prev => ({ ...prev, width: e.target.value }))}
                            className="bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm"
                            placeholder="Ancho cm *"
                          />
                          <input
                            type="number"
                            value={editModule.height}
                            onChange={(e) => setEditModule(prev => ({ ...prev, height: e.target.value }))}
                            className="bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm"
                            placeholder="Alto cm *"
                          />
                          <input
                            type="number"
                            value={editModule.weight}
                            onChange={(e) => setEditModule(prev => ({ ...prev, weight: e.target.value }))}
                            className="bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm"
                            placeholder="Peso kg"
                          />
                          <input
                            type="number"
                            value={editModule.power}
                            onChange={(e) => setEditModule(prev => ({ ...prev, power: e.target.value }))}
                            className="bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm"
                            placeholder="W/m²"
                          />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => { setEditingModuleId(null); setEditModule(null); }} className="p-1 text-gray-400 hover:text-white">
                            <X size={18} />
                          </button>
                          <button onClick={saveEditModule} className="p-1 text-green-400 hover:text-green-300">
                            <Check size={18} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{mod.name}</p>
                          <p className="text-xs text-gray-400">
                            {mod.width}×{mod.height}cm | {mod.pixelsW}×{mod.pixelsH}px
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => startEditModule(mod)} className="text-blue-400 hover:text-blue-300 p-1">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => deleteModule(mod.id)} className="text-red-400 hover:text-red-300 p-1">
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
                  <input
                    value={newModule.name}
                    onChange={(e) => setNewModule(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm"
                    placeholder="Nombre *"
                  />
                  <input
                    value={newModule.description}
                    onChange={(e) => setNewModule(prev => ({ ...prev, description: e.target.value }))}
                    className="bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm"
                    placeholder="Descripción"
                  />
                  <input
                    type="number"
                    value={newModule.pixelsW}
                    onChange={(e) => setNewModule(prev => ({ ...prev, pixelsW: e.target.value }))}
                    className="bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm"
                    placeholder="Píxeles ancho *"
                  />
                  <input
                    type="number"
                    value={newModule.pixelsH}
                    onChange={(e) => setNewModule(prev => ({ ...prev, pixelsH: e.target.value }))}
                    className="bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm"
                    placeholder="Píxeles alto *"
                  />
                  <input
                    type="number"
                    value={newModule.width}
                    onChange={(e) => setNewModule(prev => ({ ...prev, width: e.target.value }))}
                    className="bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm"
                    placeholder="Ancho cm *"
                  />
                  <input
                    type="number"
                    value={newModule.height}
                    onChange={(e) => setNewModule(prev => ({ ...prev, height: e.target.value }))}
                    className="bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm"
                    placeholder="Alto cm *"
                  />
                  <input
                    type="number"
                    value={newModule.weight}
                    onChange={(e) => setNewModule(prev => ({ ...prev, weight: e.target.value }))}
                    className="bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm"
                    placeholder="Peso kg"
                  />
                  <input
                    type="number"
                    value={newModule.power}
                    onChange={(e) => setNewModule(prev => ({ ...prev, power: e.target.value }))}
                    className="bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm"
                    placeholder="W/m²"
                  />
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

              <div className="space-y-2 mb-4">
                {Object.values(processors).map(proc => {
                  const maxOptions = getMaxModulesOptions(proc);
                  return (
                    <div key={proc.id} className="bg-gray-700 rounded p-3">
                      {editingProcessorId === proc.id ? (
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              value={editProcessor.brand}
                              onChange={(e) => setEditProcessor(prev => ({ ...prev, brand: e.target.value }))}
                              className="bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm"
                              placeholder="Marca"
                            />
                            <input
                              value={editProcessor.model}
                              onChange={(e) => setEditProcessor(prev => ({ ...prev, model: e.target.value }))}
                              className="bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm"
                              placeholder="Modelo *"
                            />
                            <input
                              type="number"
                              value={editProcessor.outputs}
                              onChange={(e) => setEditProcessor(prev => ({ ...prev, outputs: e.target.value }))}
                              className="bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm"
                              placeholder="Outputs *"
                            />
                            <input
                              type="number"
                              value={editProcessor.totalPixels}
                              onChange={(e) => setEditProcessor(prev => ({ ...prev, totalPixels: e.target.value }))}
                              className="bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm"
                              placeholder="Total píxeles *"
                            />
                            <input
                              type="number"
                              value={editProcessor.maxWidth || ''}
                              onChange={(e) => setEditProcessor(prev => ({ ...prev, maxWidth: e.target.value }))}
                              className="bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm"
                              placeholder="Max ancho px"
                            />
                            <input
                              type="number"
                              value={editProcessor.maxHeight || ''}
                              onChange={(e) => setEditProcessor(prev => ({ ...prev, maxHeight: e.target.value }))}
                              className="bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm"
                              placeholder="Max alto px"
                            />
                            <div className="col-span-2">
                              <label className="block text-xs text-gray-400 mb-1">Máx módulos/output (límite de seguridad)</label>
                              <select
                                value={editProcessor.maxModulesPerOutput || ''}
                                onChange={(e) => setEditProcessor(prev => ({ ...prev, maxModulesPerOutput: e.target.value }))}
                                className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm"
                              >
                                <option value="">Sin límite (usar cálculo)</option>
                                {maxOptions.map(n => (
                                  <option key={n} value={n}>{n} módulos</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => { setEditingProcessorId(null); setEditProcessor(null); }} className="p-1 text-gray-400 hover:text-white">
                              <X size={18} />
                            </button>
                            <button onClick={saveEditProcessor} className="p-1 text-green-400 hover:text-green-300">
                              <Check size={18} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{proc.brand} {proc.model}</p>
                            <p className="text-xs text-gray-400">
                              {proc.outputs} out | {(proc.totalPixels / 1000000).toFixed(1)}MP
                              {proc.maxModulesPerOutput ? ` | máx ${proc.maxModulesPerOutput} mod/out` : ''}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <button onClick={() => startEditProcessor(proc)} className="text-blue-400 hover:text-blue-300 p-1">
                              <Edit2 size={16} />
                            </button>
                            <button onClick={() => deleteProcessor(proc.id)} className="text-red-400 hover:text-red-300 p-1">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Add new processor */}
              <div className="border-t border-gray-600 pt-4">
                <h3 className="text-sm font-semibold mb-3">Agregar procesador</h3>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <input
                    value={newProcessor.brand}
                    onChange={(e) => setNewProcessor(prev => ({ ...prev, brand: e.target.value }))}
                    className="bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm"
                    placeholder="Marca"
                  />
                  <input
                    value={newProcessor.model}
                    onChange={(e) => setNewProcessor(prev => ({ ...prev, model: e.target.value }))}
                    className="bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm"
                    placeholder="Modelo *"
                  />
                  <input
                    type="number"
                    value={newProcessor.outputs}
                    onChange={(e) => setNewProcessor(prev => ({ ...prev, outputs: e.target.value }))}
                    className="bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm"
                    placeholder="Outputs UTP *"
                  />
                  <input
                    type="number"
                    value={newProcessor.totalPixels}
                    onChange={(e) => setNewProcessor(prev => ({ ...prev, totalPixels: e.target.value }))}
                    className="bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm"
                    placeholder="Píxeles totales *"
                  />
                  <input
                    type="number"
                    value={newProcessor.maxWidth}
                    onChange={(e) => setNewProcessor(prev => ({ ...prev, maxWidth: e.target.value }))}
                    className="bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm"
                    placeholder="Max ancho px"
                  />
                  <input
                    type="number"
                    value={newProcessor.maxHeight}
                    onChange={(e) => setNewProcessor(prev => ({ ...prev, maxHeight: e.target.value }))}
                    className="bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm"
                    placeholder="Max alto px"
                  />
                </div>
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
