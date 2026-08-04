/* ==========================================================================
   STUDENT PERFORMANCE PREDICTOR - HYBRID ENGINE & LIVE STREAM UPDATER
   ========================================================================== */

// Global State
let currentStudentsData = [];
let filteredStudentsData = [];
let detectedTemplateConfig = null;
let gradeChartInstance = null;
let riskChartInstance = null;

// Built-in Sample Datasets
const SAMPLE_DATASETS = {
  cs: [
    { id: "CS-101", name: "Alex Chen", attendance: 92, midterm: 88, quiz: 90, studyHours: 18, prevGpa: 3.8 },
    { id: "CS-102", name: "Brianna Taylor", attendance: 65, midterm: 52, quiz: 58, studyHours: 6, prevGpa: 2.4 },
    { id: "CS-103", name: "Carlos Mendez", attendance: 78, midterm: 74, quiz: 80, studyHours: 12, prevGpa: 3.1 },
    { id: "CS-104", name: "Diana Prince", attendance: 96, midterm: 94, quiz: 95, studyHours: 22, prevGpa: 3.9 },
    { id: "CS-105", name: "Ethan Hunt", attendance: 58, midterm: 45, quiz: 50, studyHours: 5, prevGpa: 2.1 },
    { id: "CS-106", name: "Fiona Gallagher", attendance: 84, midterm: 81, quiz: 85, studyHours: 15, prevGpa: 3.4 },
    { id: "CS-107", name: "George Clark", attendance: 90, midterm: 86, quiz: 88, studyHours: 16, prevGpa: 3.6 },
    { id: "CS-108", name: "Hannah Abbott", attendance: 72, midterm: 64, quiz: 68, studyHours: 9, prevGpa: 2.8 },
    { id: "CS-109", name: "Ian Wright", attendance: 48, midterm: 38, quiz: 42, studyHours: 4, prevGpa: 1.9 },
    { id: "CS-110", name: "Julia Roberts", attendance: 88, midterm: 85, quiz: 82, studyHours: 14, prevGpa: 3.5 },
    { id: "CS-111", name: "Kevin Bacon", attendance: 76, midterm: 70, quiz: 75, studyHours: 11, prevGpa: 3.0 },
    { id: "CS-112", name: "Laura Croft", attendance: 94, midterm: 91, quiz: 93, studyHours: 20, prevGpa: 3.85 },
    { id: "CS-113", name: "Marcus Aurelius", attendance: 82, midterm: 78, quiz: 80, studyHours: 13, prevGpa: 3.3 },
    { id: "CS-114", name: "Nina Simone", attendance: 62, midterm: 55, quiz: 60, studyHours: 7, prevGpa: 2.5 },
    { id: "CS-115", name: "Oscar Wilde", attendance: 89, midterm: 83, quiz: 86, studyHours: 16, prevGpa: 3.6 },
    { id: "CS-116", name: "Penelope Cruz", attendance: 95, midterm: 96, quiz: 94, studyHours: 21, prevGpa: 3.95 },
    { id: "CS-117", name: "Quentin Tarantino", attendance: 70, midterm: 62, quiz: 65, studyHours: 8, prevGpa: 2.7 },
    { id: "CS-118", name: "Rachel Green", attendance: 85, midterm: 80, quiz: 84, studyHours: 14, prevGpa: 3.35 },
    { id: "CS-119", name: "Steve Rogers", attendance: 98, midterm: 95, quiz: 97, studyHours: 24, prevGpa: 4.0 },
    { id: "CS-120", name: "Tony Stark", attendance: 91, midterm: 98, quiz: 99, studyHours: 19, prevGpa: 3.98 }
  ],
  custom_subjects: [
    { "Roll No": "2026-001", "Candidate Name": "Aarav Sharma", "Physics Marks": 88, "Chemistry Marks": 92, "Maths Marks": 95, "Lab Score": 19, "Attendance %": 94 },
    { "Roll No": "2026-002", "Candidate Name": "Ananya Patel", "Physics Marks": 45, "Chemistry Marks": 52, "Maths Marks": 48, "Lab Score": 11, "Attendance %": 60 },
    { "Roll No": "2026-003", "Candidate Name": "Rohan Gupta", "Physics Marks": 72, "Chemistry Marks": 78, "Maths Marks": 80, "Lab Score": 16, "Attendance %": 82 },
    { "Roll No": "2026-004", "Candidate Name": "Sneha Reddy", "Physics Marks": 95, "Chemistry Marks": 90, "Maths Marks": 98, "Lab Score": 20, "Attendance %": 96 },
    { "Roll No": "2026-005", "Candidate Name": "Vikram Singh", "Physics Marks": 35, "Chemistry Marks": 40, "Maths Marks": 38, "Lab Score": 9, "Attendance %": 50 }
  ]
};

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  loadSampleData('cs'); // Default dataset
});

