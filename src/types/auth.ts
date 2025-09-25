import type { User } from '@supabase/supabase-js'

export interface UserWithMeta extends User {
  empresa_id: string
  email: string
}