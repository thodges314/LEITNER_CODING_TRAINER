function summarizeDataset(records, options = {}) {
  const { thresholds = 4 } = options;

  if (!Array.isArray(records) || records.length === 0) {
    return {
      groupedByDept: new Map(),
      salaryByRegion: new Map(),
      avgSalaryByDeptRegion: new Map(),
      salaryBins: [],
      totalSalariesFormatted: '$0.00',
      avgSalaryFormatted: '$0.00',
    };
  }

  const groupedByDept = d3.group(records, (d) => d.department);

  const salaryByRegion = d3.rollup(
    records,
    (v) => d3.sum(v, (d) => d.salary),
    (d) => d.region
  );

  const avgSalaryByDeptRegion = d3.rollup(
    records,
    (v) => Math.round(d3.mean(v, (d) => d.salary) || 0),
    (d) => d.department,
    (d) => d.region
  );

  const binner = d3
    .bin()
    .value((d) => d.salary)
    .thresholds(thresholds);

  const rawBins = binner(records);
  const salaryBins = rawBins.map((b) => ({
    x0: b.x0,
    x1: b.x1,
    count: b.length,
  }));

  const currencyFormatter = d3.format('$,.2f');
  const totalSalary = d3.sum(records, (d) => d.salary);
  const avgSalary = d3.mean(records, (d) => d.salary) || 0;

  return {
    groupedByDept,
    salaryByRegion,
    avgSalaryByDeptRegion,
    salaryBins,
    totalSalariesFormatted: currencyFormatter(totalSalary),
    avgSalaryFormatted: currencyFormatter(avgSalary),
  };
}
