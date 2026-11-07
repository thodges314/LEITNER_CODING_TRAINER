interface DataRecord {
  id: string;
  department: string;
  region: string;
  salary: number;
}

interface SummarizeOptions {
  thresholds?: number;
}

interface SalaryBinSummary {
  x0?: number;
  x1?: number;
  count: number;
}

interface DatasetSummary {
  groupedByDept: Map<string, DataRecord[]>;
  salaryByRegion: Map<string, number>;
  avgSalaryByDeptRegion: Map<string, Map<string, number>>;
  salaryBins: SalaryBinSummary[];
  totalSalariesFormatted: string;
  avgSalaryFormatted: string;
}

function summarizeDataset(
  records: DataRecord[],
  options: SummarizeOptions = {}
): DatasetSummary {
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

  const groupedByDept = d3.group(records, (d: DataRecord) => d.department);

  const salaryByRegion = d3.rollup(
    records,
    (v: DataRecord[]) => d3.sum(v, (d: DataRecord) => d.salary),
    (d: DataRecord) => d.region
  );

  const avgSalaryByDeptRegion = d3.rollup(
    records,
    (v: DataRecord[]) => Math.round(d3.mean(v, (d: DataRecord) => d.salary) || 0),
    (d: DataRecord) => d.department,
    (d: DataRecord) => d.region
  );

  const binner = d3
    .bin<DataRecord>()
    .value((d: DataRecord) => d.salary)
    .thresholds(thresholds);

  const rawBins = binner(records);
  const salaryBins: SalaryBinSummary[] = rawBins.map((b) => ({
    x0: b.x0,
    x1: b.x1,
    count: b.length,
  }));

  const currencyFormatter = d3.format('$,.2f');
  const totalSalary = d3.sum(records, (d: DataRecord) => d.salary);
  const avgSalary = d3.mean(records, (d: DataRecord) => d.salary) || 0;

  return {
    groupedByDept,
    salaryByRegion,
    avgSalaryByDeptRegion,
    salaryBins,
    totalSalariesFormatted: currencyFormatter(totalSalary),
    avgSalaryFormatted: currencyFormatter(avgSalary),
  };
}
