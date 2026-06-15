document.addEventListener('DOMContentLoaded', () => {
    // State management
    let billHistory = JSON.parse(localStorage.getItem('voltcalc_history')) || [
        { month: 'Jan', units: 180, cost: 26.4 },
        { month: 'Feb', units: 220, cost: 35.6 },
        { month: 'Mar', units: 290, cost: 48.2 },
        { month: 'Apr', units: 340, cost: 63.0 },
        { month: 'May', units: 410, cost: 80.5 }
    ];
    
    let historyChartInstance = null;

    // DOM Elements
    const calcForm = document.getElementById('calc-form');
    const prevReadingInput = document.getElementById('prev-reading');
    const currReadingInput = document.getElementById('curr-reading');
    const fixedChargeInput = document.getElementById('fixed-charge');
    const rate1Input = document.getElementById('rate-1');
    const rate2Input = document.getElementById('rate-2');
    const rate3Input = document.getElementById('rate-3');

    const totalBillEl = document.getElementById('total-bill');
    const totalUnitsEl = document.getElementById('total-units');
    const slabBreakdownEl = document.getElementById('slab-breakdown');

    const avgUnitsEl = document.getElementById('avg-units');
    const avgCostEl = document.getElementById('avg-cost');
    const co2FootprintEl = document.getElementById('co2-footprint');
    const clearHistoryBtn = document.getElementById('clear-history');

    // Appliance inputs
    const acWatts = document.getElementById('ac-watts');
    const acHours = document.getElementById('ac-hours');
    const acKwh = document.getElementById('ac-kwh');

    const refWatts = document.getElementById('ref-watts');
    const refHours = document.getElementById('ref-hours');
    const refKwh = document.getElementById('ref-kwh');

    const tvWatts = document.getElementById('tv-watts');
    const tvHours = document.getElementById('tv-hours');
    const tvKwh = document.getElementById('tv-kwh');

    const lapWatts = document.getElementById('lap-watts');
    const lapHours = document.getElementById('lap-hours');
    const lapKwh = document.getElementById('lap-kwh');

    const applianceTotalEl = document.getElementById('appliance-total');

    // Initialize Dashboard
    function init() {
        updateMetrics();
        renderChart();
        calculateAppliances();
        setupApplianceListeners();
    }

    // Slab Calculation
    function calculateBill(units, rate1, rate2, rate3, fixedCharge) {
        let remainingUnits = units;
        let cost = 0;
        let breakdown = [];

        // Slab 1: 0 - 100
        const slab1Units = Math.min(remainingUnits, 100);
        if (slab1Units > 0) {
            const slab1Cost = slab1Units * rate1;
            cost += slab1Cost;
            remainingUnits -= slab1Units;
            breakdown.push({ slab: '0 - 100 Units', units: slab1Units, rate: rate1, amount: slab1Cost });
        }

        // Slab 2: 101 - 300
        const slab2Units = Math.min(remainingUnits, 200);
        if (slab2Units > 0) {
            const slab2Cost = slab2Units * rate2;
            cost += slab2Cost;
            remainingUnits -= slab2Units;
            breakdown.push({ slab: '101 - 300 Units', units: slab2Units, rate: rate2, amount: slab2Cost });
        }

        // Slab 3: 301+
        if (remainingUnits > 0) {
            const slab3Cost = remainingUnits * rate3;
            cost += slab3Cost;
            breakdown.push({ slab: '301+ Units', units: remainingUnits, rate: rate3, amount: slab3Cost });
        }

        // Fixed Charges
        cost += fixedCharge;

        return {
            totalCost: cost,
            breakdown: breakdown
        };
    }

    // Form Submit
    calcForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const prev = parseFloat(prevReadingInput.value);
        const curr = parseFloat(currReadingInput.value);
        const fixed = parseFloat(fixedChargeInput.value);
        const r1 = parseFloat(rate1Input.value);
        const r2 = parseFloat(rate2Input.value);
        const r3 = parseFloat(rate3Input.value);

        if (curr < prev) {
            alert('Current reading must be greater than or equal to previous reading.');
            return;
        }

        const totalUnits = curr - prev;
        const calculation = calculateBill(totalUnits, r1, r2, r3, fixed);

        // Display results
        totalBillEl.textContent = `$${calculation.totalCost.toFixed(2)}`;
        totalUnitsEl.textContent = `${totalUnits} kWh consumed`;

        // Render breakdown table
        let breakdownHtml = '';
        calculation.breakdown.forEach(row => {
            breakdownHtml += `
                <tr>
                    <td>${row.slab}</td>
                    <td class="text-end">${row.units}</td>
                    <td class="text-end">$${row.rate.toFixed(2)}</td>
                    <td class="text-end text-light">$${row.amount.toFixed(2)}</td>
                </tr>
            `;
        });

        // Add fixed charge row
        breakdownHtml += `
            <tr class="border-top border-secondary-light">
                <td>Fixed Service Charge</td>
                <td class="text-end">-</td>
                <td class="text-end">-</td>
                <td class="text-end text-light">$${fixed.toFixed(2)}</td>
            </tr>
            <tr class="table-active">
                <td class="fw-bold text-success">Total Bill</td>
                <td class="text-end fw-bold">${totalUnits}</td>
                <td class="text-end">-</td>
                <td class="text-end fw-bold text-success">$${calculation.totalCost.toFixed(2)}</td>
            </tr>
        `;
        slabBreakdownEl.innerHTML = breakdownHtml;

        // Log to history
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonth = months[new Date().getMonth()];
        
        // Push new data and restrict to last 12 readings
        billHistory.push({ month: currentMonth + ' ' + (new Date().getFullYear() % 100), units: totalUnits, cost: calculation.cost });
        if (billHistory.length > 12) billHistory.shift();
        
        localStorage.setItem('voltcalc_history', JSON.stringify(billHistory));
        
        updateMetrics();
        renderChart();
        updateSuggestions(totalUnits);
    });

    // Update Quick Metrics
    function updateMetrics() {
        if (billHistory.length === 0) {
            avgUnitsEl.textContent = '0 kWh';
            avgCostEl.textContent = '$0.00';
            co2FootprintEl.textContent = '0 kg CO2';
            return;
        }

        const totalUnits = billHistory.reduce((acc, curr) => acc + curr.units, 0);
        const totalCost = billHistory.reduce((acc, curr) => acc + curr.cost, 0);
        const avgUnits = totalUnits / billHistory.length;
        const avgCost = totalCost / billHistory.length;

        // Average carbon footprint: approx 0.85 lbs CO2 per kWh, which is ~0.385 kg CO2 per kWh
        const totalCo2 = totalUnits * 0.385;

        avgUnitsEl.textContent = `${avgUnits.toFixed(1)} kWh`;
        avgCostEl.textContent = `$${avgCost.toFixed(2)}`;
        co2FootprintEl.textContent = `${totalCo2.toFixed(1)} kg`;
    }

    // Chart.js Configuration
    function renderChart() {
        const ctx = document.getElementById('history-chart').getContext('2d');
        
        const labels = billHistory.map(d => d.month);
        const unitsData = billHistory.map(d => d.units);
        const costData = billHistory.map(d => d.cost);

        if (historyChartInstance) {
            historyChartInstance.destroy();
        }

        historyChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Units Consumed (kWh)',
                        data: unitsData,
                        backgroundColor: 'rgba(59, 130, 246, 0.6)',
                        borderColor: '#3b82f6',
                        borderWidth: 1,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Bill Cost ($)',
                        data: costData,
                        type: 'line',
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.2)',
                        borderWidth: 2,
                        tension: 0.3,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#9ca3af', font: { family: 'Outfit' } }
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#9ca3af' }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#9ca3af' }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        grid: { drawOnChartArea: false },
                        ticks: { color: '#9ca3af' }
                    }
                }
            }
        });
    }

    // Clear History handler
    clearHistoryBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear your billing history?')) {
            billHistory = [];
            localStorage.removeItem('voltcalc_history');
            updateMetrics();
            renderChart();
        }
    });

    // Appliance Calculations
    function calculateAppliances() {
        const acK = (parseFloat(acWatts.value) * parseFloat(acHours.value) * 30) / 1000;
        const refK = (parseFloat(refWatts.value) * parseFloat(refHours.value) * 30) / 1000;
        const tvK = (parseFloat(tvWatts.value) * parseFloat(tvHours.value) * 30) / 1000;
        const lapK = (parseFloat(lapWatts.value) * parseFloat(lapHours.value) * 30) / 1000;

        acKwh.textContent = acK.toFixed(1);
        refKwh.textContent = refK.toFixed(1);
        tvKwh.textContent = tvK.toFixed(1);
        lapKwh.textContent = lapK.toFixed(1);

        const totalApplianceKwh = acK + refK + tvK + lapK;
        applianceTotalEl.textContent = `${totalApplianceKwh.toFixed(1)} kWh`;
    }

    function setupApplianceListeners() {
        const inputs = [acWatts, acHours, refWatts, refHours, tvWatts, tvHours, lapWatts, lapHours];
        inputs.forEach(input => {
            input.addEventListener('input', calculateAppliances);
        });
    }

    // Dynamic suggestions based on consumption
    function updateSuggestions(units) {
        const tipsContainer = document.getElementById('saving-tips');
        let tips = [];

        if (units > 350) {
            tips = [
                { title: 'Heavy Consumption Warning', desc: 'Your units exceed 350 kWh. Try setting AC timer to power off 1 hour before wake up.', icon: 'fa-triangle-exclamation', color: 'text-danger' },
                { title: 'Reduce Appliance Usage', desc: 'AC and water heaters consume maximum loads. Limit AC hours to less than 5 hours per day.', icon: 'fa-clock', color: 'text-warning' },
                { title: 'Switch to Smart Power Strips', desc: 'Prevent standby power consumption from entertainment centers.', icon: 'fa-toggle-off', color: 'text-primary' }
            ];
        } else {
            tips = [
                { title: 'AC Temp Settings', desc: 'Keep your Air Conditioner at 24°C (75°F) to save up to 18% electricity.', icon: 'fa-snowflake', color: 'text-info' },
                { title: 'Phantom Loads', desc: 'Unplug chargers and stand-by electronics. Phantom power accounts for 5-10% of energy bills.', icon: 'fa-plug', color: 'text-success' },
                { title: 'LED Lighting Upgrade', desc: 'Switch from incandescent bulbs to LED. LEDs consume 75% less energy.', icon: 'fa-lightbulb', color: 'text-warning' }
            ];
        }

        let tipsHtml = '';
        tips.forEach(tip => {
            tipsHtml += `
                <div class="list-group-item bg-transparent border-secondary text-muted px-0 py-3 d-flex gap-3">
                    <i class="fa-solid ${tip.icon} ${tip.color} fs-5"></i>
                    <div>
                        <h6 class="fw-bold text-light m-0">${tip.title}</h6>
                        <p class="small m-0 mt-1">${tip.desc}</p>
                    </div>
                </div>
            `;
        });
        tipsContainer.innerHTML = tipsHtml;
    }

    init();
});
