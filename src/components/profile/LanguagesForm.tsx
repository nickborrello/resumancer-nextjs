import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Trash2, Plus } from 'lucide-react';
import type { Language } from '@/types/profile';

interface LanguagesFormProps {
  languages: Language[];
  onChange: (languages: Language[]) => void;
  errors?: Record<number, Record<string, string[]>>;
  onBlurValidate?: () => void;
}

const PROFICIENCY_LEVELS = [
  'Native',
  'Fluent',
  'Professional',
  'Intermediate',
  'Basic',
] as const;

export default function LanguagesForm({
  languages,
  onChange,
  errors = {},
  onBlurValidate,
}: LanguagesFormProps) {
  const handleAddLanguage = () => {
    const newLanguage: Language = {
      id: crypto.randomUUID(),
      language: '',
      proficiency: 'Intermediate',
    };
    onChange([...languages, newLanguage]);
  };

  const handleUpdateLanguage = (index: number, field: keyof Language, value: string) => {
    const updatedLanguages = languages.map((lang, i) =>
      i === index ? { ...lang, [field]: value } : lang
    );
    onChange(updatedLanguages);
  };

  const handleRemoveLanguage = (index: number) => {
    const updatedLanguages = languages.filter((_, i) => i !== index);
    onChange(updatedLanguages);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Languages</h3>
        <Button
          type="button"
          onClick={handleAddLanguage}
          variant="outline"
          size="sm"
          className="btn-add"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Language
        </Button>
      </div>

      {languages.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No languages added yet. Add your language proficiencies to showcase your communication skills.
        </p>
      ) : (
        <div className="space-y-4">
          {languages.map((language, index) => (
            <div key={language.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Language {index + 1}</h4>
                <Button
                  type="button"
                  onClick={() => handleRemoveLanguage(index)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`language-${index}`}>Language</Label>
                  <Input
                    id={`language-${index}`}
                    value={language.language}
                    onChange={(e) => handleUpdateLanguage(index, 'language', e.target.value)}
                    onBlur={onBlurValidate}
                    placeholder="e.g., English, Spanish, French"
                    className={errors[index]?.['language'] ? 'border-red-500' : ''}
                  />
                  {errors[index]?.['language'] && (
                    <p className="text-red-500 text-sm">{errors[index]['language'][0]}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`proficiency-${index}`}>Proficiency Level</Label>
                  <Select
                    value={language.proficiency}
                    onValueChange={(value) => handleUpdateLanguage(index, 'proficiency', value)}
                  >
                    <SelectTrigger className={errors[index]?.['proficiency'] ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select proficiency" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROFICIENCY_LEVELS.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors[index]?.['proficiency'] && (
                    <p className="text-red-500 text-sm">{errors[index]['proficiency'][0]}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}