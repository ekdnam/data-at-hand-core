export enum DataSourceCategory{
  Step="step",
  Sleep="sleep",
  Weight="weight",
  HeartRate="heartRate",
  BloodGlucose="bloodGlucose",
}

export enum DataSourceType{
  StepCount="step_count",
  HoursSlept="sleep_duration",
  SleepRange="sleep_range",
  HeartRate="heart_rate",
  Weight="weight",
  BloodGlucose= "blood_glucose"
}

export interface DataSourceSpec{
  category: DataSourceCategory,
  type: DataSourceType,
  name: string,
  description: string,
}

export interface DataSourceCategorySpec{
  category: DataSourceCategory,
  name: string
}

export enum MeasureUnitType{
  Metric = "metric",
  US = "us"
}


export enum IntraDayDataSourceType {
  StepCount = "step",
  HeartRate = "heart_rate",
  Sleep = "sleep"
}


export function getIntraDayDataSourceName(type: IntraDayDataSourceType): string {
  switch (type) {
    case IntraDayDataSourceType.StepCount:
      return "Step Count"
    case IntraDayDataSourceType.Sleep:
      return "Sleep"
    case IntraDayDataSourceType.HeartRate:
      return "Heart Rate"
  }
}

export function inferIntraDayDataSourceType(dataSource: DataSourceType): IntraDayDataSourceType | null {
  switch (dataSource) {
    case DataSourceType.StepCount:
      return IntraDayDataSourceType.StepCount
    case DataSourceType.HeartRate:
      return IntraDayDataSourceType.HeartRate
    case DataSourceType.HoursSlept:
    case DataSourceType.SleepRange:
      return IntraDayDataSourceType.Sleep
    default: return null
  }
}

export function inferDataSource(intraDayDataSource: IntraDayDataSourceType): DataSourceType {
  switch (intraDayDataSource) {
    case IntraDayDataSourceType.StepCount:
      return DataSourceType.StepCount
    case IntraDayDataSourceType.Sleep:
      return DataSourceType.SleepRange
    case IntraDayDataSourceType.HeartRate:
      return DataSourceType.HeartRate
  }
}