export type FilterOperator =
  | 'eq'
  | 'ne'
  | 'lt'
  | 'le'
  | 'gt'
  | 'ge'
  | 'bw'
  | 'bn'
  | 'in'
  | 'ni'
  | 'ew'
  | 'en'
  | 'cn'
  | 'nc'

export interface FilterRule {
  data: string | string[] | number | number[] | boolean
  field: string
  op: FilterOperator
}

export type FilterRules = Record<string, FilterRule>

export interface RequestBody {
  pageSize: number
  filters: {
    groupOp: 'AND'
    rules: FilterRules
  }
  allSelected: boolean
  asString: string
  page: number
  sort?: Record<string, 'asc' | 'desc'>
}
