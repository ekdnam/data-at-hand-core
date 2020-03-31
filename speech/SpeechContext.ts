import { ExplorationType, ParameterKey, ParameterType } from "../exploration/ExplorationInfo"
import { DataSourceType } from "../measure/DataSourceSpec"
import { CycleDimension } from "../exploration/CyclicTimeFrame"

type DateRangeWidgetElementType = 'from' | 'to' | 'period'

export enum SpeechContextType {
    Global = "global",
    Time = "time",
    DateElement = "dateElement",
    RangeElement = "rangeElement",
    CycleDimensionElement = "cycleDimensionElement",
    CategoricalRowElement = "categoricalRowElement"
}

export interface SpeechContext {
    type: SpeechContextType
}

export interface GlobalSpeechContext extends SpeechContext {
    explorationType: ExplorationType
}

export interface TimeSpeechContext extends SpeechContext {
    timeElementType: DateRangeWidgetElementType | 'date',
    parameterKey?: ParameterKey
}

export interface DateElementSpeechContext extends SpeechContext {
    explorationType: ExplorationType,
    date: number,
    dataSource: DataSourceType
}

export interface RangeElementSpeechContext extends SpeechContext {
    explorationType: ExplorationType,
    range: [number, number],
    dataSource: DataSourceType
}

export interface CycleDimensionElementSpeechContext extends SpeechContext {
    cycleDimension: CycleDimension,
    dataSource: DataSourceType
}

export interface CategoricalRowElementSpeechContext extends SpeechContext {
    categoryType: ParameterType.DataSource | ParameterType.IntraDayDataSource | ParameterType.CycleDimension | ParameterType.CycleType
}

export namespace SpeechContextHelper {
    export function makeGlobalContext(explorationType: ExplorationType): GlobalSpeechContext {
        return {
            type: SpeechContextType.Global,
            explorationType
        }
    }

    export function makeTimeSpeechContext(timeElementType: DateRangeWidgetElementType | 'date', parameterKey?: ParameterKey): TimeSpeechContext {
        return {
            type: SpeechContextType.Time,
            timeElementType,
            parameterKey
        }
    }

    export function makeDateElementSpeechContext(explorationType: ExplorationType, date: number, dataSource: DataSourceType): DateElementSpeechContext {
        return {
            type: SpeechContextType.DateElement,
            explorationType,
            date,
            dataSource
        }
    }

    export function makeRangeElementSpeechContext(explorationType: ExplorationType, range: [number, number], dataSource: DataSourceType): RangeElementSpeechContext {
        return {
            type: SpeechContextType.RangeElement,
            explorationType,
            range,
            dataSource
        }
    }


    export function makeCycleDimentionElementSpeechContext(cycleDimension: CycleDimension, dataSource: DataSourceType): CycleDimensionElementSpeechContext {
        return {
            type: SpeechContextType.CycleDimensionElement,
            cycleDimension,
            dataSource
        }
    }

    export function makeCategoricalRowElementSpeechContext(categoryType: ParameterType.DataSource | ParameterType.IntraDayDataSource | ParameterType.CycleDimension | ParameterType.CycleType): CategoricalRowElementSpeechContext {
        return {
            type: SpeechContextType.CategoricalRowElement,
            categoryType
        }
    }
}