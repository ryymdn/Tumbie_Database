export const BASE_TOTAL = 38; // total balita pada sesi ini sebelum input baru



export const initialExams = [
  { id: 1, name: 'Bima Satria', info: 'L • 2 Thn 3 Bln', mother: 'Rina Wati', nik: '3201014506900001', bb: '12.4', bbDelta: '+0.3 kg', tb: '88.0', tbDelta: '+1.0 cm', lk: '48.0', status: 'Gizi Baik', service: ['DPT-HB-Hib 3', '+ Vit A (Merah)'], officer: 'Bdn. Dian Sastro' },
  { id: 2, name: 'Alya Putri', info: 'P • 1 Thn 4 Bln', mother: 'Dedi Kurniawan', nik: '3201015609930004', bb: '9.8', bbDelta: '+0.2 kg', tb: '78.5', tbDelta: '+0.8 cm', lk: '45.5', status: 'Gizi Baik', service: ['Campak Rubella (MR)', '+ PMT Biskuit'], officer: 'Kdr. Melati 01' },
  { id: 3, name: 'Nadia Putri', info: 'P • 2 Thn 2 Bln', mother: 'Dewi Lestari', nik: '3201015409910021', bb: '9.6', bbDelta: '+0.0 kg', tb: '81.0', tbDelta: '+0.5 cm', lk: '46.0', status: 'Gizi Kurang', service: ['Polio', '+ PMT Telur'], officer: 'Kdr. Melati 01' },
  { id: 4, name: 'Pelangi', info: 'P • 1 Thn 3 Bln', mother: 'Maya Lestari', nik: '3201014811940017', bb: '10.2', bbDelta: '+0.1 kg', tb: '79.0', tbDelta: '+0.6 cm', lk: '45.0', status: 'Gizi Baik', service: ['DPT-HB-Hib 3', '+ Vit A (Merah)'], officer: 'Bdn. Dian Sastro' },
  { id: 5, name: 'Raka Pratama', info: 'L • 1 Thn 8 Bln', mother: 'Andi Pratama', nik: '3201012207920033', bb: '10.9', bbDelta: '+0.2 kg', tb: '82.5', tbDelta: '+0.9 cm', lk: '47.0', status: 'Gizi Baik', service: ['Campak Rubella (MR)', '+ PMT Biskuit'], officer: 'Kdr. Melati 01' },
];

export const emptyExamForm = {
  child: '',
  date: '',
  bb: '',
  tb: '',
  lk: '',
  position: '',
  vaccine: 'Tidak ada imunisasi',
  notes: '',
  vitA: false,
  worm: false,
  pmt: [],
  nakes: '',
};
