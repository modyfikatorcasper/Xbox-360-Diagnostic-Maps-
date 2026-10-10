window.MODI_COMPONENT_PROFILES = {
  trinity: [
    {
      ref:'J7A1', name:{pl:'Złącze zasilania Trinity',en:'Trinity power connector'}, region:'powerin', mode:'standby',
      confidence:'SCHEMATIC VERIFIED', pinoutStatus:'interfaces', primaryRail:'V_5P0STBY',
      role:{pl:'Wejście zasilania płyty: 5 V standby, masa, linie 12 V oraz sterowanie włączeniem zasilacza.',en:'Board power input: 5 V standby, ground, 12 V lines and power-supply enable control.'},
      rails:['V_5P0STBY','V_12P0','PSU_EN'], related:['L6A1','U3D1'],
      symptoms:{pl:['Brak reakcji / brak standby','Zasilacz nie przechodzi w stan pracy','Zwarcie wejścia 12 V'],en:['Completely dead / no standby','PSU does not enter run state','12 V input short']},
      flow:['VSB5P0','U5A1 / U5B1','V_3P3STBY / V_1P8STBY'],
      signals:[
        {pin:'GROUP',signal:'VSB5P0',fn:{pl:'Wejście 5 V standby',en:'5 V standby input'},expected:'5.0 V · STANDBY'},
        {pin:'GROUP',signal:'V12P0',fn:{pl:'Główne wejście 12 V',en:'Main 12 V input'},expected:'12.0 V · POWER ON'},
        {pin:'GROUP',signal:'PSU_EN',fn:{pl:'Żądanie włączenia zasilacza',en:'Power-supply enable request'},expected:'UNKNOWN · dynamic signal'},
        {pin:'GROUP',signal:'GND',fn:{pl:'Punkty odniesienia',en:'Reference ground'},expected:'0 V'}
      ],
      checks:[
        {point:'L6A1 pin 1',expected:'5.0 V',condition:{pl:'Zasilacz podłączony, konsola w standby',en:'PSU connected, console in standby'},region:'powerin'},
        {point:'J7A1 · V12P0 group',expected:'12.0 V',condition:{pl:'Tylko po żądaniu POWER ON',en:'Only after a POWER ON request'},region:'powerin'},
        {point:'J7A1 · PSU_EN',expected:'UNKNOWN',condition:{pl:'Sprawdź aktywność przy próbie startu',en:'Check activity during a start attempt'},region:'southbridge'}
      ]
    },
    {
      ref:'U5A1', name:{pl:'Przetwornica standby 3.3 V',en:'3.3 V standby switcher'}, region:'standby', mode:'standby',
      confidence:'SCHEMATIC VERIFIED', pinoutStatus:'interfaces', primaryRail:'V_3P3STBY',
      role:{pl:'Przetwornica standby zasilająca domenę 3.3 V używaną przez SMC/PSB i NAND.',en:'Standby converter supplying the 3.3 V domain used by SMC/PSB and NAND.'},
      rails:['V_5P0STBY','V_3P3STBY'], related:['L5A1','U3D1','U1E2'],
      symptoms:{pl:['Brak reakcji mimo obecnego 5 V standby','Brak komunikacji z NAND','Brak przejścia do sekwencji startowej'],en:['No response with 5 V standby present','No NAND communication','Boot sequence does not begin']},
      flow:['V_5P0STBY','U5A1 · SW','L5A1','V_3P3STBY'],
      signals:[
        {pin:'VIN',signal:'V_5P0STBY',fn:{pl:'Zasilanie wejściowe',en:'Input supply'},expected:'5.0 V'},
        {pin:'ENABLE',signal:'ENABLE',fn:{pl:'Włączenie regulatora',en:'Regulator enable'},expected:'UNKNOWN'},
        {pin:'SW',signal:'SW',fn:{pl:'Węzeł przełączający do L5A1',en:'Switch node to L5A1'},expected:'UNKNOWN · switching'},
        {pin:'FB/VO',signal:'V_3P3STBY',fn:{pl:'Sprzężenie / wyjście',en:'Feedback / output'},expected:'3.315 V'}
      ],
      checks:[
        {point:'U5A1 · VIN',expected:'5.0 V',condition:{pl:'Stan standby',en:'Standby state'},region:'standby'},
        {point:'L5A1 pin 2',expected:'3.315 V',condition:{pl:'Stan standby',en:'Standby state'},region:'standby'},
        {point:'V_3P3STBY load',expected:'No short · threshold UNKNOWN',condition:{pl:'Pomiar rezystancji tylko bez zasilania',en:'Resistance check only with power removed'},region:'southbridge'}
      ]
    },
    {
      ref:'U5B1', name:{pl:'Przetwornica standby 1.8 V',en:'1.8 V standby switcher'}, region:'standby', mode:'standby',
      confidence:'SCHEMATIC VERIFIED', pinoutStatus:'interfaces', primaryRail:'V_1P8STBY',
      role:{pl:'Druga przetwornica standby. Tworzy 1.8 V dla logiki działającej przed właściwym startem.',en:'Second standby converter. Generates 1.8 V for logic active before the main power-on sequence.'},
      rails:['V_5P0STBY','V_1P8STBY'], related:['L5B2','U3D1'],
      symptoms:{pl:['Brak reakcji przy obecnym 5 V standby','Pulsowanie lub resetowanie próby startu'],en:['No response with 5 V standby present','Pulsing or repeated start reset']},
      flow:['V_5P0STBY','U5B1 · SW','L5B2','V_1P8STBY'],
      signals:[
        {pin:'VIN',signal:'V_5P0STBY',fn:{pl:'Zasilanie wejściowe',en:'Input supply'},expected:'5.0 V'},
        {pin:'ENABLE',signal:'ENABLE',fn:{pl:'Włączenie regulatora',en:'Regulator enable'},expected:'UNKNOWN'},
        {pin:'SW',signal:'SW',fn:{pl:'Węzeł przełączający do L5B2',en:'Switch node to L5B2'},expected:'UNKNOWN · switching'},
        {pin:'FB/VO',signal:'V_1P8STBY',fn:{pl:'Sprzężenie / wyjście',en:'Feedback / output'},expected:'1.802 V'}
      ],
      checks:[
        {point:'U5B1 · VIN',expected:'5.0 V',condition:{pl:'Stan standby',en:'Standby state'},region:'standby'},
        {point:'L5B2 pin 2',expected:'1.802 V',condition:{pl:'Stan standby',en:'Standby state'},region:'standby'},
        {point:'V_1P8STBY load',expected:'No short · threshold UNKNOWN',condition:{pl:'Pomiar rezystancji tylko bez zasilania',en:'Resistance check only with power removed'},region:'southbridge'}
      ]
    },
    {
      ref:'U3D1', name:{pl:'PSB / Southbridge + SMC',en:'PSB / Southbridge + SMC'}, region:'southbridge', mode:'standby',
      confidence:'SCHEMATIC VERIFIED', pinoutStatus:'interfaces', primaryRail:'V_3P3STBY',
      role:{pl:'Logika zarządzania zasilaniem i startem. Odbiera przycisk POWER, steruje railami i nadzoruje PGOOD.',en:'Power and boot management logic. Receives the POWER button, enables rails and monitors PGOOD.'},
      rails:['V_3P3STBY','V_1P8STBY','PWRSW_N','PSU_V12P0_EN'], related:['J2A1','J7A1','U1E2','U3B2'],
      symptoms:{pl:['Brak reakcji na POWER','Pulsująca dioda / pętla startowa','Nieuruchomione główne raile'],en:['No response to POWER','Pulsing light / boot loop','Main rails do not enable']},
      flow:['PWRSW_N','U3D1 · SMC','PSU_V12P0_EN','VREG_*_EN / PGOOD'],
      signals:[
        {pin:'BGA',signal:'PWRSW_N',fn:{pl:'Żądanie z przycisku',en:'Front-button request'},expected:'UNKNOWN · dynamic signal'},
        {pin:'BGA',signal:'PSU_V12P0_EN',fn:{pl:'Włączenie 12 V',en:'12 V supply enable'},expected:'UNKNOWN · dynamic signal'},
        {pin:'BGA',signal:'VREG_5P0_EN / VREG_3P3_EN',fn:{pl:'Sterowanie railami głównymi',en:'Main rail enable control'},expected:'UNKNOWN · dynamic signal'},
        {pin:'BGA',signal:'VREG_CPU_EN',fn:{pl:'Sterowanie CPUCORE',en:'CPUCORE enable control'},expected:'UNKNOWN · dynamic signal'},
        {pin:'BGA',signal:'SMC_RST_N / STBY_CLK',fn:{pl:'Reset i zegar standby',en:'Standby reset and clock'},expected:'UNKNOWN · activity required'}
      ],
      checks:[
        {point:'L5A1 pin 2',expected:'3.315 V',condition:{pl:'Stan standby',en:'Standby state'},region:'standby'},
        {point:'L5B2 pin 2',expected:'1.802 V',condition:{pl:'Stan standby',en:'Standby state'},region:'standby'},
        {point:'PWRSW_N / J2A1',expected:'UNKNOWN · transition',condition:{pl:'Naciśnij POWER i obserwuj zmianę',en:'Press POWER and observe the transition'},region:'southbridge'},
        {point:'PSU_V12P0_EN',expected:'UNKNOWN · activity',condition:{pl:'Podczas próby startu',en:'During a start attempt'},region:'powerin'}
      ]
    },
    {
      ref:'U1E2', name:{pl:'Pamięć NAND 16 MB',en:'16 MB NAND Flash'}, region:'nand', mode:'standby',
      confidence:'SCHEMATIC VERIFIED', pinoutStatus:'verified', primaryRail:'V_3P3STBY',
      role:{pl:'Pamięć firmware używana na wczesnym etapie startu. Jej zasilanie i aktywność magistrali są ważniejsze niż zgadywanie uszkodzenia zawartości.',en:'Firmware storage used early in boot. Its supply and bus activity should be checked before assuming corrupted contents.'},
      rails:['V_3P3STBY','FLSH_*'], related:['U3D1'],
      symptoms:{pl:['Brak postępu po sekwencji standby','Brak aktywności odczytu NAND','Błędy uruchomienia firmware'],en:['No progress after standby sequence','No NAND read activity','Firmware boot errors']},
      flow:['V_3P3STBY','U1E2 · CE#/RE#/WE#','FLSH_DATA<7..0>','U3D1'],
      signals:[
        {pin:'18 / 19',signal:'VCC0 / VCC1',fn:{pl:'Zasilanie NAND',en:'NAND supply'},expected:'3.315 V'},
        {pin:'43',signal:'CE#',fn:{pl:'Wybór układu',en:'Chip enable'},expected:'UNKNOWN · activity'},
        {pin:'34 / 48',signal:'RE# / WE#',fn:{pl:'Sterowanie odczytem i zapisem',en:'Read and write control'},expected:'UNKNOWN · activity'},
        {pin:'46 / 35',signal:'ALE / CLE',fn:{pl:'Adres / komenda',en:'Address / command latch'},expected:'UNKNOWN · activity'},
        {pin:'44',signal:'RDY',fn:{pl:'Gotowość NAND',en:'NAND ready'},expected:'UNKNOWN · dynamic signal'},
        {pin:'6,7,8,12,13,36,37,38',signal:'DATA<7..0>',fn:{pl:'8-bitowa magistrala danych',en:'8-bit data bus'},expected:'UNKNOWN · activity'}
      ],
      checks:[
        {point:'U1E2 pins 18 / 19',expected:'3.315 V',condition:{pl:'Stan standby',en:'Standby state'},region:'nand'},
        {point:'U1E2 pin 43 · CE#',expected:'UNKNOWN · pulses',condition:{pl:'Podczas próby startu',en:'During a start attempt'},region:'nand'},
        {point:'U1E2 data bus',expected:'UNKNOWN · activity',condition:{pl:'Oscyloskop lub analizator; nie oceniaj statycznym napięciem',en:'Use a scope or analyzer; do not judge by a static voltage'},region:'nand'}
      ]
    },
    {
      ref:'U3B2', name:{pl:'Kontroler wideo / zegarów HANA',en:'HANA video / clock controller'}, region:'hana', mode:'run',
      confidence:'SCHEMATIC VERIFIED', pinoutStatus:'interfaces', primaryRail:'V_3P3',
      role:{pl:'Układ wideo i dystrybucji zegarów. Jest częścią późniejszego startu, ale brak obrazu nie powinien automatycznie wskazywać HANA.',en:'Video and clock-distribution IC. It participates later in boot, but no video should not automatically be blamed on HANA.'},
      rails:['V_3P3','V_1P8','ANA_RST_N','STBY_CLK'], related:['Y3B1','U3D1','U5E1'],
      symptoms:{pl:['Konsola uruchamia się bez obrazu','Brak późnych zegarów','Brak zwolnienia resetu HANA'],en:['Console starts with no video','Missing late clocks','HANA reset is not released']},
      flow:['27 MHz · Y3B1','U3B2 · HANA','CPU/GPU clocks','Video output'],
      signals:[
        {pin:'BGA',signal:'ANA_RST_N',fn:{pl:'Reset HANA',en:'HANA reset'},expected:'UNKNOWN · dynamic signal'},
        {pin:'BGA',signal:'SMC_RST_N',fn:{pl:'Reset z logiki SMC',en:'Reset from SMC logic'},expected:'UNKNOWN · dynamic signal'},
        {pin:'BGA',signal:'STBY_CLK',fn:{pl:'Zegar standby',en:'Standby clock'},expected:'UNKNOWN · activity'},
        {pin:'BGA',signal:'ANA_V12P0_PWRGD',fn:{pl:'Informacja o 12 V',en:'12 V power-good input'},expected:'UNKNOWN · dynamic signal'},
        {pin:'XTAL',signal:'Y3B1',fn:{pl:'Kwarc odniesienia',en:'Reference crystal'},expected:'27 MHz · oscillator'}
      ],
      checks:[
        {point:'U3B2 supply area',expected:'V_3P3 / V_1P8',condition:{pl:'Po włączeniu głównych raili',en:'After main rails enable'},region:'hana'},
        {point:'Y3B1',expected:'27 MHz activity',condition:{pl:'Pomiar oscyloskopem z właściwą sondą',en:'Measure with a suitable oscilloscope probe'},region:'hana'},
        {point:'ANA_RST_N',expected:'UNKNOWN · release activity',condition:{pl:'Podczas późnej fazy startu',en:'During the late boot phase'},region:'hana'}
      ]
    },
    {
      ref:'U1E1', name:{pl:'Dwukanałowy kontroler buck ADP1877',en:'ADP1877 dual buck controller'}, region:'mainvrm', mode:'poweron',
      confidence:'SCHEMATIC VERIFIED', pinoutStatus:'verified-subset', primaryRail:'V_5P0',
      role:{pl:'Dwukanałowy kontroler tworzący główne 5 V i 3.3 V po uruchomieniu zasilacza.',en:'Dual-channel controller generating the main 5 V and 3.3 V rails after the PSU starts.'},
      rails:['V_12P0','V_5P0','V_3P3'], related:['L2F1','L1F1','U3D1'],
      symptoms:{pl:['Konsola rozpoczyna start i gaśnie','Brak 5 V lub 3.3 V main','Brak sygnału PGOOD'],en:['Console begins to start then shuts down','Missing main 5 V or 3.3 V','Missing PGOOD']},
      flow:['V_12P0 / VIN','EN1 + EN2','U1E1 · DH/DL','L2F1 / L1F1','5.09 V / 3.3 V'],
      signals:[
        {pin:'26',signal:'VIN',fn:{pl:'Zasilanie kontrolera',en:'Controller supply'},expected:'V_12P0'},
        {pin:'29 / 20',signal:'EN1 / EN2',fn:{pl:'Włączenie kanałów',en:'Channel enables'},expected:'UNKNOWN · dynamic signal'},
        {pin:'6 / 8',signal:'PGOOD1 / PGOOD2',fn:{pl:'Potwierdzenie wyjść',en:'Output power-good'},expected:'UNKNOWN · dynamic signal'},
        {pin:'7 / 19',signal:'FB1 / FB2',fn:{pl:'Sprzężenie zwrotne kanałów',en:'Channel feedback'},expected:'UNKNOWN'},
        {pin:'30 / 1',signal:'DH1 / DL1',fn:{pl:'Sterowanie MOSFET kanału 1',en:'Channel 1 MOSFET drive'},expected:'UNKNOWN · switching'}
      ],
      checks:[
        {point:'L2F1',expected:'5.09 V',condition:{pl:'POWER ON',en:'POWER ON'},region:'mainvrm'},
        {point:'L1F1',expected:'3.3 V',condition:{pl:'POWER ON',en:'POWER ON'},region:'mainvrm'},
        {point:'U1E1 · EN1 / EN2',expected:'UNKNOWN · activity',condition:{pl:'Podczas próby startu',en:'During a start attempt'},region:'southbridge'}
      ]
    },
    {
      ref:'U7C1', name:{pl:'Kontroler CPUCORE NCP4201',en:'NCP4201 CPUCORE controller'}, region:'mainvrm', mode:'poweron',
      confidence:'SCHEMATIC VERIFIED', pinoutStatus:'verified-subset', primaryRail:'V_CPUCORE',
      role:{pl:'Wielofazowy kontroler raila V_CPUCORE dla XCGPU. Oceniaj razem z EN, PGOOD, sterowaniem faz i obciążeniem.',en:'Multiphase V_CPUCORE controller for the XCGPU. Diagnose together with EN, PGOOD, phase drive and load.'},
      rails:['V_12P0','V_CPUCORE','VREG_CPU_EN'], related:['L6C2','U5E1','U3D1'],
      symptoms:{pl:['Błąd 0002 / rail CPUCORE','Natychmiastowe wyłączenie po POWER','Brak napięcia rdzenia'],en:['0002 / CPUCORE rail error','Immediate shutdown after POWER','Missing core voltage']},
      flow:['V_12P0 / VCC','EN/VTT','U7C1 · PWM phases','L6C2','V_CPUCORE'],
      signals:[
        {pin:'26',signal:'EN/VTT',fn:{pl:'Włączenie kontrolera',en:'Controller enable'},expected:'UNKNOWN · dynamic signal'},
        {pin:'6',signal:'PWRGD',fn:{pl:'Potwierdzenie CPUCORE',en:'CPUCORE power-good'},expected:'UNKNOWN · dynamic signal'},
        {pin:'16 / 41',signal:'VCC / VCC3',fn:{pl:'Zasilanie kontrolera',en:'Controller supplies'},expected:'UNKNOWN'},
        {pin:'4 / 5 / 20 / 39',signal:'PWM1–PWM4',fn:{pl:'Sterowanie fazami',en:'Phase drive outputs'},expected:'UNKNOWN · switching'},
        {pin:'37 / 36',signal:'FB / FBRTN',fn:{pl:'Sprzężenie zwrotne',en:'Remote feedback'},expected:'UNKNOWN'},
        {pin:'14 / 2',signal:'FAULT# / ALERT#',fn:{pl:'Sygnały błędu',en:'Fault signals'},expected:'UNKNOWN · dynamic signal'},
        {pin:'7 / 27',signal:'SDA / SCL',fn:{pl:'Interfejs sterowania',en:'Control interface'},expected:'UNKNOWN · activity'}
      ],
      checks:[
        {point:'L6C2',expected:'0.9–1.2 V',condition:{pl:'Po komendzie POWER ON',en:'After POWER ON command'},region:'mainvrm'},
        {point:'U7C1 pin 26 · EN/VTT',expected:'UNKNOWN · transition',condition:{pl:'Podczas próby startu',en:'During a start attempt'},region:'mainvrm'},
        {point:'U7C1 pin 6 · PWRGD',expected:'UNKNOWN · transition',condition:{pl:'Po ustabilizowaniu CPUCORE',en:'After CPUCORE stabilizes'},region:'mainvrm'}
      ]
    },
    {
      ref:'L6C2', name:{pl:'Dławik wyjściowy / punkt CPUCORE',en:'CPUCORE output inductor / measurement point'}, region:'mainvrm', mode:'poweron',
      confidence:'SCHEMATIC VERIFIED', pinoutStatus:'measurement', primaryRail:'V_CPUCORE',
      role:{pl:'Najważniejszy punkt kontroli wyjścia V_CPUCORE. Łączy sekcję fazową kontrolera z obciążeniem XCGPU.',en:'Primary V_CPUCORE output check point. Connects the controller phase section to the XCGPU load.'},
      rails:['V_CPUCORE'], related:['U7C1','U5E1'],
      symptoms:{pl:['Kod 0002','Start i natychmiastowe wyłączenie','Brak raila rdzenia'],en:['Code 0002','Start followed by immediate shutdown','Missing core rail']},
      flow:['U7C1 · PWM','MOSFET phases','L6C2','V_CPUCORE','U5E1'],
      signals:[
        {pin:'OUTPUT',signal:'V_CPUCORE',fn:{pl:'Wyjście do XCGPU',en:'Output to XCGPU'},expected:'0.9–1.2 V · POWER ON'},
        {pin:'SWITCH',signal:'PHASE',fn:{pl:'Strona przełączająca',en:'Switching side'},expected:'UNKNOWN · switching'}
      ],
      checks:[
        {point:'L6C2 · output side',expected:'0.9–1.2 V',condition:{pl:'Po komendzie POWER ON',en:'After POWER ON command'},region:'mainvrm'},
        {point:'V_CPUCORE to GND',expected:'Threshold UNKNOWN',condition:{pl:'Porównawczo, wyłącznie bez zasilania',en:'Comparative check only, with power removed'},region:'mainvrm'},
        {point:'U7C1 · EN/PWRGD',expected:'UNKNOWN · activity',condition:{pl:'Gdy CPUCORE nie powstaje',en:'If CPUCORE is missing'},region:'mainvrm'}
      ]
    },
    {
      ref:'U5E1', name:{pl:'Vejle XCGPU',en:'Vejle XCGPU'}, region:'xcgpu', mode:'run',
      confidence:'SCHEMATIC VERIFIED', pinoutStatus:'interfaces', primaryRail:'V_CPUCORE',
      role:{pl:'Zintegrowany CPU/GPU. Przed podejrzeniem uszkodzenia BGA sprawdź wszystkie raile rdzenia, reset, zegary i wcześniejsze etapy sekwencji.',en:'Integrated CPU/GPU. Before suspecting the BGA, verify every core rail, reset, clocks and all preceding boot stages.'},
      rails:['V_CPUCORE','V_CPUEDRAM','V_CPUVCS','V_MEM'], related:['U7C1','L6C2','L4F1','L5C1','L7F1'],
      symptoms:{pl:['Brak dashboardu po prawidłowym standby','Błędy raili rdzenia','Brak późnego postępu startu'],en:['No dashboard after valid standby','Core-rail errors','No late boot progress']},
      flow:['Standby + main rails','Reset / clocks','U5E1 · XCGPU','NAND execution','Dashboard'],
      signals:[
        {pin:'BGA',signal:'V_CPUCORE',fn:{pl:'Główny rail rdzenia',en:'Main core rail'},expected:'0.9–1.2 V'},
        {pin:'BGA',signal:'V_CPUEDRAM',fn:{pl:'Rail EDRAM',en:'EDRAM rail'},expected:'1.075 V'},
        {pin:'BGA',signal:'V_CPUVCS',fn:{pl:'Rail VCS',en:'VCS rail'},expected:'1.25–1.3 V'},
        {pin:'BGA',signal:'Reset / clocks',fn:{pl:'Interfejsy startowe',en:'Boot interfaces'},expected:'UNKNOWN · activity'},
        {pin:'BGA',signal:'Exact BGA pinout',fn:{pl:'Nieobjęty tym profilem',en:'Not curated in this profile'},expected:'UNKNOWN'}
      ],
      checks:[
        {point:'L6C2',expected:'0.9–1.2 V',condition:{pl:'POWER ON',en:'POWER ON'},region:'mainvrm'},
        {point:'L4F1',expected:'1.075 V',condition:{pl:'POWER ON',en:'POWER ON'},region:'xcgpu'},
        {point:'L5C1',expected:'1.25–1.3 V',condition:{pl:'POWER ON',en:'POWER ON'},region:'xcgpu'},
        {point:'L7F1',expected:'1.8 V',condition:{pl:'POWER ON / pamięć',en:'POWER ON / memory'},region:'xcgpu'}
      ]
    }
  ]
};
