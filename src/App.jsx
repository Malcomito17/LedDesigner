import React, { useState, useEffect, useRef } from 'react';
import { Calculator, Grid, Settings, Download, Plus, Trash2, Save, Upload, Edit2, X, Check, Copy, FolderOpen, ChevronDown } from 'lucide-react';
import { jsPDF } from 'jspdf';

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
    hangingPoints: 2,
    brightness: 1200,
    refreshRate: 3840,
    ipRating: 'IP20',
    viewingAngleH: 160,
    viewingAngleV: 140,
    minCurveRadius: null,
    modulesPerCase: 6
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
    hangingPoints: 2,
    brightness: 5500,
    refreshRate: 3840,
    ipRating: 'IP65',
    viewingAngleH: 160,
    viewingAngleV: 140,
    minCurveRadius: 1,
    modulesPerCase: 8
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
    maxModulesPerOutput: null,
    maxInputResolution: '1080p',
    layers: 1,
    hasGenlock: false,
    hasBackupInput: false
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
    maxModulesPerOutput: null,
    maxInputResolution: '4K',
    layers: 2,
    hasGenlock: true,
    hasBackupInput: true
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
    maxModulesPerOutput: null,
    maxInputResolution: '4K',
    layers: 4,
    hasGenlock: true,
    hasBackupInput: true
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
    maxModulesPerOutput: null,
    maxInputResolution: '1080p',
    layers: 1,
    hasGenlock: false,
    hasBackupInput: false
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
    maxModulesPerOutput: null,
    maxInputResolution: '1080p',
    layers: 1,
    hasGenlock: true,
    hasBackupInput: false
  },

  // ---- NovaStar All-in-One Controllers ----
  'vx400': {
    id: 'vx400',
    brand: 'NovaStar',
    model: 'VX400',
    description: 'Controlador all-in-one entry level con fibra óptica',
    outputs: 4,
    totalPixels: 2600000,
    maxWidth: 10240,
    maxHeight: 8192,
    maxModulesPerOutput: null,
    maxInputResolution: '1080p',
    layers: 2,
    hasGenlock: false,
    hasBackupInput: true
  },
  'vx16s': {
    id: 'vx16s',
    brand: 'NovaStar',
    model: 'VX16s',
    description: 'Controlador all-in-one alta capacidad 4K',
    outputs: 16,
    totalPixels: 10400000,
    maxWidth: 16384,
    maxHeight: 8192,
    maxModulesPerOutput: null,
    maxInputResolution: '4K',
    layers: 3,
    hasGenlock: true,
    hasBackupInput: true
  },
  'novapro-uhd-jr': {
    id: 'novapro-uhd-jr',
    brand: 'NovaStar',
    model: 'NovaPro UHD Jr',
    description: 'Procesador profesional 4K, 16 puertos + fibra',
    outputs: 16,
    totalPixels: 10400000,
    maxWidth: 16384,
    maxHeight: 8192,
    maxModulesPerOutput: null,
    maxInputResolution: '4K',
    layers: 4,
    hasGenlock: true,
    hasBackupInput: true
  },
  'cx40-pro': {
    id: 'cx40-pro',
    brand: 'NovaStar',
    model: 'CX40 Pro',
    description: 'COEX controller next-gen, HDR10, sub-1ms latencia',
    outputs: 6,
    totalPixels: 9000000,
    maxWidth: 16384,
    maxHeight: 16384,
    maxModulesPerOutput: null,
    maxInputResolution: '4K',
    layers: 4,
    hasGenlock: true,
    hasBackupInput: true
  },
  'cx80-pro': {
    id: 'cx80-pro',
    brand: 'NovaStar',
    model: 'CX80 Pro',
    description: 'COEX flagship 8K, modular, hasta 20 unidades cascada',
    outputs: 16,
    totalPixels: 35389440,
    maxWidth: 32768,
    maxHeight: 32768,
    maxModulesPerOutput: null,
    maxInputResolution: '8K',
    layers: 4,
    hasGenlock: true,
    hasBackupInput: true
  },

  // ---- NovaStar Sending Cards / Boxes ----
  'mctrl300': {
    id: 'mctrl300',
    brand: 'NovaStar',
    model: 'MCTRL300',
    description: 'Sending box entry level, DVI',
    outputs: 2,
    totalPixels: 1300000,
    maxWidth: 3840,
    maxHeight: 3840,
    maxModulesPerOutput: null,
    maxInputResolution: '1080p',
    layers: 1,
    hasGenlock: false,
    hasBackupInput: true
  },
  'mctrl600': {
    id: 'mctrl600',
    brand: 'NovaStar',
    model: 'MCTRL600',
    description: 'Sending box mid-range, DVI + HDMI',
    outputs: 4,
    totalPixels: 2300000,
    maxWidth: 3840,
    maxHeight: 3840,
    maxModulesPerOutput: null,
    maxInputResolution: '1080p',
    layers: 1,
    hasGenlock: false,
    hasBackupInput: false
  },
  'mctrl660': {
    id: 'mctrl660',
    brand: 'NovaStar',
    model: 'MCTRL660',
    description: 'Sending box con circuito de backup mejorado',
    outputs: 4,
    totalPixels: 2600000,
    maxWidth: 3840,
    maxHeight: 3840,
    maxModulesPerOutput: null,
    maxInputResolution: '1080p',
    layers: 1,
    hasGenlock: false,
    hasBackupInput: false
  },
  'mctrl660-pro': {
    id: 'mctrl660-pro',
    brand: 'NovaStar',
    model: 'MCTRL660 PRO',
    description: 'Sending box profesional con genlock y fibra',
    outputs: 6,
    totalPixels: 2300000,
    maxWidth: 3840,
    maxHeight: 2560,
    maxModulesPerOutput: null,
    maxInputResolution: '1080p',
    layers: 1,
    hasGenlock: true,
    hasBackupInput: true
  },
  'mctrl700': {
    id: 'mctrl700',
    brand: 'NovaStar',
    model: 'MCTRL700',
    description: 'Sending box 6 puertos ethernet',
    outputs: 6,
    totalPixels: 2300000,
    maxWidth: 3840,
    maxHeight: 3840,
    maxModulesPerOutput: null,
    maxInputResolution: '1080p',
    layers: 1,
    hasGenlock: false,
    hasBackupInput: false
  },
  'mctrl4k': {
    id: 'mctrl4k',
    brand: 'NovaStar',
    model: 'MCTRL4K',
    description: 'Sending box flagship 4K, 16 puertos + fibra, HDR',
    outputs: 16,
    totalPixels: 8800000,
    maxWidth: 7680,
    maxHeight: 7680,
    maxModulesPerOutput: null,
    maxInputResolution: '4K',
    layers: 1,
    hasGenlock: true,
    hasBackupInput: true
  },
  'mctrl-r5': {
    id: 'mctrl-r5',
    brand: 'NovaStar',
    model: 'MCTRL R5',
    description: 'Sending box con rotación de imagen, 8 puertos + fibra',
    outputs: 8,
    totalPixels: 4140000,
    maxWidth: 3840,
    maxHeight: 3840,
    maxModulesPerOutput: null,
    maxInputResolution: '1080p',
    layers: 1,
    hasGenlock: false,
    hasBackupInput: false
  },

  // ---- Colorlight Controllers ----
  'colorlight-x1': {
    id: 'colorlight-x1',
    brand: 'Colorlight',
    model: 'X1',
    description: 'Controlador entry level, HDMI + DVI',
    outputs: 2,
    totalPixels: 1310000,
    maxWidth: 4096,
    maxHeight: 2560,
    maxModulesPerOutput: null,
    maxInputResolution: '1080p',
    layers: 1,
    hasGenlock: false,
    hasBackupInput: false
  },
  'colorlight-x4': {
    id: 'colorlight-x4',
    brand: 'Colorlight',
    model: 'X4',
    description: 'Controlador multi-input con PIP',
    outputs: 4,
    totalPixels: 2300000,
    maxWidth: 4096,
    maxHeight: 2560,
    maxModulesPerOutput: null,
    maxInputResolution: '1080p',
    layers: 1,
    hasGenlock: false,
    hasBackupInput: false
  },
  'colorlight-x8': {
    id: 'colorlight-x8',
    brand: 'Colorlight',
    model: 'X8',
    description: 'Controlador profesional 5 capas, 8 puertos',
    outputs: 8,
    totalPixels: 5000000,
    maxWidth: 8192,
    maxHeight: 8192,
    maxModulesPerOutput: null,
    maxInputResolution: '1080p',
    layers: 5,
    hasGenlock: false,
    hasBackupInput: false
  },
  'colorlight-x16': {
    id: 'colorlight-x16',
    brand: 'Colorlight',
    model: 'X16',
    description: 'Controlador 4K high-end, 7 capas, genlock',
    outputs: 16,
    totalPixels: 8880000,
    maxWidth: 8192,
    maxHeight: 8192,
    maxModulesPerOutput: null,
    maxInputResolution: '4K',
    layers: 7,
    hasGenlock: true,
    hasBackupInput: false
  },
  'colorlight-x20': {
    id: 'colorlight-x20',
    brand: 'Colorlight',
    model: 'X20',
    description: 'Controlador flagship 20 puertos + fibra, 4K',
    outputs: 20,
    totalPixels: 13000000,
    maxWidth: 16384,
    maxHeight: 8192,
    maxModulesPerOutput: null,
    maxInputResolution: '4K',
    layers: 6,
    hasGenlock: true,
    hasBackupInput: false
  },
  'colorlight-z6': {
    id: 'colorlight-z6',
    brand: 'Colorlight',
    model: 'Z6',
    description: 'Super controller all-in-one, HDR10, 4K',
    outputs: 16,
    totalPixels: 8300000,
    maxWidth: 8192,
    maxHeight: 4096,
    maxModulesPerOutput: null,
    maxInputResolution: '4K',
    layers: 3,
    hasGenlock: true,
    hasBackupInput: true
  },
  'colorlight-z8': {
    id: 'colorlight-z8',
    brand: 'Colorlight',
    model: 'Z8',
    description: 'Super controller flagship 8K, 5G ports + fibra',
    outputs: 16,
    totalPixels: 35380000,
    maxWidth: 16384,
    maxHeight: 8192,
    maxModulesPerOutput: null,
    maxInputResolution: '8K',
    layers: 4,
    hasGenlock: true,
    hasBackupInput: true
  },

  // ---- Colorlight Sending Cards / Boxes ----
  'colorlight-s2': {
    id: 'colorlight-s2',
    brand: 'Colorlight',
    model: 'S2',
    description: 'Sending card PCI-E entry level',
    outputs: 2,
    totalPixels: 1310000,
    maxWidth: 2560,
    maxHeight: 2560,
    maxModulesPerOutput: null,
    maxInputResolution: '1080p',
    layers: 1,
    hasGenlock: false,
    hasBackupInput: false
  },
  'colorlight-s4': {
    id: 'colorlight-s4',
    brand: 'Colorlight',
    model: 'S4',
    description: 'Sending box DVI + HDMI',
    outputs: 4,
    totalPixels: 2300000,
    maxWidth: 4096,
    maxHeight: 2560,
    maxModulesPerOutput: null,
    maxInputResolution: '1080p',
    layers: 1,
    hasGenlock: false,
    hasBackupInput: false
  },
  'colorlight-s6': {
    id: 'colorlight-s6',
    brand: 'Colorlight',
    model: 'S6',
    description: 'Sending box con genlock, fibra y DMX',
    outputs: 4,
    totalPixels: 2300000,
    maxWidth: 4096,
    maxHeight: 4096,
    maxModulesPerOutput: null,
    maxInputResolution: '1080p',
    layers: 1,
    hasGenlock: true,
    hasBackupInput: true
  },

  // ---- Linsn Sending Cards ----
  'linsn-ts802d': {
    id: 'linsn-ts802d',
    brand: 'Linsn',
    model: 'TS802D',
    description: 'Sending card clásica PCI, DVI',
    outputs: 2,
    totalPixels: 1310000,
    maxWidth: 2048,
    maxHeight: 2048,
    maxModulesPerOutput: null,
    maxInputResolution: '1080p',
    layers: 1,
    hasGenlock: false,
    hasBackupInput: false
  },
  'linsn-ts921': {
    id: 'linsn-ts921',
    brand: 'Linsn',
    model: 'TS921',
    description: 'Sending card PCI-E, soporte 4K source',
    outputs: 2,
    totalPixels: 1310000,
    maxWidth: 3840,
    maxHeight: 1920,
    maxModulesPerOutput: null,
    maxInputResolution: '1080p',
    layers: 1,
    hasGenlock: false,
    hasBackupInput: false
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
    width: '', height: '', weight: '', power: '', hangingPoints: '',
    brightness: '', refreshRate: '', ipRating: 'IP20', viewingAngleH: '', viewingAngleV: '',
    minCurveRadius: '', modulesPerCase: ''
  });
  const [newProcessor, setNewProcessor] = useState({
    brand: '', model: '', description: '', outputs: '',
    totalPixels: '', maxWidth: '', maxHeight: '', maxModulesPerOutput: '',
    maxInputResolution: '1080p', layers: '', hasGenlock: false, hasBackupInput: false
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

    // Determine if we need serpentine (outputs cross lines) or simple (each line = outputs)
    // If lineSize <= effectiveModulesPerOutput, each line fits in one output, no serpentine needed
    const needsSerpentine = lineSize > effectiveModulesPerOutput;

    // Build path for the screen
    const buildPath = () => {
      const path = [];
      for (let line = 0; line < numLines; line++) {
        // If serpentine needed, alternate direction; otherwise always same direction from same edge
        let goForward;
        if (needsSerpentine) {
          // Serpentine: alternate direction each line
          const isEvenLine = line % 2 === 0;
          goForward = isReverseStart ? !isEvenLine : isEvenLine;
        } else {
          // No serpentine: all lines go same direction (all connections at same edge)
          goForward = !isReverseStart;
        }

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

    const serpentinePath = buildPath();

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
    const typicalPower = totalPower * 0.6; // 60% typical usage
    const totalAmps220 = totalPower / 220;
    const totalAmps110 = totalPower / 110;
    const typicalAmps220 = typicalPower / 220;

    // PDU calculations (assuming 32A circuits)
    const ampsPerCircuit = 32;
    const pdusNeeded = Math.ceil(totalAmps220 / ampsPerCircuit);

    // Rigging
    const hangingPointsTotal = finalWidthModules * (mod.hangingPoints || 2);
    const weightPerHangingPoint = totalWeight / hangingPointsTotal;
    const safeWorkingLoad = weightPerHangingPoint * 2;

    // Ground stack vs fly recommendation
    const maxGroundStackHeight = 300; // 3 meters max for ground stack
    const recommendFly = finalHeightCm > maxGroundStackHeight || totalWeight > 500;

    // Pitch and viewing distance
    const pitchMm = (mod.width * 10) / mod.pixelsW;
    const minViewingDistance = pitchMm * 1.5;
    const maxViewingDistance = pitchMm * 3;

    // Logistics calculations
    const modulesPerCase = mod.modulesPerCase || 6;
    const flightCasesNeeded = Math.ceil(totalModules / modulesPerCase);

    // Crew and time estimation
    const crewNeeded = Math.max(2, Math.ceil(areaM2 / 25)); // 1 person per 25m²
    const setupTimeMinutes = Math.round(areaM2 * 18); // ~18 min per m²
    const setupTimeHours = (setupTimeMinutes / 60).toFixed(1);

    // Cable estimation (UTP)
    // Average 1.5m per module for data chain + 3m per output for processor connection
    const avgCableLengthPerModule = 1.5;
    const cableToProcessor = 3;
    const totalUtpMeters = Math.round(
      (totalModules * avgCableLengthPerModule) + (totalOutputsNeeded * cableToProcessor)
    );

    // Resolume/mapping info - slice dimensions per processor
    const sliceDimensions = processorDistribution.map(dist => {
      const sliceW = isHorizontal ? resolutionW : (dist.linesCount * mod.pixelsW);
      const sliceH = isHorizontal ? (dist.linesCount * mod.pixelsH) : resolutionH;
      return {
        processorIndex: dist.processorIndex,
        width: sliceW,
        height: sliceH,
        startX: isHorizontal ? 0 : (dist.startLine * mod.pixelsW),
        startY: isHorizontal ? (dist.startLine * mod.pixelsH) : 0
      };
    });

    // Recommended content resolution (match screen or standard)
    const contentResolutions = [
      { w: 1920, h: 1080, name: '1080p' },
      { w: 3840, h: 2160, name: '4K' },
      { w: 1280, h: 720, name: '720p' }
    ];
    let recommendedContentRes = { w: resolutionW, h: resolutionH, name: 'Nativo' };
    for (const res of contentResolutions) {
      if (res.w >= resolutionW && res.h >= resolutionH) {
        recommendedContentRes = res;
        break;
      }
    }

    // Broadcast suitability (refresh rate check)
    const broadcastSuitable = (mod.refreshRate || 1920) >= 3840;

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
      totalWeight, totalPower, typicalPower,
      totalAmps220: totalAmps220.toFixed(1),
      totalAmps110: totalAmps110.toFixed(1),
      typicalAmps220: typicalAmps220.toFixed(1),
      pdusNeeded,

      // Rigging
      hangingPointsTotal,
      weightPerHangingPoint: weightPerHangingPoint.toFixed(1),
      safeWorkingLoad: safeWorkingLoad.toFixed(1),
      recommendFly,

      // Logistics
      flightCasesNeeded,
      crewNeeded,
      setupTimeMinutes,
      setupTimeHours,
      totalUtpMeters,

      // Resolume/Mapping
      sliceDimensions,
      recommendedContentRes,
      broadcastSuitable,

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
        hangingPoints: parseInt(newModule.hangingPoints) || 2,
        brightness: parseInt(newModule.brightness) || 1000,
        refreshRate: parseInt(newModule.refreshRate) || 1920,
        ipRating: newModule.ipRating || 'IP20',
        viewingAngleH: parseInt(newModule.viewingAngleH) || 160,
        viewingAngleV: parseInt(newModule.viewingAngleV) || 140,
        minCurveRadius: newModule.minCurveRadius ? parseFloat(newModule.minCurveRadius) : null,
        modulesPerCase: parseInt(newModule.modulesPerCase) || 6
      }
    }));
    setNewModule({
      name: '', description: '', pixelsW: '', pixelsH: '', width: '', height: '',
      weight: '', power: '', hangingPoints: '', brightness: '', refreshRate: '',
      ipRating: 'IP20', viewingAngleH: '', viewingAngleV: '', minCurveRadius: '', modulesPerCase: ''
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
        hangingPoints: parseInt(editModule.hangingPoints) || 2,
        brightness: parseInt(editModule.brightness) || 1000,
        refreshRate: parseInt(editModule.refreshRate) || 1920,
        ipRating: editModule.ipRating || 'IP20',
        viewingAngleH: parseInt(editModule.viewingAngleH) || 160,
        viewingAngleV: parseInt(editModule.viewingAngleV) || 140,
        minCurveRadius: editModule.minCurveRadius ? parseFloat(editModule.minCurveRadius) : null,
        modulesPerCase: parseInt(editModule.modulesPerCase) || 6
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
        maxModulesPerOutput: newProcessor.maxModulesPerOutput ? parseInt(newProcessor.maxModulesPerOutput) : null,
        maxInputResolution: newProcessor.maxInputResolution || '1080p',
        layers: parseInt(newProcessor.layers) || 1,
        hasGenlock: newProcessor.hasGenlock || false,
        hasBackupInput: newProcessor.hasBackupInput || false
      }
    }));
    setNewProcessor({
      brand: '', model: '', description: '', outputs: '', totalPixels: '', maxWidth: '', maxHeight: '',
      maxModulesPerOutput: '', maxInputResolution: '1080p', layers: '', hasGenlock: false, hasBackupInput: false
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
        maxHeight: parseInt(editProcessor.maxHeight) || 0,
        maxModulesPerOutput: editProcessor.maxModulesPerOutput ? parseInt(editProcessor.maxModulesPerOutput) : null,
        maxInputResolution: editProcessor.maxInputResolution || '1080p',
        layers: parseInt(editProcessor.layers) || 1,
        hasGenlock: editProcessor.hasGenlock || false,
        hasBackupInput: editProcessor.hasBackupInput || false
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

  // ==================== PDF GENERATION HELPERS ====================
  const loadLogoAsDataURL = () => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => resolve(null);
      img.src = '/logo_euforia.png';
    });
  };

  const addPDFHeader = (doc, logoDataURL, title, projectName) => {
    const pageWidth = doc.internal.pageSize.getWidth();

    // Logo
    if (logoDataURL) {
      doc.addImage(logoDataURL, 'PNG', 15, 10, 40, 20);
    }

    // Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(title, pageWidth / 2, 25, { align: 'center' });

    // Project name
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text(projectName, pageWidth / 2, 35, { align: 'center' });

    // Date
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const today = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    doc.text(today, pageWidth - 15, 15, { align: 'right' });
    doc.setTextColor(0, 0, 0);

    // Separator line
    doc.setDrawColor(0, 150, 200);
    doc.setLineWidth(0.5);
    doc.line(15, 42, pageWidth - 15, 42);

    return 50; // Return Y position after header
  };

  const addPDFFooter = (doc) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setDrawColor(0, 150, 200);
    doc.setLineWidth(0.5);
    doc.line(15, pageHeight - 20, pageWidth - 15, pageHeight - 20);

    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('Euforía Técnica y Logística', pageWidth / 2, pageHeight - 12, { align: 'center' });
    doc.setTextColor(0, 0, 0);
  };

  const addPDFSection = (doc, title, y) => {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(0, 150, 200);
    doc.rect(15, y, doc.internal.pageSize.getWidth() - 30, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text(title, 18, y + 5.5);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    return y + 14;
  };

  const addPDFRow = (doc, label, value, y, indent = 18) => {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`${label}:`, indent, y);
    doc.setFont('helvetica', 'bold');
    doc.text(String(value), 85, y);
    doc.setFont('helvetica', 'normal');
    return y + 7;
  };

  const exportCommercial = async () => {
    if (!results) return;

    const doc = new jsPDF();
    const logoDataURL = await loadLogoAsDataURL();

    let y = addPDFHeader(doc, logoDataURL, 'ESPECIFICACIONES COMERCIALES', projectName);

    // DIMENSIONES
    y = addPDFSection(doc, 'DIMENSIONES', y);
    y = addPDFRow(doc, 'Tamaño', `${results.widthM}m × ${results.heightM}m`, y);
    y = addPDFRow(doc, 'Área total', `${results.areaM2} m²`, y);
    y = addPDFRow(doc, 'Módulos', `${results.finalWidthModules} × ${results.finalHeightModules} (${results.totalModules} unidades)`, y);
    y = addPDFRow(doc, 'Resolución', `${results.resolutionW} × ${results.resolutionH} px (${results.megapixels} MP)`, y);
    y += 10;

    // PROPORCIÓN
    y = addPDFSection(doc, 'PROPORCIÓN', y);
    y = addPDFRow(doc, 'Aspect Ratio', `${results.aspectRatio}:1`, y);
    y = addPDFRow(doc, 'Estándar cercano', `${results.closestRatio.name} (${results.closestRatio.w}×${results.closestRatio.h})`, y);
    if (results.letterbox > 0) {
      y = addPDFRow(doc, 'Letterbox', `${results.letterbox}px (${((results.letterbox / results.resolutionH) * 100).toFixed(1)}%)`, y);
    }
    if (results.pillarbox > 0) {
      y = addPDFRow(doc, 'Pillarbox', `${results.pillarbox}px (${((results.pillarbox / results.resolutionW) * 100).toFixed(1)}%)`, y);
    }

    // Visual aspect ratio representation
    const boxWidth = 80;
    const boxHeight = Math.min(50, boxWidth / parseFloat(results.aspectRatio));
    const boxX = 120;
    const boxY = y + 2;

    // Outer box (full resolution)
    doc.setDrawColor(100, 100, 100);
    doc.setFillColor(60, 60, 60);
    doc.rect(boxX, boxY, boxWidth, boxHeight, 'FD');

    // Inner box (content area)
    const contentWidthRatio = results.pillarbox > 0 ? results.contentW / results.resolutionW : 1;
    const contentHeightRatio = results.letterbox > 0 ? results.contentH / results.resolutionH : 1;
    const innerWidth = boxWidth * contentWidthRatio;
    const innerHeight = boxHeight * contentHeightRatio;
    const innerX = boxX + (boxWidth - innerWidth) / 2;
    const innerY = boxY + (boxHeight - innerHeight) / 2;

    doc.setFillColor(0, 150, 200);
    doc.rect(innerX, innerY, innerWidth, innerHeight, 'F');

    // Label
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(results.closestRatio.name, boxX + boxWidth / 2, boxY + boxHeight / 2 + 2, { align: 'center' });
    doc.setTextColor(0, 0, 0);

    y += boxHeight + 12;

    // EQUIPAMIENTO
    y = addPDFSection(doc, 'EQUIPAMIENTO', y);
    y = addPDFRow(doc, 'Procesador', `${results.processor.brand} ${results.processor.model}`, y);
    y = addPDFRow(doc, 'Cantidad', `${results.processorsNeeded} procesador(es)`, y);
    y = addPDFRow(doc, 'Módulo LED', results.module.name, y);
    y = addPDFRow(doc, 'Pixel Pitch', `P${results.pitchMm}`, y);
    y += 10;

    // PESO Y CONSUMO
    y = addPDFSection(doc, 'PESO Y CONSUMO', y);
    y = addPDFRow(doc, 'Peso total', `${results.totalWeight} kg`, y);
    y = addPDFRow(doc, 'Consumo máximo', `${Math.round(results.totalPower)} W`, y);
    y = addPDFRow(doc, 'Consumo típico', `${Math.round(results.typicalPower)} W`, y);
    y = addPDFRow(doc, 'Amperaje @220V', `${results.totalAmps220} A máx`, y);
    y += 10;

    // CARACTERÍSTICAS
    y = addPDFSection(doc, 'CARACTERÍSTICAS', y);
    y = addPDFRow(doc, 'Brillo', `${results.module.brightness || 1000} nits`, y);
    y = addPDFRow(doc, 'Refresh Rate', `${results.module.refreshRate || 1920} Hz`, y);
    y = addPDFRow(doc, 'Uso en exteriores', (results.module.ipRating || 'IP20').includes('65') ? 'Sí (IP65)' : 'Solo interior', y);
    y = addPDFRow(doc, 'Apto para broadcast', results.broadcastSuitable ? 'Sí' : 'No', y);
    y += 10;

    // VISUALIZACIÓN
    y = addPDFSection(doc, 'VISUALIZACIÓN', y);
    y = addPDFRow(doc, 'Distancia mínima', `${results.minViewingDistance} m`, y);
    y = addPDFRow(doc, 'Distancia óptima', `${results.maxViewingDistance} m`, y);
    y += 10;

    // LOGÍSTICA
    y = addPDFSection(doc, 'LOGÍSTICA', y);
    y = addPDFRow(doc, 'Flight cases', `${results.flightCasesNeeded}`, y);
    y = addPDFRow(doc, 'Personal estimado', `${results.crewNeeded} técnicos`, y);
    y = addPDFRow(doc, 'Tiempo montaje aprox', `${results.setupTimeHours} horas`, y);
    y = addPDFRow(doc, 'Tipo instalación', results.recommendFly ? 'Flying (rigging)' : 'Ground Stack', y);

    addPDFFooter(doc);

    doc.save(`comercial_${projectName.replace(/\s+/g, '_')}.pdf`);
  };

  const exportTechnical = async () => {
    if (!results) return;

    const doc = new jsPDF();
    const logoDataURL = await loadLogoAsDataURL();
    const pageHeight = doc.internal.pageSize.getHeight();

    const checkNewPage = (currentY, neededSpace = 40) => {
      if (currentY > pageHeight - neededSpace) {
        doc.addPage();
        return 20;
      }
      return currentY;
    };

    let y = addPDFHeader(doc, logoDataURL, 'ESPECIFICACIONES TÉCNICAS', projectName);

    // CONFIGURACIÓN DE MÓDULO
    y = addPDFSection(doc, 'CONFIGURACIÓN DE MÓDULO', y);
    y = addPDFRow(doc, 'Módulo', results.module.name, y);
    y = addPDFRow(doc, 'Dimensiones', `${results.module.width}cm × ${results.module.height}cm`, y);
    y = addPDFRow(doc, 'Resolución módulo', `${results.module.pixelsW} × ${results.module.pixelsH} px`, y);
    y = addPDFRow(doc, 'Pixel Pitch', `P${results.pitchMm}`, y);
    y = addPDFRow(doc, 'Peso por módulo', `${results.module.weight} kg`, y);
    y = addPDFRow(doc, 'Brillo', `${results.module.brightness || 1000} nits`, y);
    y = addPDFRow(doc, 'Refresh Rate', `${results.module.refreshRate || 1920} Hz`, y);
    y = addPDFRow(doc, 'IP Rating', results.module.ipRating || 'IP20', y);
    y = addPDFRow(doc, 'Ángulo visión', `${results.module.viewingAngleH || 160}° H / ${results.module.viewingAngleV || 140}° V`, y);
    y += 6;

    // CONFIGURACIÓN DE PANTALLA
    y = checkNewPage(y);
    y = addPDFSection(doc, 'CONFIGURACIÓN DE PANTALLA', y);
    y = addPDFRow(doc, 'Configuración', `${results.finalWidthModules} × ${results.finalHeightModules} módulos`, y);
    y = addPDFRow(doc, 'Total módulos', results.totalModules, y);
    y = addPDFRow(doc, 'Dimensión total', `${results.widthM}m × ${results.heightM}m`, y);
    y = addPDFRow(doc, 'Resolución total', `${results.resolutionW} × ${results.resolutionH} px`, y);
    y = addPDFRow(doc, 'Megapíxeles', `${results.megapixels} MP`, y);
    y = addPDFRow(doc, 'Aspect Ratio', `${results.aspectRatio}:1 → ${results.closestRatio.name}`, y);
    if (results.letterbox > 0) {
      y = addPDFRow(doc, 'Letterbox', `${results.letterbox}px (${((results.letterbox / results.resolutionH) * 100).toFixed(1)}%)`, y);
    }
    if (results.pillarbox > 0) {
      y = addPDFRow(doc, 'Pillarbox', `${results.pillarbox}px (${((results.pillarbox / results.resolutionW) * 100).toFixed(1)}%)`, y);
    }

    // Visual aspect ratio representation (technical)
    const techBoxWidth = 60;
    const techBoxHeight = Math.min(40, techBoxWidth / parseFloat(results.aspectRatio));
    const techBoxX = 140;
    const techBoxY = y - (results.letterbox > 0 || results.pillarbox > 0 ? 14 : 7);

    doc.setDrawColor(100, 100, 100);
    doc.setFillColor(60, 60, 60);
    doc.rect(techBoxX, techBoxY, techBoxWidth, techBoxHeight, 'FD');

    const techContentWRatio = results.pillarbox > 0 ? results.contentW / results.resolutionW : 1;
    const techContentHRatio = results.letterbox > 0 ? results.contentH / results.resolutionH : 1;
    const techInnerW = techBoxWidth * techContentWRatio;
    const techInnerH = techBoxHeight * techContentHRatio;
    const techInnerX = techBoxX + (techBoxWidth - techInnerW) / 2;
    const techInnerY = techBoxY + (techBoxHeight - techInnerH) / 2;

    doc.setFillColor(0, 150, 200);
    doc.rect(techInnerX, techInnerY, techInnerW, techInnerH, 'F');

    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.text(results.closestRatio.name, techBoxX + techBoxWidth / 2, techBoxY + techBoxHeight / 2 + 2, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    y += 6;

    // PROCESAMIENTO
    y = checkNewPage(y);
    y = addPDFSection(doc, 'PROCESAMIENTO', y);
    y = addPDFRow(doc, 'Procesador', `${results.processor.brand} ${results.processor.model}`, y);
    y = addPDFRow(doc, 'Procesadores necesarios', results.processorsNeeded, y);
    y = addPDFRow(doc, 'Outputs utilizados', results.totalOutputsNeeded, y);
    y = addPDFRow(doc, 'Módulos por output', `~${results.modulesPerOutputBalanced}`, y);
    y = addPDFRow(doc, 'Máx módulos/output', results.effectiveModulesPerOutput, y);
    y += 4;

    // Distribución por procesador
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('Distribución por procesador:', 18, y);
    y += 6;
    results.processorDistribution.forEach(d => {
      doc.setFont('helvetica', 'normal');
      doc.text(`   Proc ${d.processorIndex}: ${d.linesCount} líneas, ${d.outputsUsed} outputs, ${d.modulesCount} módulos`, 18, y);
      y += 6;
    });

    // Alternativa recomendada
    if (results.recommendedProcessor) {
      y += 4;
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 120, 180);
      doc.text('Alternativa recomendada:', 18, y);
      doc.setFont('helvetica', 'normal');
      doc.text(`${results.recommendedProcessorCount}× ${results.recommendedProcessor.brand} ${results.recommendedProcessor.model}`, 85, y);
      doc.setTextColor(0, 0, 0);
    }
    y += 10;

    // CABLEADO UTP
    y = checkNewPage(y);
    y = addPDFSection(doc, 'CABLEADO UTP', y);
    y = addPDFRow(doc, 'Patrón', wiringPattern, y);
    y = addPDFRow(doc, 'Cables de entrada', results.utpInputs, y);
    y = addPDFRow(doc, 'Puentes', results.utpBridges, y);
    y = addPDFRow(doc, 'Total cables', results.utpInputs + results.utpBridges, y);
    y = addPDFRow(doc, 'Metros estimados', `~${results.totalUtpMeters}m`, y);
    y += 6;

    // ELÉCTRICO
    y = checkNewPage(y);
    y = addPDFSection(doc, 'CONSUMO ELÉCTRICO', y);
    y = addPDFRow(doc, 'Consumo máximo', `${Math.round(results.totalPower)} W`, y);
    y = addPDFRow(doc, 'Consumo típico (60%)', `${Math.round(results.typicalPower)} W`, y);
    y = addPDFRow(doc, 'Amperaje máx @220V', `${results.totalAmps220} A`, y);
    y = addPDFRow(doc, 'Amperaje típico @220V', `${results.typicalAmps220} A`, y);
    y = addPDFRow(doc, 'PDUs recomendados', `${results.pdusNeeded} (32A c/u)`, y);
    y += 6;

    // RIGGING
    y = checkNewPage(y);
    y = addPDFSection(doc, 'RIGGING (FILA SUPERIOR)', y);
    y = addPDFRow(doc, 'Puntos por módulo', results.module.hangingPoints || 2, y);
    y = addPDFRow(doc, 'Módulos fila superior', results.finalWidthModules, y);
    y = addPDFRow(doc, 'Total puntos colgado', results.hangingPointsTotal, y);
    y = addPDFRow(doc, 'Peso total pantalla', `${results.totalWeight} kg`, y);
    y = addPDFRow(doc, 'Carga por punto', `${results.weightPerHangingPoint} kg`, y);
    y = addPDFRow(doc, 'SWL mínimo (2:1)', `${results.safeWorkingLoad} kg/punto`, y);
    y = addPDFRow(doc, 'Tipo instalación', results.recommendFly ? 'Flying (rigging)' : 'Ground Stack', y);
    y += 6;

    // LOGÍSTICA
    y = checkNewPage(y);
    y = addPDFSection(doc, 'LOGÍSTICA Y MONTAJE', y);
    y = addPDFRow(doc, 'Flight cases', `${results.flightCasesNeeded} (${results.module.modulesPerCase || 6} mód/case)`, y);
    y = addPDFRow(doc, 'Personal estimado', `${results.crewNeeded} técnicos`, y);
    y = addPDFRow(doc, 'Tiempo montaje', `${results.setupTimeHours} horas (~${results.setupTimeMinutes} min)`, y);
    y += 6;

    // VIDEO / RESOLUME
    y = checkNewPage(y);
    y = addPDFSection(doc, 'VIDEO / MAPPING', y);
    y = addPDFRow(doc, 'Resolución contenido', `${results.recommendedContentRes.w}×${results.recommendedContentRes.h} (${results.recommendedContentRes.name})`, y);
    y = addPDFRow(doc, 'Input máx procesador', results.processor.maxInputResolution || '1080p', y);
    y = addPDFRow(doc, 'Capas', results.processor.layers || 1, y);
    y = addPDFRow(doc, 'Genlock', results.processor.hasGenlock ? 'Sí' : 'No', y);
    y = addPDFRow(doc, 'Backup Input', results.processor.hasBackupInput ? 'Sí' : 'No', y);
    y = addPDFRow(doc, 'Broadcast Ready', results.broadcastSuitable ? 'Sí (≥3840Hz)' : 'No (<3840Hz)', y);

    if (results.processorsNeeded > 1) {
      y += 4;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.text('Slice dimensions por procesador:', 18, y);
      y += 5;
      results.sliceDimensions.forEach(slice => {
        doc.setFont('helvetica', 'normal');
        doc.text(`   Proc ${slice.processorIndex}: ${slice.width}×${slice.height}px @ (${slice.startX}, ${slice.startY})`, 18, y);
        y += 5;
      });
    }

    addPDFFooter(doc);

    doc.save(`tecnico_${projectName.replace(/\s+/g, '_')}.pdf`);
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

                {/* Module Technical Specs */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-sm font-semibold mb-3">Especificaciones del Módulo</h3>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-gray-400">Brillo</p>
                      <p className="font-bold">{results.module.brightness || 1000} nits</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Refresh</p>
                      <p className="font-bold">{results.module.refreshRate || 1920} Hz</p>
                      {results.broadcastSuitable && <span className="text-xs text-green-400">✓ Broadcast</span>}
                    </div>
                    <div>
                      <p className="text-gray-400">IP Rating</p>
                      <p className="font-bold">{results.module.ipRating || 'IP20'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Ángulo H/V</p>
                      <p className="font-bold">{results.module.viewingAngleH || 160}°/{results.module.viewingAngleV || 140}°</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Curvatura mín</p>
                      <p className="font-bold">{results.module.minCurveRadius ? `${results.module.minCurveRadius}m` : 'Flat only'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Mód/case</p>
                      <p className="font-bold">{results.module.modulesPerCase || 6}</p>
                    </div>
                  </div>
                </div>

                {/* Weight and Power */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-gray-400">Peso Total</p>
                    <p className="text-lg font-bold">{results.totalWeight} kg</p>
                    <p className="text-xs text-gray-500">{results.recommendFly ? '⬆ Recomendado: Fly' : '⬇ Recomendado: Ground'}</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-gray-400">Consumo Máx / Típico</p>
                    <p className="text-lg font-bold">{Math.round(results.totalPower)} / {Math.round(results.typicalPower)} W</p>
                    <p className="text-xs text-gray-500">{results.totalAmps220}A máx • {results.typicalAmps220}A típico @220V</p>
                  </div>
                </div>

                {/* PDU Info */}
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-400">Distribución Eléctrica</p>
                  <p className="font-bold">{results.pdusNeeded} PDU(s) de 32A recomendados</p>
                </div>

                {/* Rigging Section */}
                <div className="bg-orange-900/30 border border-orange-600 rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Rigging (fila superior)</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Puntos por módulo:</p>
                      <p className="font-bold">{results.module.hangingPoints || 2} pts</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Módulos en fila superior:</p>
                      <p className="font-bold">{results.finalWidthModules}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Total puntos de colgado:</p>
                      <p className="font-bold text-orange-400">{results.hangingPointsTotal} pts</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Peso total pantalla:</p>
                      <p className="font-bold">{results.totalWeight} kg</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Carga por punto:</p>
                      <p className="font-bold">{results.weightPerHangingPoint} kg</p>
                    </div>
                    <div>
                      <p className="text-gray-400">SWL mínimo (2:1):</p>
                      <p className="font-bold text-orange-400">{results.safeWorkingLoad} kg/punto</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    * Solo la fila superior utiliza puntos de rigging. SWL = Safe Working Load con factor de seguridad 2:1.
                  </p>
                </div>

                {/* Aspect Ratio Visualization */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-sm font-semibold mb-3">Aspect Ratio: {results.aspectRatio}:1</h3>
                  <div className="flex items-center justify-center mb-3">
                    <div
                      className="relative bg-gray-600 flex items-center justify-center"
                      style={{
                        width: '200px',
                        height: `${Math.min(150, 200 / parseFloat(results.aspectRatio))}px`
                      }}
                    >
                      <div
                        className="absolute bg-blue-500 flex items-center justify-center text-xs font-medium"
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
                      {results.letterbox > 0 && (
                        <span className="absolute top-1 text-xs text-gray-300">Letterbox</span>
                      )}
                      {results.pillarbox > 0 && (
                        <span className="absolute left-1 text-xs text-gray-300" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>Pillar</span>
                      )}
                    </div>
                  </div>
                  <p className="text-center text-sm text-gray-400">
                    Estándar más cercano: {results.closestRatio.name} ({results.closestRatio.w}×{results.closestRatio.h})
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
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p>Entradas: <strong>{results.utpInputs}</strong></p>
                    <p>Puentes: <strong>{results.utpBridges}</strong></p>
                    <p>Total cables: <strong>{results.utpInputs + results.utpBridges}</strong></p>
                    <p>Metros estimados: <strong>~{results.totalUtpMeters}m</strong></p>
                  </div>
                </div>

                {/* Logistics Section */}
                <div className="bg-purple-900/30 border border-purple-600 rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Logística y Montaje</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Flight Cases</p>
                      <p className="font-bold text-purple-400">{results.flightCasesNeeded} cases</p>
                      <p className="text-xs text-gray-500">{results.module.modulesPerCase || 6} módulos/case</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Personal estimado</p>
                      <p className="font-bold text-purple-400">{results.crewNeeded} técnicos</p>
                      <p className="text-xs text-gray-500">~1 por 25m²</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Tiempo montaje</p>
                      <p className="font-bold text-purple-400">{results.setupTimeHours} horas</p>
                      <p className="text-xs text-gray-500">{results.setupTimeMinutes} minutos</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Tipo instalación</p>
                      <p className={`font-bold ${results.recommendFly ? 'text-yellow-400' : 'text-green-400'}`}>
                        {results.recommendFly ? 'Flying (rigging)' : 'Ground Stack'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Resolume/Mapping Section */}
                <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Resolume / Video Mapping</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                    <div>
                      <p className="text-gray-400">Resolución contenido</p>
                      <p className="font-bold text-blue-400">{results.recommendedContentRes.w}×{results.recommendedContentRes.h}</p>
                      <p className="text-xs text-gray-500">{results.recommendedContentRes.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Input máx procesador</p>
                      <p className="font-bold">{results.processor.maxInputResolution || '1080p'}</p>
                      <p className="text-xs text-gray-500">{results.processor.layers || 1} capa(s)</p>
                    </div>
                  </div>
                  {results.processorsNeeded > 1 && (
                    <div className="border-t border-blue-600/50 pt-3">
                      <p className="text-sm font-medium mb-2">Slice dimensions por procesador:</p>
                      {results.sliceDimensions.map((slice, idx) => (
                        <p key={idx} className="text-xs text-gray-300">
                          Proc {slice.processorIndex}: {slice.width}×{slice.height}px @ ({slice.startX}, {slice.startY})
                        </p>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2 mt-3 text-xs">
                    {results.processor.hasGenlock && <span className="bg-green-800 px-2 py-1 rounded">Genlock</span>}
                    {results.processor.hasBackupInput && <span className="bg-green-800 px-2 py-1 rounded">Backup Input</span>}
                    {results.broadcastSuitable && <span className="bg-green-800 px-2 py-1 rounded">Broadcast Ready</span>}
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
                          <input
                            type="number"
                            value={editModule.hangingPoints}
                            onChange={(e) => setEditModule(prev => ({ ...prev, hangingPoints: e.target.value }))}
                            className="bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm"
                            placeholder="Pts rigging/módulo"
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
                            {mod.width}×{mod.height}cm | {mod.pixelsW}×{mod.pixelsH}px | {mod.weight}kg | {mod.hangingPoints || 2} pts rigging
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
                  <input
                    type="number"
                    value={newModule.hangingPoints}
                    onChange={(e) => setNewModule(prev => ({ ...prev, hangingPoints: e.target.value }))}
                    className="bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm"
                    placeholder="Pts rigging/módulo"
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
