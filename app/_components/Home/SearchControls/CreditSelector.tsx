import { Combobox, ComboboxContent, ComboboxInput, ComboboxItem, ComboboxList } from '@/components/ui/combobox';
import { Separator } from '@/components/ui/separator';

type Props = {
  value: string;
  options: string[];
  onChange: (value: string) => void;
};

export const CreditCombobox = ({ value, options, onChange }: Props) => (
  <Combobox value={value || null} onValueChange={(v: string | null) => onChange(v ?? '')}>
    <ComboboxInput placeholder={value ? value : 'Any publisher'} showTrigger showClear />
    <ComboboxContent>
      <ComboboxList>
        <ComboboxItem value="">Any publisher</ComboboxItem>
        <Separator />
        {options.map((opt) => (
          <ComboboxItem key={opt} value={opt}>
            {opt}
          </ComboboxItem>
        ))}
      </ComboboxList>
    </ComboboxContent>
  </Combobox>
);
