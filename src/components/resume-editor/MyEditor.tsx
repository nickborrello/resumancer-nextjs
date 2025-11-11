'use client'

import { useChat } from '@ai-sdk/react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/hooks/use-toast'

// Define resume structure
type ResumeData = {
  summary: string
  experience: Array<{
    id: string
    company: string
    position: string
    bullets: string[]
  }>
  education: Array<{
    id: string
    school: string
    degree: string
    bullets: string[]
  }>
  skills: string[]
  projects: Array<{
    id: string
    name: string
    bullets: string[]
  }>
}

type Suggestion = {
  id: string
  section: 'summary' | 'experience' | 'education' | 'skills' | 'projects'
  entityId?: string
  originalText: string
  newText: string
}

export default function MyEditor({ initialResume }: { initialResume: ResumeData }) {
  const [resume, setResume] = useState<ResumeData>(initialResume)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/resumes/ai-suggestions',
    body: { resumeData: resume },
    onToolCall: ({ toolCall }: any) => {
      if (toolCall.toolName === 'applyResumeEdit') {
        const args = toolCall.args as {
          section: string
          entityId?: string
          originalText: string
          newText: string
        }
        const newSuggestion: Suggestion = {
          id: toolCall.toolCallId,
          section: args.section as any,
          entityId: args.entityId,
          originalText: args.originalText,
          newText: args.newText,
        }
        setSuggestions(prev => [...prev, newSuggestion])
      }
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to get AI suggestions. Please try again.',
        variant: 'destructive',
      })
    },
  })

  const handleApplySuggestion = (suggestion: Suggestion) => {
    setResume(prevResume => {
      const newResume = { ...prevResume }

      if (suggestion.section === 'summary') {
        if (prevResume.summary === suggestion.originalText) {
          newResume.summary = suggestion.newText
        } else {
          toast({
            title: 'Suggestion no longer valid',
            description: 'The resume summary has changed since this suggestion was made.',
            variant: 'destructive',
          })
          return prevResume
        }
      } else if (suggestion.section === 'experience') {
        const exp = newResume.experience.find(e => e.id === suggestion.entityId)
        if (exp) {
          const bulletIndex = exp.bullets.indexOf(suggestion.originalText)
          if (bulletIndex !== -1) {
            exp.bullets[bulletIndex] = suggestion.newText
          } else {
            toast({
              title: 'Suggestion no longer valid',
              description: 'The experience bullet has changed since this suggestion was made.',
              variant: 'destructive',
            })
            return prevResume
          }
        }
      } else if (suggestion.section === 'education') {
        const edu = newResume.education.find(e => e.id === suggestion.entityId)
        if (edu) {
          const bulletIndex = edu.bullets.indexOf(suggestion.originalText)
          if (bulletIndex !== -1) {
            edu.bullets[bulletIndex] = suggestion.newText
          } else {
            toast({
              title: 'Suggestion no longer valid',
              description: 'The education bullet has changed since this suggestion was made.',
              variant: 'destructive',
            })
            return prevResume
          }
        }
      } else if (suggestion.section === 'skills') {
        // Assuming skills is array of strings, replace if matches
        const index = newResume.skills.indexOf(suggestion.originalText)
        if (index !== -1) {
          newResume.skills[index] = suggestion.newText
        } else {
          toast({
            title: 'Suggestion no longer valid',
            description: 'The skills section has changed since this suggestion was made.',
            variant: 'destructive',
          })
          return prevResume
        }
      } else if (suggestion.section === 'projects') {
        const proj = newResume.projects.find(p => p.id === suggestion.entityId)
        if (proj) {
          const bulletIndex = proj.bullets.indexOf(suggestion.originalText)
          if (bulletIndex !== -1) {
            proj.bullets[bulletIndex] = suggestion.newText
          } else {
            toast({
              title: 'Suggestion no longer valid',
              description: 'The project bullet has changed since this suggestion was made.',
              variant: 'destructive',
            })
            return prevResume
          }
        }
      }

      // Remove applied suggestion
      setSuggestions(prev => prev.filter(s => s.id !== suggestion.id))
      return newResume
    })
  }

  return (
    <div className="flex gap-4">
      <div className="flex-1">
        <h2>Resume Editor</h2>
        <Textarea
          value={JSON.stringify(resume, null, 2)}
          onChange={(e) => {
            try {
              setResume(JSON.parse(e.target.value))
            } catch {
              // Invalid JSON, ignore
            }
          }}
          rows={20}
        />
      </div>
      <div className="flex-1">
        <h2>AI Co-Pilot Chat</h2>
        <div className="space-y-4">
          {messages.map(m => (
            <div key={m.id} className="border p-4 rounded">
              {m.content && <p>{m.content}</p>}
              {m.toolCalls && m.toolCalls.length > 0 && (
                <div className="mt-2 space-y-2">
                  {m.toolCalls.map(tc => {
                    const suggestion = suggestions.find(s => s.id === tc.toolCallId)
                    return suggestion ? (
                      <Button
                        key={tc.toolCallId}
                        onClick={() => handleApplySuggestion(suggestion)}
                        variant="outline"
                      >
                        Apply: {suggestion.newText.substring(0, 50)}...
                      </Button>
                    ) : null
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="mt-4">
          <Textarea
            value={input}
            onChange={handleInputChange}
            placeholder="Ask the AI co-pilot for suggestions..."
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading} className="mt-2">
            Send
          </Button>
        </form>
        {error && <p className="text-red-500 mt-2">Error: {error.message}</p>}
      </div>
    </div>
  )
}