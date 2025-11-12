import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus } from 'lucide-react';
import type { Certification } from '@/types/profile';

interface CertificationsFormProps {
  certifications: Certification[];
  onChange: (certifications: Certification[]) => void;
  errors?: Record<number, Record<string, string[]>>;
  onBlurValidate?: () => void;
}

export default function CertificationsForm({
  certifications,
  onChange,
  errors = {},
  onBlurValidate,
}: CertificationsFormProps) {
  const handleAddCertification = () => {
    const newCertification: Certification = {
      id: crypto.randomUUID(),
      name: '',
      issuingOrganization: '',
      dateObtained: '',
      credentialId: '',
    };
    onChange([...certifications, newCertification]);
  };

  const handleUpdateCertification = (index: number, field: keyof Certification, value: string) => {
    const updatedCertifications = certifications.map((cert, i) =>
      i === index ? { ...cert, [field]: value } : cert
    );
    onChange(updatedCertifications);
  };

  const handleRemoveCertification = (index: number) => {
    const updatedCertifications = certifications.filter((_, i) => i !== index);
    onChange(updatedCertifications);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Certifications</h3>
        <Button
          type="button"
          onClick={handleAddCertification}
          variant="outline"
          size="sm"
          className="btn-add"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Certification
        </Button>
      </div>

      {certifications.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No certifications added yet. Add your professional certifications to demonstrate your expertise.
        </p>
      ) : (
        <div className="space-y-4">
          {certifications.map((certification, index) => (
            <div key={certification.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Certification {index + 1}</h4>
                <Button
                  type="button"
                  onClick={() => handleRemoveCertification(index)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`cert-name-${index}`}>Certification Name</Label>
                  <Input
                    id={`cert-name-${index}`}
                    value={certification.name}
                    onChange={(e) => handleUpdateCertification(index, 'name', e.target.value)}
                    onBlur={onBlurValidate}
                    placeholder="e.g., AWS Certified Solutions Architect"
                    className={errors[index]?.['name'] ? 'border-red-500' : ''}
                  />
                  {errors[index]?.['name'] && (
                    <p className="text-red-500 text-sm">{errors[index]['name'][0]}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`cert-org-${index}`}>Issuing Organization</Label>
                  <Input
                    id={`cert-org-${index}`}
                    value={certification.issuingOrganization}
                    onChange={(e) => handleUpdateCertification(index, 'issuingOrganization', e.target.value)}
                    onBlur={onBlurValidate}
                    placeholder="e.g., Amazon Web Services"
                    className={errors[index]?.['issuingOrganization'] ? 'border-red-500' : ''}
                  />
                  {errors[index]?.['issuingOrganization'] && (
                    <p className="text-red-500 text-sm">{errors[index]['issuingOrganization'][0]}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`cert-date-${index}`}>Date Obtained</Label>
                  <Input
                    id={`cert-date-${index}`}
                    type="month"
                    value={certification.dateObtained}
                    onChange={(e) => handleUpdateCertification(index, 'dateObtained', e.target.value)}
                    onBlur={onBlurValidate}
                    className={errors[index]?.['dateObtained'] ? 'border-red-500' : ''}
                  />
                  {errors[index]?.['dateObtained'] && (
                    <p className="text-red-500 text-sm">{errors[index]['dateObtained'][0]}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`cert-id-${index}`}>Credential ID (Optional)</Label>
                  <Input
                    id={`cert-id-${index}`}
                    value={certification.credentialId || ''}
                    onChange={(e) => handleUpdateCertification(index, 'credentialId', e.target.value)}
                    onBlur={onBlurValidate}
                    placeholder="e.g., ABC123456"
                    className={errors[index]?.['credentialId'] ? 'border-red-500' : ''}
                  />
                  {errors[index]?.['credentialId'] && (
                    <p className="text-red-500 text-sm">{errors[index]['credentialId'][0]}</p>
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