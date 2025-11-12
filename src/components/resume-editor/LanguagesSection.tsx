import { useFieldArray, useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2 } from 'lucide-react';
import { ResumeFormData } from '@/lib/validation/resumeSchemas';

const proficiencyLevels = [
  'Beginner',
  'Elementary',
  'Intermediate',
  'Upper Intermediate',
  'Advanced',
  'Fluent',
  'Native',
];

export function LanguagesSection() {
  const { control, register, setValue, formState: { errors } } = useFormContext<ResumeFormData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'languages',
  });

  const addLanguage = () => {
    append({
      id: `language-${Date.now()}`,
      language: '',
      proficiency: '',
    });
  };

  return (
    <Card className="bg-slate-900/50 border-purple-500/30 h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <CardTitle className="text-purple-300">Languages</CardTitle>
            <CardDescription className="text-slate-400">
              Your language skills and proficiency levels
            </CardDescription>
          </div>
          <Button
            type="button"
            onClick={addLanguage}
            variant="outline"
            size="sm"
            className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Language
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="space-y-4">
            {fields.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <p>No languages added yet.</p>
                <p className="text-sm">Click &quot;Add Language&quot; to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <Card key={field.id} className="bg-slate-800/50 border-slate-700">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm text-slate-300">Language {index + 1}</CardTitle>
                        <Button
                          type="button"
                          onClick={() => remove(index)}
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`languages.${index}.language`} className="text-slate-300">
                            Language *
                          </Label>
                          <Input
                            {...register(`languages.${index}.language`)}
                            placeholder="e.g., Spanish"
                            className="bg-slate-800 border-slate-600 text-slate-200"
                          />
                          {errors.languages?.[index]?.language && (
                            <p className="text-red-400 text-sm">{errors.languages[index]?.language?.message}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`languages.${index}.proficiency`} className="text-slate-300">
                            Proficiency Level *
                          </Label>
                          <Select
                            value={field.proficiency}
                            onValueChange={(value) => setValue(`languages.${index}.proficiency`, value)}
                          >
                            <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-200">
                              <SelectValue placeholder="Select proficiency level" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-600">
                              {proficiencyLevels.map((level) => (
                                <SelectItem key={level} value={level} className="text-slate-200 hover:bg-slate-700">
                                  {level}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.languages?.[index]?.proficiency && (
                            <p className="text-red-400 text-sm">{errors.languages[index]?.proficiency?.message}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}