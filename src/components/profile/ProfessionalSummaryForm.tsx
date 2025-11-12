import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface ProfessionalSummaryFormProps {
  professionalSummary: string;
  onChange: (professionalSummary: string) => void;
  errors?: string[];
  onBlurValidate?: () => void;
}

export default function ProfessionalSummaryForm({
  professionalSummary,
  onChange,
  errors = [],
  onBlurValidate,
}: ProfessionalSummaryFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="professional-summary">Professional Summary</Label>
        <Textarea
          id="professional-summary"
          value={professionalSummary}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlurValidate}
          placeholder="Write a compelling professional summary that highlights your key strengths, experience, and career goals..."
          className={`min-h-[120px] ${errors.length > 0 ? 'border-red-500' : ''}`}
          maxLength={1000}
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{errors.length > 0 && errors[0]}</span>
          <span>{professionalSummary.length}/1000</span>
        </div>
      </div>
    </div>
  );
}