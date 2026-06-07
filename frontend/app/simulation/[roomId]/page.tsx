'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type * as Phaser from 'phaser';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const ASSET_ROOT = '/asset';
const BLOCKLY_JS = 'https://unpkg.com/blockly/javascript_compressed.js';
const BLOCKLY_CORE = 'https://unpkg.com/blockly/blockly.min.js';

type BlocklyWorkspace = {
  clear: () => void;
  updateToolbox: (toolboxDef: string) => void;
  getAllBlocks?: (ordered?: boolean) => Array<{ type: string; getFieldValue?: (name: string) => string | null }>;
  dispose?: () => void;
};

type BlocklyApi = {
  inject: (container: string, options: { toolbox: string }) => BlocklyWorkspace;
  Xml?: {
    workspaceToDom: (workspace: BlocklyWorkspace) => any;
    domToText: (dom: any) => string;
  };
  javascriptGenerator?: {
    ORDER_FUNCTION_CALL?: number;
    forBlock?: Record<string, unknown>;
    workspaceToCode?: (workspace: BlocklyWorkspace) => string;
  };
  JavaScript?: {
    ORDER_FUNCTION_CALL?: number;
    forBlock?: Record<string, unknown>;
    workspaceToCode?: (workspace: BlocklyWorkspace) => string;
  };
  Blocks?: Record<string, any>;
  FieldDropdown?: new (options: Array<[string, string]>) => any;
};

type BlocklyJavascriptApi = {
  javascriptGenerator: {
    workspaceToCode: (workspace: BlocklyWorkspace) => string;
  };
};

declare global {
  interface Window {
    Blockly?: BlocklyApi;
    javascript?: BlocklyJavascriptApi;
    gameScenario?: string;
  }
}

type ScenarioKey = 'kamar-utama' | 'demo';

type Scenario = {
  nama_perangkat: string;
  deskripsi_masalah: string;
  kebutuhan_blok: string[];
};

type DeviceDetail = {
  nama_perangkat: string;
  deskripsi_masalah: string;
  kebutuhan_blok: string[];
};

const SCENARIOS: Record<ScenarioKey, Scenario> = {
  'kamar-utama': {
    nama_perangkat: 'kamar utama',
    deskripsi_masalah: 'Ruang pembelajaran ini mengajak peserta memahami pengendalian dua perangkat pintar secara bersamaan dengan cara visual yang interaktif.',
    kebutuhan_blok: ['sensor_suhu', 'sensor_gerakan', 'sensor_cahaya', 'digital_write'],
  },
  demo: {
    nama_perangkat: 'mode demo',
    deskripsi_masalah: 'Mode ini disediakan untuk mempelajari antarmuka dan navigasi dasar sebelum memasuki tantangan utama.',
    kebutuhan_blok: ['sensor_suhu', 'sensor_gerakan', 'sensor_cahaya', 'digital_write'],
  },
};

const DEVICE_DETAILS: Record<DeviceType, DeviceDetail> = {
  komputer: {
    nama_perangkat: 'Komputer Pintar',
    deskripsi_masalah: 'Buat logika agar komputer menyala saat ada gerakan dan cahaya di bawah 30.',
    kebutuhan_blok: ['sensor_gerakan', 'sensor_cahaya', 'digital_write'],
  },
  kipas: {
    nama_perangkat: 'Kipas Angin Pintar',
    deskripsi_masalah: 'Buat logika agar kipas menyala saat suhu di atas 25.',
    kebutuhan_blok: ['sensor_suhu', 'digital_write'],
  },
};

type DeviceType = 'komputer' | 'kipas';

const buildToolboxXml = (neededBlocks: string[]) => {
  const blockMap: Record<string, string> = {
    digital_write: '<block type="digital_write"></block>',
    sensor_suhu: '<block type="sensor_suhu"></block>',
    sensor_gerakan: '<block type="sensor_gerakan"></block>',
    sensor_cahaya: '<block type="sensor_cahaya"></block>',
    waktu_sekarang: '<block type="waktu_sekarang"></block>',
  };

  let xml = '<xml>';
  xml += '<category name="📟 Perangkat" colour="120">';
  if (neededBlocks.includes('digital_write')) xml += blockMap.digital_write;
  xml += '</category>';
  xml += '<category name="🔬 Sensor" colour="210">';
  neededBlocks.forEach((block) => {
    if (block !== 'digital_write' && blockMap[block]) xml += blockMap[block];
  });
  xml += '</category>';
  xml += '<category name="🔀 Logika" colour="210">';
  xml += '<block type="controls_if"></block>';
  xml += '<block type="logic_compare"></block>';
  xml += '<block type="logic_operation"><field name="OP">AND</field></block>';
  xml += '<block type="logic_boolean"></block>';
  xml += '</category>';
  xml += '<category name="🔢 Angka" colour="230">';
  xml += '<block type="math_number"><field name="NUM">25</field></block>';
  xml += '<block type="math_number"><field name="NUM">50</field></block>';
  xml += '</category>';
  xml += '<category name="🔁 Looping" colour="290">';
  xml += '<block type="controls_repeat_ext"></block>';
  xml += '<block type="controls_whileUntil"></block>';
  xml += '</category>';
  xml += '</xml>';
  return xml;
};

