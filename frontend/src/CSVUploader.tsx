import React, { useState } from 'react';
import Papa from 'papaparse';

// Employee Type
type Employee = {
  id: string;
  name: string;
  skills: string[];
  max_hours: number;
  availability_start: string;
  availability_end: string;
};

// Shift Type
type Shift = {
  id: string;
  role: string;
  start_time: string;
  end_time: string;
  required_skill: string;
};

const CSVUploader = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [assignments, setAssignments] = useState<{ shiftId: string; employeeId: string }[]>([]);

  const handleEmployeeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        const parsed = results.data.map((row: any) => ({
          id: row.id,
          name: row.name,
          skills: row.skills.split(','),
          max_hours: Number(row.max_hours),
          availability_start: row.availability_start,
          availability_end: row.availability_end,
        }));
        setEmployees(parsed);
      },
    });
  };

  const handleShiftUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        const parsed = results.data.map((row: any) => ({
          id: row.id,
          role: row.role,
          start_time: row.start_time,
          end_time: row.end_time,
          required_skill: row.required_skill,
        }));
        setShifts(parsed);
      },
    });
  };

  const runGreedyScheduler = () => {
    const newAssignments: { shiftId: string; employeeId: string }[] = [];

    // Track remaining hours per employee
    const employeeHours: { [id: string]: number } = {};
    // Track assigned dates per employee
    const employeeAssignedDates: { [id: string]: Set<string> } = {};

    employees.forEach(emp => {
      employeeHours[emp.id] = emp.max_hours;
      employeeAssignedDates[emp.id] = new Set();
    });

    for (const shift of shifts) {
      const shiftStart = new Date(shift.start_time);
      const shiftEnd = new Date(shift.end_time);
      const shiftDurationHours = (shiftEnd.getTime() - shiftStart.getTime()) / (1000 * 60 * 60); // in hours

      const shiftDate = shift.start_time.split('T')[0];

      const availableEmployee = employees.find(emp => {
        const hasSkill = emp.skills.includes(shift.required_skill);
        const availableTime =
          shiftStart >= new Date(emp.availability_start) &&
          shiftEnd <= new Date(emp.availability_end);
        const hasHours = employeeHours[emp.id] >= shiftDurationHours;
        const notAlreadyAssignedToday = !employeeAssignedDates[emp.id].has(shiftDate);

        return hasSkill && availableTime && hasHours && notAlreadyAssignedToday;
      });

      if (availableEmployee) {
        newAssignments.push({
          shiftId: shift.id,
          employeeId: availableEmployee.id,
        });

        employeeHours[availableEmployee.id] -= shiftDurationHours;
        employeeAssignedDates[availableEmployee.id].add(shiftDate);
      }
    }

    setAssignments(newAssignments);
  };
  const runOnlineScheduler = async () => {
  try {
    const res = await fetch("http://localhost:8000/api/schedule/optimize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
  period: "2025-07-01/2025-07-14", 
  shifts,
  current_assignments: [] 
}),
    });

    if (!res.ok) throw new Error("Failed to schedule online");

    const data = await res.json();

const formattedAssignments = data.assignments.map((a: any) => ({
  shiftId: a.shift_id,
  employeeId: a.employee_id
}));

setAssignments(formattedAssignments);

    alert("✅ Online optimization complete!");
  } catch (err: any) {
    alert("❌ Online scheduler failed: " + err.message);
  }
};


  // ✅ Export Assignments as CSV
  const exportToCSV = () => {
    const data = shifts.map((shift) => {
      const assigned = assignments.find((a) => a.shiftId === shift.id);
      const emp = employees.find((e) => e.id === assigned?.employeeId);
      const date = shift.start_time.split('T')[0];

      return {
        shift_id: shift.id,
        shift_role: shift.role,
        date: date,
        employee_name: emp ? emp.name : 'Unassigned',
      };
    });

    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'assignments.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <h2>Upload Employees CSV</h2>
      <input type="file" accept=".csv" onChange={handleEmployeeUpload} />

      <h2>Upload Shifts CSV</h2>
      <input type="file" accept=".csv" onChange={handleShiftUpload} />

      <h3>Parsed Employees:</h3>
      <ul>
        {employees.map((emp) => (
          <li key={emp.id}>
            {emp.name} - Skills: {emp.skills.join(', ')}
          </li>
        ))}
      </ul>

      <h3>Parsed Shifts:</h3>
      <ul>
        {shifts.map((shift) => (
          <li key={shift.id}>
            {shift.role} — Requires: {shift.required_skill}
          </li>
        ))}
      </ul>

      <button onClick={runGreedyScheduler} style={{ marginTop: '1rem' }}>
        Run Greedy Scheduler
      </button>
      <button
  onClick={runOnlineScheduler}
  className="bg-blue-500 hover:bg-blue-400 text-black font-semibold py-2 px-4 rounded mt-2"
>
  🌐 Run Online Scheduler
</button>


      <h3>Assignments Table:</h3>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid black', padding: '8px' }}>Date</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Shift Role</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Shift Hours</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Assigned Employee</th>
          </tr>
        </thead>
        <tbody>
          {shifts.map((shift) => {
            const assigned = assignments.find((a) => a.shiftId === shift.id);
            const emp = employees.find((e) => e.id === assigned?.employeeId);
            const date = shift.start_time.split('T')[0];

            const shiftStart = new Date(shift.start_time);
            const shiftEnd = new Date(shift.end_time);
            const shiftHours = (shiftEnd.getTime() - shiftStart.getTime()) / (1000 * 60 * 60);

            return (
              <tr
                key={shift.id}
                style={{
                  backgroundColor: emp ? 'white' : '#ffe6e6',
                }}
              >
                <td style={{ border: '1px solid black', padding: '8px' }}>{date}</td>
                <td style={{ border: '1px solid black', padding: '8px' }}>{shift.role}</td>
                <td style={{ border: '1px solid black', padding: '8px' }}>{shiftHours}</td>
                <td style={{ border: '1px solid black', padding: '8px' }}>
                  {emp ? emp.name : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <h4>Summary:</h4>
      <ul>
        <li>Total Shifts: {shifts.length}</li>
        <li>Assigned: {assignments.length}</li>
        <li>Unassigned: {shifts.length - assignments.length}</li>
        <li>Coverage: {((assignments.length / shifts.length) * 100).toFixed(1)}%</li>
      </ul>

      <button onClick={exportToCSV} style={{ marginTop: '1rem', padding: '8px 16px' }}>
        Export Assignments as CSV
      </button>
    </div>
  );
};

export default CSVUploader;
