"use client"

import { useState } from "react"
import { BookOpen, Copy, Check, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type CitationStyle = 'APA' | 'MLA' | 'Chicago';
type SourceType = 'book' | 'journal' | 'website' | 'newspaper';

interface CitationData {
  author: string;
  title: string;
  year: string;
  publisher?: string;
  url?: string;
  accessDate?: string;
  journal?: string;
  volume?: string;
  issue?: string;
  pages?: string;
}

export default function CitationBuilder() {
  const [sourceType, setSourceType] = useState<SourceType>('book');
  const [citationData, setCitationData] = useState<CitationData>({
    author: '',
    title: '',
    year: '',
  });
  const [copied, setCopied] = useState(false);

  const updateField = (field: keyof CitationData, value: string) => {
    setCitationData(prev => ({ ...prev, [field]: value }));
  };

  const generateAPA = (): string => {
    const { author, year, title, publisher, url, accessDate, journal, volume, issue, pages } = citationData;
    
    if (sourceType === 'book') {
      return `${author}. (${year}). ${title}. ${publisher || 'Publisher'}.`;
    } else if (sourceType === 'journal') {
      return `${author}. (${year}). ${title}. ${journal}, ${volume}(${issue}), ${pages}.`;
    } else if (sourceType === 'website') {
      return `${author}. (${year}). ${title}. Retrieved ${accessDate}, from ${url}`;
    }
    return '';
  };

  const generateMLA = (): string => {
    const { author, title, publisher, year, url, accessDate, journal, volume, issue, pages } = citationData;
    
    if (sourceType === 'book') {
      return `${author}. ${title}. ${publisher}, ${year}.`;
    } else if (sourceType === 'journal') {
      return `${author}. "${title}." ${journal}, vol. ${volume}, no. ${issue}, ${year}, pp. ${pages}.`;
    } else if (sourceType === 'website') {
      return `${author}. "${title}." ${year}, ${url}. Accessed ${accessDate}.`;
    }
    return '';
  };

  const generateChicago = (): string => {
    const { author, year, title, publisher, url, accessDate, journal, volume, pages } = citationData;
    
    if (sourceType === 'book') {
      return `${author}. ${title}. ${publisher || 'Publisher'}, ${year}.`;
    } else if (sourceType === 'journal') {
      return `${author}. "${title}." ${journal} ${volume} (${year}): ${pages}.`;
    } else if (sourceType === 'website') {
      return `${author}. "${title}." Accessed ${accessDate}. ${url}.`;
    }
    return '';
  };

  const copyCitation = (citation: string) => {
    navigator.clipboard.writeText(citation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-purple-600" />
          Smart Citation Builder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label>Source Type</Label>
            <Select value={sourceType} onValueChange={(value) => setSourceType(value as SourceType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="book">Book</SelectItem>
                <SelectItem value="journal">Journal Article</SelectItem>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="newspaper">Newspaper</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Author(s)</Label>
              <Input
                placeholder="Last, F. M."
                value={citationData.author}
                onChange={(e) => updateField('author', e.target.value)}
              />
            </div>
            <div>
              <Label>Year</Label>
              <Input
                placeholder="2024"
                value={citationData.year}
                onChange={(e) => updateField('year', e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <Label>Title</Label>
              <Input
                placeholder="Title of work"
                value={citationData.title}
                onChange={(e) => updateField('title', e.target.value)}
              />
            </div>

            {sourceType === 'book' && (
              <div className="md:col-span-2">
                <Label>Publisher</Label>
                <Input
                  placeholder="Publisher name"
                  value={citationData.publisher || ''}
                  onChange={(e) => updateField('publisher', e.target.value)}
                />
              </div>
            )}

            {sourceType === 'journal' && (
              <>
                <div className="md:col-span-2">
                  <Label>Journal Name</Label>
                  <Input
                    placeholder="Journal name"
                    value={citationData.journal || ''}
                    onChange={(e) => updateField('journal', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Volume</Label>
                  <Input
                    placeholder="Vol."
                    value={citationData.volume || ''}
                    onChange={(e) => updateField('volume', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Issue</Label>
                  <Input
                    placeholder="Issue"
                    value={citationData.issue || ''}
                    onChange={(e) => updateField('issue', e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Pages</Label>
                  <Input
                    placeholder="pp. 1-10"
                    value={citationData.pages || ''}
                    onChange={(e) => updateField('pages', e.target.value)}
                  />
                </div>
              </>
            )}

            {sourceType === 'website' && (
              <>
                <div className="md:col-span-2">
                  <Label>URL</Label>
                  <Input
                    placeholder="https://example.com"
                    value={citationData.url || ''}
                    onChange={(e) => updateField('url', e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Access Date</Label>
                  <Input
                    placeholder="January 1, 2024"
                    value={citationData.accessDate || ''}
                    onChange={(e) => updateField('accessDate', e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <Tabs defaultValue="APA" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="APA">APA</TabsTrigger>
            <TabsTrigger value="MLA">MLA</TabsTrigger>
            <TabsTrigger value="Chicago">Chicago</TabsTrigger>
          </TabsList>
          <TabsContent value="APA" className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border">
              <p className="text-sm text-gray-800 dark:text-gray-200 font-mono">
                {generateAPA() || 'Fill in the fields above to generate a citation'}
              </p>
            </div>
            <Button
              onClick={() => copyCitation(generateAPA())}
              disabled={!citationData.author || !citationData.title}
              className="w-full"
            >
              {copied ? <><Check className="h-4 w-4 mr-2" /> Copied!</> : <><Copy className="h-4 w-4 mr-2" /> Copy Citation</>}
            </Button>
          </TabsContent>
          <TabsContent value="MLA" className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border">
              <p className="text-sm text-gray-800 dark:text-gray-200 font-mono">
                {generateMLA() || 'Fill in the fields above to generate a citation'}
              </p>
            </div>
            <Button
              onClick={() => copyCitation(generateMLA())}
              disabled={!citationData.author || !citationData.title}
              className="w-full"
            >
              {copied ? <><Check className="h-4 w-4 mr-2" /> Copied!</> : <><Copy className="h-4 w-4 mr-2" /> Copy Citation</>}
            </Button>
          </TabsContent>
          <TabsContent value="Chicago" className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border">
              <p className="text-sm text-gray-800 dark:text-gray-200 font-mono">
                {generateChicago() || 'Fill in the fields above to generate a citation'}
              </p>
            </div>
            <Button
              onClick={() => copyCitation(generateChicago())}
              disabled={!citationData.author || !citationData.title}
              className="w-full"
            >
              {copied ? <><Check className="h-4 w-4 mr-2" /> Copied!</> : <><Copy className="h-4 w-4 mr-2" /> Copy Citation</>}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
