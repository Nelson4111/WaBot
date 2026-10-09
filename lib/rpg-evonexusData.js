import { MALL_RARITIES } from './rpgMallData.js'

export const EVONEXUS_RARITIES = MALL_RARITIES

export const EVONEXUS_ABILITIES = [
  { id: 'sandevistan', name: 'Sandevistan', price: 250000, type: 'enhancement', description: 'Augmentasi saraf yang mempercepat persepsi, refleks, dan respons tubuh terhadap lingkungan.' },
  { id: 'kerenzikov', name: 'Kerenzikov', price: 180000, type: 'enhancement', description: 'Modifikasi sistem saraf yang memungkinkan tubuh bereaksi lebih cepat saat bergerak dan menghindari ancaman.' },
  { id: 'synaptic_accelerator', name: 'Synaptic Accelerator', price: 160000, type: 'enhancement', description: 'Implan sinaptik yang mempercepat transmisi sinyal saraf untuk meningkatkan respons terhadap bahaya.' },
  { id: 'reflex_tuner', name: 'Reflex Tuner', price: 140000, type: 'defense', description: 'Augmentasi refleks yang membantu tubuh menghindari serangan melalui respons otomatis.' },
  { id: 'reinforced_tendons', name: 'Reinforced Tendons', price: 120000, type: 'mobility', description: 'Penguatan tendon sintetis yang meningkatkan daya lompat dan kemampuan bergerak vertikal.' },
  { id: 'fortified_ankles', name: 'Fortified Ankles', price: 110000, type: 'mobility', description: 'Modifikasi pergelangan kaki yang meningkatkan daya lompatan dan kestabilan saat mendarat.' },
  { id: 'gorilla_arms', name: 'Gorilla Arms', price: 220000, type: 'attack', description: 'Augmentasi otot dan lengan mekanis yang meningkatkan kekuatan pukulan serta kemampuan mengangkat beban.' },
  { id: 'subdermal_armor', name: 'Subdermal Armor', price: 200000, type: 'defense', description: 'Lapisan pelindung yang ditanam di bawah kulit untuk mengurangi dampak serangan fisik.' },
  { id: 'optical_camo', name: 'Optical Camouflage', price: 280000, type: 'stealth', description: 'Sistem penyamaran optik yang mengurangi visibilitas tubuh dengan memanipulasi cahaya di sekitarnya.' },
  { id: 'biomonitor', name: 'Biomonitor', price: 90000, type: 'utility', description: 'Implan pemantau kondisi biologis yang membaca tanda vital dan mendeteksi perubahan kondisi tubuh.' },
  { id: 'blood_pump', name: 'Blood Pump', price: 150000, type: 'recovery', description: 'Sistem sirkulasi buatan yang membantu menjaga aliran darah dan memulihkan kondisi tubuh.' },
  { id: 'second_heart', name: 'Second Heart', price: 320000, type: 'recovery', description: 'Sistem jantung tambahan yang membantu mempertahankan fungsi sirkulasi ketika tubuh mengalami kondisi kritis.' },
  { id: 'adrenaline_regulator', name: 'Adrenaline Regulator', price: 130000, type: 'enhancement', description: 'Implan hormonal yang mengatur pelepasan adrenalin untuk meningkatkan performa dalam situasi berbahaya.' },
  { id: 'pain_editor', name: 'Pain Editor', price: 170000, type: 'defense', description: 'Modifikasi saraf yang menekan persepsi rasa sakit sehingga tubuh tetap dapat berfungsi saat terluka.' },
  { id: 'neofiber', name: 'Neofiber', price: 145000, type: 'defense', description: 'Serat sintetis yang memperkuat jaringan tubuh dan meningkatkan ketahanan terhadap tekanan fisik.' },
  { id: 'cybernetic_lungs', name: 'Cybernetic Lungs', price: 190000, type: 'enhancement', description: 'Paru-paru hasil rekayasa yang meningkatkan efisiensi pertukaran oksigen dan kapasitas pernapasan.' },
  { id: 'neural_interface', name: 'Neural Interface', price: 180000, type: 'utility', description: 'Implan penghubung otak dengan sistem digital yang memungkinkan perangkat dikendalikan melalui sinyal saraf.' },
  { id: 'cognitive_accelerator', name: 'Cognitive Accelerator', price: 240000, type: 'enhancement', description: 'Augmentasi kognitif yang meningkatkan kecepatan analisis, konsentrasi, dan pengambilan keputusan.' },
  { id: 'retinal_hud', name: 'Retinal HUD', price: 125000, type: 'utility', description: 'Antarmuka visual internal yang menampilkan informasi, navigasi, dan data lingkungan langsung pada penglihatan.' },
  { id: 'smart_vision', name: 'Smart Vision', price: 135000, type: 'utility', description: 'Peningkatan penglihatan yang membantu mengenali objek, membaca pola gerakan, dan menganalisis lingkungan.' },
  { id: 'reflex_prediction', name: 'Reflex Prediction', price: 220000, type: 'enhancement', description: 'Sistem prediksi saraf yang memperkirakan pergerakan ancaman untuk membantu pengguna bereaksi lebih awal.' },
  { id: 'synthetic_muscles', name: 'Synthetic Muscle Fibers', price: 200000, type: 'enhancement', description: 'Serat otot buatan yang meningkatkan kekuatan, daya tahan, dan efisiensi gerakan tubuh.' },
  { id: 'bone_reinforcement', name: 'Bone Reinforcement', price: 175000, type: 'defense', description: 'Penguatan tulang menggunakan material sintetis untuk meningkatkan ketahanan terhadap benturan dan tekanan.' },
  { id: 'motor_control', name: 'Motor Control Enhancement', price: 190000, type: 'enhancement', description: 'Modifikasi saraf motorik yang meningkatkan koordinasi, keseimbangan, dan ketepatan gerakan.' },
  { id: 'neural_overclock', name: 'Neural Overclock', price: 280000, type: 'enhancement', description: 'Peningkatan sementara aktivitas pemrosesan saraf untuk mempercepat pemikiran dan koordinasi tubuh.' },
  { id: 'brain_computer_interface', name: 'Brain-Computer Interface', price: 220000, type: 'utility', description: 'Sistem penerjemah aktivitas otak yang memungkinkan pengguna berinteraksi langsung dengan teknologi digital.' },
  { id: 'memory_enhancement', name: 'Memory Enhancement', price: 190000, type: 'utility', description: 'Modifikasi kognitif yang meningkatkan kemampuan menyimpan, mengakses, dan mengingat informasi.' },
  { id: 'sensory_amplification', name: 'Sensory Amplification', price: 175000, type: 'enhancement', description: 'Peningkatan sistem sensorik yang mempertajam pendengaran, penglihatan, penciuman, dan persepsi lingkungan.' },
  { id: 'neural_shield', name: 'Neural Shield', price: 250000, type: 'defense', description: 'Perlindungan sistem saraf yang mengurangi dampak gangguan elektromagnetik dan serangan berbasis sinyal.' },
  { id: 'targeting_assist', name: 'Targeting Assist', price: 170000, type: 'enhancement', description: 'Augmentasi sensorik dan kognitif yang meningkatkan akurasi dalam melacak serta memperkirakan posisi target.' },
  { id: 'genetic_enhancement', name: 'Genetic Enhancement', price: 280000, type: 'enhancement', description: 'Rekayasa genetik yang meningkatkan karakteristik biologis tertentu, seperti kekuatan, daya tahan, atau kecepatan pemulihan.' },
  { id: 'cellular_reinforcement', name: 'Cellular Reinforcement', price: 270000, type: 'defense', description: 'Modifikasi struktur sel yang meningkatkan ketahanan jaringan tubuh terhadap kerusakan.' },
  { id: 'regenerative_cells', name: 'Regenerative Cells', price: 260000, type: 'recovery', description: 'Sel hasil rekayasa yang mempercepat pembentukan jaringan baru untuk memulihkan cedera.' },
  { id: 'adaptive_immune_system', name: 'Adaptive Immune System', price: 230000, type: 'defense', description: 'Peningkatan sistem kekebalan yang membantu tubuh mengenali dan melawan ancaman biologis.' },
  { id: 'synthetic_organs', name: 'Synthetic Organ Integration', price: 220000, type: 'enhancement', description: 'Penggantian organ biologis dengan organ buatan yang dirancang untuk meningkatkan fungsi tubuh.' },
  { id: 'nanite_repair', name: 'Nanite Repair System', price: 300000, type: 'recovery', description: 'Nanomesin internal yang memperbaiki kerusakan jaringan dan membantu menjaga kestabilan fungsi biologis.' },
  { id: 'metabolic_overdrive', name: 'Metabolic Overdrive', price: 230000, type: 'enhancement', description: 'Modifikasi metabolisme yang meningkatkan produksi energi tubuh untuk mendukung aktivitas intensif.' },
  { id: 'oxygen_efficiency', name: 'Oxygen Efficiency', price: 130000, type: 'enhancement', description: 'Rekayasa sistem pernapasan dan metabolisme yang meningkatkan pemanfaatan oksigen.' },
  { id: 'thermal_regulation', name: 'Thermal Regulation', price: 150000, type: 'defense', description: 'Sistem pengatur suhu internal yang membantu tubuh bertahan dalam kondisi panas maupun dingin ekstrem.' },
  { id: 'radiation_resistance', name: 'Radiation Resistance', price: 240000, type: 'defense', description: 'Modifikasi biologis yang meningkatkan kemampuan sel menghadapi paparan radiasi.' },
  { id: 'toxin_filter', name: 'Toxin Filter', price: 155000, type: 'defense', description: 'Sistem penyaringan internal yang membantu mendeteksi, menguraikan, atau mengurangi dampak zat beracun tertentu.' },
  { id: 'adaptive_skin', name: 'Adaptive Skin', price: 240000, type: 'defense', description: 'Modifikasi kulit yang mengubah karakteristik permukaannya untuk meningkatkan perlindungan terhadap kondisi lingkungan.' },
  { id: 'combat_stimulant', name: 'Combat Stimulant System', price: 160000, type: 'enhancement', description: 'Sistem internal yang mengatur pelepasan stimulan untuk meningkatkan kesiapan fisik dalam waktu terbatas.' },
  { id: 'impact_absorption', name: 'Impact Absorption', price: 180000, type: 'defense', description: 'Jaringan dan struktur internal yang diperkuat untuk menyerap serta menyebarkan energi benturan.' },
  { id: 'adaptive_combat_system', name: 'Adaptive Combat System', price: 300000, type: 'enhancement', description: 'Sistem augmentasi yang menganalisis pola pertempuran dan menyesuaikan respons motorik pengguna.' },
  { id: 'bioelectric_control', name: 'Bioelectric Control', price: 280000, type: 'attack', description: 'Modifikasi sistem biologis yang memungkinkan pengguna mengendalikan dan melepaskan energi listrik.' },
  { id: 'electroreception', name: 'Electroreception', price: 210000, type: 'utility', description: 'Peningkatan sensorik yang memungkinkan pengguna mendeteksi medan listrik dan aktivitas listrik di sekitarnya.' },
  { id: 'magnetic_sense', name: 'Magnetic Sense', price: 220000, type: 'utility', description: 'Augmentasi sensorik yang memungkinkan pengguna mendeteksi medan magnet dan perubahan elektromagnetik.' },
  { id: 'electromagnetic_pulse', name: 'Electromagnetic Pulse', price: 290000, type: 'attack', description: 'Sistem bioelektrik yang menghasilkan pulsa elektromagnetik untuk mengganggu perangkat elektronik di sekitar.' },
  { id: 'energy_absorption', name: 'Energy Absorption', price: 320000, type: 'defense', description: 'Modifikasi jaringan yang menyerap jenis energi tertentu dan menyimpannya untuk penggunaan berikutnya.' },
  { id: 'energy_conversion', name: 'Energy Conversion', price: 300000, type: 'enhancement', description: 'Sistem internal yang mengubah energi terserap menjadi tenaga untuk mendukung fungsi tubuh.' },
  { id: 'biotic_amplifier', name: 'Biotic Amplifier', price: 280000, type: 'enhancement', description: 'Implan penguat biotik yang membantu menghasilkan dan mengendalikan medan massa melalui interaksi dengan materi.' },
  { id: 'biotic_barrier', name: 'Biotic Barrier', price: 240000, type: 'defense', description: 'Medan biotik yang membentuk lapisan perlindungan energi di sekitar tubuh.' },
  { id: 'biotic_charge', name: 'Biotic Charge', price: 260000, type: 'mobility', description: 'Manipulasi medan biotik yang mendorong pengguna menuju sasaran dengan percepatan tinggi.' },
  { id: 'biotic_lift', name: 'Biotic Lift', price: 220000, type: 'control', description: 'Manipulasi medan massa yang mengangkat target dan membuatnya melayang untuk sementara.' },
  { id: 'biotic_throw', name: 'Biotic Throw', price: 230000, type: 'attack', description: 'Pelepasan gaya biotik yang mendorong target menjauh dengan tekanan medan massa.' },
  { id: 'biotic_singularity', name: 'Biotic Singularity', price: 300000, type: 'control', description: 'Pembentukan medan biotik terpusat yang menarik dan menahan target di area tertentu.' },
  { id: 'biotic_warp', name: 'Biotic Warp', price: 250000, type: 'attack', description: 'Manipulasi medan massa yang mengganggu struktur dan kestabilan target.' },
  { id: 'biotic_nova', name: 'Biotic Nova', price: 320000, type: 'attack', description: 'Pelepasan energi biotik dalam gelombang radial yang menghantam target di sekitar pengguna.' },
  { id: 'biotic_stasis', name: 'Biotic Stasis', price: 240000, type: 'control', description: 'Medan biotik yang menahan target dalam keadaan tidak bergerak untuk sementara.' },
  { id: 'biotic_pull', name: 'Biotic Pull', price: 220000, type: 'control', description: 'Manipulasi medan massa yang menarik target menuju titik yang ditentukan.' },
  { id: 'biotic_slam', name: 'Biotic Slam', price: 260000, type: 'attack', description: 'Medan biotik yang membanting target ke permukaan menggunakan gaya gravitasi buatan.' },
  { id: 'biological_camouflage', name: 'Biological Camouflage', price: 260000, type: 'stealth', description: 'Modifikasi sel dan jaringan yang mengubah warna permukaan tubuh untuk menyatu dengan lingkungan.' },
  { id: 'chromatophore_skin', name: 'Chromatophore Skin', price: 200000, type: 'stealth', description: 'Rekayasa sel kulit yang memungkinkan perubahan warna dan pola permukaan tubuh secara dinamis.' },
  { id: 'enhanced_regeneration', name: 'Enhanced Regeneration', price: 300000, type: 'recovery', description: 'Peningkatan biologis yang mempercepat pemulihan jaringan, luka, dan kerusakan sel.' },
  { id: 'limb_regeneration', name: 'Limb Regeneration', price: 350000, type: 'recovery', description: 'Rekayasa regeneratif yang memungkinkan pertumbuhan kembali jaringan anggota tubuh yang rusak atau hilang.' },
  { id: 'cloning_compatibility', name: 'Cloning Compatibility', price: 330000, type: 'utility', description: 'Modifikasi biologis yang memungkinkan jaringan tubuh berkembang dalam proses kloning dengan tingkat kompatibilitas tinggi.' },
  { id: 'consciousness_backup', name: 'Consciousness Backup', price: 320000, type: 'utility', description: 'Teknologi saraf yang menyimpan pola memori dan informasi kesadaran untuk kemungkinan pemulihan di masa depan.' },
  { id: 'neural_transfer', name: 'Neural Transfer', price: 350000, type: 'utility', description: 'Teknologi pemindahan pola saraf yang memungkinkan informasi kesadaran dialihkan ke wadah biologis atau sintetis yang kompatibel.' },
  { id: 'memory_reconstruction', name: 'Memory Reconstruction', price: 230000, type: 'utility', description: 'Sistem pemrosesan saraf yang merekonstruksi ingatan dari jejak memori dan data yang masih tersimpan.' },
  { id: 'cybernetic_integration', name: 'Cybernetic Integration', price: 290000, type: 'enhancement', description: 'Integrasi perangkat mekanis dengan jaringan biologis untuk meningkatkan fungsi fisik dan sensorik.' },
  { id: 'synthetic_nervous_system', name: 'Synthetic Nervous System', price: 310000, type: 'enhancement', description: 'Sistem saraf buatan yang meningkatkan transmisi sinyal, koordinasi, dan kendali anggota tubuh.' },
  { id: 'internal_tool_integration', name: 'Internal Tool Integration', price: 180000, type: 'utility', description: 'Integrasi modul teknologi internal yang memungkinkan pengguna menjalankan fungsi diagnostik dan kendali perangkat.' },
  { id: 'nanite_swarm_control', name: 'Nanite Swarm Control', price: 310000, type: 'utility', description: 'Antarmuka saraf yang mengendalikan kumpulan nanomesin untuk tugas perbaikan, pemindaian, atau manipulasi material.' },
  { id: 'nanite_armor', name: 'Nanite Armor', price: 330000, type: 'defense', description: 'Nanomesin yang membentuk lapisan pelindung adaptif di permukaan tubuh ketika ancaman terdeteksi.' },
  { id: 'programmable_matter', name: 'Programmable Matter', price: 360000, type: 'utility', description: 'Modul kendali material yang memungkinkan materi sintetis berubah bentuk sesuai pola yang diprogram.' },
  { id: 'adaptive_exoskeleton', name: 'Adaptive Exoskeleton', price: 280000, type: 'enhancement', description: 'Struktur pendukung terintegrasi yang memperkuat gerakan, distribusi beban, dan kestabilan tubuh.' },
  { id: 'micro_thruster_system', name: 'Micro-Thruster System', price: 270000, type: 'mobility', description: 'Pendorong mini terintegrasi yang membantu melakukan manuver cepat, perubahan arah, dan koreksi posisi di udara.' },
  { id: 'gravity_manipulation', name: 'Gravity Manipulation', price: 380000, type: 'control', description: 'Modul teknologi gravitasi yang mengubah gaya gravitasi lokal untuk memengaruhi gerakan benda dan tubuh.' },
  { id: 'inertial_dampening', name: 'Inertial Dampening', price: 300000, type: 'defense', description: 'Sistem pengendali inersia yang mengurangi efek percepatan mendadak dan benturan terhadap tubuh.' },
  { id: 'localized_force_field', name: 'Localized Force Field', price: 340000, type: 'defense', description: 'Generator medan gaya terintegrasi yang membentuk perlindungan energi pada area dekat tubuh.' },
  { id: 'portal_generation', name: 'Portal Generation', price: 400000, type: 'mobility', description: 'Teknologi ruang yang membuka jalur penghubung antara dua titik untuk perpindahan jarak jauh.' },
  { id: 'dimensional_anchor', name: 'Dimensional Anchor', price: 350000, type: 'defense', description: 'Sistem penstabil ruang yang menjaga posisi pengguna tetap terikat pada koordinat dimensi tertentu.' },
  { id: 'dimensional_sensing', name: 'Dimensional Sensing', price: 320000, type: 'utility', description: 'Augmentasi sensorik yang mendeteksi ketidakstabilan ruang, celah dimensi, dan anomali antardimensi.' },
  { id: 'spatial_compression', name: 'Spatial Compression', price: 390000, type: 'utility', description: 'Manipulasi ruang yang memperkecil jarak efektif antara objek atau lokasi tertentu.' },
  { id: 'teleportation_module', name: 'Teleportation Module', price: 380000, type: 'mobility', description: 'Sistem perpindahan ruang yang memindahkan pengguna dari satu lokasi ke lokasi lain tanpa melewati jalur fisik di antaranya.' },
  { id: 'phase_shifting', name: 'Phase Shifting', price: 370000, type: 'defense', description: 'Modifikasi fase materi yang memungkinkan tubuh melewati penghalang padat dalam kondisi dan durasi terbatas.' },
  { id: 'molecular_restructuring', name: 'Molecular Restructuring', price: 390000, type: 'utility', description: 'Teknologi manipulasi molekul yang mengubah susunan material tertentu untuk menghasilkan sifat atau bentuk baru.' },
  { id: 'alien_bioadaptation', name: 'Alien Bioadaptation', price: 320000, type: 'enhancement', description: 'Rekayasa biologis berbasis organisme ekstraterestrial yang membantu tubuh menyesuaikan diri terhadap lingkungan asing.' },
  { id: 'xenobiological_symbiosis', name: 'Xenobiological Symbiosis', price: 340000, type: 'enhancement', description: 'Integrasi organisme asing dengan tubuh untuk memperoleh fungsi biologis tambahan melalui hubungan simbiotik.' },
  { id: 'adaptive_evolution', name: 'Adaptive Evolution', price: 360000, type: 'enhancement', description: 'Modifikasi genetik adaptif yang memungkinkan karakteristik biologis berkembang sebagai respons terhadap tekanan lingkungan.' },
  { id: 'extremophile_adaptation', name: 'Extremophile Adaptation', price: 300000, type: 'defense', description: 'Rekayasa biologis yang meningkatkan toleransi tubuh terhadap tekanan, suhu, atmosfer, atau kondisi lingkungan ekstrem.' },
  { id: 'bioelectric_shield', name: 'Bioelectric Shield', price: 310000, type: 'defense', description: 'Lapisan energi listrik yang dihasilkan melalui sistem biologis termodifikasi untuk mengurangi dampak serangan.' },
  { id: 'energy_projection', name: 'Energy Projection', price: 360000, type: 'attack', description: 'Augmentasi yang mengumpulkan dan melepaskan energi terkendali sebagai gelombang serangan jarak jauh.' },
  { id: 'plasma_generation', name: 'Plasma Generation', price: 390000, type: 'attack', description: 'Sistem energi internal yang menghasilkan dan mengendalikan plasma bersuhu tinggi untuk menyerang target.' },
  { id: 'sonic_emission', name: 'Sonic Emission', price: 280000, type: 'attack', description: 'Modifikasi organ resonansi yang menghasilkan gelombang suara terarah untuk mengganggu atau melukai target.' },
  { id: 'sonic_barrier', name: 'Sonic Barrier', price: 260000, type: 'defense', description: 'Gelombang suara terkontrol yang membentuk zona penahan untuk mengurangi dampak gangguan dari luar.' },
  { id: 'pheromone_control', name: 'Pheromone Control', price: 220000, type: 'control', description: 'Modifikasi kelenjar biologis yang mengatur pelepasan senyawa kimia untuk memengaruhi respons perilaku organisme tertentu.' },
  { id: 'neurochemical_regulation', name: 'Neurochemical Regulation', price: 240000, type: 'enhancement', description: 'Rekayasa sistem kimia otak yang mengatur konsentrasi, kewaspadaan, dan kestabilan respons emosional.' },
  { id: 'autonomous_healing', name: 'Autonomous Healing', price: 330000, type: 'recovery', description: 'Sistem pemulihan otomatis yang mendeteksi cedera dan mengaktifkan proses regenerasi tanpa kendali sadar.' },
  { id: 'distributed_consciousness', name: 'Distributed Consciousness', price: 400000, type: 'utility', description: 'Arsitektur kesadaran terdistribusi yang memungkinkan proses kognitif berjalan melalui beberapa unit biologis atau sintetis yang terhubung.' },
  { id: 'cybernetic_body', name: 'Cybernetic Body', price: 300000, type: 'enhancement', description: 'Integrasi teknologi sibernetik dengan tubuh untuk meningkatkan kekuatan, ketahanan, dan fungsi biologis.' },
  { id: 'cybernetic_skeleton', name: 'Cybernetic Skeleton', price: 260000, type: 'defense', description: 'Kerangka internal yang diperkuat komponen mekanis untuk meningkatkan ketahanan tulang dan struktur tubuh.' },
  { id: 'cybernetic_arms', name: 'Cybernetic Arms', price: 220000, type: 'enhancement', description: 'Anggota tubuh mekanis yang meningkatkan kekuatan, ketepatan gerakan, dan kemampuan manipulasi objek.' },
  { id: 'modular_limbs', name: 'Modular Limb Integration', price: 250000, type: 'enhancement', description: 'Sistem anggota tubuh modular yang memungkinkan komponen tubuh diganti atau disesuaikan dengan kebutuhan.' },
  { id: 'internal_tool_system', name: 'Internal Tool System', price: 230000, type: 'utility', description: 'Integrasi modul teknologi ke dalam tubuh yang memungkinkan berbagai fungsi teknis dijalankan secara langsung.' },
  { id: 'palm_energy_emitter', name: 'Palm Energy Emitter', price: 280000, type: 'attack', description: 'Emitor energi terintegrasi pada telapak tangan yang melepaskan serangan energi terarah.' },
  { id: 'integrated_laser_emission', name: 'Integrated Laser Emission', price: 290000, type: 'attack', description: 'Sistem internal yang menghasilkan pancaran energi laser untuk menyerang target pada jarak tertentu.' },
  { id: 'wrist_module_deployment', name: 'Wrist Module Deployment', price: 220000, type: 'utility', description: 'Modul pergelangan tangan yang dapat mengaktifkan perangkat internal sesuai kebutuhan pengguna.' },
  { id: 'deterrent_field', name: 'Deterrent Field', price: 320000, type: 'defense', description: 'Medan pertahanan otomatis yang memberikan respons berbahaya kepada objek yang menyentuh batas perlindungan.' },
  { id: 'invisible_force_shield', name: 'Invisible Force Shield', price: 300000, type: 'defense', description: 'Medan gaya tak kasatmata yang menghalangi benturan, pukulan, dan proyektil tertentu.' },
  { id: 'projectile_deflection', name: 'Projectile Deflection', price: 280000, type: 'defense', description: 'Sistem pertahanan yang mendeteksi proyektil masuk dan mengubah lintasannya sebelum mengenai tubuh.' },
  { id: 'impact_deflection', name: 'Impact Deflection', price: 260000, type: 'defense', description: 'Medan gaya otomatis yang mengalihkan sebagian energi benturan dan serangan fisik.' },
  { id: 'automatic_protection', name: 'Automatic Protection', price: 250000, type: 'defense', description: 'Sistem pertahanan terintegrasi yang aktif ketika sensor mendeteksi ancaman terhadap pengguna.' },
  { id: 'emergency_bubble', name: 'Emergency Protection Bubble', price: 270000, type: 'defense', description: 'Perisai berbentuk kubah yang menyelimuti tubuh untuk menahan ancaman dari berbagai arah.' },
  { id: 'optical_invisibility_detection', name: 'Optical Invisibility Detection', price: 190000, type: 'utility', description: 'Peningkatan sensor optik yang membantu mendeteksi objek dan organisme yang disamarkan secara visual.' },
  { id: 'multispectrum_vision', name: 'Multispectrum Vision', price: 210000, type: 'utility', description: 'Sistem penglihatan yang membaca berbagai spektrum cahaya untuk mengungkap detail yang tidak terlihat mata biasa.' },
  { id: 'threat_analysis', name: 'Threat Analysis', price: 200000, type: 'utility', description: 'Sistem analisis internal yang menilai ancaman berdasarkan gerakan, lingkungan, dan pola perilaku.' },
  { id: 'combat_prediction', name: 'Combat Prediction', price: 250000, type: 'enhancement', description: 'Pemrosesan prediktif yang memperkirakan tindakan lawan untuk membantu pengguna memilih respons.' },
  { id: 'cybernetic_reflexes', name: 'Cybernetic Reflexes', price: 240000, type: 'enhancement', description: 'Penguatan sistem saraf dengan komponen digital untuk mempercepat respons terhadap rangsangan.' },
  { id: 'neural_processing_boost', name: 'Neural Processing Boost', price: 260000, type: 'enhancement', description: 'Peningkatan pemrosesan saraf yang mempercepat analisis informasi dan koordinasi tubuh.' },
  { id: 'remote_neural_control', name: 'Remote Neural Control', price: 270000, type: 'utility', description: 'Antarmuka saraf yang memungkinkan sistem eksternal dikendalikan dari jarak jauh melalui sinyal neural.' },
  { id: 'cybernetic_puppetry', name: 'Cybernetic Puppetry', price: 310000, type: 'control', description: 'Antarmuka kendali saraf yang memungkinkan sistem mekanis atau tubuh yang kompatibel dikendalikan melalui koneksi neural.' },
  { id: 'neural_system_intrusion', name: 'Neural System Intrusion', price: 300000, type: 'control', description: 'Kemampuan meretas sistem saraf digital yang terhubung dan mengganggu kendali motoriknya.' },
  { id: 'cybernetic_hacking', name: 'Cybernetic Hacking', price: 280000, type: 'utility', description: 'Peningkatan antarmuka digital yang memungkinkan akses dan manipulasi sistem teknologi yang kompatibel.' },
  { id: 'remote_system_override', name: 'Remote System Override', price: 290000, type: 'control', description: 'Kemampuan mengambil alih fungsi perangkat digital melalui akses jarak jauh dan protokol kendali.' },
  { id: 'memory_extraction', name: 'Memory Extraction', price: 280000, type: 'utility', description: 'Teknologi neural yang membaca dan mengekstrak fragmen ingatan dari sistem memori yang dapat diakses.' },
  { id: 'memory_projection', name: 'Memory Projection', price: 250000, type: 'utility', description: 'Kemampuan memvisualisasikan ingatan sebagai representasi yang dapat diamati dan dijelajahi.' },
  { id: 'memory_recovery', name: 'Memory Recovery', price: 260000, type: 'recovery', description: 'Teknologi neural yang menyusun kembali ingatan dari data memori yang masih tersimpan.' },
  { id: 'memory_suppression', name: 'Memory Suppression', price: 270000, type: 'control', description: 'Modifikasi pemrosesan neural yang menekan akses terhadap ingatan tertentu untuk sementara.' },
  { id: 'memory_restoration', name: 'Memory Restoration', price: 280000, type: 'recovery', description: 'Proses pemulihan pola ingatan yang sebelumnya terhapus atau sulit diakses.' },
  { id: 'consciousness_restoration_backup', name: 'Consciousness Restoration Backup', price: 350000, type: 'recovery', description: 'Penyimpanan pola kesadaran dan informasi neural sebagai cadangan apabila tubuh utama tidak dapat digunakan.' },
  { id: 'consciousness_transfer', name: 'Consciousness Transfer', price: 380000, type: 'utility', description: 'Pemindahan pola kesadaran ke wadah biologis atau sintetis lain yang kompatibel.' },
  { id: 'clone_body_transfer', name: 'Clone Body Transfer', price: 390000, type: 'recovery', description: 'Pemulihan kesadaran melalui pemindahan data neural ke tubuh kloning yang telah disiapkan.' },
  { id: 'holographic_consciousness', name: 'Holographic Consciousness', price: 320000, type: 'utility', description: 'Representasi digital kesadaran yang dapat berinteraksi melalui proyeksi holografis.' },
  { id: 'automated_resurrection', name: 'Automated Resurrection', price: 420000, type: 'recovery', description: 'Protokol darurat yang mengaktifkan cadangan kesadaran dan memulai proses pemulihan setelah kematian tubuh.' },
  { id: 'distributed_backup_network', name: 'Distributed Backup Network', price: 400000, type: 'recovery', description: 'Jaringan penyimpanan cadangan yang mendistribusikan data kesadaran ke beberapa lokasi berbeda.' },
  { id: 'clone_compatibility', name: 'Clone Compatibility', price: 300000, type: 'utility', description: 'Modifikasi biologis yang meningkatkan kompatibilitas jaringan dan data neural dengan tubuh hasil kloning.' },
  { id: 'rapid_clone_growth', name: 'Rapid Clone Growth', price: 360000, type: 'utility', description: 'Rekayasa pertumbuhan sel yang mempercepat pengembangan tubuh kloning hingga mencapai tahap yang dapat digunakan.' },
  { id: 'clone_memory_imprinting', name: 'Clone Memory Imprinting', price: 340000, type: 'utility', description: 'Penanaman data memori dan pola perilaku ke dalam sistem neural tubuh hasil kloning.' },
  { id: 'biological_body_reconstruction', name: 'Biological Body Reconstruction', price: 380000, type: 'recovery', description: 'Rekayasa jaringan yang membangun kembali struktur biologis berdasarkan pola tubuh yang tersimpan.' },
  { id: 'rapid_cellular_repair', name: 'Rapid Cellular Repair', price: 300000, type: 'recovery', description: 'Sistem pemulihan sel yang mempercepat perbaikan jaringan tubuh setelah mengalami kerusakan.' },
  { id: 'organ_reconstruction', name: 'Organ Reconstruction', price: 330000, type: 'recovery', description: 'Teknologi regeneratif yang memperbaiki atau membentuk ulang organ biologis yang mengalami kerusakan.' },
  { id: 'cybernetic_organ_replacement', name: 'Cybernetic Organ Replacement', price: 310000, type: 'enhancement', description: 'Penggantian organ biologis dengan sistem sintetis yang dirancang untuk mempertahankan atau meningkatkan fungsinya.' },
  { id: 'biological_reconfiguration', name: 'Biological Reconfiguration', price: 340000, type: 'enhancement', description: 'Modifikasi struktur biologis yang mengubah karakteristik tubuh sesuai parameter yang telah ditentukan.' },
  { id: 'body_morphing', name: 'Body Morphing', price: 360000, type: 'enhancement', description: 'Kemampuan mengubah bentuk dan susunan tubuh melalui rekayasa jaringan dan kendali biologis.' },
  { id: 'growth_rate_control', name: 'Growth Rate Control', price: 290000, type: 'utility', description: 'Pengendalian proses pertumbuhan biologis untuk mempercepat atau memperlambat perkembangan jaringan.' },
  { id: 'molecular_restructuring_matrix', name: 'Molecular Restructuring Matrix', price: 390000, type: 'utility', description: 'Teknologi yang menyusun ulang struktur molekul material tertentu untuk menghasilkan perubahan sifat atau bentuk.' },
  { id: 'chemical_adaptation', name: 'Chemical Adaptation', price: 250000, type: 'defense', description: 'Modifikasi metabolisme yang membantu tubuh beradaptasi terhadap senyawa kimia dan lingkungan berbahaya.' },
  { id: 'experimental_mutation', name: 'Experimental Mutation', price: 320000, type: 'enhancement', description: 'Perubahan biologis hasil eksperimen yang memberikan karakteristik baru pada tubuh dengan hasil yang bergantung pada modifikasi.' },
  { id: 'genetic_reprogramming', name: 'Genetic Reprogramming', price: 360000, type: 'enhancement', description: 'Pengubahan ekspresi gen untuk menyesuaikan karakteristik biologis dan fungsi jaringan tertentu.' },
  { id: 'portal_spatial_travel', name: 'Spatial Portal Travel', price: 350000, type: 'mobility', description: 'Kemampuan membuka jalur ruang yang menghubungkan dua lokasi berbeda dalam satu dimensi.' },
  { id: 'interdimensional_travel', name: 'Interdimensional Travel', price: 400000, type: 'mobility', description: 'Kemampuan berpindah antardimensi melalui manipulasi ruang dan koordinat realitas.' },
  { id: 'multiversal_navigation', name: 'Multiversal Navigation', price: 370000, type: 'utility', description: 'Sistem navigasi yang menghitung dan menentukan koordinat tujuan di antara berbagai realitas.' },
  { id: 'portal_destination_lock', name: 'Portal Destination Lock', price: 280000, type: 'utility', description: 'Penguncian koordinat tujuan agar jalur portal terhubung ke lokasi yang telah dipilih secara akurat.' },
  { id: 'portal_stability_control', name: 'Portal Stability Control', price: 300000, type: 'utility', description: 'Pengendalian kestabilan portal untuk mengurangi gangguan selama jalur perpindahan digunakan.' },
  { id: 'portal_energy_efficiency', name: 'Portal Energy Efficiency', price: 290000, type: 'enhancement', description: 'Peningkatan efisiensi penggunaan energi saat membuka dan mempertahankan jalur portal.' },
  { id: 'portal_spectrum_analysis', name: 'Portal Spectrum Analysis', price: 260000, type: 'utility', description: 'Kemampuan menganalisis karakteristik energi dan struktur portal sebelum pengguna melewatinya.' },
  { id: 'dimensional_boundary_sensing', name: 'Dimensional Boundary Sensing', price: 320000, type: 'utility', description: 'Deteksi perubahan struktur ruang yang menandai batas antara satu realitas dan realitas lainnya.' },
  { id: 'dimensional_barrier_breach', name: 'Dimensional Barrier Breach', price: 420000, type: 'attack', description: 'Manipulasi energi ruang yang membuka celah pada penghalang antardimensi yang sangat kuat.' },
  { id: 'dimensional_barrier_resistance', name: 'Dimensional Barrier Resistance', price: 380000, type: 'defense', description: 'Peningkatan kestabilan tubuh dan sistem neural saat melewati batas antardimensi yang tidak stabil.' },
  { id: 'extradimensional_access', name: 'Extradimensional Access', price: 430000, type: 'mobility', description: 'Kemampuan mengakses realitas yang berada di luar jaringan dimensi yang biasanya dapat dijangkau.' },
  { id: 'dimensional_energy_harness', name: 'Dimensional Energy Harness', price: 390000, type: 'enhancement', description: 'Teknologi yang memanfaatkan energi dari anomali ruang untuk mendukung sistem augmentasi.' },
  { id: 'closed_dimension_escape', name: 'Closed Dimension Escape', price: 410000, type: 'mobility', description: 'Kemampuan mencari dan membuka jalur keluar dari ruang dimensi yang terisolasi atau terkunci.' },
  { id: 'spatial_anomaly_detection', name: 'Spatial Anomaly Detection', price: 250000, type: 'utility', description: 'Sistem sensor yang mendeteksi anomali ruang, distorsi lokasi, dan ketidakstabilan dimensi.' },
  { id: 'microverse_environment_adaptation', name: 'Microverse Adaptation', price: 280000, type: 'survival', description: 'Peningkatan biologis dan sensorik untuk bertahan di lingkungan berskala mikro dengan kondisi fisik berbeda.' },
  { id: 'pocket_dimension_access', name: 'Pocket Dimension Access', price: 350000, type: 'utility', description: 'Kemampuan membuka akses ke ruang terisolasi yang memiliki karakteristik lingkungan dan aliran waktu tersendiri.' },
  { id: 'pocket_dimension_survival', name: 'Pocket Dimension Survival', price: 300000, type: 'survival', description: 'Adaptasi tubuh yang membantu bertahan di ruang tertutup dengan sumber daya dan kondisi lingkungan terbatas.' },
  { id: 'temporal_displacement', name: 'Temporal Displacement', price: 420000, type: 'mobility', description: 'Teknologi yang memindahkan pengguna ke titik waktu berbeda melalui manipulasi ruang-waktu.' },
  { id: 'temporal_anchor', name: 'Temporal Anchor', price: 350000, type: 'defense', description: 'Sistem penstabil temporal yang membantu mempertahankan posisi pengguna terhadap perubahan waktu lokal.' },
  { id: 'timeline_scan', name: 'Timeline Scan', price: 330000, type: 'utility', description: 'Pemindaian kemungkinan perubahan waktu untuk mengidentifikasi perbedaan antara rangkaian peristiwa.' },
  { id: 'parallel_reality_shift', name: 'Parallel Reality Shift', price: 400000, type: 'mobility', description: 'Kemampuan berpindah ke realitas paralel yang memiliki keadaan berbeda tetapi tetap memiliki keterkaitan struktural.' },
  { id: 'reality_coordinate_lock', name: 'Reality Coordinate Lock', price: 320000, type: 'utility', description: 'Sistem navigasi yang menyimpan koordinat realitas tertentu untuk mempermudah perjalanan multiversal berikutnya.' },
  { id: 'alternate_self_detection', name: 'Alternate Self Detection', price: 270000, type: 'utility', description: 'Kemampuan mendeteksi jejak energi atau anomali yang berkaitan dengan keberadaan versi alternatif dari suatu individu.' },
  { id: 'reality_signature_analysis', name: 'Reality Signature Analysis', price: 300000, type: 'utility', description: 'Analisis pola energi yang digunakan untuk membedakan karakteristik satu realitas dari realitas lainnya.' },
  { id: 'multiversal_tracking', name: 'Multiversal Tracking', price: 340000, type: 'utility', description: 'Kemampuan melacak jejak perpindahan antardimensi melalui pola energi dan koordinat realitas.' },
  { id: 'dimensional_trace_erasure', name: 'Dimensional Trace Erasure', price: 310000, type: 'stealth', description: 'Sistem yang menyamarkan jejak energi perpindahan agar lokasi asal atau tujuan lebih sulit dilacak.' },
  { id: 'portal_interference', name: 'Portal Interference', price: 360000, type: 'control', description: 'Manipulasi sinyal portal yang mengganggu kestabilan atau ketepatan koordinat jalur perpindahan.' },
  { id: 'portal_destination_override', name: 'Portal Destination Override', price: 370000, type: 'control', description: 'Kemampuan mengubah koordinat tujuan jalur portal yang masih berada dalam jangkauan kendali sistem.' },
  { id: 'dimensional_signal_hacking', name: 'Dimensional Signal Hacking', price: 350000, type: 'utility', description: 'Peretasan protokol perjalanan antardimensi untuk membaca, memodifikasi, atau mengganggu sistem navigasi.' },
  { id: 'multiversal_network_access', name: 'Multiversal Network Access', price: 390000, type: 'utility', description: 'Akses ke jaringan informasi lintas realitas untuk bertukar data dengan sistem yang kompatibel.' },
  { id: 'automated_science_analysis', name: 'Automated Science Analysis', price: 250000, type: 'utility', description: 'Sistem analisis internal yang memproses data eksperimen dan menyarankan solusi teknis secara otomatis.' },
  { id: 'instant_diagnostic_scan', name: 'Instant Diagnostic Scan', price: 180000, type: 'utility', description: 'Pemindaian cepat terhadap kondisi tubuh, perangkat, atau material untuk mengidentifikasi kerusakan dan anomali.' },
  { id: 'molecular_composition_scan', name: 'Molecular Composition Scan', price: 220000, type: 'utility', description: 'Pemindaian struktur molekul untuk mengidentifikasi komposisi, sifat material, dan perubahan kimia.' },
  { id: 'biological_signature_scan', name: 'Biological Signature Scan', price: 210000, type: 'utility', description: 'Analisis tanda biologis untuk mengenali organisme, kondisi jaringan, dan perbedaan karakteristik tubuh.' },
  { id: 'environmental_hazard_analysis', name: 'Environmental Hazard Analysis', price: 190000, type: 'survival', description: 'Sistem pemindaian yang mengidentifikasi ancaman lingkungan seperti racun, radiasi, tekanan, dan atmosfer berbahaya.' },
  { id: 'adaptive_life_support', name: 'Adaptive Life Support', price: 300000, type: 'survival', description: 'Sistem pendukung kehidupan yang menyesuaikan suplai oksigen, suhu, dan tekanan dengan lingkungan sekitar.' },
  { id: 'emergency_body_stabilization', name: 'Emergency Body Stabilization', price: 260000, type: 'recovery', description: 'Sistem medis internal yang menjaga fungsi vital tubuh ketika pengguna mengalami cedera berat.' },
  { id: 'automated_medical_response', name: 'Automated Medical Response', price: 280000, type: 'recovery', description: 'Protokol medis otomatis yang mendeteksi cedera dan menjalankan prosedur pertolongan awal.' },
  { id: 'toxin_neutralization', name: 'Toxin Neutralization', price: 240000, type: 'defense', description: 'Modifikasi metabolisme yang membantu menetralkan senyawa beracun tertentu sebelum menyebar lebih jauh.' },
  { id: 'radiation_adaptation', name: 'Radiation Adaptation', price: 290000, type: 'defense', description: 'Peningkatan biologis yang membantu melindungi sel dari kerusakan akibat paparan radiasi.' },
  { id: 'vacuum_survival', name: 'Vacuum Survival', price: 330000, type: 'survival', description: 'Kombinasi augmentasi pernapasan, pengaturan tekanan, dan perlindungan jaringan untuk bertahan sementara dalam ruang hampa.' },
  { id: 'zero_gravity_adaptation', name: 'Zero-Gravity Adaptation', price: 240000, type: 'mobility', description: 'Peningkatan koordinasi dan kendali tubuh yang mempermudah pergerakan dalam kondisi gravitasi rendah.' },
  { id: 'energy_reserve_storage', name: 'Energy Reserve Storage', price: 280000, type: 'enhancement', description: 'Sistem internal yang menyimpan energi untuk digunakan saat augmentasi lain membutuhkan daya tambahan.' },
  { id: 'emergency_power_conversion', name: 'Emergency Power Conversion', price: 300000, type: 'enhancement', description: 'Sistem yang mengalihkan energi tersimpan ke fungsi tubuh dan pertahanan saat sumber daya utama terganggu.' },
  { id: 'automated_escape_protocol', name: 'Automated Escape Protocol', price: 290000, type: 'mobility', description: 'Sistem darurat yang memilih jalur keluar dan mengaktifkan mekanisme perpindahan ketika ancaman mencapai tingkat kritis.' },
  { id: 'adaptive_countermeasure', name: 'Adaptive Countermeasure', price: 340000, type: 'defense', description: 'Sistem yang menganalisis jenis ancaman dan menyesuaikan respons pertahanan berdasarkan data yang tersedia.' },
  { id: 'advanced_self_repair', name: 'Advanced Self-Repair', price: 350000, type: 'recovery', description: 'Jaringan perbaikan internal yang memperbaiki komponen sibernetik dan menjaga fungsi tubuh setelah mengalami kerusakan.' },
  { id: 'laser_eyes', name: 'Laser Eyes', price: 180000, type: 'attack', description: 'Mata yang dimodifikasi untuk memancarkan sinar energi terfokus yang mampu menembus atau membakar target.' },
  { id: 'nebula_dash', name: 'Nebula Dash', price: 220000, type: 'mobility', description: 'Kemampuan melesat dengan menyelimuti tubuh menggunakan energi menyerupai kabut nebula.' },
  { id: 'starlight_regen', name: 'Starlight Regen', price: 240000, type: 'recovery', description: 'Memanfaatkan energi bintang untuk mempercepat pemulihan jaringan tubuh yang terluka.' },
  { id: 'void_step', name: 'Void Step', price: 260000, type: 'mobility', description: 'Berpindah dalam jarak pendek melalui distorsi ruang yang terbentuk di sekitar tubuh.' },
  { id: 'plasma_pulse', name: 'Plasma Pulse', price: 250000, type: 'attack', description: 'Menghasilkan gelombang plasma dari tubuh untuk menghantam target di sekitarnya.' },
  { id: 'cosmic_barrier', name: 'Cosmic Barrier', price: 280000, type: 'defense', description: 'Membentuk lapisan energi kosmik yang mengurangi dampak serangan.' },
  { id: 'gravity_well', name: 'Gravity Well', price: 300000, type: 'control', description: 'Menciptakan medan gravitasi lokal yang menarik objek menuju titik tertentu.' },
  { id: 'solar_flare', name: 'Solar Flare', price: 290000, type: 'attack', description: 'Melepaskan semburan energi panas dan cahaya dari tubuh.' },
  { id: 'lunar_phase', name: 'Lunar Phase', price: 230000, type: 'enhancement', description: 'Mengubah karakteristik energi tubuh agar menyesuaikan diri dengan kondisi lingkungan dan siklus energi bulan.' },
  { id: 'starforge_skin', name: 'Starforge Skin', price: 270000, type: 'defense', description: 'Mengubah permukaan kulit menjadi lapisan berenergi padat yang meningkatkan ketahanan terhadap benturan.' },
  { id: 'void_pulse', name: 'Void Pulse', price: 280000, type: 'attack', description: 'Melepaskan gelombang energi hampa yang mengganggu kestabilan target di area sekitar.' },
  { id: 'quantum_blink', name: 'Quantum Blink', price: 300000, type: 'mobility', description: 'Melakukan perpindahan instan dalam jarak pendek melalui pergeseran posisi kuantum.' },
  { id: 'aurora_shield', name: 'Aurora Shield', price: 240000, type: 'defense', description: 'Membentuk perisai bercahaya yang menyerap sebagian energi serangan yang diterima.' },
  { id: 'meteor_strike', name: 'Meteor Strike', price: 310000, type: 'attack', description: 'Mengumpulkan energi kinetik pada tubuh sebelum melancarkan hantaman berdaya tinggi.' },
  { id: 'solar_absorption', name: 'Solar Absorption', price: 220000, type: 'enhancement', description: 'Menyerap radiasi matahari untuk mengisi cadangan energi dan meningkatkan performa tubuh.' },
  { id: 'moonlight_cloak', name: 'Moonlight Cloak', price: 230000, type: 'stealth', description: 'Membiaskan cahaya di sekitar tubuh untuk menyamarkan keberadaan pengguna.' },
  { id: 'nebula_mist', name: 'Nebula Mist', price: 210000, type: 'stealth', description: 'Menghasilkan kabut partikel bercahaya yang mengaburkan pandangan dan mengganggu pelacakan.' },
  { id: 'starlight_burst', name: 'Starlight Burst', price: 260000, type: 'attack', description: 'Melepaskan ledakan cahaya berenergi tinggi dari pusat tubuh.' },
  { id: 'comet_trail', name: 'Comet Trail', price: 190000, type: 'mobility', description: 'Meningkatkan akselerasi dan meninggalkan jejak partikel energi selama bergerak cepat.' },
  { id: 'astral_sight', name: 'Astral Sight', price: 200000, type: 'utility', description: 'Memperluas persepsi untuk mendeteksi energi, objek tersembunyi, dan perubahan lingkungan.' },
  { id: 'ion_blast', name: 'Ion Blast', price: 240000, type: 'attack', description: 'Memancarkan aliran partikel terionisasi yang mengganggu target dan perangkat elektronik.' },
  { id: 'magnetic_grip', name: 'Magnetic Grip', price: 180000, type: 'utility', description: 'Menghasilkan medan magnet terarah untuk melekat pada permukaan logam dan menjaga kestabilan tubuh.' },
  { id: 'magnetic_surge', name: 'Magnetic Surge', price: 250000, type: 'control', description: 'Menghasilkan lonjakan medan magnet untuk memengaruhi pergerakan benda logam di sekitar.' },
  { id: 'thunder_core', name: 'Thunder Core', price: 280000, type: 'attack', description: 'Menghasilkan dan menyimpan energi listrik biologis untuk dilepaskan dalam serangan berdaya tinggi.' },
  { id: 'lightning_reflex', name: 'Lightning Reflex', price: 220000, type: 'enhancement', description: 'Mempercepat transmisi sinyal saraf sehingga tubuh dapat bereaksi dengan kecepatan ekstrem.' },
  { id: 'electric_aura', name: 'Electric Aura', price: 230000, type: 'defense', description: 'Menyelimuti tubuh dengan medan listrik yang mengganggu kontak fisik dari luar.' },
  { id: 'storm_call', name: 'Storm Call', price: 320000, type: 'control', description: 'Memanipulasi muatan listrik dan kondisi atmosfer lokal untuk memicu fenomena badai.' },
  { id: 'thunderclap', name: 'Thunderclap', price: 200000, type: 'attack', description: 'Menghasilkan gelombang tekanan suara melalui pelepasan energi mendadak.' },
  { id: 'windrunner', name: 'Windrunner', price: 190000, type: 'mobility', description: 'Mengendalikan aliran udara di sekitar tubuh untuk meningkatkan kecepatan dan kelincahan.' },
  { id: 'cyclone_form', name: 'Cyclone Form', price: 270000, type: 'control', description: 'Menghasilkan pusaran udara yang mengacaukan keseimbangan dan pergerakan target.' },
  { id: 'frost_veins', name: 'Frost Veins', price: 210000, type: 'attack', description: 'Mengalirkan energi pendingin melalui jaringan tubuh untuk membekukan permukaan yang disentuh.' },
  { id: 'cryogenic_breath', name: 'Cryogenic Breath', price: 230000, type: 'attack', description: 'Mengeluarkan aliran udara bersuhu sangat rendah yang dapat mendinginkan atau membekukan target.' },
  { id: 'ice_shell', name: 'Ice Shell', price: 220000, type: 'defense', description: 'Membentuk lapisan es padat di permukaan tubuh sebagai perlindungan sementara.' },
  { id: 'glacier_step', name: 'Glacier Step', price: 180000, type: 'mobility', description: 'Membentuk pijakan es sesaat di bawah kaki untuk bergerak melewati permukaan yang sulit.' },
  { id: 'thermal_bloom', name: 'Thermal Bloom', price: 240000, type: 'attack', description: 'Melepaskan gelombang panas dari tubuh yang menyebar ke area di sekitarnya.' },
  { id: 'magma_core', name: 'Magma Core', price: 300000, type: 'enhancement', description: 'Mengubah jaringan internal menjadi sistem penyimpan energi panas untuk meningkatkan ketahanan terhadap suhu tinggi.' },
  { id: 'flame_aura', name: 'Flame Aura', price: 250000, type: 'attack', description: 'Menyelimuti tubuh dengan energi panas yang dapat membakar target yang berada terlalu dekat.' },
  { id: 'ash_rebirth', name: 'Ash Rebirth', price: 350000, type: 'recovery', description: 'Mengaktifkan proses regenerasi ekstrem dari sisa jaringan yang masih menyimpan energi biologis.' },
  { id: 'ember_skin', name: 'Ember Skin', price: 190000, type: 'defense', description: 'Meningkatkan ketahanan kulit terhadap panas dan menghasilkan lapisan permukaan yang membara.' },
  { id: 'heat_vision', name: 'Heat Vision', price: 210000, type: 'attack', description: 'Mendeteksi perbedaan suhu dan memancarkan energi panas terfokus melalui sistem penglihatan.' },
  { id: 'shadow_meld', name: 'Shadow Meld', price: 250000, type: 'stealth', description: 'Menyamarkan tubuh dengan menyatu secara visual dengan bayangan di sekitarnya.' },
  { id: 'dark_matter_skin', name: 'Dark Matter Skin', price: 290000, type: 'defense', description: 'Membentuk lapisan pelindung berbasis materi eksotis yang meningkatkan ketahanan tubuh.' },
  { id: 'night_vision', name: 'Night Vision', price: 130000, type: 'utility', description: 'Meningkatkan penglihatan dalam kondisi minim cahaya tanpa membutuhkan sumber penerangan tambahan.' },
  { id: 'shadow_dash', name: 'Shadow Dash', price: 230000, type: 'mobility', description: 'Melakukan lompatan posisi cepat melalui bayangan yang terhubung dalam jangkauan tertentu.' },
  { id: 'void_armor', name: 'Void Armor', price: 320000, type: 'defense', description: 'Membentuk lapisan energi hampa yang mengurangi dampak serangan fisik dan energi.' },
  { id: 'void_collapse', name: 'Void Collapse', price: 350000, type: 'attack', description: 'Memusatkan energi hampa pada suatu titik sebelum menghasilkan gelombang kerusakan lokal.' },
  { id: 'rift_sense', name: 'Rift Sense', price: 240000, type: 'utility', description: 'Mendeteksi retakan ruang, distorsi dimensi, dan jalur perpindahan tersembunyi.' },
  { id: 'rift_walk', name: 'Rift Walk', price: 300000, type: 'mobility', description: 'Melewati celah ruang singkat untuk berpindah dari satu posisi ke posisi lain.' },
  { id: 'phase_body', name: 'Phase Body', price: 330000, type: 'defense', description: 'Mengubah fase materi tubuh untuk menghindari kontak dengan serangan atau penghalang tertentu.' },
  { id: 'spectral_form', name: 'Spectral Form', price: 310000, type: 'enhancement', description: 'Mengubah tubuh menjadi bentuk energi semi-material yang dapat bergerak dengan karakteristik berbeda dari materi biasa.' },
  { id: 'astral_projection', name: 'Astral Projection', price: 270000, type: 'utility', description: 'Memisahkan kesadaran dari persepsi tubuh untuk menjelajahi lingkungan dalam bentuk astral.' },
  { id: 'energy_construct', name: 'Energy Construct', price: 300000, type: 'utility', description: 'Membentuk energi menjadi struktur sementara seperti platform, penghalang, atau alat bantu.' },
  { id: 'prism_beam', name: 'Prism Beam', price: 240000, type: 'attack', description: 'Memancarkan berkas energi yang dapat terpecah menjadi beberapa jalur serangan.' },
  { id: 'light_bending', name: 'Light Bending', price: 230000, type: 'stealth', description: 'Memanipulasi cahaya di sekitar tubuh untuk mengubah tampilan dan mengurangi visibilitas.' },
  { id: 'photon_burst', name: 'Photon Burst', price: 260000, type: 'attack', description: 'Melepaskan ledakan foton intens yang menghasilkan tekanan energi dan kilatan cahaya.' },
  { id: 'radiant_aura', name: 'Radiant Aura', price: 210000, type: 'enhancement', description: 'Menghasilkan medan cahaya yang meningkatkan persepsi dan kestabilan energi tubuh.' },
  { id: 'hardlight_form', name: 'Hardlight Form', price: 320000, type: 'defense', description: 'Memadatkan cahaya menjadi struktur pelindung yang mampu menahan tekanan dan benturan.' },
  { id: 'lightning_arc', name: 'Lightning Arc', price: 250000, type: 'attack', description: 'Menghasilkan sambaran listrik yang melompat di antara beberapa target dalam jangkauan.' },
  { id: 'arc_field', name: 'Arc Field', price: 270000, type: 'defense', description: 'Membentuk medan listrik yang mengganggu serangan dan perangkat elektronik di sekitar tubuh.' },
  { id: 'plasma_wings', name: 'Plasma Wings', price: 330000, type: 'mobility', description: 'Membentuk struktur plasma yang menghasilkan daya angkat untuk melayang dan terbang.' },
  { id: 'starfall', name: 'Starfall', price: 340000, type: 'attack', description: 'Mengumpulkan energi bercahaya lalu menjatuhkannya ke beberapa titik dalam area yang ditentukan.' },
  { id: 'cosmic_surge', name: 'Cosmic Surge', price: 300000, type: 'enhancement', description: 'Melepaskan cadangan energi kosmik untuk meningkatkan performa fisik dan kemampuan energi dalam waktu terbatas.' },
  { id: 'stellar_overdrive', name: 'Stellar Overdrive', price: 350000, type: 'enhancement', description: 'Meningkatkan keluaran energi internal secara drastis untuk memperkuat kemampuan yang dimiliki.' },
  { id: 'supernova_pulse', name: 'Supernova Pulse', price: 380000, type: 'attack', description: 'Melepaskan ledakan energi bintang dari pusat tubuh dengan jangkauan yang luas.' },
  { id: 'solar_rebirth', name: 'Solar Rebirth', price: 360000, type: 'recovery', description: 'Memanfaatkan cadangan energi matahari untuk mengaktifkan pemulihan tubuh setelah mengalami kerusakan berat.' },
  { id: 'stellar_regeneration', name: 'Stellar Regeneration', price: 320000, type: 'recovery', description: 'Menggunakan energi bintang tersimpan untuk mempercepat pemulihan sel dan jaringan tubuh.' },
  { id: 'cosmic_resilience', name: 'Cosmic Resilience', price: 300000, type: 'defense', description: 'Meningkatkan ketahanan biologis terhadap tekanan, radiasi, dan perubahan lingkungan ekstrem.' },
  { id: 'star_core', name: 'Star Core', price: 380000, type: 'enhancement', description: 'Inti energi biologis yang menyimpan daya dalam jumlah besar untuk mendukung kemampuan kosmik.' },
  { id: 'nebula_absorption', name: 'Nebula Absorption', price: 290000, type: 'enhancement', description: 'Menyerap partikel dan energi dari lingkungan untuk mengisi ulang cadangan daya tubuh.' },
  { id: 'cosmic_radar', name: 'Cosmic Radar', price: 220000, type: 'utility', description: 'Memperluas persepsi untuk mendeteksi sumber energi, objek bergerak, dan anomali dalam jangkauan luas.' },
  { id: 'starlight_sense', name: 'Starlight Sense', price: 200000, type: 'utility', description: 'Mendeteksi jejak energi bercahaya dan perubahan intensitas energi di lingkungan sekitar.' },
  { id: 'meteor_dash', name: 'Meteor Dash', price: 240000, type: 'mobility', description: 'Meningkatkan kecepatan gerak dengan akselerasi eksplosif seperti benda langit yang melesat.' },
  { id: 'comet_impact', name: 'Comet Impact', price: 280000, type: 'attack', description: 'Memusatkan energi kinetik saat bergerak untuk menghasilkan benturan kuat ketika mengenai target.' },
  { id: 'gravity_shift', name: 'Gravity Shift', price: 310000, type: 'control', description: 'Mengubah arah atau intensitas gravitasi lokal untuk memengaruhi gerakan tubuh dan objek.' },
  { id: 'gravity_anchor', name: 'Gravity Anchor', price: 240000, type: 'defense', description: 'Mengunci posisi tubuh dengan medan gravitasi agar tidak mudah terdorong atau terlempar.' },
  { id: 'zero_g_movement', name: 'Zero-G Movement', price: 200000, type: 'mobility', description: 'Mengendalikan gerakan tubuh secara presisi ketika berada dalam kondisi gravitasi rendah.' },
  { id: 'kinetic_absorption', name: 'Kinetic Absorption', price: 280000, type: 'defense', description: 'Menyerap sebagian energi kinetik dari benturan untuk mengurangi kerusakan yang diterima.' },
  { id: 'kinetic_release', name: 'Kinetic Release', price: 290000, type: 'attack', description: 'Melepaskan energi kinetik yang tersimpan melalui gelombang dorongan atau hantaman terarah.' },
  { id: 'force_wave', name: 'Force Wave', price: 260000, type: 'attack', description: 'Menghasilkan gelombang gaya yang mendorong objek dan target menjauh dari pengguna.' },
  { id: 'force_grip', name: 'Force Grip', price: 250000, type: 'control', description: 'Memanipulasi medan gaya untuk menahan atau mengangkat objek tanpa kontak fisik langsung.' },
  { id: 'force_burst', name: 'Force Burst', price: 270000, type: 'attack', description: 'Melepaskan dorongan energi mendadak yang menghantam target di sekitar tubuh.' },
  { id: 'barrier_dome', name: 'Barrier Dome', price: 300000, type: 'defense', description: 'Membentuk kubah perlindungan energi untuk melindungi pengguna dan area kecil di sekitarnya.' },
  { id: 'reflective_barrier', name: 'Reflective Barrier', price: 320000, type: 'defense', description: 'Menciptakan penghalang energi yang memantulkan sebagian serangan kembali ke arah asalnya.' },
  { id: 'energy_drain', name: 'Energy Drain', price: 300000, type: 'control', description: 'Menyerap sebagian energi yang dilepaskan target untuk melemahkan serangannya dan mengisi cadangan daya.' },
  { id: 'energy_conversion_drive', name: 'Energy Conversion Drive', price: 290000, type: 'enhancement', description: 'Mengubah satu bentuk energi yang diserap menjadi bentuk lain yang dapat dimanfaatkan tubuh.' },
  { id: 'overcharge_pulse', name: 'Overcharge Pulse', price: 310000, type: 'attack', description: 'Melepaskan energi yang terkumpul dalam satu pulsa berdaya tinggi untuk menyerang area terdekat.' },
  { id: 'adaptive_resistance', name: 'Adaptive Resistance', price: 280000, type: 'defense', description: 'Menyesuaikan ketahanan tubuh secara bertahap terhadap jenis ancaman yang berulang.' },
  { id: 'rapid_healing', name: 'Rapid Healing', price: 240000, type: 'recovery', description: 'Mempercepat proses penyembuhan luka melalui peningkatan aktivitas sel dan regenerasi jaringan.' },
  { id: 'cellular_rebirth', name: 'Cellular Rebirth', price: 330000, type: 'recovery', description: 'Mengaktifkan regenerasi sel secara intensif untuk memulihkan tubuh dari kerusakan berat.' },
  { id: 'bioelectric_surge', name: 'Bioelectric Surge', price: 250000, type: 'attack', description: 'Menghasilkan lonjakan listrik dari sistem biologis untuk menyerang target atau mengganggu perangkat.' },
  { id: 'toxin_resistance', name: 'Toxin Resistance', price: 170000, type: 'defense', description: 'Meningkatkan kemampuan tubuh menghadapi racun dan zat kimia berbahaya tertentu.' },
  { id: 'oxygen_boost', name: 'Oxygen Boost', price: 150000, type: 'enhancement', description: 'Meningkatkan penyerapan dan distribusi oksigen untuk mendukung aktivitas fisik intensif.' },
  { id: 'adaptive_metabolism', name: 'Adaptive Metabolism', price: 230000, type: 'survival', description: 'Menyesuaikan penggunaan energi tubuh agar dapat bertahan lebih lama dalam kondisi sumber daya terbatas.' },
  { id: 'danger_sense', name: 'Danger Sense', price: 210000, type: 'utility', description: 'Mendeteksi perubahan lingkungan dan pola ancaman untuk memperingatkan pengguna sebelum bahaya mendekat.' },
  { id: 'enhanced_perception', name: 'Enhanced Perception', price: 180000, type: 'enhancement', description: 'Meningkatkan ketajaman persepsi terhadap gerakan, suara, perubahan energi, dan detail lingkungan.' },
  { id: 'afterimage_shift', name: 'Afterimage Shift', price: 220000, type: 'mobility', description: 'Bergerak dengan akselerasi tinggi sehingga meninggalkan bayangan visual sesaat yang membingungkan pengamat.' },
  { id: 'phase_dash', name: 'Phase Dash', price: 280000, type: 'mobility', description: 'Melakukan gerakan cepat sambil mengubah fase tubuh sesaat untuk melewati rintangan tertentu.' },
  { id: 'dimensional_echo', name: 'Dimensional Echo', price: 290000, type: 'utility', description: 'Membaca sisa distorsi ruang untuk mengungkap jejak perpindahan yang baru saja terjadi.' },
  { id: 'spatial_fold', name: 'Spatial Fold', price: 360000, type: 'mobility', description: 'Melipat jarak ruang di antara dua titik agar pengguna dapat berpindah dengan cepat.' },
  { id: 'rift_burst', name: 'Rift Burst', price: 330000, type: 'attack', description: 'Melepaskan gelombang energi melalui distorsi ruang yang terbuka sesaat di sekitar target.' },
  { id: 'portal_sense', name: 'Portal Sense', price: 230000, type: 'utility', description: 'Mendeteksi portal aktif, celah ruang, dan jalur perpindahan yang tersembunyi.' },
  { id: 'phase_resistance', name: 'Phase Resistance', price: 270000, type: 'defense', description: 'Menstabilkan struktur tubuh agar lebih tahan terhadap gangguan fase dan distorsi ruang.' },
  { id: 'spectral_dash', name: 'Spectral Dash', price: 250000, type: 'mobility', description: 'Berpindah cepat dalam bentuk energi semi-transparan untuk menghindari serangan dan menembus celah sempit.' },
  { id: 'prismatic_skin', name: 'Prismatic Skin', price: 320000, type: 'defense', description: 'Mengubah permukaan tubuh menjadi lapisan spektrum energi yang mampu membiaskan dan mengurangi serangan energi.' },
  { id: 'aurora_regeneration', name: 'Aurora Regeneration', price: 340000, type: 'recovery', description: 'Memanfaatkan energi aurora untuk mempercepat pemulihan jaringan tubuh dan mengembalikan stamina.' },
  { id: 'celestial_overdrive', name: 'Celestial Overdrive', price: 380000, type: 'enhancement', description: 'Melepaskan energi internal untuk meningkatkan kekuatan, kecepatan, dan refleks secara drastis dalam waktu terbatas.' },
  { id: 'event_horizon', name: 'Event Horizon', price: 420000, type: 'control', description: 'Menciptakan batas gravitasi ekstrem yang memperlambat pergerakan objek dan menarik target ke pusatnya.' },
  { id: 'singularity_pulse', name: 'Singularity Pulse', price: 430000, type: 'attack', description: 'Menghasilkan denyut gravitasi terkompresi yang menghantam area sekitar dengan tekanan luar biasa.' },
  { id: 'cosmic_rebirth', name: 'Cosmic Rebirth', price: 450000, type: 'recovery', description: 'Mengaktifkan proses regenerasi tingkat tinggi dengan mengubah energi yang tersimpan menjadi pemulihan tubuh secara menyeluruh.' },
  { id: 'matter_fabrication', name: 'Matter Fabrication', price: 280000, type: 'production', description: 'Menggunakan teknologi rekayasa materi untuk membuat benda sederhana dari bahan mentah yang tersedia.' },
  { id: 'instant_learning', name: 'Instant Learning', price: 250000, type: 'enhancement', description: 'Mempercepat proses memahami keterampilan baru melalui stimulasi saraf dan pemrosesan informasi tingkat tinggi.' },
  { id: 'hologram_stage', name: 'Hologram Stage', price: 180000, type: 'entertainment', description: 'Memproyeksikan panggung holografik interaktif untuk pertunjukan, konser, atau hiburan pribadi.' },
  { id: 'universal_translator', name: 'Universal Translator', price: 220000, type: 'communication', description: 'Menerjemahkan bahasa asing secara langsung, termasuk pola komunikasi spesies nonmanusia yang telah teridentifikasi.' },
  { id: 'market_prediction', name: 'Market Prediction', price: 350000, type: 'economy', description: 'Menganalisis pola pasar dan data ekonomi untuk memperkirakan perubahan harga serta peluang perdagangan.' },
  { id: 'pocket_dimension', name: 'Pocket Dimension', price: 400000, type: 'storage', description: 'Membuka ruang penyimpanan pribadi yang mampu menampung banyak barang tanpa membebani kapasitas bawaan tubuh.' },
  { id: 'dream_projection', name: 'Dream Projection', price: 260000, type: 'entertainment', description: 'Mengubah imajinasi menjadi pengalaman visual dan sensorik melalui simulasi mimpi interaktif.' },
  { id: 'digital_clone', name: 'Digital Clone', price: 320000, type: 'automation', description: 'Membuat asisten digital yang meniru pola kerja pengguna untuk membantu tugas rutin dan mengelola informasi.' },
  { id: 'molecular_repair', name: 'Molecular Repair', price: 300000, type: 'maintenance', description: 'Memperbaiki kerusakan benda dengan menyusun ulang struktur material pada tingkat molekuler.' },
  { id: 'probability_scan', name: 'Probability Scan', price: 380000, type: 'analysis', description: 'Menghitung kemungkinan hasil dari suatu keputusan berdasarkan informasi yang tersedia.' },
  { id: 'personal_terraforming', name: 'Personal Terraforming', price: 360000, type: 'environment', description: 'Mengatur suhu, kelembapan, dan kualitas udara di area kecil sesuai kebutuhan pengguna.' },
  { id: 'memory_archive', name: 'Memory Archive', price: 240000, type: 'memory', description: 'Merekam dan menyimpan pengalaman pribadi agar dapat diputar kembali sebagai simulasi sensorik.' },
  { id: 'holographic_companion', name: 'Holographic Companion', price: 190000, type: 'entertainment', description: 'Menciptakan teman holografik interaktif untuk menemani percakapan, permainan, dan aktivitas santai.' },
  { id: 'virtual_reality', name: 'Virtual Reality', price: 210000, type: 'simulation', description: 'Membangun simulasi digital imersif yang memungkinkan pengguna menikmati permainan dan pengalaman virtual.' },
  { id: 'instant_cooking', name: 'Instant Cooking', price: 230000, type: 'lifestyle', description: 'Mengatur suhu dan proses pengolahan bahan secara otomatis untuk menyiapkan makanan dengan lebih cepat.' },
  { id: 'nutrient_synthesis', name: 'Nutrient Synthesis', price: 270000, type: 'production', description: 'Mengolah bahan dasar menjadi nutrisi siap konsumsi dengan komposisi yang dapat disesuaikan.' },
  { id: 'auto_harvest', name: 'Auto Harvest', price: 200000, type: 'agriculture', description: 'Mengendalikan sistem otomatis untuk menanam, merawat, dan memanen tanaman dengan efisien.' },
  { id: 'weather_control', name: 'Weather Control', price: 420000, type: 'environment', description: 'Memengaruhi kondisi cuaca dalam area terbatas melalui teknologi pengatur atmosfer.' },
  { id: 'eco_scanner', name: 'Eco Scanner', price: 170000, type: 'analysis', description: 'Memindai kualitas tanah, air, udara, dan kesehatan ekosistem untuk menemukan sumber daya yang berguna.' },
  { id: 'deep_sea_breathing', name: 'Deep Sea Breathing', price: 160000, type: 'exploration', description: 'Memungkinkan pengguna bernapas di bawah air dan menyesuaikan tubuh terhadap tekanan laut.' },
  { id: 'space_navigation', name: 'Space Navigation', price: 290000, type: 'navigation', description: 'Menghitung jalur perjalanan antariksa berdasarkan koordinat, gravitasi, dan posisi benda langit.' },
  { id: 'portal_commute', name: 'Portal Commute', price: 450000, type: 'transportation', description: 'Membuka jalur perpindahan instan antara dua lokasi yang telah ditandai dan memenuhi batas jangkauan.' },
  { id: 'dimensional_storage', name: 'Dimensional Storage', price: 340000, type: 'storage', description: 'Menyimpan barang dalam ruang terpisah yang dapat diakses kapan saja melalui titik pembuka pribadi.' },
  { id: 'universal_interface', name: 'Universal Interface', price: 240000, type: 'technology', description: 'Menghubungkan pengguna dengan perangkat digital dan mesin kompatibel tanpa memerlukan kendali fisik langsung.' },
  { id: 'machine_whisperer', name: 'Machine Whisperer', price: 310000, type: 'technology', description: 'Menganalisis sistem mesin dan memberikan instruksi langsung untuk mengoperasikan perangkat yang kompatibel.' },
  { id: 'instant_translation', name: 'Instant Translation', price: 200000, type: 'communication', description: 'Menerjemahkan tulisan, percakapan, dan simbol yang telah dikenali ke dalam bahasa pilihan pengguna.' },
  { id: 'telepathic_chat', name: 'Telepathic Chat', price: 330000, type: 'communication', description: 'Mengirimkan pesan mental kepada pengguna lain yang terhubung tanpa memerlukan perangkat komunikasi.' },
  { id: 'sound_mimicry', name: 'Sound Mimicry', price: 140000, type: 'entertainment', description: 'Meniru suara, instrumen musik, dan efek audio dengan tingkat kemiripan yang dapat disesuaikan.' },
  { id: 'perfect_pitch', name: 'Perfect Pitch', price: 150000, type: 'music', description: 'Mengenali nada dengan presisi tinggi dan membantu menghasilkan musik tanpa bergantung pada alat penyetem.' },
  { id: 'light_painting', name: 'Light Painting', price: 180000, type: 'creative', description: 'Menggambar dan membentuk karya seni tiga dimensi menggunakan cahaya yang dapat disentuh secara virtual.' },
  { id: 'holographic_design', name: 'Holographic Design', price: 220000, type: 'creative', description: 'Membuat rancangan bangunan, pakaian, atau produk dalam bentuk hologram tiga dimensi yang dapat diedit.' },
  { id: 'instant_language', name: 'Instant Language', price: 260000, type: 'learning', description: 'Membantu pengguna memahami struktur bahasa baru melalui pemrosesan saraf dan latihan terarah.' },
  { id: 'skill_recording', name: 'Skill Recording', price: 300000, type: 'learning', description: 'Merekam urutan gerakan dan prosedur keterampilan agar dapat dipelajari serta dilatih kembali dengan presisi.' },
  { id: 'focus_accelerator', name: 'Focus Accelerator', price: 190000, type: 'productivity', description: 'Mengoptimalkan fokus dan mengurangi gangguan saat mengerjakan tugas yang membutuhkan konsentrasi tinggi.' },
  { id: 'sleep_optimizer', name: 'Sleep Optimizer', price: 210000, type: 'recovery', description: 'Mengatur siklus tidur untuk membantu tubuh beristirahat lebih efisien dan bangun dengan kondisi lebih segar.' },
  { id: 'mood_synthesizer', name: 'Mood Synthesizer', price: 230000, type: 'wellbeing', description: 'Mengatur stimulasi sensorik untuk membantu menciptakan suasana hati tertentu melalui musik, cahaya, dan sensasi.' },
  { id: 'memory_playback', name: 'Memory Playback', price: 250000, type: 'memory', description: 'Memutar ulang ingatan yang tersimpan sebagai pengalaman visual dan audio yang menyerupai kejadian asli.' },
  { id: 'personal_theme', name: 'Personal Theme', price: 130000, type: 'customization', description: 'Mengubah tampilan cahaya, warna, suara, dan efek visual di sekitar pengguna sesuai tema pilihannya.' },
  { id: 'avatar_projection', name: 'Avatar Projection', price: 200000, type: 'customization', description: 'Memproyeksikan penampilan digital alternatif untuk digunakan dalam ruang virtual atau komunikasi jarak jauh.' },
  { id: 'instant_outfit', name: 'Instant Outfit', price: 270000, type: 'fashion', description: 'Mengubah tampilan pakaian melalui material pintar yang dapat menyusun ulang warna, bentuk, dan teksturnya.' },
  { id: 'self_cleaning_field', name: 'Self-Cleaning Field', price: 170000, type: 'maintenance', description: 'Menghasilkan medan pembersih yang mengangkat debu, noda, dan partikel kotoran dari benda di sekitarnya.' },
  { id: 'molecular_recycling', name: 'Molecular Recycling', price: 330000, type: 'recycling', description: 'Memisahkan material bekas menjadi bahan yang dapat digunakan kembali untuk membuat produk baru.' },
  { id: 'energy_harvesting', name: 'Energy Harvesting', price: 290000, type: 'economy', description: 'Mengumpulkan energi dari cahaya, panas, atau gerakan sekitar untuk disimpan atau dijual sebagai sumber daya.' },
  { id: 'microclimate_dome', name: 'Microclimate Dome', price: 350000, type: 'environment', description: 'Menciptakan zona lingkungan kecil dengan suhu, kelembapan, dan kualitas udara yang dapat dikendalikan.' },
  { id: 'smart_farming', name: 'Smart Farming', price: 280000, type: 'agriculture', description: 'Mengoptimalkan pertanian melalui pemantauan tanaman, pengaturan nutrisi, dan pengelolaan sumber daya otomatis.' },
  { id: 'trade_insight', name: 'Trade Insight', price: 320000, type: 'economy', description: 'Membandingkan nilai barang, tren permintaan, dan peluang pertukaran untuk membantu memperoleh transaksi yang lebih menguntungkan.' },
  { id: 'business_simulation', name: 'Business Simulation', price: 360000, type: 'economy', description: 'Membuat simulasi bisnis berdasarkan modal, harga, permintaan, dan risiko sebelum pengguna mengambil keputusan.' },
  { id: 'automated_assistant', name: 'Automated Assistant', price: 240000, type: 'automation', description: 'Mengelola jadwal, mengingatkan tenggat, menyusun daftar tugas, dan menjalankan perintah rutin yang diizinkan.' },
  { id: 'probability_engine', name: 'Probability Engine', price: 390000, type: 'analysis', description: 'Menjalankan simulasi berbagai skenario untuk memperkirakan peluang keberhasilan dan risiko suatu rencana.' },
  { id: 'reality_recorder', name: 'Reality Recorder', price: 310000, type: 'recording', description: 'Merekam lingkungan sekitar dalam bentuk rekonstruksi tiga dimensi yang dapat ditinjau kembali dari berbagai sudut.' }
]

