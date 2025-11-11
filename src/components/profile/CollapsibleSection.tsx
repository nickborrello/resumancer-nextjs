import { ReactNode, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Props interface for the CollapsibleSection component.
 * This component provides a reusable, animated collapsible UI pattern for form sections.
 */
interface CollapsibleSectionProps {
  /**
   * The title text displayed in the section header.
   * @example "Work Experience"
   */
  title: string;

  /**
   * Whether the section should be open by default.
   * @default false
   * @example true
   */
  defaultOpen?: boolean;

  /**
   * The content to be displayed inside the collapsible section.
   * This can include form fields, lists, or any React components.
   * @example <div><input type="text" placeholder="Enter details" /></div>
   */
  children: ReactNode;

  /**
   * Optional action buttons or elements to display in the header.
   * Typically used for "Add New" or other section-specific actions.
   * @example <button className="btn-add">Add New</button>
   */
  actions?: ReactNode;
}

/**
 * A reusable CollapsibleSection component with smooth animations and Amethyst theme styling.
 * Provides expand/collapse functionality for form sections with proper accessibility.
 */
const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  defaultOpen = false,
  children,
  actions,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  const contentId = `collapsible-content-${title.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className="border border-amethyst-500/20 rounded-lg overflow-hidden">
      <Button
        onClick={toggleOpen}
        variant="ghost"
        className="w-full flex items-center justify-between p-4 hover:border-amethyst-500/40 hover:bg-amethyst-500/5 transition-colors duration-200"
        aria-expanded={isOpen}
        aria-controls={contentId}
      >
        <h3 className="text-lg font-semibold bg-gradient-to-r from-amethyst-400 to-purple-500 bg-clip-text text-transparent">
          {title}
        </h3>
        <div className="flex items-center gap-2">
          {isOpen && actions}
          <ChevronDown
            className={`w-5 h-5 transform transition-transform duration-300 ease-in-out ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </Button>
      <div
        id={contentId}
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-4 pt-0">
          {children}
        </div>
      </div>
    </div>
  );
};

export type { CollapsibleSectionProps };
export { CollapsibleSection };