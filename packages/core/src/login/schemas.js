import { z } from 'zod'

export const accNbrSchema = z.string().length(10)

export const passwordSchema = z.object({
  number: accNbrSchema,
  password: z.string().nonempty(),
})

export const otpSchema = z.object({
  number: accNbrSchema,
  otp: z.string().length(6),
})