const sortedAbilitiesByOriginalPrice = [...EVONEXUS_ABILITIES].sort((a, b) =>
  a.price - b.price || a.name.localeCompare(b.name, 'id')
)

for (let tierIndex = 0; tierIndex < EVONEXUS_RARITIES.length; tierIndex++) {
  const tier = EVONEXUS_RARITIES[tierIndex]
  const start = Math.floor(tierIndex * sortedAbilitiesByOriginalPrice.length / EVONEXUS_RARITIES.length)
  const end = Math.floor((tierIndex + 1) * sortedAbilitiesByOriginalPrice.length / EVONEXUS_RARITIES.length)
  const nextTier = EVONEXUS_RARITIES[tierIndex + 1]
  const previousTier = EVONEXUS_RARITIES[tierIndex - 1]
  const tierBeforePrevious = EVONEXUS_RARITIES[tierIndex - 2]
  const maxPrice = nextTier
    ? nextTier.minPrice - 1
    : tier.minPrice + previousTier.minPrice - tierBeforePrevious.minPrice
  const tierAbilityCount = end - start

  for (let index = start; index < end; index++) {
    const positionInTier = index - start + 1
    sortedAbilitiesByOriginalPrice[index].price =
      tier.minPrice + Math.floor(positionInTier * (maxPrice - tier.minPrice) / (tierAbilityCount + 1))
  }
}

