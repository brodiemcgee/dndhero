'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface UseVoiceInputOptions {
  onTranscript?: (text: string, isFinal: boolean) => void
  onEnd?: () => void
  language?: string
}

interface UseVoiceInputReturn {
  isListening: boolean
  isSupported: boolean
  error: string | null
  startListening: () => void
  stopListening: () => void
}

export function useVoiceInput(options: UseVoiceInputOptions = {}): UseVoiceInputReturn {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const optionsRef = useRef(options)

  // Keep options ref updated
  useEffect(() => {
    optionsRef.current = options
  }, [options])

  useEffect(() => {
    // Check browser support
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition
    setIsSupported(!!SpeechRecognitionAPI)

    if (SpeechRecognitionAPI) {
      const recognition = new SpeechRecognitionAPI()
      recognition.continuous = false
      recognition.interimResults = true
      recognition.lang = options.language || 'en-US'

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const result = event.results[event.results.length - 1]
        const transcript = result[0].transcript
        optionsRef.current.onTranscript?.(transcript, result.isFinal)
      }

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        // Don't treat 'aborted' as an error - it's expected when stopping
        if (event.error !== 'aborted') {
          setError(getErrorMessage(event.error))
        }
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
        optionsRef.current.onEnd?.()
      }

      recognitionRef.current = recognition
    }

    return () => {
      recognitionRef.current?.abort()
    }
  }, [])

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setError(null)
      try {
        recognitionRef.current.start()
        setIsListening(true)
      } catch (err) {
        // Handle case where recognition is already started
        setError('Failed to start voice recognition')
      }
    }
  }, [isListening])

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
  }, [isListening])

  return { isListening, isSupported, error, startListening, stopListening }
}

function getErrorMessage(errorCode: SpeechRecognitionErrorCode): string {
  switch (errorCode) {
    case 'no-speech':
      return 'No speech detected. Please try again.'
    case 'audio-capture':
      return 'No microphone found. Please check your device.'
    case 'not-allowed':
      return 'Microphone access denied. Please enable microphone permissions.'
    case 'network':
      return 'Network error. Please check your connection.'
    case 'service-not-allowed':
      return 'Speech recognition service not allowed.'
    case 'bad-grammar':
      return 'Speech recognition error.'
    case 'language-not-supported':
      return 'Language not supported.'
    default:
      return 'Voice input error. Please try again.'
  }
}