// Event Listeners Setup
function setupEventListeners() {
  const mobileToggle = document.getElementById("mobileToggle");
  const navLinks = document.getElementById("navLinks");
  if (mobileToggle) {
    mobileToggle.addEventListener("click", () => {
      navLinks.style.display = navLinks.style.display === "flex" ? "none" : "flex";
      navLinks.style.flexDirection = "column";
      navLinks.style.position = "absolute";
      navLinks.style.top = "70px";
      navLinks.style.left = "0";
      navLinks.style.right = "0";
      navLinks.style.background = "#ffffff";
      navLinks.style.padding = "20px";
      navLinks.style.boxShadow = "0 10px 30px rgba(0,0,0,0.1)";
    });
  }

  // Drag and Drop Zone
  const dropZone = document.getElementById("dropZone");
  const fileInput = document.getElementById("fileInput");

  if (dropZone && fileInput) {
    dropZone.addEventListener("click", () => fileInput.click());

    dropZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropZone.classList.add("dragover");
    });

    dropZone.addEventListener("dragleave", () => {
      dropZone.classList.remove("dragover");
    });

    dropZone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropZone.classList.remove("dragover");
      if (e.dataTransfer.files.length > 0) {
        handleFileSelect(e.dataTransfer.files[0]);
      }
    });

    fileInput.addEventListener("change", (e) => {
      if (e.target.files.length > 0) {
        handleFileSelect(e.target.files[0]);
      }
    });
  }

  // Filter Listeners
  document.getElementById("filterGrade")?.addEventListener("change", applyFilters);
  document.getElementById("filterRisk")?.addEventListener("change", applyFilters);
  document.getElementById("filterSearch")?.addEventListener("input", applyFilters);
  document.getElementById("filterMarksRange")?.addEventListener("input", (e) => {
    document.getElementById("marksRangeVal").textContent = `${e.target.value}+`;
    applyFilters();
  });

  document.getElementById("btnResetFilters")?.addEventListener("click", resetFilters);
  document.getElementById("btnExportExcel")?.addEventListener("click", exportPredictionsToExcel);
  document.getElementById("btnDownloadTemplate")?.addEventListener("click", downloadSampleExcel);

  // Modal Close
  document.getElementById("modalClose")?.addEventListener("click", closeModal);
  document.getElementById("studentModal")?.addEventListener("click", (e) => {
    if (e.target.id === "studentModal") closeModal();
  });
}

// Handle File Upload
function handleFileSelect(file) {
  const fileNameDisplay = document.getElementById("fileNameDisplay");
  if (fileNameDisplay) {
    fileNameDisplay.textContent = `Uploaded: ${file.name}`;
    fileNameDisplay.style.color = "#ea580c";
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rawJson = XLSX.utils.sheet_to_json(worksheet);

      if (!rawJson || rawJson.length === 0) {
        alert("The uploaded Excel file contains no data rows.");
        return;
      }

      processAnyExcelTemplate(rawJson);
    } catch (err) {
      console.error("Error reading Excel file:", err);
      alert("Failed to parse Excel file. Please upload a valid .xlsx, .xls or .csv spreadsheet.");
    }
  };
  reader.readAsArrayBuffer(file);
}