export const EVONEXUS_ABILITY_TYPES = Object.freeze(
  [...new Set(EVONEXUS_ABILITIES.map(ability => ability.type))].sort((a, b) => a.localeCompare(b, 'id'))
)
export const EVONEXUS_ABILITY_BY_ID = new Map(EVONEXUS_ABILITIES.map(ability => [ability.id, ability]))

export function normalizeEvonexusValue(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[\s-]+/g, '_')
}

export function getEvonexusAbilityTier(ability) {
  const price = Math.max(0, Number(ability?.price) || 0)
  return EVONEXUS_RARITIES.slice().reverse().find(tier => price >= tier.minPrice) || EVONEXUS_RARITIES[0]
}

export function getEvonexusAbilityPool(filter) {
  const key = normalizeEvonexusValue(filter)
  if (!key || ['all', 'semua'].includes(key)) return [...EVONEXUS_ABILITIES].sort((a, b) => a.name.localeCompare(b.name, 'id'))
  const tier = EVONEXUS_RARITIES.find(item => normalizeEvonexusValue(item.name) === key)
  const abilities = EVONEXUS_ABILITIES.filter(ability =>
    tier
      ? getEvonexusAbilityTier(ability).name === tier.name
      : normalizeEvonexusValue(ability.type) === key
  )
  return abilities.sort((a, b) => a.name.localeCompare(b.name, 'id'))
}

