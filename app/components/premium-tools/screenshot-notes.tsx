"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Image, Upload, Search, FileText, Download, Sparkles } from "lucide-react"

interface ProcessedSlide {
  id: string
  imageName: string
  text: string
  keywords: string[]
  timestamp: Date
}

export default function ScreenshotLectureNotes() {
  const [slides, setSlides] = useState<ProcessedSlide[]>([])
  const [processing, setProcessing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setProcessing(true)
    
    setTimeout(() => {
      const newSlides: ProcessedSlide[] = Array.from(files).map((file, idx) => ({
        id: `${Date.now()}-${idx}`,
        imageName: file.name,
        text: `Lecture content extracted from ${file.name}. This is a demonstration of OCR processing. In production, this would contain actual text extracted from the image, including formulas, diagrams descriptions, and key concepts.`,
        keywords: ["Machine Learning", "Neural Networks", "Backpropagation", "Gradient Descent"],
        timestamp: new Date()
      }))

      setSlides([...newSlides, ...slides])
      setProcessing(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }, 2000)
  }

  const filteredSlides = slides.filter(slide =>
    searchQuery === "" ||
    slide.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    slide.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const exportNotes = () => {
    const notesText = slides
      .map((slide, idx) => `\n=== Slide ${idx + 1}: ${slide.imageName} ===\n${slide.text}\n\nKeywords: ${slide.keywords.join(", ")}\n`)
      .join("\n")
    
    const blob = new Blob([notesText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `lecture-notes-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
  }

  return (
    <Card className="w-full">
      <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20">
        <CardTitle className="flex items-center gap-2">
          <Image className="h-6 w-6 text-green-600" />
          <span className="bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
            Screenshot → Searchable Notes
          </span>
          <span className="ml-auto text-xs px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full font-semibold">
            PREMIUM
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={processing}
            className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white h-auto py-6"
          >
            {processing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing Slides...
              </>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-6 w-6" />
                <span>Upload Lecture Slides</span>
                <span className="text-xs opacity-80">JPG, PNG, PDF</span>
              </div>
            )}
          </Button>

          <Button
            onClick={exportNotes}
            disabled={slides.length === 0}
            variant="outline"
            className="h-auto py-6"
          >
            <div className="flex flex-col items-center gap-2">
              <Download className="h-6 w-6" />
              <span>Export All Notes</span>
              <span className="text-xs opacity-70">{slides.length} slides</span>
            </div>
          </Button>
        </div>

        {slides.length > 0 && (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search across all lecture notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">
                  {searchQuery ? `${filteredSlides.length} Results` : `${slides.length} Processed Slides`}
                </h3>
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <Sparkles className="h-4 w-4" />
                  <span>AI-Powered OCR</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 max-h-[600px] overflow-y-auto pr-2">
                {filteredSlides.map((slide, idx) => (
                  <div
                    key={slide.id}
                    className="bg-white dark:bg-gray-800 p-5 rounded-lg border hover:border-green-300 dark:hover:border-green-700 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-teal-100 dark:from-green-900/30 dark:to-teal-900/30 rounded-lg flex items-center justify-center">
                          <FileText className="h-6 w-6 text-green-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {slide.imageName}
                          </h4>
                          <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {slide.timestamp.toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                          {slide.text}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {slide.keywords.map((keyword, kidx) => (
                            <span
                              key={kidx}
                              className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {slides.length === 0 && !processing && (
          <div className="text-center py-12 bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/10 dark:to-teal-900/10 rounded-lg">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
              <Image className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Transform Slides into Searchable Notes</h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
              Upload screenshots of lecture slides and our AI will extract text, identify key concepts, and make everything searchable
            </p>
            <ul className="text-sm text-left text-gray-600 dark:text-gray-400 max-w-md mx-auto space-y-2">
              <li>✓ Automatic OCR text extraction</li>
              <li>✓ Keyword identification</li>
              <li>✓ Full-text search across all slides</li>
              <li>✓ Export to formatted notes</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
