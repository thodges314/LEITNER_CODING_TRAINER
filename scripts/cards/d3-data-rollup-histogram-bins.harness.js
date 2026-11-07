const SAMPLE_RECORDS = [
  { id: '1', department: 'Eng', region: 'North', salary: 120000 },
  { id: '2', department: 'Eng', region: 'South', salary: 140000 },
  { id: '3', department: 'Sales', region: 'North', salary: 90000 },
  { id: '4', department: 'Sales', region: 'South', salary: 110000 },
  { id: '5', department: 'Eng', region: 'North', salary: 130000 },
];

// 1. Groups records by department into a Map
{
  const summary = summarizeDataset(SAMPLE_RECORDS);
  const eng = summary.groupedByDept?.get('Eng');
  const sales = summary.groupedByDept?.get('Sales');

  const passed =
    summary.groupedByDept instanceof Map &&
    Array.isArray(eng) &&
    eng.length === 3 &&
    Array.isArray(sales) &&
    sales.length === 2;

  $test.check(
    'Groups records by department into a Map',
    passed,
    { engCount: eng?.length, salesCount: sales?.length }
  );
}

// 2. Computes single-key rollups for total salary by region
{
  const summary = summarizeDataset(SAMPLE_RECORDS);
  const northTotal = summary.salaryByRegion?.get('North');
  const southTotal = summary.salaryByRegion?.get('South');

  const passed =
    summary.salaryByRegion instanceof Map &&
    northTotal === 340000 &&
    southTotal === 250000;

  $test.check(
    'Computes single-key rollups for total salary by region',
    passed,
    { northTotal, southTotal }
  );
}

// 3. Computes nested multi-key rollups for department by region averages
{
  const summary = summarizeDataset(SAMPLE_RECORDS);
  const engNorth = summary.avgSalaryByDeptRegion?.get('Eng')?.get('North');
  const engSouth = summary.avgSalaryByDeptRegion?.get('Eng')?.get('South');
  const salesNorth = summary.avgSalaryByDeptRegion?.get('Sales')?.get('North');

  const passed =
    summary.avgSalaryByDeptRegion instanceof Map &&
    engNorth === 125000 &&
    engSouth === 140000 &&
    salesNorth === 90000;

  $test.check(
    'Computes nested multi-key rollups for department by region averages',
    passed,
    { engNorth, engSouth, salesNorth }
  );
}

// 4. Constructs frequency histogram bins across salary distribution
{
  const summary = summarizeDataset(SAMPLE_RECORDS, { thresholds: 4 });
  const totalInBins = summary.salaryBins.reduce((sum, b) => sum + b.count, 0);
  const allHaveBounds = summary.salaryBins.every(
    (b) => typeof b.x0 === 'number' && typeof b.x1 === 'number' && typeof b.count === 'number'
  );

  const passed =
    Array.isArray(summary.salaryBins) &&
    summary.salaryBins.length >= 3 &&
    totalInBins === 5 &&
    allHaveBounds;

  $test.check(
    'Constructs frequency histogram bins across salary distribution',
    passed,
    { binCount: summary.salaryBins.length, totalInBins, allHaveBounds }
  );
}

// 5. Formats total and average salary metrics as localized currency strings
{
  const summary = summarizeDataset(SAMPLE_RECORDS);

  const passed =
    summary.totalSalariesFormatted === '$590,000.00' &&
    summary.avgSalaryFormatted === '$118,000.00';

  $test.check(
    'Formats total and average salary metrics as localized currency strings',
    passed,
    {
      total: summary.totalSalariesFormatted,
      avg: summary.avgSalaryFormatted,
    }
  );
}

// 6. Handles empty dataset gracefully with empty Maps, bins, and zeroed currency
{
  const summary = summarizeDataset([]);

  const passed =
    summary.groupedByDept instanceof Map &&
    summary.groupedByDept.size === 0 &&
    summary.salaryByRegion instanceof Map &&
    summary.salaryByRegion.size === 0 &&
    summary.avgSalaryByDeptRegion instanceof Map &&
    summary.avgSalaryByDeptRegion.size === 0 &&
    Array.isArray(summary.salaryBins) &&
    summary.salaryBins.length === 0 &&
    summary.totalSalariesFormatted === '$0.00' &&
    summary.avgSalaryFormatted === '$0.00';

  $test.check(
    'Handles empty dataset gracefully with empty Maps, bins, and zeroed currency',
    passed,
    summary
  );
}