function getEditDistance(left, right) {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index)
  for (let i = 1; i <= left.length; i++) {
    let diagonal = previous[0]
    previous[0] = i
    for (let j = 1; j <= right.length; j++) {
      const above = previous[j]
      previous[j] = Math.min(
        previous[j] + 1,
        previous[j - 1] + 1,
        diagonal + (left[i - 1] === right[j - 1] ? 0 : 1)
      )
      diagonal = above
    }
  }
  return previous[right.length]
}

export function searchEvonexusAbilities(query) {
  const search = normalizeEvonexusValue(query)
  if (search.length < 2) return []
  const ranked = EVONEXUS_ABILITIES.map(ability => {
    const name = normalizeEvonexusValue(ability.name)
    const id = normalizeEvonexusValue(ability.id)
    const distance = Math.min(getEditDistance(search, name), getEditDistance(search, id))
    const contains = name.includes(search) || id.includes(search)
    return { ability, distance, contains }
  }).sort((a, b) => Number(b.contains) - Number(a.contains) || a.distance - b.distance || a.ability.name.localeCompare(b.ability.name, 'id'))
  const best = ranked[0]
  const threshold = Math.min(4, Math.max(2, Math.floor(search.length * 0.3)))
  if (!best || (!best.contains && best.distance > threshold)) return []
  const limit = best.contains ? 5 : 3
  return ranked
    .filter(result => result.contains || result.distance <= threshold)
    .slice(0, limit)
    .map(result => result.ability)
}