// Universal Template Detector Engine
function inspectTemplateStructure(rawRows) {
  if (!rawRows || rawRows.length === 0) return null;

  const sampleRow = rawRows[0];
  const allKeys = Object.keys(sampleRow);

  let idKey = null;
  let nameKey = null;
  let attendanceKey = null;
  let midtermKey = null;
  const numericKeys = [];
  const columnMaxValues = {};

  allKeys.forEach(key => {
    const keyLower = key.toLowerCase().replace(/[^a-z0-9]/g, '');

    if (!idKey && (keyLower.includes('id') || keyLower.includes('roll') || keyLower.includes('code') || keyLower.includes('reg'))) {
      idKey = key;
    }
    if (!nameKey && (keyLower.includes('name') || keyLower.includes('student') || keyLower.includes('candidate'))) {
      nameKey = key;
    }
    if (!attendanceKey && (keyLower.includes('attendance') || keyLower.includes('present') || keyLower.includes('att'))) {
      attendanceKey = key;
    }
    if (!midtermKey && (keyLower.includes('midterm') || keyLower.includes('exam') || keyLower.includes('test'))) {
      midtermKey = key;
    }

    const isNumeric = rawRows.some(row => {
      const val = row[key];
      return val !== null && val !== undefined && !isNaN(parseFloat(val));
    });

    if (isNumeric && key !== idKey && key !== nameKey) {
      numericKeys.push(key);
      const maxVal = Math.max(...rawRows.map(r => parseFloat(r[key]) || 0));
      columnMaxValues[key] = maxVal > 0 ? maxVal : 100;
    }
  });

  if (!nameKey) {
    nameKey = allKeys.find(k => k !== idKey && typeof sampleRow[k] === 'string') || allKeys[0];
  }
  if (!idKey) {
    idKey = allKeys.find(k => k !== nameKey) || 'Generated_ID';
  }

  return {
    idKey,
    nameKey,
    attendanceKey,
    midtermKey,
    numericKeys,
    columnMaxValues,
    totalColumns: allKeys.length
  };
}