const registerCustomBlocks = () => {
  if (!window.Blockly) return;

  const Blockly = window.Blockly as any;
  const jsGen = getBlocklyGenerator();
  if (!jsGen) return;

  // Blok: Kontrol Pin Digital
  (Blockly as any).Blocks.digital_write = {
    init: function () {
      this.appendDummyInput()
        .appendField('🔌 Nyalakan/Matikan')
        .appendField(new Blockly.FieldDropdown([['Nyalakan (HIGH)', 'HIGH'], ['Matikan (LOW)', 'LOW']]), 'STATE');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(120);
      this.setTooltip('Mengontrol perangkat (HIGH=nyala, LOW=mati)');
    },
  };

  jsGen.forBlock.digital_write = function (block: any) {
    const state = block.getFieldValue('STATE');
    return `digitalWrite(${state});\n`;
  };

  // Blok: Baca Sensor Suhu
  (Blockly as any).Blocks.sensor_suhu = {
    init: function () {
      this.appendDummyInput().appendField('🌡️ Suhu Ruangan');
      this.setOutput(true, null);
      this.setColour(210);
      this.setTooltip('Membaca suhu ruangan (°C)');
    },
  };

  jsGen.forBlock.sensor_suhu = function () {
    return ['sensorSuhu()', jsGen.ORDER_FUNCTION_CALL];
  };

  // Blok: Deteksi Gerakan
  (Blockly as any).Blocks.sensor_gerakan = {
    init: function () {
      this.appendDummyInput().appendField('👁️ Ada Gerakan?');
      this.setOutput(true, null);
      this.setColour(210);
      this.setTooltip('Mendeteksi gerakan (true/false)');
    },
  };

  jsGen.forBlock.sensor_gerakan = function () {
    return ['adaGerakan()', jsGen.ORDER_FUNCTION_CALL];
  };

  // Blok: Baca Sensor Cahaya
  (Blockly as any).Blocks.sensor_cahaya = {
    init: function () {
      this.appendDummyInput().appendField('☀️ Cahaya (Lux)');
      this.setOutput(true, null);
      this.setColour(210);
      this.setTooltip('Membaca tingkat cahaya (lux)');
    },
  };

  jsGen.forBlock.sensor_cahaya = function () {
    return ['sensorCahaya()', jsGen.ORDER_FUNCTION_CALL];
  };

  // Blok: Waktu
  (Blockly as any).Blocks.waktu_sekarang = {
    init: function () {
      this.appendDummyInput().appendField('⏰ Jam Sekarang');
      this.setOutput(true, 'Number');
      this.setColour(65);
      this.setTooltip('Membaca waktu saat ini');
    },
  };

  jsGen.forBlock.waktu_sekarang = function () {
    return ['jamSekarang()', jsGen.ORDER_FUNCTION_CALL];
  };
};

const getBlocklyGenerator = () => {
  const blockly = window.Blockly as any;
  return window.javascript?.javascriptGenerator
    ?? window.javascript
    ?? blockly?.javascriptGenerator
    ?? blockly?.JavaScript
    ?? null;
};

