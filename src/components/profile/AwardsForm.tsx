import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus } from 'lucide-react';
import type { Award } from '@/types/profile';

interface AwardsFormProps {
  awards: Award[];
  onChange: (awards: Award[]) => void;
  errors?: Record<number, Record<string, string[]>>;
  onBlurValidate?: () => void;
}

export default function AwardsForm({
  awards,
  onChange,
  errors = {},
  onBlurValidate,
}: AwardsFormProps) {
  const handleAddAward = () => {
    const newAward: Award = {
      id: crypto.randomUUID(),
      name: '',
      organization: '',
      dateReceived: '',
    };
    onChange([...awards, newAward]);
  };

  const handleUpdateAward = (index: number, field: keyof Award, value: string) => {
    const updatedAwards = awards.map((award, i) =>
      i === index ? { ...award, [field]: value } : award
    );
    onChange(updatedAwards);
  };

  const handleRemoveAward = (index: number) => {
    const updatedAwards = awards.filter((_, i) => i !== index);
    onChange(updatedAwards);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Awards & Honors</h3>
        <Button
          type="button"
          onClick={handleAddAward}
          variant="outline"
          size="sm"
          className="btn-add"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Award
        </Button>
      </div>

      {awards.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No awards added yet. Add your achievements and honors to highlight your accomplishments.
        </p>
      ) : (
        <div className="space-y-4">
          {awards.map((award, index) => (
            <div key={award.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Award {index + 1}</h4>
                <Button
                  type="button"
                  onClick={() => handleRemoveAward(index)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`award-name-${index}`}>Award Name</Label>
                  <Input
                    id={`award-name-${index}`}
                    value={award.name}
                    onChange={(e) => handleUpdateAward(index, 'name', e.target.value)}
                    onBlur={onBlurValidate}
                    placeholder="e.g., Employee of the Year"
                    className={errors[index]?.['name'] ? 'border-red-500' : ''}
                  />
                  {errors[index]?.['name'] && (
                    <p className="text-red-500 text-sm">{errors[index]['name'][0]}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`award-org-${index}`}>Issuing Organization</Label>
                  <Input
                    id={`award-org-${index}`}
                    value={award.organization}
                    onChange={(e) => handleUpdateAward(index, 'organization', e.target.value)}
                    onBlur={onBlurValidate}
                    placeholder="e.g., Company Name, University"
                    className={errors[index]?.['organization'] ? 'border-red-500' : ''}
                  />
                  {errors[index]?.['organization'] && (
                    <p className="text-red-500 text-sm">{errors[index]['organization'][0]}</p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor={`award-date-${index}`}>Date Received</Label>
                  <Input
                    id={`award-date-${index}`}
                    type="month"
                    value={award.dateReceived}
                    onChange={(e) => handleUpdateAward(index, 'dateReceived', e.target.value)}
                    onBlur={onBlurValidate}
                    className={errors[index]?.['dateReceived'] ? 'border-red-500' : ''}
                  />
                  {errors[index]?.['dateReceived'] && (
                    <p className="text-red-500 text-sm">{errors[index]['dateReceived'][0]}</p>
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