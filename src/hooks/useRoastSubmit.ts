'use client'

import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { BundledLanguage } from 'shiki'
import { useTRPC } from '@/trpc/client'

interface SubmitParams {
  code: string
  lang: BundledLanguage
  roastMode: 'roast' | 'honest'
}

export function useRoastSubmit() {
  const trpc = useTRPC()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { mutate: createRoast } = useMutation({
    ...trpc.roast.create.mutationOptions(),
    onSuccess: ({ id }) => {
      router.push(`/roast/${id}`)
    },
    onError: () => {
      setIsSubmitting(false)
    },
  })

  function submit(params: SubmitParams) {
    if (isSubmitting) return
    setIsSubmitting(true)
    createRoast(params)
  }

  return { submit, isSubmitting }
}