const ensureBlocklyScripts = async () => {
  const loadScript = (src: string) => new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null;
    if (existing) {
      if ((src.includes('javascript_compressed') && window.javascript) || (!src.includes('javascript_compressed') && window.Blockly)) {
        resolve();
        return;
      }
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error(`Gagal memuat ${src}`)), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Gagal memuat ${src}`));
    document.head.appendChild(script);
  });

  // PENTING: Load Blockly Core DULU, baru load JavaScript Generator
  // Ini mencegah error "__namespace__" yang terjadi ketika Generator tidak bisa akses Blockly
  try {
    await loadScript(BLOCKLY_CORE);
    await loadScript(BLOCKLY_JS);
    // Daftarkan custom blocks setelah semua scripts siap
    registerCustomBlocks();
  } catch (error) {
    console.error('Blockly scripts gagal dimuat:', error);
    throw error;
  }
};

type GameContext = {
  komputer: Phaser.Physics.Arcade.Sprite;
  kipas: Phaser.Physics.Arcade.Sprite;
  player: Phaser.Physics.Arcade.Sprite;
  actionText: Phaser.GameObjects.Text;
  graphics: Phaser.GameObjects.Graphics;
  spaceKey: Phaser.Input.Keyboard.Key;
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  wasd: { up: Phaser.Input.Keyboard.Key; down: Phaser.Input.Keyboard.Key; left: Phaser.Input.Keyboard.Key; right: Phaser.Input.Keyboard.Key };
  isModalOpen: boolean;
  lastDirection: 'up' | 'down' | 'left' | 'right';
};

export default function SimulationPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = String(params.roomId || 'demo');
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('Menyiapkan dunia permainan...');
  const [currentDevice, setCurrentDevice] = useState<DeviceType>('komputer');
  const [resultText, setResultText] = useState('');
  const [resultTone, setResultTone] = useState<'idle' | 'success' | 'error'>('idle');
  const [score, setScore] = useState(0);
  const [time, setTime] = useState('0:00');
  const [menuOpen, setMenuOpen] = useState(false);
  const [blocklyLoading, setBlocklyLoading] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalDescription, setModalDescription] = useState('');
  const [completionPopupOpen, setCompletionPopupOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'back' | 'logout' | null>(null);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const workspaceRef = useRef<BlocklyWorkspace | null>(null);
  const blocklyHostRef = useRef<HTMLDivElement | null>(null);
  const gameStateRef = useRef<GameContext | null>(null);
  const solvedDevicesRef = useRef<Record<DeviceType, boolean>>({ komputer: false, kipas: false });
  const attemptsRef = useRef<Record<DeviceType, number>>({ komputer: 0, kipas: 0 });
  const completionRedirectTimerRef = useRef<number | null>(null);
  const closeModalRef = useRef<() => void>(() => {});
  const submitCodeRef = useRef<(deviceType: DeviceType) => Promise<void>>(async () => {});
  const elapsedRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const modalDeviceRef = useRef<DeviceType | null>(null);

  const scenarioKey = useMemo<ScenarioKey>(() => {
    if (roomId.includes('kamar-utama')) return 'kamar-utama';
    if (roomId.includes('demo')) return 'demo';
    return 'kamar-utama'; // Default to kamar-utama for backward compatibility
  }, [roomId]);

  useEffect(() => {
    window.gameScenario = scenarioKey;
  }, [scenarioKey]);

  const saveProgress = (newScore: number, solvedDevices: Record<DeviceType, boolean>) => {
    const defaultProgress = {
      score: 0,
      solvedByScenario: {
        'kamar-utama': { komputer: false, kipas: false },
        demo: { komputer: false, kipas: false },
      },
    };

    let progress = defaultProgress;
    const raw = localStorage.getItem('smartroom_saved_progress');
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as typeof defaultProgress;
        progress = { ...defaultProgress, ...parsed };
      } catch {
        progress = defaultProgress;
      }
    }

    progress.score = newScore;
    progress.solvedByScenario = {
      ...progress.solvedByScenario,
      [scenarioKey]: solvedDevices,
    };

    localStorage.setItem('smartroom_saved_progress', JSON.stringify(progress));
  };

  const loadSavedProgress = () => {
    const raw = localStorage.getItem('smartroom_saved_progress');
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as {
        score?: number;
        solvedByScenario?: Record<ScenarioKey, Record<DeviceType, boolean>>;
      };

      if (typeof parsed.score === 'number') {
        setScore(parsed.score);
      }

      const savedSolved = parsed.solvedByScenario?.[scenarioKey];
      if (savedSolved) {
        solvedDevicesRef.current = savedSolved;
      }
    } catch {
      // Ignore invalid saved progress
    }
  };

  const performLogout = async () => {
    try {
      await fetch(`${API_URL}/logout/`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // Ignore network failures and continue local logout.
    } finally {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('user');
      router.push('/login');
    }
  };

  const handleLogout = () => {
    setConfirmTitle('Keluar dari akun?');
    setConfirmMessage('Skor dan kemajuan Anda akan tetap disimpan. Apakah Anda yakin ingin logout?');
    setConfirmAction('logout');
    setConfirmOpen(true);
  };

  const handleBackClick = () => {
    setConfirmTitle('Kembali ke ruang utama?');
    setConfirmMessage('Progres permainan Anda akan tetap disimpan. Apakah Anda ingin kembali sekarang?');
    setConfirmAction('back');
    setConfirmOpen(true);
  };

  const handleConfirmAccept = () => {
    if (confirmAction === 'logout') {
      void performLogout();
    } else if (confirmAction === 'back') {
      router.push('/rooms');
    }
    setConfirmOpen(false);
    setConfirmAction(null);
  };

  const handleConfirmCancel = () => {
    setConfirmOpen(false);
    setConfirmAction(null);
  };

  const handleCloseModal = () => {
    closeModalRef.current();
  };

  const handleSubmitCode = () => {
    void submitCodeRef.current(currentDevice);
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch(`${API_URL}/check-auth/`, {
          method: 'GET',
          credentials: 'include',
        });
        const data = await response.json() as { authenticated?: boolean; username?: string };
        if (response.ok && data.authenticated && data.username) {
          setStatus(`Siap dimainkan oleh ${data.username}`);
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('user', JSON.stringify({ username: data.username }));
          return;
        }
      } catch {
        // Fallback to localStorage below
      }

      // Fallback: check localStorage if backend session check failed or was not authenticated
      const userRaw = localStorage.getItem('user');
      const isLoggedIn = localStorage.getItem('isLoggedIn');
      if (!isLoggedIn || !userRaw) {
        router.push('/login');
        return;
      }

      try {
        const parsed = JSON.parse(userRaw) as { username?: string };
        if (parsed.username) {
          setStatus(`Siap dimainkan oleh ${parsed.username}`);
          return;
        }
      } catch {
        // Error parsing JSON
      }

      router.push('/login');
    };

    void checkSession();
  }, [router]);

  useEffect(() => {
    loadSavedProgress();
  }, [scenarioKey]);

  const addScore = (points: number) => {
    setScore((current) => {
      const next = current + points;
      saveProgress(next, solvedDevicesRef.current);
      return next;
    });
  };

  useEffect(() => {
    let cancelled = false;
    let PhaserRuntime: typeof import('phaser');

    solvedDevicesRef.current = { komputer: false, kipas: false };
    attemptsRef.current = { komputer: 0, kipas: 0 };
    setCompletionPopupOpen(false);
    if (completionRedirectTimerRef.current) {
      window.clearTimeout(completionRedirectTimerRef.current);
      completionRedirectTimerRef.current = null;
    }

    const initGame = async () => {
      try {
        PhaserRuntime = await import('phaser');
        await ensureBlocklyScripts();
        if (cancelled) return;

        const config: Phaser.Types.Core.GameConfig = {
          type: PhaserRuntime.AUTO,
          width: 800,
          height: 600,
          parent: containerRef.current || undefined,
          physics: { default: 'arcade', arcade: { debug: false } },
          scene: { preload, create, update },
          backgroundColor: '#2c1556',
        };

        gameRef.current = new PhaserRuntime.Game(config);
        setLoading(false);
        setStatus('Lingkungan simulasi siap digunakan. Dekati perangkat untuk memulai interaksi.');
      } catch (error) {
        setLoading(false);
        setStatus(error instanceof Error ? error.message : 'Gagal memuat permainan');
      }
    };

    const preload = function (this: Phaser.Scene) {
      this.load.image('depan', `${ASSET_ROOT}/depan.png`);
      this.load.image('belakang', `${ASSET_ROOT}/belakang.png`);
      this.load.image('jalanatas', `${ASSET_ROOT}/jalanatas.png`);
      this.load.image('jalanbawah', `${ASSET_ROOT}/jalanbawah.png`);
      this.load.image('jalankanan', `${ASSET_ROOT}/jalankanan.png`);
      this.load.image('jalankiri', `${ASSET_ROOT}/jalankiri.png`);
      this.load.image('kanan', `${ASSET_ROOT}/kanan.png`);
      this.load.image('kiri', `${ASSET_ROOT}/kiri.png`);
      this.load.image('kipas', `${ASSET_ROOT}/kipas.png`);
      this.load.image('kipashidup', `${ASSET_ROOT}/kipashidup.png`);
      this.load.image('komputer', `${ASSET_ROOT}/boardgame.png`);
      this.load.image('komputerhidup', `${ASSET_ROOT}/boardgamehidup.png`);
      this.load.image('bg_kamar', `${ASSET_ROOT}/bg_kamar.png`);
    };

    const openModal = (deviceType: DeviceType, scene: Phaser.Scene) => {
      const scenario = DEVICE_DETAILS[deviceType];

      if (!scenario || solvedDevicesRef.current[deviceType]) return;

      setCurrentDevice(deviceType);
      modalDeviceRef.current = deviceType;
      setMenuOpen(true);
      setResultText('');
      setBlocklyLoading(true);
      gameStateRef.current = gameStateRef.current ? { ...gameStateRef.current, isModalOpen: true } : null;
      setModalTitle(scenario.nama_perangkat);
      setModalDescription(scenario.deskripsi_masalah);

      const initializeBlockly = async () => {
        const blocklyHost = blocklyHostRef.current;
        const toolbox = document.getElementById('toolbox');

        if (!blocklyHost || !scenario || !toolbox) {
          return;
        }

        toolbox.innerHTML = buildToolboxXml(scenario.kebutuhan_blok);

        if (!window.Blockly || !window.javascript) {
          await ensureBlocklyScripts();
        }

        if (!window.Blockly || !window.javascript || cancelled) {
          return;
        }

        const blockly = window.Blockly;
        if (!blockly) {
          return;
        }

        // Force multiple layout passes to ensure DOM is stable
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              if (cancelled || !blocklyHostRef.current) return;

              try {
                // Ensure blocklyDiv container has proper dimensions
                const blocklyDiv = document.getElementById('blocklyDiv');
                if (blocklyDiv) {
                  blocklyDiv.style.width = '100%';
                  blocklyDiv.style.height = '100%';
                }

                if (!workspaceRef.current) {
                  workspaceRef.current = blockly.inject('blocklyDiv', {
                    toolbox: toolbox.innerHTML,
                  });
                } else {
                  workspaceRef.current.updateToolbox(toolbox.innerHTML);
                  workspaceRef.current.clear();
                }

                // Force resize and render of workspace
                if (workspaceRef.current) {
                  try {
                    (workspaceRef.current as any)?.render?.();
                    (workspaceRef.current as any)?.resize?.();
                  } catch {
                    // ignore resize issues in dev HMR
                  }

                  // Hide scrollbar and add auto-scroll on block drag
                  const setupBlocklyUX = () => {
                    const ws = workspaceRef.current;
                    if (!ws) return;

                    // Inject CSS to hide scrollbars initially
                    const styleId = 'blockly-scrollbar-hide';
                    if (!document.getElementById(styleId)) {
                      const style = document.createElement('style');
                      style.id = styleId;
                      style.textContent = `
                        .blocklyScrollbarHorizontal,
                        .blocklyScrollbarVertical {
                          display: none !important;
                        }
                      `;
                      document.head.appendChild(style);
                    }

                    // Blockly event: hide scrollbar on block selection, show on deselection
                    const handleBlockEvent = (event: any) => {
                      if (event.type === (blockly as any).Events.BLOCK_SELECT) {
                        // Block selected: hide scrollbar
                        const scrollH = document.querySelector('.blocklyScrollbarHorizontal') as HTMLElement | null;
                        const scrollV = document.querySelector('.blocklyScrollbarVertical') as HTMLElement | null;
                        if (scrollH) scrollH.style.display = 'none';
                        if (scrollV) scrollV.style.display = 'none';
                      } else if (event.type === (blockly as any).Events.BLOCK_DRAG) {
                        // Block dragging: ensure scrollbars are visible for navigation, then hide after
                        const scrollH = document.querySelector('.blocklyScrollbarHorizontal') as HTMLElement | null;
                        const scrollV = document.querySelector('.blocklyScrollbarVertical') as HTMLElement | null;
                        if (scrollH) scrollH.style.display = 'block';
                        if (scrollV) scrollV.style.display = 'block';

                        // Auto-scroll to keep dragged block in view
                        if (event.blockId && (ws as any).getBlockById) {
                          const block = (ws as any).getBlockById(event.blockId);
                          if (block && block.getBoundingRectangle) {
                            try {
                              const rect = block.getBoundingRectangle();
                              const svgRoot = (ws as any).getParentSvg?.();
                              if (svgRoot) {
                                const svgRect = svgRoot.getBoundingClientRect();
                                // Scroll to center block in view if outside bounds
                                if (rect.right > svgRect.right || rect.left < svgRect.left ||
                                    rect.bottom > svgRect.bottom || rect.top < svgRect.top) {
                                  const scrollX = (ws as any).scrollX || 0;
                                  const scrollY = (ws as any).scrollY || 0;
                                  const targetX = Math.max(0, rect.left - svgRect.left - 50);
                                  const targetY = Math.max(0, rect.top - svgRect.top - 50);
                                  (ws as any).scroll(-scrollX + targetX, -scrollY + targetY);
                                }
                              }
                            } catch (e) {
                              // ignore scroll errors
                            }
                          }
                        }
                      }
                    };

                    // Attach listener to workspace
                    if ((ws as any).addChangeListener) {
                      (ws as any).addChangeListener(handleBlockEvent);
                    }
                  };

                  // Setup UX after a short delay to ensure DOM is ready
                  requestAnimationFrame(() => setupBlocklyUX());
                }
              } finally {
                setBlocklyLoading(false);
              }
            });
          });
        });
      };

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          void initializeBlockly();
        });
      });

      try {
        scene.physics.pause();
      } catch (e) {
        // Ignore errors if the scene or physics is already destroyed
      }
    };

    const create = function (this: Phaser.Scene) {
      this.add.image(400, 300, 'bg_kamar').setDisplaySize(800, 600);

      const player = this.physics.add.sprite(120, 550, 'depan');
      player.setCollideWorldBounds(true);
      player.setScale(0.45);
      player.setBodySize(40, 30);
      player.setOffset(12, 34);

      this.anims.create({ key: 'walk_up', frames: [{ key: 'jalanatas' }, { key: 'belakang' }], frameRate: 8, repeat: -1 });
      this.anims.create({ key: 'walk_down', frames: [{ key: 'jalanbawah' }, { key: 'depan' }], frameRate: 8, repeat: -1 });
      this.anims.create({ key: 'walk_left', frames: [{ key: 'jalankiri' }, { key: 'kiri' }, { key: 'jalankiri' }, { key: 'kiri' }], frameRate: 12, repeat: -1 });
      this.anims.create({ key: 'walk_right', frames: [{ key: 'jalankanan' }, { key: 'kanan' }, { key: 'jalankanan' }, { key: 'kanan' }], frameRate: 12, repeat: -1 });

      const komputer = this.physics.add.sprite(600, 150, 'komputer');
      komputer.setImmovable(true);
      komputer.setDisplaySize(60, 70);
      komputer.setBodySize(60, 70);

      const kipas = this.physics.add.sprite(340, 135, 'kipas');
      kipas.setImmovable(true);
      kipas.setDisplaySize(60, 70);
      kipas.setBodySize(60, 70);

      const obstacles = this.physics.add.staticGroup();
      const furnitureData = [
        { x: 0, y: 0, width: 20, height: 600 },
        { x: 20, y: 120, width: 260, height: 120 },
        { x: 280, y: 80, width: 120, height: 100 },
        { x: 400, y: 0, width: 200, height: 100 },
        { x: 600, y: 100, width: 120, height: 100 },
        { x: 720, y: 0, width: 80, height: 200 },
        { x: 760, y: 200, width: 40, height: 200 },
        { x: 650, y: 400, width: 150, height: 150 },
        { x: 0, y: 560, width: 800, height: 40 },
      ];

      furnitureData.forEach((data) => {
        const obstacle = obstacles.create(data.x, data.y);
        if (!obstacle || !obstacle.body) return;
        obstacle.setOrigin(0, 0);
        obstacle.setDisplaySize(data.width, data.height);
        obstacle.body.setSize(data.width, data.height);
        obstacle.body.updateFromGameObject();
        obstacle.setVisible(false);
      });

      this.physics.add.collider(player, obstacles);
      this.physics.add.collider(player, komputer);
      this.physics.add.collider(player, kipas);

      const actionText = this.add.text(550, 240, 'Tekan SPASI', {
        fontSize: '14px',
        color: '#ffdf7e',
        fontStyle: 'bold',
        stroke: '#12091f',
        strokeThickness: 4,
      });
      actionText.setVisible(false);

      const keyboard = this.input.keyboard;
      if (!keyboard) return;

      const cursors = keyboard.createCursorKeys();
      const wasd = keyboard.addKeys({
        up: PhaserRuntime.Input.Keyboard.KeyCodes.W,
        down: PhaserRuntime.Input.Keyboard.KeyCodes.S,
        left: PhaserRuntime.Input.Keyboard.KeyCodes.A,
        right: PhaserRuntime.Input.Keyboard.KeyCodes.D,
      }) as { up: Phaser.Input.Keyboard.Key; down: Phaser.Input.Keyboard.Key; left: Phaser.Input.Keyboard.Key; right: Phaser.Input.Keyboard.Key };
      const spaceKey = keyboard.addKey(PhaserRuntime.Input.Keyboard.KeyCodes.SPACE);

      const graphics = this.add.graphics();
      gameStateRef.current = {
        komputer,
        kipas,
        player,
        actionText,
        graphics,
        spaceKey,
        cursors,
        wasd,
        isModalOpen: false,
        lastDirection: 'down',
      };
    };

    const submitCode = async (deviceType: DeviceType) => {
      const state = gameStateRef.current;
      if (!state) return;

      if (solvedDevicesRef.current[deviceType]) {
        setResultTone('success');
        setResultText('Perangkat ini sudah selesai.');
        setTimeout(() => closeModal(), 900);
        return;
      }

      // Increment attempt counter for this device
      attemptsRef.current = {
        ...attemptsRef.current,
        [deviceType]: attemptsRef.current[deviceType] + 1,
      };

      const waitForWorkspace = async (timeoutMs = 800, interval = 50) => {
        const start = Date.now();
        while (Date.now() - start < timeoutMs) {
          const blocklyReady = !!window.Blockly && !!window.Blockly.Xml;
          const gen = getBlocklyGenerator();
          const ws = workspaceRef.current;
          if (blocklyReady && gen && ws) return { gen, ws };
          // small delay before retry
          // eslint-disable-next-line no-await-in-loop
          await new Promise((r) => setTimeout(r, interval));
        }
        return null;
      };

      const ready = await waitForWorkspace();
      if (!ready) {
        setResultTone('error');
        setResultText('Blockly belum siap, silakan coba lagi sebentar.');
        return;
      }

      const { gen: generator, ws: workspace } = ready;

      let kodeSiswa = '';
      try {
        kodeSiswa = (generator as any).workspaceToCode(workspace);
      } catch (err) {
        setResultTone('error');
        setResultText('Generator Blockly belum siap.');
        console.debug('submitCode generator error', err);
        return;
      }

      if (!kodeSiswa.trim()) {
        setResultTone('error');
        setResultText('Susun blok terlebih dahulu.');
        return;
      }

      const blocks = workspace.getAllBlocks?.(true) ?? [];
      const blockTypes = blocks.map((block) => block.type);
      const hasBlock = (type: string) => blockTypes.includes(type);
      const hasNumberInBlocks = (value: string) => blocks.some((block) => block.type === 'math_number' && block.getFieldValue?.('NUM') === value);

      // Fallback: extract number values from workspace XML (covers shadow/value nesting)
      const workspaceXml = window.Blockly && window.Blockly.Xml
        ? window.Blockly.Xml.domToText(window.Blockly.Xml.workspaceToDom(workspace))
        : '';
      const extractNumbersFromXml = (xml: string) => {
        const nums: string[] = [];
        try {
          const re = /<field name=\"NUM\">([^<]+)<\/field>/g;
          let m;
          // eslint-disable-next-line no-cond-assign
          while ((m = re.exec(xml)) !== null) {
            if (m[1]) nums.push(m[1]);
          }
        } catch (e) {
          // ignore
        }
        return nums;
      };
      const numbersFromXml = extractNumbersFromXml(workspaceXml);
      const hasNumber = (value: string) => hasNumberInBlocks(value) || numbersFromXml.includes(value);

      // Debugging: log workspace contents so we can see why validation fails
      try {
        const numbers = blocks.filter((b) => b.type === 'math_number').map((b) => b.getFieldValue?.('NUM'));
        // Console output for developer debugging
        // eslint-disable-next-line no-console
        console.debug('submitCode debug', { deviceType, blockTypes, numbers, numbersFromXml, workspaceXml: workspaceXml.slice(0, 800) });
      } catch (e) {
        // ignore debug failures
      }

      const validateKomputer = () => {
        const required = ['controls_if', 'logic_compare', 'logic_operation', 'sensor_gerakan', 'sensor_cahaya', 'digital_write'];
        // Soal: "cahaya di bawah 30" → accept 1-29
        const hasValidNumberInBlocks = blocks.some((block) => {
          if (block.type === 'math_number') {
            const val = block.getFieldValue?.('NUM');
            if (val) {
              const num = parseInt(val, 10);
              return num < 30 && num > 0;
            }
          }
          return false;
        });
        const hasValidNumberInXml = numbersFromXml.some((val) => {
          const num = parseInt(val, 10);
          return num < 30 && num > 0;
        });
        return required.every(hasBlock) && (hasValidNumberInBlocks || hasValidNumberInXml);
      };

      const validateKipas = () => {
        const required = ['controls_if', 'logic_compare', 'sensor_suhu', 'digital_write'];
        // Soal: "suhu di atas 25" → accept 26+
        const hasValidNumberInBlocks = blocks.some((block) => {
          if (block.type === 'math_number') {
            const val = block.getFieldValue?.('NUM');
            if (val) {
              const num = parseInt(val, 10);
              return num > 25;
            }
          }
          return false;
        });
        const hasValidNumberInXml = numbersFromXml.some((val) => {
          const num = parseInt(val, 10);
          return num > 25;
        });
        return required.every(hasBlock) && (hasValidNumberInBlocks || hasValidNumberInXml);
      };

      const isCorrect = deviceType === 'komputer' ? validateKomputer() : validateKipas();

      const markSolvedAndCheckAllDone = () => {
        if (!solvedDevicesRef.current[deviceType]) {
          solvedDevicesRef.current = {
            ...solvedDevicesRef.current,
            [deviceType]: true,
          };
          saveProgress(score, solvedDevicesRef.current);
        }
        return solvedDevicesRef.current.komputer && solvedDevicesRef.current.kipas;
      };

      if (scenarioKey === 'demo') {
        setResultTone(isCorrect ? 'success' : 'error');
        setResultText(isCorrect ? '✓ Jawaban Benar!' : '✗ Coba Lagi!');
        if (isCorrect) {
          state[deviceType].setTexture(deviceType === 'komputer' ? 'komputerhidup' : 'kipashidup');
          // Score system: 50 base - (attempts - 1) * 10, minimum 10
          const basePoints = 50;
          const pointsDeducted = (attemptsRef.current[deviceType] - 1) * 10;
          const finalPoints = Math.max(10, basePoints - pointsDeducted);
          addScore(finalPoints);

          if (markSolvedAndCheckAllDone()) {
            setCompletionPopupOpen(true);
            if (completionRedirectTimerRef.current) {
              window.clearTimeout(completionRedirectTimerRef.current);
            }
            completionRedirectTimerRef.current = window.setTimeout(() => {
              router.push('/rooms');
            }, 2200);
            setTimeout(() => closeModal(), 600);
            return;
          }
        }
        setTimeout(() => closeModal(), 1500);
        return;
      }

      if (scenarioKey === 'kamar-utama') {
        if (isCorrect) {
          setResultTone('success');
          setResultText('✓ Jawaban Benar!');
          // Score system: 100 base - (attempts - 1) * 10, minimum 10
          const basePoints = 100;
          const pointsDeducted = (attemptsRef.current[deviceType] - 1) * 10;
          const finalPoints = Math.max(10, basePoints - pointsDeducted);
          addScore(finalPoints);
          state[deviceType].setTexture(deviceType === 'komputer' ? 'komputerhidup' : 'kipashidup');

          if (markSolvedAndCheckAllDone()) {
            setCompletionPopupOpen(true);
            if (completionRedirectTimerRef.current) {
              window.clearTimeout(completionRedirectTimerRef.current);
            }
            completionRedirectTimerRef.current = window.setTimeout(() => {
              router.push('/rooms');
            }, 2200);
            setTimeout(() => closeModal(), 600);
            return;
          }
        } else {
          // Provide short debug info in the modal to help students / teachers
          const numbers = blocks.filter((b) => b.type === 'math_number').map((b) => b.getFieldValue?.('NUM'));
          const shortBlocks = blockTypes.slice(0, 8).join(',') || '(kosong)';
          setResultTone('error');
          setResultText(`✗ Coba Lagi! Deteksi blok: ${shortBlocks}; angka: ${numbers.join(',') || '(tidak ada)'}`);
        }
        setTimeout(() => closeModal(), 1700);
        return;
      }
    };

    const closeModal = () => {
      setMenuOpen(false);
      setBlocklyLoading(false);
      modalDeviceRef.current = null;
      setResultTone('idle');
      setModalTitle('');
      setModalDescription('');
      if (workspaceRef.current) {
        try { workspaceRef.current.dispose?.(); } catch {}
        workspaceRef.current = null;
      }
      if (gameRef.current?.scene?.scenes?.[0]) {
        try {
          // Only resume physics if the audio context isn't closed to avoid Phaser attempting
          // to suspend/resume a closed AudioContext internally which can throw.
          const scene0 = gameRef.current.scene.scenes[0];
          const soundMgr: any = scene0.sound as any;
          const audioCtx = soundMgr?.context?.audioContext || soundMgr?.context;
          if (!audioCtx || audioCtx.state !== 'closed') {
            scene0.physics.resume();
          }
        } catch (e) {
          // swallow errors related to audio context/state during dev HMR or teardown
        }
      }
      gameStateRef.current = gameStateRef.current ? { ...gameStateRef.current, isModalOpen: false } : null;
      setResultText('');
    };

    closeModalRef.current = closeModal;
    submitCodeRef.current = submitCode;

    const update = function (this: Phaser.Scene) {
      const state = gameStateRef.current;
      if (!state) return;
      const { player, komputer, kipas, actionText, graphics, spaceKey, cursors, wasd } = state;

      if (state.isModalOpen) {
        player.setVelocity(0);
        return;
      }

      const speed = 150;
      player.setVelocity(0);

      if (cursors.up.isDown || wasd.up.isDown) {
        player.setVelocityY(-speed);
        player.anims.play('walk_up', true);
        state.lastDirection = 'up';
      } else if (cursors.down.isDown || wasd.down.isDown) {
        player.setVelocityY(speed);
        player.anims.play('walk_down', true);
        state.lastDirection = 'down';
      } else if (cursors.left.isDown || wasd.left.isDown) {
        player.setVelocityX(-speed);
        player.anims.play('walk_left', true);
        state.lastDirection = 'left';
      } else if (cursors.right.isDown || wasd.right.isDown) {
        player.setVelocityX(speed);
        player.anims.play('walk_right', true);
        state.lastDirection = 'right';
      } else {
        player.anims.stop();
        if (state.lastDirection === 'up') player.setTexture('belakang');
        else if (state.lastDirection === 'down') player.setTexture('depan');
        else if (state.lastDirection === 'left') player.setTexture('kiri');
        else player.setTexture('kanan');
      }

      const distKomputer = PhaserRuntime.Math.Distance.Between(player.x, player.y, komputer.x, komputer.y);
      const distKipas = PhaserRuntime.Math.Distance.Between(player.x, player.y, kipas.x, kipas.y);
      const selectedRoom = window.gameScenario as ScenarioKey;

      let showKomputerPrompt = false;
      let showKipasPrompt = false;

      if (selectedRoom === 'demo') {
        showKomputerPrompt = distKomputer < 80 && !solvedDevicesRef.current.komputer;
        showKipasPrompt = distKipas < 80 && !solvedDevicesRef.current.kipas;
      } else if (selectedRoom === 'kamar-utama') {
        // In kamar-utama (merged room), both devices are always accessible
        showKomputerPrompt = distKomputer < 80 && !solvedDevicesRef.current.komputer;
        showKipasPrompt = distKipas < 80 && !solvedDevicesRef.current.kipas;
      }

      if (showKomputerPrompt) {
        actionText.setVisible(true);
        actionText.setPosition(komputer.x - 50, komputer.y - 50);
        actionText.setText('Tekan SPASI');
        if (PhaserRuntime.Input.Keyboard.JustDown(spaceKey)) {
          setCurrentDevice('komputer');
          openModal('komputer', this);
        }
      } else if (showKipasPrompt) {
        actionText.setVisible(true);
        actionText.setPosition(kipas.x - 50, kipas.y - 50);
        actionText.setText('Tekan SPASI');
        if (PhaserRuntime.Input.Keyboard.JustDown(spaceKey)) {
          setCurrentDevice('kipas');
          openModal('kipas', this);
        }
      } else {
        actionText.setVisible(false);
      }

      graphics.clear();
      if (state.isModalOpen) return;
    };

    void initGame();

    const elapsedTimer = window.setInterval(() => {
      elapsedRef.current += 1;
      const minutes = String(Math.floor(elapsedRef.current / 60)).padStart(1, '0');
      const seconds = String(elapsedRef.current % 60).padStart(2, '0');
      setTime(`${minutes}:${seconds}`);
    }, 1000);
    timerRef.current = elapsedTimer;

    return () => {
      cancelled = true;
      window.clearInterval(elapsedTimer);
      if (completionRedirectTimerRef.current) {
        window.clearTimeout(completionRedirectTimerRef.current);
        completionRedirectTimerRef.current = null;
      }
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
      if (workspaceRef.current) {
        workspaceRef.current.dispose?.();
        workspaceRef.current = null;
      }
    };
  }, [router, scenarioKey]);

  return (
    <main className="relative min-h-screen px-4 py-6 text-[#f2e7ff]">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div className="rounded-[24px] border-4 border-[#5f3d7a] bg-[#3d2d4d] px-5 py-4 shadow-[8px_8px_0_#12091f, inset_1px_1px_0_#8a5fb5]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <button type="button" onClick={handleBackClick} className="mb-2 inline-flex rounded-full border-2 border-[#8a5fb5] bg-[#2d1a5f] px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-[#f5eaff] shadow-[3px_3px_0_#12091f]">
                ← Kembali
              </button>
              <h1 className="text-3xl font-black tracking-[0.12em] text-[#f5eaff] drop-shadow-[2px_2px_0_#12091f]">SIMULASI {SCENARIOS[scenarioKey].nama_perangkat}</h1>
              <p className="mt-1 text-sm text-[#c8a8d8]">{status}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <div className="rounded-2xl border-2 border-[#5f3d7a] bg-[#2d1a5f] px-4 py-3 shadow-[4px_4px_0_#12091f]">
                <span className="block text-[11px] uppercase tracking-[0.2em] text-[#c8a8d8]">Score</span>
                <span className="font-black text-[#f5eaff]">{score}</span>
              </div>
              <div className="rounded-2xl border-2 border-[#5f3d7a] bg-[#2d1a5f] px-4 py-3 shadow-[4px_4px_0_#12091f]">
                <span className="block text-[11px] uppercase tracking-[0.2em] text-[#c8a8d8]">Time</span>
                <span className="font-black text-[#f5eaff]">{time}</span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-2xl border-2 border-[#5f3d7a] border-b-[#1a0f3f] border-r-[#1a0f3f] bg-[#d56b9d] px-5 py-3 text-sm font-black uppercase tracking-[0.2em] text-white shadow-[4px_4px_0_#12091f]"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        <section className="mx-auto w-full max-w-[860px] rounded-[24px] border-4 border-[#5f3d7a] bg-[#3d2d4d] p-3 shadow-[8px_8px_0_#12091f, inset_1px_1px_0_#8a5fb5]">
          <div ref={containerRef} className="mx-auto aspect-[4/3] w-full max-w-[800px] overflow-hidden rounded-[14px] border-4 border-[#8a5fb5] bg-[#1a0f3f]" />
          {loading ? <div className="mt-4 text-sm text-[#d8c8f8]">Memuat lingkungan simulasi...</div> : null}
          {resultText ? <div className="mt-4 rounded-2xl border-2 border-[#8a5fb5] bg-[#2d1a5f] px-4 py-3 text-sm font-semibold text-[#f5eaff] shadow-[4px_4px_0_#12091f]">{resultText}</div> : null}
        </section>
      </div>

      {confirmOpen ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-[24px] border-4 border-[#5f3d7a] bg-[#3d2d4d] p-6 shadow-[12px_12px_0_#12091f, inset_1px_1px_0_#8a5fb5]">
            <h3 className="text-2xl font-black text-[#f5eaff]">{confirmTitle}</h3>
            <p className="mt-3 text-sm leading-6 text-[#d8c8f8]">{confirmMessage}</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={handleConfirmAccept}
                className="w-full rounded-2xl border-2 border-[#2f7a3a] bg-[#22c55e] px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-white shadow-[2px_2px_0_#0b3f1f] transition hover:bg-[#1f8f4f] sm:w-auto"
              >
                Ya, lanjutkan
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="w-full rounded-2xl border-2 border-[#7a2f3a] bg-[#ef4444] px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-white shadow-[2px_2px_0_#3b0f0f] transition hover:bg-[#d33a3a] sm:w-auto"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Modal Blockly Overlay - Centered */}
      {menuOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-[560px] overflow-auto rounded-[24px] border-4 border-[#5f3d7a] bg-[#3d2d4d] shadow-[12px_12px_0_#12091f, inset_1px_1px_0_#8a5fb5]">
            <div className="p-6">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h4 className="text-2xl font-black text-[#f5eaff]">{modalTitle}</h4>
                  <p className="mt-2 text-sm leading-6 text-[#d8c8f8]">{modalDescription}</p>
                </div>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="ml-4 flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#5f3d7a] bg-[#d56b9d] text-white"
                >
                  ✕
                </button>
              </div>

              {resultText ? (
                <div
                  className={[
                    'mb-4 rounded-2xl border-2 px-4 py-3 text-sm font-black uppercase tracking-[0.08em] shadow-[4px_4px_0_#12091f]',
                    resultTone === 'success'
                      ? 'border-[#2f7a3a] bg-[#22c55e] text-white'
                      : 'border-[#7a2f3a] bg-[#ef4444] text-white',
                  ].join(' ')}
                >
                  {resultText}
                </div>
              ) : null}

              <div id="toolbox" className="hidden" />
              <div className="relative mb-4 h-[320px] w-full overflow-hidden rounded-2xl border-2 border-[#c8a8d8] bg-white">
                <div id="blocklyDiv" ref={blocklyHostRef} className="h-full w-full" />
                {blocklyLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/90 text-sm font-semibold text-[#555]">
                    Memuat antarmuka... Harap tunggu.
                  </div>
                ) : null}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleSubmitCode}
                  className="flex-1 rounded-2xl border-2 border-[#2f7a3a] bg-[#22c55e] px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-white shadow-[2px_2px_0_#0b3f1f]"
                >
                  KIRIM KODE
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 rounded-2xl border-2 border-[#7a2f3a] bg-[#ef4444] px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-white shadow-[2px_2px_0_#3b0f0f]"
                >
                  TUTUP
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {completionPopupOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-[24px] border-4 border-[#5f3d7a] bg-[#3d2d4d] p-6 text-center shadow-[12px_12px_0_#12091f, inset_1px_1px_0_#8a5fb5]">
            <h3 className="text-2xl font-black text-[#f5eaff]">Selamat!</h3>
            <p className="mt-3 text-sm leading-6 text-[#d8c8f8]">
              Semua perangkat sudah berhasil dikonfigurasi. Anda akan kembali ke pilihan room.
            </p>
          </div>
        </div>
      ) : null}
    </main>
  );
}
