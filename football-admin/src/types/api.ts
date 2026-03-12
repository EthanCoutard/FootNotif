export type Frequency = "DAILY" | "WEEKLY" | string

export type Subscriber = {
  email: string
  frequency: Frequency
}

export type Team = {
  name: string
  crest?: string | null
}