// Predict Student Performance Model
function predictPerformance(row, index, config) {
  const idKey = config?.idKey || 'id';
  const nameKey = config?.nameKey || 'name';
  const attendanceKey = config?.attendanceKey || 'attendance';
  const midtermKey = config?.midtermKey || 'midterm';

  const id = row[idKey] !== undefined ? String(row[idKey]) : (row.id || `STU-${1000 + index}`);
  const name = row[nameKey] !== undefined ? String(row[nameKey]) : (row.name || `Student ${index + 1}`);

  // Raw values extraction
  const attendanceRaw = parseFloat(row[attendanceKey] !== undefined ? row[attendanceKey] : (row.attendance || 75));
  const midtermRaw = parseFloat(row[midtermKey] !== undefined ? row[midtermKey] : (row.midterm || 70));
  const quizRaw = parseFloat(row.quiz || row['Quiz Score'] || row.assignment || 70);
  const studyHoursRaw = parseFloat(row.studyHours || row['Weekly Study Hours'] || row.study_time || 10);
  const prevGpaRaw = parseFloat(row.prevGpa || row['Previous GPA'] || row.gpa || 3.0);

  // Scaled & Normalized Attendance & Midterm
  const attMax = config?.columnMaxValues[attendanceKey] || 100;
  const attendance = Math.min(Math.max(Math.round((attendanceRaw / attMax) * 100), 0), 100);

  const midMax = config?.columnMaxValues[midtermKey] || 100;
  const midterm = Math.min(Math.max(Math.round((midtermRaw / midMax) * 100), 0), 100);

  // Multi-Factor Prediction Formula
  let predictedScore = 0;
  let featureBreakdown = [];

  if (config && config.numericKeys && config.numericKeys.length > 0) {
    let sumNormalized = 0;
    config.numericKeys.forEach(k => {
      const rawVal = parseFloat(row[k]) || 0;
      const maxVal = config.columnMaxValues[k] || 100;
      const normVal = Math.min(Math.max((rawVal / maxVal) * 100, 0), 100);
      sumNormalized += normVal;

      featureBreakdown.push({
        feature: k,
        raw: rawVal,
        max: maxVal,
        normalized: Math.round(normVal)
      });
    });

    const evalAvg = sumNormalized / config.numericKeys.length;
    predictedScore = config.attendanceKey ? Math.round(evalAvg * 0.75 + attendance * 0.25) : Math.round(evalAvg);
  } else {
    // Standard explicit model calculation
    const gpaPct = (prevGpaRaw / 4.0) * 100;
    const studyScore = Math.min((studyHoursRaw / 25) * 100, 100);
    predictedScore = Math.round(
      (midterm * 0.35) + (attendance * 0.25) + (quizRaw * 0.20) + (studyScore * 0.10) + (gpaPct * 0.10)
    );
  }

  predictedScore = Math.min(Math.max(predictedScore, 0), 100);

  // Grade Assignment
  let grade = "F";
  let gradeBadgeClass = "badge-grade-f";

  if (predictedScore >= 90) { grade = "A+"; gradeBadgeClass = "badge-grade-aplus"; }
  else if (predictedScore >= 80) { grade = "A"; gradeBadgeClass = "badge-grade-a"; }
  else if (predictedScore >= 70) { grade = "B"; gradeBadgeClass = "badge-grade-b"; }
  else if (predictedScore >= 60) { grade = "C"; gradeBadgeClass = "badge-grade-c"; }
  else if (predictedScore >= 50) { grade = "D"; gradeBadgeClass = "badge-grade-d"; }

  // Risk Classification
  let riskLevel = "Low";
  let riskBadgeClass = "badge-risk-low";
  let recommendations = [];

  if (predictedScore < 55 || attendance < 60 || midterm < 50) {
    riskLevel = "High";
    riskBadgeClass = "badge-risk-high";
    recommendations.push("High Priority: Assign Academic Counselor & Tutoring");
    if (attendance < 60) recommendations.push(`Attendance Warning: Currently at ${attendance}%`);
    if (midterm < 50) recommendations.push("Remedial Examination Prep Recommended");
  } else if (predictedScore < 70 || attendance < 75) {
    riskLevel = "Medium";
    riskBadgeClass = "badge-risk-med";
    recommendations.push("Moderate Risk: Encourage Peer Study Groups");
    if (attendance < 75) recommendations.push("Monitor Class Attendance Closely");
  } else {
    recommendations.push("Excellent Performance! On track for Academic Honors.");
  }

  const passProbability = Math.min(Math.max(Math.round((predictedScore / 100) * 98), 10), 99);

  return {
    id,
    name,
    attendance,
    midterm,
    quiz: Math.round(quizRaw),
    studyHours: Math.round(studyHoursRaw),
    prevGpa: prevGpaRaw,
    predictedScore,
    grade,
    gradeBadgeClass,
    riskLevel,
    riskBadgeClass,
    passProbability,
    featureBreakdown,
    recommendations
  };
}

// Process and Render Any Excel Template
function processAnyExcelTemplate(rawRows) {
  detectedTemplateConfig = inspectTemplateStructure(rawRows);
  renderTemplateConfigInfo(detectedTemplateConfig);

  currentStudentsData = rawRows.map((row, index) => 
    predictPerformance(row, index, detectedTemplateConfig)
  );

  renderHeroPreviewStream(currentStudentsData);
  applyFilters();
}

// DYNAMIC HERO PREVIEW LIVE STREAM UPDATER
function renderHeroPreviewStream(students) {
  const container = document.getElementById("heroPreviewRows");
  if (!container || !students || students.length === 0) return;

  // Pick top 3 students (or first 3) to display live in the Hero Preview Card
  const previewList = students.slice(0, 3);
  container.innerHTML = "";

  previewList.forEach((s, idx) => {
    // Generate avatar initials
    const initials = s.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();

    // Custom gradient avatars
    const gradients = [
      "linear-gradient(135deg, var(--primary), var(--secondary))",
      "linear-gradient(135deg, var(--danger), var(--primary))",
      "linear-gradient(135deg, var(--secondary), var(--accent-amber))"
    ];

    const row = document.createElement("div");
    row.className = "preview-row";
    row.style.animation = `fadeInRow ${0.3 + idx * 0.15}s ease-in-out`;

    row.innerHTML = `
      <div class="student-info">
        <div class="student-avatar" style="background:${gradients[idx % 3]};">${initials}</div>
        <div class="student-details">
          <h5>${s.name} (${s.id})</h5>
          <p>Attendance: ${s.attendance}% | Midterm: ${s.midterm}/100</p>
        </div>
      </div>
      <div style="text-align:right;">
        <span class="badge ${s.riskLevel === 'High' ? s.riskBadgeClass : s.gradeBadgeClass}">
          ${s.riskLevel === 'High' ? 'High Risk' : s.grade + ' Grade'}
        </span>
        <div style="font-size:0.75rem; color:var(--text-muted); margin-top:4px;">Pred Marks: ${s.predictedScore}/100</div>
      </div>
    `;
    container.appendChild(row);
  });
}

