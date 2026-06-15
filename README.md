# VoltCalc - Electricity Bill Estimator

VoltCalc is a modern, responsive web application designed to help users calculate and estimate their monthly electricity bills based on custom slab tariff rates. It provides detailed monthly usage analytics, Appliance-wise consumption estimation, and dynamic energy-saving suggestions.

## Features

- **Slab-Wise Bill Calculator**: Supports tiered (slab) pricing structures (e.g. 0-100 units, 101-300 units, 301+ units) along with fixed service charges.
- **Detailed Invoice Summary**: Shows a detailed breakdown of consumed units and pricing per slab.
- **Consumption Analytics**: Interactive dashboard visualizations with Chart.js showing monthly usage trends and billing history.
- **Quick Metrics**: Tracks average units consumed, average bill cost, and carbon footprint (CO2 estimation) over time.
- **Appliance Consumption Estimator**: Calculates expected monthly consumption (kWh) based on average appliance power (Watts) and daily hours of usage.
- **Dynamic Energy-Saving Tips**: Suggests tailored tips to save energy based on calculated usage thresholds.
- **Data Persistence**: Uses browser LocalStorage to keep track of user billing logs across page refreshes.

## Technologies Used

- **HTML5** (Semantic elements)
- **CSS3** (Custom style system, Glassmorphism, animations)
- **Bootstrap 5** (Responsive layout grid, cards, form inputs)
- **Vanilla JavaScript** (Calculation logic, local storage integrations)
- **Chart.js** (Interactive data visualization charts)
- **FontAwesome** (Modern iconography)

## Project Folder Structure

```text
├── index.html
├── style.css
├── script.js
├── README.md
└── .gitignore
```

## Installation Instructions

1. Clone this repository under your profile:
   ```bash
   git clone https://github.com/vakamalla-deekshitha/electricity-bill-estimator.git
   ```
2. Navigate into the project folder:
   ```bash
   cd electricity-bill-estimator
   ```
3. Open `index.html` directly in any web browser to run the application instantly. No additional servers or bundlers are required!

## Usage Instructions

1. **Calculate Bill**: Enter your previous and current meter readings, set fixed charges, configure slab tariff rates, and click "Calculate & Log".
2. **Review Breakdown**: Scroll down to see the table containing the exact slab charges and the total invoice summary.
3. **Analyze Trends**: Check the bar chart and quick metrics panels to understand your consumption trajectory and carbon output.
4. **Estimate Appliance Costs**: Adjust Watts and Hours of AC, Refrigerator, TV, and Laptops in the Appliance Estimator to see real-time estimated monthly usage.
5. **Implement Tips**: Review the energy-saving suggestions to reduce overall electricity costs.

## Screenshots

*A screenshot will render here once deployed to hosting or previewed locally.*
*(Optional) Preview dashboard by opening the index.html directly.*

## Future Enhancements

- **PDF Invoice Export**: Allow users to download a PDF copy of their calculation summary breakdown.
- **Multi-region Tarrifs**: Integrate preconfigured tarrif slabs for various states and utility providers.
- **Peak Hour Estimations**: Support peak vs off-peak consumption calculation factors.
- **Dark/Light Mode Toggle**: Add support to easily toggle between customized light and dark theme templates.