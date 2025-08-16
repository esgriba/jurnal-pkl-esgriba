const excelData = [
  {
    NISN: "0074612857",
    "Nama Siswa": "DINA RIZA AYU MATUSSHOLEHA",
  },
  {
    NISN: "0071347347",
    "Nama Siswa": "YULI YATIMAH",
  },
  {
    NISN: "0083725353",
    "Nama Siswa": "EKA DEVI AINUROHMA",
  },
  {
    NISN: "0024142799",
    "Nama Siswa": "ENGGAR DWI PRASETYO",
  },
];

console.log("Checking NISN lengths from Excel data:");
excelData.forEach((row, index) => {
  console.log(
    `${index + 1}. NISN: "${row.NISN}" (${row.NISN.length} chars) - ${
      row["Nama Siswa"]
    }`
  );
});

console.log(
  "\nAll NISN values are 10 characters, which should fit in varchar(20)"
);
console.log("Looking for other potential issues...");

// Check for any field that might be longer than expected
const problematicNames = [
  "DINA RIZA AYU MATUSSHOLEHA",
  "Bank Mandiri KCP Wongsorejo",
  "Siska Purwanti, S.E.",
  "Fera Mega Haristina, S.Tr.Kom.",
  "Frances Laurence, S.B., S.Pd.",
];

console.log("\nChecking potentially long field values:");
problematicNames.forEach((name, index) => {
  console.log(`${index + 1}. "${name}" (${name.length} chars)`);
});