// Display Template Auto-Detection Banner
function renderTemplateConfigInfo(config) {
  const banner = document.getElementById("templateDetectionBanner");
  if (!banner) return;

  const assessmentCols = config.numericKeys.length > 0 ? config.numericKeys.join(", ") : "Standard Scores";
  banner.innerHTML = `
    <div style="display:flex; align-items:center; gap:10px; font-size:0.875rem; color:#c2410c; background:#fff7ed; padding:12px 18px; border-radius:var(--radius-md); border:1px solid rgba(234,88,12,0.25); margin-bottom:20px;">
      <i class="fa-solid fa-wand-magic-sparkles" style="color:var(--primary); font-size:1.1rem;"></i>
      <div>
        <strong>Universal Template Mapped:</strong> Student Name: <code>${config.nameKey}</code> (${config.idKey}). 
        Auto-scaled evaluation columns: <strong>${assessmentCols}</strong>.
      </div>
    </div>
  `;
}

// Load Prebuilt Datasets
function loadSampleData(datasetKey) {
  if (SAMPLE_DATASETS[datasetKey]) {
    const fileNameDisplay = document.getElementById("fileNameDisplay");
    if (fileNameDisplay) {
      const name = datasetKey === 'cs' ? 'Standard Template' : 'Multi-Subject Sheet';
      fileNameDisplay.textContent = `Preloaded: ${name} (${SAMPLE_DATASETS[datasetKey].length} Students)`;
      fileNameDisplay.style.color = "#ea580c";
    }
    processAnyExcelTemplate(SAMPLE_DATASETS[datasetKey]);
  }
}

// Apply Filters (Grade, Risk, Marks, Search)
function applyFilters() {
  const gradeFilter = document.getElementById("filterGrade")?.value || "all";
  const riskFilter = document.getElementById("filterRisk")?.value || "all";
  const minMarks = parseInt(document.getElementById("filterMarksRange")?.value || "0", 10);
  const searchVal = (document.getElementById("filterSearch")?.value || "").toLowerCase().trim();

  filteredStudentsData = currentStudentsData.filter(s => {
    if (gradeFilter !== "all" && s.grade !== gradeFilter) return false;
    if (riskFilter !== "all" && s.riskLevel.toLowerCase() !== riskFilter.toLowerCase()) return false;
    if (s.predictedScore < minMarks) return false;
    if (searchVal && !s.name.toLowerCase().includes(searchVal) && !s.id.toLowerCase().includes(searchVal)) {
      return false;
    }
    return true;
  });

  renderKPIs();
  renderTable();
  renderCharts();
}

function resetFilters() {
  if (document.getElementById("filterGrade")) document.getElementById("filterGrade").value = "all";
  if (document.getElementById("filterRisk")) document.getElementById("filterRisk").value = "all";
  if (document.getElementById("filterMarksRange")) {
    document.getElementById("filterMarksRange").value = "0";
    document.getElementById("marksRangeVal").textContent = "0+";
  }
  if (document.getElementById("filterSearch")) document.getElementById("filterSearch").value = "";
  applyFilters();
}

