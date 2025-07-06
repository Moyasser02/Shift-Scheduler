from pulp import LpProblem, LpMinimize, LpVariable, lpSum, LpBinary, LpStatus
from datetime import datetime
from collections import defaultdict


def run_ilp(employees, shifts):
    prob = LpProblem("Shift_Scheduling", LpMinimize)

    # Create decision variables for valid skill matches
    x = {
        (e["id"], s["id"]): LpVariable(f"x_{e['id']}_{s['id']}", 0, 1, LpBinary)
        for e in employees
        for s in shifts
        if s["required_skill"] in e["skills"]
    }

    # Objective: maximize total shift coverage
    prob += lpSum(x[e_id, s_id] for (e_id, s_id) in x), "Total_Shifts_Assigned"

    # Constraint: Each shift must be covered by 1 employee
    for s in shifts:
        prob += lpSum(
            x[e["id"], s["id"]] for e in employees if (e["id"], s["id"]) in x
        ) == 1, f"Cover_{s['id']}"

    # Constraint: Employees do not exceed max hours
    for e in employees:
        emp_id = e["id"]
        total_hours = lpSum(
            x[emp_id, s["id"]] * calculate_hours(s)
            for s in shifts if (emp_id, s["id"]) in x
        )
        prob += total_hours <= e["max_hours"], f"MaxHours_{emp_id}"

    # ✅ Constraint: No more than one shift per day per employee
    for e in employees:
        emp_id = e["id"]
        shifts_by_day = defaultdict(list)

        for s in shifts:
            if (emp_id, s["id"]) in x:
                day = s["start_time"].split("T")[0]
                shifts_by_day[day].append(s["id"])

        for day, shift_ids in shifts_by_day.items():
            prob += lpSum(x[emp_id, sid] for sid in shift_ids) <= 1, f"OneShiftPerDay_{emp_id}_{day}"

    # Solve
    status = prob.solve()

    # Build assignments
    assignments = []
    for (e_id, s_id), var in x.items():
        if var.value() == 1:
            assignments.append({"employee_id": e_id, "shift_id": s_id})

    return {
        "success": LpStatus[status] == "Optimal",
        "assignments": assignments,
        "unassigned_shifts": [
            s["id"] for s in shifts if s["id"] not in [a["shift_id"] for a in assignments]
        ],
        "metrics": {
            "total_overtime_minutes": 0,
            "constraint_violations": 0,
            "optimization_time_ms": 0,
            "objective_value": prob.objective.value(),
        },
        "constraints_applied": ["skill_matching", "max_hours", "one_shift_per_day"]
    }


def calculate_hours(shift):
    fmt = "%Y-%m-%dT%H:%M:%S"
    start = datetime.strptime(shift["start_time"], fmt)
    end = datetime.strptime(shift["end_time"], fmt)
    duration = (end - start).total_seconds() / 3600
    return duration
