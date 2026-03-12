import { z } from "zod"

export const SubscriberSchema = z.object({
  email: z.string().email(),
  frequency: z.string()
})

export const SubscribersResponseSchema = z.object({
  message: z.string(),
  subscribers: z.array(SubscriberSchema).optional().default([])
})

export const TeamSchema = z.object({
  name: z.string().min(1),
  crest: z.string().url().optional().nullable()
})

export const TeamsResponseSchema = z.object({
  teams: z.array(z.union([TeamSchema, z.string().min(1)]))
})