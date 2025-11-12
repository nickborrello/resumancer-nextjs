import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Plus, X } from 'lucide-react';
import type { Volunteer } from '@/types/profile';

interface VolunteerFormProps {
  volunteer: Volunteer[];
  onChange: (volunteer: Volunteer[]) => void;
  errors?: Record<number, Record<string, string[]>>;
  onBlurValidate?: () => void;
}

export default function VolunteerForm({
  volunteer,
  onChange,
  errors = {},
  onBlurValidate,
}: VolunteerFormProps) {
  const handleAddVolunteer = () => {
    const newVolunteer: Volunteer = {
      id: crypto.randomUUID(),
      organization: '',
      role: '',
      location: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      bulletPoints: [],
    };
    onChange([...volunteer, newVolunteer]);
  };

  const handleUpdateVolunteer = (index: number, field: keyof Volunteer, value: string | boolean) => {
    const updatedVolunteer = volunteer.map((vol, i) =>
      i === index ? { ...vol, [field]: value } : vol
    );
    onChange(updatedVolunteer);
  };

  const handleAddBulletPoint = (index: number) => {
    const updatedVolunteer = volunteer.map((vol, i) =>
      i === index ? { ...vol, bulletPoints: [...vol.bulletPoints, ''] } : vol
    );
    onChange(updatedVolunteer);
  };

  const handleUpdateBulletPoint = (index: number, bulletIndex: number, value: string) => {
    const updatedVolunteer = volunteer.map((vol, i) =>
      i === index
        ? {
            ...vol,
            bulletPoints: vol.bulletPoints.map((bullet, bi) =>
              bi === bulletIndex ? value : bullet
            ),
          }
        : vol
    );
    onChange(updatedVolunteer);
  };

  const handleRemoveBulletPoint = (index: number, bulletIndex: number) => {
    const updatedVolunteer = volunteer.map((vol, i) =>
      i === index
        ? {
            ...vol,
            bulletPoints: vol.bulletPoints.filter((_, bi) => bi !== bulletIndex),
          }
        : vol
    );
    onChange(updatedVolunteer);
  };

  const handleRemoveVolunteer = (index: number) => {
    const updatedVolunteer = volunteer.filter((_, i) => i !== index);
    onChange(updatedVolunteer);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Volunteer Experience</h3>
        <Button
          type="button"
          onClick={handleAddVolunteer}
          variant="outline"
          size="sm"
          className="btn-add"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Volunteer Experience
        </Button>
      </div>

      {volunteer.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No volunteer experience added yet. Add your volunteer work to show your community involvement and soft skills.
        </p>
      ) : (
        <div className="space-y-4">
          {volunteer.map((vol, index) => (
            <div key={vol.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Volunteer Experience {index + 1}</h4>
                <Button
                  type="button"
                  onClick={() => handleRemoveVolunteer(index)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`vol-org-${index}`}>Organization</Label>
                  <Input
                    id={`vol-org-${index}`}
                    value={vol.organization}
                    onChange={(e) => handleUpdateVolunteer(index, 'organization', e.target.value)}
                    onBlur={onBlurValidate}
                    placeholder="e.g., Local Food Bank"
                    className={errors[index]?.['organization'] ? 'border-red-500' : ''}
                  />
                  {errors[index]?.['organization'] && (
                    <p className="text-red-500 text-sm">{errors[index]['organization'][0]}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`vol-role-${index}`}>Role/Position</Label>
                  <Input
                    id={`vol-role-${index}`}
                    value={vol.role}
                    onChange={(e) => handleUpdateVolunteer(index, 'role', e.target.value)}
                    onBlur={onBlurValidate}
                    placeholder="e.g., Volunteer Coordinator"
                    className={errors[index]?.['role'] ? 'border-red-500' : ''}
                  />
                  {errors[index]?.['role'] && (
                    <p className="text-red-500 text-sm">{errors[index]['role'][0]}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`vol-location-${index}`}>Location (Optional)</Label>
                  <Input
                    id={`vol-location-${index}`}
                    value={vol.location || ''}
                    onChange={(e) => handleUpdateVolunteer(index, 'location', e.target.value)}
                    onBlur={onBlurValidate}
                    placeholder="e.g., City, State"
                    className={errors[index]?.['location'] ? 'border-red-500' : ''}
                  />
                  {errors[index]?.['location'] && (
                    <p className="text-red-500 text-sm">{errors[index]['location'][0]}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`vol-start-${index}`}>Start Date</Label>
                  <Input
                    id={`vol-start-${index}`}
                    type="month"
                    value={vol.startDate}
                    onChange={(e) => handleUpdateVolunteer(index, 'startDate', e.target.value)}
                    onBlur={onBlurValidate}
                    className={errors[index]?.['startDate'] ? 'border-red-500' : ''}
                  />
                  {errors[index]?.['startDate'] && (
                    <p className="text-red-500 text-sm">{errors[index]['startDate'][0]}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`vol-end-${index}`}>End Date</Label>
                  <Input
                    id={`vol-end-${index}`}
                    type="month"
                    value={vol.endDate || ''}
                    onChange={(e) => handleUpdateVolunteer(index, 'endDate', e.target.value)}
                    onBlur={onBlurValidate}
                    disabled={vol.isCurrent}
                    className={errors[index]?.['endDate'] ? 'border-red-500' : ''}
                  />
                  {errors[index]?.['endDate'] && (
                    <p className="text-red-500 text-sm">{errors[index]['endDate'][0]}</p>
                  )}
                </div>

                <div className="space-y-2 flex items-center space-x-2">
                  <Checkbox
                    id={`vol-current-${index}`}
                    checked={vol.isCurrent}
                    onCheckedChange={(checked) => handleUpdateVolunteer(index, 'isCurrent', !!checked)}
                  />
                  <Label htmlFor={`vol-current-${index}`}>Currently volunteering</Label>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Key Responsibilities & Achievements</Label>
                  <Button
                    type="button"
                    onClick={() => handleAddBulletPoint(index)}
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Bullet Point
                  </Button>
                </div>

                {vol.bulletPoints.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    Add bullet points describing your responsibilities and achievements.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {vol.bulletPoints.map((bullet, bulletIndex) => (
                      <div key={bulletIndex} className="flex items-center space-x-2">
                        <Input
                          value={bullet}
                          onChange={(e) => handleUpdateBulletPoint(index, bulletIndex, e.target.value)}
                          onBlur={onBlurValidate}
                          placeholder="Describe your contribution or achievement..."
                          className={errors[index]?.['bulletPoints']?.[bulletIndex] ? 'border-red-500' : ''}
                        />
                        <Button
                          type="button"
                          onClick={() => handleRemoveBulletPoint(index, bulletIndex)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                {errors[index]?.['bulletPoints'] && (
                  <p className="text-red-500 text-sm">{errors[index]['bulletPoints'][0]}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}