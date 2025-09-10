// Test script to verify the Nunung Indrawati fix
const testData = {
  attendance: [
    { nama_guru: "Nunung Indrawati, S.Pd", nama_siswa: "REZY ANGGARA BAHARI" },
    { nama_guru: "Nunung Indrawati, S.Pd", nama_siswa: "TESYA HERLIANA" },
    { nama_guru: "Nunung Indrawati, S.Pd", nama_siswa: "WULAN FEBRIYANTI" },
    { nama_guru: "NUNUNG INDRAWATI, S.Pd", nama_siswa: "AGUNG TRISNA DEWI" },
    { nama_guru: "NUNUNG INDRAWATI, S.Pd", nama_siswa: "EKA DEVI AINUROHMA" },
    { nama_guru: "NUNUNG INDRAWATI, S.Pd", nama_siswa: "FIOLA SEPTIANA RAMADANI" },
    { nama_guru: "NUNUNG INDRAWATI, S.Pd", nama_siswa: "NUKE KUSUMA WARDANI" },
  ],
  students: [
    { nama_guru: "Nunung Indrawati, S.Pd", nama_siswa: "REZY ANGGARA BAHARI" },
    { nama_guru: "Nunung Indrawati, S.Pd", nama_siswa: "TESYA HERLIANA" },
    { nama_guru: "Nunung Indrawati, S.Pd", nama_siswa: "WULAN FEBRIYANTI" },
    { nama_guru: "NUNUNG INDRAWATI, S.Pd", nama_siswa: "AGUNG TRISNA DEWI" },
    { nama_guru: "NUNUNG INDRAWATI, S.Pd", nama_siswa: "EKA DEVI AINUROHMA" },
    { nama_guru: "NUNUNG INDRAWATI, S.Pd", nama_siswa: "FIOLA SEPTIANA RAMADANI" },
    { nama_guru: "NUNUNG INDRAWATI, S.Pd", nama_siswa: "NUKE KUSUMA WARDANI" },
  ]
};

const selectedGuru = "Nunung Indrawati, S.Pd";

// Old filtering (case-sensitive - BROKEN)
console.log("🚫 Old filtering (case-sensitive):");
const oldFilteredAttendance = testData.attendance.filter((attendance) => {
  return attendance.nama_guru === selectedGuru;
});
console.log("Attendance count:", oldFilteredAttendance.length);

const oldFilteredStudents = testData.students.filter((siswa) => {
  return siswa.nama_guru === selectedGuru;
});
console.log("Students count:", oldFilteredStudents.length);

// New filtering (case-insensitive - FIXED)
console.log("\n✅ New filtering (case-insensitive):");
const newFilteredAttendance = testData.attendance.filter((attendance) => {
  return attendance.nama_guru.toLowerCase() === selectedGuru.toLowerCase();
});
console.log("Attendance count:", newFilteredAttendance.length);

const newFilteredStudents = testData.students.filter((siswa) => {
  return siswa.nama_guru.toLowerCase() === selectedGuru.toLowerCase();
});
console.log("Students count:", newFilteredStudents.length);

console.log("\n🎯 Expected result: 7 students for both attendance and students");
console.log("✅ Fix successful:", newFilteredAttendance.length === 7 && newFilteredStudents.length === 7);