const ABILITY_TYPE_EFFECTS = Object.freeze({
  attack: { damageDealt: 0.005 },
  agriculture: { harvest: 0.005 },
  analysis: { xp: 0.005 },
  automation: { cooldownReduction: 0.005 },
  communication: { xp: 0.005 },
  control: { damageDealt: 0.005 },
  creative: { xp: 0.005 },
  customization: { xp: 0.005 },
  defense: { damageReduction: 0.005 },
  economy: { income: 0.005 },
  enhancement: { xp: 0.005 },
  entertainment: { xp: 0.005 },
  environment: { harvest: 0.005 },
  exploration: { dropChance: 0.005 },
  fashion: { crimeChance: 0.005 },
  learning: { xp: 0.005 },
  lifestyle: { healing: 0.005 },
  maintenance: { healing: 0.005 },
  memory: { xp: 0.005 },
  mobility: { cooldownReduction: 0.005 },
  music: { xp: 0.005 },
  navigation: { cooldownReduction: 0.005 },
  production: { harvest: 0.005 },
  productivity: { cooldownReduction: 0.005 },
  recording: { xp: 0.005 },
  recovery: { healing: 0.005 },
  recycling: { income: 0.005 },
  simulation: { xp: 0.005 },
  stealth: { crimeChance: 0.005, dropChance: 0.005 },
  storage: { income: 0.005 },
  survival: { damageReduction: 0.005 },
  technology: { xp: 0.005 },
  transportation: { cooldownReduction: 0.005 },
  utility: { xp: 0.005 },
  wellbeing: { healing: 0.005 }
})