function renderKPIs() {
  const total = currentStudentsData.length;
  if (total === 0) return;

  const avgMarks = Math.round(currentStudentsData.reduce((acc, s) => acc + s.predictedScore, 0) / total);
  const topPerformers = currentStudentsData.filter(s => s.predictedScore >= 80).length;
  const atRisk = currentStudentsData.filter(s => s.riskLevel === "High").length;
  const passRate = Math.round((currentStudentsData.filter(s => s.predictedScore >= 50).length / total) * 100);

  document.getElementById("kpiTotalStudents").textContent = total;
  document.getElementById("kpiAvgMarks").textContent = `${avgMarks}/100`;
  document.getElementById("kpiTopPerformers").textContent = topPerformers;
  document.getElementById("kpiAtRisk").textContent = atRisk;
  document.getElementById("kpiPassRate").textContent = `${passRate}%`;
}

function renderTable() {
  const tbody = document.getElementById("studentsTableBody");
  const countEl = document.getElementById("showingCount");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (countEl) {
    countEl.textContent = `Showing ${filteredStudentsData.length} of ${currentStudentsData.length} students`;
  }

  if (filteredStudentsData.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center; padding: 40px; color: var(--text-muted);">
          <i class="fa-solid fa-search" style="font-size: 2rem; margin-bottom: 10px; display:block; color:var(--primary);"></i>
          No students match the selected filter criteria.
        </td>
      </tr>
    `;
    return;
  }

  filteredStudentsData.forEach(s => {
    const tr = document.createElement("tr");
    tr.onclick = () => openStudentModal(s);

    tr.innerHTML = `
      <td><strong>${s.id}</strong></td>
      <td>
        <div style="font-weight: 700; color:var(--text-main);">${s.name}</div>
        <div style="font-size: 0.75rem; color: var(--text-muted);">Study: ${s.studyHours}h/wk</div>
      </td>
      <td>${s.attendance}%</td>
      <td>${s.midterm}/100</td>
      <td><strong style="color:var(--primary); font-size:1.05rem;">${s.predictedScore}</strong>/100</td>
      <td><span class="badge ${s.gradeBadgeClass}">${s.grade}</span></td>
      <td><span class="badge ${s.riskBadgeClass}">${s.riskLevel} Risk</span></td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="event.stopPropagation(); openStudentModalById('${s.id}')">
          View Report
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Chart.js Visualizations
function renderCharts() {
  if (typeof Chart === "undefined") return;

  // Grade Distribution Bar Chart
  const gradeCounts = { 'A+': 0, 'A': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0 };
  currentStudentsData.forEach(s => {
    if (gradeCounts[s.grade] !== undefined) gradeCounts[s.grade]++;
  });

  const ctxGrade = document.getElementById("gradeChart")?.getContext("2d");
  if (ctxGrade) {
    if (gradeChartInstance) gradeChartInstance.destroy();
    gradeChartInstance = new Chart(ctxGrade, {
      type: "bar",
      data: {
        labels: Object.keys(gradeCounts),
        datasets: [{
          label: "Number of Students",
          data: Object.values(gradeCounts),
          backgroundColor: [
            "#ea580c", "#f97316", "#2563eb", "#d97706", "#ef4444", "#dc2626"
          ],
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { grid: { color: "rgba(0,0,0,0.05)" }, ticks: { color: "#475569" } },
          y: { grid: { color: "rgba(0,0,0,0.05)" }, ticks: { color: "#475569", precision: 0 } }
        }
      }
    });
  }

  // Risk Level Doughnut Chart
  const riskCounts = { Low: 0, Medium: 0, High: 0 };
  currentStudentsData.forEach(s => {
    if (riskCounts[s.riskLevel] !== undefined) riskCounts[s.riskLevel]++;
  });

  const ctxRisk = document.getElementById("riskChart")?.getContext("2d");
  if (ctxRisk) {
    if (riskChartInstance) riskChartInstance.destroy();
    riskChartInstance = new Chart(ctxRisk, {
      type: "doughnut",
      data: {
        labels: ["Low Risk", "Medium Risk", "High Risk"],
        datasets: [{
          data: [riskCounts.Low, riskCounts.Medium, riskCounts.High],
          backgroundColor: ["#10b981", "#f59e0b", "#ef4444"],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: { color: "#475569", padding: 16 }
          }
        }
      }
    });
  }
}

function openStudentModalById(id) {
  const student = currentStudentsData.find(s => s.id === id);
  if (student) openStudentModal(student);
}

function openStudentModal(student) {
  const modal = document.getElementById("studentModal");
  if (!modal) return;

  document.getElementById("modalStudentName").textContent = student.name;
  document.getElementById("modalStudentId").textContent = `Student ID: ${student.id} | GPA: ${student.prevGpa}`;
  document.getElementById("modalAttendance").textContent = `${student.attendance}%`;
  document.getElementById("modalPredictedMarks").textContent = `${student.predictedScore}/100`;
  
  const modalGrade = document.getElementById("modalGrade");
  modalGrade.textContent = student.grade;
  modalGrade.className = `badge ${student.gradeBadgeClass}`;

  const modalRisk = document.getElementById("modalRisk");
  modalRisk.textContent = `${student.riskLevel} Risk`;
  modalRisk.className = `badge ${student.riskBadgeClass}`;

  const featureBox = document.getElementById("modalFeatureBreakdown");
  if (featureBox) {
    if (student.featureBreakdown && student.featureBreakdown.length > 0) {
      featureBox.innerHTML = student.featureBreakdown.map(f => `
        <div style="display:flex; justify-content:space-between; margin-bottom:6px; font-size:0.875rem;">
          <span style="color:var(--text-muted); font-weight:600;">${f.feature}:</span>
          <span style="font-weight:700; color:var(--text-main);">${f.raw} / ${f.max} (Normalized: ${f.normalized}%)</span>
        </div>
      `).join("");
    } else {
      featureBox.innerHTML = `
        <div style="font-size:0.85rem; color:var(--text-muted);">
          Midterm: ${student.midterm}/100 | Quiz: ${student.quiz}/100 | Study: ${student.studyHours}h/wk
        </div>
      `;
    }
  }

  const recsList = document.getElementById("modalRecommendations");
  recsList.innerHTML = student.recommendations.map(r => `<li>${r}</li>`).join("");

  modal.classList.add("active");
}

function closeModal() {
  document.getElementById("studentModal")?.classList.remove("active");
}

function downloadSampleExcel() {
  const templateData = [
    { "Student ID": "STU-101", "Student Name": "John Doe", "Attendance (%)": 85, "Midterm Marks": 78, "Quiz Score": 80, "Weekly Study Hours": 14, "Previous GPA": 3.4 },
    { "Student ID": "STU-102", "Student Name": "Jane Smith", "Attendance (%)": 62, "Midterm Marks": 45, "Quiz Score": 55, "Weekly Study Hours": 6, "Previous GPA": 2.2 },
    { "Student ID": "STU-103", "Student Name": "Robert Johnson", "Attendance (%)": 95, "Midterm Marks": 92, "Quiz Score": 90, "Weekly Study Hours": 20, "Previous GPA": 3.9 }
  ];

  const ws = XLSX.utils.json_to_sheet(templateData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Students Template");
  XLSX.writeFile(wb, "Student_Performance_Template.xlsx");
}

function exportPredictionsToExcel() {
  if (filteredStudentsData.length === 0) {
    alert("No student data available to export.");
    return;
  }

  const exportData = filteredStudentsData.map(s => {
    const row = {
      "Student ID": s.id,
      "Student Name": s.name,
      "Attendance (%)": `${s.attendance}%`,
      "Midterm Marks": `${s.midterm}/100`,
      "Predicted Final Marks": s.predictedScore,
      "Predicted Grade": s.grade,
      "Risk Category": s.riskLevel,
      "Pass Probability (%)": `${s.passProbability}%`,
      "Recommended Interventions": s.recommendations.join("; ")
    };

    if (s.featureBreakdown) {
      s.featureBreakdown.forEach(f => {
        row[`Raw Score (${f.feature})`] = `${f.raw}/${f.max}`;
      });
    }

    return row;
  });

  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Predictions Summary");
  XLSX.writeFile(wb, "Student_Performance_Predictions.xlsx");
}