const ABILITY_UNIVERSAL_BONUS = 0.0025

export function getEvonexusAbilityModifiers(rpg) {
  const modifiers = {
    income: 0,
    xp: 0,
    damageDealt: 0,
    damageReduction: 0,
    cooldownReduction: 0,
    crimeChance: 0,
    dropChance: 0,
    healing: 0,
    harvest: 0
  }
  const installed = rpg?.evonexus?.installed
  if (!installed || typeof installed !== 'object') return modifiers

  for (const [type, abilityId] of Object.entries(installed)) {
    const ability = EVONEXUS_ABILITY_BY_ID.get(abilityId)
    if (ability?.type !== type) continue
    for (const key of ['income', 'xp', 'damageDealt', 'damageReduction', 'cooldownReduction']) {
      modifiers[key] += ABILITY_UNIVERSAL_BONUS
    }
    const effects = ABILITY_TYPE_EFFECTS[type]
    if (effects) {
      for (const [key, value] of Object.entries(effects)) modifiers[key] += value
    }
  }

  for (const key of Object.keys(modifiers)) modifiers[key] = Math.min(0.25, modifiers[key])
  modifiers.damageReduction = Math.min(0.35, modifiers.damageReduction)
  return modifiers
}

export function getEvonexusAbilityEffectText(ability) {
  const effects = ABILITY_TYPE_EFFECTS[ability?.type] || {}
  const descriptions = {
    damageDealt: 'damage serangan',
    damageReduction: 'pengurangan damage diterima',
    cooldownReduction: 'pengurangan cooldown',
    income: 'pendapatan',
    xp: 'perolehan EXP',
    crimeChance: 'peluang tindak kriminal',
    dropChance: 'peluang loot langka',
    healing: 'pengurangan biaya heal',
    harvest: 'hasil panen'
  }
  const typeBonus = Object.entries(effects)
    .map(([key, value]) => `+${(value * 100).toLocaleString('id-ID')}% ${descriptions[key]}`)
    .join(', ')
  return `Pasif universal: +0,25% income, EXP, damage, pertahanan, dan cooldown; bonus tipe: ${typeBonus || 'tidak ada'}.`
}